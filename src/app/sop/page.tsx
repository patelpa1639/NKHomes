'use client';

import { useRef } from 'react';

const SOP_SECTIONS = [
  {
    title: 'Overview',
    content: `This Standard Operating Procedure outlines the complete workflow for identifying, scoring, and converting ARM (Adjustable-Rate Mortgage) reset leads in Loudoun and Fairfax County, Virginia. The system targets homeowners who purchased properties in 2019-2022 with 5/1 or 7/1 ARM mortgages that are approaching their reset dates — a critical financial inflection point where proactive outreach can provide significant value.`,
  },
  {
    title: 'Step 1 — Data Export from Bright MLS',
    steps: [
      'Log into Bright MLS (brightmls.com)',
      'Navigate to the search/reports section',
      'Set filters: Close Date between January 2019 – December 2022',
      'Set location filters: Loudoun County and/or Fairfax County, VA',
      'Target neighborhoods: Ashburn, Aldie, Brambleton, South Riding',
      'Property types: Single Family, Townhome',
      'Export results as CSV with columns: Address, Sale Price, Close Date, Beds, Baths, Sq Ft, Property Type, City/Subdivision',
      'Save the CSV file to your computer',
    ],
  },
  {
    title: 'Step 2 — Upload & Score Leads',
    steps: [
      'Open the NK Homes ARM Lead Intelligence dashboard',
      'Drag and drop the exported CSV file onto the upload zone (or click to browse)',
      'The system will automatically parse, map columns, and score all leads',
      'Review the auto-populated stats bar for a quick overview of the batch',
      'Note: Re-uploading a CSV preserves all existing outreach data and notes',
    ],
  },
  {
    title: 'Step 3 — Lead Scoring Logic',
    content: 'Each lead is scored on a 0–100 point scale based on three factors:',
    table: [
      ['Factor', 'Condition', 'Points'],
      ['Equity', 'Over $300,000', '50'],
      ['Equity', '$200,000–$300,000', '30'],
      ['Equity', '$100,000–$200,000', '15'],
      ['ARM Reset Timing', 'Resets THIS year', '40'],
      ['ARM Reset Timing', 'Resets NEXT year', '20'],
      ['ARM Reset Timing', 'Resets in 2–3 years', '10'],
      ['Neighborhood', 'Target neighborhood match', '10'],
    ],
    footer: 'Score Tiers: HIGH PRIORITY (80–100) | WARM (50–79) | MONITOR (0–49)',
  },
  {
    title: 'Step 4 — Prioritize & Filter',
    steps: [
      'Sort leads by score (highest first) — this is the default view',
      'Use filters to focus on specific segments: ARM type, reset year, neighborhood',
      'Click on any row to expand and see the full score breakdown and equity calculation',
      'Mark high-value leads as "High Priority" using the star toggle in the expanded view',
      'Use the search bar to quickly find specific addresses',
    ],
  },
  {
    title: 'Step 5 — Generate Postcards',
    steps: [
      'Navigate to the Postcard Designer from the dashboard',
      'Select a lead from the dropdown — the system auto-fills property data',
      'Choose a postcard style: Classic, Modern, or Bold',
      'Customize the headline and body text using templates or write your own',
      'The QR code automatically links to your Home Value landing page',
      'Click "Print / Save PDF" to generate print-ready postcards (6" x 4" format)',
      'Send postcards to a local printer or use a direct mail service',
    ],
  },
  {
    title: 'Step 6 — Three-Touch Outreach',
    content: 'Each lead receives three outreach touches. Track completion in the dashboard:',
    touches: [
      {
        code: 'P',
        name: 'Postcard',
        timing: 'Week 1',
        detail: 'Send the branded postcard with QR code linking to the home value landing page. Target neighborhoods first.',
      },
      {
        code: 'E',
        name: 'Email',
        timing: 'Week 2',
        detail: 'Send a personalized email referencing recent sales in their neighborhood. Include a link to the home value page.',
      },
      {
        code: 'T',
        name: 'Text / Call',
        timing: 'Week 3',
        detail: 'Follow up with a phone call or text message. Reference the postcard and email. Offer a complimentary CMA.',
      },
    ],
  },
  {
    title: 'Step 7 — Track Responses',
    steps: [
      'Check the Home Value Submissions section on the dashboard for new form entries',
      'Mark submission status as "Contacted" once you\'ve reached out',
      'Mark as "Converted" when they become a client',
      'Add detailed notes in the expanded lead view for each interaction',
      'Filter by outreach status to quickly find untouched leads or follow-ups',
    ],
  },
  {
    title: 'Step 8 — Export & Report',
    steps: [
      'Use the "Export CSV" button to download your current filtered lead list',
      'The export includes all scores, property data, outreach status, and notes',
      'Use for monthly reporting, team reviews, or importing into other CRM systems',
      'Re-run the process monthly with fresh MLS data to capture new leads',
    ],
  },
  {
    title: 'Key Metrics to Track',
    table: [
      ['Metric', 'Target', 'Frequency'],
      ['New leads uploaded', '50–200 per batch', 'Monthly'],
      ['High priority leads', '10–20% of batch', 'Per upload'],
      ['Postcards sent', '100% of high priority', 'Weekly'],
      ['Response rate', '2–5% of postcards', 'Monthly'],
      ['Conversions', '1–2 per month', 'Monthly'],
      ['Average days to contact', 'Within 24 hours', 'Per submission'],
    ],
  },
  {
    title: 'Target Markets',
    content: `Primary focus areas in Loudoun and Fairfax County, Virginia. These neighborhoods have high concentrations of 2019–2022 purchases with strong appreciation, making them ideal for ARM reset outreach.`,
    list: [
      'Ashburn — High volume of single-family homes, strong appreciation',
      'Aldie — Luxury market, high equity potential',
      'Brambleton — Mix of townhomes and single-family, active market',
      'South Riding — Growing community, strong resale values',
    ],
  },
];

