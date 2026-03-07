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
}

function formatCurrency(value: number): string {
  return '$' + value.toLocaleString();
}

function ScoreBadge({ score, tier }: { score: number; tier: string }) {
  const colorClass =
    tier === 'high'
      ? 'text-gold border-gold bg-gold/10'
      : tier === 'warm'
        ? 'text-warning border-warning bg-warning/10'
        : 'text-text-muted border-border-custom bg-bg-primary';

  return (
    <span className={`inline-block w-10 text-center py-0.5 border text-xs font-body font-bold ${colorClass}`}>
      {score}
    </span>
  );
}

function EquityBar({ equity, maxEquity }: { equity: number; maxEquity: number }) {
  const pct = maxEquity > 0 ? Math.min((equity / maxEquity) * 100, 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-body whitespace-nowrap">{formatCurrency(equity)}</span>
      <div className="w-16 h-1.5 bg-border-custom overflow-hidden">
        <div
          className="h-full bg-gold-dim"
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
  const dots: { key: 'postcard' | 'email' | 'text'; label: string; activeColor: string }[] = [
    { key: 'postcard', label: 'P', activeColor: 'bg-gold text-bg-primary' },
    { key: 'email', label: 'E', activeColor: 'bg-success text-bg-primary' },
    { key: 'text', label: 'T', activeColor: 'bg-warning text-bg-primary' },
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
            w-6 h-6 text-[10px] font-body font-bold flex items-center justify-center transition-colors
            ${outreach[dot.key] ? dot.activeColor : 'bg-bg-primary border border-border-custom text-text-muted'}
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
}: {
  lead: Lead;
  outreach: OutreachStatus;
  onNotesChange: (address: string, notes: string) => void;
  onPriorityToggle: (address: string) => void;
  onOutreachToggle: (address: string, field: 'postcard' | 'email' | 'text') => void;
}) {
  return (
    <tr>
      <td colSpan={11} className="bg-bg-card border-x border-b border-border-custom p-0">
        <div className="p-6 grid grid-cols-3 gap-8">
          {/* Column 1: Property Details */}
          <div>
            <h4 className="font-display text-lg text-gold mb-3">Property Details</h4>
            <div className="space-y-2 text-xs font-body">
              <div className="flex justify-between">
                <span className="text-text-muted">Address</span>
                <span className="text-text-primary">{lead.address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Type</span>
                <span className="text-text-primary">{lead.property_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Beds / Baths</span>
                <span className="text-text-primary">{lead.beds} bd / {lead.baths} ba</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Sq Ft</span>
                <span className="text-text-primary">{lead.sqft.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Sale Price</span>
                <span className="text-text-primary">{formatCurrency(lead.sale_price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Sale Year</span>
                <span className="text-text-primary">{lead.sale_year}</span>
              </div>
            </div>
          </div>

          {/* Column 2: Score Breakdown & Equity Calc */}
          <div>
            <h4 className="font-display text-lg text-gold mb-3">Score Breakdown</h4>
            <div className="space-y-2 text-xs font-body">
              <div className="flex justify-between">
                <span className="text-text-muted">Equity Points</span>
                <span className="text-text-primary">+{lead.score_breakdown.equity_points}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">ARM Reset Points</span>
                <span className="text-text-primary">+{lead.score_breakdown.arm_reset_points}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Neighborhood Bonus</span>
                <span className="text-text-primary">+{lead.score_breakdown.neighborhood_points}</span>
              </div>
              <div className="flex justify-between border-t border-border-custom pt-2 mt-2">
                <span className="text-gold font-medium">Total Score</span>
                <span className="text-gold font-bold">{lead.score}</span>
              </div>
            </div>

            <h4 className="font-display text-lg text-gold mb-3 mt-6">Equity Calculation</h4>
            <div className="space-y-2 text-xs font-body">
              <div className="flex justify-between">
                <span className="text-text-muted">Est. Current Value</span>
                <span className="text-text-primary">{formatCurrency(lead.estimated_value)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Est. Mortgage (80% LTV)</span>
                <span className="text-text-primary">{formatCurrency(lead.mortgage_balance)}</span>
              </div>
              <div className="flex justify-between border-t border-border-custom pt-2 mt-2">
                <span className="text-success font-medium">Est. Equity</span>
                <span className="text-success font-bold">{formatCurrency(lead.equity)}</span>
              </div>
            </div>
          </div>

          {/* Column 3: Outreach & Notes */}
          <div>
            <h4 className="font-display text-lg text-gold mb-3">Outreach Tracking</h4>
            <div className="space-y-3 mb-6">
              {(['postcard', 'email', 'text'] as const).map((field) => {
                const labels = {
                  postcard: 'Postcard Sent',
                  email: 'Email Sent',
                  text: 'Text / Called',
                };
                return (
                  <button
                    key={field}
                    onClick={() => onOutreachToggle(lead.address, field)}
                    className={`
                      w-full text-left px-3 py-2 text-xs font-body border transition-colors flex items-center justify-between
                      ${outreach[field]
                        ? 'border-gold-dim bg-gold/10 text-gold'
                        : 'border-border-custom text-text-muted hover:border-gold-dim'
                      }
                    `}
                  >
                    <span>{labels[field]}</span>
                    <span>{outreach[field] ? '&#x2713;' : ''}</span>
                  </button>
                );
              })}
            </div>

            {/* Priority Toggle */}
            <button
              onClick={() => onPriorityToggle(lead.address)}
              className={`
                w-full text-left px-3 py-2 text-xs font-body font-medium border mb-4 transition-colors
                ${outreach.priority
                  ? 'border-gold bg-gold/20 text-gold'
                  : 'border-border-custom text-text-muted hover:border-gold-dim'
                }
              `}
            >
              {outreach.priority ? '&#x2605; HIGH PRIORITY' : '&#x2606; Mark as High Priority'}
            </button>

            {/* Notes */}
            <h4 className="font-display text-lg text-gold mb-2">Notes</h4>
            <textarea
              defaultValue={outreach.notes}
              onBlur={(e) => onNotesChange(lead.address, e.target.value)}
              placeholder="Add notes about this lead..."
              className="w-full bg-bg-primary border border-border-custom text-text-primary text-xs font-body p-3 h-24 resize-none focus:border-gold-dim focus:outline-none placeholder:text-text-muted"
            />
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
      className={`px-3 py-3 text-left text-[10px] font-body font-semibold text-text-muted uppercase tracking-wider cursor-pointer hover:text-gold transition-colors select-none ${className}`}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortField === field && (
          <span className="text-gold text-[8px]">
            {sortDirection === 'asc' ? '\u25B2' : '\u25BC'}
          </span>
        )}
      </div>
    </th>
  );

  if (leads.length === 0) {
    return (
      <div className="relative z-10 max-w-[1600px] mx-auto px-6">
        <div className="bg-bg-card border border-border-custom p-12 text-center">
          <p className="font-display text-2xl text-gold-dim mb-2">No leads found</p>
          <p className="text-xs text-text-muted font-body">
            Try adjusting your filters or upload a new CSV file.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 max-w-[1600px] mx-auto px-6">
      <div className="overflow-x-auto border border-border-custom">
        <table className="w-full">
          <thead className="bg-bg-card border-b border-border-custom">
            <tr>
              <SortHeader field="score">Score</SortHeader>
              <SortHeader field="address">Address</SortHeader>
              <SortHeader field="neighborhood">Neighborhood</SortHeader>
              <SortHeader field="sale_price">Sale Price</SortHeader>
              <SortHeader field="sale_year">Sale Year</SortHeader>
              <th className="px-3 py-3 text-left text-[10px] font-body font-semibold text-text-muted uppercase tracking-wider">
                ARM Type
              </th>
              <SortHeader field="arm5_reset_year">Reset Year</SortHeader>
              <SortHeader field="estimated_value">Est. Value</SortHeader>
              <SortHeader field="equity">Est. Equity</SortHeader>
              <th className="px-3 py-3 text-left text-[10px] font-body font-semibold text-text-muted uppercase tracking-wider">
                Outreach
              </th>
              <th className="px-3 py-3 text-left text-[10px] font-body font-semibold text-text-muted uppercase tracking-wider">
                <span title="Notes">&#x270E;</span>
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
}) {
  return (
    <>
      <tr
        onClick={() => onToggleRow(lead.address)}
        className={`
          cursor-pointer transition-colors border-b border-border-custom text-xs font-body
          ${isEven ? 'bg-bg-primary' : 'bg-bg-card/50'}
          ${isExpanded ? 'bg-gold/5 border-gold-dim' : 'hover:bg-gold/5'}
          ${outreach.priority ? 'border-l-2 border-l-gold' : ''}
        `}
      >
        <td className="px-3 py-2.5">
          <ScoreBadge score={lead.score} tier={lead.score_tier} />
        </td>
        <td className="px-3 py-2.5 text-text-primary max-w-[250px] truncate">
          {lead.address}
        </td>
        <td className="px-3 py-2.5 text-text-muted">{lead.neighborhood}</td>
        <td className="px-3 py-2.5 text-text-primary">{formatCurrency(lead.sale_price)}</td>
        <td className="px-3 py-2.5 text-text-muted">{lead.sale_year}</td>
        <td className="px-3 py-2.5">
          <span className="text-text-muted">5/1</span>
          <span className="text-border-custom mx-1">/</span>
          <span className="text-text-muted">7/1</span>
        </td>
        <td className="px-3 py-2.5">
          <span className={lead.arm5_reset_year <= new Date().getFullYear() ? 'text-alert font-medium' : 'text-text-muted'}>
            {lead.arm5_reset_year}
          </span>
          <span className="text-border-custom mx-1">/</span>
          <span className="text-text-muted">{lead.arm7_reset_year}</span>
        </td>
        <td className="px-3 py-2.5 text-text-primary">{formatCurrency(lead.estimated_value)}</td>
        <td className="px-3 py-2.5">
          <EquityBar equity={lead.equity} maxEquity={maxEquity} />
        </td>
        <td className="px-3 py-2.5">
          <OutreachDots
            outreach={outreach}
            address={lead.address}
            onToggle={onOutreachToggle}
          />
        </td>
        <td className="px-3 py-2.5 text-center">
          {outreach.notes ? (
            <span className="text-gold text-sm" title={outreach.notes}>&#x270E;</span>
          ) : (
            <span className="text-text-muted text-sm">&#x270E;</span>
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
        />
      )}
    </>
  );
}
