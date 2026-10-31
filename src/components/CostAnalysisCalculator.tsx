"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Check, ChevronDown, ChevronUp, Minus, Plus, Share2 } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { buildFeeProjection } from "@/lib/feeProjection";
import { buildSharedResultQuery } from "@/lib/qrLanding";
import {
  CalculatorState,
  DEFAULT_STATE,
  MIN_HORIZON_YEARS,
  buildQueryFromState,
} from "@/lib/calculatorState";
import { formatCompactCurrency, formatCurrency, formatCurrencyFloored } from "@/lib/format";
import { NoteMarker } from "@/components/CalculatorNotes";
import { homeCalculatorConfig } from "@/config/homeCalculatorConfig";
import { HomeFaqSection } from "@/components/HomeFaqSection";
import { SignupCta } from "@/components/SignupCta";
import { BluesOpening } from "@/components/blues/BluesOpening";
import { bluesCalculatorTheme, bluesControlClasses, bluesCopy, bluesLinks } from "@/config/onePercentBlues";
import { SmarterWayWealthVisitCard } from "@/components/SmarterWayWealthVisitCard";
import {
  HomeCalculatorExperience,
  type CalculatorSimpleControlNodes,
  type CalculatorSliderNodes,
} from "@/components/HomeCalculatorExperience";
import {
  HomeMarketingVariantId,
  homeMarketingVariants,
} from "@/config/homeMarketingVariants";
import type { HomeTopBannerId } from "@/config/homeTopBanners";
import { capturePostHogEvent } from "@/lib/posthog";
import {
  ADVANCED_CALCULATOR_URL,
} from "@/config/advancedCalculator";

const HomeMarketingHero = dynamic(() =>
  import("@/components/HomeMarketingHero").then((mod) => mod.HomeMarketingHero),
);
const HomeTopBanner = dynamic(() =>
  import("@/components/HomeTopBanner").then((mod) => mod.HomeTopBanner),
);
const QuoteTickerWithPortraits = dynamic(() => import("./QuoteTickerWithPortraits"));
const FeeQuoteDeck = dynamic(() =>
  import("@/components/FeeQuoteDeck").then((mod) => mod.FeeQuoteDeck),
);
const MathMotionField = dynamic(() =>
  import("@/components/MathMotionField").then((mod) => mod.MathMotionField),
);
const WhatWhyWhoHow = dynamic(() =>
  import("@/components/WhatWhyWhoHow").then((mod) => mod.WhatWhyWhoHow),
);
const ProFeeChart = dynamic(() =>
  import("@/components/charts/ProFeeChart").then((mod) => mod.ProFeeChart),
);
const PillSlider = dynamic(() =>
  import("@/components/PillSlider").then((mod) => mod.PillSlider),
);
const SavingsLeadHero = dynamic(() =>
  import("@/components/SavingsLeadHero").then((mod) => mod.SavingsLeadHero),
);
const StickyFeeBars = dynamic(() =>
  import("@/components/StickyFeeBars").then((mod) => mod.StickyFeeBars),
);

type IntroStyle = "rule" | "panel" | "quote";

function introStyleFromSearch(params: URLSearchParams): IntroStyle {
  const intro = params.get("intro");
  return intro === "rule" || intro === "quote" ? intro : "panel";
}

function getAssetTier(portfolioValue: number) {
  if (portfolioValue < 500000) return "under_500k";
  if (portfolioValue < 1000000) return "500k_1m";
  if (portfolioValue < 2500000) return "1m_2_5m";
  if (portfolioValue < 5000000) return "2_5m_5m";
  return "5m_plus";
}

const TIME_HORIZON_VALUES = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 20, 25, 30];

type Props = {
  initialState: CalculatorState;
  searchParams: Record<string, string | string[] | undefined>;
  marketingVariantId?: HomeMarketingVariantId;
  experienceMode?: "marketing" | "calculator-first" | "savings-calculator-upgrade" | "one-percent-blues";
  bannerId?: HomeTopBannerId;
};

interface SimpleRangeControlProps {
  formatter: (value: number) => string;
  /** Formats the min/max range hint beside the label. Defaults to
   *  `formatter` — pass a compact formatter (e.g. formatCompactCurrency)
   *  when the plain formatter would make the hint too wide for one line. */
  boundsFormatter?: (value: number) => string;
  label: string;
  /** Show the superscript disclaimer marker beside the label. */
  showNote?: boolean;
  max: number;
  min: number;
  onChange: (value: number) => void;
  step: number;
  value: number;
  /** Container box (border, fill, focus ring). Defaults to the green site's
   *  quiet grey box; the blue page passes a stronger blue treatment. */
  frameClassName?: string;
  /** Colour/hover/disabled classes shared by the +/- buttons. */
  buttonClassName?: string;
  /** Colour of the hairline between a button and the value. */
  dividerClassName?: string;
}

/**
 * Returns the run of characters inserted into `previous` to produce `next`,
 * or null when the edit was not a simple insertion.
 *
 * This backs the "typing replaces the whole number" behaviour. Selecting the
 * field's text on focus is the first line of defence, but iOS Safari routinely
 * collapses a programmatic selection to a caret right after focus, which is
 * what makes phone editing feel broken: the visitor taps 2000000, types "5",
 * and gets 5000000 or 20000005 instead of 5. When the selection did not
 * survive, the first keystroke arrives as an insertion into the old text —
 * this extracts what they actually typed so it can stand alone.
 */
