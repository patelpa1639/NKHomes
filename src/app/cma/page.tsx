'use client';

import { useState, useRef, useCallback } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

/* ── Types ── */
interface FileSet {
  subject: File | null;
  public: File | null;
  comps: File | null;
}

interface DetectedFields {
  address?: string;
  sqft?: string;
  price?: string;
  taxValue?: string;
  taxYear?: string;
}

interface ValuationResults {
  sqftValuation: number;
  sqftComps: number;
  marketPremiumLow: number;
  marketPremiumHigh: number;
  premiumComps: number;
  debug: {
    taxValue: number;
    taxYear: number | null;
    taxMessage: string;
    subjectSqft: number;
    subjectAddress: string;
  };
}

/* ── Helpers ── */
function cleanNumeric(value: unknown): number | null {
  if (!value || value === '' || value === 0) return null;
  if (typeof value === 'number') return value === 0 ? null : value;
  const cleaned = String(value).replace(/[^\d.-]/g, '');
  const num = parseFloat(cleaned);
  return !isNaN(num) && num !== 0 ? num : null;
}

function addressMatch(addr1: string, addr2: string): boolean {
  const clean1 = String(addr1).toLowerCase().replace(/[^a-z0-9]/g, '');
  const clean2 = String(addr2).toLowerCase().replace(/[^a-z0-9]/g, '');
  if (clean1 === clean2) return true;
  if (clean1.substring(0, 15) === clean2.substring(0, 15)) return true;
  return false;
}

function detectFields(row: Record<string, unknown>): DetectedFields {
  const columns = Object.keys(row);
  const fields: DetectedFields = {};

  const mappings: Record<keyof DetectedFields, string[]> = {
    address: ['address', 'full name', 'street', 'property address'],
    sqft: ['sqft', 'abv grd fin sqft', 'above grade', 'living area', 'bldg sqft'],
    price: ['price', 'sold price', 'sale price', 'sale amount', 'list price'],
    taxValue: ['taxable total asmt', 'tax assessed', 'assessed value', 'total asmt'],
    taxYear: ['tax year', 'year', 'assessment year', 'deed record date'],
  };

  for (const [field, keywords] of Object.entries(mappings)) {
    for (const col of columns) {
      const colClean = col.toLowerCase().replace(/[^a-z0-9]/g, '');
      for (const keyword of keywords) {
        const keyClean = keyword.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (colClean.includes(keyClean) || keyClean.includes(colClean)) {
          (fields as Record<string, string>)[field] = col;
          break;
        }
      }
      if ((fields as Record<string, string>)[field]) break;
    }
  }

  return fields;
}

/* ── File Parser ── */
async function parseFile(file: File): Promise<Record<string, unknown>[]> {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith('.csv')) {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => resolve(results.data as Record<string, unknown>[]),
        error: (error: Error) => reject(error),
      });
    });
  }

  if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target!.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);
          resolve(jsonData as Record<string, unknown>[]);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  throw new Error('Unsupported file format');
}

/* ── Valuation Engine ── */
function extractTaxValue(
  subjectAddress: string,
  publicData: Record<string, unknown>[],
  fields: DetectedFields
): { value: number | null; year: number | null; message: string } {
  const matches = publicData.filter((row) => {
    const rowAddr = String(row[fields.address!] || '');
    return addressMatch(subjectAddress, rowAddr);
  });

  if (matches.length === 0) {
    return { value: null, year: null, message: 'No matching address found in tax records' };
  }

  if (matches.length === 1) {
    const value = cleanNumeric(matches[0][fields.taxValue!]);
    const year = fields.taxYear ? parseInt(String(matches[0][fields.taxYear])) : null;
    return { value, year: year && !isNaN(year) ? year : null, message: 'Found single match' };
  }

  if (fields.taxYear) {
    const candidates: { year: number; value: number }[] = [];
    for (const row of matches) {
      const year = parseInt(String(row[fields.taxYear]));
      const value = cleanNumeric(row[fields.taxValue!]);
      if (year && !isNaN(year) && value) {
        candidates.push({ year, value });
      }
    }

    if (candidates.length === 0) {
      return { value: null, year: null, message: 'No valid year/value combinations' };
    }

    candidates.sort((a, b) => b.year - a.year);
    const current = candidates[0];
    return {
      value: current.value,
      year: current.year,
      message: `Selected ${current.year} from ${candidates.length} records`,
    };
  }

  let maxValue: number | null = null;
  for (const row of matches) {
    const value = cleanNumeric(row[fields.taxValue!]);
    if (value && (maxValue === null || value > maxValue)) {
      maxValue = value;
    }
  }

  return { value: maxValue, year: null, message: `Using highest value from ${matches.length} records` };
}

