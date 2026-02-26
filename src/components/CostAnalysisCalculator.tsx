"use client";




import { useCallback, useEffect, useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Copy } from "lucide-react";
import { buildFeeProjection } from "@/lib/feeProjection";
import { CalculatorState, DEFAULT_STATE, buildQueryFromState, paramsToRecord } from "@/lib/calculatorState";
import { formatCurrency, formatPercent } from "@/lib/format";
import { ValueCards } from "./value-cards/ValueCards";
import QuoteTickerWithPortraits from "./QuoteTickerWithPortraits";
import { Quiz } from "./Quiz";
import Link from "next/link";

import { ProFeeChart } from "@/components/charts/ProFeeChart";
import { ScrollReveal } from "@/components/ScrollReveal";

const numberFormatter = new Intl.NumberFormat("en-US");

/** Compact format for slider min/max labels: 300000 → "300K", 5000000 → "5M" */
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
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  type?: 'currency' | 'percent';
  decimals?: number;
  minInputWidthCh?: number;
  onChange: (value: number) => void;
}) => {
  const formatValue = useCallback((val: number) => {
    if (type === 'percent' || decimals !== undefined) {
      const d = decimals !== undefined ? decimals : (type === 'percent' ? 2 : 0);
      return val.toFixed(d);
    }
    return val.toString();
  }, [type, decimals]);

  const [inputValue, setInputValue] = useState(formatValue(value));

  useEffect(() => {
    setInputValue(formatValue(value));
  }, [value, formatValue]);

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseFloat(event.target.value);
    if (!isNaN(parsed)) {
      setInputValue(formatValue(parsed));
      onChange(parsed);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
    const parsed = parseFloat(event.target.value);
    if (!isNaN(parsed)) onChange(parsed);
  };

  const handleBlur = () => {
    let parsed = parseFloat(inputValue);
    if (isNaN(parsed)) parsed = min;
    if (parsed < min) parsed = min;
    if (parsed > max) parsed = max;
    
    setInputValue(formatValue(parsed));
    onChange(parsed);
  };

  const formatPrefix = type === 'currency' ? '$' : '';
  const formatSuffix = type === 'percent' ? '%' : '';

  const percent = ((value - min) / (max - min)) * 100;

  /* Compact min/max labels for currency (e.g. "$300K" instead of "$300000") */
  const minLabel = type === 'currency' ? `$${formatCompactNumber(min)}` : `${formatPrefix}${min}${formatSuffix}`;
  const maxLabel = type === 'currency' ? `$${formatCompactNumber(max)}` : `${formatPrefix}${max}${formatSuffix}`;

  return (
    <div className="flex flex-col gap-2 sm:gap-3 w-full p-3 sm:p-4 bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-gray-600 shrink-0">{label}</label>
        <div className="relative group">
          {formatPrefix && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">{formatPrefix}</span>
          )}
          <input
            type="text"
            inputMode="decimal"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            style={{ width: `${Math.max(inputValue.length, 1) + 2}ch`, minWidth: `${minInputWidthCh}ch` }}
            className={`min-h-11 sm:min-h-0 py-2 sm:py-1 px-2 text-right font-bold text-gray-900 bg-gray-50 border border-gray-200 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all ${formatPrefix ? 'pl-6' : ''} ${formatSuffix ? 'pr-8' : ''}`}
          />
          {formatSuffix && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">{formatSuffix}</span>
          )}
        </div>
      </div>
      <div className="relative w-full h-10 sm:h-6 flex items-center">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleSliderChange}
          className="custom-slider"
          style={{ '--value-percent': `${percent}%` } as React.CSSProperties}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-400 -mt-2 px-1">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
};

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

  /* ── Mobile: detect scroll past hero to show compact sticky bar ── */
  const [scrolledPastHero, setScrolledPastHero] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolledPastHero(window.scrollY > 100);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* ── Compact mobile sticky savings bar (appears on scroll) ── */}
      <div
        className={`fixed top-12 left-0 right-0 z-40 sm:hidden bg-white/95 backdrop-blur-sm border-b border-gray-200 transition-all duration-300 ${
          scrolledPastHero
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex items-center justify-center h-12 gap-2 px-4">
          <span className="text-lg font-bold text-[#007A2F] tabular-nums">
            +{formatCurrency(projection.savings)}
          </span>
          <span className="text-sm font-semibold text-[#007A2F] uppercase tracking-wider">
            You Save
          </span>
        </div>
      </div>

      <div className="w-full bg-transparent pt-4 sm:pt-6 pb-1">
        <div className="section-shell text-center">
          <h1 className="font-semibold text-2xl sm:text-5xl">
            <span className="text-[#1B2A4A]">What would you do with </span>
            <span className="text-[#007A2F]">{formatCurrency(projection.savings)}</span>
            <span className="text-[#1B2A4A]">?</span>
          </h1>
          <div className="mt-2 flex items-center justify-center gap-1 flex-wrap text-base sm:text-xl text-neutral-900">
            <span>See how much you can save.</span>
            <Quiz />
          </div>
        </div>
      </div>

      <section className="w-full bg-[#EEF0F5] relative overflow-hidden">
        <div className="absolute inset-x-0 top-[35%] bottom-0 bg-gradient-to-b from-transparent via-[rgba(233,238,255,0.6)] to-transparent pointer-events-none" />

        <div className="relative z-10 mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 pt-0 pb-20">
          <div className="flex flex-col gap-4 sm:gap-8">

            {/* Unified Calculator Card */}
            <ScrollReveal className="card bg-white overflow-hidden shadow-xl ring-1 ring-black/5">

              {/* Chart Section - Full Width, shorter on mobile */}
              <div className="sm:h-[450px] lg:h-[550px] w-full relative">
                <ProFeeChart
                  data={projection.series}
                  finalLost={projection.savings}
                  finalValueWithoutFees={projection.finalValueWithoutFees}
                  finalValueWithFees={projection.finalValueWithFees}
                />
              </div>

              {/* Inputs Section - Below Chart */}
              <div className="p-4 sm:p-6 lg:p-8 bg-white border-t border-gray-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  <Slider
                    label="Advisory fee"
                    min={0}
                    max={3}
                    step={0.05}
                    value={state.annualFeePercent}
                    onChange={(value) => setState((prev) => ({ ...prev, annualFeePercent: value }))}
                    type="percent"
                    decimals={2}
                  />
                  <Slider
                    label="Portfolio value"
                    min={300000}
                    max={5000000}
                    step={50000}
                    value={state.portfolioValue}
                    onChange={(value) => setState((prev) => ({ ...prev, portfolioValue: value }))}
                    type="currency"
                    minInputWidthCh={10}
                  />
                  <Slider
                    label="Annual growth"
                    min={0}
                    max={15}
                    step={0.1}
                    value={state.annualGrowthPercent}
                    onChange={(value) => setState((prev) => ({ ...prev, annualGrowthPercent: value }))}
                    type="percent"
                    decimals={1}
                    minInputWidthCh={10}
                  />
                  <Slider
                    label="Time horizon (Years)"
                    min={1}
                    max={40}
                    step={1}
                    value={state.years}
                    onChange={(value) => setState((prev) => ({ ...prev, years: value }))}
                  />
                </div>
                <p className="mt-4 text-center text-xs text-gray-400">
                  Compares our $100/mo flat fee vs. a traditional AUM advisory fee, compounded monthly.{" "}
                  <Link href="/our-math" className="underline hover:text-brand-600 transition-colors">
                    For finance nerds
                  </Link>
                </p>
              </div>
            </ScrollReveal>

          </div>
        </div>
      </section>

      <section className="w-full overflow-hidden bg-[#EEF0F5] py-12 sm:py-16">
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
