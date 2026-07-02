// Left input panel — case picker, GM config, VHIS plan picker
const { useState, useMemo } = React;

const ccInputStyles = {
  // Surgery tier card
  tierGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 },
  tierCard: (active) => ({
    background: active ? 'var(--bt-blush)' : 'var(--bt-white)',
    border: `1.5px solid ${active ? 'var(--bt-bowtie-pink)' : 'var(--bt-stone)'}`,
    borderRadius: 'var(--bt-radius-m)',
    padding: '10px 12px',
    cursor: 'pointer',
    transition: 'all var(--bt-duration-fast) var(--bt-ease)',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    gap: 2
  }),
  tierDot: (color) => ({ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block', marginRight: 6, verticalAlign: 'middle' }),
  tierName: { font: '700 14px/1.2 var(--bt-font)', color: 'var(--bt-ink)' },
  tierRange: { font: '500 11px/1 var(--bt-font)', color: 'var(--bt-graphite)', letterSpacing: '0.02em' },

  // Filters
  filterRow: { display: 'flex', gap: 8, marginBottom: 12 },
  filterGroup: { display: 'flex', gap: 4, flex: 1 },

  // Case list
  caseList: { display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 280, paddingRight: 4 },
  caseCard: (active) => ({
    background: active ? 'var(--bt-blush)' : 'var(--bt-white)',
    border: `1.5px solid ${active ? 'var(--bt-bowtie-pink)' : 'var(--bt-stone)'}`,
    borderRadius: 'var(--bt-radius-m)',
    padding: '12px 14px',
    cursor: 'pointer',
    transition: 'all var(--bt-duration-fast) var(--bt-ease)'
  }),
  caseHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 },
  caseTitle: { font: '700 14px/1.3 var(--bt-font)', color: 'var(--bt-ink)' },
  casePrice: { font: '700 14px/1 var(--bt-font)', color: 'var(--bt-bowtie-blue)', whiteSpace: 'nowrap' },
  caseTags: { display: 'flex', gap: 4, marginTop: 6 },

  // GM panel
  gmHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, gap: 12 },
  gmLabel: { font: '700 14px/1.3 var(--bt-font)', color: 'var(--bt-ink)' },
  gmGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }
};

function CCSegmented({ value, options, onChange }) {
  return (
    <div className="cc-seg" style={{ width: 'auto' }}>
      {options.map((opt) =>
      <button key={opt.id} className={opt.id === value ? 'on' : ''} onClick={() => onChange(opt.id)}>{opt.label}</button>
      )}
    </div>);

}

function CCSurgeryTiers({ value, onChange }) {
  return (
    <div style={ccInputStyles.tierGrid}>
      {SURGERY_TIERS.map((t) =>
      <button key={t.id} style={ccInputStyles.tierCard(value === t.id)} onClick={() => onChange(t.id)}>
          <span style={ccInputStyles.tierName}>
            <span style={ccInputStyles.tierDot(t.accent)}></span>
            {t.en}
          </span>
          <span style={ccInputStyles.tierRange}>{t.rangeLabel}</span>
        </button>
      )}
    </div>);

}

function CCCaseList({ tier, gender, age, value, onChange }) {
  const filtered = useMemo(() => CASES.filter((c) => {
    if (c.tier !== tier) return false;
    if (gender !== 'all' && c.gender !== 'all' && c.gender !== gender) return false;
    if (age !== 'all' && c.age !== 'all' && c.age !== age) return false;
    return true;
  }), [tier, gender, age]);

  const genderLabel = (g) => g === 'male' ? 'Male' : g === 'female' ? 'Female' : 'Any';
  const ageLabel = (a) => a === 'all' ? 'Any age' : a;

  return (
    <div className="cc-scroll" style={ccInputStyles.caseList}>
      {filtered.length === 0 &&
      <div style={{ padding: 24, textAlign: 'center', color: 'var(--bt-graphite)', font: '400 13px var(--bt-font)' }}>
          No matching cases
        </div>
      }
      {filtered.map((c) => {
        const isActive = value && value.en === c.en;
        return (
          <button key={c.en} style={{ ...ccInputStyles.caseCard(isActive), border: 'none', borderRadius: 'var(--bt-radius-m)', boxShadow: isActive ? 'inset 0 0 0 1.5px var(--bt-bowtie-pink)' : 'inset 0 0 0 1.5px var(--bt-stone)', textAlign: 'left' }} onClick={() => onChange(c)}>
            <div style={ccInputStyles.caseHead}>
              <div style={ccInputStyles.caseTitle}>{c.en}</div>
              <div style={ccInputStyles.casePrice}>{fmtHK(c.cost)}</div>
            </div>
            <div style={ccInputStyles.caseTags}>
              <span className="cc-chip">{genderLabel(c.gender)}</span>
              <span className="cc-chip">{ageLabel(c.age)}</span>
            </div>
          </button>);

      })}
    </div>);

}

