"use client";

import { useEffect, useMemo, useState } from "react";
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

function formatYAxisCurrency(value: number): string {
  const absoluteValue = Math.abs(value);

  if (absoluteValue >= 1_000_000) {
    const millions = value / 1_000_000;
    const display = Number.isInteger(millions) ? millions.toFixed(0) : millions.toFixed(1).replace(/\.0$/, "");
    return `$${display}M`;
  }

  if (absoluteValue >= 1_000) {
    const thousands = value / 1_000;
    const display = Number.isInteger(thousands) ? thousands.toFixed(0) : thousands.toFixed(1).replace(/\.0$/, "");
    return `$${display}K`;
  }

  return `$${Math.round(value).toLocaleString("en-US")}`;
}

const CustomHUDTooltip = ({ active, payload, label, isDark = false }: any) => {
  if (!active || !payload || payload.length < 2) {
    return null;
  }

  const withoutFees = payload[0].value;
  const withFees = payload[1].value;
  const lostAmount = withoutFees - withFees;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.1 }}
      className={`min-w-[155px] rounded-lg border p-2.5 shadow-lg backdrop-blur-sm ${
        isDark ? "border-slate-700 bg-slate-900/95" : "border-slate-200 bg-white/95"
      }`}
    >
      <p className={`mb-1 text-[10px] font-semibold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}>
        Year {label}
      </p>

      <div className="space-y-2">
        <div>
          <div className="mb-0.5 flex items-center justify-between text-[10px] text-brand-600">
            <span>Smarter Way Wealth</span>
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
          </div>
          <p className={`text-lg font-bold tabular-nums ${isDark ? "text-slate-100" : "text-slate-900"}`}>
            {formatCurrency(withoutFees)}
          </p>
        </div>

        <div>
          <div className="mb-0.5 flex items-center justify-between text-[10px] text-red-700">
            <span>Lost to fees</span>
            <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
          </div>
          <p className="text-lg font-bold tabular-nums text-red-700">-{formatCurrency(lostAmount)}</p>
        </div>

        <div className={`mt-1 border-t pt-1.5 ${isDark ? "border-slate-700" : "border-slate-100"}`}>
          <div className={`mb-0.5 flex items-center justify-between text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            <span>Traditional AUM</span>
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
          </div>
          <p className={`text-lg font-bold tabular-nums ${isDark ? "text-slate-100" : "text-slate-900"}`}>
            {formatCurrency(withFees)}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

function LostToFeesDonut({
  percentLost,
  isMobile,
  isDarkMode,
}: {
  percentLost: number;
  isMobile: boolean;
  isDarkMode: boolean;
}) {
  const chartSize = isMobile ? 64 : 108;
  const innerRadius = isMobile ? 18 : 35;
  const outerRadius = isMobile ? 28 : 52;
  const donutData = [
    { name: "Lost", value: percentLost, fill: "#BE123C" },
    { name: "Kept", value: Math.max(0, 100 - percentLost), fill: isDarkMode ? "#94A3B8" : "#0F172A" },
  ];

  return (
    <div className="pointer-events-none absolute left-2 top-2 z-20 sm:left-4 sm:top-4">
      <div className={`text-[10px] font-semibold uppercase tracking-wider sm:text-xs md:text-sm ${isDarkMode ? "text-slate-300" : "text-slate-500"}`}>
        Lost Wealth
      </div>
      <div className="relative" style={{ height: chartSize, width: chartSize }}>
        <PieChart width={chartSize} height={chartSize}>
          <Pie
            data={donutData}
            dataKey="value"
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            startAngle={90}
            endAngle={-270}
            stroke="none"
          >
            {donutData.map((entry) => (
              <Cell key={entry.name} fill={entry.fill} />
            ))}
          </Pie>
        </PieChart>
        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold tabular-nums text-red-700 sm:text-sm md:text-base">
          {percentLost.toFixed(1)}%
        </div>
      </div>
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
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [animateOnMount, setAnimateOnMount] = useState(true);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    setIsDarkMode(document.documentElement.classList.contains("dark"));
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => setAnimateOnMount(false), 1700);
    return () => window.clearTimeout(timeout);
  }, []);

  const palette = useMemo(
    () =>
      isDarkMode
        ? {
            smarterStroke: "#34D399",
            smarterArea: "#34D399",
            traditionalStroke: "#93A5C3",
            traditionalArea: "#93A5C3",
            grid: "#334155",
            xTick: "#94A3B8",
            yTick: "#94A3B8",
            cursor: "#64748B",
          }
        : {
            smarterStroke: "#00A540",
            smarterArea: "#00A540",
            traditionalStroke: "#64748B",
            traditionalArea: "#64748B",
            grid: "#CBD5E1",
            xTick: "#9CA3AF",
            yTick: "#6B7280",
            cursor: "#E5E7EB",
          },
    [isDarkMode]
  );

  const smarterOpacity = activeScenario === "traditional" ? 0.3 : 1;
  const traditionalOpacity = activeScenario === "smarter" ? 0.3 : 1;
  const percentLost = finalValueWithoutFees > 0 ? Math.min(100, Math.max(0, (finalLost / finalValueWithoutFees) * 100)) : 0;

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden rounded-t-2xl bg-white dark:bg-slate-900">
      <LostToFeesDonut percentLost={percentLost} isMobile={isMobile} isDarkMode={isDarkMode} />

      {showSummary && (
        <div className="shrink-0 space-y-1.5 px-4 pb-2 pt-4 sm:hidden">
          <div className="flex items-baseline justify-between">
            <span className="tabular-nums text-lg font-semibold text-brand-700">{formatCurrency(finalValueWithoutFees)}</span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-600">Smarter Way ($100/mo)</span>
          </div>
          <div className="mx-[-4px] flex items-baseline justify-between rounded-lg bg-brand-50 px-3 py-1.5 dark:bg-emerald-950/40">
            <span className="tabular-nums text-xl font-bold text-brand-700">+{formatCurrency(finalLost)}</span>
            <span className="text-sm font-bold uppercase tracking-wider text-brand-600">You Save</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="tabular-nums text-lg font-semibold text-slate-600 dark:text-slate-300">{formatCurrency(finalValueWithFees)}</span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">AUM Advisor</span>
          </div>
        </div>
      )}

      {showSummary && (
        <div className="pointer-events-none absolute left-8 top-8 z-10 hidden sm:block">
          <div className="grid grid-cols-[auto_auto] items-baseline gap-x-4 text-right">
            <p className="tabular-nums text-2xl font-semibold tracking-tight text-brand-700">{formatCurrency(finalValueWithoutFees)}</p>
            <p className="text-left text-xs font-semibold uppercase tracking-wider text-brand-600">With Smarter Way Wealth ($100/mo)</p>

            <div className="mb-2 border-b border-neutral-300 pb-2 dark:border-slate-700">
              <p className="tabular-nums text-3xl font-bold tracking-tight text-brand-700">+{formatCurrency(finalLost)}</p>
            </div>
            <div className="mb-2 border-b border-transparent pb-2">
              <p className="text-left text-base font-bold uppercase tracking-wider text-brand-600">You Save</p>
            </div>

            <p className="tabular-nums text-2xl font-semibold tracking-tight text-slate-600 dark:text-slate-200">
              {formatCurrency(finalValueWithFees)}
            </p>
            <p className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              With AUM Advisor
            </p>
          </div>
        </div>
      )}

      <div className="min-h-0 h-[280px] w-full pt-2 sm:h-auto sm:flex-1 sm:pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: isMobile ? 10 : 20,
              right: 5,
              left: 5,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={palette.smarterArea} stopOpacity={isDarkMode ? 0.38 : 0.2} />
                <stop offset="100%" stopColor={palette.smarterArea} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="slateGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={palette.traditionalArea} stopOpacity={isDarkMode ? 0.3 : 0.2} />
                <stop offset="100%" stopColor={palette.traditionalArea} stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} vertical={false} />

            <XAxis
              dataKey="year"
              tickLine={false}
              axisLine={false}
              tick={{ fill: palette.xTick, fontSize: isMobile ? 11 : 12 }}
              dy={10}
              interval={isMobile ? 4 : "preserveStartEnd"}
            />

            <YAxis
              hide={isMobile}
              tickLine={false}
              axisLine={false}
              tick={{ fill: palette.yTick, fontSize: 12 }}
              tickFormatter={formatYAxisCurrency}
              width={60}
              tickMargin={10}
              domain={["dataMin", "auto"]}
            />

            {!isMobile && (
              <Tooltip
                content={<CustomHUDTooltip isDark={isDarkMode} />}
                cursor={{ stroke: palette.cursor, strokeWidth: 1, strokeDasharray: "4 4" }}
              />
            )}

            <Area
              type="monotone"
              dataKey="withoutFees"
              stroke={palette.smarterStroke}
              strokeWidth={isMobile ? 2 : 3}
              fill="url(#emeraldGradient)"
              fillOpacity={smarterOpacity}
              strokeOpacity={smarterOpacity}
              isAnimationActive={animateOnMount}
              animationDuration={1400}
              animationEasing="ease-out"
              activeDot={{
                r: isMobile ? 4 : 6,
                fill: palette.smarterStroke,
                stroke: isDarkMode ? "#0F172A" : "#FFFFFF",
                strokeWidth: 2,
              }}
            />

            <Area
              type="monotone"
              dataKey="withFees"
              stroke={palette.traditionalStroke}
              strokeWidth={isMobile ? 2 : 3}
              fill="url(#slateGradient)"
              fillOpacity={traditionalOpacity}
              strokeOpacity={traditionalOpacity}
              isAnimationActive={animateOnMount}
              animationDuration={1400}
              animationBegin={120}
              animationEasing="ease-out"
              activeDot={{
                r: isMobile ? 4 : 6,
                fill: palette.traditionalStroke,
                stroke: isDarkMode ? "#0F172A" : "#FFFFFF",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
