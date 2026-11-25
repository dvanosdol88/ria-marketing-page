// CANON: shared verbatim with the sister repo (youarepayingtoomuch.com,
// D:\ria-marketing-page). Edit both repos in the same session or CI fails.
// See CALCULATOR-CANON.md.

import type { FeeProjectionResult } from "./feeProjection.ts";

interface GapDecompositionRow {
  year: number;
  calendarYear?: number;
  /** series row withoutFees */
  flatValue: number;
  /** series row withFees */
  traditionalValue: number;
  /** flatValue - traditionalValue (may be negative; not clamped here) */
  gap: number;
  /** clamp(cumulativeAssetFees - cumulativeFlatFees, 0, max(gap, 0)) */
  feePart: number;
  /** max(gap - feePart, 0) */
  compoundingPart: number;
  /** series row annualFeesPaid */
  annualAssetFees: number;
  /** series row cumulativeFees */
  cumulativeAssetFees: number;
  /** EXACT: sum of monthlyLedger flatFeePaid for months <= year*12 */
  cumulativeFlatFees: number;
}

export interface GapDecomposition {
  /** includes the year-0 row (all zeros for fees/gap) */
  rows: GapDecompositionRow[];
  /** max(savings, 0) */
  finalGap: number;
  directFeeGap: number;
  compoundingGap: number;
  /** percent 0..100, 0 when finalGap === 0 */
  directFeeShare: number;
  /** percent 0..100, 0 when finalGap === 0 */
  compoundingShare: number;
}

export function buildGapDecomposition(projection: FeeProjectionResult): GapDecomposition {
  const { series, monthlyLedger, savings, totalFees, totalFlatFees } = projection;

  // Single pass over monthlyLedger: accumulate the exact running flat-fee
  // total and snapshot it at the close of every full year (monthInYear 12).
  const cumulativeFlatFeesByYear = new Map<number, number>([[0, 0]]);
  let runningFlatFees = 0;
  for (const month of monthlyLedger) {
    runningFlatFees += month.flatFeePaid;
    if (month.monthInYear === 12) {
      cumulativeFlatFeesByYear.set(month.year, runningFlatFees);
    }
  }

  const rows: GapDecompositionRow[] = series.map((row) => {
    const gap = row.withoutFees - row.withFees;
    const cumulativeFlatFees = cumulativeFlatFeesByYear.get(row.year) ?? 0;
    const feePart = Math.min(Math.max(row.cumulativeFees - cumulativeFlatFees, 0), Math.max(gap, 0));
    const compoundingPart = Math.max(gap - feePart, 0);
    return {
      year: row.year,
      calendarYear: row.calendarYear,
      flatValue: row.withoutFees,
      traditionalValue: row.withFees,
      gap,
      feePart,
      compoundingPart,
      annualAssetFees: row.annualFeesPaid,
      cumulativeAssetFees: row.cumulativeFees,
      cumulativeFlatFees,
    };
  });

  const finalGap = Math.max(savings, 0);
  const directFeeGap = Math.min(Math.max(totalFees - totalFlatFees, 0), finalGap);
  const compoundingGap = Math.max(finalGap - directFeeGap, 0);
  const directFeeShare = finalGap > 0 ? (directFeeGap / finalGap) * 100 : 0;
  const compoundingShare = finalGap > 0 ? (compoundingGap / finalGap) * 100 : 0;

  return {
    rows,
    finalGap,
    directFeeGap,
    compoundingGap,
    directFeeShare,
    compoundingShare,
  };
}
