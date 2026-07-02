// Right panel — WhatsApp message composer (simplified)
const { useState: useStateMsg, useMemo: useMemoMsg, useEffect } = React;

const ccMsgStyles = {
  textarea: {
    width: '100%',
    minHeight: 460,
    padding: 14,
    background: 'var(--bt-pebble)',
    border: '1px solid var(--bt-stone)',
    borderRadius: 'var(--bt-radius-m)',
    font: '400 13px/1.7 var(--bt-font)',
    color: 'var(--bt-ink)',
    outline: 'none',
    resize: 'vertical',
    boxSizing: 'border-box',
    fontFamily: 'var(--bt-font-zh)',
  },
  footerRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, gap: 8 },
  charCount: { font: '500 11px/1 var(--bt-font)', color: 'var(--bt-graphite)' },
  primaryBtn: {
    background: 'var(--bt-bowtie-pink)',
    border: 0,
    borderRadius: 'var(--bt-radius-pill)',
    padding: '10px 20px',
    font: '700 13px/1 var(--bt-font)',
    color: 'var(--bt-white)',
    cursor: 'pointer',
    transition: 'background var(--bt-duration-fast) var(--bt-ease)',
    whiteSpace: 'nowrap',
  },
};

function buildMessage({ caseItem, plans }) {
  if (!caseItem) return '';
  const activePlans = plans.filter(Boolean);
  let lines = [];
  lines.push('Hi! Here\u2019s a quick example of what your surgery could cost:');
  lines.push('');
  const tierEn = SURGERY_TIERS.find(t => t.id === caseItem.tier)?.en;
  lines.push(`Procedure: ${tierEn} \u2014 ${caseItem.en}`);
  lines.push(`Estimated total: ${fmtHK(caseItem.cost)}`);
  const genderLabel = caseItem.gender === 'male' ? 'Male' : caseItem.gender === 'female' ? 'Female' : 'Any';
  const ageLabel = caseItem.age === 'all' ? 'Any age' : caseItem.age;
  lines.push(`Reference profile: ${genderLabel} \u00b7 ${ageLabel}`);
  lines.push('');

  if (activePlans.length > 0) {
    lines.push('VHIS plan comparison:');
    activePlans.forEach(p => {
      const planDef = VHIS_PLANS.find(v => v.id === p.id);
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

function CCMessagePanel({ caseItem, plans }) {
  const msg = useMemoMsg(() => buildMessage({ caseItem, plans }), [caseItem, plans]);
  const [draft, setDraft] = useStateMsg(msg);
  const [dirty, setDirty] = useStateMsg(false);
  const [copied, setCopied] = useStateMsg(false);

  useEffect(() => {
    if (!dirty) setDraft(msg);
  }, [msg, dirty]);

  const onEdit = (val) => { setDraft(val); setDirty(true); };
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(draft);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <div>
      <h2 className="cc-panel-h1">Message</h2>
      <p className="cc-panel-sub">WhatsApp to customer · ready to send</p>

      <textarea
        style={ccMsgStyles.textarea}
        value={draft}
        onChange={(e) => onEdit(e.target.value)}
        placeholder="Pick a case + plans to generate a message..."
      />

      <div style={ccMsgStyles.footerRow}>
        <span style={ccMsgStyles.charCount}>{draft.length} chars {dirty && <span style={{ color: 'var(--bt-yellow-submarine)' }}>· edited</span>}</span>
        <button style={{ ...ccMsgStyles.primaryBtn, background: copied ? 'var(--bt-green-day)' : 'var(--bt-bowtie-pink)' }} onClick={onCopy}>
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
}

window.CCMessagePanel = CCMessagePanel;
