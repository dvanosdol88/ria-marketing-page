"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Quiz } from "@/components/Quiz";
import { CALCULATOR_MODE_PARAM, resolveCalculatorMode, type CalculatorMode } from "@/lib/calculatorMode";
import {
  DEFAULT_TIERED_SCHEDULE,
  buildDetailedCalculatorQuery,
  parseDetailedCalculatorState,
  type DetailedCalculatorState,
} from "@/lib/full-calculator/calculatorState";
import {
  CALCULATOR_MODEL_VERSION,
  buildFeeProjection,
  calculateMarginalAnnualFee,
  effectiveAnnualAdvisoryRate,
  type MarginalFeeTier,
} from "@/lib/feeProjection";
import { buildGapDecomposition } from "@/lib/gapDecomposition";
import { buildShareSummary } from "@/lib/shareSummary";
import { siteCalculatorConfig } from "@/lib/siteCalculatorConfig";
import { ScheduleCallButton } from "@/components/ScheduleCallButton";
import { fullCalculatorSite } from "@/config/full-calculator/fullCalculatorSite";
import {
  clampYearsForEnd,
  getWindowAnnualizedReturnPercent,
  getWindowReturnPercents,
} from "@/data/sp500Returns";
import { formatCurrency } from "@/lib/format";
import { CalculationDetailsPanel } from "./CalculationDetailsPanel";
import { ShareMyResults } from "./ShareMyResults";
import { ThemedCalculatorExperience, type ThemedCalculatorSnapshot } from "./ThemedCalculatorExperience";

function csvCell(value: string | number) {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** Mirrors ThemedCalculatorExperience's own helper — the page hands search
 *  params down as a plain record; the parser wants the real thing. */
function searchParamsToQuery(
  searchParams?: Record<string, string | string[] | undefined>,
): URLSearchParams {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams ?? {})) {
    if (Array.isArray(value)) {
      for (const entry of value) query.append(key, entry);
    } else if (typeof value === "string") {
      query.set(key, value);
    }
  }
  return query;
}

/**
 * The canon composed experience: the shared themed chrome (Steady/Market
 * return tabs, collapse, sticky header, fee-schedule editor) plus the
 * share/details/poll stack below it, wired live to whichever mode the
 * reader is using — every section reads the same inputs the visitor is
 * manipulating ("one brain"). See docs/plans/2026-08-12-calculator-canon.md,
 * Task A2.2.
 *
 * Reuses ThemedCalculatorExperience for the chrome (as of the A3 fix wave,
 * seeded with two new optional props — initialMarketEndYear,
 * initialSavedFeeSchedule — so a full-state URL restores faithfully, not
 * just the six base assumption fields) and reads its `onExperienceStateChange`
 * snapshot to assemble the same inputs the retired DetailedFeeCalculator
 * assembled (projection, decomposition, shareSummaryInput,
 * canonicalUrl/shareCardPath) — the same production engine, the same
 * share/details/poll components, so a link generated here (or any legacy
 * /calculator link carrying the same query shape) reproduces the identical
 * scenario on load: the produced query and the rendered page can no longer
 * disagree, because both this component's initial seed AND
 * generateMetadata/the share-card route all read the query through
 * parseDetailedCalculatorState. See canon-a3-report.md, Finding 1.
 */
