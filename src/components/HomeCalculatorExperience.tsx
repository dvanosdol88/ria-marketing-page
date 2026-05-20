"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Clock3,
  DollarSign,
  ExternalLink,
  Percent,
  ReceiptText,
  ScanLine,
  ShieldCheck,
  SlidersHorizontal,
  Table2,
  TrendingUp,
} from "lucide-react";
import { formatCurrency, formatCurrencyFloored } from "@/lib/format";
import type {
  HomeCalculatorTheme,
  HomeCalculatorLayout,
} from "@/config/homeMarketingVariants";
import type { ProjectionYear } from "@/lib/feeProjection";
import { Odometer, RollingCurrencyOdometer } from "@/components/Odometer";
import { ScrollReveal } from "@/components/ScrollReveal";
import { fitCta } from "@/config/fitCtaConfig";

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

type CalculatorAssumptionPatch = {
  annualFeePercent?: number;
  annualGrowthPercent?: number;
  portfolioValue?: number;
  years?: number;
};

const FEE_GAP_HINT_INITIAL_DELAY_MS = 1200;
const FEE_GAP_HINT_VISIBLE_MS = 3000;
const FEE_GAP_HINT_REDUCED_VISIBLE_MS = 1400;
const FEE_GAP_HINT_BAR_DELAY_MS = 450;
const FEE_GAP_HINT_REPEAT_MS = 10000;
const FEE_GAP_HINT_MAX_PLAYS = 5;

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
  assumptionsCustomized: boolean;
  onHighlightScenario: (scenario: Scenario) => void;
  onAssumptionChange: (patch: CalculatorAssumptionPatch) => void;
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

function formatHeaderInputValue(value: number, decimals: number, useGrouping: boolean) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
    useGrouping,
  }).format(value);
}

