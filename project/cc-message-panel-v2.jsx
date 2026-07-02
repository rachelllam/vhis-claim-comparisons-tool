// Right panel v2 — WhatsApp message composer, adapts to "By case" / "By plan".
// Exports window.CCMessagePanel (overrides original for the v2 app).
const { useState: useStateMsgV2, useMemo: useMemoMsgV2, useEffect: useEffectMsgV2 } = React;

const ccMsgStylesV2 = {
  textarea: {
    width: '100%', minHeight: 460, padding: 14,
    background: 'var(--bt-pebble)', border: '1px solid var(--bt-stone)',
    borderRadius: 'var(--bt-radius-m)', font: '400 13px/1.7 var(--bt-font)',
    color: 'var(--bt-ink)', outline: 'none', resize: 'vertical',
    boxSizing: 'border-box', fontFamily: 'var(--bt-font-zh)',
  },
  footerRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, gap: 8 },
  charCount: { font: '500 11px/1 var(--bt-font)', color: 'var(--bt-graphite)' },
  primaryBtn: {
    background: 'var(--bt-bowtie-pink)', border: 0, borderRadius: 'var(--bt-radius-pill)',
    padding: '10px 20px', font: '700 13px/1 var(--bt-font)', color: 'var(--bt-white)',
    cursor: 'pointer', transition: 'background var(--bt-duration-fast) var(--bt-ease)', whiteSpace: 'nowrap',
  },
};

const tierIdx = (id) => SURGERY_TIERS.findIndex((t) => t.id === id);
const capLabelMsg = (plan) => plan.perSurgery >= 999999 ? 'No cap' : fmtHKShort(plan.perSurgery) + ' per surgery';
const wardLabelMsg = { 'standard': 'Standard ward', 'semi-private': 'Semi-private', 'private': 'Private' };

// ── By case: one surgery, many plans (original behaviour) ──
function buildByCase({ caseItem, plans }) {
  if (!caseItem) return '';
  const activePlans = plans.filter(Boolean);
  const lines = [];
  lines.push('Hi! Here\u2019s a quick example of what your surgery could cost:');
  lines.push('');
  const tierEn = SURGERY_TIERS.find((t) => t.id === caseItem.tier)?.en;
  lines.push(`Procedure: ${tierEn} \u2014 ${caseItem.en}`);
  lines.push(`Estimated total: ${fmtHK(caseItem.cost)}`);
  const genderLabel = caseItem.gender === 'male' ? 'Male' : caseItem.gender === 'female' ? 'Female' : 'Any';
  const ageLabel = caseItem.age === 'all' ? 'Any age' : caseItem.age;
  lines.push(`Reference profile: ${genderLabel} \u00b7 ${ageLabel}`);
  lines.push('');
  if (activePlans.length > 0) {
    lines.push('VHIS plan comparison:');
    activePlans.forEach((p) => {
      const planDef = VHIS_PLANS.find((v) => v.id === p.id);
      const br = computeBreakdown({ totalCost: caseItem.cost, gm: { enabled: false }, plan: planDef, deductible: p.deductible });
      lines.push(`  \u2022 ${planDef.en}`);
      lines.push(`    Deductible: ${p.deductible === 0 ? 'None' : fmtHK(p.deductible)}`);
      lines.push(`    VHIS pays: ${fmtHK(br.vhis)}`);
      lines.push(`    You pay: ${fmtHK(br.customerPays)}${br.customerPays === 0 ? '  \u2014 fully covered' : ''}`);
    });
    lines.push('');
  }
  lines.push('Let me know if you have any questions \u2014 happy to walk through it.');
  return lines.join('\n');
}

// ── By plan: one plan, many surgeries ──
function buildByPlan({ focus, focusDef, cases }) {
  if (!focusDef) return '';
  const lines = [];
  lines.push(`Hi! Here\u2019s how ${focusDef.en} would cover you across different surgeries:`);
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
      lines.push(`  \u2022 ${tierEn} \u2014 ${c.en} (${fmtHK(c.cost)})`);
      lines.push(`    VHIS pays: ${fmtHK(br.vhis)}`);
      lines.push(`    You pay: ${fmtHK(br.customerPays)}${br.customerPays === 0 ? '  \u2014 fully covered' : ''}`);
    });
    lines.push('');
  }
  lines.push('Let me know if you have any questions \u2014 happy to walk through it.');
  return lines.join('\n');
}

function CCMessagePanel({ plans, cv, onCollapse }) {
  const mode = cv ? cv.mode : 'case';

  const msg = useMemoMsgV2(() => {
    const activePlans = plans.filter(Boolean);
    if (mode === 'plan') {
      const focus = activePlans.find((p) => p.id === cv.focusPlanId) || activePlans[0];
      const focusDef = focus ? VHIS_PLANS.find((v) => v.id === focus.id) : null;
      const cases = CASES.filter((c) => cv.selectedCaseIds.includes(c.en))
        .slice().sort((a, b) => (tierIdx(a.tier) - tierIdx(b.tier)) || (a.cost - b.cost));
      return buildByPlan({ focus, focusDef, cases });
    }
    const chosen = CASES.filter((c) => cv.selectedCaseIds.includes(c.en))
      .slice().sort((a, b) => (tierIdx(a.tier) - tierIdx(b.tier)) || (a.cost - b.cost));
    const focusCase = chosen.find((c) => c.en === cv.focusCaseId) || chosen[0] || null;
    return buildByCase({ caseItem: focusCase, plans });
  }, [mode, plans, cv && cv.focusPlanId, cv && cv.focusCaseId, cv && cv.selectedCaseIds]);

  const [draft, setDraft] = useStateMsgV2(msg);
  const [dirty, setDirty] = useStateMsgV2(false);
  const [copied, setCopied] = useStateMsgV2(false);

  // When the generated message changes (and the user hasn't hand-edited), refresh.
  useEffectMsgV2(() => { if (!dirty) setDraft(msg); }, [msg, dirty]);
  // Switching lens always regenerates, even if previously edited.
  useEffectMsgV2(() => { setDraft(msg); setDirty(false); }, [mode]);

  const onEdit = (val) => { setDraft(val); setDirty(true); };
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(draft);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {}
  };

  const sub = mode === 'plan' ? 'WhatsApp \u00b7 one plan across surgeries' : 'WhatsApp to customer \u00b7 ready to send';

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <h2 className="cc-panel-h1">Message</h2>
          <p className="cc-panel-sub">{sub}</p>
        </div>
        {onCollapse && (
          <button className="cc-icon-btn" title="Collapse" onClick={onCollapse} style={{ flexShrink: 0 }}>
            <svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" data-comment-anchor="009f319c31-path-58-36"></path></svg>
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
        <span style={ccMsgStylesV2.charCount}>{draft.length} chars {dirty && <span style={{ color: 'var(--bt-yellow-submarine)' }}>\u00b7 edited</span>}</span>
        <button style={{ ...ccMsgStylesV2.primaryBtn, background: copied ? 'var(--bt-green-day)' : 'var(--bt-bowtie-pink)' }} onClick={onCopy}>
          {copied ? '\u2713 Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
}

window.CCMessagePanel = CCMessagePanel;
