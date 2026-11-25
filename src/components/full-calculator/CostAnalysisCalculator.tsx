"use client";

// Firm-site copy (smarterwaywealth.com, same file name) for the hidden
// /calculator page only (fee-lab stage 1, section 1). Not this site's
// canon-mirrored file of the same name, which is unchanged. The CANON banner
// below belongs to the firm site's copy.

// CANON: shared verbatim with the sister repo (youarepayingtoomuch.com,
// D:\ria-marketing-page). Edit both repos in the same session or CI fails.
// See CALCULATOR-CANON.md.

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  CalculatorState,
  DEFAULT_STATE,
  buildQueryFromState,
} from "@/lib/full-calculator/calculatorState";
import { MIN_HORIZON_YEARS } from "@/data/sp500Returns";
import {
  buildFeeProjection,
  effectiveAnnualAdvisoryRate,
  type MarginalFeeTier,
} from "@/lib/feeProjection";
import {
  formatCompactCurrency,
  formatCurrency,
} from "@/lib/format";
import {
  HomeCalculatorExperience,
  type CalculatorSimpleControlNodes,
} from "@/components/full-calculator/HomeCalculatorExperience";
import { AssumptionStepper } from "@/components/calculator/AssumptionStepper";
import {
  FeeScheduleSummaryRow,
  InlineFeeScheduleEditor,
  TieredAdvisoryFeeDisplay,
  type InlineFeeScheduleEditorHandle,
} from "@/components/calculator/InlineFeeScheduleEditor";
import { capturePostHogEvent } from "@/lib/posthog";

type CostAnalysisCalculatorProps = {
  advisoryFeeTiers?: readonly MarginalFeeTier[] | null;
  searchParams?: Record<string, string | string[] | undefined>;
  /** True when a surrounding control row already draws the card and the
   *  page padding, so this component renders flush inside it. */
  embedded?: boolean;
  /** Reports the current result to surrounding calculator chrome. */
  onPotentialSavingsChange?: (savings: number) => void;
  onApplyFeeSchedule?: (schedule: MarginalFeeTier[]) => void;
  onReturnToScalarFee?: () => void;
  /** Reports current assumptions to the shared sticky summary. */
  onStateChange?: (state: CalculatorState) => void;
  /** Smarter Way Wealth's step-by-step /calculator only (2026-11-10): passed
   *  straight through to HomeCalculatorExperience. Omitted everywhere else. */
  resultsOnly?: boolean;
  afterResults?: ReactNode;
  /** Shown in place of the ending values and chart (the step calculator's answer). */
  resultsReplacement?: ReactNode;
};

function normalizeSearchParams(
  searchParams?: Record<string, string | string[] | undefined>,
) {
  const params = new URLSearchParams();
  if (!searchParams) return params;

  Object.entries(searchParams).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((entry) => params.append(key, entry));
    } else if (typeof value === "string") {
      params.set(key, value);
    }
  });
  return params;
}

function parseNumber(value: string | null, fallback: number, min: number, max: number) {
  if (value === null) return fallback;
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function parseInteger(value: string | null, fallback: number, min: number, max: number) {
  if (value === null) return fallback;
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.round(parsed)));
}

function stateFromSearchParams(
  base: CalculatorState,
  params: URLSearchParams,
): CalculatorState {
  return {
    annualFlatFee: parseNumber(params.get("flat"), base.annualFlatFee, 0, 12000),
    portfolioValue: parseNumber(params.get("portfolio"), base.portfolioValue, 250000, 10000000),
    years: parseInteger(params.get("years"), base.years, MIN_HORIZON_YEARS, 40),
    annualGrowthPercent: parseNumber(params.get("growth"), base.annualGrowthPercent, 3, 14),
    annualFeePercent: parseNumber(params.get("fee"), base.annualFeePercent, 0, 3),
    mutualFundExpensePercent: parseNumber(
      params.get("mfe"),
      base.mutualFundExpensePercent,
      0,
      3,
    ),
  };
}

