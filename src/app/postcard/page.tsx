'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Lead, RawLead } from '@/lib/types';
import { processLead } from '@/lib/scoring';
import { sampleLeads } from '@/lib/sampleData';
import { loadRawLeads } from '@/lib/persistence';
import QRCode from 'qrcode';
import PinGate from '@/components/PinGate';

interface PostcardData {
  recipientName: string;
  recipientAddress: string;
  neighborhood: string;
  estimatedValue: string;
  equity: string;
  headline: string;
  bodyText: string;
  ctaText: string;
}

const HEADLINE_TEMPLATES = [
  'Your Home Could Be Worth More Than You Think',
  'Thinking About Your Next Move?',
  'The Market Is Moving — Are You?',
  'Your Neighborhood Is in Demand',
  'Know Your Home\'s True Value',
];

const BODY_TEMPLATES = [
  'Recent sales in {neighborhood} show strong appreciation. Get a complimentary, no-obligation market analysis of your property.',
  'Homes in {neighborhood} have seen significant equity growth. Find out what your home is worth in today\'s market.',
  'As a local real estate specialist, I\'d love to share what\'s happening in the {neighborhood} market and how it affects your home\'s value.',
];

function getBaseUrl() {
  if (typeof window !== 'undefined') return window.location.origin;
  return 'https://nkhomes-arm-intelligence.vercel.app';
}

