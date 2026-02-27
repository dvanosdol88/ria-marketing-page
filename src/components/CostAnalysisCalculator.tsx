"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Info, Minus, Plus } from "lucide-react";
import Link from "next/link";
import { buildFeeProjection } from "@/lib/feeProjection";
import { CalculatorState, DEFAULT_STATE, buildQueryFromState, paramsToRecord } from "@/lib/calculatorState";
import { formatCurrency } from "@/lib/format";
import { ValueCards } from "./value-cards/ValueCards";
import QuoteTickerWithPortraits from "./QuoteTickerWithPortraits";
import { Quiz } from "./Quiz";
import { ProFeeChart } from "@/components/charts/ProFeeChart";
import { ScrollReveal } from "@/components/ScrollReveal";

const numberFormatter = new Intl.NumberFormat("en-US");

function formatCompactNumber(value: number): string {
  if (value >= 1_000_000) {
    const m = value / 1_000_000;
    return `${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M`;
  }
  if (value >= 1_000) {
    const k = value / 1_000;
    return `${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}K`;
  }
  return value.toString();
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
    <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="whitespace-nowrap text-sm font-medium text-gray-800">{label}</span>
          {infoText && (
            <button
              type="button"
              onClick={() => setShowInfo((prev) => !prev)}
              className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200"
              aria-label={`More information about ${label}`}
            >
              <Info className="h-2.5 w-2.5" />
            </button>
          )}
        </div>
      </div>

      {chips && chips.length > 0 && (
        <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
          {chips.map((chip) => (
            <button
              key={chip.value}
              type="button"
              onClick={() => emit(chip.value, true)}
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
                valuesMatch(value, chip.value, step)
                  ? "bg-[#007A2F] text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}

      {showInfo && infoText && (
        <div className="mb-2.5 rounded-lg bg-gray-900 p-2.5 text-xs leading-relaxed text-white">{infoText}</div>
      )}

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => emit(value - step, true)}
          disabled={value <= min}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition-colors hover:bg-gray-200 disabled:pointer-events-none disabled:opacity-30"
          aria-label={`Decrease ${label}`}
        >
          <Minus className="h-3.5 w-3.5" />
        </button>

        <div className="relative flex h-8 flex-1 items-center">
          <div className="absolute inset-x-0 h-1.5 rounded-full bg-gray-200" />
          <div className="absolute left-0 h-1.5 rounded-full bg-[#00A540] transition-all duration-150" style={{ width: `${pct}%` }} />
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
            className="pointer-events-none absolute h-5 w-5 rounded-full border-2 border-[#00A540] bg-white shadow-md transition-all duration-150"
            style={{ left: `calc(${pct}% - 10px)` }}
          />
        </div>

        <button
          type="button"
          onClick={() => emit(value + step, true)}
          disabled={value >= max}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition-colors hover:bg-gray-200 disabled:pointer-events-none disabled:opacity-30"
          aria-label={`Increase ${label}`}
        >
          <Plus className="h-3.5 w-3.5" />
        </button>

        <span className="ml-1 min-w-[4.6rem] text-right text-sm font-bold tabular-nums text-gray-900">{displayValue}</span>
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
    <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <span className="whitespace-nowrap text-sm font-medium text-gray-800">{label}</span>
      </div>

      {chips && chips.length > 0 && (
        <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
          {chips.map((chip) => (
            <button
              key={chip.value}
              type="button"
              onClick={() => adjustValue(chip.value)}
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
                valuesMatch(value, chip.value, step)
                  ? "bg-[#007A2F] text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => adjustValue(value - step)}
          disabled={value <= min}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition-colors hover:bg-gray-200 disabled:pointer-events-none disabled:opacity-30"
          aria-label={`Decrease ${label}`}
        >
          <Minus className="h-3.5 w-3.5" />
        </button>

        <div className="relative flex h-8 flex-1 items-center">
          <div className="absolute inset-x-0 h-1.5 rounded-full bg-gray-200" />
          <div className="absolute left-0 h-1.5 rounded-full bg-[#00A540] transition-all duration-150" style={{ width: `${pct}%` }} />
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
            className="pointer-events-none absolute h-5 w-5 rounded-full border-2 border-[#00A540] bg-white shadow-md transition-all duration-150"
            style={{ left: `calc(${pct}% - 10px)` }}
          />
        </div>

        <button
          type="button"
          onClick={() => adjustValue(value + step)}
          disabled={value >= max}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition-colors hover:bg-gray-200 disabled:pointer-events-none disabled:opacity-30"
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
            className="w-28 rounded-lg bg-gray-100 px-2 py-1 text-right text-sm font-bold tabular-nums text-gray-900 outline-none ring-2 ring-[#00A540]"
          />
        ) : (
          <button
            type="button"
            onClick={handleTap}
            className="min-w-[5.8rem] text-right text-sm font-bold tabular-nums text-gray-900 transition-colors hover:text-[#007A2F]"
            aria-label={`Edit ${label}`}
          >
            {formatCurrency(value)}
          </button>
        )}
      </div>

      <div className="mt-2 flex justify-between px-1 text-xs text-gray-400">
        <span>${formatCompactNumber(min)}</span>
        <span>${formatCompactNumber(max)}</span>
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
}: {
  label: string;
  value: number;
  variant: "smarter" | "traditional";
  isActive: boolean;
  isDimmed: boolean;
  onPress: () => void;
}) {
  const baseAccent =
    variant === "smarter" ? "border-[#007A2F]/25 bg-[#007A2F]/5" : "border-gray-200 bg-gray-50/80";
  const activeRing = isActive ? "ring-2 ring-[#007A2F]/35" : "";

  return (
    <button
      type="button"
      onClick={onPress}
      className={`rounded-xl border p-4 text-left transition-all sm:p-5 ${baseAccent} ${activeRing} ${isDimmed ? "opacity-55" : "opacity-100"}`}
      aria-pressed={isActive}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-600">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-neutral-900 sm:text-3xl">{formatCurrency(value)}</p>
    </button>
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

  const linkQuery = useMemo(() => {
    const params = new URLSearchParams(buildQueryFromState(state, paramsFromServer));
    return paramsToRecord(params);
  }, [paramsFromServer, state]);

  const copyShareUrl = useCallback(async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert("Link copied with your numbers!");
    } catch (error) {
      console.error("Unable to copy", error);
    }
  }, [shareUrl]);

  void linkQuery;
  void copyShareUrl;

  const [scrolledPastHero, setScrolledPastHero] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolledPastHero(window.scrollY > 100);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleCardTap = (card: "smarter" | "traditional") => {
    setActiveCard((prev) => (prev === card ? null : card));
  };

  return (
    <>
      <div
        className={`fixed left-0 right-0 top-12 z-40 border-b border-gray-200 bg-white/95 backdrop-blur-sm transition-all duration-300 sm:hidden ${
          scrolledPastHero ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-full opacity-0"
        }`}
      >
        <div className="flex h-12 items-center justify-center gap-2 px-4">
          <span className="tabular-nums text-lg font-bold text-[#007A2F]">+{formatCurrency(projection.savings)}</span>
          <span className="text-sm font-semibold uppercase tracking-wider text-[#007A2F]">You Save</span>
        </div>
      </div>

      <div className="w-full bg-transparent pb-1 pt-4 sm:pt-6">
        <div className="section-shell text-center">
          <h1 className="text-2xl font-semibold sm:text-5xl">
            <span className="text-[#1B2A4A]">What would you do with </span>
            <span className="text-[#007A2F]">{formatCurrency(projection.savings)}</span>
            <span className="text-[#1B2A4A]">?</span>
          </h1>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-1 text-base text-neutral-900 sm:text-xl">
            <span>See how much you can save.</span>
            <Quiz />
          </div>
        </div>
      </div>

      <section className="relative w-full overflow-hidden bg-[#EEF0F5]">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 top-[35%] bg-gradient-to-b from-transparent via-[rgba(233,238,255,0.6)] to-transparent" />

        <div className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-20 pt-0 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:gap-8">
            <ScrollReveal className="card overflow-hidden bg-white shadow-xl ring-1 ring-black/5">
              <div className="grid grid-cols-1 gap-3 border-b border-gray-100 p-4 sm:grid-cols-2 sm:gap-4 sm:p-6 lg:p-8">
                <ValueCard
                  label="Smarter Way Wealth"
                  value={projection.finalValueWithoutFees}
                  variant="smarter"
                  isActive={activeCard === "smarter"}
                  isDimmed={activeCard === "traditional"}
                  onPress={() => handleCardTap("smarter")}
                />
                <ValueCard
                  label="Traditional AUM"
                  value={projection.finalValueWithFees}
                  variant="traditional"
                  isActive={activeCard === "traditional"}
                  isDimmed={activeCard === "smarter"}
                  onPress={() => handleCardTap("traditional")}
                />
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

              <div className="border-t border-gray-100 bg-white p-4 sm:p-6 lg:p-8">
                <h2 className="mb-4 px-1 text-xs font-semibold uppercase tracking-wider text-gray-500">Adjust Your Inputs</h2>
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
                    max={15}
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
                <p className="mt-4 text-center text-xs text-gray-400">
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
        style={{
          backgroundColor: "#E8F5EC",
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5 Q35 15 30 25 Q25 15 30 5Z' fill='%2300A540' fill-opacity='0.04'/%3E%3Cpath d='M10 35 Q15 45 10 55 Q5 45 10 35Z' fill='%23007A2F' fill-opacity='0.03'/%3E%3Cpath d='M50 40 Q55 50 50 60 Q45 50 50 40Z' fill='%2300A540' fill-opacity='0.03'/%3E%3C/svg%3E\")",
        }}
      >
        <QuoteTickerWithPortraits />
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
