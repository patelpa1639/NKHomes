'use client';

import { useState, useCallback } from 'react';
import { Lead, SortField, SortDirection, OutreachStatus } from '@/lib/types';

interface LeadTableProps {
  leads: Lead[];
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  getOutreach: (address: string) => OutreachStatus;
  onOutreachToggle: (address: string, field: 'postcard' | 'email' | 'text') => void;
  onNotesChange: (address: string, notes: string) => void;
  onPriorityToggle: (address: string) => void;
  onDeleteLead: (address: string) => void;
  onDeleteAll: () => void;
}

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return '$' + (value / 1000000).toFixed(2) + 'M';
  }
  return '$' + value.toLocaleString();
}

function ScoreBadge({ score, tier }: { score: number; tier: string }) {
  const styles =
    tier === 'high'
      ? 'text-gold bg-gold/[0.12] border-gold/25'
      : tier === 'warm'
        ? 'text-warning bg-warning/[0.08] border-warning/20'
        : 'text-text-muted bg-black/[0.02] border-border-custom';

  return (
    <span className={`inline-flex items-center justify-center w-10 h-7 border text-[11px] font-body font-bold tabular-nums ${styles}`}>
      {score}
    </span>
  );
}

function EquityBar({ equity, maxEquity }: { equity: number; maxEquity: number }) {
  const pct = maxEquity > 0 ? Math.min((equity / maxEquity) * 100, 100) : 0;
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-[11px] font-body font-medium text-text-secondary tabular-nums whitespace-nowrap">
        {formatCurrency(equity)}
      </span>
      <div className="w-14 h-1 bg-black/[0.06] overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-gold/40 to-gold/70 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function OutreachDots({
  outreach,
  address,
  onToggle,
}: {
  outreach: OutreachStatus;
  address: string;
  onToggle: (address: string, field: 'postcard' | 'email' | 'text') => void;
}) {
  const dots: { key: 'postcard' | 'email' | 'text'; label: string; activeColor: string; dimBg: string }[] = [
    { key: 'postcard', label: 'P', activeColor: 'bg-gold text-white', dimBg: 'hover:bg-gold/10' },
    { key: 'email', label: 'E', activeColor: 'bg-success text-white', dimBg: 'hover:bg-success/10' },
    { key: 'text', label: 'T', activeColor: 'bg-warning text-white', dimBg: 'hover:bg-warning/10' },
  ];

  return (
    <div className="flex gap-1">
      {dots.map((dot) => (
        <button
          key={dot.key}
          onClick={(e) => {
            e.stopPropagation();
            onToggle(address, dot.key);
          }}
          className={`
            w-[22px] h-[22px] text-[9px] font-body font-bold flex items-center justify-center transition-all duration-200
            ${outreach[dot.key]
              ? dot.activeColor
              : `bg-transparent border border-border-custom text-text-muted ${dot.dimBg}`
            }
          `}
          title={`${dot.key}: ${outreach[dot.key] ? 'Done' : 'Not done'}`}
        >
          {dot.label}
        </button>
      ))}
    </div>
  );
}

