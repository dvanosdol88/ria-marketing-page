"use client";




import { useCallback, useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Copy } from "lucide-react";
import Link from "next/link";
import { buildFeeProjection } from "@/lib/feeProjection";
import { CalculatorState, DEFAULT_STATE, buildQueryFromState, paramsToRecord } from "@/lib/calculatorState";
import { formatCurrency, formatPercent } from "@/lib/format";
import { ValueCards } from "./value-cards/ValueCards";
import QuoteTicker from "./QuoteTicker";

const numberFormatter = new Intl.NumberFormat("en-US");

type Props = {
  initialState: CalculatorState;
  searchParams: Record<string, string | string[] | undefined>;
};

function Slider({
  label,
  min,
  max,
  step,
  value,
  onChange,
  suffix,
  decimals,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  suffix?: string;
  decimals?: number;
  onChange: (value: number) => void;
}) {
  const formatValue = (val: number) => {
    if (decimals !== undefined) {
      return val.toFixed(decimals);
    }
    return numberFormatter.format(val);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-sm font-medium text-neutral-900">
        <span>{label}</span>
        <span className="tabular-nums text-neutral-900">
          {formatValue(value)}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-brand-600"
      />
      <div className="flex justify-between text-xs text-neutral-900">
        <span>
          {formatValue(min)}
          {suffix}
        </span>
        <span>
          {formatValue(max)}
          {suffix}
        </span>
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
      <section className="section-shell pt-12 text-center">
        <h1 className="text-4xl font-semibold text-green-600 sm:text-5xl">What would you do with {formatCurrency(projection.savings)}?</h1>
        <p className="mt-4 text-lg text-neutral-900 sm:text-xl">
          See how much you can save.
        </p>
      </section>

      <section className="w-full bg-neutral-50 relative overflow-hidden">
        <div className="absolute inset-x-0 top-[35%] bottom-0 bg-gradient-to-b from-transparent via-[rgba(233,238,255,0.6)] to-transparent pointer-events-none" />

        <div className="relative z-10 mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex flex-col gap-8">
            {/* 1) Summary metrics */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
            </div>

            {/* 2) Chart — HERO */}
            <div className="card p-6 lg:p-8">
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-tightish text-neutral-500">Growth vs. fee drag</p>
                    <h3 className="text-lg font-semibold text-neutral-900">Your dollars over time</h3>
                  </div>
                  <div className="text-right text-xs text-neutral-500">
                    <p>Without fees: {formatCurrency(projection.finalValueWithoutFees)}</p>
                    <p>With {formatPercent(state.annualFeePercent)} fees: {formatCurrency(projection.finalValueWithFees)}</p>
                  </div>
                </div>

                <div className="h-[320px] w-full lg:h-[420px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={projection.series} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="greyGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#9ca3af" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#9ca3af" stopOpacity={0.05} />
                        </linearGradient>
                        <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#22c55e" stopOpacity={0.25} />
                          <stop offset="100%" stopColor="#22c55e" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="year" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "#64748b", fontSize: 12 }}
                        tickFormatter={(value) => `${value / 1000}k`}
                      />
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        labelFormatter={(label) => `${label} years`}
                        contentStyle={{ borderRadius: 12, borderColor: "#e2e8f0" }}
                      />
                      <Area type="monotone" dataKey="withoutFees" stroke="#6366f1" fill="url(#greyGradient)" />
                      <Area type="monotone" dataKey="withFees" stroke="#22c55e" fill="url(#greenGradient)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* 3) Controls — subordinate */}
            <div className="card p-6">
              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-tightish text-neutral-900">Explore inputs</p>
                  <p className="mt-2 text-sm text-neutral-900">
                    Adjust the sliders to interrogate the outcome curve. Links preserve your exact scenario (and UTMs).
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Slider
                    label="Portfolio value"
                    min={50000}
                    max={5000000}
                    step={50000}
                    value={state.portfolioValue}
                    onChange={(value) => setState((prev) => ({ ...prev, portfolioValue: value }))}
                  />
                  <Slider
                    label="Years"
                    min={1}
                    max={40}
                    step={1}
                    value={state.years}
                    suffix=" yrs"
                    onChange={(value) => setState((prev) => ({ ...prev, years: value }))}
                  />
                  <Slider
                    label="Expected annual growth"
                    min={0}
                    max={15}
                    step={0.1}
                    value={state.annualGrowthPercent}
                    suffix="%"
                    decimals={1}
                    onChange={(value) => setState((prev) => ({ ...prev, annualGrowthPercent: value }))}
                  />
                  <Slider
                    label="Advisory fee"
                    min={0}
                    max={3}
                    step={0.05}
                    value={state.annualFeePercent}
                    suffix="%"
                    decimals={2}
                    onChange={(value) => setState((prev) => ({ ...prev, annualFeePercent: value }))}
                  />
                </div>
              </div>
            </div>

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
