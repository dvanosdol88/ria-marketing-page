import type { CalcInputs, CalcResults } from "@/lib/calc";
import { fmtMoney, fmtPct } from "@/lib/format";

export default function ResultsSummary({
  inputs,
  results,
}: {
  inputs: CalcInputs;
  results: CalcResults;
}) {
  const feeDragPct = results.endingGross > 0 ? 1 - results.endingNet / results.endingGross : 0;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-base font-semibold">Summary</h2>
          <p className="mt-1 text-xs text-slate-600">
            {inputs.years} years • {inputs.annualReturnPct}% assumed annual return •{" "}
            {inputs.contribution.frequency === "none"
              ? "No contributions"
              : `${fmtMoney(inputs.contribution.amount)}/${inputs.contribution.frequency}`}
          </p>
        </div>

        <div className="text-xs text-slate-600">
          Fees: {inputs.fees.aumPct}% AUM{" "}
          {inputs.fees.flatAnnual ? ` + ${fmtMoney(inputs.fees.flatAnnual)}/yr flat` : ""}
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <KPI label="Ending value (Gross)" value={fmtMoney(results.endingGross)} />
        <KPI label="Ending value (Net)" value={fmtMoney(results.endingNet)} />
        <KPI label="Fee drag (Total)" value={`${fmtMoney(results.totalFees)} • ${fmtPct(feeDragPct)}`} />
      </div>

      <div className="mt-3 text-xs text-slate-600">
        Disclosure: Hypothetical illustration only. Constant returns assumption; excludes taxes,
        inflation, and fund expenses unless entered as fees.
      </div>
    </section>
  );
}

function KPI({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 p-3">
      <div className="text-xs font-medium text-slate-600">{label}</div>
      <div className="mt-1 text-lg font-semibold text-slate-900">{value}</div>
    </div>
  );
}
