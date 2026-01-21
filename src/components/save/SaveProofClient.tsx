"use client";

import { useMemo } from "react";
import { buildFeeProjection } from "@/lib/feeProjection";
import { CalculatorState, buildQueryFromState, paramsToRecord } from "@/lib/calculatorState";
import { formatCurrency, formatPercent } from "@/lib/format";
import { FeeBreakdownBars } from "@/components/charts/FeeBreakdownBars";
import { FeeComparisonChart } from "@/components/charts/FeeComparisonChart";
import { SavingsMetersGrid } from "@/components/save/SavingsMetersGrid";
import Link from "next/link";

type Props = {
  calculatorState: CalculatorState;
  searchParams: URLSearchParams;
};

export function SaveProofClient({ calculatorState, searchParams }: Props) {
  const projection = useMemo(() => buildFeeProjection({
    initialInvestment: calculatorState.portfolioValue,
    years: calculatorState.years,
    annualFeePercent: calculatorState.annualFeePercent,
    annualGrowthPercent: calculatorState.annualGrowthPercent,
  }), [calculatorState]);

  const linkQuery = useMemo(() => {
    const params = new URLSearchParams(buildQueryFromState(calculatorState, searchParams));
    return paramsToRecord(params);
  }, [calculatorState, searchParams]);

  return (
    <div className="flex flex-col gap-12">
      <header className="section-shell text-center">
        <p className="text-xs font-semibold uppercase tracking-tightish text-brand-600">Save proof</p>
        <h1 className="mt-2 text-3xl font-semibold text-neutral-900 sm:text-4xl">Here is what fees do over time</h1>
        <p className="mt-3 text-lg text-neutral-600">
          A {formatPercent(calculatorState.annualFeePercent)} advisory fee on a {formatCurrency(calculatorState.portfolioValue)}
          {" "}
          portfolio compounds into {formatCurrency(projection.savings)} of lost wealth over {calculatorState.years} years.
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <Link
            href={{ pathname: "/", query: linkQuery }}
            className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
          >
            Back to calculator
          </Link>
          <Link
            href={{ pathname: "/how-it-works", query: linkQuery }}
            className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800"
          >
            How it works
          </Link>
        </div>
      </header>

      <section className="section-shell grid gap-8 lg:grid-cols-2">
        <div className="card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-tightish text-neutral-500">Portfolio growth</p>
              <h3 className="text-xl font-semibold text-neutral-900">With and without fees</h3>
            </div>
            <div className="text-right text-sm text-neutral-500">
              <p>No fees: {formatCurrency(projection.finalValueWithoutFees)}</p>
              <p>With fees: {formatCurrency(projection.finalValueWithFees)}</p>
            </div>
          </div>
          <div className="mt-4">
            <FeeComparisonChart data={projection.series} />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-tightish text-neutral-500">Fee drag</p>
              <h3 className="text-xl font-semibold text-neutral-900">Cumulative fees paid</h3>
            </div>
            <div className="text-right text-sm text-neutral-500">
              <p>Lost to fees: {formatCurrency(projection.savings)}</p>
              <p>Average per year: {formatCurrency(projection.totalFees / calculatorState.years)}</p>
            </div>
          </div>
          <div className="mt-4">
            <FeeBreakdownBars data={projection.series} />
          </div>
        </div>
      </section>

      {/* Savings Meters Section */}
      <section className="section-shell">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-tightish text-neutral-500">What could you do with the savings?</p>
          <h3 className="text-xl font-semibold text-neutral-900">
            Your {formatCurrency(projection.savings)} could buy...
          </h3>
        </div>
        <SavingsMetersGrid savings={projection.savings} />
      </section>
    </div>
  );
}
