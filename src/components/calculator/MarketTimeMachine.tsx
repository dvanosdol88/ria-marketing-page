"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";
import { AssumptionStepper } from "@/components/calculator/AssumptionStepper";
import {
  FeeScheduleSummaryRow,
  InlineFeeScheduleEditor,
  TieredAdvisoryFeeDisplay,
  type InlineFeeScheduleEditorHandle,
} from "@/components/calculator/InlineFeeScheduleEditor";
import {
  MIN_HORIZON_YEARS,
  SP500_ANNUAL_TOTAL_RETURNS,
  SP500_DATA_FIRST_YEAR,
  SP500_DATA_LAST_YEAR,
  SP500_DISCLOSURE,
  SP500_MAX_YEARS,
  clampWindowEndYear,
  clampWindowStartYear,
  earliestWindowEndYear,
  latestWindowStartYear,
} from "@/data/sp500Returns";
import {
  formatCompactCurrency,
  formatCurrency,
  formatCurrencyFloored,
} from "@/lib/format";
import type { MarginalFeeTier } from "@/lib/feeProjection";
import { CALCULATOR_MAX_PORTFOLIO, CALCULATOR_MAX_SINGLE_RATE } from "@/lib/full-calculator/calculatorState";
import {
  FUND_EXPENSE_MAX_PERCENT,
  FUND_EXPENSE_NOTE,
  useCalculatorEngine,
  type CalculatorEngineState,
} from "./useCalculatorEngine";

/**
 * Prototype C — "Market Time Machine".
 *
 * Radically different surface from the light, card-based production
 * calculator: a full-bleed dark stage where the 40 years of real S&P 500
 * history ARE the interface.
 *
 *  - The 1986–2025 return strip is the Years control. A window anchored to
 *    2025 extends left; dragging (or arrowing) its left handle sets
 *    calc.state.years. A numeric readout beside it stays editable.
 *  - A transport (play / pause / restart) walks the projection forward one
 *    calendar year at a time at ~380ms per year, counting the year label up,
 *    badging each year's actual return, drawing both balance lines, and
 *    filling the fee gap in red as it opens.
 *  - The playhead and the scrubber are the same object: after a run you can
 *    drag the playhead back and read the balances at any year.
 *  - Assumptions collapse into a compact dark rail.
 *
 * All math comes from useCalculatorEngine — nothing is reimplemented here.
 */

/* ---------------------------------------------------------------------------
   Constants
   --------------------------------------------------------------------------- */

/** Milliseconds of playback per projection year. 20 years ≈ 7.6 seconds. */
const MS_PER_YEAR = 380;

/** One-tap windows, each ending at the last data year. */
const WINDOW_PRESETS = [
  { years: 10, label: "Last 10 yrs" },
  { years: 20, label: "Last 20 yrs" },
  { years: 30, label: "Last 30 yrs" },
  { years: SP500_MAX_YEARS, label: `All ${SP500_MAX_YEARS}` },
] as const;

const CHART_W = 720;
const CHART_H = 260;

/** Largest single-year magnitude in the 40-year record, used to scale tiles. */
const MAX_TILE_MAGNITUDE = SP500_ANNUAL_TOTAL_RETURNS.reduce(
  (max, entry) => Math.max(max, Math.abs(entry.totalReturnPercent)),
  1,
);

