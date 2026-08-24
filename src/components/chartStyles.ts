import type { CSSProperties } from 'react';

// ── Core chart styles (ported from cc-chart-panel.jsx ccChartStyles) ──
export const ccChartStyles = {
  legend: { display: 'flex', gap: 18, marginBottom: 18, flexWrap: 'wrap' } as CSSProperties,
  legendItem: { display: 'flex', alignItems: 'center', gap: 8, font: '500 12px/1 var(--bt-font)', color: 'var(--bt-graphite)' } as CSSProperties,
  legendSwatch: (c: string): CSSProperties => ({ width: 14, height: 14, borderRadius: 4, background: c }),

  planHead: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 } as CSSProperties,
  planTitle: { font: '700 16px/1.3 var(--bt-font)', color: 'var(--bt-ink)' } as CSSProperties,

  // — Stacked bar (always-visible glance) —
  bar: { height: 44, marginTop: 12, background: 'var(--bt-stone)', borderRadius: 'var(--bt-radius-s)', overflow: 'hidden', display: 'flex' } as CSSProperties,
  barSeg: (color: string): CSSProperties => ({
    background: color, display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'var(--bt-white)', font: '700 12px/1 var(--bt-font)', overflow: 'hidden',
    whiteSpace: 'nowrap', transition: 'flex var(--bt-duration-slow) var(--bt-ease)',
  }),
  detailToggle: {
    display: 'flex', alignItems: 'center', gap: 6, marginTop: 12,
    background: 'none', border: 'none', padding: '2px 0', cursor: 'pointer',
    font: '500 12px/1 var(--bt-font)', color: 'var(--bt-bowtie-pink)',
  } as CSSProperties,

  // — receipt / ledger —
  receipt: { fontVariantNumeric: 'tabular-nums', marginTop: 4 } as CSSProperties,
  receiptRow: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16, padding: '10px 0' } as CSSProperties,
  receiptRowBorder: { borderTop: '1px dashed var(--bt-stone)' } as CSSProperties,
  receiptLabel: { font: '500 13px/1.4 var(--bt-font)', color: 'var(--bt-graphite)' } as CSSProperties,
  receiptHint: { display: 'block', font: '400 11px/1.2 var(--bt-font)', color: 'var(--bt-rock)', marginTop: 2 } as CSSProperties,
  receiptVal: { font: '600 14px/1 var(--bt-font)', color: 'var(--bt-ink)', whiteSpace: 'nowrap' } as CSSProperties,
  receiptValNeg: { color: 'var(--bt-hotel-california)' } as CSSProperties,
  receiptValPos: { color: 'var(--bt-green-day)' } as CSSProperties,

  paysBox: (zero: boolean): CSSProperties => ({
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
    marginTop: 8, padding: '13px 16px', borderRadius: 'var(--bt-radius-s)',
    background: zero ? 'var(--bt-hotel-california-light)' : 'var(--bt-green-day-light)',
    border: `1px solid ${zero ? 'var(--bt-hotel-california)' : 'var(--bt-green-day)'}`,
  }),
  paysLabel: { font: '700 12px/1.2 var(--bt-font)', color: 'var(--bt-ink)', letterSpacing: '0.02em' } as CSSProperties,
  paysSub: { display: 'block', font: '400 11px/1.2 var(--bt-font)', color: 'var(--bt-graphite)', marginTop: 2 } as CSSProperties,
  paysValue: (zero: boolean): CSSProperties => ({ font: '700 24px/1 var(--bt-font)', color: zero ? 'var(--bt-hotel-california)' : 'var(--bt-green-day)', whiteSpace: 'nowrap' }),

  // — estimate disclaimer —
  warningBox: {
    display: 'flex', alignItems: 'flex-start', gap: 10,
    marginBottom: 18, padding: '13px 16px', borderRadius: 'var(--bt-radius-s)',
    background: 'var(--bt-yellow-submarine-light)',
    border: '1px solid var(--bt-yellow-submarine)',
  } as CSSProperties,
  warningText: { font: '500 12px/1.5 var(--bt-font)', color: 'var(--bt-ink)' } as CSSProperties,

  youPayRow: { display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 10, padding: '0 2px' } as CSSProperties,
  youPayLabel: { font: '500 12px/1 var(--bt-font)', color: 'var(--bt-graphite)' } as CSSProperties,
  youPayVal: (zero: boolean): CSSProperties => ({ font: '700 13px/1 var(--bt-font)', color: zero ? 'var(--bt-green-day)' : 'var(--bt-hotel-california)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }),

  detailList: { marginTop: 2, marginBottom: 2, padding: '4px 14px', background: 'var(--bt-pebble)', borderRadius: 'var(--bt-radius-s)' } as CSSProperties,
  detailRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--bt-stone)' } as CSSProperties,
  detailLabel: { font: '500 12px/1.2 var(--bt-font)', color: 'var(--bt-graphite)' } as CSSProperties,
  detailValue: { font: '700 12px/1.2 var(--bt-font)', color: 'var(--bt-ink)' } as CSSProperties,

  removeBtn: {
    width: 26, height: 26, flexShrink: 0, borderRadius: '50%', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'var(--bt-pebble)', border: '1px solid var(--bt-stone)', color: 'var(--bt-graphite)',
    transition: 'all var(--bt-duration-fast) var(--bt-ease)',
  } as CSSProperties,
};

