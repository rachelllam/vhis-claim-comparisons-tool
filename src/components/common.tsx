import type { CSSProperties } from 'react';
import { monthlyPremium } from '../quote';
import { useLang } from '../i18n';
import type { Profile } from '../types';

// Shared quote styling (badge used on plan cards + result cards).
export const ccQuote = {
  badge: {
    display: 'inline-flex',
    alignItems: 'baseline',
    gap: 3,
    font: '700 13px/1 var(--bt-font)',
    color: 'var(--bt-bowtie-pink)',
    whiteSpace: 'nowrap',
  } as CSSProperties,
  badgePer: { font: '500 10px/1 var(--bt-font)', color: 'var(--bt-rock)' } as CSSProperties,
};

interface SegOption {
  id: string;
  label: string;
}

export function CCSegmented({
  value,
  options,
  onChange,
}: {
  value: string;
  options: SegOption[];
  onChange: (id: string) => void;
}) {
  return (
    <div className="cc-seg" style={{ width: 'auto' }}>
      {options.map((opt) => (
        <button key={opt.id} className={opt.id === value ? 'on' : ''} onClick={() => onChange(opt.id)}>
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// Small premium badge for plan cards / ward heads.
export function PremiumBadge({
  planId,
  profile,
  style,
}: {
  planId: string;
  profile: Profile;
  style?: CSSProperties;
}) {
  const { t } = useLang();
  const m = monthlyPremium(planId, profile);
  if (m == null) return null;
  return (
    <span style={{ ...ccQuote.badge, ...style }}>
      HK${m.toLocaleString('en-US')}
      <span style={ccQuote.badgePer}>{t('common.perMonth')}</span>
    </span>
  );
}
