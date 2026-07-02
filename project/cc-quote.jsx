// Quote layer for the Claim Comparison tool.
// Premium engine + shared "About you" profile form + quote badges.
// IMPORTANT (per product decision): premium is computed from the PERSON only
// (age / gender / smoking). It is intentionally NOT linked to the deductible —
// deductible stays a claim-side lever in this tool.

const { useState: useStateQuote, useRef: useRefQuote, useEffect: useEffectQuote } = React;

// Reference "today" for birth-year ↔ age conversion.
const CURRENT_YEAR = 2026;
const AGE_MIN = 18, AGE_MAX = 75;

// Indicative base monthly premium per plan @ reference profile (age 30–39, male, non-smoker).
const PLAN_BASE_MONTHLY = {
  'std':         110,
  'flexi-basic': 180,
  'flexi-sup':   320,
  'pink-std':    240,
  'pink-semi':   430,
  'pink-priv':   720,
};

function ageMult(age) {
  if (age < 30) return 0.70;
  if (age < 40) return 1.00;
  if (age < 50) return 1.50;
  if (age < 60) return 2.40;
  if (age < 70) return 3.80;
  return 5.50;
}
function genderMult(g) { return g === 'female' ? 1.08 : 1.00; }
function smokerMult(s) { return s ? 1.25 : 1.00; }

// Returns indicative monthly premium in HK$ (rounded), or null if plan unknown.
function monthlyPremium(planId, profile) {
  const base = PLAN_BASE_MONTHLY[planId];
  if (base == null || !profile) return null;
  const raw = base * ageMult(profile.age) * genderMult(profile.gender) * smokerMult(profile.smoker);
  return Math.round(raw);
}

const fmtMonthly = (n) => (n == null ? '—' : 'HK$' + n.toLocaleString('en-US') + '/mo');

const ageBandLabel = (age) => {
  if (age < 30) return '18–29';
  if (age < 40) return '30–39';
  if (age < 50) return '40–49';
  if (age < 60) return '50–59';
  if (age < 70) return '60–69';
  return '70+';
};

