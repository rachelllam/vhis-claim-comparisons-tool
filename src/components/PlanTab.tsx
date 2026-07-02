import { Fragment } from 'react';
import type { CSSProperties } from 'react';
import { VHIS_PLANS } from '../data';
import type { Ward } from '../data';
import type { SelectedPlan, QuoteCtx } from '../types';
import { PremiumBadge } from './common';

const ccPlanStyles = {
  group: { marginBottom: 18 } as CSSProperties,

  // Plan card (added via +)
  card: (sel: boolean, disabled: boolean): CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: 12,
    background: sel ? 'var(--bt-blush)' : 'var(--bt-white)',
    border: `1.5px solid ${sel ? 'var(--bt-bowtie-pink)' : 'var(--bt-stone)'}`,
    borderRadius: 'var(--bt-radius-m)',
    padding: '12px 14px', marginBottom: 8,
    opacity: disabled ? 0.45 : 1,
    transition: 'all var(--bt-duration-fast) var(--bt-ease)',
  }),
  cardBody: { flex: 1, minWidth: 0 } as CSSProperties,
  cardName: { font: '700 14px/1.3 var(--bt-font)', color: 'var(--bt-ink)' } as CSSProperties,
  addBtn: (sel: boolean, disabled: boolean): CSSProperties => ({
    width: 34, height: 34, flexShrink: 0, borderRadius: '50%', border: 'none',
    cursor: disabled ? 'default' : 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: sel ? 'var(--bt-white)' : 'var(--bt-bowtie-pink)',
    color: sel ? 'var(--bt-bowtie-pink)' : 'var(--bt-white)',
    boxShadow: sel ? 'inset 0 0 0 2px var(--bt-bowtie-pink)' : 'none',
    transition: 'all var(--bt-duration-fast) var(--bt-ease)',
  }),
  dedPills: { display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' } as CSSProperties,
  dedPill: (on: boolean): CSSProperties => ({
    border: 'none', cursor: 'pointer',
    font: `${on ? 700 : 500} 11px/1 var(--bt-font)`,
    padding: '6px 11px', borderRadius: 'var(--bt-radius-pill)',
    background: on ? 'var(--bt-bowtie-pink)' : 'var(--bt-white)',
    color: on ? 'var(--bt-white)' : 'var(--bt-graphite)',
    boxShadow: on ? 'none' : 'inset 0 0 0 1px var(--bt-stone)',
  }),

  // Pink matrix
  matrix: { border: '1px solid var(--bt-stone)', borderRadius: 'var(--bt-radius-m)', overflow: 'hidden' } as CSSProperties,
  matrixHead: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, padding: '12px 14px 10px', flexWrap: 'wrap' } as CSSProperties,
  matrixTitle: { font: '700 14px/1 var(--bt-font)', color: 'var(--bt-bowtie-blue)' } as CSSProperties,
  matrixHint: { font: '400 11px/1.2 var(--bt-font)', color: 'var(--bt-graphite)' } as CSSProperties,
  grid: (cols: number): CSSProperties => ({ display: 'grid', gridTemplateColumns: `1.25fr repeat(${cols}, 1fr)`, gap: 1, background: 'var(--bt-stone)' }),
  corner: { background: 'var(--bt-pebble)' } as CSSProperties,
  colHead: { background: 'var(--bt-pebble)', font: '700 12px/1 var(--bt-font)', color: 'var(--bt-bowtie-blue)', textAlign: 'center', padding: '12px 4px' } as CSSProperties,
  wardHead: { background: 'var(--bt-white)', font: '700 13px/1.2 var(--bt-font)', color: 'var(--bt-bowtie-blue)', display: 'flex', alignItems: 'center', padding: '12px 12px' } as CSSProperties,
  cell: (sel: boolean, disabled: boolean): CSSProperties => ({
    border: 'none', cursor: disabled ? 'default' : 'pointer',
    background: sel ? 'var(--bt-bowtie-pink)' : 'var(--bt-white)',
    color: sel ? 'var(--bt-white)' : disabled ? 'var(--bt-rock)' : 'var(--bt-bowtie-blue)',
    font: '700 13px/1 var(--bt-font)', textAlign: 'center', padding: '14px 4px',
    transition: 'background var(--bt-duration-fast) var(--bt-ease), color var(--bt-duration-fast) var(--bt-ease)',
  }),
};

const WARD_LABELS: Record<Ward, string> = { standard: 'Standard ward', 'semi-private': 'Semi-private', private: 'Private' };
const dedColLabel = (d: number) => (d === 0 ? '$0' : '$' + Math.round(d / 1000) + 'K');

