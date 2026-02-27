"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Info, Minus, Plus, Share2 } from "lucide-react";
import Link from "next/link";
import { buildFeeProjection } from "@/lib/feeProjection";
import { CalculatorState, DEFAULT_STATE, buildQueryFromState } from "@/lib/calculatorState";
import { formatCurrency } from "@/lib/format";
import { ValueCards } from "./value-cards/ValueCards";
import QuoteTickerWithPortraits from "./QuoteTickerWithPortraits";
import { Quiz } from "./Quiz";
import { ProFeeChart } from "@/components/charts/ProFeeChart";
import { ScrollReveal } from "@/components/ScrollReveal";
import { homeCalculatorConfig } from "@/config/homeCalculatorConfig";
import { Odometer } from "@/components/Odometer";

const numberFormatter = new Intl.NumberFormat("en-US");
const sliderAccent = homeCalculatorConfig.controls.sliderAccent;

function formatCompactNumber(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 1_000) {
    const thousands = value / 1_000;
    return `${thousands >= 100 ? thousands.toFixed(0) : thousands.toFixed(1)}K`;
  }
  return numberFormatter.format(value);
}

function tryHaptic() {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(5);
  }
}

function valuesMatch(a: number, b: number, step: number): boolean {
  return Math.abs(a - b) <= Math.max(step / 2, 0.0001);
}

type Props = {
  initialState: CalculatorState;
  searchParams: Record<string, string | string[] | undefined>;
};

type SliderChip = {
  label: string;
  value: number;
};

interface StepperSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (nextValue: number) => void;
  format?: (value: number) => string;
  infoText?: string;
  chips?: SliderChip[];
}

function StepperSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
  infoText,
  chips,
}: StepperSliderProps) {
  const [showInfo, setShowInfo] = useState(false);
  const lastHapticValue = useRef(value);
  const precision = useMemo(() => {
    const decimalPart = step.toString().split(".")[1];
    return decimalPart ? decimalPart.length : 0;
  }, [step]);

  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  const displayValue = format ? format(value) : String(value);

  const clamp = useCallback(
    (candidate: number) => {
      const bounded = Math.min(max, Math.max(min, candidate));
      return Number(bounded.toFixed(precision));
    },
    [max, min, precision]
  );

  const emit = useCallback(
    (candidate: number, vibrate: boolean) => {
      const next = clamp(candidate);
      if (vibrate && Math.round(next / step) !== Math.round(lastHapticValue.current / step)) {
        tryHaptic();
      }
      lastHapticValue.current = next;
      onChange(next);
    },
    [clamp, onChange, step]
  );

  useEffect(() => {
    lastHapticValue.current = value;
  }, [value]);

  const handleSliderChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const raw = Number.parseFloat(event.target.value);
      if (Number.isNaN(raw)) return;
      const stepped = Math.round(raw / step) * step;
      emit(stepped, true);
    },
    [emit, step]
  );

  return (
    <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:shadow-none">
      <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="whitespace-nowrap text-sm font-medium text-gray-800 dark:text-slate-100">{label}</span>
          {infoText && (
            <button
              type="button"
              onClick={() => setShowInfo((prev) => !prev)}
              className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-500 transition-colors hover:bg-slate-50 dark:border-slate-500 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label={`More information about ${label}`}
            >
              <Info className="h-2.5 w-2.5" />
            </button>
          )}
        </div>
        {chips && chips.length > 0 && (
          <div className="flex flex-wrap items-center justify-end gap-1.5">
            {chips.map((chip) => (
              <button
                key={chip.value}
                type="button"
                onClick={() => emit(chip.value, true)}
                className={`rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
                  valuesMatch(value, chip.value, step)
                    ? homeCalculatorConfig.controls.chipActiveClasses
                    : homeCalculatorConfig.controls.chipInactiveClasses
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {showInfo && infoText && (
        <div className="mb-2.5 rounded-lg bg-gray-900 p-2.5 text-xs leading-relaxed text-white dark:bg-slate-800">{infoText}</div>
      )}

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => emit(value - step, true)}
          disabled={value <= min}
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${homeCalculatorConfig.controls.buttonClasses}`}
          aria-label={`Decrease ${label}`}
        >
          <Minus className="h-3.5 w-3.5" />
        </button>

        <div className="relative flex h-8 flex-1 items-center">
          <div className="absolute inset-x-0 h-1.5 rounded-full bg-gray-200 dark:bg-slate-700" />
          <div className="absolute left-0 h-1.5 rounded-full transition-all duration-150" style={{ width: `${pct}%`, backgroundColor: sliderAccent }} />
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={handleSliderChange}
            className="absolute inset-x-0 z-10 h-8 w-full cursor-pointer opacity-0"
            aria-label={`${label} slider`}
          />
          <div
            className="pointer-events-none absolute h-5 w-5 rounded-full border-2 border-white shadow-md transition-all duration-150"
            style={{ left: `calc(${pct}% - 10px)`, backgroundColor: sliderAccent }}
          />
        </div>

        <button
          type="button"
          onClick={() => emit(value + step, true)}
          disabled={value >= max}
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${homeCalculatorConfig.controls.buttonClasses}`}
          aria-label={`Increase ${label}`}
        >
          <Plus className="h-3.5 w-3.5" />
        </button>

        <span className="ml-1 min-w-[4.6rem] text-right text-sm font-bold tabular-nums text-gray-900 dark:text-slate-100">{displayValue}</span>
      </div>
    </div>
  );
}

interface CurrencyInputCardProps {
  label: string;
  value: number;
  onChange: (nextValue: number) => void;
  min: number;
  max: number;
  step: number;
  chips?: SliderChip[];
}

function CurrencyInputCard({ label, value, onChange, min, max, step, chips }: CurrencyInputCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

  const clamp = useCallback(
    (candidate: number) => {
      const bounded = Math.min(max, Math.max(min, candidate));
      return Math.round(bounded);
    },
    [max, min]
  );

  const handleTap = useCallback(() => {
    setEditValue(String(Math.round(value)));
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 40);
  }, [value]);

  const handleBlur = useCallback(() => {
    const parsed = Number.parseInt(editValue.replace(/[^0-9]/g, ""), 10);
    if (!Number.isNaN(parsed)) {
      onChange(clamp(parsed));
    }
    setIsEditing(false);
  }, [clamp, editValue, onChange]);

  const adjustValue = useCallback(
    (candidate: number) => {
      onChange(clamp(candidate));
      tryHaptic();
    },
    [clamp, onChange]
  );

  return (
    <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:shadow-none">
      <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
        <span className="whitespace-nowrap text-sm font-medium text-gray-800 dark:text-slate-100">{label}</span>
        {chips && chips.length > 0 && (
          <div className="flex flex-wrap items-center justify-end gap-1.5">
            {chips.map((chip) => (
              <button
                key={chip.value}
                type="button"
                onClick={() => adjustValue(chip.value)}
                className={`rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
                  valuesMatch(value, chip.value, step)
                    ? homeCalculatorConfig.controls.chipActiveClasses
                    : homeCalculatorConfig.controls.chipInactiveClasses
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => adjustValue(value - step)}
          disabled={value <= min}
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${homeCalculatorConfig.controls.buttonClasses}`}
          aria-label={`Decrease ${label}`}
        >
          <Minus className="h-3.5 w-3.5" />
        </button>

        <div className="relative flex h-8 flex-1 items-center">
          <div className="absolute inset-x-0 h-1.5 rounded-full bg-gray-200 dark:bg-slate-700" />
          <div className="absolute left-0 h-1.5 rounded-full transition-all duration-150" style={{ width: `${pct}%`, backgroundColor: sliderAccent }} />
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(event) => adjustValue(Number.parseInt(event.target.value, 10))}
            className="absolute inset-x-0 z-10 h-8 w-full cursor-pointer opacity-0"
            aria-label={`${label} slider`}
          />
          <div
            className="pointer-events-none absolute h-5 w-5 rounded-full border-2 border-white shadow-md transition-all duration-150"
            style={{ left: `calc(${pct}% - 10px)`, backgroundColor: sliderAccent }}
          />
        </div>

        <button
          type="button"
          onClick={() => adjustValue(value + step)}
          disabled={value >= max}
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${homeCalculatorConfig.controls.buttonClasses}`}
          aria-label={`Increase ${label}`}
        >
          <Plus className="h-3.5 w-3.5" />
        </button>

        {isEditing ? (
          <input
            ref={inputRef}
            type="number"
            inputMode="numeric"
            value={editValue}
            onChange={(event) => setEditValue(event.target.value)}
            onBlur={handleBlur}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleBlur();
            }}
            className="w-28 rounded-lg border border-slate-300 bg-slate-50 px-2 py-1 text-right text-sm font-bold tabular-nums text-gray-900 outline-none ring-2 ring-[#2A3F63] dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100"
          />
        ) : (
          <button
            type="button"
            onClick={handleTap}
            className="min-w-[5.8rem] text-right text-sm font-bold tabular-nums text-gray-900 transition-colors hover:text-[#2A3F63] dark:text-slate-100 dark:hover:text-emerald-300"
            aria-label={`Edit ${label}`}
          >
            {formatCurrency(value)}
          </button>
        )}
      </div>
    </div>
  );
}

