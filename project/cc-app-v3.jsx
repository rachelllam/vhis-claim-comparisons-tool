// Main app v3 — adds an "About you" profile (age / gender / smoking) and plan
// quotations (monthly). Two placement explorations, switchable via Tweak:
//   A 'bar' — a slim global "About you" strip under the top bar
//   B 'tab' — a third left-rail tab ("You") beside Plan + Case
// A master "Show quotations" toggle flips the tool between pure claim-education
// and quote mode. Profile is kept SEPARATE from the Case gender/age filters.

const { useState: useStateApp3 } = React;

const TWEAK_DEFAULTS_V3 = /*EDITMODE-BEGIN*/{
  "placement": "tabs"
} /*EDITMODE-END*/;

// — rail tab + context-chip styles (self-contained; mirrors v2) —
const railStyles = {
  tabBar: { display: 'flex', gap: 4, background: 'var(--bt-pebble)', borderRadius: 'var(--bt-radius-pill)', padding: 4, marginBottom: 18 },
  tab: (on) => ({
    flex: 1, border: 0, cursor: 'pointer',
    font: `${on ? 700 : 500} 14px/1 var(--bt-font)`,
    color: on ? 'var(--bt-white)' : 'var(--bt-graphite)',
    backgroundColor: on ? 'var(--bt-bowtie-pink)' : 'transparent',
    borderRadius: 'var(--bt-radius-pill)', padding: '11px 12px',
    transition: 'background-color var(--bt-duration-fast) var(--bt-ease), color var(--bt-duration-fast) var(--bt-ease)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7
  }),
  tabCount: (on) => ({
    font: '700 11px/1 var(--bt-font)',
    backgroundColor: on ? 'rgba(255,255,255,0.25)' : 'var(--bt-stone)',
    color: on ? 'var(--bt-white)' : 'var(--bt-graphite)',
    borderRadius: 'var(--bt-radius-pill)', padding: '3px 7px', minWidth: 18
  }),
  contextChip: {
    display: 'flex', alignItems: 'center', gap: 10, width: '100%',
    background: 'var(--bt-pebble)', border: '1px solid var(--bt-stone)',
    borderRadius: 'var(--bt-radius-m)', padding: '10px 12px', marginBottom: 18,
    cursor: 'pointer', textAlign: 'left',
    transition: 'all var(--bt-duration-fast) var(--bt-ease)'
  },
  chipKicker: { font: '700 10px/1 var(--bt-font)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--bt-graphite)', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  chipValue: { font: '700 13px/1.25 var(--bt-font)', color: 'var(--bt-bowtie-blue)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  chipEdit: { marginLeft: 'auto', font: '600 12px/1 var(--bt-font)', color: 'var(--bt-bowtie-pink)', whiteSpace: 'nowrap', flexShrink: 0 }
};

/* ── Expandable message sidebar ─────────────────────────────────── */
function MessageSidebar({ state, setState, plans, cv }) {
  if (state === 'collapsed') {
    return (
      <div className="cc-msg-rail" onClick={() => setState('open')} title="Show message" role="button">
        <span className="cc-icon-btn" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M11 17l-5-5 5-5M18 17l-5-5 5-5"></path></svg></span>
        <span className="cc-msg-rail-label">Message</span>
      </div>);
  }
  const wide = state === 'wide';
  return (
    <div style={{ position: 'relative' }}>
      <CCMessagePanel plans={plans} cv={cv} onCollapse={() => setState('collapsed')} />
    </div>);
}

function ContextChip_REMOVED() {return null;}

const v3 = {
  // — A: profile bar —
  bar: {
    display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap',
    background: 'var(--bt-white)', borderBottom: '1px solid var(--bt-stone)',
    padding: '14px 32px'
  },
  barTitle: { display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 },
  barKicker: { font: '700 11px/1 var(--bt-font)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--bt-bowtie-blue)' },
  barSpacer: { flex: 1, minWidth: 16 },

  // — master quote toggle —
  qToggle: { display: 'inline-flex', alignItems: 'center', gap: 10, flexShrink: 0, cursor: 'pointer', userSelect: 'none' },
  qToggleLabel: (on) => ({ font: '700 13px/1 var(--bt-font)', color: on ? 'var(--bt-bowtie-pink)' : 'var(--bt-graphite)' }),

  // — total premium pill —
  totalPill: {
    display: 'inline-flex', alignItems: 'baseline', gap: 8, flexShrink: 0,
    background: 'var(--bt-blush)', borderRadius: 'var(--bt-radius-pill)',
    padding: '10px 18px'
  },
  totalLabel: { font: '600 11px/1 var(--bt-font)', color: 'var(--bt-graphite)', letterSpacing: '0.04em', textTransform: 'uppercase' },
  totalVal: { font: '900 20px/1 var(--bt-font)', color: 'var(--bt-bowtie-pink)' },
  totalPer: { font: '500 12px/1 var(--bt-font)', color: 'var(--bt-rock)' },

  // — B: You tab body —
  youIntro: { font: '400 13px/1.5 var(--bt-font)', color: 'var(--bt-graphite)', margin: '0 0 18px' },
  youToggleRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
    background: 'var(--bt-pebble)', border: '1px solid var(--bt-stone)',
    borderRadius: 'var(--bt-radius-m)', padding: '12px 14px', margin: '4px 0 20px'
  },
  youToggleText: { minWidth: 0 },
  youToggleTitle: { font: '700 14px/1.3 var(--bt-font)', color: 'var(--bt-ink)' },
  youToggleSub: { font: '400 12px/1.3 var(--bt-font)', color: 'var(--bt-graphite)', marginTop: 2 },

  // disabled-form veil (when quotes off)
  veil: (on) => ({ opacity: on ? 1 : 0.45, pointerEvents: on ? 'auto' : 'none', transition: 'opacity var(--bt-duration-fast) var(--bt-ease)' }),

  // — Variant 1: About-you block pinned at top of the left panel —
  aboutBlock: { marginBottom: 18 },
  aboutHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16 },
  aboutDivider: { height: 1, background: 'var(--bt-stone)', margin: '0 -24px 18px' }
};

