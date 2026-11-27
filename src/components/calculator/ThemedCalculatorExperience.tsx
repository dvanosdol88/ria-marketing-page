"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CostAnalysisCalculator } from "@/components/full-calculator/CostAnalysisCalculator";
import { MarketTimeMachine } from "@/components/calculator/MarketTimeMachine";
import { CalculatorChrome } from "@/components/calculator/CalculatorChrome";
import { CalculatorStickyHeader } from "@/components/calculator/CalculatorStickyHeader";
import { CalculatorDisclosures } from "@/components/calculator/CalculatorDisclosures";
import { CALCULATOR_MODE_PARAM, type CalculatorMode } from "@/lib/calculatorMode";
import {
  parseCalculatorState,
  type CalculatorState,
} from "@/lib/full-calculator/calculatorState";
import {
  effectiveAnnualAdvisoryRate,
  type MarginalFeeTier,
} from "@/lib/feeProjection";
import { capturePostHogEvent } from "@/lib/posthog";
import { SP500_DATA_LAST_YEAR } from "@/data/sp500Returns";
import type { CalculatorEngineState } from "./useCalculatorEngine";

/**
 * Everything a caller needs to compose additional sections (share/details/
 * poll) below the shared chrome, kept live against whichever mode the
 * reader is using. Additive: existing callers that don't pass
 * `onExperienceStateChange` are unaffected — see that prop below.
 */
export type ThemedCalculatorSnapshot = {
  mode: CalculatorMode;
  calculatorState: CalculatorState;
  /** Last calendar year of the replayed market window. Meaningful only when
   *  `mode === "advanced"`; carries the most recently reported value the
   *  rest of the time. */
  marketEndYear: number;
  savedFeeSchedule: MarginalFeeTier[] | null;
};

/** The page hands search params down as a plain record; the parser wants the
 *  real thing. Array values come from repeated keys — take the first. */
function searchParamsToQuery(
  searchParams?: Record<string, string | string[] | undefined>,
): URLSearchParams {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams ?? {})) {
    const first = Array.isArray(value) ? value[0] : value;
    if (typeof first === "string") query.set(key, first);
  }
  return query;
}

/**
 * The whole calculator area under one roof: one control row, one description
 * line, and whichever calculator is selected.
 *
 * Switching Advanced <-> Basic stays on the same light surface.
 */
