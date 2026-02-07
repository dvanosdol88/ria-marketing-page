import { CostAnalysisCalculator } from "@/components/CostAnalysisCalculator";
import { CalculatorState, parseCalculatorState } from "@/lib/calculatorState";
import Image from "next/image";

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



      <footer className="section-shell border-t border-stone-300 py-8 text-sm text-stone-500">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
          <div className="max-w-2xl space-y-3">
            <Image
              src="/brand/logo.svg"
              alt="Smarter Way Wealth"
              width={170}
              height={68}
              className="h-6 w-auto opacity-75 grayscale"
            />
            <p>
              Advisory services are for illustrative purposes only. Chart projections are hypothetical and not a guarantee of future
              returns.
            </p>
          </div>
          <div className="flex gap-6 text-stone-500">
            <a href="#" className="hover:text-stone-700 no-underline">Disclosures</a>
            <a href="#" className="hover:text-stone-700 no-underline">ADV</a>
            <a href="#" className="hover:text-stone-700 no-underline">Privacy</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
