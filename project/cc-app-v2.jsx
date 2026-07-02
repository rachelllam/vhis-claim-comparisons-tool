// Main app v2 — left rail space-saving exploration (Tabs vs Accordion)
const { useState: useStateApp2 } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "leftMode": "tabs",
  "showContext": true
} /*EDITMODE-END*/;

/* ── shared little bits ─────────────────────────────────────────── */
function tierLabel(tierId) {
  const t = (window.SURGERY_TIERS || []).find((x) => x.id === tierId);
  return t ? t.en : tierId;
}
function tierAccent(tierId) {
  const t = (window.SURGERY_TIERS || []).find((x) => x.id === tierId);
  return t ? t.accent : 'var(--bt-graphite)';
}

const railStyles = {
  // — Tabs —
  tabBar: { display: 'flex', gap: 4, background: 'var(--bt-pebble)', borderRadius: 'var(--bt-radius-pill)', padding: 4, marginBottom: 18 },
  tab: (on) => ({
    flex: 1, border: 0, cursor: 'pointer',
    font: `${on ? 700 : 500} 14px/1 var(--bt-font)`,
    color: on ? 'var(--bt-white)' : 'var(--bt-graphite)',
    background: on ? 'var(--bt-bowtie-pink)' : 'transparent',
    borderRadius: 'var(--bt-radius-pill)', padding: '11px 12px',
    transition: 'all var(--bt-duration-fast) var(--bt-ease)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7
  }),
  tabCount: (on) => ({
    font: '700 11px/1 var(--bt-font)',
    background: on ? 'rgba(255,255,255,0.25)' : 'var(--bt-stone)',
    color: on ? 'var(--bt-white)' : 'var(--bt-graphite)',
    borderRadius: 'var(--bt-radius-pill)', padding: '3px 7px', minWidth: 18
  }),

  // — Context chip (the inactive tab's summary, kept visible) —
  contextChip: {
    display: 'flex', alignItems: 'center', gap: 10, width: '100%',
    background: 'var(--bt-pebble)', border: '1px solid var(--bt-stone)',
    borderRadius: 'var(--bt-radius-m)', padding: '10px 12px', marginBottom: 18,
    cursor: 'pointer', textAlign: 'left',
    transition: 'all var(--bt-duration-fast) var(--bt-ease)'
  },
  chipKicker: { font: '700 10px/1 var(--bt-font)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--bt-graphite)', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  chipValue: { font: '700 13px/1.25 var(--bt-font)', color: 'var(--bt-bowtie-blue)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  chipEdit: { marginLeft: 'auto', font: '600 12px/1 var(--bt-font)', color: 'var(--bt-bowtie-pink)', whiteSpace: 'nowrap', flexShrink: 0 },

  // — Accordion —
  accSection: (open) => ({
    borderBottom: '1px solid var(--bt-stone)'
  }),
  accHeader: (open) => ({
    display: 'flex', alignItems: 'center', gap: 12, width: '100%',
    border: 0, background: 'transparent', cursor: 'pointer', textAlign: 'left',
    padding: '20px 4px', transition: 'all var(--bt-duration-fast) var(--bt-ease)'
  }),
  accNum: (open) => ({
    width: 26, height: 26, flexShrink: 0, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    font: '700 12px/1 var(--bt-font)',
    background: open ? 'var(--bt-bowtie-pink)' : 'var(--bt-stone)',
    color: open ? 'var(--bt-white)' : 'var(--bt-graphite)',
    transition: 'all var(--bt-duration-fast) var(--bt-ease)'
  }),
  accTitle: (open) => ({ font: '700 17px/1.2 var(--bt-font)', color: open ? 'var(--bt-bowtie-blue)' : 'var(--bt-ink)' }),
  accSummary: { font: '500 12px/1.3 var(--bt-font)', color: 'var(--bt-graphite)', marginTop: 2 },
  accChevron: (open) => ({
    marginLeft: 'auto', flexShrink: 0, width: 20, height: 20,
    transition: 'transform var(--bt-duration-fast) var(--bt-ease)',
    transform: open ? 'rotate(180deg)' : 'rotate(0deg)'
  }),
  accBody: { padding: '0 4px 24px' }
};

function ChevronDown(props) {
  return (
    <svg style={props.style} viewBox="0 0 20 20" fill="none" stroke="var(--bt-graphite)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 7.5 L10 12.5 L15 7.5"></path>
    </svg>);

}
function SwitchIcon() {
  return (
    <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 5.5 H11 M9 3 L11.5 5.5 L9 8 M14 10.5 H5 M7 8 L4.5 10.5 L7 13"></path>
    </svg>);

}

/* ── Context chip — summarises the section you're NOT looking at ── */
function ContextChip({ kicker, value, action, onClick }) {
  return (
    <button style={railStyles.contextChip} onClick={onClick}
    onMouseEnter={(e) => {e.currentTarget.style.borderColor = 'var(--bt-bowtie-pink)';}}
    onMouseLeave={(e) => {e.currentTarget.style.borderColor = 'var(--bt-stone)';}}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={railStyles.chipKicker}>{kicker}</div>
        <div style={railStyles.chipValue}>{value}</div>
      </div>
      <span style={railStyles.chipEdit}>{action}</span>
    </button>);

}

/* ── TABS MODE ──────────────────────────────────────────────────── */
function LeftRailTabs({ t, S, configProps, caseProps }) {
  const [active, setActive] = useStateApp2('configure');
  const caseCount = caseProps.selectedCaseIds.length;
  const caseVal = caseCount ? `${caseCount} case${caseCount === 1 ? '' : 's'} selected` : 'No cases picked';
  const planVal = `${configProps.plans.length} plan${configProps.plans.length === 1 ? '' : 's'} selected`;

  return (
    <div>
      <div style={railStyles.tabBar} role="tablist">
        <button style={railStyles.tab(active === 'configure')} onClick={() => setActive('configure')}>
          Plan
          <span style={railStyles.tabCount(active === 'configure')}>{configProps.plans.length}</span>
        </button>
        <button style={railStyles.tab(active === 'case')} onClick={() => setActive('case')}>
          Case
          <span style={railStyles.tabCount(active === 'case')}>{caseCount}</span>
        </button>
      </div>

      {t.showContext && active === 'configure' &&
      <ContextChip kicker="Comparing cases" value={caseVal} action="Change ›" onClick={() => setActive('case')} />
      }
      {t.showContext && active === 'case' &&
      <ContextChip kicker="Comparing plans" value={planVal} action="Edit ›" onClick={() => setActive('configure')} />
      }

      {active === 'configure' ?
      <CCConfigPanel {...configProps} hideHeader /> :
      <CCInputPanel {...caseProps} hideHeader />}
    </div>);

}

/* ── ACCORDION MODE ─────────────────────────────────────────────── */
function AccordionSection({ num, title, summary, open, onToggle, children }) {
  return (
    <div style={railStyles.accSection(open)}>
      <button style={railStyles.accHeader(open)} onClick={onToggle} aria-expanded={open}>
        <span style={railStyles.accNum(open)}>{num}</span>
        <div style={{ minWidth: 0 }}>
          <div style={railStyles.accTitle(open)}>{title}</div>
          {!open && <div style={railStyles.accSummary}>{summary}</div>}
        </div>
        <ChevronDown style={railStyles.accChevron(open)} />
      </button>
      {open && <div style={railStyles.accBody}>{children}</div>}
    </div>);

}

function LeftRailAccordion({ t, configProps, caseProps }) {
  const [open, setOpen] = useStateApp2('configure');
  const caseVal = caseProps.caseItem ? `${tierLabel(caseProps.caseItem.tier)} · ${caseProps.caseItem.en}` : 'No case picked';
  const planVal = `${configProps.plans.length} plan${configProps.plans.length === 1 ? '' : 's'} selected`;

  return (
    <div>
      <AccordionSection
        num="1" title="Configure" summary={planVal}
        open={open === 'configure'} onToggle={() => setOpen('configure')}>
        <CCConfigPanel {...configProps} hideHeader />
      </AccordionSection>
      <AccordionSection
        num="2" title="Case" summary={caseVal}
        open={open === 'case'} onToggle={() => setOpen('case')}>
        <CCInputPanel {...caseProps} hideHeader />
      </AccordionSection>
    </div>);

}

/* ── App ────────────────────────────────────────────────────────── */
function CCApp2() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  const [tier, setTier] = useStateApp2('complex');
  const [gender, setGender] = useStateApp2('all');
  const [age, setAge] = useStateApp2('60+');

  const [plans, setPlans] = useStateApp2([
  { id: 'flexi-sup', deductible: 0 },
  { id: 'pink-semi', deductible: 20000 },
  { id: 'pink-priv', deductible: 0 }]
  );

  // — Selected cases (multi-select, picked in the Case panel) —
  const [selectedCaseIds, setSelectedCaseIds] = useStateApp2(
    (window.repCaseIdsByTier ? window.repCaseIdsByTier() : []));
  const toggleCase = (en) => setSelectedCaseIds((prev) =>
    prev.includes(en) ? prev.filter((x) => x !== en) : [...prev, en]);

  // — Coverage view state (which axis item is on screen; shared by chart + message) —
  const [coverageMode, setCoverageMode] = useStateApp2('case'); // 'case' | 'plan'
  const [focusPlanId, setFocusPlanId] = useStateApp2('flexi-sup');
  const [focusCaseId, setFocusCaseId] = useStateApp2(selectedCaseIds[0] || null);

  // Keep focused plan / case valid as their sets change
  React.useEffect(() => {
    if (!plans.find((p) => p.id === focusPlanId)) setFocusPlanId(plans[0] ? plans[0].id : null);
  }, [plans]);
  React.useEffect(() => {
    if (!selectedCaseIds.includes(focusCaseId)) setFocusCaseId(selectedCaseIds[0] || null);
  }, [selectedCaseIds]);

  const addPlan = (id, deductible) => setPlans((prev) => prev.find((p) => p.id === id) ? prev : [...prev, { id, deductible }]);
  const removePlan = (id) => setPlans((prev) => prev.filter((p) => p.id !== id));
  const setPlanDeductible = (id, deductible) => setPlans((prev) => prev.map((p) => p.id === id ? { ...p, deductible } : p));
  const selectPinkCell = (id, deductible) => {
    setPlans((prev) => {
      const existing = prev.find((p) => p.id === id);
      if (existing) {
        if (existing.deductible === deductible) return prev.filter((p) => p.id !== id);
        return prev.map((p) => p.id === id ? { ...p, deductible } : p);
      }
      return [...prev, { id, deductible }];
    });
  };
  const onClearAll = () => {setTier('minor');setGender('all');setAge('all');setSelectedCaseIds([]);setPlans([]);};

  const configProps = { plans, onAdd: addPlan, onRemove: removePlan, onSetDeductible: setPlanDeductible, onSelectPink: selectPinkCell };
  const caseProps = { tier, setTier, gender, setGender, age, setAge, selectedCaseIds, onToggleCase: toggleCase };
  const cv = { mode: coverageMode, setMode: setCoverageMode, focusPlanId, setFocusPlanId, focusCaseId, setFocusCaseId, selectedCaseIds };

  return (
    <>
      <CCTopBar onClearAll={onClearAll} />
      <div className="cc-main">
        <div className="cc-area-left">
          <div className="cc-panel">
            <LeftRailTabs t={t} configProps={configProps} caseProps={caseProps} />
          </div>
        </div>
        <div className="cc-area-combined">
          <div className="cc-panel cc-combined">
            <div className="cc-combined-side">
              <CCChartPanel plans={plans} onRemove={removePlan} onRemoveCase={toggleCase} cv={cv} />
            </div>
            <div className="cc-combined-side">
              <CCMessagePanel plans={plans} cv={cv} />
            </div>
          </div>
        </div>
      </div>

      <TweaksPanel>
        <TweakSection label="Left rail" />
        <TweakToggle label="Keep context chip" value={t.showContext}
        onChange={(v) => setTweak('showContext', v)} />
      </TweaksPanel>
    </>);

}

function CCTopBar({ onClearAll }) {
  return (
    <div className="cc-topbar">
      <div className="cc-brand">
        <span className="cc-wordmark">bowtie</span>
        <span className="cc-tool-badge">Claim Comparison</span>
      </div>
      <div className="cc-topbar-right">
        <button className="cc-link" onClick={onClearAll}>Clear all</button>
      </div>
    </div>);

}

ReactDOM.createRoot(document.getElementById('root')).render(<CCApp2 />);