import { RawLead, Lead, ScoreBreakdown, PropertyVerification } from './types';

const CURRENT_YEAR = new Date().getFullYear();
const APPRECIATION_RATE = 0.06;
const LTV_RATIO = 0.80;

const TARGET_NEIGHBORHOODS = ['ashburn', 'aldie', 'brambleton', 'south riding'];

export function isTargetNeighborhood(neighborhood: string): boolean {
  const lower = neighborhood.toLowerCase();
  return TARGET_NEIGHBORHOODS.some((t) => lower.includes(t));
}

export function calculateScore(
  equity: number,
  arm5ResetYear: number,
  isTarget: boolean
): ScoreBreakdown {
  let equity_points = 0;
  if (equity > 300000) equity_points = 50;
  else if (equity >= 200000) equity_points = 30;
  else if (equity >= 100000) equity_points = 15;

  let arm_reset_points = 0;
  if (arm5ResetYear === CURRENT_YEAR) arm_reset_points = 40;
  else if (arm5ResetYear === CURRENT_YEAR + 1) arm_reset_points = 20;
  else if (arm5ResetYear >= CURRENT_YEAR + 2 && arm5ResetYear <= CURRENT_YEAR + 3)
    arm_reset_points = 10;

  const neighborhood_points = isTarget ? 10 : 0;

  return {
    equity_points,
    arm_reset_points,
    neighborhood_points,
    total: Math.min(100, equity_points + arm_reset_points + neighborhood_points),
  };
}

export function processLead(raw: RawLead): Lead {
  const saleYear = new Date(raw.sale_date).getFullYear();
  const yearsSincePurchase = CURRENT_YEAR - saleYear;

  const arm5ResetYear = saleYear + 5;
  const arm7ResetYear = saleYear + 7;

  const estimatedValue = raw.sale_price * Math.pow(1 + APPRECIATION_RATE, yearsSincePurchase);
  const mortgageBalance = raw.sale_price * LTV_RATIO;
  const equity = estimatedValue - mortgageBalance;

  const isTarget = isTargetNeighborhood(raw.neighborhood);
  const scoreBreakdown = calculateScore(equity, arm5ResetYear, isTarget);
  const score = scoreBreakdown.total;

  let scoreTier: 'high' | 'warm' | 'monitor' = 'monitor';
  if (score >= 80) scoreTier = 'high';
  else if (score >= 50) scoreTier = 'warm';

  return {
    ...raw,
    id: raw.address,
    sale_year: saleYear,
    arm5_reset_year: arm5ResetYear,
    arm7_reset_year: arm7ResetYear,
    estimated_value: Math.round(estimatedValue),
    mortgage_balance: Math.round(mortgageBalance),
    equity: Math.round(equity),
    tax_assessed_value: raw.tax_assessed_value || 0,
    score,
    score_tier: scoreTier,
    score_breakdown: scoreBreakdown,
    is_target_neighborhood: isTarget,
  };
}

export function rescoreAfterVerification(lead: Lead, verification: PropertyVerification): Lead {
  // If the mortgage is actually ARM, keep existing score — our assumption was right
  if (verification.adjustableRate) {
    return lead;
  }

  // Fixed Rate: zero out ARM reset points since there's no ARM reset coming
  const newBreakdown: ScoreBreakdown = {
    equity_points: lead.score_breakdown.equity_points,
    arm_reset_points: 0,
    neighborhood_points: lead.score_breakdown.neighborhood_points,
    total: Math.min(100, lead.score_breakdown.equity_points + lead.score_breakdown.neighborhood_points),
  };

  const newScore = newBreakdown.total;
  let newTier: 'high' | 'warm' | 'monitor' = 'monitor';
  if (newScore >= 80) newTier = 'high';
  else if (newScore >= 50) newTier = 'warm';

  return {
    ...lead,
    score: newScore,
    score_tier: newTier,
    score_breakdown: newBreakdown,
  };
}
