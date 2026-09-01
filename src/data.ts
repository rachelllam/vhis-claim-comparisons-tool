// Data layer for the Claim Comparison tool.
// All amounts in HK$.
//
// Operation/surgery data (cases + treatment details) is fetched at RUNTIME from
// the central Bowtie Drop endpoint and transformed into the app's view model —
// it is intentionally NOT hardcoded here (confidential data must not enter the
// repo or the shared single-file build). Presentation config (tiers, VHIS plans,
// colours) and the pure coverage-math helpers stay local; they are not operation
// data.

import type { SelectedPlan } from './types';

export type Gender = 'all' | 'male' | 'female';
export type AgeBucket = 'all' | '40-59' | '60+';
export type TierId = 'minor' | 'intermediate' | 'major' | 'complex';
export type Ward = 'standard' | 'semi-private' | 'private';

export interface SurgeryTier {
  id: TierId;
  zh: string;
  en: string;
  short: Bi; // compact label for tight UI (badges)
  rangeMin: number;
  rangeMax: number;
  rangeLabel: string;
  accent: string;
}

export interface SurgeryCase {
  id: string;       // stable identity — the endpoint operation id, stringified
  tier: TierId;
  zh: string;
  en: string;       // English name; 'N/A' when the source provides none
  simple: string;   // English short name; 'N/A' when absent
  simpleZh: string; // Chinese short name
  gender: Gender;
  age: AgeBucket;
  cost: number;
  days: number;
}

// Bilingual text pair. Either side may hold the 'N/A' placeholder when the
// endpoint provides no copy in that language — consumers resolve via pick().
export interface Bi {
  en: string;
  zh: string;
}

export interface HospitalRef {
  name: Bi;
  official: Bi;
  setting: string;   // lengthOfStay — free text, single-language
  priceRange: string; // range string, single-language
  inRider: boolean;
  updated: string;   // date, single-language
}

export interface TreatmentDetail {
  official: Bi;
  demographics: Bi;
  purpose: Bi;
  introduction: Bi;
  opTime: Bi;
  hospitals: HospitalRef[];
}

export interface VhisPlan {
  id: string;
  zh: string;
  en: string;
  ward: Ward;
  annual: number;
  perSurgery: number;
  deductibles: number[];
  color: string;
}

export const SURGERY_TIERS: SurgeryTier[] = [
  { id: 'minor',        zh: '小型手術', en: 'Minor',        short: { zh: '小型', en: 'Minor' },        rangeMin: 15000,  rangeMax: 25000,  rangeLabel: 'HK$15K–25K',    accent: 'var(--bt-green-day)' },
  { id: 'intermediate', zh: '中型手術', en: 'Intermediate', short: { zh: '中型', en: 'Intermediate' }, rangeMin: 40000,  rangeMax: 70000,  rangeLabel: 'HK$40K–70K',    accent: 'var(--bt-smurf)' },
  { id: 'major',        zh: '大型手術', en: 'Major',        short: { zh: '大型', en: 'Major' },        rangeMin: 100000, rangeMax: 200000, rangeLabel: 'HK$100K–200K',  accent: 'var(--bt-yellow-submarine)' },
  { id: 'complex',      zh: '複雜手術', en: 'Complex',      short: { zh: '複雜', en: 'Complex' },       rangeMin: 250000, rangeMax: 500000, rangeLabel: 'HK$250K–500K+', accent: 'var(--bt-hotel-california)' },
];

// ── Remote operation data (fetched from the endpoint) ─────────────────────────

