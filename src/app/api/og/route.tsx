import { ImageResponse } from "next/og";
import { parseCalculatorState } from "@/lib/calculatorState";
import { buildFeeProjection, RIA_MONTHLY_FEE } from "@/lib/feeProjection";

export const runtime = "edge";

const SAFARI_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15";

async function loadInter(weight: 400 | 900, text: string): Promise<ArrayBuffer | null> {
  try {
    const fontUrl = `https://fonts.googleapis.com/css2?family=Inter:wght@${weight}&text=${encodeURIComponent(text)}`;
    const cssResponse = await fetch(fontUrl, {
      headers: { "User-Agent": SAFARI_UA },
      signal: AbortSignal.timeout(2500),
    });
    if (!cssResponse.ok) return null;
    const css = await cssResponse.text();
    const match = css.match(/src:\s*url\(([^)]+)\)\s*format\('(opentype|truetype)'\)/);
    if (!match) return null;
    const fontResponse = await fetch(match[1], {
      signal: AbortSignal.timeout(2500),
    });
    if (!fontResponse.ok) return null;
    return await fontResponse.arrayBuffer();
  } catch {
    return null;
  }
}

function formatUsd(value: number): string {
  return "$" + Math.floor(Math.max(0, value)).toLocaleString("en-US");
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const state = parseCalculatorState(url.searchParams);
  const totalFeePercent = state.annualFeePercent + state.mutualFundExpensePercent;

  const projection = buildFeeProjection({
    initialInvestment: state.portfolioValue,
    annualFeePercent: totalFeePercent,
    annualGrowthPercent: state.annualGrowthPercent,
    years: state.years,
  });

  const savings = formatUsd(projection.savings);
  const portfolio = formatUsd(state.portfolioValue);
  const assumptions = `${portfolio} starting · ${state.annualFeePercent.toFixed(2)}% advisor fee · ${state.annualGrowthPercent.toFixed(1)}% growth · ${state.years} yrs`;

  const fontChars =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz $%.,/'·…—–-:";

  const [interBlack, interRegular] = await Promise.all([
    loadInter(900, fontChars),
    loadInter(400, fontChars),
  ]);

  const fonts: Array<{
    name: string;
    data: ArrayBuffer;
    weight: 400 | 900;
    style: "normal";
  }> = [];
  if (interBlack) fonts.push({ name: "Inter", data: interBlack, weight: 900, style: "normal" });
  if (interRegular) fonts.push({ name: "Inter", data: interRegular, weight: 400, style: "normal" });

  const response = new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#EEF0F5",
          padding: "72px 88px",
          fontFamily: "Inter, sans-serif",
          color: "#10233A",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 22,
            fontWeight: 900,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#108843",
          }}
        >
          Smarter Way Wealth · projection
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 36,
            fontSize: 34,
            fontWeight: 400,
            color: "#10233A",
          }}
        >
          You&apos;d keep
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 10,
            fontSize: 168,
            fontWeight: 900,
            color: "#108843",
            letterSpacing: "-0.04em",
            lineHeight: 1,
          }}
        >
          {savings}
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 18,
            fontSize: 32,
            fontWeight: 400,
            color: "#10233A",
          }}
        >
          …more, over {state.years} years.
        </div>

        <div style={{ display: "flex", flex: 1 }} />

        <div
          style={{
            display: "flex",
            width: "100%",
            height: 1,
            backgroundColor: "#D5DEE8",
          }}
        />

        <div
          style={{
            display: "flex",
            marginTop: 22,
            fontSize: 22,
            fontWeight: 400,
            color: "#41556C",
          }}
        >
          {assumptions}
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 18,
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 24,
              fontWeight: 900,
              color: "#10233A",
            }}
          >
            youarepayingtoomuch.com
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 20,
              fontWeight: 400,
              color: "#5E6F80",
            }}
          >
            vs. ${RIA_MONTHLY_FEE}/mo flat fee
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: fonts.length > 0 ? fonts : undefined,
    }
  );

  response.headers.set(
    "Cache-Control",
    "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800"
  );

  return response;
}