function ValueCard({
  label,
  value,
  variant,
  isActive,
  isDimmed,
  onPress,
  isDarkMode,
  className,
}: {
  label: string;
  value: number;
  variant: "smarter" | "traditional";
  isActive: boolean;
  isDimmed: boolean;
  onPress: () => void;
  isDarkMode: boolean;
  className?: string;
}) {
  const cardStyle =
    variant === "smarter"
      ? {
          borderColor: homeCalculatorConfig.cards.smarterWayBorder,
          backgroundColor: isDarkMode
            ? homeCalculatorConfig.cards.smarterWayDarkBg
            : homeCalculatorConfig.cards.smarterWayBg,
        }
      : {
          borderColor: homeCalculatorConfig.cards.traditionalAumBorder,
          backgroundColor: isDarkMode
            ? homeCalculatorConfig.cards.traditionalAumDarkBg
            : homeCalculatorConfig.cards.traditionalAumBg,
        };
  const activeRing = isActive
    ? variant === "smarter"
      ? "ring-2 ring-[#007A2F]/35"
      : "ring-2 ring-[#2A3F63]/30"
    : "";
  const compactDisplay = value >= 1_000_000 ? `$${formatCompactNumber(value)}` : formatCurrency(value);

  return (
    <button
      type="button"
      onClick={onPress}
      className={`h-full rounded-xl border p-3 text-left transition-all sm:p-4 lg:p-5 ${activeRing} ${isDimmed ? "opacity-55" : "opacity-100"} ${className ?? ""}`}
      style={{ borderWidth: homeCalculatorConfig.cards.borderWidthPx, ...cardStyle }}
      aria-pressed={isActive}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-600 dark:text-slate-300">{label}</p>
      <p className="mt-1 text-[clamp(1.1rem,2vw,2rem)] font-semibold text-neutral-900 dark:text-slate-100 sm:mt-2">{compactDisplay}</p>
    </button>
  );
}

