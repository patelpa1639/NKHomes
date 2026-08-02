'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/* ─── Small building blocks ─────────────────────────────────────────────── */

function Logo({ className = '' }: { className?: string }) {
  return <span className={`hl-logo ${className}`}>haleera</span>;
}

function VerifiedBadge() {
  return (
    <svg className="hl-verified" viewBox="0 0 24 24" fill="currentColor" aria-label="Verified">
      <path d="M12 1.5 14.8 4l3.7-.4 1 3.6 3.2 1.9-1.6 3.4 1.6 3.4-3.2 1.9-1 3.6-3.7-.4L12 22.5 9.2 20l-3.7.4-1-3.6-3.2-1.9 1.6-3.4L1.3 8.1l3.2-1.9 1-3.6 3.7.4L12 1.5Z" opacity="0.18" />
      <path d="M12 2.6 14.5 4.8l3.3-.35.9 3.2 2.85 1.7-1.45 3 1.45 3-2.85 1.7-.9 3.2-3.3-.35L12 21.4l-2.5-2.2-3.3.35-.9-3.2-2.85-1.7 1.45-3-1.45-3 2.85-1.7.9-3.2 3.3.35L12 2.6Zm-1.1 12.9 5.2-5.2-1.3-1.3-3.9 3.9-1.7-1.7-1.3 1.3 3 3Z" />
    </svg>
  );
}

const AVATAR_COLORS = [
  'linear-gradient(135deg,#e52a5d,#ff7a9e)',
  'linear-gradient(135deg,#7048e8,#9775fa)',
  'linear-gradient(135deg,#0ca678,#38d9a9)',
  'linear-gradient(135deg,#f59f00,#ffd43b)',
  'linear-gradient(135deg,#1c7ed6,#4dabf7)',
];

