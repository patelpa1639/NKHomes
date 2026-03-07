'use client';

import { useState } from 'react';
import { saveSubmission } from '@/lib/submissions';

export default function HomeValuePage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate a brief delay for UX
    setTimeout(() => {
      saveSubmission(formData);
      setSubmitted(true);
      setIsSubmitting(false);
    }, 800);
  };

  const update = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col">
        {/* Gold accent */}
        <div className="h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />

        <div className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-lg w-full text-center py-20">
            {/* Success checkmark */}
            <div className="w-16 h-16 border border-gold/30 bg-gold/[0.06] flex items-center justify-center mx-auto mb-8">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-gold">
                <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
              </svg>
            </div>

            <h2 className="font-display text-3xl text-text-primary mb-4">
              Thank You
            </h2>
            <p className="text-text-secondary font-body text-[15px] leading-relaxed mb-3">
              Your home value report is being prepared. Neena Kalra will reach out
              with a personalized market analysis for your property.
            </p>
            <p className="text-text-muted font-body text-[13px]">
              Expect to hear from us within 24 hours.
            </p>

            <div className="mt-12 pt-8 border-t border-border-custom">
              <div className="flex items-center justify-center gap-4">
                <div className="relative w-9 h-9 border border-gold/40 flex items-center justify-center bg-gold/5">
                  <span className="font-display text-sm font-bold text-gold tracking-wider">NK</span>
                </div>
                <div className="text-left">
                  <p className="font-display text-sm text-text-primary">NK Homes</p>
                  <p className="text-[10px] text-text-muted tracking-[0.2em] uppercase font-body">
                    Brokered by Samson Properties
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Gold accent */}
      <div className="h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />

      {/* Hero section */}
      <div className="relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-radial from-gold/[0.06] to-transparent pointer-events-none" />

        <div className="max-w-xl mx-auto px-6 pt-16 pb-10 text-center relative z-10">
          {/* Logo */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <div className="relative w-11 h-11 border border-gold/50 flex items-center justify-center bg-gold/5">
              <span className="font-display text-lg font-bold text-gold tracking-wider">NK</span>
              <div className="absolute -top-px -left-px w-2 h-px bg-gold" />
              <div className="absolute -top-px -left-px w-px h-2 bg-gold" />
              <div className="absolute -bottom-px -right-px w-2 h-px bg-gold" />
              <div className="absolute -bottom-px -right-px w-px h-2 bg-gold" />
            </div>
            <div className="text-left">
              <p className="font-display text-xl font-semibold text-text-primary tracking-[0.04em]">NK HOMES</p>
              <p className="text-[9px] text-text-muted tracking-[0.25em] uppercase font-body font-medium">Brokered by Samson Properties</p>
            </div>
          </div>

          <p className="text-[11px] text-gold/70 tracking-[0.25em] uppercase font-body font-semibold mb-4">
            Complimentary Market Analysis
          </p>

          <h1 className="font-display text-4xl md:text-5xl text-text-primary leading-tight mb-5">
            What&apos;s Your Home<br />
            <span className="text-gold">Worth Today?</span>
          </h1>

          <p className="text-text-secondary font-body text-[15px] leading-relaxed max-w-md mx-auto">
            Get a personalized home value report with current market data
            for Loudoun &amp; Fairfax County. No obligation, completely free.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-md mx-auto px-6 pb-20 w-full">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] text-text-muted tracking-[0.15em] uppercase font-body font-semibold mb-2">
              Property Address
            </label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => update('address', e.target.value)}
              placeholder="123 Main St, Ashburn VA 20148"
              className="w-full bg-bg-card/60 border border-border-custom text-text-primary text-[13px] font-body px-4 py-3 focus:border-gold/30 placeholder:text-text-muted/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] text-text-muted tracking-[0.15em] uppercase font-body font-semibold mb-2">
              Your Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="John Smith"
              className="w-full bg-bg-card/60 border border-border-custom text-text-primary text-[13px] font-body px-4 py-3 focus:border-gold/30 placeholder:text-text-muted/50 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-text-muted tracking-[0.15em] uppercase font-body font-semibold mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => update('email', e.target.value)}
                placeholder="john@email.com"
                className="w-full bg-bg-card/60 border border-border-custom text-text-primary text-[13px] font-body px-4 py-3 focus:border-gold/30 placeholder:text-text-muted/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] text-text-muted tracking-[0.15em] uppercase font-body font-semibold mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => update('phone', e.target.value)}
                placeholder="(703) 555-0123"
                className="w-full bg-bg-card/60 border border-border-custom text-text-primary text-[13px] font-body px-4 py-3 focus:border-gold/30 placeholder:text-text-muted/50 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gold text-bg-primary text-[13px] font-body font-bold tracking-[0.1em] uppercase py-3.5 mt-4 hover:bg-gold-light transition-colors disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-bg-primary/30 border-t-bg-primary animate-spin" />
                Processing...
              </span>
            ) : (
              'Get My Home Value'
            )}
          </button>

          <p className="text-[11px] text-text-muted/50 font-body text-center mt-3">
            Your information is private and will never be shared.
          </p>
        </form>

        {/* Trust indicators */}
        <div className="mt-12 pt-8 border-t border-border-custom">
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { value: '500+', label: 'Homes Analyzed' },
              { value: '15+', label: 'Years Experience' },
              { value: 'Free', label: 'No Obligation' },
            ].map((item) => (
              <div key={item.label}>
                <p className="font-display text-xl text-gold font-bold">{item.value}</p>
                <p className="text-[10px] text-text-muted font-body mt-1 tracking-wider uppercase">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto">
        <div className="h-px bg-gradient-to-r from-transparent via-border-strong to-transparent" />
        <div className="py-5 text-center">
          <p className="text-[10px] text-text-muted/50 font-body tracking-[0.1em]">
            NK Homes &middot; Brokered by Samson Properties &middot; Loudoun &amp; Fairfax County, VA
          </p>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-gold/15 to-transparent" />
      </div>
    </div>
  );
}
