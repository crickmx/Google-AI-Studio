import React, { useState } from 'react';
import { 
  Plus, Trash2, Save, Check, AlertCircle, ChevronDown, 
  Archive, ClipboardList, UserPlus, Flame, Users, Sparkles,
  Printer, Copy, FileText, CheckSquare, XSquare, Layers, ShieldAlert, HelpCircle, Gift, Info
} from 'lucide-react';
import { QuotePerson, TariffPackage, BnpTariffPackage, FormaPago, RelationType, GenderType, MultiGmmQuote } from '../types';
import { MultiGmmOptionConfig } from '../lib/calcOrchestrator';
import { NormalizedResult, BXPLUS_COVERAGES_INFO, BXPLUS_OPCIONALES_DEFAULT } from '../lib/calcEngineBxPlus';

const HELP_TEXTS = {
  // BX+ Specific
  bx_zona: {
    title: 'Zona Geográfica BX+',
    desc: 'Determina el tabulador de costos hospitalarios aplicable según tu lugar de residencia. Zona Metropolitana incluye CDMX y Área Metropolitana.'
  },
  bx_nivel_hospitalario: {
    title: 'Nivel Hospitalario BX+',
    desc: 'Catálogo de hospitales autorizados para tu atención. Diamante ofrece acceso a todos los hospitales del convenio; Esmeralda es la red básica.'
  },
  bx_tabulador: {
    title: 'Tabulador Médico BX+',
    desc: 'Límite de honorarios quirúrgicos y médicos que la aseguradora pagará directamente al médico tratante por procedimientos.'
  },
  bx_suma_asegurada: {
    title: 'Suma Asegurada BX+',
    desc: 'Monto máximo que BX+ cubrirá por cada accidente o enfermedad del asegurado durante la vigencia de la póliza.'
  },
  bx_deducible: {
    title: 'Deducible contratado BX+',
    desc: 'Monto de participación a cargo del asegurado antes de que opere la aseguradora.'
  },
  bx_coaseguro: {
    title: 'Coaseguro contratado BX+',
    desc: 'Porcentaje de participación del asegurado en los gastos médicos una vez descontado el deducible (ej. 0%, 10%, 20%).'
  },

  // BNV Specific
  bnv_zona: {
    title: 'Zona Geográfica BNV',
    desc: 'Distribución de tarifas para Bupa Nacional Vital. Zona 1 abarca CDMX, Área Metropolitana y Monterrey.'
  },
  bnv_tipo_cliente: {
    title: 'Tipo de Cliente BNV',
    desc: 'Te permite aplicar descuentos especiales basados en si es una póliza Individual, Familiar, Colectiva o con Convenios de Grupo.'
  },
  bnv_suma_asegurada: {
    title: 'Suma Asegurada Vital',
    desc: 'Suma acumulada anual máxima de Bupa Nacional Vital por asegurado. Disponible hasta $3M, $6M o $15M MXN.'
  },
  bnv_deducible: {
    title: 'Deducible Vital',
    desc: 'La participación inicial en gastos médicos. Al acumular este importe, Bupa cubre el remanente.'
  },
  bnv_coaseguro: {
    title: 'Coaseguro Vital',
    desc: 'Establece tu porcentaje de copago para eventos médicos. Disponible en opciones de 10% o 20%.'
  },
  bnv_tope_coaseguro: {
    title: 'Tope de Coaseguro Vital',
    desc: 'Te brinda certeza total al limitar la cantidad máxima que pagarás por concepto de coaseguro ante enfermedades graves.'
  },
  bnv_asistencia_extranjero: {
    title: 'Asistencia en el Extranjero BNV',
    desc: 'Cobertura de urgencias médicas inesperadas durante viajes internacionales temporales (de hasta 60 días).'
  },

  // BNP Specific
  bnp_zona: {
    title: 'Zona Geográfica BNP',
    desc: 'Distribución de tarifas para Bupa Nacional Plus. Zona 1 proporciona cobertura completa en hospitales de alta gama nacional.'
  },
  bnp_tipo_cliente: {
    title: 'Tipo de Cliente BNP',
    desc: 'Ofrece descuentos de tasa según la contratación familiar, colectiva o corporativa.'
  },
  bnp_suma_asegurada: {
    title: 'Suma Asegurada Plus',
    desc: 'Límite máximo asegurado con Bupa Nacional Plus, disponible en opciones de hasta $50 millones de pesos anuales.'
  },
  bnp_deducible: {
    title: 'Deducible Plus',
    desc: 'Monto de deducible para Bupa Nacional Plus. Un deducible más alto reduce significativamente la prima anual.'
  },
  bnp_coaseguro: {
    title: 'Coaseguro Plus',
    desc: 'Porcentaje de participación de gastos en red hospitalaria de Bupa Nacional Plus (0%, 10% o 20%).'
  },
  bnp_cobertura_catastrofica_extranjero: {
    title: 'Catastrófica Extranjero (CEE)',
    desc: 'Extensión premium opcional que ampara la atención médica integral en hospitales altamente especializados del extranjero para padecimientos severos.'
  },
  bnp_asistencia_extranjero: {
    title: 'Asistencia en el Extranjero Plus',
    desc: 'Amparo frente a imprevistos y enfermedades agudas fuera de México con la robusta red de asistencia global de Bupa.'
  }
};

function HelpTooltip({ text, title }: { text: string; title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <span className="relative inline-flex items-center align-middle ml-1.5 select-none shrink-0 z-10">
      <button
        type="button"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="text-slate-400 hover:text-slate-600 transition-colors p-0.5 focus:outline-none rounded cursor-pointer"
        aria-label={`Ayuda para ${title}`}
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>
      {isOpen && (
        <span className="absolute z-[999] bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900 border border-slate-800 text-white text-[11px] font-normal leading-relaxed rounded-xl shadow-2xl font-sans normal-case tracking-normal block text-center">
          <span className="block font-bold text-teal-400 mb-1 border-b border-white/10 pb-1">{title}</span>
          <span className="block text-slate-200">{text}</span>
          <span className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45 border-r border-b border-slate-800"></span>
        </span>
      )}
    </span>
  );
}

export interface MulticotizadorGmmViewProps {
  people: QuotePerson[];
  setPeople: React.Dispatch<React.SetStateAction<QuotePerson[]>>;
  multicotiOptions: MultiGmmOptionConfig[];
  setMulticotiOptions: React.Dispatch<React.SetStateAction<MultiGmmOptionConfig[]>>;
  multicotiResultsByFreq: Record<string, Record<FormaPago, NormalizedResult>>;
  multicotiErrors: Record<string, string>;
  multicotiCalculating: boolean;
  savedMultiGmmQuotes: MultiGmmQuote[];
  onSaveMultiQuote: (clientName: string) => Promise<void>;
  onLoadSavedQuote: (q: MultiGmmQuote) => void;
  onDeleteSavedQuote: (id: string, e: React.MouseEvent) => Promise<void>;
  isSaving: boolean;
  activePackage: TariffPackage | null;
  activeBnpPackage: BnpTariffPackage | null;
  selectedFormasPago: FormaPago[];
  setSelectedFormasPago: React.Dispatch<React.SetStateAction<FormaPago[]>>;
}

