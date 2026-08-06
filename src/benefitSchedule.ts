// Benefit-schedule fetch + cache — the per-VHIS-product coverage categories/items/
// limits, fetched lazily (per plan, on demand) from the Drop proxy and cached by
// product_code so repeat lookups don't re-fetch.
import { VHIS_PLANS } from './data';

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
  quantity: number | null;
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
  benefit_items: BenefitItem[]; // flattened duplicate of all items across categories
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

export function fetchBenefitSchedule(planId: string, deductible: number): Promise<BenefitSchedule> {
  const productCode = getProductCode(planId, deductible);
  if (!cache.has(productCode)) {
    const p = (
      api('/customer/benefit/schedule/', {
        product_code: productCode,
        latest_of_product_at: todayISO(),
      }) as Promise<BenefitSchedule>
    ).catch((e) => {
      cache.delete(productCode);
      throw e;
    });
    cache.set(productCode, p);
  }
  return cache.get(productCode)!;
}