export default function SOPPage() {
  const sopRef = useRef<HTMLDivElement>(null);

  const handleExport = () => {
    if (!sopRef.current) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>NK Homes — ARM Lead Intelligence SOP</title>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Inter', sans-serif; color: #1a1a1a; background: white; padding: 48px; max-width: 800px; margin: 0 auto; font-size: 13px; line-height: 1.7; }
          @media print { body { padding: 24px; } @page { margin: 0.75in; } }
          h1 { font-family: 'Playfair Display', serif; font-size: 28px; margin-bottom: 4px; }
          h2 { font-family: 'Playfair Display', serif; font-size: 18px; margin: 32px 0 12px; padding-bottom: 8px; border-bottom: 1px solid #e0e0e0; }
          p { margin-bottom: 12px; color: #444; }
          ol, ul { margin: 8px 0 16px 20px; color: #444; }
          li { margin-bottom: 6px; }
          table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 12px; }
          th { background: #f5f5f0; text-align: left; padding: 8px 12px; font-weight: 600; border: 1px solid #e0e0e0; }
          td { padding: 8px 12px; border: 1px solid #e0e0e0; }
          .touch-card { background: #f9f8f5; border: 1px solid #e8e6e0; padding: 16px; margin-bottom: 12px; }
          .touch-code { display: inline-block; width: 24px; height: 24px; background: #d4a853; color: white; font-weight: 700; font-size: 11px; text-align: center; line-height: 24px; margin-right: 12px; }
          .footer-note { font-size: 11px; color: #999; margin-top: 40px; padding-top: 16px; border-top: 1px solid #e0e0e0; }
        </style>
      </head>
      <body>${sopRef.current.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
      <div className="bg-bg-elevated/80 backdrop-blur-xl border-b border-border-custom">
        <div className="max-w-[1440px] mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
              <div className="relative w-9 h-9 border border-gold/50 flex items-center justify-center bg-gold/5">
                <span className="font-display text-sm font-bold text-gold tracking-wider">NK</span>
              </div>
              <span className="font-display text-lg font-semibold text-text-primary tracking-[0.04em]">NK HOMES</span>
            </a>
            <span className="text-border-strong mx-2">/</span>
            <span className="text-[11px] text-gold/80 font-body font-medium tracking-[0.1em] uppercase">Standard Operating Procedure</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" className="text-[11px] text-text-muted font-body hover:text-text-secondary transition-colors">Dashboard</a>
            <span className="text-border-strong">&middot;</span>
            <a href="/postcard" className="text-[11px] text-text-muted font-body hover:text-text-secondary transition-colors">Postcards</a>
            <span className="text-border-strong">&middot;</span>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 bg-gold/[0.08] border border-gold/20 text-gold/90 text-[11px] font-body font-semibold px-4 py-1.5 hover:bg-gold/[0.15] hover:border-gold/30 transition-all tracking-[0.08em] uppercase"
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <path d="M8 11V1M4 7l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
                <path d="M2 12v2h12v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
              </svg>
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* SOP Content */}
      <div className="flex-1 max-w-3xl mx-auto px-8 py-12 w-full">
        <div ref={sopRef}>
          {/* Title Block */}
          <div className="mb-10">
            <p className="text-[10px] text-gold/70 tracking-[0.2em] uppercase font-body font-semibold mb-3">Standard Operating Procedure</p>
            <h1 className="font-display text-4xl text-text-primary mb-2">ARM Lead Intelligence</h1>
            <p className="font-display text-lg text-text-muted">NK Homes &middot; Neena Kalra</p>
            <div className="h-px bg-gradient-to-r from-gold/30 to-transparent mt-6" />
          </div>

          {/* Sections */}
          {SOP_SECTIONS.map((section, idx) => (
            <div key={idx} className="mb-10">
              <h2 className="font-display text-xl text-text-primary mb-4 pb-2 border-b border-border-custom">
                {section.title}
              </h2>

              {section.content && (
                <p className="text-[13px] text-text-secondary font-body leading-relaxed mb-4">
                  {section.content}
                </p>
              )}

              {section.steps && (
                <ol className="list-decimal list-outside ml-5 space-y-2">
                  {section.steps.map((step, i) => (
                    <li key={i} className="text-[13px] text-text-secondary font-body leading-relaxed pl-1">
                      {step}
                    </li>
                  ))}
                </ol>
              )}

              {section.list && (
                <ul className="space-y-2 mt-3">
                  {section.list.map((item, i) => (
                    <li key={i} className="text-[13px] text-text-secondary font-body leading-relaxed flex items-start gap-2">
                      <span className="text-gold mt-1">&bull;</span>
                      {item}
                    </li>
                  ))}
                </ul>
              )}

              {section.table && (
                <div className="overflow-x-auto mt-3">
                  <table className="w-full text-[12px] font-body">
                    <thead>
                      <tr>
                        {section.table[0].map((header, i) => (
                          <th key={i} className="text-left px-3 py-2 bg-bg-card/60 border border-border-custom text-text-muted font-semibold tracking-wider uppercase text-[10px]">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {section.table.slice(1).map((row, i) => (
                        <tr key={i}>
                          {row.map((cell, j) => (
                            <td key={j} className="px-3 py-2 border border-border-custom text-text-secondary">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {section.footer && (
                <p className="text-[11px] text-gold/70 font-body font-medium mt-3 tracking-wider">
                  {section.footer}
                </p>
              )}

              {section.touches && (
                <div className="space-y-3 mt-3">
                  {section.touches.map((touch) => (
                    <div key={touch.code} className="bg-bg-card/40 border border-border-custom p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 bg-gold text-bg-primary flex items-center justify-center text-[11px] font-bold flex-shrink-0">
                          {touch.code}
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-[13px] text-text-primary font-body font-semibold">{touch.name}</span>
                            <span className="text-[10px] text-gold/60 font-body tracking-wider uppercase">{touch.timing}</span>
                          </div>
                          <p className="text-[12px] text-text-secondary font-body leading-relaxed">{touch.detail}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Footer */}
          <div className="mt-12 pt-6 border-t border-border-custom">
            <p className="text-[11px] text-text-muted font-body">
              NK Homes &middot; Brokered by Samson Properties &middot; Loudoun &amp; Fairfax County, VA
            </p>
            <p className="text-[10px] text-text-muted/50 font-body mt-1">
              Document generated from NK Homes ARM Lead Intelligence System
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
