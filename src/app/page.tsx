'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StatsBar from '@/components/StatsBar';
import UploadZone from '@/components/UploadZone';
import FilterBar from '@/components/FilterBar';
import LeadTable from '@/components/LeadTable';
import SubmissionsPanel from '@/components/SubmissionsPanel';
import { Lead, RawLead, Filters, SortField, SortDirection, OutreachStatus } from '@/lib/types';
import { processLead } from '@/lib/scoring';
import { parseCSV } from '@/lib/csvParser';
import { sampleLeads } from '@/lib/sampleData';
import { getOutreach, saveOutreach, getOutreachLevel, saveRawLeads, loadRawLeads, clearRawLeads } from '@/lib/persistence';
import { exportLeadsToCSV } from '@/lib/exportCsv';
import PinGate from '@/components/PinGate';
import GreetingCard from '@/components/GreetingCard';

const DEFAULT_FILTERS: Filters = {
  armType: '',
  resetYear: '',
  neighborhood: '',
  scoreRange: '',
  outreachStatus: '',
  search: '',
};

export default function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [sortField, setSortField] = useState<SortField>('score');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [isProcessing, setIsProcessing] = useState(false);
  const [outreachCache, setOutreachCache] = useState<Record<string, OutreachStatus>>({});

  // Load saved leads from API, fall back to sample data
  useEffect(() => {
    async function loadLeads() {
      // Try API first
      try {
        const res = await fetch('/api/leads');
        const saved = await res.json();
        if (saved && Array.isArray(saved) && saved.length > 0) {
          const processed = (saved as RawLead[]).map(processLead);
          setLeads(processed);
          const cache: Record<string, OutreachStatus> = {};
          processed.forEach((lead) => {
            cache[lead.address] = getOutreach(lead.address);
          });
          setOutreachCache(cache);
          return;
        }
      } catch {
        // API not available
      }
      // Try localStorage
      const local = loadRawLeads();
      if (local) {
        const processed = local.map(processLead);
        setLeads(processed);
        const cache: Record<string, OutreachStatus> = {};
        processed.forEach((lead) => {
          cache[lead.address] = getOutreach(lead.address);
        });
        setOutreachCache(cache);
        return;
      }
      // Fallback to sample data
      const processed = sampleLeads.map(processLead);
      setLeads(processed);
      const cache: Record<string, OutreachStatus> = {};
      processed.forEach((lead) => {
        cache[lead.address] = getOutreach(lead.address);
      });
      setOutreachCache(cache);
    }
    loadLeads();
  }, []);

  const handleFileUpload = useCallback(async (file: File) => {
    setIsProcessing(true);
    try {
      const rawLeads = await parseCSV(file);
      const processed = rawLeads.map(processLead);
      setLeads(processed);

      // Load/merge outreach data
      const cache: Record<string, OutreachStatus> = {};
      processed.forEach((lead) => {
        cache[lead.address] = getOutreach(lead.address);
      });
      setOutreachCache(cache);

      // Save to localStorage so other pages (postcard) can access
      saveRawLeads(rawLeads);

      // Also try API for server persistence
      fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rawLeads),
      }).catch((err) => console.error('Failed to save leads to server:', err));
    } catch (error) {
      console.error('Failed to parse CSV:', error);
      alert('Failed to parse CSV file. Please check the format and try again.');
    }
    setIsProcessing(false);
  }, []);

  const getOutreachCached = useCallback(
    (address: string): OutreachStatus => {
      return (
        outreachCache[address] || {
          postcard: false,
          email: false,
          text: false,
          notes: '',
          priority: false,
        }
      );
    },
    [outreachCache]
  );

  const handleOutreachToggle = useCallback(
    (address: string, field: 'postcard' | 'email' | 'text') => {
      const current = getOutreachCached(address);
      const updated = { ...current, [field]: !current[field] };
      saveOutreach(address, updated);
      setOutreachCache((prev) => ({ ...prev, [address]: updated }));
    },
    [getOutreachCached]
  );

  const handleNotesChange = useCallback(
    (address: string, notes: string) => {
      const current = getOutreachCached(address);
      const updated = { ...current, notes };
      saveOutreach(address, updated);
      setOutreachCache((prev) => ({ ...prev, [address]: updated }));
    },
    [getOutreachCached]
  );

  const handlePriorityToggle = useCallback(
    (address: string) => {
      const current = getOutreachCached(address);
      const updated = { ...current, priority: !current.priority };
      saveOutreach(address, updated);
      setOutreachCache((prev) => ({ ...prev, [address]: updated }));
    },
    [getOutreachCached]
  );

  const handleDeleteLead = useCallback(
    (address: string) => {
      setLeads((prev) => prev.filter((l) => l.address !== address));
      setOutreachCache((prev) => {
        const next = { ...prev };
        delete next[address];
        return next;
      });
    },
    []
  );

  const handleDeleteAllLeads = useCallback(() => {
    setLeads([]);
    setOutreachCache({});
    clearRawLeads();
    // Clear saved leads from server so sample data loads on next visit
    fetch('/api/leads', { method: 'DELETE' }).catch(() => {});
  }, []);

  const handleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortField(field);
        setSortDirection('desc');
      }
    },
    [sortField]
  );

  // Filter and sort leads
  const filteredLeads = useMemo(() => {
    let result = [...leads];

    // Apply filters
    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter((l) => l.address.toLowerCase().includes(search));
    }

    if (filters.armType === '5/1') {
      result = result.filter((l) => l.arm5_reset_year >= new Date().getFullYear());
    } else if (filters.armType === '7/1') {
      result = result.filter((l) => l.arm7_reset_year >= new Date().getFullYear());
    }

    if (filters.resetYear) {
      const year = parseInt(filters.resetYear);
      result = result.filter(
        (l) => l.arm5_reset_year === year || l.arm7_reset_year === year
      );
    }

    if (filters.neighborhood) {
      result = result.filter((l) => l.neighborhood === filters.neighborhood);
    }

    if (filters.scoreRange) {
      switch (filters.scoreRange) {
        case 'high':
          result = result.filter((l) => l.score >= 80);
          break;
        case 'warm':
          result = result.filter((l) => l.score >= 50 && l.score < 80);
          break;
        case 'monitor':
          result = result.filter((l) => l.score < 50);
          break;
      }
    }

    if (filters.outreachStatus) {
      result = result.filter((l) => {
        const outreach = getOutreachCached(l.address);
        const level = getOutreachLevel(outreach);
        return level === filters.outreachStatus;
      });
    }

    // Sort
    result.sort((a, b) => {
      let aVal: number | string = 0;
      let bVal: number | string = 0;

      switch (sortField) {
        case 'score':
          aVal = a.score;
          bVal = b.score;
          break;
        case 'address':
          aVal = a.address;
          bVal = b.address;
          break;
        case 'neighborhood':
          aVal = a.neighborhood;
          bVal = b.neighborhood;
          break;
        case 'sale_price':
          aVal = a.sale_price;
          bVal = b.sale_price;
          break;
        case 'sale_year':
          aVal = a.sale_year;
          bVal = b.sale_year;
          break;
        case 'arm5_reset_year':
          aVal = a.arm5_reset_year;
          bVal = b.arm5_reset_year;
          break;
        case 'arm7_reset_year':
          aVal = a.arm7_reset_year;
          bVal = b.arm7_reset_year;
          break;
        case 'estimated_value':
          aVal = a.estimated_value;
          bVal = b.estimated_value;
          break;
        case 'equity':
          aVal = a.equity;
          bVal = b.equity;
          break;
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return sortDirection === 'asc'
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });

    return result;
  }, [leads, filters, sortField, sortDirection, getOutreachCached]);

  const handleExport = useCallback(() => {
    exportLeadsToCSV(filteredLeads, getOutreachCached);
  }, [filteredLeads, getOutreachCached]);

  return (
    <PinGate>
    <div className="min-h-screen flex flex-col">
      <Header />

      <GreetingCard />

      <main className="flex-1 py-6">
        <StatsBar leads={filteredLeads} getOutreach={getOutreachCached} />

        <UploadZone onFileUpload={handleFileUpload} isProcessing={isProcessing} />

        <FilterBar
          filters={filters}
          onFilterChange={setFilters}
          leads={leads}
          onExport={handleExport}
        />

        <SubmissionsPanel />

        <LeadTable
          leads={filteredLeads}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          getOutreach={getOutreachCached}
          onOutreachToggle={handleOutreachToggle}
          onNotesChange={handleNotesChange}
          onPriorityToggle={handlePriorityToggle}
          onDeleteLead={handleDeleteLead}
          onDeleteAll={handleDeleteAllLeads}
        />
      </main>

      <Footer />
    </div>
    </PinGate>
  );
}