interface PlanPickerProps {
  selected: SelectedPlan[];
  onAdd: (id: string, deductible: number) => void;
  onRemove: (id: string) => void;
  onSetDeductible: (id: string, deductible: number) => void;
  onSelectPink: (id: string, deductible: number) => void;
  quoteCtx: QuoteCtx;
}

function CCPlanPicker({ selected, onAdd, onRemove, onSetDeductible, onSelectPink, quoteCtx }: PlanPickerProps) {
  const showQuote = quoteCtx && quoteCtx.show;
  const listPlans = VHIS_PLANS.filter((p) => !p.id.startsWith('pink'));
  const pinkPlans = VHIS_PLANS.filter((p) => p.id.startsWith('pink'));
  const pinkDeductibles = pinkPlans[0] ? pinkPlans[0].deductibles : [];
  const findSel = (id: string) => selected.find((sp) => sp.id === id);

  return (
    <div>
      {/* — Standalone plans — */}
      <div style={ccPlanStyles.group}>
        {listPlans.map((plan) => {
          const sel = findSel(plan.id);
          const isSel = !!sel;
          return (
            <div key={plan.id} style={ccPlanStyles.card(isSel, false)}>
              <div style={ccPlanStyles.cardBody}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                  <span style={ccPlanStyles.cardName}>{plan.en}</span>
                  {showQuote && <PremiumBadge planId={plan.id} profile={quoteCtx.profile} />}
                </div>
                {isSel && plan.deductibles.length > 1 && (
                  <div style={ccPlanStyles.dedPills}>
                    {plan.deductibles.map((d) => (
                      <button key={d} style={ccPlanStyles.dedPill(sel!.deductible === d)} onClick={() => onSetDeductible(plan.id, d)}>
                        {d === 0 ? 'No deduct.' : 'Deduct ' + dedColLabel(d)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                style={ccPlanStyles.addBtn(isSel, false)}
                title={isSel ? 'Remove' : 'Add to compare'}
                onClick={() => (isSel ? onRemove(plan.id) : onAdd(plan.id, plan.deductibles[0]))}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                  {isSel ? (
                    <path d="M3.5 8.5 L6.5 11.5 L12.5 4.5"></path>
                  ) : (
                    <>
                      <path d="M8 3.5 L8 12.5"></path>
                      <path d="M3.5 8 L12.5 8"></path>
                    </>
                  )}
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
          {pinkDeductibles.map((d) => (
            <div key={'h' + d} style={ccPlanStyles.colHead}>
              {dedColLabel(d)}
            </div>
          ))}
          {pinkPlans.map((plan) => {
            const sel = findSel(plan.id);
            return (
              <Fragment key={plan.id}>
                <div style={{ ...ccPlanStyles.wardHead, flexDirection: 'column', alignItems: 'flex-start', gap: 3, justifyContent: 'center' }}>
                  <span>{WARD_LABELS[plan.ward] || plan.en}</span>
                  {showQuote && <PremiumBadge planId={plan.id} profile={quoteCtx.profile} style={{ font: '700 11px/1 var(--bt-font)' }} />}
                </div>
                {pinkDeductibles.map((d) => {
                  const isSel = sel && sel.deductible === d;
                  return (
                    <button
                      key={plan.id + d}
                      style={ccPlanStyles.cell(!!isSel, false)}
                      title={`${WARD_LABELS[plan.ward]} · ${dedColLabel(d)}`}
                      onClick={() => onSelectPink(plan.id, d)}
                    >
                      {dedColLabel(d)}
                    </button>
                  );
                })}
              </Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export interface PlanTabProps {
  plans: SelectedPlan[];
  onAdd: (id: string, deductible: number) => void;
  onRemove: (id: string) => void;
  onSetDeductible: (id: string, deductible: number) => void;
  onSelectPink: (id: string, deductible: number) => void;
  quoteCtx: QuoteCtx;
  hideHeader?: boolean;
}

export function PlanTab(props: PlanTabProps) {
  const { plans, onAdd, onRemove, onSetDeductible, onSelectPink, hideHeader, quoteCtx } = props;
  const filledCount = plans.length;
  return (
    <div>
      {!hideHeader && <h2 className="cc-panel-h1">Configure</h2>}
      {!hideHeader && <p className="cc-panel-sub">Add VHIS plans to compare</p>}

      <div className="cc-section-label" style={{ marginTop: 0 }}>
        VHIS plans <span style={{ color: 'var(--bt-bowtie-pink)' }}>({filledCount} selected)</span>
      </div>
      <CCPlanPicker
        selected={plans}
        onAdd={onAdd}
        onRemove={onRemove}
        onSetDeductible={onSetDeductible}
        onSelectPink={onSelectPink}
        quoteCtx={quoteCtx}
      />
    </div>
  );
}
