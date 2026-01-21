"use client";

import React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";
import { formatCurrency } from "@/lib/format";
import { motion } from "framer-motion";

/**
 * PRO DASHBOARD CHART COMPONENT
 * ------------------------------------------------------------------
 * This component implements the "Pro Dashboard" visualization (Idea 1 + Idea 3).
 *
 * FEATURES:
 * 1. Dark Theme / Glassmorphism:
 *    - Uses a dark background (neutral-900) to create high contrast.
 *    - Uses backdrop filters for a modern feel.
 *
 * 2. Dynamic Annotations (The "HUD" Tooltip):
 *    - A custom tooltip acting as a Heads-Up Display.
 *    - Explicitly highlights the "Loss" (Gap) between the two lines.
 *
 * 3. Enhanced Visuals:
 *    - Gradients for area fills.
 *    - Lighter axis labels for readability on dark backgrounds.
 *
 * UNDO INSTRUCTIONS:
 * To revert to the original light-theme chart:
 * 1. Open `src/components/CostAnalysisCalculator.tsx`.
 * 2. Remove the import of `ProFeeChart`.
 * 3. Uncomment or restore the original Recharts JSX block.
 *    (See `src/components/CostAnalysisCalculator.original.tsx` for reference).
 */

type ChartDataPoint = {
  year: number;
  withoutFees: number;
  withFees: number;
};

type ProFeeChartProps = {
  data: ChartDataPoint[];
  finalLost: number; // Total amount lost (savings)
  finalValueWithoutFees: number;
  finalValueWithFees: number;
};

const CustomHUDTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const withoutFees = payload[0].value; // First Area
    const withFees = payload[1].value;    // Second Area
    const lostAmount = withoutFees - withFees;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.1 }}
        className="backdrop-blur-xl bg-black/80 border border-white/10 p-4 rounded-xl shadow-2xl min-w-[200px]"
      >
        <p className="text-stone-400 text-xs font-medium mb-2 uppercase tracking-wider">
          Year {label}
        </p>
        
        <div className="space-y-3">
          {/* Potential Value */}
          <div>
            <div className="flex justify-between items-center text-xs text-emerald-400 mb-1">
              <span>Potential Growth</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            </div>
            <p className="text-xl font-bold text-white tabular-nums">
              {formatCurrency(withoutFees)}
            </p>
          </div>

          {/* Actual Value */}
          <div>
            <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
              <span>Actual Value</span>
              <span className="h-1.5 w-1.5 rounded-full bg-slate-500"></span>
            </div>
            <p className="text-xl font-bold text-white tabular-nums">
              {formatCurrency(withFees)}
            </p>
          </div>

          {/* The Gap / Loss */}
          <div className="pt-2 border-t border-white/10 mt-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-red-400 font-semibold uppercase">Fee Impact</span>
              <span className="text-red-400 font-bold tabular-nums">
                -{formatCurrency(lostAmount)}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }
  return null;
};

export function ProFeeChart({ data, finalLost, finalValueWithoutFees, finalValueWithFees }: ProFeeChartProps) {
  return (
    <div className="relative w-full h-full bg-neutral-900 rounded-t-2xl overflow-hidden">
      {/* Background Glow Effect */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-900/10 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-slate-800/20 rounded-full blur-[80px] pointer-events-none translate-y-1/3 -translate-x-1/3" />

      {/* Floating Overlay - Upper Left Quadrant */}
      <div className="absolute top-8 left-8 z-10 pointer-events-none space-y-4">
        <div>
          <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wider mb-1">Projected Value</p>
          <p className="text-2xl md:text-3xl font-bold text-white tracking-tight">{formatCurrency(finalValueWithoutFees)}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">With Fees</p>
          <p className="text-xl md:text-2xl font-semibold text-slate-200 tracking-tight">{formatCurrency(finalValueWithFees)}</p>
        </div>
        <div className="pt-2 border-t border-white/10">
           <p className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-1">Lost to Fees</p>
           <p className="text-xl md:text-2xl font-bold text-red-500 tracking-tight">-{formatCurrency(finalLost)}</p>
        </div>
      </div>

      {/* The Chart */}
      <div className="w-full h-full pt-4 pb-0 pr-0 pl-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
            <defs>
              {/* Custom Gradients */}
              <linearGradient id="proEmeraldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="proSlateGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#64748b" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#64748b" stopOpacity={0.05} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
            
            {/* XAxis hidden or minimal since we have year labels on tooltip? 
                Prompt says inputs below X-axis. 
                I'll keep XAxis but style it minimally. 
            */}
            <XAxis 
              dataKey="year" 
              tickLine={false} 
              axisLine={false} 
              tick={{ fill: "#525252", fontSize: 12 }} 
              dy={10}
            />
            
            {/* Hide YAxis to keep it clean as requested, relying on overlay and tooltip */}
            <YAxis hide domain={['dataMin', 'auto']} />

            <Tooltip content={<CustomHUDTooltip />} cursor={{ stroke: "#525252", strokeWidth: 1, strokeDasharray: "4 4" }} />

            {/* Potential Growth (Upper Line) - Emerald Green */}
            <Area
              type="monotone"
              dataKey="withoutFees"
              stroke="#10b981" // Emerald-500
              strokeWidth={3}
              fill="url(#proEmeraldGradient)"
              activeDot={{ r: 6, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }}
            />

            {/* Actual Value (Lower Line) - Muted Blue/Gray */}
            <Area
              type="monotone"
              dataKey="withFees"
              stroke="#64748b" // Slate-500
              strokeWidth={3}
              fill="url(#proSlateGradient)"
              activeDot={{ r: 6, fill: "#64748b", stroke: "#fff", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
