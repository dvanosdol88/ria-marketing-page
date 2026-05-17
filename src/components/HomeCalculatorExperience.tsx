"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Clock3,
  DollarSign,
  Percent,
  ReceiptText,
  ScanLine,
  ShieldCheck,
  SlidersHorizontal,
  TrendingUp,
} from "lucide-react";
import { formatCurrency, formatCurrencyFloored } from "@/lib/format";
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
    <article className="min-h-[104px] overflow-hidden rounded-md border border-[#DFE6EE] bg-white text-center">
      <div
        className={`flex min-h-[34px] items-center justify-center px-4 py-1.5 text-[13px] font-bold text-white ${
          tone === "blue" ? "bg-[#064B84]" : "bg-[#108843]"
        }`}
      >
        {ribbon}
      </div>
      <strong className={`mt-4 block text-[clamp(1.6rem,3.5vw,2.5rem)] font-bold leading-none ${accentClassName}`}>
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
  // Measured-pixel rendering: a ResizeObserver tracks the container's actual
  // width/height and we redraw the SVG against those live dimensions every
  // time the layout changes (viewport resize, slider edit reflow, etc.).
  // This is what lets the chart fill the card edge-to-edge on every device
  // instead of being letterboxed inside a fixed viewBox.
  const containerRef = useRef<HTMLDivElement | null>(null);
  // Sensible defaults keep SSR-rendered SVG and first client paint matching
  // — the ResizeObserver overwrites these on mount within one frame.
  const [size, setSize] = useState<{ w: number; h: number }>({ w: 1040, h: 305 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width > 40 && rect.height > 40) {
      setSize({ w: rect.width, h: rect.height });
    }
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      if (width > 40 && height > 40) {
        setSize({ w: width, h: height });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { w: width, h: height } = size;
  // Tight padding: Y-tick labels live inside the plot, x-axis labels live in
  // the bottom strip, and there is no right-side endpoint annotation anymore.
  const pad = { top: 12, right: 10, bottom: 30, left: 10 };
  const plotWidth = Math.max(1, width - pad.left - pad.right);
  const plotHeight = Math.max(1, height - pad.top - pad.bottom);
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

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => {
    const value = minValue + valueRange * ratio;
    const y = pad.top + (1 - ratio) * plotHeight;
    return { value, y, ratio };
  });

  const ending = series[series.length - 1];
  const [flatEndX, flatEndY] = point(ending, "withoutFees");
  const [aumEndX, aumEndY] = point(ending, "withFees");
  // Savings pill — clamped to keep it inside the plot at narrow widths.
  const desiredPillWidth = 229;
  const feeGapLabelWidth = Math.min(desiredPillWidth, Math.max(126, plotWidth - 16));
  const feeGapLabelX = Math.min(
    Math.max(flatEndX - feeGapLabelWidth - 18, pad.left + 8),
    pad.left + plotWidth - feeGapLabelWidth - 4,
  );
  const feeGapLabelY = Math.min((flatEndY + aumEndY) / 2 - 27, flatEndY - 16);

  return (
    <div ref={containerRef} className="block h-full w-full">
      <svg
        className="block overflow-visible"
        width={width}
        height={height}
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
              y={tick.ratio === 1 || tick.ratio === 0 ? tick.y + 14 : tick.y - 6}
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
            height="38"
            rx="19"
            fill="#D92D20"
          />
          <text
            x={feeGapLabelX + feeGapLabelWidth / 2}
            y={feeGapLabelY + 26}
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="19"
            fontWeight="800"
          >
            {formatCurrencyFloored(savings)} lost to fees
          </text>
        </g>

        <circle cx={aumEndX} cy={aumEndY} r="6" fill="#064B84" stroke="#FFFFFF" strokeWidth="3" />
        <circle cx={flatEndX} cy={flatEndY} r="6" fill="#108843" stroke="#FFFFFF" strokeWidth="3" />

        <text x={pad.left} y={height - 8} textAnchor="middle" fill="#52657A" fontSize="14" fontWeight="600">
          0
        </text>
        <text x={width - pad.right} y={height - 8} textAnchor="middle" fill="#52657A" fontSize="14" fontWeight="600">
          {maxYear}
        </text>
        <text x={width / 2} y={height - 8} textAnchor="middle" fill="#52657A" fontSize="15" fontWeight="700">
          Years
        </text>
        <title>{`Asset-based fee ${formatCurrency(finalValueWithFees)} versus flat fee ${formatCurrency(finalValueWithoutFees)} at ${annualFeePercent.toFixed(2)}%.`}</title>
      </svg>
    </div>
  );
}

