/**
 * The home page's single disclaimer.
 *
 * This started as four numbered notes, one per claim. David cut it to a single
 * paragraph (2026-08-11): "That copy is WAY too wordy." The superscript marker
 * beside each figure survives — it still gives a reader one tap to the
 * disclaimer instead of a hunt — but there is now one destination rather than
 * four.
 *
 * Held as alternating segments rather than one string so the three bolded
 * lead-ins David specified stay exactly where he put them, and so the API and
 * the SSR test can derive the plain text from the same source the page renders.
 *
 * Kept deliberately short at David's direction. Longer statements were cut, not
 * overlooked — do not re-add them without asking him. The account minimum in
 * particular is settled: it stays off this page.
 *
 * Risk-of-loss and registration language still render directly below this
 * block in ComplianceFooter, so they are not lost.
 */

export const CALCULATOR_NOTES_ANCHOR = "calculator-notes";

export type DisclaimerSegment = { bold: string } | { text: string };

export const CALCULATOR_DISCLAIMER: readonly DisclaimerSegment[] = [
  { bold: "Calculator for illustrative purposes only" },
  {
    text:
      " and should not be relied on for a precise cost analysis. Figures are hypothetical, based on the assumptions entered here, and are not a forecast, a guarantee, or investment advice. Actual results will vary and your fees may change. ",
  },
  { bold: "Asset-based fee." },
  { text: " The percentage charged may decrease as portfolio size increases. " },
  { bold: "Flat fee." },
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
