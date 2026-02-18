"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import InputsForm from "@/components/InputsForm";
import ResultsSummary from "@/components/ResultsSummary";
import AssumptionsPanel from "@/components/AssumptionsPanel";
import YearTable from "@/components/YearTable";
import ExportButtons from "@/components/ExportButtons";
import ChartLine from "@/components/ChartLine";
import { calcProjection, type CalcInputs } from "@/lib/calc";
import { inputsFromQuery, inputsToQuery } from "@/lib/query";

const DEFAULTS: CalcInputs = {
  initial: 0,
  years: 10,
  annualReturnPct: 9,
  contribution: { amount: 1000, frequency: "monthly" },
  fees: { aumPct: 1.0, flatAnnual: 0 },
  contributionTiming: "end",
  compounding: "monthly",
};

export default function Page() {
  const [inputs, setInputs] = useState<CalcInputs>(DEFAULTS);
  const [showAssumptions, setShowAssumptions] = useState(false);
  const exportRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const parsed = inputsFromQuery(window.location.search, DEFAULTS);
    setInputs(parsed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const qs = inputsToQuery(inputs);
    const url = `${window.location.pathname}?${qs}`;
    window.history.replaceState({}, "", url);
  }, [inputs]);

  const results = useMemo(() => calcProjection(inputs), [inputs]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 md:py-10">
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Fee Drag Calculator</h1>
          <p className="mt-1 text-sm text-slate-600">
            Hypothetical illustration of how fees may affect outcomes over time.
          </p>
        </div>

        <button
          onClick={() => setShowAssumptions((v) => !v)}
          className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          aria-expanded={showAssumptions}
        >
          Assumptions &amp; limits
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <div className="md:col-span-2">
          <InputsForm value={inputs} onChange={setInputs} />
          <div className="mt-4">
            <ExportButtons inputs={inputs} results={results} exportRef={exportRef} />
          </div>
        </div>

        <div className="space-y-4 md:col-span-3">
          <div ref={exportRef} className="space-y-4">
            <ResultsSummary inputs={inputs} results={results} />

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold">Growth (Gross vs Net)</h2>
                <div className="text-xs text-slate-500">Monthly periods • Constant return assumption</div>
              </div>
              <div className="mt-3">
                <ChartLine series={results.series} />
              </div>
              <div className="mt-3 text-xs text-slate-600">
                Disclosure: This chart shows hypothetical results using constant returns and the fee inputs
                you provided. Real markets vary.
              </div>
            </div>

            {showAssumptions && <AssumptionsPanel inputs={inputs} results={results} />}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-base font-semibold">Year-by-year</h2>
            <p className="mt-1 text-xs text-slate-600">
              Year-end values; contributions assumed {inputs.contributionTiming}-of-period.
            </p>
            <div className="mt-3">
              <YearTable rows={results.yearRows} />
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-10 border-t border-slate-200 pt-6 text-xs text-slate-600">
        <div className="max-w-3xl">
          <p className="font-medium text-slate-700">Important disclosure</p>
          <p className="mt-2">
            These results are hypothetical and for educational purposes only. The calculator assumes a
            constant rate of return and applies fees as modeled from your inputs. It does not include
            taxes, inflation, trading costs, bid/ask spreads, cash flows beyond your contribution
            settings, or market volatility. Fees shown are not a quote and may differ from actual costs.
          </p>
        </div>
      </footer>
    </main>
  );
}
