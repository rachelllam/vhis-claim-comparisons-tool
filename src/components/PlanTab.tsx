import { Fragment, useState } from "react";
import type { CSSProperties } from "react";
import { VHIS_PLANS } from "../data";
import { useLang, pick, wardLabel } from "../i18n";
import type { SelectedPlan, QuoteCtx } from "../types";
import { PremiumBadge } from "./common";

const ccPlanStyles = {
  group: { marginBottom: 18 } as CSSProperties,

  // Plan card (added via +)
  card: (sel: boolean, disabled: boolean): CSSProperties => ({
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: sel ? "var(--bt-blush)" : "var(--bt-white)",
    border: `1.5px solid ${sel ? "var(--bt-bowtie-pink)" : "var(--bt-stone)"}`,
    borderRadius: 8,
    padding: "6px 8px 6px 12px",
    marginBottom: 8,
    opacity: disabled ? 0.45 : 1,
    transition: "all var(--bt-duration-fast) var(--bt-ease)",
  }),
  cardBody: { flex: 1, minWidth: 0 } as CSSProperties,
  cardName: {
    font: "700 14px/1.3 var(--bt-font)",
    color: "var(--bt-ink)",
  } as CSSProperties,
  addBtn: (sel: boolean, disabled: boolean): CSSProperties => ({
    width: 34,
    height: 34,
    flexShrink: 0,
    borderRadius: "50%",
    border: "none",
    cursor: disabled ? "default" : "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: sel ? "var(--bt-white)" : "var(--bt-bowtie-pink)",
    color: sel ? "var(--bt-bowtie-pink)" : "var(--bt-white)",
    boxShadow: sel ? "inset 0 0 0 2px var(--bt-bowtie-pink)" : "none",
    transition: "all var(--bt-duration-fast) var(--bt-ease)",
  }),
  dedPills: {
    display: "flex",
    gap: 6,
    marginTop: 8,
    flexWrap: "wrap",
  } as CSSProperties,
  dedPill: (on: boolean): CSSProperties => ({
    border: "none",
    cursor: "pointer",
    font: `${on ? 700 : 500} 11px/1 var(--bt-font)`,
    padding: "6px 11px",
    borderRadius: "var(--bt-radius-pill)",
    background: on ? "var(--bt-bowtie-pink)" : "var(--bt-white)",
    color: on ? "var(--bt-white)" : "var(--bt-graphite)",
    boxShadow: on ? "none" : "inset 0 0 0 1px var(--bt-stone)",
  }),

  // The pink matrix is styled by the .fp-* classes in index.css — it needs
  // :hover and :active, which inline styles can't express. Only its column
  // count stays here, since that comes from the data.
  matrixCols: (cols: number): CSSProperties => ({
    gridTemplateColumns: `1.3fr repeat(${cols}, 1fr)`,
  }),
};

const dedColLabel = (d: number) =>
  d === 0 ? "$0" : "$" + Math.round(d / 1000) + "K";

interface PlanPickerProps {
  selected: SelectedPlan[];
  onAdd: (id: string, deductible: number) => void;
  onRemove: (id: string, deductible: number) => void;
  onSetDeductible: (id: string, deductible: number) => void;
  onSelectPink: (id: string, deductible: number) => void;
  quoteCtx: QuoteCtx;
}

