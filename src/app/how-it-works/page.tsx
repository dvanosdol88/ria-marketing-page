import Link from "next/link";
import { CalculatorState, parseCalculatorState, paramsToRecord } from "@/lib/calculatorState";
import { buildFeeProjection } from "@/lib/feeProjection";
import { formatCurrency, formatPercent } from "@/lib/format";
import { ScheduleSection } from "@/components/ScheduleSection";

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
  const totalAnnualFeePercent =
    calculatorState.annualFeePercent + calculatorState.mutualFundExpensePercent;
  const projection = buildFeeProjection({
    annualFlatFee: calculatorState.annualFlatFee,
    initialInvestment: calculatorState.portfolioValue,
    years: calculatorState.years,
    annualFeePercent: totalAnnualFeePercent,
    annualGrowthPercent: calculatorState.annualGrowthPercent,
  });
  const linkQuery = paramsToRecord(params);

  return (
    <main className="flex flex-col gap-12 pb-16">
      <header className="section-shell pt-12">
        <p className="text-xs font-semibold uppercase tracking-tightish text-brand-600">How it works</p>
        <p className="mt-4 text-lg text-neutral-600 sm:text-xl">
          I use technology and AI so that I can spend my time where it is most important: working with clients.
        </p>
        <p className="mt-4 text-lg text-neutral-600 sm:text-xl">
          We use published asset allocation models from companies like Fidelity, Schwab, Goldman Sachs, Morgan Stanley,
          and Vanguard, and tweak those based on your risk tolerance. Then we choose low-cost or even zero-cost ETFs or
          mutual funds, and you make the trades (don&apos;t worry, we make it very simple!).
        </p>
        <Link
          href={{ pathname: "/how-it-works/substitution", query: linkQuery }}
          className="mt-5 inline-flex text-sm font-semibold text-brand-700 underline decoration-brand-300 underline-offset-4 transition-colors hover:text-brand-800"
        >
          Learn more about how this works -&gt;
        </Link>
      </header>

      <section className="section-shell grid gap-6 lg:grid-cols-3">
        <div className="card p-6">
          <p className="text-xs font-semibold uppercase tracking-tightish text-neutral-500">Your inputs</p>
          <ul className="mt-3 flex flex-col gap-2 text-sm text-neutral-700">
            <li>Portfolio: {formatCurrency(calculatorState.portfolioValue)}</li>
            <li>Years: {calculatorState.years}</li>
            <li>Growth: {formatPercent(calculatorState.annualGrowthPercent)}</li>
            <li>Advisory fee: {formatPercent(calculatorState.annualFeePercent)}</li>
            <li>Mutual fund expenses: {formatPercent(calculatorState.mutualFundExpensePercent)}</li>
            <li>Total annual fee load: {formatPercent(totalAnnualFeePercent)}</li>
          </ul>
        </div>
        <div className="card p-6">
          <p className="text-xs font-semibold uppercase tracking-tightish text-neutral-500">Projected savings</p>
          <h2 className="mt-2 text-2xl font-semibold text-neutral-900">{formatCurrency(projection.savings)}</h2>
          <p className="mt-2 text-sm text-neutral-600">Saved by switching to Smarter Way Wealth&apos;s $100/mo flat fee over {calculatorState.years} years.</p>
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
            All three pages read and write the same query parameters: <code>portfolio</code>, <code>years</code>, <code>growth</code>,{" "}
            <code>fee</code>, and <code>mfe</code>. UTM parameters are preserved so you can attribute inbound clicks.
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

      <ScheduleSection />
    </main>
  );
}
