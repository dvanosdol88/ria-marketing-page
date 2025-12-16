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
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  suffix?: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-sm font-medium text-neutral-700">
        <span>{label}</span>
        <span className="tabular-nums text-neutral-900">
          {numberFormatter.format(value)}
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
      <div className="flex justify-between text-xs text-neutral-500">
        <span>
          {numberFormatter.format(min)}
          {suffix}
        </span>
        <span>
          {numberFormatter.format(max)}
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
      <section className="w-full bg-gray-50 border-b border-gray-200">
        <div className="section-shell py-20 flex flex-col gap-16">
          <div className="card overflow-hidden relative">
            <div className="grid gap-8 p-6 lg:grid-cols-3 lg:p-8 relative overflow-hidden before:absolute before:inset-0 before:backdrop-blur-[2px] before:bg-gradient-to-b before:from-transparent before:via-[rgba(233,238,255,0.5)] before:to-[rgba(202,208,230,0.5)] before:pointer-events-none before:-z-10">
              <div className="flex flex-col gap-6 lg:col-span-1 relative z-10">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-tightish text-brand-600">Instant math</p>
                  <h2 className="mt-2 text-2xl font-semibold text-neutral-900">What would you do with the savings?</h2>
                  <p className="mt-2 text-sm text-neutral-600">
                    Adjust the sliders to see how advisory fees eat into your growth. Share the exact scenario with prospects or reuse
                    it on /save and /how-it-works.
                  </p>
                </div>

                <div className="flex flex-col gap-4">
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
                    onChange={(value) => setState((prev) => ({ ...prev, annualGrowthPercent: value }))}
                  />
                  <Slider
                    label="Advisory fee"
                    min={0}
                    max={3}
                    step={0.05}
                    value={state.annualFeePercent}
                    suffix="%"
                    onChange={(value) => setState((prev) => ({ ...prev, annualFeePercent: value }))}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={copyShareUrl}
                    className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
                  >
                    <Copy size={16} /> Share this scenario
                  </button>
                  <Link href={{ pathname: "/save", query: linkQuery }} className="text-sm font-semibold text-brand-700">
                    See deeper proof →
                  </Link>
                  <Link href={{ pathname: "/how-it-works", query: linkQuery }} className="text-sm font-semibold text-brand-700">
                    How it works →
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-2 relative z-10">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="card p-4">
                    <p className="text-xs font-semibold uppercase tracking-tightish text-neutral-500">Projected value (no fees)</p>
                    <p className="mt-2 text-2xl font-semibold text-neutral-900">{formatCurrency(projection.finalValueWithoutFees)}</p>
                    <p className="text-sm text-neutral-600">Over {state.years} years at {formatPercent(state.annualGrowthPercent)}.</p>
                  </div>
                  <div className="card p-4">
                    <p className="text-xs font-semibold uppercase tracking-tightish text-neutral-500">Lost to fees</p>
                    <p className="mt-2 text-2xl font-semibold text-danger-600">{formatCurrency(projection.savings)}</p>
                    <p className="text-sm text-neutral-600">That is money that could keep compounding for you.</p>
                  </div>
                </div>

                <div className="card mt-6 p-4 sm:p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-tightish text-neutral-500">Growth vs. fee drag</p>
                      <h3 className="text-lg font-semibold text-neutral-900">Your dollars over time</h3>
                    </div>
                    <div className="text-right text-xs text-neutral-500">
                      <p>Without fees: {formatCurrency(projection.finalValueWithoutFees)}</p>
                      <p>With {formatPercent(state.annualFeePercent)} fees: {formatCurrency(projection.finalValueWithFees)}</p>
                    </div>
                  </div>

                  <div className="mt-4 h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={projection.series} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
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
                        <Area type="monotone" dataKey="withoutFees" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
                        <Area type="monotone" dataKey="withFees" stroke="#fb7185" fill="#fb7185" fillOpacity={0.18} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full overflow-hidden py-8">
          <QuoteTicker />
        </div>
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
