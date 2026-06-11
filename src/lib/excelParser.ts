import * as XLSX from 'xlsx';
import { TariffPackage, TariffRate, ClientType, InternalFactor, BnpTariffPackage, BnpTariffRate } from '../types';

export interface ParseResult {
  packageDetails: Partial<TariffPackage>;
  rates: TariffRate[];
  error?: string;
  debugLogs: string[];
}

export function parseBnvExcel(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    const debugLogs: string[] = [];
    debugLogs.push(`Iniciando lectura de archivo: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);

    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          resolve({ packageDetails: {}, rates: [], error: 'No se pudieron leer los datos del archivo.', debugLogs });
          return;
        }

        const workbook = XLSX.read(data, { type: 'array' });
        debugLogs.push(`Hojas encontradas en Excel: ${workbook.SheetNames.join(', ')}`);

        // Find sheets
        const masterSheetName = workbook.SheetNames.find(name => name.toLowerCase() === 'master') || 
                                workbook.SheetNames.find(name => name.toLowerCase().includes('master')) ||
                                workbook.SheetNames[0];

        const baseSheetName = workbook.SheetNames.find(name => name.toLowerCase() === 'masterbase') || 
                              workbook.SheetNames.find(name => name.toLowerCase().includes('base')) ||
                              workbook.SheetNames.find(name => name.toLowerCase().includes('tarif')) ||
                              workbook.SheetNames[1] || workbook.SheetNames[0];

        debugLogs.push(`Utilizando hoja de configuración: "${masterSheetName}"`);
        debugLogs.push(`Utilizando hoja de tarifas: "${baseSheetName}"`);

        const masterSheet = workbook.Sheets[masterSheetName];
        const baseSheet = workbook.Sheets[baseSheetName];

        if (!baseSheet) {
          resolve({ packageDetails: {}, rates: [], error: `No se encontró la hoja de tarifas "${baseSheetName}" en el Excel.`, debugLogs });
          return;
        }

        // 1. Parse Derecho de Póliza
        // Usually located at Master!U3. In SheetJS key is 'U3'
        let derecho_poliza = 1600;
        if (masterSheet && masterSheet['U3']) {
          const val = Number(masterSheet['U3'].v);
          if (!isNaN(val) && val > 0) {
            derecho_poliza = val;
            debugLogs.push(`Derecho de póliza encontrado en ${masterSheetName}!U3: $${derecho_poliza}`);
          }
        } else {
          debugLogs.push(`Celda U3 no encontrada en "${masterSheetName}". Usando valor default $1600.`);
        }

        // 2. Parse Asistencia Extranjero
        // Usually is 1632 in BNV. Let's look for cell or use standard 1632
        // We'll search Master for any cells containing "Asistencia" or "Extranjero" and get value, or fallback to 1632
        let asistencia_extranjero = 1632;
        let foundAsistencia = false;
        if (masterSheet) {
          // Search first 50 rows, 26 columns for "asistencia"
          for (let r = 1; r <= 50; r++) {
            for (let c = 0; c < 26; c++) {
              const cellRef = XLSX.utils.encode_cell({ r, c });
              const cell = masterSheet[cellRef];
              if (cell && typeof cell.v === 'string' && cell.v.toLowerCase().includes('asistencia')) {
                // Check cell to the right or below
                const nextCellRef = XLSX.utils.encode_cell({ r, c: c + 1 });
                const nextCell = masterSheet[nextCellRef];
                if (nextCell && !isNaN(Number(nextCell.v))) {
                  asistencia_extranjero = Number(nextCell.v);
                  foundAsistencia = true;
                  debugLogs.push(`Asistencia extranjero encontrada en celda adyacente a "${cell.v}" (${nextCellRef}): $${asistencia_extranjero}`);
                  break;
                }
              }
            }
            if (foundAsistencia) break;
          }
        }
        if (!foundAsistencia) {
          debugLogs.push(`No se localizó celda para 'Asistencia Extranjero'. Usando valor oficial: $1632.`);
        }

        // 3. Parse Factores Internos (Master!W3:W15)
        const internal_factors: InternalFactor[] = [];
        if (masterSheet) {
          for (let r = 2; r < 15; r++) { // rows 3 to 15 (0-indexed: 2 to 14)
            const nameCell = masterSheet[XLSX.utils.encode_cell({ r, c: 21 })]; // Col V (index 21)
            const valueCell = masterSheet[XLSX.utils.encode_cell({ r, c: 22 })]; // Col W (index 22)
            
            const name = nameCell?.v ? String(nameCell.v).trim() : `Factor W${r+1}`;
            const value = valueCell?.v ? Number(valueCell.v) : null;
            
            if (value !== null && !isNaN(value)) {
              internal_factors.push({ factor_name: name, value });
            }
          }
          debugLogs.push(`Se extrajeron ${internal_factors.length} factores internos desde W3:W15.`);
        }

        // 4. Parse Tariff Rates table from MasterBase!M3:Q91282
        // MasterBase can be quite large, so let's iterate row by row from index 2 (row 3) to row 91282 or sheet limit.
        const rates: TariffRate[] = [];
        
        // Let's inspect the sheet range to know where to read
        const rangeRef = baseSheet['!ref'] || 'A1:Z100000';
        const range = XLSX.utils.decode_range(rangeRef);
        
        // Start row 2 (which is row 3 in Excel)
        const startRow = 2;
        const endRow = Math.min(range.e.r, 91282); // Cap at 91282 as specified
        
        debugLogs.push(`Rango de filas para tarifas detectado: ${startRow + 1} a ${endRow + 1}`);

        // Helper sets to dynamically build catalogs from read rows
        const sumasSet = new Set<number>();
        const deduciblesSet = new Set<number>();
        const coasegurosSet = new Set<number>();
        const topesSet = new Set<number>();

        for (let r = startRow; r <= endRow; r++) {
          // Columns M=12, N=13, O=14, P=15, Q=16
          const cellM = baseSheet[XLSX.utils.encode_cell({ r, c: 12 })]; // M
          const cellN = baseSheet[XLSX.utils.encode_cell({ r, c: 13 })]; // N
          const cellO = baseSheet[XLSX.utils.encode_cell({ r, c: 14 })]; // O
          const cellP = baseSheet[XLSX.utils.encode_cell({ r, c: 15 })]; // P
          const cellQ = baseSheet[XLSX.utils.encode_cell({ r, c: 16 })]; // Q

          const lookupKey = cellM?.v ? String(cellM.v).trim() : '';
          const planName = cellN?.v ? String(cellN.v).trim() : lookupKey;
          const region = cellO?.v ? String(cellO.v).trim() : '';
          const ageVal = cellP?.v !== undefined ? Number(cellP.v) : NaN;
          const rateVal = cellQ?.v !== undefined ? Number(cellQ.v) : NaN;

          if (!lookupKey || !region || isNaN(ageVal) || isNaN(rateVal)) {
            // Skip empty or invalid rows
            continue;
          }

          rates.push({
            package_id: '', // Will be assigned during save
            lookup_key: lookupKey,
            plan_name: planName,
            region,
            age: ageVal,
            rate: rateVal
          });

          // Extract metrics to populate local catalogs if possible
          // Format expected: NVFS[SA]D[Deducible]C[Coaseguro]TC[Tope] or NVFS[SA]D[Deducible]C[Coaseguro]
          // e.g. NVFS3D100C10TC30
          const saMatch = lookupKey.match(/NVFS(\d+)/);
          if (saMatch) {
            sumasSet.add(parseInt(saMatch[1], 10) * 1000000);
          }
          const dMatch = lookupKey.match(/D(\d+)/);
          if (dMatch) {
            deduciblesSet.add(parseInt(dMatch[1], 10) * 1000);
          }
          const cMatch = lookupKey.match(/C(\d+)/);
          if (cMatch) {
            coasegurosSet.add(parseInt(cMatch[1], 10));
          }
          const tcMatch = lookupKey.match(/TC(\d+)/);
          if (tcMatch) {
            topesSet.add(parseInt(tcMatch[1], 10) * 1000);
          } else {
            topesSet.add(0);
          }
        }

        debugLogs.push(`Total de primas procesadas con éxito: ${rates.length}`);

        // Default catalogs if none were read or parsed
        const finalSumas = sumasSet.size > 0 ? Array.from(sumasSet).sort((a,b)=>a-b) : [1000000, 2000000, 3000000, 4000000, 5000000, 10000000];
        const finalDedu = deduciblesSet.size > 0 ? Array.from(deduciblesSet).sort((a,b)=>a-b) : [0, 15000, 20000, 30000, 50000, 100000];
        const finalCoas = coasegurosSet.size > 0 ? Array.from(coasegurosSet).sort((a,b)=>a-b) : [0, 10, 20];
        const finalTopes = topesSet.size > 0 ? Array.from(topesSet).sort((a,b)=>a-b) : [0, 30000, 40000];

        // Seed default client types
        const client_types: ClientType[] = [
          { client_type: 'Individual / Familiar', discount_factor: 1.0 },
          { client_type: 'Preferente Colectivo', discount_factor: 0.92 },
          { client_type: 'Corporativo Premium', discount_factor: 0.85 }
        ];

        const packageDetails: Partial<TariffPackage> = {
          derecho_poliza,
          asistencia_extranjero,
          internal_factors,
          sumas_aseguradas: finalSumas,
          deducibles: finalDedu,
          coaseguros: finalCoas,
          topes_coaseguro: finalTopes,
          client_types,
          rates_count: rates.length
        };

        debugLogs.push(`Catálogos extraídos:`);
        debugLogs.push(`- Sumas Aseguradas: ${finalSumas.map(s => `$${(s/1000000).toFixed(0)}M`).join(', ')}`);
        debugLogs.push(`- Deducibles: ${finalDedu.map(d => `$${d.toLocaleString()}`).join(', ')}`);
        debugLogs.push(`- Coaseguros: ${finalCoas.map(c => `${c}%`).join(', ')}`);
        debugLogs.push(`- Topes Coaseguro: ${finalTopes.map(t => `$${t.toLocaleString()}`).join(', ')}`);

        resolve({ packageDetails, rates, debugLogs });

      } catch (err: any) {
        debugLogs.push(`Error grave durante procesamiento de Excel: ${err?.message || err}`);
        resolve({ packageDetails: {}, rates: [], error: `Fallo al procesar el Excel: ${err?.message || err}`, debugLogs });
      }
    };

    reader.onerror = () => {
      resolve({ packageDetails: {}, rates: [], error: 'Error al abrir el archivo de Excel.', debugLogs });
    };

    reader.readAsArrayBuffer(file);
  });
}

// ==========================================
// Bupa Nacional Plus (BNP) Excel Parser
// ==========================================

export interface BnpParseResult {
  packageDetails: Partial<BnpTariffPackage>;
  rates: BnpTariffRate[];
  error?: string;
  debugLogs: string[];
}

export function parseBnpExcel(file: File): Promise<BnpParseResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    const debugLogs: string[] = [];
    debugLogs.push(`Iniciando lectura de archivo BNP: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);

    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          resolve({ packageDetails: {}, rates: [], error: 'No se pudieron leer los datos del archivo.', debugLogs });
          return;
        }

        const workbook = XLSX.read(data, { type: 'array' });
        debugLogs.push(`Hojas encontradas en Excel: ${workbook.SheetNames.join(', ')}`);

        // Validate critical sheets existence
        const criticalSheets = [
          'Datos Asegurado',
          'Master',
          'MasterBase',
          'Comparativo',
          'Template PDF',
          'Template PDF Comparativo',
          'Versión'
        ];

        const sheetNamesInWb = workbook.SheetNames.map(s => s.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
        const missingCritical: string[] = [];

        for (const critical of criticalSheets) {
          const normCritical = critical.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          if (!sheetNamesInWb.some(s => s === normCritical || s.includes(normCritical))) {
            missingCritical.push(critical);
          }
        }

        if (missingCritical.length > 0) {
          debugLogs.push(`❌ RECHAZADO: Faltan hojas del cotizador BNP: ${missingCritical.join(', ')}`);
          resolve({
            packageDetails: {},
            rates: [],
            error: `Rechazado: El Excel no contiene todas las hojas críticas requeridas para Bupa Nacional Plus. Faltan: ${missingCritical.join(', ')}`,
            debugLogs
          });
          return;
        }

        // Locate sheet references case insensitively
        const findSheetRef = (target: string) => {
          const normTarget = target.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          return workbook.SheetNames.find(name => {
            const normName = name.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            return normName === normTarget || normName.includes(normTarget);
          }) || workbook.SheetNames[0];
        };

        const masterSheetName = findSheetRef('Master');
        const masterBaseSheetName = findSheetRef('MasterBase');

        debugLogs.push(`Hoja de configuración BNP: "${masterSheetName}"`);
        debugLogs.push(`Hoja de tarifas BNP: "${masterBaseSheetName}"`);

        const masterSheet = workbook.Sheets[masterSheetName];
        const masterBaseSheet = workbook.Sheets[masterBaseSheetName];

        // 1. Derecho de póliza from Master!U3
        let derecho_poliza = 1600;
        if (masterSheet && masterSheet['U3']) {
          const val = Number(masterSheet['U3'].v);
          if (!isNaN(val) && val > 0) {
            derecho_poliza = val;
            debugLogs.push(`Derecho de póliza BNP extraído de U3: $${derecho_poliza}`);
          }
        } else {
          debugLogs.push(`U3 no encontrada, usando derecho póliza default: $1600`);
        }

        // 2. Parse Factores Internos (Master!W3:W15)
        const internal_factors: InternalFactor[] = [];
        if (masterSheet) {
          for (let r = 2; r < 15; r++) { // rows 3 to 15 (0-indexed 2 to 14)
            const nameCell = masterSheet[XLSX.utils.encode_cell({ r, c: 21 })]; // V
            const valueCell = masterSheet[XLSX.utils.encode_cell({ r, c: 22 })]; // W
            const name = nameCell?.v ? String(nameCell.v).trim() : `Factor BNP W${r+1}`;
            const value = valueCell?.v !== undefined ? Number(valueCell.v) : null;
            if (value !== null && !isNaN(value)) {
              internal_factors.push({ factor_name: name, value });
            }
          }
          debugLogs.push(`Se cargaron ${internal_factors.length} factores desde W3:W15.`);
        }

        // 3. Client types from Master!I3:J5
        const client_types: ClientType[] = [];
        if (masterSheet) {
          for (let r = 2; r <= 4; r++) { // rows 3 to 5
            const nameCell = masterSheet[XLSX.utils.encode_cell({ r, c: 8 })]; // I
            const valCell = masterSheet[XLSX.utils.encode_cell({ r, c: 9 })]; // J
            if (nameCell?.v) {
              const name = String(nameCell.v).trim();
              const val = valCell?.v !== undefined ? Number(valCell.v) : 1.0;
              client_types.push({ client_type: name, discount_factor: val });
            }
          }
        }
        if (client_types.length === 0) {
          client_types.push(
            { client_type: 'Nuevo negocio', discount_factor: 0.95 },
            { client_type: 'Nuevo negocio - con periodos de espera', discount_factor: 0.89 },
            { client_type: 'Transfer Bupa Internacional', discount_factor: 1.0 }
          );
        }
        debugLogs.push(`Tipos de clientes detectados: ${client_types.map(c => `${c.client_type} (${c.discount_factor})`).join(', ')}`);

        // 4. Parse Tariff rates table MasterBase!M3:R[last]
        const rates: BnpTariffRate[] = [];
        const rangeRef = masterBaseSheet['!ref'] || 'A1:Z300000';
        const range = XLSX.utils.decode_range(rangeRef);
        const startRow = 2; // row 3 is index 2
        // Find last populated row dynamically
        let endRow = range.e.r;
        debugLogs.push(`Rango total de filas en MasterBase detectado: ${startRow+1} a ${endRow+1}`);

        const sumasSet = new Set<number>();
        const deduciblesSet = new Set<number>();
        const coasegurosSet = new Set<number>();

        for (let r = startRow; r <= endRow; r++) {
          const cellM = masterBaseSheet[XLSX.utils.encode_cell({ r, c: 12 })]; // M - Lookup key
          const cellN = masterBaseSheet[XLSX.utils.encode_cell({ r, c: 13 })]; // N - Plan name
          const cellO = masterBaseSheet[XLSX.utils.encode_cell({ r, c: 14 })]; // O - Region
          const cellP = masterBaseSheet[XLSX.utils.encode_cell({ r, c: 15 })]; // P - Age
          const cellQ = masterBaseSheet[XLSX.utils.encode_cell({ r, c: 16 })]; // Q - Rate
          const cellR = masterBaseSheet[XLSX.utils.encode_cell({ r, c: 17 })]; // R - RateType (Male/Female)

          const lookupKey = cellM?.v ? String(cellM.v).trim() : '';
          const planName = cellN?.v ? String(cellN.v).trim() : '';
          const region = cellO?.v ? String(cellO.v).trim() : '';
          const ageVal = cellP?.v !== undefined ? Number(cellP.v) : NaN;
          const rateVal = cellQ?.v !== undefined ? Number(cellQ.v) : NaN;
          const genderStr = cellR?.v ? String(cellR.v).trim() : '';

          if (!lookupKey || !region || isNaN(ageVal) || isNaN(rateVal) || !genderStr) {
            continue;
          }

          const rateType: 'Male' | 'Female' = (genderStr.toLowerCase().includes('female') || genderStr.toLowerCase() === 'femenino') 
            ? 'Female' 
            : 'Male';

          rates.push({
            package_id: '',
            lookup_key: lookupKey,
            plan_name: planName,
            region,
            age: ageVal,
            rate: rateVal,
            rate_type: rateType
          });

          // Parse metrics from plan code to populate available catalogs
          // e.g. NPS50D35C10 or NPS20D55C20
          const saMatch = planName.match(/NPS(\d+)/);
          if (saMatch) {
            sumasSet.add(parseInt(saMatch[1], 10) * 1000000);
          }
          const dMatch = planName.match(/D(\d+)/);
          if (dMatch) {
            deduciblesSet.add(parseInt(dMatch[1], 10) * 1000);
          }
          const cMatch = planName.match(/C(\d+)/);
          if (cMatch) {
            coasegurosSet.add(parseInt(cMatch[1], 10));
          }
        }

        debugLogs.push(`Procesamiento finalizado. Se obtuvieron ${rates.length} registros de MasterBase.`);

        const finalSumas = sumasSet.size > 0 ? Array.from(sumasSet).sort((a,b)=>a-b) : [5000000, 10000000, 20000000, 50000000];
        const finalDedu = deduciblesSet.size > 0 ? Array.from(deduciblesSet).sort((a,b)=>a-b) : [17000, 35000, 55000, 75000, 115000, 200000];
        const finalCoas = coasegurosSet.size > 0 ? Array.from(coasegurosSet).sort((a,b)=>a-b) : [0, 10, 20];

        const packageDetails: Partial<BnpTariffPackage> = {
          product: 'BUPA_NACIONAL_PLUS',
          derecho_poliza,
          asistencia_extranjero: 1632, // standard constant found in prompt
          costo_enfermedades_catastroficas_extranjero: 5800, // standard constant
          sumas_aseguradas: finalSumas,
          deducibles: finalDedu,
          coaseguros: finalCoas,
          client_types,
          internal_factors,
          rates_count: rates.length
        };

        resolve({ packageDetails, rates, debugLogs });

      } catch (err: any) {
        debugLogs.push(`Error al analizar Excel: ${err?.message || err}`);
        resolve({ packageDetails: {}, rates: [], error: `Fallo durante el parseo: ${err?.message || err}`, debugLogs });
      }
    };

    reader.onerror = () => {
      resolve({ packageDetails: {}, rates: [], error: 'Error al abrir el archivo.', debugLogs });
    };

    reader.readAsArrayBuffer(file);
  });
}

// Generate simple hash from string
export function generateSimpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return 'BNV_HASH_' + Math.abs(hash).toString(16).toUpperCase();
}
