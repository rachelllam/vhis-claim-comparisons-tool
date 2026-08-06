// Right panel — WhatsApp message composer, adapts to "By case" / "By plan".
import { useState, useMemo, useEffect } from 'react';
import type { CSSProperties } from 'react';
import { SURGERY_TIERS, VHIS_PLANS, computeBreakdown, fmtHK, fmtHKShort, tierIndex } from '../data';
import type { SurgeryCase, VhisPlan } from '../data';
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

const genderLabelMsg = (gender: string, t: T) =>
  gender === 'male' ? t('common.male') : gender === 'female' ? t('common.female') : t('common.any');
const ageLabelMsg = (age: string, t: T) => (age === 'all' ? t('common.anyAge') : age);
const capLabelMsg = (plan: VhisPlan, t: T) =>
  plan.perSurgery >= 999999 ? t('common.noCap') : t('msg.perSurgeryCapTpl').replace('{amount}', fmtHKShort(plan.perSurgery));

// ── By case: one surgery, many plans ──
function buildByCase({ caseItem, plans, lang, t }: { caseItem: SurgeryCase | null; plans: SelectedPlan[]; lang: Lang; t: T }): string {
  if (!caseItem) return '';
  const activePlans = plans.filter(Boolean);
  const lines: string[] = [];
  lines.push(t('msg.greetingCase'));
  lines.push('');
  const tier = SURGERY_TIERS.find((x) => x.id === caseItem.tier);
  const tierName = tier ? pick(tier, lang) : '';
  lines.push(`${t('msg.procedure')}${tierName} — ${pickCaseName(caseItem, lang)}`);
  lines.push(`${t('msg.estTotal')}${fmtHK(caseItem.cost)}`);
  lines.push(`${t('msg.refProfile')}${genderLabelMsg(caseItem.gender, t)} · ${ageLabelMsg(caseItem.age, t)}`);
  lines.push('');
  if (activePlans.length > 0) {
    lines.push(t('msg.comparison'));
    activePlans.forEach((p) => {
      const planDef = VHIS_PLANS.find((v) => v.id === p.id)!;
      const br = computeBreakdown({ totalCost: caseItem.cost, gm: { enabled: false }, plan: planDef, deductible: p.deductible });
      lines.push(`  • ${pick(planDef, lang)}`);
      lines.push(`    ${t('msg.deductible')}${p.deductible === 0 ? t('common.none') : fmtHK(p.deductible)}`);
      lines.push(`    ${t('msg.vhisPays')}${fmtHK(br.vhis)}`);
      lines.push(`    ${t('msg.youPay')}${fmtHK(br.customerPays)}${br.customerPays === 0 ? t('msg.fullyCovered') : ''}`);
    });
    lines.push('');
  }
  lines.push(t('msg.closing'));
  return lines.join('\n');
}

// ── By plan: one plan, many surgeries ──
function buildByPlan({ focus, focusDef, cases, lang, t }: { focus: SelectedPlan | undefined; focusDef: VhisPlan | null; cases: SurgeryCase[]; lang: Lang; t: T }): string {
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
    cases.forEach((c) => {
      const tier = SURGERY_TIERS.find((x) => x.id === c.tier);
      const tierName = tier ? pick(tier, lang) : '';
      const br = computeBreakdown({ totalCost: c.cost, gm: { enabled: false }, plan: focusDef, deductible: focus.deductible });
      lines.push(`  • ${tierName} — ${pickCaseName(c, lang)} (${fmtHK(c.cost)})`);
      lines.push(`    ${t('msg.vhisPays')}${fmtHK(br.vhis)}`);
      lines.push(`    ${t('msg.youPay')}${fmtHK(br.customerPays)}${br.customerPays === 0 ? t('msg.fullyCovered') : ''}`);
    });
    lines.push('');
  }
  lines.push(t('msg.closing'));
  return lines.join('\n');
}

export function MessagePanel({ plans, cv, onCollapse }: { plans: SelectedPlan[]; cv: CoverageView; onCollapse?: () => void }) {
  const { cases: allCases } = useOperationData();
  const { lang, t } = useLang();
  const mode = cv ? cv.mode : 'case';

  const msg = useMemo(() => {
    const activePlans = plans.filter(Boolean);
    if (mode === 'plan') {
      const focus = activePlans.find((p) => p.id === cv.focusPlanId && p.deductible === cv.focusPlanDeductible) || activePlans[0];
      const focusDef = focus ? VHIS_PLANS.find((v) => v.id === focus.id) || null : null;
      const cases = allCases.filter((c) => cv.selectedCaseIds.includes(c.id))
        .slice()
        .sort((a, b) => tierIndex(a.tier) - tierIndex(b.tier) || a.cost - b.cost);
      return buildByPlan({ focus, focusDef, cases, lang, t });
    }
    const chosen = allCases.filter((c) => cv.selectedCaseIds.includes(c.id))
      .slice()
      .sort((a, b) => tierIndex(a.tier) - tierIndex(b.tier) || a.cost - b.cost);
    const focusCase = chosen.find((c) => c.id === cv.focusCaseId) || chosen[0] || null;
    return buildByCase({ caseItem: focusCase, plans, lang, t });
  }, [allCases, mode, plans, cv && cv.focusPlanId, cv && cv.focusPlanDeductible, cv && cv.focusCaseId, cv && cv.selectedCaseIds, lang, t]);

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
