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
    'bg-bg-card border border-border-custom text-text-primary text-xs font-body px-3 py-2 focus:border-gold-dim focus:outline-none appearance-none cursor-pointer';
  const inputClass =
    'bg-bg-card border border-border-custom text-text-primary text-xs font-body px-3 py-2 focus:border-gold-dim focus:outline-none placeholder:text-text-muted';

  return (
    <div className="relative z-10 max-w-[1600px] mx-auto px-6 mb-4">
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <input
          type="text"
          placeholder="Search by address..."
          value={filters.search}
          onChange={(e) => update('search', e.target.value)}
          className={`${inputClass} w-64`}
        />

        {/* ARM Type */}
        <select
          value={filters.armType}
          onChange={(e) => update('armType', e.target.value)}
          className={selectClass}
        >
          <option value="">All ARM Types</option>
          <option value="5/1">5/1 ARM</option>
          <option value="7/1">7/1 ARM</option>
        </select>

        {/* Reset Year */}
        <select
          value={filters.resetYear}
          onChange={(e) => update('resetYear', e.target.value)}
          className={selectClass}
        >
          <option value="">All Reset Years</option>
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
          <option value="">All Neighborhoods</option>
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
          <option value="">All Scores</option>
          <option value="high">High Priority (80-100)</option>
          <option value="warm">Warm (50-79)</option>
          <option value="monitor">Monitor (0-49)</option>
        </select>

        {/* Outreach Status */}
        <select
          value={filters.outreachStatus}
          onChange={(e) => update('outreachStatus', e.target.value)}
          className={selectClass}
        >
          <option value="">All Outreach</option>
          <option value="untouched">Untouched</option>
          <option value="in_progress">In Progress</option>
          <option value="complete">Complete</option>
        </select>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Export Button */}
        <button
          onClick={onExport}
          className="border border-gold-dim text-gold text-xs font-body font-medium px-4 py-2 hover:bg-gold/10 transition-colors tracking-wider uppercase"
        >
          Export CSV
        </button>
      </div>
    </div>
  );
}
