import { useState } from 'react';
import { VHIS_PLANS, SURGERY_TIERS, casesFromIds, fmtHK } from '../data';
import { useOperationData } from '../useOperationData';
import { useLang, pick, pickCaseName, pickCaseShort } from '../i18n';
import type { SelectedPlan, CoverageView } from '../types';
import { ccV2 } from './chartStyles';

interface TipState {
  text: string;
  x: number;
  y: number;
}

// One tab. Module-level (not nested in CoverageTabsBar) so its component identity
// survives the parent re-rendering on every tooltip show/hide — a nested
// definition would remount every tab mid-hover and make the tooltip flicker.
function TabBtn({
  favColor,
  icon,
  label,
  tip,
  on,
  onClick,
  onClose,
  onShowTip,
  onHideTip,
}: {
  favColor: string;
  icon: React.ReactNode;
  label: string;
  tip?: string;
  on: boolean;
  onClick: () => void;
  onClose: () => void;
  onShowTip: (text: string, el: HTMLElement) => void;
  onHideTip: () => void;
}) {
  const { t } = useLang();
  return (
    <button
      style={ccV2.bTab(on)}
      onClick={onClick}
      role="tab"
      aria-selected={on}
      onMouseEnter={(e) => {
        if (!on) e.currentTarget.style.background = 'rgba(255,255,255,0.55)';
        onShowTip(tip ?? label, e.currentTarget);
      }}
      onMouseLeave={(e) => {
        if (!on) e.currentTarget.style.background = 'transparent';
        onHideTip();
      }}
    >
      <span style={ccV2.bFav(favColor)}>{icon}</span>
      <span style={ccV2.bTabLabel}>{label}</span>
      <span
        style={ccV2.bTabX(on)}
        role="button"
        title={t('common.removeFromComparison')}
        // Over the ✕ the label tooltip would sit on top of the ✕'s own hint —
        // drop it and let the remove hint speak for itself.
        onMouseEnter={onHideTip}
        onClick={(e) => { e.stopPropagation(); onClose(); }}
      >
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M3 3l6 6M9 3l-6 6"></path>
        </svg>
      </span>
    </button>
  );
}

// ── Coverage lens bar: two rows of browser tabs (Cases / Plans) ──
// Sits ABOVE the whole combined panel; controls cv.mode + focus selection.
export function CoverageTabsBar({
  plans,
  cv,
  onRemove,
  onRemoveCase,
}: {
  plans: SelectedPlan[];
  cv: CoverageView;
  onRemove: (id: string, deductible: number) => void;
  onRemoveCase: (id: string) => void;
}) {
  const { cases } = useOperationData();
  const { t, lang } = useLang();
  const mode = cv.mode;
  const setMode = cv.setMode;
  const activePlans = plans.filter(Boolean);
  const chosenCases = casesFromIds(cases, cv.selectedCaseIds);
  const resolvedCaseId = (chosenCases.find((c) => c.id === cv.focusCaseId) || chosenCases[0] || ({} as { id?: string })).id;
  const resolvedPlan =
    activePlans.find((p) => p.id === cv.focusPlanId && p.deductible === cv.focusPlanDeductible) || activePlans[0];
  const caseIcon = (
    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="var(--bt-white)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1.5 3.5a1 1 0 0 1 1-1h2l1 1.2h3.5a1 1 0 0 1 1 1v3.8a1 1 0 0 1-1 1h-6.5a1 1 0 0 1-1-1z"></path>
    </svg>
  );
  const planIcon = (
    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="var(--bt-white)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="1.5" width="8" height="9" rx="1.5"></rect>
      <path d="M4 4.5h4M4 6.5h4M4 8.5h2.5"></path>
    </svg>
  );
  // Tabs share the row width and ellipsis their labels (ccV2.bTabLabel), so a
  // hovered tab shows its full text here. Anchored under the tab, clamped to the
  // viewport so an edge tab's tooltip stays on screen.
  const [tip, setTip] = useState<TipState | null>(null);
  const showTip = (text: string, el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    setTip({ text, x: Math.min(Math.max(r.left + r.width / 2, 170), window.innerWidth - 170), y: r.bottom + 6 });
  };
  const hideTip = () => setTip(null);
  return (
    <div className="cc-tabsbar-wrap">
      <div className="cc-scroll-x" style={ccV2.tabStrip} role="tablist">
        <span style={ccV2.groupLabel('var(--bt-bowtie-blue)')}>{t('tabs.cases')}</span>
        {chosenCases.length === 0 ? (
          <span style={ccV2.emptyHint}>{t('tabs.pickCasesHint')}</span>
        ) : (
          chosenCases.map((c) => {
            const tier = SURGERY_TIERS.find((x) => x.id === c.tier);
            const label = tier ? `${pick(tier.short, lang)} · ${pickCaseShort(c, lang)}` : pickCaseShort(c, lang);
            // The tab shows the short operation name — the tooltip is where the
            // full one is readable, truncation aside.
            const fullName = pickCaseName(c, lang);
            const tipText = tier ? `${pick(tier.short, lang)} · ${fullName}` : fullName;
            return (
              <TabBtn
                key={c.id}
                favColor={tier ? tier.accent : 'var(--bt-bowtie-blue)'}
                icon={caseIcon}
                label={label}
                tip={tipText}
                on={mode === 'case' && c.id === resolvedCaseId}
                onClick={() => { setMode('case'); cv.setFocusCaseId(c.id); }}
                onClose={() => onRemoveCase(c.id)}
                onShowTip={showTip}
                onHideTip={hideTip}
              />
            );
          })
        )}
      </div>
      <div className="cc-scroll-x" style={ccV2.tabStrip2} role="tablist">
        <span style={ccV2.groupLabel('var(--bt-bowtie-pink)')}>{t('tabs.plans')}</span>
        {activePlans.length === 0 ? (
          <span style={ccV2.emptyHint}>{t('tabs.pickPlansHint')}</span>
        ) : (
          activePlans.map((p) => {
            const def = VHIS_PLANS.find((v) => v.id === p.id);
            // Pink plans are picked per (ward × deductible) cell, so the tier is
            // part of what was chosen — always name it. Other plans append it
            // only when more than one tier of the same ward is active, to keep
            // those tabs distinguishable.
            const sameIdCount = activePlans.filter((x) => x.id === p.id).length;
            const showDeductible = p.id.startsWith('pink') || sameIdCount > 1;
            const baseLabel = def ? pick(def, lang) : p.id;
            const label = showDeductible
              ? `${baseLabel} · ${t('chart.deductible')} ${p.deductible === 0 ? t('common.none') : fmtHK(p.deductible)}`
              : baseLabel;
            return (
              <TabBtn
                key={`${p.id}-${p.deductible}`}
                favColor="var(--bt-bowtie-pink)"
                icon={planIcon}
                label={label}
                on={mode === 'plan' && p.id === resolvedPlan?.id && p.deductible === resolvedPlan?.deductible}
                onClick={() => { setMode('plan'); cv.setFocusPlan(p.id, p.deductible); }}
                onClose={() => onRemove(p.id, p.deductible)}
                onShowTip={showTip}
                onHideTip={hideTip}
              />
            );
          })
        )}
      </div>
      {tip && (
        <div style={ccV2.bTip(tip.x, tip.y)} role="tooltip">
          {tip.text}
        </div>
      )}
    </div>
  );
}
