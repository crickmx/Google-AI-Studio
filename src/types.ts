export type RelationType = 'Titular' | 'Cónyuge' | 'Hij@' | 'Dependiente económico';
export type GenderType = 'Masculino' | 'Femenino';
export type RegionZone = 'Zona 1' | 'Zona 2'; // Mapped to Mexico Region 1 / Mexico Region 2
export type FormaPago = 'Anual' | 'Semestral' | 'Trimestral' | 'Mensual';

export interface InternalFactor {
  factor_name: string;
  value: number;
}

export interface ClientType {
  client_type: string;
  discount_factor: number;
}

export interface TariffPackage {
  id: string;
  version_name: string;
  uploaded_at: string;
  hash: string;
  is_active: boolean;
  derecho_poliza: number;
  asistencia_extranjero: number;
  internal_factors: InternalFactor[];
  sumas_aseguradas: number[];
  deducibles: number[];
  coaseguros: number[];
  topes_coaseguro: number[];
  client_types: ClientType[];
  rates_count: number;
}

export interface TariffRate {
  id?: number;
  package_id: string;
  lookup_key: string;       // e.g. NVFS3D100C10TC30
  plan_name: string;        // same as lookup_key usually
  region: string;           // E.g. "Mexico Region 1 BNV" / "Mexico Region 2 (no CDMX, ZM Y MTY)"
  age: number;              // 0 to 99
  rate: number;             // Premium amount
}

export interface QuotePerson {
  id: string;
  name: string;
  relation: RelationType;
  gender: GenderType;
  age: number;
}

export interface Quote {
  id: string;
  tariff_package_id: string;
  client_type: string;
  region_zone: RegionZone;
  suma_asegurada: number;
  deducible: number;
  coaseguro: number;        // e.g. 0, 10, 20
  tope_coaseguro: number;    // e.g. 0, 30000, 40000
  asistencia_extranjero: 'Si' | 'No';
  forma_pago: FormaPago;
  people: QuotePerson[];
  created_at: string;
  notes?: string;
}

export interface PersonCalculationResult {
  person_id: string;
  person_name: string;
  relation: RelationType;
  age: number;
  lookup_key: string;      // NVFS3D100C10TC30
  search_key: string;      // Product + Region + Age
  base_rate: number;       // Rate from table
  discounted_rate: number; // Rate after Client Type discount
}

export interface CalculationResult {
  quote_id: string;
  product_code: string;
  mapped_region: string;
  people_results: PersonCalculationResult[];
  prima_total: number;             // Sum of discounted rates
  asistencia_extranjero_base: number;
  asistencia_extranjero_cost: number; // e.g. 1632 or 0 (might be affected by payment factor?)
  subtotal: number;                // Prima Total + Asistencia Extranjero
  payment_factor: number;          // e.g. 1.0, 1.045
  derecho_poliza: number;          // e.g. 1600
  iva: number;                     // (Prima Total adjusted or Subtotal adjusted + Derecho) * 0.16
  costo_total: number;             // Total payment
  primer_pago: number;
  pagos_subsecuentes: number;
  payment_factor_name: string;
  error?: string;
}

// ==========================================
// Bupa Nacional Plus (BNP) Specific Types
// ==========================================

export interface BnpTariffPackage {
  id: string;
  product: 'BUPA_NACIONAL_PLUS';
  version_name: string;
  source_filename: string;
  source_hash: string;
  uploaded_at: string; // equivalet to created_at
  is_active: boolean; // draft | active | archived | failed (mapped to represents active/inactive)
  status: 'draft' | 'active' | 'archived' | 'failed';
  derecho_poliza: number;
  asistencia_extranjero: number;
  costo_enfermedades_catastroficas_extranjero: number; // e.g. 5800
  sumas_aseguradas: number[];
  deducibles: number[];
  coaseguros: number[];
  client_types: ClientType[];
  internal_factors: InternalFactor[];
  rates_count: number;
}

export interface BnpTariffRate {
  id?: string;
  package_id: string;
  lookup_key: string;      // e.g. NPS50D35C10Mexico Region 140Female
  plan_name: string;       // e.g. NPS50D35C10
  region: string;          // e.g. "Mexico Region 1" or "Mexico Region 2"
  age: number;             // 0 to 84 (or as detected)
  rate: number;
  rate_type: 'Male' | 'Female';
}

export interface BnpQuote {
  id: string;
  tariff_package_id: string;
  product: 'BUPA_NACIONAL_PLUS';
  client_type: string;
  region_zone: RegionZone;
  suma_asegurada: number;
  deducible: number;
  coaseguro: number;
  maternidad_titular: 'Si' | 'No';
  maternidad_conyuge: 'Si' | 'No';
  asistencia_extranjero: 'Si' | 'No';
  cobertura_catastrofica_extranjero: 'Si' | 'No';
  forma_pago: FormaPago;
  people: QuotePerson[];
  created_at: string;
  notes?: string;
}

export interface BnpPersonCalculationResult {
  person_id: string;
  person_name: string;
  relation: RelationType;
  age: number;
  gender: GenderType;
  rate_type: 'Male' | 'Female';
  lookup_key: string;       // e.g. NPS50D35C10Mexico Region 140Female
  annual_premium: number;   // rate from Table matching lookups
}

export interface BnpPaymentBreakdown {
  premium: number;                // sum of adjusted annual premiums for people
  assistance_abroad: number;      // e.g. 1632 * factor
  catastrophic_abroad: number;    // e.g. 5800 * people * factor
  policy_fee: number;             // derecho de póliza (constant, not multiplied by factor, added once)
  subtotal: number;               // premium + assistance + catastrophic (this is prime summation including factor)
  iva: number;                    // (subtotal + policy_fee) * 16%
  total: number;                  // subtotal + policy_fee + iva
  first_payment: number;          // formula-based
  subsequent_payment: number;     // formula-based
}

export interface BnpCalculationResult {
  quote_id: string;
  product_code: string;
  region: string;
  people_results: BnpPersonCalculationResult[];
  climatization_factor?: number; // debug factor
  is_catastrophic_applicable: boolean;
  catastrophic_count: number;
  missing_rates_count: number;
  totals: {
    annual: BnpPaymentBreakdown;
    semiannual: BnpPaymentBreakdown;
    quarterly: BnpPaymentBreakdown;
    monthly: BnpPaymentBreakdown;
  };
  error?: string;
}

// For automatic Excel comparison
export interface ExcelComparisonResult {
  concept: string;
  excel_value: number;
  system_value: number;
  difference: number;
  is_valid: boolean;
}

// ==========================================
// Multicotizador GMM Specific Types
// ==========================================

export interface MultiGmmQuoteOptionSaved {
  option_index: number;
  product_id: 'BXPLUS' | 'BNV' | 'BNP';
  input_json: any;
  result_json: any;
  tariff_package_id: string;
}

export interface MultiGmmQuote {
  id: string;
  created_by: string;
  client_name: string;
  people_json: QuotePerson[];
  options_json: any[];
  results_json: any[];
  created_at: string;
  status: 'draft' | 'calculated' | 'pdf_generated' | 'deleted';
}

