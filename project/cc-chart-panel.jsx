// Center chart panel — Coverage breakdown for selected case across chosen plans
const { useState: useStateChart } = React;

const ccChartStyles = {
  caseHeader: {
    background: 'linear-gradient(180deg, var(--bt-pebble) 0%, var(--bt-white) 100%)',
    border: '1px solid var(--bt-stone)',
    borderRadius: 'var(--bt-radius-m)',
    padding: '18px 22px',
    marginBottom: 20,
  },
  caseTopRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' },
  caseTitle: { font: '700 22px/1.3 var(--bt-font)', color: 'var(--bt-bowtie-blue)' },
  caseEn: { font: '500 14px/1.4 var(--bt-font)', color: 'var(--bt-graphite)' },
  costRow: { display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 8 },
  costLabel: { font: '500 12px/1 var(--bt-font)', color: 'var(--bt-graphite)', letterSpacing: '0.04em', textTransform: 'uppercase' },
  costValue: { font: '700 32px/1 var(--bt-font)', color: 'var(--bt-bowtie-blue)' },

  legend: { display: 'flex', gap: 18, marginBottom: 18, flexWrap: 'wrap' },
  legendItem: { display: 'flex', alignItems: 'center', gap: 8, font: '500 12px/1 var(--bt-font)', color: 'var(--bt-graphite)' },
  legendSwatch: (c) => ({ width: 14, height: 14, borderRadius: 4, background: c }),

  planCard: {
    background: 'var(--bt-white)',
    border: '1px solid var(--bt-stone)',
    borderRadius: 'var(--bt-radius-m)',
    padding: '18px 20px',
    marginBottom: 12,
  },
  planHead: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 },
  planTitle: { font: '700 16px/1.3 var(--bt-font)', color: 'var(--bt-ink)' },
  planEn: { font: '400 12px/1 var(--bt-font)', color: 'var(--bt-graphite)' },
  planTags: { display: 'flex', gap: 6, marginTop: 6, marginBottom: 14 },

  // — Stacked bar (always-visible glance) —
  bar: {
    height: 44, marginTop: 12, background: 'var(--bt-stone)',
    borderRadius: 'var(--bt-radius-s)', overflow: 'hidden', display: 'flex',
  },
  barSeg: (color) => ({
    background: color, display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'var(--bt-white)', font: '700 12px/1 var(--bt-font)', overflow: 'hidden',
    whiteSpace: 'nowrap', transition: 'flex var(--bt-duration-slow) var(--bt-ease)',
  }),
  detailToggle: {
    display: 'flex', alignItems: 'center', gap: 6, marginTop: 12,
    background: 'none', border: 'none', padding: '2px 0', cursor: 'pointer',
    font: '500 12px/1 var(--bt-font)', color: 'var(--bt-bowtie-pink)',
  },

  // — Design A : receipt / ledger —
  receipt: { fontVariantNumeric: 'tabular-nums', marginTop: 4 },
  receiptRow: {
    display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
    gap: 16, padding: '10px 0',
  },
  receiptRowBorder: { borderTop: '1px dashed var(--bt-stone)' },
  receiptLabel: { font: '500 13px/1.4 var(--bt-font)', color: 'var(--bt-graphite)' },
  receiptHint: { display: 'block', font: '400 11px/1.2 var(--bt-font)', color: 'var(--bt-rock)', marginTop: 2 },
  receiptVal: { font: '600 14px/1 var(--bt-font)', color: 'var(--bt-ink)', whiteSpace: 'nowrap' },
  receiptValNeg: { color: 'var(--bt-hotel-california)' },
  receiptValPos: { color: 'var(--bt-green-day)' },

  coversToggle: {
    display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
    padding: 0, cursor: 'pointer', font: '500 13px/1.4 var(--bt-font)', color: 'var(--bt-bowtie-pink)', whiteSpace: 'nowrap',
  },

  paysBox: (zero) => ({
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
    marginTop: 8, padding: '13px 16px', borderRadius: 'var(--bt-radius-s)',
    background: zero ? 'var(--bt-hotel-california-light)' : 'var(--bt-green-day-light)',
    border: `1px solid ${zero ? 'var(--bt-hotel-california)' : 'var(--bt-green-day)'}`,
  }),
  paysLabel: { font: '700 12px/1.2 var(--bt-font)', color: 'var(--bt-ink)', letterSpacing: '0.02em' },
  paysSub: { display: 'block', font: '400 11px/1.2 var(--bt-font)', color: 'var(--bt-graphite)', marginTop: 2 },
  paysValue: (zero) => ({ font: '700 24px/1 var(--bt-font)', color: zero ? 'var(--bt-hotel-california)' : 'var(--bt-green-day)', whiteSpace: 'nowrap' }),

  youPayRow: { display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 10, padding: '0 2px' },
  youPayLabel: { font: '500 12px/1 var(--bt-font)', color: 'var(--bt-graphite)' },
  youPayVal: (zero) => ({ font: '700 13px/1 var(--bt-font)', color: zero ? 'var(--bt-green-day)' : 'var(--bt-hotel-california)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }),

  detailList: {
    marginTop: 2, marginBottom: 2, padding: '4px 14px',
    background: 'var(--bt-pebble)', borderRadius: 'var(--bt-radius-s)',
  },
  detailRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '8px 0', borderBottom: '1px solid var(--bt-stone)',
  },
  detailLabel: { font: '500 12px/1.2 var(--bt-font)', color: 'var(--bt-graphite)' },
  detailValue: { font: '700 12px/1.2 var(--bt-font)', color: 'var(--bt-ink)' },

  removeBtn: {
    width: 26, height: 26, flexShrink: 0, borderRadius: '50%', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'var(--bt-pebble)', border: '1px solid var(--bt-stone)', color: 'var(--bt-graphite)',
    transition: 'all var(--bt-duration-fast) var(--bt-ease)',
  },
};