function LostFeesCard({ value, isDarkMode, className }: { value: number; isDarkMode: boolean; className?: string }) {
  return (
    <div
      className={`col-span-2 h-full rounded-xl border p-3 text-center sm:p-4 min-[860px]:col-span-1 ${className ?? ""}`}
      style={{
        borderWidth: homeCalculatorConfig.cards.borderWidthPx,
        borderColor: homeCalculatorConfig.cards.lostToFeesBorder,
        backgroundColor: isDarkMode
          ? homeCalculatorConfig.cards.lostToFeesDarkBg
          : homeCalculatorConfig.cards.lostToFeesBg,
      }}
    >
      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: homeCalculatorConfig.cards.lostToFeesText }}>
        {homeCalculatorConfig.cards.lostToFeesLabel}
      </p>
      <p className="mt-1 text-[clamp(1.1rem,1.8vw,1.7rem)] font-bold tabular-nums" style={{ color: homeCalculatorConfig.cards.lostToFeesText }}>
        -{formatCurrency(value)}
      </p>
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

  const projection = useMemo(
    () =>
      buildFeeProjection({
        initialInvestment: state.portfolioValue,
        years: state.years,
        annualFeePercent: state.annualFeePercent,
        annualGrowthPercent: state.annualGrowthPercent,
      }),
    [state]
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
        `Annual growth: ${state.annualGrowthPercent.toFixed(1)}%`,
        `Time horizon: ${state.years} years`,
        `Smarter Way Wealth value: ${formatCurrency(projection.finalValueWithoutFees)}`,
        `Traditional AUM value: ${formatCurrency(projection.finalValueWithFees)}`,
        `Lost to fees: -${formatCurrency(projection.savings)}`,
      ].join("\n"),
    [projection.finalValueWithFees, projection.finalValueWithoutFees, projection.savings, state]
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

  const [scrolledPastHero, setScrolledPastHero] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolledPastHero(window.scrollY > 100);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const updateMode = () => setIsDarkMode(media.matches);
    updateMode();
    media.addEventListener("change", updateMode);

    return () => {
      media.removeEventListener("change", updateMode);
    };
  }, []);

  useEffect(() => {
    if (shareFeedback === "idle") return;
    const timeout = window.setTimeout(() => setShareFeedback("idle"), 2200);
    return () => window.clearTimeout(timeout);
  }, [shareFeedback]);

  const handleCardTap = (card: "smarter" | "traditional") => {
    setActiveCard((prev) => (prev === card ? null : card));
  };

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
      <div
        className={`fixed left-0 right-0 top-12 z-40 border-b border-gray-200 bg-white/95 backdrop-blur-sm transition-all duration-300 dark:border-slate-700 dark:bg-slate-900/90 sm:hidden ${
          scrolledPastHero ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-full opacity-0"
        }`}
      >
        <div className="flex h-12 items-center justify-center gap-2 px-4">
          <span style={{ color: heroSavingsColor }}>
            <Odometer value={projection.savings} prefix="+$" duration={1000} className="text-lg font-bold" />
          </span>
          <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: heroSavingsColor }}>
            You Save
          </span>
        </div>
      </div>

      <div className="w-full bg-transparent pb-1 pt-4 sm:pt-6">
        <div className="section-shell text-center">
          <h1 className="text-2xl font-semibold sm:text-5xl">
            <span style={{ color: heroPromptColor }}>What would you do with </span>
            <span style={{ color: heroSavingsColor }}>
              <Odometer value={projection.savings} prefix="$" duration={1400} className="align-baseline" />
            </span>
            <span style={{ color: heroPromptColor }}>?</span>
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
        </div>
      </div>

      <section className="relative w-full overflow-hidden bg-[#EEF0F5] dark:bg-slate-950">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 top-[35%] bg-gradient-to-b from-transparent via-[rgba(233,238,255,0.6)] to-transparent dark:via-[rgba(15,23,42,0.5)]" />

        <div className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-20 pt-0 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:gap-8">
            <ScrollReveal className="card overflow-hidden bg-white shadow-xl ring-1 ring-black/5 dark:bg-slate-900 dark:ring-slate-700/70">
              <div className="grid grid-cols-2 gap-3 border-b border-gray-100 p-4 dark:border-slate-700 sm:gap-4 sm:p-6 lg:p-8 min-[860px]:grid-cols-3">
                <ValueCard
                  label="Smarter Way Wealth"
                  value={projection.finalValueWithoutFees}
                  variant="smarter"
                  isActive={activeCard === "smarter"}
                  isDimmed={activeCard === "traditional"}
                  onPress={() => handleCardTap("smarter")}
                  isDarkMode={isDarkMode}
                  className="order-1"
                />
                <ValueCard
                  label="Traditional AUM"
                  value={projection.finalValueWithFees}
                  variant="traditional"
                  isActive={activeCard === "traditional"}
                  isDimmed={activeCard === "smarter"}
                  onPress={() => handleCardTap("traditional")}
                  isDarkMode={isDarkMode}
                  className="order-2 min-[860px]:order-3"
                />
                <LostFeesCard value={projection.savings} isDarkMode={isDarkMode} className="order-3 min-[860px]:order-2" />
              </div>

              <div className="relative w-full sm:h-[450px] lg:h-[550px]">
                <ProFeeChart
                  data={projection.series}
                  finalLost={projection.savings}
                  finalValueWithoutFees={projection.finalValueWithoutFees}
                  finalValueWithFees={projection.finalValueWithFees}
                  showSummary={false}
                  activeScenario={activeCard}
                />
              </div>

              <div className="border-t border-gray-100 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 sm:p-6 lg:p-8">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
                  <CurrencyInputCard
                    label="Portfolio value"
                    value={state.portfolioValue}
                    min={300000}
                    max={5000000}
                    step={50000}
                    onChange={(nextValue) => setState((prev) => ({ ...prev, portfolioValue: nextValue }))}
                    chips={[
                      { label: "$1M", value: 1000000 },
                      { label: "$2M", value: 2000000 },
                      { label: "$3M", value: 3000000 },
                    ]}
                  />
                  <StepperSlider
                    label="Advisory fee"
                    value={state.annualFeePercent}
                    min={0}
                    max={3}
                    step={0.05}
                    onChange={(nextValue) => setState((prev) => ({ ...prev, annualFeePercent: nextValue }))}
                    format={(val) => `${val.toFixed(2)}%`}
                    infoText="The industry average is around 1.0%. Check your recent statements to see your exact fee."
                    chips={[
                      { label: "0.50%", value: 0.5 },
                      { label: "0.75%", value: 0.75 },
                      { label: "1.00%", value: 1.0 },
                      { label: "1.25%", value: 1.25 },
                      { label: "1.50%", value: 1.5 },
                    ]}
                  />
                  <StepperSlider
                    label="Annual growth"
                    value={state.annualGrowthPercent}
                    min={0}
                    max={14}
                    step={0.1}
                    onChange={(nextValue) => setState((prev) => ({ ...prev, annualGrowthPercent: nextValue }))}
                    format={(val) => `${val.toFixed(1)}%`}
                    chips={[
                      { label: "6%", value: 6.0 },
                      { label: "8%", value: 8.0 },
                      { label: "10%", value: 10.0 },
                      { label: "12%", value: 12.0 },
                    ]}
                  />
                  <StepperSlider
                    label="Time horizon"
                    value={state.years}
                    min={1}
                    max={40}
                    step={1}
                    onChange={(nextValue) => setState((prev) => ({ ...prev, years: nextValue }))}
                    format={(val) => `${val} yrs`}
                    chips={[
                      { label: "10 yrs", value: 10 },
                      { label: "20 yrs", value: 20 },
                      { label: "30 yrs", value: 30 },
                    ]}
                  />
                </div>
                <p className="mt-4 text-center text-xs text-gray-400 dark:text-slate-400">
                  Compares our $100/mo flat fee vs. a traditional AUM advisory fee, compounded monthly.{" "}
                  <Link href="/our-math" className="underline transition-colors hover:text-brand-600">
                    For finance nerds
                  </Link>
                </p>
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

      <ValueCards
        portfolioValue={state.portfolioValue}
        annualFeePercent={state.annualFeePercent}
        portfolioGrowth={state.annualGrowthPercent}
        years={state.years}
      />
    </>
  );
}