/* ── shared styles ─────────────────────────────────────────────── */
const ccQuote = {
  // tiny inline premium badge used on plan cards
  badge: { display: 'inline-flex', alignItems: 'baseline', gap: 3, font: '700 13px/1 var(--bt-font)', color: 'var(--bt-bowtie-pink)', whiteSpace: 'nowrap' },
  badgePer: { font: '500 10px/1 var(--bt-font)', color: 'var(--bt-rock)' },

  // profile form
  formStack: { display: 'flex', flexDirection: 'column', gap: 18 },
  formRow: { display: 'flex', alignItems: 'flex-end', gap: 22, flexWrap: 'wrap' },
  field: { minWidth: 0 },
  fieldRow: { flex: '0 0 auto' },
  label: { display: 'block', font: '700 11px/1 var(--bt-font)', color: 'var(--bt-graphite)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 },

  // age control
  ageHead: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, marginBottom: 6 },
  ageVal: { font: '700 18px/1 var(--bt-font)', color: 'var(--bt-bowtie-blue)' },
  ageBand: { font: '500 11px/1 var(--bt-font)', color: 'var(--bt-rock)' },

  // summary card (collapsed person line)
  personLine: { display: 'inline-flex', alignItems: 'center', gap: 8, font: '500 13px/1 var(--bt-font)', color: 'var(--bt-graphite)' },

  // — toggles row (gender + smoker) —
  togglesRow: { display: 'flex', gap: 10, marginBottom: 20 },
  toggleCol: { flex: 1, minWidth: 0 },

  // — age row (label + slider + number + cake) —
  ageWrap: { position: 'relative' },
  ageRow: { display: 'flex', alignItems: 'center', gap: 12 },
  ageRowLabel: { font: '700 12px/1 var(--bt-font)', color: 'var(--bt-graphite)', whiteSpace: 'nowrap', flexShrink: 0 },
  ageSliderWrap: { flex: 1, minWidth: 0, display: 'flex', alignItems: 'center' },
  ageNum: {
    width: 62, flexShrink: 0, textAlign: 'center', padding: '10px 6px',
    borderRadius: 'var(--bt-radius-pill)', border: '1.5px solid var(--bt-stone)',
    background: 'var(--bt-white)', font: '700 16px/1 var(--bt-font)', color: 'var(--bt-bowtie-blue)',
    outline: 'none', boxSizing: 'border-box', transition: 'border-color var(--bt-duration-fast) var(--bt-ease)',
    MozAppearance: 'textfield',
  },
  cakeBtn: (open) => ({
    width: 48, height: 44, flexShrink: 0, borderRadius: 'var(--bt-radius-m)',
    border: `1.5px solid ${open ? 'var(--bt-bowtie-pink)' : 'var(--bt-stone)'}`,
    background: open ? 'var(--bt-blush)' : 'var(--bt-white)',
    color: 'var(--bt-bowtie-pink)', cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all var(--bt-duration-fast) var(--bt-ease)',
  }),

  // — birth-year picker popover —
  pop: {
    position: 'absolute', top: 'calc(100% + 12px)', right: 0, zIndex: 30, width: 340,
    background: 'var(--bt-white)', borderRadius: 24,
    boxShadow: 'var(--bt-shadow-3)', border: '1px solid var(--bt-stone)',
    padding: 20, boxSizing: 'border-box',
  },
  popCaret: { position: 'absolute', top: -8, right: 16, width: 16, height: 16, background: 'var(--bt-white)', borderLeft: '1px solid var(--bt-stone)', borderTop: '1px solid var(--bt-stone)', transform: 'rotate(45deg)' },
  popTitle: { font: '700 16px/1.2 var(--bt-font)', color: 'var(--bt-bowtie-blue)', margin: '0 0 14px' },
  popCols: { display: 'flex', gap: 14 },
  popColYear: { flex: '0 0 148px', minWidth: 0 },
  popColMonth: { flex: 1, minWidth: 0 },
  popColLabel: { font: '700 11px/1 var(--bt-font)', color: 'var(--bt-graphite)', letterSpacing: '0.04em', marginBottom: 8, display: 'flex', alignItems: 'baseline', gap: 6 },
  popColLabelHint: { font: '400 11px/1 var(--bt-font)', color: 'var(--bt-rock)' },
  yearInputWrap: (focus) => ({
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
    padding: '10px 10px 10px 12px', borderRadius: 'var(--bt-radius-s)',
    border: `2px solid ${focus ? 'var(--bt-bowtie-pink)' : 'var(--bt-stone)'}`,
    background: 'var(--bt-white)', marginBottom: 8, transition: 'border-color var(--bt-duration-fast) var(--bt-ease)',
  }),
  yearInput: { border: 0, outline: 0, width: 60, font: '700 22px/1 var(--bt-font)', color: 'var(--bt-ink)', background: 'transparent', padding: 0, MozAppearance: 'textfield' },
  yearBadge: { font: '700 12px/1 var(--bt-font)', color: 'var(--bt-white)', background: 'var(--bt-bowtie-pink)', borderRadius: 'var(--bt-radius-pill)', padding: '5px 9px', whiteSpace: 'nowrap', flexShrink: 0 },
  yearList: { maxHeight: 196, overflowY: 'auto' },
  yearRow: (sel) => ({
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
    border: 0, background: sel ? 'var(--bt-blush)' : 'transparent', cursor: 'pointer',
    padding: '9px 10px', borderRadius: 'var(--bt-radius-s)',
    transition: 'background var(--bt-duration-fast) var(--bt-ease)',
  }),
  yearRowYear: (sel) => ({ font: `${sel ? 700 : 500} 18px/1 var(--bt-font)`, color: sel ? 'var(--bt-bowtie-pink)' : 'var(--bt-ink)' }),
  yearRowAge: (sel) => ({ font: '500 14px/1 var(--bt-font)', color: sel ? 'var(--bt-bowtie-pink)' : 'var(--bt-rock)' }),
  monthAny: (sel) => ({
    width: '100%', boxSizing: 'border-box', padding: '11px 10px', marginBottom: 8,
    borderRadius: 'var(--bt-radius-s)', border: 0, cursor: 'pointer',
    font: '700 14px/1 var(--bt-font)',
    background: sel ? 'var(--bt-bowtie-blue)' : 'var(--bt-pebble)',
    color: sel ? 'var(--bt-white)' : 'var(--bt-graphite)',
    transition: 'all var(--bt-duration-fast) var(--bt-ease)',
  }),
  monthGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 },
  monthBtn: (sel) => ({
    padding: '11px 0', borderRadius: 'var(--bt-radius-s)', cursor: 'pointer',
    border: `1.5px solid ${sel ? 'var(--bt-bowtie-pink)' : 'var(--bt-stone)'}`,
    background: sel ? 'var(--bt-blush)' : 'var(--bt-white)',
    color: sel ? 'var(--bt-bowtie-pink)' : 'var(--bt-ink)',
    font: '700 14px/1 var(--bt-font)', transition: 'all var(--bt-duration-fast) var(--bt-ease)',
  }),
  popFooter: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--bt-stone)' },
  popFooterAge: { font: '500 13px/1 var(--bt-font)', color: 'var(--bt-graphite)' },
  popFooterAgeVal: { font: '900 18px/1 var(--bt-font)', color: 'var(--bt-bowtie-pink)', margin: '0 3px' },
  popBtns: { display: 'flex', gap: 8 },
  popCancel: { border: '1.5px solid var(--bt-stone)', background: 'var(--bt-white)', color: 'var(--bt-ink)', font: '700 13px/1 var(--bt-font)', padding: '10px 18px', borderRadius: 'var(--bt-radius-pill)', cursor: 'pointer', transition: 'all var(--bt-duration-fast) var(--bt-ease)' },
  popApply: { border: 0, background: 'var(--bt-bowtie-pink)', color: 'var(--bt-white)', font: '700 13px/1 var(--bt-font)', padding: '10px 22px', borderRadius: 'var(--bt-radius-pill)', cursor: 'pointer', transition: 'all var(--bt-duration-fast) var(--bt-ease)' },
};

