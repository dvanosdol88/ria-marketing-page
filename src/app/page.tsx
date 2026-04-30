import { CostAnalysisCalculator } from "@/components/CostAnalysisCalculator";
import { CalculatorState, parseCalculatorState } from "@/lib/calculatorState";
import { getHomeMarketingVariantId } from "@/config/homeMarketingVariants";

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

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<HomeSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const params = normalizeSearchParams(resolvedSearchParams);
  const calculatorState: CalculatorState = parseCalculatorState(params);
  const marketingVariantId = getHomeMarketingVariantId(resolvedSearchParams.variant);

  return (
    <main className="flex flex-col pb-16">
      <CostAnalysisCalculator
        initialState={calculatorState}
        searchParams={resolvedSearchParams}
        marketingVariantId={marketingVariantId}
      />
    </main>
  );
}
