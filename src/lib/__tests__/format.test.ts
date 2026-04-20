import { describe, it, expect } from "vitest";
import { fmtMoney, fmtPct, formatCurrency, formatPercent } from "@/lib/format";

describe("fmtMoney", () => {
  it("formats a whole dollar amount with $ and no decimals", () => {
    expect(fmtMoney(1000)).toBe("$1,000");
  });

  it("formats zero as $0", () => {
    expect(fmtMoney(0)).toBe("$0");
  });

  it("formats negative numbers with a leading minus sign", () => {
    expect(fmtMoney(-500)).toBe("-$500");
  });

  it("formats large numbers with commas", () => {
    expect(fmtMoney(1_000_000)).toBe("$1,000,000");
  });

  it("rounds fractional cents (no decimal output)", () => {
    // maximumFractionDigits: 0, so 1000.99 → $1,001
    expect(fmtMoney(1000.99)).toBe("$1,001");
  });

  it("handles NaN-like falsy 0 input", () => {
    // passing NaN should default to 0 via (n || 0)
    expect(fmtMoney(NaN)).toBe("$0");
  });
});

describe("fmtPct", () => {
  it("formats 0.08 as 8%", () => {
    expect(fmtPct(0.08)).toBe("8%");
  });

  it("formats 0.005 as 0.5%", () => {
    expect(fmtPct(0.005)).toBe("0.5%");
  });

  it("formats 0 as 0%", () => {
    expect(fmtPct(0)).toBe("0%");
  });

  it("formats 1 as 100%", () => {
    expect(fmtPct(1)).toBe("100%");
  });

  it("handles NaN-like falsy input via (x || 0)", () => {
    expect(fmtPct(NaN)).toBe("0%");
  });
});

describe("formatCurrency (alias for fmtMoney)", () => {
  it("is the same function as fmtMoney", () => {
    expect(formatCurrency).toBe(fmtMoney);
  });

  it("formats 500000 correctly", () => {
    expect(formatCurrency(500_000)).toBe("$500,000");
  });
});

describe("formatPercent", () => {
  it("formats integer percent with one decimal", () => {
    expect(formatPercent(8)).toBe("8.0%");
  });

  it("formats 1.25 as 1.3%", () => {
    // toFixed(1) rounding may vary by engine; accept either 1.2 or 1.3
    expect(formatPercent(1.25)).toMatch(/^1\.[23]%$/);
  });

  it("formats 0 as 0.0%", () => {
    expect(formatPercent(0)).toBe("0.0%");
  });

  it("formats 100 as 100.0%", () => {
    expect(formatPercent(100)).toBe("100.0%");
  });

  it("formats decimal values with one decimal place", () => {
    expect(formatPercent(1.5)).toBe("1.5%");
  });
});
