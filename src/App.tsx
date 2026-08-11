// Main app v3 — "About you" profile (age / gender / smoking) drives indicative
// monthly plan quotations. The "About me" profile lives in a third left-rail tab
// beside Plan + Case (the v3 default "tabs" placement). A master "Quotes" toggle
// flips the tool between pure claim-education and quote mode. Profile is kept
// SEPARATE from the Case gender/age filters.
import { useState, useEffect } from 'react';
import type { CSSProperties } from 'react';
import { repCaseIdsByTier } from './data';
import type { TierId } from './data';
import { useOperationData, useOperationDataLoader, OperationDataProvider } from './useOperationData';
import { LanguageProvider, useLang } from './i18n';
import type { Profile, SelectedPlan, CoverageMode, CoverageView, QuoteCtx, CaseFilterProps } from './types';
import { ProfileForm } from './components/ProfileForm';
import { CaseTab } from './components/CaseTab';
import { PlanTab } from './components/PlanTab';
import type { PlanTabProps } from './components/PlanTab';
import { CoverageTabsBar } from './components/CoverageTabsBar';
import { ChartPanel } from './components/ChartPanel';
import { MessagePanel } from './components/MessagePanel';

type MsgState = 'open' | 'collapsed' | 'wide';

// Quotation (indicative monthly premium) UI is hidden from the screen but its
// logic/state/types stay wired — flip this back to re-enable everything.
const SHOW_QUOTES_UI = false;

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
  const { t } = useLang();
  if (state === 'collapsed') {
    return (
      <div className="cc-msg-rail" onClick={() => setState('open')} title={t('msg.showMessage')} role="button">
        <span className="cc-icon-btn" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M11 17l-5-5 5-5M18 17l-5-5 5-5"></path>
          </svg>
        </span>
        <span className="cc-msg-rail-label">{t('msg.title')}</span>
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
  const { t } = useLang();
  return (
    <div>
      <p style={v3.youIntro}>{t('about.intro')}</p>
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
  const { t } = useLang();
  const [active, setActive] = useState<RailTab>(SHOW_QUOTES_UI ? 'about' : 'configure');
  const caseCount = caseProps.selectedCaseIds.length;

  return (
    <div className="cc-rail">
      <div className="cc-rtabbar" role="tablist">
        {SHOW_QUOTES_UI && (
          <button className={'cc-rtab' + (active === 'about' ? ' on' : '')} onClick={() => setActive('about')}>
            <span className="cc-fav cc-fav-you">
              <svg viewBox="0 0 12 12">
                <circle cx="6" cy="4" r="2"></circle>
                <path d="M2.5 10c0-2 1.6-3 3.5-3s3.5 1 3.5 3"></path>
              </svg>
            </span>
            {t('rail.about')}
          </button>
        )}
        <button className={'cc-rtab' + (active === 'configure' ? ' on' : '')} onClick={() => setActive('configure')}>
          <span className="cc-fav cc-fav-plan">
            <svg viewBox="0 0 12 12">
              <rect x="2" y="1.5" width="8" height="9" rx="1.5"></rect>
              <path d="M4 4.5h4M4 6.5h4M4 8.5h2.5"></path>
            </svg>
          </span>
          {t('rail.plan')}<span className="cc-rtab-count">{configProps.plans.length}</span>
        </button>
        <button className={'cc-rtab' + (active === 'case' ? ' on' : '')} onClick={() => setActive('case')}>
          <span className="cc-fav cc-fav-case">
            <svg viewBox="0 0 12 12">
              <path d="M1.5 3.5a1 1 0 0 1 1-1h2l1 1.2h3.5a1 1 0 0 1 1 1v3.8a1 1 0 0 1-1 1h-6.5a1 1 0 0 1-1-1z"></path>
            </svg>
          </span>
          {t('rail.case')}<span className="cc-rtab-count">{caseCount}</span>
        </button>
      </div>

      <div className="cc-rail-body cc-scroll">
        {SHOW_QUOTES_UI && active === 'about' && <YouTabBody {...aboutProps} />}
        {active === 'configure' && <PlanTab {...configProps} hideHeader />}
        {active === 'case' && <CaseTab {...caseProps} hideHeader />}
      </div>
    </div>
  );
}

/* ── Top bar ───────────────────────────────────────────────────── */
function CCTopBar({ onClearAll, showQuotes, setShowQuotes }: { onClearAll: () => void; showQuotes: boolean; setShowQuotes: (v: boolean) => void }) {
  const { t, lang, toggle } = useLang();
  return (
    <div className="cc-topbar">
      <div className="cc-brand">
        <span className="cc-wordmark">bowtie</span>
        <span className="cc-tool-badge">{t('topbar.toolBadge')}</span>
      </div>
      <div className="cc-topbar-right">
        <button
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            minWidth: 40, padding: '6px 10px', borderRadius: 'var(--bt-radius-pill)',
            border: '1.5px solid var(--bt-stone)', background: 'var(--bt-white)',
            font: '700 13px/1 var(--bt-font)', color: 'var(--bt-bowtie-blue)', cursor: 'pointer',
          }}
          onClick={toggle}
          aria-pressed={lang === 'zh'}
          title="Switch language · 切換語言"
        >
          {lang === 'en' ? '中文' : 'EN'}
        </button>
        {SHOW_QUOTES_UI && (
          <>
            <span style={{ width: 1, height: 18, background: 'var(--bt-stone)' }}></span>
            <button
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
              onClick={() => setShowQuotes(!showQuotes)}
              aria-pressed={showQuotes}
              title={t('topbar.quotesTitle')}
            >
              <span style={{ font: '700 13px/1 var(--bt-font)', color: showQuotes ? 'var(--bt-bowtie-pink)' : 'var(--bt-graphite)' }}>{t('topbar.quotes')}</span>
              <span className={'cc-toggle' + (showQuotes ? ' on' : '')} aria-hidden="true"></span>
            </button>
          </>
        )}
        <span style={{ width: 1, height: 18, background: 'var(--bt-stone)' }}></span>
        <button className="cc-link" onClick={onClearAll}>
          {t('topbar.clearAll')}
        </button>
      </div>
    </div>
  );
}

