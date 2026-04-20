import { describe, it, expect } from "vitest";
import { inputsFromQuery, inputsToQuery } from "@/lib/query";
import type { CalcInputs } from "@/lib/calc";

const defaults: CalcInputs = {
  initial: 100_000,
  years: 10,
  annualReturnPct: 7,
  contribution: { amount: 500, frequency: "monthly" },
  fees: { aumPct: 1, flatAnnual: 0 },
  contributionTiming: "end",
  compounding: "monthly",
};

describe("inputsFromQuery", () => {
  it("returns defaults when no search params provided", () => {
    const result = inputsFromQuery("", defaults);
    expect(result).toEqual(defaults);
  });

  it("parses valid numeric params", () => {
    const qs = "initial=200000&years=20&ret=8&contrib=1000&freq=monthly&aum=1.5&flat=500";
    const result = inputsFromQuery(qs, defaults);
    expect(result.initial).toBe(200_000);
    expect(result.years).toBe(20);
    expect(result.annualReturnPct).toBe(8);
    expect(result.contribution.amount).toBe(1_000);
    expect(result.contribution.frequency).toBe("monthly");
    expect(result.fees.aumPct).toBe(1.5);
    expect(result.fees.flatAnnual).toBe(500);
  });

  it("falls back to default for invalid numeric value", () => {
    const qs = "initial=notanumber";
    const result = inputsFromQuery(qs, defaults);
    expect(result.initial).toBe(defaults.initial);
  });

  it("falls back to default for unknown frequency", () => {
    const qs = "freq=weekly";
    const result = inputsFromQuery(qs, defaults);
    expect(result.contribution.frequency).toBe(defaults.contribution.frequency);
  });

  it("accepts all valid frequency values", () => {
    for (const freq of ["none", "monthly", "annual"] as const) {
      const result = inputsFromQuery(`freq=${freq}`, defaults);
      expect(result.contribution.frequency).toBe(freq);
    }
  });

  it("preserves defaults not present in query string", () => {
    const qs = "initial=50000";
    const result = inputsFromQuery(qs, defaults);
    expect(result.years).toBe(defaults.years);
    expect(result.annualReturnPct).toBe(defaults.annualReturnPct);
    expect(result.fees).toEqual(defaults.fees);
    expect(result.contributionTiming).toBe(defaults.contributionTiming);
    expect(result.compounding).toBe(defaults.compounding);
  });

  it("handles Infinity by falling back to default", () => {
    const qs = "initial=Infinity";
    const result = inputsFromQuery(qs, defaults);
    // Number("Infinity") is Infinity, which is not finite → fallback
    expect(result.initial).toBe(defaults.initial);
  });
});

describe("inputsToQuery", () => {
  it("serializes all inputs to query string params", () => {
    const qs = inputsToQuery(defaults);
    const sp = new URLSearchParams(qs);
    expect(sp.get("initial")).toBe(String(defaults.initial));
    expect(sp.get("years")).toBe(String(defaults.years));
    expect(sp.get("ret")).toBe(String(defaults.annualReturnPct));
    expect(sp.get("contrib")).toBe(String(defaults.contribution.amount));
    expect(sp.get("freq")).toBe(defaults.contribution.frequency);
    expect(sp.get("aum")).toBe(String(defaults.fees.aumPct));
    expect(sp.get("flat")).toBe(String(defaults.fees.flatAnnual));
  });

  it("is round-trippable: toQuery then fromQuery returns same inputs", () => {
    const qs = inputsToQuery(defaults);
    const result = inputsFromQuery(qs, defaults);
    expect(result.initial).toBe(defaults.initial);
    expect(result.years).toBe(defaults.years);
    expect(result.annualReturnPct).toBe(defaults.annualReturnPct);
    expect(result.contribution).toEqual(defaults.contribution);
    expect(result.fees).toEqual(defaults.fees);
  });

  it("returns a non-empty string", () => {
    expect(inputsToQuery(defaults).length).toBeGreaterThan(0);
  });
});
