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
  // New variables for the key
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

  const smarterColor = isDark ? "#E2E8F0" : "#0F172A";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.1 }}
      className={`inline-block rounded-lg border px-2 py-1.5 shadow-lg backdrop-blur-sm ${
        isDark ? "border-slate-700/60 bg-slate-900/30" : "border-slate-200/60 bg-white/30"
      }`}
    >
      <p className={`mb-0.5 text-[10px] font-semibold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}>
        Year {label}
      </p>

      <div className="space-y-1">
        <div>
          <div className="flex items-center justify-between text-[10px]" style={{ color: smarterColor }}>
            <span>SMARTER $100/mo Flat Fee</span>
          </div>
          <p className="text-base font-bold tabular-nums" style={{ color: smarterColor }}>
            {formatCurrency(withoutFees)}
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between text-[10px] text-[#B91C1C]">
            <span>Lost to asset-based fees</span>
          </div>
          <p className="text-base font-bold tabular-nums text-[#B91C1C]">-{formatCurrency(lostAmount)}</p>
        </div>

        <div className={`border-t pt-1 ${isDark ? "border-slate-700" : "border-slate-100"}`}>
          <div className={`flex items-center justify-between text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            <span>Traditional Asset-Based Fee</span>
          </div>
          <p className={`text-base font-bold tabular-nums ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            {formatCurrency(withFees)}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

// Custom cursor: faint full-height dashed guide line
const FeeDragCursor = ({ points, height, top, cursorColor, payload }: any) => {
  if (!points || points.length < 2) return null;
  const x = points[0].x;
  const payloadValues = (payload ?? [])
    .map((entry: any) => entry?.value)
    .filter((value: unknown): value is number => typeof value === "number" && Number.isFinite(value));

  const parseAxisTick = (label: string): number | null => {
    const normalized = label.replace(/\$/g, "").replace(/,/g, "").trim().toUpperCase();
    if (!normalized) return null;
    if (normalized.endsWith("M")) {
      const n = Number.parseFloat(normalized.slice(0, -1));
      return Number.isFinite(n) ? n * 1_000_000 : null;
    }
    if (normalized.endsWith("K")) {
      const n = Number.parseFloat(normalized.slice(0, -1));
      return Number.isFinite(n) ? n * 1_000 : null;
    }
    const n = Number.parseFloat(normalized);
    return Number.isFinite(n) ? n : null;
  };

  const axisTicks =
    typeof document === "undefined"
      ? []
      : Array.from(document.querySelectorAll(".recharts-yAxis .recharts-cartesian-axis-tick text"))
          .map((tick) => {
            const y = Number.parseFloat(tick.getAttribute("y") ?? "NaN");
            const value = parseAxisTick(tick.textContent ?? "");
            return { y, value };
          })
          .filter((tick): tick is { y: number; value: number } => Number.isFinite(tick.y) && tick.value !== null);

  const minTick = axisTicks.reduce<{ y: number; value: number } | null>(
    (acc, tick) => (acc === null || tick.value < acc.value ? tick : acc),
    null
  );
  const maxTick = axisTicks.reduce<{ y: number; value: number } | null>(
    (acc, tick) => (acc === null || tick.value > acc.value ? tick : acc),
    null
  );

  const mapValueToY = (value: number): number | null => {
    if (!minTick || !maxTick || maxTick.value === minTick.value) return null;
    const ratio = (value - minTick.value) / (maxTick.value - minTick.value);
    return minTick.y + ratio * (maxTick.y - minTick.y);
  };

  const yPoints = payloadValues
    .map(mapValueToY)
    .filter((y: number | null): y is number => y !== null && Number.isFinite(y));
  const yTop = yPoints.length >= 2 ? Math.min(...yPoints) : null;
  const yBottom = yPoints.length >= 2 ? Math.max(...yPoints) : null;

  return (
    <g>
      <line
        x1={x} y1={top} x2={x} y2={top + height}
        stroke={cursorColor ?? "#E5E7EB"}
        strokeWidth={1}
        strokeDasharray="4 4"
      />
      {yTop !== null && yBottom !== null && yBottom - yTop > 2 && (
        <line
          x1={x}
          y1={yTop + 1}
          x2={x}
          y2={yBottom - 1}
          stroke="#B91C1C"
          strokeWidth={3}
          strokeOpacity={0.95}
          strokeLinecap="round"
        />
      )}
    </g>
  );
};

function LostToFeesDonut({
  percentLost,
  isMobile,
  isDarkMode,
  portfolioValue,
  years,
  annualGrowthPercent,
  annualFeePercent,
  mutualFundExpensePercent,
}: {
  percentLost: number;
  isMobile: boolean;
  isDarkMode: boolean;
  portfolioValue?: number;
  years?: number;
  annualGrowthPercent?: number;
  annualFeePercent?: number;
  mutualFundExpensePercent?: number;
}) {
  const chartSize = isMobile ? 77 : 130;
  const innerRadius = isMobile ? 22 : 42;
  const outerRadius = isMobile ? 34 : 62;
  const donutData = [
    { name: "Lost", value: percentLost, fill: "url(#donutLostGradient)" },
    { name: "Kept", value: Math.max(0, 100 - percentLost), fill: "url(#donutKeptGradient)" },
  ];

  const totalFee = (annualFeePercent ?? 0) + (mutualFundExpensePercent ?? 0);

  return (
    <div className="pointer-events-none absolute left-6 top-6 z-20 flex items-center gap-4 sm:left-[80px] sm:top-8">
      <div className="relative" style={{ height: chartSize, width: chartSize }}>
        <PieChart width={chartSize} height={chartSize}>
          <defs>
            <linearGradient id="donutLostGradient" x1="0" y1="0" x2="0" y2={chartSize} gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#f87171" />
              <stop offset="100%" stopColor="#7f1d1d" />
            </linearGradient>
            <linearGradient id="donutKeptGradient" x1="0" y1="0" x2="0" y2={chartSize} gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={isDarkMode ? "#cbd5e1" : "#475569"} />
              <stop offset="100%" stopColor={isDarkMode ? "#020617" : "#0F172A"} />
            </linearGradient>
          </defs>
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
            isAnimationActive={false}
          >
            {donutData.map((entry) => (
              <Cell key={entry.name} fill={entry.fill} />
            ))}
          </Pie>
        </PieChart>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[10px] font-semibold tabular-nums text-[#B91C1C] sm:text-xs md:text-sm">
            {percentLost.toFixed(1)}%
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-[#B91C1C] sm:text-sm md:text-base">
            Lost
          </span>
        </div>
      </div>

      {/* Variables Key */}
      {!isMobile && (
        <div className="flex flex-col gap-0.5 text-[11px] font-medium leading-tight text-black dark:text-slate-300">
          <div className="flex gap-1.5">
            <span className="opacity-70">Portfolio:</span>
            <span className="font-bold">{formatCurrency(portfolioValue ?? 0)}</span>
          </div>
          <div className="flex gap-1.5">
            <span className="opacity-70">Growth:</span>
            <span className="font-bold">{annualGrowthPercent}%</span>
          </div>
          <div className="flex gap-1.5">
            <span className="opacity-70">Time:</span>
            <span className="font-bold">{years} Years</span>
          </div>
          
          <div className="mt-1 flex flex-col">
            <div className="flex gap-1.5 text-[#B91C1C]">
              <span className="opacity-70">Advisory Fees:</span>
              <span className="font-bold">{annualFeePercent?.toFixed(2)}%</span>
            </div>
            <div className="flex gap-1.5 text-[#B91C1C]">
              <span className="opacity-70">Mutual Fund Expenses:</span>
              <span className="font-bold">{mutualFundExpensePercent?.toFixed(2)}%</span>
            </div>
            <div className="my-0.5 h-px w-full bg-[#B91C1C]/30" />
            <div className="flex gap-1.5 text-[#B91C1C]">
              <span className="opacity-70">Total Fees:</span>
              <span className="font-bold">{totalFee.toFixed(2)}%</span>
            </div>
          </div>
        </div>
      )}
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
  portfolioValue,
  years,
  annualGrowthPercent,
  annualFeePercent,
  mutualFundExpensePercent,
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
            smarterStroke: "#E2E8F0",
            hatchColor: "#FCA5A5",
            traditionalStroke: "#F8FAFC",
            traditionalArea: "#93A5C3",
            grid: "#334155",
            xTick: "#94A3B8",
            yTick: "#94A3B8",
            cursor: "#64748B",
            chartBg: "#0F172A",
          }
        : {
            smarterStroke: "#0F172A",
            hatchColor: "#B91C1C",
            traditionalStroke: "#000000",
            traditionalArea: "#64748B",
            grid: "#CBD5E1",
            xTick: "#9CA3AF",
            yTick: "#6B7280",
            cursor: "#E5E7EB",
            chartBg: "#FFFFFF",
          },
    [isDarkMode]
  );

  const smarterOpacity = activeScenario === "traditional" ? 0.3 : 1;
  const traditionalOpacity = activeScenario === "smarter" ? 0.3 : 1;
  const percentLost = finalValueWithoutFees > 0 ? Math.min(100, Math.max(0, (finalLost / finalValueWithoutFees) * 100)) : 0;

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden rounded-t-2xl bg-white dark:bg-slate-900">
      <LostToFeesDonut
        percentLost={percentLost}
        isMobile={isMobile}
        isDarkMode={isDarkMode}
        portfolioValue={portfolioValue}
        years={years}
        annualGrowthPercent={annualGrowthPercent}
        annualFeePercent={annualFeePercent}
        mutualFundExpensePercent={mutualFundExpensePercent}
      />

      {showSummary && (
        <div className="shrink-0 space-y-1.5 px-4 pb-2 pt-4 sm:hidden">
          <div className="flex items-baseline justify-between rounded-lg bg-slate-50 px-3 py-1.5 dark:bg-slate-800/40">
            <span className="tabular-nums text-lg font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(finalValueWithoutFees)}</span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Smarter Way ($100/mo)</span>
          </div>
          <div className="mx-[-4px] flex items-baseline justify-between px-3 py-1.5">
            <span className="tabular-nums text-xl font-bold text-slate-900 dark:text-slate-100">+{formatCurrency(finalLost)}</span>
            <span className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">You Save</span>
          </div>
          <div className="flex items-baseline justify-between rounded-lg bg-slate-50 px-3 py-1.5 dark:bg-slate-800/40">
            <span className="tabular-nums text-lg font-semibold text-slate-600 dark:text-slate-300">{formatCurrency(finalValueWithFees)}</span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">AUM Advisor</span>
          </div>
        </div>
      )}

      {showSummary && (
        <div className="pointer-events-none absolute left-8 top-8 z-10 hidden sm:block">
          <div className="grid grid-cols-[auto_auto] items-baseline gap-x-4 text-right">
            <p className="tabular-nums text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">{formatCurrency(finalValueWithoutFees)}</p>
            <p className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">With Smarter Way Wealth ($100/mo)</p>

            <div className="mb-2 border-b border-neutral-300 pb-2 dark:border-slate-700">
              <p className="tabular-nums text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">+{formatCurrency(finalLost)}</p>
            </div>
            <div className="mb-2 border-b border-transparent pb-2">
              <p className="text-left text-base font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">You Save</p>
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
              <linearGradient id="redGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#fee2e2" stopOpacity={0.2} />
              </linearGradient>

              <linearGradient id="blackGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#18181b" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#18181b" stopOpacity={0.05} />
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
                cursor={
                  <FeeDragCursor
                    cursorColor={palette.cursor}
                  />
                }
              />
            )}

            <Area
              type="monotone"
              dataKey="withoutFees"
              stroke={palette.smarterStroke}
              strokeWidth={isMobile ? 2 : 3}
              fill="url(#redGradient)"
              fillOpacity={1}
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

            {/* Solid background for withFees to prevent red bleeding through */}
            <Area
              type="monotone"
              dataKey="withFees"
              stroke="none"
              fill={palette.chartBg}
              fillOpacity={1}
              isAnimationActive={animateOnMount}
              animationDuration={1400}
              animationBegin={120}
              animationEasing="ease-out"
              activeDot={false}
            />

            {/* Black Gradient beneath the lower bottom line */}
            <Area
              type="monotone"
              dataKey="withFees"
              stroke={palette.traditionalStroke}
              strokeWidth={isMobile ? 2 : 3}
              fill="url(#blackGradient)"
              fillOpacity={1}
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
