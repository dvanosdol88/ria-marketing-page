"use client";

import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, ChevronUp, Share2 } from "lucide-react";
import Link from "next/link";
import { buildFeeProjection } from "@/lib/feeProjection";
import { CalculatorState, DEFAULT_STATE, buildQueryFromState } from "@/lib/calculatorState";
import { formatCurrency } from "@/lib/format";
import QuoteTickerWithPortraits from "./QuoteTickerWithPortraits";
import { Quiz } from "./Quiz";
import { ProFeeChart } from "@/components/charts/ProFeeChart";
import { ScrollReveal } from "@/components/ScrollReveal";
import { homeCalculatorConfig } from "@/config/homeCalculatorConfig";
import { Odometer } from "@/components/Odometer";

// ============================================================================
// PILL SLIDER — Value-in-pill thumb with color-coded track
// ============================================================================

const DESTRUCTIVE_COLOR = "#991B1B";
const DESTRUCTIVE_TRACK = "#FECACA";
const ACCUMULATION_COLOR = "#4B5563";
const ACCUMULATION_TRACK = "#D1D5DB";

const TIME_HORIZON_VALUES = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 20, 25, 30];
const TIME_HORIZON_MAJOR = new Set([15, 20, 25, 30]);

function tryLightHaptic() {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(5);
  }
}

function tryMediumHaptic() {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(15);
  }
}

function tryGrabHaptic() {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(20);
  }
}

type Props = {
  initialState: CalculatorState;
  searchParams: Record<string, string | string[] | undefined>;
};

interface PillSliderProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  format: (v: number) => string;
  variant: "destructive" | "accumulation";
  labelAction?: ReactNode;
  pillColorOverride?: string;
  // Standard mode (min/max/step)
  min?: number;
  max?: number;
  step?: number;
  // Array mode — overrides min/max/step when provided
  values?: number[];
  majorSteps?: Set<number>;
}

