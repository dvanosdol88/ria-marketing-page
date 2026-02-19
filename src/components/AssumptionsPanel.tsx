import type { CalcInputs, CalcResults } from "@/lib/calc";

export default function AssumptionsPanel({
  inputs,
}: {
  inputs: CalcInputs;
  results: CalcResults;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-base font-semibold">Assumptions & limits</h2>

      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
        <li>Returns are hypothetical and constant at the rate you entered.</li>
        <li>Model uses monthly periods; annual contributions are applied once per year.</li>
        <li>
          Contributions occur at <span className="font-medium">{inputs.contributionTiming}</span>-of-period
          (MVP).
        </li>
        <li>Fees apply pro-rata each period: AUM% on balance plus any flat fee.</li>
        <li>No taxes, inflation, trading costs, bid/ask spreads, or withdrawals in this version.</li>
        <li>Results are not a quote and are not investment advice.</li>
      </ul>

      <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-700">
        Tip: Use the share link to capture the exact assumptions used for this run.
      </div>
    </section>
  );
}
