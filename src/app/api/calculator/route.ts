import { NextResponse } from "next/server";
import { EDDM_LAUNCH_QR_URL, SMARTER_WAY_WEALTH_ORIGIN } from "@/config/campaignLinks";
import { buildQueryFromState, parseCalculatorState } from "@/lib/calculatorState";
import { buildFeeProjection } from "@/lib/feeProjection";
import { formatCompactCurrency, formatCurrency } from "@/lib/format";
import { CALCULATOR_NOTES, CALCULATOR_NOTES_ANCHOR } from "@/config/calculatorNotes";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const calculatorState = parseCalculatorState(requestUrl.searchParams);
  const totalAnnualFeePercent =
    calculatorState.annualFeePercent + calculatorState.mutualFundExpensePercent;
  const projection = buildFeeProjection({
    annualFlatFee: calculatorState.annualFlatFee,
    initialInvestment: calculatorState.portfolioValue,
    years: calculatorState.years,
    annualFeePercent: totalAnnualFeePercent,
    annualGrowthPercent: calculatorState.annualGrowthPercent,
  });
  const query = buildQueryFromState(calculatorState, requestUrl.searchParams);
  const scenarioUrl = new URL(`/?${query}`, "https://youarepayingtoomuch.com").toString();

  return NextResponse.json(
    {
      site: {
        name: "You Are Paying Too Much",
        url: "https://youarepayingtoomuch.com",
        purpose:
          "Educational calculator showing how asset-based advisory fees can compound over time.",
      },
      firm: {
        name: "Smarter Way Wealth, LLC",
        registeredInvestmentAdviser: "Connecticut-registered investment adviser",
        crd: "342140",
        iapdUrl: "https://adviserinfo.sec.gov/firm/summary/342140",
        firmUrl: SMARTER_WAY_WEALTH_ORIGIN,
        founder: "David J. Van Osdol, CFA, CFP",
      },
      assumptions: {
        portfolioValue: calculatorState.portfolioValue,
        years: calculatorState.years,
        annualGrowthPercent: calculatorState.annualGrowthPercent,
        advisoryFeePercent: calculatorState.annualFeePercent,
        mutualFundExpensePercent: calculatorState.mutualFundExpensePercent,
        totalAnnualFeePercent,
        annualFlatFee: calculatorState.annualFlatFee,
        monthlyFlatFee: calculatorState.annualFlatFee / 12,
      },
      results: {
        projectedSavings: projection.savings,
        projectedSavingsFormatted: formatCurrency(projection.savings),
        projectedSavingsCompact: formatCompactCurrency(projection.savings),
        finalValueWithAssetBasedFee: projection.finalValueWithFees,
        finalValueWithFlatFee: projection.finalValueWithoutFees,
        totalAssetBasedFeesPaid: projection.totalFees,
        totalFlatFeesPaid: projection.totalFlatFees,
      },
      links: {
        scenarioUrl,
        canonicalEddmQrUrl: EDDM_LAUNCH_QR_URL,
        smarterWayWealth: SMARTER_WAY_WEALTH_ORIGIN,
        iapd: "https://adviserinfo.sec.gov/firm/summary/342140",
        disclosureNotes: `https://youarepayingtoomuch.com/#${CALCULATOR_NOTES_ANCHOR}`,
      },
      /* llms.txt tells agents to prefer this endpoint over reading the page, so
         it must not carry a weaker disclosure set than the page does. These are
         the same four notes the page renders, from the same source, plus the
         standing firm-level statements that are not tied to a figure. */
      disclosures: [
        ...CALCULATOR_NOTES.map((note) => `${note.title}. ${note.body}`),
        "Using the calculator does not establish an advisory relationship with Smarter Way Wealth, LLC.",
        "Registration does not imply a certain level of skill or training.",
      ],
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
