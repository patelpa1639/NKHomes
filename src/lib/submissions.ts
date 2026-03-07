export interface HomeValueSubmission {
  id: string;
  address: string;
  name: string;
  email: string;
  phone: string;
  submittedAt: string;
  status: 'new' | 'contacted' | 'converted';
  notes: string;
}

const SUBMISSIONS_KEY = 'nkhomes_submissions';

export function loadSubmissions(): HomeValueSubmission[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(SUBMISSIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveSubmission(submission: Omit<HomeValueSubmission, 'id' | 'submittedAt' | 'status' | 'notes'>): HomeValueSubmission {
  const full: HomeValueSubmission = {
    ...submission,
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    submittedAt: new Date().toISOString(),
    status: 'new',
    notes: '',
  };
  const all = loadSubmissions();
  all.unshift(full);
  if (typeof window !== 'undefined') {
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(all));
  }
  return full;
}

export function updateSubmission(id: string, updates: Partial<HomeValueSubmission>): void {
  if (typeof window === 'undefined') return;
  const all = loadSubmissions();
  const idx = all.findIndex((s) => s.id === id);
  if (idx >= 0) {
    all[idx] = { ...all[idx], ...updates };
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(all));
  }
}
