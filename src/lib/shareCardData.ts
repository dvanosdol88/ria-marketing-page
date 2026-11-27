// CANON: shared verbatim with the sister repo (youarepayingtoomuch.com,
// D:\ria-marketing-page). Edit both repos in the same session or CI fails.
// See CALCULATOR-CANON.md.

import type { DetailedCalculatorState } from "./full-calculator/calculatorState.ts";
import {
  buildFeeProjection,
  effectiveAnnualAdvisoryRate,
  validateMarginalFeeTiers,
  type FeeProjectionResult,
  type MarginalFeeTier,
} from "./feeProjection.ts";
import {
  clampYearsForEnd,
  getWindowAnnualizedReturnPercent,
  getWindowReturnPercents,
} from "../data/sp500Returns.ts";

export interface ShareCardData {
  /** Years actually used after market-mode clamping to available history. */
  effectiveYears: number;
  /** First calendar year of the replayed window (market mode only). */
  marketFirstYear: number;
  projection: FeeProjectionResult;
  /** The tiers actually applied — validated tiers in tiered mode, else a
   * single synthetic tier so callers never branch on feeMode again. */
  activeTiers: MarginalFeeTier[];
  startingEffectiveRate: number;
  /** e.g. "S&P 500 total returns, 2006–2025" or "8% steady annual return" */
  returnLabel: string;
  /** e.g. "1.00% asset-based fee" or "Tiered schedule (3 tiers, 1.250% starting effective rate)" */
  feeLabel: string;
  monthlyFlatFee: number;
  /** Mirrors state.returnMode — passed through so callers building a
   * shareSummary input never have to re-derive it from the raw state. */
  returnMode: DetailedCalculatorState["returnMode"];
  /** Steady annual growth rate, or the market window's annualized (CAGR)
   * return — whichever `returnMode` is active. */
  growthPercent: number;
  /** Calendar-year window label for market mode, e.g. "2006–2025". */
  marketWindow: string;
}

/**
 * Assembles the exact same fee projection and derived labels that
 * `CanonCalculatorExperience` builds client-side, from a `DetailedCalculatorState`
 * alone (market-mode year clamping via `clampYearsForEnd`, tier validation
 * with fallback to a single rate). Both the `/calculator/share-card` image
 * route and the calculator page's `generateMetadata` call this so the share
 * image, the page description, and the on-page numbers can never disagree.
 */
export function buildShareCardData(state: DetailedCalculatorState): ShareCardData {
  const effectiveYears = state.returnMode === "market"
    ? clampYearsForEnd(state.years, state.marketEndYear)
    : state.years;
  const marketFirstYear = state.marketEndYear - effectiveYears + 1;
  const marketReturns = state.returnMode === "market"
    ? getWindowReturnPercents(effectiveYears, state.marketEndYear)
    : undefined;

  const tierValidation = validateMarginalFeeTiers(state.feeTiers);
  const useTiers = state.feeMode === "tiered" && tierValidation.valid;

  const projection = buildFeeProjection({
    annualFlatFee: state.annualFlatFee,
    initialInvestment: state.portfolioValue,
    years: effectiveYears,
    annualFeePercent: state.annualFeePercent,
    advisoryFeeTiers: useTiers && tierValidation.valid ? tierValidation.tiers : undefined,
    annualFundExpensePercent: state.mutualFundExpensePercent,
    annualGrowthPercent: state.annualGrowthPercent,
    annualReturnPercents: marketReturns,
    firstCalendarYear: state.returnMode === "market" ? marketFirstYear : undefined,
  });

  const activeTiers: MarginalFeeTier[] = useTiers && tierValidation.valid
    ? tierValidation.tiers
    : [{ upTo: null, annualRatePercent: state.annualFeePercent }];
  const startingEffectiveRate = effectiveAnnualAdvisoryRate(state.portfolioValue, activeTiers);

  const returnLabel = state.returnMode === "market"
    ? `S&P 500 total returns, ${marketFirstYear}–${state.marketEndYear}`
    : `${state.annualGrowthPercent}% steady annual return`;
  // Branch on `useTiers` (validated), not the raw `state.feeMode` field, so
  // this can never disagree with `activeTiers`/`advisoryFeeTiers` above: a
  // tiered request with tiers that fail validation already falls back to a
  // single synthetic tier for the projection, and the label now falls back
  // with it. `parseDetailedCalculatorState` already guarantees the two never
  // diverge for any state reachable through the real query-string API (it
  // forces `feeMode` back to "single" whenever tiers don't parse/validate),
  // so this only changes behavior for a hand-constructed, internally
  // inconsistent state passed directly to this function.
  const feeLabel = useTiers
    ? `Tiered schedule (${activeTiers.length} tiers, ${startingEffectiveRate.toFixed(3)}% starting effective rate)`
    : `${state.annualFeePercent.toFixed(2)}% asset-based fee`;
  const growthPercent = state.returnMode === "market"
    ? getWindowAnnualizedReturnPercent(effectiveYears, state.marketEndYear)
    : state.annualGrowthPercent;

  return {
    effectiveYears,
    marketFirstYear,
    projection,
    activeTiers,
    startingEffectiveRate,
    returnLabel,
    feeLabel,
    monthlyFlatFee: state.annualFlatFee / 12,
    returnMode: state.returnMode,
    growthPercent,
    marketWindow: `${marketFirstYear}–${state.marketEndYear}`,
  };
}
