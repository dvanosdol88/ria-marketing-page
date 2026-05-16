import { NextRequest, NextResponse } from "next/server";
import { parseCalculatorState } from "@/lib/calculatorState";
import { buildFeeProjection } from "@/lib/feeProjection";

export function GET(request: NextRequest) {
  const state = parseCalculatorState(request.nextUrl.searchParams);
  const totalAnnualFeePercent = state.annualFeePercent + state.mutualFundExpensePercent;
  const projection = buildFeeProjection({
    initialInvestment: state.portfolioValue,
    years: state.years,
    annualFeePercent: totalAnnualFeePercent,
    annualGrowthPercent: state.annualGrowthPercent,
  });

  return NextResponse.json({
    inputs: {
      portfolioValue: state.portfolioValue,
      years: state.years,
      annualGrowthPercent: state.annualGrowthPercent,
      annualFeePercent: state.annualFeePercent,
      mutualFundExpensePercent: state.mutualFundExpensePercent,
      totalAnnualFeePercent,
    },
    assumptions: {
      flatMonthlyFeeDollars: 100,
      compounding: "monthly",
      taxesInflationWithdrawalsAndContributionsModeled: false,
      purpose: "Illustration only; not financial advice.",
    },
    results: {
      savings: projection.savings,
      totalAumFees: projection.totalFees,
      totalFlatFees: projection.totalFlatFees,
      finalValueWithAumFees: projection.finalValueWithFees,
      finalValueWithFlatFee: projection.finalValueWithoutFees,
    },
    series: projection.series,
  });
}
