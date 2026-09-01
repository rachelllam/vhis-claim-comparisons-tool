import { useState } from 'react';
import type { ReactNode } from 'react';
import {
  SURGERY_TIERS,
  VHIS_PLANS,
  getTreatmentDetail,
  casesFromIds,
  fmtHK,
  fmtHKShort,
} from '../data';
import type { SurgeryCase, SurgeryTier, VhisPlan, TierId } from '../data';
import { computeSurgeryPayout } from '../benefitSchedule';
import { useBenefitSchedule } from '../useBenefitSchedule';
import { useOperationData } from '../useOperationData';
import { useLang, pick, pickCaseName, pickCaseShort, wardLabel } from '../i18n';
import type { StringKey } from '../i18n';
import type { SelectedPlan, CoverageView, QuoteCtx } from '../types';
import { monthlyPremium } from '../quote';
import { ccChartStyles, ccV2, ccDetail } from './chartStyles';
import { ccQuote } from './common';
import { LockIcon, InternalDetailModal } from './InternalDetailModal';

// "3 nights" / "3 晚" / "Day case" for a hospital-stay night count.
const nightsLabel = (days: number, t: (k: StringKey) => string) =>
  days === 0 ? t('common.dayCase') : `${days} ${t(days === 1 ? 'chart.night' : 'chart.nights')}`;

// Plan-terms strip cells: the three ceilings plus the ward class, read from the
// focused plan's live benefit schedule rather than the static VHIS_PLANS table.
// All three limits show for every plan so the same numbers can be compared
// across plans — a plan that lacks one says so instead of leaving a gap:
//  - VHIS Standard — annual limit only; no SMM rider, no lifetime cap.
//  - Flexi Regular / Flexi Plus — annual limit + the SMM rider's annual ceiling.
//  - Flexi Premium ("Pink") — annual limit + lifetime limit.
// "No cap" and "N/A" are deliberately different words: an absent lifetime cap
// means lifetime coverage is unlimited, which is the opposite of an absent rider.
//
// Ward class reads the same way. Only Flexi Premium buys a ward — the tiered
// plans pay by surgery type wherever you stay, so they show "No restriction",
// with the ward named in the remark for the ones whose SMM top-up is the part
// the ward class actually limits.
//
// Its own component so the hook lives in a real component body — the by-plan
// branch it renders in sits after the by-case early return, where a hook can't go.
function PlanTermCells({ plan, deductible }: { plan: VhisPlan; deductible: number }) {
  const { t } = useLang();
  const { schedule, error, loading } = useBenefitSchedule(plan.id, deductible);
  // By id, not isFlexiPremium(schedule), so the ward cell is right from the
  // first paint instead of flipping once the schedule lands.
  const isPink = plan.id.startsWith('pink');
  const dash = '—';

  const cells: { label: string; value: string; remark?: string; big?: boolean }[] = [
    {
      label: t('chart.annualBenefitLimit'),
      value: schedule ? fmtHKShort(schedule.annual_limit) : dash,
      // One status line for the whole group, not the same message three times over.
      remark: schedule ? '' : error ? t('chart.scheduleErrorTitle') : loading ? t('chart.scheduleLoading') : '',
    },
    {
      label: t('chart.smmLimit'),
      value: !schedule ? dash : schedule.smm_annual_limit > 0 ? fmtHKShort(schedule.smm_annual_limit) : t('common.notApplicable'),
    },
    {
      label: t('chart.lifetimeLimit'),
      value: !schedule ? dash : schedule.lifetime_limit != null ? fmtHKShort(schedule.lifetime_limit) : t('common.noCap'),
    },
    {
      label: t('chart.wardClass'),
      value: isPink ? wardLabel(plan.ward, t) : t('common.noRestriction'),
      remark:
        !isPink && schedule && schedule.smm_annual_limit > 0
          ? t('chart.smmWardOnlyTpl').replace('{ward}', wardLabel(plan.ward, t))
          : '',
      big: true,
    },
  ];

  return (
    <>
      {cells.map((cell) => (
        <div key={cell.label} style={ccV2.stripCell}>
          <span style={ccV2.stripKicker}>{cell.label}</span>
          <span style={cell.big ? ccV2.stripBig : ccV2.stripBlue}>{cell.value}</span>
          {cell.remark && <span style={ccV2.stripSmall}>{cell.remark}</span>}
        </div>
      ))}
    </>
  );
}

