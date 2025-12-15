export interface FeeProjectionInput {
  initialInvestment: number;
  annualFeePercent: number;
  annualGrowthPercent: number;
  years: number;
}

export interface ProjectionYear {
  year: number;
  withoutFees: number;
  withFees: number;
  annualFeesPaid: number;
  cumulativeFees: number;
}

export interface FeeProjectionResult {
  series: ProjectionYear[];
  totalFees: number;
  savings: number;
  finalValueWithFees: number;
  finalValueWithoutFees: number;
}

export function buildFeeProjection({
  annualFeePercent,
  annualGrowthPercent,
  initialInvestment,
  years,
}: FeeProjectionInput): FeeProjectionResult {
  const growthRate = annualGrowthPercent / 100;
  const feeRate = annualFeePercent / 100;
  let withoutFees = initialInvestment;
  let withFees = initialInvestment;
  let cumulativeFees = 0;
  const series: ProjectionYear[] = [];

  for (let year = 0; year <= years; year += 1) {
    if (year > 0) {
      withoutFees = withoutFees * (1 + growthRate);
      const grossWithFees = withFees * (1 + growthRate);
      const yearlyFee = grossWithFees * feeRate;
      withFees = grossWithFees - yearlyFee;
      cumulativeFees += yearlyFee;
    }

    series.push({
      year,
      withoutFees,
      withFees,
      annualFeesPaid: year === 0 ? 0 : withFees * feeRate,
      cumulativeFees,
    });
  }

  const finalValueWithFees = series[series.length - 1].withFees;
  const finalValueWithoutFees = series[series.length - 1].withoutFees;

  return {
    series,
    totalFees: cumulativeFees,
    savings: finalValueWithoutFees - finalValueWithFees,
    finalValueWithFees,
    finalValueWithoutFees,
  };
}
