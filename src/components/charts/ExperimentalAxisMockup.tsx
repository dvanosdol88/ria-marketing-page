"use client";

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "@/lib/format";

type ChartDataPoint = {
  year: number;
  withoutFees: number;
  withFees: number;
};

type ProFeeChartProps = {
  data: ChartDataPoint[];
  finalLost: number;
  finalValueWithoutFees: number;
  finalValueWithFees: number;
  portfolioValue?: number;
  years?: number;
  annualGrowthPercent?: number;
  annualFeePercent?: number;
  mutualFundExpensePercent?: number;
};

function formatYAxisCurrency(value: number): string {
  const absoluteValue = Math.abs(value);
  if (absoluteValue >= 1_000_000) {
    const millions = value / 1_000_000;
    return `$${millions.toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (absoluteValue >= 1_000) {
    const thousands = value / 1_000;
    return `$${thousands.toFixed(1).replace(/\.0$/, "")}K`;
  }
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

export function ExperimentalAxisMockup({
  data,
  finalLost,
  finalValueWithoutFees,
  finalValueWithFees,
  annualFeePercent,
  mutualFundExpensePercent,
}: ProFeeChartProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains("dark"));
  }, []);

  const totalFee = (annualFeePercent ?? 0) + (mutualFundExpensePercent ?? 0);
  const percentLost = finalValueWithoutFees > 0 ? (finalLost / finalValueWithoutFees) * 100 : 0;

  const palette = {
    blackLine: isDarkMode ? "#F8FAFC" : "#000000",
    text: isDarkMode ? "#94A3B8" : "#64748B",
  };

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden rounded-t-2xl bg-white dark:bg-slate-900 p-8">
      <h2 className="mb-4 text-center text-xl font-bold text-slate-800 dark:text-white uppercase tracking-widest opacity-50">Axis Label Experiment</h2>
      
      <div className="relative flex-1 mt-12">
        {/* "Ending Portfolio values" callout */}
        <div className="absolute left-[5%] top-[10%] z-20 flex items-center gap-4 pointer-events-none">
          <div className="text-lg font-bold text-slate-800 dark:text-slate-200 w-32 leading-tight">
            Ending Portfolio values
          </div>
          <div className="flex flex-col gap-8 mt-4">
            <svg width="40" height="20" viewBox="0 0 40 20" fill="none" className="rotate-[15deg]">
              <path d="M0 10H38M38 10L30 2M38 10L30 18" stroke="currentColor" strokeWidth="2" className="text-slate-400" />
            </svg>
            <svg width="40" height="20" viewBox="0 0 40 20" fill="none" className="rotate-[-15deg]">
              <path d="M0 10H38M38 10L30 2M38 10L30 18" stroke="currentColor" strokeWidth="2" className="text-slate-400" />
            </svg>
          </div>
        </div>

        {/* Labels positioned along the horizontal lines - MATCHING IMAGE */}
        <div className="absolute left-[40%] right-0 top-0 bottom-0 z-30 pointer-events-none flex flex-col justify-between py-[20px]">
          {/* Top Label (Flat Fee) */}
          <div className="flex items-center gap-2 whitespace-nowrap bg-white/80 dark:bg-slate-900/80 px-2" style={{ width: 'fit-content' }}>
            <span className="text-sm font-bold text-slate-600 dark:text-slate-400 italic">with $100/mo. flat fee</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">{formatCurrency(finalValueWithoutFees)}</span>
          </div>

          {/* Red Summary (Middle) */}
          <div className="flex flex-col items-center text-center -translate-x-1/4">
            <div className="text-[13px] font-black text-[#ef4444] leading-tight uppercase tracking-tight">
              Lost wealth to {totalFee.toFixed(2)}%<br/>
              annual asset-based fee*
            </div>
            <div className="flex items-baseline gap-4 mt-1">
              <span className="text-4xl font-black text-[#ef4444] tabular-nums tracking-tighter">
                {formatCurrency(finalLost)}
              </span>
              <span className="text-lg font-black text-[#ef4444]">
                {percentLost.toFixed(1)}% of wealth
              </span>
            </div>
          </div>

          {/* Bottom Label (Asset Fee) */}
          <div className="flex items-center gap-2 whitespace-nowrap bg-white/80 dark:bg-slate-900/80 px-2 mb-2" style={{ width: 'fit-content' }}>
            <span className="text-sm font-bold text-slate-600 dark:text-slate-400 italic">with {totalFee.toFixed(2)}% asset-based fee</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">{formatCurrency(finalValueWithFees)}</span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={data} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
            <defs>
              <linearGradient id="axisRedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#fee2e2" stopOpacity={0.2} />
              </linearGradient>
              <linearGradient id="axisBlackGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#18181b" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#18181b" stopOpacity={0.05} />
              </linearGradient>
            </defs>

            <XAxis 
              dataKey="year" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: palette.text, fontSize: 12 }}
              dy={10}
            />
            <YAxis 
              tickFormatter={formatYAxisCurrency}
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: palette.text, fontSize: 12 }}
              dx={-10}
            />

            <ReferenceLine 
              y={finalValueWithoutFees} 
              stroke={palette.blackLine} 
              strokeWidth={2}
              isFront
            />

            <ReferenceLine 
              y={finalValueWithFees} 
              stroke={palette.blackLine} 
              strokeWidth={2}
              isFront
            />

            <Area
              type="monotone"
              dataKey="withoutFees"
              stroke={palette.blackLine}
              strokeWidth={2}
              fill="url(#axisRedGradient)"
              fillOpacity={1}
              isAnimationActive={false}
            />
            
            <Area
              type="monotone"
              dataKey="withFees"
              stroke="none"
              fill={isDarkMode ? "#0F172A" : "#FFFFFF"}
              fillOpacity={1}
              isAnimationActive={false}
            />

            <Area
              type="monotone"
              dataKey="withFees"
              stroke={palette.blackLine}
              strokeWidth={2}
              fill="url(#axisBlackGradient)"
              fillOpacity={1}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
