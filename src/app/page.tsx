import { CostAnalysisCalculator } from "@/components/CostAnalysisCalculator";
import { JsonLd } from "@/components/JsonLd";
import { CalculatorState, DEFAULT_STATE, parseCalculatorState } from "@/lib/calculatorState";
import { getHomeMarketingVariantId } from "@/config/homeMarketingVariants";
import { getHomeTopBannerId } from "@/config/homeTopBanners";
import { absoluteUrl, advisoryFirmName, siteUrl } from "@/config/siteMetadata";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Advisory Fee Calculator",
  description:
    "Run your numbers and compare an asset-based advisory fee with Smarter Way Wealth's $100/month flat-fee model.",
  alternates: {
    canonical: "/",
  },
};

type HomeSearchParams = Record<string, string | string[] | undefined>;

function normalizeSearchParams(searchParams: HomeSearchParams) {
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

const calculatorStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "@id": `${siteUrl}/#fee-calculator`,
  name: "Advisory Fee Calculator",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Any",
  url: absoluteUrl(
    `/?portfolio=${DEFAULT_STATE.portfolioValue}&years=${DEFAULT_STATE.years}&growth=${DEFAULT_STATE.annualGrowthPercent}&fee=${DEFAULT_STATE.annualFeePercent}&mfe=${DEFAULT_STATE.mutualFundExpensePercent}`
  ),
  provider: {
    "@id": `${siteUrl}/#organization`,
    name: advisoryFirmName,
  },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "Compares asset-based advisory fees with a $100/month flat advisory fee",
    "Encodes calculator assumptions in shareable URL parameters",
    "Returns machine-readable projections from /api/calculator",
    "Shows cumulative fees, ending values, and projected savings",
  ],
  potentialAction: {
    "@type": "UseAction",
    target:
      `${siteUrl}/?portfolio={portfolio}&years={years}&growth={growth}&fee={fee}&mfe={mfe}`,
    queryInput: [
      "required name=portfolio",
      "required name=years",
      "required name=growth",
      "required name=fee",
      "optional name=mfe",
    ],
  },
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<HomeSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const params = normalizeSearchParams(resolvedSearchParams);
  const calculatorState: CalculatorState = parseCalculatorState(params);
  const explicitVariant = Array.isArray(resolvedSearchParams.variant)
    ? resolvedSearchParams.variant[0]
    : resolvedSearchParams.variant;
  const hasExplicitVariant = typeof explicitVariant === "string" && explicitVariant.length > 0;
  const marketingVariantId = hasExplicitVariant
    ? getHomeMarketingVariantId(resolvedSearchParams.variant)
    : "final-home";
  const bannerId = getHomeTopBannerId(resolvedSearchParams.banner);
  const sequence = Array.isArray(resolvedSearchParams.sequence)
    ? resolvedSearchParams.sequence[0]
    : resolvedSearchParams.sequence;
  const mode = Array.isArray(resolvedSearchParams.mode)
    ? resolvedSearchParams.mode[0]
    : resolvedSearchParams.mode;
  let experienceMode: "marketing" | "calculator-first" | "savings-calculator-upgrade";

  if (mode === "calculator-first") {
    experienceMode = "calculator-first";
  } else if (sequence === "savings-calculator-upgrade" || !hasExplicitVariant) {
    experienceMode = "savings-calculator-upgrade";
  } else {
    experienceMode = "marketing";
  }

  return (
    <main className="flex flex-col pb-16">
      <JsonLd data={calculatorStructuredData} />
      <CostAnalysisCalculator
        initialState={calculatorState}
        searchParams={resolvedSearchParams}
        marketingVariantId={marketingVariantId}
        experienceMode={experienceMode}
        bannerId={bannerId}
      />
    </main>
  );
}
