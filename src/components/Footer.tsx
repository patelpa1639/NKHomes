'use client';

export default function Footer() {
  return (
    <footer className="relative z-10 mt-16">
      <div className="h-px bg-gradient-to-r from-transparent via-border-strong to-transparent" />
      <div className="bg-bg-elevated/50 backdrop-blur-sm">
        <div className="max-w-[1440px] mx-auto px-8 py-5 flex items-center justify-between">
          <p className="text-[10px] text-text-muted font-body tracking-[0.15em] uppercase font-medium">
            NK Homes &middot; Brokered by Samson Properties
          </p>
          <p className="text-[10px] text-text-muted/60 font-body tracking-[0.1em]">
            Loudoun &amp; Fairfax County, VA
          </p>
        </div>
      </div>
      <div className="h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
    </footer>
  );
}
