'use client';

import { useState, useEffect, useRef } from 'react';

const PIN = '2336';

export default function PinGate({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(true);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const auth = sessionStorage.getItem('nk-auth');
    if (auth === 'true') {
      setAuthenticated(true);
    }
    setChecking(false);
  }, []);

  useEffect(() => {
    if (!checking && !authenticated) {
      inputRefs.current[0]?.focus();
    }
  }, [checking, authenticated]);

  const handleDigit = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value.slice(-1);
    setPin(newPin);
    setError(false);

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 4 digits entered
    if (value && index === 3) {
      const fullPin = newPin.join('');
      if (fullPin === PIN) {
        sessionStorage.setItem('nk-auth', 'true');
        setAuthenticated(true);
      } else {
        setError(true);
        setTimeout(() => {
          setPin(['', '', '', '']);
          setError(false);
          inputRefs.current[0]?.focus();
        }, 1200);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-6 h-6 border-2 border-gold/30 border-t-gold animate-spin" />
      </div>
    );
  }

  if (authenticated) return <>{children}</>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6">
      {/* Logo */}
      <div className="flex items-center gap-4 mb-16">
        <div className="relative w-12 h-12 border border-gold/50 flex items-center justify-center">
          <span className="font-display text-xl font-bold text-gold tracking-wider">NK</span>
          <div className="absolute -top-px -left-px w-2.5 h-px bg-gold" />
          <div className="absolute -top-px -left-px w-px h-2.5 bg-gold" />
          <div className="absolute -bottom-px -right-px w-2.5 h-px bg-gold" />
          <div className="absolute -bottom-px -right-px w-px h-2.5 bg-gold" />
        </div>
        <div>
          <p className="font-display text-2xl font-semibold text-text-primary tracking-[0.04em]">NK HOMES</p>
          <p className="text-[9px] text-text-muted tracking-[0.25em] uppercase font-body font-medium">ARM Lead Intelligence</p>
        </div>
      </div>

      {/* PIN entry */}
      <p className="text-[11px] text-text-muted tracking-[0.2em] uppercase font-body font-semibold mb-6">
        Enter Access PIN
      </p>

      <div className="flex gap-3 mb-6">
        {pin.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleDigit(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className={`w-14 h-14 text-center text-2xl font-display font-bold border-2 transition-all duration-200 ${
              error
                ? 'border-alert/50 text-alert bg-alert/[0.04] animate-shake'
                : digit
                  ? 'border-gold/40 text-gold bg-gold/[0.04]'
                  : 'border-border-strong text-text-primary bg-transparent focus:border-gold/40'
            }`}
          />
        ))}
      </div>

      {error && (
        <p className="text-alert text-[12px] font-body font-medium mb-4 animate-fade-in">
          Incorrect PIN
        </p>
      )}

      <p className="text-[10px] text-text-muted/50 font-body mt-8">
        Authorized access only
      </p>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          50% { transform: translateX(6px); }
          75% { transform: translateX(-4px); }
        }
        .animate-shake { animation: shake 0.4s ease-in-out; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fadeIn 0.3s ease; }
      `}</style>
    </div>
  );
}
