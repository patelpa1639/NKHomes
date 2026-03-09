export interface RawLead {
  address: string;
  sale_price: number;
  sale_date: string;
  beds: number;
  baths: number;
  sqft: number;
  property_type: string;
  neighborhood: string;
  tax_assessed_value?: number;
}

export interface Lead extends RawLead {
  id: string;
  sale_year: number;
  arm5_reset_year: number;
  arm7_reset_year: number;
  estimated_value: number;
  mortgage_balance: number;
  equity: number;
  tax_assessed_value: number;
  score: number;
  score_tier: 'high' | 'warm' | 'monitor';
  score_breakdown: ScoreBreakdown;
  is_target_neighborhood: boolean;
}

export interface ScoreBreakdown {
  equity_points: number;
  arm_reset_points: number;
  neighborhood_points: number;
  total: number;
}

export interface OutreachStatus {
  postcard: boolean;
  email: boolean;
  text: boolean;
  notes: string;
  priority: boolean;
}

export interface LeadPersistence {
  [address: string]: OutreachStatus;
}

export type OutreachLevel = 'untouched' | 'in_progress' | 'complete';

export interface MortgageInfo {
  amount: number;
  interestRate: number | null;
  interestRateType: string; // "Fixed Rate" | "Adjustable Rate" etc.
  lenderName: string;
  lenderType: string;
  loanType: string; // e.g. "Stand Alone Refi (Refinance Of Original Loan)"
  loanTypeCode: string;
  term: string; // months, e.g. "360"
  maturityDate: string | null;
  documentDate: string | null;
  position: string; // "First", "Second"
}

export interface PropertyVerification {
  adjustableRate: boolean;
  estimatedValue: number;
  estimatedEquity: number;
  equityPercent: number;
  estimatedMortgageBalance: number;
  openMortgageBalance: number;
  currentMortgages: MortgageInfo[];
  ownerName: string | null;
  yearBuilt: number | null;
  propertyUse: string | null;
  lastSaleDate: string | null;
  lastSalePrice: number | null;
  fetchedAt: string; // ISO timestamp
}

export type SortField =
  | 'score'
  | 'address'
  | 'neighborhood'
  | 'sale_price'
  | 'sale_year'
  | 'arm5_reset_year'
  | 'arm7_reset_year'
  | 'estimated_value'
  | 'equity';

export type SortDirection = 'asc' | 'desc';

export interface Filters {
  armType: string;
  resetYear: string;
  neighborhood: string;
  scoreRange: string;
  outreachStatus: string;
  search: string;
}
