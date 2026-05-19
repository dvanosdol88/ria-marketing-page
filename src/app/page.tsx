import type { Metadata } from "next";
import { CostAnalysisCalculator } from "@/components/CostAnalysisCalculator";
import {
  CalculatorState,
  buildQueryFromState,
  parseCalculatorState,
} from "@/lib/calculatorState";
import { RIA_MONTHLY_FEE, buildFeeProjection } from "@/lib/feeProjection";
import { formatCurrencyFloored } from "@/lib/format";
import { getHomeMarketingVariantId } from "@/config/homeMarketingVariants";
import { getHomeTopBannerId } from "@/config/homeTopBanners";

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

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<HomeSearchParams>;
}): Promise<Metadata> {
  const resolved = await searchParams;
  const params = normalizeSearchParams(resolved);
  const state = parseCalculatorState(params);
  const totalFeePercent = state.annualFeePercent + state.mutualFundExpensePercent;
  const projection = buildFeeProjection({
    initialInvestment: state.portfolioValue,
    annualFeePercent: totalFeePercent,
    annualGrowthPercent: state.annualGrowthPercent,
    years: state.years,
  });

  const formattedSavings = formatCurrencyFloored(projection.savings);
  const formattedPortfolio = formatCurrencyFloored(state.portfolioValue);
  const calcQuery = buildQueryFromState(state);
  const ogImagePath = `/api/og?${calcQuery}`;
  const canonicalPath = `/?${calcQuery}`;
  const title = `You'd keep ${formattedSavings} more · over ${state.years} years`;
  const description = `${formattedPortfolio} starting · ${state.annualFeePercent.toFixed(2)}% advisor fee · ${state.annualGrowthPercent.toFixed(1)}% growth, vs. our $${RIA_MONTHLY_FEE}/mo flat fee.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: canonicalPath,
      siteName: "Smarter Way Wealth",
      images: [
        {
          url: ogImagePath,
          width: 1200,
          height: 630,
          alt: `You'd keep ${formattedSavings} more over ${state.years} years`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImagePath],
    },
  };
}

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
