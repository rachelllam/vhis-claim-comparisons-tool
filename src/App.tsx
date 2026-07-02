// Main app v3 — "About you" profile (age / gender / smoking) drives indicative
// monthly plan quotations. The "About me" profile lives in a third left-rail tab
// beside Plan + Case (the v3 default "tabs" placement). A master "Quotes" toggle
// flips the tool between pure claim-education and quote mode. Profile is kept
// SEPARATE from the Case gender/age filters.
import { useState, useEffect } from 'react';
import type { CSSProperties } from 'react';
import { repCaseIdsByTier } from './data';
import type { TierId } from './data';
import type { Profile, SelectedPlan, CoverageMode, CoverageView, QuoteCtx, CaseFilterProps } from './types';
import { ProfileForm } from './components/ProfileForm';
import { CaseTab } from './components/CaseTab';
import { PlanTab } from './components/PlanTab';
import type { PlanTabProps } from './components/PlanTab';
import { CoverageTabsBar } from './components/CoverageTabsBar';
import { ChartPanel } from './components/ChartPanel';
import { MessagePanel } from './components/MessagePanel';

type MsgState = 'open' | 'collapsed' | 'wide';

const v3 = {
  youIntro: { font: '400 13px/1.5 var(--bt-font)', color: 'var(--bt-graphite)', margin: '0 0 18px' } as CSSProperties,
  // disabled-form veil (when quotes off)
  veil: (on: boolean): CSSProperties => ({ opacity: on ? 1 : 0.45, pointerEvents: on ? 'auto' : 'none', transition: 'opacity var(--bt-duration-fast) var(--bt-ease)' }),
};

interface AboutProps {
  profile: Profile;
  setProfile: (p: Profile) => void;
  showQuotes: boolean;
}

/* ── Expandable message sidebar ─────────────────────────────────── */
function MessageSidebar({
  state,
  setState,
  plans,
  cv,
}: {
  state: MsgState;
  setState: (s: MsgState) => void;
  plans: SelectedPlan[];
  cv: CoverageView;
}) {
  if (state === 'collapsed') {
    return (
      <div className="cc-msg-rail" onClick={() => setState('open')} title="Show message" role="button">
        <span className="cc-icon-btn" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M11 17l-5-5 5-5M18 17l-5-5 5-5"></path>
          </svg>
        </span>
        <span className="cc-msg-rail-label">Message</span>
      </div>
    );
  }
  return (
    <div style={{ position: 'relative' }}>
      <MessagePanel plans={plans} cv={cv} onCollapse={() => setState('collapsed')} />
    </div>
  );
}

/* ── "About me" tab content ────────────────────────────────────── */
function YouTabBody({ profile, setProfile, showQuotes }: AboutProps) {
  return (
    <div>
      <p style={v3.youIntro}>
        Tell us a little about yourself to see an indicative monthly premium for each plan. This stays separate from the case filters.
      </p>
      <div style={v3.veil(showQuotes)}>
        <ProfileForm profile={profile} onChange={setProfile} />
      </div>
    </div>
  );
}

/* ── Left rail with 3 tabs (About me / Plan / Case) ────────────── */
type RailTab = 'about' | 'configure' | 'case';

function LeftRail({
  configProps,
  caseProps,
  aboutProps,
}: {
  configProps: PlanTabProps;
  caseProps: CaseFilterProps;
  aboutProps: AboutProps;
}) {
  const [active, setActive] = useState<RailTab>('about');
  const caseCount = caseProps.selectedCaseIds.length;

  return (
    <div>
      <div className="cc-rtabbar" role="tablist">
        <button className={'cc-rtab' + (active === 'about' ? ' on' : '')} onClick={() => setActive('about')}>
          <span className="cc-fav cc-fav-you">
            <svg viewBox="0 0 12 12">
              <circle cx="6" cy="4" r="2"></circle>
              <path d="M2.5 10c0-2 1.6-3 3.5-3s3.5 1 3.5 3"></path>
            </svg>
          </span>
          About me
        </button>
        <button className={'cc-rtab' + (active === 'configure' ? ' on' : '')} onClick={() => setActive('configure')}>
          <span className="cc-fav cc-fav-plan">
            <svg viewBox="0 0 12 12">
              <rect x="2" y="1.5" width="8" height="9" rx="1.5"></rect>
              <path d="M4 4.5h4M4 6.5h4M4 8.5h2.5"></path>
            </svg>
          </span>
          Plan<span className="cc-rtab-count">{configProps.plans.length}</span>
        </button>
        <button className={'cc-rtab' + (active === 'case' ? ' on' : '')} onClick={() => setActive('case')}>
          <span className="cc-fav cc-fav-case">
            <svg viewBox="0 0 12 12">
              <path d="M1.5 3.5a1 1 0 0 1 1-1h2l1 1.2h3.5a1 1 0 0 1 1 1v3.8a1 1 0 0 1-1 1h-6.5a1 1 0 0 1-1-1z"></path>
            </svg>
          </span>
          Case<span className="cc-rtab-count">{caseCount}</span>
        </button>
      </div>

      {active === 'about' && <YouTabBody {...aboutProps} />}
      {active === 'configure' && <PlanTab {...configProps} hideHeader />}
      {active === 'case' && <CaseTab {...caseProps} hideHeader />}
    </div>
  );
}

