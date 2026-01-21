"use client";




import { useCallback, useMemo, useState, useEffect } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Copy } from "lucide-react";
import Link from "next/link";
import { buildFeeProjection } from "@/lib/feeProjection";
import { CalculatorState, DEFAULT_STATE, buildQueryFromState, paramsToRecord } from "@/lib/calculatorState";
import { formatCurrency, formatPercent } from "@/lib/format";
import { ValueCards } from "./value-cards/ValueCards";
import QuoteTicker from "./QuoteTicker";
import { Quiz } from "./Quiz";

import { ProFeeChart } from "@/components/charts/ProFeeChart";
import { ScrollReveal } from "@/components/ScrollReveal";
import { SavingsMetersGrid } from "@/components/save/SavingsMetersGrid";

const numberFormatter = new Intl.NumberFormat("en-US");

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
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  type?: 'currency' | 'percent';
  decimals?: number;
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

  return (
    <div className="flex flex-col gap-3 w-full p-4 bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-gray-600">{label}</label>
        <div className="relative group">
          {formatPrefix && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">{formatPrefix}</span>
          )}
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            style={{ width: `${Math.max(inputValue.length, 1) + 2}ch`, minWidth: '4ch' }}
            className={`py-1 px-2 text-right font-bold text-gray-900 bg-gray-50 border border-gray-200 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all ${formatPrefix ? 'pl-6' : ''} ${formatSuffix ? 'pr-8' : ''}`}
          />
          {formatSuffix && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">{formatSuffix}</span>
          )}
        </div>
      </div>
      <div className="relative w-full h-6 flex items-center">
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
        <span>{formatPrefix}{min}{formatSuffix}</span>
        <span>{formatPrefix}{max}{formatSuffix}</span>
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

  return (
    <>
      <section className="section-shell pt-12 pb-0 text-center">
        <h1 className="text-4xl font-semibold text-green-600 sm:text-5xl">What would you do with {formatCurrency(projection.savings)}?</h1>
        <div className="mt-4 text-lg text-neutral-900 sm:text-xl">
          <span>See how much you can save.</span>{" "}
          <Quiz />
        </div>
      </section>

      <section className="w-full bg-neutral-50 relative overflow-hidden">
        <div className="absolute inset-x-0 top-[35%] bottom-0 bg-gradient-to-b from-transparent via-[rgba(233,238,255,0.6)] to-transparent pointer-events-none" />

        <div className="relative z-10 mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 pt-2 pb-20">
          <div className="flex flex-col gap-8">
            {/* 1) Summary metrics */}
            <ScrollReveal className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="card p-4">
                <p className="text-xs font-semibold uppercase tracking-tightish text-neutral-500">Projected value (no fees)</p>
                <p className="mt-2 text-2xl font-semibold text-neutral-900">{formatCurrency(projection.finalValueWithoutFees)}</p>
                <p className="text-sm text-neutral-600">Over {state.years} years at {formatPercent(state.annualGrowthPercent)}.</p>
              </div>
              <div className="card p-4">
                <p className="text-xs font-semibold uppercase tracking-tightish text-neutral-500">Projected value (with fees)</p>
                <p className="mt-2 text-2xl font-semibold text-neutral-900">{formatCurrency(projection.finalValueWithFees)}</p>
                <p className="text-sm text-neutral-600">Assuming {formatPercent(state.annualFeePercent)} advisory fees.</p>
              </div>
              <div className="card p-4">
                <p className="text-xs font-semibold uppercase tracking-tightish text-neutral-500">Lost to fees</p>
                <p className="mt-2 text-2xl font-semibold text-danger-600">{formatCurrency(projection.savings)}</p>
                <p className="text-sm text-neutral-600">That is money that could keep compounding for you.</p>
              </div>
            </ScrollReveal>

            {/* 2) Unified Calculator Card - Full Width with Chart Left, Inputs Right */}
            <ScrollReveal delay={0.2} className="card bg-white overflow-hidden shadow-xl ring-1 ring-black/5">
              <div className="flex flex-col lg:flex-row">
                {/* Chart Section - Left Side */}
                <div className="h-[400px] lg:h-[500px] w-full lg:w-2/3 bg-neutral-900 relative">
                  <ProFeeChart data={projection.series} finalLost={projection.savings} />
                </div>

                {/* Inputs Section - Right Side */}
                <div className="w-full lg:w-1/3 p-6 lg:p-8 bg-white border-t lg:border-t-0 lg:border-l border-gray-100 flex flex-col justify-center">
                  <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-6">
                    Adjust your scenario
                  </h3>

                  <div className="flex flex-col gap-4">
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
                      min={50000}
                      max={5000000}
                      step={50000}
                      value={state.portfolioValue}
                      onChange={(value) => setState((prev) => ({ ...prev, portfolioValue: value }))}
                      type="currency"
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
                </div>
              </div>
            </ScrollReveal>

            {/* 3) Savings Meters Section */}
            <ScrollReveal delay={0.3}>
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-tightish text-neutral-500">What could you do with the savings?</p>
                <h3 className="text-xl font-semibold text-neutral-900">
                  Your {formatCurrency(projection.savings)} could buy...
                </h3>
              </div>
              <SavingsMetersGrid savings={projection.savings} />
            </ScrollReveal>

            {/* 4) Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={copyShareUrl}
                className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
              >
                <Copy size={16} /> Share this scenario
              </button>
              <Link href={{ pathname: "/save", query: linkQuery }} className="text-sm font-semibold text-neutral-900 no-underline hover:text-neutral-700">
                See deeper proof →
              </Link>
              <Link href={{ pathname: "/how-it-works", query: linkQuery }} className="text-sm font-semibold text-neutral-900 no-underline hover:text-neutral-700">
                How it works →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full overflow-hidden bg-neutral-50">
        <QuoteTicker />
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
