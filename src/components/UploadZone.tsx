'use client';

import { useState, useRef, useCallback } from 'react';

interface UploadZoneProps {
  onFileUpload: (file: File) => void;
  isProcessing: boolean;
}

export default function UploadZone({ onFileUpload, isProcessing }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && file.name.endsWith('.csv')) {
        onFileUpload(file);
      }
    },
    [onFileUpload]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onFileUpload(file);
      }
    },
    [onFileUpload]
  );

  return (
    <div className="relative z-10 max-w-[1440px] mx-auto px-8 mb-5">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border border-dashed cursor-pointer transition-all duration-300 py-6 px-8 text-center
          ${isDragging
            ? 'border-gold/50 bg-gold/[0.04]'
            : 'border-border-strong hover:border-gold/30 hover:bg-gold/[0.02]'
          }
          ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
        />

        {isProcessing ? (
          <div className="flex items-center justify-center gap-3">
            <div className="w-4 h-4 border-2 border-gold/30 border-t-gold animate-spin" />
            <p className="text-gold/80 font-body text-sm font-medium">Processing CSV...</p>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center justify-center w-9 h-9 border border-border-strong bg-bg-elevated/50">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-text-muted">
                <path d="M8 1v10M4 5l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
                <path d="M2 12v2h12v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-text-secondary font-body text-[13px] font-medium">
                Drop Bright MLS export or click to upload
              </p>
              <p className="text-text-muted font-body text-[11px] mt-0.5">
                .csv format &middot; Outreach data preserved on re-upload
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
