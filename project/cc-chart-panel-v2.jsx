// Center chart panel v2 — Coverage breakdown with "By case" / "By plan" lenses.
// Exports window.CCChartPanel (overrides the original for the v2 app).
const { useState: useStateChartV2 } = React;

const WARD_LABELS_V2 = { 'standard': 'Standard ward', 'semi-private': 'Semi-private', 'private': 'Private' };

const capLabelShort = (plan) => plan.perSurgery >= 999999 ? 'No cap' : fmtHKShort(plan.perSurgery);

// One representative case per tier (median cost) for the "by plan" coverage curve.
function repCasesByTier() {
  return SURGERY_TIERS.map((t) => {
    const cs = CASES.filter((c) => c.tier === t.id).slice().sort((a, b) => a.cost - b.cost);
    return { tier: t, caseItem: cs[Math.floor(cs.length / 2)] || cs[0] };
  }).filter((x) => x.caseItem);
}
// Default selection for by-plan view: one representative case per tier.
window.repCaseIdsByTier = () => repCasesByTier().map((r) => r.caseItem.en);

const tierIndex = (id) => SURGERY_TIERS.findIndex((t) => t.id === id);
// Resolve + order a set of case ids (by tier, then cost).
function casesFromIds(ids) {
  return CASES.filter((c) => ids.includes(c.en))
    .slice().sort((a, b) => (tierIndex(a.tier) - tierIndex(b.tier)) || (a.cost - b.cost));
}

