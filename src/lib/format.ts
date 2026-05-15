export function fmtMoney(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n || 0);
}

export function fmtPct(x: number) {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    maximumFractionDigits: 2,
  }).format(x || 0);
}

// Backward-compatible aliases for existing imports elsewhere in repo.
export const formatCurrency = fmtMoney;

/**
 * Display helper: floor the value down to the nearest $1,000 before
 * formatting. Used for projection numbers on the marketing calculator
 * so we never round UP an "ending value" in a way that overstates the
 * result. The precise value still flows through buildFeeProjection and
 * the share URL — only the user-facing dollar strings are floored.
 */
export function formatCurrencyFloored(value: number): string {
  const floored = Math.floor((value || 0) / 1000) * 1000;
  return fmtMoney(floored);
}

// NOTE: Existing callers pass whole numbers (e.g. 8 for 8%), not decimals.
// fmtPct() above expects decimals (0.08) — don't confuse the two.
export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}
