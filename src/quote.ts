// Quote layer for the Claim Comparison tool.
// Premium engine + helpers used by the "About you" profile form and quote badges.
// IMPORTANT (per product decision): premium is computed from the PERSON only
// (age / gender / smoking). It is intentionally NOT linked to the deductible —
// deductible stays a claim-side lever in this tool.

import type { Profile } from './types';

// Reference "today" for birth-year ↔ age conversion.
export const CURRENT_YEAR = 2026;
export const AGE_MIN = 18;
export const AGE_MAX = 75;

// Indicative base monthly premium per plan @ reference profile (age 30–39, male, non-smoker).
export const PLAN_BASE_MONTHLY: Record<string, number> = {
  'std':         110,
  'flexi-basic': 180,
  'flexi-sup':   320,
  'pink-std':    240,
  'pink-semi':   430,
  'pink-priv':   720,
};

function ageMult(age: number): number {
  if (age < 30) return 0.7;
  if (age < 40) return 1.0;
  if (age < 50) return 1.5;
  if (age < 60) return 2.4;
  if (age < 70) return 3.8;
  return 5.5;
}
function genderMult(g: Profile['gender']): number {
  return g === 'female' ? 1.08 : 1.0;
}
function smokerMult(s: boolean): number {
  return s ? 1.25 : 1.0;
}

// Returns indicative monthly premium in HK$ (rounded), or null if plan unknown.
export function monthlyPremium(planId: string, profile: Profile | null | undefined): number | null {
  const base = PLAN_BASE_MONTHLY[planId];
  if (base == null || !profile) return null;
  const raw = base * ageMult(profile.age) * genderMult(profile.gender) * smokerMult(profile.smoker);
  return Math.round(raw);
}

export const fmtMonthly = (n: number | null): string =>
  n == null ? '—' : 'HK$' + n.toLocaleString('en-US') + '/mo';

export const ageBandLabel = (age: number): string => {
  if (age < 30) return '18–29';
  if (age < 40) return '30–39';
  if (age < 50) return '40–49';
  if (age < 60) return '50–59';
  if (age < 70) return '60–69';
  return '70+';
};

// One-line human summary of the profile (used in collapsed context chips).
export function profileSummary(profile: Profile): string {
  const g = profile.gender === 'female' ? 'Female' : 'Male';
  return `${profile.age} · ${g} · ${profile.smoker ? 'Smoker' : 'Non-smoker'}`;
}
