'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Lead } from '@/lib/types';
import { processLead } from '@/lib/scoring';
import { sampleLeads } from '@/lib/sampleData';
import QRCode from 'qrcode';

interface PostcardData {
  recipientName: string;
  recipientAddress: string;
  neighborhood: string;
  estimatedValue: string;
  equity: string;
  headline: string;
  bodyText: string;
  ctaText: string;
  qrUrl: string;
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

const DEFAULT_QR_URL = typeof window !== 'undefined'
  ? `${window.location.origin}/value`
  : 'https://nkhomes-arm-intelligence.vercel.app/value';

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
    qrUrl: DEFAULT_QR_URL,
  });
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [postcardStyle, setPostcardStyle] = useState<'classic' | 'modern' | 'bold'>('classic');
  const postcardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const processed = sampleLeads.map(processLead);
    setLeads(processed);
  }, []);

  const generateQR = useCallback(async (url: string) => {
    try {
      const dataUrl = await QRCode.toDataURL(url, {
        width: 200,
        margin: 1,
        color: { dark: '#000000', light: '#ffffff' },
      });
      setQrDataUrl(dataUrl);
    } catch (err) {
      console.error('QR generation failed:', err);
    }
  }, []);

  useEffect(() => {
    generateQR(postcardData.qrUrl);
  }, [postcardData.qrUrl, generateQR]);

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
    if (!postcardRef.current) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>NK Homes Postcard</title>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { background: white; }
          @page { size: 6in 4in; margin: 0; }
          @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
        </style>
      </head>
      <body>${postcardRef.current.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  };

  return (
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
        <div className="grid grid-cols-[340px_1fr] gap-8">
          {/* Left Panel: Controls */}
          <div className="space-y-6">
            {/* Select Lead */}
            <div>
              <p className="text-[10px] text-gold/70 tracking-[0.15em] uppercase font-body font-semibold mb-3">Select Lead</p>
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
            </div>

            {/* Style */}
            <div>
              <p className="text-[10px] text-gold/70 tracking-[0.15em] uppercase font-body font-semibold mb-3">Style</p>
              <div className="flex gap-2">
                {(['classic', 'modern', 'bold'] as const).map((style) => (
                  <button
                    key={style}
                    onClick={() => setPostcardStyle(style)}
                    className={`flex-1 text-[11px] font-body font-medium py-2 border transition-all capitalize
                      ${postcardStyle === style
                        ? 'border-gold/30 bg-gold/[0.08] text-gold'
                        : 'border-border-custom text-text-muted hover:border-border-strong'
                      }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Headline */}
            <div>
              <p className="text-[10px] text-gold/70 tracking-[0.15em] uppercase font-body font-semibold mb-3">Headline</p>
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
                placeholder="Or type custom headline..."
              />
            </div>

            {/* Body */}
            <div>
              <p className="text-[10px] text-gold/70 tracking-[0.15em] uppercase font-body font-semibold mb-3">Body Text</p>
              <select
                onChange={(e) => {
                  const text = e.target.value.replace(/\{neighborhood\}/g, postcardData.neighborhood || 'your area');
                  update('bodyText', text);
                }}
                className="w-full bg-bg-card/60 border border-border-custom text-text-secondary text-[12px] font-body px-3 py-2.5 focus:border-gold/30 appearance-none cursor-pointer mb-2"
              >
                <option value="">Choose template...</option>
                {BODY_TEMPLATES.map((b, i) => (
                  <option key={i} value={b}>{b.slice(0, 60)}...</option>
                ))}
              </select>
              <textarea
                value={postcardData.bodyText}
                onChange={(e) => update('bodyText', e.target.value)}
                rows={3}
                className="w-full bg-bg-card/60 border border-border-custom text-text-secondary text-[12px] font-body px-3 py-2.5 focus:border-gold/30 resize-none"
              />
            </div>

            {/* CTA Text */}
            <div>
              <p className="text-[10px] text-gold/70 tracking-[0.15em] uppercase font-body font-semibold mb-3">Call to Action</p>
              <input
                type="text"
                value={postcardData.ctaText}
                onChange={(e) => update('ctaText', e.target.value)}
                className="w-full bg-bg-card/60 border border-border-custom text-text-secondary text-[12px] font-body px-3 py-2.5 focus:border-gold/30"
              />
            </div>

            {/* QR URL */}
            <div>
              <p className="text-[10px] text-gold/70 tracking-[0.15em] uppercase font-body font-semibold mb-3">QR Code URL</p>
              <input
                type="text"
                value={postcardData.qrUrl}
                onChange={(e) => update('qrUrl', e.target.value)}
                className="w-full bg-bg-card/60 border border-border-custom text-text-secondary text-[12px] font-body px-3 py-2.5 focus:border-gold/30"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handlePrint}
                className="flex-1 bg-gold text-bg-primary text-[11px] font-body font-bold tracking-[0.1em] uppercase py-2.5 hover:bg-gold-light transition-colors"
              >
                Print / Save PDF
              </button>
            </div>
          </div>

          {/* Right Panel: Postcard Preview */}
          <div>
            <p className="text-[10px] text-gold/70 tracking-[0.15em] uppercase font-body font-semibold mb-3">
              Preview <span className="text-text-muted/40">(6&quot; x 4&quot; postcard)</span>
            </p>

            {/* Front */}
            <p className="text-[10px] text-text-muted font-body mb-2 tracking-wider uppercase">Front</p>
            <div ref={postcardRef}>
              <div
                className="relative overflow-hidden"
                style={{
                  width: '100%',
                  maxWidth: '720px',
                  aspectRatio: '6/4',
                  background: postcardStyle === 'classic'
                    ? 'linear-gradient(135deg, #0a0b10 0%, #141722 50%, #0a0b10 100%)'
                    : postcardStyle === 'modern'
                      ? 'linear-gradient(180deg, #141722 0%, #1a1e2e 100%)'
                      : '#0a0b10',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                {/* Gold top accent */}
                <div style={{ height: '3px', background: 'linear-gradient(90deg, transparent, #d4a853, transparent)' }} />

                {/* Content */}
                <div style={{ padding: '28px 32px', height: 'calc(100% - 3px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  {/* Top: Logo */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '36px', height: '36px', border: '1px solid rgba(212,168,83,0.5)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(212,168,83,0.05)',
                      }}>
                        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '14px', fontWeight: 700, color: '#d4a853', letterSpacing: '2px' }}>NK</span>
                      </div>
                      <div>
                        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '14px', fontWeight: 600, color: '#eeeae4', letterSpacing: '1px' }}>NK HOMES</p>
                        <p style={{ fontSize: '7px', color: '#6b6860', letterSpacing: '3px', textTransform: 'uppercase' }}>Brokered by Samson Properties</p>
                      </div>
                    </div>

                    {postcardStyle === 'bold' && postcardData.estimatedValue && (
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '8px', color: '#6b6860', letterSpacing: '2px', textTransform: 'uppercase' }}>Estimated Value</p>
                        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 700, color: '#d4a853' }}>{postcardData.estimatedValue}</p>
                      </div>
                    )}
                  </div>

                  {/* Middle: Headline */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingRight: postcardStyle === 'classic' ? '160px' : '140px' }}>
                    <h2 style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: postcardStyle === 'bold' ? '26px' : '22px',
                      fontWeight: postcardStyle === 'bold' ? 700 : 600,
                      color: '#eeeae4',
                      lineHeight: 1.3,
                      marginBottom: '12px',
                    }}>
                      {postcardData.headline}
                    </h2>
                    <p style={{
                      fontSize: '10px',
                      color: '#b0ada6',
                      lineHeight: 1.7,
                      maxWidth: '380px',
                    }}>
                      {postcardData.bodyText}
                    </p>
                  </div>

                  {/* Bottom: CTA + QR */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                      <p style={{
                        fontSize: '9px',
                        color: '#d4a853',
                        letterSpacing: '2px',
                        textTransform: 'uppercase',
                        fontWeight: 600,
                        marginBottom: '4px',
                      }}>
                        {postcardData.ctaText}
                      </p>
                      <p style={{ fontSize: '8px', color: '#6b6860' }}>
                        Neena Kalra &middot; Loudoun &amp; Fairfax County
                      </p>
                    </div>

                    {qrDataUrl && (
                      <div style={{
                        width: '72px', height: '72px', padding: '4px',
                        background: 'white',
                        position: 'absolute',
                        right: '32px',
                        bottom: '28px',
                      }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={qrDataUrl} alt="QR Code" style={{ width: '100%', height: '100%' }} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Gold bottom accent */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, rgba(212,168,83,0.3), transparent)' }} />
              </div>
            </div>

            {/* Back */}
            <p className="text-[10px] text-text-muted font-body mb-2 mt-6 tracking-wider uppercase">Back</p>
            <div
              style={{
                width: '100%',
                maxWidth: '720px',
                aspectRatio: '6/4',
                background: 'white',
                fontFamily: "'Inter', sans-serif",
                padding: '24px',
                display: 'flex',
              }}
            >
              {/* Left half: Message area */}
              <div style={{ flex: 1, borderRight: '1px solid #e0e0e0', paddingRight: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <div style={{ width: '28px', height: '28px', border: '1px solid #d4a853', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '11px', fontWeight: 700, color: '#d4a853' }}>NK</span>
                    </div>
                    <div>
                      <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '11px', fontWeight: 600, color: '#1a1a1a' }}>NK HOMES</p>
                      <p style={{ fontSize: '6px', color: '#999', letterSpacing: '2px', textTransform: 'uppercase' }}>Samson Properties</p>
                    </div>
                  </div>
                  <p style={{ fontSize: '10px', color: '#666', lineHeight: 1.7 }}>
                    Neena Kalra<br />
                    Licensed Real Estate Agent<br />
                    Loudoun &amp; Fairfax County, VA
                  </p>
                </div>
                <p style={{ fontSize: '8px', color: '#999', letterSpacing: '1px' }}>SCAN THE QR CODE ON THE FRONT FOR YOUR FREE HOME VALUE REPORT</p>
              </div>

              {/* Right half: Address area */}
              <div style={{ flex: 1, paddingLeft: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ width: '60px', height: '60px', border: '1px solid #ddd', float: 'right', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <p style={{ fontSize: '7px', color: '#999', textTransform: 'uppercase', letterSpacing: '1px' }}>Stamp</p>
                  </div>
                </div>
                <div style={{ clear: 'both', paddingTop: '40px' }}>
                  <p style={{ fontSize: '12px', color: '#1a1a1a', fontWeight: 500, lineHeight: 1.8 }}>
                    {postcardData.recipientName}<br />
                    {postcardData.recipientAddress || '123 Main Street, Ashburn VA 20148'}
                  </p>
                </div>
                <div />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
