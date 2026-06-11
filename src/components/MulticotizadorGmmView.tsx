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
    <span className="relative inline-flex items-center align-middle ml-1 select-none shrink-0 z-10">
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
        <span className="absolute z-[999] bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-60 p-2.5 bg-slate-900 border border-slate-800 text-white text-[10px] font-normal leading-relaxed rounded-xl shadow-2xl font-sans normal-case tracking-normal block text-center">
          <span className="block font-bold text-teal-400 mb-0.5 border-b border-white/10 pb-0.5">{title}</span>
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

  // Grouped coverages list for side-by-side matrix
  const matrixCoverages = [
    { key: 'Gastos de Hospitalización', name: 'Gastos de Hospitalización', desc: 'Habitación, medicamentos, honorarios quirúrgicos dentro del hospital.' },
    { key: 'Honorarios Médicos / Quirúrgicos', name: 'Honorarios Médicos', desc: 'Consultas, cirugías e intervenciones de cirujanos y especialistas.' },
    { key: 'Asistencia en el Extranjero', name: 'Asistencia Médica en Extranjero', desc: 'Apoyo y cobertura en urgencias fuera de México.' },
    { key: 'Cobertura Catastróficas en Extranjero', name: 'Enf. Catastróficas en el Extranjero', desc: 'Atención internacional en hospitales selectos para padecimientos graves.' },
    { key: 'Maternidad', name: 'Auxilio de Maternidad', desc: 'Suma asegurada predefinida para alumbramiento.' },
    { key: 'Medicamentos fuera del hospital', name: 'Medicamentos fuera de Hospital', desc: 'Reembolso o pago directo de fármacos recetados.' },
    { key: 'Eliminación de deducible por accidente', name: 'Eliminación Deducible por Accidente', desc: 'No se paga deducible si deriva de un accidente fortuito.' },
    { key: 'Multirregión', name: 'Multirregión', desc: 'Permite programar cirugías en zonas más caras.' },
    { key: 'Beneficio hospitalario VIP', name: 'Beneficio Hospitalario VIP', desc: 'Comodidades premium durante reclusión.' },
    // Plus de Bupa / Prevention rows
    { key: 'Telemedicina Bupa 24/7', name: 'Telemedicina Bupa 24/7 (Bupa Plus)', desc: 'Consultas ilimitadas de medicina general, nutrición y psicología.' },
    { key: 'Check-up Preventivo Anual', name: 'Check-up Preventivo Anual (Bupa Plus)', desc: 'Estudios de laboratorio básicos o integrales sin costo.' },
    { key: 'Monitoreo de Salud AI (Bupa Vital)', name: 'Monitoreo de Salud AI (Bupa Vital)', desc: 'Signos vitales (presión, estrés, pulso) con la cámara.' },
    { key: 'Segunda Opinión Médica', name: 'Segunda Opinión Médica (Bupa Plus)', desc: 'Acceso a interconsulta con médicos especialistas líderes.' }
  ];

  // Helper inside matrix to determine icon & class
  const getMatrixStatus = (opt: MultiGmmOptionConfig, result: NormalizedResult | null, key: string) => {
    if (!result) return { icon: '—', text: 'No calculado', color: 'text-slate-400' };

    // Common Bupa Plus rows
    if (key === 'Check-up Preventivo Anual') {
      if (result.product_id === 'BXPLUS') return { icon: '⚠️', text: 'No incluido', color: 'text-slate-400' };
      if (result.product_id === 'BNV') return { icon: '✨', text: 'Incluido (Básico)', color: 'text-emerald-600 font-semibold' };
      if (result.product_id === 'BNP') return { icon: '✨', text: 'Incluido (Integral Plus)', color: 'text-indigo-600 font-semibold' };
    }
    if (key === 'Telemedicina Bupa 24/7') {
      if (result.product_id === 'BXPLUS') return { icon: '📞', text: 'Orientación telefónica', color: 'text-slate-500' };
      if (result.product_id === 'BNV') return { icon: '✨', text: 'Incluido (App Bupa)', color: 'text-emerald-600 font-semibold' };
      if (result.product_id === 'BNP') return { icon: '✨', text: 'Incluido (App Bupa Plus)', color: 'text-indigo-600 font-semibold' };
    }
    if (key === 'Monitoreo de Salud AI (Bupa Vital)') {
      if (result.product_id === 'BXPLUS') return { icon: '❌', text: 'No incluido', color: 'text-rose-550' };
      if (result.product_id === 'BNV') return { icon: '✨', text: 'Incluido (Bupa Vital)', color: 'text-emerald-600 font-semibold' };
      if (result.product_id === 'BNP') return { icon: '✨', text: 'Incluido (Bupa Vital)', color: 'text-indigo-600 font-semibold' };
    }
    if (key === 'Segunda Opinión Médica') {
      if (result.product_id === 'BXPLUS') return { icon: '✅', text: 'Nacional preautorizado', color: 'text-slate-550' };
      if (result.product_id === 'BNV') return { icon: '✨', text: 'Incluido Nac/Inter.', color: 'text-emerald-600 font-semibold' };
      if (result.product_id === 'BNP') return { icon: '✨', text: 'Incluido Inter. Premium', color: 'text-indigo-600 font-semibold' };
    }

    if (result.product_id === 'BXPLUS') {
      if (key === 'Gastos de Hospitalización' || key === 'Honorarios Médicos / Quirúrgicos') {
        return { icon: '✅', text: 'Incluido', color: 'text-emerald-600 font-semibold' };
      }
      if (key === 'Medicamentos fuera del hospital') {
        const hasIt = opt.bx_coberturas_opcionales?.includes('Medicamentos fuera del hospital');
        return hasIt 
          ? { icon: '➕', text: 'Contratado', color: 'text-indigo-650 font-semibold' }
          : { icon: '❌', text: 'No contratado', color: 'text-rose-500' };
      }
      if (key === 'Eliminación de deducible por accidente') {
        const hasIt = opt.bx_coberturas_opcionales?.includes('Eliminación deducible por accidente');
        return hasIt 
          ? { icon: '➕', text: 'Contratado', color: 'text-indigo-650 font-semibold' }
          : { icon: '❌', text: 'No contratado', color: 'text-rose-500' };
      }
      if (key === 'Multirregión') {
        const hasIt = opt.bx_coberturas_opcionales?.includes('Multirregión');
        return hasIt 
          ? { icon: '➕', text: 'Contratado', color: 'text-indigo-650 font-semibold' }
          : { icon: '❌', text: 'No contratado', color: 'text-rose-500' };
      }
      if (key === 'Beneficio hospitalario VIP') {
        const hasIt = opt.bx_coberturas_opcionales?.includes('Beneficio hospitalario VIP');
        return hasIt 
          ? { icon: '➕', text: 'Contratado', color: 'text-indigo-650 font-semibold' }
          : { icon: '❌', text: 'No contratado', color: 'text-rose-500' };
      }
      if (key === 'Asistencia en el Extranjero') {
        const hasIt = opt.bx_coberturas_opcionales?.includes('Emergencia médica en el extranjero');
        return hasIt 
          ? { icon: '➕', text: 'Contratado', color: 'text-indigo-650 font-semibold' }
          : { icon: '❌', text: 'No contratado', color: 'text-rose-500' };
      }
      if (key === 'Maternidad') {
        const hasIt = opt.bx_coberturas_opcionales?.includes('Maternidad');
        return hasIt 
          ? { icon: '➕', text: 'Contratado', color: 'text-indigo-650 font-semibold' }
          : { icon: '❌', text: 'No contratado', color: 'text-rose-500' };
      }
      return { icon: '—', text: 'No aplica', color: 'text-slate-400' };
    }

    if (result.product_id === 'BNV') {
      if (key === 'Gastos de Hospitalización' || key === 'Honorarios Médicos / Quirúrgicos') {
        return { icon: '✅', text: 'Incluido', color: 'text-emerald-600 font-semibold' };
      }
      if (key === 'Asistencia en el Extranjero') {
        return opt.bnv_asistencia_extranjero === 'Si'
          ? { icon: '➕', text: 'Contratado', color: 'text-indigo-650 font-semibold' }
          : { icon: '❌', text: 'No contratado', color: 'text-rose-505' };
      }
      if (key === 'Maternidad') {
        const hasIt = opt.bnv_maternidad_titular === 'Si' || opt.bnv_maternidad_conyuge === 'Si';
        return hasIt
          ? { icon: '➕', text: 'Contratado', color: 'text-indigo-650 font-semibold' }
          : { icon: '❌', text: 'No contratado', color: 'text-rose-505' };
      }
      return { icon: '—', text: 'No aplica', color: 'text-slate-400' };
    }

    if (result.product_id === 'BNP') {
      if (key === 'Gastos de Hospitalización' || key === 'Honorarios Médicos / Quirúrgicos') {
        return { icon: '✅', text: 'Incluido', color: 'text-emerald-600 font-semibold' };
      }
      if (key === 'Asistencia en el Extranjero') {
        return opt.bnp_asistencia_extranjero === 'Si'
          ? { icon: '➕', text: 'Contratado', color: 'text-indigo-650 font-semibold' }
          : { icon: '❌', text: 'No contratado', color: 'text-rose-505' };
      }
      if (key === 'Cobertura Catastróficas en Extranjero') {
        return opt.bnp_cobertura_catastrofica_extranjero === 'Si'
          ? { icon: '➕', text: 'Contratado', color: 'text-indigo-650 font-semibold' }
          : { icon: '❌', text: 'No contratado', color: 'text-rose-505' };
      }
      if (key === 'Maternidad') {
        const hasIt = opt.bnp_maternidad_titular === 'Si' || opt.bnp_maternidad_conyuge === 'Si';
        return hasIt
          ? { icon: '➕', text: 'Contratado', color: 'text-indigo-650 font-semibold' }
          : { icon: '❌', text: 'No contratado', color: 'text-rose-505' };
      }
      return { icon: '—', text: 'No aplica', color: 'text-slate-400' };
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
        { id: 'pdf_2', name: 'Laura Gómez', relation: 'Cónyuge', gender: 'Femenino', age: 43 },
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
          bnp_deducible: 35000,
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
    <div className="space-y-6 print:bg-white print:text-black">
      
      {/* 2-Column Responsive Control Center Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* LEFT COLUMN: Census Setup (col-span-4) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Compressed Census Card */}
          <div className="bg-white border border-slate-150 rounded-2xl p-4 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-600" />
                Asegurados de la Póliza
              </h2>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono font-medium">
                {people.length}/5
              </span>
            </div>



            {/* Compact Addition Form */}
            <form onSubmit={handleAddMember} className="space-y-2.5 border-t border-slate-100 pt-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Nombre de Asegurado (Ej. Laura)"
                  className="w-full bg-[#f8f9fa] border border-slate-200 hover:border-slate-350 rounded-xl py-1.5 px-3 text-xs focus:outline-none focus:bg-white text-slate-800"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <select
                    className="w-full bg-[#f8f9fa] border border-slate-200 rounded-xl py-1.5 p-2 text-xs focus:outline-none"
                    value={newMemberRelation}
                    onChange={(e) => setNewMemberRelation(e.target.value as RelationType)}
                  >
                    <option value="Titular">Titular</option>
                    <option value="Cónyuge">Cónyuge</option>
                    <option value="Hij@">Hij@</option>
                    <option value="Dependiente económico">Dep. Económico</option>
                  </select>
                </div>

                {/* Gender pills control (removes select step, fits beautifully) */}
                <div className="grid grid-cols-2 gap-1 bg-slate-100 p-0.5 rounded-xl">
                  {(['Masculino', 'Femenino'] as GenderType[]).map((gender) => {
                    const active = newMemberGender === gender;
                    return (
                      <button
                        type="button"
                        key={gender}
                        onClick={() => setNewMemberGender(gender)}
                        className={`py-1 text-[10px] font-bold rounded-lg transition-all text-center cursor-pointer ${
                          active ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
                        }`}
                      >
                        {gender === 'Masculino' ? 'Masc' : 'Fem'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Age control as tiny numeric and simple button helpers */}
              <div className="flex items-center justify-between gap-2.5 bg-slate-50 p-2 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-sans">Edad del Integrante:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setNewMemberAge(Math.max(0, newMemberAge - 5))}
                    className="w-5 h-5 flex items-center justify-center bg-white border border-slate-200 text-xs font-bold text-slate-600 rounded-md hover:bg-slate-100"
                  >
                    -5
                  </button>
                  <input
                    type="number"
                    min="0"
                    max="95"
                    className="w-10 text-center bg-white border border-slate-250 py-0.5 rounded-md text-xs font-mono font-bold"
                    value={newMemberAge}
                    onChange={(e) => setNewMemberAge(Math.max(0, Math.min(95, Number(e.target.value))))}
                  />
                  <button
                    type="button"
                    onClick={() => setNewMemberAge(Math.min(95, newMemberAge + 5))}
                    className="w-5 h-5 flex items-center justify-center bg-white border border-slate-200 text-xs font-bold text-slate-600 rounded-md hover:bg-slate-100"
                  >
                    +5
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={people.length >= 5}
                className="w-full bg-slate-900 text-white py-1.5 rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Inscribir Asegurado
              </button>
            </form>

            {/* Insured Badges List instead of big spaced list */}
            <div className="border-t border-slate-100 pt-3 space-y-1.5">
              <span className="text-[10px] text-slate-450 font-bold uppercase tracking-widest block font-sans">Grupo Activo ({people.length})</span>
              {people.length === 0 ? (
                <div className="text-center py-5 text-[10.5px] border border-dashed border-slate-200 rounded-xl text-slate-400 italic">
                  No hay asegurados inscritos.
                </div>
              ) : (
                <div className="space-y-1 max-h-[155px] overflow-y-auto pr-0.5">
                  {people.map((p, index) => (
                    <div 
                      key={p.id} 
                      className="bg-[#f8f9fa] hover:bg-slate-100 border border-slate-150 rounded-xl px-2.5 py-1.5 flex items-center justify-between transition-colors text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-800 truncate max-w-[110px]">{p.name}</span>
                          <span className="text-[8.5px] bg-white border border-slate-200 text-slate-500 px-1 py-0.2 rounded font-mono">
                            {p.relation === 'Dependiente económico' ? 'Dep' : p.relation}
                          </span>
                        </div>
                        <p className="text-[9.5px] text-slate-450 mt-0.5">{p.gender === 'Masculino' ? 'M' : 'F'} • {p.age} años</p>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(p.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Consolidated Max Age Warning */}
            {people.length > 0 && (
              <div className="bg-slate-50 text-slate-600 border border-slate-200 rounded-xl p-2 text-[10px] font-medium flex items-start gap-1 leading-relaxed">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Límite:</strong> Edad censo máx. <strong>{Math.max(...people.map(p => p.age))} años</strong>.
                </span>
              </div>
            )}
          </div>

          {/* Compact Payment Frequencies selection bar */}
          <div className="bg-white border border-slate-150 rounded-2xl p-4 shadow-sm space-y-2">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 font-sans">
              <CheckSquare className="w-4 h-4 text-emerald-600" />
              Formas de Pago Comparadas
            </h3>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {(['Anual', 'Semestral', 'Trimestral', 'Mensual'] as FormaPago[]).map((forma) => {
                const checked = selectedFormasPago.includes(forma);
                return (
                  <button
                    type="button"
                    key={forma}
                    onClick={() => {
                      if (checked) {
                        if (selectedFormasPago.length > 1) {
                          setSelectedFormasPago(selectedFormasPago.filter(f => f !== forma));
                        }
                      } else {
                        setSelectedFormasPago([...selectedFormasPago, forma]);
                      }
                    }}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-all flex items-center gap-1 cursor-pointer select-none ${
                      checked
                        ? 'bg-emerald-5 border-emerald-500 text-emerald-805 shadow-sm'
                        : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-550'
                    }`}
                  >
                    <Check className={`w-3.5 h-3.5 text-emerald-605 ${checked ? 'opacity-100' : 'opacity-0'}`} />
                    {forma}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Comparative Settings & Option grids (col-span-8) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Deck Header Container */}
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-slate-500" />
              Configurar Ofertas de GMM
            </h2>

            <button
              onClick={handleAddOption}
              disabled={multicotiOptions.length >= 3}
              className="text-xs font-bold bg-slate-900 text-white rounded-xl px-3 py-1.5 hover:bg-slate-800 flex items-center gap-1 shadow-sm transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus className="w-3.5 h-3.5" />
              Agregar Opción
            </button>
          </div>

          {/* Grid Layout of Comparative Products */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {multicotiOptions.map((opt, optIndex) => {
              const hasError = !!multicotiErrors[opt.id];
              const freqResults = multicotiResultsByFreq[opt.id] || {};
              const resultData = Object.values(freqResults)[0] || null;

              return (
                <div 
                  key={opt.id} 
                  className="bg-white border border-slate-150 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all relative"
                >
                  {/* Dense unified Card Header */}
                  <div className="bg-slate-50 border-b border-slate-150 px-3.5 py-2 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 font-mono">
                      OPCIÓN #{optIndex + 1}
                    </span>

                    {multicotiOptions.length > 1 && (
                      <button
                        onClick={() => handleRemoveOption(opt.id)}
                        className="text-slate-400 hover:text-rose-600 p-0.5 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Eliminar opción"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Dense select options inside option card */}
                  <div className="p-3.5 space-y-3.5 flex-grow font-sans text-xs">
                    
                    {/* Carrier Segmented Switch Action (Zero-Clicks compared to drop-downs) */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Aseguradora / Plan</label>
                      <div className="grid grid-cols-3 gap-0.5 bg-slate-100 p-0.5 rounded-lg">
                        {(['BXPLUS', 'BNV', 'BNP'] as const).map((pid) => {
                          const isSel = opt.product_id === pid;
                          return (
                            <button
                              key={pid}
                              type="button"
                              onClick={() => handleOptionProductChange(optIndex, pid)}
                              className={`py-1 text-[10px] font-bold rounded-md transition-all text-center cursor-pointer ${
                                isSel 
                                  ? 'bg-white text-slate-900 shadow-sm' 
                                  : 'text-slate-500 hover:text-slate-805'
                              }`}
                            >
                              {pid === 'BXPLUS' ? 'BX+' : pid === 'BNV' ? 'BNV' : 'BNP'}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <hr className="border-slate-100" />

                    {/* BX+ INPUT CONTROLS */}
                    {opt.product_id === 'BXPLUS' && (
                      <div className="space-y-2.5">
                        
                        {/* 2-Column small Grid for Dropdowns */}
                        <div className="grid grid-cols-2 gap-2">
                          
                          <div className="space-y-0.5">
                            <label className="text-[9px] font-bold text-slate-450 uppercase flex items-center">
                              Geografía
                              <HelpTooltip text={HELP_TEXTS.bx_zona.desc} title={HELP_TEXTS.bx_zona.title} />
                            </label>
                            <div className="relative">
                              <select
                                className="w-full bg-white border border-slate-200 text-slate-805 text-[10.5px] rounded-lg py-1 px-1.5 appearance-none"
                                value={opt.bx_zona}
                                onChange={(e) => handleUpdateOptionField(optIndex, 'bx_zona', e.target.value)}
                              >
                                <option value="Zona Metropolitana">Metro (CDMX)</option>
                                <option value="Zona Central">Centro/Occid</option>
                                <option value="Resto de la República">Provincia</option>
                              </select>
                              <ChevronDown className="w-3 h-3 absolute right-1.5 top-1.5 text-slate-400 pointer-events-none" />
                            </div>
                          </div>

                          <div className="space-y-0.5">
                            <label className="text-[9px] font-bold text-slate-450 uppercase flex items-center">
                              Red Hosp.
                              <HelpTooltip text={HELP_TEXTS.bx_nivel_hospitalario.desc} title={HELP_TEXTS.bx_nivel_hospitalario.title} />
                            </label>
                            <div className="relative">
                              <select
                                className="w-full bg-white border border-slate-200 text-slate-805 text-[10.5px] rounded-lg py-1 px-1.5 appearance-none"
                                value={opt.bx_nivel_hospitalario}
                                onChange={(e) => handleUpdateOptionField(optIndex, 'bx_nivel_hospitalario', e.target.value)}
                              >
                                <option value="Diamante">Diamante</option>
                                <option value="Rubí">Rubí (Prem)</option>
                                <option value="Zafiro">Zafiro (Int)</option>
                                <option value="Esmeralda">Esmeralda</option>
                              </select>
                              <ChevronDown className="w-3 h-3 absolute right-1.5 top-1.5 text-slate-400 pointer-events-none" />
                            </div>
                          </div>

                          <div className="space-y-0.5">
                            <label className="text-[9px] font-bold text-slate-450 uppercase flex items-center">
                              Tab. Quirúr.
                              <HelpTooltip text={HELP_TEXTS.bx_tabulador.desc} title={HELP_TEXTS.bx_tabulador.title} />
                            </label>
                            <div className="relative">
                              <select
                                className="w-full bg-white border border-slate-200 text-slate-805 text-[10.5px] rounded-lg py-1 px-1.5 appearance-none"
                                value={opt.bx_tabulador}
                                onChange={(e) => handleUpdateOptionField(optIndex, 'bx_tabulador', e.target.value)}
                              >
                                <option value="Médico Premium">Méd. Premium</option>
                                <option value="Médico 3">Tabular 3</option>
                                <option value="Médico 2">Tabular 2</option>
                                <option value="Médico 1">Tabular 1</option>
                              </select>
                              <ChevronDown className="w-3 h-3 absolute right-1.5 top-1.5 text-slate-400 pointer-events-none" />
                            </div>
                          </div>

                          <div className="space-y-0.5">
                            <label className="text-[9px] font-bold text-slate-455 uppercase flex items-center">
                              Suma Aseg.
                              <HelpTooltip text={HELP_TEXTS.bx_suma_asegurada.desc} title={HELP_TEXTS.bx_suma_asegurada.title} />
                            </label>
                            <div className="relative">
                              <select
                                className="w-full bg-white border border-slate-200 text-slate-805 text-[10.5px] rounded-lg py-1 px-1.5 appearance-none font-mono"
                                value={opt.bx_suma_asegurada}
                                onChange={(e) => handleUpdateOptionField(optIndex, 'bx_suma_asegurada', Number(e.target.value))}
                              >
                                <option value={2000000}>$2M MXN</option>
                                <option value={5000000}>$5M MXN</option>
                                <option value={10000000}>$10M MXN</option>
                                <option value={50000000}>$50M MXN</option>
                              </select>
                              <ChevronDown className="w-3 h-3 absolute right-1.5 top-1.5 text-slate-400 pointer-events-none" />
                            </div>
                          </div>

                          <div className="space-y-0.5">
                            <label className="text-[9px] font-bold text-slate-455 uppercase flex items-center">
                              Deducible
                              <HelpTooltip text={HELP_TEXTS.bx_deducible.desc} title={HELP_TEXTS.bx_deducible.title} />
                            </label>
                            <div className="relative">
                              <select
                                className="w-full bg-white border border-slate-200 text-slate-805 text-[10.5px] rounded-lg py-1 px-1.5 appearance-none font-mono"
                                value={opt.bx_deducible}
                                onChange={(e) => handleUpdateOptionField(optIndex, 'bx_deducible', Number(e.target.value))}
                              >
                                <option value={15000}>$15k MXN</option>
                                <option value={30000}>$30k MXN</option>
                                <option value={50000}>$50k MXN</option>
                                <option value={100000}>$100k MXN</option>
                              </select>
                              <ChevronDown className="w-3 h-3 absolute right-1.5 top-1.5 text-slate-400 pointer-events-none" />
                            </div>
                          </div>

                          <div className="space-y-0.5">
                            <label className="text-[9px] font-bold text-slate-455 uppercase flex items-center">
                              Coaseguro
                              <HelpTooltip text={HELP_TEXTS.bx_coaseguro.desc} title={HELP_TEXTS.bx_coaseguro.title} />
                            </label>
                            <div className="relative">
                              <select
                                className="w-full bg-white border border-slate-200 text-slate-805 text-[10.5px] rounded-lg py-1 px-1.5 appearance-none font-mono"
                                value={opt.bx_coaseguro}
                                onChange={(e) => handleUpdateOptionField(optIndex, 'bx_coaseguro', Number(e.target.value))}
                              >
                                <option value={0}>0%</option>
                                <option value={10}>10%</option>
                                <option value={20}>20%</option>
                              </select>
                              <ChevronDown className="w-3 h-3 absolute right-1.5 top-1.5 text-slate-400 pointer-events-none" />
                            </div>
                          </div>
                        </div>

                        {/* Opcionales panel */}
                        <div className="space-y-1 pt-1.5 border-t border-slate-100">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Opcionales BX+</span>
                          <div className="bg-slate-50 border border-slate-150 rounded-xl p-2 max-h-[110px] overflow-y-auto space-y-1 text-[10.5px]">
                            {Object.keys(BXPLUS_COVERAGES_INFO).map((covName) => {
                              const isChecked = opt.bx_coberturas_opcionales?.includes(covName) ?? false;
                              return (
                                <label key={covName} className="flex items-center justify-between gap-1.5 cursor-pointer hover:bg-slate-105 p-0.5 rounded transition-colors select-none w-full">
                                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                    <input
                                      type="checkbox"
                                      className="w-3 h-3 accent-slate-900 shrink-0"
                                      checked={isChecked}
                                      onChange={() => handleToggleBxCoverage(optIndex, covName)}
                                    />
                                    <span className={`text-[10px] truncate ${isChecked ? 'font-semibold text-slate-800' : 'text-slate-500'}`}>
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

                    {/* BNV INPUT CONTROLS */}
                    {opt.product_id === 'BNV' && (
                      <div className="space-y-2.5">
                        
                        {/* 2-Column grid */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-0.5">
                            <label className="text-[9px] font-bold text-slate-450 uppercase flex items-center">
                              Geografía
                              <HelpTooltip text={HELP_TEXTS.bnv_zona.desc} title={HELP_TEXTS.bnv_zona.title} />
                            </label>
                            <div className="relative">
                              <select
                                className="w-full bg-white border border-slate-200 text-slate-805 text-[10.5px] rounded-lg py-1 px-1.5 appearance-none"
                                value={opt.bnv_zona}
                                onChange={(e) => handleUpdateOptionField(optIndex, 'bnv_zona', e.target.value)}
                              >
                                <option value="Zona 1">Zona 1 (Metro/MTY)</option>
                                <option value="Zona 2">Zona 2 (Exterior)</option>
                              </select>
                              <ChevronDown className="w-3 h-3 absolute right-1.5 top-1.5 text-slate-400 pointer-events-none" />
                            </div>
                          </div>

                          <div className="space-y-0.5">
                            <label className="text-[9px] font-bold text-slate-450 uppercase flex items-center">
                              Descuento
                              <HelpTooltip text={HELP_TEXTS.bnv_tipo_cliente.desc} title={HELP_TEXTS.bnv_tipo_cliente.title} />
                            </label>
                            <div className="relative">
                              <select
                                className="w-full bg-white border border-slate-200 text-slate-805 text-[10.5px] rounded-lg py-1 px-1.5 appearance-none"
                                value={opt.bnv_tipo_cliente}
                                onChange={(e) => handleUpdateOptionField(optIndex, 'bnv_tipo_cliente', e.target.value)}
                              >
                                {activePackage?.client_types?.map(c => {
                                  const factorPercent = Math.round((1 - c.discount_factor) * 100);
                                  return (
                                    <option key={c.client_type} value={c.client_type}>
                                      {c.client_type.split(' ')[0]} {factorPercent > 0 ? `(-${factorPercent}%)` : ''}
                                    </option>
                                  );
                                })}
                              </select>
                              <ChevronDown className="w-3 h-3 absolute right-1.5 top-1.5 text-slate-400 pointer-events-none" />
                            </div>
                          </div>

                          <div className="space-y-0.5">
                            <label className="text-[9px] font-bold text-slate-455 uppercase flex items-center">
                              Suma Aseg.
                              <HelpTooltip text={HELP_TEXTS.bnv_suma_asegurada.desc} title={HELP_TEXTS.bnv_suma_asegurada.title} />
                            </label>
                            <div className="relative">
                              <select
                                className="w-full bg-white border border-slate-200 text-slate-805 text-[10.5px] rounded-lg py-1 px-1.5 appearance-none font-mono"
                                value={opt.bnv_suma_asegurada}
                                onChange={(e) => handleUpdateOptionField(optIndex, 'bnv_suma_asegurada', Number(e.target.value))}
                              >
                                {activePackage?.sumas_aseguradas?.map(sa => (
                                  <option key={sa} value={sa}>
                                    ${(sa / 1000000).toLocaleString()}M MXN
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="w-3 h-3 absolute right-1.5 top-1.5 text-slate-400 pointer-events-none" />
                            </div>
                          </div>

                          <div className="space-y-0.5">
                            <label className="text-[9px] font-bold text-slate-455 uppercase flex items-center">
                              Deducible
                              <HelpTooltip text={HELP_TEXTS.bnv_deducible.desc} title={HELP_TEXTS.bnv_deducible.title} />
                            </label>
                            <div className="relative">
                              <select
                                className="w-full bg-white border border-slate-200 text-slate-805 text-[10.5px] rounded-lg py-1 px-1.5 appearance-none font-mono"
                                value={opt.bnv_deducible}
                                onChange={(e) => handleUpdateOptionField(optIndex, 'bnv_deducible', Number(e.target.value))}
                              >
                                {activePackage?.deducibles?.map(d => (
                                  <option key={d} value={d}>
                                    ${(d / 1000).toLocaleString()}k MXN
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="w-3 h-3 absolute right-1.5 top-1.5 text-slate-400 pointer-events-none" />
                            </div>
                          </div>

                          <div className="space-y-0.5">
                            <label className="text-[9px] font-bold text-slate-455 uppercase flex items-center">
                              Coaseguro
                              <HelpTooltip text={HELP_TEXTS.bnv_coaseguro.desc} title={HELP_TEXTS.bnv_coaseguro.title} />
                            </label>
                            <div className="relative">
                              <select
                                className="w-full bg-white border border-slate-200 text-slate-805 text-[10.5px] rounded-lg py-1 px-1.5 appearance-none font-mono"
                                value={opt.bnv_coaseguro}
                                onChange={(e) => handleUpdateOptionField(optIndex, 'bnv_coaseguro', Number(e.target.value))}
                              >
                                {activePackage?.coaseguros?.map(c => (
                                  <option key={c} value={c}>{c}%</option>
                                ))}
                              </select>
                              <ChevronDown className="w-3 h-3 absolute right-1.5 top-1.5 text-slate-400 pointer-events-none" />
                            </div>
                          </div>

                          <div className="space-y-0.5">
                            <label className="text-[9px] font-bold text-slate-455 uppercase flex items-center">
                              Tope Coas.
                              <HelpTooltip text={HELP_TEXTS.bnv_tope_coaseguro.desc} title={HELP_TEXTS.bnv_tope_coaseguro.title} />
                            </label>
                            <div className="relative">
                              <select
                                className="w-full bg-white border border-slate-200 text-slate-805 text-[10.5px] rounded-lg py-1 px-1.5 appearance-none"
                                value={opt.bnv_tope_coaseguro}
                                onChange={(e) => handleUpdateOptionField(optIndex, 'bnv_tope_coaseguro', Number(e.target.value))}
                              >
                                {activePackage?.topes_coaseguro?.map(t => (
                                  <option key={t} value={t}>
                                    {t === 0 ? 'Sin Tope' : `$${(t / 1000).toLocaleString()}k`}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="w-3 h-3 absolute right-1.5 top-1.5 text-slate-400 pointer-events-none" />
                            </div>
                          </div>
                        </div>

                        {/* Extra BNV parameter rows */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                          <div className="space-y-0.5">
                            <label className="text-[8.5px] font-bold text-slate-400 uppercase flex items-center">
                              Asist. Extr.
                              <HelpTooltip text={HELP_TEXTS.bnv_asistencia_extranjero.desc} title={HELP_TEXTS.bnv_asistencia_extranjero.title} />
                            </label>
                            <select
                              className="w-full bg-slate-50 border border-slate-200 text-[10px] rounded-lg p-1 font-semibold"
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

                    {/* BNP INPUT CONTROLS */}
                    {opt.product_id === 'BNP' && (
                      <div className="space-y-2.5">
                        
                        {/* 2-Column grid */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-0.5">
                            <label className="text-[9px] font-bold text-slate-450 uppercase flex items-center">
                              Geografía
                              <HelpTooltip text={HELP_TEXTS.bnp_zona.desc} title={HELP_TEXTS.bnp_zona.title} />
                            </label>
                            <div className="relative">
                              <select
                                className="w-full bg-white border border-slate-200 text-slate-805 text-[10.5px] rounded-lg py-1 px-1.5 appearance-none"
                                value={opt.bnp_zona}
                                onChange={(e) => handleUpdateOptionField(optIndex, 'bnp_zona', e.target.value)}
                              >
                                <option value="Zona 1">Zona 1 (Metro/MTY)</option>
                                <option value="Zona 2">Zona 2 (Exterior)</option>
                              </select>
                              <ChevronDown className="w-3 h-3 absolute right-1.5 top-1.5 text-slate-400 pointer-events-none" />
                            </div>
                          </div>

                          <div className="space-y-0.5">
                            <label className="text-[9px] font-bold text-slate-450 uppercase flex items-center">
                              Descuento
                              <HelpTooltip text={HELP_TEXTS.bnp_tipo_cliente.desc} title={HELP_TEXTS.bnp_tipo_cliente.title} />
                            </label>
                            <div className="relative">
                              <select
                                className="w-full bg-white border border-slate-200 text-slate-805 text-[10.5px] rounded-lg py-1 px-1.5 appearance-none"
                                value={opt.bnp_tipo_cliente}
                                onChange={(e) => handleUpdateOptionField(optIndex, 'bnp_tipo_cliente', e.target.value)}
                              >
                                {activeBnpPackage?.client_types?.map(c => {
                                  const factorPercent = Math.round((1 - c.discount_factor) * 100);
                                  return (
                                    <option key={c.client_type} value={c.client_type}>
                                      {c.client_type.split(' ')[0]} {factorPercent > 0 ? `(-${factorPercent}%)` : ''}
                                    </option>
                                  );
                                })}
                              </select>
                              <ChevronDown className="w-3 h-3 absolute right-1.5 top-1.5 text-slate-400 pointer-events-none relative" />
                            </div>
                          </div>

                          <div className="space-y-0.5">
                            <label className="text-[9px] font-bold text-slate-455 uppercase flex items-center">
                              Suma Aseg.
                              <HelpTooltip text={HELP_TEXTS.bnp_suma_asegurada.desc} title={HELP_TEXTS.bnp_suma_asegurada.title} />
                            </label>
                            <div className="relative">
                              <select
                                className="w-full bg-white border border-slate-200 text-slate-805 text-[10.5px] rounded-lg py-1 px-1.5 appearance-none font-mono"
                                value={opt.bnp_suma_asegurada}
                                onChange={(e) => handleUpdateOptionField(optIndex, 'bnp_suma_asegurada', Number(e.target.value))}
                              >
                                {activeBnpPackage?.sumas_aseguradas?.map(sa => (
                                  <option key={sa} value={sa}>
                                    ${(sa / 1000000).toLocaleString()}M MXN
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="w-3 h-3 absolute right-1.5 top-1.5 text-slate-400 pointer-events-none" />
                            </div>
                          </div>

                          <div className="space-y-0.5">
                            <label className="text-[9px] font-bold text-slate-455 uppercase flex items-center">
                              Deducible
                              <HelpTooltip text={HELP_TEXTS.bnp_deducible.desc} title={HELP_TEXTS.bnp_deducible.title} />
                            </label>
                            <div className="relative">
                              <select
                                className="w-full bg-white border border-slate-200 text-slate-805 text-[10.5px] rounded-lg py-1 px-1.5 appearance-none font-mono"
                                value={opt.bnp_deducible}
                                onChange={(e) => handleUpdateOptionField(optIndex, 'bnp_deducible', Number(e.target.value))}
                              >
                                {activeBnpPackage?.deducibles?.map(d => (
                                  <option key={d} value={d}>
                                    ${(d / 1000).toLocaleString()}k MXN
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="w-3 h-3 absolute right-1.5 top-1.5 text-slate-400 pointer-events-none" />
                            </div>
                          </div>

                          <div className="space-y-0.5">
                            <label className="text-[9px] font-bold text-slate-455 uppercase flex items-center">
                              Coaseguro
                              <HelpTooltip text={HELP_TEXTS.bnp_coaseguro.desc} title={HELP_TEXTS.bnp_coaseguro.title} />
                            </label>
                            <div className="relative">
                              <select
                                className="w-full bg-white border border-slate-200 text-slate-805 text-[10.5px] rounded-lg py-1 px-1.5 appearance-none font-mono"
                                value={opt.bnp_coaseguro}
                                onChange={(e) => handleUpdateOptionField(optIndex, 'bnp_coaseguro', Number(e.target.value))}
                              >
                                {activeBnpPackage?.coaseguros?.map(c => (
                                  <option key={c} value={c}>{c}%</option>
                                ))}
                              </select>
                              <ChevronDown className="w-3 h-3 absolute right-1.5 top-1.5 text-slate-400 pointer-events-none" />
                            </div>
                          </div>

                          <div className="space-y-0.5">
                            <label className="text-[9px] font-bold text-slate-455 uppercase flex items-center">
                              CEE Extr.
                              <HelpTooltip text={HELP_TEXTS.bnp_cobertura_catastrofica_extranjero.desc} title={HELP_TEXTS.bnp_cobertura_catastrofica_extranjero.title} />
                            </label>
                            <select
                              className="w-full bg-white border border-slate-200 text-slate-805 text-[10.5px] rounded-lg py-1 px-1.5 appearance-none font-sans"
                              value={opt.bnp_cobertura_catastrofica_extranjero}
                              onChange={(e) => handleUpdateOptionField(optIndex, 'bnp_cobertura_catastrofica_extranjero', e.target.value)}
                            >
                              <option value="Si">Si (CEE)</option>
                              <option value="No">No ($0)</option>
                            </select>
                          </div>
                        </div>

                        {/* Extra BNP Parameters list */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                          <div className="space-y-0.5">
                            <label className="text-[8.5px] font-bold text-slate-400 uppercase flex items-center">
                              Asist. Extr.
                              <HelpTooltip text={HELP_TEXTS.bnp_asistencia_extranjero.desc} title={HELP_TEXTS.bnp_asistencia_extranjero.title} />
                            </label>
                            <select
                              className="w-full bg-slate-50 border border-slate-200 text-[10px] rounded-lg p-1 font-semibold"
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

                  {/* Elegant High-End Bupa Plus row badge (Ultra Compacted block) */}
                  {(opt.product_id === 'BNV' || opt.product_id === 'BNP') && (
                    <div className="mx-3.5 mb-2.5 p-2 bg-gradient-to-r from-emerald-50/50 to-teal-50/20 border border-emerald-100 rounded-xl space-y-0.5 text-[10px] text-slate-600">
                      <div className="flex items-center gap-1 text-emerald-800 font-bold text-[9.5px]">
                        <Gift className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Soporte Plus de Bupa Incluido</span>
                      </div>
                      <p className="text-[9px] text-slate-500 font-sans leading-normal">
                        📞 Telemedicina 24/7 • 🧪 Check-up Anual • 🤳 Signos AI • 🌍 2da Opinión
                      </p>
                    </div>
                  )}

                  {/* Pricing / Loading Feedback Drawer */}
                  <div className="border-t border-slate-150 p-3 bg-slate-50 space-y-1.5">
                    {hasError ? (
                      <div className="bg-rose-50 border border-rose-150 rounded-lg p-2.5 text-rose-800 text-[10px] flex gap-1 items-start">
                        <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span className="leading-snug">{multicotiErrors[opt.id]}</span>
                      </div>
                    ) : Object.keys(freqResults).length > 0 ? (
                      <div className="space-y-1.5 last:space-y-0 text-left">
                        {selectedFormasPago.map((forma) => {
                          const result = freqResults[forma];
                          if (!result) return null;
                          return (
                            <div key={forma} className="flex justify-between items-center text-[10px] pb-1 last:pb-0 border-b border-dashed border-slate-200 last:border-none">
                              <span className="font-bold text-slate-500 uppercase tracking-wide text-[9px]">{forma}</span>
                              <span className="font-bold font-mono text-emerald-600 text-xs text-right">
                                ${result.totals.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-2 text-[10px] font-mono text-slate-400">
                        Censo vacío. Agrega integrantes.
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* MATRIX: Bottom full-width comparison matrix */}
      {people.length > 0 && (
        <div className="bg-white border border-slate-150 rounded-2xl overflow-hidden shadow-sm p-5 print:border-none print:shadow-none">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="flex items-center justify-center bg-emerald-50 text-emerald-700 w-5 h-5 rounded-full font-bold text-[11px] font-mono">
                  3
                </span>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <ClipboardList className="w-4 h-4 text-slate-500" />
                  Matriz de Comparación Side-by-Side GMM
                </h2>
              </div>
              <p className="text-[11px] text-slate-450 mt-0.5">
                Primas netas homologadas, recargos y coberturas contractuales oficiales 2026.
              </p>
            </div>

            <button
              onClick={() => window.print()}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3 py-1.5 rounded-xl transition-all border border-slate-300 flex items-center gap-1 shadow-sm cursor-pointer self-start sm:self-auto"
            >
              <Printer className="w-3.5 h-3.5 text-slate-650" />
              Imprimir / PDF
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-100 rounded-xl relative">
            <table className="w-full min-w-[700px] border-collapse text-left font-sans text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-150">
                  <th className="p-3 font-bold text-slate-450 uppercase tracking-wider text-[9px] w-[30%]">Concepto General</th>
                  {multicotiOptions.map((opt, oIdx) => (
                    <th key={opt.id} className="p-3 font-bold font-display text-slate-800 text-xs border-l border-slate-150">
                      Opción #{oIdx + 1}: {opt.product_id === 'BXPLUS' ? 'BX+ Únikuz' : opt.product_id === 'BNV' ? 'Bupa Vital (BNV)' : 'Bupa Plus (BNP)'}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150/50">
                
                {/* Geografía */}
                <tr>
                  <td className="p-3 font-semibold text-slate-500 uppercase font-mono text-[8.5px] bg-slate-50/20">Zona / Red Hosp.</td>
                  {multicotiOptions.map((opt, oIdx) => {
                    const result = multicotiResultsByFreq[opt.id]?.[selectedFormasPago[0]];
                    return (
                      <td key={opt.id} className="p-3 font-semibold text-slate-800 border-l border-slate-150">
                        {result?.plan_summary ? `${result.plan_summary.zona}` : 'No calculado'}
                      </td>
                    );
                  })}
                </tr>

                {/* Suma Asegurada */}
                <tr>
                  <td className="p-3 font-semibold text-slate-500 uppercase font-mono text-[8.5px] bg-slate-50/20">Suma Asegurada</td>
                  {multicotiOptions.map((opt, oIdx) => {
                    const result = multicotiResultsByFreq[opt.id]?.[selectedFormasPago[0]];
                    return (
                      <td key={opt.id} className="p-3 font-bold text-slate-800 border-l border-slate-150 font-mono">
                        {result?.plan_summary ? `$${(result.plan_summary.suma_asegurada).toLocaleString()} MXN` : 'No calculado'}
                      </td>
                    );
                  })}
                </tr>

                {/* Deducible */}
                <tr>
                  <td className="p-3 font-semibold text-slate-500 uppercase font-mono text-[8.5px] bg-slate-50/20">Deducible Contratado</td>
                  {multicotiOptions.map((opt, oIdx) => {
                    const result = multicotiResultsByFreq[opt.id]?.[selectedFormasPago[0]];
                    return (
                      <td key={opt.id} className="p-3 font-bold text-slate-800 border-l border-slate-150 font-mono">
                        {result?.plan_summary ? `$${result.plan_summary.deducible.toLocaleString()} MXN` : 'No calculado'}
                      </td>
                    );
                  })}
                </tr>

                {/* Coaseguro */}
                <tr>
                  <td className="p-3 font-semibold text-slate-500 uppercase font-mono text-[8.5px] bg-slate-50/20">Coaseguro (%)</td>
                  {multicotiOptions.map((opt, oIdx) => {
                    const result = multicotiResultsByFreq[opt.id]?.[selectedFormasPago[0]];
                    return (
                      <td key={opt.id} className="p-3 font-semibold text-slate-800 border-l border-slate-150 font-mono">
                        {result?.plan_summary ? `${result.plan_summary.coaseguro}%` : 'No calculado'}
                      </td>
                    );
                  })}
                </tr>

                {/* Tope Coaseguro */}
                <tr>
                  <td className="p-3 font-semibold text-slate-500 uppercase font-mono text-[8.5px] bg-slate-50/20">Tope de Coaseguro</td>
                  {multicotiOptions.map((opt, oIdx) => {
                    const result = multicotiResultsByFreq[opt.id]?.[selectedFormasPago[0]];
                    if (!result?.plan_summary) return <td key={opt.id} className="p-3 text-slate-400 border-l border-slate-150">—</td>;
                    return (
                      <td key={opt.id} className="p-3 font-semibold text-slate-800 border-l border-slate-150 font-mono">
                        {result.plan_summary.tope_coaseguro > 0 
                          ? `$${result.plan_summary.tope_coaseguro.toLocaleString()} MXN` 
                          : result.product_id === 'BNP' ? 'Sin Tope (Ilid.)' : 'Sin Tope'}
                      </td>
                    );
                  })}
                </tr>

                {/* FINANCIAL DESGOLSE */}
                <tr className="bg-slate-100/60">
                  <td colSpan={multicotiOptions.length + 1} className="p-2 font-bold text-slate-700 text-[9.5px] uppercase tracking-wide">
                    Desglose de Costos por Frecuencia elegida
                  </td>
                </tr>

                {selectedFormasPago.map((forma) => {
                  return (
                    <React.Fragment key={forma}>
                      {/* Costo Total header for payment frequency */}
                      <tr className="bg-emerald-50/20">
                        <td className="p-3 text-emerald-900 font-bold pl-4">Costo por Recibo ({forma}):</td>
                        {multicotiOptions.map((opt, oIdx) => {
                          const result = multicotiResultsByFreq[opt.id]?.[forma];
                          return (
                            <td key={opt.id} className="p-3 font-bold border-l border-slate-150 text-emerald-805 font-mono text-xs bg-emerald-50/40">
                              {result ? `$${result.totals.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}` : '—'}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Primer Pago */}
                      <tr>
                        <td className="p-2.5 text-slate-500 pl-5">Primer Recibo (Inicial):</td>
                        {multicotiOptions.map((opt, oIdx) => {
                          const result = multicotiResultsByFreq[opt.id]?.[forma];
                          return (
                            <td key={opt.id} className="p-2.5 font-bold text-slate-800 border-l border-slate-150 font-mono">
                              {result ? `$${result.totals.primer_pago.toLocaleString('es-MX', { minimumFractionDigits: 2 })}` : '—'}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Subsecuentes */}
                      <tr>
                        <td className="p-2.5 text-slate-500 pl-5">Pagos Subsecuentes:</td>
                        {multicotiOptions.map((opt, oIdx) => {
                          const result = multicotiResultsByFreq[opt.id]?.[forma];
                          if (!result) return <td key={opt.id} className="p-2.5 text-slate-400 border-l border-slate-150 font-mono">—</td>;
                          const hasSubsecuentes = result.totals.pagos_subsecuentes > 0;
                          return (
                            <td key={opt.id} className="p-2.5 font-mono text-slate-700 border-l border-slate-150">
                              {hasSubsecuentes 
                                ? `${result.totals.numero_recibos - 1} de $${result.totals.pagos_subsecuentes.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
                                : 'No aplica (Total)'}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Detail costs (compact rows inside matrix) */}
                      <tr className="opacity-60 text-[10px]">
                        <td className="p-1.5 text-slate-450 pl-6">Prima Neta:</td>
                        {multicotiOptions.map((opt, oIdx) => {
                          const result = multicotiResultsByFreq[opt.id]?.[forma];
                          return (
                            <td key={opt.id} className="p-1.5 font-mono text-slate-600 border-l border-slate-150">
                              {result ? `$${result.totals.prima_neta.toLocaleString('es-MX', { minimumFractionDigits: 2 })}` : '—'}
                            </td>
                          );
                        })}
                      </tr>

                      <tr className="opacity-60 text-[10px]">
                        <td className="p-1.5 text-slate-450 pl-6">Recargo Financiero:</td>
                        {multicotiOptions.map((opt, oIdx) => {
                          const result = multicotiResultsByFreq[opt.id]?.[forma];
                          return (
                            <td key={opt.id} className="p-1.5 font-mono text-slate-600 border-l border-slate-150">
                              {result && result.totals.recargo_pago > 0 
                                ? `+$${result.totals.recargo_pago.toLocaleString('es-MX', { minimumFractionDigits: 2 })}` 
                                : '$0.00'}
                            </td>
                          );
                        })}
                      </tr>

                      <tr className="opacity-60 text-[10px]">
                        <td className="p-1.5 text-slate-450 pl-6">Derechos de Póliza:</td>
                        {multicotiOptions.map((opt, oIdx) => {
                          const result = multicotiResultsByFreq[opt.id]?.[forma];
                          return (
                            <td key={opt.id} className="p-1.5 font-mono text-slate-600 border-l border-slate-150">
                              {result ? `+$${result.totals.derecho_poliza.toLocaleString('es-MX', { minimumFractionDigits: 2 })}` : '—'}
                            </td>
                          );
                        })}
                      </tr>

                      <tr className="opacity-60 text-[10px] border-b border-slate-150">
                        <td className="p-1.5 text-slate-450 pl-6">IVA (16%):</td>
                        {multicotiOptions.map((opt, oIdx) => {
                          const result = multicotiResultsByFreq[opt.id]?.[forma];
                          return (
                            <td key={opt.id} className="p-1.5 font-mono text-slate-600 border-l border-slate-150">
                              {result ? `+$${result.totals.iva.toLocaleString('es-MX', { minimumFractionDigits: 2 })}` : '—'}
                            </td>
                          );
                        })}
                      </tr>
                    </React.Fragment>
                  );
                })}

                {/* Coverages comparative header */}
                <tr className="bg-slate-100/60">
                  <td colSpan={multicotiOptions.length + 1} className="p-2 font-bold text-slate-700 text-[9.5px] uppercase tracking-wide">
                    Cuadro Comparativo de Coberturas GMM
                  </td>
                </tr>

                {/* Coverage grid rows */}
                {matrixCoverages.map((cov) => (
                  <tr key={cov.key} className="hover:bg-slate-50/50">
                    <td className="p-3">
                      <div className="font-semibold text-slate-800 leading-snug">{cov.name}</div>
                      <div className="text-[10px] text-slate-450 mt-0.5 leading-normal">{cov.desc}</div>
                    </td>
                    {multicotiOptions.map((opt, oIdx) => {
                      const result = multicotiResultsByFreq[opt.id]?.[selectedFormasPago[0]];
                      const status = getMatrixStatus(opt, result, cov.key);
                      return (
                        <td key={opt.id} className="p-3 border-l border-slate-150 bg-white">
                          <div className="flex items-center gap-1.5 font-sans leading-none">
                            <span className="text-[13px] select-none shrink-0">{status.icon}</span>
                            <span className={`text-[10.5px] leading-tight ${status.color}`}>
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

      {/* STEP 4: Save & History Section - Consolidated row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 print:hidden">
        
        {/* Save Workspace */}
        <div className="bg-white border border-slate-150 rounded-2xl p-4 shadow-sm flex flex-col justify-between space-y-3">
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Save className="w-4 h-4 text-slate-500" />
              Archivar Espacio en Local
            </h3>
            <p className="text-[11px] text-slate-450 leading-relaxed">
              Guarda el censo de asegurados y las cotizaciones comparativas en el navegador.
            </p>

            <div className="space-y-1">
              <input
                type="text"
                placeholder="Nombre del Prospecto (Ej. Familia Torres)"
                className="w-full bg-slate-50 border border-slate-200 hover:border-slate-350 rounded-xl py-1.5 px-3 text-xs focus:outline-none focus:bg-white text-slate-800 font-medium"
                value={clientNameInput}
                onChange={(e) => setClientNameInput(e.target.value)}
              />
            </div>
          </div>

          <button
            onClick={handleSaveWorkspace}
            disabled={people.length === 0 || Object.keys(multicotiResultsByFreq).length === 0 || isSaving}
            className="w-full bg-slate-900 text-white rounded-xl py-2 hover:bg-slate-850 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {isSaving ? (
              <span className="w-3.5 h-3.5 border-2 border-t-transparent border-white rounded-full animate-spin shrink-0"></span>
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            Guardar Resultados Comparativos
          </button>
        </div>

        {/* History repository list */}
        <div className="bg-white border border-slate-150 rounded-2xl p-4 shadow-sm flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Archive className="w-4 h-4 text-slate-500" />
              Historial de Multicotizaciones ({savedMultiGmmQuotes.length})
            </h3>
            <p className="text-[11px] text-slate-450 leading-relaxed">
              Haz clic sobre cualquier registro previo para restaurar inmediatamente todo el censo y comparativas en la consola.
            </p>

            <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-0.5">
              {savedMultiGmmQuotes.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400 italic">
                  No hay cotizaciones archivadas aún.
                </div>
              ) : (
                savedMultiGmmQuotes.map((q) => (
                  <div
                    key={q.id}
                    onClick={() => onLoadSavedQuote(q)}
                    className="bg-slate-50 hover:bg-slate-100 border border-slate-150 rounded-xl px-2.5 py-2 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div className="min-w-0 pr-2">
                      <h4 className="text-slate-800 font-bold text-xs leading-none truncate">{q.client_name}</h4>
                      <div className="flex gap-x-2 text-[9px] text-slate-450 font-mono mt-1">
                        <span>{q.people_json?.length || 0} Aseg.</span>
                        <span>•</span>
                        <span>{q.options_json?.length || 0} Opc.</span>
                        <span>•</span>
                        <span>{new Date(q.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => onDeleteSavedQuote(q.id, e)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-md hover:bg-white transition-colors shrink-0"
                      title="Eliminar"
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