function Avatar({ initials, color = 0, size = 30 }: { initials: string; color?: number; size?: number }) {
  return (
    <span
      className="hl-avatar"
      style={{ background: AVATAR_COLORS[color % AVATAR_COLORS.length], width: size, height: size, fontSize: size * 0.4 }}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

/* ─── Collage: chat mockup + proof tiles ────────────────────────────────── */

function ChatTile() {
  return (
    <div className="hl-tile hl-tile-tint p-4 sm:p-5" data-reveal>
      {/* Chat header */}
      <div className="flex items-center gap-3 pb-3 border-b border-black/[0.06]">
        <div className="flex -space-x-2">
          <Avatar initials="MJ" color={1} size={26} />
          <Avatar initials="DK" color={2} size={26} />
          <Avatar initials="AR" color={0} size={26} />
        </div>
        <div className="min-w-0">
          <p className="text-[13.5px] font-bold leading-tight truncate">Brand deals &amp; payouts 💸</p>
          <p className="text-[11.5px] text-[var(--hl-muted)] leading-tight">128 creators · all verified</p>
        </div>
        <span className="ml-auto text-[10px] font-bold uppercase tracking-wide text-[var(--hl-pink)] bg-white border border-[var(--hl-pink)]/25 rounded-full px-2 py-0.5">
          Private
        </span>
      </div>

      {/* Messages */}
      <div className="space-y-3 pt-3.5">
        <div className="hl-chat-msg">
          <Avatar initials="MJ" color={1} />
          <div className="min-w-0">
            <p className="text-[11.5px] font-bold mb-0.5">
              Maya J. <VerifiedBadge />
            </p>
            <div className="hl-bubble">
              <p className="text-[13px] leading-snug">Is anyone else&rsquo;s reach way up this week or just me? 👀</p>
            </div>
          </div>
        </div>

        <div className="hl-chat-msg">
          <Avatar initials="DK" color={2} />
          <div className="min-w-0">
            <p className="text-[11.5px] font-bold mb-0.5">
              Dev K. <VerifiedBadge />
            </p>
            <div className="hl-bubble">
              <p className="text-[13px] leading-snug">Same here — shorts are printing. Comparing numbers in the thread 📈</p>
            </div>
          </div>
        </div>

        <div className="hl-chat-msg">
          <Avatar initials="AR" color={0} />
          <div className="min-w-0">
            <p className="text-[11.5px] font-bold mb-0.5">
              Aisha R. <VerifiedBadge />
            </p>
            <div className="hl-bubble">
              <p className="text-[13px] leading-snug">A brand just offered me exclusivity — what&rsquo;s a fair rate? Real answers only 🙏</p>
            </div>
          </div>
        </div>

        {/* Typing indicator */}
        <div className="hl-chat-msg items-center">
          <Avatar initials="TS" color={4} />
          <div className="hl-bubble hl-typing flex items-center gap-1 px-3 py-2.5" aria-label="Someone is typing">
            <span /><span /><span />
          </div>
        </div>
      </div>
    </div>
  );
}

function VerifiedTile() {
  return (
    <div className="hl-tile p-4 sm:p-5 flex flex-col justify-between gap-4" data-reveal style={{ '--reveal-delay': '0.08s' } as React.CSSProperties}>
      <div className="flex -space-x-2.5">
        <Avatar initials="LN" color={3} size={34} />
        <Avatar initials="JP" color={4} size={34} />
        <Avatar initials="SB" color={1} size={34} />
        <span
          className="hl-avatar"
          style={{ width: 34, height: 34, fontSize: 12, background: 'var(--hl-pink-soft)', color: 'var(--hl-pink)' }}
          aria-hidden="true"
        >
          +2k
        </span>
      </div>
      <div>
        <p className="text-[15px] font-bold leading-snug">Verified creators only</p>
        <p className="text-[13px] text-[var(--hl-body)] leading-snug mt-1">
          Every member is a real, vetted creator. No brands lurking, no bots.
        </p>
      </div>
    </div>
  );
}

function NumbersTile() {
  return (
    <div className="hl-tile p-4 sm:p-5 flex flex-col justify-between gap-4" data-reveal style={{ '--reveal-delay': '0.16s' } as React.CSSProperties}>
      <div className="flex items-end gap-1.5 h-14" aria-hidden="true">
        {[38, 55, 44, 72, 60, 92].map((h, i) => (
          <div key={i} className="hl-bar" style={{ height: `${h}%`, animationDelay: `${0.15 + i * 0.07}s` }} />
        ))}
      </div>
      <div>
        <p className="text-[15px] font-bold leading-snug">Compare real experiences</p>
        <p className="text-[13px] text-[var(--hl-body)] leading-snug mt-1">
          Rates, reach, algorithm shifts — straight from creators like you.
        </p>
      </div>
    </div>
  );
}

function Collage() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      <div className="col-span-2">
        <ChatTile />
      </div>
      <VerifiedTile />
      <NumbersTile />
    </div>
  );
}

/* ─── Waitlist form ─────────────────────────────────────────────────────── */

const CREATOR_CATEGORIES = [
  'Beauty & Skincare',
  'Comedy & Entertainment',
  'Education',
  'Fashion',
  'Finance & Business',
  'Fitness & Wellness',
  'Food & Cooking',
  'Gaming',
  'Lifestyle & Vlog',
  'Music & Audio',
  'Parenting & Family',
  'Photography & Film',
  'Tech & Reviews',
  'Travel',
  'UGC Creator',
  'Other',
];

interface WaitlistForm {
  firstName: string;
  lastInitial: string;
  email: string;
  category: string;
  instagram: string;
  tiktok: string;
  x: string;
  notes: string;
}

const EMPTY_FORM: WaitlistForm = {
  firstName: '',
  lastInitial: '',
  email: '',
  category: '',
  instagram: '',
  tiktok: '',
  x: '',
  notes: '',
};

