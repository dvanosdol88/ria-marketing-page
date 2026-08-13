"use client";

import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check, ChevronDown, ChevronUp, Minus, Plus, Share2 } from "lucide-react";
import Link from "next/link";
import { buildFeeProjection } from "@/lib/feeProjection";
import {
  CalculatorState,
  DEFAULT_STATE,
  MIN_HORIZON_YEARS,
  buildQueryFromState,
} from "@/lib/calculatorState";
import { formatCompactCurrency, formatCurrency, formatCurrencyFloored } from "@/lib/format";
import { NoteMarker } from "@/components/CalculatorNotes";
import QuoteTickerWithPortraits from "./QuoteTickerWithPortraits";
import { ProFeeChart } from "@/components/charts/ProFeeChart";
import { homeCalculatorConfig } from "@/config/homeCalculatorConfig";
import { Odometer } from "@/components/Odometer";
import { HomeMarketingHero } from "@/components/HomeMarketingHero";
import { HomeTopBanner } from "@/components/HomeTopBanner";
import { SignupCta } from "@/components/SignupCta";
import { SmarterWayWealthVisitCard } from "@/components/SmarterWayWealthVisitCard";
/* PremiumPromisePreview (the Save / Upgrade / Improve video panel) is
   deliberately not imported here. It sat between the promise block and the
   calculator, which kept the calculator heading off the first mobile screen.
   Deprecated rather than deleted — the component still builds and is kept for
   reuse here or on smarterwaywealth.com (David, 2026-08-10). */
import { WhatWhyWhoHow } from "@/components/WhatWhyWhoHow";
import {
  HomeCalculatorExperience,
  type CalculatorSimpleControlNodes,
  type CalculatorSliderNodes,
} from "@/components/HomeCalculatorExperience";
import {
  HomeCalculatorTheme,
  HomeMarketingVariantId,
  homeMarketingVariants,
} from "@/config/homeMarketingVariants";
import type { HomeTopBannerId } from "@/config/homeTopBanners";
import { useSavingsBar } from "@/components/SavingsBarContext";
import { capturePostHogEvent } from "@/lib/posthog";
import { shouldOpenCalculatorForEddmQr } from "@/lib/campaignAttribution";
import {
  buildAdvancedCalculatorHrefFromState,
} from "@/config/advancedCalculator";

type IntroStyle = "rule" | "panel" | "quote";

function getAssetTier(portfolioValue: number) {
  if (portfolioValue < 500000) return "under_500k";
  if (portfolioValue < 1000000) return "500k_1m";
  if (portfolioValue < 2500000) return "1m_2_5m";
  if (portfolioValue < 5000000) return "2_5m_5m";
  return "5m_plus";
}

// ============================================================================
// PILL SLIDER - Value-in-pill thumb with color-coded track
// ============================================================================

const TIME_HORIZON_VALUES = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 20, 25, 30];

type Props = {
  initialState: CalculatorState;
  searchParams: Record<string, string | string[] | undefined>;
  marketingVariantId: HomeMarketingVariantId;
  experienceMode?: "marketing" | "calculator-first" | "savings-calculator-upgrade";
  bannerId?: HomeTopBannerId;
};

interface PillSliderProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  format: (v: number) => string;
  variant: "destructive" | "accumulation";
  labelAction?: ReactNode;
  pillColorOverride?: string;
  theme: HomeCalculatorTheme["slider"];
  // Standard mode (min/max/step)
  min?: number;
  max?: number;
  step?: number;
  // Array mode - overrides min/max/step when provided
  values?: number[];
}

interface SimpleRangeControlProps {
  formatter: (value: number) => string;
  label: string;
  /** Show the superscript disclaimer marker beside the label. */
  showNote?: boolean;
  max: number;
  min: number;
  onChange: (value: number) => void;
  step: number;
  value: number;
}

/**
 * Returns the run of characters inserted into `previous` to produce `next`,
 * or null when the edit was not a simple insertion.
 *
 * This backs the "typing replaces the whole number" behaviour. Selecting the
 * field's text on focus is the first line of defence, but iOS Safari routinely
 * collapses a programmatic selection to a caret right after focus, which is
 * what makes phone editing feel broken: the visitor taps 2000000, types "5",
 * and gets 5000000 or 20000005 instead of 5. When the selection did not
 * survive, the first keystroke arrives as an insertion into the old text —
 * this extracts what they actually typed so it can stand alone.
 */
function extractInsertedText(previous: string, next: string) {
  if (next.length <= previous.length) return null;

  let prefix = 0;
  while (prefix < previous.length && previous[prefix] === next[prefix]) prefix += 1;

  let suffix = 0;
  while (
    suffix < previous.length - prefix &&
    previous[previous.length - 1 - suffix] === next[next.length - 1 - suffix]
  ) {
    suffix += 1;
  }

  const inserted = next.slice(prefix, next.length - suffix);
  return inserted.length > 0 ? inserted : null;
}

