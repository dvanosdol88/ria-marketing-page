import { ImageResponse } from "next/og";
import { parseCalculatorState } from "@/lib/calculatorState";
import { buildFeeProjection } from "@/lib/feeProjection";
import { formatCurrency } from "@/lib/format";

export const runtime = "edge";
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
    initialInvestment: state.portfolioValue,
    years: state.years,
    annualFeePercent: totalAnnualFeePercent,
    annualGrowthPercent: state.annualGrowthPercent,
  });

  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #eef7f1 0%, #ffffff 46%, #dff4e7 100%)",
          color: "#062417",
          display: "flex",
          flexDirection: "column",
          fontFamily: "Arial, Helvetica, sans-serif",
          height: "100%",
          justifyContent: "space-between",
          padding: "58px 66px",
          position: "relative",
          width: "100%",
        }}
      >
        <div
          style={{
            background: "radial-gradient(circle, rgba(16,136,67,0.22) 0, rgba(16,136,67,0) 66%)",
            height: 360,
            position: "absolute",
            right: -90,
            top: -120,
            width: 360,
          }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ color: "#108843", display: "flex", fontSize: 28, fontWeight: 800 }}>Smarter Way Wealth</div>
            <div style={{ color: "#4b6075", display: "flex", fontSize: 24, fontWeight: 600 }}>Fee drag projection</div>
          </div>
          <div
            style={{
              alignItems: "center",
              background: "#062417",
              borderRadius: 14,
              color: "#ffffff",
              display: "flex",
              fontSize: 22,
              fontWeight: 800,
              height: 58,
              padding: "0 24px",
            }}
          >
            $100/mo flat fee
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ color: "#4b6075", display: "flex", fontSize: 34, fontWeight: 800 }}>Projected savings</div>
          <div style={{ color: "#108843", display: "flex", fontSize: 102, fontWeight: 900, letterSpacing: "-2px" }}>
            {formatCurrency(projection.savings)}
          </div>
          <div style={{ color: "#10233a", display: "flex", fontSize: 32, fontWeight: 700 }}>
            over {state.years} years on a {formatCurrency(state.portfolioValue)} portfolio
          </div>
        </div>

        <div
          style={{
            borderTop: "2px solid rgba(16,136,67,0.22)",
            color: "#31506d",
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
          <span>Ending gap: {formatCurrency(projection.finalValueWithoutFees - projection.finalValueWithFees)}</span>
        </div>
      </div>
    ),
    size
  );
}
