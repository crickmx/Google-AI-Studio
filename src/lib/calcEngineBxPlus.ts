import { FormaPago, QuotePerson } from '../types';

export interface BxPlusInput {
  zona: string;               // e.g., "Zona Metropolitana", "Zona Occidente", etc.
  nivel_hospitalario: string; // e.g., "Zafiro", "Esmeralda", "Rubí", "Diamante"
  tabulador: string;          // e.g., "Médico 1", "Médico 2", "Médico Premium"
  suma_asegurada: number;     // e.g., 5000000, 10000000, 50000000
  deducible: number;          // e.g., 20000, 30000, 50000, 100000
  coaseguro: number;          // e.g., 10, 20
  tope_coaseguro_automatico: boolean;
  forma_pago: FormaPago;
  coberturas_opcionales: string[]; // List of selected optional coverage names
  people: QuotePerson[];
}

export interface NormalizedResult {
  product_id: 'BXPLUS' | 'BNV' | 'BNP';
  product_name: string;
  carrier: string;
  tariff_package_id: string;
  plan_summary: {
    zona: string;
    nivel_red: string;
    tabulador_plan: string;
    suma_asegurada: number;
    deducible: number;
    coaseguro: number;
    tope_coaseguro: number;
    forma_pago: string;
  };
  people: Array<{
    name: string;
    relationship: string;
    age: number;
    sex: string;
    premium: number;
  }>;
  coverages: {
    basic: Array<{
      name: string;
      description: string;
      included: boolean;
    }>;
    optional: Array<{
      name: string;
      description: string;
      included: boolean;
    }>;
  };
  totals: {
    prima_neta: number;
    recargo_pago: number;
    derecho_poliza: number;
    subtotal: number;
    iva: number;
    total: number;
    primer_pago: number;
    pagos_subsecuentes: number;
    numero_recibos: number;
  };
  debug: {
    product_code: string;
    lookup_keys: string[];
    calculation_warnings: string[];
  };
}

// Map BX+ optional coverages with descriptions
export const BXPLUS_COVERAGES_INFO = {
  'Medicamentos fuera del hospital':
    'Cubre medicamentos prescritos por el médico tratante y adquiridos fuera del hospital, relacionados con un padecimiento cubierto.',
  'Complicaciones no amparadas':
    'Ampara gastos médicos por emergencias derivadas de complicaciones de tratamientos o cirugías originalmente no cubiertos.',
  'Padecimientos preexistentes':
    'Cubre padecimientos existentes declarados y aceptados por la aseguradora al momento de la contratación, conforme a la póliza.',
  'Eliminación deducible por accidente':
    'Elimina el pago del deducible cuando los gastos médicos son consecuencia directa de un accidente cubierto.',
  'Ampliación de servicios':
    'Extiende los servicios médicos y beneficios adicionales a los de la cobertura básica, según lo contratado.',
  'Maternidad':
    'Otorga una suma asegurada para gastos de parto o cesárea, sujeto a periodos de espera y condiciones de la póliza.',
  'Emergencia médica en el extranjero':
    'Cubre gastos médicos por emergencias ocurridas fuera de México durante viajes temporales.',
  'Beneficio hospitalario VIP':
    'Brinda beneficios adicionales durante la hospitalización, como mejores condiciones de estancia y atención preferente.',
  'Enfermedades graves en el extranjero':
    'Ampara gastos médicos por el tratamiento de enfermedades graves diagnosticadas en el extranjero.',
  'Cobertura internacional':
    'Extiende la cobertura médica para recibir atención fuera del territorio nacional.',
  'Multirregión':
    'Permite recibir atención médica en regiones con costos médicos más altos a los de la zona contratada.',
  'Ayuda diaria':
    'Otorga una indemnización diaria en efectivo por cada día de hospitalización del asegurado.',
  'Indemnización por enfermedades graves':
    'Entrega una suma asegurada en efectivo al diagnosticarse alguna enfermedad grave cubierta.',
  'Reconocimiento de antigüedad':
    'Reconoce la antigüedad de pólizas anteriores para reducir o eliminar periodos de espera en ciertos padecimientos.',
};

export const BXPLUS_OPCIONALES_DEFAULT = [
  'Medicamentos fuera del hospital',
  'Eliminación deducible por accidente',
  'Multirregión',
  'Beneficio hospitalario VIP',
  'Emergencia médica en el extranjero'
];

export function getBxPlusFormaPagoFactor(formaPago: FormaPago): number {
  switch (formaPago) {
    case 'Anual': return 1.0;
    case 'Semestral': return 1.045;
    case 'Trimestral': return 1.075;
    case 'Mensual': return 1.09;
    default: return 1.0;
  }
}

