"use client";




import { useCallback, useMemo, useState, useEffect } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Copy } from "lucide-react";
import Link from "next/link";
import { buildFeeProjection } from "@/lib/feeProjection";
import { CalculatorState, DEFAULT_STATE, buildQueryFromState, paramsToRecord } from "@/lib/calculatorState";
import { formatCurrency, formatPercent } from "@/lib/format";
import { ValueCards } from "./value-cards/ValueCards";
import QuoteTickerWithPortraits from "./QuoteTickerWithPortraits";
import { Quiz } from "./Quiz";

import { ProFeeChart } from "@/components/charts/ProFeeChart";
import { ScrollReveal } from "@/components/ScrollReveal";

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
            style={{ width: `${Math.max(inputValue.length, 1) + 2}ch`, minWidth: `${minInputWidthCh}ch` }}
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
  const [isStuck, setIsStuck] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsStuck(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      <div
        className={`sticky top-0 z-50 w-full transition-all duration-300 bg-white ${
          isStuck ? "py-4 shadow-md" : "pt-12 pb-0 bg-transparent"
        }`}
      >
        <div className="section-shell text-center">
          <h1
            className={`font-semibold text-green-600 transition-all duration-300 ${
              isStuck ? "text-2xl sm:text-3xl" : "text-4xl sm:text-5xl"
            }`}
          >
            What would you do with {formatCurrency(projection.savings)}?
          </h1>
          <div
            className={`text-neutral-900 transition-all duration-300 ${
              isStuck ? "mt-1 text-sm" : "mt-2 text-lg sm:text-xl"
            }`}
          >
            <span>See how much you can save.</span> <Quiz />
          </div>
        </div>
      </div>

      <section className="w-full bg-neutral-50 relative overflow-hidden">
        <div className="absolute inset-x-0 top-[35%] bottom-0 bg-gradient-to-b from-transparent via-[rgba(233,238,255,0.6)] to-transparent pointer-events-none" />

        <div className="relative z-10 mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 pt-0 pb-20">
          <div className="flex flex-col gap-8">
            
            {/* Unified Calculator Card */}
            <ScrollReveal className="card bg-white overflow-hidden shadow-xl ring-1 ring-black/5">
              
              {/* Chart Section - Full Width */}
              <div className="h-[450px] lg:h-[550px] w-full relative">
                <ProFeeChart 
                  data={projection.series} 
                  finalLost={projection.savings}
                  finalValueWithoutFees={projection.finalValueWithoutFees}
                  finalValueWithFees={projection.finalValueWithFees}
                />
              </div>

              {/* Inputs Section - Below Chart */}
              <div className="p-6 lg:p-8 bg-white border-t border-gray-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
              </div>
            </ScrollReveal>

          </div>
        </div>
      </section>

      <section className="w-full overflow-hidden bg-neutral-50">
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
