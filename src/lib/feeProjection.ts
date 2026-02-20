/** RIA's flat monthly advisory fee — the "better" scenario in comparisons. */
export const RIA_MONTHLY_FEE = 100;

export interface FeeProjectionInput {
  initialInvestment: number;
  annualFeePercent: number;
  annualGrowthPercent: number;
  years: number;
}

export interface ProjectionYear {
  year: number;
  /** Portfolio value under RIA's $100/mo flat fee. */
  withoutFees: number;
  /** Portfolio value under the user's AUM % fee. */
  withFees: number;
  /** AUM fees paid during this year. */
  annualFeesPaid: number;
  /** Running total of AUM fees paid to date. */
  cumulativeFees: number;
}

export interface FeeProjectionResult {
  series: ProjectionYear[];
  /** Total AUM-based fees paid over the full horizon. */
  totalFees: number;
  /** Total flat fees paid ($100 × months). */
  totalFlatFees: number;
  /** How much more wealth you keep with the flat fee vs AUM fee. */
  savings: number;
  /** Ending portfolio value under the AUM % fee. */
  finalValueWithFees: number;
  /** Ending portfolio value under RIA's $100/mo flat fee. */
  finalValueWithoutFees: number;
}

/**
 * Monthly-compounding projection comparing RIA's $100/mo flat fee
 * against a traditional AUM percentage fee.
 *
 * Both scenarios use the same gross annual return, converted to a
 * true monthly equivalent rate: rMonthly = (1 + rAnnual)^(1/12) - 1.
 *
 * The AUM fee is divided linearly across 12 months (industry standard).
 */
export function buildFeeProjection({
  annualFeePercent,
  annualGrowthPercent,
  initialInvestment,
  years,
}: FeeProjectionInput): FeeProjectionResult {
  const rAnnual = annualGrowthPercent / 100;
  const rMonthly = Math.pow(1 + rAnnual, 1 / 12) - 1;
  const aumMonthly = annualFeePercent / 100 / 12;
  const totalMonths = years * 12;

  let withFlatFee = initialInvestment;
  let withAumFee = initialInvestment;
  let cumulativeAumFees = 0;
  let cumulativeFlatFees = 0;
  let annualAumFees = 0;

  const series: ProjectionYear[] = [];

  // Year 0 snapshot
  series.push({
    year: 0,
    withoutFees: withFlatFee,
    withFees: withAumFee,
    annualFeesPaid: 0,
    cumulativeFees: 0,
  });

  for (let m = 1; m <= totalMonths; m++) {
    // 1. Apply monthly growth to both tracks
    withFlatFee *= 1 + rMonthly;
    withAumFee *= 1 + rMonthly;

    // 2. Deduct flat fee from RIA track
    withFlatFee = Math.max(0, withFlatFee - RIA_MONTHLY_FEE);
    cumulativeFlatFees += RIA_MONTHLY_FEE;

    // 3. Deduct AUM fee from traditional advisor track
    const aumFeeThisMonth = withAumFee * aumMonthly;
    withAumFee = Math.max(0, withAumFee - aumFeeThisMonth);
    cumulativeAumFees += aumFeeThisMonth;
    annualAumFees += aumFeeThisMonth;

    // Snapshot at each year boundary
    if (m % 12 === 0) {
      series.push({
        year: m / 12,
        withoutFees: withFlatFee,
        withFees: withAumFee,
        annualFeesPaid: annualAumFees,
        cumulativeFees: cumulativeAumFees,
      });
      annualAumFees = 0;
    }
  }

  const last = series[series.length - 1];

  return {
    series,
    totalFees: cumulativeAumFees,
    totalFlatFees: cumulativeFlatFees,
    savings: last.withoutFees - last.withFees,
    finalValueWithFees: last.withFees,
    finalValueWithoutFees: last.withoutFees,
  };
}
