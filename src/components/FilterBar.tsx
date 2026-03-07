'use client';

import { Filters, Lead } from '@/lib/types';

interface FilterBarProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
  leads: Lead[];
  onExport: () => void;
}

export default function FilterBar({ filters, onFilterChange, leads, onExport }: FilterBarProps) {
  const currentYear = new Date().getFullYear();

  const neighborhoods = [...new Set(leads.map((l) => l.neighborhood))].sort();

  const resetYears = [
    ...new Set([
      ...leads.map((l) => l.arm5_reset_year),
      ...leads.map((l) => l.arm7_reset_year),
    ]),
  ].sort();

  const update = (key: keyof Filters, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const selectClass =
    'bg-bg-card/60 border border-border-custom text-text-secondary text-[11px] font-body font-medium px-3 py-2 focus:border-gold/30 appearance-none cursor-pointer hover:border-border-strong transition-colors';
  const inputClass =
    'bg-bg-card/60 border border-border-custom text-text-secondary text-[11px] font-body font-medium px-3 py-2 focus:border-gold/30 placeholder:text-text-muted hover:border-border-strong transition-colors';

  return (
    <div className="relative z-10 max-w-[1440px] mx-auto px-8 mb-5">
      <div className="flex items-center gap-2.5 flex-wrap">
        {/* Search */}
        <div className="relative">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
            <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10.5 10.5L14.5 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
          </svg>
          <input
            type="text"
            placeholder="Search address..."
            value={filters.search}
            onChange={(e) => update('search', e.target.value)}
            className={`${inputClass} w-56 pl-9`}
          />
        </div>

        <div className="w-px h-6 bg-border-custom mx-1" />

        {/* ARM Type */}
        <select
          value={filters.armType}
          onChange={(e) => update('armType', e.target.value)}
          className={selectClass}
        >
          <option value="">ARM Type</option>
          <option value="5/1">5/1 ARM</option>
          <option value="7/1">7/1 ARM</option>
        </select>

        {/* Reset Year */}
        <select
          value={filters.resetYear}
          onChange={(e) => update('resetYear', e.target.value)}
          className={selectClass}
        >
          <option value="">Reset Year</option>
          {resetYears.map((year) => (
            <option key={year} value={year}>
              {year}
              {year === currentYear ? ' (This Year)' : ''}
              {year === currentYear + 1 ? ' (Next Year)' : ''}
            </option>
          ))}
        </select>

        {/* Neighborhood */}
        <select
          value={filters.neighborhood}
          onChange={(e) => update('neighborhood', e.target.value)}
          className={selectClass}
        >
          <option value="">Neighborhood</option>
          {neighborhoods.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>

        {/* Score Range */}
        <select
          value={filters.scoreRange}
          onChange={(e) => update('scoreRange', e.target.value)}
          className={selectClass}
        >
          <option value="">Score</option>
          <option value="high">High (80-100)</option>
          <option value="warm">Warm (50-79)</option>
          <option value="monitor">Monitor (0-49)</option>
        </select>

        {/* Outreach Status */}
        <select
          value={filters.outreachStatus}
          onChange={(e) => update('outreachStatus', e.target.value)}
          className={selectClass}
        >
          <option value="">Outreach</option>
          <option value="untouched">Untouched</option>
          <option value="in_progress">In Progress</option>
          <option value="complete">Complete</option>
        </select>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Export Button */}
        <button
          onClick={onExport}
          className="flex items-center gap-2 bg-gold/[0.08] border border-gold/20 text-gold/90 text-[11px] font-body font-semibold px-4 py-2 hover:bg-gold/[0.15] hover:border-gold/30 transition-all tracking-[0.08em] uppercase"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M8 11V1M4 7l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
            <path d="M2 12v2h12v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
          </svg>
          Export
        </button>
      </div>
    </div>
  );
}
