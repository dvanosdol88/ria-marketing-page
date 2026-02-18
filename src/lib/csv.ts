import type { CalcInputs, CalcResults } from "@/lib/calc";

function esc(v: string) {
  if (v.includes(",") || v.includes('"') || v.includes("\n")) {
    return `"${v.replaceAll('"', '""')}"`;
  }
  return v;
}

export function makeCsv(inputs: CalcInputs, results: CalcResults) {
  const lines: string[] = [];

  lines.push("Fee Drag Calculator Export");
  lines.push(`Generated At,${new Date().toISOString()}`);
  lines.push("Inputs");
  lines.push(`Initial,${inputs.initial}`);
  lines.push(`Years,${inputs.years}`);
  lines.push(`AnnualReturnPct,${inputs.annualReturnPct}`);
  lines.push(`ContributionAmount,${inputs.contribution.amount}`);
  lines.push(`ContributionFrequency,${inputs.contribution.frequency}`);
  lines.push(`FeeAUMPct,${inputs.fees.aumPct}`);
  lines.push(`FeeFlatAnnual,${inputs.fees.flatAnnual}`);
  lines.push("");
  lines.push("Results");
  lines.push(`EndingGross,${results.endingGross}`);
  lines.push(`EndingNet,${results.endingNet}`);
  lines.push(`TotalFees,${results.totalFees}`);
  lines.push(`TotalContrib,${results.totalContrib}`);
  lines.push("");
  lines.push(
    esc(
      "Disclosure,These results are hypothetical and for educational purposes only. Constant return assumption; excludes taxes, inflation, and other costs not entered."
    )
  );
  lines.push("");
  lines.push("Year,ContribYTD,FeesYTD,Gross,Net");

  for (const r of results.yearRows) {
    lines.push([r.year, r.contribYtd, r.feesPaidYtd, r.gross, r.net].join(","));
  }

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "fee-drag-export.csv";
  a.click();
  URL.revokeObjectURL(url);
}
