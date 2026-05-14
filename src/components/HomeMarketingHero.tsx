"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowDown, Calculator, CheckCircle2, Share2 } from "lucide-react";
import { HomeMarketingVariant } from "@/config/homeMarketingVariants";
import type { CalculatorState } from "@/lib/calculatorState";
import { formatCurrency } from "@/lib/format";

type HomeMarketingHeroProps = {
  variant: HomeMarketingVariant;
  savings: number;
  portfolioValue: number;
  years: number;
  annualGrowthPercent: number;
  annualFeePercent: number;
  mutualFundExpensePercent: number;
  onCalculatorChange: (patch: Partial<CalculatorState>) => void;
  onShare: () => void;
  shareButtonLabel: string;
  centerProofPoints?: boolean;
  showAdvisorCalculator?: boolean;
  showCtas?: boolean;
};

function HeroBackdrop({ variant }: { variant: HomeMarketingVariant }) {
  if (variant.layout === "receipt") {
    return (
      <div className="absolute inset-0 overflow-hidden bg-[#F7F8FA]">
        <div className="absolute inset-y-0 right-0 w-[70%] bg-[linear-gradient(115deg,transparent_0%,transparent_31%,rgba(0,122,47,0.08)_31%,rgba(0,122,47,0.08)_44%,transparent_44%,transparent_100%)]" />
        <div className="absolute bottom-0 right-[-8%] h-[74%] w-[70%] rotate-[-8deg] border-l border-t border-slate-300/70 bg-white/60" />
        <div className="absolute bottom-16 right-0 h-28 w-[62%] rounded-l-full bg-red-100/80 blur-3xl" />
        <div className="absolute right-[8%] top-20 hidden h-[390px] w-[390px] rounded-full border border-slate-200/70 md:block" />
      </div>
    );
  }

  const isAdvisor = variant.layout === "advisor";

  return (
    <div className="absolute inset-0 overflow-hidden bg-slate-950">
      {variant.image && (
        <Image
          src={variant.image.src}
          alt={variant.image.alt}
          fill
          priority
          sizes="100vw"
          className={`object-cover ${isAdvisor ? "opacity-60" : "opacity-100"}`}
          style={{ objectPosition: variant.image.position }}
        />
      )}
      <div
        className={
          isAdvisor
            ? "absolute inset-0 bg-[linear-gradient(90deg,rgba(2,21,13,0.96)_0%,rgba(3,37,21,0.82)_45%,rgba(3,37,21,0.48)_74%,rgba(3,37,21,0.35)_100%)]"
            : "absolute inset-0 bg-[linear-gradient(90deg,rgba(247,248,250,0.98)_0%,rgba(247,248,250,0.9)_34%,rgba(247,248,250,0.42)_62%,rgba(247,248,250,0.05)_100%)]"
        }
      />
      {!isAdvisor && (
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#EEF0F5] to-transparent" />
      )}
    </div>
  );
}

function ReceiptVisual({ savings, portfolioValue, years }: { savings: number; portfolioValue: number; years: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.18, duration: 0.55, ease: "easeOut" }}
      className="hidden md:block"
      aria-hidden="true"
    >
      <div className="relative h-[430px] w-[430px]">
        <div className="absolute left-4 top-12 h-[300px] w-[300px] rounded-full border border-slate-300/80" />
        <div className="absolute right-0 top-0 w-[340px] border-l border-slate-300 bg-white/70 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Fee receipt</p>
          <p className="mt-8 text-5xl font-semibold tracking-normal text-slate-950">{formatCurrency(savings)}</p>
          <p className="mt-2 text-sm text-slate-600">Projected gap over {years} years</p>
          <div className="mt-8 space-y-4 text-sm">
            <div className="flex justify-between border-b border-slate-200 pb-3">
              <span className="text-slate-500">Starting value</span>
              <span className="font-semibold text-slate-900">{formatCurrency(portfolioValue)}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-3">
              <span className="text-slate-500">Flat fee</span>
              <span className="font-semibold text-[#007A2F]">$100/mo</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Traditional fee</span>
              <span className="font-semibold text-red-700">asset-based</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function clampMiniValue(value: number, min: number, max: number, decimals: number) {
  const clamped = Math.min(max, Math.max(min, value));
  return decimals === 0 ? Math.round(clamped) : Number(clamped.toFixed(decimals));
}