/**
 * Two parallel proportional bars under the line chart that surface the
 * same two ending values shown in the big stat cards above. The flat-fee
 * (green) bar always renders at 100% width — it's the larger value — and
 * the asset-based (blue) bar renders at its proportional share of that
 * total. When the VS button is engaged (`feeGapActive`), a red overlay
 * fades in on top of the green bar covering only the differential
 * region, plus a caption appears with the dollar/percentage gap.
 *
 * No new state — `feeGapActive` is shared with the line chart so a
 * single VS press animates both visuals in unison.
 */
function ComparisonBars({
  finalValueWithFees,
  finalValueWithoutFees,
  savings,
  percentLost,
  feeGapActive,
}: {
  finalValueWithFees: number;
  finalValueWithoutFees: number;
  savings: number;
  percentLost: number;
  feeGapActive: boolean;
}) {
  // The flat-fee value is always >= the asset-based value, so we
  // normalize the bar widths against finalValueWithoutFees.
  const denominator = Math.max(finalValueWithoutFees, 1);
  const blueWidthPct = Math.max(0, Math.min(100, (finalValueWithFees / denominator) * 100));
  const redWidthPct = Math.max(0, Math.min(100, 100 - blueWidthPct));

  // Bars use the same px-1.5 sm:px-2 outer padding as the chart card
  // above so they visually align edge-to-edge with the line chart.
  return (
    <section
      className="mx-4 mt-3 rounded-md border border-[#DFE6EE] bg-white px-3 py-3 sm:mx-7 sm:px-4 sm:py-4"
      aria-label="Asset-based vs flat fee ending value comparison"
    >
      {/* Caption sits directly above the bars and fades in with the red
         differential overlay. Reframes the gap as a percentage of wealth
         surrendered to asset-based fees. */}
      <p
        className={`mb-1.5 text-center text-base leading-tight transition-opacity duration-300 ease-out sm:text-lg ${
          feeGapActive ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden={!feeGapActive}
      >
        <span className="font-bold text-[#D92D20]">
          {percentLost.toFixed(1)}%
        </span>
        <span className="font-semibold text-[#41556C]">
          {" "}of wealth lost to asset-based fees
        </span>
      </p>

      {/* Stacked thick bars, abutting with no gap.
         Top: asset-based (blue) — when VS active, the missing-from-100% tail
              fills with red and shows the percent-lost label, since that gap
              IS the magnitude lost to fees.
         Bottom: flat fee (green) — always solid full-width.
         Per-bar labels removed; the stat cards above already display these numbers. */}
      <div
        className="overflow-hidden rounded-md"
        role="img"
        aria-label={`Asset-based fee ending value ${formatCurrencyFloored(finalValueWithFees)} versus flat $100/month fee ending value ${formatCurrencyFloored(finalValueWithoutFees)}, a ${percentLost.toFixed(1)} percent gap.`}
      >
        {/* Blue bar — asset-based ending value. White dollar label sits at the
           right edge of the blue fill. Red tail + % label fade in with VS. */}
        <div className="relative h-9 w-full bg-[#F0F4F8] sm:h-10">
          <div
            className="absolute inset-y-0 left-0 flex items-center justify-end bg-[#064B84] pr-3 transition-[width] duration-500 ease-out sm:pr-4"
            style={{ width: `${blueWidthPct}%` }}
          >
            <span className="text-xs font-extrabold leading-none text-white tabular-nums sm:text-sm">
              {formatCurrencyFloored(finalValueWithFees)}
            </span>
          </div>
          <div
            className={`absolute inset-y-0 flex items-center justify-center bg-[#D92D20] transition-opacity duration-300 ease-out ${
              feeGapActive ? "opacity-100" : "opacity-0"
            }`}
            style={{
              left: `${blueWidthPct}%`,
              width: `${redWidthPct}%`,
            }}
            aria-hidden={!feeGapActive}
          >
            <span className="text-lg font-extrabold leading-none text-white sm:text-2xl">
              {percentLost.toFixed(1)}%
            </span>
          </div>
        </div>
        {/* Green bar — flat-fee ending value, always solid full-width.
           White dollar label sits at the right edge of the green fill. */}
        <div className="flex h-9 w-full items-center justify-end bg-[#108843] pr-3 sm:h-10 sm:pr-4">
          <span className="text-xs font-extrabold leading-none text-white tabular-nums sm:text-sm">
            {formatCurrencyFloored(finalValueWithoutFees)}
          </span>
        </div>
      </div>
    </section>
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
  const smarterWayHref = `https://smarterwaywealth.com/save?${smarterWayParams.toString()}`;

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
            <span className="text-lg leading-none text-[#108843] sm:text-2xl">{formatCurrencyFloored(savings)}</span>
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
        <header className="relative flex flex-col gap-3 border-b border-[#DFE6EE] bg-white/65 px-6 py-4 text-[#062B43] backdrop-blur sm:px-10">
          <div className="text-center">
            <h2 className="text-[clamp(1.75rem,2.6vw,2.75rem)] font-bold leading-tight tracking-normal">
              Your portfolio value over time
            </h2>
            <p className="mt-2 text-lg text-[#42556C] sm:text-xl">
              Compare your <span className="font-semibold text-[#064B84]">asset-based fees</span> with a flat <span className="font-semibold text-[#108843]">$100/month</span>.
            </p>
          </div>
          <div className="shrink-0 self-center whitespace-nowrap border-l-2 border-[#108843] pl-4 text-base font-semibold uppercase leading-tight tracking-tight text-[#108843] sm:text-xl lg:absolute lg:right-10 lg:top-1/2 lg:-translate-y-1/2 lg:self-auto">
            Avoid Fee Drag!
          </div>
        </header>

        <section className="relative grid gap-3 px-4 pt-3 sm:px-7 md:grid-cols-2 md:gap-8" aria-label="Ending value comparison">
          <FinalHomeStatCard
            ribbon={`Paying asset-based fees (${annualFeePercent.toFixed(2)}%)`}
            value={formatCurrencyFloored(finalValueWithFees)}
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
            className="vs-pulse-halo absolute left-1/2 top-[72px] z-10 hidden h-14 w-14 -translate-x-1/2 place-items-center rounded-full bg-[#062B43] text-base font-extrabold text-white transition hover:scale-105 hover:bg-[#0B3756] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D92D20] md:grid"
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
            ribbon="Paying flat monthly fee ($100/mo)"
            value={formatCurrencyFloored(finalValueWithoutFees)}
            tone="green"
            accentClassName="text-[#108843]"
          />
        </section>

        <section className="mx-4 mt-3 rounded-md border border-[#DFE6EE] bg-white px-1.5 py-2 sm:mx-7 sm:px-2" aria-label="Portfolio value over time">
          <div className="h-[255px] w-full sm:h-[305px]">
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

        <ComparisonBars
          finalValueWithFees={finalValueWithFees}
          finalValueWithoutFees={finalValueWithoutFees}
          savings={savings}
          percentLost={percentLost}
          feeGapActive={feeGapActive}
        />

        <section className="mx-4 mt-4 grid overflow-hidden rounded-md border border-[#DFE6EE] bg-white sm:mx-7 md:grid-cols-2 xl:grid-cols-4" aria-label="Calculator inputs">
          <div className="border-b border-[#DFE6EE] p-3 md:border-r xl:border-b-0">{simpleControls.portfolio}</div>
          <div className="border-b border-[#DFE6EE] p-3 xl:border-b-0 xl:border-r">{simpleControls.years}</div>
          <div className="border-b border-[#DFE6EE] p-3 md:border-r md:border-b-0">{simpleControls.growth}</div>
          <div className="p-3">{simpleControls.advisoryFee}</div>
        </section>

        <div className="mx-4 mt-4 grid gap-3 sm:mx-7 sm:grid-cols-[minmax(0,1fr)_auto]">
          <a
            href={smarterWayHref}
            className="flex min-h-[46px] items-center justify-center rounded-md bg-[#108843] px-4 text-center text-base font-bold !text-white no-underline transition hover:bg-[#0B7639]"
          >
            See more on YOUR savings at smarterwaywealth.com/save
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
