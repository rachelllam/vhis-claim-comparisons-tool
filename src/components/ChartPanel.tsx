import { useState } from 'react';
import type { ReactNode } from 'react';
import {
  SURGERY_TIERS,
  VHIS_PLANS,
  computeBreakdown,
  getTreatmentDetail,
  casesFromIds,
  fmtHK,
  fmtHKShort,
} from '../data';
import type { SurgeryCase, SurgeryTier, VhisPlan } from '../data';
import { useOperationData } from '../useOperationData';
import { useLang, pick, pickCaseName, pickCaseShort, wardLabel } from '../i18n';
import type { StringKey } from '../i18n';
import type { SelectedPlan, CoverageView, QuoteCtx } from '../types';
import { monthlyPremium } from '../quote';
import { ccChartStyles, ccV2, ccDetail } from './chartStyles';
import { ccQuote } from './common';
import { LockIcon, InternalDetailModal } from './InternalDetailModal';

const capLabelShort = (plan: VhisPlan, t: (k: StringKey) => string) =>
  plan.perSurgery >= 999999 ? t('common.noCap') : fmtHKShort(plan.perSurgery);
// "3 nights" / "3 晚" / "Day case" for a hospital-stay night count.
const nightsLabel = (days: number, t: (k: StringKey) => string) =>
  days === 0 ? t('common.dayCase') : `${days} ${t(days === 1 ? 'chart.night' : 'chart.nights')}`;

