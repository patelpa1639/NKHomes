'use client';

/* eslint-disable @next/next/no-img-element */

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
          <div className="flex items-center gap-5">
            {/* NK Logo Image */}
            <img
              src="/logo.png"
              alt="NK Homes"
              className="h-11 w-auto"
            />

            <div>
              <h1
                className="text-[22px] font-light text-text-primary tracking-[0.15em] uppercase"
                style={{ fontFamily: "var(--font-brand)" }}
              >
                Neena K Homes
              </h1>
              <p className="text-[10px] text-text-muted tracking-[0.25em] uppercase font-body font-medium mt-0.5">
                Brokered by Samson Properties
              </p>
            </div>
          </div>

          {/* Center: Navigation */}
          <nav className="flex items-center gap-6">
            <a href="/" className="text-[11px] text-text-primary font-body font-medium hover:text-gold transition-colors tracking-wider uppercase">
              Dashboard
            </a>
            <a href="/postcard" className="text-[11px] text-text-muted font-body font-medium hover:text-gold transition-colors tracking-wider uppercase">
              Postcards
            </a>
            <a href="/sop" className="text-[11px] text-text-muted font-body font-medium hover:text-gold transition-colors tracking-wider uppercase">
              SOP
            </a>
            <a href="/cma" className="text-[11px] text-text-muted font-body font-medium hover:text-gold transition-colors tracking-wider uppercase">
              CMA Tool
            </a>
            <a href="/value" target="_blank" className="text-[11px] text-text-muted font-body font-medium hover:text-gold transition-colors tracking-wider uppercase flex items-center gap-1">
              Landing Page
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none" className="opacity-50">
                <path d="M6 2h8v8M14 2L6 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
              </svg>
            </a>
          </nav>

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
