'use client';

import { useState, useEffect, useCallback } from 'react';
import { HomeValueSubmission, loadSubmissions, updateSubmission } from '@/lib/submissions';

export default function SubmissionsPanel() {
  const [submissions, setSubmissions] = useState<HomeValueSubmission[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setSubmissions(loadSubmissions());
  }, []);

  useEffect(() => {
    refresh();
    // Poll for new submissions every 10 seconds
    const interval = setInterval(refresh, 10000);
    return () => clearInterval(interval);
  }, [refresh]);

  const handleStatusChange = (id: string, status: 'new' | 'contacted' | 'converted') => {
    updateSubmission(id, { status });
    refresh();
  };

  const handleNotesChange = (id: string, notes: string) => {
    updateSubmission(id, { notes });
    refresh();
  };

  if (submissions.length === 0) {
    return null;
  }

  const newCount = submissions.filter((s) => s.status === 'new').length;

  return (
    <div className="relative z-10 max-w-[1440px] mx-auto px-8 mb-6">
      <div className="border border-border-custom bg-bg-card/30">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border-custom bg-bg-elevated/40">
          <div className="flex items-center gap-3">
            <p className="text-[10px] text-gold/70 tracking-[0.15em] uppercase font-body font-semibold">
              Home Value Submissions
            </p>
            {newCount > 0 && (
              <span className="bg-gold text-white text-[10px] font-body font-bold px-2 py-0.5">
                {newCount} new
              </span>
            )}
          </div>
          <p className="text-[11px] text-text-muted font-body">
            {submissions.length} total
          </p>
        </div>

        {/* Table */}
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-custom">
              <th className="px-5 py-2.5 text-left text-[10px] font-body font-semibold text-text-muted uppercase tracking-[0.1em]">Status</th>
              <th className="px-5 py-2.5 text-left text-[10px] font-body font-semibold text-text-muted uppercase tracking-[0.1em]">Name</th>
              <th className="px-5 py-2.5 text-left text-[10px] font-body font-semibold text-text-muted uppercase tracking-[0.1em]">Address</th>
              <th className="px-5 py-2.5 text-left text-[10px] font-body font-semibold text-text-muted uppercase tracking-[0.1em]">Email</th>
              <th className="px-5 py-2.5 text-left text-[10px] font-body font-semibold text-text-muted uppercase tracking-[0.1em]">Phone</th>
              <th className="px-5 py-2.5 text-left text-[10px] font-body font-semibold text-text-muted uppercase tracking-[0.1em]">Date</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((sub) => (
              <>
                <tr
                  key={sub.id}
                  onClick={() => setExpandedId(expandedId === sub.id ? null : sub.id)}
                  className="border-b border-border-custom cursor-pointer hover:bg-black/[0.02] transition-colors text-[12px] font-body"
                >
                  <td className="px-5 py-2.5">
                    <span className={`inline-block px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase
                      ${sub.status === 'new' ? 'bg-gold/[0.12] text-gold border border-gold/25' : ''}
                      ${sub.status === 'contacted' ? 'bg-warning/[0.08] text-warning border border-warning/20' : ''}
                      ${sub.status === 'converted' ? 'bg-success/[0.08] text-success border border-success/20' : ''}
                    `}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-5 py-2.5 text-text-primary font-medium">{sub.name}</td>
                  <td className="px-5 py-2.5 text-text-secondary max-w-[250px] truncate">{sub.address}</td>
                  <td className="px-5 py-2.5 text-text-muted">{sub.email}</td>
                  <td className="px-5 py-2.5 text-text-muted">{sub.phone || '—'}</td>
                  <td className="px-5 py-2.5 text-text-muted tabular-nums">
                    {new Date(sub.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </td>
                </tr>
                {expandedId === sub.id && (
                  <tr key={`${sub.id}-expanded`}>
                    <td colSpan={6} className="px-5 py-4 bg-bg-card/40 border-b border-border-custom">
                      <div className="flex items-start gap-8">
                        {/* Status buttons */}
                        <div>
                          <p className="text-[10px] text-text-muted tracking-[0.1em] uppercase font-body font-semibold mb-2">Update Status</p>
                          <div className="flex gap-2">
                            {(['new', 'contacted', 'converted'] as const).map((status) => (
                              <button
                                key={status}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(sub.id, status);
                                }}
                                className={`text-[10px] font-body font-medium px-3 py-1.5 border transition-all capitalize
                                  ${sub.status === status
                                    ? 'border-gold/30 bg-gold/[0.08] text-gold'
                                    : 'border-border-custom text-text-muted hover:border-border-strong'
                                  }`}
                              >
                                {status}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Notes */}
                        <div className="flex-1">
                          <p className="text-[10px] text-text-muted tracking-[0.1em] uppercase font-body font-semibold mb-2">Notes</p>
                          <textarea
                            defaultValue={sub.notes}
                            onBlur={(e) => handleNotesChange(sub.id, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            placeholder="Add notes about this submission..."
                            className="w-full bg-bg-primary/50 border border-border-custom text-text-secondary text-[12px] font-body p-2.5 h-16 resize-none focus:border-gold/25 placeholder:text-text-muted/60"
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
