import { describe, it, expect } from "vitest";
import {
  parseNumber,
  parseInteger,
  parseCalculatorState,
  buildQueryFromState,
  paramsToRecord,
  DEFAULT_STATE,
} from "@/lib/calculatorState";

describe("parseNumber", () => {
  it("returns fallback for null input", () => {
    expect(parseNumber(null, 10, 0, 100)).toBe(10);
  });

  it("returns fallback for empty string", () => {
    expect(parseNumber("", 5, 0, 100)).toBe(5);
  });

  it("returns fallback for NaN string", () => {
    expect(parseNumber("abc", 7, 0, 100)).toBe(7);
  });

  it("clamps to min", () => {
    expect(parseNumber("5", 10, 20, 100)).toBe(20);
  });

  it("clamps to max", () => {
    expect(parseNumber("200", 10, 0, 100)).toBe(100);
  });

  it("returns parsed value within range", () => {
    expect(parseNumber("50", 10, 0, 100)).toBe(50);
  });

  it("handles float strings", () => {
    expect(parseNumber("1.5", 0, 0, 3)).toBe(1.5);
  });
});

describe("parseInteger", () => {
  it("returns fallback for null input", () => {
    expect(parseInteger(null, 20, 1, 40)).toBe(20);
  });

  it("rounds decimal inputs", () => {
    expect(parseInteger("5.7", 1, 1, 40)).toBe(6);
  });

  it("clamps to min", () => {
    expect(parseInteger("0", 20, 1, 40)).toBe(1);
  });

  it("clamps to max", () => {
    expect(parseInteger("100", 20, 1, 40)).toBe(40);
  });

  it("returns fallback for NaN string", () => {
    expect(parseInteger("xyz", 15, 1, 40)).toBe(15);
  });
});

describe("parseCalculatorState", () => {
  it("returns DEFAULT_STATE when no params provided", () => {
    const params = new URLSearchParams();
    const state = parseCalculatorState(params);
    expect(state).toEqual(DEFAULT_STATE);
  });

  it("parses valid query params", () => {
    const params = new URLSearchParams("portfolio=500000&years=15&growth=9&fee=1.5&mfe=0.5");
    const state = parseCalculatorState(params);
    expect(state.portfolioValue).toBe(500_000);
    expect(state.years).toBe(15);
    expect(state.annualGrowthPercent).toBe(9);
    expect(state.annualFeePercent).toBe(1.5);
    expect(state.mutualFundExpensePercent).toBe(0.5);
  });

  it("clamps portfolio to min (300000)", () => {
    const params = new URLSearchParams("portfolio=100");
    const state = parseCalculatorState(params);
    expect(state.portfolioValue).toBe(300_000);
  });

  it("clamps portfolio to max (10000000)", () => {
    const params = new URLSearchParams("portfolio=99999999");
    const state = parseCalculatorState(params);
    expect(state.portfolioValue).toBe(10_000_000);
  });

  it("clamps years to min (1)", () => {
    const params = new URLSearchParams("years=0");
    const state = parseCalculatorState(params);
    expect(state.years).toBe(1);
  });

  it("clamps years to max (40)", () => {
    const params = new URLSearchParams("years=100");
    const state = parseCalculatorState(params);
    expect(state.years).toBe(40);
  });

  it("clamps fee to max (3)", () => {
    const params = new URLSearchParams("fee=10");
    const state = parseCalculatorState(params);
    expect(state.annualFeePercent).toBe(3);
  });

  it("clamps growth to max (20)", () => {
    const params = new URLSearchParams("growth=25");
    const state = parseCalculatorState(params);
    expect(state.annualGrowthPercent).toBe(20);
  });
});

describe("buildQueryFromState", () => {
  it("serializes DEFAULT_STATE to query string", () => {
    const qs = buildQueryFromState(DEFAULT_STATE);
    const params = new URLSearchParams(qs);
    expect(params.get("portfolio")).toBe(String(DEFAULT_STATE.portfolioValue));
    expect(params.get("years")).toBe(String(DEFAULT_STATE.years));
    expect(params.get("growth")).toBe(String(DEFAULT_STATE.annualGrowthPercent));
    expect(params.get("fee")).toBe(String(DEFAULT_STATE.annualFeePercent));
    expect(params.get("mfe")).toBe(String(DEFAULT_STATE.mutualFundExpensePercent));
  });

  it("preserves existing params when merging", () => {
    const existing = new URLSearchParams("extra=val");
    const qs = buildQueryFromState(DEFAULT_STATE, existing);
    const params = new URLSearchParams(qs);
    expect(params.get("extra")).toBe("val");
    expect(params.get("portfolio")).toBe(String(DEFAULT_STATE.portfolioValue));
  });

  it("is round-trippable: build then parse returns same state", () => {
    const custom = { ...DEFAULT_STATE, portfolioValue: 750_000, years: 30 };
    const qs = buildQueryFromState(custom);
    const parsed = parseCalculatorState(new URLSearchParams(qs));
    expect(parsed).toEqual(custom);
  });
});

describe("paramsToRecord", () => {
  it("converts URLSearchParams to a plain record", () => {
    const params = new URLSearchParams("a=1&b=hello");
    expect(paramsToRecord(params)).toEqual({ a: "1", b: "hello" });
  });

  it("returns empty object for empty params", () => {
    expect(paramsToRecord(new URLSearchParams())).toEqual({});
  });
});
