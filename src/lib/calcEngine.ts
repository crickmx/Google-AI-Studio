import { Quote, TariffPackage, CalculationResult, PersonCalculationResult, FormaPago } from '../types';
import { getTariffRatesBulk } from './dbStore';

export function generateProductCode(sa: number, deducible: number, coaseguro: number, topeCoaseguro: number): string {
  const saM = sa / 1000000;
  const dK = deducible / 1000;
  const cVal = coaseguro;
  const tcVal = topeCoaseguro / 1000;
  
  let code = `NVFS${saM}D${dK}C${cVal}`;
  if (topeCoaseguro > 0) {
    code += `TC${tcVal}`;
  }
  return code;
}

export function getPaymentFactor(formaPago: FormaPago): { value: number; name: string } {
  switch (formaPago) {
    case 'Anual':
      return { value: 1.00, name: 'Anual (x1.00)' };
    case 'Semestral':
      return { value: 1.045, name: 'Semestral (x1.045)' };
    case 'Trimestral':
      return { value: 1.075, name: 'Trimestral (x1.075)' };
    case 'Mensual':
      return { value: 1.09, name: 'Mensual (x1.09)' };
    default:
      return { value: 1.00, name: 'Anual (x1.00)' };
  }
}

export async function calculateQuote(quote: Quote, pkg: TariffPackage): Promise<CalculationResult> {
  const productCode = generateProductCode(
    quote.suma_asegurada,
    quote.deducible,
    quote.coaseguro,
    quote.tope_coaseguro
  );

  const mappedRegion = quote.region_zone === 'Zona 1' 
    ? 'Mexico Region 1 BNV' 
    : 'Mexico Region 2 (no CDMX, ZM Y MTY)';

  // Find the discount factor for Selected Client Type
  const clientTypeObj = pkg.client_types.find(c => c.client_type === quote.client_type);
  const discountFactor = clientTypeObj ? clientTypeObj.discount_factor : 1.0;

  // Prepare bulk check keys
  const keys = quote.people.map(person => ({
    lookup_key: productCode,
    region: mappedRegion,
    age: person.age
  }));

  const rateRecords = await getTariffRatesBulk(pkg.id, keys);

  let totalDiscountedBaseRate = 0;
  let missingRatesCount = 0;
  const missingRateDetails: string[] = [];

  const peopleResults: PersonCalculationResult[] = quote.people.map(person => {
    const compositeKey = `${pkg.id}::${productCode}::${mappedRegion}::${person.age}`;
    let rate = rateRecords.get(compositeKey) ?? null;
    
    if (rate === null && pkg.id === 'default_v1') {
      // Dynamic fallback rate calculation for default package
      const isRegion1 = mappedRegion.includes('Region 1');
      const regionMultiplier = isRegion1 ? 1.25 : 1.0;
      
      const matchSA = productCode.match(/NVFS(\d+)/)?.[1];
      const saVal = matchSA ? parseInt(matchSA) : 3;
      const saMultiplier = 1.0 + (saVal - 1) * 0.15;

      const matchD = productCode.match(/D(\d+)/)?.[1];
      const dVal = matchD ? parseInt(matchD) : 100;
      const deductibleMultiplier = Math.max(0.3, 1.2 - (dVal / 150)); 

      const matchC = productCode.match(/C(\d+)/)?.[1];
      const cVal = matchC ? parseInt(matchC) : 10;
      const coaseguroMultiplier = Math.max(0.8, 1.1 - (cVal / 100));

      const age = person.age;
      let baseAgeCost = 1500;
      if (age < 18) {
        baseAgeCost = 1200 + age * 25;
      } else if (age < 30) {
        baseAgeCost = 1600 + (age - 18) * 60;
      } else if (age < 50) {
        baseAgeCost = 2500 + (age - 30) * 150;
      } else if (age < 65) {
        baseAgeCost = 5500 + (age - 50) * 450;
      } else {
        baseAgeCost = 12500 + (age - 65) * 1200;
      }

      rate = Number((baseAgeCost * regionMultiplier * saMultiplier * deductibleMultiplier * coaseguroMultiplier).toFixed(2));
    }
    
    if (rate === null) {
      missingRatesCount++;
      missingRateDetails.push(`${person.name} (${person.relation}, Edad ${person.age})`);
      rate = 0; // Fallback to 0 if rate not found
    }

    const discounted = Number((rate * discountFactor).toFixed(2));
    totalDiscountedBaseRate += discounted;

    return {
      person_id: person.id,
      person_name: person.name,
      relation: person.relation,
      age: person.age,
      lookup_key: productCode,
      search_key: `${productCode}::${mappedRegion}::${person.age}`,
      base_rate: rate,
      discounted_rate: discounted
    };
  });

  // Round Prima Total to 2 decimal places
  const prima_total = Number(totalDiscountedBaseRate.toFixed(2));

  // Asistencia en el Extranjero
  const asistencia_extranjero_base = pkg.asistencia_extranjero;
  const asistencia_extranjero_cost = quote.asistencia_extranjero === 'Si' ? asistencia_extranjero_base : 0;

  // Payments and factors
  const paymentFactorInfo = getPaymentFactor(quote.forma_pago);
  const payment_factor = paymentFactorInfo.value;

  // Subtotal (Sum of Primas before fractions)
  const subtotal = Number((prima_total + asistencia_extranjero_cost).toFixed(2));

  // Primas fraccionadas (Subtotal adjusted by fractional payment factor)
  const adjustedPrimas = Number((subtotal * payment_factor).toFixed(2));

  // Derecho de póliza (Added only once, not affected by fractional fee directly)
  const derecho_poliza = pkg.derecho_poliza;

  // IVA = (AdjustedPrimas + Derecho de Poliza) * 16%
  const iva = Number(((adjustedPrimas + derecho_poliza) * 0.16).toFixed(2));

  // Costo Total = AdjustedPrimas + Derecho de Póliza + IVA
  const costo_total = Number((adjustedPrimas + derecho_poliza + iva).toFixed(2));

  // Primer Pago and Subsequent Payments
  let primer_pago = 0;
  let pagos_subsecuentes = 0;

  const numPayments = quote.forma_pago === 'Anual' ? 1 
                    : quote.forma_pago === 'Semestral' ? 2 
                    : quote.forma_pago === 'Trimestral' ? 4 
                    : 12;

  if (quote.forma_pago === 'Anual') {
    primer_pago = costo_total;
    pagos_subsecuentes = 0;
  } else {
    // Formula from prompt:
    // SEMESTRAL: ((PrimaTotal / 2) + DerechoPoliza) * 1.16
    // Where "PrimaTotal" refers to AdjustedPrimas (Primas with payment factor)
    const basePeriodPremium = adjustedPrimas / numPayments;
    
    primer_pago = Number(((basePeriodPremium + derecho_poliza) * 1.16).toFixed(2));
    pagos_subsecuentes = Number((basePeriodPremium * 1.16).toFixed(2));
  }

  let errorMsg = undefined;
  if (missingRatesCount > 0) {
    errorMsg = `Sin tarifa en tabla para: ${missingRateDetails.join(', ')}. Verifica que el código ${productCode} y región ${mappedRegion} existan en el excel importado para esas edades.`;
  }

  return {
    quote_id: quote.id,
    product_code: productCode,
    mapped_region: mappedRegion,
    people_results: peopleResults,
    prima_total,
    asistencia_extranjero_base,
    asistencia_extranjero_cost,
    subtotal,
    payment_factor,
    derecho_poliza,
    iva,
    costo_total,
    primer_pago,
    pagos_subsecuentes,
    payment_factor_name: paymentFactorInfo.name,
    error: errorMsg
  };
}
