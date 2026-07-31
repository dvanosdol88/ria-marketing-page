import { NextResponse } from "next/server";
import {
  extraInterestPerYear,
  getTopMoneyMarketApy,
  getTopSavingsApy,
  getTopVerifiedApy,
  savingsRates,
} from "@/lib/savingsRates";
import { formatCurrency } from "@/lib/format";

export const dynamic = "force-dynamic";

/**
 * Machine-readable version of /savings-rates, so agents can call rather
 * than scrape (same pattern as /api/calculator).
 *
 * Optional query parameters mirror the page's calculator:
 *   ?balance=50000&current=0.38
 * returns the first-year extra interest at the top verified rate.
 */
export function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const balanceParam = Number(params.get("balance"));
  const currentParam = Number(params.get("current"));
  const balance =
    Number.isFinite(balanceParam) && balanceParam > 0
      ? Math.min(balanceParam, 100_000_000)
      : 50000;
  const currentApyPercent =
    Number.isFinite(currentParam) && currentParam >= 0 && currentParam <= 25
      ? currentParam
      : savingsRates.fdic.savingsApyPercent;
  const topApyPercent = getTopVerifiedApy();
  const extraPerYear = extraInterestPerYear(
    balance,
    currentApyPercent,
    topApyPercent,
  );

  return NextResponse.json({
    site: {
      name: "You Are Paying Too Much",
      url: "https://youarepayingtoomuch.com/savings-rates",
      purpose:
        "Verified, dated table of top standard nationally available high-yield savings and money market rates, published for education. Not a recommendation of any institution.",
    },
    verification: {
      lastFullVerification: savingsRates.meta.lastFullVerification,
      policy: savingsRates.meta.policyNotes,
    },
    fdicNationalAverages: {
      source: savingsRates.fdic.sourceUrl,
      ratesAsOf: savingsRates.fdic.ratesAsOf,
      savingsApyPercent: savingsRates.fdic.savingsApyPercent,
      moneyMarketApyPercent: savingsRates.fdic.moneyMarketApyPercent,
    },
    topRates: savingsRates.topRates,
    summary: {
      topSavingsApyPercent: getTopSavingsApy(),
      topMoneyMarketApyPercent: getTopMoneyMarketApy(),
      topVerifiedApyPercent: topApyPercent,
    },
    scenario: {
      balance,
      currentApyPercent,
      topApyPercent,
      extraInterestFirstYear: extraPerYear,
      extraInterestFirstYearFormatted: formatCurrency(extraPerYear),
      note: "Simple first-year difference before compounding and taxes. Rates are variable and change without notice.",
      scenarioUrl: `https://youarepayingtoomuch.com/savings-rates?balance=${balance}&current=${currentApyPercent}`,
    },
  });
}
