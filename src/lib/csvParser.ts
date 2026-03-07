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

              return {
                address: String(mapped.address).trim(),
                sale_price: parsePrice(mapped.sale_price),
                sale_date: String(mapped.sale_date).trim(),
                beds: parseNumber(mapped.beds || '0'),
                baths: parseNumber(mapped.baths || '0'),
                sqft: parseNumber(mapped.sqft || '0'),
                property_type: String(mapped.property_type || 'Unknown').trim(),
                neighborhood: String(mapped.neighborhood || 'Unknown').trim(),
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