const ccPlanStyles = {
  group: { marginBottom: 18 },
  groupTitle: { display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 },
  groupName: { font: '700 13px/1 var(--bt-font)', color: 'var(--bt-bowtie-pink)', letterSpacing: '0.04em' },
  groupHint: { font: '400 11px/1.3 var(--bt-font)', color: 'var(--bt-graphite)', marginLeft: 'auto', textAlign: 'right' },

  // Plan card (added via +)
  card: (sel, disabled) => ({
    display: 'flex', alignItems: 'center', gap: 12,
    background: sel ? 'var(--bt-blush)' : 'var(--bt-white)',
    border: `1.5px solid ${sel ? 'var(--bt-bowtie-pink)' : 'var(--bt-stone)'}`,
    borderRadius: 'var(--bt-radius-m)',
    padding: '12px 14px', marginBottom: 8,
    opacity: disabled ? 0.45 : 1,
    transition: 'all var(--bt-duration-fast) var(--bt-ease)',
  }),
  cardBody: { flex: 1, minWidth: 0 },
  cardName: { font: '700 14px/1.3 var(--bt-font)', color: 'var(--bt-ink)' },
  addBtn: (sel, disabled) => ({
    width: 34, height: 34, flexShrink: 0, borderRadius: '50%', border: 'none',
    cursor: disabled ? 'default' : 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: sel ? 'var(--bt-white)' : 'var(--bt-bowtie-pink)',
    color: sel ? 'var(--bt-bowtie-pink)' : 'var(--bt-white)',
    boxShadow: sel ? 'inset 0 0 0 2px var(--bt-bowtie-pink)' : 'none',
    transition: 'all var(--bt-duration-fast) var(--bt-ease)',
  }),
  dedPills: { display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' },
  dedPill: (on) => ({
    border: 'none', cursor: 'pointer',
    font: `${on ? 700 : 500} 11px/1 var(--bt-font)`,
    padding: '6px 11px', borderRadius: 'var(--bt-radius-pill)',
    background: on ? 'var(--bt-bowtie-pink)' : 'var(--bt-white)',
    color: on ? 'var(--bt-white)' : 'var(--bt-graphite)',
    boxShadow: on ? 'none' : 'inset 0 0 0 1px var(--bt-stone)',
  }),

  // Pink matrix
  matrix: { border: '1px solid var(--bt-stone)', borderRadius: 'var(--bt-radius-m)', overflow: 'hidden' },
  matrixHead: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, padding: '12px 14px 10px', flexWrap: 'wrap' },
  matrixTitle: { font: '700 14px/1 var(--bt-font)', color: 'var(--bt-bowtie-blue)' },
  matrixHint: { font: '400 11px/1.2 var(--bt-font)', color: 'var(--bt-graphite)' },
  grid: (cols) => ({ display: 'grid', gridTemplateColumns: `1.25fr repeat(${cols}, 1fr)`, gap: 1, background: 'var(--bt-stone)' }),
  corner: { background: 'var(--bt-pebble)' },
  colHead: { background: 'var(--bt-pebble)', font: '700 12px/1 var(--bt-font)', color: 'var(--bt-bowtie-blue)', textAlign: 'center', padding: '12px 4px' },
  wardHead: { background: 'var(--bt-white)', font: '700 13px/1.2 var(--bt-font)', color: 'var(--bt-bowtie-blue)', display: 'flex', alignItems: 'center', padding: '12px 12px' },
  cell: (sel, disabled) => ({
    border: 'none', cursor: disabled ? 'default' : 'pointer',
    background: sel ? 'var(--bt-bowtie-pink)' : 'var(--bt-white)',
    color: sel ? 'var(--bt-white)' : (disabled ? 'var(--bt-rock)' : 'var(--bt-bowtie-blue)'),
    font: '700 13px/1 var(--bt-font)', textAlign: 'center', padding: '14px 4px',
    transition: 'background var(--bt-duration-fast) var(--bt-ease), color var(--bt-duration-fast) var(--bt-ease)',
  }),
};

const WARD_LABELS = { 'standard': 'Standard ward', 'semi-private': 'Semi-private', 'private': 'Private' };
const dedColLabel = (d) => (d === 0 ? '$0' : '$' + Math.round(d / 1000) + 'K');

