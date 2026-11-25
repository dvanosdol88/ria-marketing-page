import type { Metadata } from "next";
import { ProgressiveCalculator } from "@/components/calculator/ProgressiveCalculator";
import { MathMotionField } from "@/components/full-calculator/MathMotionField";
import { CALCULATOR_MODE_PARAM } from "@/lib/calculatorMode";
import { buildDetailedCalculatorQuery, parseDetailedCalculatorState } from "@/lib/full-calculator/calculatorState";
import { formatCurrency } from "@/lib/format";
import { pageMetadata } from "@/lib/pageMetadata";
import { buildShareCardData } from "@/lib/shareCardData";
import { siteCalculatorConfig } from "@/lib/siteCalculatorConfig";
import "./full-calculator.css";

/*
 * Hidden full calculator (fee-lab stage 1, section 1; David's order
 * 2026-11-25, "Swap, in two stages"). A copy of smarterwaywealth.com's
 * /calculator page, served here inside this site's header and footer. It is
 * not linked from anywhere, not in the sitemap or llms.txt, and tells search
 * engines not to index or follow it until David approves it.
 * Plan: docs/plans/2026-11-25-fee-lab-stage1-full-calculator.md.
 */

const HIDDEN_ROBOTS: Metadata["robots"] = { index: false, follow: false };

/** This site's default share image (the root layout's). The firm page's
 *  default, /opengraph-image, does not exist here. */
const DEFAULT_SHARE_IMAGE = "/brand/logo-800.png";

const BASE_METADATA = {
  title: "Detailed Fee Comparison | Smarter Way Wealth",
  description:
    "Compare a flat monthly advisory fee with your own marginal tiered advisory-fee schedule using steady or historical market returns.",
  path: "/calculator",
  image: DEFAULT_SHARE_IMAGE,
};

/** Query keys that mean "this visitor has a specific scenario dialed in" —
 * present on any one of these, personalize the description and share image. */
const CALCULATOR_PARAM_KEYS = [
  "portfolio",
  "years",
  "flat",
  "growth",
  "fee",
  "mfe",
  "return",
  "end",
  "feeMode",
  "tiers",
] as const;

type CalculatorPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function toQuery(record: Record<string, string | string[] | undefined>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(record)) {
    const first = Array.isArray(value) ? value[0] : value;
    if (typeof first === "string") params.set(key, first);
  }
  return params;
}

export async function generateMetadata({ searchParams }: CalculatorPageProps): Promise<Metadata> {
  const query = toQuery(await searchParams);
  const hasScenario = CALCULATOR_PARAM_KEYS.some((key) => query.has(key));
  if (!hasScenario) return { ...pageMetadata(BASE_METADATA), robots: HIDDEN_ROBOTS };

  const state = parseDetailedCalculatorState(query);
  const { effectiveYears, projection, monthlyFlatFee } = buildShareCardData(state);
  // Rebuilt canonically from the parsed (clamped) state rather than the raw
  // incoming query — this neutralizes junk params before they reach the
  // share-card image URL.
  const canonicalQuery = buildDetailedCalculatorQuery(state);

  const description =
    `Illustrative comparison: ${formatCurrency(state.portfolioValue)} over ${effectiveYears} years — ` +
    `potential difference ${formatCurrency(projection.savings)} versus a ${formatCurrency(monthlyFlatFee)}/month flat fee. ` +
    "Educational illustration only; not advice or a guarantee.";

  return {
    ...pageMetadata({
      title: "Fee comparison illustration | Smarter Way Wealth",
      description,
      path: "/calculator",
      // This site's share card (/api/og), via its own calculator config.
      image: siteCalculatorConfig.buildShareCardPath(canonicalQuery),
    }),
    robots: HIDDEN_ROBOTS,
  };
}

export default async function CalculatorPage({ searchParams }: CalculatorPageProps) {
  const params = await searchParams;
  const query = toQuery(params);
  const hasScenario = CALCULATOR_PARAM_KEYS.some((key) => query.has(key));
  const useSimpleDefault = !hasScenario && !query.has(CALCULATOR_MODE_PARAM);
  const productionCommit = process.env.VERCEL_GIT_COMMIT_SHA ?? "local";
  return (
    <main data-full-calculator className="bg-[#EEF0F5] text-[#10233A]">
      <section data-calc-banner className="relative overflow-hidden bg-[#062B43] px-5 py-12 text-white sm:px-8 sm:py-16">
        <MathMotionField variant="calculatorBanner" />
        <div className="relative z-10 mx-auto max-w-6xl">
          <h1 className="max-w-5xl text-[clamp(2.7rem,6vw,5.6rem)] font-bold leading-[0.96] tracking-[-0.035em]">Model the fees you actually pay.</h1>
        </div>
      </section>
      {/* Step-by-step inputs for a fresh visit (David, 2026-11-10). Steady
          links the step form could have written land on the answer; every
          other link that carries a scenario opens the full calculator,
          letting it resolve "calc" first, then the legacy scenario's return
          mode. */}
      <ProgressiveCalculator
        hasScenario={hasScenario}
        initialMode={useSimpleDefault ? "basic" : undefined}
        productionCommit={productionCommit}
        searchParams={params}
      />
    </main>
  );
}
