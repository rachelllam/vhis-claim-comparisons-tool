// Runtime loader + context for the operation data fetched from the Drop endpoint.
// The app was fully synchronous; this introduces the one async boundary. The
// stateful UI only mounts once data is ready (see App.tsx), so downstream
// components can keep reading the data synchronously via useOperationData().
import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { fetchOperationData } from './data';
import type { OperationData } from './data';

const OperationDataContext = createContext<OperationData | null>(null);

// Read the loaded operation data. Throws if used outside the provider — which
// only happens if a component renders before the loading gate, i.e. a bug.
export function useOperationData(): OperationData {
  const ctx = useContext(OperationDataContext);
  if (!ctx) {
    throw new Error('useOperationData must be used inside <OperationDataProvider>');
  }
  return ctx;
}

export function OperationDataProvider({ value, children }: { value: OperationData; children: ReactNode }) {
  return <OperationDataContext.Provider value={value}>{children}</OperationDataContext.Provider>;
}

export interface OperationDataLoad {
  data: OperationData | null;
  error: Error | null;
  loading: boolean;
  retry: () => void;
}

// Fetch on mount (and on retry). Aborts in-flight requests on unmount / reload,
// which also makes React 18 StrictMode's double-invoke harmless.
export function useOperationDataLoader(): OperationDataLoad {
  const [data, setData] = useState<OperationData | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const ctrl = new AbortController();
    let active = true;
    setData(null);
    setError(null);
    fetchOperationData(ctrl.signal)
      .then((d) => {
        if (active) setData(d);
      })
      .catch((e: unknown) => {
        if (ctrl.signal.aborted || !active) return;
        setError(e instanceof Error ? e : new Error(String(e)));
      });
    return () => {
      active = false;
      ctrl.abort();
    };
  }, [reloadKey]);

  const retry = () => setReloadKey((k) => k + 1);
  return { data, error, loading: !data && !error, retry };
}
