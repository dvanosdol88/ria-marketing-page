// Firm-site copy (smarterwaywealth.com, same file name) for the hidden
// /calculator page only (fee-lab stage 1, section 1). This site's own
// file of the same name is separate and unchanged.

import {
  MIN_HORIZON_YEARS,
  SP500_DATA_LAST_YEAR,
  clampEndYear,
} from "../../data/sp500Returns.ts";
import {
  type MarginalFeeTier,
  validateMarginalFeeTiers,
} from "../feeProjection.ts";

export type CalculatorState = {
  annualFlatFee: number;
  portfolioValue: number;
  years: number;
  annualGrowthPercent: number;
  annualFeePercent: number;
  mutualFundExpensePercent: number;
};

export type DetailedCalculatorState = CalculatorState & {
  feeMode: "single" | "tiered";
  feeTiers: MarginalFeeTier[];
  returnMode: "steady" | "market";
  marketEndYear: number;
};

export const CALCULATOR_MAX_PORTFOLIO = 10_000_000;
export const CALCULATOR_MAX_SINGLE_RATE = 3;

export const DEFAULT_STATE: CalculatorState = {
  annualFlatFee: 1200,
  portfolioValue: 1000000,
  years: 20,
  annualGrowthPercent: 8,
  annualFeePercent: 1,
  mutualFundExpensePercent: 0,
};

export const DEFAULT_TIERED_SCHEDULE: MarginalFeeTier[] = [
  { upTo: 1_000_000, annualRatePercent: 1.5 },
  { upTo: 2_000_000, annualRatePercent: 1 },
  { upTo: null, annualRatePercent: 0.75 },
];

export const DEFAULT_DETAILED_STATE: DetailedCalculatorState = {
  ...DEFAULT_STATE,
  feeMode: "single",
  feeTiers: DEFAULT_TIERED_SCHEDULE,
  returnMode: "market",
  marketEndYear: SP500_DATA_LAST_YEAR,
};

function parseNumber(value: string | null, fallback: number, min: number, max: number): number {
  if (!value) return fallback;
  const parsed = Number.parseFloat(value);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

function parseInteger(value: string | null, fallback: number, min: number, max: number): number {
  if (!value) return fallback;
  const parsed = Number.parseFloat(value);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(Math.max(Math.round(parsed), min), max);
}

export function parseCalculatorState(searchParams: URLSearchParams): CalculatorState {
  return {
    annualFlatFee: parseNumber(searchParams.get("flat"), DEFAULT_STATE.annualFlatFee, 0, 12000),
    portfolioValue: parseNumber(searchParams.get("portfolio"), DEFAULT_STATE.portfolioValue, 250000, CALCULATOR_MAX_PORTFOLIO),
    years: parseInteger(searchParams.get("years"), DEFAULT_STATE.years, MIN_HORIZON_YEARS, 40),
    annualGrowthPercent: parseNumber(searchParams.get("growth"), DEFAULT_STATE.annualGrowthPercent, 3, 15),
    annualFeePercent: parseNumber(searchParams.get("fee"), DEFAULT_STATE.annualFeePercent, 0, CALCULATOR_MAX_SINGLE_RATE),
    mutualFundExpensePercent: parseNumber(searchParams.get("mfe"), DEFAULT_STATE.mutualFundExpensePercent, 0, 3),
  };
}

export function serializeFeeTiers(tiers: readonly MarginalFeeTier[]): string {
  const validation = validateMarginalFeeTiers(tiers);
  if (!validation.valid) throw new Error("error" in validation ? validation.error : "Invalid fee tiers.");
  return validation.tiers
    .map((tier) => `${tier.upTo === null ? "*" : tier.upTo}@${tier.annualRatePercent}`)
    .join(";");
}

export function parseFeeTiers(value: string | null): MarginalFeeTier[] | null {
  if (!value || value.length > 240) return null;
  const tiers = value.split(";").map((part) => {
    const [boundary, rate] = part.split("@");
    return {
      upTo: boundary === "*" ? null : Number(boundary),
      annualRatePercent: Number(rate),
    } satisfies MarginalFeeTier;
  });
  const validation = validateMarginalFeeTiers(tiers);
  return validation.valid ? validation.tiers : null;
}

export function parseDetailedCalculatorState(searchParams: URLSearchParams): DetailedCalculatorState {
  const base = parseCalculatorState(searchParams);
  const parsedTiers = parseFeeTiers(searchParams.get("tiers"));
  const feeMode = searchParams.get("feeMode") === "tiered" && parsedTiers ? "tiered" : "single";
  return {
    ...base,
    portfolioValue: parseNumber(searchParams.get("portfolio"), base.portfolioValue, 0, 50_000_000),
    feeMode,
    feeTiers: parsedTiers ?? DEFAULT_TIERED_SCHEDULE.map((tier) => ({ ...tier })),
    returnMode: searchParams.get("return") === "steady" ? "steady" : "market",
    marketEndYear: clampEndYear(
      parseInteger(searchParams.get("end"), SP500_DATA_LAST_YEAR, 1986, SP500_DATA_LAST_YEAR),
    ),
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

export function buildDetailedCalculatorQuery(
  state: DetailedCalculatorState,
  existingSearchParams?: URLSearchParams,
): string {
  const params = new URLSearchParams(buildQueryFromState(state, existingSearchParams));
  params.set("return", state.returnMode);
  params.set("end", state.marketEndYear.toString());
  params.set("feeMode", state.feeMode);
  if (state.feeMode === "tiered") params.set("tiers", serializeFeeTiers(state.feeTiers));
  else params.delete("tiers");
  params.delete("mode");
  params.delete("calc");
  return params.toString();
}

export function paramsToRecord(params: URLSearchParams): Record<string, string> {
  const record: Record<string, string> = {};
  params.forEach((value, key) => {
    record[key] = value;
  });
  return record;
}