function parseHeaderInputValue(value: string) {
  const parsed = Number.parseFloat(value.replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function clampHeaderInputValue(value: number, min: number, max: number, decimals: number) {
  const clamped = Math.min(max, Math.max(min, value));
  const multiplier = 10 ** decimals;
  return Math.round(clamped * multiplier) / multiplier;
}

function FinalHeaderNumberInput({
  ariaLabel,
  className = "",
  decimals,
  inputMode,
  max,
  min,
  onChange,
  prefix,
  suffix,
  useGrouping = false,
  value,
}: {
  ariaLabel: string;
  className?: string;
  decimals: number;
  inputMode: "decimal" | "numeric";
  max: number;
  min: number;
  onChange: (value: number) => void;
  prefix?: string;
  suffix?: string;
  useGrouping?: boolean;
  value: number;
}) {
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState(() => formatHeaderInputValue(value, decimals, useGrouping));

  useEffect(() => {
    if (!focused) {
      setDraft(formatHeaderInputValue(value, decimals, useGrouping));
    }
  }, [decimals, focused, useGrouping, value]);

  const normalize = (raw: number) => clampHeaderInputValue(raw, min, max, decimals);

  const commitDraft = (text: string) => {
    const parsed = parseHeaderInputValue(text);
    if (parsed === null) {
      setDraft(formatHeaderInputValue(value, decimals, useGrouping));
      return;
    }

    const nextValue = normalize(parsed);
    onChange(nextValue);
    setDraft(formatHeaderInputValue(nextValue, decimals, useGrouping));
  };

  const handleDraftChange = (nextDraft: string) => {
    setDraft(nextDraft);
    const parsed = parseHeaderInputValue(nextDraft);
    if (parsed !== null && parsed >= min && parsed <= max) {
      onChange(normalize(parsed));
    }
  };

  const inputWidth = `${Math.min(14, Math.max(3.5, draft.length + 0.5))}ch`;

  return (
    <span
      className={`inline-flex max-w-full items-baseline justify-center border-b border-[#D7E0E8] text-inherit transition focus-within:border-[#108843] focus-within:outline focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-[#108843] hover:border-[#AEB8C3] ${className}`}
    >
      {prefix && <span aria-hidden="true">{prefix}</span>}
      <input
        aria-label={ariaLabel}
        type="text"
        inputMode={inputMode}
        autoComplete="off"
        spellCheck={false}
        value={draft}
        onBlur={(event) => {
          setFocused(false);
          commitDraft(event.currentTarget.value);
        }}
        onChange={(event) => handleDraftChange(event.target.value)}
        onFocus={(event) => {
          setFocused(true);
          requestAnimationFrame(() => event.target.select());
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            commitDraft(event.currentTarget.value);
            event.currentTarget.blur();
          } else if (event.key === "Escape") {
            event.preventDefault();
            setDraft(formatHeaderInputValue(value, decimals, useGrouping));
            event.currentTarget.blur();
          }
        }}
        className="min-w-0 border-0 bg-transparent p-0 text-center font-[inherit] leading-[inherit] text-inherit outline-none tabular-nums"
        style={{ width: inputWidth }}
      />
      {suffix && <span aria-hidden="true">{suffix}</span>}
    </span>
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
  value: ReactNode;
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
  chartActive,
  chartHintActive,
  chartPinned,
  finalValueWithFees,
  finalValueWithoutFees,
  savings,
  series,
  years,
  onGapEnter,
  onGapLeave,
  onGapToggle,
}: {
  annualFeePercent: number;
  chartActive: boolean;
  chartHintActive: boolean;
  chartPinned: boolean;
  finalValueWithFees: number;
  finalValueWithoutFees: number;
  savings: number;
  series: ProjectionYear[];
  years: number;
  onGapEnter: () => void;
  onGapLeave: () => void;
  onGapToggle: () => void;
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
  const desiredPillWidth = 217;
  const feeGapLabelWidth = Math.min(desiredPillWidth, Math.max(120, plotWidth - 16));
  const feeGapLabelX = Math.min(
    Math.max(flatEndX - feeGapLabelWidth - 18, pad.left + 8),
    pad.left + plotWidth - feeGapLabelWidth - 4,
  );
  const feeGapLabelY = Math.min((flatEndY + aumEndY) / 2 - 26, flatEndY - 16);
  const chartHintOnly = chartHintActive && !chartActive;

  return (
    <div ref={containerRef} className="block h-full w-full">
      <svg
        className="block overflow-visible"
        width={width}
        height={height}
        role="img"
        aria-label="Line chart comparing portfolio value under a flat fee and an asset-based fee"
      >
        <defs>
          <clipPath id="final-home-line-gap-hint-clip">
            <path d={gapAreaPath} />
          </clipPath>
          <linearGradient id="final-home-line-gap-hint-wave" x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" stopColor="#D92D20" stopOpacity="0" />
            <stop offset="48%" stopColor="#D92D20" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#D92D20" stopOpacity="0" />
          </linearGradient>
        </defs>
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

        {chartHintOnly ? (
          <g
            clipPath="url(#final-home-line-gap-hint-clip)"
            className="fee-gap-hint-layer pointer-events-none"
            aria-hidden="true"
          >
            <path d={gapAreaPath} fill="#D92D20" opacity="0.07" />
            <rect
              className="fee-gap-wave"
              x={pad.left - plotWidth}
              y={pad.top}
              width={plotWidth * 0.8}
              height={plotHeight}
              fill="url(#final-home-line-gap-hint-wave)"
            />
          </g>
        ) : null}
        <path
          d={gapAreaPath}
          fill="#D92D20"
          opacity={chartActive ? "0.18" : "0"}
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
          opacity={chartActive ? "1" : "0"}
          className="transition-opacity duration-300"
        />
        <g
          opacity={chartActive ? "1" : "0"}
          className="transition-opacity duration-300"
          data-gap-toggle="line"
          role="button"
          tabIndex={chartActive ? 0 : -1}
          aria-label={chartPinned ? "Hide line chart fee gap" : "Show line chart fee gap"}
          aria-pressed={chartPinned}
          style={{ cursor: chartActive ? "pointer" : "default", pointerEvents: chartActive ? "all" : "none" }}
          onPointerDown={(event) => {
            event.preventDefault();
            onGapToggle();
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onGapToggle();
            }
          }}
        >
          <rect
            x={feeGapLabelX}
            y={feeGapLabelY}
            width={feeGapLabelWidth}
            height="36"
            rx="18"
            fill="#D92D20"
          />
          <text
            x={feeGapLabelX + feeGapLabelWidth / 2}
            y={feeGapLabelY + 25}
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="18"
            fontWeight="800"
          >
            {formatCurrencyFloored(savings)} lost to fees
          </text>
        </g>

        {/* Invisible hit path traced over the differential wedge.
           Hover previews the gap; click/tap pins it independently of VS. */}
        <path
          d={gapAreaPath}
          fill="transparent"
          style={{ pointerEvents: "all", cursor: "pointer" }}
          role="button"
          tabIndex={0}
          aria-label={chartPinned ? "Hide line chart fee gap" : "Show line chart fee gap"}
          aria-pressed={chartPinned}
          onMouseEnter={onGapEnter}
          onMouseLeave={onGapLeave}
          onPointerDown={(event) => {
            event.preventDefault();
            onGapToggle();
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onGapToggle();
            }
          }}
        />

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
 * total. When `barActive` is true (hover, mobile tap, or VS pin), a red
 * overlay fades in on top of the green bar covering only the differential
 * region, plus a caption appears with the dollar/percentage gap.
 */
function ComparisonBars({
  finalValueWithFees,
  finalValueWithoutFees,
  savings,
  percentLost,
  barActive,
  barHintActive,
  barPinned,
  onGapEnter,
  onGapLeave,
  onGapToggle,
}: {
  finalValueWithFees: number;
  finalValueWithoutFees: number;
  savings: number;
  percentLost: number;
  barActive: boolean;
  barHintActive: boolean;
  barPinned: boolean;
  onGapEnter: () => void;
  onGapLeave: () => void;
  onGapToggle: () => void;
}) {
  // The flat-fee value is always >= the asset-based value, so we
  // normalize the bar widths against finalValueWithoutFees.
  const denominator = Math.max(finalValueWithoutFees, 1);
  const blueWidthPct = Math.max(0, Math.min(100, (finalValueWithFees / denominator) * 100));
  const redWidthPct = Math.max(0, Math.min(100, 100 - blueWidthPct));
  const barHintOnly = barHintActive && !barActive;

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
          barActive ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden={!barActive}
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
          {barHintOnly ? (
            <div
              className="fee-gap-hint-layer pointer-events-none absolute inset-y-0 overflow-hidden"
              style={{
                left: `${blueWidthPct}%`,
                width: `${redWidthPct}%`,
                backgroundColor: "rgba(217, 45, 32, 0.08)",
              }}
              aria-hidden="true"
            >
              <span
                className="fee-gap-bar-wave absolute inset-y-0 left-0 w-2/3"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(217,45,32,0) 0%, rgba(217,45,32,0.28) 48%, rgba(217,45,32,0) 100%)",
                }}
              />
            </div>
          ) : null}
          <div
            className={`absolute inset-y-0 flex items-center justify-center bg-[#D92D20] transition-opacity duration-300 ease-out ${
              barActive ? "opacity-100" : "opacity-0"
            }`}
            style={{
              left: `${blueWidthPct}%`,
              width: `${redWidthPct}%`,
              cursor: "pointer",
            }}
            role="button"
            tabIndex={0}
            aria-label={barPinned ? "Hide bar chart fee gap" : "Show bar chart fee gap"}
            aria-pressed={barPinned}
            onMouseEnter={onGapEnter}
            onMouseLeave={onGapLeave}
            onPointerDown={(event) => {
              event.preventDefault();
              onGapToggle();
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onGapToggle();
              }
            }}
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

