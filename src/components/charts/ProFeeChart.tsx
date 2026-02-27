"use client";

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
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
  showSummary?: boolean;
  activeScenario?: "smarter" | "traditional" | null;
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
              <span>With Smarter Way Wealth ($100/mo)</span>
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

function LostToFeesDonut({ percentLost }: { percentLost: number }) {
  const donutData = [
    { name: "Lost", value: percentLost, fill: "#BE123C" },
    { name: "Kept", value: Math.max(0, 100 - percentLost), fill: "#0F172A" },
  ];

  return (
    <div className="pointer-events-none absolute left-2 top-2 z-20 rounded-lg border border-red-100 bg-white/90 px-2 py-2 shadow-sm backdrop-blur-sm sm:left-4 sm:top-4">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Portfolio Lost</div>
      <div className="relative h-14 w-14 sm:h-16 sm:w-16">
        <PieChart width={64} height={64}>
          <Pie
            data={donutData}
            dataKey="value"
            cx="50%"
            cy="50%"
            innerRadius={18}
            outerRadius={28}
            startAngle={90}
            endAngle={-270}
            stroke="none"
          >
            {donutData.map((entry) => (
              <Cell key={entry.name} fill={entry.fill} />
            ))}
          </Pie>
        </PieChart>
        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold tabular-nums text-red-700">
          {percentLost.toFixed(1)}%
        </div>
      </div>
      <div className="mt-0.5 text-[10px] text-slate-500">to fees</div>
    </div>
  );
}

export function ProFeeChart({
  data,
  finalLost,
  finalValueWithoutFees,
  finalValueWithFees,
  showSummary = true,
  activeScenario = null,
}: ProFeeChartProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const smarterOpacity = activeScenario === "traditional" ? 0.3 : 1;
  const traditionalOpacity = activeScenario === "smarter" ? 0.3 : 1;
  const percentLost = finalValueWithoutFees > 0 ? Math.min(100, Math.max(0, (finalLost / finalValueWithoutFees) * 100)) : 0;

  return (
    <div className="relative w-full h-full bg-white rounded-t-2xl overflow-hidden flex flex-col">
      <LostToFeesDonut percentLost={percentLost} />

      {/* ── Mobile Summary — stacked above chart, replaces clipped overlay ── */}
      {showSummary && (
      <div className="sm:hidden px-4 pt-4 pb-2 space-y-1.5 shrink-0">
        {/* Row 1: Smarter Way Wealth */}
        <div className="flex items-baseline justify-between">
          <span className="text-lg font-semibold text-brand-700 tabular-nums">
            {formatCurrency(finalValueWithoutFees)}
          </span>
          <span className="text-[11px] font-semibold text-brand-600 uppercase tracking-wider">
            Smarter Way ($100/mo)
          </span>
        </div>
        {/* Row 2: You Save — emphasized with pill bg */}
        <div className="flex items-baseline justify-between bg-brand-50 rounded-lg px-3 py-1.5 -mx-1">
          <span className="text-xl font-bold text-brand-700 tabular-nums">
            +{formatCurrency(finalLost)}
          </span>
          <span className="text-sm font-bold text-brand-600 uppercase tracking-wider">
            You Save
          </span>
        </div>
        {/* Row 3: AUM Advisor */}
        <div className="flex items-baseline justify-between">
          <span className="text-lg font-semibold text-slate-600 tabular-nums">
            {formatCurrency(finalValueWithFees)}
          </span>
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            AUM Advisor
          </span>
        </div>
      </div>
      )}

      {/* ── Floating Legend Overlay — desktop only ── */}
      {showSummary && (
      <div className="hidden sm:block absolute top-8 left-8 z-10 pointer-events-none">
        <div className="grid grid-cols-[auto_auto] gap-x-4 items-baseline text-right">

          {/* Row 1: RIA Flat Fee */}
          <p className="text-2xl font-semibold text-brand-700 tracking-tight tabular-nums">
            {formatCurrency(finalValueWithoutFees)}
          </p>
          <p className="text-xs font-semibold text-brand-600 uppercase tracking-wider text-left">
            With Smarter Way Wealth ($100/mo)
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
      )}

      {/* ── The Chart ── */}
      <div className="w-full h-[280px] sm:flex-1 sm:h-auto min-h-0 pt-2 sm:pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: isMobile ? 10 : 20,
              right: isMobile ? 4 : 0,
              left: isMobile ? -15 : 0,
              bottom: 0,
            }}
          >
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
              tick={{ fill: "#9ca3af", fontSize: isMobile ? 11 : 12 }}
              dy={10}
              interval={isMobile ? 4 : "preserveStartEnd"}
            />

            <YAxis hide domain={['dataMin', 'auto']} />

            {!isMobile && <Tooltip content={<CustomHUDTooltip />} cursor={{ stroke: "#e5e7eb", strokeWidth: 1, strokeDasharray: "4 4" }} />}

            {/* With RIA $100/mo (Upper Line) - Emerald Green */}
            <Area
              type="monotone"
              dataKey="withoutFees"
              stroke="#00A540"
              strokeWidth={isMobile ? 2 : 3}
              fill="url(#emeraldGradient)"
              fillOpacity={smarterOpacity}
              strokeOpacity={smarterOpacity}
              activeDot={{ r: isMobile ? 4 : 6, fill: "#00A540", stroke: "#fff", strokeWidth: 2 }}
            />

            {/* With AUM Advisor (Lower Line) - Muted Blue/Gray */}
            <Area
              type="monotone"
              dataKey="withFees"
              stroke="#64748b"
              strokeWidth={isMobile ? 2 : 3}
              fill="url(#slateGradient)"
              fillOpacity={traditionalOpacity}
              strokeOpacity={traditionalOpacity}
              activeDot={{ r: isMobile ? 4 : 6, fill: "#64748b", stroke: "#fff", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
