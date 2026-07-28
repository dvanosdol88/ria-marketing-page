export type CalculatorState = {
  annualFlatFee: number;
  portfolioValue: number;
  years: number;
  annualGrowthPercent: number;
  annualFeePercent: number;
  mutualFundExpensePercent: number;
};

/**
 * Shortest horizon this calculator will model.
 *
 * A one- or two-year window is a fee comparison in name only: the flat fee and
 * the asset-based fee have barely diverged, so the result understates the point
 * the calculator exists to make. Five is the floor for every control that can
 * set a horizon — the Years field, the hero's mini input, the editable headline
 * number, and the ?years= link — so no route into the page can produce a
 * shorter one.
 *
 * Matches the floor on smarterwaywealth.com/save. The two calculators need not
 * be identical, but they must not disagree about what a legal horizon is: a
 * reader who moves between them would otherwise see the same question accept
 * different answers.
 */
export const MIN_HORIZON_YEARS = 5;

export const DEFAULT_STATE: CalculatorState = {
  annualFlatFee: 1200,
  portfolioValue: 1000000,
  years: 20,
  annualGrowthPercent: 8,
  annualFeePercent: 1,
  mutualFundExpensePercent: 0,
};

export function parseNumber(value: string | null, fallback: number, min: number, max: number): number {
  if (!value) return fallback;
  const parsed = Number.parseFloat(value);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

export function parseInteger(value: string | null, fallback: number, min: number, max: number): number {
  if (!value) return fallback;
  const parsed = Number.parseFloat(value);
  if (Number.isNaN(parsed)) return fallback;
  const rounded = Math.round(parsed);
  return Math.min(Math.max(rounded, min), max);
}

export function parseCalculatorState(searchParams: URLSearchParams): CalculatorState {
  return {
    annualFlatFee: parseNumber(searchParams.get("flat"), DEFAULT_STATE.annualFlatFee, 0, 12000),
    portfolioValue: parseNumber(searchParams.get("portfolio"), DEFAULT_STATE.portfolioValue, 250000, 10000000),
    years: parseInteger(searchParams.get("years"), DEFAULT_STATE.years, MIN_HORIZON_YEARS, 40),
    annualGrowthPercent: parseNumber(searchParams.get("growth"), DEFAULT_STATE.annualGrowthPercent, 3, 12),
    annualFeePercent: parseNumber(searchParams.get("fee"), DEFAULT_STATE.annualFeePercent, 0, 3),
    mutualFundExpensePercent: parseNumber(searchParams.get("mfe"), DEFAULT_STATE.mutualFundExpensePercent, 0, 3),
  };
}

export function buildQueryFromState(state: CalculatorState, existingSearchParams?: URLSearchParams): string {
  const params = new URLSearchParams(existingSearchParams ? existingSearchParams.toString() : undefined);

  params.set("flat", state.annualFlatFee.toString());
  params.set("portfolio", state.portfolioValue.toString());
  params.set("years", state.years.toString());
  params.set("growth", state.annualGrowthPercent.toString());
  params.set("fee", state.annualFeePercent.toString());
  params.set("mfe", state.mutualFundExpensePercent.toString());

  return params.toString();
}

export function paramsToRecord(params: URLSearchParams): Record<string, string> {
  const record: Record<string, string> = {};
  params.forEach((value, key) => {
    record[key] = value;
  });
  return record;
}
