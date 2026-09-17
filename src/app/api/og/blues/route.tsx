import { ImageResponse } from "next/og";
import { parseCalculatorState } from "@/lib/calculatorState";
import { buildFeeProjection } from "@/lib/feeProjection";
import { formatCurrency } from "@/lib/format";

/* The One Percent Blues share card: the same query contract and receipt
   language as /api/og (tests/share-receipt-language.test.mjs), in the blue
   page's palette. Used by the blue layout's Open Graph / Twitter metadata. */
export const dynamic = "force-dynamic";

const size = {
  width: 1200,
  height: 630,
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const state = parseCalculatorState(url.searchParams);
  const totalAnnualFeePercent = state.annualFeePercent + state.mutualFundExpensePercent;
  const projection = buildFeeProjection({
    annualFlatFee: state.annualFlatFee,
    initialInvestment: state.portfolioValue,
    years: state.years,
    annualFeePercent: totalAnnualFeePercent,
    annualGrowthPercent: state.annualGrowthPercent,
  });

  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #1E3A8A 0%, #2563EB 55%, #60A5FA 100%)",
          color: "#ffffff",
          display: "flex",
          flexDirection: "column",
          fontFamily: "Georgia, 'Times New Roman', serif",
          height: "100%",
          justifyContent: "space-between",
          padding: "58px 66px",
          position: "relative",
          width: "100%",
        }}
      >
        <div
          style={{
            background: "radial-gradient(circle, rgba(255,255,255,0.18) 0, rgba(255,255,255,0) 66%)",
            height: 360,
            position: "absolute",
            right: -90,
            top: -120,
            width: 360,
          }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ color: "#ffffff", display: "flex", fontSize: 28, fontWeight: 800 }}>One Percent Blues</div>
            <div style={{ color: "#BFDBFE", display: "flex", fontSize: 24, fontWeight: 600 }}>Got the 1% Blues?</div>
          </div>
          <div
            style={{
              alignItems: "center",
              background: "#ffffff",
              borderRadius: 14,
              color: "#1E3A8A",
              display: "flex",
              fontSize: 22,
              fontWeight: 800,
              height: 58,
              padding: "0 24px",
            }}
          >
            {formatCurrency(state.annualFlatFee / 12)}/mo flat fee
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ color: "#BFDBFE", display: "flex", fontSize: 34, fontWeight: 800 }}>Estimated advisory-fee difference</div>
          <div style={{ color: "#ffffff", display: "flex", fontSize: 102, fontWeight: 900, letterSpacing: "-2px" }}>
            {formatCurrency(projection.savings)}
          </div>
          <div style={{ color: "#ffffff", display: "flex", fontSize: 32, fontWeight: 700 }}>
            over {state.years} years on a {formatCurrency(state.portfolioValue)} portfolio
          </div>
        </div>

        <div
          style={{
            borderTop: "2px solid rgba(255,255,255,0.28)",
            color: "#DBEAFE",
            display: "flex",
            fontSize: 25,
            fontWeight: 700,
            gap: 32,
            paddingTop: 24,
            width: "100%",
          }}
        >
          <span>Asset-based fee: {totalAnnualFeePercent.toFixed(2)}%</span>
          <span>Growth: {state.annualGrowthPercent.toFixed(1)}%</span>
          <span>Smarter Way Wealth · $100/month. Period.</span>
        </div>
      </div>
    ),
    size
  );
}
