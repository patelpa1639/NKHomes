'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Lead } from '@/lib/types';
import { processLead } from '@/lib/scoring';
import { sampleLeads } from '@/lib/sampleData';
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
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const processed = sampleLeads.map(processLead);
    setLeads(processed);
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

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>NK Homes Postcard — ${postcardData.recipientAddress || 'Print'}</title>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=Inter:wght@300;400;500;600;700&family=Great+Vibes&display=swap" rel="stylesheet">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { background: white; }
          .page { page-break-after: always; }
          @page { size: 6in 4in; margin: 0; }
          @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
        </style>
      </head>
      <body>
        <div class="page">${frontRef.current.innerHTML}</div>
        <div class="page">${backRef.current.innerHTML}</div>
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
            <div>
              <p className="text-[10px] text-gold/70 tracking-[0.15em] uppercase font-body font-semibold mb-2">Select Lead</p>
              <select
                onChange={(e) => {
                  const lead = leads.find((l) => l.address === e.target.value);
                  if (lead) selectLead(lead);
                }}
                value={selectedLead?.address || ''}
                className="w-full bg-bg-card/60 border border-border-custom text-text-secondary text-[12px] font-body px-3 py-2.5 focus:border-gold/30 appearance-none cursor-pointer"
              >
                <option value="">Choose a lead...</option>
                {leads.map((lead) => (
                  <option key={lead.address} value={lead.address}>
                    {lead.address} (Score: {lead.score})
                  </option>
                ))}
              </select>
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
            <p className="text-[10px] text-text-muted font-body mb-2 tracking-wider uppercase">Front — Brand Card</p>
            <div ref={frontRef}>
              <div
                style={{
                  width: '100%',
                  maxWidth: '720px',
                  aspectRatio: '6/4',
                  position: 'relative',
                  overflow: 'hidden',
                  background: '#0a0a0a',
                  display: 'flex',
                }}
              >
                {/* Subtle diamond crosshatch background */}
                <div style={{
                  position: 'absolute', inset: 0, opacity: 0.06,
                  backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(212,168,83,0.3) 20px, rgba(212,168,83,0.3) 21px), repeating-linear-gradient(-45deg, transparent, transparent 20px, rgba(212,168,83,0.3) 20px, rgba(212,168,83,0.3) 21px)',
                }} />

                {/* Gold accent corners */}
                <div style={{ position: 'absolute', top: 12, left: 12 }}>
                  <div style={{ width: '20px', height: '1px', background: '#d4a853' }} />
                  <div style={{ width: '1px', height: '20px', background: '#d4a853' }} />
                </div>
                <div style={{ position: 'absolute', top: 12, right: 12 }}>
                  <div style={{ width: '20px', height: '1px', background: '#d4a853', marginLeft: 'auto' }} />
                  <div style={{ width: '1px', height: '20px', background: '#d4a853', marginLeft: 'auto' }} />
                </div>
                <div style={{ position: 'absolute', bottom: 12, left: 12 }}>
                  <div style={{ width: '1px', height: '20px', background: '#d4a853' }} />
                  <div style={{ width: '20px', height: '1px', background: '#d4a853' }} />
                </div>
                <div style={{ position: 'absolute', bottom: 12, right: 12 }}>
                  <div style={{ width: '1px', height: '20px', background: '#d4a853', marginLeft: 'auto' }} />
                  <div style={{ width: '20px', height: '1px', background: '#d4a853', marginLeft: 'auto' }} />
                </div>

                {/* Left: Neena's photo cropped from card */}
                <div style={{ width: '42%', position: 'relative', overflow: 'hidden', zIndex: 1 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/neena-card-front.png"
                    alt="Neena Kalra"
                    style={{
                      width: '238%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: '0% center',
                      display: 'block',
                    }}
                  />
                  {/* Fade into dark */}
                  <div style={{
                    position: 'absolute', top: 0, right: 0, width: '50%', height: '100%',
                    background: 'linear-gradient(to left, #0a0a0a, transparent)',
                  }} />
                </div>

                {/* Right: Contact info — clean & modern */}
                <div style={{
                  width: '58%',
                  padding: '28px 32px 24px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  position: 'relative',
                  zIndex: 2,
                }}>
                  {/* Name */}
                  <p style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '26px',
                    fontWeight: 600,
                    color: '#ffffff',
                    fontStyle: 'italic',
                    marginBottom: '2px',
                    letterSpacing: '0.5px',
                  }}>
                    Neena Kalra
                  </p>
                  <p style={{
                    fontSize: '9px',
                    color: 'rgba(212,168,83,0.7)',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    fontWeight: 500,
                    marginBottom: '16px',
                  }}>
                    Realtor &middot; Licensed in Virginia
                  </p>

                  {/* Divider */}
                  <div style={{ width: '40px', height: '1px', background: 'rgba(212,168,83,0.3)', marginBottom: '14px' }} />

                  {/* Contact details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginBottom: '18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '10px', color: '#d4a853', width: '12px', textAlign: 'center' }}>&#9742;</span>
                      <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.85)', fontWeight: 500, letterSpacing: '0.5px' }}>571-277-2336</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '9px', color: '#d4a853', width: '12px', textAlign: 'center' }}>&#9993;</span>
                      <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.65)', letterSpacing: '0.3px' }}>realtor.neena.kalra@gmail.com</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '10px', color: '#d4a853', width: '12px', textAlign: 'center' }}>&#9906;</span>
                      <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.65)', letterSpacing: '0.3px' }}>14291 Park Meadow Dr Ste, Chantilly VA</span>
                    </div>
                  </div>

                  {/* Samson Properties */}
                  <div style={{ paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <p style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'rgba(255,255,255,0.9)',
                      letterSpacing: '2px',
                      textTransform: 'uppercase',
                      marginBottom: '3px',
                    }}>
                      Samson Properties
                    </p>
                    <p style={{ fontSize: '8.5px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.5px' }}>
                      703-378-8810 &middot; License #022522107
                    </p>
                  </div>
                </div>

                {/* Bottom gold accent line */}
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px',
                  background: 'linear-gradient(90deg, transparent, #d4a853 20%, #d4a853 80%, transparent)',
                  zIndex: 3,
                }} />
                {/* Top gold accent line */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
                  background: 'linear-gradient(90deg, transparent, #d4a853 20%, #d4a853 80%, transparent)',
                  zIndex: 3,
                }} />
              </div>
            </div>

            {/* ===== BACK SIDE ===== */}
            <p className="text-[10px] text-text-muted font-body mb-2 mt-6 tracking-wider uppercase">Back — Message + QR</p>
            <div ref={backRef}>
              <div
                style={{
                  width: '100%',
                  maxWidth: '720px',
                  aspectRatio: '6/4',
                  background: '#faf8f4',
                  fontFamily: "'Inter', sans-serif",
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Top gold stripe */}
                <div style={{ height: '3px', background: 'linear-gradient(90deg, #d4a853, #f0d48a, #d4a853)' }} />

                <div style={{ padding: '16px 24px', height: 'calc(100% - 3px)', display: 'flex' }}>
                  {/* Left: Message content */}
                  <div style={{ width: '52%', borderRight: '1px dashed rgba(0,0,0,0.12)', paddingRight: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    {/* NK brand */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <div style={{
                        width: '24px', height: '24px',
                        border: '1px solid rgba(184,145,58,0.4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(184,145,58,0.05)',
                      }}>
                        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '9px', fontWeight: 700, color: '#b8913a', letterSpacing: '1px' }}>NK</span>
                      </div>
                      <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '11px', fontWeight: 600, color: '#2c2824', letterSpacing: '1.5px' }}>NK HOMES</p>
                    </div>

                    {/* Headline */}
                    <h3 style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: '22px', fontWeight: 600, color: '#2c2824',
                      lineHeight: 1.3, marginBottom: '10px',
                    }}>
                      {postcardData.headline}
                    </h3>

                    {/* Body text */}
                    <p style={{ fontSize: '12px', color: '#5c5650', lineHeight: 1.7 }}>
                      {postcardData.bodyText}
                    </p>

                    {/* Contact line */}
                    <p style={{ fontSize: '8.5px', color: '#948d84', marginTop: '10px', letterSpacing: '0.3px' }}>
                      Neena Kalra &middot; 571-277-2336 &middot; realtor.neena.kalra@gmail.com
                    </p>
                  </div>

                  {/* Right: QR code + address area */}
                  <div style={{ width: '48%', paddingLeft: '20px', display: 'flex', flexDirection: 'column' }}>
                    {/* Stamp + return address row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <p style={{ fontSize: '7px', color: '#948d84', lineHeight: 1.6 }}>
                        Neena Kalra<br />Samson Properties<br />Chantilly, VA 20151
                      </p>
                      <div style={{
                        width: '44px', height: '44px', border: '1px solid rgba(0,0,0,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(0,0,0,0.02)', flexShrink: 0,
                      }}>
                        <p style={{ fontSize: '6px', color: '#ccc', textTransform: 'uppercase', letterSpacing: '1px' }}>Stamp</p>
                      </div>
                    </div>

                    {/* Recipient address */}
                    <div style={{ marginBottom: '6px' }}>
                      <p style={{ fontSize: '12px', color: '#2c2824', fontWeight: 500, lineHeight: 1.6 }}>
                        {postcardData.recipientName}
                      </p>
                      <p style={{ fontSize: '11px', color: '#5c5650', lineHeight: 1.6 }}>
                        {postcardData.recipientAddress || '123 Main Street, Ashburn VA 20148'}
                      </p>
                    </div>

                    {/* QR Code — centered and prominent */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      {qrDataUrl && (
                        <div style={{
                          width: '130px', height: '130px', padding: '6px',
                          border: '1px solid rgba(184,145,58,0.25)',
                          background: 'white', flexShrink: 0,
                        }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={qrDataUrl} alt="QR Code" style={{ width: '100%', height: '100%' }} />
                        </div>
                      )}
                      <div style={{ marginTop: '8px', textAlign: 'center' }}>
                        <div style={{
                          background: '#0a0a0a', padding: '5px 12px', marginBottom: '4px',
                          display: 'inline-block',
                        }}>
                          <p style={{ fontSize: '7.5px', color: '#d4a853', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 600 }}>
                            {postcardData.ctaText}
                          </p>
                        </div>
                        <p style={{ fontSize: '7px', color: '#948d84', letterSpacing: '0.3px' }}>
                          Free &middot; No obligation
                        </p>
                      </div>
                    </div>
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