// Raw record shape as served by the endpoint (subset of fields the app uses,
// plus the ones needed to map). Fields with a `*En` suffix may be empty.
export interface OperationRecord {
  id: number;
  operationZh: string;
  operationEn: string;
  shortNameZh: string;
  shortNameEn: string;
  operationCategory: string; // 'inpatient' | 'minor' | 'intermediate' | 'major' | 'complex' | ''
  operationPurposeZh: string;
  operationPurposeEn: string;
  operationDetailsZh: string;
  operationDetailsEn: string;
  usualLengthOfStay: string;
  estimatedOperationTimeRemarkZh: string;
  estimatedOperationTimeRemarkEn: string;
  demographicInfo: {
    ageGroup: string[];
    gender: string[];
    contextZh: string;
    contextEn: string;
  };
  relatedHealthCondition: { id: string; nameZh: string; nameEn: string }[];
  estimatedMedicalExpense: number | null;
  publicHospitalChargeRemarkZh: string;
  publicHospitalChargeRemarkEn: string;
  privateHospitalChargeRemarkZh: string;
  privateHospitalChargeRemarkEn: string;
  privateHospitalOperationChargeDetails: {
    operationId: number;
    hospital: { nameZh: string; nameEn: string };
    operationZh: string;
    operationEn: string;
    isRiderHospital: boolean;
    isIncludedInDesignatedHospitalList: boolean;
    lengthOfStay: string;
    medicalExpenseRange: string;
    lastUpdated: string;
    referenceUrl: string;
  }[];
}

export interface OperationData {
  cases: SurgeryCase[];
  treatmentDetails: Record<string, TreatmentDetail>;
}

// The Drop origin is behind Cloudflare Access, which a cross-origin fetch from
// localhost cannot satisfy — in dev we go through Vite's server-side proxy
// instead (see vite.config.ts). Deployed we're same-origin with Drop.
export const OPERATIONS_URL =
  import.meta.env.VITE_OPERATIONS_URL ??
  (import.meta.env.DEV
    ? '/drop-data'
    : 'https://rachellam.drop.ai.bowtie.hk/common-operation-data/operations.json');

// The dev proxy turns an Access login redirect into a 511 (vite.config.ts).
export const ACCESS_HINT =
  'Cloudflare Access rejected the request. Set CF_ACCESS_COOKIE (or CF_ACCESS_CLIENT_ID/SECRET) in .env.local and restart the dev server — see vite.config.ts.';

// English/text field → itself, or 'N/A' when empty/missing.
const na = (s: string | null | undefined): string => (s && s.trim() ? s : 'N/A');

// Bilingual text pair from the endpoint's paired `*En` / `*Zh` fields.
const bi = (enVal: string | null | undefined, zhVal: string | null | undefined): Bi => ({
  en: na(enVal),
  zh: na(zhVal),
});

const TIER_IDS: string[] = ['minor', 'intermediate', 'major', 'complex'];
// operationCategory → tier; null for 'inpatient' / '' → those records are dropped.
function toTier(cat: string): TierId | null {
  return TIER_IDS.includes(cat) ? (cat as TierId) : null;
}

function toGender(g: string[] | undefined): Gender {
  const arr = (g ?? []).map((x) => x.toLowerCase());
  const male = arr.includes('male');
  const female = arr.includes('female');
  if (male && !female) return 'male';
  if (female && !male) return 'female';
  return 'all';
}

// Endpoint age bands are richer than the app's three buckets — best-effort map:
// any band with a lower bound ≥ 60 → '60+'; else any band overlapping 40–59 →
// '40-59'; otherwise 'all'. Lossy by design.
function toAge(bands: string[] | undefined): AgeBucket {
  const lows = (bands ?? []).map((b) => {
    const m = b.match(/\d+/);
    return m ? parseInt(m[0], 10) : NaN;
  });
  if (lows.some((n) => !Number.isNaN(n) && n >= 60)) return '60+';
  if (lows.some((n) => !Number.isNaN(n) && n >= 40 && n < 60)) return '40-59';
  return 'all';
}

// usualLengthOfStay is free text ("Day Case", "4-6 Nights") → nights as a number.
function parseDays(los: string | undefined): number {
  if (!los) return 0;
  if (/day\s*case/i.test(los)) return 0;
  const m = los.match(/\d+/);
  return m ? parseInt(m[0], 10) : 0;
}

// Cost = the endpoint estimate, or the tier midpoint when the estimate is null.
function costFor(op: OperationRecord, tier: TierId): number {
  if (op.estimatedMedicalExpense != null) return op.estimatedMedicalExpense;
  const t = SURGERY_TIERS.find((x) => x.id === tier)!;
  return Math.round((t.rangeMin + t.rangeMax) / 2);
}

