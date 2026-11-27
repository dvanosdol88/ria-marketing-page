/** Own module so server pages can import it; the calculator UI is "use client". */

export type CalculatorMode = "advanced" | "basic";

export const CALCULATOR_MODE_PARAM = "calc";

export function resolveCalculatorMode(
  searchParams?: Record<string, string | string[] | undefined>,
): CalculatorMode {
  const raw = searchParams?.[CALCULATOR_MODE_PARAM];
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value === "basic" ? "basic" : "advanced";
}