function SeeOurMathBento({
  annualFlatFee,
  annualGrowthPercent,
  portfolioValue,
  savings,
  series,
  totalAnnualFeePercent,
  totalAssetBasedFees,
  totalFlatFees,
  years,
}: {
  annualFlatFee: number;
  annualGrowthPercent: number;
  portfolioValue: number;
  savings: number;
  series: ProjectionYear[];
  totalAnnualFeePercent: number;
  totalAssetBasedFees: number;
  totalFlatFees: number;
  years: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const finalGap = Math.max(savings, 0);
  const directFeeGap = Math.min(Math.max(totalAssetBasedFees - totalFlatFees, 0), finalGap);
  const compoundingGap = Math.max(finalGap - directFeeGap, 0);
  const directFeeShare = finalGap > 0 ? (directFeeGap / finalGap) * 100 : 0;
  const compoundingShare = finalGap > 0 ? (compoundingGap / finalGap) * 100 : 0;
  const feeBarWidth = `${Math.min(Math.max(directFeeShare, 0), 100)}%`;
  const compoundingBarWidth = `${Math.min(Math.max(compoundingShare, 0), 100)}%`;

  if (!expanded) {
    return (
      <section className="min-w-0 overflow-hidden rounded-md border border-[#C9D8E4] bg-[#F8FBFC] shadow-[0_12px_26px_rgba(17,33,52,0.08)]">
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="flex min-h-12 w-full items-center justify-center px-4 text-center text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#108843] transition hover:bg-[#EEF5FA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#108843]"
          aria-expanded={false}
          aria-controls="see-our-math-details"
        >
          See our math
        </button>
      </section>
    );
  }

  return (
    <section
      id="see-our-math-details"
      className="min-w-0 overflow-hidden rounded-md border border-[#C9D8E4] bg-[#F8FBFC] p-4 shadow-[0_12px_26px_rgba(17,33,52,0.08)] sm:p-5"
    >
      <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:items-start">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[#108843]">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-[#E4F6EB]">
              <Table2 className="h-4 w-4" strokeWidth={2.3} />
            </span>
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.18em]">See our math</p>
              <p className="mt-0.5 text-sm font-bold text-[#062B43]">
                {formatCurrency(savings)} projected gap
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-md border border-[#DDE7EF] bg-white p-3">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#667587]">
              Gap breakdown
            </p>
            <div className="mt-3 space-y-3">
              <div>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm font-bold text-[#10233A]">Actual fee gap</span>
                  <span className="text-sm font-extrabold tabular-nums text-[#D92D20]">
                    {formatCurrency(directFeeGap)} · {directFeeShare.toFixed(0)}%
                  </span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-[#EDF2F7]">
                  <div className="h-full rounded-full bg-[#D92D20]" style={{ width: feeBarWidth }} />
                </div>
              </div>
              <div>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm font-bold text-[#10233A]">Lost compounding</span>
                  <span className="text-sm font-extrabold tabular-nums text-[#064B84]">
                    {formatCurrency(compoundingGap)} · {compoundingShare.toFixed(0)}%
                  </span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-[#EDF2F7]">
                  <div className="h-full rounded-full bg-[#064B84]" style={{ width: compoundingBarWidth }} />
                </div>
              </div>
            </div>
            <p className="mt-3 text-xs leading-5 text-[#52657A]">
              Fees paid is the extra asset-based fee bill above the flat-fee bill. Lost compounding is the rest of the ending-value gap.
            </p>
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-md border border-[#DDE7EF] bg-white px-3 py-2">
              <dt className="font-bold uppercase tracking-[0.14em] text-[#667587]">Portfolio</dt>
              <dd className="mt-1 font-semibold tabular-nums text-[#10233A]">{formatCurrency(portfolioValue)}</dd>
            </div>
            <div className="rounded-md border border-[#DDE7EF] bg-white px-3 py-2">
              <dt className="font-bold uppercase tracking-[0.14em] text-[#667587]">Growth</dt>
              <dd className="mt-1 font-semibold tabular-nums text-[#10233A]">{annualGrowthPercent.toFixed(1)}%</dd>
            </div>
            <div className="rounded-md border border-[#DDE7EF] bg-white px-3 py-2">
              <dt className="font-bold uppercase tracking-[0.14em] text-[#667587]">Fee load</dt>
              <dd className="mt-1 font-semibold tabular-nums text-[#10233A]">{totalAnnualFeePercent.toFixed(2)}%</dd>
            </div>
            <div className="rounded-md border border-[#DDE7EF] bg-white px-3 py-2">
              <dt className="font-bold uppercase tracking-[0.14em] text-[#667587]">Flat fee</dt>
              <dd className="mt-1 font-semibold tabular-nums text-[#10233A]">{formatCurrency(annualFlatFee)}/yr</dd>
            </div>
          </dl>

          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="mt-4 inline-flex min-h-10 w-full items-center justify-center rounded-md border border-[#C9D8E4] bg-white px-4 text-center text-sm font-extrabold text-[#064B84] transition hover:bg-[#EEF5FA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#108843]"
            aria-expanded={expanded}
            aria-controls="see-our-math-details"
          >
            {expanded ? "Hide details" : "Show details"}
          </button>
        </div>

        <div className="min-w-0">
          <div className="max-h-[320px] w-full overflow-auto rounded-md border border-[#D5E1EB] bg-white">
            <table className="w-full min-w-[920px] border-collapse text-left text-xs">
              <caption className="sr-only">Year-by-year fee comparison table</caption>
              <thead className="sticky top-0 z-10 bg-[#EEF5FA] text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#4B6075]">
                <tr>
                  <th scope="col" className="px-3 py-2">Year</th>
                  <th scope="col" className="px-3 py-2">Flat-fee value</th>
                  <th scope="col" className="px-3 py-2">Asset-fee value</th>
                  <th scope="col" className="px-3 py-2">Gap</th>
                  <th scope="col" className="px-3 py-2">Fee part</th>
                  <th scope="col" className="px-3 py-2">Compounding part</th>
                  <th scope="col" className="px-3 py-2">AUM fees paid</th>
                  <th scope="col" className="px-3 py-2">Cumulative AUM fees</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2EAF1] text-[#10233A]">
                {series.map((row) => {
                  const gap = row.withoutFees - row.withFees;
                  const flatFeesThroughYear = years > 0 ? totalFlatFees * (row.year / years) : 0;
                  const feePart = Math.min(Math.max(row.cumulativeFees - flatFeesThroughYear, 0), Math.max(gap, 0));
                  const compoundingPart = Math.max(gap - feePart, 0);
                  return (
                    <tr key={row.year} className="odd:bg-white even:bg-[#FAFCFD]">
                      <th scope="row" className="px-3 py-2 font-bold tabular-nums text-[#4B6075]">
                        {row.year}
                      </th>
                      <td className="px-3 py-2 font-semibold tabular-nums text-[#108843]">{formatCurrency(row.withoutFees)}</td>
                      <td className="px-3 py-2 font-semibold tabular-nums text-[#064B84]">{formatCurrency(row.withFees)}</td>
                      <td className="px-3 py-2 font-semibold tabular-nums text-[#D92D20]">{formatCurrency(gap)}</td>
                      <td className="px-3 py-2 tabular-nums">{formatCurrency(feePart)}</td>
                      <td className="px-3 py-2 tabular-nums">{formatCurrency(compoundingPart)}</td>
                      <td className="px-3 py-2 tabular-nums">{formatCurrency(row.annualFeesPaid)}</td>
                      <td className="px-3 py-2 tabular-nums">{formatCurrency(row.cumulativeFees)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-3 grid gap-2 text-xs leading-5 text-[#52657A] sm:grid-cols-3">
            <p className="rounded-md bg-white px-3 py-2 ring-1 ring-[#DDE7EF]">
              Total asset-based fees modeled: <strong className="text-[#10233A]">{formatCurrency(totalAssetBasedFees)}</strong>.
            </p>
            <p className="rounded-md bg-white px-3 py-2 ring-1 ring-[#DDE7EF]">
              Total flat fees modeled: <strong className="text-[#10233A]">{formatCurrency(totalFlatFees)}</strong>.
            </p>
            <p className="rounded-md bg-white px-3 py-2 ring-1 ring-[#DDE7EF]">
              Horizon: <strong className="text-[#10233A]">{years} years</strong>, compounded monthly.
            </p>
          </div>

          <div className="mt-3 space-y-2 text-xs leading-5 text-[#667587]">
            <p>
              Disclosures: This calculator is for illustrative and educational purposes only. It is not investment advice,
              an advisory relationship, a forecast, or a guarantee of performance or savings. Actual results will vary.
            </p>
            <p>
              The model assumes a constant annual growth rate, monthly compounding, a traditional asset-based fee applied
              monthly, and Smarter Way Wealth&apos;s flat {formatCurrency(annualFlatFee / 12)}/month fee. Values are nominal,
              before taxes, and exclude inflation, trading costs, bid/ask spreads, cash flows, market volatility, and
              other expenses unless entered above.
            </p>
            <a
              href={fitCta.href}
              className="inline-flex items-center gap-1 font-extrabold text-[#108843] underline underline-offset-4 hover:text-[#0A6E35]"
            >
              Learn about Smarter Way Wealth
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalHomeCalculatorExperience(props: HomeCalculatorExperienceProps) {
  const {
    annualFeePercent,
    annualFlatFee,
    annualGrowthPercent,
    assumptionsCustomized,
    disclosure,
    finalValueWithFees,
    finalValueWithoutFees,
    onAssumptionChange,
    percentLost,
    portfolioValue,
    series,
    simpleControls,
    savings,
    totalAnnualFeePercent,
    totalAssetBasedFees,
    totalFlatFees,
    years,
  } = props;
  const [chartPinned, setChartPinned] = useState(false);
  const [barPinned, setBarPinned] = useState(false);
  const [hoverChart, setHoverChart] = useState(false);
  const [hoverBar, setHoverBar] = useState(false);
  const [chartGapHintActive, setChartGapHintActive] = useState(false);
  const [barGapHintActive, setBarGapHintActive] = useState(false);
  const [headerInputsVisible, setHeaderInputsVisible] = useState(assumptionsCustomized);
  const visualizationRef = useRef<HTMLDivElement | null>(null);
  const gapHintCancelledRef = useRef(false);
  const gapHintPlayCountRef = useRef(0);
  const gapHintTimeoutsRef = useRef<number[]>([]);
  const vsActive = chartPinned && barPinned;
  const showHeaderInputs = headerInputsVisible || assumptionsCustomized;
  const updateAssumption = (patch: CalculatorAssumptionPatch) => {
    setHeaderInputsVisible(true);
    onAssumptionChange(patch);
  };
  const clearGapHintTimers = () => {
    gapHintTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    gapHintTimeoutsRef.current = [];
  };
  const cancelGapHint = () => {
    gapHintCancelledRef.current = true;
    clearGapHintTimers();
    setChartGapHintActive(false);
    setBarGapHintActive(false);
  };
  const toggleAllGaps = () => {
    cancelGapHint();
    const nextPinned = !vsActive;
    setChartPinned(nextPinned);
    setBarPinned(nextPinned);
    setHoverChart(false);
    setHoverBar(false);
  };
  const toggleChartGap = () => {
    cancelGapHint();
    setChartPinned((prev) => !prev);
    setHoverChart(false);
  };
  const toggleBarGap = () => {
    cancelGapHint();
    setBarPinned((prev) => !prev);
    setHoverBar(false);
  };
  const chartActive = chartPinned || hoverChart;
  const barActive = barPinned || hoverBar;
  const chartGapHintVisible = chartGapHintActive && !chartPinned && !barPinned;
  const barGapHintVisible = barGapHintActive && !chartPinned && !barPinned;
  useEffect(() => {
    if (gapHintCancelledRef.current || chartPinned || barPinned) return;

    const element = visualizationRef.current;
    if (!element) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const visibleMs = prefersReducedMotion ? FEE_GAP_HINT_REDUCED_VISIBLE_MS : FEE_GAP_HINT_VISIBLE_MS;
    const barDelayMs = prefersReducedMotion ? 0 : FEE_GAP_HINT_BAR_DELAY_MS;

    const queueTimeout = (callback: () => void, delay: number) => {
      const timeoutId = window.setTimeout(callback, delay);
      gapHintTimeoutsRef.current.push(timeoutId);
    };

    const playHint = () => {
      if (
        gapHintCancelledRef.current ||
        chartPinned ||
        barPinned ||
        gapHintPlayCountRef.current >= FEE_GAP_HINT_MAX_PLAYS
      ) {
        return;
      }

      gapHintPlayCountRef.current += 1;
      setChartGapHintActive(true);

      queueTimeout(() => {
        setBarGapHintActive(true);
      }, barDelayMs);

      queueTimeout(() => {
        setChartGapHintActive(false);
      }, visibleMs);

      queueTimeout(() => {
        setBarGapHintActive(false);
      }, visibleMs + barDelayMs);

      queueTimeout(() => {
        setChartGapHintActive(false);
        setBarGapHintActive(false);

        if (
          gapHintCancelledRef.current ||
          chartPinned ||
          barPinned ||
          gapHintPlayCountRef.current >= FEE_GAP_HINT_MAX_PLAYS
        ) {
          return;
        }

        playHint();
      }, FEE_GAP_HINT_REPEAT_MS);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || gapHintCancelledRef.current || chartPinned || barPinned) return;

        queueTimeout(playHint, FEE_GAP_HINT_INITIAL_DELAY_MS);
        observer.disconnect();
      },
      { threshold: 0.35 }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      clearGapHintTimers();
    };
  }, [barPinned, chartPinned]);

  useEffect(() => {
    if ((chartPinned || barPinned) && (chartGapHintActive || barGapHintActive)) {
      setChartGapHintActive(false);
      setBarGapHintActive(false);
    }
  }, [barGapHintActive, barPinned, chartGapHintActive, chartPinned]);

  return (
    <div className="section-shell relative z-10 pb-16 pt-10 sm:pt-12">
      <div className="mx-auto mb-4 max-w-3xl text-center [&_p]:mt-0">
        {disclosure}
      </div>
      <div id="savings-section">
      <ScrollReveal className="mx-auto max-w-[1380px] overflow-hidden rounded-md border border-[#CFD9E3] bg-white shadow-[0_18px_45px_rgba(17,33,52,0.08)]">
        <header className="border-b border-[#DFE6EE] bg-white/65 px-6 py-4 text-[#062B43] backdrop-blur sm:px-10">
          <div className="grid items-center gap-3 lg:grid-cols-[11rem_minmax(0,1fr)_11rem]">
            <div className="hidden lg:block" aria-hidden="true" />
          <div className="text-center">
            <h2 className="text-[clamp(1.75rem,2.6vw,2.75rem)] font-bold leading-tight tracking-normal">
              {showHeaderInputs ? (
                <>
                  <FinalHeaderNumberInput
                    ariaLabel="Portfolio value"
                    value={portfolioValue}
                    onChange={(value) => updateAssumption({ portfolioValue: value })}
                    prefix="$"
                    decimals={0}
                    inputMode="numeric"
                    min={250000}
                    max={5000000}
                    useGrouping
                    className="font-bold text-[#062B43]"
                  />{" "}
                  <span>over</span>{" "}
                  <FinalHeaderNumberInput
                    ariaLabel="Time horizon in years"
                    value={years}
                    onChange={(value) => updateAssumption({ years: Math.round(value) })}
                    suffix=" years"
                    decimals={0}
                    inputMode="numeric"
                    min={1}
                    max={40}
                    className="font-bold text-[#062B43]"
                  />
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setHeaderInputsVisible(true)}
                  className="font-[inherit] leading-[inherit] text-[#062B43] outline-none transition hover:text-[#0B3756] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#108843]"
                  aria-label="Edit portfolio value and time horizon"
                >
                  <span className="underline decoration-[#D7E0E8] decoration-1 underline-offset-[0.22em]">
                    Your Portfolio Value
                  </span>{" "}
                  <span>over</span>{" "}
                  <span className="underline decoration-[#D7E0E8] decoration-1 underline-offset-[0.22em]">
                    Time
                  </span>
                </button>
              )}
            </h2>
            <p className="mt-2 text-lg text-[#42556C] sm:text-xl">
              Compare your{" "}
              {showHeaderInputs ? (
                <>
                  asset-based fee:{" "}
                  <FinalHeaderNumberInput
                    ariaLabel="Asset-based fee percentage"
                    value={annualFeePercent}
                    onChange={(value) => updateAssumption({ annualFeePercent: value })}
                    suffix="%"
                    decimals={2}
                    inputMode="decimal"
                    min={0.25}
                    max={2.5}
                    className="font-semibold text-[#064B84]"
                  />{" "}
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setHeaderInputsVisible(true)}
                  className="font-semibold text-[#064B84] underline decoration-[#064B84] decoration-2 underline-offset-4 outline-none transition hover:text-[#0B3756] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#108843]"
                >
                  asset-based fees
                </button>
              )}{" "}
              with a flat <span className="font-semibold text-[#108843]">$100/month</span>.
            </p>
          </div>
          <div className="mx-auto flex shrink-0 flex-col items-center justify-center border-l-2 border-[#108843] pl-4 text-center text-sm font-semibold uppercase leading-tight tracking-tight text-[#108843] sm:text-base lg:mx-0 lg:items-start lg:text-left">
            <span>Annual Growth</span>
            <FinalHeaderNumberInput
              ariaLabel="Annual growth percentage"
              value={annualGrowthPercent}
              onChange={(value) => updateAssumption({ annualGrowthPercent: value })}
              suffix="%"
              decimals={1}
              inputMode="decimal"
              min={3}
              max={12}
              className="text-[#108843]"
            />
          </div>
          </div>
        </header>

        <section className="relative grid gap-3 px-4 pt-3 sm:px-7 md:grid-cols-2 md:gap-8" aria-label="Ending value comparison">
          <FinalHomeStatCard
            ribbon={`Paying asset-based fees (${annualFeePercent.toFixed(2)}%)`}
            value={
              <>
                <span className="sm:hidden">{formatCurrencyFloored(finalValueWithFees)}</span>
                <RollingCurrencyOdometer
                  value={finalValueWithFees}
                  formatter={formatCurrencyFloored}
                  duration={650}
                  debounceMs={180}
                  className="hidden sm:inline"
                />
              </>
            }
            tone="blue"
            accentClassName="text-[#064B84]"
          />
          <button
            type="button"
            onClick={toggleAllGaps}
            className={`absolute left-1/2 top-[72px] z-10 hidden h-14 w-14 -translate-x-1/2 place-items-center rounded-full text-base font-extrabold text-white transition hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D92D20] md:grid ${
              vsActive ? "bg-[#D92D20] hover:bg-[#B91C1C]" : "vs-pulse-halo bg-[#062B43] hover:bg-[#0B3756]"
            }`}
            aria-label={vsActive ? "Hide fee gap overlays" : "Show fee gap on chart and bar"}
            aria-pressed={vsActive}
          >
            VS
          </button>
          <button
            type="button"
            onClick={toggleAllGaps}
            className={`mx-auto grid h-12 w-12 place-items-center rounded-full text-sm font-extrabold text-white md:hidden ${
              vsActive ? "bg-[#D92D20]" : "vs-pulse-halo bg-[#062B43]"
            }`}
            aria-label={vsActive ? "Hide fee gap overlays" : "Show fee gap on chart and bar"}
            aria-pressed={vsActive}
          >
            VS
          </button>
          <FinalHomeStatCard
            ribbon="Paying flat monthly fee ($100/mo)"
            value={
              <>
                <span className="sm:hidden">{formatCurrencyFloored(finalValueWithoutFees)}</span>
                <RollingCurrencyOdometer
                  value={finalValueWithoutFees}
                  formatter={formatCurrencyFloored}
                  duration={650}
                  debounceMs={180}
                  className="hidden sm:inline"
                />
              </>
            }
            tone="green"
            accentClassName="text-[#108843]"
          />
        </section>

        <section
          className="mx-4 mt-3 grid overflow-hidden rounded-md border border-[#DFE6EE] bg-white sm:mx-7 md:grid-cols-2"
          aria-label="Calculator assumptions"
        >
          <div className="border-b border-[#DFE6EE] p-3 md:border-r">{simpleControls.portfolio}</div>
          <div className="border-b border-[#DFE6EE] p-3">{simpleControls.advisoryFee}</div>
          <div className="border-b border-[#DFE6EE] p-3 md:border-b-0 md:border-r">{simpleControls.growth}</div>
          <div className="p-3">{simpleControls.years}</div>
        </section>

        <div ref={visualizationRef}>
          <section
            className="mx-4 mt-3 rounded-md border border-[#DFE6EE] bg-white px-1.5 py-2 sm:mx-7 sm:px-2"
            aria-label="Portfolio value over time"
          >
            <div className="h-[255px] w-full sm:h-[305px]">
              <FinalHomeLineChart
                annualFeePercent={annualFeePercent}
                chartActive={chartActive}
                chartHintActive={chartGapHintVisible}
                chartPinned={chartPinned}
                finalValueWithFees={finalValueWithFees}
                finalValueWithoutFees={finalValueWithoutFees}
                savings={savings}
                series={series}
                years={years}
                onGapEnter={() => setHoverChart(true)}
                onGapLeave={() => setHoverChart(false)}
                onGapToggle={toggleChartGap}
              />
            </div>
          </section>

          <ComparisonBars
            finalValueWithFees={finalValueWithFees}
            finalValueWithoutFees={finalValueWithoutFees}
            savings={savings}
            percentLost={percentLost}
            barActive={barActive}
            barHintActive={barGapHintVisible}
            barPinned={barPinned}
            onGapEnter={() => setHoverBar(true)}
            onGapLeave={() => setHoverBar(false)}
            onGapToggle={toggleBarGap}
          />
        </div>

        <div className="mx-4 mt-4 sm:mx-7">
          <SeeOurMathBento
            annualFlatFee={annualFlatFee}
            annualGrowthPercent={annualGrowthPercent}
            portfolioValue={portfolioValue}
            savings={savings}
            series={series}
            totalAnnualFeePercent={totalAnnualFeePercent}
            totalAssetBasedFees={totalAssetBasedFees}
            totalFlatFees={totalFlatFees}
            years={years}
          />
        </div>
        <p className="px-4 pb-5 pt-4 text-center text-xs leading-relaxed text-[#667587] sm:px-7">
          This calculator is for illustrative purposes only and does not represent actual performance.
          Values are nominal and before taxes.
        </p>
      </ScrollReveal>
      </div>
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