export default function PostcardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [postcardData, setPostcardData] = useState<PostcardData>({
    recipientName: 'Homeowner',
    recipientAddress: '',
    neighborhood: '',
    estimatedValue: '',
    equity: '',
    headline: HEADLINE_TEMPLATES[0],
    bodyText: BODY_TEMPLATES[0],
    ctaText: 'Scan for Your Free Home Value Report',
  });
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [leadSearch, setLeadSearch] = useState('');
  const [showLeadDropdown, setShowLeadDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadLeads() {
      // Try API first
      try {
        const res = await fetch('/api/leads');
        const saved = await res.json();
        if (saved && Array.isArray(saved) && saved.length > 0) {
          const processed = (saved as RawLead[]).map(processLead);
          setLeads(processed);
          return;
        }
      } catch {
        // API not available
      }
      // Try localStorage (shared from dashboard upload)
      const local = loadRawLeads();
      if (local) {
        const processed = local.map(processLead);
        setLeads(processed);
        return;
      }
      // Fallback to sample data
      const processed = sampleLeads.map(processLead);
      setLeads(processed);
    }
    loadLeads();
  }, []);

  // Generate QR code with property-specific URL
  const generateQR = useCallback(async (address: string) => {
    try {
      const base = getBaseUrl();
      const url = address
        ? `${base}/value?address=${encodeURIComponent(address)}`
        : `${base}/value`;
      const dataUrl = await QRCode.toDataURL(url, {
        width: 240,
        margin: 1,
        color: { dark: '#000000', light: '#ffffff' },
        errorCorrectionLevel: 'M',
      });
      setQrDataUrl(dataUrl);
    } catch (err) {
      console.error('QR generation failed:', err);
    }
  }, []);

  useEffect(() => {
    generateQR(postcardData.recipientAddress);
  }, [postcardData.recipientAddress, generateQR]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowLeadDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredLeads = leads.filter((lead) => {
    if (!leadSearch) return true;
    const q = leadSearch.toLowerCase();
    return (
      lead.address.toLowerCase().includes(q) ||
      lead.neighborhood.toLowerCase().includes(q) ||
      String(lead.score).includes(q)
    );
  });

  const selectLead = (lead: Lead) => {
    setSelectedLead(lead);
    const body = postcardData.bodyText.replace(/\{neighborhood\}/g, lead.neighborhood);
    setPostcardData((prev) => ({
      ...prev,
      recipientAddress: lead.address,
      neighborhood: lead.neighborhood,
      estimatedValue: '$' + lead.estimated_value.toLocaleString(),
      equity: '$' + lead.equity.toLocaleString(),
      bodyText: body,
    }));
  };

  const update = (field: keyof PostcardData, value: string) => {
    setPostcardData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePrint = () => {
    if (!frontRef.current || !backRef.current) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const base = getBaseUrl();
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>NK Homes Postcard — ${postcardData.recipientAddress || 'Print'}</title>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=Inter:wght@300;400;500;600;700&family=Great+Vibes&display=swap" rel="stylesheet">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { background: white; }
          .page { page-break-after: always; width: 6in; height: 4in; position: relative; overflow: hidden; }
          .page img { max-width: 100%; }
          @page { size: 6in 4in; margin: 0; }
          @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
        </style>
      </head>
      <body>
        <div class="page">${frontRef.current.innerHTML.replace(/src="\/postcard/g, `src="${base}/postcard`).replace(/src="\/neena/g, `src="${base}/neena`)}</div>
        <div class="page">${backRef.current.innerHTML.replace(/src="\/postcard/g, `src="${base}/postcard`).replace(/src="\/neena/g, `src="${base}/neena`)}</div>
      </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 600);
  };

  return (
    <PinGate>
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
      <div className="bg-bg-elevated/80 backdrop-blur-xl border-b border-border-custom">
        <div className="max-w-[1440px] mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
              <div className="relative w-9 h-9 border border-gold/50 flex items-center justify-center bg-gold/5">
                <span className="font-display text-sm font-bold text-gold tracking-wider">NK</span>
              </div>
              <span className="font-display text-lg font-semibold text-text-primary tracking-[0.04em]">NK HOMES</span>
            </a>
            <span className="text-border-strong mx-2">/</span>
            <span className="text-[11px] text-gold/80 font-body font-medium tracking-[0.1em] uppercase">Postcard Designer</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" className="text-[11px] text-text-muted font-body hover:text-text-secondary transition-colors">Dashboard</a>
            <span className="text-border-strong">&middot;</span>
            <a href="/sop" className="text-[11px] text-text-muted font-body hover:text-text-secondary transition-colors">SOP</a>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-[1440px] mx-auto px-8 py-8 w-full">
        <div className="grid grid-cols-[320px_1fr] gap-8">
          {/* Left Panel: Controls */}
          <div className="space-y-5">
            {/* Select Lead */}
            <div ref={searchRef}>
              <p className="text-[10px] text-gold/70 tracking-[0.15em] uppercase font-body font-semibold mb-2">Select Lead</p>
              <div className="relative">
                <input
                  type="text"
                  value={leadSearch}
                  onChange={(e) => {
                    setLeadSearch(e.target.value);
                    setShowLeadDropdown(true);
                  }}
                  onFocus={() => setShowLeadDropdown(true)}
                  placeholder={selectedLead ? selectedLead.address : 'Search by address, area, or score...'}
                  className="w-full bg-bg-card/60 border border-border-custom text-text-secondary text-[12px] font-body px-3 py-2.5 focus:border-gold/30 placeholder:text-text-muted/50"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted/40 text-[10px]">
                  {filteredLeads.length}/{leads.length}
                </span>
                {showLeadDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-bg-card border border-border-custom shadow-lg z-50 max-h-[240px] overflow-y-auto">
                    {filteredLeads.length === 0 ? (
                      <p className="px-3 py-4 text-[11px] text-text-muted/50 font-body text-center">No leads match</p>
                    ) : (
                      filteredLeads.map((lead) => (
                        <button
                          key={lead.address}
                          onClick={() => {
                            selectLead(lead);
                            setLeadSearch('');
                            setShowLeadDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-[11px] font-body border-b border-border-custom last:border-b-0 hover:bg-gold/[0.06] transition-colors flex items-center justify-between gap-2 ${
                            selectedLead?.address === lead.address ? 'bg-gold/[0.08]' : ''
                          }`}
                        >
                          <span className="text-text-secondary truncate">{lead.address}</span>
                          <span className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-text-muted/50 text-[10px]">{lead.neighborhood}</span>
                            <span className={`w-7 h-5 flex items-center justify-center text-[9px] font-bold ${
                              lead.score >= 80 ? 'bg-gold/[0.12] text-gold' : lead.score >= 50 ? 'bg-warning/[0.08] text-warning' : 'bg-black/[0.03] text-text-muted'
                            }`}>
                              {lead.score}
                            </span>
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
              {selectedLead && (
                <div className="mt-2 p-3 bg-bg-card/40 border border-border-custom text-[11px] font-body space-y-1">
                  <div className="flex justify-between"><span className="text-text-muted">Est. Value</span><span className="text-gold font-medium">{postcardData.estimatedValue}</span></div>
                  <div className="flex justify-between"><span className="text-text-muted">Est. Equity</span><span className="text-success font-medium">{postcardData.equity}</span></div>
                  <div className="flex justify-between"><span className="text-text-muted">Score</span><span className="text-text-primary font-medium">{selectedLead.score}/100</span></div>
                </div>
              )}
            </div>

            {/* Headline */}
            <div>
              <p className="text-[10px] text-gold/70 tracking-[0.15em] uppercase font-body font-semibold mb-2">Headline</p>
              <select
                value={postcardData.headline}
                onChange={(e) => update('headline', e.target.value)}
                className="w-full bg-bg-card/60 border border-border-custom text-text-secondary text-[12px] font-body px-3 py-2.5 focus:border-gold/30 appearance-none cursor-pointer mb-2"
              >
                {HEADLINE_TEMPLATES.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
              <input
                type="text"
                value={postcardData.headline}
                onChange={(e) => update('headline', e.target.value)}
                className="w-full bg-bg-card/60 border border-border-custom text-text-secondary text-[12px] font-body px-3 py-2.5 focus:border-gold/30"
                placeholder="Or type custom..."
              />
            </div>

            {/* Body */}
            <div>
              <p className="text-[10px] text-gold/70 tracking-[0.15em] uppercase font-body font-semibold mb-2">Body Text</p>
              <select
                onChange={(e) => {
                  const text = e.target.value.replace(/\{neighborhood\}/g, postcardData.neighborhood || 'your area');
                  update('bodyText', text);
                }}
                className="w-full bg-bg-card/60 border border-border-custom text-text-secondary text-[12px] font-body px-3 py-2.5 focus:border-gold/30 appearance-none cursor-pointer mb-2"
              >
                <option value="">Choose template...</option>
                {BODY_TEMPLATES.map((b, i) => (
                  <option key={i} value={b}>{b.slice(0, 50)}...</option>
                ))}
              </select>
              <textarea
                value={postcardData.bodyText}
                onChange={(e) => update('bodyText', e.target.value)}
                rows={3}
                className="w-full bg-bg-card/60 border border-border-custom text-text-secondary text-[12px] font-body px-3 py-2.5 focus:border-gold/30 resize-none"
              />
            </div>

            {/* CTA */}
            <div>
              <p className="text-[10px] text-gold/70 tracking-[0.15em] uppercase font-body font-semibold mb-2">Call to Action</p>
              <input type="text" value={postcardData.ctaText} onChange={(e) => update('ctaText', e.target.value)}
                className="w-full bg-bg-card/60 border border-border-custom text-text-secondary text-[12px] font-body px-3 py-2.5 focus:border-gold/30" />
            </div>

            {/* QR Info */}
            <div className="p-3 bg-bg-card/30 border border-border-custom">
              <p className="text-[10px] text-text-muted font-body mb-1">QR code links to:</p>
              <p className="text-[11px] text-gold/80 font-body font-medium break-all">
                /value{postcardData.recipientAddress ? `?address=${encodeURIComponent(postcardData.recipientAddress)}` : ''}
              </p>
              <p className="text-[10px] text-text-muted/50 font-body mt-1">Property-specific — homeowner sees only their address</p>
            </div>

            {/* Actions */}
            <button
              onClick={handlePrint}
              className="w-full bg-gold text-white text-[11px] font-body font-bold tracking-[0.1em] uppercase py-3 hover:bg-gold-light transition-colors"
            >
              Print / Save PDF
            </button>
          </div>

          {/* Right Panel: Postcard Preview */}
          <div>
            <p className="text-[10px] text-gold/70 tracking-[0.15em] uppercase font-body font-semibold mb-3">
              Preview <span className="text-text-muted/40">(6&quot; x 4&quot; postcard)</span>
            </p>

            {/* ===== FRONT SIDE ===== */}
            <p className="text-[10px] text-text-muted font-body mb-2 tracking-wider uppercase">Front — Marketing Card</p>
            <div ref={frontRef}>
              <div
                style={{
                  width: '100%',
                  maxWidth: '720px',
                  aspectRatio: '6/4',
                  position: 'relative',
                  overflow: 'hidden',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                {/* Actual 1.png as background */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/postcard-front.png"
                  alt="NK Homes Postcard Front"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />

                {/* Top-left — editable text positioned over the baked-in text, transparent bg */}
                <div style={{
                  position: 'absolute',
                  top: '4%',
                  left: '3%',
                  width: '45%',
                  height: '50%',
                  padding: '10px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  zIndex: 2,
                }}>
                  <p style={{
                    fontSize: '9px',
                    fontWeight: 700,
                    color: 'rgba(255,255,255,0.65)',
                    letterSpacing: '2.5px',
                    textTransform: 'uppercase',
                    marginBottom: '10px',
                  }}>
                    NEENA K HOMES
                  </p>
                  <h2 style={{
                    fontSize: '26px',
                    fontWeight: 900,
                    color: '#ffffff',
                    lineHeight: 1.1,
                    letterSpacing: '-0.3px',
                    marginBottom: '12px',
                  }}>
                    {postcardData.headline}
                  </h2>
                  <p style={{
                    fontSize: '11px',
                    color: 'rgba(255,255,255,0.75)',
                    lineHeight: 1.6,
                  }}>
                    {postcardData.bodyText}
                  </p>
                </div>

                {/* Bottom-left — editable bullet points positioned over baked-in text */}
                <div style={{
                  position: 'absolute',
                  bottom: '3%',
                  left: '3%',
                  width: '45%',
                  height: '40%',
                  padding: '10px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  zIndex: 2,
                }}>
                  <p style={{
                    fontSize: '10px',
                    color: 'rgba(255,255,255,0.8)',
                    fontWeight: 600,
                    marginBottom: '8px',
                  }}>
                    {postcardData.ctaText}
                  </p>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    fontSize: '9px',
                    color: 'rgba(255,255,255,0.7)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: '#a8d8a8' }}>&#10003;</span>
                      <span>Your true market value (not a guess)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: '#a8d8a8' }}>&#10003;</span>
                      <span>What buyers would actually pay today</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: '#a8d8a8' }}>&#10003;</span>
                      <span>Nearby sales most agents don&apos;t show</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: '#a8d8a8' }}>&#10003;</span>
                      <span>Hidden opportunities (even if you&apos;re not selling)</span>
                    </div>
                  </div>
                </div>

                {/* Bottom-right — editable text positioned over the cream area */}
                <div style={{
                  position: 'absolute',
                  bottom: '3%',
                  right: '3%',
                  width: '45%',
                  height: '40%',
                  padding: '14px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center',
                  zIndex: 2,
                }}>
                  <p style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    color: '#2c2824',
                    lineHeight: 1.35,
                  }}>
                    Data-Driven Home Valuations
                  </p>
                </div>
              </div>
            </div>

            {/* ===== BACK SIDE ===== */}
            <p className="text-[10px] text-text-muted font-body mb-2 mt-6 tracking-wider uppercase">Back — Contact + Address</p>
            <div ref={backRef}>
              <div
                style={{
                  width: '100%',
                  maxWidth: '720px',
                  aspectRatio: '6/4',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Background image — 2.png design */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/postcard-back.png"
                  alt="NK Homes Postcard Back"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />

                {/* Recipient address overlay — on the white area (right side) */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  right: '5%',
                  transform: 'translateY(-50%)',
                  width: '35%',
                  zIndex: 10,
                }}>
                  {/* Stamp placeholder */}
                  <div style={{
                    display: 'flex', justifyContent: 'flex-end', marginBottom: '20px',
                  }}>
                    <div style={{
                      width: '44px', height: '44px', border: '1px solid rgba(0,0,0,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'rgba(0,0,0,0.02)',
                    }}>
                      <p style={{ fontSize: '6px', color: '#bbb', textTransform: 'uppercase', letterSpacing: '1px' }}>Stamp</p>
                    </div>
                  </div>

                  {/* Recipient */}
                  <div>
                    <p style={{
                      fontSize: '14px',
                      color: '#2c2824',
                      fontWeight: 600,
                      fontFamily: "'Inter', sans-serif",
                      lineHeight: 1.5,
                      marginBottom: '4px',
                    }}>
                      {postcardData.recipientName}
                    </p>
                    <p style={{
                      fontSize: '12px',
                      color: '#5c5650',
                      fontFamily: "'Inter', sans-serif",
                      lineHeight: 1.6,
                    }}>
                      {postcardData.recipientAddress || '123 Main Street'}
                    </p>
                    <p style={{
                      fontSize: '12px',
                      color: '#5c5650',
                      fontFamily: "'Inter', sans-serif",
                      lineHeight: 1.6,
                    }}>
                      {postcardData.neighborhood ? `${postcardData.neighborhood}, VA` : 'Ashburn, VA 20148'}
                    </p>
                  </div>

                  {/* Mailing lines */}
                  <div style={{ marginTop: '16px' }}>
                    <div style={{ height: '1px', background: 'rgba(0,0,0,0.12)', marginBottom: '12px' }} />
                    <div style={{ height: '1px', background: 'rgba(0,0,0,0.12)', marginBottom: '12px' }} />
                    <div style={{ height: '1px', background: 'rgba(0,0,0,0.12)' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </PinGate>
  );
}
