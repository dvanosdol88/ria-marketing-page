import { CostAnalysisCalculator } from "@/components/CostAnalysisCalculator";
import { type HomeSearchParams, resolveHomeLanding } from "@/lib/homeLanding";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<HomeSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const landing = resolveHomeLanding(resolvedSearchParams);

  return (
    <main className="flex flex-col pb-16">
      <CostAnalysisCalculator
        initialState={landing.calculatorState}
        searchParams={landing.searchParams}
        marketingVariantId={landing.marketingVariantId}
      />
    </main>
  );
}
