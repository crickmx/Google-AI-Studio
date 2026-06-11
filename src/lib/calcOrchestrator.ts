import { Quote, BnpQuote, TariffPackage, BnpTariffPackage, FormaPago, QuotePerson } from '../types';
import { calculateQuote } from './calcEngine';
import { calculateBnpQuote } from './calcEngineBnp';
import { calculateBxPlus, BxPlusInput, NormalizedResult } from './calcEngineBxPlus';

export interface MultiGmmOptionConfig {
  id: string; // e.g. option_1
  product_id: 'BXPLUS' | 'BNV' | 'BNP';
  
  // BX+ inputs
  bx_zona?: string;
  bx_nivel_hospitalario?: string;
  bx_tabulador?: string;
  bx_suma_asegurada?: number;
  bx_deducible?: number;
  bx_coaseguro?: number;
  bx_tope_coaseguro_auto_val?: boolean;
  bx_forma_pago?: FormaPago;
  bx_coberturas_opcionales?: string[];

  // BNV inputs
  bnv_zona?: string;
  bnv_tipo_cliente?: string;
  bnv_suma_asegurada?: number;
  bnv_deducible?: number;
  bnv_coaseguro?: number;
  bnv_tope_coaseguro?: number;
  bnv_maternidad_titular?: 'Si' | 'No';
  bnv_maternidad_conyuge?: 'Si' | 'No';
  bnv_asistencia_extranjero?: 'Si' | 'No';
  bnv_forma_pago?: FormaPago;

  // BNP inputs
  bnp_zona?: string;
  bnp_tipo_cliente?: string;
  bnp_suma_asegurada?: number;
  bnp_deducible?: number;
  bnp_coaseguro?: number;
  bnp_maternidad_titular?: 'Si' | 'No';
  bnp_maternidad_conyuge?: 'Si' | 'No';
  bnp_asistencia_extranjero?: 'Si' | 'No';
  bnp_cobertura_catastrofica_extranjero?: 'Si' | 'No';
  bnp_forma_pago?: FormaPago;
}

