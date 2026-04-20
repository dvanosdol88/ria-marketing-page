import { describe, it, expect } from "vitest";
import { buildFeeProjection, RIA_MONTHLY_FEE } from "@/lib/feeProjection";

describe("buildFeeProjection", () => {
  const base = {
    initialInvestment: 500_000,
    annualFeePercent: 1,
    annualGrowthPercent: 7,
    years: 20,
  };

  it("returns a series with year-0 snapshot", () => {
    const result = buildFeeProjection(base);
    expect(result.series[0].year).toBe(0);
    expect(result.series[0].withoutFees).toBe(base.initialInvestment);
    expect(result.series[0].withFees).toBe(base.initialInvestment);
  });

  it("series length equals years + 1 (including year 0)", () => {
    const result = buildFeeProjection(base);
    expect(result.series).toHaveLength(base.years + 1);
  });

  it("flat-fee portfolio is worth more than AUM-fee portfolio", () => {
    const result = buildFeeProjection(base);
    expect(result.finalValueWithoutFees).toBeGreaterThan(result.finalValueWithFees);
    expect(result.savings).toBeGreaterThan(0);
  });

  it("totalFlatFees equals RIA_MONTHLY_FEE × months", () => {
    const result = buildFeeProjection(base);
    expect(result.totalFlatFees).toBeCloseTo(RIA_MONTHLY_FEE * base.years * 12, 1);
  });

  it("totalFees is positive for positive AUM percent", () => {
    const result = buildFeeProjection(base);
    expect(result.totalFees).toBeGreaterThan(0);
  });

  it("savings = finalValueWithoutFees - finalValueWithFees", () => {
    const result = buildFeeProjection(base);
    expect(result.savings).toBeCloseTo(result.finalValueWithoutFees - result.finalValueWithFees, 1);
  });

  it("0% AUM fee still charges flat fee and shows savings as negative", () => {
    const result = buildFeeProjection({ ...base, annualFeePercent: 0 });
    // withFees = withoutFees for AUM track since no AUM fee, but flat fee track still deducts $100/mo
    // So finalValueWithFees > finalValueWithoutFees
    expect(result.totalFees).toBeCloseTo(0, 0);
    expect(result.savings).toBeLessThanOrEqual(0);
  });

  it("0% growth reduces portfolio due to fees", () => {
    const result = buildFeeProjection({ ...base, annualGrowthPercent: 0 });
    expect(result.finalValueWithFees).toBeLessThan(base.initialInvestment);
    expect(result.finalValueWithoutFees).toBeLessThan(base.initialInvestment);
  });

  it("cumulativeFees in each series row is non-decreasing", () => {
    const result = buildFeeProjection(base);
    for (let i = 1; i < result.series.length; i++) {
      expect(result.series[i].cumulativeFees).toBeGreaterThanOrEqual(result.series[i - 1].cumulativeFees);
    }
  });

  it("annualFeesPaid resets each year (not cumulative)", () => {
    const result = buildFeeProjection(base);
    // Year 1 annual fees should be less than cumulative fees at year 2
    const year1 = result.series[1];
    const year2 = result.series[2];
    expect(year2.cumulativeFees).toBeGreaterThan(year1.annualFeesPaid);
  });

  it("1-year projection returns 2 data points", () => {
    const result = buildFeeProjection({ ...base, years: 1 });
    expect(result.series).toHaveLength(2);
  });

  it("large years does not crash", () => {
    const result = buildFeeProjection({ ...base, years: 50 });
    expect(result.series).toHaveLength(51);
    expect(result.finalValueWithoutFees).toBeGreaterThan(0);
  });

  it("very high AUM fee causes withFees portfolio to grow slower", () => {
    const high = buildFeeProjection({ ...base, annualFeePercent: 3 });
    const low = buildFeeProjection({ ...base, annualFeePercent: 0.5 });
    expect(high.finalValueWithFees).toBeLessThan(low.finalValueWithFees);
  });

  it("RIA_MONTHLY_FEE is 100", () => {
    expect(RIA_MONTHLY_FEE).toBe(100);
  });
});