/* ── Coverage app (mounts only after operation data has loaded) ──── */
function CoverageApp() {
  const { cases } = useOperationData();

  // Case filters (these filter which surgeries show)
  const [tier, setTier] = useState<TierId>('complex');
  const [gender, setGender] = useState('all');
  const [age, setAge] = useState('senior');

  // About-you profile (SEPARATE from case filters; drives premiums)
  const [profile, setProfile] = useState<Profile>({ age: 42, gender: 'male', smoker: false });
  const [showQuotes, setShowQuotes] = useState(false);

  const [plans, setPlans] = useState<SelectedPlan[]>([
    { id: 'flexi-sup', deductible: 0 },
    { id: 'pink-semi', deductible: 20000 },
    { id: 'pink-priv', deductible: 0 },
  ]);

  const [selectedCaseIds, setSelectedCaseIds] = useState<string[]>(() => repCaseIdsByTier(cases));
  const toggleCase = (id: string) =>
    setSelectedCaseIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const [msgState, setMsgState] = useState<MsgState>('open');
  const [coverageMode, setCoverageMode] = useState<CoverageMode>('case');
  const [focusPlanId, setFocusPlanId] = useState<string | null>('flexi-sup');
  const [focusPlanDeductible, setFocusPlanDeductible] = useState<number | null>(0);
  const [focusCaseId, setFocusCaseId] = useState<string | null>(selectedCaseIds[0] || null);

  const setFocusPlan = (id: string | null, deductible: number | null) => {
    setFocusPlanId(id);
    setFocusPlanDeductible(deductible);
  };

  useEffect(() => {
    if (!plans.some((p) => p.id === focusPlanId && p.deductible === focusPlanDeductible)) {
      setFocusPlan(plans[0] ? plans[0].id : null, plans[0] ? plans[0].deductible : null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plans]);
  useEffect(() => {
    if (focusCaseId === null || !selectedCaseIds.includes(focusCaseId)) setFocusCaseId(selectedCaseIds[0] || null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCaseIds]);

  const addPlan = (id: string, deductible: number) =>
    setPlans((prev) => (prev.find((p) => p.id === id) ? prev : [...prev, { id, deductible }]));
  const removePlan = (id: string, deductible: number) =>
    setPlans((prev) => prev.filter((p) => !(p.id === id && p.deductible === deductible)));
  const setPlanDeductible = (id: string, deductible: number) =>
    setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, deductible } : p)));
  // Pink/flexi-premium plans allow multiple deductible tiers of the same ward at
  // once — each cell toggles its own (id, deductible) pair independently.
  const selectPinkCell = (id: string, deductible: number) => {
    setPlans((prev) => {
      const exists = prev.some((p) => p.id === id && p.deductible === deductible);
      if (exists) return prev.filter((p) => !(p.id === id && p.deductible === deductible));
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
    focusPlanDeductible,
    setFocusPlan,
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

/* ── Loading / error gates for the runtime operation-data fetch ──── */
const gateWrap: CSSProperties = {
  minHeight: '60vh', display: 'flex', flexDirection: 'column',
  alignItems: 'center', justifyContent: 'center', gap: 12, padding: 40, textAlign: 'center',
};

function Loading() {
  const { t } = useLang();
  return (
    <div style={gateWrap}>
      <div className="cc-spinner" aria-hidden="true" />
      <div style={{ font: '500 13px/1.5 var(--bt-font)', color: 'var(--bt-graphite)' }}>{t('gate.loading')}</div>
    </div>
  );
}

function LoadError({ error, onRetry }: { error: Error; onRetry: () => void }) {
  const { t } = useLang();
  return (
    <div style={gateWrap} role="alert">
      <div style={{ font: '700 16px/1.3 var(--bt-font)', color: 'var(--bt-ink)' }}>{t('gate.errorTitle')}</div>
      <div style={{ font: '400 13px/1.5 var(--bt-font)', color: 'var(--bt-graphite)', maxWidth: 420 }}>
        {error.message}. {t('gate.errorHint')}
      </div>
      <button
        onClick={onRetry}
        style={{
          marginTop: 4, background: 'var(--bt-bowtie-pink)', border: 0, borderRadius: 'var(--bt-radius-pill)',
          padding: '10px 22px', font: '700 13px/1 var(--bt-font)', color: 'var(--bt-white)', cursor: 'pointer',
        }}
      >
        {t('gate.retry')}
      </button>
    </div>
  );
}

/* ── App: provide language, then fetch operation data + mount the tool ── */
export function App() {
  return (
    <LanguageProvider>
      <AppInner />
    </LanguageProvider>
  );
}

function AppInner() {
  const { data, error, retry } = useOperationDataLoader();
  if (error) return <LoadError error={error} onRetry={retry} />;
  if (!data) return <Loading />;
  return (
    <OperationDataProvider value={data}>
      <CoverageApp />
    </OperationDataProvider>
  );
}