export async function calculateOption(
  option: MultiGmmOptionConfig,
  people: QuotePerson[],
  activeBnvPackage: TariffPackage | null,
  activeBnpPackage: BnpTariffPackage | null
): Promise<NormalizedResult> {
  const productId = option.product_id;

  if (productId === 'BXPLUS') {
    // Run BX+ calculation
    const input: BxPlusInput = {
      zona: option.bx_zona || 'Zona Metropolitana (CDMX/EdoMex)',
      nivel_hospitalario: option.bx_nivel_hospitalario || 'Zafiro',
      tabulador: option.bx_tabulador || 'Médico 2',
      suma_asegurada: option.bx_suma_asegurada || 10000000,
      deducible: option.bx_deducible || 30000,
      coaseguro: option.bx_coaseguro !== undefined ? option.bx_coaseguro : 10,
      tope_coaseguro_automatico: option.bx_tope_coaseguro_auto_val ?? true,
      forma_pago: option.bx_forma_pago || 'Anual',
      coberturas_opcionales: option.bx_coberturas_opcionales || [
        'Medicamentos fuera del hospital',
        'Eliminación deducible por accidente',
        'Multirregión',
        'Beneficio hospitalario VIP',
        'Emergencia médica en el extranjero'
      ],
      people,
    };
    return calculateBxPlus(input);
  }

  if (productId === 'BNV') {
    if (!activeBnvPackage) {
      throw new Error('No hay tarifa BNV activa para ejecutar la cotización.');
    }

    const bnvQuote: Quote = {
      id: `multi_${option.id}`,
      tariff_package_id: activeBnvPackage.id,
      client_type: option.bnv_tipo_cliente || 'Individual / Familiar',
      region_zone: (option.bnv_zona === 'Zona 2' ? 'Zona 2' : 'Zona 1'),
      suma_asegurada: option.bnv_suma_asegurada || 3000000,
      deducible: option.bnv_deducible || 100000,
      coaseguro: option.bnv_coaseguro !== undefined ? option.bnv_coaseguro : 10,
      tope_coaseguro: option.bnv_tope_coaseguro !== undefined ? option.bnv_tope_coaseguro : 30000,
      asistencia_extranjero: option.bnv_asistencia_extranjero || 'Si',
      forma_pago: option.bnv_forma_pago || 'Anual',
      people,
      created_at: new Date().toISOString(),
    };

    const calc = await calculateQuote(bnvQuote, activeBnvPackage);

    if (calc.error) {
      throw new Error(calc.error);
    }

    // Map to normalized structure
    const totalPayments = bnvQuote.forma_pago === 'Anual' ? 1 : bnvQuote.forma_pago === 'Semestral' ? 2 : bnvQuote.forma_pago === 'Trimestral' ? 4 : 12;
    const adjustedPrimas = Number((calc.subtotal * calc.payment_factor).toFixed(2));
    const recargo_pago = Number((adjustedPrimas - calc.subtotal).toFixed(2));

    const basicCoverages = [
      { name: 'Gastos de Hospitalización Vital', description: 'Cubre erogaciones en hospital por cuarto sencillo, medicamentos, servicios básicos hospitalarios y material quirúrgico.', included: true },
      { name: 'Honorarios Quirúrgicos y Médicos', description: 'Cubre honorarios de cirujanos, anestesiólogos y consultores de acuerdo a red.', included: true },
      { name: 'Tratamientos Oncológicos', description: 'Ampara quimioterapias o radioterapias de pacientes oncológicos de manera integral.', included: true },
      { name: 'Ambulancia Terrestre de Urgencia', description: 'Cubre el traslado terrestre urgente desde un domicilio o siniestro al centro hospitalario.', included: true },
    ];

    const optionalCoverages = [
      { name: 'Asistencia Médica en el Extranjero', description: 'Cubre emergencias de salud fuera de la república por viajes recreativos de corto plazo.', included: option.bnv_asistencia_extranjero === 'Si' },
      { name: 'Maternidad', description: 'Cobertura de auxilio de maternidad básica para gastos de parto o cesárea.', included: option.bnv_maternidad_titular === 'Si' || option.bnv_maternidad_conyuge === 'Si' },
      { name: 'Otros Adicionales', description: 'Cobertura conforme a condiciones generales del producto.', included: false }
    ];

    return {
      product_id: 'BNV',
      product_name: 'Bupa Nacional Vital',
      carrier: 'Bupa México',
      tariff_package_id: activeBnvPackage.id,
      plan_summary: {
        zona: option.bnv_zona || 'Zona 1',
        nivel_red: 'No aplica',
        tabulador_plan: 'No aplica',
        suma_asegurada: bnvQuote.suma_asegurada,
        deducible: bnvQuote.deducible,
        coaseguro: bnvQuote.coaseguro,
        tope_coaseguro: bnvQuote.tope_coaseguro,
        forma_pago: bnvQuote.forma_pago,
      },
      people: calc.people_results.map(pr => {
        return {
          name: pr.person_name,
          relationship: pr.relation,
          age: pr.age,
          sex: people.find(p => p.id === pr.person_id)?.gender || 'Masculino',
          premium: pr.discounted_rate,
        };
      }),
      coverages: {
        basic: basicCoverages,
        optional: optionalCoverages,
      },
      totals: {
        prima_neta: calc.prima_total,
        recargo_pago,
        derecho_poliza: calc.derecho_poliza,
        subtotal: adjustedPrimas,
        iva: calc.iva,
        total: calc.costo_total,
        primer_pago: calc.primer_pago,
        pagos_subsecuentes: calc.pagos_subsecuentes,
        numero_recibos: totalPayments,
      },
      debug: {
        product_code: calc.product_code,
        lookup_keys: calc.people_results.map(p => p.lookup_key),
        calculation_warnings: [],
      }
    };
  }

  if (productId === 'BNP') {
    if (!activeBnpPackage) {
      throw new Error('No hay tarifa BNP activa para ejecutar la cotización.');
    }

    // Limit member ages to 84 for BNP, mapping people dynamically
    const bnpPeople: QuotePerson[] = people.map(p => ({
      id: p.id,
      name: p.name,
      relation: p.relation,
      gender: p.gender,
      age: Math.min(84, p.age)
    }));

    const bnpQuote: BnpQuote = {
      id: `bnp_multi_${option.id}`,
      tariff_package_id: activeBnpPackage.id,
      product: 'BUPA_NACIONAL_PLUS',
      client_type: option.bnp_tipo_cliente || 'Nuevo negocio',
      region_zone: (option.bnp_zona === 'Zona 2' ? 'Zona 2' : 'Zona 1'),
      suma_asegurada: option.bnp_suma_asegurada || 50000000,
      deducible: option.bnp_deducible || 35000,
      coaseguro: option.bnp_coaseguro !== undefined ? option.bnp_coaseguro : 10,
      maternidad_titular: option.bnp_maternidad_titular || 'No',
      maternidad_conyuge: option.bnp_maternidad_conyuge || 'No',
      asistencia_extranjero: option.bnp_asistencia_extranjero || 'Si',
      cobertura_catastrofica_extranjero: option.bnp_cobertura_catastrofica_extranjero || 'Si',
      forma_pago: option.bnp_forma_pago || 'Anual',
      people: bnpPeople,
      created_at: new Date().toISOString()
    };

    const calc = await calculateBnpQuote(bnpQuote, activeBnpPackage);

    if (calc.error) {
      throw new Error(calc.error);
    }

    const freqKey = option.bnp_forma_pago === 'Anual' ? 'annual' : option.bnp_forma_pago === 'Semestral' ? 'semiannual' : option.bnp_forma_pago === 'Trimestral' ? 'quarterly' : 'monthly';
    const clr = calc.totals[freqKey];

    // Compute standard recargo pago
    // base annual subtotal before payment factor:
    let titularAnnual = 0;
    let conyugeAnnual = 0;
    let hijosAnnual = 0;
    let dependientesAnnual = 0;
    calc.people_results.forEach(res => {
      if (res.relation === 'Titular') titularAnnual += res.annual_premium;
      else if (res.relation === 'Cónyuge') conyugeAnnual += res.annual_premium;
      else if (res.relation === 'Hij@') hijosAnnual += res.annual_premium;
      else dependientesAnnual += res.annual_premium;
    });
    const baseAnnualPremium = titularAnnual + conyugeAnnual + hijosAnnual + dependientesAnnual;
    const isCEEApplicable = bnpQuote.cobertura_catastrofica_extranjero === 'Si' && (bnpQuote.suma_asegurada === 20000000 || bnpQuote.suma_asegurada === 50000000) && [35000, 55000, 75000, 115000, 200000].includes(bnpQuote.deducible);
    const ceePeopleCount = bnpPeople.some(p => p.relation === 'Titular' && p.age >= 18) ? bnpPeople.length : 0;
    const ceeAnnualCost = isCEEApplicable ? ceePeopleCount * 5800 : 0;
    const asistenciaAnnualCost = option.bnp_asistencia_extranjero === 'Si' ? (activeBnpPackage.asistencia_extranjero || 1632) : 0;
    const baseAnnualSubtotal = baseAnnualPremium + asistenciaAnnualCost + ceeAnnualCost;

    const recargo_pago = Number((clr.subtotal - baseAnnualSubtotal).toFixed(2));

    const basicCoverages = [
      { name: 'Gastos de Hospitalización Completo', description: 'Habitación privada standard, alimentos, quirófano, unidad de terapia intensiva y medicamentos hospitalarios.', included: true },
      { name: 'Tratamientos Médicos Especiales', description: 'Procedimientos médicos avanzados de radiología intervencionista, diálisis u oxigenoterapia.', included: true },
      { name: 'Accidentes de Alta Montaña', description: 'Amparo frente a lesiones provocadas en prácticas deportivas amateur y montañismo.', included: true },
      { name: 'Cirugía de Reconstrucción Integral', description: 'Gastos de reconstrucción funcional estética por siniestro cubierto o cáncer.', included: true },
    ];

    const optionalCoverages = [
      { name: 'Asistencia Médica en el Extranjero', description: 'Asistencia inmediata por emergencias médicas agudas fuera de México durante viajes vacacionales.', included: option.bnp_asistencia_extranjero === 'Si' },
      { name: 'Cobertura de Enfermedades Catastróficas en el Extranjero', description: 'Tratamiento exclusivo en hospitales y médicos especialistas internacionales para padecimientos graves.', included: option.bnp_cobertura_catastrofica_extranjero === 'Si' },
      { name: 'Maternidad Titular', description: 'Apoyo económico para parto o cesárea de la titular.', included: option.bnp_maternidad_titular === 'Si' },
      { name: 'Maternidad Cónyuge', description: 'Apoyo económico para parto o cesárea de la cónyuge.', included: option.bnp_maternidad_conyuge === 'Si' }
    ];

    return {
      product_id: 'BNP',
      product_name: 'Bupa Nacional Plus',
      carrier: 'Bupa México',
      tariff_package_id: activeBnpPackage.id,
      plan_summary: {
        zona: option.bnp_zona || 'Zona 1',
        nivel_red: 'No aplica',
        tabulador_plan: 'No aplica',
        suma_asegurada: bnpQuote.suma_asegurada,
        deducible: bnpQuote.deducible,
        coaseguro: bnpQuote.coaseguro,
        tope_coaseguro: 0, // BNP coaseguro has no cap
        forma_pago: bnpQuote.forma_pago,
      },
      people: calc.people_results.map(pr => {
        return {
          name: pr.person_name,
          relationship: pr.relation,
          age: pr.age,
          sex: pr.gender,
          premium: pr.annual_premium,
        };
      }),
      coverages: {
        basic: basicCoverages,
        optional: optionalCoverages,
      },
      totals: {
        prima_neta: clr.premium,
        recargo_pago,
        derecho_poliza: clr.policy_fee,
        subtotal: clr.subtotal,
        iva: clr.iva,
        total: clr.total,
        primer_pago: clr.first_payment,
        pagos_subsecuentes: clr.subsequent_payment,
        numero_recibos: option.bnp_forma_pago === 'Anual' ? 1 : option.bnp_forma_pago === 'Semestral' ? 2 : option.bnp_forma_pago === 'Trimestral' ? 4 : 12,
      },
      debug: {
        product_code: calc.product_code,
        lookup_keys: calc.people_results.map(p => p.lookup_key),
        calculation_warnings: [],
      }
    };
  }

  throw new Error(`Producto ${productId} desconocido.`);
}
