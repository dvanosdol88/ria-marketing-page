/** RIA's flat monthly advisory fee — the "better" scenario in comparisons. */
export const RIA_MONTHLY_FEE = 100;

/** Incremented only when the disclosed calculation rules change. */
export const CALCULATOR_MODEL_VERSION = "sww-fee-model-1.0.0";

const MAX_FEE_TIERS = 6;
const MAX_TIER_BOUNDARY = 50_000_000;
export const MAX_TIER_RATE_PERCENT = 5;

export interface MarginalFeeTier {
  /** Cumulative portfolio boundary for this tier. `null` means no upper limit. */
  upTo: number | null;
  /** Annual advisory rate for only the dollars inside this tier. */
  annualRatePercent: number;
}

interface FeeProjectionInput {
  annualFlatFee?: number;
  initialInvestment: number;
  /** Legacy single-rate mode. Ignored when `advisoryFeeTiers` is supplied. */
  annualFeePercent: number;
  /** Optional marginal schedule. The final tier must be open-ended. */
  advisoryFeeTiers?: readonly MarginalFeeTier[];
  /** Separate fund/ETF expense drag on the traditional-advisor track. */
  annualFundExpensePercent?: number;
  annualGrowthPercent: number;
  years: number;
  /** Optional per-year return sequence, in percent, oldest first. */
  annualReturnPercents?: readonly number[];
  /** Calendar year corresponding to `annualReturnPercents[0]`. */
  firstCalendarYear?: number;
}

export interface ProjectionMonth {
  month: number;
  year: number;
  monthInYear: number;
  calendarYear?: number;
  annualReturnPercent: number;
  monthlyReturnRate: number;
  startingFlatBalance: number;
  startingTraditionalBalance: number;
  grossFlatBalance: number;
  grossTraditionalBalance: number;
  flatFeePaid: number;
  advisoryFeePaid: number;
  fundExpensePaid: number;
  endingFlatBalance: number;
  endingTraditionalBalance: number;
}

export interface ProjectionYear {
  year: number;
  withoutFees: number;
  withFees: number;
  /** Advisory fee plus fund expenses paid during this year. */
  annualFeesPaid: number;
  annualAdvisoryFeesPaid: number;
  annualFundExpensesPaid: number;
  /** Running advisory fee plus fund expenses paid to date. */
  cumulativeFees: number;
  cumulativeAdvisoryFees: number;
  cumulativeFundExpenses: number;
  annualReturnPercent: number;
  calendarYear?: number;
}

export interface FeeProjectionResult {
  modelVersion: string;
  series: ProjectionYear[];
  monthlyLedger: ProjectionMonth[];
  /** Total advisory fees plus fund expenses on the traditional path. */
  totalFees: number;
  totalAdvisoryFees: number;
  totalFundExpenses: number;
  totalFlatFees: number;
  savings: number;
  finalValueWithFees: number;
  finalValueWithoutFees: number;
}

export function validateMarginalFeeTiers(
  tiers: readonly MarginalFeeTier[],
): { valid: true; tiers: MarginalFeeTier[] } | { valid: false; error: string } {
  if (tiers.length < 1 || tiers.length > MAX_FEE_TIERS) {
    return { valid: false, error: `Use between 1 and ${MAX_FEE_TIERS} fee tiers.` };
  }

  let previousBoundary = 0;
  for (let index = 0; index < tiers.length; index += 1) {
    const tier = tiers[index];
    if (!Number.isFinite(tier.annualRatePercent) || tier.annualRatePercent < 0 || tier.annualRatePercent > MAX_TIER_RATE_PERCENT) {
      return { valid: false, error: `Tier ${index + 1} must use a rate from 0% to ${MAX_TIER_RATE_PERCENT}%.` };
    }

    if (tier.upTo === null) {
      if (index !== tiers.length - 1) {
        return { valid: false, error: "Only the final fee tier may be open-ended." };
      }
      continue;
    }

    if (!Number.isFinite(tier.upTo) || tier.upTo <= previousBoundary || tier.upTo > MAX_TIER_BOUNDARY) {
      return { valid: false, error: "Fee-tier boundaries must be positive, ascending, and within the supported range." };
    }
    previousBoundary = tier.upTo;
  }

  if (tiers[tiers.length - 1].upTo !== null) {
    return { valid: false, error: "The final fee tier must cover all remaining assets." };
  }

  return {
    valid: true,
    tiers: tiers.map((tier) => ({
      upTo: tier.upTo,
      annualRatePercent: tier.annualRatePercent,
    })),
  };
}