/* ── master quotation toggle ───────────────────────────────────── */
function QuoteToggle({ on, onChange, label = 'Show quotations' }) {
  return (
    <button style={v3.qToggle} onClick={() => onChange(!on)} aria-pressed={on}>
      <span className={'cc-toggle' + (on ? ' on' : '')} aria-hidden="true"></span>
      <span style={v3.qToggleLabel(on)}>{label}</span>
    </button>);

}

/* ── total monthly premium across selected plans ──────────────── */
function totalMonthly(plans, profile) {
  return plans.reduce((sum, p) => sum + (window.monthlyPremium(p.id, profile) || 0), 0);
}
function TotalPill({ plans, profile }) {
  const total = totalMonthly(plans, profile);
  return (
    <div style={v3.totalPill} title="Indicative — sum of the plans you've selected">
      <span style={v3.totalLabel}>Your plans</span>
      <span><span style={v3.totalVal}>HK${total.toLocaleString('en-US')}</span> <span style={v3.totalPer}>/mo</span></span>
    </div>);

}

/* ── Variant 1: "About you" block pinned to top of left panel ──── */
function AboutYouBlock({ profile, setProfile, showQuotes, setShowQuotes, plans }) {
  return (
    <div style={v3.aboutBlock}>
      <div style={v3.aboutHead}>
        <span style={v3.barKicker}>About you</span>
      </div>
      <div style={v3.veil(showQuotes)}>
        <window.ProfileForm profile={profile} onChange={setProfile} layout="stack" />
      </div>
    </div>);

}

