import Link from "next/link";
import { CalculatorState, parseCalculatorState, paramsToRecord } from "@/lib/calculatorState";
import { buildFeeProjection } from "@/lib/feeProjection";
import { formatCurrency, formatPercent } from "@/lib/format";

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

export default function HowItWorksPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const params = normalizeSearchParams(searchParams);
  const calculatorState: CalculatorState = parseCalculatorState(params);
  const projection = buildFeeProjection({
    initialInvestment: calculatorState.portfolioValue,
    years: calculatorState.years,
    annualFeePercent: calculatorState.annualFeePercent,
    annualGrowthPercent: calculatorState.annualGrowthPercent,
  });
  const linkQuery = paramsToRecord(params);

  return (
    <main className="space-y-12 pb-16">
      <header className="section-shell pt-12">
        <p className="text-xs font-semibold uppercase tracking-tightish text-brand-600">How it works</p>
        <h1 className="mt-3 text-4xl font-semibold text-neutral-900 sm:text-5xl">Transparent math, reusable links</h1>
        <p className="mt-4 text-lg text-neutral-600 sm:text-xl">
          We run the same projection logic you saw on the landing calculator. The numbers below reuse your query parameters so
          you can link prospects directly here.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={{ pathname: "/", query: linkQuery }}
            className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
          >
            Back to calculator
          </Link>
          <Link
            href={{ pathname: "/save", query: linkQuery }}
            className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800"
          >
            See deeper proof
          </Link>
        </div>
      </header>

      <section className="section-shell grid gap-6 lg:grid-cols-3">
        <div className="card p-6">
          <p className="text-xs font-semibold uppercase tracking-tightish text-neutral-500">Your inputs</p>
          <ul className="mt-3 space-y-2 text-sm text-neutral-700">
            <li>Portfolio: {formatCurrency(calculatorState.portfolioValue)}</li>
            <li>Years: {calculatorState.years}</li>
            <li>Growth: {formatPercent(calculatorState.annualGrowthPercent)}</li>
            <li>Advisory fee: {formatPercent(calculatorState.annualFeePercent)}</li>
          </ul>
        </div>
        <div className="card p-6">
          <p className="text-xs font-semibold uppercase tracking-tightish text-neutral-500">Projected savings</p>
          <h2 className="mt-2 text-2xl font-semibold text-neutral-900">{formatCurrency(projection.savings)}</h2>
          <p className="mt-2 text-sm text-neutral-600">Saved by reducing fees over {calculatorState.years} years.</p>
        </div>
        <div className="card p-6">
          <p className="text-xs font-semibold uppercase tracking-tightish text-neutral-500">Why it matters</p>
          <p className="mt-2 text-sm text-neutral-600">
            Compounding cuts both ways. Every dollar not paid in fees keeps compounding for you. Use the shareable links to let
            prospects replay this math with their own numbers.
          </p>
        </div>
      </section>

      <section className="section-shell grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h3 className="text-xl font-semibold text-neutral-900">Repeatable links</h3>
          <p className="mt-2 text-sm text-neutral-600">
            All three pages read and write the same query parameters: <code>portfolio</code>, <code>years</code>, <code>growth</code>, and
            <code>fee</code>. UTM parameters are preserved so you can attribute inbound clicks.
          </p>
        </div>
        <div className="card p-6">
          <h3 className="text-xl font-semibold text-neutral-900">One source of truth</h3>
          <p className="mt-2 text-sm text-neutral-600">
            The projection engine that powers the landing calculator is reused here and on the Save proof page. Adjust the
            sliders once; the math stays consistent everywhere.
          </p>
        </div>
      </section>
    </main>
  );
}
