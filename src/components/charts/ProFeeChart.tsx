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
      className={`inline-block rounded-lg border px-2 py-1.5 shadow-lg backdrop-blur-sm ${
        isDark ? "border-slate-700/60 bg-slate-900/30" : "border-slate-200/60 bg-white/30"
      }`}
    >
      <p className={`mb-0.5 text-[10px] font-semibold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}>
        Year {label}
      </p>

      <div className="space-y-1">
        <div>
          <div className="flex items-center justify-between text-[10px] text-[#00A540]">
            <span>SMARTER $100/mo Flat Fee</span>
          </div>
          <p className="text-base font-bold tabular-nums text-[#00A540]">
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
            <span>Traditional AUM</span>
          </div>
          <p className={`text-base font-bold tabular-nums ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            {formatCurrency(withFees)}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

// Custom cursor: faint full-height dashed guide line + fee gap segment
const FeeDragCursor = ({ points, height, top, cursorColor, payload, yAxisMap }: any) => {
  if (!points || points.length < 2) return null;
  const x = points[0].x;
  const numericValues = (payload ?? [])
    .map((entry: any) => entry?.value)
    .filter((value: unknown): value is number => typeof value === "number");
  const primaryYAxis = yAxisMap ? Object.values(yAxisMap)[0] : null;
  const scale = (primaryYAxis as any)?.scale;
  const mappedY = numericValues
    .map((value: number) => (typeof scale === "function" ? scale(value) : null))
    .filter((value: unknown): value is number => typeof value === "number" && Number.isFinite(value));
  if (typeof window !== "undefined") {
    (window as any).__feeCursorDebug = {
      points,
      payloadValues: (payload ?? []).map((entry: any) => entry?.value),
      hasScale: typeof scale === "function",
      mappedY,
    };
  }

  const yTop = mappedY.length === 2 ? Math.min(...mappedY) : Math.min(points[0].y, points[1].y);
  const yBottom = mappedY.length === 2 ? Math.max(...mappedY) : Math.max(points[0].y, points[1].y);
  const endpointInset = 6;
  const segmentTop = yTop + endpointInset;
  const segmentBottom = yBottom - endpointInset;

  return (
    <g>
      <line
        x1={x} y1={top} x2={x} y2={top + height}
        stroke={cursorColor ?? "#E5E7EB"}
        strokeWidth={1}
        strokeDasharray="4 4"
      />
      {segmentBottom > segmentTop && (
        <line
          x1={x}
          y1={segmentTop}
          x2={x}
          y2={segmentBottom}
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
}: {
  percentLost: number;
  isMobile: boolean;
  isDarkMode: boolean;
}) {
  const chartSize = isMobile ? 77 : 130;
  const innerRadius = isMobile ? 22 : 42;
  const outerRadius = isMobile ? 34 : 62;
  const donutData = [
    { name: "Lost", value: percentLost, fill: "#B91C1C" },
    { name: "Kept", value: Math.max(0, 100 - percentLost), fill: isDarkMode ? "#64748B" : "#94A3B8" },
  ];

  return (
    <div className="pointer-events-none absolute left-6 top-6 z-20 sm:left-[80px] sm:top-8">
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
                <stop offset="0%" stopColor={palette.traditionalArea} stopOpacity={isDarkMode ? 0.5 : 0.35} />
                <stop offset="100%" stopColor={palette.traditionalArea} stopOpacity={0.05} />
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