/* ── Variant 2: "About me" tab content ─────────────────────────── */
function YouTabBody({ profile, setProfile, showQuotes, setShowQuotes, plans }) {
  return (
    <div>
      <p style={v3.youIntro}>Tell us a little about yourself to see an indicative monthly premium for each plan. This stays separate from the case filters.</p>
      <div style={v3.veil(showQuotes)}>
        <window.ProfileForm profile={profile} onChange={setProfile} layout="stack" />
      </div>
    </div>);

}

/* ── Left rail with optional 3rd tab ───────────────────────────── */
function LeftRailV3({ variant, t, configProps, caseProps, aboutProps }) {
  const showAboutTab = variant === 'tabs';
  const [active, setActive] = useStateApp3(showAboutTab ? 'about' : 'configure');
  const effActive = active === 'about' && !showAboutTab ? 'configure' : active;
  const caseCount = caseProps.selectedCaseIds.length;
  const caseVal = caseCount ? `${caseCount} case${caseCount === 1 ? '' : 's'} selected` : 'No cases picked';
  const planVal = `${configProps.plans.length} plan${configProps.plans.length === 1 ? '' : 's'} selected`;

  // Variant 1 insets the tab strip inside the panel (no browser-tab hug to the top edge).
  const tabBarStyle = variant === 'top' ? { margin: '0 0 18px', borderRadius: 'var(--bt-radius-m)' } : undefined;

  return (
    <div>
      {variant === 'top' &&
      <>
          <AboutYouBlock {...aboutProps} />
          <div style={v3.aboutDivider}></div>
        </>}

      <div className="cc-rtabbar" role="tablist" style={tabBarStyle}>
        {showAboutTab &&
        <button key="about" className={'cc-rtab' + (effActive === 'about' ? ' on' : '')} onClick={() => setActive('about')}>
            <span className="cc-fav cc-fav-you"><svg viewBox="0 0 12 12"><circle cx="6" cy="4" r="2"></circle><path d="M2.5 10c0-2 1.6-3 3.5-3s3.5 1 3.5 3"></path></svg></span>
            About me
          </button>}
        <button key="plan" className={'cc-rtab' + (effActive === 'configure' ? ' on' : '')} onClick={() => setActive('configure')}>
          <span className="cc-fav cc-fav-plan"><svg viewBox="0 0 12 12"><rect x="2" y="1.5" width="8" height="9" rx="1.5"></rect><path d="M4 4.5h4M4 6.5h4M4 8.5h2.5"></path></svg></span>
          Plan<span className="cc-rtab-count">{configProps.plans.length}</span>
        </button>
        <button key="case" className={'cc-rtab' + (effActive === 'case' ? ' on' : '')} onClick={() => setActive('case')}>
          <span className="cc-fav cc-fav-case"><svg viewBox="0 0 12 12"><path d="M1.5 3.5a1 1 0 0 1 1-1h2l1 1.2h3.5a1 1 0 0 1 1 1v3.8a1 1 0 0 1-1 1h-6.5a1 1 0 0 1-1-1z"></path></svg></span>
          Case<span className="cc-rtab-count">{caseCount}</span>
        </button>
      </div>

      {effActive === 'about' && showAboutTab && <YouTabBody {...aboutProps} />}
      {effActive === 'configure' && <CCConfigPanel {...configProps} hideHeader />}
      {effActive === 'case' && <CCInputPanel {...caseProps} hideHeader />}
    </div>);

}

