# Claim Comparison v3 — Implementation

Production implementation of the `project/Claim Comparison v3.html` design handoff
(see [README.md](README.md)). Built as **Vite + React + TypeScript**, recreating the
v3 design pixel-for-pixel. Internal Bowtie staff tool — Bowtie Confidential.

## What it is

A VHIS plan **coverage comparison** + **indicative quote** tool for product specialists:

- **Top bar** — `bowtie` wordmark, tool badge, a master **Quotes** toggle (shows/hides
  indicative monthly premiums), and **Clear all**.
- **Left panel** — three browser-style tabs:
  - **About me** — the person's profile (gender · smoker · age, with a birth-year
    picker). Drives premiums. Kept *separate* from the case filters. Greys out when
    Quotes is off.
  - **Plan** — pick VHIS plans to compare (standalone plan cards with deductible pills
    + a Pink ward × deductible matrix). Premium badges show when Quotes is on.
  - **Case** — pick the surgery examples (tier → gender/age filters → multi-select list).
- **Combined panel** — a two-row browser-tab "lens" (Cases / Plans) that switches the
  view between **By case** (one surgery × all plans) and **By plan** (one plan × all
  surgeries), the **Coverage breakdown** chart with expandable coverage receipts and an
  **internal-only** treatment-detail drawer, and a collapsible **WhatsApp message**
  composer (auto-generated, editable, copy-to-clipboard).

The premium engine is profile-only (age / gender / smoking) and intentionally **not**
linked to the deductible — deductible stays a claim-side lever.

## Requirements

- **Node 18+** (developed on Node 22). An `.nvmrc` pins `22` — run `nvm use`.

## Commands

```bash
npm install        # install deps
npm run dev        # dev server at http://localhost:5173
npm run typecheck  # tsc --noEmit
npm run build      # production bundle  → dist/
npm run build:single   # ONE self-contained index.html → dist-single/
npm run preview    # serve the production build locally
```

### Single-file output

`npm run build:single` uses `vite-plugin-singlefile` to inline all JS + CSS into one
`dist-single/index.html` — no separate compiler needed. Handy for internal sharing
(e.g. Bowtie Drop). The single file pulls the Gilroy brand font from Bowtie's CDN and
Noto Sans TC from Google Fonts; it renders with system-font fallbacks offline.

## Source layout

```
index.html              # Vite entry
src/
  main.tsx              # React root
  index.css             # Bowtie design tokens (bowkit) + app chrome
  data.ts               # tiers, cases, treatment details, VHIS plans, computeBreakdown, formatters
  quote.ts              # premium engine + helpers
  types.ts              # shared app types
  App.tsx               # top bar + 3-tab left rail + combined panel + message sidebar
  components/
    common.tsx              # CCSegmented, PremiumBadge, shared badge styles
    ProfileForm.tsx         # "About you" form + birth-year picker popover
    CaseTab.tsx             # surgery tiers + gender/age chips + multi-select cases
    PlanTab.tsx             # VHIS plan picker + Pink ward×deductible matrix
    CoverageTabsBar.tsx     # two-row Cases/Plans lens above the combined panel
    ChartPanel.tsx          # coverage breakdown (by-case / by-plan) + result cards + headers
    InternalDetailModal.tsx # internal-only treatment-detail drawer
    MessagePanel.tsx        # WhatsApp message composer
    chartStyles.ts          # shared inline-style objects for the chart/drawer
```

## Notes on fidelity to the prototype

- The design carried a design-tool "Tweaks" scaffold with two placement variants
  (About-you as a tab vs. a top strip). Per the build decision, only the v3 default
  **tabs** placement is shipped; the Tweaks scaffold is dropped.
- The prototype's `· edited` appeared inside a JSX text node (a latent prototype
  bug that would render the literal escape). The implementation renders the intended
  `· edited`.
