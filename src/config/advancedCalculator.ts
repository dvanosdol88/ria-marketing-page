import {
  buildQueryFromState,
  type CalculatorState,
} from "@/lib/calculatorState";
import { SMARTER_WAY_WEALTH_ORIGIN } from "@/config/campaignLinks";

export const ADVANCED_CALCULATOR_URL = `${SMARTER_WAY_WEALTH_ORIGIN}/save`;
export const ADVANCED_CALCULATOR_LABEL = "Advanced Calculator";

export const ADVANCED_CALCULATOR_CARRIED_PARAMS = [
  "portfolio",
  "years",
  "growth",
  "fee",
  "flat",
  "mfe",
] as const;

export function buildAdvancedCalculatorHref(search: URLSearchParams): string {
  const carried = new URLSearchParams();

  for (const key of ADVANCED_CALCULATOR_CARRIED_PARAMS) {
    const value = search.get(key);
    if (value !== null) carried.set(key, value);
  }

  const query = carried.toString();
  return query ? `${ADVANCED_CALCULATOR_URL}?${query}` : ADVANCED_CALCULATOR_URL;
}

export function buildAdvancedCalculatorHrefFromState(state: CalculatorState): string {
  return buildAdvancedCalculatorHref(
    new URLSearchParams(buildQueryFromState(state)),
  );
}
