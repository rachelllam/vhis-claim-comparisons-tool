import { useState, type ReactNode } from 'react';
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
  icon: ReactNode;
  label: string;
  tip?: string;
  on: boolean;
  onClick: () => void;
  onClose: () => void;
  onShowTip: (text: string, el: HTMLElement) => void;
  onHideTip: () => void;
}) {
  const { t } = useLang();
  const full = tip ?? label;
  // Hover background lives in state, not a style mutation on the DOM node —
  // this component re-renders whenever the tooltip opens or closes, and a
  // re-render re-applies the style prop.
  const [hover, setHover] = useState(false);
  // A div, not a button: it holds the ✕, which has to be a real button of its
  // own (interactive elements can't nest). role="tab" + tabIndex + the key
  // handler give back what the button element was providing.
  return (
    <div
      style={ccV2.bTab(on, hover)}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); }
      }}
      role="tab"
      tabIndex={0}
      aria-selected={on}
      // title as well as the custom tooltip: the native one is the fallback for
      // anything that reaches the tab without a hover or a focus event.
      title={full}
      onFocus={(e) => onShowTip(full, e.currentTarget)}
      onBlur={onHideTip}
      // mouseover, not mouseenter: it fires again on every move between the
      // label and the ✕, so the tooltip is re-decided each time rather than
      // staying hidden after the pointer has once touched the ✕.
      onMouseOver={(e) => {
        setHover(true);
        // Over the ✕ the label tooltip would sit on top of the ✕'s own hint —
        // drop it and let the remove hint speak for itself.
        if ((e.target as HTMLElement).closest('button')) onHideTip();
        else onShowTip(full, e.currentTarget);
      }}
      onMouseLeave={() => {
        setHover(false);
        onHideTip();
      }}
    >
      <span style={ccV2.bFav(favColor)}>{icon}</span>
      <span style={ccV2.bTabLabel}>{label}</span>
      <button
        type="button"
        style={ccV2.bTabX(on)}
        title={t('common.removeFromComparison')}
        aria-label={`${t('common.removeFromComparison')}: ${label}`}
        // stopPropagation because focusin bubbles — without it the tab's own
        // onFocus would put the label tooltip back over the ✕'s hint.
        onFocus={(e) => { e.stopPropagation(); onHideTip(); }}
        onClick={(e) => { e.stopPropagation(); onClose(); }}
      >
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M3 3l6 6M9 3l-6 6"></path>
        </svg>
      </button>
    </div>
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
    // Half of bTip's 320px max width, plus a margin. On a viewport too narrow to
    // hold that (min > max), centring is the only placement that stays on screen.
    const edge = 170;
    const min = edge;
    const max = window.innerWidth - edge;
    const mid = r.left + r.width / 2;
    setTip({ text, x: max <= min ? window.innerWidth / 2 : Math.min(Math.max(mid, min), max), y: r.bottom + 6 });
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
