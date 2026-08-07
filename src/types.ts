import type { Gender, TierId } from './data';

// "About you" profile — drives indicative premiums. Kept SEPARATE from the
// case filters (which decide which surgeries show).
export interface Profile {
  age: number;
  gender: Exclude<Gender, 'all'>;
  smoker: boolean;
}

// A plan added to the comparison: plan id + the chosen deductible.
export interface SelectedPlan {
  id: string;
  deductible: number;
}

export type CoverageMode = 'case' | 'plan';

// Coverage-view state shared across the chart / tabs bar / message panel.
export interface CoverageView {
  mode: CoverageMode;
  setMode: (m: CoverageMode) => void;
  focusPlanId: string | null;
  focusPlanDeductible: number | null;
  setFocusPlan: (id: string | null, deductible: number | null) => void;
  focusCaseId: string | null;
  setFocusCaseId: (id: string | null) => void;
  selectedCaseIds: string[];
}

// Quote context passed to the chart + plan picker.
export interface QuoteCtx {
  show: boolean;
  profile: Profile;
}

// Case-filter state (which surgeries are offered in the Case tab).
export interface CaseFilterProps {
  tier: TierId;
  setTier: (t: TierId) => void;
  gender: string;
  setGender: (g: string) => void;
  age: string;
  setAge: (a: string) => void;
  selectedCaseIds: string[];
  onToggleCase: (id: string) => void;
  hideHeader?: boolean;
}
