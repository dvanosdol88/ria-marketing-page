// Fee-site copy of smarterwaywealth.com's detailed share card
// (D:\smarter-way-wealth src/app/calculator/share-card/route.tsx), served at
// /calculator/share-card for the full calculator page (fee-lab stage 1,
// section 2: docs/plans/2026-11-26-fee-lab-stage1-section2-go-live.md).
// The home page's card stays /api/og, whose basic query shape cannot carry
// a market-history window or a tiered fee schedule; this card draws the
// detailed scenario's own figures. Differences from the firm file: the
// namespaced calculatorState import, and the summary link uses this site's
// /calculator path. The footer domain and attribution line come from this
// site's siteCalculatorConfig (youarepayingtoomuch.com and its own line).

import { ImageResponse } from "next/og";
import {
  DEFAULT_DETAILED_STATE,
  parseDetailedCalculatorState,
  type DetailedCalculatorState,
} from "@/lib/full-calculator/calculatorState";
import { buildShareCardData } from "@/lib/shareCardData";
import { buildShareSummary } from "@/lib/shareSummary";
import { formatCurrency } from "@/lib/format";
import { siteCalculatorConfig } from "@/lib/siteCalculatorConfig";
import { fullCalculatorSite } from "@/config/full-calculator/fullCalculatorSite";

const CARD_WIDTH = 1200;
const CARD_HEIGHT = 630;
const PAD_X = 80;
const CONTENT_WIDTH = CARD_WIDTH - PAD_X * 2;

/**
 * Hostile input is already clamped by `parseDetailedCalculatorState`, but a
 * malformed query (e.g. a `tiers` value that throws while serializing
 * elsewhere) should still render *something* rather than 500 — this card is
 * the first impression in a link preview.
 */
function resolveState(searchParams: URLSearchParams): DetailedCalculatorState {
  try {
    return parseDetailedCalculatorState(searchParams);
  } catch {
    return DEFAULT_DETAILED_STATE;
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const state = resolveState(url.searchParams);
  const { effectiveYears, projection, returnLabel, feeLabel, monthlyFlatFee, returnMode, growthPercent, marketWindow } =
    buildShareCardData(state);

  const summary = buildShareSummary({
    savings: projection.savings,
    flatEndingValue: projection.finalValueWithoutFees,
    traditionalEndingValue: projection.finalValueWithFees,
    portfolioValue: state.portfolioValue,
    years: effectiveYears,
    monthlyFlatFee,
    returnLabel,
    feeLabel,
    returnMode,
    growthPercent,
    marketWindow,
    firmDisplayName: siteCalculatorConfig.firmDisplayName,
    url: `${url.origin}${fullCalculatorSite.calculatorPath}`,
  });

  const isPositive = projection.savings >= 0;
  const accent = isPositive ? "#007A2F" : "#B42318";
  const subLine =
    `over ${effectiveYears} years · ${formatCurrency(state.portfolioValue)} starting portfolio · ${returnLabel}`;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#EEF0F5",
          padding: `48px ${PAD_X}px`,
          fontFamily: "sans-serif",
        }}
      >
        {/* Brand mark + eyebrow */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 14 }}>
            <div style={{ width: 26, height: 44, backgroundColor: "#7ADCA6", borderRadius: 3 }} />
            <div style={{ width: 26, height: 68, backgroundColor: "#00A540", borderRadius: 3 }} />
            <div style={{ width: 26, height: 92, backgroundColor: "#007A2F", borderRadius: 3 }} />
            <div style={{ display: "flex", flexDirection: "column", marginLeft: 20, paddingBottom: 4 }}>
              <div style={{ display: "flex", fontSize: 28, fontWeight: 700, letterSpacing: 3, color: "#10233A" }}>
                SMARTER
              </div>
              <div style={{ display: "flex", fontSize: 14, fontWeight: 700, letterSpacing: 5, color: "#007A2F", marginTop: 4 }}>
                WAY WEALTH
              </div>
            </div>
          </div>
          <div style={{ display: "flex", fontSize: 13, fontWeight: 700, letterSpacing: 1.5, color: "#53606A" }}>
            FEE COMPARISON · EDUCATIONAL ILLUSTRATION
          </div>
        </div>

        {/* Headline result */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 20, fontWeight: 800, letterSpacing: 1, color: accent }}>
            {isPositive ? "ESTIMATED ADVISORY-FEE DIFFERENCE" : "DIFFERENCE IN THIS SCENARIO"}
          </div>
          <div style={{ display: "flex", fontSize: 80, fontWeight: 800, lineHeight: 1, color: accent, marginTop: 12 }}>
            {formatCurrency(projection.savings)}
          </div>
          <div style={{ display: "flex", fontSize: 20, fontWeight: 600, color: "#33465A", marginTop: 18, maxWidth: CONTENT_WIDTH }}>
            {subLine}
          </div>

          <div style={{ display: "flex", gap: 24, marginTop: 26 }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                backgroundColor: "#E8F7EE",
                border: "1.5px solid #BFE7D1",
                borderRadius: 12,
                padding: "16px 20px",
              }}
            >
              <div style={{ display: "flex", fontSize: 13, fontWeight: 700, letterSpacing: 1, color: "#0A6E35" }}>
                FLAT-FEE ENDING VALUE
              </div>
              <div style={{ display: "flex", fontSize: 26, fontWeight: 800, color: "#0A6E35", marginTop: 6 }}>
                {formatCurrency(projection.finalValueWithoutFees)}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                backgroundColor: "#EAF1F8",
                border: "1.5px solid #C9D8E4",
                borderRadius: 12,
                padding: "16px 20px",
              }}
            >
              <div style={{ display: "flex", fontSize: 13, fontWeight: 700, letterSpacing: 1, color: "#064B84" }}>
                TRADITIONAL ENDING VALUE
              </div>
              <div style={{ display: "flex", fontSize: 26, fontWeight: 800, color: "#062B43", marginTop: 6 }}>
                {formatCurrency(projection.finalValueWithFees)}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", fontSize: 16, fontWeight: 600, color: "#53606A", marginTop: 18, maxWidth: CONTENT_WIDTH }}>
            {feeLabel}
          </div>
        </div>

        {/* Footer: domain, disclosure, attribution */}
        <div style={{ display: "flex", flexDirection: "column", borderTop: "2px solid #C9D8E4", paddingTop: 18 }}>
          <div style={{ display: "flex", fontSize: 15, fontWeight: 700, color: "#53606A" }}>
            {siteCalculatorConfig.displayDomain}
          </div>
          <div style={{ display: "flex", fontSize: 13, fontWeight: 400, color: "#53606A", marginTop: 6, maxWidth: CONTENT_WIDTH }}>
            {summary.disclosure}
          </div>
          <div style={{ display: "flex", fontSize: 13, fontWeight: 700, color: "#53606A", marginTop: 6 }}>
            {siteCalculatorConfig.brandAttributionLine}
          </div>
        </div>
      </div>
    ),
    {
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      headers: {
        "Cache-Control": "public, max-age=3600",
      },
    },
  );
}