function SimpleRangeControl({
  formatter,
  label,
  showNote,
  max,
  min,
  onChange,
  step,
  value,
}: SimpleRangeControlProps) {
  const precision = useMemo(() => {
    const decimalPlaces = (number: number) => number.toString().split(".")[1]?.length ?? 0;
    return Math.max(decimalPlaces(min), decimalPlaces(max), decimalPlaces(step));
  }, [max, min, step]);

  const clampAndSnap = useCallback(
    (raw: number) => {
      const snapped = Number((min + Math.round((raw - min) / step) * step).toFixed(precision));
      return Math.min(max, Math.max(min, snapped));
    },
    [max, min, precision, step]
  );

  const slug = label.toLowerCase().replaceAll(" ", "-");
  const inputId = `final-${slug}-input`;

  // Editable text shadow of the current value. Null = show formatted value
  // derived from props; a string = the user is editing.
  const [draft, setDraft] = useState<string | null>(null);
  const displayValue = draft ?? formatter(value);
  // True between focus and the first keystroke: the whole value is meant to be
  // selected, so the next thing typed should replace it rather than join it.
  const replaceOnNextKeyRef = useRef(false);

  const selectAll = useCallback((input: HTMLInputElement) => {
    try {
      input.setSelectionRange(0, input.value.length);
    } catch {
      // Some browsers reject setSelectionRange on certain input types; the
      // insertion fallback in onChange covers this case.
    }
  }, []);
  const parseTextValue = useCallback((text: string) => {
    const cleaned = text.replace(/[^0-9.\-]/g, "");
    const numeric = Number.parseFloat(cleaned);
    return Number.isFinite(numeric) ? numeric : null;
  }, []);
  const parseDraft = useCallback(() => (draft === null ? null : parseTextValue(draft)), [draft, parseTextValue]);

  const commitDraft = useCallback((currentText?: string) => {
    const text = currentText ?? draft;
    if (text === null) return;
    // Strip $, %, commas, spaces — keep digits, decimal point, minus.
    const numeric = parseTextValue(text);
    if (numeric !== null) {
      onChange(clampAndSnap(numeric));
    }
    setDraft(null);
  }, [clampAndSnap, draft, onChange, parseTextValue]);

  const stepValue = useCallback(
    (delta: number) => {
      const numeric = parseDraft();
      const baseValue = numeric === null ? value : clampAndSnap(numeric);
      setDraft(null);
      onChange(clampAndSnap(baseValue + delta));
    },
    [clampAndSnap, onChange, parseDraft, value]
  );

  const canDecrease = value > min;
  const canIncrease = value < max;

  /* Label and stepper share one row at every width, and the min\u2013max hint is
     gone: the +/- buttons and clamping already refuse out-of-range values, so
     the hint cost a line of height on a phone to restate what the control
     enforces anyway. Together this took each row from 95px to roughly 52px
     (David, 2026-08-10). */
  return (
    <div className="flex items-center justify-between gap-2">
      <label
        htmlFor={inputId}
        className="min-w-0 flex-1 text-[13px] font-bold leading-tight text-[#213B56]"
      >
        {label}
        {showNote ? <NoteMarker /> : null}
      </label>
      <div className="flex shrink-0 items-stretch overflow-hidden rounded border border-[#DFE6EE] bg-[#FBFCFD] focus-within:border-[#108843] focus-within:ring-2 focus-within:ring-[#108843]/30">
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => stepValue(-step)}
          disabled={!canDecrease}
          className="grid h-9 w-9 place-items-center border-r border-[#DFE6EE] text-[#31506D] transition hover:bg-[#EEF3F7] disabled:cursor-not-allowed disabled:text-[#A8B5C2] disabled:hover:bg-transparent"
          aria-label={`Decrease ${label}`}
        >
          <Minus aria-hidden="true" size={14} strokeWidth={2.5} />
        </button>
        <input
          id={inputId}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          spellCheck={false}
          value={displayValue}
          onChange={(event) => {
            let nextDraft = event.target.value;

            if (replaceOnNextKeyRef.current) {
              replaceOnNextKeyRef.current = false;
              // Selection survived: nextDraft is already only what was typed.
              // Selection was collapsed (iOS): recover the typed run so it
              // replaces the old number instead of merging into it.
              const inserted = extractInsertedText(displayValue, nextDraft);
              if (inserted) nextDraft = inserted;
            }

            setDraft(nextDraft);
            const numeric = parseTextValue(nextDraft);
            if (numeric !== null) {
              onChange(clampAndSnap(numeric));
            }
          }}
          onFocus={(event) => {
            const input = event.currentTarget;
            setDraft(formatter(value));
            replaceOnNextKeyRef.current = true;
            // Defer so the value is in the DOM before selection, then retry:
            // iOS collapses the first attempt often enough to be worth it.
            requestAnimationFrame(() => selectAll(input));
            window.setTimeout(() => selectAll(input), 60);
          }}
          onBlur={(event) => {
            replaceOnNextKeyRef.current = false;
            commitDraft(event.currentTarget.value);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commitDraft(event.currentTarget.value);
              event.currentTarget.blur();
            } else if (event.key === "Escape") {
              event.preventDefault();
              replaceOnNextKeyRef.current = false;
              setDraft(null);
              event.currentTarget.blur();
            }
          }}
          className="h-9 min-w-[6ch] border-0 bg-transparent px-2 text-right text-base font-bold leading-none text-[#10233A] tabular-nums outline-none"
          style={{ width: `${Math.max(6, displayValue.length + 2)}ch` }}
          aria-label={`${label} value`}
        />
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => stepValue(step)}
          disabled={!canIncrease}
          className="grid h-9 w-9 place-items-center border-l border-[#DFE6EE] text-[#31506D] transition hover:bg-[#EEF3F7] disabled:cursor-not-allowed disabled:text-[#A8B5C2] disabled:hover:bg-transparent"
          aria-label={`Increase ${label}`}
        >
          <Plus aria-hidden="true" size={14} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

function PillSlider({
  label,
  value,
  onChange,
  format,
  variant,
  labelAction,
  pillColorOverride,
  theme,
  min,
  max,
  step,
  values,
}: PillSliderProps) {
  const isArrayMode = !!values;

  // Array mode: find closest index for the current value
  const arrayIdx = useMemo(() => {
    if (!values) return 0;
    let best = 0;
    for (let i = 1; i < values.length; i++) {
      if (Math.abs(values[i] - value) < Math.abs(values[best] - value)) best = i;
    }
    return best;
  }, [value, values]);

  const lastRef = useRef(isArrayMode ? arrayIdx : value);
  const [isActive, setIsActive] = useState(false);

  // Native input props
  const inputMin = isArrayMode ? 0 : (min ?? 0);
  const inputMax = isArrayMode ? values!.length - 1 : (max ?? 100);
  const inputStep = isArrayMode ? 1 : (step ?? 1);
  const inputValue = isArrayMode ? arrayIdx : value;

  // Percentage for positioning
  const pct =
    inputMax > inputMin ? ((inputValue - inputMin) / (inputMax - inputMin)) * 100 : 0;

  // Displayed value (resolved from array if needed)
  const displayValue = isArrayMode ? values![arrayIdx] : value;

  const basePillColor = variant === "destructive" ? theme.destructiveColor : theme.accumulationColor;
  const pillColor = pillColorOverride ?? basePillColor;
  const trackColor = variant === "destructive" ? theme.destructiveTrack : theme.accumulationTrack;

  const precision = useMemo(() => {
    if (isArrayMode || !step) return 0;
    return step.toString().split(".")[1]?.length ?? 0;
  }, [isArrayMode, step]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = Number.parseFloat(e.target.value);
      if (Number.isNaN(raw)) return;

      if (isArrayMode) {
        const newIdx = Math.round(raw);
        const clamped = Math.min(values!.length - 1, Math.max(0, newIdx));
        if (clamped !== lastRef.current) {
          const newVal = values![clamped];
          lastRef.current = clamped;
          onChange(newVal);
        }
      } else {
        const s = step ?? 1;
        const snapped = Number((Math.round(raw / s) * s).toFixed(precision));
        const clamped = Math.min(max ?? 100, Math.max(min ?? 0, snapped));
        lastRef.current = clamped;
        onChange(clamped);
      }
    },
    [isArrayMode, values, min, max, step, precision, onChange]
  );

  return (
    <div>
      <div className="mb-0 flex items-center justify-between gap-3">
        <p className={`text-[13px] font-semibold uppercase tracking-wider ${theme.labelClassName}`}>
          {label}
        </p>
        {labelAction}
      </div>
      <div className="relative flex h-12 items-center">
        {/* Track background */}
        <div className={`absolute inset-x-0 h-1 rounded-full ${theme.trackClassName}`} />
        {/* Track fill */}
        <div
          className="absolute left-0 h-1 rounded-full transition-[width] duration-75"
          style={{ width: `${pct}%`, backgroundColor: trackColor }}
        />
        {/* Native range input - 48px hit zone (exceeds 44px HIG min). */}
        <input
          type="range"
          min={inputMin}
          max={inputMax}
          step={inputStep}
          value={inputValue}
          onChange={handleChange}
          onPointerDown={(e) => {
            if (e.pointerType === "touch") setIsActive(true);
          }}
          onPointerUp={() => setIsActive(false)}
          onPointerCancel={() => setIsActive(false)}
          onPointerLeave={() => setIsActive(false)}
          className="pill-slider-input absolute inset-x-0 z-20 h-12 w-full cursor-grab opacity-0 active:cursor-grabbing"
          aria-label={label}
        />
        {/* Visual pill thumb - translucent blue halo on touch only; no scaling. */}
        <div
          className="pointer-events-none absolute z-10 flex h-9 items-center justify-center rounded-full px-3.5 transition-[box-shadow] duration-150"
          style={{
            left: `${pct}%`,
            transform: `translateX(-${pct}%)`,
            backgroundColor: pillColor,
            boxShadow: isActive
              ? "0 0 0 8px rgba(59,130,246,0.22), 0 0 0 14px rgba(59,130,246,0.10), 0 2px 12px rgba(0,0,0,0.2)"
              : "0 2px 12px rgba(0,0,0,0.2)",
          }}
        >
          <span className="text-sm font-bold tabular-nums text-white whitespace-nowrap">
            {format(displayValue)}
          </span>
        </div>
      </div>
    </div>
  );
}

