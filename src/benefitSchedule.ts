// Benefit-schedule fetch + cache — the per-VHIS-product coverage categories/items/
// limits, fetched lazily (per plan, on demand) from the Drop proxy and cached by
// product_code so repeat lookups don't re-fetch.
import { VHIS_PLANS } from './data';
import type { TierId } from './data';

// Absolute URL so this works both deployed (same-origin) and from local dev servers.
const PROXY_URL = 'https://drop.ai.bowtie.hk/proxy';

// NOTE on Content-Type: we send text/plain instead of application/json so the
// browser treats this as a "simple" CORS request and skips the OPTIONS preflight.
// Cloudflare Access in front of /proxy returns 403 on unauthenticated OPTIONS, which
// would block the request. The body is still JSON; the Worker reads it as text and
// JSON.parses it.
async function api(endpoint: string, params: Record<string, string> = {}): Promise<unknown> {
  const res = await fetch(PROXY_URL, {
    method: 'POST',
    headers: { 'content-type': 'text/plain;charset=UTF-8' },
    body: JSON.stringify({ endpoint, params }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${res.status} ${text || res.statusText}`);
  }
  return res.json();
}

export interface BenefitUnit {
  unit: string;
  description: string;
  description_zh: string;
  description_en: string;
  counting_unit: string;
  counting_unit_zh: string;
  counting_unit_en: string;
  measurement_unit: string;
  measurement_unit_zh: string;
  measurement_unit_en: string;
}

export interface BenefitLimit {
  id: number;
  unit: string;
  type: string;
  benefit_unit: BenefitUnit;
  quantity: string; // decimal string at runtime, e.g. "90000.00" — parseFloat before arithmetic
  description: string;
  description_zh: string;
  description_en: string;
  overriding_description: string | null;
  overriding_description_zh: string | null;
  overriding_description_en: string | null;
  sequence: number;
}

export interface BenefitItem {
  id: number;
  unique_code: string;
  category: number;
  name: string;
  name_zh: string;
  name_en: string;
  remark: string;
  remark_zh: string;
  remark_en: string;
  is_fully_covered: boolean;
  is_reimbursement: boolean;
  is_claimable: boolean;
  limits: BenefitLimit[];
  sequence: number;
  code: string; // stable lookup key, e.g. "surgeons-fee" — unlike unique_code (date-versioned) or name (localized)
  dependent_item: number | null; // FK to another BenefitItem.id in the same schedule
  smm_adjustment_factor: string | null; // e.g. "0.80000" (=80%); null when no SMM rider applies to this item
}

export interface BenefitCategory {
  id: number;
  category: string;
  category_zh: string;
  category_en: string;
  remark: string;
  remark_zh: string;
  remark_en: string;
  benefit_items: BenefitItem[];
  sequence: number;
}

export interface BenefitSchedule {
  id: number;
  code: string;
  product: string;
  annual_limit: number;
  smm_annual_limit: number;
  lifetime_limit: number | null;
  smm_per_disability_limit: number | null;
  effective_date: string;
  benefit_categories: BenefitCategory[];
  // Flattened duplicate of all items across categories — present on the admin
  // API (what dummy_data/*.js was captured from) but absent on the customer
  // endpoint this app actually calls; derive it from benefit_categories instead
  // of relying on it directly (see allItems() below).
  benefit_items?: BenefitItem[];
}

const FLAT_SKU: Record<string, string> = {
  std: 'vhis-standard',
  'flexi-basic': 'vhis-flexi-regular',
  'flexi-sup': 'vhis-flexi-plus',
};

// Pink plans have one SKU per deductible tier, numbered by ascending deductible.
const PINK_SKU_PREFIX: Record<string, string> = {
  'pink-std': 'vhis-flexi-premium-ward',
  'pink-semi': 'vhis-flexi-premium-semi-private',
  'pink-priv': 'vhis-flexi-premium-private',
};

export function getProductCode(planId: string, deductible: number): string {
  if (FLAT_SKU[planId]) return FLAT_SKU[planId];
  const prefix = PINK_SKU_PREFIX[planId];
  if (!prefix) throw new Error(`Unknown plan id: ${planId}`);
  const plan = VHIS_PLANS.find((p) => p.id === planId);
  const idx = plan?.deductibles.indexOf(deductible) ?? -1;
  if (idx === -1) throw new Error(`Unknown deductible ${deductible} for plan ${planId}`);
  return `${prefix}-${idx + 1}`;
}

const cache = new Map<string, Promise<BenefitSchedule>>();

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

// /customer/benefit/schedule/ is a list endpoint (product_code + latest_of_product_at
// are filters, not a path id) — confirmed via a live response that it returns a
// plain JSON array of matching schedules (typically one, given the as-of-date
// filter), not a bare schedule object. The dummy_data/*.js fixtures were captured
// from admin *detail* URLs (.../schedule/<id>), which return the bare object
// directly — a different shape from what this app actually calls.
function unwrapSchedule(raw: unknown): BenefitSchedule {
  if (Array.isArray(raw)) {
    if (raw.length === 0) throw new Error('Benefit schedule lookup returned no results');
    return raw[0] as BenefitSchedule;
  }
  return raw as BenefitSchedule;
}

export function fetchBenefitSchedule(planId: string, deductible: number): Promise<BenefitSchedule> {
  const productCode = getProductCode(planId, deductible);
  if (!cache.has(productCode)) {
    const p = api('/customer/benefit/schedule/', {
      product_code: productCode,
      latest_of_product_at: todayISO(),
    })
      .then(unwrapSchedule)
      .catch((e) => {
        cache.delete(productCode);
        throw e;
      });
    cache.set(productCode, p);
  }
  return cache.get(productCode)!;
}

// ── Surgery coverage calculation ───────────────────────────────────────────
//
// Keyed off three stable benefit-item codes. Two shapes exist in real schedules:
//  - Independent tiers: the item has its own dollar-per-{tier}-operation limits
//    (Standard's Surgeon's Fee; all three fees on Flexi Regular/Plus).
//  - Dependent percentage: the item has no tiers of its own and instead pays a
//    percentage of another item's payout via `dependent_item` (Standard's
//    Anaesthetist's/Theatre Fee, each 35% of Surgeon's Fee).
// Flexi Premium ("Pink") plans use a third, tier-less shape entirely
// (percentage-payable + deductible-per-year) handled separately below.

// Fee breakdown differs by shape: non-premium plans have a real per-fee amount
// for each of the three items; Flexi Premium has no per-item cost to split by
// (only a combined deductible+percentage rule), so it reports one combined figure.
export type SurgeryFees =
  | { itemized: true; surgeon: number; anaesthetist: number; theatre: number }
  | { itemized: false; combined: number };

export interface BenefitPayout {
  fees: SurgeryFees;
  smm: number;
  // How `smm` was derived — lets the UI show its working, e.g.
  // "(HK$X remaining after surgeon/anaesthetist/theatre × 80%)". Undefined for
  // Flexi Premium, which has no SMM concept.
  smmBreakdown?: { remaining: number; factorPct: number };
  deductible: number;
  covered: number;
  oop: number;
  customerPays: number;
}

const FEE_CODES = ['surgeons-fee', 'anaesthetists-fee', 'operating-theatre-fee'] as const;

function num(s: string): number {
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
}

// schedule.benefit_items (a flattened convenience duplicate) isn't reliably
// present across the endpoints this app talks to — fall back to flattening
// benefit_categories, which is the one structure guaranteed to carry every item.
function allItems(schedule: BenefitSchedule): BenefitItem[] {
  return schedule.benefit_items ?? (schedule.benefit_categories ?? []).flatMap((c) => c.benefit_items);
}

function findItemByCode(schedule: BenefitSchedule, code: string): BenefitItem {
  const item = allItems(schedule).find((i) => i.code === code);
  if (!item) {
    // Diagnostic dump — the endpoint's actual response shape has already
    // surprised us twice (missing benefit_items, then a pagination wrapper).
    // If this fires again, the logged object is the fastest way to see why.
    console.error('[benefitSchedule] unexpected schedule shape', schedule);
    throw new Error(`Benefit schedule ${schedule?.product} is missing item "${code}"`);
  }
  return item;
}

function findItemById(schedule: BenefitSchedule, id: number): BenefitItem {
  const item = allItems(schedule).find((i) => i.id === id);
  if (!item) throw new Error(`Benefit schedule ${schedule.product} is missing item id ${id}`);
  return item;
}

function findLimitByUnit(item: BenefitItem, unit: string): BenefitLimit {
  const limit = item.limits.find((l) => l.unit === unit);
  if (!limit) {
    console.error('[benefitSchedule] unexpected item shape', item);
    throw new Error(`Benefit item "${item?.code}" has no limit with unit "${unit}"`);
  }
  return limit;
}

function findLimitByUnitPrefix(item: BenefitItem, prefix: string): BenefitLimit {
  const limit = item.limits.find((l) => l.unit.startsWith(prefix));
  if (!limit) {
    console.error('[benefitSchedule] unexpected item shape', item);
    throw new Error(`Benefit item "${item?.code}" has no limit with unit starting "${prefix}"`);
  }
  return limit;
}

// Resolves one fee item's payout for a tier, following dependent_item chains
// (e.g. Standard's Anaesthetist's/Theatre Fee = 35% of Surgeon's Fee's own payout).
// depth guards against a cycle in unvalidated backend data — real schedules are 1 level deep.
function resolveTierPayout(schedule: BenefitSchedule, item: BenefitItem, tier: TierId, depth = 0): number {
  if (depth > 5) throw new Error(`dependent_item chain too deep starting at "${item.code}"`);
  if (item.dependent_item != null) {
    const parent = findItemById(schedule, item.dependent_item);
    const parentPayout = resolveTierPayout(schedule, parent, tier, depth + 1);
    const pctLimit = findLimitByUnitPrefix(item, 'percentage-of-');
    return parentPayout * (num(pctLimit.quantity) / 100);
  }
  return num(findLimitByUnit(item, `dollar-per-${tier}-operation`).quantity);
}

function capIfPresent(value: number, limit: number | null): number {
  return limit == null ? value : Math.min(value, limit);
}

export function computeSurgeryPayout(schedule: BenefitSchedule, tier: TierId, totalCost: number): BenefitPayout {
  const items = FEE_CODES.map((code) => findItemByCode(schedule, code));
  return schedule.product.startsWith('vhis-flexi-premium')
    ? computeFlexiPremiumPayout(schedule, items, totalCost)
    : computeTieredPayout(schedule, items, tier, totalCost);
}

// Standard / Flexi Regular / Flexi Plus — one unified path. SMM only ever
// contributes where the schedule has SMM capacity (smm_annual_limit > 0), so
// Standard (no SMM rider) naturally falls out of this without a separate branch.
function computeTieredPayout(
  schedule: BenefitSchedule,
  items: BenefitItem[],
  tier: TierId,
  totalCost: number,
): BenefitPayout {
  const [surgeon, anaesthetist, theatre] = items.map((item) => resolveTierPayout(schedule, item, tier));
  const rawFeesTotal = surgeon + anaesthetist + theatre;
  // Never let the plan "pay more than the bill" — real caps can exceed a real
  // case's cost near the bottom of a tier's range (e.g. Flexi Plus's minor caps
  // sum to $15,400 while a minor case can cost as little as $15,000).
  const feesTotal = Math.min(rawFeesTotal, totalCost);
  const scale = rawFeesTotal > 0 ? feesTotal / rawFeesTotal : 0;

  const remainingAfterFees = totalCost - feesTotal;
  const smmFactorItem = items.find((i) => i.smm_adjustment_factor != null);
  const smmFactor = smmFactorItem ? num(smmFactorItem.smm_adjustment_factor!) : 0;
  const smmUncapped = remainingAfterFees * smmFactor;
  const annualHeadroom = Math.max(0, schedule.annual_limit - feesTotal);
  const lifetimeHeadroom =
    schedule.lifetime_limit == null ? Infinity : Math.max(0, schedule.lifetime_limit - feesTotal);
  const smm = Math.min(smmUncapped, schedule.smm_annual_limit, annualHeadroom, lifetimeHeadroom);

  const covered = feesTotal + smm;
  const oop = totalCost - covered;
  return {
    fees: { itemized: true, surgeon: surgeon * scale, anaesthetist: anaesthetist * scale, theatre: theatre * scale },
    smm,
    smmBreakdown:
      smmFactor > 0 ? { remaining: remainingAfterFees, factorPct: Math.round(smmFactor * 100) } : undefined,
    deductible: 0,
    covered,
    oop,
    customerPays: oop,
  };
}

// Flexi Premium ("Pink") plans — no tiers; each of the 3 items carries its own
// percentage-payable + deductible-per-year, identical in every observed schedule
// (one policy-level rule repeated per claimable item, not 3 independent values).
// Reconciled via max(deductible)/min(percentage) rather than assumed-identical or
// summed 3x: degenerates to the shared value today, and never overstates coverage
// if a future schedule ever lets the three diverge.
//
// The HK$0-deductible tier (e.g. product code suffix "-1") omits the
// deductible-per-year limit entirely rather than including one with quantity
// "0.00" — a missing deductible limit means no deductible, not an error.
function computeFlexiPremiumPayout(schedule: BenefitSchedule, items: BenefitItem[], totalCost: number): BenefitPayout {
  const deductibles = items.map((i) => {
    const limit = i.limits.find((l) => l.unit === 'deductible-per-year');
    return limit ? num(limit.quantity) : 0;
  });
  const percentages = items.map((i) => num(findLimitByUnit(i, 'percentage-payable').quantity));
  const deductibleUsed = Math.max(...deductibles);
  const pctUsed = Math.min(100, Math.max(0, Math.min(...percentages)));

  const deductible = Math.min(totalCost, deductibleUsed);
  const feesOnlyCovered = Math.max(0, totalCost - deductibleUsed) * (pctUsed / 100);
  const covered = capIfPresent(capIfPresent(feesOnlyCovered, schedule.annual_limit), schedule.lifetime_limit);
  const oop = totalCost - deductible - covered;
  return {
    fees: { itemized: false, combined: covered },
    smm: 0,
    deductible,
    covered,
    oop,
    customerPays: deductible + oop,
  };
}
