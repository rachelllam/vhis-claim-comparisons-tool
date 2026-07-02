import { useState, useRef, useEffect } from 'react';
import type { CSSProperties } from 'react';
import { AGE_MIN, AGE_MAX, CURRENT_YEAR } from '../quote';
import { useLang } from '../i18n';
import type { Profile } from '../types';
import { CCSegmented } from './common';

/* ── styles (ported from cc-quote.jsx ccQuote) ─────────────────── */
const s = {
  togglesRow: { display: 'flex', gap: 10, marginBottom: 20 } as CSSProperties,
  toggleCol: { flex: 1, minWidth: 0 } as CSSProperties,

  ageWrap: { position: 'relative' } as CSSProperties,
  ageRow: { display: 'flex', alignItems: 'center', gap: 12 } as CSSProperties,
  ageRowLabel: { font: '700 12px/1 var(--bt-font)', color: 'var(--bt-graphite)', whiteSpace: 'nowrap', flexShrink: 0 } as CSSProperties,
  ageSliderWrap: { flex: 1, minWidth: 0, display: 'flex', alignItems: 'center' } as CSSProperties,
  ageNum: {
    width: 62, flexShrink: 0, textAlign: 'center', padding: '10px 6px',
    borderRadius: 'var(--bt-radius-pill)', border: '1.5px solid var(--bt-stone)',
    background: 'var(--bt-white)', font: '700 16px/1 var(--bt-font)', color: 'var(--bt-bowtie-blue)',
    outline: 'none', boxSizing: 'border-box', transition: 'border-color var(--bt-duration-fast) var(--bt-ease)',
    MozAppearance: 'textfield',
  } as CSSProperties,
  cakeBtn: (open: boolean): CSSProperties => ({
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
  } as CSSProperties,
  popCaret: { position: 'absolute', top: -8, right: 16, width: 16, height: 16, background: 'var(--bt-white)', borderLeft: '1px solid var(--bt-stone)', borderTop: '1px solid var(--bt-stone)', transform: 'rotate(45deg)' } as CSSProperties,
  popTitle: { font: '700 16px/1.2 var(--bt-font)', color: 'var(--bt-bowtie-blue)', margin: '0 0 14px' } as CSSProperties,
  popCols: { display: 'flex', gap: 14 } as CSSProperties,
  popColYear: { flex: '0 0 148px', minWidth: 0 } as CSSProperties,
  popColMonth: { flex: 1, minWidth: 0 } as CSSProperties,
  popColLabel: { font: '700 11px/1 var(--bt-font)', color: 'var(--bt-graphite)', letterSpacing: '0.04em', marginBottom: 8, display: 'flex', alignItems: 'baseline', gap: 6 } as CSSProperties,
  popColLabelHint: { font: '400 11px/1 var(--bt-font)', color: 'var(--bt-rock)' } as CSSProperties,
  yearInputWrap: (focus: boolean): CSSProperties => ({
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
    padding: '10px 10px 10px 12px', borderRadius: 'var(--bt-radius-s)',
    border: `2px solid ${focus ? 'var(--bt-bowtie-pink)' : 'var(--bt-stone)'}`,
    background: 'var(--bt-white)', marginBottom: 8, transition: 'border-color var(--bt-duration-fast) var(--bt-ease)',
  }),
  yearInput: { border: 0, outline: 0, width: 60, font: '700 22px/1 var(--bt-font)', color: 'var(--bt-ink)', background: 'transparent', padding: 0, MozAppearance: 'textfield' } as CSSProperties,
  yearBadge: { font: '700 12px/1 var(--bt-font)', color: 'var(--bt-white)', background: 'var(--bt-bowtie-pink)', borderRadius: 'var(--bt-radius-pill)', padding: '5px 9px', whiteSpace: 'nowrap', flexShrink: 0 } as CSSProperties,
  yearList: { maxHeight: 196, overflowY: 'auto' } as CSSProperties,
  yearRow: (sel: boolean): CSSProperties => ({
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
    border: 0, background: sel ? 'var(--bt-blush)' : 'transparent', cursor: 'pointer',
    padding: '9px 10px', borderRadius: 'var(--bt-radius-s)',
    transition: 'background var(--bt-duration-fast) var(--bt-ease)',
  }),
  yearRowYear: (sel: boolean): CSSProperties => ({ font: `${sel ? 700 : 500} 18px/1 var(--bt-font)`, color: sel ? 'var(--bt-bowtie-pink)' : 'var(--bt-ink)' }),
  yearRowAge: (sel: boolean): CSSProperties => ({ font: '500 14px/1 var(--bt-font)', color: sel ? 'var(--bt-bowtie-pink)' : 'var(--bt-rock)' }),
  monthAny: (sel: boolean): CSSProperties => ({
    width: '100%', boxSizing: 'border-box', padding: '11px 10px', marginBottom: 8,
    borderRadius: 'var(--bt-radius-s)', border: 0, cursor: 'pointer',
    font: '700 14px/1 var(--bt-font)',
    background: sel ? 'var(--bt-bowtie-blue)' : 'var(--bt-pebble)',
    color: sel ? 'var(--bt-white)' : 'var(--bt-graphite)',
    transition: 'all var(--bt-duration-fast) var(--bt-ease)',
  }),
  monthGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 } as CSSProperties,
  monthBtn: (sel: boolean): CSSProperties => ({
    padding: '11px 0', borderRadius: 'var(--bt-radius-s)', cursor: 'pointer',
    border: `1.5px solid ${sel ? 'var(--bt-bowtie-pink)' : 'var(--bt-stone)'}`,
    background: sel ? 'var(--bt-blush)' : 'var(--bt-white)',
    color: sel ? 'var(--bt-bowtie-pink)' : 'var(--bt-ink)',
    font: '700 14px/1 var(--bt-font)', transition: 'all var(--bt-duration-fast) var(--bt-ease)',
  }),
  popFooter: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--bt-stone)' } as CSSProperties,
  popFooterAge: { font: '500 13px/1 var(--bt-font)', color: 'var(--bt-graphite)' } as CSSProperties,
  popFooterAgeVal: { font: '900 18px/1 var(--bt-font)', color: 'var(--bt-bowtie-pink)', margin: '0 3px' } as CSSProperties,
  popBtns: { display: 'flex', gap: 8 } as CSSProperties,
  popCancel: { border: '1.5px solid var(--bt-stone)', background: 'var(--bt-white)', color: 'var(--bt-ink)', font: '700 13px/1 var(--bt-font)', padding: '10px 18px', borderRadius: 'var(--bt-radius-pill)', cursor: 'pointer', transition: 'all var(--bt-duration-fast) var(--bt-ease)' } as CSSProperties,
  popApply: { border: 0, background: 'var(--bt-bowtie-pink)', color: 'var(--bt-white)', font: '700 13px/1 var(--bt-font)', padding: '10px 22px', borderRadius: 'var(--bt-radius-pill)', cursor: 'pointer', transition: 'all var(--bt-duration-fast) var(--bt-ease)' } as CSSProperties,
};