function normalizeSearchParams(searchParams: Record<string, string | string[] | undefined>) {
  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((entry) => params.append(key, entry));
    } else if (typeof value === "string") {
      params.set(key, value);
    }
  });
  return params;
}

function SavingsLeadHero({
  introStyle,
  savings,
  years,
}: {
  introStyle: IntroStyle;
  savings: number;
  years: number;
}) {
  /* The promise reads in full the moment the page paints. It used to fade in
     one clause at a time and swap the name between "David" and "Smarter Way
     Wealth" on scroll; that sequence was retired (David, 2026-08-10) because
     the statement now sits on the first mobile screen, where a line that
     rewrites itself under the visitor reads as distracting rather than
     deliberate. */
  const statement = (
    <>
      <span className="block text-center">Smarter Way Wealth</span>
      <span className="block">
        delivers{" "}
        <span className="text-[#007A2F]">
          personal, real human fiduciary advice and planning
        </span>{" "}
        for a simple{" "}
        <span className="whitespace-nowrap">$100/month. Period.</span>
      </span>
    </>
  );
  const introContent =
    introStyle === "panel" ? (
      <div className="relative mx-auto max-w-4xl px-0 py-6 sm:px-10 sm:py-8">
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-[#108843] to-transparent shadow-[0_1px_0_rgba(255,255,255,0.75)]" />
        <p className="mx-auto max-w-3xl text-2xl font-semibold leading-[1.14] tracking-normal text-[#10233A] sm:text-[clamp(1.55rem,3.8vw,2.35rem)]">
          {statement}
        </p>
        <p className="mx-auto mt-6 max-w-3xl text-center text-[clamp(1.15rem,3.15vw,2rem)] font-medium leading-[1.14] tracking-normal text-[#10233A] sm:mt-7">
          <span className="whitespace-nowrap">David Van Osdol,</span>{" "}
          <span className="whitespace-nowrap">CFA, CFP®</span>
        </p>
        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-[#108843] to-transparent shadow-[0_1px_0_rgba(255,255,255,0.75)]" />
      </div>
    ) : introStyle === "quote" ? (
      <div className="mx-auto max-w-4xl px-3 py-8 sm:py-10">
        <div className="mx-auto max-w-3xl border-l-[6px] border-[#108843] pl-6 text-left">
          <p className="text-[clamp(1.55rem,3.8vw,2.35rem)] font-semibold leading-[1.14] tracking-normal text-[#10233A]">
            {statement}
          </p>
        </div>
      </div>
    ) : (
      <div className="mx-auto max-w-4xl py-7 sm:py-9">
        <div className="mx-auto h-1.5 w-[min(570px,72%)] rounded-full bg-[#108843]" />
        <p className="mx-auto mt-7 max-w-3xl text-[clamp(1.55rem,3.8vw,2.35rem)] font-semibold leading-[1.14] tracking-normal text-[#10233A]">
          {statement}
        </p>
        <div className="mx-auto mt-7 h-1.5 w-[min(570px,72%)] rounded-full bg-[#108843]" />
      </div>
    );
  const introBlock = <div className="mt-[47px] sm:mt-20">{introContent}</div>;

  /* Mobile spacing here is a fixed budget, not a free choice. Two rules
     compete: the page must breathe, and "The Fee Calculator" must still be on
     the first screen (David, 2026-08-10, -11 and -12). The pre-simplification
     padding totals about 158px more than fits above the fold on a phone, so
     these values give back 56px of it — the most the heading can absorb — split
     in proportion to the original three gaps. Desktop was never tightened and
     keeps its original values through the sm: steps.

     2026-08-12: each of the three gaps gained 6px, paid for by 7px trimmed from
     the mobile header. 8px was tried first and rendered fine at 393px wide, but
     tests/home-first-screen.mjs measures 390px too — where the layout runs a
     few pixels taller and the heading's letterforms crossed the fold on an
     iPhone 14. Trust that test, not a screenshot at one width.

     Later the same day David asked for 5px more between the header and the top
     of the "?" (44px → 49px), with everything below pushed down in turn. Done,
     and it spends the budget exactly: the heading's letters now end at 659px on
     an iPhone 14, which is the fold — zero margin — and 8px above it on an
     iPhone 15/16. THERE IS NOTHING LEFT. The next pixel added anywhere above
     the calculator cuts the words on an iPhone 14, and the only remaining place
     to buy room is the header, already down to a 58px logo in a 70px bar.
     Re-run the geometry test before touching anything here. */
  return (
    <section
      data-url-eval-section="opening-promise"
      className="w-full bg-[#EEF0F5] pb-[73px] text-center text-[#10233A] sm:pb-[110px]"
    >
      <div className="relative isolate overflow-hidden bg-gradient-to-b from-[#E7EAF0] via-[#EAEDF3] to-[#EEF0F5] px-4 pt-[64px] pb-11 sm:pt-20 sm:pb-20">
        {/* 48.3% rather than 47% on mobile. The mark is centred as a share of
            the hero's height, so growing the hero above it only moves it down
            by that fraction — 5px of new padding would have opened the gap
            David measured by about 2px. The extra 1.3 points makes up the
            difference, so the visible gap between the header and the top of the
            "?" grows the full 5px he asked for (David, 2026-08-12). Desktop is
            untouched. */}
        <div
          aria-hidden="true"
          data-hero-mark
          className="pointer-events-none absolute left-1/2 top-[48.3%] z-0 -translate-x-1/2 -translate-y-1/2 scale-y-[1.05] select-none text-[12.5rem] font-bold leading-none text-white sm:top-[50%] sm:text-[17rem]"
          style={{ fontFamily: '"Satoshi", var(--font-sans), sans-serif' }}
        >
          ?
        </div>
        <div className="relative z-10 mx-auto max-w-6xl">
          {/* Two lines, always. The question line carries a smaller floor than
              the dollar line so it stays unbroken at 375px instead of orphaning
              "with" on a third line; both lines converge on the same size once
              the viewport is wide enough for the fluid step to take over. */}
          <h1 className="font-semibold leading-[1.06] tracking-normal">
            <span className="block text-[clamp(1.7rem,4.8vw,4rem)]">What would you do with</span>
            <span className="block text-[clamp(2.25rem,4.8vw,4rem)] text-[#007A2F] tabular-nums">
              {formatCurrencyFloored(savings)}
              <NoteMarker />
            </span>
          </h1>
          {/* One step down, and the attribution line below the promise with it:
              the two of them paid for the 5px David added to each of the three
              gaps on 2026-08-12. */}
          <p className="mt-3 text-sm font-medium leading-snug text-[#10233A]/80 sm:text-base">
            Potential savings over {years} years.
          </p>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4">{introBlock}</div>
    </section>
  );
}

export function CostAnalysisCalculator({
  bannerId = "founder-proof",
  experienceMode = "marketing",
  initialState,
  searchParams,
  marketingVariantId,
}: Props) {
  const paramsFromServer = useMemo(() => normalizeSearchParams(searchParams), [searchParams]);
  const shouldOpenQrCalculator = useMemo(
    () => shouldOpenCalculatorForEddmQr(paramsFromServer),
    [paramsFromServer],
  );
  const mergedState = useMemo(
    () => ({
      ...DEFAULT_STATE,
      ...initialState,
    }),
    [initialState]
  );

  const [state, setState] = useState<CalculatorState>(mergedState);
  const [assumptionsCustomized, setAssumptionsCustomized] = useState(false);
  const [activeCard, setActiveCard] = useState<"smarter" | "traditional" | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<"idle" | "success" | "error">("idle");
  const [slidersExpanded, setSlidersExpanded] = useState(true);
  const [showMutualFundExpenses, setShowMutualFundExpenses] = useState(
    mergedState.mutualFundExpensePercent > 0
  );
  const [chartReady, setChartReady] = useState(false);
  const calculatorStartedRef = useRef(false);
  const calculatorSubmittedRef = useRef(false);
  const updateCalculatorState = useCallback((patch: Partial<CalculatorState>) => {
    const changedFields = Object.keys(patch);
    const nextState = { ...state, ...patch };

    if (!calculatorStartedRef.current) {
      calculatorStartedRef.current = true;
      capturePostHogEvent("calculator_started", {
        changed_fields: changedFields,
        first_changed_field: changedFields[0],
        experience_mode: experienceMode,
        marketing_variant: marketingVariantId,
        calculated_asset_tier: getAssetTier(nextState.portfolioValue),
        portfolio_value: nextState.portfolioValue,
        annual_fee_percent: nextState.annualFeePercent,
        mutual_fund_expense_percent: nextState.mutualFundExpensePercent,
        annual_growth_percent: nextState.annualGrowthPercent,
        years: nextState.years,
      });
    }

    setAssumptionsCustomized(true);
    setState((prev) => ({ ...prev, ...patch }));
  }, [experienceMode, marketingVariantId, state]);

  const totalAnnualFeePercent = state.annualFeePercent + state.mutualFundExpensePercent;

  const projection = useMemo(
    () =>
      buildFeeProjection({
        annualFlatFee: state.annualFlatFee,
        initialInvestment: state.portfolioValue,
        years: state.years,
        annualFeePercent: totalAnnualFeePercent,
        annualGrowthPercent: state.annualGrowthPercent,
      }),
    [state.annualFlatFee, state.annualGrowthPercent, state.portfolioValue, state.years, totalAnnualFeePercent]
  );
  const advancedCalculatorHref = useMemo(
    () => buildAdvancedCalculatorHrefFromState(state),
    [state],
  );

  useEffect(() => {
    if (!assumptionsCustomized || calculatorSubmittedRef.current) return;

    calculatorSubmittedRef.current = true;
    capturePostHogEvent("calculator_submitted", {
      submission_type: "instant_result_rendered",
      experience_mode: experienceMode,
      marketing_variant: marketingVariantId,
      calculated_asset_tier: getAssetTier(state.portfolioValue),
      portfolio_value: state.portfolioValue,
      annual_fee_percent: state.annualFeePercent,
      mutual_fund_expense_percent: state.mutualFundExpensePercent,
      total_annual_fee_percent: totalAnnualFeePercent,
      annual_growth_percent: state.annualGrowthPercent,
      years: state.years,
      projected_savings: Math.round(projection.savings),
      projected_total_asset_based_fees: Math.round(projection.totalFees),
      projected_total_flat_fees: Math.round(projection.totalFlatFees),
    });
  }, [assumptionsCustomized, experienceMode, marketingVariantId, projection.savings, projection.totalFees, projection.totalFlatFees, state, totalAnnualFeePercent]);

  const { setData: setSavingsBarData } = useSavingsBar();
  useEffect(() => {
    setSavingsBarData({
      savings: projection.savings,
      years: state.years,
      annualFeePercent: state.annualFeePercent,
    });
  }, [projection.savings, state.years, state.annualFeePercent, setSavingsBarData]);
  useEffect(() => {
    return () => setSavingsBarData(null);
  }, [setSavingsBarData]);

  const introStyle = useMemo<IntroStyle>(() => {
    const intro = paramsFromServer.get("intro");
    return intro === "rule" || intro === "quote" ? intro : "panel";
  }, [paramsFromServer]);

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const query = buildQueryFromState(state, paramsFromServer);
    const base = `${window.location.origin}${window.location.pathname}`;
    return `${base}?${query}`;
  }, [paramsFromServer, state]);

  useEffect(() => {
    if (!shouldOpenQrCalculator) return;

    let animationFrame = 0;
    const timeoutIds: number[] = [];
    const scrollToCalculator = () => {
      const hash = window.location.hash;
      if (hash && hash !== "#calculator") return;

      document.getElementById("calculator")?.scrollIntoView({
        behavior: "auto",
        block: "start",
      });
    };

    animationFrame = window.requestAnimationFrame(scrollToCalculator);
    timeoutIds.push(window.setTimeout(scrollToCalculator, 180));
    timeoutIds.push(window.setTimeout(scrollToCalculator, 650));

    return () => {
      window.cancelAnimationFrame(animationFrame);
      timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
    };
  }, [shouldOpenQrCalculator]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isDefaultState =
      state.portfolioValue === DEFAULT_STATE.portfolioValue &&
      state.years === DEFAULT_STATE.years &&
      state.annualGrowthPercent === DEFAULT_STATE.annualGrowthPercent &&
      state.annualFlatFee === DEFAULT_STATE.annualFlatFee &&
      state.annualFeePercent === DEFAULT_STATE.annualFeePercent &&
      state.mutualFundExpensePercent === DEFAULT_STATE.mutualFundExpensePercent;

    let query: string;
    if (isDefaultState) {
      // Default state on a fresh visit (e.g. mailed QR code) should not pollute
      // the address bar. Strip the calculator's own params but preserve any
      // unrelated query strings the server passed in (utm_*, variant, etc.).
      const params = new URLSearchParams(paramsFromServer ? paramsFromServer.toString() : undefined);
      params.delete("portfolio");
      params.delete("years");
      params.delete("growth");
      params.delete("fee");
      params.delete("flat");
      params.delete("mfe");
      query = params.toString();
    } else {
      query = buildQueryFromState(state, paramsFromServer);
    }

    const nextUrl = query
      ? `${window.location.pathname}?${query}${window.location.hash}`
      : `${window.location.pathname}${window.location.hash}`;
    const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (currentUrl !== nextUrl) {
      window.history.replaceState(window.history.state, "", nextUrl);
    }
  }, [paramsFromServer, state]);

  const shareSummary = useMemo(
    () =>
      [
        "Smarter Way Wealth projection",
        `Potential savings: ${formatCurrencyFloored(projection.savings)}`,
        `Portfolio value: ${formatCurrency(state.portfolioValue)}`,
        `Annual flat fee: ${formatCurrency(state.annualFlatFee)}`,
        `Advisory fee: ${state.annualFeePercent.toFixed(2)}%`,
        `Mutual fund expenses: ${state.mutualFundExpensePercent.toFixed(2)}%`,
        `Total annual fee load: ${totalAnnualFeePercent.toFixed(2)}%`,
        `Annual growth: ${state.annualGrowthPercent.toFixed(1)}%`,
        `Time horizon: ${state.years} years`,
        `Smarter Way Wealth value: ${formatCurrencyFloored(projection.finalValueWithoutFees)}`,
        `Traditional asset-based fee value: ${formatCurrencyFloored(projection.finalValueWithFees)}`,
        `Lost to asset-based fees: -${formatCurrencyFloored(projection.savings)}`,
      ].join("\n"),
    [projection.finalValueWithFees, projection.finalValueWithoutFees, projection.savings, state, totalAnnualFeePercent]
  );

  const shareResult = useCallback(async () => {
    capturePostHogEvent("cta_clicked", {
      cta_label: "Share your result",
      cta_location: "calculator_share",
      cta_type: "share_result",
      experience_mode: experienceMode,
      marketing_variant: marketingVariantId,
      calculated_asset_tier: getAssetTier(state.portfolioValue),
      projected_savings: Math.round(projection.savings),
    });

    if (!shareUrl || typeof navigator === "undefined") {
      setShareFeedback("error");
      return;
    }

    const shareText = `${shareSummary}\n${shareUrl}`;

    try {
      if (typeof navigator.share === "function") {
        await navigator.share({
          title: "Smarter Way Wealth projection",
          text: shareSummary,
          url: shareUrl,
        });
        setShareFeedback("success");
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareText);
        setShareFeedback("success");
        return;
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }
      if (!(error instanceof Error && error.name === "NotAllowedError")) {
        console.error("Unable to share", error);
      }
    }

    setShareFeedback("error");
  }, [experienceMode, marketingVariantId, projection.savings, shareSummary, shareUrl, state.portfolioValue]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    setIsDarkMode(document.documentElement.classList.contains("dark"));
  }, []);

  useEffect(() => {
    setChartReady(true);
  }, []);

  useEffect(() => {
    if (shareFeedback === "idle") return;
    const timeout = window.setTimeout(
      () => setShareFeedback("idle"),
      shareFeedback === "error" ? 12000 : 2200
    );
    return () => window.clearTimeout(timeout);
  }, [shareFeedback]);

  const handleCardTap = (card: "smarter" | "traditional") => {
    setActiveCard((prev) => (prev === card ? null : card));
  };

  const calculatorRef = useRef<HTMLDivElement>(null);
  const [showDesktopBar, setShowDesktopBar] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show bar when calculator is NOT intersecting AND we have scrolled down past it
        setShowDesktopBar(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0 }
    );

    if (calculatorRef.current) {
      observer.observe(calculatorRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const marketingVariant = homeMarketingVariants[marketingVariantId];
  const calculatorTheme = marketingVariant.calculator;
  const isCalculatorFirst = experienceMode === "calculator-first";
  const isSavingsCalculatorUpgrade = experienceMode === "savings-calculator-upgrade";
  const usesOpeningMarketingHero = experienceMode === "marketing";
  const reducedMotion = useReducedMotion();

  const quoteSectionStyle = isDarkMode
    ? {
        backgroundColor: "#0B1220",
      }
    : {
        backgroundColor: homeCalculatorConfig.quoteSection.backgroundColor,
      };

  const shareButtonLabel =
    shareFeedback === "success" ? "Copied" : shareFeedback === "error" ? "Sharing unavailable" : "Share your result";
  const ShareIcon = shareFeedback === "success" ? Check : Share2;
  const percentLost =
    projection.finalValueWithoutFees > 0
      ? Math.min(100, Math.max(0, (projection.savings / projection.finalValueWithoutFees) * 100))
      : 0;

  const annualFlatFee = state.annualFlatFee;
  const monthlyFlatFee = annualFlatFee / 12;
  const annualAumFeeEstimate = state.portfolioValue * (totalAnnualFeePercent / 100);

  const collapseControl = (
    <button
      type="button"
      onClick={() => setSlidersExpanded((prev) => !prev)}
      className={`inline-flex min-h-8 items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-0 ${calculatorTheme.collapseButtonClassName}`}
      aria-expanded={slidersExpanded}
    >
      {slidersExpanded ? "Collapse" : "Expand"}
      {slidersExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
    </button>
  );

  const shareAction = (
    <div className="flex w-full max-w-sm flex-col items-stretch gap-2 sm:max-w-xs">
      <button
        type="button"
        onClick={shareResult}
        className={`inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg transition-colors ${calculatorTheme.shareButtonClassName}`}
        aria-label="Share your result"
      >
        <ShareIcon className="h-4 w-4" />
        {shareButtonLabel}
      </button>
      {shareFeedback === "error" && shareUrl ? (
        <input
          readOnly
          aria-label="Shareable result link"
          value={shareUrl}
          onFocus={(event) => event.currentTarget.select()}
          className="h-10 w-full rounded-md border border-[#C9D8E4] bg-white px-3 text-xs font-semibold text-[#213B56] shadow-sm outline-none focus:border-[#108843] focus:ring-2 focus:ring-[#108843]/20"
        />
      ) : null}
    </div>
  );

  const disclosure = (
    <p className={`mt-3 text-xs leading-snug ${calculatorTheme.disclaimerClassName}`}>
      Illustrative calculator only. Not investment advice or an advisory relationship.
    </p>
  );

  const helperNotes = (
    <>
      <p className={`text-center text-xs ${calculatorTheme.helperTextClassName}`}>
        Compares our {formatCurrency(monthlyFlatFee)}/mo flat fee vs. a traditional AUM advisory fee, compounded monthly.{" "}
        <Link href="/our-math" className={calculatorTheme.linkClassName}>
          For finance nerds
        </Link>
      </p>
      <div className={`mx-auto mt-4 max-w-2xl space-y-2 text-center text-xs leading-snug ${calculatorTheme.helperTextClassName}`}>
        <p>
          Savings calculations are hypothetical illustrations based on
          assumptions you provide. Actual results will vary. This is not a
          guarantee of performance or savings.
        </p>
        <p>
          The annual growth rate above is an assumption you control, not a
          forecast or recommendation. Smarter Way Wealth does not guarantee the
          accuracy of third-party data.
        </p>
      </div>
    </>
  );

  const calculatorSliders: CalculatorSliderNodes = {
    advisoryFee: (
      <PillSlider
        label="Advisory fee"
        value={state.annualFeePercent}
        onChange={(v) => updateCalculatorState({ annualFeePercent: v })}
        format={(v) => `${v.toFixed(2)}%`}
        variant="destructive"
        theme={calculatorTheme.slider}
        min={0}
        max={3}
        step={0.05}
        labelAction={
          !showMutualFundExpenses ? (
            <button
              type="button"
              onClick={() => setShowMutualFundExpenses(true)}
              className={`text-[11px] font-semibold tracking-wide transition-colors ${calculatorTheme.slider.addButtonClassName}`}
            >
              + add mutual fund expenses
            </button>
          ) : undefined
        }
      />
    ),
    mutualFundExpenses: showMutualFundExpenses ? (
      <div className="mt-4">
        <PillSlider
          label="Mutual fund expenses"
          value={state.mutualFundExpensePercent}
          onChange={(v) => updateCalculatorState({ mutualFundExpensePercent: v })}
          format={(v) => `${v.toFixed(2)}%`}
          variant="destructive"
          theme={calculatorTheme.slider}
          pillColorOverride={marketingVariant.layout === "advisor" ? "#FB7185" : "#7F1D1D"}
          min={0}
          max={3}
          step={0.05}
          labelAction={
            <button
              type="button"
              onClick={() => {
                setShowMutualFundExpenses(false);
                updateCalculatorState({ mutualFundExpensePercent: 0 });
              }}
              className={`text-[11px] font-semibold tracking-wide transition-colors ${calculatorTheme.slider.removeButtonClassName}`}
            >
              remove
            </button>
          }
        />
      </div>
    ) : null,
    portfolio: (
      <PillSlider
        label="Portfolio value"
        value={state.portfolioValue}
        onChange={(v) => updateCalculatorState({ portfolioValue: v })}
        format={(v) => formatCurrency(v)}
        variant="accumulation"
        theme={calculatorTheme.slider}
        min={250000}
        max={5000000}
        step={50000}
      />
    ),
    growth: (
      <PillSlider
        label="Annual growth"
        value={state.annualGrowthPercent}
        onChange={(v) => updateCalculatorState({ annualGrowthPercent: v })}
        format={(v) => `${v.toFixed(1)}%`}
        variant="accumulation"
        theme={calculatorTheme.slider}
        min={4}
        max={12}
        step={0.5}
      />
    ),
    years: (
      <PillSlider
        label="Time horizon"
        value={state.years}
        onChange={(v) => updateCalculatorState({ years: v })}
        format={(v) => `${v} yrs`}
        variant="accumulation"
        theme={calculatorTheme.slider}
        values={TIME_HORIZON_VALUES}
      />
    ),
  };

  const simpleControls: CalculatorSimpleControlNodes = {
    portfolio: (
      <SimpleRangeControl
        label="Portfolio value"
        value={state.portfolioValue}
        onChange={(value) => updateCalculatorState({ portfolioValue: value })}
        formatter={(value) => formatCurrency(value)}
        min={250000}
        max={5000000}
        step={100000}
      />
    ),
    years: (
      <SimpleRangeControl
        label="Years"
        value={state.years}
        onChange={(value) => updateCalculatorState({ years: Math.round(value) })}
        formatter={(value) => `${Math.round(value)}`}
        min={MIN_HORIZON_YEARS}
        max={40}
        step={1}
      />
    ),
    growth: (
      <SimpleRangeControl
        label="Annualized growth"
        value={state.annualGrowthPercent}
        onChange={(value) => updateCalculatorState({ annualGrowthPercent: value })}
        formatter={(value) => `${value.toFixed(2)}%`}
        min={3}
        max={12}
        step={0.25}
      />
    ),
    advisoryFee: (
      <SimpleRangeControl
        label="Asset-based fee"
        showNote
        value={state.annualFeePercent}
        onChange={(value) => updateCalculatorState({ annualFeePercent: value })}
        formatter={(value) => `${value.toFixed(2)}%`}
        min={0.25}
        max={2.5}
        step={0.1}
      />
    ),
  };

  const renderChart = (className: string) => (
    <div className={`relative w-full ${className} ${calculatorTheme.chartFrameClassName}`}>
      {chartReady ? (
        <ProFeeChart
          data={projection.series}
          finalLost={projection.savings}
          finalValueWithoutFees={projection.finalValueWithoutFees}
          finalValueWithFees={projection.finalValueWithFees}
          showSummary={false}
          activeScenario={activeCard}
          portfolioValue={state.portfolioValue}
          years={state.years}
          annualGrowthPercent={state.annualGrowthPercent}
          annualFeePercent={state.annualFeePercent}
          mutualFundExpensePercent={state.mutualFundExpensePercent}
          chartTheme={calculatorTheme.chart}
        />
      ) : (
        <div className={`flex h-full flex-col justify-between p-5 sm:p-8 ${calculatorTheme.chartFrameClassName}`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className={`text-xs font-bold uppercase tracking-[0.18em] ${calculatorTheme.chart.mutedTextClassName}`}>
                Calculator result
              </p>
              <p className={`mt-3 text-3xl font-semibold tracking-normal sm:text-5xl ${calculatorTheme.chart.strongTextClassName}`}>
                {formatCurrencyFloored(projection.savings)}
              </p>
              <p className={`mt-2 text-sm ${calculatorTheme.chart.mutedTextClassName}`}>
                Projected wealth difference over {state.years} years.
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-2xl font-bold text-red-700">{percentLost.toFixed(1)}%</p>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-700">lost</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800">
              <div className="h-3 rounded-full bg-[#007A2F]" style={{ width: "82%" }} />
            </div>
            <div className="h-3 w-full rounded-full bg-red-100 dark:bg-red-950/40">
              <div className="h-3 rounded-full bg-red-500" style={{ width: `${Math.max(8, Math.min(88, percentLost * 4))}%` }} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <div>
              <p className={`font-semibold ${calculatorTheme.chart.strongTextClassName}`}>{formatCurrency(state.portfolioValue)}</p>
              <p className={`text-xs ${calculatorTheme.chart.mutedTextClassName}`}>Starting value</p>
            </div>
            <div>
              <p className={`font-semibold ${calculatorTheme.chart.strongTextClassName}`}>{state.annualGrowthPercent.toFixed(1)}%</p>
              <p className={`text-xs ${calculatorTheme.chart.mutedTextClassName}`}>Growth</p>
            </div>
            <div>
              <p className={`font-semibold ${calculatorTheme.chart.strongTextClassName}`}>{state.years} yrs</p>
              <p className={`text-xs ${calculatorTheme.chart.mutedTextClassName}`}>Time</p>
            </div>
            <div>
              <p className="font-semibold text-red-700">{totalAnnualFeePercent.toFixed(2)}%</p>
              <p className={`text-xs ${calculatorTheme.chart.mutedTextClassName}`}>Fee load</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const calculatorHandoff = isSavingsCalculatorUpgrade ? (
    <div className="section-shell relative z-10 pt-2 sm:pt-3">
      {/* NEVER hide this block behind an entrance animation. `initial={false}`
          means it renders in its final state — visible — in the server HTML and
          stays visible whether or not JavaScript ever arrives.

          It holds "The Fee Calculator", the one thing besides the hero and the
          promise that David wants on the first screen. It used to fade in via
          whileInView with a -40px margin, meaning it had to be 40px inside the
          viewport before it would paint. On a phone it never is: at an iPhone
          14's real height the heading sat at rest with opacity 0, so a visitor
          arriving from the mailed QR code saw blank space where the heading
          should be, and only got it after scrolling. It measured as comfortably
          above the fold the whole time, which is why three rounds of spacing
          work never caught it — the geometry test was sizing every profile's
          viewport at 852px tall, where the trigger always fires.

          Animating on mount instead was the first fix and was still wrong: an
          `initial` of opacity 0 puts opacity 0 in the server HTML, so a slow
          hydration or no JavaScript leaves the heading invisible for exactly
          the visitors least able to wait for it.

          (Found 2026-08-12; tests/home-first-screen.mjs now measures each
          profile at its own height and asserts the heading is actually
          painted.) */}
      <motion.div
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="mx-auto flex w-full max-w-[1380px] flex-col gap-3 text-left sm:flex-row sm:items-end sm:justify-between"
      >
        <div className="min-w-0">
          <h2 className="text-[clamp(2rem,8vw,3.25rem)] font-bold leading-[1.02] tracking-normal text-[#10233A]">
            The Fee Calculator
          </h2>
          <p className="mt-1 max-w-2xl text-base leading-6 text-[#52657A] sm:text-lg">
            Calculate your potential additional wealth using your own numbers.
          </p>
        </div>
        <div className="flex w-full max-w-full flex-col items-start gap-2 sm:w-auto sm:items-end">
          <div className="inline-flex min-h-11 w-fit max-w-full items-center gap-2 rounded-md border border-[#BFD4C8] bg-white px-3 py-2 shadow-[0_10px_28px_rgba(17,33,52,0.08)] sm:px-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#5E6F80]">
              Potential savings
            </span>
            {/* No marker here. The results block carries exactly one, on its
                Amount column (David, 2026-08-12). */}
            <span className="text-xl font-bold leading-none text-[#007A2F] tabular-nums sm:text-2xl">
              {formatCurrencyFloored(projection.savings)}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  ) : null;

  return (
    <>
      {isSavingsCalculatorUpgrade && (
        <SavingsLeadHero
          introStyle={introStyle}
          savings={projection.savings}
          years={state.years}
        />
      )}

      {usesOpeningMarketingHero && (
        <HomeMarketingHero
          variant={marketingVariant}
          savings={projection.savings}
          portfolioValue={state.portfolioValue}
          years={state.years}
          annualGrowthPercent={state.annualGrowthPercent}
          annualFeePercent={state.annualFeePercent}
          mutualFundExpensePercent={state.mutualFundExpensePercent}
          onCalculatorChange={(patch) => updateCalculatorState(patch)}
          onShare={shareResult}
          shareButtonLabel={shareButtonLabel}
        />
      )}

      {/* Mobile Sticky Fee Bar */}
      {usesOpeningMarketingHero && (
        <div
          className={`fixed left-0 right-0 top-[58px] z-40 bg-white/95 backdrop-blur-sm transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] transform-gpu dark:bg-slate-900/90 md:hidden ${
            showDesktopBar ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-full opacity-0"
          }`}
        >
          <div className="flex h-12 items-center justify-center px-4">
            <div
              className="flex items-center gap-2 rounded-full px-4 py-1.5 shadow-sm"
              style={{
                backgroundColor: isDarkMode
                  ? homeCalculatorConfig.cards.lostToFeesDarkBg
                  : homeCalculatorConfig.cards.lostToFeesBg,
                color: homeCalculatorConfig.cards.lostToFeesText
              }}
            >
              <Odometer value={Math.floor(projection.savings / 1000) * 1000} prefix="$" duration={1000} className="text-lg font-bold" />
              <NoteMarker />
              <span className="text-xs font-bold uppercase tracking-wider">
                lost to asset-based fees!
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sticky Fee Bar */}
      {usesOpeningMarketingHero && (
        <div
          className={`fixed left-0 right-0 top-[52px] z-40 hidden bg-white/95 backdrop-blur-sm transition-all duration-800 ease-[cubic-bezier(0.22,1,0.36,1)] transform-gpu md:block ${
            showDesktopBar ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-full opacity-0"
          }`}
        >
          <div className="mx-auto flex h-11 max-w-5xl items-center justify-center gap-6 px-4 text-sm font-medium">
            <div className="flex items-center gap-2">
              <span className="text-gray-500 dark:text-slate-400">SMARTER Way ({formatCurrency(monthlyFlatFee)}/mo):</span>
              <Odometer
                value={Math.floor(projection.finalValueWithoutFees / 1000) * 1000}
                prefix="$"
                duration={800}
                className="font-bold text-[#00A540]"
              />
            </div>

            <div
              className="flex items-center gap-2 rounded-lg px-3 py-1 shadow-sm"
              style={{
                backgroundColor: isDarkMode
                  ? homeCalculatorConfig.cards.lostToFeesDarkBg
                  : homeCalculatorConfig.cards.lostToFeesBg,
                color: homeCalculatorConfig.cards.lostToFeesText
              }}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Lost to Fees:</span>
              <Odometer
                value={Math.floor(projection.savings / 1000) * 1000}
                prefix="-$"
                duration={800}
                className="font-bold"
              />
              <NoteMarker />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-gray-500 dark:text-slate-400">AUM Advisor:</span>
              <Odometer
                value={Math.floor(projection.finalValueWithFees / 1000) * 1000}
                prefix="$"
                duration={800}
                className="font-bold text-gray-900 dark:text-slate-100"
              />
            </div>
          </div>
        </div>
      )}

      <section
        id="calculator"
        ref={calculatorRef}
        className={`relative w-full scroll-mt-24 overflow-hidden ${
          isSavingsCalculatorUpgrade ? "bg-[#EEF0F5] text-slate-950" : calculatorTheme.sectionClassName
        }`}
      >
        <div
          className={`pointer-events-none absolute inset-0 ${
            isSavingsCalculatorUpgrade ? "bg-[#EEF0F5]" : calculatorTheme.backdropClassName
          }`}
        />

        {calculatorHandoff}

        {isCalculatorFirst && (
          <HomeTopBanner
            bannerId={bannerId}
            savings={projection.savings}
            years={state.years}
          />
        )}

        <HomeCalculatorExperience
          layout={marketingVariant.calculatorLayout ?? marketingVariant.layout}
          theme={calculatorTheme}
          series={projection.series}
          savings={projection.savings}
          percentLost={percentLost}
          finalValueWithoutFees={projection.finalValueWithoutFees}
          finalValueWithFees={projection.finalValueWithFees}
          portfolioValue={state.portfolioValue}
          years={state.years}
          annualGrowthPercent={state.annualGrowthPercent}
          annualFeePercent={state.annualFeePercent}
          mutualFundExpensePercent={state.mutualFundExpensePercent}
          totalAnnualFeePercent={totalAnnualFeePercent}
          totalAssetBasedFees={projection.totalFees}
          totalFlatFees={projection.totalFlatFees}
          annualAumFeeEstimate={annualAumFeeEstimate}
          annualFlatFee={annualFlatFee}
          shareAction={shareAction}
          disclosure={isSavingsCalculatorUpgrade ? null : disclosure}
          helperNotes={helperNotes}
          collapseControl={collapseControl}
          slidersExpanded={slidersExpanded}
          sliders={calculatorSliders}
          simpleControls={simpleControls}
          renderChart={renderChart}
          activeScenario={activeCard}
          assumptionsCustomized={assumptionsCustomized}
          advancedCalculatorHref={advancedCalculatorHref}
          showViewTabs={!isSavingsCalculatorUpgrade}
          initialView={isSavingsCalculatorUpgrade ? "inputs" : "header"}
          showChartHeading={isSavingsCalculatorUpgrade}
          onHighlightScenario={handleCardTap}
          onAssumptionChange={(patch) => updateCalculatorState(patch)}
        />

      </section>

      {/* The lean root flow is calculator, WWWH, one primary conversion CTA,
          one broad firm handoff, then notes. Legacy proof and repeated
          conversion sections remain reusable off-root. */}
      {isSavingsCalculatorUpgrade && <WhatWhyWhoHow />}

      {isSavingsCalculatorUpgrade && <SignupCta location="home_post_calculator" />}

      {isSavingsCalculatorUpgrade && <SmarterWayWealthVisitCard />}

      {usesOpeningMarketingHero && (
        <SignupCta location="marketing_post_calculator" />
      )}

      {usesOpeningMarketingHero && (
        <section
          className="relative w-full overflow-hidden py-12 sm:py-16"
          style={quoteSectionStyle}
        >
          <QuoteTickerWithPortraits
            label={homeCalculatorConfig.quoteTicker.label}
            subLabel={homeCalculatorConfig.quoteTicker.subLabel}
          />
        </section>
      )}

      {usesOpeningMarketingHero && (
        <SignupCta location="marketing_page_bottom" />
      )}

      {/* The disclaimer used to render here, as the last block before the site
          footer. It now lives INSIDE that footer, beneath the grey logo, where
          it replaced a weaker paraphrase of itself (David, 2026-08-12) — see
          SiteFooter. Rendering it in both places is what made the page say the
          same thing twice, so it must not come back here.

          It reaches every variant by virtue of being in the site footer, which
          matters: the markers live in the calculator layout and are selected by
          variant, and when this block was gated on experience mode instead,
          /?mode=calculator-first and /?variant=final-home rendered markers whose
          anchors led nowhere. */}
    </>
  );
}