function PillSlider({
  label,
  value,
  onChange,
  format,
  variant,
  labelAction,
  pillColorOverride,
  min,
  max,
  step,
  values,
  majorSteps,
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

  const basePillColor = variant === "destructive" ? DESTRUCTIVE_COLOR : ACCUMULATION_COLOR;
  const pillColor = pillColorOverride ?? basePillColor;
  const trackColor = variant === "destructive" ? DESTRUCTIVE_TRACK : ACCUMULATION_TRACK;

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
          if (majorSteps?.has(newVal)) {
            tryMediumHaptic();
          } else {
            tryLightHaptic();
          }
          lastRef.current = clamped;
          onChange(newVal);
        }
      } else {
        const s = step ?? 1;
        const snapped = Number((Math.round(raw / s) * s).toFixed(precision));
        const clamped = Math.min(max ?? 100, Math.max(min ?? 0, snapped));
        if (Math.round(clamped / s) !== Math.round((lastRef.current as number) / s)) {
          tryLightHaptic();
        }
        lastRef.current = clamped;
        onChange(clamped);
      }
    },
    [isArrayMode, values, majorSteps, min, max, step, precision, onChange]
  );

  return (
    <div>
      <div className="mb-0 flex items-center justify-between gap-3">
        <p className="text-[13px] font-semibold uppercase tracking-wider text-neutral-600 dark:text-slate-300">
          {label}
        </p>
        {labelAction}
      </div>
      <div className="relative flex h-12 items-center">
        {/* Track background */}
        <div className="absolute inset-x-0 h-1 rounded-full bg-gray-200 dark:bg-slate-700" />
        {/* Track fill */}
        <div
          className="absolute left-0 h-1 rounded-full transition-[width] duration-75"
          style={{ width: `${pct}%`, backgroundColor: trackColor }}
        />
        {/* Native range input — enlarged invisible thumb for better grab area */}
        <input
          type="range"
          min={inputMin}
          max={inputMax}
          step={inputStep}
          value={inputValue}
          onChange={handleChange}
          onPointerDown={() => { setIsActive(true); tryGrabHaptic(); }}
          onPointerUp={() => setIsActive(false)}
          onPointerCancel={() => setIsActive(false)}
          className="pill-slider-input absolute inset-x-0 z-20 h-12 w-full cursor-grab opacity-0 active:cursor-grabbing"
          aria-label={label}
        />
        {/* Visual pill thumb — glows + scales on grab */}
        <div
          className="pointer-events-none absolute z-10 flex h-9 items-center justify-center rounded-full px-3.5 transition-all duration-150"
          style={{
            left: `${pct}%`,
            transform: `translateX(-${pct}%)${isActive ? " scale(1.08)" : ""}`,
            backgroundColor: pillColor,
            filter: isActive ? "brightness(0.85)" : undefined,
            boxShadow: isActive
              ? `0 0 0 4px ${pillColor}40, 0 0 20px ${pillColor}50`
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

export function CostAnalysisCalculator({ initialState, searchParams }: Props) {
  const mergedState = useMemo(
    () => ({
      ...DEFAULT_STATE,
      ...initialState,
    }),
    [initialState]
  );

  const [state, setState] = useState<CalculatorState>(mergedState);
  const [activeCard, setActiveCard] = useState<"smarter" | "traditional" | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<"idle" | "success" | "error">("idle");
  const [slidersExpanded, setSlidersExpanded] = useState(true);
  const [showMutualFundExpenses, setShowMutualFundExpenses] = useState(
    mergedState.mutualFundExpensePercent > 0
  );

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

  const paramsFromServer = useMemo(() => normalizeSearchParams(searchParams), [searchParams]);

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const query = buildQueryFromState(state, paramsFromServer);
    const base = `${window.location.origin}${window.location.pathname}`;
    return `${base}?${query}`;
  }, [paramsFromServer, state]);

  const shareSummary = useMemo(
    () =>
      [
        "Smarter Way Wealth projection",
        `Portfolio value: ${formatCurrency(state.portfolioValue)}`,
        `Advisory fee: ${state.annualFeePercent.toFixed(2)}%`,
        `Mutual fund expenses: ${state.mutualFundExpensePercent.toFixed(2)}%`,
        `Total annual fee load: ${totalAnnualFeePercent.toFixed(2)}%`,
        `Annual growth: ${state.annualGrowthPercent.toFixed(1)}%`,
        `Time horizon: ${state.years} years`,
        `Smarter Way Wealth value: ${formatCurrency(projection.finalValueWithoutFees)}`,
        `Traditional asset-based fee value: ${formatCurrency(projection.finalValueWithFees)}`,
        `Lost to asset-based fees: -${formatCurrency(projection.savings)}`,
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
      console.error("Unable to share", error);
    }

    setShareFeedback("error");
  }, [shareSummary, shareUrl]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    setIsDarkMode(document.documentElement.classList.contains("dark"));
  }, []);

  useEffect(() => {
    if (shareFeedback === "idle") return;
    const timeout = window.setTimeout(() => setShareFeedback("idle"), 2200);
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

  const heroPromptColor = isDarkMode ? "#D9E4F5" : homeCalculatorConfig.hero.promptColor;
  const heroSavingsColor = isDarkMode ? "#34D399" : homeCalculatorConfig.hero.savingsColor;

  const quoteSectionStyle = isDarkMode
    ? {
        backgroundColor: "#0B1220",
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg width='120' height='120' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='14' y='34' font-size='20' font-family='Arial' fill='%2322C55E' fill-opacity='0.12'%3E%24%3C/text%3E%3Ctext x='68' y='72' font-size='18' font-family='Arial' fill='%2314B8A6' fill-opacity='0.08'%3E%24%3C/text%3E%3Ctext x='30' y='106' font-size='16' font-family='Arial' fill='%235EEAD4' fill-opacity='0.06'%3E%24%3C/text%3E%3C/svg%3E\")",
      }
    : {
        backgroundColor: homeCalculatorConfig.quoteSection.backgroundColor,
        backgroundImage: homeCalculatorConfig.quoteSection.backgroundImage,
      };

  const shareButtonLabel =
    shareFeedback === "success" ? "Copied" : shareFeedback === "error" ? "Sharing unavailable" : "Share your result";
  const ShareIcon = shareFeedback === "success" ? Check : Share2;

  return (
    <>
      {/* Mobile Sticky Fee Bar */}
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
            <Odometer value={projection.savings} prefix="$" duration={1000} className="text-lg font-bold" />
            <span className="text-xs font-bold uppercase tracking-wider">
              lost to asset-based fees!
            </span>
          </div>
        </div>
      </div>

      {/* Desktop Sticky Fee Bar */}
      <div
        className={`fixed left-0 right-0 top-[52px] z-40 hidden bg-white/95 backdrop-blur-sm transition-all duration-800 ease-[cubic-bezier(0.22,1,0.36,1)] transform-gpu md:block ${
          showDesktopBar ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-full opacity-0"
        }`}
      >
        <div className="mx-auto flex h-11 max-w-5xl items-center justify-center gap-6 px-4 text-sm font-medium">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 dark:text-slate-400">SMARTER Way ($100/mo):</span>
            <Odometer
              value={projection.finalValueWithoutFees}
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
              value={projection.savings}
              prefix="-$"
              duration={800}
              className="font-bold"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-500 dark:text-slate-400">AUM Advisor:</span>
            <Odometer
              value={projection.finalValueWithFees}
              prefix="$"
              duration={800}
              className="font-bold text-gray-900 dark:text-slate-100"
            />
          </div>
        </div>
      </div>

      <div ref={calculatorRef} className="w-full bg-transparent pb-1 pt-4 sm:pt-6">
        <div className="section-shell text-center">
          <h1 className="text-2xl font-semibold sm:text-5xl">
            <span style={{ color: heroPromptColor }}>What would you do with </span>
            <span className="whitespace-nowrap">
              <span style={{ color: heroSavingsColor }}>
                <Odometer value={projection.savings} prefix="$" duration={1400} className="align-baseline" />
              </span>
              <span style={{ color: heroPromptColor }}>?</span>
            </span>
          </h1>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-1 text-base text-neutral-900 dark:text-slate-200 sm:text-xl">
            <span>See how much you can save.</span>
          </div>
          <div className="mt-5">
            <Quiz />
          </div>
          <div className="mt-3 flex justify-center">
            <button
              type="button"
              onClick={shareResult}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 sm:text-sm"
              aria-label="Share your result"
            >
              <ShareIcon className="h-3.5 w-3.5" />
              {shareButtonLabel}
            </button>
          </div>
          <p className="mx-auto mt-3 max-w-xl text-center text-xs leading-snug text-neutral-500 dark:text-slate-400">
            Use of this calculator does not establish an advisory relationship
            with Smarter Way Wealth, LLC.
          </p>
        </div>
      </div>

      <section className="relative w-full overflow-hidden bg-[#EEF0F5] dark:bg-slate-950">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 top-[35%] bg-gradient-to-b from-transparent via-[rgba(233,238,255,0.6)] to-transparent dark:via-[rgba(15,23,42,0.5)]" />

        <div className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-20 pt-0 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:gap-8">
            <ScrollReveal className="card overflow-hidden bg-white shadow-xl ring-1 ring-black/5 dark:bg-slate-900 dark:ring-slate-700/70">
              <div className="relative w-full sm:h-[450px] lg:h-[550px]">
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
                />
              </div>

              <div className="border-t border-gray-100 bg-white px-4 pb-4 pt-2 dark:border-slate-700 dark:bg-slate-900 sm:px-6 sm:pb-6 sm:pt-3 lg:px-8 lg:pb-8 lg:pt-4">
                <div className="mb-3 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => setSlidersExpanded((prev) => !prev)}
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-0 dark:text-slate-400 dark:hover:bg-slate-800/60"
                    aria-expanded={slidersExpanded}
                  >
                    {slidersExpanded ? "Collapse all sliders" : "Expand all sliders"}
                    {slidersExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </button>
                </div>
                {slidersExpanded && (
                <>
                <div className="grid grid-cols-1 gap-x-8 gap-y-5 min-[480px]:grid-cols-2 lg:grid-cols-3">
                  {/* Advisory Fee — destructive, always full-width top row */}
                  <div className="col-span-full">
                    <PillSlider
                      label="Advisory fee"
                      value={state.annualFeePercent}
                      onChange={(v) => setState((prev) => ({ ...prev, annualFeePercent: v }))}
                      format={(v) => `${v.toFixed(2)}%`}
                      variant="destructive"
                      min={0}
                      max={3}
                      step={0.05}
                      labelAction={
                        !showMutualFundExpenses ? (
                          <button
                            type="button"
                            onClick={() => setShowMutualFundExpenses(true)}
                            className="text-[11px] font-semibold tracking-wide text-[#4C7AB6] transition-colors hover:text-[#3C6393]"
                          >
                            + add mutual fund expenses
                          </button>
                        ) : undefined
                      }
                    />
                  </div>
                  {showMutualFundExpenses && (
                    <div className="col-span-full">
                      <PillSlider
                        label="Mutual fund expenses"
                        value={state.mutualFundExpensePercent}
                        onChange={(v) => setState((prev) => ({ ...prev, mutualFundExpensePercent: v }))}
                        format={(v) => `${v.toFixed(2)}%`}
                        variant="destructive"
                        pillColorOverride="#7F1D1D"
                        min={0}
                        max={3}
                        step={0.05}
                        labelAction={
                          <button
                            type="button"
                            onClick={() => {
                              setShowMutualFundExpenses(false);
                              setState((prev) => ({ ...prev, mutualFundExpensePercent: 0 }));
                            }}
                            className="text-[11px] font-semibold tracking-wide text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                          >
                            remove
                          </button>
                        }
                      />
                    </div>
                  )}
                  {/* Portfolio Value — accumulation */}
                  <div className="min-[480px]:col-span-2 lg:col-span-1">
                    <PillSlider
                      label="Portfolio value"
                      value={state.portfolioValue}
                      onChange={(v) => setState((prev) => ({ ...prev, portfolioValue: v }))}
                      format={(v) => formatCurrency(v)}
                      variant="accumulation"
                      min={300000}
                      max={5000000}
                      step={50000}
                    />
                  </div>
                  {/* Annual Growth — accumulation, 0.5% snaps */}
                  <PillSlider
                    label="Annual growth"
                    value={state.annualGrowthPercent}
                    onChange={(v) => setState((prev) => ({ ...prev, annualGrowthPercent: v }))}
                    format={(v) => `${v.toFixed(1)}%`}
                    variant="accumulation"
                    min={4}
                    max={12}
                    step={0.5}
                  />
                  {/* Time Horizon — accumulation, custom array with major step haptics */}
                  <PillSlider
                    label="Time horizon"
                    value={state.years}
                    onChange={(v) => setState((prev) => ({ ...prev, years: v }))}
                    format={(v) => `${v} yrs`}
                    variant="accumulation"
                    values={TIME_HORIZON_VALUES}
                    majorSteps={TIME_HORIZON_MAJOR}
                  />
                </div>
                <p className="mt-5 text-center text-xs text-gray-400 dark:text-slate-400">
                  Compares our $100/mo flat fee vs. a traditional AUM advisory fee, compounded monthly.{" "}
                  <Link href="/our-math" className="underline transition-colors hover:text-brand-600">
                    For finance nerds
                  </Link>
                </p>
                <div className="mx-auto mt-4 max-w-2xl space-y-2 text-center text-xs leading-snug text-neutral-500 dark:text-slate-400">
                  <p>
                    Savings calculations are hypothetical illustrations based on
                    assumptions you provide. Actual results will vary. This is
                    not a guarantee of performance or savings.
                  </p>
                  <p>
                    The annual growth rate above is an assumption you control,
                    not a forecast or recommendation. Smarter Way Wealth does
                    not guarantee the accuracy of third-party data.
                  </p>
                </div>
                </>
                )}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section
        className="relative w-full overflow-hidden py-12 sm:py-16"
        style={quoteSectionStyle}
      >
        <QuoteTickerWithPortraits
          label={homeCalculatorConfig.quoteTicker.label}
          subLabel={homeCalculatorConfig.quoteTicker.subLabel}
        />
      </section>
    </>
  );
}
