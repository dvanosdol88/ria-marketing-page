"use client";

import { ExperimentalAxisMockup } from "@/components/charts/ExperimentalAxisMockup";
import { buildFeeProjection } from "@/lib/feeProjection";

export default function ExperimentPage() {
  const projection = buildFeeProjection({
    initialInvestment: 1000000,
    years: 25,
    annualFeePercent: 1.0,
    annualGrowthPercent: 7.0,
  });

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-12 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl shadow-2xl">
        <ExperimentalAxisMockup
          data={projection.series}
          finalLost={projection.savings}
          finalValueWithoutFees={projection.finalValueWithoutFees}
          finalValueWithFees={projection.finalValueWithFees}
          portfolioValue={1000000}
          years={25}
          annualGrowthPercent={7.0}
          annualFeePercent={1.0}
          mutualFundExpensePercent={0.25}
        />
      </div>
      
      <div className="mt-8 text-center text-slate-500">
        <p>This experiment integrates reference lines and labels directly onto the chart axes.</p>
      </div>
    </div>
  );
}