/** Annual marginal fee, analogous to applying tax brackets to a balance. */
export function calculateMarginalAnnualFee(
  balance: number,
  tiers: readonly MarginalFeeTier[],
): number {
  const validation = validateMarginalFeeTiers(tiers);
  if (!validation.valid) throw new Error("error" in validation ? validation.error : "Invalid fee tiers.");

  const supportedBalance = Math.max(0, balance);
  let lowerBound = 0;
  let fee = 0;

  for (const tier of validation.tiers) {
    const upperBound = tier.upTo ?? supportedBalance;
    const dollarsInTier = Math.max(0, Math.min(supportedBalance, upperBound) - lowerBound);
    fee += dollarsInTier * (tier.annualRatePercent / 100);
    if (supportedBalance <= upperBound) break;
    lowerBound = upperBound;
  }

  return fee;
}

export function effectiveAnnualAdvisoryRate(
  balance: number,
  tiers: readonly MarginalFeeTier[],
): number {
  if (balance <= 0) return 0;
  return (calculateMarginalAnnualFee(balance, tiers) / balance) * 100;
}

/**
 * Versioned monthly projection. Calculation order in every billing period:
 * gross return, then the flat fee on the SWW path, then advisory and fund
 * charges (separately calculated from the same post-growth balance) on the
 * traditional path. Internal values are never rounded.
 */