function CCPlanResultCard({ plan, totalCost, deductible, onRemove }) {
  const breakdown = computeBreakdown({ totalCost, gm: { enabled: false }, plan, deductible });
  const [showDetails, setShowDetails] = useStateChart(false);

  const charge   = totalCost;
  const ded      = breakdown.ded;   // deductible — customer pays first
  const overCap  = breakdown.oop;   // above per-surgery limit — not covered
  const covered  = breakdown.vhis;  // VHIS net payout
  const youPay   = breakdown.customerPays;
  const zero     = covered === 0;
  const capLabel = `Plan limit ${fmtHKShort(plan.perSurgery)} per surgery`;

  // Itemised composition of the VHIS-covered amount (kept from prior coverage details)
  const feeItems = [
    { label: "Surgeon's fee",             amount: Math.round(totalCost * 0.50) },
    { label: "Anaesthetist's fee",        amount: Math.round(totalCost * 0.15) },
    { label: "Operating theatre charges", amount: totalCost - Math.round(totalCost * 0.50) - Math.round(totalCost * 0.15) },
    { label: "SMM coverage",              amount: Math.round(totalCost * 0.20) },
    { label: "Day case cash bonus",       amount: 1500 },
  ];

  return (
    <div style={ccChartStyles.planCard}>
      <div style={ccChartStyles.planHead}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: plan.color, display: 'inline-block' }}></span>
          <span style={ccChartStyles.planTitle}>{plan.en}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ font: '500 11px/1 var(--bt-font)', color: 'var(--bt-graphite)' }}>
            Deductible · <strong style={{ color: 'var(--bt-ink)' }}>{deductible === 0 ? 'None' : fmtHK(deductible)}</strong>
          </div>
          <button
            style={ccChartStyles.removeBtn}
            title="Remove this plan"
            onClick={() => onRemove(plan.id)}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M4 4 L12 12"></path><path d="M12 4 L4 12"></path>
            </svg>
          </button>
        </div>
      </div>

      {(() => {
        const youPaySeg = ded + overCap;
        const segs = [
          { key: 'vhis', value: covered,   color: 'var(--bt-green-day)' },
          { key: 'pay',  value: youPaySeg, color: 'var(--bt-hotel-california)' },
        ].filter(s => s.value > 0);
        return (
          <div style={ccChartStyles.bar}>
            {segs.map(s => {
              const pct = (s.value / charge) * 100;
              return (
                <div key={s.key} style={{ ...ccChartStyles.barSeg(s.color), flex: s.value }} title={`${fmtHK(s.value)} (${pct.toFixed(0)}%)`}>
                  {pct >= 12 ? fmtHKShort(s.value) : ''}
                </div>
              );
            })}
          </div>
        );
      })()}

      <button style={ccChartStyles.detailToggle} onClick={() => setShowDetails(v => !v)} aria-expanded={showDetails}>
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6"
          style={{ transform: showDetails ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform var(--bt-duration-fast) var(--bt-ease)' }}>
          <path d="M4.5 3 L8 6 L4.5 9"></path>
        </svg>
        {showDetails ? 'Hide coverage details' : 'Show coverage details'}
      </button>

      {showDetails && (
        <div style={ccChartStyles.receipt}>
          <div style={ccChartStyles.receiptRow}>
            <span style={ccChartStyles.receiptLabel}>Eligible medical charge</span>
            <span style={ccChartStyles.receiptVal}>{fmtHK(charge)}</span>
          </div>

          {ded > 0 && (
            <div style={{ ...ccChartStyles.receiptRow, ...ccChartStyles.receiptRowBorder }}>
              <span style={ccChartStyles.receiptLabel}>Deductible<span style={ccChartStyles.receiptHint}>You pay this first</span></span>
              <span style={{ ...ccChartStyles.receiptVal, ...ccChartStyles.receiptValNeg }}>−{fmtHK(ded)}</span>
            </div>
          )}

          {overCap > 0 && (
            <div style={{ ...ccChartStyles.receiptRow, ...ccChartStyles.receiptRowBorder }}>
              <span style={ccChartStyles.receiptLabel}>Above plan limit<span style={ccChartStyles.receiptHint}>{capLabel}</span></span>
              <span style={{ ...ccChartStyles.receiptVal, ...ccChartStyles.receiptValNeg }}>−{fmtHK(overCap)}</span>
            </div>
          )}

          <div style={{ ...ccChartStyles.receiptRow, ...ccChartStyles.receiptRowBorder }}>
            <span style={{ ...ccChartStyles.receiptLabel, color: 'var(--bt-green-day)', fontWeight: 700, whiteSpace: 'nowrap' }}>VHIS covers</span>
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
            <span style={ccChartStyles.paysLabel}>Net payout<span style={ccChartStyles.paysSub}>VHIS pays the hospital / you</span></span>
            <span style={ccChartStyles.paysValue(zero)}>{fmtHK(covered)}</span>
          </div>

          <div style={ccChartStyles.youPayRow}>
            <span style={ccChartStyles.youPayLabel}>You pay in total</span>
            <span style={ccChartStyles.youPayVal(youPay === 0)}>{youPay === 0 ? 'HK$0 · fully covered' : fmtHK(youPay)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function CCChartPanel({ caseItem, plans, onRemove }) {
  // Filter out empty slots
  const activePlans = plans.filter(Boolean);

  if (!caseItem) {
    return (
      <div style={{ minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--bt-graphite)' }}>
          <div style={{ font: '700 18px/1.3 var(--bt-font)', color: 'var(--bt-ink)', marginBottom: 6 }}>Pick a real surgery example</div>
          <div style={{ font: '400 13px/1.4 var(--bt-font)' }}>Choose one on the left to see coverage</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="cc-panel-h1">Coverage breakdown</h2>
      <p className="cc-panel-sub">How each plan splits the bill</p>

      <div style={ccChartStyles.legend}>
        <span style={ccChartStyles.legendItem}><span style={ccChartStyles.legendSwatch('var(--bt-hotel-california)')}></span>You pay / not covered</span>
        <span style={ccChartStyles.legendItem}><span style={ccChartStyles.legendSwatch('var(--bt-green-day)')}></span>VHIS reimburses</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 18, padding: '14px 0', borderBottom: '1px solid var(--bt-stone)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ font: '500 11px/1 var(--bt-font)', color: 'var(--bt-graphite)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Treatment</span>
          <span style={{ font: '700 16px/1.2 var(--bt-font)', color: 'var(--bt-ink)' }}>{caseItem.simple || caseItem.en}</span>
          <span style={{ font: '400 12px/1.2 var(--bt-font)', color: 'var(--bt-graphite)' }}>{caseItem.en}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ font: '500 11px/1 var(--bt-font)', color: 'var(--bt-graphite)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Est. medical charge</span>
          <span style={{ font: '700 22px/1 var(--bt-font)', color: 'var(--bt-bowtie-blue)' }}>{fmtHK(caseItem.cost)}</span>
          <span style={{ font: '400 12px/1.2 var(--bt-font)', color: 'var(--bt-graphite)' }}>Medium estimate</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ font: '500 11px/1 var(--bt-font)', color: 'var(--bt-graphite)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Hospital stay</span>
          <span style={{ font: '700 16px/1.2 var(--bt-font)', color: 'var(--bt-ink)' }}>{caseItem.days === 0 ? 'Day case' : `${caseItem.days} ${caseItem.days === 1 ? 'night' : 'nights'}`}</span>
          <span style={{
            display: 'inline-flex', alignItems: 'center', alignSelf: 'flex-start', gap: 5, marginTop: 1,
            font: '700 10px/1 var(--bt-font)', letterSpacing: '0.04em', textTransform: 'uppercase',
            padding: '4px 9px', borderRadius: 'var(--bt-radius-pill)',
            color: caseItem.days === 0 ? 'var(--bt-green-day)' : 'var(--bt-bowtie-blue)',
            background: caseItem.days === 0 ? 'var(--bt-green-day-light)' : 'var(--bt-lilac)'
          }}>{caseItem.days === 0 ? 'Day case' : 'Inpatient'}</span>
        </div>
      </div>

      {activePlans.length === 0 && (
        <div style={{ padding: 36, textAlign: 'center', background: 'var(--bt-pebble)', borderRadius: 'var(--bt-radius-m)', color: 'var(--bt-graphite)' }}>
          <div style={{ font: '700 16px var(--bt-font)', color: 'var(--bt-ink)', marginBottom: 4 }}>Pick VHIS plans</div>
          <div style={{ font: '400 13px var(--bt-font)' }}>Choose plans on the right to compare</div>
        </div>
      )}

      {activePlans.map((p, i) => {
        const planDef = VHIS_PLANS.find(v => v.id === p.id);
        return (
          <CCPlanResultCard
            key={`${p.id}-${i}`}
            plan={planDef}
            totalCost={caseItem.cost}
            deductible={p.deductible}
            onRemove={onRemove}
          />
        );
      })}
    </div>
  );
}

window.CCChartPanel = CCChartPanel;
