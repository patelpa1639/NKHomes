'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';

/* ─── Small building blocks ─────────────────────────────────────────────── */

function Logo({ className = '' }: { className?: string }) {
  return <span className={`hl-logo ${className}`}>haleera</span>;
}

function VerifiedBadge() {
  return (
    <svg className="hl-verified" viewBox="0 0 24 24" fill="currentColor" aria-label="Verified">
      <path d="M12 2.6 14.5 4.8l3.3-.35.9 3.2 2.85 1.7-1.45 3 1.45 3-2.85 1.7-.9 3.2-3.3-.35L12 21.4l-2.5-2.2-3.3.35-.9-3.2-2.85-1.7 1.45-3-1.45-3 2.85-1.7.9-3.2 3.3.35L12 2.6Zm-1.1 12.9 5.2-5.2-1.3-1.3-3.9 3.9-1.7-1.7-1.3 1.3 3 3Z" />
    </svg>
  );
}

const AVATAR_COLORS = [
  'linear-gradient(135deg,#e52a5d,#ff7a9e)',
  'linear-gradient(135deg,#7048e8,#9775fa)',
  'linear-gradient(135deg,#0ca678,#38d9a9)',
];

function AvatarDot({ initials, color = 0, size = 26 }: { initials: string; color?: number; size?: number }) {
  return (
    <span
      className="hl-avatar"
      style={{ background: AVATAR_COLORS[color % AVATAR_COLORS.length], width: size, height: size, fontSize: size * 0.38 }}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

/* ─── Hero photo + floating chat card ───────────────────────────────────── */

function HeroPhoto() {
  return (
    <div className="hl-photo-frame mr-[14px] mb-[14px]" data-reveal style={{ '--reveal-delay': '0.1s' } as React.CSSProperties}>
      <div className="hl-photo-box relative aspect-[16/10] lg:aspect-[4/3] border border-[var(--hl-ink)] overflow-hidden">
        <Image
          src="/haleera/photo-main.jpg"
          alt="Two creators reviewing footage together at a studio desk"
          fill
          priority
          sizes="(min-width: 1024px) 46vw, 100vw"
          className="object-cover object-[50%_18%]"
        />
      </div>

      {/* Floating group chat receipt */}
      <div className="hl-chat-card">
        <div className="px-3.5 pt-3 pb-1.5 border-b border-black/10 flex items-center gap-2">
          <span className="hl-eyebrow !text-[9px] text-[var(--hl-pink)]">Rates &amp; deals</span>
          <span className="ml-auto text-[10px] font-bold text-[var(--hl-muted)] tracking-wide">128 VERIFIED</span>
        </div>
        <div className="p-3.5 space-y-2.5">
          <div className="flex gap-2">
            <AvatarDot initials="M" color={0} />
            <div className="min-w-0">
              <p className="text-[10.5px] font-bold leading-none mb-1">
                maya.films <VerifiedBadge />
              </p>
              <p className="hl-msg-text">
                brand wants 3 videos + exclusivity for $800&hellip; am i crazy or is that low 💀
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <AvatarDot initials="D" color={2} />
            <div className="min-w-0">
              <p className="text-[10.5px] font-bold leading-none mb-1">
                dev.talks <VerifiedBadge />
              </p>
              <p className="hl-msg-text">way low. i got 2.5k for less reach</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <AvatarDot initials="A" color={1} />
            <span className="hl-typing flex items-center gap-1" aria-label="Someone is typing">
              <span /><span /><span />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Niche ticker ──────────────────────────────────────────────────────── */

const NICHES = ['Beauty', 'Gaming', 'Fitness', 'Food', 'Fashion', 'Music', 'Travel', 'Tech', 'Comedy', 'Lifestyle', 'UGC', 'Podcasts'];

function Ticker() {
  const chunk = (
    <>
      {NICHES.map((n) => (
        <span key={n}>
          {n} <span aria-hidden="true" className="ml-[1.4rem]">✦</span>
        </span>
      ))}
    </>
  );
  return (
    <div className="hl-ticker" aria-label={`For every niche: ${NICHES.join(', ')}`}>
      <div className="hl-ticker-track" aria-hidden="true">
        <div className="hl-ticker-chunk">{chunk}</div>
        <div className="hl-ticker-chunk">{chunk}</div>
      </div>
    </div>
  );
}

/* ─── Waitlist form (visual only — no backend wiring) ───────────────────── */

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

function WaitlistSection() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [category, setCategory] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    // Visual demo only — wire this up to a backend later.
    window.setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 700);
  };

  return (
    <section id="waitlist" className="hl-dark scroll-mt-16">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-16 items-start">
          {/* Left: pitch */}
          <div data-reveal>
            <p className="hl-eyebrow text-[var(--hl-pink)] mb-5">The founding waitlist</p>
            <h2 className="hl-display text-4xl sm:text-5xl font-extrabold leading-[1.02] mb-6">
              Get in before
              <br />
              the doors open.
            </h2>
            <p className="text-white/70 text-lg leading-relaxed max-w-md mb-8">
              Founding members shape Haleera from day one — first access at launch,
              first pick of rooms, and a founder badge that never goes away.
            </p>
            <ul className="space-y-3 text-[15px] text-white/80">
              {['Launches first on iOS', 'Free for creators, forever', 'Verification required — worth it'].map((line) => (
                <li key={line} className="flex items-center gap-3">
                  <span className="w-4 h-4 bg-[var(--hl-pink)] inline-flex items-center justify-center flex-none">
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="square" aria-hidden="true">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  {line}
                </li>
              ))}
            </ul>
          </div>

          {/* Right: form card */}
          <div className="hl-form-card p-6 sm:p-8" data-reveal style={{ '--reveal-delay': '0.08s' } as React.CSSProperties}>
            {submitted ? (
              <div className="text-center py-10">
                <svg className="mx-auto mb-6" width="72" height="72" viewBox="0 0 56 56" fill="none" aria-hidden="true">
                  <circle className="hl-check-circle" cx="28" cy="28" r="26" stroke="var(--hl-pink)" strokeWidth="2.5" />
                  <path className="hl-check-mark" d="M17 29.5 24.5 37 39 21" stroke="var(--hl-pink)" strokeWidth="3.5" strokeLinecap="square" strokeLinejoin="miter" />
                </svg>
                <h3 className="hl-display text-3xl font-extrabold mb-3">You&rsquo;re in line.</h3>
                <p className="text-[var(--hl-body)] text-[16px] leading-relaxed max-w-sm mx-auto">
                  Watch your inbox — the first email you get from us is the one that
                  opens the doors.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_120px] gap-5">
                  <div>
                    <label htmlFor="hl-first" className="hl-label">
                      First name<span className="hl-req" aria-hidden="true">*</span>
                    </label>
                    <input id="hl-first" className="hl-input" type="text" required autoComplete="given-name" placeholder="First name" />
                  </div>
                  <div>
                    <label htmlFor="hl-last" className="hl-label">
                      Last initial<span className="hl-req" aria-hidden="true">*</span>
                    </label>
                    <input id="hl-last" className="hl-input" type="text" required maxLength={1} pattern="[A-Za-z]" title="A single letter" placeholder="M" />
                  </div>
                </div>

                <div>
                  <label htmlFor="hl-email" className="hl-label">
                    Email<span className="hl-req" aria-hidden="true">*</span>
                  </label>
                  <input id="hl-email" className="hl-input" type="email" required autoComplete="email" placeholder="you@example.com" />
                </div>

                <div>
                  <label htmlFor="hl-category" className="hl-label">
                    Creator category<span className="hl-req" aria-hidden="true">*</span>
                  </label>
                  <select id="hl-category" className="hl-select" required value={category} onChange={(e) => setCategory(e.target.value)}>
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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  {(
                    [
                      ['instagram', 'Instagram'],
                      ['tiktok', 'TikTok'],
                      ['x', 'X'],
                    ] as const
                  ).map(([field, label]) => (
                    <div key={field}>
                      <label htmlFor={`hl-${field}`} className="hl-label">
                        {label}
                      </label>
                      <div className="hl-handle">
                        <span className="hl-at" aria-hidden="true">@</span>
                        <input id={`hl-${field}`} className="hl-input" type="text" placeholder="handle" />
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <label htmlFor="hl-notes" className="hl-label">
                    Notes
                  </label>
                  <textarea id="hl-notes" className="hl-textarea" rows={3} placeholder="Anything you&rsquo;d like us to know? (Optional)" />
                </div>

                <button type="submit" className="hl-btn inline-flex w-full py-4" disabled={submitting}>
                  {submitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white animate-spin" aria-hidden="true" />
                      Joining&hellip;
                    </>
                  ) : (
                    'Join the founding waitlist'
                  )}
                </button>

                <p className="text-center text-[12.5px] text-[var(--hl-muted)]">
                  No spam. No selling your info. Just the launch email that matters.
                </p>
              </form>
            )}
          </div>
        </div>
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

const FEATURES = [
  {
    num: '01',
    title: 'Verified, or it doesn’t get in',
    body: 'Every member is screened before they read a single message. Real creators, real handles — no brands lurking, no bots, no tourists.',
  },
  {
    num: '02',
    title: 'Talk numbers, not vibes',
    body: 'Rates, RPMs, reach drops, contract red flags. The conversations you can’t have in public, happening all day in rooms built for them.',
  },
  {
    num: '03',
    title: 'Your people, finally',
    body: 'Swap wins, warnings, and contacts with creators who actually get it. Collabs, referrals, and real talk — the group chat your career deserves.',
  },
];

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
          <div className="flex items-center gap-5">
            <span className="hl-ios-tag">
              <span className="hl-ios-dot" aria-hidden="true" />
              Coming to iOS
            </span>
            <a href="#waitlist" onClick={scrollToWaitlist} className="hl-btn hidden md:inline-flex px-5 py-2.5 !text-[12px]">
              Join waitlist
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-12 sm:pt-16 lg:pt-24 pb-14 sm:pb-20">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-14 items-center">
              {/* Copy */}
              <div>
                <p className="hl-eyebrow text-[var(--hl-pink)] mb-6" data-reveal>
                  Private ✦ Verified ✦ Free for creators
                </p>

                <h1
                  className="hl-display text-[44px] leading-[0.98] sm:text-6xl lg:text-[72px] font-extrabold tracking-[-0.035em] mb-7"
                  data-reveal
                >
                  The creator
                  <br />
                  group chat,
                  <br />
                  <span className="inline-block bg-[var(--hl-pink)] text-white px-3 py-0.5 -rotate-1 mt-1.5">
                    upgraded
                  </span>
                </h1>

                <p
                  className="text-lg sm:text-xl text-[var(--hl-body)] leading-relaxed max-w-md mb-9"
                  data-reveal
                  style={{ '--reveal-delay': '0.08s' } as React.CSSProperties}
                >
                  No brands lurking. No bots. Just verified creators comparing real
                  numbers, swapping what&rsquo;s working, and saying the things you
                  can&rsquo;t post.
                </p>

                <div
                  className="flex flex-col sm:flex-row sm:items-center gap-4"
                  data-reveal
                  style={{ '--reveal-delay': '0.14s' } as React.CSSProperties}
                >
                  <a href="#waitlist" onClick={scrollToWaitlist} className="hl-btn inline-flex px-8 py-4">
                    Join the founding waitlist
                  </a>
                  <p className="hl-eyebrow !text-[10px] text-[var(--hl-muted)]">
                    Founding spots are limited
                  </p>
                </div>
              </div>

              {/* Photo */}
              <HeroPhoto />
            </div>
          </div>

          <Ticker />
        </section>

        {/* Manifesto line */}
        <section className="max-w-6xl mx-auto px-5 sm:px-8 pt-16 sm:pt-24 pb-4 sm:pb-8">
          <p className="hl-display text-2xl sm:text-4xl font-extrabold leading-tight max-w-3xl" data-reveal>
            Group chats built the creator economy.
            <br />
            <span className="text-[var(--hl-pink)]">Ours just works harder.</span>
          </p>
        </section>

        {/* Features */}
        <section className="max-w-6xl mx-auto px-5 sm:px-8 py-12 sm:py-16 grid sm:grid-cols-3 gap-8 sm:gap-10">
          {FEATURES.map((f, i) => (
            <div key={f.num} className="hl-feature" data-reveal style={{ '--reveal-delay': `${i * 0.08}s` } as React.CSSProperties}>
              <p className="hl-feature-num mb-4">{f.num}</p>
              <h3 className="hl-display text-xl font-extrabold tracking-[-0.02em] mb-3">{f.title}</h3>
              <p className="text-[15px] text-[var(--hl-body)] leading-relaxed">{f.body}</p>
            </div>
          ))}
        </section>

        {/* Photo duo */}
        <section className="max-w-6xl mx-auto px-5 sm:px-8 pb-16 sm:pb-24">
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            <div className="relative aspect-[3/2] border border-[var(--hl-ink)] overflow-hidden" data-reveal>
              <Image
                src="/haleera/photo-a.jpg"
                alt="Creator filming herself on a phone rig"
                fill
                sizes="(min-width: 1024px) 46vw, 50vw"
                className="object-cover"
              />
              <span className="hl-caption">Filming day</span>
            </div>
            <div className="relative aspect-[3/2] border border-[var(--hl-ink)] overflow-hidden" data-reveal style={{ '--reveal-delay': '0.08s' } as React.CSSProperties}>
              <Image
                src="/haleera/photo-b.jpg"
                alt="Creator talking to camera in a studio"
                fill
                sizes="(min-width: 1024px) 46vw, 50vw"
                className="object-cover"
              />
              <span className="hl-caption">In the studio</span>
            </div>
          </div>
          <p className="hl-eyebrow !text-[10px] text-[var(--hl-muted)] mt-5" data-reveal>
            Built for working creators — from beauty to gaming to UGC
          </p>
        </section>

        {/* Waitlist */}
        <div ref={waitlistRef}>
          <WaitlistSection />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--hl-hairline)]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 sm:py-12">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-8">
            <Logo className="text-[26px]" />
            <SocialLinks />
            <nav className="flex items-center gap-6 text-[14px] font-semibold text-[var(--hl-body)]" aria-label="Legal">
              <a href="#" className="hover:text-[var(--hl-pink)] transition-colors">Privacy</a>
              <a href="#" className="hover:text-[var(--hl-pink)] transition-colors">Terms</a>
            </nav>
            <p className="sm:ml-auto text-[13px] text-[var(--hl-muted)]">
              &copy; 2026 Haleera Inc.
            </p>
          </div>
        </div>
      </footer>

      {/* Sticky mobile CTA */}
      <div className={`hl-sticky-cta md:hidden ${ctaHidden ? 'hl-hidden' : ''}`}>
        <a href="#waitlist" onClick={scrollToWaitlist} className="hl-btn inline-flex w-full py-3.5">
          Join the founding waitlist
        </a>
      </div>
    </div>
  );
}
