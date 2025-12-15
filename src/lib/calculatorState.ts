export type CalculatorState = {
  portfolioValue: number;
  years: number;
  annualGrowthPercent: number;
  annualFeePercent: number;
};

export const DEFAULT_STATE: CalculatorState = {
  portfolioValue: 500000,
  years: 20,
  annualGrowthPercent: 7.5,
  annualFeePercent: 1,
};

export function parseNumber(value: string | null, fallback: number, min: number, max: number): number {
  if (!value) return fallback;
  const parsed = Number.parseFloat(value);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

export function parseCalculatorState(searchParams: URLSearchParams): CalculatorState {
  return {
    portfolioValue: parseNumber(searchParams.get("portfolio"), DEFAULT_STATE.portfolioValue, 10000, 10000000),
    years: parseNumber(searchParams.get("years"), DEFAULT_STATE.years, 1, 40),
    annualGrowthPercent: parseNumber(searchParams.get("growth"), DEFAULT_STATE.annualGrowthPercent, 0, 20),
    annualFeePercent: parseNumber(searchParams.get("fee"), DEFAULT_STATE.annualFeePercent, 0, 3),
  };
}

export function buildQueryFromState(state: CalculatorState, existingSearchParams?: URLSearchParams): string {
  const params = new URLSearchParams(existingSearchParams ? existingSearchParams.toString() : undefined);

  params.set("portfolio", state.portfolioValue.toString());
  params.set("years", state.years.toString());
  params.set("growth", state.annualGrowthPercent.toString());
  params.set("fee", state.annualFeePercent.toString());

  return params.toString();
}

export function paramsToRecord(params: URLSearchParams): Record<string, string> {
  const record: Record<string, string> = {};
  params.forEach((value, key) => {
    record[key] = value;
  });
  return record;
}