export function calculateBxPlus(input: BxPlusInput): NormalizedResult {
  const {
    zona,
    nivel_hospitalario,
    tabulador,
    suma_asegurada,
    deducible,
    coaseguro,
    tope_coaseguro_automatico,
    forma_pago,
    coberturas_opcionales,
    people,
  } = input;

  // Let's perform calculation per person matching the described parameters.
  // We use realistic business logic mapping. Low SA, high Deducible lowers rate.
  const mappedPeople = people.map((person) => {
    // 1. Base rate based on age bracket
    let baseRate = 1500;
    const age = person.age;
    if (age < 18) {
      baseRate = 1500 + age * 25;
    } else if (age < 35) {
      baseRate = 2200 + (age - 18) * 50;
    } else if (age < 50) {
      baseRate = 3400 + (age - 35) * 110;
    } else if (age < 65) {
      baseRate = 6200 + (age - 50) * 320;
    } else if (age < 80) {
      baseRate = 13800 + (age - 65) * 800;
    } else {
      baseRate = 24000 + (age - 80) * 1200;
    }

    // 2. Adjustments
    // Gender factor (Female typically has pregnancy exposure ages 18-45)
    let genderFactor = 1.0;
    if (person.gender === 'Femenino' && age >= 18 && age <= 45) {
      genderFactor = 1.15;
    }

    // Zone factor
    let zoneFactor = 1.0;
    if (zona.toLowerCase().includes('metropolitana') || zona.toLowerCase().includes('zona 1')) {
      zoneFactor = 1.25;
    } else if (zona.toLowerCase().includes('occidente') || zona.toLowerCase().includes('norte')) {
      zoneFactor = 1.10;
    } else {
      zoneFactor = 0.95;
    }

    // Hospital Red factor
    let hospitalFactor = 1.0;
    if (nivel_hospitalario === 'Diamante') hospitalFactor = 1.45;
    else if (nivel_hospitalario === 'Rubí') hospitalFactor = 1.20;
    else if (nivel_hospitalario === 'Zafiro') hospitalFactor = 1.0;
    else if (nivel_hospitalario === 'Esmeralda') hospitalFactor = 0.85;

    // Tabulador factor
    let tabuladorFactor = 1.0;
    if (tabulador === 'Médico Premium') tabuladorFactor = 1.25;
    else if (tabulador === 'Médico 3') tabuladorFactor = 1.12;
    else if (tabulador === 'Médico 2') tabuladorFactor = 1.0;
    else if (tabulador === 'Médico 1') tabuladorFactor = 0.88;

    // SumAssured factor
    let saFactor = 1.0;
    if (suma_asegurada <= 2000000) saFactor = 0.85;
    else if (suma_asegurada <= 5000000) saFactor = 0.95;
    else if (suma_asegurada <= 10000000) saFactor = 1.0;
    else if (suma_asegurada <= 25000000) saFactor = 1.10;
    else saFactor = 1.25; // 50M+ or Without Limit

    // Deducible factor (Inverted, higher deductible means lower rate)
    let dedFactor = 1.0;
    if (deducible <= 15000) dedFactor = 1.35;
    else if (deducible <= 30000) dedFactor = 1.12;
    else if (deducible <= 50000) dedFactor = 1.0;
    else if (deducible <= 75000) dedFactor = 0.82;
    else dedFactor = 0.65;

    // Coaseguro factor
    let coFactor = 1.0;
    if (coaseguro === 20) coFactor = 0.88;
    else if (coaseguro === 0) coFactor = 1.15;

    // Calculate core base premium per person (before optional coverages)
    let calculatedPremium = baseRate * genderFactor * zoneFactor * hospitalFactor * tabuladorFactor * saFactor * dedFactor * coFactor;

    // 3. Add Optional Co-payments or flat rates
    let optionalAddition = 0;
    coberturas_opcionales.forEach((cov) => {
      if (cov === 'Medicamentos fuera del hospital') {
        optionalAddition += 780;
      } else if (cov === 'Eliminación deducible por accidente') {
        optionalAddition += 420;
      } else if (cov === 'Emergencia médica en el extranjero') {
        optionalAddition += 310;
      } else if (cov === 'Beneficio hospitalario VIP') {
        optionalAddition += 550;
      } else if (cov === 'Enfermedades graves en el extranjero') {
        optionalAddition += 740;
      } else if (cov === 'Maternidad' && person.gender === 'Femenino' && age >= 18 && age <= 45) {
        optionalAddition += 1100;
      } else if (cov === 'Padecimientos preexistentes') {
        calculatedPremium *= 1.12; // 12% loading
      } else if (cov === 'Cobertura internacional') {
        calculatedPremium *= 1.20; // 20% loading
      } else if (cov === 'Multirregión') {
        calculatedPremium *= 1.08; // 8% loading
      } else {
        optionalAddition += 150; // generic cover cost
      }
    });

    const finalPersonPremium = Math.round((calculatedPremium + optionalAddition) * 100) / 100;

    return {
      name: person.name,
      relationship: person.relation,
      age: person.age,
      sex: person.gender,
      premium: finalPersonPremium,
    };
  });

  // Totals calculations
  const totalBasePremium = Number(mappedPeople.reduce((sum, p) => sum + p.premium, 0).toFixed(2));
  const paymentFactor = getBxPlusFormaPagoFactor(forma_pago);

  // Recargo por pago fraccionado
  const subtotalBeforeFactor = totalBasePremium;
  const subtotalWithFactor = Number((subtotalBeforeFactor * paymentFactor).toFixed(2));
  const recargo_pago = Number((subtotalWithFactor - subtotalBeforeFactor).toFixed(2));

  // Policy fee
  const derecho_poliza = 1200; // BX+ Policy Fee
  const subtotalPlusFee = subtotalWithFactor + derecho_poliza;

  // IVA
  const iva = Number((subtotalPlusFee * 0.16).toFixed(2));
  const total = Number((subtotalPlusFee + iva).toFixed(2));

  // Payments split
  let indexPayments = 1;
  switch (forma_pago) {
    case 'Semestral': indexPayments = 2; break;
    case 'Trimestral': indexPayments = 4; break;
    case 'Mensual': indexPayments = 12; break;
  }

  let primer_pago = total;
  let pagos_subsecuentes = 0;

  if (forma_pago !== 'Anual') {
    // Standard split: policy fee is paid fully in first payment, same as BNV/BNP formulas
    const baseSplittedSubtotal = subtotalWithFactor / indexPayments;
    primer_pago = Number(((baseSplittedSubtotal + derecho_poliza) * 1.16).toFixed(2));
    pagos_subsecuentes = Number((baseSplittedSubtotal * 1.16).toFixed(2));
  }

  // Coverages list (Basic and optional, complete format)
  const basicCoverages = [
    { name: 'Gastos de Hospitalización', description: 'Cubre cuarto, alimentos, quirófano, anestesia, terapias y servicios hospitalarios contratados.', included: true },
    { name: 'Honorarios Médicos', description: 'Cubre honorarios de cirujanos, ayudantes, anestesiólogos y consultas intrahospitalarias conforme a tabulador.', included: true },
    { name: 'Tratamientos Reconstructivos', description: 'Cubre cirugías reconstructivas funcionales que deriven de accidentes o padecimientos ocurridos bajo la póliza.', included: true },
    { name: 'Ambulancia Terrestre', description: 'Cubre traslados de urgencia terrestre en territorio nacional.', included: true },
    { name: 'Transplantes de Órganos', description: 'Cubre los gastos médicos del receptor derivados del transplante de órganos amparados.', included: true },
  ];

  const optionalCoverages = Object.keys(BXPLUS_COVERAGES_INFO).map((name) => {
    return {
      name,
      description: BXPLUS_COVERAGES_INFO[name as keyof typeof BXPLUS_COVERAGES_INFO],
      included: coberturas_opcionales.includes(name),
    };
  });

  const productCode = `BX_UNIKUZ_${nivel_hospitalario.toUpperCase()}_SA${suma_asegurada / 1000000}M_D${deducible / 1000}K`;

  return {
    product_id: 'BXPLUS',
    product_name: 'BX+ Únikuz',
    carrier: 'Banco Ve por Más (BX+)',
    tariff_package_id: 'bxplus_matrix_2026',
    plan_summary: {
      zona,
      nivel_red: nivel_hospitalario,
      tabulador_plan: tabulador,
      suma_asegurada: suma_asegurada,
      deducible: deducible,
      coaseguro: coaseguro,
      tope_coaseguro: tope_coaseguro_automatico ? 40000 : 0, // automatic limit of 40k coaseguro
      forma_pago: forma_pago,
    },
    people: mappedPeople,
    coverages: {
      basic: basicCoverages,
      optional: optionalCoverages,
    },
    totals: {
      prima_neta: totalBasePremium,
      recargo_pago,
      derecho_poliza,
      subtotal: subtotalWithFactor,
      iva,
      total,
      primer_pago,
      pagos_subsecuentes,
      numero_recibos: indexPayments,
    },
    debug: {
      product_code: productCode,
      lookup_keys: [productCode],
      calculation_warnings: [],
    },
  };
}
