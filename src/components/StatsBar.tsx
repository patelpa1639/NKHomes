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
    {
      label: 'Total Leads',
      value: totalLeads,
      accentColor: 'text-text-primary',
      barColor: 'bg-text-muted/30',
    },
    {
      label: 'High Priority',
      value: highPriority,
      accentColor: 'text-gold',
      barColor: 'bg-gold/30',
    },
    {
      label: `Resets ${currentYear}`,
      value: resetsThisYear,
      accentColor: 'text-alert',
      barColor: 'bg-alert/30',
    },
    {
      label: `Resets ${currentYear + 1}`,
      value: resetsNextYear,
      accentColor: 'text-warning',
      barColor: 'bg-warning/30',
    },
    {
      label: 'Avg Equity',
      value: `$${avgEquity.toLocaleString()}`,
      accentColor: 'text-success',
      barColor: 'bg-success/30',
    },
  ];

  return (
    <div className="relative z-10 grid grid-cols-5 gap-3 max-w-[1440px] mx-auto px-8 py-6">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="relative bg-bg-card/60 backdrop-blur-sm border border-border-custom p-5 group hover:border-border-strong transition-all duration-300"
        >
          {/* Top accent bar */}
          <div className={`absolute top-0 left-0 right-0 h-px ${stat.barColor}`} />

          <p className="text-[11px] text-text-muted font-body font-medium tracking-[0.08em] uppercase mb-3">
            {stat.label}
          </p>
          <p className={`font-display text-[28px] font-bold ${stat.accentColor} leading-none`}>
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}