// ── v2 chart styles (ported from cc-chart-panel-v2.jsx ccV2) ──
export const ccV2 = {
  // plan/case selector chips
  planChips: { display: 'flex', gap: 8, flexWrap: 'wrap', margin: '4px 0 18px' } as CSSProperties,
  chipWrap: (on: boolean): CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', overflow: 'hidden',
    border: `1.5px solid ${on ? 'var(--bt-bowtie-pink)' : 'var(--bt-stone)'}`,
    background: on ? 'var(--bt-blush)' : 'var(--bt-white)',
    borderRadius: 'var(--bt-radius-pill)',
    transition: 'all var(--bt-duration-fast) var(--bt-ease)',
  }),
  chipPick: (on: boolean): CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer',
    border: 0, background: 'transparent', padding: '8px 8px 8px 14px',
    font: `${on ? 700 : 500} 13px/1 var(--bt-font)`,
    color: on ? 'var(--bt-bowtie-pink)' : 'var(--bt-ink)',
  }),
  chipX: (on: boolean): CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    border: 0, background: 'transparent', cursor: 'pointer',
    padding: '8px 11px 8px 4px', flexShrink: 0,
    color: on ? 'var(--bt-bowtie-pink)' : 'var(--bt-rock)',
    transition: 'color var(--bt-duration-fast) var(--bt-ease)',
  }),

  // browser-tab lens
  tabStrip: { display: 'flex', alignItems: 'flex-end', gap: 0, background: 'var(--bt-blush)', padding: '10px 6px 0' } as CSSProperties,
  tabStrip2: { display: 'flex', alignItems: 'flex-end', gap: 0, background: 'var(--bt-blush)', padding: '10px 6px 0', borderTop: '1px solid rgba(255,0,104,0.10)' } as CSSProperties,
  groupLabel: (bg: string): CSSProperties => ({ display: 'inline-flex', alignItems: 'center', gap: 5, alignSelf: 'center', margin: '0 8px 5px 2px', padding: '5px 11px', borderRadius: 'var(--bt-radius-pill)', background: bg, color: 'var(--bt-white)', font: '700 11px/1 var(--bt-font)', letterSpacing: '0.02em', whiteSpace: 'nowrap', flexShrink: 0 }),
  emptyHint: { alignSelf: 'center', marginBottom: 6, padding: '0 4px', font: '500 12px/1 var(--bt-font)', color: 'var(--bt-rock)' } as CSSProperties,
  bTab: (on: boolean): CSSProperties => ({
    position: 'relative', flex: '1 1 0', minWidth: 140, display: 'flex', alignItems: 'center', gap: 7,
    cursor: 'pointer', border: 0, background: on ? 'var(--bt-white)' : 'transparent',
    color: 'var(--bt-bowtie-blue)', font: `${on ? 700 : 500} 13px/1 var(--bt-font)`,
    borderRadius: '9px 9px 0 0', padding: '10px 10px 12px', marginBottom: -1,
    boxShadow: on ? '0 -2px 6px rgba(25,19,87,0.07)' : 'none',
    transition: 'background var(--bt-duration-fast) var(--bt-ease)',
  }),
  bFav: (c: string): CSSProperties => ({ width: 16, height: 16, borderRadius: 5, background: c, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }),
  bTabLabel: { flex: 1, textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } as CSSProperties,
  bTabX: (on: boolean): CSSProperties => ({ width: 18, height: 18, borderRadius: '50%', flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: on ? 'var(--bt-graphite)' : 'var(--bt-rock)' }),

  // summary strip
  strip: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 18, padding: '14px 0', borderBottom: '1px solid var(--bt-stone)' } as CSSProperties,
  stripCell: { display: 'flex', flexDirection: 'column', gap: 4 } as CSSProperties,
  stripKicker: { font: '500 11px/1 var(--bt-font)', color: 'var(--bt-graphite)', letterSpacing: '0.04em', textTransform: 'uppercase' } as CSSProperties,
  stripBig: { font: '700 16px/1.2 var(--bt-font)', color: 'var(--bt-ink)' } as CSSProperties,
  stripBlue: { font: '700 22px/1 var(--bt-font)', color: 'var(--bt-bowtie-blue)' } as CSSProperties,
  stripSmall: { font: '400 12px/1.2 var(--bt-font)', color: 'var(--bt-graphite)' } as CSSProperties,

  // result card
  card: { background: 'var(--bt-white)', border: '1px solid var(--bt-stone)', borderRadius: 'var(--bt-radius-m)', padding: '18px 20px', marginBottom: 12 } as CSSProperties,

  // by-plan case header
  caseHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 4 } as CSSProperties,
  tierBadge: (color: string): CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', alignSelf: 'flex-start',
    font: '700 10px/1 var(--bt-font)', letterSpacing: '0.04em', textTransform: 'uppercase',
    color: 'var(--bt-white)', background: color,
    padding: '4px 9px', borderRadius: 'var(--bt-radius-pill)', marginBottom: 8,
  }),
  caseName: { font: '700 16px/1.3 var(--bt-font)', color: 'var(--bt-ink)' } as CSSProperties,
  caseEn: { font: '400 12px/1 var(--bt-font)', color: 'var(--bt-graphite)', marginTop: 2 } as CSSProperties,
  caseCost: { font: '700 16px/1 var(--bt-font)', color: 'var(--bt-bowtie-blue)', whiteSpace: 'nowrap' } as CSSProperties,
};

