/**
 * The home page's single disclaimer.
 *
 * This started as four numbered notes, one per claim. David cut it to one block
 * of three short statements (2026-08-11): "That copy is WAY too wordy." The
 * superscript marker beside each figure survives — it still gives a reader one
 * tap to the disclaimer instead of a hunt — but there is now one destination
 * rather than four.
 *
 * Kept deliberately short at David's direction. Longer statements were cut, not
 * overlooked — do not re-add them without asking him. The account minimum in
 * particular is settled: it stays off this page.
 *
 * Risk-of-loss and registration language still render directly below this
 * block in ComplianceFooter, so they are not lost.
 */

export const CALCULATOR_NOTES_ANCHOR = "calculator-notes";

export type DisclaimerLine = {
  /** Bolded lead-in. */
  lead: string;
  body: string;
};

export const CALCULATOR_DISCLAIMER: readonly DisclaimerLine[] = [
  {
    lead: "Calculator for illustrative purposes only.",
    body:
      "Figures are hypothetical, based on the assumptions entered here, and are not a forecast, a guarantee, or investment advice. Actual results will vary.",
  },
  {
    lead: "Asset-based fee.",
    body:
      "The percentage charged may decrease as portfolio size increases.",
  },
  {
    lead: "Flat fee.",
    body:
      "There is no guarantee that the fee will remain flat or $100 per month.",
  },
] as const;

export const disclaimerHref = `#${CALCULATOR_NOTES_ANCHOR}`;
