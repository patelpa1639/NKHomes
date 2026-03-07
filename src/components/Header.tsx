'use client';

export default function Header() {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="relative z-10">
      {/* Gold accent line */}
      <div className="h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent" />

      <div className="bg-bg-card border-b border-border-custom">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-5">
            {/* NK Logo Mark */}
            <div className="w-12 h-12 border-2 border-gold flex items-center justify-center">
              <span className="font-display text-xl font-bold text-gold tracking-wider">
                NK
              </span>
            </div>

            <div>
              <h1 className="font-display text-2xl font-semibold text-text-primary tracking-wide">
                NK HOMES
              </h1>
              <p className="text-[11px] text-text-muted tracking-[0.2em] uppercase mt-0.5">
                Brokered by Samson Properties
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* ARM Lead Intelligence Badge */}
            <div className="border border-gold-dim px-4 py-1.5">
              <span className="text-xs font-body font-medium text-gold tracking-wider uppercase">
                ARM Lead Intelligence
              </span>
            </div>

            <div className="text-right">
              <p className="text-xs text-text-muted font-body">{today}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
