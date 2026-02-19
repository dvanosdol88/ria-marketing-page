"use client";

import type { CalcInputs, ContributionFrequency } from "@/lib/calc";

const freqOptions: ContributionFrequency[] = ["none", "monthly", "annual"];

function num(v: string) {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
}

export default function InputsForm({
  value,
  onChange,
}: {
  value: CalcInputs;
  onChange: (next: CalcInputs) => void;
}) {
  const v = value;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-base font-semibold">Inputs</h2>

      <div className="mt-4 space-y-3">
        <Field label="Initial balance ($)">
          <input
            inputMode="decimal"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            value={v.initial}
            onChange={(e) => onChange({ ...v, initial: num(e.target.value) })}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Time horizon (years)">
            <input
              inputMode="numeric"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              value={v.years}
              onChange={(e) =>
                onChange({ ...v, years: Math.max(0, Math.floor(num(e.target.value))) })
              }
            />
          </Field>

          <Field label="Gross return (annual %)">
            <input
              inputMode="decimal"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              value={v.annualReturnPct}
              onChange={(e) => onChange({ ...v, annualReturnPct: num(e.target.value) })}
            />
          </Field>
        </div>

        <div className="rounded-xl border border-slate-200 p-3">
          <div className="text-sm font-medium text-slate-800">Contributions</div>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <Field label="Amount ($)">
              <input
                inputMode="decimal"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={v.contribution.amount}
                onChange={(e) =>
                  onChange({
                    ...v,
                    contribution: { ...v.contribution, amount: num(e.target.value) },
                  })
                }
                disabled={v.contribution.frequency === "none"}
              />
            </Field>

            <Field label="Frequency">
              <select
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={v.contribution.frequency}
                onChange={(e) =>
                  onChange({
                    ...v,
                    contribution: {
                      ...v.contribution,
                      frequency: e.target.value as ContributionFrequency,
                    },
                  })
                }
              >
                {freqOptions.map((f) => (
                  <option key={f} value={f}>
                    {f === "none" ? "None" : f === "monthly" ? "Monthly" : "Annual"}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="mt-2 text-xs text-slate-600">Timing: End-of-period (MVP)</div>
        </div>

        <div className="rounded-xl border border-slate-200 p-3">
          <div className="text-sm font-medium text-slate-800">Fees</div>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <Field label="AUM fee (%/yr)">
              <input
                inputMode="decimal"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={v.fees.aumPct}
                onChange={(e) =>
                  onChange({
                    ...v,
                    fees: { ...v.fees, aumPct: num(e.target.value) },
                  })
                }
              />
            </Field>

            <Field label="Flat fee ($/yr)">
              <input
                inputMode="decimal"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={v.fees.flatAnnual}
                onChange={(e) =>
                  onChange({
                    ...v,
                    fees: { ...v.fees, flatAnnual: num(e.target.value) },
                  })
                }
              />
            </Field>
          </div>
          <div className="mt-2 text-xs text-slate-600">Hybrid model = AUM + flat (both apply)</div>
        </div>

        <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-700">
          Assumes constant returns, monthly periods, and pro-rata fee application. No taxes, inflation,
          or withdrawals in this version.
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1 text-xs font-medium text-slate-700">{label}</div>
      {children}
    </label>
  );
}