function ExpandedRow({
  lead,
  outreach,
  onNotesChange,
  onPriorityToggle,
  onOutreachToggle,
  onDeleteLead,
}: {
  lead: Lead;
  outreach: OutreachStatus;
  onNotesChange: (address: string, notes: string) => void;
  onPriorityToggle: (address: string) => void;
  onOutreachToggle: (address: string, field: 'postcard' | 'email' | 'text') => void;
  onDeleteLead: (address: string) => void;
}) {
  return (
    <tr>
      <td colSpan={11} className="p-0">
        <div className="bg-bg-card/80 border-t border-border-custom">
          <div className="p-8 grid grid-cols-3 gap-10">
            {/* Column 1: Property Details */}
            <div>
              <p className="text-[10px] font-body font-semibold text-gold/70 tracking-[0.15em] uppercase mb-4">
                Property Details
              </p>
              <div className="space-y-3 text-[12px] font-body">
                {[
                  ['Address', lead.address],
                  ['Type', lead.property_type],
                  ['Beds / Baths', `${lead.beds} bd / ${lead.baths} ba`],
                  ['Sq Ft', lead.sqft.toLocaleString()],
                  ['Sale Price', formatCurrency(lead.sale_price)],
                  ['Sale Year', lead.sale_year],
                ].map(([label, value]) => (
                  <div key={String(label)} className="flex justify-between items-baseline">
                    <span className="text-text-muted">{label}</span>
                    <span className="text-text-secondary font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: Score & Equity Breakdown */}
            <div>
              <p className="text-[10px] font-body font-semibold text-gold/70 tracking-[0.15em] uppercase mb-4">
                Score Breakdown
              </p>
              <div className="space-y-3 text-[12px] font-body">
                <div className="flex justify-between items-baseline">
                  <span className="text-text-muted">Equity</span>
                  <span className="text-text-secondary font-medium">+{lead.score_breakdown.equity_points}</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-text-muted">ARM Reset Timing</span>
                  <span className="text-text-secondary font-medium">+{lead.score_breakdown.arm_reset_points}</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-text-muted">Neighborhood</span>
                  <span className="text-text-secondary font-medium">+{lead.score_breakdown.neighborhood_points}</span>
                </div>
                <div className="flex justify-between items-baseline pt-3 border-t border-border-custom">
                  <span className="text-gold font-semibold">Total</span>
                  <span className="text-gold font-bold text-lg">{lead.score}</span>
                </div>
              </div>

              <div className="mt-8">
                <p className="text-[10px] font-body font-semibold text-gold/70 tracking-[0.15em] uppercase mb-4">
                  Equity Estimate
                </p>
                <div className="space-y-3 text-[12px] font-body">
                  <div className="flex justify-between items-baseline">
                    <span className="text-text-muted">Current Value</span>
                    <span className="text-text-secondary font-medium">{formatCurrency(lead.estimated_value)}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-text-muted">Mortgage (80% LTV)</span>
                    <span className="text-text-secondary font-medium">{formatCurrency(lead.mortgage_balance)}</span>
                  </div>
                  <div className="flex justify-between items-baseline pt-3 border-t border-border-custom">
                    <span className="text-success font-semibold">Equity</span>
                    <span className="text-success font-bold text-lg">{formatCurrency(lead.equity)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 3: Outreach & Notes */}
            <div>
              <p className="text-[10px] font-body font-semibold text-gold/70 tracking-[0.15em] uppercase mb-4">
                Outreach
              </p>
              <div className="space-y-2 mb-5">
                {(['postcard', 'email', 'text'] as const).map((field) => {
                  const labels = { postcard: 'Postcard', email: 'Email', text: 'Text / Call' };
                  const icons = { postcard: 'P', email: 'E', text: 'T' };
                  return (
                    <button
                      key={field}
                      onClick={() => onOutreachToggle(lead.address, field)}
                      className={`
                        w-full text-left px-4 py-2.5 text-[12px] font-body border transition-all duration-200 flex items-center gap-3
                        ${outreach[field]
                          ? 'border-gold/25 bg-gold/[0.06] text-gold'
                          : 'border-border-custom text-text-muted hover:border-border-strong hover:text-text-secondary'
                        }
                      `}
                    >
                      <span className={`w-5 h-5 flex items-center justify-center text-[9px] font-bold ${outreach[field] ? 'bg-gold text-white' : 'border border-border-strong text-text-muted'}`}>
                        {outreach[field] ? '\u2713' : icons[field]}
                      </span>
                      <span className="font-medium">{labels[field]}</span>
                    </button>
                  );
                })}
              </div>

              {/* Priority Toggle */}
              <button
                onClick={() => onPriorityToggle(lead.address)}
                className={`
                  w-full text-left px-4 py-2.5 text-[12px] font-body font-semibold border mb-5 transition-all duration-200
                  ${outreach.priority
                    ? 'border-gold/30 bg-gold/[0.1] text-gold'
                    : 'border-border-custom text-text-muted hover:border-border-strong hover:text-text-secondary'
                  }
                `}
              >
                {outreach.priority ? '\u2605  HIGH PRIORITY' : '\u2606  Mark Priority'}
              </button>

              {/* Notes */}
              <p className="text-[10px] font-body font-semibold text-gold/70 tracking-[0.15em] uppercase mb-3">
                Notes
              </p>
              <textarea
                defaultValue={outreach.notes}
                onBlur={(e) => onNotesChange(lead.address, e.target.value)}
                placeholder="Add notes..."
                className="w-full bg-bg-primary/50 border border-border-custom text-text-secondary text-[12px] font-body p-3 h-20 resize-none focus:border-gold/25 placeholder:text-text-muted/60"
              />

              {/* Delete Lead */}
              <button
                onClick={() => {
                  if (confirm('Remove this lead from the table?')) {
                    onDeleteLead(lead.address);
                  }
                }}
                className="mt-4 text-[10px] text-text-muted/40 font-body hover:text-alert transition-colors tracking-wider uppercase"
              >
                Remove Lead
              </button>
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
}

export default function LeadTable({
  leads,
  sortField,
  sortDirection,
  onSort,
  getOutreach,
  onOutreachToggle,
  onNotesChange,
  onPriorityToggle,
  onDeleteLead,
  onDeleteAll,
}: LeadTableProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const maxEquity = Math.max(...leads.map((l) => l.equity), 1);

  const toggleRow = useCallback((address: string) => {
    setExpandedRow((prev) => (prev === address ? null : address));
  }, []);

  const SortHeader = ({
    field,
    children,
    className = '',
  }: {
    field: SortField;
    children: React.ReactNode;
    className?: string;
  }) => (
    <th
      onClick={() => onSort(field)}
      className={`px-4 py-3.5 text-left text-[10px] font-body font-semibold text-text-muted uppercase tracking-[0.1em] cursor-pointer hover:text-gold/80 transition-colors select-none ${className}`}
    >
      <div className="flex items-center gap-1.5">
        {children}
        {sortField === field && (
          <span className="text-gold/60 text-[7px]">
            {sortDirection === 'asc' ? '\u25B2' : '\u25BC'}
          </span>
        )}
      </div>
    </th>
  );

  if (leads.length === 0) {
    return (
      <div className="relative z-10 max-w-[1440px] mx-auto px-8">
        <div className="bg-bg-card/40 border border-border-custom p-16 text-center">
          <p className="font-display text-2xl text-text-muted/60 mb-2">No leads found</p>
          <p className="text-[12px] text-text-muted/40 font-body">
            Adjust your filters or upload a CSV.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 max-w-[1440px] mx-auto px-8">
      {/* Table count + Clear All */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] text-text-muted font-body font-medium">
          {leads.length} lead{leads.length !== 1 ? 's' : ''}
        </p>
        <button
          onClick={() => {
            if (confirm('Remove all leads from the table? Outreach data is preserved.')) {
              onDeleteAll();
            }
          }}
          className="text-[10px] text-text-muted/50 font-body hover:text-alert transition-colors tracking-wider uppercase"
        >
          Clear All
        </button>
      </div>

      <div className="overflow-x-auto border border-border-custom bg-bg-card/30">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-custom bg-bg-elevated/40">
              <SortHeader field="score">Score</SortHeader>
              <SortHeader field="address">Address</SortHeader>
              <SortHeader field="neighborhood">Area</SortHeader>
              <SortHeader field="sale_price">Sold</SortHeader>
              <SortHeader field="sale_year">Year</SortHeader>
              <th className="px-4 py-3.5 text-left text-[10px] font-body font-semibold text-text-muted uppercase tracking-[0.1em]">
                ARM
              </th>
              <SortHeader field="arm5_reset_year">Reset</SortHeader>
              <SortHeader field="estimated_value">Value</SortHeader>
              <SortHeader field="equity">Equity</SortHeader>
              <th className="px-4 py-3.5 text-left text-[10px] font-body font-semibold text-text-muted uppercase tracking-[0.1em]">
                Touch
              </th>
              <th className="px-4 py-3.5 text-center text-[10px] font-body font-semibold text-text-muted uppercase tracking-[0.1em] w-10">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="inline text-text-muted">
                  <path d="M2 14l3-1 8-8-2-2-8 8-1 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
              </th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead, index) => {
              const outreach = getOutreach(lead.address);
              const isExpanded = expandedRow === lead.address;
              return (
                <LeadRow
                  key={lead.address}
                  lead={lead}
                  outreach={outreach}
                  isExpanded={isExpanded}
                  isEven={index % 2 === 0}
                  maxEquity={maxEquity}
                  onToggleRow={toggleRow}
                  onOutreachToggle={onOutreachToggle}
                  onNotesChange={onNotesChange}
                  onPriorityToggle={onPriorityToggle}
                  onDeleteLead={onDeleteLead}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LeadRow({
  lead,
  outreach,
  isExpanded,
  isEven,
  maxEquity,
  onToggleRow,
  onOutreachToggle,
  onNotesChange,
  onPriorityToggle,
  onDeleteLead,
}: {
  lead: Lead;
  outreach: OutreachStatus;
  isExpanded: boolean;
  isEven: boolean;
  maxEquity: number;
  onToggleRow: (address: string) => void;
  onOutreachToggle: (address: string, field: 'postcard' | 'email' | 'text') => void;
  onNotesChange: (address: string, notes: string) => void;
  onPriorityToggle: (address: string) => void;
  onDeleteLead: (address: string) => void;
}) {
  const currentYear = new Date().getFullYear();

  return (
    <>
      <tr
        onClick={() => onToggleRow(lead.address)}
        className={`
          cursor-pointer transition-all duration-150 border-b border-border-custom text-[12px] font-body
          ${isEven ? 'bg-transparent' : 'bg-black/[0.015]'}
          ${isExpanded ? 'bg-gold/[0.04] border-b-gold/15' : 'hover:bg-black/[0.02]'}
          ${outreach.priority ? 'border-l-2 border-l-gold/60' : ''}
        `}
      >
        <td className="px-4 py-3">
          <ScoreBadge score={lead.score} tier={lead.score_tier} />
        </td>
        <td className="px-4 py-3 text-text-primary font-medium max-w-[240px] truncate">
          {lead.address}
        </td>
        <td className="px-4 py-3 text-text-muted">{lead.neighborhood}</td>
        <td className="px-4 py-3 text-text-secondary tabular-nums">{formatCurrency(lead.sale_price)}</td>
        <td className="px-4 py-3 text-text-muted tabular-nums">{lead.sale_year}</td>
        <td className="px-4 py-3">
          <span className="text-text-muted/60">5/1</span>
          <span className="text-border-strong mx-0.5">&middot;</span>
          <span className="text-text-muted/60">7/1</span>
        </td>
        <td className="px-4 py-3">
          <span className={`tabular-nums ${lead.arm5_reset_year <= currentYear ? 'text-alert font-semibold' : lead.arm5_reset_year === currentYear + 1 ? 'text-warning' : 'text-text-muted'}`}>
            {lead.arm5_reset_year}
          </span>
          <span className="text-border-strong mx-0.5">&middot;</span>
          <span className="text-text-muted/60 tabular-nums">{lead.arm7_reset_year}</span>
        </td>
        <td className="px-4 py-3 text-text-secondary tabular-nums">{formatCurrency(lead.estimated_value)}</td>
        <td className="px-4 py-3">
          <EquityBar equity={lead.equity} maxEquity={maxEquity} />
        </td>
        <td className="px-4 py-3">
          <OutreachDots
            outreach={outreach}
            address={lead.address}
            onToggle={onOutreachToggle}
          />
        </td>
        <td className="px-4 py-3 text-center">
          {outreach.notes ? (
            <div className="w-1.5 h-1.5 bg-gold/60 mx-auto" title={outreach.notes} />
          ) : (
            <div className="w-1.5 h-1.5 bg-black/[0.08] mx-auto" />
          )}
        </td>
      </tr>
      {isExpanded && (
        <ExpandedRow
          lead={lead}
          outreach={outreach}
          onNotesChange={onNotesChange}
          onPriorityToggle={onPriorityToggle}
          onOutreachToggle={onOutreachToggle}
          onDeleteLead={onDeleteLead}
        />
      )}
    </>
  );
}
