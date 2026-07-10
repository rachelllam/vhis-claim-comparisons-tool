import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { getTreatmentDetail } from '../data';
import type { SurgeryCase } from '../data';
import { useOperationData } from '../useOperationData';
import { useLang, pick, pickCaseShort } from '../i18n';
import { ccDetail } from './chartStyles';

// Lock glyph for the internal-only marker.
export const LockIcon = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="7" width="10" height="7" rx="1.5"></rect>
    <path d="M5 7V5a3 3 0 0 1 6 0v2"></path>
  </svg>
);

// ── Internal-only treatment detail drawer (right-side overlay) ──
export function InternalDetailModal({ caseItem, onClose }: { caseItem: SurgeryCase; onClose: () => void }) {
  const { treatmentDetails } = useOperationData();
  const { t, lang } = useLang();
  const detail = getTreatmentDetail(treatmentDetails, caseItem.id);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setShown(true), 20);
    return () => clearTimeout(id);
  }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  if (!detail) return null;

  const genderLabel = caseItem.gender === 'all' ? t('common.allGenders') : caseItem.gender === 'male' ? t('common.male') : t('common.female');
  const ageLabel = caseItem.age === 'all' ? t('common.allAges') : caseItem.age;

  const Part = ({ n, title, children }: { n: string; title: string; children: ReactNode }) => (
    <div style={ccDetail.part}>
      <div style={ccDetail.partLabel}>
        <span style={ccDetail.partNum}>{n}</span>
        {title}
      </div>
      {children}
    </div>
  );

  return (
    <div style={ccDetail.overlay(shown)} onClick={onClose} role="dialog" aria-modal="true">
      <div style={ccDetail.sheet(shown)} onClick={(e) => e.stopPropagation()}>
        <div style={ccDetail.sheetHead}>
          <span style={ccDetail.intTag}>
            <LockIcon size={11} />{t('modal.internalOnly')}
          </span>
          <div style={ccDetail.sheetTitleRow}>
            <div style={{ minWidth: 0 }}>
              <h2 style={ccDetail.sheetTitle}>{pickCaseShort(caseItem, lang)}</h2>
              <div style={ccDetail.sheetOfficial}>{pick(detail.official, lang)}</div>
            </div>
            <button
              style={ccDetail.sheetClose}
              onClick={onClose}
              title={t('modal.close')}
              aria-label={t('modal.close')}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--bt-bowtie-pink)'; e.currentTarget.style.color = 'var(--bt-bowtie-pink)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--bt-stone)'; e.currentTarget.style.color = 'var(--bt-graphite)'; }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 4l8 8M12 4l-8 8"></path>
              </svg>
            </button>
          </div>
        </div>

        <div style={ccDetail.sheetBody}>
          <Part n="1" title={t('modal.whoGetsThis')}>
            <div style={ccDetail.demoChips}>
              <span style={ccDetail.demoChip}>
                <span style={ccDetail.demoChipKey}>{t('modal.ageGroup')}</span>
                {ageLabel}
              </span>
              <span style={ccDetail.demoChip}>
                <span style={ccDetail.demoChipKey}>{t('modal.gender')}</span>
                {genderLabel}
              </span>
            </div>
            <p style={ccDetail.para}>{pick(detail.demographics, lang)}</p>
          </Part>

          <Part n="2" title={t('modal.aboutOperation')}>
            <div style={ccDetail.opGrid}>
              <div style={ccDetail.opBlock}>
                <div style={ccDetail.opKey}>{t('modal.operationPurpose')}</div>
                <p style={ccDetail.opVal}>{pick(detail.purpose, lang)}</p>
              </div>
              <div style={ccDetail.opBlock}>
                <div style={ccDetail.opKey}>{t('modal.operationIntro')}</div>
                <p style={ccDetail.opVal}>{pick(detail.introduction, lang)}</p>
              </div>
              <div style={ccDetail.opBlock}>
                <div style={ccDetail.opKey}>{t('modal.estOperationTime')}</div>
                <p style={ccDetail.opVal}>{pick(detail.opTime, lang)}</p>
              </div>
            </div>
          </Part>

          <Part n="3" title={t('modal.chargeReference')}>
            <div style={ccDetail.hospList}>
              {detail.hospitals.map((h, i) => (
                <div key={i} style={ccDetail.hospCard}>
                  <div style={ccDetail.hospTop}>
                    <div style={{ minWidth: 0 }}>
                      <div style={ccDetail.hospName}>{pick(h.name, lang)}</div>
                      <div style={ccDetail.hospUpdated}>{h.updated}</div>
                    </div>
                    {h.inRider ? (
                      <span style={ccDetail.riderYes}>
                        <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2 5l2 2 4-5"></path>
                        </svg>
                        {t('modal.inRider')}
                      </span>
                    ) : (
                      <span style={ccDetail.riderNo}>{t('modal.notInRider')}</span>
                    )}
                  </div>
                  <div style={ccDetail.hospRows}>
                    <div style={ccDetail.hospRow}>
                      <span style={ccDetail.hospKey}>{t('modal.officialName')}</span>
                      <span style={ccDetail.hospVal}>{pick(h.official, lang)}</span>
                    </div>
                    <div style={ccDetail.hospRow}>
                      <span style={ccDetail.hospKey}>{t('modal.dayCaseInpatient')}</span>
                      <span style={ccDetail.hospVal}>{h.setting}</span>
                    </div>
                    <div style={ccDetail.hospRow}>
                      <span style={ccDetail.hospKey}>{t('modal.priceRange')}</span>
                      <span style={ccDetail.hospValPrice}>{h.priceRange}</span>
                    </div>
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