// ── Generalised result card: header (JSX) + coverage bar + receipt ──
function ResultCardV2({
  plan,
  totalCost,
  deductible,
  header,
  premium,
}: {
  plan: VhisPlan;
  totalCost: number;
  deductible: number;
  header: ReactNode;
  premium?: number | null;
}) {
  const { t } = useLang();
  const breakdown = computeBreakdown({ totalCost, gm: { enabled: false }, plan, deductible });
  const [showDetails, setShowDetails] = useState(false);

  const charge = totalCost;
  const ded = breakdown.ded;
  const overCap = breakdown.oop;
  const covered = breakdown.vhis;
  const youPay = breakdown.customerPays;
  const zero = covered === 0;
  const capLabel = plan.perSurgery >= 999999
    ? t('chart.noPerSurgeryLimit')
    : t('chart.planLimitPerSurgeryTpl').replace('{amount}', fmtHKShort(plan.perSurgery));

  const feeItems = [
    { label: t('chart.feeSurgeon'), amount: Math.round(totalCost * 0.5) },
    { label: t('chart.feeAnaesthetist'), amount: Math.round(totalCost * 0.15) },
    { label: t('chart.feeTheatre'), amount: totalCost - Math.round(totalCost * 0.5) - Math.round(totalCost * 0.15) },
    { label: t('chart.feeSmm'), amount: Math.round(totalCost * 0.2) },
    { label: t('chart.feeDayCash'), amount: 1500 },
  ];

  // Bar follows spend order: deductible you pay first → VHIS covers → anything above the plan limit you pay.
  const segs = [
    { key: 'ded', value: ded, color: 'var(--bt-yellow-submarine)', label: t('chart.dedYouPayFirst') },
    { key: 'vhis', value: covered, color: 'var(--bt-green-day)', label: t('chart.vhisCovers') },
    { key: 'oop', value: overCap, color: 'var(--bt-hotel-california)', label: t('chart.aboveLimitYouPay') },
  ].filter((s) => s.value > 0);

  return (
    <div style={ccV2.card}>
      {header}

      <div style={ccChartStyles.bar}>
        {segs.map((s) => {
          const pct = (s.value / charge) * 100;
          return (
            <div key={s.key} style={{ ...ccChartStyles.barSeg(s.color), flex: s.value }} title={`${s.label}: ${fmtHK(s.value)} (${pct.toFixed(0)}%)`}>
              {pct >= 12 ? fmtHKShort(s.value) : ''}
            </div>
          );
        })}
      </div>

      {premium != null && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, marginTop: 12, paddingTop: 11, borderTop: '1px dashed var(--bt-stone)' }}>
          <span style={{ font: '500 12px/1 var(--bt-font)', color: 'var(--bt-graphite)' }}>{t('chart.monthlyPremium')}</span>
          <span style={ccQuote.badge}>
            HK${premium.toLocaleString('en-US')}
            <span style={ccQuote.badgePer}>{t('common.perMonth')}</span>
          </span>
        </div>
      )}

      <button style={ccChartStyles.detailToggle} onClick={() => setShowDetails((v) => !v)} aria-expanded={showDetails}>
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ transform: showDetails ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform var(--bt-duration-fast) var(--bt-ease)' }}>
          <path d="M4.5 3 L8 6 L4.5 9"></path>
        </svg>
        {showDetails ? t('chart.hideDetails') : t('chart.showDetails')}
      </button>

      {showDetails && (
        <div style={ccChartStyles.receipt}>
          <div style={ccChartStyles.receiptRow}>
            <span style={ccChartStyles.receiptLabel}>{t('chart.eligibleCharge')}</span>
            <span style={ccChartStyles.receiptVal}>{fmtHK(charge)}</span>
          </div>
          {ded > 0 && (
            <div style={{ ...ccChartStyles.receiptRow, ...ccChartStyles.receiptRowBorder }}>
              <span style={ccChartStyles.receiptLabel}>
                {t('chart.deductible')}<span style={ccChartStyles.receiptHint}>{t('chart.youPayFirst')}</span>
              </span>
              <span style={{ ...ccChartStyles.receiptVal, ...ccChartStyles.receiptValNeg }}>−{fmtHK(ded)}</span>
            </div>
          )}
          {overCap > 0 && (
            <div style={{ ...ccChartStyles.receiptRow, ...ccChartStyles.receiptRowBorder }}>
              <span style={ccChartStyles.receiptLabel}>
                {t('chart.aboveLimit')}<span style={ccChartStyles.receiptHint}>{capLabel}</span>
              </span>
              <span style={{ ...ccChartStyles.receiptVal, ...ccChartStyles.receiptValNeg }}>−{fmtHK(overCap)}</span>
            </div>
          )}
          <div style={{ ...ccChartStyles.receiptRow, ...ccChartStyles.receiptRowBorder }}>
            <span style={{ ...ccChartStyles.receiptLabel, color: 'var(--bt-green-day)', fontWeight: 700, whiteSpace: 'nowrap' }}>{t('chart.vhisCovers')}</span>
            <span style={{ ...ccChartStyles.receiptVal, ...ccChartStyles.receiptValPos }}>{fmtHK(covered)}</span>
          </div>
          <div style={ccChartStyles.detailList}>
            {feeItems.map((item, idx) => (
              <div key={item.label} style={{ ...ccChartStyles.detailRow, ...(idx === feeItems.length - 1 ? { borderBottom: 'none' } : {}) }}>
                <span style={ccChartStyles.detailLabel}>{item.label}</span>
                <span style={ccChartStyles.detailValue}>{fmtHK(item.amount)}</span>
              </div>
            ))}
          </div>
          <div style={ccChartStyles.paysBox(zero)}>
            <span style={ccChartStyles.paysLabel}>
              {t('chart.netPayout')}<span style={ccChartStyles.paysSub}>{t('chart.netPayoutSub')}</span>
            </span>
            <span style={ccChartStyles.paysValue(zero)}>{fmtHK(covered)}</span>
          </div>
          <div style={ccChartStyles.youPayRow}>
            <span style={ccChartStyles.youPayLabel}>{t('chart.youPayTotal')}</span>
            <span style={ccChartStyles.youPayVal(youPay === 0)}>{youPay === 0 ? t('chart.fullyCovered') : fmtHK(youPay)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Headers ──
function PlanHeader({ plan, deductible, onRemove }: { plan: VhisPlan; deductible: number; onRemove?: (id: string) => void }) {
  const { t, lang } = useLang();
  return (
    <div style={ccChartStyles.planHead}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: plan.color, display: 'inline-block' }}></span>
        <span style={ccChartStyles.planTitle}>{pick(plan, lang)}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ font: '500 11px/1 var(--bt-font)', color: 'var(--bt-graphite)' }}>
          {t('chart.deductible')} · <strong style={{ color: 'var(--bt-ink)' }}>{deductible === 0 ? t('common.none') : fmtHK(deductible)}</strong>
        </div>
        {onRemove && (
          <button style={ccChartStyles.removeBtn} title={t('chart.removeThisPlan')} onClick={() => onRemove(plan.id)}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M4 4 L12 12"></path>
              <path d="M12 4 L4 12"></path>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

function CaseHeader({ tier, caseItem, onOpenDetail }: { tier?: SurgeryTier; caseItem: SurgeryCase; onOpenDetail?: () => void }) {
  const { treatmentDetails } = useOperationData();
  const { t, lang } = useLang();
  const detail = getTreatmentDetail(treatmentDetails, caseItem.id);
  const official = detail ? pick(detail.official, lang) : '';
  return (
    <div>
      <span style={ccV2.tierBadge()}>
        <span style={ccV2.dot(tier ? tier.accent : 'var(--bt-graphite)')}></span>
        {tier && pick(tier, lang)}
      </span>
      <div style={ccV2.caseHead}>
        <div style={{ minWidth: 0 }}>
          <div style={ccV2.caseName}>{pickCaseShort(caseItem, lang)}</div>
          <div style={ccV2.caseEn}>
            {(official && official !== 'N/A' ? official : pickCaseName(caseItem, lang))} · {nightsLabel(caseItem.days, t)}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <div style={ccV2.caseCost}>{fmtHK(caseItem.cost)}</div>
          {onOpenDetail && (
            <button
              style={ccDetail.intBtnSmall}
              onClick={onOpenDetail}
              title={t('chart.internalTreatmentDetails')}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--bt-bowtie-pink)'; e.currentTarget.style.color = 'var(--bt-bowtie-pink)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--bt-stone)'; e.currentTarget.style.color = 'var(--bt-bowtie-blue)'; }}
            >
              <LockIcon size={11} />{t('chart.internal')}<span style={ccDetail.intDot}></span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Enhanced treatment header (by-case mode): identity + key public stats + internal trigger ──
function TreatmentHeader({ focusCase, onOpenDetail }: { focusCase: SurgeryCase; onOpenDetail: () => void }) {
  const { treatmentDetails } = useOperationData();
  const { t, lang } = useLang();
  const tier = SURGERY_TIERS.find((x) => x.id === focusCase.tier);
  const detail = getTreatmentDetail(treatmentDetails, focusCase.id);
  const official = detail ? pick(detail.official, lang) : '';
  const dayCase = focusCase.days === 0;
  return (
    <div style={{ marginBottom: 18, paddingBottom: 18, borderBottom: '1px solid var(--bt-stone)' }}>
      <div style={ccDetail.thHead}>
        <div style={ccDetail.thNames}>
          <h3 style={ccDetail.thShort}>{pickCaseShort(focusCase, lang)}</h3>
          <div style={ccDetail.thOfficial}>{official && official !== 'N/A' ? official : pickCaseName(focusCase, lang)}</div>
          <div style={{ ...ccDetail.thBadgeRow, marginTop: 10, marginBottom: 0 }}>
            <span style={ccV2.tierBadge()}>
              <span style={ccV2.dot(tier ? tier.accent : 'var(--bt-graphite)')}></span>
              {tier ? t('chart.tierSurgeryTpl').replace('{tier}', pick(tier, lang)) : ''}
            </span>
          </div>
        </div>
        <button
          style={ccDetail.intBtn}
          onClick={onOpenDetail}
          title={t('chart.internalOnlyTreatmentDetails')}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--bt-bowtie-pink)'; e.currentTarget.style.color = 'var(--bt-bowtie-pink)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--bt-stone)'; e.currentTarget.style.color = 'var(--bt-bowtie-blue)'; }}
        >
          <LockIcon size={12} />{t('chart.internalDetails')}<span style={ccDetail.intDot}></span>
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={ccV2.stripCell}>
          <span style={ccV2.stripKicker}>{t('chart.estMedicalCharge')}</span>
          <span style={ccV2.stripBlue}>{fmtHK(focusCase.cost)}</span>
          <span style={ccDetail.rangeNote}>
            {t('chart.rangeNoteTpl').replace('{tier}', tier ? pick(tier, lang) : '').replace('{range}', tier ? tier.rangeLabel : '')}
          </span>
        </div>
        <div style={ccV2.stripCell}>
          <span style={ccV2.stripKicker}>{t('chart.usualStay')}</span>
          <span style={ccV2.stripBig}>{nightsLabel(focusCase.days, t)}</span>
          <span
            style={{
              display: 'inline-flex', alignItems: 'center', alignSelf: 'flex-start', gap: 5, marginTop: 1,
              font: '700 10px/1 var(--bt-font)', letterSpacing: '0.04em', textTransform: 'uppercase',
              padding: '4px 9px', borderRadius: 'var(--bt-radius-pill)',
              color: dayCase ? 'var(--bt-green-day)' : 'var(--bt-bowtie-blue)',
              background: dayCase ? 'var(--bt-green-day-light)' : 'var(--bt-lilac)',
            }}
          >
            {dayCase ? t('chart.noOvernight') : t('chart.inpatient')}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Empty / prompt states ──
function PromptBox({ title, sub }: { title: string; sub: string }) {
  return (
    <div style={{ padding: 36, textAlign: 'center', background: 'var(--bt-pebble)', borderRadius: 'var(--bt-radius-m)', color: 'var(--bt-graphite)' }}>
      <div style={{ font: '700 16px var(--bt-font)', color: 'var(--bt-ink)', marginBottom: 4 }}>{title}</div>
      <div style={{ font: '400 13px var(--bt-font)' }}>{sub}</div>
    </div>
  );
}

function Legend({ showDeductible }: { showDeductible?: boolean }) {
  const { t } = useLang();
  return (
    <div style={ccChartStyles.legend}>
      {showDeductible && (
        <span style={ccChartStyles.legendItem}>
          <span style={ccChartStyles.legendSwatch('var(--bt-yellow-submarine)')}></span>{t('chart.dedYouPayFirst')}
        </span>
      )}
      <span style={ccChartStyles.legendItem}>
        <span style={ccChartStyles.legendSwatch('var(--bt-green-day)')}></span>{t('chart.vhisReimburses')}
      </span>
      <span style={ccChartStyles.legendItem}>
        <span style={ccChartStyles.legendSwatch('var(--bt-hotel-california)')}></span>{t('chart.aboveLimitYouPay')}
      </span>
    </div>
  );
}

// ── Main panel ──
export function ChartPanel({
  plans,
  onRemove,
  cv,
  quoteCtx,
}: {
  plans: SelectedPlan[];
  onRemove: (id: string) => void;
  onRemoveCase: (en: string) => void;
  cv: CoverageView;
  quoteCtx: QuoteCtx;
}) {
  const { cases } = useOperationData();
  const { t, lang } = useLang();
  const mode = cv.mode;
  const showPrem = quoteCtx && quoteCtx.show;
  const premOf = (id: string) => (showPrem ? monthlyPremium(id, quoteCtx.profile) : null);
  const activePlans = plans.filter(Boolean);
  const chosenCases = casesFromIds(cases, cv.selectedCaseIds);
  const [detailCase, setDetailCase] = useState<SurgeryCase | null>(null);
  const modal = detailCase && <InternalDetailModal caseItem={detailCase} onClose={() => setDetailCase(null)} />;

  const Header = ({ children }: { children: ReactNode }) => (
    <div>
      <h2 className="cc-panel-h1" style={{ marginBottom: 4 }}>
        {t('chart.title')}
      </h2>
      <p className="cc-panel-sub" style={{ margin: 0 }}>
        {children}
      </p>
    </div>
  );

  /* ── BY CASE: one case (chip-picked) × all plans ── */
  if (mode === 'case') {
    const focusCase = chosenCases.find((c) => c.id === cv.focusCaseId) || chosenCases[0];
    if (!focusCase) {
      return (
        <div>
          <Header>{t('chart.splitBill')}</Header>
          <div style={{ marginTop: 18 }}>
            <PromptBox title={t('chart.pickCasesTitle')} sub={t('chart.pickCasesSub')} />
          </div>
        </div>
      );
    }
    return (
      <div>
        <Header>{t('chart.splitBill')}</Header>
        <TreatmentHeader focusCase={focusCase} onOpenDetail={() => setDetailCase(focusCase)} />
        <Legend showDeductible={activePlans.some((p) => p.deductible > 0)} />

        {activePlans.length === 0 && <PromptBox title={t('chart.pickPlansTitle')} sub={t('chart.pickPlansSub')} />}
        {activePlans.map((p, i) => {
          const planDef = VHIS_PLANS.find((v) => v.id === p.id)!;
          return (
            <ResultCardV2
              key={`${p.id}-${i}`}
              plan={planDef}
              totalCost={focusCase.cost}
              deductible={p.deductible}
              premium={premOf(p.id)}
              header={<PlanHeader plan={planDef} deductible={p.deductible} onRemove={onRemove} />}
            />
          );
        })}
        {modal}
      </div>
    );
  }

  /* ── BY PLAN: one plan (chip-picked) × all selected cases ── */
  const focus = activePlans.find((p) => p.id === cv.focusPlanId) || activePlans[0];
  const focusDef = focus ? VHIS_PLANS.find((v) => v.id === focus.id) : null;

  return (
    <div>
      <Header>{focusDef ? t('chart.holdsUpTpl').replace('{plan}', pick(focusDef, lang)) : t('chart.holdsUpGeneric')}</Header>

      {activePlans.length === 0 && (
        <div style={{ marginTop: 18 }}>
          <PromptBox title={t('chart.pickPlansTitle')} sub={t('chart.pickPlansSub')} />
        </div>
      )}

      {activePlans.length > 0 && focusDef && focus && (
        <>
          <Legend showDeductible={focus.deductible > 0} />

          <div style={ccV2.strip}>
            <div style={ccV2.stripCell}>
              <span style={ccV2.stripKicker}>{t('chart.planLabel')}</span>
              <span style={ccV2.stripBig}>{pick(focusDef, lang)}</span>
              <span style={ccV2.stripSmall}>
                {t('chart.deductible')} {focus.deductible === 0 ? t('common.none') : fmtHK(focus.deductible)}
                {showPrem && premOf(focus.id) != null ? ` · HK$${premOf(focus.id)!.toLocaleString('en-US')}${t('common.perMonth')}` : ''}
              </span>
            </div>
            <div style={ccV2.stripCell}>
              <span style={ccV2.stripKicker}>{t('chart.perSurgeryLimit')}</span>
              <span style={ccV2.stripBlue}>{capLabelShort(focusDef, t)}</span>
              <span style={ccV2.stripSmall}>{t('chart.capsEachClaim')}</span>
            </div>
            <div style={ccV2.stripCell}>
              <span style={ccV2.stripKicker}>{t('chart.wardClass')}</span>
              <span style={ccV2.stripBig}>{wardLabel(focusDef.ward, t)}</span>
              <span style={ccV2.stripSmall}>{t('chart.annualTpl').replace('{amount}', fmtHKShort(focusDef.annual))}</span>
            </div>
          </div>

          {chosenCases.length === 0 && <PromptBox title={t('chart.pickCasesTitle')} sub={t('chart.pickCasesSub')} />}
          {chosenCases.map((c) => {
            const tier = SURGERY_TIERS.find((t) => t.id === c.tier);
            return (
              <ResultCardV2
                key={c.id}
                plan={focusDef}
                totalCost={c.cost}
                deductible={focus.deductible}
                header={<CaseHeader tier={tier} caseItem={c} onOpenDetail={() => setDetailCase(c)} />}
              />
            );
          })}
        </>
      )}
      {modal}
    </div>
  );
}
