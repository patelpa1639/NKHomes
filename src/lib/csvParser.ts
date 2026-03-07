import Papa from 'papaparse';
import { RawLead } from './types';

const COLUMN_MAPPINGS: Record<string, string[]> = {
  address: ['address', 'street address', 'property address', 'full address', 'street', 'location'],
  sale_price: [
    'sale price',
    'sold price',
    'close price',
    'selling price',
    'list price',
    'current price',
    'price',
    'original price',
    'saleprice',
    'soldprice',
    'closeprice',
  ],
  sale_date: [
    'close date',
    'sale date',
    'sold date',
    'closing date',
    'settlement date',
    'status contractual search date',
    'closedate',
    'saledate',
    'solddate',
  ],
  beds: ['beds', 'bedrooms', 'br', 'bed', 'total bedrooms', 'bedroom count'],
  baths: ['baths', 'bathrooms', 'ba', 'bath', 'total bathrooms', 'total baths', 'bathroom count'],
  sqft: [
    'sq ft',
    'sqft',
    'square feet',
    'square footage',
    'living area',
    'total sqft',
    'total sq ft',
    'approx sq ft',
    'above grade sqft',
    'above grade finished sqft',
  ],
  property_type: [
    'property type',
    'type',
    'prop type',
    'style',
    'home type',
    'propertytype',
    'dwelling type',
  ],
  neighborhood: [
    'neighborhood',
    'subdivision',
    'city',
    'community',
    'area',
    'subdivision/neighborhood',
    'subdivision name',
    'sub-division',
  ],
  tax_assessed_value: [
    'tax assessed value',
    'assessed value',
    'tax value',
    'tax assessment',
    'assessed',
  ],
};

function normalizeColumnName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
}

function findMapping(csvColumn: string): string | null {
  const normalized = normalizeColumnName(csvColumn);
  for (const [field, variations] of Object.entries(COLUMN_MAPPINGS)) {
    if (variations.some((v) => normalized.includes(v) || v.includes(normalized))) {
      return field;
    }
  }
  return null;
}

function parsePrice(value: string | number): number {
  if (typeof value === 'number') return value;
  return parseFloat(value.replace(/[$,\s]/g, '')) || 0;
}

function parseNumber(value: string | number): number {
  if (typeof value === 'number') return value;
  return parseFloat(value.replace(/[,\s]/g, '')) || 0;
}

function parseBaths(value: string | number): number {
  if (typeof value === 'number') return value;
  // Handle "4/1" format (full baths / half baths) from Bright MLS
  if (value.includes('/')) {
    const parts = value.split('/');
    const full = parseFloat(parts[0]) || 0;
    const half = parseFloat(parts[1]) || 0;
    return full + half * 0.5;
  }
  return parseFloat(value.replace(/[,\s]/g, '')) || 0;
}

export function parseCSV(file: File): Promise<RawLead[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const headers = results.meta.fields || [];
          const columnMap: Record<string, string> = {};

          headers.forEach((header) => {
            const mapping = findMapping(header);
            if (mapping) {
              columnMap[header] = mapping;
            }
          });

          // Also grab raw city/zip columns for address enrichment
          const cityCol = headers.find((h) => normalizeColumnName(h) === 'city');
          const zipCol = headers.find((h) => normalizeColumnName(h).includes('zip'));

          const leads: RawLead[] = (results.data as Record<string, string>[])
            .map((row: Record<string, string>) => {
              const mapped: Record<string, string | number> = {};

              Object.entries(row).forEach(([key, value]) => {
                const field = columnMap[key];
                if (field) {
                  mapped[field] = value;
                }
              });

              if (!mapped.address || !mapped.sale_price || !mapped.sale_date) {
                return null;
              }

              // Enrich address with city/zip if not already included
              let address = String(mapped.address).trim();
              const city = cityCol ? (row[cityCol] || '').trim() : '';
              const zip = zipCol ? (row[zipCol] || '').trim() : '';
              if (city && !address.toLowerCase().includes(city.toLowerCase())) {
                address += `, ${city}`;
              }
              if (zip && !address.includes(zip)) {
                address += ` VA ${zip}`;
              }

              const taxVal = mapped.tax_assessed_value
                ? parsePrice(mapped.tax_assessed_value)
                : 0;

              return {
                address,
                sale_price: parsePrice(mapped.sale_price),
                sale_date: String(mapped.sale_date).trim(),
                beds: parseNumber(mapped.beds || '0'),
                baths: parseBaths(mapped.baths || '0'),
                sqft: parseNumber(mapped.sqft || '0'),
                property_type: String(mapped.property_type || 'Unknown').trim(),
                neighborhood: String(mapped.neighborhood || 'Unknown').trim(),
                tax_assessed_value: taxVal,
              } as RawLead;
            })
            .filter(Boolean) as RawLead[];

          resolve(leads);
        } catch (error) {
          reject(error);
        }
      },
      error: (error: Error) => {
        reject(error);
      },
    });
  });
}