// ── detail-drawer + treatment-header styles (ported from ccDetail) ──
export const ccDetail = {
  thHead: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 14 } as CSSProperties,
  thNames: { minWidth: 0 } as CSSProperties,
  thBadgeRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 } as CSSProperties,
  thShort: { font: '700 22px/1.15 var(--bt-font)', color: 'var(--bt-ink)', margin: 0 } as CSSProperties,
  thOfficial: { font: '400 13px/1.4 var(--bt-font)', color: 'var(--bt-graphite)', marginTop: 4 } as CSSProperties,
  rangeNote: { font: '400 12px/1.3 var(--bt-font)', color: 'var(--bt-graphite)' } as CSSProperties,

  intBtn: {
    flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 7, cursor: 'pointer',
    border: '1.5px solid var(--bt-stone)', background: 'var(--bt-white)',
    borderRadius: 'var(--bt-radius-pill)', padding: '8px 14px',
    font: '700 12px/1 var(--bt-font)', color: 'var(--bt-bowtie-blue)',
    transition: 'all var(--bt-duration-fast) var(--bt-ease)',
  } as CSSProperties,
  intDot: { width: 7, height: 7, borderRadius: '50%', background: 'var(--bt-yellow-submarine)', flexShrink: 0 } as CSSProperties,
  intBtnSmall: {
    flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer',
    border: '1.5px solid var(--bt-stone)', background: 'var(--bt-white)',
    borderRadius: 'var(--bt-radius-pill)', padding: '5px 11px',
    font: '700 11px/1 var(--bt-font)', color: 'var(--bt-bowtie-blue)',
    transition: 'all var(--bt-duration-fast) var(--bt-ease)',
  } as CSSProperties,

  overlay: (shown: boolean): CSSProperties => ({
    position: 'fixed', inset: 0, zIndex: 1000,
    background: shown ? 'rgba(42,46,66,0.32)' : 'rgba(42,46,66,0)',
    display: 'flex', justifyContent: 'flex-end',
    transition: 'background var(--bt-duration-base) var(--bt-ease)',
  }),
  sheet: (shown: boolean): CSSProperties => ({
    width: 460, maxWidth: '92vw', height: '100vh', background: 'var(--bt-white)',
    borderRadius: 'var(--bt-radius-l) 0 0 var(--bt-radius-l)', boxShadow: 'var(--bt-shadow-3)',
    display: 'flex', flexDirection: 'column', position: 'relative',
    transform: shown ? 'translateX(0)' : 'translateX(100%)',
    transition: 'transform var(--bt-duration-base) var(--bt-ease)',
  }),
  sheetHead: { padding: '24px 26px 20px', borderBottom: '1px solid var(--bt-stone)', flexShrink: 0 } as CSSProperties,
  intTag: {
    display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 12,
    font: '700 10px/1 var(--bt-font)', letterSpacing: '0.06em', textTransform: 'uppercase',
    color: 'var(--bt-ink)', background: 'var(--bt-yellow-submarine)',
    padding: '5px 10px', borderRadius: 'var(--bt-radius-pill)',
  } as CSSProperties,
  sheetTitleRow: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 } as CSSProperties,
  sheetTitle: { font: '700 24px/1.2 var(--bt-font)', color: 'var(--bt-bowtie-blue)', margin: 0 } as CSSProperties,
  sheetOfficial: { font: '400 14px/1.4 var(--bt-font)', color: 'var(--bt-graphite)', marginTop: 5 } as CSSProperties,
  sheetClose: {
    flexShrink: 0, width: 36, height: 36, borderRadius: '50%', border: '1px solid var(--bt-stone)',
    background: 'var(--bt-white)', color: 'var(--bt-graphite)', cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all var(--bt-duration-fast) var(--bt-ease)',
  } as CSSProperties,
  sheetBody: { padding: '8px 26px 28px', flex: 1, overflowY: 'auto' } as CSSProperties,
  part: { paddingTop: 22 } as CSSProperties,
  partLabel: { display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 14px', font: '700 11px/1 var(--bt-font)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--bt-bowtie-pink)' } as CSSProperties,
  partNum: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, width: 20, height: 20, borderRadius: '50%', background: 'var(--bt-blush)', font: '700 11px/1 var(--bt-font)', color: 'var(--bt-bowtie-pink)' } as CSSProperties,
  demoChips: { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 } as CSSProperties,
  demoChip: { display: 'inline-flex', alignItems: 'center', gap: 7, font: '500 12px/1 var(--bt-font)', color: 'var(--bt-ink)', background: 'var(--bt-pebble)', border: '1px solid var(--bt-stone)', borderRadius: 'var(--bt-radius-pill)', padding: '7px 13px' } as CSSProperties,
  demoChipKey: { font: '700 10px/1 var(--bt-font)', letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--bt-graphite)' } as CSSProperties,
  para: { font: '400 14px/1.6 var(--bt-font)', color: 'var(--bt-ink)', margin: 0 } as CSSProperties,
  opGrid: { display: 'flex', flexDirection: 'column', gap: 14 } as CSSProperties,
  opBlock: {} as CSSProperties,
  opKey: { font: '700 12px/1 var(--bt-font)', color: 'var(--bt-bowtie-blue)', marginBottom: 5 } as CSSProperties,
  opVal: { font: '400 14px/1.55 var(--bt-font)', color: 'var(--bt-ink)', margin: 0 } as CSSProperties,

  hospList: { display: 'flex', flexDirection: 'column', gap: 10 } as CSSProperties,
  hospCard: { border: '1px solid var(--bt-stone)', borderRadius: 'var(--bt-radius-m)', padding: '14px 16px' } as CSSProperties,
  hospTop: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 12 } as CSSProperties,
  hospName: { font: '700 14px/1.3 var(--bt-font)', color: 'var(--bt-bowtie-blue)' } as CSSProperties,
  hospUpdated: { font: '400 11px/1.35 var(--bt-font)', color: 'var(--bt-rock)', marginTop: 4 } as CSSProperties,
  hospRows: { display: 'flex', flexDirection: 'column', gap: 0 } as CSSProperties,
  hospRow: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, padding: '7px 0', borderTop: '1px solid var(--bt-pebble)' } as CSSProperties,
  hospKey: { font: '500 11px/1.3 var(--bt-font)', color: 'var(--bt-graphite)', letterSpacing: '0.02em', flexShrink: 0 } as CSSProperties,
  hospVal: { font: '600 12.5px/1.4 var(--bt-font)', color: 'var(--bt-ink)', textAlign: 'right' } as CSSProperties,
  hospValPrice: { font: '700 12.5px/1.3 var(--bt-font)', color: 'var(--bt-ink)', textAlign: 'right', whiteSpace: 'nowrap' } as CSSProperties,
  riderYes: { display: 'inline-flex', alignItems: 'center', gap: 5, font: '700 11px/1 var(--bt-font)', color: 'var(--bt-green-day)', background: 'var(--bt-green-day-light)', padding: '5px 9px', borderRadius: 'var(--bt-radius-pill)', whiteSpace: 'nowrap' } as CSSProperties,
  riderNo: { display: 'inline-flex', alignItems: 'center', gap: 5, font: '700 11px/1 var(--bt-font)', color: 'var(--bt-rock)', background: 'var(--bt-stone)', padding: '5px 9px', borderRadius: 'var(--bt-radius-pill)', whiteSpace: 'nowrap' } as CSSProperties,
};
