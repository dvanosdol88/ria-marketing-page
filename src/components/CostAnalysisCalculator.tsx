"use client";

import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check, ChevronDown, ChevronUp, Minus, Plus, Share2 } from "lucide-react";
import Link from "next/link";
import { buildFeeProjection } from "@/lib/feeProjection";
import { CalculatorState, DEFAULT_STATE, buildQueryFromState } from "@/lib/calculatorState";
import { formatCompactCurrency, formatCurrency, formatCurrencyFloored } from "@/lib/format";
import QuoteTickerWithPortraits from "./QuoteTickerWithPortraits";
import { Quiz } from "./Quiz";
import { ProFeeChart } from "@/components/charts/ProFeeChart";
import { ScrollReveal } from "@/components/ScrollReveal";
import { AdvisorProofSections, FitCtaDivider } from "@/components/AdvisorProofSections";
import { homeCalculatorConfig } from "@/config/homeCalculatorConfig";
import { Odometer } from "@/components/Odometer";
import { HomeMarketingHero } from "@/components/HomeMarketingHero";
import { HomeTopBanner } from "@/components/HomeTopBanner";
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

type IntroStyle = "rule" | "panel" | "quote";

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
  boundsFormatter: (value: number) => string;
  formatter: (value: number) => string;
  label: string;
  labelAsterisk?: boolean;
  max: number;
  min: number;
  onChange: (value: number) => void;
  step: number;
  value: number;
}