const ccV2 = {
  // header
  headRow: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' },

  // — "By case / By plan" lens, styled as a 2-row browser chrome —
  browser: { margin: '-24px -24px 20px', borderRadius: '16px 0 0 0', overflow: 'hidden' },
  tabStrip: { display: 'flex', alignItems: 'flex-end', gap: 0, background: 'var(--bt-blush)', padding: '6px 6px 0' },
  tabStrip2: { display: 'flex', alignItems: 'flex-end', gap: 0, background: 'var(--bt-blush)', padding: '6px 6px 0', borderTop: '1px solid rgba(255,0,104,0.10)' },
  groupLabel: (bg) => ({ display: 'inline-flex', alignItems: 'center', gap: 5, alignSelf: 'center', margin: '0 8px 5px 2px', padding: '5px 11px', borderRadius: 'var(--bt-radius-pill)', background: bg, color: 'var(--bt-white)', font: '700 11px/1 var(--bt-font)', letterSpacing: '0.02em', whiteSpace: 'nowrap', flexShrink: 0 }),
  emptyHint: { alignSelf: 'center', marginBottom: 6, padding: '0 4px', font: '500 12px/1 var(--bt-font)', color: 'var(--bt-rock)' },
  bTab: (on) => ({
    position: 'relative', flex: '1 1 0', minWidth: 74, display: 'flex', alignItems: 'center', gap: 7,
    cursor: 'pointer', border: 0, background: on ? 'var(--bt-white)' : 'transparent',
    color: 'var(--bt-bowtie-blue)', font: `${on ? 700 : 500} 13px/1 var(--bt-font)`,
    borderRadius: '9px 9px 0 0', padding: '10px 10px 12px', marginBottom: -1,
    boxShadow: on ? '0 -2px 6px rgba(25,19,87,0.07)' : 'none',
    transition: 'background var(--bt-duration-fast) var(--bt-ease)',
  }),
  bFav: (c) => ({ width: 16, height: 16, borderRadius: 5, background: c, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }),
  bTabLabel: { flex: 1, textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  bTabX: (on) => ({ width: 18, height: 18, borderRadius: '50%', flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: on ? 'var(--bt-graphite)' : 'var(--bt-rock)' }),
  bNewTab: { width: 26, height: 26, marginLeft: 4, marginBottom: 5, borderRadius: 6, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bt-bowtie-blue)', flexShrink: 0, opacity: 0.65 },
  bToolbar: { display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bt-pebble)', padding: '8px 12px' },
  bNavIcons: { display: 'flex', alignItems: 'center', gap: 12, color: 'var(--bt-rock)', flexShrink: 0 },
  bAddr: { flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bt-white)', border: '1px solid var(--bt-stone)', borderRadius: 'var(--bt-radius-pill)', padding: '6px 14px', font: '500 12px/1 var(--bt-font)', color: 'var(--bt-graphite)', minWidth: 0 },
  bAddrText: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 },
  bAddrStrong: { color: 'var(--bt-bowtie-blue)', fontWeight: 700 },

  seg: { display: 'inline-flex', background: 'var(--bt-pebble)', borderRadius: 'var(--bt-radius-pill)', padding: 4, gap: 2, flexShrink: 0 },
  segBtn: (on) => ({
    border: 0, cursor: 'pointer', whiteSpace: 'nowrap',
    font: `${on ? 700 : 500} 13px/1 var(--bt-font)`,
    color: on ? 'var(--bt-white)' : 'var(--bt-graphite)',
    background: on ? 'var(--bt-bowtie-pink)' : 'transparent',
    borderRadius: 'var(--bt-radius-pill)', padding: '8px 16px',
    transition: 'all var(--bt-duration-fast) var(--bt-ease)',
  }),

  // plan selector chips (by-plan mode)
  planChips: { display: 'flex', gap: 8, flexWrap: 'wrap', margin: '4px 0 18px' },
  planChip: (on) => ({
    display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer',
    border: `1.5px solid ${on ? 'var(--bt-bowtie-pink)' : 'var(--bt-stone)'}`,
    background: on ? 'var(--bt-blush)' : 'var(--bt-white)',
    borderRadius: 'var(--bt-radius-pill)', padding: '8px 14px',
    font: `${on ? 700 : 500} 13px/1 var(--bt-font)`,
    color: on ? 'var(--bt-bowtie-pink)' : 'var(--bt-ink)',
    transition: 'all var(--bt-duration-fast) var(--bt-ease)',
  }),
  // removable variant: pill is a wrapper, pick + × are separate hit areas
  chipWrap: (on) => ({
    display: 'inline-flex', alignItems: 'center', overflow: 'hidden',
    border: `1.5px solid ${on ? 'var(--bt-bowtie-pink)' : 'var(--bt-stone)'}`,
    background: on ? 'var(--bt-blush)' : 'var(--bt-white)',
    borderRadius: 'var(--bt-radius-pill)',
    transition: 'all var(--bt-duration-fast) var(--bt-ease)',
  }),
  chipPick: (on) => ({
    display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer',
    border: 0, background: 'transparent', padding: '8px 8px 8px 14px',
    font: `${on ? 700 : 500} 13px/1 var(--bt-font)`,
    color: on ? 'var(--bt-bowtie-pink)' : 'var(--bt-ink)',
  }),
  chipX: (on) => ({
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    border: 0, background: 'transparent', cursor: 'pointer',
    padding: '8px 11px 8px 4px', flexShrink: 0,
    color: on ? 'var(--bt-bowtie-pink)' : 'var(--bt-rock)',
    transition: 'color var(--bt-duration-fast) var(--bt-ease)',
  }),
  dot: (c) => ({ width: 9, height: 9, borderRadius: '50%', background: c, flexShrink: 0 }),

  // summary strip
  strip: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 18, padding: '14px 0', borderBottom: '1px solid var(--bt-stone)' },
  stripCell: { display: 'flex', flexDirection: 'column', gap: 4 },
  stripKicker: { font: '500 11px/1 var(--bt-font)', color: 'var(--bt-graphite)', letterSpacing: '0.04em', textTransform: 'uppercase' },
  stripBig: { font: '700 16px/1.2 var(--bt-font)', color: 'var(--bt-ink)' },
  stripBlue: { font: '700 22px/1 var(--bt-font)', color: 'var(--bt-bowtie-blue)' },
  stripSmall: { font: '400 12px/1.2 var(--bt-font)', color: 'var(--bt-graphite)' },

  // result card
  card: { background: 'var(--bt-white)', border: '1px solid var(--bt-stone)', borderRadius: 'var(--bt-radius-m)', padding: '18px 20px', marginBottom: 12 },

  // by-plan case header
  caseHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 4 },
  tierBadge: (accent) => ({
    display: 'inline-flex', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
    font: '700 10px/1 var(--bt-font)', letterSpacing: '0.04em', textTransform: 'uppercase',
    color: 'var(--bt-graphite)', background: 'var(--bt-pebble)', border: '1px solid var(--bt-stone)',
    padding: '4px 9px', borderRadius: 'var(--bt-radius-pill)', marginBottom: 8,
  }),
  caseName: { font: '700 16px/1.3 var(--bt-font)', color: 'var(--bt-ink)' },
  caseEn: { font: '400 12px/1 var(--bt-font)', color: 'var(--bt-graphite)', marginTop: 2 },
  caseCost: { font: '700 16px/1 var(--bt-font)', color: 'var(--bt-bowtie-blue)', whiteSpace: 'nowrap' },

  // case multi-select
  msBox: { border: '1px solid var(--bt-stone)', borderRadius: 'var(--bt-radius-m)', padding: '14px 16px', margin: '4px 0 18px' },
  msHead: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, marginBottom: 12 },
  msTitle: { font: '700 12px/1 var(--bt-font)', color: 'var(--bt-bowtie-blue)', letterSpacing: '0.02em' },
  msCount: { font: '500 11px/1 var(--bt-font)', color: 'var(--bt-graphite)' },
  msGroup: { marginBottom: 10 },
  msGroupLabel: { display: 'flex', alignItems: 'center', gap: 6, font: '700 10px/1 var(--bt-font)', color: 'var(--bt-graphite)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 7 },
  msChips: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  msChip: (on) => ({
    display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer',
    border: `1.5px solid ${on ? 'var(--bt-bowtie-pink)' : 'var(--bt-stone)'}`,
    background: on ? 'var(--bt-blush)' : 'var(--bt-white)',
    color: on ? 'var(--bt-bowtie-pink)' : 'var(--bt-graphite)',
    borderRadius: 'var(--bt-radius-pill)', padding: '6px 11px',
    font: `${on ? 700 : 500} 12px/1 var(--bt-font)`,
    transition: 'all var(--bt-duration-fast) var(--bt-ease)',
  }),
  msCheck: (on) => ({
    width: 13, height: 13, borderRadius: '50%', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: on ? 'var(--bt-bowtie-pink)' : 'transparent',
    border: on ? 'none' : '1.5px solid var(--bt-rock)',
  }),
};