// Transform raw endpoint records → the app view model.
// Drops inpatient + uncategorised records; fills missing English copy with 'N/A'.
export function transformOperations(raw: OperationRecord[]): OperationData {
  const cases: SurgeryCase[] = [];
  const treatmentDetails: Record<string, TreatmentDetail> = {};

  for (const op of raw ?? []) {
    const tier = toTier(op.operationCategory);
    if (!tier) continue; // drops 'inpatient' + empty-category records
    const id = String(op.id);

    cases.push({
      id,
      tier,
      zh: op.operationZh,
      en: na(op.operationEn),
      simple: na(op.shortNameEn),
      simpleZh: na(op.shortNameZh),
      gender: toGender(op.demographicInfo?.gender),
      age: toAge(op.demographicInfo?.ageGroup),
      cost: costFor(op, tier),
      days: parseDays(op.usualLengthOfStay),
    });

    treatmentDetails[id] = {
      official: bi(op.operationEn, op.operationZh),
      demographics: bi(op.demographicInfo?.contextEn, op.demographicInfo?.contextZh),
      purpose: bi(op.operationPurposeEn, op.operationPurposeZh),
      introduction: bi(op.operationDetailsEn, op.operationDetailsZh),
      opTime: bi(op.estimatedOperationTimeRemarkEn, op.estimatedOperationTimeRemarkZh),
      hospitals: (op.privateHospitalOperationChargeDetails ?? []).map((h) => ({
        name: bi(h.hospital?.nameEn, h.hospital?.nameZh),
        official: bi(h.operationEn, h.operationZh),
        setting: na(h.lengthOfStay),
        priceRange: na(h.medicalExpenseRange),
        inRider: !!h.isRiderHospital,
        updated: na(h.lastUpdated),
      })),
    };
  }

  return { cases, treatmentDetails };
}

// Fetch + transform the operation data from the endpoint.
export async function fetchOperationData(signal?: AbortSignal): Promise<OperationData> {
  const res = await fetch(OPERATIONS_URL, { signal });
  if (res.status === 511) throw new Error(ACCESS_HINT);
  if (!res.ok) throw new Error(`Operations fetch failed: ${res.status} ${res.statusText}`);
  const raw = (await res.json()) as OperationRecord[];
  return transformOperations(raw);
}

export const getTreatmentDetail = (
  details: Record<string, TreatmentDetail>,
  id: string,
): TreatmentDetail | null => details[id] || null;

// All VHIS plans available (6). Each plan: annual coverage limit + per-surgery cap + ward class.
export const VHIS_PLANS: VhisPlan[] = [
  { id: 'std',          zh: '標準計劃',           en: 'VHIS Standard',                ward: 'standard',     annual: 420000,  perSurgery: 50000,   deductibles: [0],                   color: 'var(--bt-graphite)' },
  { id: 'flexi-basic',  zh: '靈活計劃（基本）',   en: 'Flexi Basic',                  ward: 'standard',     annual: 1500000, perSurgery: 200000,  deductibles: [0],                   color: 'var(--bt-smurf)' },
  { id: 'flexi-sup',    zh: '靈活計劃（升級）',   en: 'Flexi Superior',               ward: 'semi-private', annual: 8000000, perSurgery: 999999,  deductibles: [0],                   color: 'var(--bt-bowtie-blue)' },
  { id: 'pink-std',     zh: '粉紅計劃（普通房）',            en: 'Pink (Standard ward)',          ward: 'standard',     annual: 3000000, perSurgery: 400000,  deductibles: [0, 20000, 50000, 80000], color: 'var(--bt-bubble-gum)' },
  { id: 'pink-semi',    zh: '粉紅計劃（半私家）',            en: 'Pink (Semi-private)',           ward: 'semi-private', annual: 5000000, perSurgery: 600000,  deductibles: [0, 20000, 50000, 80000], color: 'var(--bt-bowtie-pink)' },
  { id: 'pink-priv',    zh: '粉紅計劃（私家）',              en: 'Pink (Private)',                ward: 'private',      annual: 10000000,perSurgery: 800000,  deductibles: [0, 20000, 50000, 80000], color: 'var(--bt-dragon-fruit)' },
];

// Coverage chart colors
export const SEG_COLORS = {
  gm:    'var(--bt-green-day)',
  ded:   'var(--bt-bowtie-blue)',
  vhis:  'var(--bt-bowtie-pink)',
  oop:   'var(--bt-rock)',
};

