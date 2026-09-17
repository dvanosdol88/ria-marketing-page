import type { Metadata } from "next";
import { CostAnalysisCalculator } from "@/components/CostAnalysisCalculator";
import { BLUES_ORIGIN, bluesCopy } from "@/config/onePercentBlues";
import { buildQueryFromState, parseCalculatorState } from "@/lib/calculatorState";
import { buildFeeProjection } from "@/lib/feeProjection";
import { formatCurrency } from "@/lib/format";

type BluesSearchParams = Record<string, string | string[] | undefined>;

/* Same query contract as the green home (flat/portfolio/years/growth/fee/mfe),
   so a link shared from onepercentblues.com — which the canon share stack
   builds from window.location.origin + "/?query#calculator" — lands back
   here with the visitor's own numbers. */
function normalizeSearchParams(searchParams: BluesSearchParams) {
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

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<BluesSearchParams>;
}): Promise<Metadata> {
  const params = normalizeSearchParams(await searchParams);
  const state = parseCalculatorState(params);
  const projection = buildFeeProjection({
    annualFlatFee: state.annualFlatFee,
    initialInvestment: state.portfolioValue,
    years: state.years,
    annualFeePercent: state.annualFeePercent + state.mutualFundExpensePercent,
    annualGrowthPercent: state.annualGrowthPercent,
  });
  const query = buildQueryFromState(state, params);
  const image = `/api/og/blues?${query}`;
  const savings = formatCurrency(projection.savings);
  const description = `${bluesCopy.metaDescription} This scenario: ${savings} over ${state.years} years on ${formatCurrency(state.portfolioValue)}.`;

  return {
    title: bluesCopy.metaTitle,
    description,
    alternates: {
      canonical: `${BLUES_ORIGIN}/`,
    },
    // A page-level openGraph replaces the layout's whole object, so the site
    // name and type are restated here rather than inherited.
    openGraph: {
      type: "website",
      siteName: "One Percent Blues",
      title: bluesCopy.metaTitle,
      description,
      url: `${BLUES_ORIGIN}/?${query}`,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `${savings} estimated advisory-fee difference with Smarter Way Wealth`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: bluesCopy.metaTitle,
      description,
      images: [image],
    },
  };
}

export default async function OnePercentBluesPage({
  searchParams,
}: {
  searchParams: Promise<BluesSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const calculatorState = parseCalculatorState(normalizeSearchParams(resolvedSearchParams));

  return (
    <main className="flex flex-col pb-10">
      <CostAnalysisCalculator
        initialState={calculatorState}
        searchParams={resolvedSearchParams}
        marketingVariantId="final-home"
        experienceMode="one-percent-blues"
      />
    </main>
  );
}
