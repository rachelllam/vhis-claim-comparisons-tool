// Right panel — WhatsApp message composer, adapts to "By case" / "By plan".
import { useState, useMemo, useEffect } from 'react';
import type { CSSProperties } from 'react';
import { SURGERY_TIERS, VHIS_PLANS, computeBreakdown, fmtHK, fmtHKShort, tierIndex } from '../data';
import type { SurgeryCase, VhisPlan, Ward } from '../data';
import { useOperationData } from '../useOperationData';
import type { SelectedPlan, CoverageView } from '../types';

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

const capLabelMsg = (plan: VhisPlan) => (plan.perSurgery >= 999999 ? 'No cap' : fmtHKShort(plan.perSurgery) + ' per surgery');
const wardLabelMsg: Record<Ward, string> = { standard: 'Standard ward', 'semi-private': 'Semi-private', private: 'Private' };

// ── By case: one surgery, many plans ──
function buildByCase({ caseItem, plans }: { caseItem: SurgeryCase | null; plans: SelectedPlan[] }): string {
  if (!caseItem) return '';
  const activePlans = plans.filter(Boolean);
  const lines: string[] = [];
  lines.push('Hi! Here’s a quick example of what your surgery could cost:');
  lines.push('');
  const tierEn = SURGERY_TIERS.find((t) => t.id === caseItem.tier)?.en;
  lines.push(`Procedure: ${tierEn} — ${caseItem.en}`);
  lines.push(`Estimated total: ${fmtHK(caseItem.cost)}`);
  const genderLabel = caseItem.gender === 'male' ? 'Male' : caseItem.gender === 'female' ? 'Female' : 'Any';
  const ageLabel = caseItem.age === 'all' ? 'Any age' : caseItem.age;
  lines.push(`Reference profile: ${genderLabel} · ${ageLabel}`);
  lines.push('');
  if (activePlans.length > 0) {
    lines.push('VHIS plan comparison:');
    activePlans.forEach((p) => {
      const planDef = VHIS_PLANS.find((v) => v.id === p.id)!;
      const br = computeBreakdown({ totalCost: caseItem.cost, gm: { enabled: false }, plan: planDef, deductible: p.deductible });
      lines.push(`  • ${planDef.en}`);
      lines.push(`    Deductible: ${p.deductible === 0 ? 'None' : fmtHK(p.deductible)}`);
      lines.push(`    VHIS pays: ${fmtHK(br.vhis)}`);
      lines.push(`    You pay: ${fmtHK(br.customerPays)}${br.customerPays === 0 ? '  — fully covered' : ''}`);
    });
    lines.push('');
  }
  lines.push('Let me know if you have any questions — happy to walk through it.');
  return lines.join('\n');
}

// ── By plan: one plan, many surgeries ──
function buildByPlan({ focus, focusDef, cases }: { focus: SelectedPlan | undefined; focusDef: VhisPlan | null; cases: SurgeryCase[] }): string {
  if (!focusDef || !focus) return '';
  const lines: string[] = [];
  lines.push(`Hi! Here’s how ${focusDef.en} would cover you across different surgeries:`);
  lines.push('');
  lines.push(`Plan: ${focusDef.en}`);
  lines.push(`Deductible: ${focus.deductible === 0 ? 'None' : fmtHK(focus.deductible)}`);
  lines.push(`Per-surgery limit: ${capLabelMsg(focusDef)}`);
  lines.push(`Ward: ${wardLabelMsg[focusDef.ward] || focusDef.ward}`);
  lines.push('');
  if (cases.length > 0) {
    lines.push('Coverage by surgery:');
    cases.forEach((c) => {
      const tierEn = SURGERY_TIERS.find((t) => t.id === c.tier)?.en;
      const br = computeBreakdown({ totalCost: c.cost, gm: { enabled: false }, plan: focusDef, deductible: focus.deductible });
      lines.push(`  • ${tierEn} — ${c.en} (${fmtHK(c.cost)})`);
      lines.push(`    VHIS pays: ${fmtHK(br.vhis)}`);
      lines.push(`    You pay: ${fmtHK(br.customerPays)}${br.customerPays === 0 ? '  — fully covered' : ''}`);
    });
    lines.push('');
  }
  lines.push('Let me know if you have any questions — happy to walk through it.');
  return lines.join('\n');
}

export function MessagePanel({ plans, cv, onCollapse }: { plans: SelectedPlan[]; cv: CoverageView; onCollapse?: () => void }) {
  const { cases: allCases } = useOperationData();
  const mode = cv ? cv.mode : 'case';

  const msg = useMemo(() => {
    const activePlans = plans.filter(Boolean);
    if (mode === 'plan') {
      const focus = activePlans.find((p) => p.id === cv.focusPlanId) || activePlans[0];
      const focusDef = focus ? VHIS_PLANS.find((v) => v.id === focus.id) || null : null;
      const cases = allCases.filter((c) => cv.selectedCaseIds.includes(c.id))
        .slice()
        .sort((a, b) => tierIndex(a.tier) - tierIndex(b.tier) || a.cost - b.cost);
      return buildByPlan({ focus, focusDef, cases });
    }
    const chosen = allCases.filter((c) => cv.selectedCaseIds.includes(c.id))
      .slice()
      .sort((a, b) => tierIndex(a.tier) - tierIndex(b.tier) || a.cost - b.cost);
    const focusCase = chosen.find((c) => c.id === cv.focusCaseId) || chosen[0] || null;
    return buildByCase({ caseItem: focusCase, plans });
  }, [allCases, mode, plans, cv && cv.focusPlanId, cv && cv.focusCaseId, cv && cv.selectedCaseIds]);

  const [draft, setDraft] = useState(msg);
  const [dirty, setDirty] = useState(false);
  const [copied, setCopied] = useState(false);

  // When the generated message changes (and the user hasn't hand-edited), refresh.
  useEffect(() => {
    if (!dirty) setDraft(msg);
  }, [msg, dirty]);
  // Switching lens always regenerates, even if previously edited.
  useEffect(() => {
    setDraft(msg);
    setDirty(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

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

  const sub = mode === 'plan' ? 'WhatsApp · one plan across surgeries' : 'WhatsApp to customer · ready to send';

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <h2 className="cc-panel-h1">Message</h2>
          <p className="cc-panel-sub">{sub}</p>
        </div>
        {onCollapse && (
          <button className="cc-icon-btn" title="Collapse" onClick={onCollapse} style={{ flexShrink: 0 }}>
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
        placeholder="Pick a case + plans to generate a message..."
      />

      <div style={ccMsgStylesV2.footerRow}>
        <span style={ccMsgStylesV2.charCount}>
          {draft.length} chars {dirty && <span style={{ color: 'var(--bt-yellow-submarine)' }}>· edited</span>}
        </span>
        <button
          style={{ ...ccMsgStylesV2.primaryBtn, background: copied ? 'var(--bt-green-day)' : 'var(--bt-bowtie-pink)' }}
          onClick={onCopy}
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
}