// ── Generalised result card: header (JSX) + coverage bar + receipt ──
function ResultCardV2({
  plan,
  tier,
  totalCost,
  deductible,
  header,
  premium,
}: {
  plan: VhisPlan;
  tier: TierId;
  totalCost: number;
  deductible: number;
  header: ReactNode;
  premium?: number | null;
}) {
  const { t } = useLang();
  const { schedule, error, loading } = useBenefitSchedule(plan.id, deductible);
  const [showDetails, setShowDetails] = useState(false);

  if (!schedule) {
    return (
      <div style={ccV2.card}>
        {header}
        <div style={{ marginTop: 12, font: '500 12px/1.5 var(--bt-font)', color: 'var(--bt-graphite)' }}>
          {error ? t('chart.scheduleErrorTitle') : loading ? t('chart.scheduleLoading') : null}
        </div>
      </div>
    );
  }

  const payout = computeSurgeryPayout(schedule, tier, totalCost);

  const charge = totalCost;
  const ded = payout.deductible;
  const overCap = payout.oop;
  const covered = payout.covered;
  const youPay = payout.customerPays;
  const zero = covered === 0;
  // Share of the eligible charge the plan pays. One decimal, matching the same
  // figure in the message panel's summary line so the two can't disagree.
  const coveredPct = charge > 0 ? ((covered / charge) * 100).toFixed(1) : '0.0';

  const feeItems: { label: string; amount: number; hint?: string }[] = payout.fees.itemized
    ? [
        { label: t('chart.feeSurgeon'), amount: payout.fees.surgeon },
        { label: t('chart.feeAnaesthetist'), amount: payout.fees.anaesthetist },
        { label: t('chart.feeTheatre'), amount: payout.fees.theatre },
        ...(payout.smm > 0 && payout.smmBreakdown
          ? [
              {
                label: t('chart.feeSmm'),
                amount: payout.smm,
                hint: t('chart.smmBreakdownTpl')
                  .replace('{remaining}', fmtHK(payout.smmBreakdown.remaining))
                  .replace('{pct}', String(payout.smmBreakdown.factorPct)),
              },
            ]
          : []),
      ]
    : [{ label: t('chart.feeCombinedSurgical'), amount: payout.fees.combined }];

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
              <span style={ccChartStyles.receiptLabel}>{t('chart.deductible')}</span>
              <span style={{ ...ccChartStyles.receiptVal, ...ccChartStyles.receiptValNeg }}>−{fmtHK(ded)}</span>
            </div>
          )}
          <div style={{ ...ccChartStyles.receiptRow, ...ccChartStyles.receiptRowBorder }}>
            <span style={{ ...ccChartStyles.receiptLabel, color: 'var(--bt-green-day)', fontWeight: 700, whiteSpace: 'nowrap' }}>{t('chart.vhisCovers')}</span>
            <span style={{ ...ccChartStyles.receiptVal, ...ccChartStyles.receiptValPos }}>{fmtHK(covered)}</span>
          </div>
          <div style={ccChartStyles.detailList}>
            {feeItems.map((item, idx) => (
              <div key={item.label} style={{ ...ccChartStyles.detailRow, ...(idx === feeItems.length - 1 ? { borderBottom: 'none' } : {}) }}>
                <span style={ccChartStyles.detailLabel}>
                  {item.label}
                  {item.hint && <span style={ccChartStyles.receiptHint}>{item.hint}</span>}
                </span>
                <span style={ccChartStyles.detailValue}>{fmtHK(item.amount)}</span>
              </div>
            ))}
          </div>
          <div style={ccChartStyles.paysBox(zero)}>
            <span style={ccChartStyles.paysLabel}>{t('chart.netPayout')}</span>
            <span style={ccChartStyles.paysValueBox}>
              <span style={ccChartStyles.paysValue(zero)}>{fmtHK(covered)}</span>
              <span style={ccChartStyles.paysPct(zero)}>{coveredPct}%</span>
            </span>
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
function PlanHeader({ plan, deductible, onRemove }: { plan: VhisPlan; deductible: number; onRemove?: (id: string, deductible: number) => void }) {
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
          <button style={ccChartStyles.removeBtn} title={t('chart.removeThisPlan')} onClick={() => onRemove(plan.id, deductible)}>
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
      <span style={ccV2.tierBadge(tier ? tier.accent : 'var(--bt-graphite)')}>
        {tier && pick(tier.short, lang)}
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
            <span style={ccV2.tierBadge(tier ? tier.accent : 'var(--bt-graphite)')}>
              {tier ? t('chart.tierSurgeryTpl').replace('{tier}', pick(tier.short, lang)) : ''}
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
  onRemove: (id: string, deductible: number) => void;
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

  /* ── BY CASE: one case (chip-picked) × all plans ── */
  if (mode === 'case') {
    const focusCase = chosenCases.find((c) => c.id === cv.focusCaseId) || chosenCases[0];
    if (!focusCase) {
      return (
        <div>
          <PromptBox title={t('chart.pickCasesTitle')} sub={t('chart.pickCasesSub')} />
        </div>
      );
    }
    return (
      <div>
        <TreatmentHeader focusCase={focusCase} onOpenDetail={() => setDetailCase(focusCase)} />
        <Legend showDeductible={activePlans.some((p) => p.deductible > 0)} />

        {activePlans.length === 0 && <PromptBox title={t('chart.pickPlansTitle')} sub={t('chart.pickPlansSub')} />}
        {activePlans.map((p, i) => {
          const planDef = VHIS_PLANS.find((v) => v.id === p.id)!;
          return (
            <ResultCardV2
              key={`${p.id}-${i}`}
              plan={planDef}
              tier={focusCase.tier}
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
  const focus = activePlans.find((p) => p.id === cv.focusPlanId && p.deductible === cv.focusPlanDeductible) || activePlans[0];
  const focusDef = focus ? VHIS_PLANS.find((v) => v.id === focus.id) : null;
  const focusPrem = focus ? premOf(focus.id) : null;

  return (
    <div>
      {activePlans.length === 0 && (
        <div>
          <PromptBox title={t('chart.pickPlansTitle')} sub={t('chart.pickPlansSub')} />
        </div>
      )}

      {activePlans.length > 0 && focusDef && focus && (
        <>
          {/* The focused plan names the view, the way the focused case names the
              by-case view (TreatmentHeader). Same h3 type as its thShort title,
              with the deductible and premium as the sub-line — so the plan cell
              comes out of the term strip below. */}
          <div style={{ ...ccDetail.thNames, marginBottom: 14 }}>
            <h3 style={ccDetail.thShort}>{pick(focusDef, lang)}</h3>
            <div style={ccDetail.thOfficial}>
              {t('chart.deductible')} {focus.deductible === 0 ? t('common.none') : fmtHK(focus.deductible)}
              {focusPrem != null ? ` · HK$${focusPrem.toLocaleString('en-US')}${t('common.perMonth')}` : ''}
            </div>
          </div>

          <Legend showDeductible={focus.deductible > 0} />

          <div style={ccV2.strip}>
            <PlanTermCells plan={focusDef} deductible={focus.deductible} />
          </div>

          {chosenCases.length === 0 && <PromptBox title={t('chart.pickCasesTitle')} sub={t('chart.pickCasesSub')} />}
          {chosenCases.map((c) => {
            const tier = SURGERY_TIERS.find((t) => t.id === c.tier);
            return (
              <ResultCardV2
                key={c.id}
                plan={focusDef}
                tier={c.tier}
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