// — Birth-year → age picker popover (mirrors Bowtie's claim-calc 出生年份 picker) —
function BirthYearPicker({ age, onApply, onClose }) {
  const yearFromAge = (a) => CURRENT_YEAR - a;
  const [draftYear, setDraftYear] = useStateQuote(yearFromAge(age));
  const [month, setMonth] = useStateQuote(null); // null = "not specified"
  const [yearFocus, setYearFocus] = useStateQuote(true);
  const listRef = useRefQuote(null);
  const selRef = useRefQuote(null);
  const popRef = useRefQuote(null);

  const minYear = yearFromAge(AGE_MAX); // oldest
  const maxYear = yearFromAge(AGE_MIN); // youngest
  const years = [];
  for (let y = maxYear; y >= minYear; y--) years.push(y);
  const draftAge = CURRENT_YEAR - draftYear;

  // scroll selected year into view on open / change
  useEffectQuote(() => {
    if (selRef.current && listRef.current) {
      listRef.current.scrollTop = selRef.current.offsetTop - 8;
    }
  }, [draftYear]);

  // close on outside click / Esc
  useEffectQuote(() => {
    const onDoc = (e) => { if (popRef.current && !popRef.current.contains(e.target)) onClose(); };
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, []);

  const commitYear = (y) => {
    const clamped = Math.min(maxYear, Math.max(minYear, y));
    setDraftYear(clamped);
  };

  return (
    <div style={ccQuote.pop} ref={popRef} role="dialog" aria-label="Select birth year">
      <span style={ccQuote.popCaret}></span>
      <h4 style={ccQuote.popTitle}>Select birth year</h4>
      <div style={ccQuote.popCols}>
        <div style={ccQuote.popColYear}>
          <div style={ccQuote.popColLabel}>Year</div>
          <div style={ccQuote.yearInputWrap(yearFocus)}>
            <input style={ccQuote.yearInput} type="number" value={draftYear}
              onFocus={() => setYearFocus(true)} onBlur={() => setYearFocus(false)}
              onChange={(e) => commitYear(Number(e.target.value))} />
            <span style={ccQuote.yearBadge}>{draftAge} yrs</span>
          </div>
          <div className="cc-scroll" style={ccQuote.yearList} ref={listRef}>
            {years.map((y) => {
              const sel = y === draftYear;
              return (
                <button key={y} ref={sel ? selRef : null} style={ccQuote.yearRow(sel)}
                  onClick={() => setDraftYear(y)}
                  onMouseEnter={(e) => { if (!sel) e.currentTarget.style.background = 'var(--bt-pebble)'; }}
                  onMouseLeave={(e) => { if (!sel) e.currentTarget.style.background = 'transparent'; }}>
                  <span style={ccQuote.yearRowYear(sel)}>{y}</span>
                  <span style={ccQuote.yearRowAge(sel)}>{CURRENT_YEAR - y}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div style={ccQuote.popColMonth}>
          <div style={ccQuote.popColLabel}>Month <span style={ccQuote.popColLabelHint}>optional</span></div>
          <button style={ccQuote.monthAny(month === null)} onClick={() => setMonth(null)}>Not specified</button>
          <div style={ccQuote.monthGrid}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <button key={m} style={ccQuote.monthBtn(month === m)} onClick={() => setMonth(m)}>{m}</button>
            ))}
          </div>
        </div>
      </div>
      <div style={ccQuote.popFooter}>
        <span style={ccQuote.popFooterAge}>Age<span style={ccQuote.popFooterAgeVal}>{draftAge}</span></span>
        <div style={ccQuote.popBtns}>
          <button style={ccQuote.popCancel} onClick={onClose}>Cancel</button>
          <button style={ccQuote.popApply} onClick={() => { onApply(draftAge); onClose(); }}>Apply</button>
        </div>
      </div>
    </div>
  );
}

// The shared "About you" form. layout kept for API compat; both call sites use 'stack'.
function ProfileForm({ profile, onChange }) {
  const [pickerOpen, setPickerOpen] = useStateQuote(false);
  const set = (patch) => onChange({ ...profile, ...patch });
  const setAge = (a) => set({ age: Math.min(AGE_MAX, Math.max(AGE_MIN, a)) });

  return (
    <div>
      {/* gender + smoker toggles */}
      <div style={ccQuote.togglesRow}>
        <div style={ccQuote.toggleCol}>
          <CCSegmented value={profile.gender}
            options={[{ id: 'female', label: 'Female' }, { id: 'male', label: 'Male' }]}
            onChange={(gender) => set({ gender })} />
        </div>
        <div style={ccQuote.toggleCol}>
          <CCSegmented value={profile.smoker ? 'yes' : 'no'}
            options={[{ id: 'no', label: 'Non-smoker' }, { id: 'yes', label: 'Smoker' }]}
            onChange={(v) => set({ smoker: v === 'yes' })} />
        </div>
      </div>

      {/* age: label + slider + number + cake picker */}
      <div style={ccQuote.ageWrap}>
        <div style={ccQuote.ageRow}>
          <span style={ccQuote.ageRowLabel}>Age</span>
          <span style={ccQuote.ageSliderWrap}>
            <input className="cc-range" type="range" min={AGE_MIN} max={AGE_MAX} step="1" value={profile.age}
              onChange={(e) => setAge(Number(e.target.value))} />
          </span>
          <input style={ccQuote.ageNum} type="number" min={AGE_MIN} max={AGE_MAX} value={profile.age}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--bt-bowtie-pink)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--bt-stone)'; }}
            onChange={(e) => setAge(Number(e.target.value))} />
          <button style={ccQuote.cakeBtn(pickerOpen)} onClick={() => setPickerOpen((o) => !o)}
            title="Pick by birth year" aria-label="Pick by birth year" aria-expanded={pickerOpen}>
            {/* Lucide "cake" — substitute for Bowtie's UI icon set */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"></path>
              <path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1"></path>
              <path d="M2 21h20"></path>
              <path d="M7 8v2M12 8v2M17 8v2"></path>
              <path d="M7 4h.01M12 4h.01M17 4h.01"></path>
            </svg>
          </button>
        </div>
        {pickerOpen &&
          <BirthYearPicker age={profile.age} onApply={setAge} onClose={() => setPickerOpen(false)} />}
      </div>
    </div>
  );
}

// One-line human summary of the profile (used in collapsed context chips).
function profileSummary(profile) {
  const g = profile.gender === 'female' ? 'Female' : 'Male';
  return `${profile.age} · ${g} · ${profile.smoker ? 'Smoker' : 'Non-smoker'}`;
}

// Small premium badge for plan cards / ward heads.
function PremiumBadge({ planId, profile, style }) {
  const m = monthlyPremium(planId, profile);
  if (m == null) return null;
  return (
    <span style={{ ...ccQuote.badge, ...style }}>
      HK${m.toLocaleString('en-US')}<span style={ccQuote.badgePer}>/mo</span>
    </span>
  );
}

Object.assign(window, {
  PLAN_BASE_MONTHLY, monthlyPremium, fmtMonthly, ageBandLabel,
  ProfileForm, profileSummary, PremiumBadge, ccQuote,
});
