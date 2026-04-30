"use client";

import type { ReactNode } from "react";
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
import { formatCurrency } from "@/lib/format";
import type {
  HomeCalculatorTheme,
  HomeMarketingVariant,
} from "@/config/homeMarketingVariants";
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

type HomeCalculatorExperienceProps = {
  layout: HomeMarketingVariant["layout"];
  theme: HomeCalculatorTheme;
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
  renderChart: (className: string) => ReactNode;
  activeScenario: Scenario | null;
  onHighlightScenario: (scenario: Scenario) => void;
};

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
  title: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-emerald-100/70">
        {title}
      </h3>
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
          <p className={`text-sm font-bold uppercase tracking-[0.18em] ${theme.eyebrowClassName}`}>
            Planning console
          </p>
          <h2 className={`mt-3 max-w-3xl text-3xl font-semibold tracking-normal sm:text-5xl ${theme.titleClassName}`}>
            Stress-test the advice fee before it compounds.
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
                <ConsoleControlGroup title="Fee stack">
                  {sliders.advisoryFee}
                  {sliders.mutualFundExpenses}
                </ConsoleControlGroup>
                <ConsoleControlGroup title="Planning model">
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
  if (props.layout === "receipt") {
    return <FeeReceiptCalculatorExperience {...props} />;
  }

  if (props.layout === "advisor") {
    return <AdvisorCalculatorExperience {...props} />;
  }

  return <DirectMailCalculatorExperience {...props} />;
}
