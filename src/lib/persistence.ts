import { OutreachStatus, LeadPersistence, RawLead } from './types';

const STORAGE_KEY = 'nkhomes_lead_data';
const LEADS_STORAGE_KEY = 'nkhomes_raw_leads';

const DEFAULT_OUTREACH: OutreachStatus = {
  postcard: false,
  email: false,
  text: false,
  notes: '',
  priority: false,
};

export function loadAllOutreach(): LeadPersistence {
  if (typeof window === 'undefined') return {};
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

export function getOutreach(address: string): OutreachStatus {
  const all = loadAllOutreach();
  return all[address] || { ...DEFAULT_OUTREACH };
}

export function saveOutreach(address: string, status: Partial<OutreachStatus>): void {
  if (typeof window === 'undefined') return;
  const all = loadAllOutreach();
  all[address] = { ...getOutreach(address), ...status };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function saveRawLeads(leads: RawLead[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(leads));
  } catch {
    // localStorage full or unavailable
  }
}

export function loadRawLeads(): RawLead[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(LEADS_STORAGE_KEY);
    if (!data) return null;
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
  } catch {
    return null;
  }
}

export function clearRawLeads(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(LEADS_STORAGE_KEY);
}

export function getOutreachLevel(status: OutreachStatus): 'untouched' | 'in_progress' | 'complete' {
  const count = [status.postcard, status.email, status.text].filter(Boolean).length;
  if (count === 0) return 'untouched';
  if (count === 3) return 'complete';
  return 'in_progress';
}
