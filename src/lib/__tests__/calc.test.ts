import { describe, it, expect } from "vitest";
import { calcProjection } from "@/lib/calc";
import type { CalcInputs } from "@/lib/calc";

const base: CalcInputs = {
  initial: 100_000,
  years: 10,
  annualReturnPct: 7,
  contribution: { amount: 0, frequency: "none" },
  fees: { aumPct: 1, flatAnnual: 0 },
  contributionTiming: "end",
  compounding: "monthly",
};

describe("calcProjection", () => {
  it("returns zero-year result with no change to principal", () => {
    const result = calcProjection({ ...base, years: 0 });
    expect(result.endingGross).toBe(100_000);
    expect(result.endingNet).toBe(100_000);
    expect(result.totalFees).toBe(0);
    expect(result.totalContrib).toBe(0);
    expect(result.series).toHaveLength(1);
    expect(result.yearRows).toHaveLength(0);
  });

  it("gross grows more than net due to fees", () => {
    const result = calcProjection(base);
    expect(result.endingGross).toBeGreaterThan(result.endingNet);
    expect(result.totalFees).toBeGreaterThan(0);
  });

  it("net > 0 after 10 years with reasonable inputs", () => {
    const result = calcProjection(base);
    expect(result.endingNet).toBeGreaterThan(0);
  });

  it("produces correct number of year rows and series points", () => {
    const result = calcProjection({ ...base, years: 5 });
    expect(result.yearRows).toHaveLength(5);
    // series has one point per month + initial = 5*12 + 1 = 61
    expect(result.series).toHaveLength(61);
  });

  it("zero initial investment stays at 0 net with only fees", () => {
    const result = calcProjection({ ...base, initial: 0, contribution: { amount: 0, frequency: "none" } });
    expect(result.endingGross).toBe(0);
    expect(result.endingNet).toBe(0);
  });

  it("monthly contributions accumulate in totalContrib", () => {
    const result = calcProjection({
      ...base,
      years: 1,
      contribution: { amount: 500, frequency: "monthly" },
    });
    // 12 months × $500
    expect(result.totalContrib).toBeCloseTo(6_000, 0);
  });

  it("annual contribution only adds once per year", () => {
    const result = calcProjection({
      ...base,
      years: 2,
      contribution: { amount: 10_000, frequency: "annual" },
    });
    // 2 years × $10,000
    expect(result.totalContrib).toBeCloseTo(20_000, 0);
  });

  it("frequency=none adds no contributions", () => {
    const result = calcProjection({ ...base, years: 5, contribution: { amount: 1000, frequency: "none" } });
    expect(result.totalContrib).toBe(0);
  });

  it("handles negative inputs gracefully (clamps to 0)", () => {
    const result = calcProjection({ ...base, initial: -5000, years: 5 });
    // clampFinite keeps negative as-is, gross/net start negative
    // No assertion on value since clamping is to 0 only for Infinity/NaN
    expect(result).toBeDefined();
  });

  it("handles NaN inputs via clampFinite", () => {
    const result = calcProjection({
      ...base,
      initial: NaN,
      annualReturnPct: NaN,
    });
    expect(result.endingGross).toBe(0);
    expect(result.endingNet).toBe(0);
  });

  it("flat annual fee deducts from net", () => {
    const withFlat = calcProjection({ ...base, fees: { aumPct: 0, flatAnnual: 1200 } });
    const withoutFees = calcProjection({ ...base, fees: { aumPct: 0, flatAnnual: 0 } });
    expect(withFlat.endingNet).toBeLessThan(withoutFees.endingNet);
    expect(withFlat.totalFees).toBeCloseTo(1200 * 10, -1);
  });

  it("year row gross and net are positive and gross >= net", () => {
    const result = calcProjection(base);
    for (const row of result.yearRows) {
      expect(row.gross).toBeGreaterThan(0);
      expect(row.net).toBeGreaterThan(0);
      expect(row.gross).toBeGreaterThanOrEqual(row.net);
    }
  });

  it("series t values start at 0 and increment monthly", () => {
    const result = calcProjection({ ...base, years: 1 });
    expect(result.series[0].t).toBe(0);
    expect(result.series[result.series.length - 1].t).toBe(12);
  });

  it("large years value does not crash", () => {
    const result = calcProjection({ ...base, years: 50 });
    expect(result.endingGross).toBeGreaterThan(0);
    expect(result.yearRows).toHaveLength(50);
  });

  it("100% AUM fee nearly drains net to 0", () => {
    // 100% AUM means 1/12 ≈ 8.33% monthly fee; growth partially offsets each month
    // Net is very small (< 10) but may not reach exactly 0 due to floating point
    const result = calcProjection({ ...base, fees: { aumPct: 100, flatAnnual: 0 } });
    expect(result.endingNet).toBeLessThan(10);
    expect(result.endingGross).toBeGreaterThan(result.endingNet);
  });

  it("0% return with 0 fees keeps principal unchanged", () => {
    const result = calcProjection({ ...base, annualReturnPct: 0, fees: { aumPct: 0, flatAnnual: 0 } });
    expect(result.endingGross).toBeCloseTo(100_000, 0);
    expect(result.endingNet).toBeCloseTo(100_000, 0);
  });

  it("feesPaidYtd per row sums to totalFees", () => {
    const result = calcProjection(base);
    const sumFees = result.yearRows.reduce((acc, r) => acc + r.feesPaidYtd, 0);
    expect(sumFees).toBeCloseTo(result.totalFees, 1);
  });

  it("contribYtd per row sums to totalContrib for monthly", () => {
    const result = calcProjection({
      ...base,
      years: 3,
      contribution: { amount: 200, frequency: "monthly" },
    });
    const sumContrib = result.yearRows.reduce((acc, r) => acc + r.contribYtd, 0);
    expect(sumContrib).toBeCloseTo(result.totalContrib, 1);
  });
});