const COLORS = {
  up: "var(--calc-accent-solid)",
  upDim: "var(--calc-accent-dim)",
  down: "var(--calc-loss)",
  downDim: "var(--calc-loss-dim)",
  inert: "var(--calc-inert)",
  flatLine: "var(--calc-accent)",
  aumLine: "var(--calc-aum)",
  gap: "var(--calc-loss)",
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const signedPercent = (value: number) =>
  `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;

/* ---------------------------------------------------------------------------
   Dark control-rail stepper
   Same commit mechanics as the shared light control, restyled for the stage.
   --------------------------------------------------------------------------- */

/* ---------------------------------------------------------------------------
   Dark toolbar pieces
   --------------------------------------------------------------------------- */

function TransportButton({
  children,
  label,
  onClick,
  primary = false,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`inline-flex min-h-11 items-center gap-2 rounded-md border px-3.5 text-[13px] font-extrabold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--calc-accent)] sm:text-sm ${
        primary
          ? "border-[var(--calc-accent)] bg-[var(--calc-accent)] text-[var(--calc-stage-deep)] hover:bg-[var(--calc-accent-mid)]"
          : "border-[var(--calc-line-20)] bg-[var(--calc-wash-05)] text-[var(--calc-body-soft)] hover:bg-[var(--calc-wash-12)]"
      }`}
    >
      {children}
    </button>
  );
}

/* ---------------------------------------------------------------------------
   Market Time Machine — the advanced calculator.
   Forty years of real S&P 500 history as the interface: drag a window over
   actual calendar years to set the horizon, then play it forward.
   --------------------------------------------------------------------------- */

export function MarketTimeMachine({
  advisoryFeeTiers = null,
  experienceMode = "sww_calculator",
  initialState,
  onApplyFeeSchedule,
  onPotentialSavingsChange,
  onReturnToScalarFee,
  onStateChange,
  variantId = "calculator-canon",
}: {
  advisoryFeeTiers?: readonly MarginalFeeTier[] | null;
  experienceMode?: string;
  /**
   * Opening assumptions, normally read from the link that brought the reader
   * here. Someone arriving from the calculator on youarepayingtoomuch.com has
   * already entered their own portfolio, fee and horizon; landing on the
   * house defaults would make them do it twice.
   */
  initialState?: Partial<CalculatorEngineState>;
  onApplyFeeSchedule?: (schedule: MarginalFeeTier[]) => void;
  /** Reports the current result to surrounding calculator chrome. */
  onPotentialSavingsChange?: (savings: number) => void;
  onReturnToScalarFee?: () => void;
  /** Reports current assumptions to the shared sticky summary. */
  onStateChange?: (state: CalculatorEngineState, marketEndYear: number) => void;
  variantId?: string;
} = {}) {
  // Market mode is ON by default here — the whole concept depends on it.
  const calc = useCalculatorEngine(
    variantId,
    {
      mutualFundExpensePercent: 0,
      // Spread before the two flags below so the reader's own numbers win over
      // the house defaults, but cannot switch off what this calculator is.
      ...initialState,
      // Market returns is not optional here - it IS the advanced calculator -
      // and the expense field is always visible rather than behind a switch.
      useMarketReturns: true,
      showFundExpenses: true,
    },
    experienceMode,
    advisoryFeeTiers,
  );
  const { projection, state, update } = calc;
  const feeScheduleEditorRef = useRef<InlineFeeScheduleEditorHandle>(null);
  const [feeScheduleEditorOpen, setFeeScheduleEditorOpen] = useState(false);

  useEffect(() => {
    onPotentialSavingsChange?.(projection.savings);
  }, [onPotentialSavingsChange, projection.savings]);

  useEffect(() => {
    onStateChange?.(state, calc.marketEndYear);
  }, [calc.marketEndYear, onStateChange, state]);

  const prefersReducedMotion = useReducedMotion();

  const [isPlaying, setIsPlaying] = useState(false);
  /** Float playhead position, 0 .. totalYears. Fractional while animating. */
  const [progress, setProgress] = useState(state.years);

  const trackRef = useRef<HTMLDivElement | null>(null);
  /** The bar pane + line chart stack — the surface the playhead rides. */
  const plotRef = useRef<HTMLDivElement | null>(null);
  /** Which end of the window the current drag owns, or null when idle. */
  const windowDragRef = useRef<"start" | "end" | null>(null);
  const headDragRef = useRef(false);
  /**
   * Mirror of `progress` for the animation loop and event handlers. Written
   * only from effects and handlers, never during render, so the playback loop
   * can read the live position without re-subscribing every frame.
   */
  const progressRef = useRef(state.years);

  const applyProgress = useCallback((next: number) => {
    progressRef.current = next;
    setProgress(next);
  }, []);

  const marketMode = state.useMarketReturns;

  /* --- Derived series geometry ------------------------------------------- */

  // Always derive from the series itself so a years change and a progress
  // change landing in different renders can never index out of bounds.
  const totalYears = Math.max(1, projection.series.length - 1);
  const clampedProgress = clamp(progress, 0, totalYears);
  const wholeIndex = Math.min(totalYears, Math.floor(clampedProgress));
  const frac = clampedProgress - wholeIndex;
  const nextIndex = Math.min(totalYears, wholeIndex + 1);

  const rowLow = projection.series[wholeIndex];
  const rowHigh = projection.series[nextIndex];

  const liveFlat = rowLow.withoutFees + (rowHigh.withoutFees - rowLow.withoutFees) * frac;
  const liveAum = rowLow.withFees + (rowHigh.withFees - rowLow.withFees) * frac;
  const liveGap = Math.max(0, liveFlat - liveAum);
  // Same definition as calc.percentLost, but for the year under the playhead,
  // so the corner readout's percentage counts with its dollar figure and the
  // two can never disagree mid-run. At the end of a run it equals percentLost.
  const livePercentLost =
    liveFlat > 0 ? Math.min(100, Math.max(0, (liveGap / liveFlat) * 100)) : 0;

  // Both come from the engine, which is the thing that clamps them against the
  // available history. Deriving the first year from raw state instead lets the
  // label disagree with the years actually replayed.
  const windowEndYear = calc.marketEndYear;
  const windowFirstYear = calc.marketFirstYear;
  const windowYears = calc.marketYears;

  // Which calendar year is "on screen" right now. Mid-flight (fractional
  // progress) that is the year being lived through; parked on a year boundary
  // it is the year that just closed, because the balances shown are its
  // year-end values.
  const onYearBoundary = frac === 0 && wholeIndex > 0;
  const activeOffset = clamp(
    onYearBoundary ? wholeIndex - 1 : wholeIndex,
    0,
    Math.max(0, calc.marketWindow.length - 1),
  );
  const activeMarketYear = calc.marketWindow[activeOffset];
  const activeReturnPercent = marketMode
    ? (activeMarketYear?.totalReturnPercent ?? 0)
    : state.annualGrowthPercent;
  const activeLabel = marketMode
    ? String(activeMarketYear?.year ?? windowFirstYear)
    : `Year ${activeOffset + 1}`;

  const settled = clampedProgress >= totalYears - 0.0001;

  /* --- Playback ----------------------------------------------------------- */

  // One rAF loop, started when the transport is playing and torn down on
  // pause, on a horizon change, and on unmount. It ends itself at the final
  // year, so there is no second effect chasing the terminal state.
  useEffect(() => {
    // Reduced motion never starts a run — handlePlay jumps to the end instead.
    if (!isPlaying || prefersReducedMotion) return;
    const target = totalYears;
    let frame = 0;
    let last = 0;
    const tick = (now: number) => {
      if (last === 0) last = now;
      // Read the live position every frame rather than keeping a private
      // counter, so Restart (or a scrub) mid-run is picked up immediately
      // instead of being overwritten on the next tick.
      const next = Math.min(target, progressRef.current + (now - last) / MS_PER_YEAR);
      last = now;
      progressRef.current = next;
      setProgress(next);
      if (next >= target) {
        setIsPlaying(false);
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isPlaying, prefersReducedMotion, totalYears]);

  const handlePlay = useCallback(() => {
    if (prefersReducedMotion) {
      applyProgress(totalYears);
      return;
    }
    if (progressRef.current >= totalYears) applyProgress(0);
    setIsPlaying(true);
  }, [applyProgress, prefersReducedMotion, totalYears]);

  const handleRestart = useCallback(() => {
    if (prefersReducedMotion) {
      applyProgress(totalYears);
      return;
    }
    applyProgress(0);
    setIsPlaying(true);
  }, [applyProgress, prefersReducedMotion, totalYears]);

  /* --- Years / window control -------------------------------------------- */

  // Held arrow keys and pointermove both fire faster than React re-renders, so
  // reading `state.years` from the render closure would make every handler in
  // a burst see the same stale value and collapse the whole burst into one
  // step. This ref is resynced each render and advanced immediately on every
  // change, so successive handlers accumulate correctly.
  const yearsRef = useRef(state.years);
  useEffect(() => {
    yearsRef.current = state.years;
  }, [state.years]);

  // Same eager-ref treatment as the horizon: held arrow keys and fast drags
  // outrun React's re-render, so the handlers must read the live value.
  const endYearRef = useRef(state.windowEndYear);
  useEffect(() => {
    endYearRef.current = state.windowEndYear;
  }, [state.windowEndYear]);

  /** In-progress text in the Years field; null when not being edited. */
  const [yearsDraft, setYearsDraft] = useState<string | null>(null);

  const setYears = useCallback(
    (next: number) => {
      const available = endYearRef.current - SP500_DATA_FIRST_YEAR + 1;
      // The upper bound is floored at the minimum so the range can never
      // invert: every end year the handles allow leaves at least
      // MIN_HORIZON_YEARS of history behind it, but a bad `windowEndYear`
      // arriving from state must not produce max < min here.
      const ceiling = Math.max(
        MIN_HORIZON_YEARS,
        Math.min(SP500_MAX_YEARS, available),
      );
      const clamped = clamp(Math.round(next), MIN_HORIZON_YEARS, ceiling);
      if (clamped === yearsRef.current) return;
      yearsRef.current = clamped;
      setIsPlaying(false);
      update({ years: clamped });
      applyProgress(clamped);
    },
    [applyProgress, update],
  );

  /** Step the horizon relative to its live value, never the rendered one. */
  const stepYears = useCallback((delta: number) => setYears(yearsRef.current + delta), [setYears]);

  /** Calendar year under a pointer position on the strip. */
  const calendarYearFromClientX = useCallback((clientX: number) => {
    const element = trackRef.current;
    if (!element) return null;
    const rect = element.getBoundingClientRect();
    if (rect.width <= 0) return null;
    const ratio = (clientX - rect.left) / rect.width;
    const offset = Math.round(ratio * SP500_MAX_YEARS - 0.5);
    return clamp(SP500_DATA_FIRST_YEAR + offset, SP500_DATA_FIRST_YEAR, SP500_DATA_LAST_YEAR);
  }, []);

  /**
   * Moving the START handle holds the end year still and changes the horizon.
   * Moving the END handle holds the start year still and changes the horizon.
   * That is what makes them read as two ends of one range rather than as a
   * length control and a decoration.
   *
   * Neither handle may close the window below MIN_HORIZON_YEARS. Each stops
   * MIN_HORIZON_YEARS - 1 years short of the other rather than refusing to
   * move, so dragging one into the other parks it against the minimum instead
   * of appearing to jam.
   */
  const setWindowStartYear = useCallback(
    (nextStart: number) => {
      const end = endYearRef.current;
      const start = clampWindowStartYear(nextStart, end);
      setYears(end - start + 1);
    },
    [setYears],
  );

  const setWindowEndYear = useCallback(
    (nextEnd: number) => {
      const start = endYearRef.current - yearsRef.current + 1;
      const end = clampWindowEndYear(nextEnd, start);
      if (end === endYearRef.current) return;
      endYearRef.current = end;
      const nextYears = clamp(end - start + 1, MIN_HORIZON_YEARS, SP500_MAX_YEARS);
      yearsRef.current = nextYears;
      setIsPlaying(false);
      update({ windowEndYear: end, years: nextYears });
      applyProgress(nextYears);
    },
    [applyProgress, update],
  );

  /** A preset sets both ends at once: the last N years of the record. */
  const applyWindowPreset = useCallback(
    (nextYears: number) => {
      const clamped = clamp(nextYears, MIN_HORIZON_YEARS, SP500_MAX_YEARS);
      if (
        endYearRef.current === SP500_DATA_LAST_YEAR &&
        yearsRef.current === clamped
      ) {
        return;
      }
      endYearRef.current = SP500_DATA_LAST_YEAR;
      yearsRef.current = clamped;
      setIsPlaying(false);
      update({ windowEndYear: SP500_DATA_LAST_YEAR, years: clamped });
      applyProgress(clamped);
    },
    [applyProgress, update],
  );

  /** Progress under a pointer position on the plot stack. The playhead
   *  rides the bar pane and the chart, which share one x-axis, so the
   *  mapping is a plain ratio over the plotted years. */
  const headFromClientX = useCallback(
    (clientX: number) => {
      const element = plotRef.current;
      if (!element) return null;
      const rect = element.getBoundingClientRect();
      if (rect.width <= 0) return null;
      const ratio = (clientX - rect.left) / rect.width;
      return clamp(Math.round(ratio * totalYears), 0, totalYears);
    },
    [totalYears],
  );

  const onTrackPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (headDragRef.current) return;
    const year = calendarYearFromClientX(event.clientX);
    if (year === null) return;

    // Whichever end you grabbed nearest is the one that moves, and it stays
    // the one that moves for the rest of the drag. Re-deciding on every move
    // would hand the drag to the other handle as the pointer crosses the
    // midpoint.
    const end = endYearRef.current;
    const start = end - yearsRef.current + 1;
    windowDragRef.current =
      Math.abs(year - start) <= Math.abs(year - end) ? "start" : "end";

    event.currentTarget.setPointerCapture(event.pointerId);
    if (windowDragRef.current === "start") setWindowStartYear(year);
    else setWindowEndYear(year);
  };

  const onTrackPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!windowDragRef.current) return;
    const year = calendarYearFromClientX(event.clientX);
    if (year === null) return;
    if (windowDragRef.current === "start") setWindowStartYear(year);
    else setWindowEndYear(year);
  };

  const endTrackDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!windowDragRef.current) return;
    windowDragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  /** Arrow keys on the END handle move the end year directly. */
  const onEndHandleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const step = (delta: number) => setWindowEndYear(endYearRef.current + delta);
    let handled = true;
    switch (event.key) {
      case "ArrowLeft":
      case "ArrowDown":
        step(-1);
        break;
      case "ArrowRight":
      case "ArrowUp":
        step(1);
        break;
      case "PageDown":
        step(-5);
        break;
      case "PageUp":
        step(5);
        break;
      case "Home":
        setWindowEndYear(SP500_DATA_FIRST_YEAR);
        break;
      case "End":
        setWindowEndYear(SP500_DATA_LAST_YEAR);
        break;
      default:
        handled = false;
    }
    if (handled) event.preventDefault();
  };

  const onWindowHandleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    // aria-valuenow is the START calendar year, so Right = later start =
    // shorter horizon. That keeps the slider semantics honest.
    let handled = true;
    switch (event.key) {
      case "ArrowLeft":
      case "ArrowDown":
        stepYears(1);
        break;
      case "ArrowRight":
      case "ArrowUp":
        stepYears(-1);
        break;
      // aria-valuenow is the START year, so PageUp must move it the same
      // direction as ArrowUp — later start, shorter horizon — just further.
      // Matching Arrow's *horizon* direction instead would announce a value
      // moving opposite to the key the user pressed.
      case "PageUp":
        stepYears(-5);
        break;
      case "PageDown":
        stepYears(5);
        break;
      case "Home":
        setWindowStartYear(SP500_DATA_FIRST_YEAR);
        break;
      case "End":
        setWindowStartYear(endYearRef.current);
        break;
      default:
        handled = false;
    }
    if (handled) event.preventDefault();
  };

  const onHeadPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.stopPropagation();
    headDragRef.current = true;
    setIsPlaying(false);
    event.currentTarget.setPointerCapture(event.pointerId);
    const next = headFromClientX(event.clientX);
    if (next !== null) applyProgress(next);
  };

  const onHeadPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!headDragRef.current) return;
    event.stopPropagation();
    const next = headFromClientX(event.clientX);
    if (next !== null) applyProgress(next);
  };

  const endHeadDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!headDragRef.current) return;
    event.stopPropagation();
    headDragRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const onHeadKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    let handled = true;
    const move = (delta: number) => {
      setIsPlaying(false);
      applyProgress(clamp(Math.round(progressRef.current) + delta, 0, totalYears));
    };
    switch (event.key) {
      case "ArrowLeft":
      case "ArrowDown":
        move(-1);
        break;
      case "ArrowRight":
      case "ArrowUp":
        move(1);
        break;
      case "PageDown":
        move(-5);
        break;
      case "PageUp":
        move(5);
        break;
      case "Home":
        setIsPlaying(false);
        applyProgress(0);
        break;
      case "End":
        setIsPlaying(false);
        applyProgress(totalYears);
        break;
      case " ":
      case "Enter":
        if (isPlaying) setIsPlaying(false);
        else handlePlay();
        break;
      default:
        handled = false;
    }
    if (handled) event.preventDefault();
  };

  /* --- Timeline tiles ----------------------------------------------------- */

  const tiles = useMemo(() => {
    return SP500_ANNUAL_TOTAL_RETURNS.map((entry) => {
      const selected = entry.year >= windowFirstYear && entry.year <= windowEndYear;
      const up = entry.totalReturnPercent >= 0;
      const heightPercent =
        (Math.abs(entry.totalReturnPercent) / MAX_TILE_MAGNITUDE) * 100;
      let color: string;
      if (!marketMode) color = COLORS.inert;
      else if (selected) color = up ? COLORS.up : COLORS.down;
      else color = up ? COLORS.upDim : COLORS.downDim;
      return (
        <div
          key={entry.year}
          className="flex h-full min-w-0 flex-1 flex-col justify-center"
        >
          <div className="flex h-1/2 items-end justify-center">
            {up ? (
              <div
                className="w-[76%] rounded-t-[1.5px]"
                style={{
                  height: `${Math.max(4, heightPercent)}%`,
                  backgroundColor: color,
                  opacity: marketMode ? (selected ? 1 : 0.42) : 0.5,
                }}
              />
            ) : null}
          </div>
          <div className="flex h-1/2 items-start justify-center">
            {!up ? (
              <div
                className="w-[76%] rounded-b-[1.5px]"
                style={{
                  height: `${Math.max(4, heightPercent)}%`,
                  backgroundColor: color,
                  opacity: marketMode ? (selected ? 1 : 0.42) : 0.5,
                }}
              />
            ) : null}
          </div>
        </div>
      );
    });
  }, [marketMode, windowEndYear, windowFirstYear]);

  // Both edges are now positions on the calendar, not offsets from the end of
  // the table. The strip spans SP500_MAX_YEARS tiles; a window edge sits on
  // the boundary between tiles.
  const windowLeftPercent =
    ((windowFirstYear - SP500_DATA_FIRST_YEAR) / SP500_MAX_YEARS) * 100;
  const windowRightPercent =
    ((windowEndYear - SP500_DATA_FIRST_YEAR + 1) / SP500_MAX_YEARS) * 100;
  // The playhead lives on the plot stack, whose axis is the replayed window
  // itself — not the 40-year strip — so its position is a plain fraction of
  // the plotted years.
  const stackHeadPercent = (clampedProgress / totalYears) * 100;

  /* --- Chart geometry ----------------------------------------------------- */

  const yMax = useMemo(() => {
    let max = 0;
    projection.series.forEach((row) => {
      max = Math.max(max, row.withoutFees, row.withFees);
    });
    return max > 0 ? max * 1.06 : 1;
  }, [projection.series]);

  const chart = useMemo(() => {
    const xAt = (i: number) => (i / totalYears) * CHART_W;
    const yAt = (v: number) => CHART_H - (v / yMax) * CHART_H;

    const flat: Array<[number, number]> = [];
    const aum: Array<[number, number]> = [];

    for (let i = 0; i <= wholeIndex; i += 1) {
      const row = projection.series[i];
      flat.push([xAt(i), yAt(row.withoutFees)]);
      aum.push([xAt(i), yAt(row.withFees)]);
    }
    if (frac > 0 && wholeIndex + 1 <= totalYears) {
      const a = projection.series[wholeIndex];
      const b = projection.series[wholeIndex + 1];
      const x = xAt(wholeIndex + frac);
      flat.push([x, yAt(a.withoutFees + (b.withoutFees - a.withoutFees) * frac)]);
      aum.push([x, yAt(a.withFees + (b.withFees - a.withFees) * frac)]);
    }

    const toPath = (points: Array<[number, number]>) =>
      points
        .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`)
        .join(" ");

    const flatPath = flat.length > 1 ? toPath(flat) : "";
    const aumPath = aum.length > 1 ? toPath(aum) : "";
    const gapPath =
      flat.length > 1
        ? `${toPath(flat)} ${[...aum]
            .reverse()
            .map(([x, y]) => `L${x.toFixed(2)} ${y.toFixed(2)}`)
            .join(" ")} Z`
        : "";

    return {
      aumHead: aum[aum.length - 1] ?? [0, CHART_H],
      aumPath,
      flatHead: flat[flat.length - 1] ?? [0, CHART_H],
      flatPath,
      gapPath,
    };
  }, [frac, projection.series, totalYears, wholeIndex, yMax]);

  /* --- Copy --------------------------------------------------------------- */

  const growthDisabledNote = `Output, not an input: the realized ${windowFirstYear}–${windowEndYear} compound annual growth rate.`;

  return (
    <section className="text-[var(--calc-text)]">
      {/* The control row above draws the card, the surface and the page
          padding. Each section below carries its own inset, exactly as
          the basic calculator's sections do. */}
      <div className="w-full overflow-hidden">
              {/* ================= INPUTS =================
                  Same position and same 2x2 shape as the basic calculator, so
                  switching between the two does not move the controls. The
                  fourth cell is where basic puts Annualized growth; here that
                  is not an input, so it states the window being replayed. */}
              <section
                aria-label="Calculator assumptions"
                className="grid gap-2 overflow-hidden border-b border-[var(--calc-border)] bg-[var(--calc-panel)] px-3 py-2 sm:px-7"
              >
                <div className="grid overflow-hidden rounded-md border border-[var(--calc-border)] bg-[var(--calc-panel)] md:grid-cols-2">
                  <div className="border-b border-[var(--calc-border)] px-3 py-2 md:border-r">
                    <AssumptionStepper
                      idPrefix="advanced"
                      label="Portfolio value"
                      value={state.portfolioValue}
                      onChange={(value) => update({ portfolioValue: value })}
                      formatter={(value) => formatCurrency(value)}
                      boundsFormatter={(value) => formatCompactCurrency(value)}
                      min={250000}
                      max={CALCULATOR_MAX_PORTFOLIO}
                      step={100000}
                    />
                  </div>
                  <div data-fee-schedule-cell className="border-b border-[var(--calc-border)] px-3 py-2">
                    {advisoryFeeTiers ? (
                      <TieredAdvisoryFeeDisplay />
                    ) : (
                      <AssumptionStepper
                        idPrefix="advanced"
                        label="Asset-based fee"
                        value={state.annualFeePercent}
                        onChange={(value) => update({ annualFeePercent: value })}
                        formatter={(value) => `${value.toFixed(2)}%`}
                        boundsFormatter={(value) => `${value.toFixed(2)}%`}
                        min={0.25}
                        max={CALCULATOR_MAX_SINGLE_RATE}
                        step={0.1}
                      />
                    )}
                  </div>
                  <div className="border-b border-[var(--calc-border)] px-3 py-2 md:border-b-0 md:border-r">
                    <AssumptionStepper
                      idPrefix="advanced"
                      label="Years"
                      value={state.years}
                      onChange={(value) => setYears(value)}
                      formatter={(value) => `${Math.round(value)}`}
                      boundsFormatter={(value) => `${Math.round(value)}`}
                      min={MIN_HORIZON_YEARS}
                      max={SP500_MAX_YEARS}
                      step={1}
                    />
                  </div>
                  {/* Where basic puts Annualized growth. Growth is not an input
                      here, so the cell states the window being replayed —
                      matching the label/value type of the three real controls. */}
                  <div className="flex flex-col justify-center gap-2 px-3 py-2 min-[430px]:flex-row min-[430px]:items-center min-[430px]:justify-between min-[430px]:gap-3">
                    <p className="block min-w-0 text-[13px] font-bold leading-tight text-[var(--calc-text)]">
                      Market Returns{" "}
                      <span className="ml-1.5 whitespace-nowrap text-[12px] font-semibold text-[var(--calc-body-faint)]">
                        ({windowYears} {windowYears === 1 ? "year" : "years"})
                      </span>
                    </p>
                    <p className="text-base font-bold leading-none tabular-nums text-[var(--calc-aum)]">
                      {windowFirstYear}&ndash;{windowEndYear}
                    </p>
                  </div>
                </div>

                 {/* Fund/ETF expenses: one line under the controls. It slides
                    out from behind the assumptions grid when the advanced
                    calculator opens, rather than appearing already there. */}
                <motion.div
                  initial={prefersReducedMotion ? false : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  transition={{
                    duration: prefersReducedMotion ? 0 : 0.5,
                    ease: [0.16, 1, 0.3, 1],
                    delay: prefersReducedMotion ? 0 : 0.12,
                  }}
                  className="overflow-hidden"
                >
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-md border border-[var(--calc-border)] bg-[var(--calc-panel-solid)] px-3 py-2">
                  <label
                    htmlFor="mtm-fund-expense"
                    className="text-[13px] font-bold text-[var(--calc-text)]"
                  >
                    Fund/ETF expense ratio
                  </label>
                  <div className="flex items-stretch overflow-hidden rounded border border-[var(--calc-line-20)] bg-[var(--calc-recess)]">
                    <button
                      type="button"
                      aria-label="Decrease fund expense ratio"
                      onClick={() =>
                        update({
                          mutualFundExpensePercent: Math.max(
                            0,
                            Number((state.mutualFundExpensePercent - 0.05).toFixed(2)),
                          ),
                        })
                      }
                      className="grid h-9 w-9 place-items-center border-r border-[var(--calc-line-20)] text-[var(--calc-body-soft)] transition hover:bg-[var(--calc-wash-12)]"
                    >
                      -
                    </button>
                    <input
                      id="mtm-fund-expense"
                      type="text"
                      inputMode="decimal"
                      value={`${state.mutualFundExpensePercent.toFixed(2)}%`}
                      onChange={(event) => {
                        const numeric = Number.parseFloat(
                          event.target.value.replace(/[^0-9.]/g, ""),
                        );
                        if (Number.isFinite(numeric)) {
                          update({
                            mutualFundExpensePercent: Math.min(
                              FUND_EXPENSE_MAX_PERCENT,
                              Math.max(0, numeric),
                            ),
                          });
                        }
                      }}
                      className="h-9 w-[6ch] border-0 bg-transparent px-1 text-center text-sm font-bold tabular-nums text-[var(--calc-text)] outline-none"
                    />
                    <button
                      type="button"
                      aria-label="Increase fund expense ratio"
                      onClick={() =>
                        update({
                          mutualFundExpensePercent: Math.min(
                            FUND_EXPENSE_MAX_PERCENT,
                            Number((state.mutualFundExpensePercent + 0.05).toFixed(2)),
                          ),
                        })
                      }
                      className="grid h-9 w-9 place-items-center border-l border-[var(--calc-line-20)] text-[var(--calc-body-soft)] transition hover:bg-[var(--calc-wash-12)]"
                    >
                      +
                    </button>
                  </div>
                  <p className="min-w-0 flex-1 text-[11px] leading-4 text-[var(--calc-body)] sm:text-[12px]">
                    Added to the asset-based fee, so it is charged to that path only.
                  </p>
                </div>
                </motion.div>

                {onApplyFeeSchedule && onReturnToScalarFee ? (
                  <>
                    <FeeScheduleSummaryRow
                      savedSchedule={advisoryFeeTiers}
                      annualRatePercent={calc.effectiveAnnualAdvisoryPercent}
                      isOpen={feeScheduleEditorOpen}
                      editorId="advanced-fee-schedule-editor"
                      onOpen={() => feeScheduleEditorRef.current?.open()}
                    />
                    <InlineFeeScheduleEditor
                      ref={feeScheduleEditorRef}
                      savedSchedule={advisoryFeeTiers}
                      scalarRatePercent={state.annualFeePercent}
                      portfolioValue={state.portfolioValue}
                      onApplySchedule={onApplyFeeSchedule}
                      onReturnToScalar={onReturnToScalarFee}
                      showRateSummary={false}
                      hideTrigger
                      editorId="advanced-fee-schedule-editor"
                      onOpenChange={setFeeScheduleEditorOpen}
                    />
                  </>
                ) : null}
              </section>

              <div className="px-3 pb-4 sm:px-7">
              {/* ================= THE RUN ================= */}
              {/* Stacked rather than chart-plus-sidebar. As a sidebar, the
                  window statistics sat level with the top of the chart and so
                  read BEFORE the difference, which is the answer the reader
                  came for. One column keeps chart -> difference -> statistics
                  in that order at every width. */}
              <div className="mt-4 space-y-4">
                <div className="rounded-lg border border-[var(--calc-line-10)] bg-[var(--calc-recess)] p-3 sm:p-5">
                  {/* Transport, then the readout centred on the CARD — not on
                      whatever space the transport buttons leave over. The
                      matching empty third column is what does it: with equal
                      1fr rails either side, the middle column lands on the
                      card's centre line no matter how wide the buttons get. */}
                  <div className="flex flex-col items-center gap-3 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                    <div className="flex items-center gap-2 sm:justify-self-start">
                      {isPlaying && !prefersReducedMotion ? (
                        <TransportButton
                          label="Pause"
                          onClick={() => setIsPlaying(false)}
                          primary
                        >
                          <Pause className="h-4 w-4" aria-hidden="true" />
                          Pause
                        </TransportButton>
                      ) : (
                        <TransportButton
                          label={
                            prefersReducedMotion
                              ? "Jump to the final year"
                              : "Play the run year by year"
                          }
                          onClick={handlePlay}
                          primary
                        >
                          <Play className="h-4 w-4" aria-hidden="true" />
                          {prefersReducedMotion ? "Show final year" : "Play"}
                        </TransportButton>
                      )}
                      {!prefersReducedMotion ? (
                        <TransportButton label="Restart the run" onClick={handleRestart}>
                          <RotateCcw className="h-4 w-4" aria-hidden="true" />
                          Restart
                        </TransportButton>
                      ) : null}
                    </div>

                    {/* The window, and what it actually returned. Both read at
                        the timeline's own size — a 52px single year was louder
                        than anything it was next to. */}
                    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:justify-self-center">
                      {/* Label centred over its own figure, in both halves —
                          centring one and not the other made the pair look
                          like two unrelated readouts. */}
                      <div className="text-center">
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--calc-text-muted)] sm:text-[11px]">
                          Time frame
                        </p>
                        <p className="mt-0.5 text-[19px] font-bold leading-tight tabular-nums text-[var(--calc-text-strong)] sm:text-[26px]">
                          {marketMode ? `${windowFirstYear}–${windowEndYear}` : `${state.years} yr`}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--calc-text-muted)] sm:text-[11px]">
                          Annualized return
                        </p>
                        {/* Geometric, over the whole selected window — the
                            figure an investor actually realized. Never the
                            arithmetic average, and never a single year's
                            return wearing this label. */}
                        <p
                          className={`mt-0.5 text-[19px] font-bold leading-tight tabular-nums sm:text-[26px] ${
                            calc.effectiveGrowthPercent >= 0
                              ? "text-[var(--calc-accent-bright)]"
                              : "text-[var(--calc-loss-soft)]"
                          }`}
                        >
                          {signedPercent(calc.effectiveGrowthPercent)}
                        </p>
                      </div>
                    </div>

                    {/* Empty by design — the counterweight to the transport. */}
                    <div className="hidden sm:block" aria-hidden="true" />
                  </div>

                  {/* ---- What's being replayed, and the range picker ----
                      The 40-year strip is a control, not a chart, so it sits
                      at control size beside the heading. The chart-scale bars
                      live on the plot below, one per replayed year. */}
                  <div className="mt-5 flex flex-wrap items-end justify-between gap-x-7 gap-y-3">
                    <div className="min-w-0">
                      <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-[var(--calc-accent)] sm:text-xs">
                        {marketMode
                          ? "S&P 500 total returns"
                          : "History off · assumed flat rate in use"}
                      </p>
                      <h2 className="mt-1 text-[19px] font-bold leading-tight text-[var(--calc-text-strong)] sm:text-[26px]">
                        {marketMode
                          ? `Replaying ${windowFirstYear} through ${windowEndYear}`
                          : `A flat ${state.annualGrowthPercent.toFixed(2)}% every year`}
                      </h2>
                    </div>

                    <div className="w-full min-w-[200px] max-w-[360px] flex-1 basis-60">
                      {/* One-tap windows for the visitor who will never
                          discover the drag handles: tapping a chip visibly
                          moves the window, which is also what teaches them.
                          Presets end at the last data year; every other
                          window remains the handles' job. */}
                      {marketMode ? (
                        <div
                          role="group"
                          aria-label="Quick time windows"
                          className="mb-1.5 flex flex-wrap gap-1.5"
                        >
                          {WINDOW_PRESETS.map((preset) => {
                            const active =
                              windowEndYear === SP500_DATA_LAST_YEAR &&
                              windowYears === preset.years;
                            return (
                              <button
                                key={preset.years}
                                type="button"
                                aria-pressed={active}
                                aria-label={`Replay the last ${preset.years} years, ${
                                  SP500_DATA_LAST_YEAR - preset.years + 1
                                } through ${SP500_DATA_LAST_YEAR}`}
                                onClick={() => applyWindowPreset(preset.years)}
                                className={`min-h-8 rounded-full border px-2.5 text-[11px] font-extrabold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--calc-accent)] ${
                                  active
                                    ? "border-[var(--calc-accent)] bg-[var(--calc-accent)] text-white"
                                    : "border-[var(--calc-line-20)] bg-[var(--calc-wash-05)] text-[var(--calc-body)] hover:border-[var(--calc-accent)] hover:text-[var(--calc-accent-bright)]"
                                }`}
                              >
                                {preset.label}
                              </button>
                            );
                          })}
                        </div>
                      ) : null}
                      <div
                        ref={trackRef}
                        onPointerDown={onTrackPointerDown}
                        onPointerMove={onTrackPointerMove}
                        onPointerUp={endTrackDrag}
                        onPointerCancel={endTrackDrag}
                        style={{ touchAction: "pan-y" }}
                        className="relative h-9 w-full cursor-ew-resize select-none"
                      >
                        {/* Selected-window band */}
                        <div
                          className={`pointer-events-none absolute inset-y-0 rounded border ${
                            marketMode
                              ? "border-[var(--calc-ring-accent-strong)] bg-[var(--calc-accent)]/[0.07]"
                              : "border-[var(--calc-line-20)] bg-[var(--calc-wash-03)]"
                          }`}
                          style={{
                            left: `${windowLeftPercent}%`,
                            right: `${100 - windowRightPercent}%`,
                          }}
                        />

                        {/* Zero baseline */}
                        <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-[var(--calc-wash-18)]" />

                        {/* Tiles */}
                        <div className="absolute inset-0 flex items-stretch px-px">
                          {tiles}
                        </div>

                        {/* Window handles — real sliders, keyboard driven */}
                        <div
                          role="slider"
                          tabIndex={0}
                          aria-label="Start year of your time horizon"
                          aria-orientation="horizontal"
                          aria-valuemin={SP500_DATA_FIRST_YEAR}
                          // Not the last year in the table: this handle stops
                          // where the window would fall below the minimum
                          // horizon, and the announced range has to say so.
                          aria-valuemax={latestWindowStartYear(windowEndYear)}
                          aria-valuenow={windowFirstYear}
                          aria-valuetext={`${windowFirstYear} to ${windowEndYear}, a ${windowYears}-year horizon`}
                          onKeyDown={onWindowHandleKeyDown}
                          // Deliberately does NOT stop propagation: the event
                          // bubbles to the track, which owns pointer capture
                          // and therefore the drag. Focus is taken explicitly
                          // so the keyboard path is one click away.
                          onPointerDown={(event) => event.currentTarget.focus()}
                          className="absolute inset-y-0 z-20 flex w-5 -translate-x-1/2 cursor-ew-resize items-center justify-center rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--calc-accent)]"
                          style={{ left: `${windowLeftPercent}%` }}
                        >
                          <span
                            className={`block h-full w-[3px] rounded-full ${
                              marketMode ? "bg-[var(--calc-accent)]" : "bg-[var(--calc-wash-45)]"
                            }`}
                          />
                          <span className="absolute top-1/2 h-4 w-[9px] -translate-y-1/2 rounded-[2px] border border-[var(--calc-stage-wash)] bg-[var(--calc-accent)] shadow-[0_3px_10px_var(--calc-shadow)]" />
                        </div>
                        <div
                          role="slider"
                          tabIndex={0}
                          aria-label="End year of your time horizon"
                          aria-orientation="horizontal"
                          aria-valuemin={earliestWindowEndYear(windowFirstYear)}
                          aria-valuemax={SP500_DATA_LAST_YEAR}
                          aria-valuenow={windowEndYear}
                          aria-valuetext={`${windowFirstYear} to ${windowEndYear}, a ${windowYears}-year horizon`}
                          onKeyDown={onEndHandleKeyDown}
                          onPointerDown={(event) => event.currentTarget.focus()}
                          className="absolute inset-y-0 z-20 flex w-5 -translate-x-1/2 cursor-ew-resize items-center justify-center rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--calc-accent)]"
                          style={{ left: `${windowRightPercent}%` }}
                        >
                          <span
                            className={`block h-full w-[3px] rounded-full ${
                              marketMode ? "bg-[var(--calc-accent)]" : "bg-[var(--calc-wash-45)]"
                            }`}
                          />
                          <span className="absolute top-1/2 h-4 w-[9px] -translate-y-1/2 rounded-[2px] border border-[var(--calc-stage-wash)] bg-[var(--calc-accent)] shadow-[0_3px_10px_var(--calc-shadow)]" />
                        </div>
                      </div>
                      <div className="mt-0.5 flex justify-between text-[10px] font-semibold tabular-nums text-[var(--calc-disabled)]">
                        <span>{SP500_DATA_FIRST_YEAR}</span>
                        <span>{SP500_DATA_LAST_YEAR}</span>
                      </div>
                      <p className="mt-1 text-[10.5px] leading-4 text-[var(--calc-text-muted)]">
                        Drag either green handle to pick the years replayed.
                      </p>
                    </div>
                  </div>

                  {/* ---- The plot stack: year bars and balance lines on ONE
                      x-axis. The bar for a crash year sits directly above the
                      notch it puts in the lines, and a single playhead crosses
                      both panes. */}
                  <div ref={plotRef} className="relative mt-4">
                    {marketMode ? (
                      <div className="relative mb-1 mt-9 h-14 select-none sm:h-[74px]">
                        <span className="absolute -top-5 left-0 text-[10px] font-extrabold tabular-nums tracking-[0.08em] text-[var(--calc-text-muted)] sm:text-[11px]">
                          {activeLabel} {signedPercent(activeReturnPercent)}
                        </span>
                        <span className="absolute -top-5 right-0 pr-3.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--calc-text-muted)] sm:text-[11px]">
                          S&P 500 total return, by year
                        </span>
                        <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-[var(--calc-wash-18)]" />
                        <div className="absolute inset-0 flex items-stretch">
                          {calc.marketWindow.map((entry, index) => {
                            const up = entry.totalReturnPercent >= 0;
                            const heightPercent = Math.max(
                              4,
                              (Math.abs(entry.totalReturnPercent) / MAX_TILE_MAGNITUDE) * 100,
                            );
                            // Bars light up as the playhead reaches their year,
                            // so the pane replays in step with the lines below.
                            const lit = index < Math.ceil(clampedProgress);
                            return (
                              <div key={entry.year} className="flex h-full min-w-0 flex-1 flex-col">
                                <div className="flex h-1/2 items-end justify-center">
                                  {up ? (
                                    <div
                                      className="w-[72%] rounded-t-[2px] transition-opacity duration-150"
                                      style={{
                                        height: `${heightPercent}%`,
                                        backgroundColor: COLORS.up,
                                        opacity: lit ? 1 : 0.22,
                                      }}
                                    />
                                  ) : null}
                                </div>
                                <div className="flex h-1/2 items-start justify-center">
                                  {!up ? (
                                    <div
                                      className="w-[72%] rounded-b-[2px] transition-opacity duration-150"
                                      style={{
                                        height: `${heightPercent}%`,
                                        backgroundColor: COLORS.down,
                                        opacity: lit ? 1 : 0.22,
                                      }}
                                    />
                                  ) : null}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}

                  {/* Chart */}
                  <div className="relative h-[230px] w-full sm:h-[280px]">
                    <svg
                      viewBox={`0 0 ${CHART_W} ${CHART_H}`}
                      preserveAspectRatio="none"
                      className="h-full w-full"
                      role="img"
                      aria-label={advisoryFeeTiers
                        ? `Portfolio value over ${totalYears} years under a flat monthly fee versus a tiered advisory schedule${state.mutualFundExpensePercent > 0 ? ` with a separate Fund/ETF expense ratio of ${state.mutualFundExpensePercent.toFixed(2)} percent` : ""}`
                        : `Portfolio value over ${totalYears} years under a flat monthly fee versus an asset-based fee of ${state.annualFeePercent.toFixed(2)} percent${state.mutualFundExpensePercent > 0 ? ` plus a separate Fund/ETF expense ratio of ${state.mutualFundExpensePercent.toFixed(2)} percent` : ""}`}
                    >
                      <defs>
                        <linearGradient id="proto-c-gap" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={COLORS.gap} stopOpacity="0.55" />
                          <stop offset="100%" stopColor={COLORS.gap} stopOpacity="0.18" />
                        </linearGradient>
                      </defs>

                      {[0.25, 0.5, 0.75].map((fraction) => (
                        <line
                          key={fraction}
                          x1={0}
                          x2={CHART_W}
                          y1={CHART_H * fraction}
                          y2={CHART_H * fraction}
                          stroke="var(--calc-text-strong)"
                          strokeOpacity="0.08"
                          strokeWidth={1}
                          vectorEffect="non-scaling-stroke"
                          />
                      ))}
                      <line
                        x1={0}
                        x2={CHART_W}
                        y1={CHART_H}
                        y2={CHART_H}
                        stroke="var(--calc-text-strong)"
                        strokeOpacity="0.22"
                        strokeWidth={1}
                        vectorEffect="non-scaling-stroke"
                        />

                      {chart.gapPath ? (
                        <path d={chart.gapPath} fill="url(#proto-c-gap)" />
                      ) : null}
                      {chart.aumPath ? (
                        <path
                          d={chart.aumPath}
                          fill="none"
                          stroke={COLORS.aumLine}
                          strokeWidth={2}
                          // Dashed, so the two series are separable without
                          // colour. var(--calc-accent) against var(--calc-aum) is only a 1.44:1
                          // luminance ratio — in greyscale, on a projector, or
                          // with severe CVD they read as one line.
                          strokeDasharray="6 4"
                          strokeLinejoin="round"
                          strokeLinecap="round"
                          vectorEffect="non-scaling-stroke"
                          />
                      ) : null}
                      {chart.flatPath ? (
                        <path
                          d={chart.flatPath}
                          fill="none"
                          stroke={COLORS.flatLine}
                          strokeWidth={2.5}
                          strokeLinejoin="round"
                          strokeLinecap="round"
                          vectorEffect="non-scaling-stroke"
                          />
                      ) : null}
                    </svg>

                    {/* Line heads, positioned in HTML so text never distorts */}
                    <span
                      className="pointer-events-none absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--calc-accent)] shadow-[0_0_0_3px_var(--calc-marker-accent)]"
                      style={{
                        left: `${(chart.flatHead[0] / CHART_W) * 100}%`,
                        top: `${(chart.flatHead[1] / CHART_H) * 100}%`,
                      }}
                      />
                    <span
                      className="pointer-events-none absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--calc-aum)] shadow-[0_0_0_3px_var(--calc-marker-aum)]"
                      style={{
                        left: `${(chart.aumHead[0] / CHART_W) * 100}%`,
                        top: `${(chart.aumHead[1] / CHART_H) * 100}%`,
                      }}
                      />

                    {/* The key. Each label wears its series' stroke as an
                        underline — solid green, dashed navy — so this corner
                        is the legend and the running balances in one block.
                        It pins to the chart's upper-left, which a growth
                        curve leaves empty. Values count while the run plays;
                        the sentence under the chart restates the settled
                        figures for the record. */}
                    <div className="pointer-events-none absolute left-2 top-2 z-20 grid max-w-[calc(100%-16px)] gap-1 rounded-md border border-[var(--calc-line-10)] bg-white/90 px-3 py-2 backdrop-blur-[2px] sm:left-3 sm:top-3 sm:px-3.5 sm:py-2.5">
                      <div className="flex flex-col gap-y-0.5 sm:flex-row sm:flex-wrap sm:items-baseline sm:justify-between sm:gap-x-4">
                        <span className="text-[11.5px] font-semibold leading-snug text-[var(--calc-accent)] underline decoration-[color:var(--calc-accent)] decoration-[3px] underline-offset-4 sm:text-[13px]">
                          Flat Monthly Fee ({formatCurrency(state.annualFlatFee / 12)}/mo)
                        </span>
                        <span className="text-[17px] font-semibold leading-none tabular-nums text-[var(--calc-accent)] sm:text-[22px]">
                          {formatCurrencyFloored(liveFlat)}
                        </span>
                      </div>
                      <div className="flex flex-col gap-y-0.5 sm:flex-row sm:flex-wrap sm:items-baseline sm:justify-between sm:gap-x-4">
                        <span className="text-[11.5px] font-semibold leading-snug text-[var(--calc-aum-soft)] underline decoration-[color:var(--calc-aum)] decoration-dashed decoration-2 underline-offset-4 sm:text-[13px]">
                          {advisoryFeeTiers
                            ? state.mutualFundExpensePercent > 0
                              ? `Tiered Advisory + ${state.mutualFundExpensePercent.toFixed(2)}% Fund/ETF`
                              : "Tiered Advisory Schedule"
                            : state.mutualFundExpensePercent > 0
                              ? `Asset-Based Fee + Fund/ETF (${calc.totalAnnualFeePercent.toFixed(2)}% total)`
                              : `Asset-Based Fee (${state.annualFeePercent.toFixed(2)}%)`}
                        </span>
                        <span className="text-[17px] font-semibold leading-none tabular-nums text-[var(--calc-text-strong)] sm:text-[22px]">
                          {formatCurrencyFloored(liveAum)}
                        </span>
                      </div>
                      <div className="mt-0.5 flex flex-col gap-y-0.5 border-t border-[var(--calc-line-10)] pt-1.5 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-x-4">
                        <span className="flex flex-col gap-0.5">
                          <span className="text-[11.5px] font-semibold leading-snug text-[var(--calc-loss-text)] sm:text-[13px]">
                            Difference
                          </span>
                          <span className="text-[17px] font-semibold leading-none tabular-nums text-[var(--calc-loss-text)] sm:text-[22px]">
                            {livePercentLost.toFixed(1)}%
                          </span>
                        </span>
                        <span className="text-[17px] font-semibold leading-none tabular-nums text-[var(--calc-loss-text)] sm:text-[22px]">
                          {formatCurrencyFloored(liveGap)}
                        </span>
                      </div>
                    </div>
                  </div>

                    {/* Playhead: one object crossing bars and lines, since
                        they share an axis now. 40px hit area for touch; the
                        visible knob stays small. */}
                    <div
                      className="pointer-events-none absolute inset-y-0 z-10 w-px bg-[var(--calc-accent)]"
                      style={{ left: `${stackHeadPercent}%` }}
                    />
                    <div
                      role="slider"
                      tabIndex={0}
                      aria-label="Playhead: year being shown"
                      aria-orientation="horizontal"
                      aria-valuemin={0}
                      aria-valuemax={totalYears}
                      aria-valuenow={Math.round(clampedProgress)}
                      aria-valuetext={
                        marketMode
                          ? `Year ${Math.round(clampedProgress)} of ${totalYears}, calendar year ${activeLabel}`
                          : `Year ${Math.round(clampedProgress)} of ${totalYears}`
                      }
                      onKeyDown={onHeadKeyDown}
                      onPointerDown={onHeadPointerDown}
                      onPointerMove={onHeadPointerMove}
                      onPointerUp={endHeadDrag}
                      onPointerCancel={endHeadDrag}
                      style={{ left: `${stackHeadPercent}%`, touchAction: "none" }}
                      className="absolute -top-[13px] z-30 flex h-10 w-10 -translate-x-1/2 cursor-grab items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--calc-accent)] active:cursor-grabbing"
                    >
                      <span className="block h-4 w-4 rounded-full border-2 border-[var(--calc-stage-deep)] bg-[var(--calc-accent)] shadow-[0_3px_10px_var(--calc-shadow-strong)]" />
                    </div>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11px] font-semibold text-[var(--calc-body-faint)] sm:text-xs">
                    <span className="tabular-nums text-[var(--calc-text-muted)]">
                      Vertical axis starts at zero.
                    </span>
                  </div>

                  {/* ================= THE PAYOFF ================= */}
                  {/* This is the number the chart is drawing, so it sits with
                      the chart — bled to the card edges as its closing band.
                      It used to sit under the disclosure block, where a reader
                      had to scroll past the footnotes to find the answer.

                      The dim-while-running treatment is scoped to the figure
                      and its summary line, and stays inside this card. It must
                      never reach the disclosures below — visually
                      de-emphasising a mandated disclosure as a side effect of
                      playback is not something you want to explain in a
                      compliance review. */}
                  <motion.div
                    animate={
                      prefersReducedMotion ? undefined : { opacity: settled ? 1 : 0.72 }
                    }
                    transition={{ duration: prefersReducedMotion ? 0 : 0.35 }}
                    className="-mx-3 -mb-3 mt-4 rounded-b-[7px] border-t border-[var(--calc-line-10)] bg-[var(--calc-recess-strong)] px-3 py-4 sm:-mx-5 sm:-mb-5 sm:px-5 sm:py-5"
                  >
                    {/* The dollar and percent figures live in the chart's
                        corner key now; this band keeps the plain-English
                        sentence, which states both with their basis. */}
                    <p className="text-[13px] font-semibold leading-6 text-[var(--calc-text)] sm:text-[15px]">
                      {marketMode
                        ? `Same portfolio, same ${windowFirstYear}–${windowEndYear} returns, two fee structures: the difference after ${state.years} ${
                            state.years === 1 ? "year" : "years"
                          } is ${formatCurrencyFloored(projection.savings)}, or ${calc.percentLost.toFixed(1)}% of the flat-fee ending value.`
                        : `Same portfolio, same assumed ${state.annualGrowthPercent.toFixed(2)}% return, two fee structures: the difference after ${state.years} ${
                            state.years === 1 ? "year" : "years"
                          } is ${formatCurrencyFloored(projection.savings)}, or ${calc.percentLost.toFixed(1)}% of the flat-fee ending value.`}
                    </p>
                  </motion.div>
                </div>

                {/* Window statistics, beside the run. The assumption controls
                    that used to live here now sit above the chart. */}
                <div className="rounded-lg border border-[var(--calc-line-10)] bg-[var(--calc-recess)] p-3 sm:p-5">
                  {/* "This window" on its own asks the reader to remember
                      which years are selected. Say them. */}
                  <h3 className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-[var(--calc-accent)] sm:text-xs">
                    This window{marketMode ? ` (${windowFirstYear}–${windowEndYear})` : ""}
                  </h3>
                  {marketMode ? (
                    <dl className="mt-4 grid gap-x-8 gap-y-1.5 border-t border-[var(--calc-line-10)] pt-4 text-[12px] sm:grid-cols-2 sm:text-[13px] lg:grid-cols-4">
                      <div className="flex items-baseline justify-between gap-3">
                        <dt className="font-semibold text-[var(--calc-text-muted)]">Best year</dt>
                        <dd className="font-bold tabular-nums text-[var(--calc-accent-bright)]">
                          {calc.windowStats.best.year}{" "}
                          {signedPercent(calc.windowStats.best.totalReturnPercent)}
                        </dd>
                      </div>
                      <div className="flex items-baseline justify-between gap-3">
                        <dt className="font-semibold text-[var(--calc-text-muted)]">Worst year</dt>
                        <dd className="font-bold tabular-nums text-[var(--calc-loss-soft)]">
                          {calc.windowStats.worst.year}{" "}
                          {signedPercent(calc.windowStats.worst.totalReturnPercent)}
                        </dd>
                      </div>
                      <div className="flex items-baseline justify-between gap-3">
                        <dt className="font-semibold text-[var(--calc-text-muted)]">Down years</dt>
                        <dd className="font-bold tabular-nums text-[var(--calc-text-strong)]">
                          {calc.windowStats.downYears} of {state.years}
                        </dd>
                      </div>
                      <div className="flex items-baseline justify-between gap-3">
                        <dt className="font-semibold text-[var(--calc-text-muted)]">
                          Realized annualized
                        </dt>
                        <dd className="font-bold tabular-nums text-[var(--calc-text-strong)]">
                          {calc.realizedCagrPercent.toFixed(2)}%
                        </dd>
                      </div>
                    </dl>
                  ) : null}
                </div>
              </div>

              {/* ================= DISCLOSURES ================= */}
              {/* Its own card now that the payoff figure has moved up under the
                  chart. Deliberately never dimmed during playback. */}
              <div className="mt-4 space-y-2 rounded-lg border border-[var(--calc-line-10)] bg-[var(--calc-recess-strong)] p-3 sm:p-5">
                <p className="text-[11px] leading-relaxed text-[var(--calc-body)] sm:text-[12px]">
                  This calculator is illustrative only, is not a forecast, and should not be relied on
                  for a precise cost analysis. Values are nominal and before taxes.
                </p>
                {state.showFundExpenses ? (
                  <p className="text-[11px] leading-relaxed text-[var(--calc-body)] sm:text-[12px]">
                    Fund/ETF expense ratio of{" "}
                    <strong className="tabular-nums text-[var(--calc-text)]">
                      {state.mutualFundExpensePercent.toFixed(2)}%
                    </strong>{" "}
                    is added to the asset-based advisory fee, for a total modeled load of{" "}
                    <strong className="tabular-nums text-[var(--calc-text)]">
                      {calc.totalAnnualFeePercent.toFixed(2)}%
                    </strong>
                    . {FUND_EXPENSE_NOTE}
                  </p>
                ) : null}
                {/* SP500_DISCLOSURE is unconditional. Switching the basis
                    off does not remove the 40-year return strip from the
                    page, and that strip plots real index data — the
                    attribution and past-performance language have to travel
                    with it, not with the projection mode. */}
                {!marketMode ? (
                  <p className="text-[11px] leading-relaxed text-[var(--calc-body)] sm:text-[12px]">
                    The projection above uses the flat rate you entered, applied to every year
                    equally; real markets do not behave that way. The year-by-year bars remain
                    actual historical index data.
                  </p>
                ) : null}
                <p className="text-[11px] leading-relaxed text-[var(--calc-body)] sm:text-[12px]">
                  {SP500_DISCLOSURE}
                </p>
              </div>
              </div>
      </div>
    </section>
  );
}