/* ── App ────────────────────────────────────────────────────────── */
function CCApp3() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS_V3);

  // Case filters (UNCHANGED — these filter which surgeries show)
  const [tier, setTier] = useStateApp3('complex');
  const [gender, setGender] = useStateApp3('all');
  const [age, setAge] = useStateApp3('senior');

  // About-you profile (SEPARATE from case filters; drives premiums)
  const [profile, setProfile] = useStateApp3({ age: 42, gender: 'male', smoker: false });
  const [showQuotes, setShowQuotes] = useStateApp3(true);

  const [plans, setPlans] = useStateApp3([
  { id: 'flexi-sup', deductible: 0 },
  { id: 'pink-semi', deductible: 20000 },
  { id: 'pink-priv', deductible: 0 }]
  );

  const [selectedCaseIds, setSelectedCaseIds] = useStateApp3(
    window.repCaseIdsByTier ? window.repCaseIdsByTier() : []);
  const toggleCase = (en) => setSelectedCaseIds((prev) =>
  prev.includes(en) ? prev.filter((x) => x !== en) : [...prev, en]);

  const [msgState, setMsgState] = useStateApp3('open'); // 'open' | 'collapsed' | 'wide'
  const [coverageMode, setCoverageMode] = useStateApp3('case');
  const [focusPlanId, setFocusPlanId] = useStateApp3('flexi-sup');
  const [focusCaseId, setFocusCaseId] = useStateApp3(selectedCaseIds[0] || null);

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

  const quoteCtx = { show: showQuotes, profile };
  const configProps = { plans, onAdd: addPlan, onRemove: removePlan, onSetDeductible: setPlanDeductible, onSelectPink: selectPinkCell, quoteCtx };
  const caseProps = { tier, setTier, gender, setGender, age, setAge, selectedCaseIds, onToggleCase: toggleCase };
  const aboutProps = { profile, setProfile, showQuotes, setShowQuotes, plans };
  const cv = { mode: coverageMode, setMode: setCoverageMode, focusPlanId, setFocusPlanId, focusCaseId, setFocusCaseId, selectedCaseIds };

  return (
    <>
      <CCTopBar onClearAll={onClearAll} showQuotes={showQuotes} setShowQuotes={setShowQuotes} />
      <div className="cc-main">
        <div className="cc-area-left">
          <div className="cc-panel">
            <LeftRailV3 variant={t.placement} t={t} configProps={configProps} caseProps={caseProps}
            aboutProps={aboutProps} />
          </div>
        </div>
        <div className="cc-area-combined">
          <div className="cc-combined-wrap">
            <window.CoverageTabsBar plans={plans} cv={cv} onRemove={removePlan} onRemoveCase={toggleCase} />
            <div className="cc-panel cc-combined" style={{ gridTemplateColumns: `1fr ${msgState === 'collapsed' ? 52 : msgState === 'wide' ? 560 : 380}px` }}>
              <div className="cc-combined-side">
                <CCChartPanel plans={plans} onRemove={removePlan} onRemoveCase={toggleCase} cv={cv}
                quoteCtx={quoteCtx} />
              </div>
              <div className="cc-combined-side cc-msg-side" style={msgState === 'collapsed' ? { padding: 0 } : null}>
                <MessageSidebar state={msgState} setState={setMsgState} plans={plans} cv={cv} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <TweaksPanel>
      </TweaksPanel>
    </>);

}

function CCTopBar({ onClearAll, showQuotes, setShowQuotes }) {
  return (
    <div className="cc-topbar">
      <div className="cc-brand">
        <span className="cc-wordmark">bowtie</span>
        <span className="cc-tool-badge">Claim Comparison</span>
      </div>
      <div className="cc-topbar-right">
        <button style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
        onClick={() => setShowQuotes(!showQuotes)} aria-pressed={showQuotes} title="Show indicative monthly premiums">
          <span style={{ font: '700 13px/1 var(--bt-font)', color: showQuotes ? 'var(--bt-bowtie-pink)' : 'var(--bt-graphite)' }}>Quotes</span>
          <span className={'cc-toggle' + (showQuotes ? ' on' : '')} aria-hidden="true"></span>
        </button>
        <span style={{ width: 1, height: 18, background: 'var(--bt-stone)' }}></span>
        <button className="cc-link" onClick={onClearAll}>Clear all</button>
      </div>
    </div>);
}

ReactDOM.createRoot(document.getElementById('root')).render(<CCApp3 />);