// Rounded down, not to nearest — coverage math (percentage splits, SMM factors)
// produces long decimals; showing e.g. HK$2,941 rather than HK$2,941.176.
export const fmtHK = (n: number): string => 'HK$' + Math.floor(n || 0).toLocaleString('en-US');
export const fmtHKShort = (n: number): string => {
  n = Math.floor(n || 0);
  if (!n) return 'HK$0';
  if (n >= 1000000) return 'HK$' + (n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1) + 'M';
  if (n >= 1000) return 'HK$' + Math.round(n / 1000) + 'K';
  return 'HK$' + n;
};

// 萬-scale money for Chinese prose — "HK$1,000萬" is how Hong Kong reads a
// HK$10M ceiling. Only for round multiples of 萬: anything else (or anything
// smaller) is clearer in full, and rounding a real payout would be misleading.
export const fmtHKWan = (n: number): string => {
  n = Math.floor(n || 0);
  if (n < 10000 || n % 10000 !== 0) return fmtHK(n);
  return 'HK$' + (n / 10000).toLocaleString('en-US') + '萬';
};

// One representative case per tier (median cost) for the "by plan" coverage curve.
export function repCasesByTier(cases: SurgeryCase[]): { tier: SurgeryTier; caseItem: SurgeryCase }[] {
  return SURGERY_TIERS.map((t) => {
    const cs = cases.filter((c) => c.tier === t.id).slice().sort((a, b) => a.cost - b.cost);
    return { tier: t, caseItem: cs[Math.floor(cs.length / 2)] || cs[0] };
  }).filter((x) => x.caseItem);
}
// Default selection for by-plan view: one representative case per tier.
export const repCaseIdsByTier = (cases: SurgeryCase[]): string[] =>
  repCasesByTier(cases).map((r) => r.caseItem.id);

export const tierIndex = (id: TierId): number => SURGERY_TIERS.findIndex((t) => t.id === id);

// Resolve a set of case ids, PRESERVING the order of `ids` — that order is the
// pick order the tab strips show, and what "Sort in order" (sortCaseIds) rewrites.
// Ids with no matching case (e.g. after the endpoint drops an operation) fall out.
export function casesFromIds(cases: SurgeryCase[], ids: string[]): SurgeryCase[] {
  const byId = new Map(cases.map((c) => [c.id, c]));
  return ids.map((id) => byId.get(id)).filter((c): c is SurgeryCase => Boolean(c));
}

/* ── "Sort in order" comparators ──────────────────────────────────
   Both put a selection back into the order its left-rail picker lists the
   options in. Unknown ids sink to the end rather than jumping to the front.

   Both step through their keys with `!==` before subtracting, and return an
   explicit 0 on a full tie: two unknowns rank Infinity, and subtracting those
   from each other would hand sort() a NaN it silently reads as 0. */

// Position of a plan id in the plan picker's declared order.
export const planIndex = (id: string): number => {
  const i = VHIS_PLANS.findIndex((p) => p.id === id);
  return i === -1 ? Infinity : i;
};

// Plan picker order, then ascending deductible — which is how the pink
// ward×deductible matrix lays its cells out (deductibles: [0, 20000, 50000, 80000]).
export const sortPlans = (plans: SelectedPlan[]): SelectedPlan[] =>
  plans.slice().sort((a, b) => {
    const pa = planIndex(a.id);
    const pb = planIndex(b.id);
    if (pa !== pb) return pa - pb;
    if (a.deductible !== b.deductible) return a.deductible - b.deductible;
    return 0;
  });

// Case picker order: surgery tier (the tier cards scope the list), then the
// position within `cases` — the operations endpoint's own order, which is the
// order the rail renders inside one tier.
export const sortCaseIds = (cases: SurgeryCase[], ids: string[]): string[] => {
  const rank = new Map(cases.map((c, i) => [c.id, [tierIndex(c.tier), i] as const]));
  const of = (id: string) => rank.get(id) || ([Infinity, Infinity] as const);
  return ids.slice().sort((a, b) => {
    const [ta, ia] = of(a);
    const [tb, ib] = of(b);
    if (ta !== tb) return ta - tb;
    if (ia !== ib) return ia - ib;
    return 0;
  });
};