export function buildFeeProjection({
  annualFlatFee = RIA_MONTHLY_FEE * 12,
  annualFeePercent,
  advisoryFeeTiers,
  annualFundExpensePercent = 0,
  annualGrowthPercent,
  annualReturnPercents,
  firstCalendarYear,
  initialInvestment,
  years,
}: FeeProjectionInput): FeeProjectionResult {
  const tierValidation = advisoryFeeTiers
    ? validateMarginalFeeTiers(advisoryFeeTiers)
    : null;
  if (tierValidation && !tierValidation.valid) throw new Error("error" in tierValidation ? tierValidation.error : "Invalid fee tiers.");

  const normalizedTiers = tierValidation?.valid ? tierValidation.tiers : null;
  const singleRateMonthly = Math.max(0, annualFeePercent) / 100 / 12;
  const fundExpenseMonthly = Math.max(0, annualFundExpensePercent) / 100 / 12;
  const monthlyFlatFee = Math.max(0, annualFlatFee / 12);
  // The public method is defined in complete calendar years. Normalize at the
  // engine boundary too so a future caller cannot create a partial-year ledger
  // whose totals disagree with the annual result series.
  const normalizedYears = Number.isFinite(years) ? Math.max(0, Math.round(years)) : 0;
  const normalizedFirstCalendarYear = typeof firstCalendarYear === "number" && Number.isFinite(firstCalendarYear)
    ? Math.round(firstCalendarYear)
    : undefined;
  const totalMonths = normalizedYears * 12;

  const annualReturnForYear = (yearNumber: number) => {
    const fromSequence = annualReturnPercents?.[yearNumber - 1];
    return typeof fromSequence === "number" && Number.isFinite(fromSequence)
      ? fromSequence
      : annualGrowthPercent;
  };

  let withFlatFee = Math.max(0, initialInvestment);
  let withTraditionalFees = Math.max(0, initialInvestment);
  let cumulativeAdvisoryFees = 0;
  let cumulativeFundExpenses = 0;
  let cumulativeFlatFees = 0;
  let annualAdvisoryFees = 0;
  let annualFundExpenses = 0;

  const series: ProjectionYear[] = [{
    year: 0,
    withoutFees: withFlatFee,
    withFees: withTraditionalFees,
    annualFeesPaid: 0,
    annualAdvisoryFeesPaid: 0,
    annualFundExpensesPaid: 0,
    cumulativeFees: 0,
    cumulativeAdvisoryFees: 0,
    cumulativeFundExpenses: 0,
    annualReturnPercent: 0,
    calendarYear: normalizedFirstCalendarYear !== undefined ? normalizedFirstCalendarYear - 1 : undefined,
  }];
  const monthlyLedger: ProjectionMonth[] = [];

  for (let month = 1; month <= totalMonths; month += 1) {
    const yearNumber = Math.ceil(month / 12);
    const annualReturn = annualReturnForYear(yearNumber);
    const monthlyReturnRate = Math.pow(1 + annualReturn / 100, 1 / 12) - 1;
    const startingFlatBalance = withFlatFee;
    const startingTraditionalBalance = withTraditionalFees;
    const grossFlatBalance = startingFlatBalance * (1 + monthlyReturnRate);
    const grossTraditionalBalance = startingTraditionalBalance * (1 + monthlyReturnRate);

    const flatFeePaid = Math.min(monthlyFlatFee, Math.max(0, grossFlatBalance));
    withFlatFee = Math.max(0, grossFlatBalance - flatFeePaid);
    cumulativeFlatFees += flatFeePaid;

    // Preserve the legacy scalar arithmetic exactly when tier mode is off.
    const advisoryFeePaid = normalizedTiers
      ? calculateMarginalAnnualFee(grossTraditionalBalance, normalizedTiers) / 12
      : grossTraditionalBalance * singleRateMonthly;
    const fundExpensePaid = grossTraditionalBalance * fundExpenseMonthly;
    const traditionalCharges = Math.min(
      Math.max(0, grossTraditionalBalance),
      Math.max(0, advisoryFeePaid) + Math.max(0, fundExpensePaid),
    );
    const chargeScale = advisoryFeePaid + fundExpensePaid > 0
      ? traditionalCharges / (advisoryFeePaid + fundExpensePaid)
      : 0;
    const paidAdvisory = advisoryFeePaid * chargeScale;
    const paidFundExpense = fundExpensePaid * chargeScale;
    withTraditionalFees = Math.max(0, grossTraditionalBalance - traditionalCharges);

    cumulativeAdvisoryFees += paidAdvisory;
    cumulativeFundExpenses += paidFundExpense;
    annualAdvisoryFees += paidAdvisory;
    annualFundExpenses += paidFundExpense;

    monthlyLedger.push({
      month,
      year: yearNumber,
      monthInYear: ((month - 1) % 12) + 1,
      calendarYear: normalizedFirstCalendarYear !== undefined ? normalizedFirstCalendarYear + yearNumber - 1 : undefined,
      annualReturnPercent: annualReturn,
      monthlyReturnRate,
      startingFlatBalance,
      startingTraditionalBalance,
      grossFlatBalance,
      grossTraditionalBalance,
      flatFeePaid,
      advisoryFeePaid: paidAdvisory,
      fundExpensePaid: paidFundExpense,
      endingFlatBalance: withFlatFee,
      endingTraditionalBalance: withTraditionalFees,
    });

    if (month % 12 === 0) {
      const cumulativeFees = cumulativeAdvisoryFees + cumulativeFundExpenses;
      series.push({
        year: yearNumber,
        withoutFees: withFlatFee,
        withFees: withTraditionalFees,
        annualFeesPaid: annualAdvisoryFees + annualFundExpenses,
        annualAdvisoryFeesPaid: annualAdvisoryFees,
        annualFundExpensesPaid: annualFundExpenses,
        cumulativeFees,
        cumulativeAdvisoryFees,
        cumulativeFundExpenses,
        annualReturnPercent: annualReturn,
        calendarYear: normalizedFirstCalendarYear !== undefined ? normalizedFirstCalendarYear + yearNumber - 1 : undefined,
      });
      annualAdvisoryFees = 0;
      annualFundExpenses = 0;
    }
  }

  const last = series[series.length - 1];
  return {
    modelVersion: CALCULATOR_MODEL_VERSION,
    series,
    monthlyLedger,
    totalFees: cumulativeAdvisoryFees + cumulativeFundExpenses,
    totalAdvisoryFees: cumulativeAdvisoryFees,
    totalFundExpenses: cumulativeFundExpenses,
    totalFlatFees: cumulativeFlatFees,
    savings: last.withoutFees - last.withFees,
    finalValueWithFees: last.withFees,
    finalValueWithoutFees: last.withoutFees,
  };
}
