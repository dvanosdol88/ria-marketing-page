/**
 * Alternating bold/text segments so the API and SSR test can derive the same plain text the page renders.
 */

export const CALCULATOR_NOTES_ANCHOR = "calculator-notes";

export type DisclaimerSegment = { bold: string } | { text: string };

export const CALCULATOR_DISCLAIMER: readonly DisclaimerSegment[] = [
  { bold: "Calculator for illustrative purposes only" },
  {
    text:
      " and should not be relied on for a precise cost analysis. Figures are hypothetical, based on the assumptions entered here, and are not a forecast or a guarantee. Actual results will vary and your fees may change. ",
  },
  { bold: "Asset-based fee:" },
  { text: " The percentage charged may decrease as portfolio size increases. " },
  { bold: "Flat fee:" },
  { text: " There is no guarantee that the fee will remain flat or $100 per month." },
] as const;

/** The same disclaimer as plain text, for the JSON endpoint. */
export const CALCULATOR_DISCLAIMER_TEXT = CALCULATOR_DISCLAIMER.map((segment) =>
  "bold" in segment ? segment.bold : segment.text,
)
  .join("")
  .replace(/\s+/g, " ")
  .trim();

export const disclaimerHref = `#${CALCULATOR_NOTES_ANCHOR}`;
