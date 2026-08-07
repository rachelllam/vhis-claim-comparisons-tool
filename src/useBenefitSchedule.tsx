// Async wrapper around fetchBenefitSchedule. Mirrors useOperationData.tsx's
// fetch-on-mount pattern, but scoped per (planId, deductible) instead of one
// global gate — benefit schedules are fetched lazily per plan as they're added
// to the comparison, not once at app boot. No Context is needed: the underlying
// fetchBenefitSchedule cache already de-dupes concurrent requests for the same
// product across components.
import { useEffect, useState } from 'react';
import { fetchBenefitSchedule } from './benefitSchedule';
import type { BenefitSchedule } from './benefitSchedule';
import type { SelectedPlan } from './types';

export interface BenefitScheduleState {
  schedule: BenefitSchedule | null;
  error: Error | null;
  loading: boolean;
}

const LOADING: BenefitScheduleState = { schedule: null, error: null, loading: true };

const toError = (e: unknown): Error => (e instanceof Error ? e : new Error(String(e)));

export function scheduleKey(id: string, deductible: number): string {
  return `${id}::${deductible}`;
}

// Per-card usage (e.g. inside ResultCardV2) — a real per-instance component, so
// calling a hook in its body is standard React, not a hooks-in-a-loop violation.
export function useBenefitSchedule(planId: string, deductible: number): BenefitScheduleState {
  const [state, setState] = useState<BenefitScheduleState>(LOADING);

  useEffect(() => {
    let alive = true;
    setState(LOADING);
    // getProductCode() (called first inside fetchBenefitSchedule) throws
    // synchronously for an unrecognized deductible — e.g. a stale value left
    // over after switching plans — so the call itself needs a try/catch, not
    // just a .catch() on the returned promise.
    try {
      fetchBenefitSchedule(planId, deductible)
        .then((schedule) => {
          if (alive) setState({ schedule, error: null, loading: false });
        })
        .catch((e: unknown) => {
          if (alive) setState({ schedule: null, error: toError(e), loading: false });
        });
    } catch (e) {
      setState({ schedule: null, error: toError(e), loading: false });
    }
    return () => {
      alive = false;
    };
  }, [planId, deductible]);

  return state;
}

// Batch usage for MessagePanel: buildByCase/buildByPlan are plain functions
// called inside a .forEach loop, so they can't call a hook per plan themselves —
// this resolves every active plan's schedule in one hook call at the top level.
export function useBenefitSchedules(plans: SelectedPlan[]): Map<string, BenefitScheduleState> {
  const active = plans.filter(Boolean);
  const depKey = active.map((p) => scheduleKey(p.id, p.deductible)).sort().join(',');
  const [map, setMap] = useState<Map<string, BenefitScheduleState>>(new Map());

  useEffect(() => {
    let alive = true;
    setMap(new Map(active.map((p) => [scheduleKey(p.id, p.deductible), LOADING])));
    active.forEach((p) => {
      const key = scheduleKey(p.id, p.deductible);
      try {
        fetchBenefitSchedule(p.id, p.deductible)
          .then((schedule) => {
            if (alive) setMap((prev) => new Map(prev).set(key, { schedule, error: null, loading: false }));
          })
          .catch((e: unknown) => {
            if (alive) setMap((prev) => new Map(prev).set(key, { schedule: null, error: toError(e), loading: false }));
          });
      } catch (e) {
        setMap((prev) => new Map(prev).set(key, { schedule: null, error: toError(e), loading: false }));
      }
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depKey]);

  return map;
}
