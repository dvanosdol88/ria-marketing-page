"use client";

import type { CalcInputs, CalcResults } from "@/lib/calc";
import { makeCsv } from "@/lib/csv";
import { exportPdf } from "@/lib/pdf";

export default function ExportButtons({
  inputs,
  results,
  exportRef,
}: {
  inputs: CalcInputs;
  results: CalcResults;
  exportRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold">Exports</h3>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
          onClick={() => makeCsv(inputs, results)}
        >
          Download CSV
        </button>

        <button
          className="rounded-xl bg-[#01793D] px-3 py-2 text-sm font-medium text-white hover:brightness-95"
          onClick={() => exportPdf(exportRef.current, inputs, results)}
        >
          Download PDF
        </button>

        <button
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          onClick={async () => {
            await navigator.clipboard.writeText(window.location.href);
          }}
        >
          Copy share link
        </button>
      </div>

      <div className="mt-3 text-xs text-slate-600">
        Exports include your inputs + assumptions disclosure for recordkeeping.
      </div>
    </div>
  );
}