const ccDetail = {
  // — enhanced treatment header (by-case strip top row) —
  thHead: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 14 },
  thNames: { minWidth: 0 },
  thBadgeRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 },
  thShort: { font: '700 22px/1.15 var(--bt-font)', color: 'var(--bt-ink)', margin: 0 },
  thOfficial: { font: '400 13px/1.4 var(--bt-font)', color: 'var(--bt-graphite)', marginTop: 4 },
  rangeNote: { font: '400 12px/1.3 var(--bt-font)', color: 'var(--bt-graphite)' },

  // — internal-details trigger button —
  intBtn: {
    flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 7, cursor: 'pointer',
    border: '1.5px solid var(--bt-stone)', background: 'var(--bt-white)',
    borderRadius: 'var(--bt-radius-pill)', padding: '8px 14px',
    font: '700 12px/1 var(--bt-font)', color: 'var(--bt-bowtie-blue)',
    transition: 'all var(--bt-duration-fast) var(--bt-ease)',
  },
  intDot: { width: 7, height: 7, borderRadius: '50%', background: 'var(--bt-yellow-submarine)', flexShrink: 0 },
  intBtnSmall: {
    flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer',
    border: '1.5px solid var(--bt-stone)', background: 'var(--bt-white)',
    borderRadius: 'var(--bt-radius-pill)', padding: '5px 11px',
    font: '700 11px/1 var(--bt-font)', color: 'var(--bt-bowtie-blue)',
    transition: 'all var(--bt-duration-fast) var(--bt-ease)',
  },

  // — drawer —
  overlay: (shown) => ({
    position: 'fixed', inset: 0, zIndex: 1000,
    background: shown ? 'rgba(42,46,66,0.32)' : 'rgba(42,46,66,0)',
    display: 'flex', justifyContent: 'flex-end',
    transition: 'background var(--bt-duration-base) var(--bt-ease)',
  }),
  sheet: (shown) => ({
    width: 460, maxWidth: '92vw', height: '100vh', background: 'var(--bt-white)',
    borderRadius: 'var(--bt-radius-l) 0 0 var(--bt-radius-l)', boxShadow: 'var(--bt-shadow-3)',
    display: 'flex', flexDirection: 'column', position: 'relative',
    transform: shown ? 'translateX(0)' : 'translateX(100%)',
    transition: 'transform var(--bt-duration-base) var(--bt-ease)',
  }),
  sheetHead: { padding: '24px 26px 20px', borderBottom: '1px solid var(--bt-stone)', flexShrink: 0 },
  intTag: {
    display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 12,
    font: '700 10px/1 var(--bt-font)', letterSpacing: '0.06em', textTransform: 'uppercase',
    color: 'var(--bt-ink)', background: 'var(--bt-yellow-submarine)',
    padding: '5px 10px', borderRadius: 'var(--bt-radius-pill)',
  },
  sheetTitleRow: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 },
  sheetTitle: { font: '700 24px/1.2 var(--bt-font)', color: 'var(--bt-bowtie-blue)', margin: 0 },
  sheetOfficial: { font: '400 14px/1.4 var(--bt-font)', color: 'var(--bt-graphite)', marginTop: 5 },
  sheetClose: {
    flexShrink: 0, width: 36, height: 36, borderRadius: '50%', border: '1px solid var(--bt-stone)',
    background: 'var(--bt-white)', color: 'var(--bt-graphite)', cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all var(--bt-duration-fast) var(--bt-ease)',
  },
  sheetBody: { padding: '8px 26px 28px', flex: 1, overflowY: 'auto' },
  part: { paddingTop: 22 },
  partLabel: {
    display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 14px',
    font: '700 11px/1 var(--bt-font)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--bt-bowtie-pink)',
  },
  partNum: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    width: 20, height: 20, borderRadius: '50%', background: 'var(--bt-blush)',
    font: '700 11px/1 var(--bt-font)', color: 'var(--bt-bowtie-pink)',
  },
  demoChips: { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  demoChip: { display: 'inline-flex', alignItems: 'center', gap: 7, font: '500 12px/1 var(--bt-font)', color: 'var(--bt-ink)', background: 'var(--bt-pebble)', border: '1px solid var(--bt-stone)', borderRadius: 'var(--bt-radius-pill)', padding: '7px 13px' },
  demoChipKey: { font: '700 10px/1 var(--bt-font)', letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--bt-graphite)' },
  para: { font: '400 14px/1.6 var(--bt-font)', color: 'var(--bt-ink)', margin: 0 },
  opGrid: { display: 'flex', flexDirection: 'column', gap: 14 },
  opBlock: {},
  opKey: { font: '700 12px/1 var(--bt-font)', color: 'var(--bt-bowtie-blue)', marginBottom: 5 },
  opVal: { font: '400 14px/1.55 var(--bt-font)', color: 'var(--bt-ink)', margin: 0 },

  // — hospital reference cards (stacked, drawer-friendly) —
  hospList: { display: 'flex', flexDirection: 'column', gap: 10 },
  hospCard: { border: '1px solid var(--bt-stone)', borderRadius: 'var(--bt-radius-m)', padding: '14px 16px' },
  hospTop: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 12 },
  hospName: { font: '700 14px/1.3 var(--bt-font)', color: 'var(--bt-bowtie-blue)' },
  hospUpdated: { font: '400 11px/1.35 var(--bt-font)', color: 'var(--bt-rock)', marginTop: 4 },
  hospRows: { display: 'flex', flexDirection: 'column', gap: 0 },
  hospRow: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, padding: '7px 0', borderTop: '1px solid var(--bt-pebble)' },
  hospKey: { font: '500 11px/1.3 var(--bt-font)', color: 'var(--bt-graphite)', letterSpacing: '0.02em', flexShrink: 0 },
  hospVal: { font: '600 12.5px/1.4 var(--bt-font)', color: 'var(--bt-ink)', textAlign: 'right' },
  hospValPrice: { font: '700 12.5px/1.3 var(--bt-font)', color: 'var(--bt-ink)', textAlign: 'right', whiteSpace: 'nowrap' },
  riderYes: { display: 'inline-flex', alignItems: 'center', gap: 5, font: '700 11px/1 var(--bt-font)', color: 'var(--bt-green-day)', background: 'var(--bt-green-day-light)', padding: '5px 9px', borderRadius: 'var(--bt-radius-pill)', whiteSpace: 'nowrap' },
  riderNo: { display: 'inline-flex', alignItems: 'center', gap: 5, font: '700 11px/1 var(--bt-font)', color: 'var(--bt-rock)', background: 'var(--bt-stone)', padding: '5px 9px', borderRadius: 'var(--bt-radius-pill)', whiteSpace: 'nowrap' },
};

