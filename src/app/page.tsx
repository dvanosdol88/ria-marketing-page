import { CostAnalysisCalculator } from "@/components/CostAnalysisCalculator";
import { CalculatorState, parseCalculatorState } from "@/lib/calculatorState";


function normalizeSearchParams(searchParams: Record<string, string | string[] | undefined>) {
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

export default function Home({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const params = normalizeSearchParams(searchParams);
  const calculatorState: CalculatorState = parseCalculatorState(params);

  return (
    <main className="flex flex-col gap-16 pb-16">
      <CostAnalysisCalculator initialState={calculatorState} searchParams={searchParams} />
    </main>
  );
}