function extractInsertedText(previous: string, next: string) {
  if (next.length <= previous.length) return null;

  let prefix = 0;
  while (prefix < previous.length && previous[prefix] === next[prefix]) prefix += 1;

  let suffix = 0;
  while (
    suffix < previous.length - prefix &&
    previous[previous.length - 1 - suffix] === next[next.length - 1 - suffix]
  ) {
    suffix += 1;
  }

  const inserted = next.slice(prefix, next.length - suffix);
  return inserted.length > 0 ? inserted : null;
}

function SimpleRangeControl({
  formatter,
  boundsFormatter = formatter,
  label,
  showNote,
  max,
  min,
  onChange,
  step,
  value,
  frameClassName = "rounded border border-[#DFE6EE] bg-[#FBFCFD] focus-within:border-[#108843] focus-within:ring-2 focus-within:ring-[#108843]/30",
  buttonClassName = "text-[#31506D] transition hover:bg-[#EEF3F7] disabled:cursor-not-allowed disabled:text-[#A8B5C2] disabled:hover:bg-transparent",
  dividerClassName = "border-[#DFE6EE]",
}: SimpleRangeControlProps) {
  const precision = useMemo(() => {
    const decimalPlaces = (number: number) => number.toString().split(".")[1]?.length ?? 0;
    return Math.max(decimalPlaces(min), decimalPlaces(max), decimalPlaces(step));
  }, [max, min, step]);

  const clampAndSnap = useCallback(
    (raw: number) => {
      const snapped = Number((min + Math.round((raw - min) / step) * step).toFixed(precision));
      return Math.min(max, Math.max(min, snapped));
    },
    [max, min, precision, step]
  );

  const slug = label.toLowerCase().replaceAll(" ", "-");
  const inputId = `final-${slug}-input`;

  // Editable text shadow of the current value. Null = show formatted value
  // derived from props; a string = the user is editing.
  const [draft, setDraft] = useState<string | null>(null);
  const displayValue = draft ?? formatter(value);
  // True between focus and the first keystroke: the whole value is meant to be
  // selected, so the next thing typed should replace it rather than join it.
  const replaceOnNextKeyRef = useRef(false);

  const selectAll = useCallback((input: HTMLInputElement) => {
    try {
      input.setSelectionRange(0, input.value.length);
    } catch {
      // Some browsers reject setSelectionRange on certain input types; the
      // insertion fallback in onChange covers this case.
    }
  }, []);
  const parseTextValue = useCallback((text: string) => {
    const cleaned = text.replace(/[^0-9.\-]/g, "");
    const numeric = Number.parseFloat(cleaned);
    return Number.isFinite(numeric) ? numeric : null;
  }, []);
  const parseDraft = useCallback(() => (draft === null ? null : parseTextValue(draft)), [draft, parseTextValue]);

  const commitDraft = useCallback((currentText?: string) => {
    const text = currentText ?? draft;
    if (text === null) return;
    // Strip $, %, commas, spaces — keep digits, decimal point, minus.
    const numeric = parseTextValue(text);
    if (numeric !== null) {
      onChange(clampAndSnap(numeric));
    }
    setDraft(null);
  }, [clampAndSnap, draft, onChange, parseTextValue]);

  const stepValue = useCallback(
    (delta: number) => {
      const numeric = parseDraft();
      const baseValue = numeric === null ? value : clampAndSnap(numeric);
      setDraft(null);
      onChange(clampAndSnap(baseValue + delta));
    },
    [clampAndSnap, onChange, parseDraft, value]
  );

  const canDecrease = value > min;
  const canIncrease = value < max;

  /* Label and stepper share one row at every width. The separate min-max
     hint LINE is gone (David, 2026-08-10) \u2014 that was its own row below the
     label, costing a line of height on a phone to restate what the +/-
     buttons and clamping already enforce. The hint text itself came back
     inline, same line as the label (canon range-hint fold-in,
     docs/plans/2026-08-12-calculator-canon.md in the sister repo, Phase
     B1) \u2014 same placement smarterwaywealth.com's AssumptionStepper uses, so
     it costs no extra row and keeps each control's footprint at the ~52px
     David's fix landed. */
  return (
    <div className="flex items-center justify-between gap-2">
      <label
        htmlFor={inputId}
        className="min-w-0 flex-1 text-[13px] font-bold leading-tight text-[#213B56]"
      >
        {label}
        {showNote ? <NoteMarker /> : null}{" "}
        <span className="whitespace-nowrap text-[11px] font-semibold text-[#7C8CA0]">
          ({boundsFormatter(min)}&ndash;{boundsFormatter(max)})
        </span>
      </label>
      <div className={`flex shrink-0 items-stretch overflow-hidden ${frameClassName}`}>
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => stepValue(-step)}
          disabled={!canDecrease}
          className={`grid h-9 w-9 place-items-center border-r ${dividerClassName} ${buttonClassName}`}
          aria-label={`Decrease ${label}`}
        >
          <Minus aria-hidden="true" size={14} strokeWidth={2.5} />
        </button>
        <input
          id={inputId}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          spellCheck={false}
          value={displayValue}
          onChange={(event) => {
            let nextDraft = event.target.value;

            if (replaceOnNextKeyRef.current) {
              replaceOnNextKeyRef.current = false;
              // Selection survived: nextDraft is already only what was typed.
              // Selection was collapsed (iOS): recover the typed run so it
              // replaces the old number instead of merging into it.
              const inserted = extractInsertedText(displayValue, nextDraft);
              if (inserted) nextDraft = inserted;
            }

            setDraft(nextDraft);
            const numeric = parseTextValue(nextDraft);
            if (numeric !== null) {
              onChange(clampAndSnap(numeric));
            }
          }}
          onFocus={(event) => {
            const input = event.currentTarget;
            setDraft(formatter(value));
            replaceOnNextKeyRef.current = true;
            // Defer so the value is in the DOM before selection, then retry:
            // iOS collapses the first attempt often enough to be worth it.
            requestAnimationFrame(() => selectAll(input));
            window.setTimeout(() => selectAll(input), 60);
          }}
          onBlur={(event) => {
            replaceOnNextKeyRef.current = false;
            commitDraft(event.currentTarget.value);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commitDraft(event.currentTarget.value);
              event.currentTarget.blur();
            } else if (event.key === "Escape") {
              event.preventDefault();
              replaceOnNextKeyRef.current = false;
              setDraft(null);
              event.currentTarget.blur();
            }
          }}
          className="h-9 min-w-[6ch] border-0 bg-transparent px-2 text-right text-base font-bold leading-none text-[#10233A] tabular-nums outline-none"
          style={{ width: `${Math.max(6, displayValue.length + 2)}ch` }}
          aria-label={`${label} value`}
        />
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => stepValue(step)}
          disabled={!canIncrease}
          className={`grid h-9 w-9 place-items-center border-l ${dividerClassName} ${buttonClassName}`}
          aria-label={`Increase ${label}`}
        >
          <Plus aria-hidden="true" size={14} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}