function WaitlistSection() {
  const [form, setForm] = useState<WaitlistForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [alreadyJoined, setAlreadyJoined] = useState(false);

  const update = (field: keyof WaitlistForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const data = await res.json();
        setAlreadyJoined(!!data.alreadyJoined);
      }
    } catch {
      // Storage hiccups shouldn't block the user — treat as joined.
    }

    setSubmitted(true);
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <section id="waitlist" className="scroll-mt-24 px-5 sm:px-8">
        <div className="max-w-xl mx-auto text-center py-8">
          <svg className="mx-auto mb-6" width="72" height="72" viewBox="0 0 56 56" fill="none" aria-hidden="true">
            <circle className="hl-check-circle" cx="28" cy="28" r="26" stroke="var(--hl-pink)" strokeWidth="2.5" />
            <path className="hl-check-mark" d="M17 29.5 24.5 37 39 21" stroke="var(--hl-pink)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
            {alreadyJoined ? 'You’re already on the list' : 'You’re on the list! 🎉'}
          </h2>
          <p className="text-[var(--hl-body)] text-lg leading-relaxed max-w-md mx-auto">
            {alreadyJoined
              ? 'Good news — this email is already saved. We’ll be in touch the moment Haleera opens on iOS.'
              : 'We’ll email you the moment Haleera opens its doors on iOS. Founding members get first access.'}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="waitlist" className="scroll-mt-24 px-5 sm:px-8">
      <div className="max-w-xl mx-auto">
        <div data-reveal>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
            Join the founding waitlist
          </h2>
          <p className="text-[var(--hl-body)] text-lg mb-8">
            Be first to know when Haleera launches on iOS
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" data-reveal>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_140px] gap-5">
            <div>
              <label htmlFor="hl-first" className="hl-label">
                First name<span className="hl-req" aria-hidden="true">*</span>
              </label>
              <input
                id="hl-first"
                className="hl-input"
                type="text"
                required
                autoComplete="given-name"
                placeholder="First name"
                value={form.firstName}
                onChange={update('firstName')}
              />
            </div>
            <div>
              <label htmlFor="hl-last" className="hl-label">
                Last initial<span className="hl-req" aria-hidden="true">*</span>
              </label>
              <input
                id="hl-last"
                className="hl-input"
                type="text"
                required
                maxLength={1}
                pattern="[A-Za-z]"
                title="A single letter"
                placeholder="M"
                value={form.lastInitial}
                onChange={update('lastInitial')}
              />
            </div>
          </div>

          <div>
            <label htmlFor="hl-email" className="hl-label">
              Email<span className="hl-req" aria-hidden="true">*</span>
            </label>
            <input
              id="hl-email"
              className="hl-input"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={update('email')}
            />
          </div>

          <div>
            <label htmlFor="hl-category" className="hl-label">
              Creator category<span className="hl-req" aria-hidden="true">*</span>
            </label>
            <select
              id="hl-category"
              className="hl-select"
              required
              value={form.category}
              onChange={update('category')}
            >
              <option value="" disabled>
                Select a creator category
              </option>
              {CREATOR_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {(
            [
              ['instagram', 'Instagram handle'],
              ['tiktok', 'TikTok handle'],
              ['x', 'X handle'],
            ] as const
          ).map(([field, label]) => (
            <div key={field}>
              <label htmlFor={`hl-${field}`} className="hl-label">
                {label}
              </label>
              <div className="hl-handle">
                <span className="hl-at" aria-hidden="true">@</span>
                <input
                  id={`hl-${field}`}
                  className="hl-input"
                  type="text"
                  placeholder="yourhandle"
                  value={form[field]}
                  onChange={update(field)}
                />
              </div>
            </div>
          ))}

          <div>
            <label htmlFor="hl-notes" className="hl-label">
              Notes
            </label>
            <textarea
              id="hl-notes"
              className="hl-textarea"
              rows={4}
              placeholder="Anything you&rsquo;d like us to know? (Optional)"
              value={form.notes}
              onChange={update('notes')}
            />
          </div>

          <button type="submit" className="hl-btn inline-flex w-full py-4 text-lg" disabled={submitting}>
            {submitting ? (
              <>
                <span className="w-5 h-5 rounded-full border-2 border-white/40 border-t-white animate-spin" aria-hidden="true" />
                Joining&hellip;
              </>
            ) : (
              'Join the founding waitlist'
            )}
          </button>

          <p className="text-center text-[13px] text-[var(--hl-muted)]">
            We&rsquo;ll only use this to tell you about Haleera. No spam, ever.
          </p>
        </form>
      </div>
    </section>
  );
}

