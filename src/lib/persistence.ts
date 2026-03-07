import { OutreachStatus, LeadPersistence } from './types';

const STORAGE_KEY = 'nkhomes_lead_data';

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

export function getOutreachLevel(status: OutreachStatus): 'untouched' | 'in_progress' | 'complete' {
  const count = [status.postcard, status.email, status.text].filter(Boolean).length;
  if (count === 0) return 'untouched';
  if (count === 3) return 'complete';
  return 'in_progress';
}
