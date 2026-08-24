// Right panel — WhatsApp message composer, adapts to "By case" / "By plan".
import { useState, useMemo, useEffect } from 'react';
import type { CSSProperties } from 'react';
import { SURGERY_TIERS, VHIS_PLANS, fmtHK, fmtHKShort, tierIndex } from '../data';
import type { SurgeryCase, VhisPlan } from '../data';
import { computeSurgeryPayout } from '../benefitSchedule';
import { useBenefitSchedules, scheduleKey } from '../useBenefitSchedule';
import type { BenefitScheduleState } from '../useBenefitSchedule';
import { useOperationData } from '../useOperationData';
import { useLang, pick, pickCaseName, wardLabel } from '../i18n';
import type { Lang, StringKey } from '../i18n';
import type { SelectedPlan, CoverageView } from '../types';

type T = (key: StringKey) => string;

const ccMsgStylesV2 = {
  textarea: {
    width: '100%', minHeight: 460, padding: 14,
    background: 'var(--bt-pebble)', border: '1px solid var(--bt-stone)',
    borderRadius: 'var(--bt-radius-m)', font: '400 13px/1.7 var(--bt-font)',
    color: 'var(--bt-ink)', outline: 'none', resize: 'vertical',
    boxSizing: 'border-box', fontFamily: 'var(--bt-font-zh)',
  } as CSSProperties,
  footerRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, gap: 8 } as CSSProperties,
  charCount: { font: '500 11px/1 var(--bt-font)', color: 'var(--bt-graphite)' } as CSSProperties,
  primaryBtn: {
    background: 'var(--bt-bowtie-pink)', border: 0, borderRadius: 'var(--bt-radius-pill)',
    padding: '10px 20px', font: '700 13px/1 var(--bt-font)', color: 'var(--bt-white)',
    cursor: 'pointer', transition: 'background var(--bt-duration-fast) var(--bt-ease)', whiteSpace: 'nowrap',
  } as CSSProperties,
};

const capLabelMsg = (plan: VhisPlan, t: T) =>
  plan.perSurgery >= 999999 ? t('common.noCap') : t('msg.perSurgeryCapTpl').replace('{amount}', fmtHKShort(plan.perSurgery));

// One "vhisPays"/"youPay" pair — real numbers once the schedule resolves, an
// inline placeholder line while it's loading or if it failed.
function payoutLines(
  state: BenefitScheduleState | undefined,
  tier: SurgeryCase['tier'],
  cost: number,
  t: T,
): string[] {
  if (state?.schedule) {
    const payout = computeSurgeryPayout(state.schedule, tier, cost);
    return [
      `    ${t('msg.vhisPays')}${fmtHK(payout.covered)}`,
      `    ${t('msg.youPay')}${fmtHK(payout.customerPays)}${payout.customerPays === 0 ? t('msg.fullyCovered') : ''}`,
    ];
  }
  return [`    ${state?.error ? t('msg.unavailable') : t('msg.calculating')}`];
}

// One plan's block body for "By case" — shows the working, not just the total:
// the base surgical caps, the SMM top-up, then the total with its share of the
// bill. Flexi Premium ("Pink") has no per-fee split to show (one combined
// deductible + percentage rule), so it gets the last two lines only.
function planBlockLines(
  state: BenefitScheduleState | undefined,
  tier: SurgeryCase['tier'],
  cost: number,
  t: T,
): string[] {
  if (!state?.schedule) return [state?.error ? t('msg.unavailable') : t('msg.calculating')];
  const payout = computeSurgeryPayout(state.schedule, tier, cost);
  const lines: string[] = [];
  if (payout.fees.itemized) {
    const { surgeon, anaesthetist, theatre } = payout.fees;
    // Label on its own line — too long to sit beside the amount on a phone.
    lines.push(t('msg.baseBenefit'));
    lines.push(fmtHK(surgeon + anaesthetist + theatre));
    // Standard carries no SMM rider; an "SMM: HK$0" line would only confuse.
    if (payout.smm > 0) lines.push(`${t('msg.smmBenefit')}${fmtHK(payout.smm)}`);
  }
  const pct = cost > 0 ? ((payout.covered / cost) * 100).toFixed(1) : '0.0';
  // A Pink plan whose deductible swallowed the whole bill pays nothing — say why.
  const reason = payout.covered === 0 && payout.deductible > 0 ? t('msg.belowDeductible') : '';
  lines.push(
    t('msg.totalPaidTpl').replace('{amount}', fmtHK(payout.covered)).replace('{note}', `${pct}%${reason}`),
  );
  lines.push(`${t('msg.oopAmount')}${fmtHK(payout.customerPays)}`);
  return lines;
}