/* ─── Social icons ──────────────────────────────────────────────────────── */

function SocialLinks() {
  return (
    <div className="flex items-center gap-3">
      <a href="#" className="hl-social" aria-label="Haleera on Instagram">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
          <circle cx="12" cy="12" r="4.3" />
          <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
        </svg>
      </a>
      <a href="#" className="hl-social" aria-label="Haleera on X">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M18.9 2.1h3.4l-7.4 8.5 8.7 11.3h-6.8l-5.3-6.9-6.1 6.9H2l7.9-9L1.5 2.1h7l4.8 6.3 5.6-6.3Zm-1.2 17.8h1.9L7.4 4H5.4l12.3 15.9Z" />
        </svg>
      </a>
      <a href="#" className="hl-social" aria-label="Haleera on TikTok">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M16.6 2h-3.2v13.6a2.9 2.9 0 1 1-2.9-2.9c.3 0 .6 0 .9.1V9.5a6.2 6.2 0 0 0-.9-.06 6.16 6.16 0 1 0 6.16 6.16V8.8a7.8 7.8 0 0 0 4.4 1.35V6.9a4.85 4.85 0 0 1-4.46-4.9Z" />
        </svg>
      </a>
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────────── */

export default function HaleeraPage() {
  const waitlistRef = useRef<HTMLDivElement>(null);
  const [ctaHidden, setCtaHidden] = useState(false);

  // Reveal-on-scroll
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]');
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('hl-in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('hl-in');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Hide the sticky mobile CTA while the waitlist form is on screen
  useEffect(() => {
    const target = waitlistRef.current;
    if (!target || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(
      ([entry]) => setCtaHidden(entry.isIntersecting),
      { threshold: 0.05 }
    );
    io.observe(target);
    return () => io.disconnect();
  }, []);

  const scrollToWaitlist = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <div className="hl-root min-h-screen flex flex-col">
      {/* Header */}
      <header className="hl-header">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 sm:h-[72px] flex items-center justify-between">
          <a href="#" className="flex items-center" aria-label="Haleera home">
            <Logo className="text-[26px] sm:text-[30px]" />
          </a>
          <div className="flex items-center gap-3">
            <span className="hl-ios-pill text-[13px] sm:text-sm px-3.5 py-1.5">
              <span className="hl-ios-dot" aria-hidden="true" />
              Coming to iOS
            </span>
            <a href="#waitlist" onClick={scrollToWaitlist} className="hl-btn hidden md:inline-flex text-sm px-5 py-2.5">
              Join waitlist
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="hl-hero">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-12 sm:pt-16 lg:pt-20 pb-16 sm:pb-20 relative">
            <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-14 items-center">
              {/* Copy */}
              <div>
                <p
                  className="inline-flex items-center gap-2 text-[13px] font-bold text-[var(--hl-pink)] bg-[var(--hl-pink-soft)] border border-[var(--hl-pink)]/15 rounded-full px-3.5 py-1.5 mb-6"
                  data-reveal
                >
                  <VerifiedBadge />
                  Free for creators
                </p>

                <h1
                  className="text-[40px] leading-[1.06] sm:text-6xl lg:text-[64px] font-extrabold tracking-[-0.03em] mb-6"
                  style={{ textWrap: 'balance' }}
                  data-reveal
                >
                  The creator group chat,{' '}
                  <span className="text-[var(--hl-pink)]">upgraded</span>
                </h1>

                <p
                  className="text-lg sm:text-xl text-[var(--hl-body)] leading-relaxed max-w-xl mb-8"
                  data-reveal
                  style={{ '--reveal-delay': '0.08s' } as React.CSSProperties}
                >
                  Haleera is a private, verified community where content creators can
                  discuss the platforms shaping their work, compare real experiences,
                  and connect with one another.
                </p>

                <div
                  className="flex flex-col sm:flex-row sm:items-center gap-4"
                  data-reveal
                  style={{ '--reveal-delay': '0.16s' } as React.CSSProperties}
                >
                  <a href="#waitlist" onClick={scrollToWaitlist} className="hl-btn inline-flex px-8 py-4 text-lg">
                    Join the founding waitlist
                  </a>
                  <p className="text-sm text-[var(--hl-muted)] font-medium">
                    Founding members get first access.
                  </p>
                </div>
              </div>

              {/* Collage */}
              <Collage />
            </div>
          </div>
        </section>

        {/* Value props */}
        <section className="border-y border-[var(--hl-line)] bg-[var(--hl-bg-soft)]">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-14 sm:py-16 grid sm:grid-cols-3 gap-8 sm:gap-10">
            {[
              {
                title: 'Private & verified',
                body: 'Real creators only. Every member is vetted before they get in, so conversations stay honest.',
                icon: (
                  <path d="M12 2.5 20 6v5.4c0 4.9-3.4 8.4-8 10.1-4.6-1.7-8-5.2-8-10.1V6l8-3.5Zm-1.1 12.9 5.2-5.2-1.3-1.3-3.9 3.9-1.7-1.7-1.3 1.3 3 3Z" />
                ),
              },
              {
                title: 'Talk platforms, honestly',
                body: 'Compare notes on the platforms shaping your work — reach, rates, and what’s actually changing.',
                icon: (
                  <path d="M4 4h16a1.5 1.5 0 0 1 1.5 1.5v10A1.5 1.5 0 0 1 20 17h-8.6L7 20.6a.9.9 0 0 1-1.5-.7V17H4a1.5 1.5 0 0 1-1.5-1.5v-10A1.5 1.5 0 0 1 4 4Zm3 5.3v2h2v-2H7Zm4 0v2h2v-2h-2Zm4 0v2h2v-2h-2Z" />
                ),
              },
              {
                title: 'Connect creator-to-creator',
                body: 'Find your people, swap wins and warnings, and grow alongside creators who get it.',
                icon: (
                  <path d="M8.5 11a3.25 3.25 0 1 0 0-6.5 3.25 3.25 0 0 0 0 6.5Zm7 0a3.25 3.25 0 1 0 0-6.5 3.25 3.25 0 0 0 0 6.5ZM2 19.5c0-3 3-4.9 6.5-4.9s6.5 1.9 6.5 4.9v.5H2v-.5Zm14.5.5v-.5c0-1.8-.8-3.2-2-4.2.5-.1 1-.2 1.5-.2 3 0 6 1.6 6 4.4v.5h-5.5Z" />
                ),
              },
            ].map((item, i) => (
              <div key={item.title} data-reveal style={{ '--reveal-delay': `${i * 0.08}s` } as React.CSSProperties}>
                <span className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-[var(--hl-pink-soft)] text-[var(--hl-pink)] mb-4">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    {item.icon}
                  </svg>
                </span>
                <h3 className="text-lg font-bold mb-1.5">{item.title}</h3>
                <p className="text-[15px] text-[var(--hl-body)] leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Waitlist */}
        <div ref={waitlistRef} className="py-16 sm:py-24">
          <WaitlistSection />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--hl-line)]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 sm:py-12">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-8">
            <Logo className="text-[26px]" />
            <SocialLinks />
            <nav className="flex items-center gap-6 text-[14.5px] font-medium text-[var(--hl-body)]" aria-label="Legal">
              <a href="#" className="hover:text-[var(--hl-ink)] transition-colors">Privacy</a>
              <a href="#" className="hover:text-[var(--hl-ink)] transition-colors">Terms</a>
            </nav>
            <p className="sm:ml-auto text-[13.5px] text-[var(--hl-muted)]">
              &copy; 2026 Haleera Inc.
            </p>
          </div>
        </div>
      </footer>

      {/* Sticky mobile CTA */}
      <div className={`hl-sticky-cta md:hidden ${ctaHidden ? 'hl-hidden' : ''}`}>
        <a href="#waitlist" onClick={scrollToWaitlist} className="hl-btn inline-flex w-full py-3.5 text-base">
          Join the founding waitlist
        </a>
      </div>
    </div>
  );
}