export function ThemedCalculatorExperience({
  experienceMode = "sww_calculator",
  initialMarketEndYear,
  initialMode = "advanced",
  initialSavedFeeSchedule = null,
  onExperienceStateChange,
  searchParams,
  showStickyHeader = false,
  simpleView = false,
  afterResults = null,
  resultsReplacement = null,
  variantId = "calculator-canon",
}: {
  /** Tags analytics by surface. Matches the live /calculator page
   *  (CanonCalculatorExperience always passes "sww_calculator"). */
  experienceMode?: string;
  /** Seeds the advanced (market) calculator's initial replay window end
   *  year — additive, optional; omitting it leaves the historical default
   *  (SP500_DATA_LAST_YEAR) unchanged. Threaded into MarketTimeMachine's
   *  own `initialState.windowEndYear`, which it already reads (A3 fix
   *  wave, Finding 1). */
  initialMarketEndYear?: number;
  initialMode?: CalculatorMode;
  /** Seeds the saved tiered fee schedule both calculators start with —
   *  additive, optional, defaults to null (no schedule, the historical
   *  behavior). Without this, a URL restoring a tiered scenario would
   *  render with the schedule mirrored in a caller's own state but never
   *  actually applied to the live calculation (A3 fix wave, Finding 1). */
  initialSavedFeeSchedule?: MarginalFeeTier[] | null;
  /** Additive, optional: fires whenever mode, assumptions, the saved fee
   *  schedule, or the market window's end year change, so a caller composing
   *  more sections below (share/details/poll) can stay wired to the exact
   *  state the reader is manipulating above — the "one brain" requirement.
   *  Omitting it leaves every existing behavior byte-identical. Pass a
   *  referentially stable callback (e.g. a bare `useState` setter) — an
   *  inline function recreated every render would make this effect fire
   *  every render instead of only on real changes. */
  onExperienceStateChange?: (snapshot: ThemedCalculatorSnapshot) => void;
  searchParams?: Record<string, string | string[] | undefined>;
  showStickyHeader?: boolean;
  /** The step-by-step /calculator's first results (David, 2026-11-10): the
   *  Steady return ending values and chart only, with no Steady/Market row
   *  and no assumption controls. Optional; omitted, nothing changes. */
  simpleView?: boolean;
  /** Rendered under the results' fee note (the two wide buttons). */
  afterResults?: ReactNode;
  /** Shown in place of the ending values and chart (the step calculator's answer). */
  resultsReplacement?: ReactNode;
  variantId?: string;
}) {
  const [mode, setMode] = useState<CalculatorMode>(initialMode);
  const [expanded, setExpanded] = useState(true);
  const [potentialSavings, setPotentialSavings] = useState<number | null>(null);
  const [savedFeeSchedule, setSavedFeeSchedule] = useState<MarginalFeeTier[] | null>(initialSavedFeeSchedule);
  const prefersReducedMotion = useReducedMotion();

  // The two calculators are very different heights. Without this the card
  // snaps from one to the other; with it, the card grows or shrinks into the
  // new shape while the content fades in. Measured rather than guessed,
  // because the height also changes as the reader edits assumptions.
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [measuredHeight, setMeasuredHeight] = useState<number | null>(null);

  useEffect(() => {
    const node = contentRef.current;
    if (!node || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(([entry]) => {
      // A zero reading means the node is detached or hidden, not that the
      // calculator has no height — committing it would collapse the card.
      const next = entry.contentRect.height;
      if (next > 0) setMeasuredHeight(next);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [expanded]);

  const selectMode = (next: CalculatorMode) => {
    if (next === mode) return;
    capturePostHogEvent("calculator_mode_switched", {
      from_mode: mode,
      to_mode: next,
      experience_mode: experienceMode,
      cta_location: "calculator_chrome",
    });
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (next === "basic") params.set(CALCULATOR_MODE_PARAM, "basic");
      else params.delete(CALCULATOR_MODE_PARAM);
      const query = params.toString();
      window.history.replaceState(
        window.history.state,
        "",
        `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`,
      );
    }
    // Never leave the previous mode's result in the sticky summary while the
    // newly selected calculator produces its own projection.
    setPotentialSavings(null);
    setMode(next);
  };


  const basicSearchParams =
    mode === "basic"
      ? { ...(searchParams ?? {}), [CALCULATOR_MODE_PARAM]: "basic" }
      : searchParams;

  // Opening assumptions for the advanced calculator, read from the link that
  // brought the reader here. The basic calculator has always done this; the
  // advanced one ignored the link entirely, so anyone arriving from the
  // calculator on youarepayingtoomuch.com had to key their numbers in twice.
  //
  // Computed once, not per render: this seeds the calculator's opening state,
  // and re-deriving it later would fight the reader's own edits. Threading
  // initialMarketEndYear into windowEndYear (A3 fix wave, Finding 1) is the
  // one field parseCalculatorState itself doesn't carry — MarketTimeMachine
  // already reads windowEndYear off whatever initialState it's given.
  const [advancedInitialState] = useState<CalculatorState & Partial<Pick<CalculatorEngineState, "windowEndYear">>>(() => {
    const base = parseCalculatorState(searchParamsToQuery(searchParams));
    return initialMarketEndYear === undefined ? base : { ...base, windowEndYear: initialMarketEndYear };
  });
  const [calculatorState, setCalculatorState] = useState<CalculatorState>(advancedInitialState);
  // Only meaningful while mode === "advanced"; retains its last reported
  // value the rest of the time rather than resetting, so a caller reading
  // the snapshot mid-switch never sees a stale default flash in. Seeded
  // from initialMarketEndYear so a caller mirroring this value (e.g.
  // CanonCalculatorExperience's own snapshot) agrees with it from the very
  // first paint, not just after MarketTimeMachine's mount-time report.
  const [marketEndYear, setMarketEndYear] = useState<number>(initialMarketEndYear ?? SP500_DATA_LAST_YEAR);
  const stickyAnnualFeePercent = useMemo(
    () => savedFeeSchedule
      ? effectiveAnnualAdvisoryRate(calculatorState.portfolioValue, savedFeeSchedule)
      : calculatorState.annualFeePercent,
    [calculatorState.annualFeePercent, calculatorState.portfolioValue, savedFeeSchedule],
  );
  const applyFeeSchedule = useCallback((schedule: MarginalFeeTier[]) => {
    setSavedFeeSchedule(schedule.map((tier) => ({ ...tier })));
  }, []);
  const returnToScalarFee = useCallback(() => setSavedFeeSchedule(null), []);
  const reportBasicState = useCallback((state: CalculatorState) => {
    setCalculatorState(state);
  }, []);
  // MarketTimeMachine already reports its clamped market-window end year as
  // a second argument (see MarketTimeMachine.tsx's `onStateChange?.(state,
  // calc.marketEndYear)`); this only needed to start reading it.
  const reportMarketState = useCallback((state: CalculatorState, endYear: number) => {
    setCalculatorState(state);
    setMarketEndYear(endYear);
  }, []);

  useEffect(() => {
    onExperienceStateChange?.({ mode, calculatorState, marketEndYear, savedFeeSchedule });
  }, [calculatorState, marketEndYear, mode, onExperienceStateChange, savedFeeSchedule]);

  return (
    <section
      // Everything inside answers to this one attribute. Nothing outside the
      // calculator is affected — the rest of the site stays light.
      // Light only. The attribute stays because the calculator resolves every
      // colour from the variables it scopes.
      data-calc-theme="light"
      aria-label="Fee comparison calculator"
      className="scroll-mt-24 bg-[var(--calc-stage)] pb-10 transition-colors duration-300"
      id="calculator"
    >
      {showStickyHeader && potentialSavings !== null ? (
        <CalculatorStickyHeader
          savings={potentialSavings}
          years={calculatorState.years}
          annualFeePercent={stickyAnnualFeePercent}
          isBlendedFee={Boolean(savedFeeSchedule)}
          monthlyFlatFee={calculatorState.annualFlatFee / 12}
        />
      ) : null}
      {/* max-w-7xl is what the basic calculator's own shell uses, so both
          calculators occupy the same column and the switch does not resize
          the page under the reader. */}
      <div className="px-5 pt-4 sm:px-8">
        <div className="mx-auto max-w-7xl">
          {simpleView ? null : (
            <CalculatorChrome
              expanded={expanded}
              mode={mode}
              onSelectMode={selectMode}
              onToggleExpanded={() => setExpanded((open) => !open)}
            />
          )}

          <AnimatePresence initial={false}>
            {expanded ? (
              <motion.div
                id="calculator-panel"
                initial={prefersReducedMotion ? false : { height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.42, ease: [0.16, 1, 0.3, 1] }}
                // This panel IS the card. Neither calculator draws its own, which
                // is what left one square-and-borderless and the other rounded
                // and bordered depending on which was showing.
                className={`overflow-hidden border border-[var(--calc-border-strong)] bg-[var(--calc-panel)] ${
                  simpleView ? "rounded-md" : "rounded-b-md border-t-0"
                }`}
              >
                {/* Height animates between the two, so the card grows or shrinks
                    into the new shape instead of snapping to it. */}
                <motion.div
                  animate={{ height: measuredHeight ?? "auto" }}
                  transition={
                    prefersReducedMotion
                      ? { duration: 0 }
                      : { duration: 0.42, ease: [0.16, 1, 0.3, 1] }
                  }
                  style={{ overflow: "hidden" }}
                >
                  {/* The measured node must NOT be the one that swaps: a keyed
                      element is replaced on every switch, which would leave the
                      observer watching a detached node reporting zero. */}
                  <div ref={contentRef}>
                    {/* Keyed, with no exit animation. Waiting for the old
                        calculator to fade out would leave the card empty in
                        between; instead the new one fades in as it grows. */}
                    <motion.div
                      key={mode}
                      initial={prefersReducedMotion ? false : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: prefersReducedMotion ? 0 : 0.3, ease: "easeOut" }}
                    >
                      {mode === "advanced" && !simpleView ? (
                        <MarketTimeMachine
                          advisoryFeeTiers={savedFeeSchedule}
                          experienceMode={experienceMode}
                          initialState={advancedInitialState}
                          onApplyFeeSchedule={applyFeeSchedule}
                          onPotentialSavingsChange={setPotentialSavings}
                          onReturnToScalarFee={returnToScalarFee}
                          onStateChange={reportMarketState}
                          variantId={variantId}
                        />
                      ) : (
                        <CostAnalysisCalculator
                          advisoryFeeTiers={savedFeeSchedule}
                          onApplyFeeSchedule={applyFeeSchedule}
                          onPotentialSavingsChange={setPotentialSavings}
                          onReturnToScalarFee={returnToScalarFee}
                          onStateChange={reportBasicState}
                          searchParams={basicSearchParams}
                          embedded
                          resultsOnly={simpleView}
                          afterResults={afterResults}
                          resultsReplacement={resultsReplacement}
                        />
                      )}
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            ) : null}
          </AnimatePresence>
          <CalculatorDisclosures usesTieredFeeSchedule={Boolean(savedFeeSchedule)} />
        </div>
      </div>
    </section>
  );
}
