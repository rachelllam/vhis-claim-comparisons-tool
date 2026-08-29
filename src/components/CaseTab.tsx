import { useMemo } from 'react';
import type { CSSProperties } from 'react';
import { SURGERY_TIERS, fmtHK } from '../data';
import type { TierId } from '../data';
import { useOperationData } from '../useOperationData';
import { useLang, pick, pickCaseName } from '../i18n';
import type { CaseFilterProps } from '../types';

// Surgery tier card styles (ported from cc-input-panel.jsx ccInputStyles).
const tierStyles = {
  tierGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 } as CSSProperties,
  tierCard: (active: boolean): CSSProperties => ({
    background: active ? 'var(--bt-blush)' : 'var(--bt-white)',
    border: `1.5px solid ${active ? 'var(--bt-bowtie-pink)' : 'var(--bt-stone)'}`,
    borderRadius: 'var(--bt-radius-m)',
    padding: '10px 12px',
    cursor: 'pointer',
    transition: 'all var(--bt-duration-fast) var(--bt-ease)',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  }),
  tierDot: (color: string): CSSProperties => ({ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block', marginRight: 6, verticalAlign: 'middle' }),
  tierName: { font: '700 14px/1.2 var(--bt-font)', color: 'var(--bt-ink)' } as CSSProperties,
  tierRange: { font: '500 11px/1 var(--bt-font)', color: 'var(--bt-graphite)', letterSpacing: '0.02em' } as CSSProperties,
};

export function CCSurgeryTiers({ value, onChange }: { value: TierId; onChange: (id: TierId) => void }) {
  const { lang } = useLang();
  return (
    <div style={tierStyles.tierGrid}>
      {SURGERY_TIERS.map((tier) => (
        <button key={tier.id} style={tierStyles.tierCard(value === tier.id)} onClick={() => onChange(tier.id)}>
          <span style={tierStyles.tierName}>
            <span style={tierStyles.tierDot(tier.accent)}></span>
            {pick(tier, lang)}
          </span>
          <span style={tierStyles.tierRange}>{tier.rangeLabel}</span>
        </button>
      ))}
    </div>
  );
}

// Age bands shown in the picker (labels per spec). Each maps to the case
// data's coarse age values ('40-59' / '60+'); 'all'-age cases always show.
const AGE_BANDS_V2 = [
  { id: 'bb',      label: 'BB' },
  { id: 'toddler', label: '3-5' },
  { id: 'teen',    label: '5-19' },
  { id: 'youth',   label: '20-40' },
  { id: 'middle',  label: '40-60' },
  { id: 'senior',  label: '65+' },
];
const AGE_BAND_MATCH_V2: Record<string, string[]> = { bb: [], toddler: [], teen: [], youth: [], middle: ['40-59'], senior: ['60+'] };

// Vertical column of selectable chips (one column of the 2-column picker).
function CCChipColumn({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { id: string; label: string }[];
  onChange: (id: string) => void;
}) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {options.map((opt) => {
        const on = opt.id === value;
        return (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            style={{
              textAlign: 'left', cursor: 'pointer', borderRadius: 'var(--bt-radius-pill)',
              padding: '9px 14px', font: `${on ? 700 : 500} 13px/1.25 var(--bt-font)`,
              background: on ? 'var(--bt-blush)' : 'var(--bt-white)',
              color: on ? 'var(--bt-bowtie-pink)' : 'var(--bt-graphite)',
              border: `1.5px solid ${on ? 'var(--bt-bowtie-pink)' : 'var(--bt-stone)'}`,
              transition: 'all var(--bt-duration-fast) var(--bt-ease)',
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

const ccCaseV2 = {
  list: { display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 300, paddingRight: 4 } as CSSProperties,
  card: (on: boolean): CSSProperties => ({
    display: 'block', width: '100%', textAlign: 'left', cursor: 'pointer',
    background: on ? 'var(--bt-blush)' : 'var(--bt-white)',
    border: 'none', borderRadius: 'var(--bt-radius-m)', padding: '12px 14px',
    boxShadow: on ? 'inset 0 0 0 1.5px var(--bt-bowtie-pink)' : 'inset 0 0 0 1.5px var(--bt-stone)',
    transition: 'all var(--bt-duration-fast) var(--bt-ease)',
  }),
  head: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 } as CSSProperties,
  title: { font: '700 14px/1.3 var(--bt-font)', color: 'var(--bt-ink)' } as CSSProperties,
  right: { display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 } as CSSProperties,
  price: { font: '700 14px/1 var(--bt-font)', color: 'var(--bt-bowtie-blue)', whiteSpace: 'nowrap' } as CSSProperties,
  check: (on: boolean): CSSProperties => ({
    width: 26, height: 26, flexShrink: 0, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: on ? 'var(--bt-bowtie-pink)' : 'var(--bt-white)',
    color: on ? 'var(--bt-white)' : 'var(--bt-bowtie-pink)',
    boxShadow: on ? 'none' : 'inset 0 0 0 1.5px var(--bt-stone)',
    transition: 'all var(--bt-duration-fast) var(--bt-ease)',
  }),
  tags: { display: 'flex', gap: 4, marginTop: 6 } as CSSProperties,
};

function CCCaseListMulti({
  tier,
  gender,
  age,
  selectedIds,
  onToggle,
}: {
  tier: TierId;
  gender: string;
  age: string;
  selectedIds: string[];
  onToggle: (id: string) => void;
}) {
  const { cases } = useOperationData();
  const { t, lang } = useLang();
  const filtered = useMemo(
    () =>
      cases.filter((c) => {
        if (c.tier !== tier) return false;
        if (gender !== 'all' && c.gender !== 'all' && c.gender !== gender) return false;
        if (age !== 'all' && c.age !== 'all') {
          const allowed = AGE_BAND_MATCH_V2[age] || [];
          if (!allowed.includes(c.age)) return false;
        }
        return true;
      }),
    [cases, tier, gender, age],
  );

  const genderLabel = (g: string) => (g === 'male' ? t('common.male') : g === 'female' ? t('common.female') : t('common.any'));
  const ageLabel = (a: string) => (a === 'all' ? t('common.anyAge') : a);

  return (
    <div className="cc-scroll" style={ccCaseV2.list}>
      {filtered.length === 0 && (
        <div style={{ padding: 24, textAlign: 'center', color: 'var(--bt-graphite)', font: '400 13px var(--bt-font)' }}>
          {t('case.noMatching')}
        </div>
      )}
      {filtered.map((c) => {
        const on = selectedIds.includes(c.id);
        return (
          <button
            key={c.id}
            style={ccCaseV2.card(on)}
            onClick={() => onToggle(c.id)}
            title={on ? t('common.removeFromComparison') : t('common.addToComparison')}
          >
            <div style={ccCaseV2.head}>
              <div style={ccCaseV2.title}>{pickCaseName(c, lang)}</div>
              <div style={ccCaseV2.right}>
                <span style={ccCaseV2.price}>{fmtHK(c.cost)}</span>
                <span style={ccCaseV2.check(on)}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    {on ? (
                      <path d="M3.5 8.5 L6.5 11.5 L12.5 4.5"></path>
                    ) : (
                      <>
                        <path d="M8 3.5 L8 12.5"></path>
                        <path d="M3.5 8 L12.5 8"></path>
                      </>
                    )}
                  </svg>
                </span>
              </div>
            </div>
            <div style={ccCaseV2.tags}>
              <span className="cc-chip">{genderLabel(c.gender)}</span>
              <span className="cc-chip">{ageLabel(c.age)}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export function CaseTab(props: CaseFilterProps) {
  const { tier, setTier, gender, setGender, age, setAge, selectedCaseIds, onToggleCase, hideHeader } = props;
  const { t } = useLang();

  const genderOpts = [
    { id: 'all', label: t('common.any') },
    { id: 'male', label: t('common.male') },
    { id: 'female', label: t('common.female') },
  ];

  const labelCss: CSSProperties = { font: '700 11px/1 var(--bt-font)', color: 'var(--bt-graphite)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 };

  return (
    <div>
      {!hideHeader && <h2 className="cc-panel-h1">{t('case.title')}</h2>}
      {!hideHeader && <p className="cc-panel-sub">{t('case.sub')}</p>}

      <div className="cc-section-label">{t('case.surgeryTier')}</div>
      <CCSurgeryTiers value={tier} onChange={setTier} />

      <div className="cc-section-label">{t('case.realExamples')}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 14 }}>
        <div>
          <div style={labelCss}>{t('case.gender')}</div>
          <CCChipColumn value={gender} options={genderOpts} onChange={setGender} />
        </div>
        <div>
          <div style={labelCss}>{t('case.age')}</div>
          <CCChipColumn value={age} options={AGE_BANDS_V2} onChange={setAge} />
        </div>
      </div>
      <CCCaseListMulti tier={tier} gender={gender} age={age} selectedIds={selectedCaseIds} onToggle={onToggleCase} />
    </div>
  );
}
