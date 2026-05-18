"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

export type SavingsBarData = {
  savings: number;
  years: number;
  annualFeePercent: number;
};

type SavingsBarState = {
  data: SavingsBarData | null;
  setData: (value: SavingsBarData | null) => void;
};

const SavingsBarContext = createContext<SavingsBarState | null>(null);

export function SavingsBarProvider({ children }: { children: React.ReactNode }) {
  const [data, setDataState] = useState<SavingsBarData | null>(null);

  const setData = useCallback((value: SavingsBarData | null) => {
    setDataState((prev) => {
      if (prev === value) return prev;
      if (prev && value && prev.savings === value.savings && prev.years === value.years && prev.annualFeePercent === value.annualFeePercent) {
        return prev;
      }
      return value;
    });
  }, []);

  const value = useMemo(() => ({ data, setData }), [data, setData]);

  return <SavingsBarContext.Provider value={value}>{children}</SavingsBarContext.Provider>;
}

export function useSavingsBar(): SavingsBarState {
  const ctx = useContext(SavingsBarContext);
  if (!ctx) {
    return { data: null, setData: () => {} };
  }
  return ctx;
}