export default function MulticotizadorGmmView({
  people,
  setPeople,
  multicotiOptions,
  setMulticotiOptions,
  multicotiResultsByFreq,
  multicotiErrors,
  multicotiCalculating,
  savedMultiGmmQuotes,
  onSaveMultiQuote,
  onLoadSavedQuote,
  onDeleteSavedQuote,
  isSaving,
  activePackage,
  activeBnpPackage,
  selectedFormasPago,
  setSelectedFormasPago
}: MulticotizadorGmmViewProps) {
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRelation, setNewMemberRelation] = useState<RelationType>('Hij@');
  const [newMemberGender, setNewMemberGender] = useState<GenderType>('Masculino');
  const [newMemberAge, setNewMemberAge] = useState(30);
  const [clientNameInput, setClientNameInput] = useState('');
  const [isSavedHistoryOpen, setIsSavedHistoryOpen] = useState(false);

  // Grouped coverages list for side-by-side matrix
  const matrixCoverages = [
    { key: 'Gastos de Hospitalización', name: 'Gastos de Hospitalización', desc: 'Habitación, medicamentos, honorarios quirúrgicos dentro del hospital.' },
    { key: 'Honorarios Médicos / Quirúrgicos', name: 'Honorarios Médicos', desc: 'Consultas, cirugías e intervenciones de cirujanos y especialistas.' },
    { key: 'Asistencia en el Extranjero', name: 'Asistencia Médica en Extranjero', desc: 'Apoyo y cobertura en urgencias fuera de México.' },
    { key: 'Cobertura Catastróficas en Extranjero', name: 'Enf. Catastróficas en el Extranjero', desc: 'Atención internacional en hospitales selectos para padecimientos graves.' },
    { key: 'Maternidad', name: 'Auxilio de Maternidad', desc: 'Suma asegurada predefinida para gastos derivados del alumbramiento.' },
    { key: 'Medicamentos fuera del hospital', name: 'Medicamentos fuera de Hospital', desc: 'Reembolso o pago directo de fármacos recetados para consumo ambulatorio.' },
    { key: 'Eliminación de deducible por accidente', name: 'Eliminación Deducible por Accidente', desc: 'No se paga deducible si el gasto médico deriva de un accidente fortuito.' },
    { key: 'Multirregión', name: 'Multirregión', desc: 'Permite programar cirugías en zonas más caras de la contratada.' },
    { key: 'Beneficio hospitalario VIP', name: 'Beneficio Hospitalario VIP', desc: 'Comodidades ejecutivas o habitación premium durante reclusión.' },
    // Plus de Bupa / Prevention rows
    { key: 'Telemedicina Bupa 24/7', name: 'Telemedicina Bupa 24/7 (Bupa Plus)', desc: 'Consultas ilimitadas de medicina general, nutrición y psicología en la App de Bupa.' },
    { key: 'Check-up Preventivo Anual', name: 'Check-up Preventivo Anual (Bupa Plus)', desc: 'Estudios de laboratorio básicos o integrales sin costo una vez al año.' },
    { key: 'Monitoreo de Salud AI (Bupa Vital)', name: 'Monitoreo de Salud AI (Bupa Vital)', desc: 'Escaneo de signos vitales (presión, estrés, pulso) con la cámara de tu celular.' },
    { key: 'Segunda Opinión Médica', name: 'Segunda Opinión Médica (Bupa Plus)', desc: 'Acceso a interconsulta con médicos especialistas líderes para padecimientos cubiertos.' }
  ];

  // Helper inside matrix to determine icon & class
  const getMatrixStatus = (opt: MultiGmmOptionConfig, result: NormalizedResult | null, key: string) => {
    if (!result) return { icon: '—', text: 'No calculado', color: 'text-slate-400' };

    // Common Bupa Plus rows
    if (key === 'Check-up Preventivo Anual') {
      if (result.product_id === 'BXPLUS') return { icon: '⚠️', text: 'No incluido', color: 'text-slate-400' };
      if (result.product_id === 'BNV') return { icon: '✨', text: 'Incluido (Básico)', color: 'text-emerald-600 font-bold' };
      if (result.product_id === 'BNP') return { icon: '✨', text: 'Incluido (Integral Plus)', color: 'text-indigo-600 font-bold' };
    }
    if (key === 'Telemedicina Bupa 24/7') {
      if (result.product_id === 'BXPLUS') return { icon: '📞', text: 'Orientación telefónica', color: 'text-slate-500 font-medium' };
      if (result.product_id === 'BNV') return { icon: '✨', text: 'Incluido (App Bupa)', color: 'text-emerald-600 font-bold' };
      if (result.product_id === 'BNP') return { icon: '✨', text: 'Incluido (App Bupa Plus)', color: 'text-indigo-600 font-bold' };
    }
    if (key === 'Monitoreo de Salud AI (Bupa Vital)') {
      if (result.product_id === 'BXPLUS') return { icon: '❌', text: 'No incluido', color: 'text-rose-500' };
      if (result.product_id === 'BNV') return { icon: '✨', text: 'Incluido (Bupa Vital)', color: 'text-emerald-600 font-bold' };
      if (result.product_id === 'BNP') return { icon: '✨', text: 'Incluido (Bupa Vital)', color: 'text-indigo-600 font-bold' };
    }
    if (key === 'Segunda Opinión Médica') {
      if (result.product_id === 'BXPLUS') return { icon: '✅', text: 'Nacional preautorizado', color: 'text-slate-500 font-medium' };
      if (result.product_id === 'BNV') return { icon: '✨', text: 'Incluido Nacional/Inter.', color: 'text-emerald-600 font-bold' };
      if (result.product_id === 'BNP') return { icon: '✨', text: 'Incluido Inter. Premium', color: 'text-indigo-600 font-bold' };
    }

    if (result.product_id === 'BXPLUS') {
      if (key === 'Gastos de Hospitalización' || key === 'Honorarios Médicos / Quirúrgicos') {
        return { icon: '✅', text: 'Incluido', color: 'text-emerald-600 font-bold' };
      }
      if (key === 'Medicamentos fuera del hospital') {
        const hasIt = opt.bx_coberturas_opcionales?.includes('Medicamentos fuera del hospital');
        return hasIt 
          ? { icon: '➕', text: 'Contratado', color: 'text-indigo-600 font-bold' }
          : { icon: '❌', text: 'No contratado', color: 'text-rose-500 font-medium' };
      }
      if (key === 'Eliminación de deducible por accidente') {
        const hasIt = opt.bx_coberturas_opcionales?.includes('Eliminación deducible por accidente');
        return hasIt 
          ? { icon: '➕', text: 'Contratado', color: 'text-indigo-600 font-bold' }
          : { icon: '❌', text: 'No contratado', color: 'text-rose-500 font-medium' };
      }
      if (key === 'Multirregión') {
        const hasIt = opt.bx_coberturas_opcionales?.includes('Multirregión');
        return hasIt 
          ? { icon: '➕', text: 'Contratado', color: 'text-indigo-600 font-bold' }
          : { icon: '❌', text: 'No contratado', color: 'text-rose-500 font-medium' };
      }
      if (key === 'Beneficio hospitalario VIP') {
        const hasIt = opt.bx_coberturas_opcionales?.includes('Beneficio hospitalario VIP');
        return hasIt 
          ? { icon: '➕', text: 'Contratado', color: 'text-indigo-600 font-bold' }
          : { icon: '❌', text: 'No contratado', color: 'text-rose-500 font-medium' };
      }
      if (key === 'Asistencia en el Extranjero') {
        const hasIt = opt.bx_coberturas_opcionales?.includes('Emergencia médica en el extranjero');
        return hasIt 
          ? { icon: '➕', text: 'Contratado', color: 'text-indigo-600 font-bold' }
          : { icon: '❌', text: 'No contratado', color: 'text-rose-500 font-medium' };
      }
      if (key === 'Maternidad') {
        const hasIt = opt.bx_coberturas_opcionales?.includes('Maternidad');
        return hasIt 
          ? { icon: '➕', text: 'Contratado', color: 'text-indigo-600 font-bold' }
          : { icon: '❌', text: 'No contratado', color: 'text-rose-500 font-medium' };
      }
      return { icon: '—', text: 'No aplica', color: 'text-slate-400' };
    }

    if (result.product_id === 'BNV') {
      if (key === 'Gastos de Hospitalización' || key === 'Honorarios Médicos / Quirúrgicos') {
        return { icon: '✅', text: 'Incluido', color: 'text-emerald-600 font-bold' };
      }
      if (key === 'Asistencia en el Extranjero') {
        return opt.bnv_asistencia_extranjero === 'Si'
          ? { icon: '➕', text: 'Contratado', color: 'text-indigo-600 font-bold' }
          : { icon: '❌', text: 'No contratado', color: 'text-rose-500' };
      }
      if (key === 'Maternidad') {
        const hasIt = opt.bnv_maternidad_titular === 'Si' || opt.bnv_maternidad_conyuge === 'Si';
        return hasIt
          ? { icon: '➕', text: 'Contratado', color: 'text-indigo-600 font-bold' }
          : { icon: '❌', text: 'No contratado', color: 'text-rose-500' };
      }
      return { icon: '—', text: 'No aplica', color: 'text-slate-450' };
    }

    if (result.product_id === 'BNP') {
      if (key === 'Gastos de Hospitalización' || key === 'Honorarios Médicos / Quirúrgicos') {
        return { icon: '✅', text: 'Incluido', color: 'text-emerald-600 font-bold' };
      }
      if (key === 'Asistencia en el Extranjero') {
        return opt.bnp_asistencia_extranjero === 'Si'
          ? { icon: '➕', text: 'Contratado', color: 'text-indigo-600 font-bold' }
          : { icon: '❌', text: 'No contratado', color: 'text-rose-500' };
      }
      if (key === 'Cobertura Catastróficas en Extranjero') {
        return opt.bnp_cobertura_catastrofica_extranjero === 'Si'
          ? { icon: '➕', text: 'Contratado', color: 'text-indigo-600 font-bold' }
          : { icon: '❌', text: 'No contratado', color: 'text-rose-500' };
      }
      if (key === 'Maternidad') {
        const hasIt = opt.bnp_maternidad_titular === 'Si' || opt.bnp_maternidad_conyuge === 'Si';
        return hasIt
          ? { icon: '➕', text: 'Contratado', color: 'text-indigo-600 font-bold' }
          : { icon: '❌', text: 'No contratado', color: 'text-rose-500' };
      }
      return { icon: '—', text: 'No aplica', color: 'text-slate-450' };
    }

    return { icon: '—', text: 'No aplica', color: 'text-slate-400' };
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (people.length >= 5) {
      alert('Se permite un máximo de 5 asegurados comunes en esta fase.');
      return;
    }
    const name = newMemberName.trim() || `${newMemberRelation} ${people.length + 1}`;
    
    if (newMemberRelation === 'Titular' && people.some(p => p.relation === 'Titular')) {
      alert('La cotización ya posee un Titular. Solo está permitido un Titular.');
      return;
    }

    const newPerson: QuotePerson = {
      id: `p_${Date.now()}`,
      name,
      relation: newMemberRelation,
      gender: newMemberGender,
      age: Math.min(95, Math.max(0, newMemberAge))
    };

    setPeople([...people, newPerson]);
    setNewMemberName('');
    setNewMemberAge(30);
  };

  const handleRemoveMember = (id: string) => {
    setPeople(people.filter(p => p.id !== id));
  };

  const handleAddOption = () => {
    if (multicotiOptions.length >= 3) {
      alert('Permitido un máximo de 3 opciones comparativas simultáneas.');
      return;
    }
    const newOptId = `option_${Date.now()}`;
    const newOption: MultiGmmOptionConfig = {
      id: newOptId,
      product_id: 'BNV',
      bnv_zona: 'Zona 1',
      bnv_tipo_cliente: 'Individual / Familiar',
      bnv_suma_asegurada: 3000000,
      bnv_deducible: 100000,
      bnv_coaseguro: 10,
      bnv_tope_coaseguro: 30000,
      bnv_maternidad_titular: 'No',
      bnv_maternidad_conyuge: 'No',
      bnv_asistencia_extranjero: 'Si',
      bnv_forma_pago: 'Anual'
    };
    setMulticotiOptions([...multicotiOptions, newOption]);
  };

  const handleRemoveOption = (id: string) => {
    if (multicotiOptions.length <= 1) {
      alert('Debe existir al menos una opción de cotización activa.');
      return;
    }
    setMulticotiOptions(multicotiOptions.filter(o => o.id !== id));
  };

  const handleOptionProductChange = (index: number, val: 'BXPLUS' | 'BNV' | 'BNP') => {
    const updated = [...multicotiOptions];
    const prev = updated[index];
    
    if (val === 'BXPLUS') {
      updated[index] = {
        id: prev.id,
        product_id: 'BXPLUS',
        bx_zona: 'Zona Metropolitana (CDMX/EdoMex)',
        bx_nivel_hospitalario: 'Zafiro',
        bx_tabulador: 'Médico 2',
        bx_suma_asegurada: 10000000,
        bx_deducible: 30000,
        bx_coaseguro: 10,
        bx_tope_coaseguro_auto_val: true,
        bx_forma_pago: 'Anual',
        bx_coberturas_opcionales: [...BXPLUS_OPCIONALES_DEFAULT]
      };
    } else if (val === 'BNV') {
      updated[index] = {
        id: prev.id,
        product_id: 'BNV',
        bnv_zona: 'Zona 1',
        bnv_tipo_cliente: 'Individual / Familiar',
        bnv_suma_asegurada: 3000000,
        bnv_deducible: 100000,
        bnv_coaseguro: 10,
        bnv_tope_coaseguro: 30000,
        bnv_maternidad_titular: 'No',
        bnv_maternidad_conyuge: 'No',
        bnv_asistencia_extranjero: 'Si',
        bnv_forma_pago: 'Anual'
      };
    } else {
      updated[index] = {
        id: prev.id,
        product_id: 'BNP',
        bnp_zona: 'Zona 1',
        bnp_tipo_cliente: 'Nuevo negocio',
        bnp_suma_asegurada: 50000000,
        bnp_deducible: 35000,
        bnp_coaseguro: 10,
        bnp_maternidad_titular: 'No',
        bnp_maternidad_conyuge: 'No',
        bnp_asistencia_extranjero: 'Si',
        bnp_cobertura_catastrofica_extranjero: 'Si',
        bnp_forma_pago: 'Anual'
      };
    }
    setMulticotiOptions(updated);
  };

  const handleUpdateOptionField = (index: number, field: string, val: any) => {
    const updated = [...multicotiOptions];
    updated[index] = {
      ...updated[index],
      [field]: val
    };
    setMulticotiOptions(updated);
  };

  const handleToggleBxCoverage = (index: number, cov: string) => {
    const updated = [...multicotiOptions];
    const prevList = updated[index].bx_coberturas_opcionales || [];
    if (prevList.includes(cov)) {
      updated[index].bx_coberturas_opcionales = prevList.filter(c => c !== cov);
    } else {
      updated[index].bx_coberturas_opcionales = [...prevList, cov];
    }
    setMulticotiOptions(updated);
  };

  const handleSaveWorkspace = () => {
    onSaveMultiQuote(clientNameInput);
    setClientNameInput('');
  };

  const loadPresetMulti = (type: 'pareja' | 'adultomayor' | 'individual' | 'pdf_quote') => {
    if (type === 'pareja') {
      setPeople([
        { id: 'mp1', name: 'Alfonso Torres', relation: 'Titular', gender: 'Masculino', age: 41 },
        { id: 'mp2', name: 'Laura Gómez', relation: 'Cónyuge', gender: 'Femenino', age: 39 }
      ]);
    } else if (type === 'adultomayor') {
      setPeople([
        { id: 'mp3', name: 'Don Joaquín Herrera', relation: 'Titular', gender: 'Masculino', age: 74 }
      ]);
    } else if (type === 'pdf_quote') {
      setPeople([
        { id: 'pdf_1', name: 'Alonso Torres (Titular)', relation: 'Titular', gender: 'Masculino', age: 45 },
        { id: 'pdf_2', name: 'Laura Gómez (Cónyuge)', relation: 'Cónyuge', gender: 'Femenino', age: 43 },
        { id: 'pdf_3', name: 'Andrés Torres', relation: 'Hij@', gender: 'Masculino', age: 15 },
        { id: 'pdf_4', name: 'Sofía Torres', relation: 'Hij@', gender: 'Femenino', age: 11 },
        { id: 'pdf_5', name: 'Daniel Torres', relation: 'Hij@', gender: 'Masculino', age: 8 }
      ]);
      setMulticotiOptions([
        {
          id: 'option_pdf_1',
          product_id: 'BNP',
          bnp_zona: 'Zona 2',
          bnp_tipo_cliente: 'Nuevo negocio',
          bnp_suma_asegurada: 50000000,
          bnp_deducible: 55000,
          bnp_coaseguro: 10,
          bnp_maternidad_titular: 'No',
          bnp_maternidad_conyuge: 'No',
          bnp_asistencia_extranjero: 'No',
          bnp_cobertura_catastrofica_extranjero: 'No',
          bnp_forma_pago: 'Anual'
        }
      ]);
    } else {
      setPeople([
        { id: 'mp4', name: 'Sofia Herrera', relation: 'Titular', gender: 'Femenino', age: 29 }
      ]);
    }
  };

  return (
    <div className="space-y-8 print:bg-white print:text-black">
      
      {/* STEP 1: Shared Asegurados Card */}
      <div className="bg-white border border-slate-150/70 rounded-2xl shadow-sm p-6 print:border-none print:shadow-none">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center bg-emerald-50 text-emerald-700 w-6 h-6 rounded-full font-bold text-xs font-mono">1</span>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5 leading-none">
                <Users className="w-4 h-4 text-slate-500 mt-[-2px]" />
                Asegurados de la Póliza (Compartidos entre productos)
              </h2>
            </div>
            <p className="text-xs text-slate-450 mt-1">
              La edad y relación definidas aquí actúan como la única fuente de verdad compartida. Máximo 5 asegurados.
            </p>
          </div>


        </div>

        {/* Member Capture Form */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 pt-2">
          <form onSubmit={handleAddMember} className="xl:col-span-5 bg-slate-50/60 border border-slate-150/80 rounded-xl p-4 space-y-4">
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-widest font-mono">Añadir Integrante</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-[10px] text-slate-450 font-bold uppercase tracking-wider mb-1">Nombre Completo</label>
                <input
                  type="text"
                  placeholder="Ej. Sofia Herrera"
                  className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:border-slate-400 transition-all text-slate-800"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-455 font-bold uppercase tracking-wider mb-1">Parentesco</label>
                <select
                  className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-2 text-xs focus:outline-none focus:border-slate-400"
                  value={newMemberRelation}
                  onChange={(e) => setNewMemberRelation(e.target.value as RelationType)}
                >
                  <option value="Titular">Titular</option>
                  <option value="Cónyuge">Cónyuge</option>
                  <option value="Hij@">Hij@</option>
                  <option value="Dependiente económico">Dep. Económico</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-455 font-bold uppercase tracking-wider mb-1">Género</label>
                <select
                  className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-2 text-xs focus:outline-none focus:border-slate-400"
                  value={newMemberGender}
                  onChange={(e) => setNewMemberGender(e.target.value as GenderType)}
                >
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                <span>Edad del Asegurado</span>
                <span className="font-mono text-[11px] text-slate-800">{newMemberAge} años</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="95"
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
                  value={newMemberAge}
                  onChange={(e) => setNewMemberAge(Number(e.target.value))}
                />
                <input
                  type="number"
                  min="0"
                  max="95"
                  className="w-12 text-center bg-white border border-slate-250 py-1 rounded-lg text-xs font-mono font-bold"
                  value={newMemberAge}
                  onChange={(e) => setNewMemberAge(Math.max(0, Math.min(95, Number(e.target.value))))}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={people.length >= 5}
              className="w-full bg-slate-900 text-white py-1.5 rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Inscribir al Grupo ({people.length}/5)
            </button>
          </form>

          {/* Members list */}
          <div className="xl:col-span-7 border border-slate-150 rounded-xl p-4 flex flex-col justify-between">
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-600 uppercase tracking-widest font-mono mb-2">Integrantes del Grupo ({people.length})</h3>
              
              <div className="space-y-1.5 max-h-[170px] overflow-y-auto pr-1">
                {people.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400 italic">
                    Sin integrantes. Registra o selecciona una prueba rápida para poblar el grupo.
                  </div>
                ) : (
                  people.map((p, pIdx) => (
                    <div key={p.id} className="bg-slate-50 hover:bg-slate-100 border border-slate-150 rounded-xl p-3 py-2.5 flex items-center justify-between transition-colors">
                      <div className="flex items-center gap-2.5 font-sans">
                        <span className="font-mono text-xs font-semibold text-slate-400">#{pIdx+1}</span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-800">{p.name}</span>
                            <span className="text-[9px] bg-white border border-slate-200 text-slate-500 px-1.5 py-0.5 rounded-md font-mono">
                              {p.relation}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400">Generé: {p.gender} • <strong className="font-mono text-slate-600">{p.age} años</strong></p>
                        </div>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(p.id)}
                        className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-white transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {people.length > 0 && (
              <div className="bg-emerald-50 text-emerald-800 border border-emerald-150 rounded-xl p-3 mt-4 text-[11px] leading-relaxed flex items-start gap-2">
                <Check className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  <strong>Asegurados consolidados:</strong> Edad máxima es <strong>{Math.max(...people.map(p => p.age))} años</strong>. Las opciones de cotización se recalculan automáticamente usando este censo.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Formas de Pago Comparativas (User Goal #5) */}
        <div className="border-t border-slate-150 pt-5 mt-5">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest font-mono mb-2 flex items-center gap-1.5">
            <CheckSquare className="w-4 h-4 text-emerald-600" />
            Formas de Pago Comparativas
          </h3>
          <p className="text-xs text-slate-450 mb-3.5">
            Selecciona una o más formas de pago para el comparativo. En el paso 3 se desglosará el costo detallado para cada una de las opciones elegidas.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(['Anual', 'Semestral', 'Trimestral', 'Mensual'] as FormaPago[]).map((forma) => {
              const checked = selectedFormasPago.includes(forma);
              return (
                <label
                  key={forma}
                  className={`flex flex-col p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                    checked
                      ? 'bg-emerald-50/40 border-emerald-500 text-slate-900 shadow-sm'
                      : 'bg-white border-slate-205 hover:bg-slate-50 text-slate-600 hover:border-slate-350'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">{forma}</span>
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-555 h-3.5 w-3.5 accent-emerald-600 cursor-pointer"
                      checked={checked}
                      onChange={() => {
                        if (checked) {
                          if (selectedFormasPago.length > 1) {
                            setSelectedFormasPago(selectedFormasPago.filter(f => f !== forma));
                          }
                        } else {
                          setSelectedFormasPago([...selectedFormasPago, forma]);
                        }
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-450 mt-1 leading-snug">
                    {forma === 'Anual' && '1 pago único, sin recargo'}
                    {forma === 'Semestral' && '2 pagos, con cargo'}
                    {forma === 'Trimestral' && '4 pagos, con cargo'}
                    {forma === 'Mensual' && '12 pagos, con recargo'}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* Help & Benefits Highlight Banner */}
      <div className="bg-gradient-to-r from-teal-50 to-indigo-50/70 border border-teal-100 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-white rounded-xl text-teal-600 shadow-sm shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 font-sans flex items-center gap-1.5 leading-snug">
              Información de Coberturas & Beneficios Plus de Bupa
            </h4>
            <p className="text-[11px] text-slate-550 mt-1 leading-relaxed max-w-3xl">
              Hemos integrado selectores inteligentes con <strong>ayuda flotante ⓘ</strong> al lado de cada parámetro para explicar detalladamente coberturas, deducibles, coaseguros y beneficios adicionales en Bupa y BX+. Además, tu cotización incluye de forma automática los <strong>Plus de Bupa</strong> (Telemedicina 24/7 de medicina general, nutrición y psicología, Check-Up preventivo sin costo y Monitoreo de salud AI).
            </p>
          </div>
        </div>
        <div className="bg-white border border-slate-205 text-slate-700 text-[10px] px-3 py-1.5 rounded-lg shrink-0 font-medium shadow-sm flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-teal-600" />
          <span>Soporte de Ayuda Activo</span>
        </div>
      </div>

      {/* STEP 2: Comparative Quote Options Deck */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center bg-emerald-50 text-emerald-700 w-6 h-6 rounded-full font-bold text-xs font-mono">2</span>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
              <Layers className="w-4.5 h-4.5 text-slate-500" />
              Configurar Opciones de Productos Comparativos ({multicotiOptions.length})
            </h2>
          </div>

          <button
            onClick={handleAddOption}
            disabled={multicotiOptions.length >= 3}
            className="text-xs font-bold bg-slate-900 text-white rounded-xl px-4 py-2 hover:bg-slate-850 flex items-center gap-1 shadow-sm transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4 shrink-0" />
            Añadir Opción
          </button>
        </div>

        {/* Option Cards Horizontal Deck */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {multicotiOptions.map((opt, optIndex) => {
            const hasError = !!multicotiErrors[opt.id];
            const freqResults = multicotiResultsByFreq[opt.id] || {};
            const resultData = Object.values(freqResults)[0] || null;
            const carrierTheme = opt.product_id === 'BXPLUS' 
              ? { bg: 'bg-emerald-500', text: 'text-emerald-700', label: 'BX+ Únikuz', border: 'border-emerald-200', tag: 'bg-emerald-100', textTag: 'text-emerald-800' }
              : opt.product_id === 'BNV'
                ? { bg: 'bg-teal-500', text: 'text-teal-700', label: 'Bupa Vital (BNV)', border: 'border-teal-200', tag: 'bg-teal-100', textTag: 'text-teal-800' }
                : { bg: 'bg-indigo-500', text: 'text-indigo-700', label: 'Bupa Plus (BNP)', border: 'border-indigo-200', tag: 'bg-indigo-100', textTag: 'text-indigo-805' };

            return (
              <div 
                key={opt.id} 
                className="bg-white border border-slate-150 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition-all relative"
              >
                {/* Visual Header bar matching brand */}
                <div className="bg-slate-50 border-b border-slate-150 px-5 py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5.5 h-5.5 rounded-full bg-slate-900 text-white text-[11px] font-mono font-bold flex items-center justify-center">
                      #{(optIndex + 1)}
                    </span>
                    <span className="text-xs font-bold text-slate-700 lowercase leading-none">Configuración</span>
                  </div>

                  {multicotiOptions.length > 1 && (
                    <button
                      onClick={() => handleRemoveOption(opt.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                      title="Eliminar opción"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Form fields based on product chosen */}
                <div className="p-5 space-y-4 flex-grow font-sans">
                  
                  {/* Carrier / Product Switcher */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-450 uppercase tracking-widest font-mono">Aseguradora / Producto</label>
                    <div className="relative">
                      <select
                        className="w-full bg-[#f8f9fa] border border-slate-200 text-slate-800 text-xs rounded-xl py-2 px-2.5 appearance-none focus:outline-none"
                        value={opt.product_id}
                        onChange={(e) => handleOptionProductChange(optIndex, e.target.value as any)}
                      >
                        <option value="BXPLUS">GMM BX+ / Únikuz o Orquestación</option>
                        <option value="BNV">Bupa Nacional Vital (BNV)</option>
                        <option value="BNP">Bupa Nacional Plus (BNP)</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <hr className="border-slate-150" />

                  {/* BX+ SPECIFIC INPUT FIELDS */}
                  {opt.product_id === 'BXPLUS' && (
                    <div className="space-y-3.5">
                      {/* Zona */}
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-450 uppercase tracking-wider flex items-center">
                          Zona Geográfica
                          <HelpTooltip text={HELP_TEXTS.bx_zona.desc} title={HELP_TEXTS.bx_zona.title} />
                        </label>
                        <div className="relative">
                          <select
                            className="w-full bg-white border border-slate-200 text-slate-700 text-xs rounded-xl py-1.5 px-2 appearance-none"
                            value={opt.bx_zona}
                            onChange={(e) => handleUpdateOptionField(optIndex, 'bx_zona', e.target.value)}
                          >
                            <option value="Zona Metropolitana">Metropolitana (CDMX & AM)</option>
                            <option value="Zona Central">Zona Centro / Occidente</option>
                            <option value="Resto de la República">Provincia / Resto</option>
                          </select>
                          <ChevronDown className="w-3 h-3 absolute right-2.5 top-2 text-slate-400 pointer-events-none" />
                        </div>
                      </div>

                      {/* Nivel Red Hospitalaria */}
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-450 uppercase tracking-wider flex items-center">
                          Nivel Hospitalario
                          <HelpTooltip text={HELP_TEXTS.bx_nivel_hospitalario.desc} title={HELP_TEXTS.bx_nivel_hospitalario.title} />
                        </label>
                        <div className="relative">
                          <select
                            className="w-full bg-white border border-slate-200 text-slate-700 text-xs rounded-xl py-1.5 px-2 appearance-none"
                            value={opt.bx_nivel_hospitalario}
                            onChange={(e) => handleUpdateOptionField(optIndex, 'bx_nivel_hospitalario', e.target.value)}
                          >
                            <option value="Diamante">Diamante (Elite / Mayor nivel)</option>
                            <option value="Rubí">Rubí (Premium)</option>
                            <option value="Zafiro">Zafiro (Intermedio)</option>
                            <option value="Esmeralda">Esmeralda (Básico)</option>
                          </select>
                          <ChevronDown className="w-3 h-3 absolute right-2.5 top-2 text-slate-400 pointer-events-none" />
                        </div>
                      </div>

                      {/* Tabulador o Honorarios */}
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-450 uppercase tracking-wider flex items-center">
                          Tabulador Médico
                          <HelpTooltip text={HELP_TEXTS.bx_tabulador.desc} title={HELP_TEXTS.bx_tabulador.title} />
                        </label>
                        <div className="relative">
                          <select
                            className="w-full bg-white border border-slate-200 text-slate-700 text-xs rounded-xl py-1.5 px-2 appearance-none"
                            value={opt.bx_tabulador}
                            onChange={(e) => handleUpdateOptionField(optIndex, 'bx_tabulador', e.target.value)}
                          >
                            <option value="Médico Premium">Médico Premium (Mayor costo)</option>
                            <option value="Médico 3">Nivel Tabular 3</option>
                            <option value="Médico 2">Nivel Tabular 2</option>
                            <option value="Médico 1">Nivel Tabular 1</option>
                          </select>
                          <ChevronDown className="w-3 h-3 absolute right-2.5 top-2 text-slate-400 pointer-events-none" />
                        </div>
                      </div>

                      {/* Suma Asegurada */}
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-450 uppercase tracking-wider font-mono flex items-center">
                          Suma Asegurada GMM
                          <HelpTooltip text={HELP_TEXTS.bx_suma_asegurada.desc} title={HELP_TEXTS.bx_suma_asegurada.title} />
                        </label>
                        <div className="relative">
                          <select
                            className="w-full bg-white border border-slate-200 text-slate-700 text-xs rounded-xl py-1.5 px-2 appearance-none font-mono"
                            value={opt.bx_suma_asegurada}
                            onChange={(e) => handleUpdateOptionField(optIndex, 'bx_suma_asegurada', Number(e.target.value))}
                          >
                            <option value={2000000}>$2,000,000 MXN</option>
                            <option value={5000000}>$5,000,000 MXN</option>
                            <option value={10000000}>$10,000,000 MXN</option>
                            <option value={50000000}>$50,000,000 MXN</option>
                          </select>
                          <ChevronDown className="w-3 h-3 absolute right-2.5 top-2 text-slate-400 pointer-events-none" />
                        </div>
                      </div>

                      {/* Deducible */}
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-450 uppercase tracking-wider font-mono flex items-center">
                          Deducible Contratado
                          <HelpTooltip text={HELP_TEXTS.bx_deducible.desc} title={HELP_TEXTS.bx_deducible.title} />
                        </label>
                        <div className="relative">
                          <select
                            className="w-full bg-white border border-slate-200 text-slate-700 text-xs rounded-xl py-1.5 px-2 appearance-none font-mono"
                            value={opt.bx_deducible}
                            onChange={(e) => handleUpdateOptionField(optIndex, 'bx_deducible', Number(e.target.value))}
                          >
                            <option value={15000}>$15,000 MXN</option>
                            <option value={30000}>$30,000 MXN</option>
                            <option value={50000}>$50,000 MXN</option>
                            <option value={100000}>$100,000 MXN</option>
                          </select>
                          <ChevronDown className="w-3 h-3 absolute right-2.5 top-2 text-slate-400 pointer-events-none" />
                        </div>
                      </div>

                      {/* Coaseguro */}
                      <div className="pb-1">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-450 uppercase tracking-wider flex items-center">
                            Coaseguro
                            <HelpTooltip text={HELP_TEXTS.bx_coaseguro.desc} title={HELP_TEXTS.bx_coaseguro.title} />
                          </label>
                          <select
                            className="w-full bg-white border border-slate-200 text-slate-700 text-xs rounded-lg py-1 px-1.5"
                            value={opt.bx_coaseguro}
                            onChange={(e) => handleUpdateOptionField(optIndex, 'bx_coaseguro', Number(e.target.value))}
                          >
                            <option value={0}>0%</option>
                            <option value={10}>10%</option>
                            <option value={20}>20%</option>
                          </select>
                        </div>
                      </div>

                      {/* BX+ Optional Coverages multi-select panel */}
                      <div className="pt-2 border-t border-slate-150 space-y-2">
                        <span className="text-[9.5px] font-bold text-slate-500 uppercase tracking-wider block">Coberturas Opcionales BX+</span>
                        <div className="bg-slate-50 border border-slate-150 rounded-xl p-2.5 max-h-[140px] overflow-y-auto space-y-1.5 text-[10.5px]">
                          {Object.keys(BXPLUS_COVERAGES_INFO).map((covName) => {
                            const isChecked = opt.bx_coberturas_opcionales?.includes(covName) ?? false;
                            return (
                              <label key={covName} className="flex items-center justify-between gap-1.5 cursor-pointer hover:bg-slate-100 p-1 rounded transition-colors select-none w-full">
                                <div className="flex items-start gap-1.5 min-w-0 flex-1">
                                  <input
                                    type="checkbox"
                                    className="mt-0.5 w-3.5 h-3.5 accent-slate-950 shrink-0"
                                    checked={isChecked}
                                    onChange={() => handleToggleBxCoverage(optIndex, covName)}
                                  />
                                  <span className={`text-[10px] ${isChecked ? 'font-semibold text-slate-850 font-medium' : 'text-slate-550'}`}>
                                    {covName}
                                  </span>
                                </div>
                                <HelpTooltip 
                                  title={covName} 
                                  text={BXPLUS_COVERAGES_INFO[covName as keyof typeof BXPLUS_COVERAGES_INFO] || ""} 
                                />
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* BNV SPECIFIC INPUT FIELDS */}
                  {opt.product_id === 'BNV' && (
                    <div className="space-y-3.5">
                      {/* Zona */}
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-450 uppercase tracking-wider flex items-center">
                          Zona Geográfica
                          <HelpTooltip text={HELP_TEXTS.bnv_zona.desc} title={HELP_TEXTS.bnv_zona.title} />
                        </label>
                        <div className="relative">
                          <select
                            className="w-full bg-white border border-slate-200 text-slate-700 text-xs rounded-xl py-1.5 px-2 appearance-none"
                            value={opt.bnv_zona}
                            onChange={(e) => handleUpdateOptionField(optIndex, 'bnv_zona', e.target.value)}
                          >
                            <option value="Zona 1">Zona 1 (CDMX, AM & Monterrey)</option>
                            <option value="Zona 2">Zona 2 (Resto del país)</option>
                          </select>
                          <ChevronDown className="w-3 h-3 absolute right-2.5 top-2 text-slate-400 pointer-events-none" />
                        </div>
                      </div>

                      {/* Tipo Cliente */}
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-450 uppercase tracking-wider flex items-center">
                          Tipo de Cliente
                          <HelpTooltip text={HELP_TEXTS.bnv_tipo_cliente.desc} title={HELP_TEXTS.bnv_tipo_cliente.title} />
                        </label>
                        <div className="relative">
                          <select
                            className="w-full bg-white border border-slate-200 text-slate-700 text-xs rounded-xl py-1.5 px-2 appearance-none"
                            value={opt.bnv_tipo_cliente}
                            onChange={(e) => handleUpdateOptionField(optIndex, 'bnv_tipo_cliente', e.target.value)}
                          >
                            {activePackage?.client_types?.map(c => {
                              const factorPercent = Math.round((1 - c.discount_factor) * 100);
                              return (
                                <option key={c.client_type} value={c.client_type}>
                                  {c.client_type} {factorPercent > 0 ? `(-${factorPercent}%)` : ''}
                                </option>
                              );
                            })}
                          </select>
                          <ChevronDown className="w-3 h-3 absolute right-2.5 top-2 text-slate-400 pointer-events-none" />
                        </div>
                      </div>

                      {/* Suma Asegurada */}
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-450 uppercase tracking-wider font-mono flex items-center">
                          Suma Asegurada BNV
                          <HelpTooltip text={HELP_TEXTS.bnv_suma_asegurada.desc} title={HELP_TEXTS.bnv_suma_asegurada.title} />
                        </label>
                        <div className="relative">
                          <select
                            className="w-full bg-white border border-slate-200 text-slate-700 text-xs rounded-xl py-1.5 px-2 appearance-none font-mono"
                            value={opt.bnv_suma_asegurada}
                            onChange={(e) => handleUpdateOptionField(optIndex, 'bnv_suma_asegurada', Number(e.target.value))}
                          >
                            {activePackage?.sumas_aseguradas?.map(sa => (
                              <option key={sa} value={sa}>
                                ${(sa / 1000000).toLocaleString()}M MXN
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-3 h-3 absolute right-2.5 top-2 text-slate-400 pointer-events-none" />
                        </div>
                      </div>

                      {/* Deducible */}
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-450 uppercase tracking-wider font-mono flex items-center">
                          Deducible Contratado BNV
                          <HelpTooltip text={HELP_TEXTS.bnv_deducible.desc} title={HELP_TEXTS.bnv_deducible.title} />
                        </label>
                        <div className="relative">
                          <select
                            className="w-full bg-white border border-slate-200 text-slate-700 text-xs rounded-xl py-1.5 px-2 appearance-none font-mono"
                            value={opt.bnv_deducible}
                            onChange={(e) => handleUpdateOptionField(optIndex, 'bnv_deducible', Number(e.target.value))}
                          >
                            {activePackage?.deducibles?.map(d => (
                              <option key={d} value={d}>
                                ${d.toLocaleString()} MXN
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-3 h-3 absolute right-2.5 top-2 text-slate-400 pointer-events-none" />
                        </div>
                      </div>

                      {/* Coaseguro */}
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-450 uppercase tracking-wider font-mono flex items-center">
                          Coaseguro Contratado
                          <HelpTooltip text={HELP_TEXTS.bnv_coaseguro.desc} title={HELP_TEXTS.bnv_coaseguro.title} />
                        </label>
                        <div className="relative">
                          <select
                            className="w-full bg-white border border-slate-200 text-slate-700 text-xs rounded-xl py-1.5 px-2 appearance-none font-mono"
                            value={opt.bnv_coaseguro}
                            onChange={(e) => handleUpdateOptionField(optIndex, 'bnv_coaseguro', Number(e.target.value))}
                          >
                            {activePackage?.coaseguros?.map(c => (
                              <option key={c} value={c}>
                                {c}%
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-3 h-3 absolute right-2.5 top-2 text-slate-400 pointer-events-none" />
                        </div>
                      </div>

                      {/* Tope Coaseguro */}
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-450 uppercase tracking-wider flex items-center">
                          Tope de Coaseguro
                          <HelpTooltip text={HELP_TEXTS.bnv_tope_coaseguro.desc} title={HELP_TEXTS.bnv_tope_coaseguro.title} />
                        </label>
                        <div className="relative">
                          <select
                            className="w-full bg-white border border-slate-200 text-slate-700 text-xs rounded-xl py-1.5 px-2 appearance-none"
                            value={opt.bnv_tope_coaseguro}
                            onChange={(e) => handleUpdateOptionField(optIndex, 'bnv_tope_coaseguro', Number(e.target.value))}
                          >
                            {activePackage?.topes_coaseguro?.map(t => (
                              <option key={t} value={t}>
                                {t === 0 ? 'Sin Tope ($0)' : `$${t.toLocaleString()} MXN`}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-3 h-3 absolute right-2.5 top-2 text-slate-400 pointer-events-none" />
                        </div>
                      </div>

                      {/* Adicionales BNV toggles */}
                      <div className="pt-2 border-t border-slate-100">
                        <div>
                          <label className="block text-[8.5px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center">
                            Asistencia Extranjero
                            <HelpTooltip text={HELP_TEXTS.bnv_asistencia_extranjero.desc} title={HELP_TEXTS.bnv_asistencia_extranjero.title} />
                          </label>
                          <select
                            className="w-full bg-slate-50 border border-slate-200 text-[10.5px] rounded-lg p-1 font-semibold"
                            value={opt.bnv_asistencia_extranjero}
                            onChange={(e) => handleUpdateOptionField(optIndex, 'bnv_asistencia_extranjero', e.target.value)}
                          >
                            <option value="Si">Si</option>
                            <option value="No">No</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* BNP SPECIFIC INPUT FIELDS */}
                  {opt.product_id === 'BNP' && (
                    <div className="space-y-3.5">
                      {/* Zona */}
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-450 uppercase tracking-wider flex items-center">
                          Zona Geográfica
                          <HelpTooltip text={HELP_TEXTS.bnp_zona.desc} title={HELP_TEXTS.bnp_zona.title} />
                        </label>
                        <div className="relative">
                          <select
                            className="w-full bg-white border border-slate-200 text-slate-700 text-xs rounded-xl py-1.5 px-2 appearance-none"
                            value={opt.bnp_zona}
                            onChange={(e) => handleUpdateOptionField(optIndex, 'bnp_zona', e.target.value)}
                          >
                            <option value="Zona 1">Zona 1 (CDMX, AM & Monterrey)</option>
                            <option value="Zona 2">Zona 2 (Resto del país)</option>
                          </select>
                          <ChevronDown className="w-3 h-3 absolute right-2.5 top-2 text-slate-400 pointer-events-none" />
                        </div>
                      </div>

                      {/* Tipo Cliente */}
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-450 uppercase tracking-wider flex items-center">
                          Tipo de Cliente (Descuento)
                          <HelpTooltip text={HELP_TEXTS.bnp_tipo_cliente.desc} title={HELP_TEXTS.bnp_tipo_cliente.title} />
                        </label>
                        <div className="relative">
                          <select
                            className="w-full bg-white border border-slate-200 text-slate-700 text-xs rounded-xl py-1.5 px-2 appearance-none"
                            value={opt.bnp_tipo_cliente}
                            onChange={(e) => handleUpdateOptionField(optIndex, 'bnp_tipo_cliente', e.target.value)}
                          >
                            {activeBnpPackage?.client_types?.map(c => {
                              const factorPercent = Math.round((1 - c.discount_factor) * 100);
                              return (
                                <option key={c.client_type} value={c.client_type}>
                                  {c.client_type} {factorPercent > 0 ? `(-${factorPercent}%)` : ''}
                                </option>
                              );
                            })}
                          </select>
                          <ChevronDown className="w-3 h-3 absolute right-2.5 top-2 text-slate-400 pointer-events-none" />
                        </div>
                      </div>

                      {/* Suma Asegurada */}
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-450 uppercase tracking-wider font-mono flex items-center">
                          Suma Asegurada BNP
                          <HelpTooltip text={HELP_TEXTS.bnp_suma_asegurada.desc} title={HELP_TEXTS.bnp_suma_asegurada.title} />
                        </label>
                        <div className="relative">
                          <select
                            className="w-full bg-white border border-slate-200 text-slate-700 text-xs rounded-xl py-1.5 px-2 appearance-none font-mono"
                            value={opt.bnp_suma_asegurada}
                            onChange={(e) => handleUpdateOptionField(optIndex, 'bnp_suma_asegurada', Number(e.target.value))}
                          >
                            {activeBnpPackage?.sumas_aseguradas?.map(sa => (
                              <option key={sa} value={sa}>
                                ${(sa / 1000000).toLocaleString()}M MXN
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-3 h-3 absolute right-2.5 top-2 text-slate-400 pointer-events-none" />
                        </div>
                      </div>

                      {/* Deducible */}
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-450 uppercase tracking-wider font-mono flex items-center">
                          Deducible Contratado BNP
                          <HelpTooltip text={HELP_TEXTS.bnp_deducible.desc} title={HELP_TEXTS.bnp_deducible.title} />
                        </label>
                        <div className="relative">
                          <select
                            className="w-full bg-white border border-slate-200 text-slate-700 text-xs rounded-xl py-1.5 px-2 appearance-none font-mono"
                            value={opt.bnp_deducible}
                            onChange={(e) => handleUpdateOptionField(optIndex, 'bnp_deducible', Number(e.target.value))}
                          >
                            {activeBnpPackage?.deducibles?.map(d => (
                              <option key={d} value={d}>
                                ${d.toLocaleString()} MXN
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-3 h-3 absolute right-2.5 top-2 text-slate-400 pointer-events-none" />
                        </div>
                      </div>

                      {/* Coaseguro y Catastrofico togglers */}
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-450 uppercase tracking-wider flex items-center">
                            Coaseguro
                            <HelpTooltip text={HELP_TEXTS.bnp_coaseguro.desc} title={HELP_TEXTS.bnp_coaseguro.title} />
                          </label>
                          <select
                            className="w-full bg-white border border-slate-200 text-slate-750 text-xs rounded-lg p-1.5 font-sans"
                            value={opt.bnp_coaseguro}
                            onChange={(e) => handleUpdateOptionField(optIndex, 'bnp_coaseguro', Number(e.target.value))}
                          >
                            {activeBnpPackage?.coaseguros?.map(c => (
                              <option key={c} value={c}>{c}%</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-450 uppercase tracking-wider flex items-center">
                            CEE Extr.
                            <HelpTooltip text={HELP_TEXTS.bnp_cobertura_catastrofica_extranjero.desc} title={HELP_TEXTS.bnp_cobertura_catastrofica_extranjero.title} />
                          </label>
                          <select
                            className="w-full bg-white border border-slate-200 text-slate-755 text-xs rounded-lg p-1.5 font-sans"
                            value={opt.bnp_cobertura_catastrofica_extranjero}
                            onChange={(e) => handleUpdateOptionField(optIndex, 'bnp_cobertura_catastrofica_extranjero', e.target.value)}
                          >
                            <option value="Si">Si</option>
                            <option value="No">No</option>
                          </select>
                        </div>
                      </div>

                      {/* Asistencia Extranjero */}
                      <div className="pt-2 border-t border-slate-100">
                        <div>
                          <label className="block text-[8.5px] font-bold text-slate-450 uppercase tracking-widest mb-1 font-mono flex items-center">
                            Asistencia en el Extranjero
                            <HelpTooltip text={HELP_TEXTS.bnp_asistencia_extranjero.desc} title={HELP_TEXTS.bnp_asistencia_extranjero.title} />
                          </label>
                          <select
                            className="w-full bg-slate-50 border border-slate-200 text-[10.5px] rounded-lg p-1 font-semibold"
                            value={opt.bnp_asistencia_extranjero}
                            onChange={(e) => handleUpdateOptionField(optIndex, 'bnp_asistencia_extranjero', e.target.value)}
                          >
                            <option value="Si">Si</option>
                            <option value="No">No</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                {/* Bupa Plus / Prevention Benefits Panel */}
                {(opt.product_id === 'BNV' || opt.product_id === 'BNP') && (
                  <div className="mx-5 mb-4 p-3.5 bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-100 rounded-2xl space-y-2 text-left">
                    <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-[10.5px]">
                      <Gift className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Beneficios Plus de Bupa Incluidos</span>
                    </div>
                    <p className="text-[10px] text-slate-550 leading-relaxed">
                      Tu cotización de {opt.product_id === 'BNV' ? 'Bupa Nacional Vital' : 'Bupa Nacional Plus'} incluye de forma automática:
                    </p>
                    <ul className="text-[9.5px] space-y-1.5 text-slate-700">
                      <li className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                        <span><strong>Telemedicina 24/7 sin costo:</strong> Consultas ilimitadas de medicina general, nutrición y psicología mediante la App de Bupa.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                        <span><strong>Check-up Médico Anual:</strong> {opt.product_id === 'BNV' ? 'Análisis clínicos básicos' : 'Análisis clínicos integrales'} sin costo en laboratorios de red autorizados.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                        <span><strong>Monitoreo Vital AI:</strong> Mide tus signos vitales en 60 segundos usando la cámara de tu celular con Bupa Vital.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                        <span><strong>Segunda Opinión Internacional:</strong> Acceso a interconsulta médica de súper especialidad con líderes globales.</span>
                      </li>
                    </ul>
                  </div>
                )}

                {/* Pricing / Loading Feedback footer */}
                <div className="border-t border-slate-150 p-4 bg-slate-50 space-y-3">
                  {hasError ? (
                    <div className="bg-rose-50 border border-rose-150 rounded-xl p-3 text-rose-800 text-[11px] flex gap-1.5">
                      <ShieldAlert className="w-4 h-4 shrink-0" />
                      <span>{multicotiErrors[opt.id]}</span>
                    </div>
                  ) : Object.keys(freqResults).length > 0 ? (
                    <div className="space-y-3 last:space-y-0 text-left">
                      {selectedFormasPago.map((forma) => {
                        const result = freqResults[forma];
                        if (!result) return null;
                        return (
                          <div key={forma} className="border-b border-slate-205 last:border-none pb-2.5 last:pb-0 space-y-1">
                            <div className="flex justify-between items-baseline">
                              <span className="text-[9.5px] font-bold text-slate-500 uppercase tracking-wider">{forma} - Costo Total</span>
                              <span className="text-sm font-bold font-mono text-emerald-600">
                                ${result.totals.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                            
                            <div className="flex justify-between items-baseline text-[10px] font-mono text-slate-450">
                              <span className="font-sans">Primer recibo (Inicial):</span>
                              <span className="font-semibold text-slate-800">
                                ${result.totals.primer_pago.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                              </span>
                            </div>

                            {result.totals.pagos_subsecuentes > 0 && (
                              <div className="flex justify-between items-baseline text-[10px] font-mono text-slate-450">
                                <span className="font-sans">Subsecuentes ({result.totals.numero_recibos - 1}x):</span>
                                <span className="font-semibold text-slate-800">
                                  ${result.totals.pagos_subsecuentes.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-xs font-mono text-slate-400">
                      Censo vacío. Agrega asegurados.
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 3: Beautiful Side-by-Side Comparison Matrix */}
      {people.length > 0 && (
        <div className="bg-white border border-slate-150 rounded-2xl overflow-hidden shadow-sm p-6 print:border-none print:shadow-none">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center bg-emerald-50 text-emerald-700 w-6 h-6 rounded-full font-bold text-xs font-mono">3</span>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                  <Layers className="w-4.5 h-4.5 text-slate-500" />
                  Matriz de Comparación Side-by-Side GMM
                </h2>
              </div>
              <p className="text-xs text-slate-450 mt-1">
                Visualización homologada de primas netas, cargos de fraccionado, impuestos y estatus de coberturas.
              </p>
            </div>

            <button
              onClick={() => window.print()}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-4 py-2 rounded-xl transition-all border border-slate-300 flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              Imprimir Comparativa
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-100 rounded-xl relative">
            <table className="w-full min-w-[700px] border-collapse text-left font-sans text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-150">
                  <th className="p-4 font-bold text-slate-450 uppercase tracking-widest text-[10px] w-[30%]">Concepto Homologado</th>
                  {multicotiOptions.map((opt, oIdx) => (
                    <th key={opt.id} className="p-4 font-bold font-display text-slate-800 text-[12px] border-l border-slate-150">
                      Opción #{oIdx + 1}: {opt.product_id === 'BXPLUS' ? 'BX+ Únikuz' : opt.product_id === 'BNV' ? 'Bupa Vital (BNV)' : 'Bupa Plus (BNP)'}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150/70">
                
                {/* 1. Geografía */}
                <tr>
                  <td className="p-4 font-medium text-slate-450 uppercase font-mono text-[9px] bg-slate-50/40">Geografía / Red de Atención</td>
                  {multicotiOptions.map((opt, oIdx) => {
                    const result = multicotiResultsByFreq[opt.id]?.[selectedFormasPago[0]];
                    return (
                      <td key={opt.id} className="p-4 font-semibold text-slate-800 border-l border-slate-150 bg-slate-50/10">
                        {result?.plan_summary ? `${result.plan_summary.zona}` : 'No calculado'}
                      </td>
                    );
                  })}
                </tr>

                {/* 2. Suma Asegurada */}
                <tr>
                  <td className="p-4 font-medium text-slate-450 uppercase font-mono text-[9px] bg-slate-50/40">Suma Asegurada Limit (MXN)</td>
                  {multicotiOptions.map((opt, oIdx) => {
                    const result = multicotiResultsByFreq[opt.id]?.[selectedFormasPago[0]];
                    return (
                      <td key={opt.id} className="p-4 font-bold text-slate-800 border-l border-slate-150 bg-slate-50/10 font-mono">
                        {result?.plan_summary ? `$${(result.plan_summary.suma_asegurada).toLocaleString()} MXN` : 'No calculado'}
                      </td>
                    );
                  })}
                </tr>

                {/* 3. Deducible */}
                <tr>
                  <td className="p-4 font-medium text-slate-450 uppercase font-mono text-[9px] bg-slate-50/40">Deducible Contratado</td>
                  {multicotiOptions.map((opt, oIdx) => {
                    const result = multicotiResultsByFreq[opt.id]?.[selectedFormasPago[0]];
                    return (
                      <td key={opt.id} className="p-4 font-bold text-slate-800 border-l border-slate-150 bg-slate-50/10 font-mono">
                        {result?.plan_summary ? `$${result.plan_summary.deducible.toLocaleString()} MXN` : 'No calculado'}
                      </td>
                    );
                  })}
                </tr>

                {/* 4. Coaseguro */}
                <tr>
                  <td className="p-4 font-medium text-slate-450 uppercase font-mono text-[9px] bg-slate-50/40">Coaseguro Contratado (%)</td>
                  {multicotiOptions.map((opt, oIdx) => {
                    const result = multicotiResultsByFreq[opt.id]?.[selectedFormasPago[0]];
                    return (
                      <td key={opt.id} className="p-4 font-semibold text-slate-800 border-l border-slate-150 bg-slate-50/10 font-mono">
                        {result?.plan_summary ? `${result.plan_summary.coaseguro}%` : 'No calculado'}
                      </td>
                    );
                  })}
                </tr>

                {/* 5. Tope Coaseguro */}
                <tr>
                  <td className="p-4 font-medium text-slate-450 uppercase font-mono text-[9px] bg-slate-50/40">Tope de Coaseguro</td>
                  {multicotiOptions.map((opt, oIdx) => {
                    const result = multicotiResultsByFreq[opt.id]?.[selectedFormasPago[0]];
                    if (!result?.plan_summary) return <td key={opt.id} className="p-4 text-slate-400 border-l border-slate-150 bg-slate-50/10">—</td>;
                    return (
                      <td key={opt.id} className="p-4 font-semibold text-slate-800 border-l border-slate-150 bg-slate-50/10 font-mono">
                        {result.plan_summary.tope_coaseguro > 0 
                          ? `$${result.plan_summary.tope_coaseguro.toLocaleString()} MXN` 
                          : result.product_id === 'BNP' ? 'No aplica (Ilid.)' : 'Sin Tope'}
                      </td>
                    );
                  })}
                </tr>

                {/* 6. Formas de Pago */}
                <tr>
                  <td className="p-4 font-medium text-slate-450 uppercase font-mono text-[9px] bg-slate-50/40">Frecuencias Cotizadas</td>
                  {multicotiOptions.map((opt, oIdx) => {
                    return (
                      <td key={opt.id} className="p-4 font-bold text-slate-808 border-l border-slate-150 bg-slate-50/10">
                        {selectedFormasPago.join(', ')}
                      </td>
                    );
                  })}
                </tr>

                {/* Breakdowns section header */}
                <tr className="bg-slate-100/50">
                  <td colSpan={multicotiOptions.length + 1} className="p-3 font-bold text-slate-700 text-[10.5px] uppercase font-sans tracking-wide">
                    Desglose Financiero por Frecuencia de Pago (MXN)
                  </td>
                </tr>

                {/* Loop over each selected payment frequency (User Goal #5) */}
                {selectedFormasPago.map((forma) => {
                  return (
                    <React.Fragment key={forma}>
                      {/* Sub-header for the current frequency */}
                      <tr className="bg-slate-50 border-t border-b border-slate-150">
                        <td colSpan={multicotiOptions.length + 1} className="p-3 font-bold text-slate-700 text-[9.5px] uppercase font-mono tracking-wider">
                          Frecuencia: <span className="text-emerald-700 font-bold text-xs">{forma}</span>
                        </td>
                      </tr>

                      {/* Costo Total */}
                      <tr className="bg-emerald-50/30">
                        <td className="p-3.5 text-slate-800 font-bold pl-5">Costo Total del Recibo ({forma}):</td>
                        {multicotiOptions.map((opt, oIdx) => {
                          const result = multicotiResultsByFreq[opt.id]?.[forma];
                          return (
                            <td key={opt.id} className="p-3.5 font-bold border-l border-slate-150 text-emerald-700 font-mono text-xs bg-emerald-50/5">
                              {result ? `$${result.totals.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}` : '—'}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Primer Pago */}
                      <tr>
                        <td className="p-3.5 text-slate-500 font-semibold pl-6">Primer Pago (Inicial):</td>
                        {multicotiOptions.map((opt, oIdx) => {
                          const result = multicotiResultsByFreq[opt.id]?.[forma];
                          return (
                            <td key={opt.id} className="p-3.5 font-bold text-slate-800 border-l border-slate-150 font-mono">
                              {result ? `$${result.totals.primer_pago.toLocaleString('es-MX', { minimumFractionDigits: 2 })}` : '—'}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Subsecuentes */}
                      <tr>
                        <td className="p-3.5 text-slate-500 pl-6">Subsecuentes:</td>
                        {multicotiOptions.map((opt, oIdx) => {
                          const result = multicotiResultsByFreq[opt.id]?.[forma];
                          if (!result) return <td key={opt.id} className="p-3.5 text-slate-400 border-l border-slate-150 font-mono">—</td>;
                          const hasSubsecuentes = result.totals.pagos_subsecuentes > 0;
                          return (
                            <td key={opt.id} className="p-3.5 font-mono text-slate-800 border-l border-slate-150">
                              {hasSubsecuentes 
                                ? `${result.totals.numero_recibos - 1} pagos de $${result.totals.pagos_subsecuentes.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
                                : 'No aplica (Pago Único)'}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Prima Neta */}
                      <tr className="opacity-70 text-[11px]">
                        <td className="p-3 text-slate-450 pl-6">Prima Neta del Grupo:</td>
                        {multicotiOptions.map((opt, oIdx) => {
                          const result = multicotiResultsByFreq[opt.id]?.[forma];
                          return (
                            <td key={opt.id} className="p-3 font-mono text-slate-500 border-l border-slate-150">
                              {result ? `$${result.totals.prima_neta.toLocaleString('es-MX', { minimumFractionDigits: 2 })}` : '—'}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Cargo Financiero */}
                      <tr className="opacity-70 text-[11px]">
                        <td className="p-3 text-slate-450 pl-6">Cargo Financiero:</td>
                        {multicotiOptions.map((opt, oIdx) => {
                          const result = multicotiResultsByFreq[opt.id]?.[forma];
                          return (
                            <td key={opt.id} className="p-3 font-mono text-slate-500 border-l border-slate-150">
                              {result && result.totals.recargo_pago > 0 
                                ? `+$${result.totals.recargo_pago.toLocaleString('es-MX', { minimumFractionDigits: 2 })}` 
                                : '$0.00'}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Derechos de Poliza */}
                      <tr className="opacity-70 text-[11px]">
                        <td className="p-3 text-slate-450 pl-6">Derechos de Póliza:</td>
                        {multicotiOptions.map((opt, oIdx) => {
                          const result = multicotiResultsByFreq[opt.id]?.[forma];
                          return (
                            <td key={opt.id} className="p-3 font-mono text-slate-500 border-l border-slate-150">
                              {result ? `+$${result.totals.derecho_poliza.toLocaleString('es-MX', { minimumFractionDigits: 2 })}` : '—'}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Impuesto IVA */}
                      <tr className="opacity-70 text-[11px]">
                        <td className="p-3 text-slate-450 pl-6">Impuesto IVA (16%):</td>
                        {multicotiOptions.map((opt, oIdx) => {
                          const result = multicotiResultsByFreq[opt.id]?.[forma];
                          return (
                            <td key={opt.id} className="p-3 font-mono text-slate-500 border-l border-slate-150">
                              {result ? `+$${result.totals.iva.toLocaleString('es-MX', { minimumFractionDigits: 2 })}` : '—'}
                            </td>
                          );
                        })}
                      </tr>
                    </React.Fragment>
                  );
                })}

                {/* Coverages table headers */}
                <tr className="bg-slate-100/50">
                  <td colSpan={multicotiOptions.length + 1} className="p-3 font-bold text-slate-700 text-[10px] uppercase font-sans tracking-wide">
                    Cuadro Comparativo de Coberturas GMM
                  </td>
                </tr>

                {/* Dynamic matrix row for each core GMM coverage */}
                {matrixCoverages.map((cov) => (
                  <tr key={cov.key}>
                    <td className="p-4">
                      <div className="font-semibold text-slate-850 leading-relaxed">{cov.name}</div>
                      <div className="text-[10px] text-slate-450 mt-1 leading-normal">{cov.desc}</div>
                    </td>
                    {multicotiOptions.map((opt, oIdx) => {
                      const result = multicotiResultsByFreq[opt.id]?.[selectedFormasPago[0]];
                      const status = getMatrixStatus(opt, result, cov.key);
                      return (
                        <td key={opt.id} className="p-4 border-l border-slate-150 bg-white">
                          <div className="flex items-center gap-1.5 font-sans leading-none">
                            <span className="text-base select-none shrink-0">{status.icon}</span>
                            <span className={`text-[11px] leading-none ${status.color}`}>
                              {status.text}
                            </span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}

              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* STEP 4: Save & History Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:hidden">
        
        {/* Save workspace panel */}
        <div className="bg-white border border-slate-150 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-3.5">
            <h3 className="text-sm font-bold text-slate-800 font-sans flex items-center gap-1.5">
              <Save className="w-4 h-4 text-slate-500 mt-[-2px]" />
              Archivar Espacio del Multicotizador GMM
            </h3>
            <p className="text-xs text-slate-450 leading-relaxed">
              Guarda el censo completo de asegurados junto con las configuraciones y resultados comparativos de las opciones en IndexedDB local.
            </p>

            <div className="space-y-1.5">
              <label className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 block font-sans">Nombre de la Multicotización / Prospecto</label>
              <input
                type="text"
                placeholder="Ej. Familia Torres Gómez - Plan Plus 2026"
                className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl py-2 px-3.5 text-xs focus:outline-none focus:bg-white text-slate-800"
                value={clientNameInput}
                onChange={(e) => setClientNameInput(e.target.value)}
              />
            </div>
          </div>

          <button
            onClick={handleSaveWorkspace}
            disabled={people.length === 0 || Object.keys(multicotiResultsByFreq).length === 0 || isSaving}
            className="w-full mt-4 bg-slate-900 text-white rounded-xl py-2.5 hover:bg-slate-850 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {isSaving ? (
              <span className="w-3.5 h-3.5 border-2 border-t-transparent border-white rounded-full animate-spin shrink-0"></span>
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            Guardar Resultados Comparativos en Historial
          </button>
        </div>

        {/* History repository list */}
        <div className="bg-white border border-slate-150 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-3.5">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Archive className="w-4 h-4 text-slate-500 mt-[-2px]" />
                Historial de Multicotizaciones ({savedMultiGmmQuotes.length})
              </h3>
            </div>
            <p className="text-xs text-slate-450 leading-relaxed">
              Haz clic sobre cualquier registro de cotización previa para restaurar inmediatamente todo el censo y las comparativas en el tablero principal.
            </p>

            <div className="space-y-2 max-h-[145px] overflow-y-auto pr-1">
              {savedMultiGmmQuotes.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 italic font-mono">
                  No hay cotizaciones de multicotizador archivadas aún.
                </div>
              ) : (
                savedMultiGmmQuotes.map((q) => (
                  <div
                    key={q.id}
                    onClick={() => onLoadSavedQuote(q)}
                    className="bg-slate-50 hover:bg-slate-100 border border-slate-150 rounded-xl p-3 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div>
                      <h4 className="text-slate-800 font-bold text-xs leading-snug line-clamp-1">{q.client_name}</h4>
                      <div className="flex gap-x-3 gap-y-0.5 flex-wrap text-[10px] text-slate-450 font-mono mt-0.5">
                        <span>{q.people_json?.length || 0} Aseg.</span>
                        <span>{q.options_json?.length || 0} Opciones</span>
                        <span>{new Date(q.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => onDeleteSavedQuote(q.id, e)}
                      className="text-slate-400 hover:text-rose-600 p-2 rounded-lg hover:bg-white transition-colors"
                      title="Eliminar registro"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