/* ── Top bar ───────────────────────────────────────────────────── */
function CCTopBar({ onClearAll, showQuotes, setShowQuotes }: { onClearAll: () => void; showQuotes: boolean; setShowQuotes: (v: boolean) => void }) {
  return (
    <div className="cc-topbar">
      <div className="cc-brand">
        <span className="cc-wordmark">bowtie</span>
        <span className="cc-tool-badge">Claim Comparison</span>
      </div>
      <div className="cc-topbar-right">
        <button
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
          onClick={() => setShowQuotes(!showQuotes)}
          aria-pressed={showQuotes}
          title="Show indicative monthly premiums"
        >
          <span style={{ font: '700 13px/1 var(--bt-font)', color: showQuotes ? 'var(--bt-bowtie-pink)' : 'var(--bt-graphite)' }}>Quotes</span>
          <span className={'cc-toggle' + (showQuotes ? ' on' : '')} aria-hidden="true"></span>
        </button>
        <span style={{ width: 1, height: 18, background: 'var(--bt-stone)' }}></span>
        <button className="cc-link" onClick={onClearAll}>
          Clear all
        </button>
      </div>
    </div>
  );
}

/* ── App ────────────────────────────────────────────────────────── */
export function App() {
  // Case filters (these filter which surgeries show)
  const [tier, setTier] = useState<TierId>('complex');
  const [gender, setGender] = useState('all');
  const [age, setAge] = useState('senior');

  // About-you profile (SEPARATE from case filters; drives premiums)
  const [profile, setProfile] = useState<Profile>({ age: 42, gender: 'male', smoker: false });
  const [showQuotes, setShowQuotes] = useState(true);

  const [plans, setPlans] = useState<SelectedPlan[]>([
    { id: 'flexi-sup', deductible: 0 },
    { id: 'pink-semi', deductible: 20000 },
    { id: 'pink-priv', deductible: 0 },
  ]);

  const [selectedCaseIds, setSelectedCaseIds] = useState<string[]>(() => repCaseIdsByTier());
  const toggleCase = (en: string) =>
    setSelectedCaseIds((prev) => (prev.includes(en) ? prev.filter((x) => x !== en) : [...prev, en]));

  const [msgState, setMsgState] = useState<MsgState>('open');
  const [coverageMode, setCoverageMode] = useState<CoverageMode>('case');
  const [focusPlanId, setFocusPlanId] = useState<string | null>('flexi-sup');
  const [focusCaseId, setFocusCaseId] = useState<string | null>(selectedCaseIds[0] || null);

  useEffect(() => {
    if (!plans.find((p) => p.id === focusPlanId)) setFocusPlanId(plans[0] ? plans[0].id : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plans]);
  useEffect(() => {
    if (focusCaseId === null || !selectedCaseIds.includes(focusCaseId)) setFocusCaseId(selectedCaseIds[0] || null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCaseIds]);

  const addPlan = (id: string, deductible: number) =>
    setPlans((prev) => (prev.find((p) => p.id === id) ? prev : [...prev, { id, deductible }]));
  const removePlan = (id: string) => setPlans((prev) => prev.filter((p) => p.id !== id));
  const setPlanDeductible = (id: string, deductible: number) =>
    setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, deductible } : p)));
  const selectPinkCell = (id: string, deductible: number) => {
    setPlans((prev) => {
      const existing = prev.find((p) => p.id === id);
      if (existing) {
        if (existing.deductible === deductible) return prev.filter((p) => p.id !== id);
        return prev.map((p) => (p.id === id ? { ...p, deductible } : p));
      }
      return [...prev, { id, deductible }];
    });
  };
  const onClearAll = () => {
    setTier('minor');
    setGender('all');
    setAge('all');
    setSelectedCaseIds([]);
    setPlans([]);
  };

  const quoteCtx: QuoteCtx = { show: showQuotes, profile };
  const configProps: PlanTabProps = {
    plans,
    onAdd: addPlan,
    onRemove: removePlan,
    onSetDeductible: setPlanDeductible,
    onSelectPink: selectPinkCell,
    quoteCtx,
  };
  const caseProps: CaseFilterProps = { tier, setTier, gender, setGender, age, setAge, selectedCaseIds, onToggleCase: toggleCase };
  const aboutProps: AboutProps = { profile, setProfile, showQuotes };
  const cv: CoverageView = {
    mode: coverageMode,
    setMode: setCoverageMode,
    focusPlanId,
    setFocusPlanId,
    focusCaseId,
    setFocusCaseId,
    selectedCaseIds,
  };

  const msgCol = msgState === 'collapsed' ? 52 : msgState === 'wide' ? 560 : 380;

  return (
    <>
      <CCTopBar onClearAll={onClearAll} showQuotes={showQuotes} setShowQuotes={setShowQuotes} />
      <div className="cc-main">
        <div className="cc-area-left">
          <div className="cc-panel">
            <LeftRail configProps={configProps} caseProps={caseProps} aboutProps={aboutProps} />
          </div>
        </div>
        <div className="cc-area-combined">
          <div className="cc-combined-wrap">
            <CoverageTabsBar plans={plans} cv={cv} onRemove={removePlan} onRemoveCase={toggleCase} />
            <div className="cc-panel cc-combined" style={{ gridTemplateColumns: `1fr ${msgCol}px` }}>
              <div className="cc-combined-side">
                <ChartPanel plans={plans} onRemove={removePlan} onRemoveCase={toggleCase} cv={cv} quoteCtx={quoteCtx} />
              </div>
              <div className="cc-combined-side cc-msg-side" style={msgState === 'collapsed' ? { padding: 0 } : undefined}>
                <MessageSidebar state={msgState} setState={setMsgState} plans={plans} cv={cv} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