// Lock glyph for the internal-only marker.
const LockIcon = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="7" width="10" height="7" rx="1.5"></rect>
    <path d="M5 7V5a3 3 0 0 1 6 0v2"></path>
  </svg>
);

// ── Internal-only treatment detail drawer (right-side overlay) ──
function InternalDetailModal({ caseItem, onClose }) {
  const detail = getTreatmentDetail(caseItem.en);
  const [shown, setShown] = useStateChartV2(false);
  React.useEffect(() => {
    const id = setTimeout(() => setShown(true), 20);
    return () => clearTimeout(id);
  }, []);
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  if (!detail) return null;

  const genderLabel = caseItem.gender === 'all' ? 'All genders' : caseItem.gender === 'male' ? 'Male' : 'Female';
  const ageLabel = caseItem.age === 'all' ? 'All ages' : caseItem.age;

  const Part = ({ n, title, children }) => (
    <div style={ccDetail.part}>
      <div style={ccDetail.partLabel}><span style={ccDetail.partNum}>{n}</span>{title}</div>
      {children}
    </div>
  );

  return (
    <div style={ccDetail.overlay(shown)} onClick={onClose} role="dialog" aria-modal="true">
      <div style={ccDetail.sheet(shown)} onClick={(e) => e.stopPropagation()}>
        <div style={ccDetail.sheetHead}>
          <span style={ccDetail.intTag}><LockIcon size={11} />Internal only · not shown to customers</span>
          <div style={ccDetail.sheetTitleRow}>
            <div style={{ minWidth: 0 }}>
              <h2 style={ccDetail.sheetTitle}>{caseItem.simple || caseItem.en}</h2>
              <div style={ccDetail.sheetOfficial}>{detail.official}</div>
            </div>
            <button style={ccDetail.sheetClose} onClick={onClose} title="Close" aria-label="Close"
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--bt-bowtie-pink)'; e.currentTarget.style.color = 'var(--bt-bowtie-pink)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--bt-stone)'; e.currentTarget.style.color = 'var(--bt-graphite)'; }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4l8 8M12 4l-8 8"></path></svg>
            </button>
          </div>
        </div>

        <div style={ccDetail.sheetBody}>
          <Part n="1" title="Who gets this">
            <div style={ccDetail.demoChips}>
              <span style={ccDetail.demoChip}><span style={ccDetail.demoChipKey}>Age group</span>{ageLabel}</span>
              <span style={ccDetail.demoChip}><span style={ccDetail.demoChipKey}>Gender</span>{genderLabel}</span>
            </div>
            <p style={ccDetail.para}>{detail.demographics}</p>
          </Part>

          <Part n="2" title="About the operation">
            <div style={ccDetail.opGrid}>
              <div style={ccDetail.opBlock}>
                <div style={ccDetail.opKey}>Operation purpose</div>
                <p style={ccDetail.opVal}>{detail.purpose}</p>
              </div>
              <div style={ccDetail.opBlock}>
                <div style={ccDetail.opKey}>Operation introduction</div>
                <p style={ccDetail.opVal}>{detail.introduction}</p>
              </div>
              <div style={ccDetail.opBlock}>
                <div style={ccDetail.opKey}>Estimated operation time</div>
                <p style={ccDetail.opVal}>{detail.opTime}</p>
              </div>
            </div>
          </Part>

          <Part n="3" title="Private hospital charge reference">
            <div style={ccDetail.hospList}>
              {detail.hospitals.map((h, i) => (
                <div key={i} style={ccDetail.hospCard}>
                  <div style={ccDetail.hospTop}>
                    <div style={{ minWidth: 0 }}>
                      <div style={ccDetail.hospName}>{h.name}</div>
                      <div style={ccDetail.hospUpdated}>{h.updated}</div>
                    </div>
                    {h.inRider
                      ? <span style={ccDetail.riderYes}><svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 5l2 2 4-5"></path></svg>In rider</span>
                      : <span style={ccDetail.riderNo}>Not in rider</span>}
                  </div>
                  <div style={ccDetail.hospRows}>
                    <div style={ccDetail.hospRow}><span style={ccDetail.hospKey}>Official name</span><span style={ccDetail.hospVal}>{h.official}</span></div>
                    <div style={ccDetail.hospRow}><span style={ccDetail.hospKey}>Day case / inpatient</span><span style={ccDetail.hospVal}>{h.setting}</span></div>
                    <div style={ccDetail.hospRow}><span style={ccDetail.hospKey}>Price (range)</span><span style={ccDetail.hospValPrice}>{h.priceRange}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </Part>
        </div>
      </div>
    </div>
  );
}
window.InternalDetailModal = InternalDetailModal;

// ── Generalised result card: header (JSX) + coverage bar + receipt ──
function ResultCardV2({ plan, totalCost, deductible, header, premium }) {
  const breakdown = computeBreakdown({ totalCost, gm: { enabled: false }, plan, deductible });
  const [showDetails, setShowDetails] = useStateChartV2(false);

  const charge = totalCost;
  const ded = breakdown.ded;
  const overCap = breakdown.oop;
  const covered = breakdown.vhis;
  const youPay = breakdown.customerPays;
  const zero = covered === 0;
  const capLabel = plan.perSurgery >= 999999 ? 'No per-surgery limit' : `Plan limit ${fmtHKShort(plan.perSurgery)} per surgery`;

  const feeItems = [
    { label: "Surgeon's fee", amount: Math.round(totalCost * 0.50) },
    { label: "Anaesthetist's fee", amount: Math.round(totalCost * 0.15) },
    { label: "Operating theatre charges", amount: totalCost - Math.round(totalCost * 0.50) - Math.round(totalCost * 0.15) },
    { label: "SMM coverage", amount: Math.round(totalCost * 0.20) },
    { label: "Day case cash bonus", amount: 1500 },
  ];

  return (
    <div style={ccV2.card}>
      {header}

      {(() => {
        // Bar follows spend order: deductible you pay first → VHIS covers → anything above the plan limit you pay.
        const segs = [
          { key: 'ded',  value: ded,     color: 'var(--bt-yellow-submarine)', label: 'Deductible · you pay first' },
          { key: 'vhis', value: covered, color: 'var(--bt-green-day)',        label: 'VHIS covers' },
          { key: 'oop',  value: overCap, color: 'var(--bt-hotel-california)',  label: 'Above plan limit · you pay' },
        ].filter((s) => s.value > 0);
        return (
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
        );
      })()}

      {premium != null && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12,
          marginTop: 12, paddingTop: 11, borderTop: '1px dashed var(--bt-stone)' }}>
          <span style={{ font: '500 12px/1 var(--bt-font)', color: 'var(--bt-graphite)' }}>Monthly premium</span>
          <span style={window.ccQuote.badge}>HK${premium.toLocaleString('en-US')}<span style={window.ccQuote.badgePer}>/mo</span></span>
        </div>
      )}

      <button style={ccChartStyles.detailToggle} onClick={() => setShowDetails((v) => !v)} aria-expanded={showDetails}>
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

