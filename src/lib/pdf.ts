import type { CalcInputs, CalcResults } from "@/lib/calc";

export async function exportPdf(
  node: HTMLElement | null,
  inputs: CalcInputs,
  results: CalcResults
) {
  if (!node || typeof window === "undefined") return;

  const win = window.open("", "_blank", "noopener,noreferrer,width=960,height=1200");
  if (!win) return;

  const style = `
    <style>
      body { font-family: Arial, sans-serif; color: #0f172a; margin: 24px; }
      h1 { margin: 0 0 8px; font-size: 20px; }
      .meta { color: #475569; font-size: 12px; margin-bottom: 16px; }
      .capture { border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; }
      .disclosure { margin-top: 18px; font-size: 12px; color: #334155; line-height: 1.45; }
    </style>
  `;

  const now = new Date().toISOString();
  const summary = `Inputs: init=${inputs.initial}, yrs=${inputs.years}, ret=${inputs.annualReturnPct}%, contrib=${inputs.contribution.amount}/${inputs.contribution.frequency}, fees=${inputs.fees.aumPct}% + ${inputs.fees.flatAnnual}/yr | EndingNet=${Math.round(
    results.endingNet
  )}`;

  win.document.write(`
    <html>
      <head>
        <title>Fee Drag Export</title>
        ${style}
      </head>
      <body>
        <h1>Fee Drag Calculator Export</h1>
        <div class="meta">Generated ${now}</div>
        <div class="meta">${summary}</div>
        <div class="capture">${node.innerHTML}</div>
        <div class="disclosure">
          <strong>Important disclosure:</strong> These results are hypothetical and for educational purposes only. The calculator assumes a constant rate of return and applies fees as modeled from your inputs. It does not include taxes, inflation, trading costs, bid/ask spreads, cash flows beyond your contribution settings, or market volatility. Fees shown are not a quote and may differ from actual costs.
        </div>
      </body>
    </html>
  `);

  win.document.close();
  win.focus();
  win.print();
}
