import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Save, Check, AlertCircle, ChevronDown, 
  Archive, ClipboardList, UserPlus, Flame, Users, Sparkles,
  Printer, Copy, FileText, CheckSquare, XSquare, Layers, ShieldAlert, HelpCircle
} from 'lucide-react';
import { 
  Quote, QuotePerson, TariffPackage, CalculationResult, RelationType, GenderType, RegionZone, FormaPago,
  BnpTariffPackage, BnpQuote, BnpCalculationResult, MultiGmmQuote
} from './types';
import { 
  seedDefaultPackageIfEmpty, listPackages, getActivePackage, saveQuote, listQuotes, deleteQuote,
  seedDefaultBnpPackageIfEmpty, listBnpPackages, getActiveBnpPackage, saveBnpQuote, listBnpQuotes, deleteBnpQuote,
  listMultiGmmQuotes, saveMultiGmmQuote, deleteMultiGmmQuote
} from './lib/dbStore';
import { calculateQuote, generateProductCode } from './lib/calcEngine';
import { calculateBnpQuote, generateBnpProductCode } from './lib/calcEngineBnp';
import { MultiGmmOptionConfig, calculateOption } from './lib/calcOrchestrator';
import { NormalizedResult, BXPLUS_OPCIONALES_DEFAULT } from './lib/calcEngineBxPlus';