export function CanonCalculatorExperience({
  experienceMode = "sww_calculator",
  initialMode,
  productionCommit = "local",
  searchParams,
  showStickyHeader = true,
  simpleView = false,
  afterResults = null,
  resultsReplacement = null,
  variantId = "calculator-canon",
}: {
  experienceMode?: string;
  initialMode?: CalculatorMode;
  /** Sentry/debug breadcrumb only, mirroring DetailedFeeCalculator's
   *  data-production-commit attribute. Read server-side from
   *  process.env.VERCEL_GIT_COMMIT_SHA by the page and passed down, since a
   *  "use client" component cannot read a non-NEXT_PUBLIC_ env var itself. */
  productionCommit?: string;
  searchParams?: Record<string, string | string[] | undefined>;
  showStickyHeader?: boolean;
  /** Passed to ThemedCalculatorExperience: the step-by-step /calculator's
   *  first results (ending values and chart, no controls). */
  simpleView?: boolean;
  afterResults?: ReactNode;
  /** Shown in place of the ending values and chart (the step calculator's
   *  answer). As a function it receives the "Share my results" control, which
   *  then sits inside the answer instead of in the share card below
   *  (David, 2026-11-11: "Put the Share My Result button right below that"). */
  resultsReplacement?: ReactNode | ((share: ReactNode) => ReactNode);
  variantId?: string;
}) {
  // Full-state seed (A3 fix wave, Finding 1): parseDetailedCalculatorState
  // reads every field a produced share link carries — the six base
  // assumptions AND returnMode/marketEndYear/feeMode/feeTiers — using the
  // SAME [0, 50M] portfolio clamp generateMetadata and the share-card route
  // already use, so the unfurl card and the landing page can never disagree
  // about the scenario a share link encodes. Computed once per mount (the
  // reader's own edits must not be fought by re-deriving this later).
  const [initialDetailedState] = useState(() =>
    parseDetailedCalculatorState(searchParamsToQuery(searchParams)),
  );

  // "calc" wins when present — it's the narrower, mode-only param a reader
  // might land with (e.g. the Steady/Market chrome's own URL sync). Absent
  // "calc", fall back to the parsed returnMode: parseDetailedCalculatorState
  // already defaults returnMode to "market" when "return" is absent too, so
  // this reduces to the historical "advanced" default with no extra branch.
  const resolvedInitialMode: CalculatorMode = initialMode ?? (
    searchParamsToQuery(searchParams).has(CALCULATOR_MODE_PARAM)
      ? resolveCalculatorMode(searchParams)
      : initialDetailedState.returnMode === "steady" ? "basic" : "advanced"
  );

  // A saved tiered schedule only ever reaches ThemedCalculatorExperience's
  // (and therefore MarketTimeMachine/CostAnalysisCalculator's) own
  // savedFeeSchedule state via its onApplySchedule callback, which
  // InlineFeeScheduleEditor only ever calls with already-validated tiers —
  // parseFeeTiers (inside parseDetailedCalculatorState) applies that same
  // validation to the URL, so this seed is exactly as trustworthy.
  const initialSavedFeeSchedule = initialDetailedState.feeMode === "tiered"
    ? initialDetailedState.feeTiers
    : null;

  // Seeded deterministically from the same searchParams the chrome itself
  // parses, so the first paint (before the chrome's own effects report back)
  // already shows the right numbers instead of a flash of house defaults.
  const [snapshot, setSnapshot] = useState<ThemedCalculatorSnapshot>(() => ({
    mode: resolvedInitialMode,
    calculatorState: initialDetailedState,
    marketEndYear: initialDetailedState.marketEndYear,
    savedFeeSchedule: initialSavedFeeSchedule,
  }));
  const [origin, setOrigin] = useState("");
  const [sharePanelOpen, setSharePanelOpen] = useState(false);
  const stackSectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const openSharePanel = () => {
    setSharePanelOpen(true);
    const inAnswer = typeof resultsReplacement === "function" ? document.querySelector("[data-step-answer-share-button]") : null;
    if (inAnswer) {
      inAnswer.scrollIntoView({ behavior: "smooth", block: "center" });
    } else if (typeof stackSectionRef.current?.scrollIntoView === "function") {
      stackSectionRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const { mode, calculatorState, marketEndYear, savedFeeSchedule } = snapshot;
  const returnMode: DetailedCalculatorState["returnMode"] = mode === "advanced" ? "market" : "steady";
  const effectiveYears = returnMode === "market"
    ? clampYearsForEnd(calculatorState.years, marketEndYear)
    : calculatorState.years;
  const marketFirstYear = marketEndYear - effectiveYears + 1;
  const feeMode: DetailedCalculatorState["feeMode"] = savedFeeSchedule ? "tiered" : "single";
  const feeTiers = savedFeeSchedule ?? DEFAULT_TIERED_SCHEDULE;
  // Mirrors DetailedFeeCalculator's activeTiers: the single-rate scalar
  // expressed as a one-tier schedule, so the same calculateMarginalAnnualFee
  // call works for either fee mode when building the CSV export below.
  const activeTiers: MarginalFeeTier[] = feeMode === "tiered"
    ? feeTiers
    : [{ upTo: null, annualRatePercent: calculatorState.annualFeePercent }];
  const startingAnnualFee = calculateMarginalAnnualFee(calculatorState.portfolioValue, activeTiers);

  // The equivalent DetailedCalculatorState — the exact shape /calculator
  // (parseDetailedCalculatorState) expects, so buildDetailedCalculatorQuery
  // of this object is what makes the produced share link round-trip.
  const detailedState: DetailedCalculatorState = useMemo(() => ({
    ...calculatorState,
    feeMode,
    feeTiers,
    returnMode,
    marketEndYear,
  }), [calculatorState, feeMode, feeTiers, marketEndYear, returnMode]);

  const projection = useMemo(() => buildFeeProjection({
    annualFlatFee: calculatorState.annualFlatFee,
    initialInvestment: calculatorState.portfolioValue,
    years: effectiveYears,
    annualFeePercent: calculatorState.annualFeePercent,
    advisoryFeeTiers: feeMode === "tiered" ? feeTiers : undefined,
    annualFundExpensePercent: calculatorState.mutualFundExpensePercent,
    annualGrowthPercent: calculatorState.annualGrowthPercent,
    annualReturnPercents: returnMode === "market" ? getWindowReturnPercents(effectiveYears, marketEndYear) : undefined,
    firstCalendarYear: returnMode === "market" ? marketFirstYear : undefined,
  }), [calculatorState, effectiveYears, feeMode, feeTiers, marketEndYear, marketFirstYear, returnMode]);

  const decomposition = useMemo(() => buildGapDecomposition(projection), [projection]);
  const monthlyFlatFee = calculatorState.annualFlatFee / 12;
  const realizedReturn = returnMode === "market"
    ? getWindowAnnualizedReturnPercent(effectiveYears, marketEndYear)
    : calculatorState.annualGrowthPercent;
  const returnLabel = returnMode === "market"
    ? `S&P 500 total returns, ${marketFirstYear}–${marketEndYear}`
    : `${calculatorState.annualGrowthPercent}% steady annual return`;
  const startingEffectiveRate = feeMode === "tiered"
    ? effectiveAnnualAdvisoryRate(calculatorState.portfolioValue, feeTiers)
    : calculatorState.annualFeePercent;
  const feeLabel = feeMode === "single"
    ? `${calculatorState.annualFeePercent.toFixed(2)}% asset-based fee`
    : `Tiered schedule (${feeTiers.length} tiers, ${startingEffectiveRate.toFixed(3)}% starting effective rate)`;
  const marketWindow = `${marketFirstYear}–${marketEndYear}`;

  const summaryInput = useMemo(() => ({
    savings: projection.savings,
    flatEndingValue: projection.finalValueWithoutFees,
    traditionalEndingValue: projection.finalValueWithFees,
    portfolioValue: calculatorState.portfolioValue,
    years: effectiveYears,
    monthlyFlatFee,
    returnLabel,
    feeLabel,
    returnMode,
    growthPercent: realizedReturn,
    marketWindow,
  }), [
    calculatorState.portfolioValue,
    effectiveYears,
    feeLabel,
    marketWindow,
    monthlyFlatFee,
    projection,
    realizedReturn,
    returnLabel,
    returnMode,
  ]);

  // Share links remain a clean, canonical calculator scenario. The address
  // bar separately merges that canonical state into the incoming query so a
  // /save handoff cannot erase campaign attribution or other caller-owned
  // parameters during client normalization.
  const calculatorQuery = buildDetailedCalculatorQuery(detailedState);
  const addressBarQuery = buildDetailedCalculatorQuery(
    detailedState,
    searchParamsToQuery(searchParams),
  );
  // Fee site: a link shared from the full calculator reopens /calculator
  // with the whole detailed scenario, and its card draws that scenario
  // (fullCalculatorSite; the home page keeps siteCalculatorConfig's links).
  const shareCardPath = fullCalculatorSite.buildShareCardPath(calculatorQuery);
  const canonicalUrl = origin ? fullCalculatorSite.buildShareUrl(origin, calculatorQuery) : "";

  // Address-bar sync (A3 fix wave, Finding 2): restores the guarded
  // replaceState pattern the retired DetailedFeeCalculator had, so the
  // visible URL is a faithful, reloadable snapshot of the live scenario —
  // not just the generated share link. addressBarQuery above is already
  // computed unconditionally every render from detailedState; unlike
  // DetailedFeeCalculator's free-text tier inputs (which could go
  // transiently invalid mid-keystroke, hence its own guarded "" fallback),
  // Canon's feeTiers only ever come from an already-validated
  // savedFeeSchedule or the always-valid DEFAULT_TIERED_SCHEDULE, so
  // buildDetailedCalculatorQuery can't throw here — if it ever did, this
  // component would already have crashed synchronously during render,
  // before this effect could run, so no separate guard is needed.
  //
  // Reconciled with ThemedCalculatorExperience's own calc-param-only
  // replaceState (fired synchronously on a mode-button click, for
  // immediate feedback): that write and this effect's write don't fight —
  // buildDetailedCalculatorQuery always deletes "calc"/"mode" and encodes
  // the mode as "return" instead, so the two never disagree about param
  // names, and this effect's dependency (calculatorQuery, derived from the
  // reported snapshot) settles moments after the click-triggered write,
  // replacing it with the complete, canonical query. Both use
  // replaceState (never pushState), so back/forward history is never
  // polluted by the brief two-write sequence.
  useEffect(() => {
    const next = `${window.location.pathname}?${addressBarQuery}${window.location.hash}`;
    const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (current !== next) window.history.replaceState(window.history.state, "", next);
  }, [addressBarQuery]);
  const summary = useMemo(
    () => (canonicalUrl
      ? buildShareSummary({
          ...summaryInput,
          firmDisplayName: siteCalculatorConfig.firmDisplayName,
          url: canonicalUrl,
          pollUrl: `${canonicalUrl}#poll`,
        })
      : null),
    [summaryInput, canonicalUrl],
  );
  const returnModeNote = returnMode === "market"
    ? `The model replays actual S&P 500 calendar-year total returns for ${marketFirstYear}–${marketEndYear}, compounds monthly, applies the asset-based fee schedule monthly, and Smarter Way Wealth's flat ${formatCurrency(monthlyFlatFee)}/month fee. Values are nominal, before taxes, and exclude inflation, trading costs, cash flows, and other expenses unless entered above.`
    : `The model assumes a constant ${calculatorState.annualGrowthPercent}% annual growth rate, compounds monthly, applies the asset-based fee schedule monthly, and Smarter Way Wealth's flat ${formatCurrency(monthlyFlatFee)}/month fee. Values are nominal, before taxes, and exclude inflation, trading costs, cash flows, and other expenses unless entered above.`;

  // Ported from DetailedFeeCalculator.tsx's downloadResults: a visitor-side
  // CSV export generated entirely in the browser, without a server round-trip.
  const downloadResults = () => {
    const lines: Array<Array<string | number>> = [
      [`${siteCalculatorConfig.firmDisplayName} detailed fee comparison`],
      ["Model version", CALCULATOR_MODEL_VERSION],
      ["Return model", returnMode],
      ["Portfolio", calculatorState.portfolioValue],
      ["Years", effectiveYears],
      ["Annual flat fee", calculatorState.annualFlatFee],
      ["Steady annual return percent", returnMode === "steady" ? calculatorState.annualGrowthPercent : "not used"],
      ["Historical window", returnMode === "market" ? `${marketFirstYear}-${marketEndYear}` : "not used"],
      ["Advisory fee mode", feeMode],
      ...(feeMode === "tiered"
        ? activeTiers.map((tier, index) => [
            `Advisory tier ${index + 1}`,
            `${index === 0 ? 0 : activeTiers[index - 1].upTo}-${tier.upTo ?? "no upper limit"} at ${tier.annualRatePercent}%`,
          ])
        : [["Single annual advisory fee percent", calculatorState.annualFeePercent]]),
      ["Starting annual advisory fee", startingAnnualFee],
      ["Starting effective advisory rate percent", startingEffectiveRate],
      ["Fund expense percent", calculatorState.mutualFundExpensePercent],
      [],
      ["Year", "Calendar year", "Return percent", "Flat-fee ending balance", "Traditional ending balance", "Advisory fee paid", "Fund expense paid", "Difference"],
      ...projection.series.slice(1).map((row) => [
        row.year,
        row.calendarYear ?? "",
        row.annualReturnPercent,
        row.withoutFees,
        row.withFees,
        row.annualAdvisoryFeesPaid,
        row.annualFundExpensesPaid,
        row.withoutFees - row.withFees,
      ]),
    ];
    const csv = lines.map((line) => line.map(csvCell).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `smarter-way-wealth-fee-comparison-${CALCULATOR_MODEL_VERSION}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const shareControl = (
    <ShareMyResults
      summary={summary}
      summaryInput={summaryInput}
      shareCardPath={shareCardPath}
      canonicalUrl={canonicalUrl}
      open={sharePanelOpen}
      onOpenChange={setSharePanelOpen}
      tone="light"
    />
  );
  const shareInAnswer = typeof resultsReplacement === "function";

  return (
    <div>
      <ThemedCalculatorExperience
        experienceMode={experienceMode}
        initialMarketEndYear={initialDetailedState.marketEndYear}
        initialMode={resolvedInitialMode}
        initialSavedFeeSchedule={initialSavedFeeSchedule}
        onExperienceStateChange={setSnapshot}
        searchParams={searchParams}
        showStickyHeader={showStickyHeader}
        simpleView={simpleView}
        afterResults={afterResults}
        resultsReplacement={shareInAnswer ? resultsReplacement(shareControl) : resultsReplacement}
        variantId={variantId}
      />

      <div className="px-5 pb-16 sm:px-8">
        <div ref={stackSectionRef} className="mx-auto mt-8 max-w-7xl space-y-6">
          {/* ORDER CHANGED, 2026-08-14 (David): the calculation details come
              first, directly under the calculator — they are about the number
              the visitor just produced. Voting and sharing are what you do
              afterwards, so they follow, with a rule marking the break. Same
              stack order as the sister site (youarepayingtoomuch.com), which
              is where he asked for it. */}
          <CalculationDetailsPanel
            decomposition={decomposition}
            savings={projection.savings}
            years={effectiveYears}
            totalAssetBasedFees={projection.totalFees}
            totalFlatFees={projection.totalFlatFees}
            returnModeNote={returnModeNote}
          />

          <div aria-hidden="true" className="h-px w-full bg-[#C9D8E4]" />

          {projection.savings > 0 ? (
            <section id="poll" aria-labelledby="canon-poll-heading" className="rounded-2xl border border-[#C9D8E4] bg-white p-5 sm:p-7">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#007A2F]">Quick poll</p>
              <h2 id="canon-poll-heading" className="mt-2 text-2xl font-bold tracking-tight text-[#062B43]">
                What would you do with your {formatCurrency(Math.max(projection.savings, 0))}?
              </h2>
              <div className="mt-5">
                <Quiz
                  savings={Math.max(projection.savings, 0)}
                  variant="bare"
                  onShare={openSharePanel}
                  shareButtonLabel="Share my results"
                />
              </div>
            </section>
          ) : null}

          {/* Share & results band — light canon styling (white card, same
              family as the details panel above), not the dark navy band
              from the earlier mockup: per David's explicit feedback. */}
          <section
            aria-labelledby="canon-share-results-heading"
            className="rounded-2xl border border-[#C9D8E4] bg-white p-5 shadow-[0_18px_50px_rgba(17,33,52,0.08)] sm:p-7"
            data-model-version={CALCULATOR_MODEL_VERSION}
            data-production-commit={productionCommit}
            data-raw-flat-ending={projection.finalValueWithoutFees.toFixed(8)}
            data-raw-traditional-ending={projection.finalValueWithFees.toFixed(8)}
            data-raw-savings={projection.savings.toFixed(8)}
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#007A2F]">Share &amp; results</p>
                <h2 id="canon-share-results-heading" className="mt-2 text-2xl font-bold tracking-tight text-[#062B43]">
                  Same returns. Different costs.
                </h2>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-[#BFE7D1] bg-[#E8F7EE] p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-[#0A6E35]">Flat-fee ending value</p>
                <p data-testid="flat-ending-value" className="mt-2 text-2xl font-bold tabular-nums text-[#0A6E35]">
                  {formatCurrency(projection.finalValueWithoutFees)}
                </p>
              </div>
              <div className="rounded-lg border border-[#C9D8E4] bg-[#EAF1F8] p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-[#064B84]">Traditional ending value</p>
                <p data-testid="traditional-ending-value" className="mt-2 text-2xl font-bold tabular-nums text-[#062B43]">
                  {formatCurrency(projection.finalValueWithFees)}
                </p>
              </div>
              <div className="rounded-lg bg-[#007A2F] p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-[#BFF9D8]">Potential difference</p>
                <p data-testid="potential-savings" className="mt-2 text-2xl font-bold tabular-nums text-white">
                  {formatCurrency(projection.savings)}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {shareInAnswer ? null : shareControl}
              <button
                type="button"
                onClick={downloadResults}
                className="min-h-11 rounded-md border border-[#C9D8E4] bg-white px-4 text-sm font-bold text-[#062B43] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#064B84]"
              >
                Download visitor results
              </button>
              <ScheduleCallButton
                location={fullCalculatorSite.resultsCtaLocation}
              />
            </div>

            {/* The Facebook/X/Reddit row lives ONLY inside the ShareMyResults
                panel now — it used to render a second time here, which put
                two identical social rows within one viewport. */}
          </section>
        </div>
      </div>
    </div>
  );
}
