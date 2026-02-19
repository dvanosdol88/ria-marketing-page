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

// NOTE: Existing callers pass whole numbers (e.g. 8 for 8%), not decimals.
// fmtPct() above expects decimals (0.08) — don't confuse the two.
export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}