function CCPlanPicker({
  selected,
  onAdd,
  onRemove,
  onSetDeductible,
  onSelectPink,
  quoteCtx,
}: PlanPickerProps) {
  const { t, lang } = useLang();
  const showQuote = quoteCtx && quoteCtx.show;
  // Which ward row / deductible column is under the pointer, so the cells a
  // bulk header click would add can preview themselves.
  const [hoverRow, setHoverRow] = useState<string | null>(null);
  const [hoverCol, setHoverCol] = useState<number | null>(null);
  const listPlans = VHIS_PLANS.filter((p) => !p.id.startsWith("pink"));
  const pinkPlans = VHIS_PLANS.filter((p) => p.id.startsWith("pink"));
  const pinkDeductibles = pinkPlans[0] ? pinkPlans[0].deductibles : [];
  const findSel = (id: string) => selected.find((sp) => sp.id === id);
  const isPinkSel = (id: string, d: number) =>
    selected.some((sp) => sp.id === id && sp.deductible === d);
  // Row/column header "one-click get the whole series" — additive only, never
  // deselects a cell that's already picked.
  const selectWard = (id: string, deductibles: number[]) =>
    deductibles.forEach((d) => {
      if (!isPinkSel(id, d)) onSelectPink(id, d);
    });
  const selectDeductible = (d: number) =>
    pinkPlans.forEach((plan) => {
      if (!isPinkSel(plan.id, d)) onSelectPink(plan.id, d);
    });

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
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 8,
                    flexWrap: "wrap",
                  }}
                >
                  <span style={ccPlanStyles.cardName}>{pick(plan, lang)}</span>
                  {showQuote && (
                    <PremiumBadge planId={plan.id} profile={quoteCtx.profile} />
                  )}
                </div>
                {isSel && plan.deductibles.length > 1 && (
                  <div style={ccPlanStyles.dedPills}>
                    {plan.deductibles.map((d) => (
                      <button
                        key={d}
                        style={ccPlanStyles.dedPill(sel!.deductible === d)}
                        onClick={() => onSetDeductible(plan.id, d)}
                      >
                        {d === 0
                          ? t("plan.noDeduct")
                          : t("plan.deductTpl").replace(
                              "{amount}",
                              dedColLabel(d),
                            )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                style={ccPlanStyles.addBtn(isSel, false)}
                title={isSel ? t("plan.remove") : t("plan.addShort")}
                onClick={() =>
                  isSel
                    ? onRemove(plan.id, sel!.deductible)
                    : onAdd(plan.id, plan.deductibles[0])
                }
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                >
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
      <div className="fp-block">
        <div className="fp-blockhead">
          <span className="fp-title">{t("plan.pinkPlan")}</span>
        </div>
        {/* Not role="grid": the ARIA grid pattern needs role="row" wrappers,
            which would break the CSS grid these buttons are direct children
            of. Each button carries a full aria-label instead, so a cell reads
            as "半私家 · $20K" rather than a bare "$20K". */}
        <div
          className="fp-matrix"
          style={ccPlanStyles.matrixCols(pinkDeductibles.length)}
        >
          <div className="fp-corner" aria-hidden="true"></div>
          {pinkDeductibles.map((d) => (
            <button
              key={"h" + d}
              type="button"
              className="fp-colhead"
              title={`${dedColLabel(d)} · ${t("plan.pinkBulkSuffix")}`}
              aria-label={`${dedColLabel(d)} · ${t("plan.pinkBulkSuffix")}`}
              onClick={() => selectDeductible(d)}
              onMouseEnter={() => setHoverCol(d)}
              onMouseLeave={() => setHoverCol(null)}
            >
              {dedColLabel(d)}
            </button>
          ))}
          {pinkPlans.map((plan) => {
            return (
              <Fragment key={plan.id}>
                <button
                  type="button"
                  className="fp-rowhead"
                  style={{
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: 3,
                    justifyContent: "center",
                  }}
                  title={`${wardLabel(plan.ward, t)} · ${t("plan.pinkBulkSuffix")}`}
                  aria-label={`${wardLabel(plan.ward, t)} · ${t("plan.pinkBulkSuffix")}`}
                  onClick={() => selectWard(plan.id, plan.deductibles)}
                  onMouseEnter={() => setHoverRow(plan.id)}
                  onMouseLeave={() => setHoverRow(null)}
                >
                  <span>{wardLabel(plan.ward, t)}</span>
                  {showQuote && (
                    <PremiumBadge
                      planId={plan.id}
                      profile={quoteCtx.profile}
                      style={{ font: "700 11px/1 var(--bt-font)" }}
                    />
                  )}
                </button>
                {pinkDeductibles.map((d) => {
                  // Multi-select: any number of deductible tiers per ward can be active at once.
                  const isSel = isPinkSel(plan.id, d);
                  // Previewed = what hovering this row/column header would add.
                  // Bulk select is additive, so already-selected cells are excluded.
                  const isPreview =
                    !isSel && (hoverRow === plan.id || hoverCol === d);
                  return (
                    <button
                      key={plan.id + d}
                      type="button"
                      className={
                        "fp-cell" +
                        (isSel ? " is-on" : "") +
                        (isPreview ? " is-preview" : "")
                      }
                      aria-pressed={isSel}
                      title={`${wardLabel(plan.ward, t)} · ${dedColLabel(d)}`}
                      aria-label={`${wardLabel(plan.ward, t)} · ${dedColLabel(d)}`}
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
  onRemove: (id: string, deductible: number) => void;
  onSetDeductible: (id: string, deductible: number) => void;
  onSelectPink: (id: string, deductible: number) => void;
  quoteCtx: QuoteCtx;
  hideHeader?: boolean;
}

export function PlanTab(props: PlanTabProps) {
  const {
    plans,
    onAdd,
    onRemove,
    onSetDeductible,
    onSelectPink,
    hideHeader,
    quoteCtx,
  } = props;
  const { t } = useLang();
  return (
    <div>
      {!hideHeader && <h2 className="cc-panel-h1">{t("plan.configure")}</h2>}
      {!hideHeader && <p className="cc-panel-sub">{t("plan.addToCompare")}</p>}

      <div className="cc-section-label" style={{ marginTop: 0 }}>
        {t("plan.vhisPlans")}
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
