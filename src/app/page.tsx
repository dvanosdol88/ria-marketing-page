import { CostAnalysisCalculator } from "@/components/CostAnalysisCalculator";
import { CalculatorState, parseCalculatorState } from "@/lib/calculatorState";
import { formatCurrency } from "@/lib/format";

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
    <main className="space-y-16 pb-16">
      <section className="section-shell pt-12 text-center">
        <p className="text-xs font-semibold uppercase tracking-tightish text-brand-600">Fee-clarity landing</p>
        <h1 className="mt-3 text-4xl font-semibold text-neutral-900 sm:text-5xl">What would you do with {formatCurrency(500000)}?</h1>
        <p className="mt-4 text-lg text-neutral-600 sm:text-xl">
          Start with your real numbers. Share the URL to keep the conversation moving.
        </p>
      </section>

      <section className="section-shell">
        <CostAnalysisCalculator initialState={calculatorState} searchParams={searchParams} />
      </section>

      <section className="section-shell grid gap-6 lg:grid-cols-3">
        {["Upgrade", "Improve", "Save"].map((title, index) => (
          <div key={title} className="card p-6">
            <p className="text-xs font-semibold uppercase tracking-tightish text-brand-600">Step {index + 1}</p>
            <h3 className="mt-2 text-xl font-semibold text-neutral-900">{title} your approach</h3>
            <p className="mt-2 text-neutral-600">
              We use the same projection logic across every section so you can validate the story before moving forward.
            </p>
          </div>
        ))}
      </section>

      <footer className="section-shell border-t border-neutral-200 pt-8 text-sm text-neutral-500">
        <p>
          Advisory services are for illustrative purposes only. Chart projections are hypothetical and not a guarantee of future
          returns. Review ADV and disclosures before investing.
        </p>
      </footer>
    </main>
  );
}