function parseMiniNumber(value: string) {
  const parsed = Number.parseFloat(value.replace(/[$,%\s]/g, "").replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function formatMiniNumber(value: number, decimals: number, useGrouping = false) {
  if (decimals > 0) return value.toFixed(decimals);
  return useGrouping ? Math.round(value).toLocaleString("en-US") : Math.round(value).toString();
}

function MiniTextInput({
  decimals = 0,
  label,
  max,
  min,
  onValueChange,
  prefix,
  suffix,
  useGrouping = false,
  value,
}: {
  decimals?: number;
  label: string;
  max: number;
  min: number;
  onValueChange: (value: number) => void;
  prefix?: string;
  suffix?: string;
  useGrouping?: boolean;
  value: number;
}) {
  const [draft, setDraft] = useState(() => formatMiniNumber(value, decimals, useGrouping));
  const [isFocused, setIsFocused] = useState(false);
  const inputWidth = `${Math.min(16, Math.max(prefix ? 14 : suffix ? 8 : 4.5, draft.length + (prefix ? 5 : suffix ? 4 : 1)))}ch`;

  useEffect(() => {
    if (!isFocused) {
      setDraft(formatMiniNumber(value, decimals, useGrouping));
    }
  }, [decimals, isFocused, useGrouping, value]);

  const commitDraft = (nextValue: string, shouldFormat: boolean) => {
    const parsed = parseMiniNumber(nextValue);

    if (parsed === null) {
      if (shouldFormat) {
        setDraft(formatMiniNumber(value, decimals, useGrouping));
      }
      return;
    }

    const normalized = clampMiniValue(parsed, min, max, decimals);
    onValueChange(normalized);

    if (shouldFormat) {
      setDraft(formatMiniNumber(normalized, decimals, useGrouping));
    }
  };

  return (
    <label className="flex items-center justify-between gap-3 text-[12px] leading-none text-emerald-50/45">
      <span className="font-medium tracking-normal">{label}</span>
      <span className="relative inline-flex justify-end">
        <input
          type="text"
          inputMode={decimals > 0 ? "decimal" : "numeric"}
          value={draft}
          onBlur={() => {
            setIsFocused(false);
            commitDraft(draft, true);
          }}
          onChange={(event) => {
            const nextValue = event.target.value;
            setDraft(nextValue);
            commitDraft(nextValue, false);
          }}
          onFocus={() => setIsFocused(true)}
          className={`box-border h-7 rounded-[3px] border border-white/10 bg-white/[0.035] px-2 ${
            prefix ? "pl-5" : ""
          } ${
            suffix ? "pr-5" : ""
          } text-right text-[12px] font-medium tabular-nums text-white/65 outline-none transition focus:border-emerald-200/35 focus:bg-white/[0.08] focus:text-white`}
          style={{ width: inputWidth }}
          aria-label={label}
        />
        {prefix && (
          <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[12px] text-emerald-50/35">
            {prefix}
          </span>
        )}
        {suffix && (
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[12px] text-emerald-50/35">
            {suffix}
          </span>
        )}
      </span>
    </label>
  );
}

function AdvisorMiniCalculator({
  annualFeePercent,
  annualGrowthPercent,
  className = "",
  mutualFundExpensePercent,
  onCalculatorChange,
  portfolioValue,
  savings,
  years,
}: {
  annualFeePercent: number;
  annualGrowthPercent: number;
  className?: string;
  mutualFundExpensePercent: number;
  onCalculatorChange: (patch: Partial<CalculatorState>) => void;
  portfolioValue: number;
  savings: number;
  years: number;
}) {
  const totalFeePercent = annualFeePercent + mutualFundExpensePercent;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.16, duration: 0.55, ease: "easeOut" }}
      className={`text-white opacity-70 transition-opacity duration-300 hover:opacity-100 focus-within:opacity-100 ${className}`}
      aria-label={`Savings: ${formatCurrency(savings)}`}
    >
      <div className="w-[232px] max-w-full bg-slate-950/[0.04] py-2 backdrop-blur-[2px]">
        <div className="pb-3" aria-live="polite">
          <p className="text-[12px] font-medium tracking-normal text-emerald-50/55">Savings</p>
          <p className="mt-1 text-[30px] font-semibold leading-none tracking-normal text-white/90">
            {formatCurrency(savings)}
          </p>
          <p className="mt-1 text-[12px] leading-snug text-emerald-50/45">
            vs. $100/mo. flat fee
            <a
              href="/our-math#assumptions"
              className="ml-0.5 text-emerald-200/70 underline decoration-emerald-200/30 underline-offset-2 transition hover:text-emerald-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-200"
              aria-label="View calculator assumptions and disclosures"
            >
              *
            </a>
          </p>
        </div>

        <div className="space-y-2 border-t border-white/10 pt-3">
          <MiniTextInput
            label="Portfolio"
            min={250000}
            max={5000000}
            prefix="$"
            value={portfolioValue}
            useGrouping
            onValueChange={(value) => onCalculatorChange({ portfolioValue: value })}
          />
          <MiniTextInput
            decimals={2}
            label="Fee"
            min={0}
            max={3}
            suffix="%"
            value={totalFeePercent}
            onValueChange={(value) =>
              onCalculatorChange({
                annualFeePercent: Math.max(0, Number((value - mutualFundExpensePercent).toFixed(2))),
              })
            }
          />
          <MiniTextInput
            decimals={1}
            label="Growth"
            min={0}
            max={20}
            suffix="%"
            value={annualGrowthPercent}
            onValueChange={(value) => onCalculatorChange({ annualGrowthPercent: value })}
          />
          <MiniTextInput
            label="Years"
            min={1}
            max={40}
            value={years}
            onValueChange={(value) => onCalculatorChange({ years: Math.round(value) })}
          />
        </div>
      </div>
    </motion.div>
  );
}

function AdvisorFeeCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.16, duration: 0.55, ease: "easeOut" }}
      className="mr-0 w-[300px] max-w-full rounded-md border border-emerald-200/20 bg-white/[0.07] p-7 text-white shadow-[0_24px_70px_rgba(0,0,0,0.2)] backdrop-blur-sm"
    >
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-200/80">
        Flat-fee advisory model
      </p>
      <p className="mt-6 text-[clamp(2.5rem,4.6vw,4.8rem)] font-semibold leading-none tracking-normal text-white">
        $100/mo.
      </p>
      <p className="mt-2 text-lg font-bold text-emerald-100">flat monthly fee</p>
      <div className="mt-7 border-t border-white/12 pt-4 text-sm leading-6 text-emerald-50/70">
        No asset-based advisory fee.
      </div>
    </motion.div>
  );
}

export function HomeMarketingHero({
  variant,
  savings,
  portfolioValue,
  years,
  annualGrowthPercent,
  annualFeePercent,
  mutualFundExpensePercent,
  onCalculatorChange,
  onShare,
  shareButtonLabel,
  centerProofPoints = false,
  showAdvisorCalculator = true,
  showCtas = true,
}: HomeMarketingHeroProps) {
  const isDarkHero = variant.layout === "advisor";
  const isPhotoHero = variant.layout === "photo";
  const textColor = isDarkHero ? "text-white" : "text-slate-950";
  const mutedColor = isDarkHero ? "text-emerald-50/80" : "text-slate-700";
  const eyebrowColor = isDarkHero ? "text-emerald-200" : isPhotoHero ? "text-[#00682B]" : "text-red-700";
  const proofPoints = variant.proofPoints.map((point) => (
    <div key={point} className={`flex items-center gap-2 ${centerProofPoints ? "justify-center" : ""}`}>
      <CheckCircle2 className={`shrink-0 ${centerProofPoints ? "h-5 w-5" : "h-4 w-4"} ${isDarkHero ? "text-emerald-300" : "text-[#007A2F]"}`} />
      <span>{point}</span>
    </div>
  ));

  return (
    <section className="relative w-full overflow-hidden">
      <HeroBackdrop variant={variant} />
      <div className="relative mx-auto grid min-h-[calc(100svh-170px)] w-full max-w-7xl items-center gap-8 px-4 py-9 sm:px-6 md:min-h-[calc(100svh-150px)] md:grid-cols-[minmax(0,1fr)_minmax(320px,0.82fr)] md:py-16 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="max-w-2xl"
        >
          <p className={`text-sm font-bold uppercase tracking-[0.2em] ${eyebrowColor}`}>{variant.eyebrow}</p>
          <h1 className={`mt-4 max-w-[13ch] text-[clamp(2.35rem,10vw,6.4rem)] font-semibold leading-[0.92] tracking-normal ${textColor}`}>
            {variant.headline} <span className={isDarkHero ? "text-emerald-300" : "text-[#007A2F]"}>{variant.highlight}</span>
          </h1>
          <p className={`mt-5 max-w-xl text-base leading-6 sm:text-xl sm:leading-7 ${mutedColor}`}>{variant.body}</p>

          {showCtas && (
            <div className="mt-7 flex flex-col gap-3 min-[420px]:flex-row">
              <a
                href="#calculator"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#007A2F] px-5 text-sm font-bold !text-white no-underline shadow-lg shadow-emerald-900/15 transition hover:bg-[#00682B] hover:!text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00A540]"
              >
                <Calculator className="h-4 w-4" />
                {variant.primaryCta}
                <ArrowDown className="h-4 w-4" />
              </a>
              <button
                type="button"
                onClick={onShare}
                className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border px-5 text-sm font-bold transition ${
                  isDarkHero
                    ? "border-white/25 bg-white/10 text-white hover:bg-white/20"
                    : "border-slate-300 bg-white/80 text-slate-800 hover:bg-white"
                }`}
              >
                <Share2 className="h-4 w-4" />
                {shareButtonLabel === "Share your result" ? variant.secondaryCta : shareButtonLabel}
              </button>
            </div>
          )}

          {!centerProofPoints && (
            <div className={`mt-6 grid gap-1.5 text-sm sm:grid-cols-3 ${isDarkHero ? "text-emerald-50/90" : "text-slate-700"}`}>
              {proofPoints}
            </div>
          )}

          {isDarkHero && showAdvisorCalculator && (
            <AdvisorMiniCalculator
              annualFeePercent={annualFeePercent}
              annualGrowthPercent={annualGrowthPercent}
              className="ml-auto mt-5 md:hidden"
              mutualFundExpensePercent={mutualFundExpensePercent}
              onCalculatorChange={onCalculatorChange}
              portfolioValue={portfolioValue}
              savings={savings}
              years={years}
            />
          )}
        </motion.div>

        <div className="relative hidden min-h-[420px] items-start justify-end self-start pt-5 md:flex lg:pt-8">
          {variant.layout === "receipt" ? (
            <ReceiptVisual savings={savings} portfolioValue={portfolioValue} years={years} />
          ) : isDarkHero && showAdvisorCalculator ? (
            <AdvisorMiniCalculator
              annualFeePercent={annualFeePercent}
              annualGrowthPercent={annualGrowthPercent}
              className="mr-0"
              mutualFundExpensePercent={mutualFundExpensePercent}
              onCalculatorChange={onCalculatorChange}
              portfolioValue={portfolioValue}
              savings={savings}
              years={years}
            />
          ) : isDarkHero ? (
            <AdvisorFeeCard />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16, duration: 0.55, ease: "easeOut" }}
              className={`w-full max-w-sm ${isDarkHero ? "text-white" : "text-slate-950"}`}
              aria-label={`${variant.resultLabel}: ${formatCurrency(savings)}`}
            >
              <div className={`border-l pl-5 ${isDarkHero ? "border-emerald-300/70" : "border-[#007A2F]"}`}>
                <p className={`text-xs font-bold uppercase tracking-[0.18em] ${isDarkHero ? "text-emerald-200" : "text-slate-600"}`}>
                  {variant.resultLabel}
                </p>
                <p className="mt-3 text-5xl font-semibold tracking-normal">{formatCurrency(savings)}</p>
                <p className={`mt-2 text-sm ${isDarkHero ? "text-emerald-50/80" : "text-slate-600"}`}>
                  Based on the current calculator assumptions.
                </p>
              </div>
            </motion.div>
          )}
        </div>
        {centerProofPoints && (
          <div className={`mx-auto grid w-full max-w-5xl gap-4 text-base font-semibold sm:grid-cols-3 md:col-span-2 md:text-[1.32rem] ${isDarkHero ? "text-emerald-50/95" : "text-slate-700"}`}>
            {proofPoints}
          </div>
        )}
      </div>
    </section>
  );
}
