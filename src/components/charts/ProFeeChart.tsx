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
            <div className="flex justify-between items-center text-xs text-indigo-300 mb-1">
              <span>Potential Growth</span>
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400"></span>
            </div>
            <p className="text-xl font-bold text-white tabular-nums">
              {formatCurrency(withoutFees)}
            </p>
          </div>

          {/* Actual Value */}
          <div>
            <div className="flex justify-between items-center text-xs text-emerald-300 mb-1">
              <span>Actual Value</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
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

export function ProFeeChart({ data, finalLost }: ProFeeChartProps) {
  return (
    <div className="relative w-full h-full bg-neutral-900 rounded-2xl overflow-hidden shadow-2xl border border-white/5 ring-1 ring-black/5">
      {/* Background Glow Effect (Idea 4 - Subtle inclusion) */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-900/10 rounded-full blur-[80px] pointer-events-none translate-y-1/3 -translate-x-1/3" />

      {/* Header / Title Overlay */}
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <h3 className="text-white font-bold text-lg tracking-tight">Portfolio Trajectory</h3>
        <p className="text-stone-400 text-sm mt-1">
          Interactive projection of fee impact over time
        </p>
      </div>

      <div className="absolute top-6 right-6 z-10 text-right pointer-events-none">
         <div className="inline-block px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 backdrop-blur-sm">
            <p className="text-xs font-semibold text-red-400">
               Total Impact: <span className="text-red-300">-{formatCurrency(finalLost)}</span>
            </p>
         </div>
      </div>

      {/* The Chart */}
      <div className="w-full h-full pt-20 pb-4 pr-4 pl-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              {/* Custom Gradients for Dark Mode */}
              <linearGradient id="proGreyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#818cf8" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#818cf8" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="proGreenGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34d399" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#34d399" stopOpacity={0.05} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
            
            <XAxis 
              dataKey="year" 
              tickLine={false} 
              axisLine={false} 
              tick={{ fill: "#78716c", fontSize: 12 }} 
              dy={10}
            />
            
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#78716c", fontSize: 12 }}
              tickFormatter={(value) => `${value / 1000}k`}
              dx={-10}
            />

            <Tooltip content={<CustomHUDTooltip />} cursor={{ stroke: "#525252", strokeWidth: 1, strokeDasharray: "4 4" }} />

            {/* Potential Growth (Upper Line) */}
            <Area
              type="monotone"
              dataKey="withoutFees"
              stroke="#818cf8" // Indigo-400
              strokeWidth={3}
              fill="url(#proGreyGradient)"
              activeDot={{ r: 6, fill: "#818cf8", stroke: "#fff", strokeWidth: 2 }}
            />

            {/* Actual Value (Lower Line) */}
            <Area
              type="monotone"
              dataKey="withFees"
              stroke="#34d399" // Emerald-400
              strokeWidth={3}
              fill="url(#proGreenGradient)"
              activeDot={{ r: 6, fill: "#34d399", stroke: "#fff", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
