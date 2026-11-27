import type { Metadata } from "next";
import { ProgressiveCalculator } from "@/components/calculator/ProgressiveCalculator";
import { MathMotionField } from "@/components/full-calculator/MathMotionField";
import { CALCULATOR_MODE_PARAM } from "@/lib/calculatorMode";
import { buildDetailedCalculatorQuery, parseDetailedCalculatorState } from "@/lib/full-calculator/calculatorState";
import { formatCurrency } from "@/lib/format";
import { pageMetadata } from "@/lib/pageMetadata";
import { buildShareCardData } from "@/lib/shareCardData";
import { fullCalculatorSite } from "@/config/full-calculator/fullCalculatorSite";
import "./full-calculator.css";

/*
 * Full calculator (fee-lab stage 1; David's order 2026-11-25, "Swap, in two
 * stages"). A copy of smarterwaywealth.com's /calculator page, served here
 * inside this site's header and footer. Section 1 built it hidden
 * (docs/plans/2026-11-25-fee-lab-stage1-full-calculator.md). Section 2
 * (David, 2026-11-26, "Approve, build section 2";
 * docs/plans/2026-11-26-fee-lab-stage1-section2-go-live.md) makes it public:
 * the home page's advanced-calculator link opens it, it is indexable and
 * listed in the sitemap and llms.txt, and a shared link reopens this page
 * with the whole scenario, previewed by its own share card.
 */

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
  if (!hasScenario) return pageMetadata(BASE_METADATA);

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

  return pageMetadata({
    title: "Fee comparison illustration | Smarter Way Wealth",
    description,
    path: "/calculator",
    // The detailed share card (/calculator/share-card), which draws this
    // scenario's market window and fee schedule; the home page's /api/og
    // card cannot express them.
    image: fullCalculatorSite.buildShareCardPath(canonicalQuery),
  });
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
