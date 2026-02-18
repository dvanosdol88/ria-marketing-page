import type { CalcInputs } from "@/lib/calc";

function getNum(sp: URLSearchParams, k: string, fallback: number) {
  const v = sp.get(k);
  if (v === null) return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function getStr<T extends string>(
  sp: URLSearchParams,
  k: string,
  fallback: T,
  allowed: readonly T[]
) {
  const v = sp.get(k) as T | null;
  if (!v) return fallback;
  return (allowed as readonly string[]).includes(v) ? v : fallback;
}

export function inputsFromQuery(search: string, defaults: CalcInputs): CalcInputs {
  const sp = new URLSearchParams(search);

  const frequency = getStr(sp, "freq", defaults.contribution.frequency, [
    "none",
    "monthly",
    "annual",
  ] as const);

  return {
    ...defaults,
    initial: getNum(sp, "initial", defaults.initial),
    years: getNum(sp, "years", defaults.years),
    annualReturnPct: getNum(sp, "ret", defaults.annualReturnPct),
    contribution: {
      amount: getNum(sp, "contrib", defaults.contribution.amount),
      frequency,
    },
    fees: {
      aumPct: getNum(sp, "aum", defaults.fees.aumPct),
      flatAnnual: getNum(sp, "flat", defaults.fees.flatAnnual),
    },
  };
}

export function inputsToQuery(inputs: CalcInputs) {
  const sp = new URLSearchParams();
  sp.set("initial", String(inputs.initial));
  sp.set("years", String(inputs.years));
  sp.set("ret", String(inputs.annualReturnPct));
  sp.set("contrib", String(inputs.contribution.amount));
  sp.set("freq", inputs.contribution.frequency);
  sp.set("aum", String(inputs.fees.aumPct));
  sp.set("flat", String(inputs.fees.flatAnnual));
  return sp.toString();
}
