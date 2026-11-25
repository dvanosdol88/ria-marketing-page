"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { CalculatorState, DEFAULT_STATE } from "@/lib/full-calculator/calculatorState";
import {
  buildFeeProjection,
  effectiveAnnualAdvisoryRate,
  type MarginalFeeTier,
} from "@/lib/feeProjection";
import {
  SP500_DATA_LAST_YEAR,
  SP500_MAX_YEARS,
  clampEndYear,
  clampYearsForEnd,
  countDownYears,
  getWindow,
  getWindowAnnualizedReturnPercent,
  getWindowExtremes,
  getWindowReturnPercents,
  type Sp500Year,
} from "@/data/sp500Returns";
import { capturePostHogEvent } from "@/lib/posthog";

/**
 * Shared state + math for the calculator surfaces.
 *
 * The two new behaviors both live here so every consumer stays numerically
 * identical and only their presentation differs:
 *
 *  1. Market-returns mode swaps the single assumed growth rate for the actual
 *     S&P 500 calendar-year total returns of the most recent `years` years,
 *     replayed in chronological order.
 *  2. The fund/ETF expense ratio is added to the ADVISORY fee, so it burdens
 *     the traditional-advisor track only. That is a deliberate modeling
 *     choice, not an oversight — see FUND_EXPENSE_NOTE.
 */

export const FUND_EXPENSE_MAX_PERCENT = 3;

/**
 * Required adjacent disclosure wherever the fund expense ratio is applied.
 * The choice to charge it to one side only overstates the difference relative
 * to a client who holds the same funds under a flat fee, and the site has to
 * say so plainly.
 */
export const FUND_EXPENSE_NOTE =
  "The fund/ETF expense ratio you enter is added to the asset-based advisory fee, so it is charged " +
  "to the traditional-advisor path only. It shows the total cost of that package. A flat-fee " +
  "investor holding the same funds would also pay those fund expenses, which would narrow the " +
  "difference shown here.";

export type CalculatorEngineState = CalculatorState & {
  /** Replay real S&P 500 history instead of a single assumed rate. */
  useMarketReturns: boolean;
  /** Whether the fund/ETF expense ratio field is revealed. */
  showFundExpenses: boolean;
  /** Last calendar year of the replayed window. Both ends of the year strip
   *  are draggable, so this is no longer pinned to the most recent year. */
  windowEndYear: number;
};

// Starts from exactly the same assumptions as the basic calculator. A
// prototype-era $750,000 default meant switching Advanced <-> Basic silently
// changed the portfolio and therefore every figure on the page, which reads as
// two unrelated tools rather than two views of one.
export const CALCULATOR_DEFAULT_STATE: CalculatorEngineState = {
  ...DEFAULT_STATE,
  useMarketReturns: false,
  showFundExpenses: false,
  windowEndYear: SP500_DATA_LAST_YEAR,
};