// 【…】 in zh, […] in en — the bracket style belongs to the language, not here.
const blockHeading = (label: string, t: T) => t('msg.blockTpl').replace('{label}', label);

// ── By case: one surgery, many plans ──
function buildByCase({
  caseItem,
  plans,
  scheduleMap,
  lang,
  t,
}: {
  caseItem: SurgeryCase | null;
  plans: SelectedPlan[];
  scheduleMap: Map<string, BenefitScheduleState>;
  lang: Lang;
  t: T;
}): string {
  if (!caseItem) return '';
  const activePlans = plans.filter(Boolean);
  const lines: string[] = [];
  lines.push(t('msg.headerCompare'));
  lines.push('');
  const tier = SURGERY_TIERS.find((x) => x.id === caseItem.tier);
  lines.push(blockHeading(t('msg.exampleLabel'), t));
  lines.push(`${t('msg.procedure')}${pickCaseName(caseItem, lang)}`);
  // `short` ("小型"), not `zh` ("小手術") — the template appends 手術 / "surgery".
  if (tier) lines.push(`${t('msg.surgeryType')}${t('msg.tierSurgeryTpl').replace('{tier}', pick(tier.short, lang))}`);
  lines.push(`${t('msg.surgeryCostEst')}${fmtHK(caseItem.cost)}`);
  if (activePlans.length > 0) {
    activePlans.forEach((p) => {
      const planDef = VHIS_PLANS.find((v) => v.id === p.id)!;
      const state = scheduleMap.get(scheduleKey(p.id, p.deductible));
      // Only plans that actually offer a deductible choice name it in the
      // header; the ones fixed at HK$0 would just add noise.
      const suffix =
        planDef.deductibles.length > 1
          ? t('msg.deductibleSuffixTpl').replace('{amount}', fmtHK(p.deductible))
          : '';
      lines.push('');
      lines.push(blockHeading(`${pick(planDef, lang)}${suffix}`, t));
      lines.push(...planBlockLines(state, caseItem.tier, caseItem.cost, t));
    });
    lines.push('');
    lines.push(t('msg.estimateDisclaimer'));
  }
  lines.push('');
  lines.push(t('msg.closing'));
  return lines.join('\n');
}

// ── By plan: one plan, many surgeries ──
function buildByPlan({
  focus,
  focusDef,
  cases,
  scheduleMap,
  lang,
  t,
}: {
  focus: SelectedPlan | undefined;
  focusDef: VhisPlan | null;
  cases: SurgeryCase[];
  scheduleMap: Map<string, BenefitScheduleState>;
  lang: Lang;
  t: T;
}): string {
  if (!focusDef || !focus) return '';
  const planName = pick(focusDef, lang);
  const lines: string[] = [];
  lines.push(t('msg.greetingPlanTpl').replace('{plan}', planName));
  lines.push('');
  lines.push(`${t('msg.plan')}${planName}`);
  lines.push(`${t('msg.deductible')}${focus.deductible === 0 ? t('common.none') : fmtHK(focus.deductible)}`);
  lines.push(`${t('msg.perSurgeryLimit')}${capLabelMsg(focusDef, t)}`);
  lines.push(`${t('msg.ward')}${wardLabel(focusDef.ward, t)}`);
  lines.push('');
  if (cases.length > 0) {
    lines.push(t('msg.coverageBySurgery'));
    const state = scheduleMap.get(scheduleKey(focus.id, focus.deductible));
    cases.forEach((c) => {
      const tier = SURGERY_TIERS.find((x) => x.id === c.tier);
      const tierName = tier ? pick(tier, lang) : '';
      lines.push(`  • ${tierName} — ${pickCaseName(c, lang)} (${fmtHK(c.cost)})`);
      lines.push(...payoutLines(state, c.tier, c.cost, t));
    });
    lines.push('');
    lines.push(t('msg.estimateDisclaimer'));
    lines.push('');
  }
  lines.push(t('msg.closing'));
  return lines.join('\n');
}

