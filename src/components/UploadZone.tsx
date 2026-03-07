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
    <div className="relative z-10 max-w-[1600px] mx-auto px-6 mb-6">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          border-2 border-dashed cursor-pointer transition-all duration-200 p-8 text-center
          ${isDragging
            ? 'border-gold bg-gold/5'
            : 'border-border-custom hover:border-gold-dim'
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
          <div>
            <p className="text-gold font-body text-sm">Processing CSV...</p>
          </div>
        ) : (
          <div>
            <div className="text-gold-dim text-4xl mb-2">&#x2B06;</div>
            <p className="text-text-primary font-body text-sm mb-1">
              Drop your Bright MLS export here or click to upload
            </p>
            <p className="text-text-muted font-body text-xs">
              Accepts .csv files &middot; Existing outreach data will be preserved
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
