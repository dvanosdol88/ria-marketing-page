"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Clock3,
  Coins,
  DollarSign,
  Percent,
  PieChart,
  ReceiptText,
  ScanLine,
  ShieldCheck,
  SlidersHorizontal,
  TrendingUp,
} from "lucide-react";
import { formatCurrency } from "@/lib/format";
import type {
  HomeCalculatorTheme,
  HomeCalculatorLayout,
} from "@/config/homeMarketingVariants";
import type { ProjectionYear } from "@/lib/feeProjection";
import { Odometer } from "@/components/Odometer";
import { ScrollReveal } from "@/components/ScrollReveal";

type Scenario = "smarter" | "traditional";

export type CalculatorSliderNodes = {
  advisoryFee: ReactNode;
  mutualFundExpenses: ReactNode | null;
  portfolio: ReactNode;
  growth: ReactNode;
  years: ReactNode;
};

export type CalculatorSimpleControlNodes = {
  advisoryFee: ReactNode;
  growth: ReactNode;
  portfolio: ReactNode;
  years: ReactNode;
};

type HomeCalculatorExperienceProps = {
  layout: HomeCalculatorLayout;
  theme: HomeCalculatorTheme;
  series: ProjectionYear[];
  savings: number;
  percentLost: number;
  finalValueWithoutFees: number;
  finalValueWithFees: number;
  portfolioValue: number;
  years: number;
  annualGrowthPercent: number;
  annualFeePercent: number;
  mutualFundExpensePercent: number;
  totalAnnualFeePercent: number;
  totalAssetBasedFees: number;
  totalFlatFees: number;
  annualAumFeeEstimate: number;
  annualFlatFee: number;
  shareAction: ReactNode;
  disclosure: ReactNode;
  helperNotes: ReactNode;
  collapseControl: ReactNode;
  slidersExpanded: boolean;
  sliders: CalculatorSliderNodes;
  simpleControls: CalculatorSimpleControlNodes;
  renderChart: (className: string) => ReactNode;
  activeScenario: Scenario | null;
  onHighlightScenario: (scenario: Scenario) => void;
};

function formatCompactCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: value >= 1000000 ? 2 : 0,
  }).format(value);
}

function ScenarioButton({
  activeScenario,
  label,
  scenario,
  value,
  tone,
  onHighlightScenario,
}: {
  activeScenario: Scenario | null;
  label: string;
  scenario: Scenario;
  value: string;
  tone: "positive" | "negative";
  onHighlightScenario: (scenario: Scenario) => void;
}) {
  const isActive = activeScenario === scenario;
  const toneClassName =
    tone === "positive"
      ? "border-emerald-500/40 bg-emerald-50 text-emerald-950 hover:bg-emerald-100 dark:border-emerald-300/30 dark:bg-emerald-300/10 dark:text-emerald-50"
      : "border-red-500/30 bg-red-50 text-red-950 hover:bg-red-100 dark:border-red-300/30 dark:bg-red-300/10 dark:text-red-50";

  return (
    <button
      type="button"
      onClick={() => onHighlightScenario(scenario)}
      className={`rounded-2xl border px-4 py-3 text-left transition ${toneClassName} ${
        isActive ? "ring-2 ring-offset-2 ring-offset-transparent" : ""
      }`}
      aria-pressed={isActive}
    >
      <span className="block text-[10px] font-bold uppercase tracking-[0.18em] opacity-70">
        {label}
      </span>
      <span className="mt-1 block text-xl font-semibold tabular-nums sm:text-2xl">
        {value}
      </span>
    </button>
  );
}

function MiniStat({
  label,
  value,
  className = "",
}: {
  label: string;
  value: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] opacity-60">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold tabular-nums sm:text-2xl">{value}</p>
    </div>
  );
}