// ── Headers ──
function PlanHeader({ plan, deductible, onRemove }) {
  return (
    <div style={ccChartStyles.planHead}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: plan.color, display: 'inline-block' }}></span>
        <span style={ccChartStyles.planTitle}>{plan.en}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ font: '500 11px/1 var(--bt-font)', color: 'var(--bt-graphite)' }}>
          Deductible · <strong style={{ color: 'var(--bt-ink)' }}>{deductible === 0 ? 'None' : fmtHK(deductible)}</strong>
        </div>
        {onRemove && (
          <button style={ccChartStyles.removeBtn} title="Remove this plan" onClick={() => onRemove(plan.id)}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M4 4 L12 12"></path><path d="M12 4 L4 12"></path>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

function CaseHeader({ tier, caseItem, onOpenDetail }) {
  const detail = getTreatmentDetail(caseItem.en);
  return (
    <div>
      <span style={ccV2.tierBadge(tier.accent)}>
        <span style={ccV2.dot(tier.accent)}></span>{tier.en}
      </span>
      <div style={ccV2.caseHead}>
        <div style={{ minWidth: 0 }}>
          <div style={ccV2.caseName}>{caseItem.simple || caseItem.en}</div>
          <div style={ccV2.caseEn}>{(detail && detail.official) || caseItem.en} · {caseItem.days === 0 ? 'Day case' : `${caseItem.days} nights`}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <div style={ccV2.caseCost}>{fmtHK(caseItem.cost)}</div>
          {onOpenDetail && (
            <button style={ccDetail.intBtnSmall} onClick={onOpenDetail} title="Internal treatment details"
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--bt-bowtie-pink)'; e.currentTarget.style.color = 'var(--bt-bowtie-pink)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--bt-stone)'; e.currentTarget.style.color = 'var(--bt-bowtie-blue)'; }}>
              <LockIcon size={11} />Internal<span style={ccDetail.intDot}></span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Enhanced treatment header (by-case mode): identity + key public stats + internal trigger ──
function TreatmentHeader({ focusCase, onOpenDetail }) {
  const tier = SURGERY_TIERS.find((t) => t.id === focusCase.tier) || {};
  const detail = getTreatmentDetail(focusCase.en);
  const dayCase = focusCase.days === 0;
  return (
    <div style={{ marginBottom: 18, paddingBottom: 18, borderBottom: '1px solid var(--bt-stone)' }}>
      <div style={ccDetail.thHead}>
        <div style={ccDetail.thNames}>
          <h3 style={ccDetail.thShort}>{focusCase.simple || focusCase.en}</h3>
          <div style={ccDetail.thOfficial}>{(detail && detail.official) || focusCase.en}</div>
          <div style={{ ...ccDetail.thBadgeRow, marginTop: 10, marginBottom: 0 }}>
            <span style={ccV2.tierBadge(tier.accent)}><span style={ccV2.dot(tier.accent)}></span>{tier.en} surgery</span>
          </div>
        </div>
        <button style={ccDetail.intBtn} onClick={onOpenDetail} title="Internal-only treatment details"
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--bt-bowtie-pink)'; e.currentTarget.style.color = 'var(--bt-bowtie-pink)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--bt-stone)'; e.currentTarget.style.color = 'var(--bt-bowtie-blue)'; }}>
          <LockIcon size={12} />Internal details<span style={ccDetail.intDot}></span>
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={ccV2.stripCell}>
          <span style={ccV2.stripKicker}>Est. medical charge</span>
          <span style={ccV2.stripBlue}>{fmtHK(focusCase.cost)}</span>
          <span style={ccDetail.rangeNote}>Medium estimate · {tier.en} range {tier.rangeLabel}</span>
        </div>
        <div style={ccV2.stripCell}>
          <span style={ccV2.stripKicker}>Usual hospital stay</span>
          <span style={ccV2.stripBig}>{dayCase ? 'Day case' : `${focusCase.days} ${focusCase.days === 1 ? 'night' : 'nights'}`}</span>
          <span style={{
            display: 'inline-flex', alignItems: 'center', alignSelf: 'flex-start', gap: 5, marginTop: 1,
            font: '700 10px/1 var(--bt-font)', letterSpacing: '0.04em', textTransform: 'uppercase',
            padding: '4px 9px', borderRadius: 'var(--bt-radius-pill)',
            color: dayCase ? 'var(--bt-green-day)' : 'var(--bt-bowtie-blue)',
            background: dayCase ? 'var(--bt-green-day-light)' : 'var(--bt-lilac)',
          }}>{dayCase ? 'No overnight' : 'Inpatient'}</span>
        </div>
      </div>
    </div>
  );
}

// ── Empty / prompt states ──
function PromptBox({ title, sub }) {
  return (
    <div style={{ padding: 36, textAlign: 'center', background: 'var(--bt-pebble)', borderRadius: 'var(--bt-radius-m)', color: 'var(--bt-graphite)' }}>
      <div style={{ font: '700 16px var(--bt-font)', color: 'var(--bt-ink)', marginBottom: 4 }}>{title}</div>
      <div style={{ font: '400 13px var(--bt-font)' }}>{sub}</div>
    </div>
  );
}

function Legend({ showDeductible } = {}) {
  return (
    <div style={ccChartStyles.legend}>
      {showDeductible && (
        <span style={ccChartStyles.legendItem}><span style={ccChartStyles.legendSwatch('var(--bt-yellow-submarine)')}></span>Deductible · you pay first</span>
      )}
      <span style={ccChartStyles.legendItem}><span style={ccChartStyles.legendSwatch('var(--bt-green-day)')}></span>VHIS reimburses</span>
      <span style={ccChartStyles.legendItem}><span style={ccChartStyles.legendSwatch('var(--bt-hotel-california)')}></span>Above plan limit · you pay</span>
    </div>
  );
}

// ── Case multi-select (by-plan mode) — tier-grouped toggle chips ──
function CaseMultiSelect({ selectedIds, onToggle }) {
  return (
    <div style={ccV2.msBox}>
      <div style={ccV2.msHead}>
        <span style={ccV2.msTitle}>Cases to compare</span>
        <span style={ccV2.msCount}>{selectedIds.length} selected</span>
      </div>
      {SURGERY_TIERS.map((t) => {
        const cs = CASES.filter((c) => c.tier === t.id);
        return (
          <div key={t.id} style={ccV2.msGroup}>
            <div style={ccV2.msGroupLabel}><span style={ccV2.dot(t.accent)}></span>{t.en}</div>
            <div style={ccV2.msChips}>
              {cs.map((c) => {
                const on = selectedIds.includes(c.en);
                return (
                  <button key={c.en} style={ccV2.msChip(on)} onClick={() => onToggle(c.en)}>
                    <span style={ccV2.msCheck(on)}>
                      {on && (
                        <svg width="8" height="8" viewBox="0 0 10 10" fill="none" stroke="var(--bt-white)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2 5 L4 7 L8 3"></path>
                        </svg>
                      )}
                    </span>
                    {c.simple || c.en}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Secondary-axis chip selectors ──
function ChipX({ on, label, onClick }) {
  return (
    <button style={ccV2.chipX(on)} title={label} aria-label={label}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--bt-dragon-fruit)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = on ? 'var(--bt-bowtie-pink)' : 'var(--bt-rock)'; }}>
      <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
        <path d="M4 4 L12 12"></path><path d="M12 4 L4 12"></path>
      </svg>
    </button>
  );
}

function CaseChips({ cases, focusId, onPick, onRemove }) {
  return (
    <div style={ccV2.planChips}>
      {cases.map((c) => {
        const tier = SURGERY_TIERS.find((t) => t.id === c.tier);
        const on = c.en === focusId;
        return (
          <div key={c.en} style={ccV2.chipWrap(on)}>
            <button style={ccV2.chipPick(on)} onClick={() => onPick(c.en)}>
              <span style={ccV2.dot(tier ? tier.accent : 'var(--bt-graphite)')}></span>{c.simple || c.en}
            </button>
            {onRemove && <ChipX on={on} label={`Remove ${c.simple || c.en}`} onClick={() => onRemove(c.en)} />}
          </div>
        );
      })}
    </div>
  );
}

function PlanChips({ plans, focusId, onPick, onRemove }) {
  return (
    <div style={ccV2.planChips}>
      {plans.map((p) => {
        const def = VHIS_PLANS.find((v) => v.id === p.id);
        const on = p.id === focusId;
        return (
          <div key={p.id} style={ccV2.chipWrap(on)}>
            <button style={ccV2.chipPick(on)} onClick={() => onPick(p.id)}>
              <span style={ccV2.dot(def.color)}></span>{def.en}
            </button>
            {onRemove && <ChipX on={on} label={`Remove ${def.en}`} onClick={() => onRemove(p.id)} />}
          </div>
        );
      })}
    </div>
  );
}

// ── Coverage lens bar: two rows of browser tabs (Cases / Plans) ──
// Sits ABOVE the whole combined panel; controls cv.mode + focus selection.
function CoverageTabsBar({ plans, cv, onRemove, onRemoveCase }) {
  const mode = cv.mode;
  const setMode = cv.setMode;
  const activePlans = plans.filter(Boolean);
  const chosenCases = casesFromIds(cv.selectedCaseIds);
  const resolvedCaseId = (chosenCases.find((c) => c.en === cv.focusCaseId) || chosenCases[0] || {}).en;
  const resolvedPlanId = (activePlans.find((p) => p.id === cv.focusPlanId) || activePlans[0] || {}).id;
  const caseIcon = <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="var(--bt-white)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1.5 3.5a1 1 0 0 1 1-1h2l1 1.2h3.5a1 1 0 0 1 1 1v3.8a1 1 0 0 1-1 1h-6.5a1 1 0 0 1-1-1z"></path></svg>;
  const planIcon = <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="var(--bt-white)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="1.5" width="8" height="9" rx="1.5"></rect><path d="M4 4.5h4M4 6.5h4M4 8.5h2.5"></path></svg>;
  const TabBtn = ({ favColor, icon, label, on, onClick, onClose }) => (
    <button style={ccV2.bTab(on)} onClick={onClick} role="tab" aria-selected={on}
      onMouseEnter={(e) => { if (!on) e.currentTarget.style.background = 'rgba(255,255,255,0.55)'; }}
      onMouseLeave={(e) => { if (!on) e.currentTarget.style.background = 'transparent'; }}>
      <span style={ccV2.bFav(favColor)}>{icon}</span>
      <span style={ccV2.bTabLabel}>{label}</span>
      <span style={ccV2.bTabX(on)} role="button" title="Remove from comparison"
        onClick={(e) => { e.stopPropagation(); onClose(); }}>
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 3l6 6M9 3l-6 6"></path></svg>
      </span>
    </button>
  );
  return (
    <div>
      <div style={ccV2.tabStrip} role="tablist">
        <span style={ccV2.groupLabel('var(--bt-bowtie-pink)')}>Cases</span>
        {chosenCases.length === 0
          ? <span style={ccV2.emptyHint}>Pick surgeries in the Case tab →</span>
          : chosenCases.map((c) => (
              <TabBtn key={c.en} favColor="var(--bt-bowtie-pink)" icon={caseIcon}
                label={c.simple || c.en}
                on={mode === 'case' && c.en === resolvedCaseId}
                onClick={() => { setMode('case'); cv.setFocusCaseId(c.en); }}
                onClose={() => onRemoveCase(c.en)} />
            ))}
      </div>
      <div style={ccV2.tabStrip2} role="tablist">
        <span style={ccV2.groupLabel('var(--bt-bowtie-blue)')}>Plans</span>
        {activePlans.length === 0
          ? <span style={ccV2.emptyHint}>Pick plans in the Plan tab →</span>
          : activePlans.map((p) => {
              const def = VHIS_PLANS.find((v) => v.id === p.id);
              return (
                <TabBtn key={p.id} favColor="var(--bt-bowtie-blue)" icon={planIcon}
                  label={def ? def.en : p.id}
                  on={mode === 'plan' && p.id === resolvedPlanId}
                  onClick={() => { setMode('plan'); cv.setFocusPlanId(p.id); }}
                  onClose={() => onRemove(p.id)} />
              );
            })}
      </div>
    </div>
  );
}
window.CoverageTabsBar = CoverageTabsBar;

// ── Main panel ──
function CCChartPanel({ plans, onRemove, onRemoveCase, cv, quoteCtx }) {
  const mode = cv.mode;
  const setMode = cv.setMode;
  const showPrem = quoteCtx && quoteCtx.show;
  const premOf = (id) => (showPrem ? window.monthlyPremium(id, quoteCtx.profile) : null);
  const activePlans = plans.filter(Boolean);
  const chosenCases = casesFromIds(cv.selectedCaseIds);
  const [detailCase, setDetailCase] = useStateChartV2(null);
  const modal = detailCase && <InternalDetailModal caseItem={detailCase} onClose={() => setDetailCase(null)} />;

  const Header = ({ children }) => (
    <div>
      <h2 className="cc-panel-h1" style={{ marginBottom: 4 }}>Coverage breakdown</h2>
      <p className="cc-panel-sub" style={{ margin: 0 }}>{children}</p>
    </div>
  );

  /* ── BY CASE: one case (chip-picked) × all plans ── */
  if (mode === 'case') {
    const focusCase = chosenCases.find((c) => c.en === cv.focusCaseId) || chosenCases[0];
    if (!focusCase) {
      return (
        <div>
          <Header>How each plan splits the bill</Header>
          <div style={{ marginTop: 18 }}><PromptBox title="Pick cases to compare" sub="Choose surgeries in the Case tab on the left" /></div>
        </div>
      );
    }
    return (
      <div>
        <Header>How each plan splits the bill</Header>
        <TreatmentHeader focusCase={focusCase} onOpenDetail={() => setDetailCase(focusCase)} />
        <Legend showDeductible={activePlans.some((p) => p.deductible > 0)} />

        {activePlans.length === 0 && <PromptBox title="Pick VHIS plans" sub="Choose plans in the Plan tab on the left" />}
        {activePlans.map((p, i) => {
          const planDef = VHIS_PLANS.find((v) => v.id === p.id);
          return (
            <ResultCardV2 key={`${p.id}-${i}`} plan={planDef} totalCost={focusCase.cost} deductible={p.deductible}
              premium={premOf(p.id)}
              header={<PlanHeader plan={planDef} deductible={p.deductible} onRemove={onRemove} />} />
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
      <Header>{focusDef ? `How ${focusDef.en} holds up across surgeries` : 'How one plan holds up across surgeries'}</Header>

      {activePlans.length === 0 && (
        <div style={{ marginTop: 18 }}><PromptBox title="Pick VHIS plans" sub="Choose plans in the Plan tab on the left" /></div>
      )}

      {activePlans.length > 0 && focusDef && (
        <>
          <Legend showDeductible={focus.deductible > 0} />

          <div style={ccV2.strip}>
            <div style={ccV2.stripCell}>
              <span style={ccV2.stripKicker}>Plan</span>
              <span style={ccV2.stripBig}>{focusDef.en}</span>
              <span style={ccV2.stripSmall}>Deductible {focus.deductible === 0 ? 'none' : fmtHK(focus.deductible)}{showPrem && premOf(focus.id) != null ? ` · HK$${premOf(focus.id).toLocaleString('en-US')}/mo` : ''}</span>
            </div>
            <div style={ccV2.stripCell}>
              <span style={ccV2.stripKicker}>Per-surgery limit</span>
              <span style={ccV2.stripBlue}>{capLabelShort(focusDef)}</span>
              <span style={ccV2.stripSmall}>Caps each claim</span>
            </div>
            <div style={ccV2.stripCell}>
              <span style={ccV2.stripKicker}>Ward class</span>
              <span style={ccV2.stripBig}>{WARD_LABELS_V2[focusDef.ward] || focusDef.ward}</span>
              <span style={ccV2.stripSmall}>Annual {fmtHKShort(focusDef.annual)}</span>
            </div>
          </div>

          {chosenCases.length === 0 && <PromptBox title="Pick cases to compare" sub="Choose surgeries in the Case tab on the left" />}
          {chosenCases.map((c) => {
            const tier = SURGERY_TIERS.find((t) => t.id === c.tier);
            return (
              <ResultCardV2 key={c.en} plan={focusDef} totalCost={c.cost} deductible={focus.deductible}
                header={<CaseHeader tier={tier} caseItem={c} onOpenDetail={() => setDetailCase(c)} />} />
            );
          })}
        </>
      )}
      {modal}
    </div>
  );
}

window.CCChartPanel = CCChartPanel;
