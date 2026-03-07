import { Lead } from './types';
import { OutreachStatus } from './types';

export function exportLeadsToCSV(
  leads: Lead[],
  getOutreach: (address: string) => OutreachStatus
): void {
  const headers = [
    'Score',
    'Score Tier',
    'Address',
    'Neighborhood',
    'Sale Price',
    'Sale Year',
    'ARM Type (5/1) Reset',
    'ARM Type (7/1) Reset',
    'Est. Current Value',
    'Est. Equity',
    'Beds',
    'Baths',
    'Sq Ft',
    'Property Type',
    'Postcard Sent',
    'Email Sent',
    'Text/Called',
    'High Priority',
    'Notes',
  ];

  const rows = leads.map((lead) => {
    const outreach = getOutreach(lead.address);
    return [
      lead.score,
      lead.score_tier.toUpperCase(),
      `"${lead.address}"`,
      lead.neighborhood,
      lead.sale_price,
      lead.sale_year,
      lead.arm5_reset_year,
      lead.arm7_reset_year,
      lead.estimated_value,
      lead.equity,
      lead.beds,
      lead.baths,
      lead.sqft,
      lead.property_type,
      outreach.postcard ? 'Yes' : 'No',
      outreach.email ? 'Yes' : 'No',
      outreach.text ? 'Yes' : 'No',
      outreach.priority ? 'Yes' : 'No',
      `"${outreach.notes.replace(/"/g, '""')}"`,
    ].join(',');
  });

  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `nkhomes-leads-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