function CCPlanPicker({ selected, onAdd, onRemove, onSetDeductible, onSelectPink, quoteCtx }) {
  const showQuote = quoteCtx && quoteCtx.show;
  const Premium = window.PremiumBadge;
  const listPlans = VHIS_PLANS.filter(p => !p.id.startsWith('pink'));
  const pinkPlans = VHIS_PLANS.filter(p => p.id.startsWith('pink'));
  const pinkDeductibles = pinkPlans[0] ? pinkPlans[0].deductibles : [];
  const findSel = (id) => selected.find(s => s.id === id);

  return (
    <div>
      {/* — Standalone plans — */}
      <div style={ccPlanStyles.group}>
        {listPlans.map(plan => {
          const sel = findSel(plan.id);
          const isSel = !!sel;
          return (
            <div key={plan.id} style={ccPlanStyles.card(isSel, false)}>
              <div style={ccPlanStyles.cardBody}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                  <span style={ccPlanStyles.cardName}>{plan.en}</span>
                  {showQuote && Premium && <Premium planId={plan.id} profile={quoteCtx.profile} />}
                </div>
                {isSel && plan.deductibles.length > 1 && (
                  <div style={ccPlanStyles.dedPills}>
                    {plan.deductibles.map(d => (
                      <button key={d} style={ccPlanStyles.dedPill(sel.deductible === d)} onClick={() => onSetDeductible(plan.id, d)}>
                        {d === 0 ? 'No deduct.' : 'Deduct ' + dedColLabel(d)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                style={ccPlanStyles.addBtn(isSel, false)}
                title={isSel ? 'Remove' : 'Add to compare'}
                onClick={() => (isSel ? onRemove(plan.id) : onAdd(plan.id, plan.deductibles[0]))}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                  {isSel
                    ? <path d="M3.5 8.5 L6.5 11.5 L12.5 4.5"></path>
                    : <><path d="M8 3.5 L8 12.5"></path><path d="M3.5 8 L12.5 8"></path></>}
                </svg>
              </button>
            </div>
          );
        })}
      </div>

      {/* — Pink plan matrix — */}
      <div style={ccPlanStyles.matrix}>
        <div style={ccPlanStyles.matrixHead}>
          <span style={ccPlanStyles.matrixTitle}>Pink plan</span>
          <span style={ccPlanStyles.matrixHint}>Tap ward × deductible to compare</span>
        </div>
        <div style={ccPlanStyles.grid(pinkDeductibles.length)}>
          <div style={ccPlanStyles.corner}></div>
          {pinkDeductibles.map(d => (
            <div key={'h' + d} style={ccPlanStyles.colHead}>{dedColLabel(d)}</div>
          ))}
          {pinkPlans.map(plan => {
            const sel = findSel(plan.id);
            return (
              <React.Fragment key={plan.id}>
                <div style={{ ...ccPlanStyles.wardHead, flexDirection: 'column', alignItems: 'flex-start', gap: 3, justifyContent: 'center' }}>
                  <span>{WARD_LABELS[plan.ward] || plan.en}</span>
                  {showQuote && Premium && <Premium planId={plan.id} profile={quoteCtx.profile} style={{ font: '700 11px/1 var(--bt-font)' }} />}
                </div>
                {pinkDeductibles.map(d => {
                  const isSel = sel && sel.deductible === d;
                  return (
                    <button
                      key={plan.id + d}
                      style={ccPlanStyles.cell(isSel, false)}
                      title={`${WARD_LABELS[plan.ward]} · ${dedColLabel(d)}`}
                      onClick={() => onSelectPink(plan.id, d)}>
                      {dedColLabel(d)}
                    </button>
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CCInputPanel(props) {
  const { tier, setTier, gender, setGender, age, setAge, caseItem, setCase, hideHeader } = props;

  return (
    <div>
      {!hideHeader && <h2 className="cc-panel-h1">Case</h2>}
      {!hideHeader && <p className="cc-panel-sub">Pick a real surgery example to model</p>}

      <div className="cc-section-label"><span className="step-num">STEP 2</span>Surgery tier</div>
      <CCSurgeryTiers value={tier} onChange={setTier} />

      <div className="cc-section-label"><span className="step-num">STEP 3</span>Real example</div>
      <div style={ccInputStyles.filterRow}>
        <div style={ccInputStyles.filterGroup}>
          <CCSegmented
            value={gender}
            options={[{ id: 'all', label: 'Any' }, { id: 'male', label: 'Male' }, { id: 'female', label: 'Female' }]}
            onChange={setGender} />
          
        </div>
        <div style={ccInputStyles.filterGroup}>
          <CCSegmented
            value={age}
            options={[{ id: 'all', label: 'Any' }, { id: '<40', label: '<40' }, { id: '40-59', label: '40–59' }, { id: '60+', label: '60+' }]}
            onChange={setAge} />
          
        </div>
      </div>
      <CCCaseList tier={tier} gender={gender} age={age} value={caseItem} onChange={setCase} />
    </div>);

}

function CCConfigPanel(props) {
  const { plans, onAdd, onRemove, onSetDeductible, onSelectPink, hideHeader, quoteCtx } = props;
  const filledCount = plans.length;
  return (
    <div>
      {!hideHeader && <h2 className="cc-panel-h1">Configure</h2>}
      {!hideHeader && <p className="cc-panel-sub">Add VHIS plans to compare</p>}

      <div className="cc-section-label" style={{ marginTop: 0 }}>VHIS plans <span style={{ color: 'var(--bt-bowtie-pink)' }}>({filledCount} selected)</span></div>
      <CCPlanPicker
        selected={plans}
        onAdd={onAdd} onRemove={onRemove}
        onSetDeductible={onSetDeductible} onSelectPink={onSelectPink}
        quoteCtx={quoteCtx}
      />
    </div>);

}

window.CCInputPanel = CCInputPanel;
window.CCConfigPanel = CCConfigPanel;