function StepControl({
  children,
  description,
  icon,
  step,
  title,
}: {
  children: ReactNode;
  description: string;
  icon: ReactNode;
  step: string;
  title: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E5EDF7] text-[#2A3F63]">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Step {step}
          </p>
          <h3 className="mt-0.5 text-base font-semibold text-slate-950">{title}</h3>
          <p className="mt-1 text-sm leading-5 text-slate-600">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function ReceiptControlRow({
  children,
  label,
  value,
}: {
  children: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="border-b border-dashed border-slate-300 py-4 last:border-b-0">
      <div className="mb-2 flex items-baseline justify-between gap-4 font-mono text-xs uppercase tracking-[0.12em] text-slate-500">
        <span>{label}</span>
        <span className="text-right text-slate-900">{value}</span>
      </div>
      {children}
    </div>
  );
}

function ConsoleControlGroup({
  children,
  title,
}: {
  children: ReactNode;
  title?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      {title && (
        <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-emerald-100/70">
          {title}
        </h3>
      )}
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function DirectMailCalculatorExperience(props: HomeCalculatorExperienceProps) {
  const {
    activeScenario,
    annualFlatFee,
    annualAumFeeEstimate,
    collapseControl,
    disclosure,
    finalValueWithFees,
    finalValueWithoutFees,
    helperNotes,
    onHighlightScenario,
    percentLost,
    renderChart,
    savings,
    shareAction,
    sliders,
    slidersExpanded,
    theme,
    totalAnnualFeePercent,
    years,
  } = props;

  return (
    <div className="section-shell relative z-10 pb-20 pt-10 sm:pt-14">
      <div className="grid gap-5 text-left lg:grid-cols-[minmax(0,0.9fr)_minmax(320px,0.55fr)] lg:items-end">
        <div>
          <p className={`text-sm font-bold uppercase tracking-[0.18em] ${theme.eyebrowClassName}`}>
            QR fee scan
          </p>
          <h2 className={`mt-3 max-w-3xl text-3xl font-semibold tracking-normal sm:text-5xl ${theme.titleClassName}`}>
            Four inputs. One fee-drag number.
          </h2>
          <p className={`mt-3 max-w-2xl text-base leading-7 sm:text-lg ${theme.bodyClassName}`}>
            Start with the assumptions from your mailer, then tune the sliders until the result feels like your real situation.
          </p>
        </div>

        <div className="rounded-[24px] border border-white/80 bg-white p-4 shadow-[0_18px_60px_rgba(15,23,42,0.12)]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DFF7EA] text-[#007A2F]">
              <ScanLine className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                Current scan result
              </p>
              <p className="text-3xl font-semibold text-[#007A2F]">
                <Odometer value={savings} prefix="$" duration={1000} />
              </p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <MiniStat label="Annual fee load" value={`${totalAnnualFeePercent.toFixed(2)}%`} />
            <MiniStat label="Portfolio lost" value={`${percentLost.toFixed(1)}%`} />
          </div>
          <div className="mt-4">{shareAction}</div>
          {disclosure}
        </div>
      </div>

      <ScrollReveal className="mt-7 overflow-hidden rounded-[28px] border border-white/80 bg-white/90 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl ring-1 ring-slate-900/5">
        <div className="grid lg:grid-cols-[minmax(300px,0.82fr)_minmax(0,1.18fr)]">
          <div className="bg-[#F8FAFC] p-4 sm:p-6 lg:p-7">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[#2A3F63]">
                <SlidersHorizontal className="h-4 w-4" />
                <p className="text-xs font-bold uppercase tracking-[0.18em]">Run the scan</p>
              </div>
              {collapseControl}
            </div>

            {slidersExpanded && (
              <div className="space-y-4">
                <StepControl
                  step="01"
                  title="Set the fee"
                  description={`Estimated AUM bill today: ${formatCurrency(annualAumFeeEstimate)} vs. ${formatCurrency(annualFlatFee)} flat.`}
                  icon={<Percent className="h-4 w-4" />}
                >
                  {sliders.advisoryFee}
                  {sliders.mutualFundExpenses}
                </StepControl>
                <StepControl
                  step="02"
                  title="Set the account size"
                  description="Use the portfolio value closest to the household assets you want advice on."
                  icon={<DollarSign className="h-4 w-4" />}
                >
                  {sliders.portfolio}
                </StepControl>
                <div className="grid gap-4 min-[560px]:grid-cols-2 lg:grid-cols-1">
                  <StepControl
                    step="03"
                    title="Growth"
                    description="Use a long-term gross return assumption, before advisory fees."
                    icon={<TrendingUp className="h-4 w-4" />}
                  >
                    {sliders.growth}
                  </StepControl>
                  <StepControl
                    step="04"
                    title="Time"
                    description="Longer compounding windows make small percentages much louder."
                    icon={<Clock3 className="h-4 w-4" />}
                  >
                    {sliders.years}
                  </StepControl>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 bg-white lg:border-l lg:border-t-0">
            <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
              <ScenarioButton
                activeScenario={activeScenario}
                label="Flat-fee ending value"
                scenario="smarter"
                tone="positive"
                value={formatCurrency(finalValueWithoutFees)}
                onHighlightScenario={onHighlightScenario}
              />
              <ScenarioButton
                activeScenario={activeScenario}
                label={`AUM ending value after ${years} years`}
                scenario="traditional"
                tone="negative"
                value={formatCurrency(finalValueWithFees)}
                onHighlightScenario={onHighlightScenario}
              />
            </div>
            {renderChart("h-[340px] sm:h-[440px] lg:h-[520px]")}
          </div>
        </div>

        <div className="border-t border-slate-100 bg-white/90 px-4 py-5 sm:px-6 lg:px-8">
          {helperNotes}
        </div>
      </ScrollReveal>
    </div>
  );
}

function FeeReceiptCalculatorExperience(props: HomeCalculatorExperienceProps) {
  const {
    annualAumFeeEstimate,
    annualFlatFee,
    collapseControl,
    disclosure,
    finalValueWithFees,
    finalValueWithoutFees,
    helperNotes,
    percentLost,
    portfolioValue,
    renderChart,
    savings,
    shareAction,
    sliders,
    slidersExpanded,
    theme,
    totalAnnualFeePercent,
    totalAssetBasedFees,
    totalFlatFees,
    years,
  } = props;

  return (
    <div className="section-shell relative z-10 pb-20 pt-10 sm:pt-14">
      <div className="mx-auto max-w-3xl text-center">
        <p className={`text-sm font-bold uppercase tracking-[0.18em] ${theme.eyebrowClassName}`}>
          Itemized fee receipt
        </p>
        <h2 className={`mt-3 text-3xl font-semibold tracking-normal sm:text-5xl ${theme.titleClassName}`}>
          Get the receipt your statement does not print.
        </h2>
        <p className={`mt-3 text-base leading-7 sm:text-lg ${theme.bodyClassName}`}>
          Every line item changes the projected total, so the fee conversation becomes concrete instead of abstract.
        </p>
      </div>

      <ScrollReveal className="mx-auto mt-7 max-w-5xl overflow-hidden border-y border-slate-300 bg-[#FFFEFB] shadow-[0_28px_90px_rgba(15,23,42,0.10)] md:rounded-[4px] md:border">
        <div className="border-b border-dashed border-slate-300 p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-sm border border-slate-300 bg-white text-red-700">
                <ReceiptText className="h-5 w-5" />
              </div>
              <div>
                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  Smarter Way Wealth
                </p>
                <h2 className="font-mono text-2xl font-semibold uppercase tracking-[0.04em] text-slate-950">
                  Fee Receipt
                </h2>
              </div>
            </div>
            <div className="font-mono text-xs uppercase tracking-[0.12em] text-slate-500 sm:text-right">
              <p>Scenario total</p>
              <p className="mt-1 text-2xl font-semibold text-red-700">
                <Odometer value={savings} prefix="$" duration={1000} />
              </p>
              <p>{percentLost.toFixed(1)}% of the flat-fee path</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div className="p-4 sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                Line items
              </p>
              {collapseControl}
            </div>

            {slidersExpanded && (
              <div>
                <ReceiptControlRow
                  label="01 / advisory fee"
                  value={`${totalAnnualFeePercent.toFixed(2)}% fee load`}
                >
                  {sliders.advisoryFee}
                  {sliders.mutualFundExpenses}
                </ReceiptControlRow>
                <ReceiptControlRow
                  label="02 / account value"
                  value={formatCurrency(portfolioValue)}
                >
                  {sliders.portfolio}
                </ReceiptControlRow>
                <ReceiptControlRow
                  label="03 / growth assumption"
                  value={`${props.annualGrowthPercent.toFixed(1)}% gross`}
                >
                  {sliders.growth}
                </ReceiptControlRow>
                <ReceiptControlRow label="04 / compounding window" value={`${years} years`}>
                  {sliders.years}
                </ReceiptControlRow>
              </div>
            )}

            <div className="mt-5 space-y-3 border-y border-dashed border-slate-300 py-4 font-mono text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500">Current annual AUM estimate</span>
                <span className="font-semibold text-slate-950">{formatCurrency(annualAumFeeEstimate)}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500">$100/mo flat fee</span>
                <span className="font-semibold text-slate-950">{formatCurrency(annualFlatFee)}</span>
              </div>
              <div className="flex items-center justify-between gap-4 text-red-700">
                <span>Projected fee drag</span>
                <span className="text-xl font-semibold">{formatCurrency(savings)}</span>
              </div>
            </div>

            <div className="mt-5">{shareAction}</div>
            {disclosure}
          </div>

          <div className="border-t border-dashed border-slate-300 lg:border-l lg:border-t-0">
            <div className="grid grid-cols-2 gap-px bg-slate-200 text-center font-mono text-xs uppercase tracking-[0.12em] text-slate-500">
              <div className="bg-[#FFFEFB] p-3">
                <p>Flat-fee ending value</p>
                <p className="mt-1 text-base font-semibold text-slate-950">{formatCurrency(finalValueWithoutFees)}</p>
              </div>
              <div className="bg-[#FFFEFB] p-3">
                <p>AUM ending value</p>
                <p className="mt-1 text-base font-semibold text-slate-950">{formatCurrency(finalValueWithFees)}</p>
              </div>
            </div>
            {renderChart("h-[360px] sm:h-[470px]")}
          </div>
        </div>

        <div className="grid gap-px bg-slate-300 font-mono text-sm sm:grid-cols-3">
          <div className="bg-[#FFFEFB] p-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">AUM fees paid</p>
            <p className="mt-1 text-lg font-semibold text-red-700">{formatCurrency(totalAssetBasedFees)}</p>
          </div>
          <div className="bg-[#FFFEFB] p-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Flat fees paid</p>
            <p className="mt-1 text-lg font-semibold text-slate-950">{formatCurrency(totalFlatFees)}</p>
          </div>
          <div className="bg-[#FFFEFB] p-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Receipt total</p>
            <p className="mt-1 text-lg font-semibold text-red-700">{formatCurrency(savings)}</p>
          </div>
        </div>

        <div className="border-t border-dashed border-slate-300 px-4 py-5 sm:px-6 lg:px-8">
          {helperNotes}
        </div>
      </ScrollReveal>
    </div>
  );
}

function FinalHomeStatCard({
  accentClassName,
  ribbon,
  tone,
  value,
}: {
  accentClassName: string;
  ribbon: string;
  tone: "blue" | "green";
  value: string;
}) {
  return (
    <article className="min-h-[126px] overflow-hidden rounded-md border border-[#DFE6EE] bg-white text-center">
      <div
        className={`flex min-h-[34px] items-center justify-center px-4 py-1.5 text-[13px] font-bold text-white ${
          tone === "blue" ? "bg-[#064B84]" : "bg-[#108843]"
        }`}
      >
        {ribbon}
      </div>
      <strong className={`mt-6 block text-[clamp(2rem,4.2vw,3.05rem)] font-bold leading-none ${accentClassName}`}>
        {value}
      </strong>
    </article>
  );
}

function FinalHomeLineChart({
  annualFeePercent,
  feeGapActive,
  finalValueWithFees,
  finalValueWithoutFees,
  savings,
  series,
  years,
}: {
  annualFeePercent: number;
  feeGapActive: boolean;
  finalValueWithFees: number;
  finalValueWithoutFees: number;
  savings: number;
  series: ProjectionYear[];
  years: number;
}) {
  const width = 1040;
  const height = 310;
  // Tight horizontal padding: Y-tick labels live INSIDE the plot (above each
  // gridline), and the line endpoint dollar amounts have moved out to the
  // chart legend, so neither side needs a wide gutter.
  const pad = { top: 28, right: 28, bottom: 44, left: 20 };
  const plotWidth = width - pad.left - pad.right;
  const plotHeight = height - pad.top - pad.bottom;
  const maxYear = Math.max(1, years, ...series.map((row) => row.year));
  const maxValue = Math.max(finalValueWithoutFees, finalValueWithFees, ...series.map((row) => row.withoutFees));
  const minValue =
    Math.min(series[0]?.withoutFees ?? finalValueWithFees, ...series.map((row) => row.withFees)) * 0.92;
  const valueRange = Math.max(1, maxValue - minValue);

  const point = (row: ProjectionYear, key: "withoutFees" | "withFees") => {
    const x = pad.left + (row.year / maxYear) * plotWidth;
    const y = pad.top + (1 - (row[key] - minValue) / valueRange) * plotHeight;
    return [x, y] as const;
  };

  const pathFor = (key: "withoutFees" | "withFees") =>
    series
      .map((row, index) => {
        const [x, y] = point(row, key);
        return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(" ");

  const gapAreaPath =
    series
      .map((row, index) => {
        const [x, y] = point(row, "withoutFees");
        return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(" ") +
    " " +
    [...series]
      .reverse()
      .map((row) => {
        const [x, y] = point(row, "withFees");
        return `L ${x.toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(" ") +
    " Z";

  // Top tick is the gridline that runs across the highest value; we render
  // labels ABOVE each line, so the topmost label needs the y inset to keep
  // it from clipping the chart's top edge.
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => {
    const value = minValue + valueRange * ratio;
    const y = pad.top + (1 - ratio) * plotHeight;
    return { value, y, ratio };
  });

  const ending = series[series.length - 1];
  const [flatEndX, flatEndY] = point(ending, "withoutFees");
  const [aumEndX, aumEndY] = point(ending, "withFees");
  const feeGapLabelWidth = 254;
  const feeGapLabelX = Math.min(
    Math.max(flatEndX - feeGapLabelWidth - 18, pad.left + 8),
    width - pad.right - feeGapLabelWidth - 4,
  );
  const feeGapLabelY = Math.min((flatEndY + aumEndY) / 2 - 30, flatEndY - 18);

  return (
    <svg
      className="block h-full min-h-[240px] w-full overflow-visible"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Line chart comparing portfolio value under a flat fee and an asset-based fee"
    >
      {yTicks.map((tick) => (
        <g key={tick.y}>
          <line
            x1={pad.left}
            x2={width - pad.right}
            y1={tick.y}
            y2={tick.y}
            stroke="#DCE4EB"
            strokeWidth="1"
          />
          <text
            x={pad.left + 4}
            y={tick.ratio === 1 ? tick.y + 14 : tick.y - 6}
            textAnchor="start"
            fill="#52657A"
            fontSize="13"
            fontWeight="600"
          >
            {formatCompactCurrency(tick.value)}
          </text>
        </g>
      ))}

      <path
        d={gapAreaPath}
        fill="#D92D20"
        opacity={feeGapActive ? "0.18" : "0"}
        className="transition-opacity duration-300"
      />
      <path d={pathFor("withFees")} fill="none" stroke="#064B84" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <path d={pathFor("withoutFees")} fill="none" stroke="#108843" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />

      <line
        x1={flatEndX}
        x2={flatEndX}
        y1={flatEndY}
        y2={aumEndY}
        stroke="#D92D20"
        strokeDasharray="5 5"
        strokeWidth="2"
        opacity={feeGapActive ? "1" : "0"}
        className="transition-opacity duration-300"
      />
      <g
        opacity={feeGapActive ? "1" : "0"}
        className="transition-opacity duration-300"
      >
        <rect
          x={feeGapLabelX}
          y={feeGapLabelY}
          width={feeGapLabelWidth}
          height="42"
          rx="21"
          fill="#D92D20"
        />
        <text
          x={feeGapLabelX + feeGapLabelWidth / 2}
          y={feeGapLabelY + 26}
          textAnchor="middle"
          fill="#FFFFFF"
          fontSize="15"
          fontWeight="800"
        >
          {formatCurrency(savings)} lost to fees
        </text>
      </g>

      <circle cx={aumEndX} cy={aumEndY} r="6" fill="#064B84" stroke="#FFFFFF" strokeWidth="3" />
      <circle cx={flatEndX} cy={flatEndY} r="6" fill="#108843" stroke="#FFFFFF" strokeWidth="3" />

      <text x={pad.left} y={height - 12} textAnchor="middle" fill="#52657A" fontSize="14" fontWeight="600">
        0
      </text>
      <text x={width - pad.right} y={height - 12} textAnchor="middle" fill="#52657A" fontSize="14" fontWeight="600">
        {maxYear}
      </text>
      <text x={width / 2} y={height - 12} textAnchor="middle" fill="#52657A" fontSize="15" fontWeight="700">
        Years
      </text>
      <title>{`Asset-based fee ${formatCurrency(finalValueWithFees)} versus flat fee ${formatCurrency(finalValueWithoutFees)} at ${annualFeePercent.toFixed(2)}%.`}</title>
    </svg>
  );
}

function FinalHomeCalculatorExperience(props: HomeCalculatorExperienceProps) {
  const {
    annualFeePercent,
    annualGrowthPercent,
    disclosure,
    finalValueWithFees,
    finalValueWithoutFees,
    percentLost,
    portfolioValue,
    series,
    shareAction,
    simpleControls,
    savings,
    totalAssetBasedFees,
    years,
  } = props;
  const calculatorRef = useRef<HTMLDivElement | null>(null);
  const [feeGapActive, setFeeGapActive] = useState(false);
  const [showStickyResult, setShowStickyResult] = useState(false);
  const smarterWayParams = new URLSearchParams({
    source: "youarepayingtoomuch",
    savings: Math.round(savings).toString(),
    portfolio: Math.round(portfolioValue).toString(),
    years: years.toString(),
    fee: annualFeePercent.toFixed(2),
    growth: annualGrowthPercent.toFixed(2),
  });
  const smarterWayHref = `https://smarterwaywealth.com/?${smarterWayParams.toString()}`;

  useEffect(() => {
    const updateStickyResult = () => {
      const calculator = calculatorRef.current;

      if (!calculator) {
        return;
      }

      const rect = calculator.getBoundingClientRect();
      const navOffset = window.innerWidth >= 768 ? 56 : 62;
      const nextVisible = rect.top <= navOffset && rect.bottom > navOffset + 220;

      setShowStickyResult((current) => (current === nextVisible ? current : nextVisible));
    };

    updateStickyResult();
    window.addEventListener("scroll", updateStickyResult, { passive: true });
    window.addEventListener("resize", updateStickyResult);

    return () => {
      window.removeEventListener("scroll", updateStickyResult);
      window.removeEventListener("resize", updateStickyResult);
    };
  }, []);

  return (
    <div ref={calculatorRef} className="section-shell relative z-10 pb-16 pt-10 sm:pt-12">
      <div
        aria-hidden={!showStickyResult}
        className={`fixed inset-x-0 top-[58px] z-40 border-b border-[#D5E0EA] bg-white/95 px-4 py-2 shadow-[0_12px_34px_rgba(17,33,52,0.12)] backdrop-blur transition duration-300 md:top-[52px] ${
          showStickyResult ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-4 opacity-0"
        }`}
      >
        <div className="mx-auto flex max-w-[1380px] items-center justify-between gap-3 text-sm font-bold text-[#062B43]">
          <span className="inline-flex shrink-0 items-baseline gap-2">
            <span className="text-[11px] uppercase tracking-[0.14em] text-[#52657A] sm:text-xs">Savings</span>
            <span className="text-lg leading-none text-[#108843] sm:text-2xl">{formatCurrency(savings)}</span>
          </span>
          <span className="flex min-w-0 flex-wrap items-center justify-end gap-1.5 text-[11px] text-[#41556C] sm:gap-2 sm:text-xs">
            <span className="rounded-full border border-[#D5E0EA] bg-[#F7FAFC] px-2 py-0.5 sm:px-3 sm:py-1">
              {years}<span className="hidden sm:inline"> years</span><span className="sm:hidden"> yrs</span>
            </span>
            <span className="rounded-full border border-[#D5E0EA] bg-[#F7FAFC] px-2 py-0.5 sm:px-3 sm:py-1">
              {annualFeePercent.toFixed(2)}%<span className="hidden sm:inline"> asset-based</span> fee
            </span>
            <span className="rounded-full border border-[#BFE3CC] bg-[#F2FBF5] px-2 py-0.5 text-[#108843] sm:px-3 sm:py-1">
              $100/mo<span className="hidden sm:inline"> flat fee</span>
            </span>
          </span>
        </div>
      </div>
      <div className="mx-auto mb-4 max-w-3xl text-center [&_p]:mt-0">
        {disclosure}
      </div>
      <ScrollReveal className="mx-auto max-w-[1380px] overflow-hidden rounded-md border border-[#CFD9E3] bg-white shadow-[0_18px_45px_rgba(17,33,52,0.08)]">
        <header className="flex flex-col gap-4 border-b border-[#DFE6EE] bg-white/65 px-6 py-5 text-[#062B43] backdrop-blur sm:px-10 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-[clamp(2rem,3.25vw,3.35rem)] font-bold leading-none tracking-normal">
              Fee Drag Calculator
            </h2>
            <p className="mt-3 text-base text-[#42556C] sm:text-lg">Keep more of what you earn.</p>
          </div>
          <div className="max-w-[360px] border-l-2 border-[#108843] pl-4 text-sm font-semibold leading-relaxed text-[#41556C]">
            Adjust the assumptions below. The comparison, chart, and summary update instantly.
          </div>
        </header>

        <section className="relative grid gap-5 px-4 pt-5 sm:px-7 md:grid-cols-2 md:gap-8" aria-label="Ending value comparison">
          <FinalHomeStatCard
            ribbon={`With asset-based fees (${annualFeePercent.toFixed(2)}%)`}
            value={formatCurrency(finalValueWithFees)}
            tone="blue"
            accentClassName="text-[#064B84]"
          />
          <button
            type="button"
            onMouseEnter={() => setFeeGapActive(true)}
            onMouseLeave={() => setFeeGapActive(false)}
            onFocus={() => setFeeGapActive(true)}
            onBlur={() => setFeeGapActive(false)}
            onClick={() => setFeeGapActive(true)}
            className="vs-pulse-halo absolute left-1/2 top-[88px] z-10 hidden h-14 w-14 -translate-x-1/2 place-items-center rounded-full bg-[#062B43] text-base font-extrabold text-white transition hover:scale-105 hover:bg-[#0B3756] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D92D20] md:grid"
            aria-label="Show fee gap on chart"
          >
            VS
          </button>
          <button
            type="button"
            onClick={() => setFeeGapActive((prev) => !prev)}
            className="vs-pulse-halo mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#062B43] text-sm font-extrabold text-white md:hidden"
            aria-label="Show fee gap on chart"
            aria-pressed={feeGapActive}
          >
            VS
          </button>
          <FinalHomeStatCard
            ribbon="Flat monthly fee ($100/mo)"
            value={formatCurrency(finalValueWithoutFees)}
            tone="green"
            accentClassName="text-[#108843]"
          />
        </section>

        <section className="mx-4 mt-3 rounded-md border border-[#DFE6EE] bg-white px-4 py-3 sm:mx-7 sm:px-5" aria-label="Portfolio value over time">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <h3 className="text-base font-bold tracking-normal text-slate-950">Portfolio value over time</h3>
            <div className="flex flex-wrap gap-x-6 gap-y-3 text-xs font-semibold">
              <div className="flex flex-col gap-1">
                <span className="inline-flex items-center gap-2 text-[#41556C]">
                  <span className="h-[3px] w-4 rounded-full bg-[#064B84]" />
                  With asset-based fee ({annualFeePercent.toFixed(2)}%)
                </span>
                <span className="pl-6 text-[15px] font-bold leading-none tabular-nums text-[#064B84]">
                  {formatCurrency(finalValueWithFees)}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="inline-flex items-center gap-2 text-[#41556C]">
                  <span className="h-[3px] w-4 rounded-full bg-[#108843]" />
                  Flat fee
                </span>
                <span className="pl-6 text-[15px] font-bold leading-none tabular-nums text-[#108843]">
                  {formatCurrency(finalValueWithoutFees)}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-1 h-[255px] sm:h-[305px]">
            <FinalHomeLineChart
              annualFeePercent={annualFeePercent}
              feeGapActive={feeGapActive}
              finalValueWithFees={finalValueWithFees}
              finalValueWithoutFees={finalValueWithoutFees}
              savings={savings}
              series={series}
              years={years}
            />
          </div>
        </section>

        <section className="mx-4 mt-4 grid overflow-hidden rounded-md border border-[#DFE6EE] bg-white sm:mx-7 md:grid-cols-2 xl:grid-cols-4" aria-label="Calculator inputs">
          <div className="border-b border-[#DFE6EE] p-4 md:border-r xl:border-b-0">{simpleControls.portfolio}</div>
          <div className="border-b border-[#DFE6EE] p-4 xl:border-b-0 xl:border-r">{simpleControls.years}</div>
          <div className="border-b border-[#DFE6EE] p-4 md:border-r md:border-b-0">{simpleControls.growth}</div>
          <div className="p-4">{simpleControls.advisoryFee}</div>
        </section>

        <section className="mx-4 mt-4 grid overflow-hidden rounded-md border border-[#DFE6EE] bg-white sm:mx-7 md:grid-cols-2" aria-label="Fee summary">
          <article className="flex min-h-[88px] items-center justify-center gap-5 border-b border-[#DFE6EE] p-5 md:border-b-0 md:border-r">
            <Coins className="h-12 w-12 text-[#062B43]" strokeWidth={1.8} />
            <div>
              <p className="text-sm text-[#41556C]">Fees paid</p>
              <p className="mt-1 text-[clamp(1.8rem,3vw,2.45rem)] font-bold leading-none text-[#108843]">
                {formatCurrency(totalAssetBasedFees)}
              </p>
            </div>
          </article>
          <article className="flex min-h-[88px] items-center justify-center gap-5 p-5">
            <PieChart className="h-12 w-12 text-[#062B43]" strokeWidth={1.8} />
            <div>
              <p className="text-sm text-[#41556C]">Wealth lost</p>
              <p className="mt-1 text-[clamp(1.8rem,3vw,2.45rem)] font-bold leading-none text-[#108843]">
                {percentLost.toFixed(1)}%
              </p>
            </div>
          </article>
        </section>

        <div className="mx-4 mt-4 grid gap-3 sm:mx-7 sm:grid-cols-[minmax(0,1fr)_auto]">
          <a
            href={smarterWayHref}
            className="flex min-h-[46px] items-center justify-center rounded-md bg-[#108843] px-4 text-center text-base font-bold !text-white no-underline transition hover:bg-[#0B7639]"
          >
            Continue to Smarter Way Wealth.
          </a>
          <div className="flex min-h-[46px] items-stretch justify-center">
            {shareAction}
          </div>
        </div>
        <p className="px-4 pb-5 pt-4 text-center text-xs leading-relaxed text-[#667587] sm:px-7">
          This calculator is for illustrative purposes only and does not represent actual performance.
          Values are nominal and before taxes.
        </p>
      </ScrollReveal>
    </div>
  );
}

function AdvisorCalculatorExperience(props: HomeCalculatorExperienceProps) {
  const {
    activeScenario,
    collapseControl,
    disclosure,
    finalValueWithFees,
    finalValueWithoutFees,
    helperNotes,
    onHighlightScenario,
    percentLost,
    renderChart,
    savings,
    shareAction,
    sliders,
    slidersExpanded,
    theme,
    totalAnnualFeePercent,
    years,
  } = props;

  return (
    <div className="section-shell relative z-10 pb-20 pt-10 sm:pt-14">
      <div className="grid gap-5 text-left lg:grid-cols-[minmax(0,0.9fr)_minmax(320px,0.55fr)] lg:items-end">
        <div>
          <h2 className={`max-w-3xl text-3xl font-semibold tracking-normal sm:text-5xl ${theme.titleClassName}`}>
            See how much you could save
          </h2>
          <p className={`mt-3 max-w-2xl text-base leading-7 sm:text-lg ${theme.bodyClassName}`}>
            Compare outcomes like a planning review: assumptions on the right, fee drag on the chart, ending values up front.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 rounded-[24px] border border-white/15 bg-white/10 p-4 backdrop-blur">
          <MiniStat
            label="Projected kept"
            value={<Odometer value={savings} prefix="$" duration={1000} />}
            className="text-emerald-100"
          />
          <MiniStat label="Fee load" value={`${totalAnnualFeePercent.toFixed(2)}%`} className="text-white" />
          <MiniStat label="Time horizon" value={`${years} yrs`} className="text-white" />
          <MiniStat label="Portfolio lost" value={`${percentLost.toFixed(1)}%`} className="text-red-100" />
        </div>
      </div>

      <ScrollReveal className="mt-7 overflow-hidden rounded-[28px] border border-white/15 bg-[#062417]/90 shadow-[0_28px_110px_rgba(0,0,0,0.42)] ring-1 ring-emerald-300/10">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="bg-[#061B12]">
            <div className="grid gap-3 border-b border-white/10 p-4 sm:grid-cols-2">
              <ScenarioButton
                activeScenario={activeScenario}
                label="Flat-fee model"
                scenario="smarter"
                tone="positive"
                value={formatCurrency(finalValueWithoutFees)}
                onHighlightScenario={onHighlightScenario}
              />
              <ScenarioButton
                activeScenario={activeScenario}
                label="Asset-based model"
                scenario="traditional"
                tone="negative"
                value={formatCurrency(finalValueWithFees)}
                onHighlightScenario={onHighlightScenario}
              />
            </div>
            {renderChart("h-[360px] sm:h-[520px] lg:h-[590px]")}
          </div>

          <aside className="border-t border-white/10 bg-[#082A1A] p-4 sm:p-5 lg:border-l lg:border-t-0">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-emerald-100">
                <ShieldCheck className="h-4 w-4" />
                <p className="text-xs font-bold uppercase tracking-[0.18em]">Assumptions</p>
              </div>
              {collapseControl}
            </div>

            {slidersExpanded && (
              <div className="space-y-4">
                <ConsoleControlGroup>
                  {sliders.advisoryFee}
                  {sliders.mutualFundExpenses}
                </ConsoleControlGroup>
                <ConsoleControlGroup>
                  {sliders.portfolio}
                  {sliders.growth}
                  {sliders.years}
                </ConsoleControlGroup>
              </div>
            )}

            <div className="mt-5">{shareAction}</div>
            {disclosure}
          </aside>
        </div>

        <div className="border-t border-white/10 bg-[#062417] px-4 py-5 sm:px-6 lg:px-8">
          {helperNotes}
        </div>
      </ScrollReveal>
    </div>
  );
}

export function HomeCalculatorExperience(props: HomeCalculatorExperienceProps) {
  if (props.layout === "final-c") {
    return <FinalHomeCalculatorExperience {...props} />;
  }

  if (props.layout === "receipt") {
    return <FeeReceiptCalculatorExperience {...props} />;
  }

  if (props.layout === "advisor") {
    return <AdvisorCalculatorExperience {...props} />;
  }

  return <DirectMailCalculatorExperience {...props} />;
}