import MulticotizadorGmmView from './components/MulticotizadorGmmView';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // Product Selector
  const [activeProduct, setActiveProduct] = useState<'BNV' | 'BNP' | 'MULTICOTIZADOR'>('MULTICOTIZADOR');

  // DB States - BNV
  const [packagesList, setPackagesList] = useState<TariffPackage[]>([]);
  const [activePackage, setActivePackage] = useState<TariffPackage | null>(null);
  const [savedQuotes, setSavedQuotes] = useState<Quote[]>([]);
  
  // DB States - BNP
  const [bnpPackagesList, setBnpPackagesList] = useState<BnpTariffPackage[]>([]);
  const [activeBnpPackage, setActiveBnpPackage] = useState<BnpTariffPackage | null>(null);
  const [savedBnpQuotes, setSavedBnpQuotes] = useState<BnpQuote[]>([]);

  const [dbLoading, setDbLoading] = useState(true);

  // Form Field States (Shared input variables)
  const [clientType, setClientType] = useState<string>('Individual / Familiar');
  const [regionZone, setRegionZone] = useState<RegionZone>('Zona 1');
  const [sumaAsegurada, setSumaAsegurada] = useState<number>(3000000);
  const [deducible, setDeducible] = useState<number>(100000);
  const [coaseguro, setCoaseguro] = useState<number>(10);
  const [topeCoaseguro, setTopeCoaseguro] = useState<number>(30000);
  const [asistenciaExtranjero, setAsistenciaExtranjero] = useState<'Si' | 'No'>('Si');
  const [coberturaCatastrofica, setCoberturaCatastrofica] = useState<'Si' | 'No'>('Si');
  const [formaPago, setFormaPago] = useState<FormaPago>('Anual');
  const [quoteNotes, setQuoteNotes] = useState<string>('');

  // Multicotizador States
  const [multicotiOptions, setMulticotiOptions] = useState<MultiGmmOptionConfig[]>([
    {
      id: 'option_1',
      product_id: 'BXPLUS',
      bx_zona: 'Zona Metropolitana (CDMX/EdoMex)',
      bx_nivel_hospitalario: 'Zafiro',
      bx_tabulador: 'Médico 2',
      bx_suma_asegurada: 10000000,
      bx_deducible: 30000,
      bx_coaseguro: 10,
      bx_tope_coaseguro_auto_val: true,
      bx_forma_pago: 'Anual',
      bx_coberturas_opcionales: [
        'Medicamentos fuera del hospital',
        'Eliminación deducible por accidente',
        'Multirregión',
        'Beneficio hospitalario VIP',
        'Emergencia médica en el extranjero'
      ]
    },
    {
      id: 'option_2',
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
    }
  ]);
  const [multicotiResults, setMulticotiResults] = useState<NormalizedResult[]>([]);
  const [multicotiErrors, setMulticotiErrors] = useState<Record<string, string>>({});
  const [multicotiCalculating, setMulticotiCalculating] = useState(false);
  const [savedMultiGmmQuotes, setSavedMultiGmmQuotes] = useState<MultiGmmQuote[]>([]);
  const [multiClientName, setMultiClientName] = useState('');

  // Insured Members state
  const [people, setPeople] = useState<QuotePerson[]>([
    { id: '1', name: 'Laura Gómez (Titular)', relation: 'Titular', gender: 'Femenino', age: 34 }
  ]);

  // Temporary New Member Fields
  const [newMemberName, setNewMemberName] = useState<string>('');
  const [newMemberRelation, setNewMemberRelation] = useState<RelationType>('Hij@');
  const [newMemberGender, setNewMemberGender] = useState<GenderType>('Masculino');
  const [newMemberAge, setNewMemberAge] = useState<number>(8);

  // Calculation Results
  const [calcResult, setCalcResult] = useState<CalculationResult | null>(null);
  const [bnpCalcResult, setBnpCalcResult] = useState<BnpCalculationResult | null>(null);

  const [isSavingQuote, setIsSavingQuote] = useState(false);
  const [quoteSaveSuccess, setQuoteSaveSuccess] = useState<string | null>(null);

  // Load and bootstrap databases for both products
  const fetchAllData = async () => {
    setDbLoading(true);
    try {
      // 1. Seed BNV and BNP if empty
      await seedDefaultPackageIfEmpty();
      await seedDefaultBnpPackageIfEmpty();
      
      // 2. Fetch BNV data
      const pkgs = await listPackages();
      setPackagesList(pkgs);
      const actPkg = await getActivePackage();
      setActivePackage(actPkg);
      const quotes = await listQuotes();
      setSavedQuotes(quotes);

      // 3. Fetch BNP data
      const bnpPkgs = await listBnpPackages();
      setBnpPackagesList(bnpPkgs);
      const actBnpPkg = await getActiveBnpPackage();
      setActiveBnpPackage(actBnpPkg);
      const bnpQuotes = await listBnpQuotes();
      setSavedBnpQuotes(bnpQuotes);

      // 4. Fetch GMM multicotizaciones data
      const mQuotes = await listMultiGmmQuotes();
      setSavedMultiGmmQuotes(mQuotes);

      // Initialize form variables based on active product
      if (activeProduct === 'BNV' && actPkg) {
        setSumaAsegurada(actPkg.sumas_aseguradas[0] || 3000000);
        setDeducible(actPkg.deducibles[0] || 100000);
        setCoaseguro(actPkg.coaseguros[0] || 10);
        setClientType(actPkg.client_types[0]?.client_type || 'Individual / Familiar');
      } else if (activeProduct === 'BNP' && actBnpPkg) {
        setSumaAsegurada(actBnpPkg.sumas_aseguradas[0] || 50000000);
        setDeducible(actBnpPkg.deducibles[0] || 35000);
        setCoaseguro(actBnpPkg.coaseguros[0] || 10);
        setClientType(actBnpPkg.client_types[0]?.client_type || 'Nuevo negocio');
      }

    } catch (e) {
      console.error('Error inicializando base de datos local:', e);
    } finally {
      setDbLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Sync inputs dynamically when switching products
  useEffect(() => {
    if (activeProduct === 'BNP' && activeBnpPackage) {
      if (!activeBnpPackage.sumas_aseguradas.includes(sumaAsegurada)) {
        setSumaAsegurada(activeBnpPackage.sumas_aseguradas[0] || 50000000);
      }
      if (!activeBnpPackage.deducibles.includes(deducible)) {
        setDeducible(activeBnpPackage.deducibles[0] || 35000);
      }
      if (!activeBnpPackage.coaseguros.includes(coaseguro)) {
        setCoaseguro(activeBnpPackage.coaseguros[0] || 10);
      }
      if (!activeBnpPackage.client_types.some(c => c.client_type === clientType)) {
        setClientType(activeBnpPackage.client_types[0]?.client_type || 'Nuevo negocio');
      }
    } else if (activeProduct === 'BNV' && activePackage) {
      if (!activePackage.sumas_aseguradas.includes(sumaAsegurada)) {
        setSumaAsegurada(activePackage.sumas_aseguradas[0] || 3000000);
      }
      if (!activePackage.deducibles.includes(deducible)) {
        setDeducible(activePackage.deducibles[0] || 100000);
      }
      if (!activePackage.coaseguros.includes(coaseguro)) {
        setCoaseguro(activePackage.coaseguros[0] || 10);
      }
      if (!activePackage.client_types.some(c => c.client_type === clientType)) {
        setClientType(activePackage.client_types[0]?.client_type || 'Individual / Familiar');
      }
    }
  }, [activeProduct, activePackage, activeBnpPackage]);

  // Recalculate BNV Quote in real-time
  useEffect(() => {
    if (activeProduct !== 'BNV' || !activePackage || people.length === 0) {
      setCalcResult(null);
      return;
    }

    const currentQuote: Quote = {
      id: 'active_quote',
      tariff_package_id: activePackage.id,
      client_type: clientType,
      region_zone: regionZone,
      suma_asegurada: sumaAsegurada,
      deducible,
      coaseguro,
      tope_coaseguro: topeCoaseguro,
      asistencia_extranjero: asistenciaExtranjero,
      forma_pago: formaPago,
      people,
      created_at: new Date().toISOString()
    };

    calculateQuote(currentQuote, activePackage).then(res => {
      setCalcResult(res);
    });
  }, [
    activeProduct, activePackage, clientType, regionZone, sumaAsegurada, deducible, 
    coaseguro, topeCoaseguro, asistenciaExtranjero, formaPago, people
  ]);

  // Recalculate BNP Quote in real-time
  useEffect(() => {
    if (activeProduct !== 'BNP' || !activeBnpPackage || people.length === 0) {
      setBnpCalcResult(null);
      return;
    }

    // Limit member ages to 84 for BNP, mapping people dynamically
    const adjustedPeople: QuotePerson[] = people.map(p => ({
      id: p.id,
      name: p.name,
      relation: p.relation,
      gender: p.gender,
      age: Math.min(84, p.age)
    }));

    const currentBnpQuote: BnpQuote = {
      id: 'active_bnp_quote',
      tariff_package_id: activeBnpPackage.id,
      product: 'BUPA_NACIONAL_PLUS',
      client_type: clientType,
      region_zone: regionZone,
      suma_asegurada: sumaAsegurada,
      deducible,
      coaseguro,
      maternidad_titular: 'No',
      maternidad_conyuge: 'No',
      asistencia_extranjero: asistenciaExtranjero,
      cobertura_catastrofica_extranjero: coberturaCatastrofica,
      forma_pago: formaPago,
      people: adjustedPeople,
      created_at: new Date().toISOString()
    };

    calculateBnpQuote(currentBnpQuote, activeBnpPackage).then(res => {
      setBnpCalcResult(res);
    });
  }, [
    activeProduct, activeBnpPackage, clientType, regionZone, sumaAsegurada, deducible, 
    coaseguro, asistenciaExtranjero, coberturaCatastrofica, formaPago, people
  ]);

  // Recalculate MultiGmm Options in real-time
  useEffect(() => {
    if (activeProduct !== 'MULTICOTIZADOR' || people.length === 0) {
      setMulticotiResults([]);
      return;
    }

    const runMultiCalculations = async () => {
      setMulticotiCalculating(true);
      const results: NormalizedResult[] = [];
      const errors: Record<string, string> = {};

      for (const option of multicotiOptions) {
        try {
          const res = await calculateOption(option, people, activePackage, activeBnpPackage);
          results.push(res);
        } catch (error: any) {
          console.error(`Error calculating option:`, error);
          errors[option.id] = error?.message || 'Error de cálculo';
        }
      }

      setMulticotiResults(results);
      setMulticotiErrors(errors);
      setMulticotiCalculating(false);
    };

    runMultiCalculations();
  }, [activeProduct, multicotiOptions, people, activePackage, activeBnpPackage]);

  // Member management handlers
  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newMemberName.trim() || `${newMemberRelation} extra`;
    
    if (newMemberRelation === 'Titular' && people.some(p => p.relation === 'Titular')) {
      alert('Esta cotización ya cuenta con un Titular asignado. Solo se permite un asegurado Titular por póliza.');
      return;
    }

    const maxAgeAllowed = activeProduct === 'BNP' ? 84 : 95;
    const finalAge = Math.min(maxAgeAllowed, Number(newMemberAge));

    const newPerson: QuotePerson = {
      id: `p_${Date.now()}`,
      name,
      relation: newMemberRelation,
      gender: newMemberGender,
      age: finalAge
    };

    setPeople([...people, newPerson]);
    setNewMemberName('');
    setNewMemberAge(8);
  };

  const handleRemoveMember = (id: string) => {
    setPeople(people.filter(p => p.id !== id));
  };

  // Preset Configurations Loader
  const loadPreset = (presetName: string) => {
    if (presetName === 'pareja_hijos') {
      setPeople([
        { id: 'p1', name: 'Alfonso Torres', relation: 'Titular', gender: 'Masculino', age: 41 },
        { id: 'p2', name: 'Laura Gómez', relation: 'Cónyuge', gender: 'Femenino', age: 39 },
        { id: 'p3', name: 'Mateo Torres', relation: 'Hij@', gender: 'Masculino', age: 10 },
        { id: 'p4', name: 'Valentina Torres', relation: 'Hij@', gender: 'Femenino', age: 6 }
      ]);
      setSumaAsegurada(activeProduct === 'BNP' ? 50000000 : 3000000);
      setDeducible(activeProduct === 'BNP' ? 35000 : 50000);
      setCoaseguro(10);
      setAsistenciaExtranjero('Si');
      setFormaPago('Semestral');
    } else if (presetName === 'ejemplo_excel') {
      setPeople([
        { id: 'p31', name: 'Alfonso Torres (Ejemplo BNV)', relation: 'Titular', gender: 'Masculino', age: 74 }
      ]);
      setSumaAsegurada(3000000);
      setDeducible(100000);
      setCoaseguro(10);
      setTopeCoaseguro(30000);
      setAsistenciaExtranjero('Si');
      setFormaPago('Anual');
      setClientType('Individual / Familiar');
      setRegionZone('Zona 2'); // Mexico Region 2
    } else if (presetName === 'ejemplo_excel_bnp') {
      // Replicates the exact sample from prompt for BNP
      // Woman, 40 years old, Region 1, Plan NPS50D35C10. Rate is $12345.67
      setPeople([
        { id: 'p_bnp_ex', name: 'Sofía Herrera (Ejemplo BNP)', relation: 'Titular', gender: 'Femenino', age: 40 }
      ]);
      setSumaAsegurada(50000000);
      setDeducible(35000);
      setCoaseguro(10);
      setAsistenciaExtranjero('Si');
      setCoberturaCatastrofica('Si');
      setFormaPago('Anual');
      setClientType('Nuevo negocio');
      setRegionZone('Zona 1'); // Mexico Region 1
    }
  };

  // Quote Save persistence handler
  const handleSaveQuoteToHistory = async () => {
    if (activeProduct === 'BNV') {
      if (!activePackage || people.length === 0 || !calcResult) return;
      setIsSavingQuote(true);
      
      const fullQuote: Quote = {
        id: `quote_${Date.now()}`,
        tariff_package_id: activePackage.id,
        client_type: clientType,
        region_zone: regionZone,
        suma_asegurada: sumaAsegurada,
        deducible,
        coaseguro,
        tope_coaseguro: topeCoaseguro,
        asistencia_extranjero: asistenciaExtranjero,
        forma_pago: formaPago,
        people,
        created_at: new Date().toISOString(),
        notes: quoteNotes.trim() || `BNV: ${calcResult.product_code} / ${people.length} Asegurados`
      };

      try {
        await saveQuote(fullQuote);
        setQuoteSaveSuccess('¡Cotización BNV guardada en el historial!');
        setQuoteNotes('');
        const quotes = await listQuotes();
        setSavedQuotes(quotes);
        setTimeout(() => setQuoteSaveSuccess(null), 3500);
      } catch (err) {
        alert('Error guardando cotización');
      } finally {
        setIsSavingQuote(false);
      }
    } else {
      // BNP Save
      if (!activeBnpPackage || people.length === 0 || !bnpCalcResult) return;
      setIsSavingQuote(true);

      const bnpPeople: QuotePerson[] = people.map(p => ({
        id: p.id,
        name: p.name,
        relation: p.relation,
        gender: p.gender,
        age: Math.min(84, p.age)
      }));

      const fullBnpQuote: BnpQuote = {
        id: `bnp_quote_${Date.now()}`,
        tariff_package_id: activeBnpPackage.id,
        product: 'BUPA_NACIONAL_PLUS',
        client_type: clientType,
        region_zone: regionZone,
        suma_asegurada: sumaAsegurada,
        deducible,
        coaseguro,
        maternidad_titular: 'No',
        maternidad_conyuge: 'No',
        asistencia_extranjero: asistenciaExtranjero,
        cobertura_catastrofica_extranjero: coberturaCatastrofica,
        forma_pago: formaPago,
        people: bnpPeople,
        created_at: new Date().toISOString(),
        notes: quoteNotes.trim() || `BNP: ${bnpCalcResult.product_code} / ${people.length} Asegurados`
      };

      try {
        await saveBnpQuote(fullBnpQuote);
        setQuoteSaveSuccess('¡Cotización BNP guardada en el historial!');
        setQuoteNotes('');
        const bnpQuotes = await listBnpQuotes();
        setSavedBnpQuotes(bnpQuotes);
        setTimeout(() => setQuoteSaveSuccess(null), 3500);
      } catch (err) {
        alert('Error guardando cotización BNP');
      } finally {
        setIsSavingQuote(false);
      }
    }
  };

  // Quote recall helper
  const handleLoadSavedQuote = (q: Quote) => {
    setActiveProduct('BNV');
    setClientType(q.client_type);
    setRegionZone(q.region_zone);
    setSumaAsegurada(q.suma_asegurada);
    setDeducible(q.deducible);
    setCoaseguro(q.coaseguro);
    setTopeCoaseguro(q.tope_coaseguro);
    setAsistenciaExtranjero(q.asistencia_extranjero);
    setFormaPago(q.forma_pago);
    setPeople(q.people);
  };

  const handleLoadSavedBnpQuote = (q: BnpQuote) => {
    setActiveProduct('BNP');
    setClientType(q.client_type);
    setRegionZone(q.region_zone);
    setSumaAsegurada(q.suma_asegurada);
    setDeducible(q.deducible);
    setCoaseguro(q.coaseguro);
    setAsistenciaExtranjero(q.asistencia_extranjero);
    setCoberturaCatastrofica(q.cobertura_catastrofica_extranjero);
    setFormaPago(q.forma_pago);
    
    // Map BnpQuotePerson back to QuotePerson
    const mapped: QuotePerson[] = q.people.map(p => ({
      id: p.id,
      name: p.name,
      relation: p.relation,
      gender: p.gender,
      age: p.age
    }));
    setPeople(mapped);
  };

  const handleDeleteSavedQuote = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('¿Eliminar esta cotización guardada?')) {
      await deleteQuote(id);
      const quotes = await listQuotes();
      setSavedQuotes(quotes);
    }
  };

  const handleDeleteSavedBnpQuote = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('¿Eliminar esta cotización BNP?')) {
      await deleteBnpQuote(id);
      const bnpQuotes = await listBnpQuotes();
      setSavedBnpQuotes(bnpQuotes);
    }
  };

  const handleSaveMultiGmmQuote = async () => {
    if (people.length === 0 || multicotiResults.length === 0) return;
    setIsSavingQuote(true);

    const options_json = multicotiOptions.map((opt, index) => {
      return {
        option_index: index + 1,
        product_id: opt.product_id,
        input_json: opt,
        result_json: multicotiResults[index] || null,
        tariff_package_id: opt.product_id === 'BNV' ? (activePackage?.id || '') : opt.product_id === 'BNP' ? (activeBnpPackage?.id || '') : 'bxplus_matrix_2026'
      };
    });

    const newMultiQuote: MultiGmmQuote = {
      id: `mquote_${Date.now()}`,
      created_by: 'cdcjimenez@gmail.com', // active user
      client_name: multiClientName.trim() || `Multicotización GMM de ${people[0]?.name || 'Cliente'}`,
      people_json: people,
      options_json,
      results_json: multicotiResults,
      created_at: new Date().toISOString(),
      status: 'calculated'
    };

    try {
      await saveMultiGmmQuote(newMultiQuote);
      setMultiClientName('');
      setQuoteSaveSuccess('¡Cotización de Multicotizador guardada con éxito!');
      const mQuotes = await listMultiGmmQuotes();
      setSavedMultiGmmQuotes(mQuotes);
      setTimeout(() => setQuoteSaveSuccess(null), 3500);
    } catch (err) {
      alert('Error guardando la cotización del multicotizador');
    } finally {
      setIsSavingQuote(false);
    }
  };

  const handleLoadSavedMultiQuote = (q: MultiGmmQuote) => {
    setActiveProduct('MULTICOTIZADOR');
    setPeople(q.people_json);
    const restoredOptions = q.options_json.map((o: any) => o.input_json);
    setMulticotiOptions(restoredOptions);
  };

  const handleDeleteSavedMultiQuote = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('¿Eliminar esta cotización guardada del multicotizador?')) {
      await deleteMultiGmmQuote(id);
      const mQuotes = await listMultiGmmQuotes();
      setSavedMultiGmmQuotes(mQuotes);
    }
  };

  if (dbLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-t-teal-400 border-r-slate-800 border-b-slate-800 border-l-slate-800 rounded-full animate-spin"></div>
        <p className="text-sm font-mono text-slate-400">Iniciando Motor Multicotizador Bupa (BNV & BNP)...</p>
      </div>
    );
  }

  // Generate real-time product code preview
  const previewProductCode = activeProduct === 'BNV' 
    ? generateProductCode(sumaAsegurada, deducible, coaseguro, topeCoaseguro)
    : generateBnpProductCode(sumaAsegurada, deducible, coaseguro, clientType);

  const getBnpFreqKey = (fp: FormaPago): 'annual' | 'semiannual' | 'quarterly' | 'monthly' => {
    switch (fp) {
      case 'Anual': return 'annual';
      case 'Semestral': return 'semiannual';
      case 'Trimestral': return 'quarterly';
      case 'Mensual': return 'monthly';
      default: return 'annual';
    }
  };

  const bnpFreqKey = getBnpFreqKey(formaPago);
  const bnpTotalBreakdown = bnpCalcResult ? bnpCalcResult.totals[bnpFreqKey] : null;

  const activePackageData = activeProduct === 'BNV' ? activePackage : activeBnpPackage;

  return (
    <div className="min-h-screen bg-[#fafafc] text-slate-800 font-sans antialiased selection:bg-teal-500/10 pb-16">
      
      {/* Header Frame */}
      <div className="bg-white border-b border-slate-150/80 py-6 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <ClipboardList className="w-5.5 h-5.5 text-slate-800 shrink-0" />
              <h1 className="text-xl md:text-2xl font-bold font-display tracking-tight text-slate-900">
                Cotizador Multiproducto GMM Bupa México
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Consola de Cálculo Independiente para <strong className="text-teal-600 font-semibold">Nacional Vital (BNV)</strong> y <strong className="text-indigo-600 font-semibold">Nacional Plus (BNP)</strong>. Sincronización oficial contra matrices 2026.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 items-center">
            {activePackageData && (
              <div className="bg-[#f3f4f6]/80 border border-slate-200/60 rounded-xl px-3.5 py-1.5 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full animate-pulse ${activeProduct === 'BNP' ? 'bg-indigo-500' : 'bg-teal-500'}`}></span>
                <div className="text-left font-sans">
                  <span className="text-[9px] text-slate-450 uppercase font-mono tracking-widest block">Matriz Activa</span>
                  <span className="text-xs font-semibold text-slate-700 max-w-[180px] truncate block">
                    {activePackageData.version_name}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Deck Switcher - Modern segmented layout */}
      <div className="bg-white/40 border-b border-slate-150 px-4 md:px-8 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-slate-100/80 p-1 rounded-xl flex gap-1 max-w-md border border-slate-200/50">
            <button
              onClick={() => setActiveProduct('MULTICOTIZADOR')}
              className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeProduct === 'MULTICOTIZADOR'
                  ? 'bg-white text-emerald-700 shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Multicotizador GMM
            </button>

            <button
              onClick={() => setActiveProduct('BNV')}
              className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeProduct === 'BNV'
                  ? 'bg-white text-teal-600 shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${activeProduct === 'BNV' ? 'bg-teal-500' : 'bg-slate-300'}`}></span>
              Nacional Vital BNV
            </button>

            <button
              onClick={() => setActiveProduct('BNP')}
              className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeProduct === 'BNP'
                  ? 'bg-white text-indigo-600 shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${activeProduct === 'BNP' ? 'bg-indigo-500' : 'bg-slate-300'}`}></span>
              Nacional Plus BNP
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-8 space-y-8">
        
        {activeProduct === 'MULTICOTIZADOR' ? (
          <MulticotizadorGmmView 
            people={people}
            setPeople={setPeople}
            multicotiOptions={multicotiOptions}
            setMulticotiOptions={setMulticotiOptions}
            multicotiResults={multicotiResults}
            multicotiErrors={multicotiErrors}
            multicotiCalculating={multicotiCalculating}
            savedMultiGmmQuotes={savedMultiGmmQuotes}
            onSaveMultiQuote={handleSaveMultiGmmQuote}
            onLoadSavedQuote={handleLoadSavedMultiQuote}
            onDeleteSavedQuote={handleDeleteSavedMultiQuote}
            isSaving={isSavingQuote}
            activePackage={activePackage}
            activeBnpPackage={activeBnpPackage}
          />
        ) : (
          /* Core Cotizador Console Section */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Input Panel */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white border border-slate-150 rounded-2xl p-6 shadow-sm space-y-6">
              
              {/* Form Title & Description */}

              {/* Grid of form parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Client type selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-450 font-bold uppercase tracking-wider font-sans">Tipo de Cliente (Descuento)</label>
                  <div className="relative">
                    <select
                      className="w-full bg-[#f8f9fa] border border-slate-200 hover:border-slate-300 text-slate-800 text-sm rounded-xl px-3.5 py-2.5 appearance-none focus:outline-none focus:bg-white focus:border-slate-400 focus:ring-4 focus:ring-slate-105 transition-all font-sans"
                      value={clientType}
                      onChange={(e) => setClientType(e.target.value)}
                    >
                      {activePackageData?.client_types?.map(c => {
                        const factorPercent = Math.round((1 - c.discount_factor) * 100);
                        return (
                          <option key={c.client_type} value={c.client_type}>
                            {c.client_type} {factorPercent > 0 ? `(-${factorPercent}%)` : ''}
                          </option>
                        );
                      })}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 mt-1 top-3.5 pointer-events-none" />
                  </div>
                </div>

                {/* Zone Region / Zone map */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-450 font-bold uppercase tracking-wider font-sans">Zona Geográfica (Tabular)</label>
                  <div className="relative">
                    <select
                      className="w-full bg-[#f8f9fa] border border-slate-200 hover:border-slate-300 text-slate-800 text-sm rounded-xl px-3.5 py-2.5 appearance-none focus:outline-none focus:bg-white focus:border-slate-400 focus:ring-4 focus:ring-slate-105 transition-all font-sans"
                      value={regionZone}
                      onChange={(e) => setRegionZone(e.target.value as RegionZone)}
                    >
                      <option value="Zona 1">Zona 1 (CDMX, AM & Monterrey)</option>
                      <option value="Zona 2">Zona 2 (Resto de la República)</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 mt-1 top-3.5 pointer-events-none" />
                  </div>
                </div>

                {/* Suma Asegurada selection */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-450 font-bold uppercase tracking-wider font-sans">Suma Asegurada Limit (Anual)</label>
                  <div className="relative">
                    <select
                      className="w-full bg-[#f8f9fa] border border-slate-200 hover:border-slate-300 text-slate-800 text-sm rounded-xl px-3.5 py-2.5 appearance-none focus:outline-none focus:bg-white focus:border-slate-400 focus:ring-4 focus:ring-slate-105 transition-all font-mono"
                      value={sumaAsegurada}
                      onChange={(e) => setSumaAsegurada(Number(e.target.value))}
                    >
                      {activePackageData?.sumas_aseguradas?.map(sa => (
                        <option key={sa} value={sa}>
                          ${(sa / 1000000).toLocaleString()}M MXN
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 mt-1 top-3.5 pointer-events-none" />
                  </div>
                </div>

                {/* Deducible selection */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-450 font-bold uppercase tracking-wider font-sans">Deducible Contratado</label>
                  <div className="relative">
                    <select
                      className="w-full bg-[#f8f9fa] border border-slate-200 hover:border-slate-300 text-slate-800 text-sm rounded-xl px-3.5 py-2.5 appearance-none focus:outline-none focus:bg-white focus:border-slate-400 focus:ring-4 focus:ring-slate-105 transition-all font-mono"
                      value={deducible}
                      onChange={(e) => setDeducible(Number(e.target.value))}
                    >
                      {activePackageData?.deducibles?.map(d => (
                        <option key={d} value={d}>
                          ${d.toLocaleString()} MXN
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 mt-1 top-3.5 pointer-events-none" />
                  </div>
                </div>

                {/* Coaseguro selection */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-450 font-bold uppercase tracking-wider font-sans">Coaseguro (%)</label>
                  <div className="relative">
                    <select
                      className="w-full bg-[#f8f9fa] border border-slate-200 hover:border-slate-300 text-slate-800 text-sm rounded-xl px-3.5 py-2.5 appearance-none focus:outline-none focus:bg-white focus:border-slate-400 focus:ring-4 focus:ring-slate-105 transition-all font-mono"
                      value={coaseguro}
                      onChange={(e) => setCoaseguro(Number(e.target.value))}
                    >
                      {activePackageData?.coaseguros?.map(c => (
                        <option key={c} value={c}>
                          {c}%
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 mt-1 top-3.5 pointer-events-none" />
                  </div>
                </div>

                {/* BNV only options (Tope coaseguro) */}
                {activeProduct === 'BNV' ? (
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-455 font-bold uppercase tracking-wider font-sans">Tope Coaseguro</label>
                    <div className="relative">
                      <select
                        className="w-full bg-[#f8f9fa] border border-slate-200 hover:border-slate-300 text-slate-800 text-sm rounded-xl px-3.5 py-2.5 appearance-none focus:outline-none focus:bg-white focus:border-slate-400 focus:ring-4 focus:ring-slate-105 transition-all font-mono"
                        value={topeCoaseguro}
                        onChange={(e) => setTopeCoaseguro(Number(e.target.value))}
                      >
                        {activePackage?.topes_coaseguro?.map(t => (
                          <option key={t} value={t}>
                            {t === 0 ? 'Sin Tope ($0)' : `$${t.toLocaleString()} MXN`}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 mt-1 top-3.5 pointer-events-none" />
                    </div>
                  </div>
                ) : (
                  /* BNP only options (Enfermedades Catastroficas CEE) */
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-455 font-bold uppercase tracking-wider font-sans">Enfermedades Catastróficas Extr. (CEE)</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        className={`text-xs py-2.5 rounded-xl border font-bold transition-all cursor-pointer ${
                          coberturaCatastrofica === 'Si' 
                            ? 'bg-slate-900 border-slate-900 text-white shadow-sm font-bold' 
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                        }`}
                        onClick={() => setCoberturaCatastrofica('Si')}
                      >
                        Si (+$5,800/pers.)
                      </button>
                      <button
                        type="button"
                        className={`text-xs py-2.5 rounded-xl border font-bold transition-all cursor-pointer ${
                          coberturaCatastrofica === 'No' 
                            ? 'bg-slate-900 border-slate-900 text-white shadow-sm font-bold' 
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                        }`}
                        onClick={() => setCoberturaCatastrofica('No')}
                      >
                        No ($0)
                      </button>
                    </div>
                  </div>
                )}

                {/* Asistencia Extranjero */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-455 font-bold uppercase tracking-wider font-sans">Asistencia Extranjero</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      className={`text-xs py-2.5 rounded-xl border font-bold transition-all cursor-pointer ${
                        asistenciaExtranjero === 'Si' 
                          ? 'bg-slate-900 border-slate-900 text-white shadow-sm font-bold' 
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-805 hover:bg-slate-100'
                      }`}
                      onClick={() => setAsistenciaExtranjero('Si')}
                    >
                      Si (+${activePackageData?.asistencia_extranjero || 1632})
                    </button>
                    <button
                      type="button"
                      className={`text-xs py-2.5 rounded-xl border font-bold transition-all cursor-pointer ${
                        asistenciaExtranjero === 'No' 
                          ? 'bg-slate-900 border-slate-900 text-white shadow-sm font-bold' 
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-805 hover:bg-slate-100'
                      }`}
                      onClick={() => setAsistenciaExtranjero('No')}
                    >
                      No ($0)
                    </button>
                  </div>
                </div>

                {/* Forma de Pago */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-455 font-bold uppercase tracking-wider font-sans">Forma de Pago (Recargo)</label>
                  <div className="relative">
                    <select
                      className="w-full bg-[#f8f9fa] border border-slate-200 hover:border-slate-300 text-slate-800 text-sm rounded-xl px-3.5 py-2.5 appearance-none focus:outline-none focus:bg-white focus:border-slate-400 focus:ring-4 focus:ring-slate-105 transition-all"
                      value={formaPago}
                      onChange={(e) => setFormaPago(e.target.value as FormaPago)}
                    >
                      <option value="Anual">Anual (x1.00 - Pago Único)</option>
                      <option value="Semestral">Semestral (x1.045 Recargo)</option>
                      <option value="Trimestral">Trimestral (x1.075 Recargo)</option>
                      <option value="Mensual">Mensual (x1.09 Recargo)</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 mt-1 top-3.5 pointer-events-none" />
                  </div>
                </div>

              </div>

              {/* Insured members form list */}
              <div className="space-y-4 pt-4 border-t border-slate-150">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                    <Users className="w-4 h-4 text-slate-500" />
                    Grupo Asegurado Tarjeta ({people.length})
                  </div>
                </div>

                {/* Insert Member Section */}
                <form onSubmit={handleAddMember} className="bg-slate-50/50 border border-slate-150 p-4 rounded-xl space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
                    
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-[10px] text-slate-450 font-bold uppercase tracking-wider font-sans">Nombre de Asegurado</label>
                      <input
                        type="text"
                        placeholder="Ej. Sofía Herrera"
                        className="w-full bg-white border border-slate-200 text-slate-800 text-xs rounded-xl px-2.5 py-2 focus:outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100 transition-all"
                        value={newMemberName}
                        onChange={(e) => setNewMemberName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-450 font-bold uppercase tracking-wider font-sans">Parentesco</label>
                      <select
                        className="w-full bg-white border border-slate-200 text-slate-800 text-xs rounded-xl px-2 py-2 focus:outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100 transition-all"
                        value={newMemberRelation}
                        onChange={(e) => setNewMemberRelation(e.target.value as RelationType)}
                      >
                        <option value="Titular">Titular</option>
                        <option value="Cónyuge">Cónyuge</option>
                        <option value="Hij@">Hij@</option>
                        <option value="Dependiente económico">Dep. Económico</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-455 font-bold uppercase tracking-wider font-sans">Género</label>
                      <select
                        className="w-full bg-white border border-slate-200 text-slate-800 text-xs rounded-xl px-2 py-2 focus:outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100 transition-all"
                        value={newMemberGender}
                        onChange={(e) => setNewMemberGender(e.target.value as GenderType)}
                      >
                        <option value="Masculino">Masculino</option>
                        <option value="Femenino">Femenino</option>
                      </select>
                    </div>

                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-1">
                    <div className="flex items-center gap-3 space-x-2 grow">
                      <label className="text-[10px] text-slate-400 font-medium whitespace-nowrap shrink-0">Edad: </label>
                      <input
                        type="range"
                        min="0"
                        max={activeProduct === 'BNP' ? "84" : "95"}
                        className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
                        value={newMemberAge}
                        onChange={(e) => setNewMemberAge(Number(e.target.value))}
                      />
                      <input
                        type="number"
                        min="0"
                        max={activeProduct === 'BNP' ? "84" : "95"}
                        className="w-14 bg-white border border-slate-200 text-slate-800 text-xs text-center rounded-xl py-1 shrink-0 font-mono focus:outline-none focus:border-slate-400"
                        value={newMemberAge}
                        onChange={(e) => setNewMemberAge(Math.min(activeProduct === 'BNP' ? 84 : 95, Math.max(0, Number(e.target.value))))}
                      />
                    </div>

                    <button
                      type="submit"
                      className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl px-4 py-2 transition-all flex items-center justify-center gap-1 cursor-pointer font-sans shadow-sm"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-white mt-0.5" />
                      Añadir Integrante
                    </button>
                  </div>
                </form>

                {/* Active Members Grid list */}
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {people.length === 0 ? (
                    <div className="text-center py-6 border border-slate-150 rounded-xl text-xs text-slate-400">
                      Debes agregar al menos una persona para comenzar.
                    </div>
                  ) : (
                    people.map((p, index) => {
                      // BNP limit rule visible warning
                      const isBnpExceeded = activeProduct === 'BNP' && p.age > 84;
                      return (
                        <div 
                          key={p.id}
                          className={`bg-white border rounded-xl p-2.5 flex items-center justify-between hover:border-slate-300 transition-all ${
                            isBnpExceeded ? 'border-amber-300 bg-amber-50/50' : 'border-slate-150/85 shadow-sm'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] text-slate-400 font-mono w-5">
                              #{(index + 1)}
                            </span>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-semibold text-slate-800">{p.name}</span>
                                <span className="text-[9px] bg-slate-100 font-mono text-slate-500 px-1.5 py-0.5 rounded-lg border border-slate-200/50">
                                  {p.relation}
                                </span>
                                {isBnpExceeded && (
                                  <span className="text-[9px] bg-amber-100 border border-amber-200 text-amber-800 px-1.5 py-0.5 rounded-lg uppercase font-mono tracking-wider font-bold">
                                    Edad Max 84 capsulado
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                Género: {p.gender} • <span className="font-mono text-[10.5px] text-slate-600">{isBnpExceeded ? '84' : p.age} años</span>
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveMember(p.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors rounded-lg hover:bg-slate-50 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>

              </div>

            </div>
          </div>

          {/* Right Column: Calculations & Outputs Panel */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* BNV Output Panel */}
            {activeProduct === 'BNV' ? (
              <div className="bg-white border border-slate-150 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between">
                
                {/* Visual Header */}
                <div className="bg-[#ecfdf5] px-6 py-4 border-b border-[#a7f3d0]/40">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold font-mono">Código GMM Vital (BNV)</span>
                      <h3 className="text-sm font-bold text-emerald-800 font-mono tracking-tight mt-0.5">
                        {previewProductCode}
                      </h3>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block font-sans">Asegurados</span>
                      <span className="text-sm font-bold text-slate-800 font-mono">
                        {people.length} Pers.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-5">
                  {calcResult ? (
                    <>
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-450 font-sans">Desglose de Costos BNV</h4>
                      
                      <div className="space-y-2.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500">Suma Primas Anuales:</span>
                          <span className="font-mono text-slate-800 font-medium">
                            ${calcResult.prima_total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </span>
                        </div>

                        {calcResult.asistencia_extranjero_cost > 0 && (
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500">Asistencia Extranjero:</span>
                            <span className="font-mono text-slate-800">
                              +${calcResult.asistencia_extranjero_cost.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        )}

                        <div className="flex justify-between items-center text-xs pt-1.5 border-t border-slate-150">
                          <span className="text-slate-600 font-bold">Subtotal Bruto:</span>
                          <span className="font-mono text-slate-800 font-bold">
                            ${calcResult.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </span>
                        </div>

                        {formaPago !== 'Anual' && (
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500 italic">Cargo Fraccionado:</span>
                            <span className="font-mono text-slate-500 text-[11px]">
                              {calcResult.payment_factor_name} ({((calcResult.payment_factor - 1) * 105).toFixed(1)}%)
                            </span>
                          </div>
                        )}

                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500">Derecho de Póliza:</span>
                          <span className="font-mono text-slate-800">
                            +${calcResult.derecho_poliza.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500">Impuesto IVA (16%):</span>
                          <span className="font-mono text-slate-800">
                            +${calcResult.iva.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </span>
                        </div>

                        {/* Costo final */}
                        <div className="bg-[#f0fdf4] border border-[#bbf7d0]/60 p-4 rounded-xl flex items-center justify-between mt-4">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-500 font-sans tracking-wide block">Costo Total de Póliza BNV</span>
                            <span className="text-2xl font-bold text-emerald-600 font-mono tracking-tight mt-0.5 block">
                              ${calcResult.costo_total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full font-semibold font-sans">
                            {formaPago.toUpperCase()}
                          </span>
                        </div>

                        {/* Payment portions */}
                        <div className="pt-3 border-t border-slate-150 space-y-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-emerald-700 font-semibold font-sans">Monto del Primer Pago:</span>
                            <span className="font-mono text-emerald-700 font-bold text-sm">
                              ${calcResult.primer_pago.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                            </span>
                          </div>

                          {calcResult.pagos_subsecuentes > 0 && (
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-500">Pagos Subsecuentes:</span>
                              <span className="font-mono text-slate-800 font-semibold">
                                ${calcResult.pagos_subsecuentes.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          )}
                        </div>

                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12 text-slate-400 text-xs font-mono">
                      Completa la información de asegurados en BNV para cotizar en tiempo real.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* BNP Output Panel */
              <div className="bg-white border border-slate-150 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between">
                
                {/* Visual Header */}
                <div className="bg-[#f5f3ff] px-6 py-4 border-b border-[#ddd6fe]/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold font-mono">Código GMM Plus (BNP)</span>
                      <h3 className="text-sm font-bold text-indigo-800 font-mono tracking-tight mt-0.5">
                        {previewProductCode}
                      </h3>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block font-sans">Asegurados</span>
                      <span className="text-sm font-bold text-slate-800 font-mono">
                        {people.length} Pers.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-5">
                  {bnpCalcResult && bnpTotalBreakdown ? (
                    <>
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-455 font-sans">Desglose de Costos BNP (Plus)</h4>
                      
                      <div className="space-y-2.5">
                        {/* Breakdown math details */}
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500">Primas Anuales Base:</span>
                          <span className="font-mono text-slate-800">
                            ${bnpTotalBreakdown.premium.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </span>
                        </div>

                        {bnpTotalBreakdown.assistance_abroad > 0 && (
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500">Asistencia Extranjero:</span>
                            <span className="font-mono text-slate-800 animate-fade-in">
                              +${bnpTotalBreakdown.assistance_abroad.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        )}

                        {bnpTotalBreakdown.catastrophic_abroad > 0 && (
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500">Enfermedades Catastróficas Extr. (CEE):</span>
                            <span className="font-mono text-slate-800">
                              +${bnpTotalBreakdown.catastrophic_abroad.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        )}

                        <div className="flex justify-between items-center text-xs pt-1.5 border-t border-slate-150">
                          <span className="text-slate-600 font-semibold">Subtotal con Recargos:</span>
                          <span className="font-mono font-bold text-slate-800">
                            ${bnpTotalBreakdown.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500">Derecho de Póliza Flat:</span>
                          <span className="font-mono text-slate-800">
                            +${bnpTotalBreakdown.policy_fee.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500">Impuesto IVA (16%):</span>
                          <span className="font-mono text-slate-800">
                            +${bnpTotalBreakdown.iva.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </span>
                        </div>

                        {/* Costo final */}
                        <div className="bg-[#f5f3ff] border border-[#ddd6fe]/65 p-4 rounded-xl flex items-center justify-between mt-4">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-500 font-sans tracking-wide block">Costo Total de Póliza BNP</span>
                            <span className="text-2xl font-bold text-indigo-600 font-mono tracking-tight mt-0.5 block">
                              ${bnpTotalBreakdown.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <span className="text-[10px] bg-indigo-100 text-indigo-800 border border-indigo-200 px-2.5 py-1 rounded-full font-semibold font-sans">
                            {formaPago.toUpperCase()}
                          </span>
                        </div>

                        {/* Payment portions */}
                        <div className="pt-3 border-t border-slate-150 space-y-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-indigo-700 font-semibold font-sans">Monto del Primer Pago:</span>
                            <span className="font-mono text-indigo-700 font-bold text-sm">
                              ${bnpTotalBreakdown.first_payment.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                            </span>
                          </div>

                          {bnpTotalBreakdown.subsequent_payment > 0 && (
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-500">Pagos Subsecuentes:</span>
                              <span className="font-mono text-slate-800 font-semibold">
                                ${bnpTotalBreakdown.subsequent_payment.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          )}
                        </div>

                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12 text-slate-400 text-xs font-mono">
                      Completa la información de asegurados en BNP para cotizar en tiempo real.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Save & History persistence panel */}
            <div className="bg-white border border-slate-150 rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-450 font-bold uppercase tracking-wider font-sans">Notas / Identificador de Historial</label>
                <input
                  type="text"
                  className="w-full bg-slate-50 border border-slate-205 text-slate-800 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:bg-white focus:border-slate-400 focus:ring-4 focus:ring-slate-100 transition-all font-sans"
                  placeholder="Ej. Cotización Sr. Carlos Ruiz Familiar"
                  value={quoteNotes}
                  onChange={(e) => setQuoteNotes(e.target.value)}
                />
              </div>

              <button
                type="button"
                onClick={handleSaveQuoteToHistory}
                disabled={isSavingQuote}
                className="w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer bg-slate-900 border border-slate-900 text-white hover:bg-slate-800 shadow-sm"
              >
                <Save className="w-4 h-4 text-white" />
                {isSavingQuote ? 'Guardando...' : `Guardar Cotización ${activeProduct} en local`}
              </button>

              <AnimatePresence>
                {quoteSaveSuccess && (
                  <motion.p 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-[10px] text-emerald-600 text-center font-semibold font-sans mt-2 bg-emerald-50 border border-emerald-100 p-2 rounded-xl"
                  >
                    {quoteSaveSuccess}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Saved Quotes History Panel */}
            <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
                <Archive className="w-4 h-4 text-slate-600" />
                Historial de Cotizaciones Locales
              </div>

              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 text-xs">
                {activeProduct === 'BNV' ? (
                  savedQuotes.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-[11px] font-mono">
                      No hay cotizaciones BNV archivadas.
                    </div>
                  ) : (
                    savedQuotes.map((q) => (
                      <div
                        key={q.id}
                        onClick={() => handleLoadSavedQuote(q)}
                        className="bg-slate-50 hover:bg-slate-100/80 border border-slate-200/60 rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all"
                      >
                        <div className="space-y-1.5">
                          <div className="font-semibold text-slate-750 text-slate-800 line-clamp-1">{q.notes}</div>
                          <div className="flex gap-x-3 gap-y-1 flex-wrap text-[10px] text-slate-500 font-mono">
                            <span>{q.people.length} Aseg.</span>
                            <span>{q.forma_pago}</span>
                            <span>{q.region_zone}</span>
                            <span>{new Date(q.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => handleDeleteSavedQuote(q.id, e)}
                          className="p-1.5 px-2.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-lg shrink-0 transition-all font-sans text-[11px] cursor-pointer font-bold"
                        >
                          Eliminar
                        </button>
                      </div>
                    ))
                  )
                ) : (
                  savedBnpQuotes.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-[11px] font-mono">
                      No hay cotizaciones BNP archivadas.
                    </div>
                  ) : (
                    savedBnpQuotes.map((q) => (
                      <div
                        key={q.id}
                        onClick={() => handleLoadSavedBnpQuote(q)}
                        className="bg-slate-50 hover:bg-slate-100/80 border border-slate-200/60 rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all"
                      >
                        <div className="space-y-1.5">
                          <div className="font-semibold text-slate-755 text-slate-800 line-clamp-1">{q.notes}</div>
                          <div className="flex gap-x-3 gap-y-1 flex-wrap text-[10px] text-slate-500 font-mono">
                            <span>{q.people.length} Aseg.</span>
                            <span>{q.forma_pago}</span>
                            <span>{q.region_zone}</span>
                            <span>{new Date(q.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => handleDeleteSavedBnpQuote(q.id, e)}
                          className="p-1.5 px-2.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-lg shrink-0 transition-all font-sans text-[11px] cursor-pointer font-bold"
                        >
                          Eliminar
                        </button>
                      </div>
                    ))
                  )
                )}
              </div>
            </div>

          </div>

        </div>
        )}

      </div>
    </div>
  );
}