function isDefaultCalculatorState(state: CalculatorState) {
  return (
    state.portfolioValue === DEFAULT_STATE.portfolioValue &&
    state.years === DEFAULT_STATE.years &&
    state.annualGrowthPercent === DEFAULT_STATE.annualGrowthPercent &&
    state.annualFlatFee === DEFAULT_STATE.annualFlatFee &&
    state.annualFeePercent === DEFAULT_STATE.annualFeePercent &&
    state.mutualFundExpensePercent === DEFAULT_STATE.mutualFundExpensePercent
  );
}

export function CostAnalysisCalculator({
  advisoryFeeTiers = null,
  onApplyFeeSchedule,
  onPotentialSavingsChange,
  onReturnToScalarFee,
  onStateChange,
  searchParams,
  embedded = false,
  resultsOnly = false,
  afterResults = null,
  resultsReplacement = null,
}: CostAnalysisCalculatorProps) {
  const paramsFromServer = useMemo(() => normalizeSearchParams(searchParams), [searchParams]);
  const initialCalculatorState = useMemo(
    () => stateFromSearchParams(DEFAULT_STATE, paramsFromServer),
    [paramsFromServer],
  );

  const [state, setState] = useState<CalculatorState>(initialCalculatorState);
  const feeScheduleEditorRef = useRef<InlineFeeScheduleEditorHandle>(null);
  const [feeScheduleEditorOpen, setFeeScheduleEditorOpen] = useState(false);
  const [assumptionsCustomized, setAssumptionsCustomized] = useState(false);
  const calculatorStartedRef = useRef(false);
  const calculatorSubmittedRef = useRef(false);

  const marketingVariantId = "final-home" as const;
  const effectiveAnnualAdvisoryPercent = advisoryFeeTiers
    ? effectiveAnnualAdvisoryRate(state.portfolioValue, advisoryFeeTiers)
    : state.annualFeePercent;
  const totalAnnualFeePercent = effectiveAnnualAdvisoryPercent + state.mutualFundExpensePercent;

  const projection = useMemo(
    () =>
      buildFeeProjection({
        annualFlatFee: state.annualFlatFee,
        initialInvestment: state.portfolioValue,
        years: state.years,
        annualFeePercent: state.annualFeePercent,
        advisoryFeeTiers: advisoryFeeTiers ?? undefined,
        annualFundExpensePercent: state.mutualFundExpensePercent,
        annualGrowthPercent: state.annualGrowthPercent,
      }),
    [advisoryFeeTiers, state.annualFeePercent, state.annualFlatFee, state.annualGrowthPercent, state.mutualFundExpensePercent, state.portfolioValue, state.years],
  );

  useEffect(() => {
    onPotentialSavingsChange?.(projection.savings);
  }, [onPotentialSavingsChange, projection.savings]);

  useEffect(() => {
    onStateChange?.(state);
  }, [onStateChange, state]);

  const updateCalculatorState = useCallback(
    (patch: Partial<CalculatorState>) => {
      const changedFields = Object.keys(patch);

      if (!calculatorStartedRef.current) {
        calculatorStartedRef.current = true;
        capturePostHogEvent("calculator_started", {
          changed_fields: changedFields,
          first_changed_field: changedFields[0],
          experience_mode: "sww_save",
          marketing_variant: marketingVariantId,
        });
      }

      setAssumptionsCustomized(true);
      setState((prev) => ({ ...prev, ...patch }));
    },
    [marketingVariantId],
  );

  useEffect(() => {
    if (!assumptionsCustomized || calculatorSubmittedRef.current) return;

    calculatorSubmittedRef.current = true;
    capturePostHogEvent("calculator_submitted", {
      submission_type: "instant_result_rendered",
      experience_mode: "sww_save",
      marketing_variant: marketingVariantId,
    });
  }, [assumptionsCustomized, marketingVariantId]);

  useEffect(() => {
    // The composed calculator already writes the complete scenario, including
    // the return mode and saved fee schedule.
    if (embedded || typeof window === "undefined") return;

    let query: string;
    if (isDefaultCalculatorState(state)) {
      const params = new URLSearchParams(paramsFromServer.toString());
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
  }, [embedded, paramsFromServer, state]);

  const simpleControls: CalculatorSimpleControlNodes = {
    portfolio: (
      <AssumptionStepper
        idPrefix="basic"
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
      <AssumptionStepper
        idPrefix="basic"
        label="Years"
        value={state.years}
        onChange={(value) => updateCalculatorState({ years: Math.round(value) })}
        formatter={(value) => `${Math.round(value)}`}
        boundsFormatter={(value) => `${Math.round(value)}`}
        min={MIN_HORIZON_YEARS}
        max={40}
        step={1}
      />
    ),
    growth: (
      <AssumptionStepper
        idPrefix="basic"
        label="Annualized growth"
        value={state.annualGrowthPercent}
        onChange={(value) => updateCalculatorState({ annualGrowthPercent: value })}
        formatter={(value) => `${value.toFixed(2)}%`}
        boundsFormatter={(value) => `${Math.round(value)}%`}
        min={3}
        max={14}
        step={0.25}
      />
    ),
    advisoryFee: (
      <div data-fee-schedule-cell>
        {advisoryFeeTiers ? (
          <TieredAdvisoryFeeDisplay />
        ) : (
          <AssumptionStepper
            idPrefix="basic"
            label="Asset-based fee"
            value={state.annualFeePercent}
            onChange={(value) => updateCalculatorState({ annualFeePercent: value })}
            formatter={(value) => `${value.toFixed(2)}%`}
            boundsFormatter={(value) => `${value.toFixed(2)}%`}
            min={0.25}
            max={2.5}
            step={0.1}
          />
        )}
      </div>
    ),
    feeSchedule: onApplyFeeSchedule && onReturnToScalarFee ? (
      <div className="grid gap-2">
        <FeeScheduleSummaryRow
          savedSchedule={advisoryFeeTiers}
          annualRatePercent={effectiveAnnualAdvisoryPercent}
          isOpen={feeScheduleEditorOpen}
          editorId="basic-fee-schedule-editor"
          onOpen={() => feeScheduleEditorRef.current?.open()}
        />
        <InlineFeeScheduleEditor
          ref={feeScheduleEditorRef}
          savedSchedule={advisoryFeeTiers}
          scalarRatePercent={state.annualFeePercent}
          portfolioValue={state.portfolioValue}
          onApplySchedule={onApplyFeeSchedule}
          onReturnToScalar={onReturnToScalarFee}
          showRateSummary={false}
          hideTrigger
          editorId="basic-fee-schedule-editor"
          onOpenChange={setFeeScheduleEditorOpen}
        />
      </div>
    ) : null,
  };

  const calculator = (
    <HomeCalculatorExperience
      series={projection.series}
      savings={projection.savings}
      finalValueWithoutFees={projection.finalValueWithoutFees}
      finalValueWithFees={projection.finalValueWithFees}
      portfolioValue={state.portfolioValue}
      years={state.years}
      annualGrowthPercent={state.annualGrowthPercent}
      annualFeePercent={effectiveAnnualAdvisoryPercent}
      mutualFundExpensePercent={state.mutualFundExpensePercent}
      totalAnnualFeePercent={totalAnnualFeePercent}
      usesTieredFeeSchedule={Boolean(advisoryFeeTiers)}
      totalAssetBasedFees={projection.totalFees}
      totalFlatFees={projection.totalFlatFees}
      annualFlatFee={state.annualFlatFee}
      shareAction={null}
      disclosure={null}
      simpleControls={simpleControls}
      embedded={embedded}
      showChartHeading
      resultsOnly={resultsOnly}
      afterResults={afterResults}
      resultsReplacement={resultsReplacement}
      onAssumptionChange={(patch) => updateCalculatorState(patch)}
    />
  );

  const shellClassName = embedded
    ? "scroll-mt-24"
    : "scroll-mt-24 bg-[#EEF0F5] pb-8 sm:pb-12";

  // Nested inside ThemedCalculatorExperience, which already owns
  // id="calculator" and the matching landmark label. Repeating them here
  // would leave two identical landmarks on the live page.
  if (embedded) {
    return (
      <div
        data-calc-theme="light"
        className={shellClassName}
      >
        {calculator}
      </div>
    );
  }

  return (
    <section
      id="calculator"
      aria-label="Fee comparison calculator"
      // The shared assumption control resolves its colours from the
      // calculator theme variables, so the basic calculator scopes them too
      // rather than depending on whatever wrapper happens to be above it.
      data-calc-theme="light"
      className={shellClassName}
    >
      {calculator}
    </section>
  );
}