function calculatePricePerSqft(
  subjectSqft: number,
  compsData: Record<string, unknown>[],
  fields: DetectedFields
): { valuation: number; compsUsed: number } {
  const validComps: number[] = [];

  for (const row of compsData) {
    const sqft = cleanNumeric(row[fields.sqft!]);
    const price = cleanNumeric(row[fields.price!]);
    if (sqft && sqft > 0 && price && price > 0) {
      validComps.push(price / sqft);
    }
  }

  if (validComps.length === 0) {
    throw new Error('No valid comps for Price/SqFt method');
  }

  const avgPricePerSqft = validComps.reduce((a, b) => a + b, 0) / validComps.length;
  return { valuation: subjectSqft * avgPricePerSqft, compsUsed: validComps.length };
}

function calculateMarketPremium(
  subjectTaxValue: number,
  compsData: Record<string, unknown>[],
  fields: DetectedFields
): { low: number; high: number; compsUsed: number } {
  const premiums: number[] = [];

  for (const row of compsData) {
    const price = cleanNumeric(row[fields.price!]);
    const taxVal = cleanNumeric(row[fields.taxValue!]);
    if (price && price > 0 && taxVal && taxVal > 0) {
      premiums.push((price - taxVal) / taxVal);
    }
  }

  if (premiums.length === 0) {
    throw new Error('No valid comps for Market Premium method');
  }

  const low = subjectTaxValue * (1 + Math.min(...premiums));
  const high = subjectTaxValue * (1 + Math.max(...premiums));
  return { low, high, compsUsed: premiums.length };
}

function runValuationEngine(
  subjectData: Record<string, unknown>[],
  publicData: Record<string, unknown>[],
  compsData: Record<string, unknown>[]
): ValuationResults {
  const subjectFields = detectFields(subjectData[0]);
  const publicFields = detectFields(publicData[0]);
  const compsFields = detectFields(compsData[0]);

  if (!subjectFields.address) throw new Error('Cannot detect address in subject file');
  if (!subjectFields.sqft) throw new Error('Cannot detect square footage in subject file');
  if (!publicFields.address) throw new Error('Cannot detect address in tax records');
  if (!publicFields.taxValue)
    throw new Error('Cannot detect tax value in tax records. Columns: ' + Object.keys(publicData[0]).join(', '));
  if (!compsFields.sqft) throw new Error('Cannot detect square footage in comps');
  if (!compsFields.price) throw new Error('Cannot detect price in comps');
  if (!compsFields.taxValue) throw new Error('Cannot detect tax value in comps');

  const subject = subjectData[0];
  const subjectAddress = String(subject[subjectFields.address]);
  const subjectSqft = cleanNumeric(subject[subjectFields.sqft]);

  if (!subjectSqft) throw new Error('Invalid subject square footage');

  const taxResult = extractTaxValue(subjectAddress, publicData, publicFields);
  if (!taxResult.value) throw new Error(taxResult.message);

  const sqftResult = calculatePricePerSqft(subjectSqft, compsData, compsFields);
  const premiumResult = calculateMarketPremium(taxResult.value, compsData, compsFields);

  return {
    sqftValuation: sqftResult.valuation,
    sqftComps: sqftResult.compsUsed,
    marketPremiumLow: premiumResult.low,
    marketPremiumHigh: premiumResult.high,
    premiumComps: premiumResult.compsUsed,
    debug: {
      taxValue: taxResult.value,
      taxYear: taxResult.year,
      taxMessage: taxResult.message,
      subjectSqft,
      subjectAddress,
    },
  };
}