function SimpleRangeControl({
  boundsFormatter,
  formatter,
  label,
  labelAsterisk,
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

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <label htmlFor={inputId} className="block text-[13px] font-bold leading-tight text-[#213B56]">
          <span>
            {label}
            {labelAsterisk ? "*" : ""}{" "}
            <span className="ml-1.5 whitespace-nowrap text-[12px] font-semibold text-[#5E6F80]">
              ({boundsFormatter(min)}{"\u2013"}{boundsFormatter(max)})
            </span>
          </span>
        </label>
      </div>
      <div className="flex shrink-0 items-stretch overflow-hidden rounded border border-[#DFE6EE] bg-[#FBFCFD] focus-within:border-[#108843] focus-within:ring-2 focus-within:ring-[#108843]/30">
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => stepValue(-step)}
          disabled={!canDecrease}
          className="grid h-[34px] w-8 place-items-center border-r border-[#DFE6EE] text-[#31506D] transition hover:bg-[#EEF3F7] disabled:cursor-not-allowed disabled:text-[#A8B5C2] disabled:hover:bg-transparent"
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
          onChange={(event) => setDraft(event.target.value)}
          onFocus={(event) => {
            setDraft(formatter(value));
            // Defer so the value is in the DOM before selection.
            requestAnimationFrame(() => event.target.select());
          }}
          onBlur={(event) => commitDraft(event.currentTarget.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commitDraft(event.currentTarget.value);
              event.currentTarget.blur();
            } else if (event.key === "Escape") {
              event.preventDefault();
              setDraft(null);
              event.currentTarget.blur();
            }
          }}
          className="h-[34px] min-w-[74px] max-w-[150px] border-0 bg-transparent px-2.5 text-right text-base font-bold leading-none text-[#10233A] tabular-nums outline-none"
          style={{ width: `${Math.max(7, displayValue.length + 3)}ch` }}
          aria-label={`${label} value`}
        />
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => stepValue(step)}
          disabled={!canIncrease}
          className="grid h-[34px] w-8 place-items-center border-l border-[#DFE6EE] text-[#31506D] transition hover:bg-[#EEF3F7] disabled:cursor-not-allowed disabled:text-[#A8B5C2] disabled:hover:bg-transparent"
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
  disclosure,
}: {
  introStyle: IntroStyle;
  savings: number;
  disclosure?: ReactNode;
}) {
  const reducedMotion = useReducedMotion();
  const statement = (
    <>
      Smarter Way Wealth delivers{" "}
      <span className="text-[#007A2F]">personal, real human fiduciary advice and planning</span>
      {" "}for a simple $100/month. Period.
    </>
  );
  const introContent =
    introStyle === "panel" ? (
      <div className="relative mx-auto max-w-4xl px-5 py-8 sm:px-10 sm:py-10">
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-[#108843] to-transparent shadow-[0_1px_0_rgba(255,255,255,0.75)]" />
        <p className="mx-auto max-w-3xl text-[clamp(1.4rem,2.75vw,2.35rem)] font-semibold leading-[1.14] tracking-normal text-[#10233A]">
          {statement}
        </p>
        <p className="mx-auto mt-6 max-w-3xl text-center text-[clamp(1.4rem,2.75vw,2.35rem)] font-semibold leading-[1.14] tracking-normal text-[#10233A] sm:mt-7">
          <span className="whitespace-nowrap">David Van Osdol,</span>{" "}
          <span className="whitespace-nowrap">CFA, CFP</span>
        </p>
        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-[#108843] to-transparent shadow-[0_1px_0_rgba(255,255,255,0.75)]" />
      </div>
    ) : introStyle === "quote" ? (
      <div className="mx-auto max-w-4xl px-3 py-8 sm:py-10">
        <div className="mx-auto max-w-3xl border-l-[6px] border-[#108843] pl-6 text-left">
          <p className="text-[clamp(1.45rem,2.9vw,2.45rem)] font-semibold leading-[1.14] tracking-normal text-[#10233A]">
            {statement}
          </p>
        </div>
      </div>
    ) : (
      <div className="mx-auto max-w-4xl py-7 sm:py-9">
        <div className="mx-auto h-1.5 w-[min(570px,72%)] rounded-full bg-[#108843]" />
        <p className="mx-auto mt-7 max-w-3xl text-[clamp(1.4rem,2.75vw,2.35rem)] font-semibold leading-[1.14] tracking-normal text-[#10233A]">
          {statement}
        </p>
        <div className="mx-auto mt-7 h-1.5 w-[min(570px,72%)] rounded-full bg-[#108843]" />
      </div>
    );
  const introBlock = (
    <motion.div
      className="mt-14 sm:mt-20"
      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut", delay: 0.25 }}
    >
      {introContent}
    </motion.div>
  );

  return (
    <section className="w-full bg-[#EEF0F5] pb-4 text-center text-[#10233A] sm:pb-5">
      <div className="relative isolate overflow-hidden bg-gradient-to-b from-[#E7EAF0] via-[#EAEDF3] to-[#EEF0F5] px-4 pt-12 pb-16 sm:pt-16 sm:pb-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2 scale-y-[1.12] select-none text-[13rem] font-bold leading-none text-white sm:text-[18rem]"
          style={{ fontFamily: '"Satoshi", var(--font-sans), sans-serif' }}
        >
          ?
        </div>
        <div className="relative z-10 mx-auto max-w-6xl">
          <h1 className="text-[clamp(2.25rem,4.8vw,4rem)] font-semibold leading-[1.06] tracking-normal">
            <span className="block">What would you do with</span>
            <span className="block text-[#007A2F] tabular-nums">{formatCurrencyFloored(savings)}</span>
          </h1>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4">
        {introBlock}
        <p className="mt-16 text-xl leading-7 text-slate-900 sm:mt-24 sm:text-2xl">
          See how much <strong>you</strong> can save.
        </p>
        {disclosure ? (
          <div className="mx-auto mt-12 max-w-3xl text-center [&_p]:mt-0">
            {disclosure}
          </div>
        ) : null}
      </div>
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
  const updateCalculatorState = useCallback((patch: Partial<CalculatorState>) => {
    setAssumptionsCustomized(true);
    setState((prev) => ({ ...prev, ...patch }));
  }, []);

  const totalAnnualFeePercent = state.annualFeePercent + state.mutualFundExpensePercent;

  const projection = useMemo(
    () =>
      buildFeeProjection({
        initialInvestment: state.portfolioValue,
        years: state.years,
        annualFeePercent: totalAnnualFeePercent,
        annualGrowthPercent: state.annualGrowthPercent,
      }),
    [state.annualGrowthPercent, state.portfolioValue, state.years, totalAnnualFeePercent]
  );

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
    if (typeof window === "undefined") return;
    const query = buildQueryFromState(state, paramsFromServer);
    const nextUrl = `${window.location.pathname}?${query}${window.location.hash}`;
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
  }, [shareSummary, shareUrl]);

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

  const annualFlatFee = 100 * 12;
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
        Compares our $100/mo flat fee vs. a traditional AUM advisory fee, compounded monthly.{" "}
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
        boundsFormatter={(value) => formatCompactCurrency(value)}
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
        boundsFormatter={(value) => `${Math.round(value)}`}
        min={1}
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
        boundsFormatter={(value) => `${Math.round(value)}%`}
        min={3}
        max={12}
        step={0.25}
      />
    ),
    advisoryFee: (
      <SimpleRangeControl
        label="Asset-based fee"
        labelAsterisk
        value={state.annualFeePercent}
        onChange={(value) => updateCalculatorState({ annualFeePercent: value })}
        formatter={(value) => `${value.toFixed(2)}%`}
        boundsFormatter={(value) => `${value.toFixed(2)}%`}
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

  return (
    <>
      {isSavingsCalculatorUpgrade && (
        <SavingsLeadHero
          introStyle={introStyle}
          savings={projection.savings}
          disclosure={disclosure}
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
              <span className="text-gray-500 dark:text-slate-400">SMARTER Way ($100/mo):</span>
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
          onHighlightScenario={handleCardTap}
          onAssumptionChange={(patch) => updateCalculatorState(patch)}
        />

        {usesOpeningMarketingHero && (
          <div id="quick-poll" className="section-shell relative z-10 -mt-12 pb-20">
            <ScrollReveal delay={0.1} className="mx-auto w-full max-w-3xl">
              <Quiz
                savings={projection.savings}
                onShare={shareResult}
                shareButtonLabel={shareButtonLabel}
              />
            </ScrollReveal>
          </div>
        )}
      </section>

      {isSavingsCalculatorUpgrade && (
        <FitCtaDivider
          eyebrow="Hassle-free"
          lead="We meet you where you are."
          support="Schwab? Fidelity? Morgan Stanley? No need to transfer assets and open new accounts. We can advise you even if you have assets at several custodians."
        />
      )}

      {isSavingsCalculatorUpgrade && (
        <AdvisorProofSections />
      )}

      {isSavingsCalculatorUpgrade && (
        <section
          id="quick-poll"
          className="relative w-full overflow-hidden bg-[#EEF0F5] py-12 sm:py-16"
        >
          <div className="section-shell">
            <ScrollReveal delay={0.1} className="mx-auto w-full max-w-3xl">
              <Quiz
                savings={projection.savings}
                onShare={shareResult}
                shareButtonLabel={shareButtonLabel}
              />
            </ScrollReveal>
          </div>
        </section>
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
    </>
  );
}
