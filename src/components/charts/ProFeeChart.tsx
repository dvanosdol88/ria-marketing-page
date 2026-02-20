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
} from "recharts";
import { formatCurrency } from "@/lib/format";
import { motion } from "framer-motion";

/**
 * PRO DASHBOARD CHART COMPONENT - LIGHT MODE
 * ------------------------------------------------------------------
 * "Clean Financial Dashboard" style.
 */

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
};

const CustomHUDTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const withoutFees = payload[0].value;
    const withFees = payload[1].value;
    const lostAmount = withoutFees - withFees;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.1 }}
        className="bg-white/95 backdrop-blur-sm border border-slate-100 p-4 rounded-xl shadow-xl min-w-[200px]"
      >
        <p className="text-slate-500 text-xs font-medium mb-2 uppercase tracking-wider">
          Year {label}
        </p>
        
        <div className="space-y-3">
          {/* RIA Flat Fee Value */}
          <div>
            <div className="flex justify-between items-center text-xs text-brand-600 mb-1">
              <span>With RIA ($100/mo)</span>
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500"></span>
            </div>
            <p className="text-xl font-bold text-slate-900 tabular-nums">
              {formatCurrency(withoutFees)}
            </p>
          </div>

          {/* Savings */}
          <div>
            <div className="flex justify-between items-center text-xs text-brand-600 mb-1">
              <span>You Save</span>
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500"></span>
            </div>
            <p className="text-xl font-bold text-brand-700 tabular-nums">
              +{formatCurrency(lostAmount)}
            </p>
          </div>

          {/* AUM Advisor Value */}
          <div className="pt-2 border-t border-slate-100 mt-2">
            <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
              <span>With AUM Advisor</span>
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
            </div>
            <p className="text-xl font-bold text-slate-900 tabular-nums">
              {formatCurrency(withFees)}
            </p>
          </div>
        </div>
      </motion.div>
    );
  }
  return null;
};

export function ProFeeChart({ data, finalLost, finalValueWithoutFees, finalValueWithFees }: ProFeeChartProps) {
  return (
    <div className="relative w-full h-full bg-white rounded-t-2xl overflow-hidden">
      
      {/* Floating Legend Overlay - Upper Left Quadrant */}
      <div className="absolute top-8 left-8 z-10 pointer-events-none">
        <div className="grid grid-cols-[auto_auto] gap-x-4 items-baseline text-right">
          
          {/* Row 1: RIA Flat Fee */}
          <p className="text-2xl font-semibold text-brand-700 tracking-tight tabular-nums">
            {formatCurrency(finalValueWithoutFees)}
          </p>
          <p className="text-xs font-semibold text-brand-600 uppercase tracking-wider text-left">
            With RIA ($100/mo)
          </p>

          {/* Row 2: You Save */}
          <div className="border-b border-neutral-300 pb-2 mb-2">
            <p className="text-3xl font-bold text-brand-700 tracking-tight tabular-nums">
              +{formatCurrency(finalLost)}
            </p>
          </div>
          <div className="border-b border-transparent pb-2 mb-2">
            <p className="text-base font-bold text-brand-600 uppercase tracking-wider text-left">
              You Save
            </p>
          </div>

          {/* Row 3: AUM Advisor */}
          <p className="text-2xl font-semibold text-slate-600 tracking-tight tabular-nums">
            {formatCurrency(finalValueWithFees)}
          </p>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-left">
            With AUM Advisor
          </p>
          
        </div>
      </div>

      {/* The Chart */}
      <div className="w-full h-full pt-4 pb-0 pr-0 pl-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00A540" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#00A540" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="slateGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#64748b" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#64748b" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" vertical={false} />
            
            <XAxis 
              dataKey="year" 
              tickLine={false} 
              axisLine={false} 
              tick={{ fill: "#9ca3af", fontSize: 12 }} 
              dy={10}
            />
            
            <YAxis hide domain={['dataMin', 'auto']} />

            <Tooltip content={<CustomHUDTooltip />} cursor={{ stroke: "#e5e7eb", strokeWidth: 1, strokeDasharray: "4 4" }} />

            {/* With RIA $100/mo (Upper Line) - Emerald Green */}
            <Area
              type="monotone"
              dataKey="withoutFees"
              stroke="#00A540" 
              strokeWidth={3}
              fill="url(#emeraldGradient)"
              activeDot={{ r: 6, fill: "#00A540", stroke: "#fff", strokeWidth: 2 }}
            />

            {/* With AUM Advisor (Lower Line) - Muted Blue/Gray */}
            <Area
              type="monotone"
              dataKey="withFees"
              stroke="#64748b" 
              strokeWidth={3}
              fill="url(#slateGradient)"
              activeDot={{ r: 6, fill: "#64748b", stroke: "#fff", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
