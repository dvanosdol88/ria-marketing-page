"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Minus, Plus } from "lucide-react";
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

type Props = {
  initialState: CalculatorState;
  searchParams: Record<string, string | string[] | undefined>;
};

type SliderChip = {
  label: string;
  value: number;
};

const Slider = ({
  label,
  min,
  max,
  step,
  value,
  onChange,
  type,
  decimals,
  minInputWidthCh = 4,
  chips,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  type?: "currency" | "percent";
  decimals?: number;
  minInputWidthCh?: number;
  chips?: SliderChip[];
  onChange: (nextValue: number) => void;
}) => {
  const displayDecimals = decimals !== undefined ? decimals : type === "percent" ? 2 : 0;

  const clamp = useCallback(
    (candidate: number) => {
      const clamped = Math.min(max, Math.max(min, candidate));
      const stepped = Math.round(clamped / step) * step;
      return Number(stepped.toFixed(Math.max(displayDecimals, 0)));
    },
    [displayDecimals, max, min, step]
  );

  const parseInput = useCallback((raw: string) => {
    const cleaned = raw.replace(/[^0-9.]/g, "");
    const parsed = Number.parseFloat(cleaned);
    return Number.isNaN(parsed) ? null : parsed;
  }, []);

  const formatValue = useCallback(
    (candidate: number) => {
      if (type === "currency") {
        return numberFormatter.format(Math.round(candidate));
      }
      if (type === "percent") {
        return candidate.toFixed(displayDecimals);
      }
      return candidate.toFixed(Math.max(displayDecimals, 0));
    },
    [displayDecimals, type]
  );

  const [inputValue, setInputValue] = useState(formatValue(value));

  useEffect(() => {
    setInputValue(formatValue(value));
  }, [formatValue, value]);

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = Number.parseFloat(event.target.value);
    if (!Number.isNaN(parsed)) {
      const next = clamp(parsed);
      setInputValue(formatValue(next));
      onChange(next);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;
    setInputValue(raw);
    const parsed = parseInput(raw);
    if (parsed !== null) {
      onChange(clamp(parsed));
    }
  };

  const handleBlur = () => {
    const parsed = parseInput(inputValue);
    const next = clamp(parsed ?? min);
    setInputValue(formatValue(next));
    onChange(next);
  };

  const stepDown = () => {
    const next = clamp(value - step);
    setInputValue(formatValue(next));
    onChange(next);
  };

  const stepUp = () => {
    const next = clamp(value + step);
    setInputValue(formatValue(next));
    onChange(next);
  };

  const formatPrefix = type === "currency" ? "$" : "";
  const formatSuffix = type === "percent" ? "%" : "";
  const percent = ((value - min) / (max - min)) * 100;
  const minLabel = type === "currency" ? `$${formatCompactNumber(min)}` : `${formatPrefix}${min}${formatSuffix}`;
  const maxLabel = type === "currency" ? `$${formatCompactNumber(max)}` : `${formatPrefix}${max}${formatSuffix}`;

  return (
    <div className="w-full rounded-xl border border-gray-100 bg-white p-3 shadow-sm sm:p-4">
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <div className="relative">
          {formatPrefix && (
            <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400">{formatPrefix}</span>
          )}
          <input
            type="text"
            inputMode={type === "currency" ? "numeric" : "decimal"}
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            style={{ width: `${Math.max(inputValue.length + 2, minInputWidthCh)}ch` }}
            className={`min-h-11 rounded-lg border border-gray-200 bg-gray-50 py-2 text-right text-sm font-bold text-gray-900 outline-none transition-all focus:border-[#007A2F] focus:ring-1 focus:ring-[#007A2F] ${formatPrefix ? "pl-6 pr-2" : "px-2"} ${formatSuffix ? "pr-6" : ""}`}
          />
          {formatSuffix && (
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">{formatSuffix}</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={stepDown}
          disabled={value <= min}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-30"
          aria-label={`Decrease ${label}`}
        >
          <Minus className="h-4 w-4" />
        </button>
        <div className="relative flex h-10 flex-1 items-center">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={handleSliderChange}
            className="custom-slider"
            style={{ "--value-percent": `${percent}%` } as React.CSSProperties}
            aria-label={`${label} slider`}
          />
        </div>
        <button
          type="button"
          onClick={stepUp}
          disabled={value >= max}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-30"
          aria-label={`Increase ${label}`}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-2 flex justify-between px-1 text-xs text-gray-400">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>

      {chips && chips.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {chips.map((chip) => {
            const selected = Math.abs(value - chip.value) < step / 2;
            return (
              <button
                key={chip.value}
                type="button"
                onClick={() => {
                  const next = clamp(chip.value);
                  setInputValue(formatValue(next));
                  onChange(next);
                }}
                className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                  selected ? "bg-[#007A2F] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

function ValueCard({
  label,
  value,
  accentClass,
}: {
  label: string;
  value: number;
  accentClass: string;
}) {
  return (
    <div className={`rounded-xl border p-4 sm:p-5 ${accentClass}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-600">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-neutral-900 sm:text-3xl">{formatCurrency(value)}</p>
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
                  accentClass="border-[#007A2F]/25 bg-[#007A2F]/5"
                />
                <ValueCard
                  label="Traditional AUM"
                  value={projection.finalValueWithFees}
                  accentClass="border-gray-200 bg-gray-50/80"
                />
              </div>

              <div className="relative w-full sm:h-[450px] lg:h-[550px]">
                <ProFeeChart
                  data={projection.series}
                  finalLost={projection.savings}
                  finalValueWithoutFees={projection.finalValueWithoutFees}
                  finalValueWithFees={projection.finalValueWithFees}
                />
              </div>

              <div className="border-t border-gray-100 bg-white p-4 sm:p-6 lg:p-8">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
                  <Slider
                    label="Advisory fee"
                    min={0}
                    max={3}
                    step={0.05}
                    value={state.annualFeePercent}
                    onChange={(nextValue) => setState((prev) => ({ ...prev, annualFeePercent: nextValue }))}
                    type="percent"
                    decimals={2}
                    chips={[
                      { label: "0.50%", value: 0.5 },
                      { label: "1.00%", value: 1.0 },
                      { label: "1.50%", value: 1.5 },
                    ]}
                  />
                  <Slider
                    label="Portfolio value"
                    min={300000}
                    max={5000000}
                    step={50000}
                    value={state.portfolioValue}
                    onChange={(nextValue) => setState((prev) => ({ ...prev, portfolioValue: nextValue }))}
                    type="currency"
                    minInputWidthCh={10}
                    chips={[
                      { label: "$500K", value: 500000 },
                      { label: "$1M", value: 1000000 },
                      { label: "$2M", value: 2000000 },
                    ]}
                  />
                  <Slider
                    label="Annual growth"
                    min={0}
                    max={15}
                    step={0.1}
                    value={state.annualGrowthPercent}
                    onChange={(nextValue) => setState((prev) => ({ ...prev, annualGrowthPercent: nextValue }))}
                    type="percent"
                    decimals={1}
                    minInputWidthCh={10}
                    chips={[
                      { label: "6.0%", value: 6.0 },
                      { label: "8.0%", value: 8.0 },
                      { label: "10.0%", value: 10.0 },
                    ]}
                  />
                  <Slider
                    label="Time horizon (Years)"
                    min={1}
                    max={40}
                    step={1}
                    value={state.years}
                    onChange={(nextValue) => setState((prev) => ({ ...prev, years: nextValue }))}
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
