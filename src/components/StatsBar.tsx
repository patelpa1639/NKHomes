'use client';

import { Lead } from '@/lib/types';
import { OutreachStatus } from '@/lib/types';

interface StatsBarProps {
  leads: Lead[];
  getOutreach: (address: string) => OutreachStatus;
}

export default function StatsBar({ leads }: StatsBarProps) {
  const currentYear = new Date().getFullYear();

  const totalLeads = leads.length;
  const highPriority = leads.filter((l) => l.score >= 80).length;
  const resetsThisYear = leads.filter((l) => l.arm5_reset_year === currentYear).length;
  const resetsNextYear = leads.filter((l) => l.arm5_reset_year === currentYear + 1).length;
  const avgEquity =
    leads.length > 0
      ? Math.round(leads.reduce((sum, l) => sum + l.equity, 0) / leads.length)
      : 0;

  const stats = [
    { label: 'Total Leads', value: totalLeads, color: 'text-text-primary' },
    { label: 'High Priority', value: highPriority, color: 'text-gold' },
    {
      label: `ARM Resets ${currentYear}`,
      value: resetsThisYear,
      color: 'text-alert',
    },
    {
      label: `ARM Resets ${currentYear + 1}`,
      value: resetsNextYear,
      color: 'text-warning',
    },
    {
      label: 'Avg Equity',
      value: `$${avgEquity.toLocaleString()}`,
      color: 'text-success',
    },
  ];

  return (
    <div className="relative z-10 grid grid-cols-5 gap-4 max-w-[1600px] mx-auto px-6 py-5">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-bg-card border border-border-custom p-4 text-center"
        >
          <p className={`font-display text-3xl font-bold ${stat.color}`}>
            {stat.value}
          </p>
          <p className="text-xs text-text-muted font-body mt-1 tracking-wider uppercase">
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  );
}
