'use client';

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-border-custom bg-bg-card mt-12">
      <div className="max-w-[1600px] mx-auto px-6 py-4 text-center">
        <p className="text-xs text-text-muted font-body tracking-wider">
          NK Homes &middot; Brokered by Samson Properties &middot; Loudoun &amp; Fairfax County, VA
        </p>
      </div>
      <div className="h-[2px] bg-gradient-to-r from-transparent via-gold-dim to-transparent" />
    </footer>
  );
}