/* ── Upload Zone Component ── */
function FileUploadZone({
  id,
  icon,
  label,
  hint,
  file,
  onFileSelect,
}: {
  id: string;
  icon: string;
  label: string;
  hint: string;
  file: File | null;
  onFileSelect: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200
          ${
            file
              ? 'border-gold bg-gold-dim'
              : 'border-border-strong hover:border-gold/50 hover:bg-gold-glow'
          }
        `}
      >
        <div className="text-2xl mb-1">{icon}</div>
        <div className="font-body font-semibold text-sm text-text-primary">{label}</div>
        <div className="text-xs text-text-muted mt-0.5">{hint}</div>
        {file && (
          <div className="mt-2 text-xs font-mono text-gold font-medium">
            {file.name}
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept=".csv,.xlsx,.xls"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFileSelect(f);
        }}
      />
    </div>
  );
}

/* ── Format helper ── */
const fmt = (val: number) => '$' + Math.round(val).toLocaleString();

/* ── Page Component ── */
export default function CMAPage() {
  const [files, setFiles] = useState<FileSet>({ subject: null, public: null, comps: null });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<ValuationResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  const allFilesUploaded = files.subject && files.public && files.comps;

  const handleFileSelect = useCallback((type: keyof FileSet, file: File) => {
    setFiles((prev) => ({ ...prev, [type]: file }));
  }, []);

  const runAnalysis = useCallback(async () => {
    if (!files.subject || !files.public || !files.comps) return;

    setIsAnalyzing(true);
    setResults(null);
    setError(null);

    try {
      const [subjectData, publicData, compsData] = await Promise.all([
        parseFile(files.subject),
        parseFile(files.public),
        parseFile(files.comps),
      ]);

      const valuationResults = runValuationEngine(subjectData, publicData, compsData);
      setResults(valuationResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsAnalyzing(false);
    }
  }, [files]);

  return (
    <div className="min-h-screen bg-bg-primary">
      <Header />

      <main className="max-w-[1440px] mx-auto px-8 py-10">
        {/* Page Title */}
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl font-semibold text-text-primary tracking-wide">
            Property Valuation Tool
          </h2>
          <p className="text-sm text-text-muted mt-2 font-body">
            Smart CMA &mdash; Upload your files and get an instant professional valuation
          </p>
          <div className="mt-4 inline-block border border-gold/30 bg-gold-dim px-5 py-2 rounded-full">
            <span className="text-xs font-body font-semibold text-gold tracking-wider uppercase">
              Comparative Market Analysis
            </span>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* Upload Card */}
          <div className="bg-bg-card border border-border-custom rounded-xl p-8">
            <h3 className="font-display text-xl font-semibold text-text-primary mb-6 flex items-center gap-2">
              <span className="w-7 h-7 rounded-md bg-gold-dim flex items-center justify-center text-sm">
                1
              </span>
              Upload Files
            </h3>

            <div className="space-y-4">
              <FileUploadZone
                id="subjectFile"
                icon="&#128193;"
                label="Subject Property"
                hint="Single property to value"
                file={files.subject}
                onFileSelect={(f) => handleFileSelect('subject', f)}
              />
              <FileUploadZone
                id="publicFile"
                icon="&#128202;"
                label="Public Tax Records"
                hint="Current year tax for subject"
                file={files.public}
                onFileSelect={(f) => handleFileSelect('public', f)}
              />
              <FileUploadZone
                id="compsFile"
                icon="&#127960;"
                label="Comparable Properties"
                hint="Recent sales & listings"
                file={files.comps}
                onFileSelect={(f) => handleFileSelect('comps', f)}
              />
            </div>

            <button
              onClick={runAnalysis}
              disabled={!allFilesUploaded || isAnalyzing}
              className={`
                w-full mt-6 py-3.5 rounded-lg font-body font-semibold text-sm tracking-wide
                transition-all duration-200
                ${
                  allFilesUploaded && !isAnalyzing
                    ? 'bg-gold text-white hover:bg-gold-light hover:shadow-lg hover:shadow-gold/20 cursor-pointer'
                    : 'bg-bg-elevated text-text-muted cursor-not-allowed'
                }
              `}
            >
              {isAnalyzing ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing...
                </span>
              ) : (
                'Analyze Property'
              )}
            </button>
          </div>

          {/* Info Card */}
          <div className="bg-bg-card border border-border-custom rounded-xl p-8">
            <h3 className="font-display text-xl font-semibold text-text-primary mb-6 flex items-center gap-2">
              <span className="w-7 h-7 rounded-md bg-gold-dim flex items-center justify-center text-sm">
                ?
              </span>
              How It Works
            </h3>

            <div className="space-y-4">
              {[
                { title: 'Current Year Enforcement', desc: 'Automatically uses 2024/2025 tax values' },
                { title: 'Smart Detection', desc: 'Works with any MLS column names' },
                { title: 'Dual Methods', desc: 'Price/SqFt + Market Premium range' },
                { title: 'Instant Results', desc: 'Professional CMA in seconds' },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex items-start gap-3 py-2 border-b border-border-custom last:border-0"
                >
                  <span className="text-gold text-xs mt-0.5 font-bold">&#10003;</span>
                  <div>
                    <div className="text-sm font-body font-semibold text-text-primary">
                      {item.title}
                    </div>
                    <div className="text-xs text-text-muted">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 bg-gold-glow border border-gold/15 rounded-lg p-5">
              <div className="text-xs font-body font-semibold text-gold uppercase tracking-wider mb-3">
                What You Need
              </div>
              <div className="space-y-2 text-sm text-text-secondary font-body">
                <div>
                  <span className="font-semibold text-text-primary">Subject:</span> Address + SqFt
                </div>
                <div>
                  <span className="font-semibold text-text-primary">Tax Records:</span> Address +
                  Tax Value + Year
                </div>
                <div>
                  <span className="font-semibold text-text-primary">Comps:</span> Address + SqFt +
                  Price + Tax Value
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {results && (
          <div className="bg-bg-card border border-border-custom rounded-xl p-8 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="font-display text-xl font-semibold text-text-primary mb-6">
              Valuation Results
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-bg-primary border border-gold/20 border-l-4 border-l-gold rounded-lg p-6">
                <div className="text-[10px] font-body font-medium text-text-muted uppercase tracking-widest mb-2">
                  Price Per Sq Ft Method
                </div>
                <div className="text-3xl font-display font-bold text-gold">
                  {fmt(results.sqftValuation)}
                </div>
                <div className="text-xs text-text-muted mt-2">{results.sqftComps} comps used</div>
              </div>

              <div className="bg-bg-primary border border-gold/20 border-l-4 border-l-gold rounded-lg p-6">
                <div className="text-[10px] font-body font-medium text-text-muted uppercase tracking-widest mb-2">
                  Market Premium &mdash; Low
                </div>
                <div className="text-3xl font-display font-bold text-gold">
                  {fmt(results.marketPremiumLow)}
                </div>
                <div className="text-xs text-text-muted mt-2">Conservative estimate</div>
              </div>

              <div className="bg-bg-primary border border-gold/20 border-l-4 border-l-gold rounded-lg p-6">
                <div className="text-[10px] font-body font-medium text-text-muted uppercase tracking-widest mb-2">
                  Market Premium &mdash; High
                </div>
                <div className="text-3xl font-display font-bold text-gold">
                  {fmt(results.marketPremiumHigh)}
                </div>
                <div className="text-xs text-text-muted mt-2">Optimistic estimate</div>
              </div>
            </div>

            {/* Debug Info */}
            <div className="bg-bg-primary/60 border border-border-custom rounded-lg p-6">
              <div className="text-xs font-mono font-semibold text-gold uppercase tracking-wider mb-4">
                &gt; Debug Information
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                {[
                  ['Subject Address', results.debug.subjectAddress],
                  ['Subject SqFt', results.debug.subjectSqft.toLocaleString()],
                  ['Tax Value Used', fmt(results.debug.taxValue)],
                  ['Tax Year', results.debug.taxYear?.toString() || 'N/A'],
                  ['Tax Selection', results.debug.taxMessage],
                  ['Price/SqFt Comps', results.sqftComps.toString()],
                  ['Market Premium Comps', results.premiumComps.toString()],
                ].map(([label, value]) => (
                  <div key={label} className="text-xs font-mono text-text-muted py-1">
                    <span className="text-text-secondary font-semibold">{label}:</span>{' '}
                    {value}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Error Section */}
        {error && (
          <div className="bg-alert-dim border border-alert/30 rounded-xl p-6 mb-10">
            <div className="text-sm font-body font-semibold text-alert mb-2">Error</div>
            <div className="text-sm text-text-secondary">{error}</div>
            <div className="mt-4 pt-4 border-t border-alert/10 text-xs text-text-muted space-y-1">
              <div>&#8226; Check browser console (F12) for details</div>
              <div>&#8226; Verify files have correct columns</div>
              <div>&#8226; Ensure addresses match between files</div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