function normalizeSearchParams(searchParams: Record<string, string | string[] | undefined>) {
  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((entry) => params.append(key, entry));
    } else if (typeof value === "string") {
      params.set(key, value);
    }
  });
  return params;
}


export function CostAnalysisCalculator({
  bannerId = "founder-proof",
  experienceMode = "marketing",
  initialState,
  searchParams,
  marketingVariantId,
}: Props) {
  const isOnePercentBlues = experienceMode === "one-percent-blues";
  const eventMarketingVariant = isOnePercentBlues ? "one-percent-blues" : marketingVariantId;
  const marketingVariant = isOnePercentBlues
    ? undefined
    : homeMarketingVariants[marketingVariantId as HomeMarketingVariantId];
  const calculatorLayout = isOnePercentBlues
    ? "final-c"
    : (marketingVariant!.calculatorLayout ?? marketingVariant!.layout);
  const calculatorTheme = isOnePercentBlues ? bluesCalculatorTheme : marketingVariant!.calculator;
  const usesLegacyCalculatorChrome = calculatorLayout !== "final-c";
  const usesOpeningMarketingHero = experienceMode === "marketing";
  const usesShareControls = usesLegacyCalculatorChrome || usesOpeningMarketingHero;
  const paramsFromServer = useMemo(() => normalizeSearchParams(searchParams), [searchParams]);
  const mergedState = useMemo(
    () => ({
      ...DEFAULT_STATE,
      ...initialState,
    }),
    [initialState]
  );

  const [state, setState] = useState<CalculatorState>(mergedState);
  const [assumptionsCustomized, setAssumptionsCustomized] = useState(false);
  const [activeCard, setActiveCard] = useState<"smarter" | "traditional" | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<"idle" | "success" | "error">("idle");
  const [slidersExpanded, setSlidersExpanded] = useState(true);
  const [showMutualFundExpenses, setShowMutualFundExpenses] = useState(
    mergedState.mutualFundExpensePercent > 0
  );
  const [chartReady, setChartReady] = useState(false);
  const calculatorStartedRef = useRef(false);
  const calculatorSubmittedRef = useRef(false);
  const updateCalculatorState = useCallback((patch: Partial<CalculatorState>) => {
    const changedFields = Object.keys(patch);
    const nextState = { ...state, ...patch };

    if (!calculatorStartedRef.current) {
      calculatorStartedRef.current = true;
      capturePostHogEvent("calculator_started", {
        changed_fields: changedFields,
        first_changed_field: changedFields[0],
        experience_mode: experienceMode,
        marketing_variant: eventMarketingVariant,
        calculated_asset_tier: getAssetTier(nextState.portfolioValue),
        portfolio_value: nextState.portfolioValue,
        annual_fee_percent: nextState.annualFeePercent,
        mutual_fund_expense_percent: nextState.mutualFundExpensePercent,
        annual_growth_percent: nextState.annualGrowthPercent,
        years: nextState.years,
      });
    }

    setAssumptionsCustomized(true);
    setState((prev) => ({ ...prev, ...patch }));
  }, [experienceMode, eventMarketingVariant, state]);

  const totalAnnualFeePercent = state.annualFeePercent + state.mutualFundExpensePercent;

  const projection = useMemo(
    () =>
      buildFeeProjection({
        annualFlatFee: state.annualFlatFee,
        initialInvestment: state.portfolioValue,
        years: state.years,
        annualFeePercent: totalAnnualFeePercent,
        annualGrowthPercent: state.annualGrowthPercent,
      }),
    [state.annualFlatFee, state.annualGrowthPercent, state.portfolioValue, state.years, totalAnnualFeePercent]
  );
  const advancedCalculatorHref = ADVANCED_CALCULATOR_URL;

  useEffect(() => {
    if (!assumptionsCustomized || calculatorSubmittedRef.current) return;

    calculatorSubmittedRef.current = true;
    capturePostHogEvent("calculator_submitted", {
      submission_type: "instant_result_rendered",
      experience_mode: experienceMode,
      marketing_variant: eventMarketingVariant,
      calculated_asset_tier: getAssetTier(state.portfolioValue),
      portfolio_value: state.portfolioValue,
      annual_fee_percent: state.annualFeePercent,
      mutual_fund_expense_percent: state.mutualFundExpensePercent,
      total_annual_fee_percent: totalAnnualFeePercent,
      annual_growth_percent: state.annualGrowthPercent,
      years: state.years,
      projected_savings: Math.round(projection.savings),
      projected_total_asset_based_fees: Math.round(projection.totalFees),
      projected_total_flat_fees: Math.round(projection.totalFlatFees),
    });
  }, [assumptionsCustomized, experienceMode, eventMarketingVariant, projection.savings, projection.totalFees, projection.totalFlatFees, state, totalAnnualFeePercent]);

  const shareUrl = useMemo(() => {
    if (!usesShareControls) return "";
    if (typeof window === "undefined") return "";
    const query = buildSharedResultQuery(buildQueryFromState(state, paramsFromServer));
    const base = `${window.location.origin}${window.location.pathname}`;
    return `${base}?${query}`;
  }, [paramsFromServer, state, usesShareControls]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isDefaultState =
      state.portfolioValue === DEFAULT_STATE.portfolioValue &&
      state.years === DEFAULT_STATE.years &&
      state.annualGrowthPercent === DEFAULT_STATE.annualGrowthPercent &&
      state.annualFlatFee === DEFAULT_STATE.annualFlatFee &&
      state.annualFeePercent === DEFAULT_STATE.annualFeePercent &&
      state.mutualFundExpensePercent === DEFAULT_STATE.mutualFundExpensePercent;

    let query: string;
    if (isDefaultState) {
      // Default state on a fresh visit (e.g. mailed QR code) should not pollute
      // the address bar. Strip the calculator's own params but preserve any
      // unrelated query strings the server passed in (utm_*, variant, etc.).
      const params = new URLSearchParams(paramsFromServer ? paramsFromServer.toString() : undefined);
      params.delete("portfolio");
      params.delete("years");
      params.delete("growth");
      params.delete("fee");
      params.delete("flat");
      params.delete("mfe");
      query = params.toString();
    } else {
      query = buildQueryFromState(state, paramsFromServer);
    }

    const nextUrl = query
      ? `${window.location.pathname}?${query}${window.location.hash}`
      : `${window.location.pathname}${window.location.hash}`;
    const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (currentUrl !== nextUrl) {
      window.history.replaceState(window.history.state, "", nextUrl);
    }
  }, [paramsFromServer, state]);

  const shareSummary = useMemo(
    () =>
      usesShareControls
        ? [
            "Smarter Way Wealth projection",
            `Potential savings: ${formatCurrencyFloored(projection.savings)}`,
            `Portfolio value: ${formatCurrency(state.portfolioValue)}`,
            `Annual flat fee: ${formatCurrency(state.annualFlatFee)}`,
            `Advisory fee: ${state.annualFeePercent.toFixed(2)}%`,
            `Mutual fund expenses: ${state.mutualFundExpensePercent.toFixed(2)}%`,
            `Total annual fee load: ${totalAnnualFeePercent.toFixed(2)}%`,
            `Annual growth: ${state.annualGrowthPercent.toFixed(1)}%`,
            `Time horizon: ${state.years} years`,
            `Smarter Way Wealth value: ${formatCurrencyFloored(projection.finalValueWithoutFees)}`,
            `Traditional asset-based fee value: ${formatCurrencyFloored(projection.finalValueWithFees)}`,
            `Lost to asset-based fees: -${formatCurrencyFloored(projection.savings)}`,
          ].join("\n")
        : "",
    [projection.finalValueWithFees, projection.finalValueWithoutFees, projection.savings, state, totalAnnualFeePercent, usesShareControls]
  );

  const shareResult = useCallback(async () => {
    capturePostHogEvent("cta_clicked", {
      cta_label: "Share your result",
      cta_location: "calculator_share",
      cta_type: "share_result",
      experience_mode: experienceMode,
      marketing_variant: eventMarketingVariant,
      calculated_asset_tier: getAssetTier(state.portfolioValue),
      projected_savings: Math.round(projection.savings),
    });

    if (!shareUrl || typeof navigator === "undefined") {
      setShareFeedback("error");
      return;
    }

    const shareText = `${shareSummary}\n${shareUrl}`;

    try {
      if (typeof navigator.share === "function") {
        await navigator.share({
          title: "Smarter Way Wealth projection",
          text: shareSummary,
          url: shareUrl,
        });
        setShareFeedback("success");
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareText);
        setShareFeedback("success");
        return;
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }
      if (!(error instanceof Error && error.name === "NotAllowedError")) {
        console.error("Unable to share", error);
      }
    }

    setShareFeedback("error");
  }, [experienceMode, eventMarketingVariant, projection.savings, shareSummary, shareUrl, state.portfolioValue]);

  useEffect(() => {
    if (!usesOpeningMarketingHero) return;
    if (typeof document === "undefined") return;
    setIsDarkMode(document.documentElement.classList.contains("dark"));
  }, [usesOpeningMarketingHero]);

  useEffect(() => {
    if (!usesLegacyCalculatorChrome) return;
    setChartReady(true);
  }, [usesLegacyCalculatorChrome]);

  useEffect(() => {
    if (!usesShareControls || shareFeedback === "idle") return;
    const timeout = window.setTimeout(
      () => setShareFeedback("idle"),
      shareFeedback === "error" ? 12000 : 2200
    );
    return () => window.clearTimeout(timeout);
  }, [shareFeedback, usesShareControls]);

  const handleCardTap = (card: "smarter" | "traditional") => {
    setActiveCard((prev) => (prev === card ? null : card));
  };

  const calculatorRef = useRef<HTMLDivElement>(null);
  const [showDesktopBar, setShowDesktopBar] = useState(false);

  useEffect(() => {
    if (!usesOpeningMarketingHero) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowDesktopBar(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0 }
    );

    if (calculatorRef.current) {
      observer.observe(calculatorRef.current);
    }

    return () => observer.disconnect();
  }, [usesOpeningMarketingHero]);

  const isCalculatorFirst = experienceMode === "calculator-first";
  const isSavingsCalculatorUpgrade = experienceMode === "savings-calculator-upgrade";
  /* One Percent Blues (src/app/(blues), onepercentblues.com): the same
     engine behind a blue opening. It shares the lean home's calculator
     behaviour — inputs view, chart heading, no view tabs, disclaimer in the
     footer rather than the card — but not its grey section ground or the
     sections below it. */
  const usesLeanCalculator = isSavingsCalculatorUpgrade || isOnePercentBlues;

  const quoteSectionStyle = isDarkMode
    ? {
        backgroundColor: "#0B1220",
      }
    : {
        backgroundColor: homeCalculatorConfig.quoteSection.backgroundColor,
      };

  const shareButtonLabel = usesShareControls
    ? shareFeedback === "success"
      ? "Copied"
      : shareFeedback === "error"
        ? "Sharing unavailable"
        : "Share your result"
    : "Share your result";
  const ShareIcon = shareFeedback === "success" ? Check : Share2;
  const percentLost = usesLegacyCalculatorChrome
    ? projection.finalValueWithoutFees > 0
      ? Math.min(100, Math.max(0, (projection.savings / projection.finalValueWithoutFees) * 100))
      : 0
    : 0;

  const annualFlatFee = state.annualFlatFee;
  const monthlyFlatFee = annualFlatFee / 12;
  const annualAumFeeEstimate = state.portfolioValue * (totalAnnualFeePercent / 100);

  const collapseControl = usesLegacyCalculatorChrome ? (
    <button
      type="button"
      onClick={() => setSlidersExpanded((prev) => !prev)}
      className={`inline-flex min-h-8 items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-0 ${calculatorTheme.collapseButtonClassName}`}
      aria-expanded={slidersExpanded}
    >
      {slidersExpanded ? "Collapse" : "Expand"}
      {slidersExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
    </button>
  ) : null;

  const shareAction = usesLegacyCalculatorChrome ? (
    <div className="flex w-full max-w-sm flex-col items-stretch gap-2 sm:max-w-xs">
      <button
        type="button"
        onClick={shareResult}
        className={`inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg transition-colors ${calculatorTheme.shareButtonClassName}`}
        aria-label="Share your result"
      >
        <ShareIcon className="h-4 w-4" />
        {shareButtonLabel}
      </button>
      {shareFeedback === "error" && shareUrl ? (
        <input
          readOnly
          aria-label="Shareable result link"
          value={shareUrl}
          onFocus={(event) => event.currentTarget.select()}
          className={`h-10 w-full px-3 text-xs font-semibold text-[#213B56] outline-none ${
            isOnePercentBlues
              ? bluesControlClasses.frameClassName
              : "rounded-md border border-[#C9D8E4] bg-white shadow-sm focus:border-[#108843] focus:ring-2 focus:ring-[#108843]/20"
          }`}
        />
      ) : null}
    </div>
  ) : null;

  const disclosure = (
    <p className={`mt-3 text-xs leading-snug ${calculatorTheme.disclaimerClassName}`}>
      Illustrative calculator only. Not investment advice or an advisory relationship.
    </p>
  );

  const helperNotes = usesLegacyCalculatorChrome ? (
    <>
      <p className={`text-center text-xs ${calculatorTheme.helperTextClassName}`}>
        Compares our {formatCurrency(monthlyFlatFee)}/mo flat fee vs. a traditional AUM advisory fee, compounded monthly.{" "}
        <Link href="/our-math" className={calculatorTheme.linkClassName}>
          For finance nerds
        </Link>
      </p>
      <div className={`mx-auto mt-4 max-w-2xl space-y-2 text-center text-xs leading-snug ${calculatorTheme.helperTextClassName}`}>
        <p>
          Savings calculations are hypothetical illustrations based on
          assumptions you provide. Actual results will vary. This is not a
          guarantee of performance or savings.
        </p>
        <p>
          The annual growth rate above is an assumption you control, not a
          forecast or recommendation. Smarter Way Wealth does not guarantee the
          accuracy of third-party data.
        </p>
      </div>
    </>
  ) : null;

  const calculatorSliders: CalculatorSliderNodes | undefined = usesLegacyCalculatorChrome
    ? {
        advisoryFee: (
          <PillSlider
            label="Advisory fee"
            value={state.annualFeePercent}
            onChange={(v) => updateCalculatorState({ annualFeePercent: v })}
            format={(v) => `${v.toFixed(2)}%`}
            variant="destructive"
            theme={calculatorTheme.slider}
            min={0}
            max={3}
            step={0.05}
            labelAction={
              !showMutualFundExpenses ? (
                <button
                  type="button"
                  onClick={() => setShowMutualFundExpenses(true)}
                  className={`text-[11px] font-semibold tracking-wide transition-colors ${calculatorTheme.slider.addButtonClassName}`}
                >
                  + add mutual fund expenses
                </button>
              ) : undefined
            }
          />
        ),
        mutualFundExpenses: showMutualFundExpenses ? (
          <div className="mt-4">
            <PillSlider
              label="Mutual fund expenses"
              value={state.mutualFundExpensePercent}
              onChange={(v) => updateCalculatorState({ mutualFundExpensePercent: v })}
              format={(v) => `${v.toFixed(2)}%`}
              variant="destructive"
              theme={calculatorTheme.slider}
              pillColorOverride={marketingVariant?.layout === "advisor" ? "#FB7185" : "#7F1D1D"}
              min={0}
              max={3}
              step={0.05}
              labelAction={
                <button
                  type="button"
                  onClick={() => {
                    setShowMutualFundExpenses(false);
                    updateCalculatorState({ mutualFundExpensePercent: 0 });
                  }}
                  className={`text-[11px] font-semibold tracking-wide transition-colors ${calculatorTheme.slider.removeButtonClassName}`}
                >
                  remove
                </button>
              }
            />
          </div>
        ) : null,
        portfolio: (
          <PillSlider
            label="Portfolio value"
            value={state.portfolioValue}
            onChange={(v) => updateCalculatorState({ portfolioValue: v })}
            format={(v) => formatCurrency(v)}
            variant="accumulation"
            theme={calculatorTheme.slider}
            min={250000}
            max={5000000}
            step={50000}
          />
        ),
        growth: (
          <PillSlider
            label="Annual growth"
            value={state.annualGrowthPercent}
            onChange={(v) => updateCalculatorState({ annualGrowthPercent: v })}
            format={(v) => `${v.toFixed(1)}%`}
            variant="accumulation"
            theme={calculatorTheme.slider}
            min={4}
            max={12}
            step={0.5}
          />
        ),
        years: (
          <PillSlider
            label="Time horizon"
            value={state.years}
            onChange={(v) => updateCalculatorState({ years: v })}
            format={(v) => `${v} yrs`}
            variant="accumulation"
            theme={calculatorTheme.slider}
            values={TIME_HORIZON_VALUES}
          />
        ),
      }
    : undefined;

  /* On the blue page the four controls get the blue outline and fill
     (David, 2026-09-17: they were getting lost in the white). Elsewhere the
     props stay undefined and the control keeps its grey defaults. */
  const controlClasses = isOnePercentBlues ? bluesControlClasses : {};
  const simpleControls: CalculatorSimpleControlNodes = {
    portfolio: (
      <SimpleRangeControl
        {...controlClasses}
        label="Portfolio value"
        value={state.portfolioValue}
        onChange={(value) => updateCalculatorState({ portfolioValue: value })}
        formatter={(value) => formatCurrency(value)}
        boundsFormatter={(value) => formatCompactCurrency(value)}
        min={250000}
        max={5000000}
        step={100000}
      />
    ),
    years: (
      <SimpleRangeControl
        {...controlClasses}
        label="Years"
        value={state.years}
        onChange={(value) => updateCalculatorState({ years: Math.round(value) })}
        formatter={(value) => `${Math.round(value)}`}
        min={MIN_HORIZON_YEARS}
        max={40}
        step={1}
      />
    ),
    growth: (
      <SimpleRangeControl
        {...controlClasses}
        label="Annualized growth"
        value={state.annualGrowthPercent}
        onChange={(value) => updateCalculatorState({ annualGrowthPercent: value })}
        formatter={(value) => `${value.toFixed(2)}%`}
        min={3}
        max={12}
        step={0.25}
      />
    ),
    advisoryFee: (
      <SimpleRangeControl
        {...controlClasses}
        label="Asset-based fee"
        showNote
        value={state.annualFeePercent}
        onChange={(value) => updateCalculatorState({ annualFeePercent: value })}
        formatter={(value) => `${value.toFixed(2)}%`}
        min={0.25}
        max={2.5}
        step={0.1}
      />
    ),
  };

  const renderChart = usesLegacyCalculatorChrome
    ? (className: string) => (
        <div className={`relative w-full ${className} ${calculatorTheme.chartFrameClassName}`}>
          {chartReady ? (
            <ProFeeChart
              data={projection.series}
              finalLost={projection.savings}
              finalValueWithoutFees={projection.finalValueWithoutFees}
              finalValueWithFees={projection.finalValueWithFees}
              showSummary={false}
              activeScenario={activeCard}
              portfolioValue={state.portfolioValue}
              years={state.years}
              annualGrowthPercent={state.annualGrowthPercent}
              annualFeePercent={state.annualFeePercent}
              mutualFundExpensePercent={state.mutualFundExpensePercent}
              chartTheme={calculatorTheme.chart}
            />
          ) : (
            <div className={`flex h-full flex-col justify-between p-5 sm:p-8 ${calculatorTheme.chartFrameClassName}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className={`text-xs font-bold uppercase tracking-[0.18em] ${calculatorTheme.chart.mutedTextClassName}`}>
                    Calculator result
                  </p>
                  <p className={`mt-3 text-3xl font-semibold tracking-normal sm:text-5xl ${calculatorTheme.chart.strongTextClassName}`}>
                    {formatCurrencyFloored(projection.savings)}
                  </p>
                  <p className={`mt-2 text-sm ${calculatorTheme.chart.mutedTextClassName}`}>
                    Projected wealth difference over {state.years} years.
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-2xl font-bold text-red-700">{percentLost.toFixed(1)}%</p>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-700">lost</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                  <div className="h-3 rounded-full bg-[#007A2F]" style={{ width: "82%" }} />
                </div>
                <div className="h-3 w-full rounded-full bg-red-100 dark:bg-red-950/40">
                  <div className="h-3 rounded-full bg-red-500" style={{ width: `${Math.max(8, Math.min(88, percentLost * 4))}%` }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <div>
                  <p className={`font-semibold ${calculatorTheme.chart.strongTextClassName}`}>{formatCurrency(state.portfolioValue)}</p>
                  <p className={`text-xs ${calculatorTheme.chart.mutedTextClassName}`}>Starting value</p>
                </div>
                <div>
                  <p className={`font-semibold ${calculatorTheme.chart.strongTextClassName}`}>{state.annualGrowthPercent.toFixed(1)}%</p>
                  <p className={`text-xs ${calculatorTheme.chart.mutedTextClassName}`}>Growth</p>
                </div>
                <div>
                  <p className={`font-semibold ${calculatorTheme.chart.strongTextClassName}`}>{state.years} yrs</p>
                  <p className={`text-xs ${calculatorTheme.chart.mutedTextClassName}`}>Time</p>
                </div>
                <div>
                  <p className="font-semibold text-red-700">{totalAnnualFeePercent.toFixed(2)}%</p>
                  <p className={`text-xs ${calculatorTheme.chart.mutedTextClassName}`}>Fee load</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )
    : undefined;

  const bluesHandoff = isOnePercentBlues ? (
    <div className="relative z-10 mx-auto w-full max-w-[1040px] px-4 pt-3 sm:px-6 sm:pt-5">
      <h2 className="font-blues-serif text-[30px] font-semibold leading-[1.05] text-white sm:text-[40px]">
        {bluesCopy.calculatorHeading}
      </h2>
      <p className="mt-2 max-w-2xl text-base leading-6 text-white/90 sm:text-lg">{bluesCopy.calculatorSub}</p>
    </div>
  ) : null;

  const calculatorHandoff = isSavingsCalculatorUpgrade ? (
    <div className="section-shell relative z-10 pt-2 sm:pt-3">
      {/* NEVER hide this block behind an entrance animation; tests/home-first-screen.mjs asserts the heading is painted. */}
      <motion.div
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="mx-auto flex w-full max-w-[1380px] flex-col gap-3 text-left"
      >
        <div className="min-w-0">
          <h2 className="text-[clamp(2rem,8vw,3.25rem)] font-bold leading-[1.02] tracking-normal text-[#10233A]">
            Your Fee Calculator
          </h2>
          <p className="mt-1 max-w-2xl text-base leading-6 text-[#52657A] sm:text-lg">
            Use the calculator to see how much additional wealth you would keep by paying $100 a month instead of
            an asset-based fee.
          </p>
        </div>
      </motion.div>
    </div>
  ) : null;

  return (
    <>
      {isOnePercentBlues && (
        <BluesOpening
          savings={projection.savings}
          portfolioValue={state.portfolioValue}
          years={state.years}
          annualGrowthPercent={state.annualGrowthPercent}
          annualFeePercent={state.annualFeePercent}
          annualFlatFee={state.annualFlatFee}
          initialCheck={paramsFromServer.get("check")}
        />
      )}

      {isSavingsCalculatorUpgrade && (
        <SavingsLeadHero
          annualFeePercent={state.annualFeePercent}
          annualFlatFee={state.annualFlatFee}
          annualGrowthPercent={state.annualGrowthPercent}
          introStyle={introStyleFromSearch(paramsFromServer)}
          mutualFundExpensePercent={state.mutualFundExpensePercent}
          portfolioValue={state.portfolioValue}
          savings={projection.savings}
          years={state.years}
        />
      )}

      {usesOpeningMarketingHero && marketingVariant && (
        <HomeMarketingHero
          variant={marketingVariant}
          savings={projection.savings}
          portfolioValue={state.portfolioValue}
          years={state.years}
          annualGrowthPercent={state.annualGrowthPercent}
          annualFeePercent={state.annualFeePercent}
          mutualFundExpensePercent={state.mutualFundExpensePercent}
          onCalculatorChange={(patch) => updateCalculatorState(patch)}
          onShare={shareResult}
          shareButtonLabel={shareButtonLabel}
        />
      )}

      {usesOpeningMarketingHero && (
        <StickyFeeBars
          isDarkMode={isDarkMode}
          monthlyFlatFee={monthlyFlatFee}
          savings={projection.savings}
          showDesktopBar={showDesktopBar}
          smarterValue={projection.finalValueWithoutFees}
          traditionalValue={projection.finalValueWithFees}
        />
      )}

      <section
        id="calculator"
        ref={calculatorRef}
        className={`relative w-full scroll-mt-24 overflow-hidden ${
          isSavingsCalculatorUpgrade ? "bg-[#EEF0F5] text-slate-950" : calculatorTheme.sectionClassName
        }`}
      >
        <div
          className={`pointer-events-none absolute inset-0 ${
            isSavingsCalculatorUpgrade ? "bg-[#EEF0F5]" : calculatorTheme.backdropClassName
          }`}
        />

        {calculatorHandoff}
        {bluesHandoff}

        {isCalculatorFirst && (
          <HomeTopBanner
            bannerId={bannerId}
            savings={projection.savings}
            years={state.years}
          />
        )}

        <HomeCalculatorExperience
          layout={calculatorLayout}
          theme={calculatorTheme}
          series={projection.series}
          savings={projection.savings}
          percentLost={percentLost}
          finalValueWithoutFees={projection.finalValueWithoutFees}
          finalValueWithFees={projection.finalValueWithFees}
          portfolioValue={state.portfolioValue}
          years={state.years}
          annualGrowthPercent={state.annualGrowthPercent}
          annualFeePercent={state.annualFeePercent}
          mutualFundExpensePercent={state.mutualFundExpensePercent}
          totalAnnualFeePercent={totalAnnualFeePercent}
          totalAssetBasedFees={projection.totalFees}
          totalFlatFees={projection.totalFlatFees}
          annualAumFeeEstimate={annualAumFeeEstimate}
          annualFlatFee={annualFlatFee}
          shareAction={shareAction}
          disclosure={usesLeanCalculator ? null : disclosure}
          helperNotes={helperNotes}
          collapseControl={collapseControl}
          slidersExpanded={slidersExpanded}
          sliders={calculatorSliders}
          simpleControls={simpleControls}
          renderChart={renderChart}
          activeScenario={activeCard}
          assumptionsCustomized={assumptionsCustomized}
          showViewTabs={!usesLeanCalculator}
          initialView={usesLeanCalculator ? "inputs" : "header"}
          showChartHeading={usesLeanCalculator}
          onHighlightScenario={usesLegacyCalculatorChrome ? handleCardTap : undefined}
          onAssumptionChange={(patch) => updateCalculatorState(patch)}
        />

      </section>

      {isSavingsCalculatorUpgrade && <WhatWhyWhoHow />}

      {isSavingsCalculatorUpgrade && (
        <section className="relative overflow-hidden bg-[#EEF0F5]">
          <MathMotionField />
          <div className="relative z-10">
            <SignupCta location="home_post_calculator" surfaceClassName="bg-transparent" />
            <FeeQuoteDeck />
            <SmarterWayWealthVisitCard
              advancedCalculatorHref={advancedCalculatorHref}
              surfaceClassName="bg-transparent"
            />
            <div aria-hidden="true" className="h-10 sm:h-14" />
          </div>
        </section>
      )}

      {isSavingsCalculatorUpgrade && <HomeFaqSection topPaddingClassName="pt-0" />}

      {isSavingsCalculatorUpgrade && <SignupCta location="home_post_faq" />}

      {/* One Percent Blues: the site's standard conversion block, then the
          same three FAQ questions, both on the page gradient. */}
      {isOnePercentBlues && (
        <SignupCta location="blues_post_calculator" surfaceClassName="bg-transparent" primaryHref={bluesLinks.signup} />
      )}

      {isOnePercentBlues && <HomeFaqSection tone="blues" />}

      {usesOpeningMarketingHero && (
        <SignupCta location="marketing_post_calculator" />
      )}

      {usesOpeningMarketingHero && (
        <section
          className="relative w-full overflow-hidden py-12 sm:py-16"
          style={quoteSectionStyle}
        >
          <QuoteTickerWithPortraits
            label={homeCalculatorConfig.quoteTicker.label}
            subLabel={homeCalculatorConfig.quoteTicker.subLabel}
          />
        </section>
      )}

      {usesOpeningMarketingHero && (
        <SignupCta location="marketing_page_bottom" />
      )}
    </>
  );
}
