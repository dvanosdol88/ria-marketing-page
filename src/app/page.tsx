import { CostAnalysisCalculator } from "@/components/CostAnalysisCalculator";
import type { Metadata } from "next";
import type { CalculatorState } from "@/lib/calculatorState";
import { buildQueryFromState, parseCalculatorState } from "@/lib/calculatorState";
import { buildFeeProjection } from "@/lib/feeProjection";
import { formatCurrency } from "@/lib/format";
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
  const resolvedSearchParams = await searchParams;
  const params = normalizeSearchParams(resolvedSearchParams);
  const calculatorState = parseCalculatorState(params);
  const totalAnnualFeePercent =
    calculatorState.annualFeePercent + calculatorState.mutualFundExpensePercent;
  const projection = buildFeeProjection({
    annualFlatFee: calculatorState.annualFlatFee,
    initialInvestment: calculatorState.portfolioValue,
    years: calculatorState.years,
    annualFeePercent: totalAnnualFeePercent,
    annualGrowthPercent: calculatorState.annualGrowthPercent,
  });
  const query = buildQueryFromState(calculatorState, params);
  const image = `/api/og?${query}`;
  const savings = formatCurrency(projection.savings);
  const title = "Smarter";
  const description = `A Smarter Way Wealth fee projection for ${formatCurrency(calculatorState.portfolioValue)} over ${calculatorState.years} years.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/?${query}`,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `${savings} projected fee savings with Smarter Way Wealth`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
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