export function MessagePanel({ plans, cv, onCollapse }: { plans: SelectedPlan[]; cv: CoverageView; onCollapse?: () => void }) {
  const { cases: allCases } = useOperationData();
  const { lang, t } = useLang();
  const mode = cv ? cv.mode : 'case';
  const scheduleMap = useBenefitSchedules(plans);

  const msg = useMemo(() => {
    const activePlans = plans.filter(Boolean);
    if (mode === 'plan') {
      const focus = activePlans.find((p) => p.id === cv.focusPlanId && p.deductible === cv.focusPlanDeductible) || activePlans[0];
      const focusDef = focus ? VHIS_PLANS.find((v) => v.id === focus.id) || null : null;
      const cases = allCases.filter((c) => cv.selectedCaseIds.includes(c.id))
        .slice()
        .sort((a, b) => tierIndex(a.tier) - tierIndex(b.tier) || a.cost - b.cost);
      return buildByPlan({ focus, focusDef, cases, scheduleMap, lang, t });
    }
    const chosen = allCases.filter((c) => cv.selectedCaseIds.includes(c.id))
      .slice()
      .sort((a, b) => tierIndex(a.tier) - tierIndex(b.tier) || a.cost - b.cost);
    const focusCase = chosen.find((c) => c.id === cv.focusCaseId) || chosen[0] || null;
    return buildByCase({ caseItem: focusCase, plans, scheduleMap, lang, t });
  }, [allCases, mode, plans, scheduleMap, cv && cv.focusPlanId, cv && cv.focusPlanDeductible, cv && cv.focusCaseId, cv && cv.selectedCaseIds, lang, t]);

  const [draft, setDraft] = useState(msg);
  const [dirty, setDirty] = useState(false);
  const [copied, setCopied] = useState(false);

  // When the generated message changes (and the user hasn't hand-edited), refresh.
  useEffect(() => {
    if (!dirty) setDraft(msg);
  }, [msg, dirty]);
  // Switching lens or language always regenerates, even if previously edited.
  useEffect(() => {
    setDraft(msg);
    setDirty(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, lang]);

  const onEdit = (val: string) => {
    setDraft(val);
    setDirty(true);
  };
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(draft);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  const sub = mode === 'plan' ? t('msg.subByPlan') : t('msg.subByCase');

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <h2 className="cc-panel-h1">{t('msg.title')}</h2>
          <p className="cc-panel-sub">{sub}</p>
        </div>
        {onCollapse && (
          <button className="cc-icon-btn" title={t('msg.collapse')} onClick={onCollapse} style={{ flexShrink: 0 }}>
            <svg viewBox="0 0 24 24">
              <path d="M9 6l6 6-6 6"></path>
            </svg>
          </button>
        )}
      </div>

      <textarea
        style={ccMsgStylesV2.textarea}
        value={draft}
        onChange={(e) => onEdit(e.target.value)}
        placeholder={t('msg.placeholder')}
      />

      <div style={ccMsgStylesV2.footerRow}>
        <span style={ccMsgStylesV2.charCount}>
          {draft.length} {t('msg.chars')} {dirty && <span style={{ color: 'var(--bt-yellow-submarine)' }}>{t('msg.edited')}</span>}
        </span>
        <button
          style={{ ...ccMsgStylesV2.primaryBtn, background: copied ? 'var(--bt-green-day)' : 'var(--bt-bowtie-pink)' }}
          onClick={onCopy}
        >
          {copied ? t('msg.copied') : t('msg.copy')}
        </button>
      </div>
    </div>
  );
}