// — Birth-year → age picker popover (mirrors Bowtie's claim-calc 出生年份 picker) —
function BirthYearPicker({
  age,
  onApply,
  onClose,
}: {
  age: number;
  onApply: (a: number) => void;
  onClose: () => void;
}) {
  const { t } = useLang();
  const yearFromAge = (a: number) => CURRENT_YEAR - a;
  const [draftYear, setDraftYear] = useState(yearFromAge(age));
  const [month, setMonth] = useState<number | null>(null); // null = "not specified"
  const [yearFocus, setYearFocus] = useState(true);
  const listRef = useRef<HTMLDivElement>(null);
  const selRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  const minYear = yearFromAge(AGE_MAX); // oldest
  const maxYear = yearFromAge(AGE_MIN); // youngest
  const years: number[] = [];
  for (let y = maxYear; y >= minYear; y--) years.push(y);
  const draftAge = CURRENT_YEAR - draftYear;

  // scroll selected year into view on open / change
  useEffect(() => {
    if (selRef.current && listRef.current) {
      listRef.current.scrollTop = selRef.current.offsetTop - 8;
    }
  }, [draftYear]);

  // close on outside click / Esc
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (popRef.current && !popRef.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const commitYear = (y: number) => {
    const clamped = Math.min(maxYear, Math.max(minYear, y));
    setDraftYear(clamped);
  };

  return (
    <div style={s.pop} ref={popRef} role="dialog" aria-label={t('profile.selectBirthYear')}>
      <span style={s.popCaret}></span>
      <h4 style={s.popTitle}>{t('profile.selectBirthYear')}</h4>
      <div style={s.popCols}>
        <div style={s.popColYear}>
          <div style={s.popColLabel}>{t('profile.year')}</div>
          <div style={s.yearInputWrap(yearFocus)}>
            <input
              style={s.yearInput}
              type="number"
              value={draftYear}
              onFocus={() => setYearFocus(true)}
              onBlur={() => setYearFocus(false)}
              onChange={(e) => commitYear(Number(e.target.value))}
            />
            <span style={s.yearBadge}>{draftAge} {t('profile.yrs')}</span>
          </div>
          <div className="cc-scroll" style={s.yearList} ref={listRef}>
            {years.map((y) => {
              const sel = y === draftYear;
              return (
                <button
                  key={y}
                  ref={sel ? selRef : null}
                  style={s.yearRow(sel)}
                  onClick={() => setDraftYear(y)}
                  onMouseEnter={(e) => { if (!sel) e.currentTarget.style.background = 'var(--bt-pebble)'; }}
                  onMouseLeave={(e) => { if (!sel) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={s.yearRowYear(sel)}>{y}</span>
                  <span style={s.yearRowAge(sel)}>{CURRENT_YEAR - y}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div style={s.popColMonth}>
          <div style={s.popColLabel}>
            {t('profile.month')} <span style={s.popColLabelHint}>{t('profile.optional')}</span>
          </div>
          <button style={s.monthAny(month === null)} onClick={() => setMonth(null)}>
            {t('profile.notSpecified')}
          </button>
          <div style={s.monthGrid}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <button key={m} style={s.monthBtn(month === m)} onClick={() => setMonth(m)}>
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div style={s.popFooter}>
        <span style={s.popFooterAge}>
          {t('profile.age')}<span style={s.popFooterAgeVal}>{draftAge}</span>
        </span>
        <div style={s.popBtns}>
          <button style={s.popCancel} onClick={onClose}>{t('profile.cancel')}</button>
          <button style={s.popApply} onClick={() => { onApply(draftAge); onClose(); }}>{t('profile.apply')}</button>
        </div>
      </div>
    </div>
  );
}

// The shared "About you" form.
export function ProfileForm({
  profile,
  onChange,
}: {
  profile: Profile;
  onChange: (p: Profile) => void;
}) {
  const { t } = useLang();
  const [pickerOpen, setPickerOpen] = useState(false);
  const set = (patch: Partial<Profile>) => onChange({ ...profile, ...patch });
  const setAge = (a: number) => set({ age: Math.min(AGE_MAX, Math.max(AGE_MIN, a)) });

  return (
    <div>
      {/* gender + smoker toggles */}
      <div style={s.togglesRow}>
        <div style={s.toggleCol}>
          <CCSegmented
            value={profile.gender}
            options={[{ id: 'female', label: t('common.female') }, { id: 'male', label: t('common.male') }]}
            onChange={(gender) => set({ gender: gender as Profile['gender'] })}
          />
        </div>
        <div style={s.toggleCol}>
          <CCSegmented
            value={profile.smoker ? 'yes' : 'no'}
            options={[{ id: 'no', label: t('profile.nonSmoker') }, { id: 'yes', label: t('profile.smoker') }]}
            onChange={(v) => set({ smoker: v === 'yes' })}
          />
        </div>
      </div>

      {/* age: label + slider + number + cake picker */}
      <div style={s.ageWrap}>
        <div style={s.ageRow}>
          <span style={s.ageRowLabel}>{t('profile.age')}</span>
          <span style={s.ageSliderWrap}>
            <input
              className="cc-range"
              type="range"
              min={AGE_MIN}
              max={AGE_MAX}
              step={1}
              value={profile.age}
              onChange={(e) => setAge(Number(e.target.value))}
            />
          </span>
          <input
            style={s.ageNum}
            className="cc-no-spin"
            type="number"
            min={AGE_MIN}
            max={AGE_MAX}
            value={profile.age}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--bt-bowtie-pink)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--bt-stone)'; }}
            onChange={(e) => setAge(Number(e.target.value))}
          />
          <button
            style={s.cakeBtn(pickerOpen)}
            onClick={() => setPickerOpen((o) => !o)}
            title={t('profile.pickByBirthYear')}
            aria-label={t('profile.pickByBirthYear')}
            aria-expanded={pickerOpen}
          >
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
        {pickerOpen && (
          <BirthYearPicker age={profile.age} onApply={setAge} onClose={() => setPickerOpen(false)} />
        )}
      </div>
    </div>
  );
}
