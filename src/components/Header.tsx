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
      {/* Ultra-thin gold accent */}
      <div className="h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />

      <div className="bg-bg-elevated/80 backdrop-blur-xl border-b border-border-custom">
        <div className="max-w-[1440px] mx-auto px-8 py-5 flex items-center justify-between">
          {/* Left: Brand */}
          <div className="flex items-center gap-6">
            {/* NK Logo Mark */}
            <div className="relative w-11 h-11 border border-gold/50 flex items-center justify-center bg-gold/5">
              <span className="font-display text-lg font-bold text-gold tracking-wider">
                NK
              </span>
              {/* Corner accents */}
              <div className="absolute -top-px -left-px w-2 h-px bg-gold" />
              <div className="absolute -top-px -left-px w-px h-2 bg-gold" />
              <div className="absolute -bottom-px -right-px w-2 h-px bg-gold" />
              <div className="absolute -bottom-px -right-px w-px h-2 bg-gold" />
            </div>

            <div>
              <h1 className="font-display text-[22px] font-semibold text-text-primary tracking-[0.04em]">
                NK HOMES
              </h1>
              <p className="text-[10px] text-text-muted tracking-[0.25em] uppercase font-body font-medium mt-0.5">
                Brokered by Samson Properties
              </p>
            </div>
          </div>

          {/* Right: Badge + Date */}
          <div className="flex items-center gap-8">
            <div className="relative border border-gold/20 bg-gold/[0.04] px-5 py-2">
              <span className="text-[11px] font-body font-medium text-gold/90 tracking-[0.15em] uppercase">
                ARM Lead Intelligence
              </span>
              {/* Corner accents */}
              <div className="absolute -top-px -left-px w-1.5 h-px bg-gold/60" />
              <div className="absolute -top-px -left-px w-px h-1.5 bg-gold/60" />
              <div className="absolute -bottom-px -right-px w-1.5 h-px bg-gold/60" />
              <div className="absolute -bottom-px -right-px w-px h-1.5 bg-gold/60" />
            </div>

            <div className="text-right">
              <p className="text-[11px] text-text-muted font-body font-light">{today}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