export function useCalculatorEngine(
  variantId: string,
  initialState?: Partial<CalculatorEngineState>,
  /** Analytics bucket. Matches the live /calculator page; callers that
   *  need a different surface still pass their own. */
  experienceMode: string = "sww_calculator",
  advisoryFeeTiers?: readonly MarginalFeeTier[] | null,
) {
  const [state, setState] = useState<CalculatorEngineState>({
    ...CALCULATOR_DEFAULT_STATE,
    ...(initialState ?? {}),
  });
  const [assumptionsCustomized, setAssumptionsCustomized] = useState(false);
  const startedRef = useRef(false);

  const update = useCallback(
    (patch: Partial<CalculatorEngineState>) => {
      setAssumptionsCustomized(true);
      if (!startedRef.current) {
        startedRef.current = true;
        capturePostHogEvent("calculator_started", {
          experience_mode: experienceMode,
          marketing_variant: variantId,
          first_changed_field: Object.keys(patch)[0],
        });
      }
      setState((prev) => {
        const next = { ...prev, ...patch };
        // Revealing the expense field should not silently change the math;
        // hiding it must, because a hidden cost is a lie by omission.
        if (patch.showFundExpenses === false) {
          next.mutualFundExpensePercent = 0;
        }
        return next;
      });
    },
    [experienceMode, variantId],
  );

  // Both ends of the window are selectable, so the horizon is bounded by how
  // much history sits behind the chosen end year, not just by the table size.
  const marketEndYear = clampEndYear(state.windowEndYear);
  const marketYears = clampYearsForEnd(state.years, marketEndYear);
  const marketFirstYear = marketEndYear - marketYears + 1;

  const marketWindow: Sp500Year[] = useMemo(
    () => getWindow(marketYears, marketEndYear),
    [marketEndYear, marketYears],
  );

  const marketReturnPercents = useMemo(
    () => getWindowReturnPercents(marketYears, marketEndYear),
    [marketEndYear, marketYears],
  );

  const realizedCagrPercent = useMemo(
    () => getWindowAnnualizedReturnPercent(marketYears, marketEndYear),
    [marketEndYear, marketYears],
  );

  // Display-only combined load. The engine calculates advisory and fund
  // charges separately from the same post-growth monthly balance.
  const effectiveAnnualAdvisoryPercent = advisoryFeeTiers
    ? effectiveAnnualAdvisoryRate(state.portfolioValue, advisoryFeeTiers)
    : state.annualFeePercent;
  const totalAnnualFeePercent =
    effectiveAnnualAdvisoryPercent + (state.showFundExpenses ? state.mutualFundExpensePercent : 0);

  const projection = useMemo(
    () =>
      buildFeeProjection({
        annualFlatFee: state.annualFlatFee,
        initialInvestment: state.portfolioValue,
        years: state.years,
        annualFeePercent: state.annualFeePercent,
        advisoryFeeTiers: advisoryFeeTiers ?? undefined,
        annualFundExpensePercent: state.showFundExpenses
          ? state.mutualFundExpensePercent
          : 0,
        annualGrowthPercent: state.annualGrowthPercent,
        annualReturnPercents: state.useMarketReturns ? marketReturnPercents : undefined,
        firstCalendarYear: state.useMarketReturns ? marketFirstYear : undefined,
      }),
    [
      marketFirstYear,
      marketReturnPercents,
      advisoryFeeTiers,
      state.annualFlatFee,
      state.annualFeePercent,
      state.annualGrowthPercent,
      state.mutualFundExpensePercent,
      state.portfolioValue,
      state.showFundExpenses,
      state.useMarketReturns,
      state.years,
    ],
  );

  const percentLost =
    projection.finalValueWithoutFees > 0
      ? Math.min(
          100,
          Math.max(0, (projection.savings / projection.finalValueWithoutFees) * 100),
        )
      : 0;

  const windowStats = useMemo(() => {
    const { best, worst } = getWindowExtremes(marketYears, marketEndYear);
    return { best, worst, downYears: countDownYears(marketYears, marketEndYear) };
  }, [marketEndYear, marketYears]);

  /** The growth number to SHOW: realized history, or the user's assumption. */
  const effectiveGrowthPercent = state.useMarketReturns
    ? realizedCagrPercent
    : state.annualGrowthPercent;

  const toggleMarketReturns = useCallback(() => {
    setState((prev) => {
      const next = !prev.useMarketReturns;
      capturePostHogEvent("calculator_market_returns_toggled", {
        experience_mode: experienceMode,
        marketing_variant: variantId,
        enabled: next,
      });
      return { ...prev, useMarketReturns: next };
    });
    setAssumptionsCustomized(true);
  }, [experienceMode, variantId]);

  const toggleFundExpenses = useCallback(() => {
    setState((prev) => {
      const next = !prev.showFundExpenses;
      return {
        ...prev,
        showFundExpenses: next,
        // Closing the panel removes the cost; opening it seeds a realistic
        // starting point rather than a zero that looks like "no expenses."
        mutualFundExpensePercent: next
          ? prev.mutualFundExpensePercent || 0.5
          : 0,
      };
    });
    setAssumptionsCustomized(true);
  }, []);

  return {
    assumptionsCustomized,
    effectiveAnnualAdvisoryPercent,
    effectiveGrowthPercent,
    marketEndYear,
    marketFirstYear,
    marketWindow,
    marketYears,
    percentLost,
    projection,
    realizedCagrPercent,
    state,
    toggleFundExpenses,
    toggleMarketReturns,
    totalAnnualFeePercent,
    truncatedHorizon: state.years > SP500_MAX_YEARS,
    update,
    windowStats,
  };
}
