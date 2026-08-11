/**
 * Numbered disclosure notes for the home page.
 *
 * Replaces the scattered asterisks, which all pointed at the same vague
 * "illustrative only" idea no matter which claim they were attached to. A
 * superscript number attaches a specific claim to a specific note, and every
 * note lives in one block at the bottom of the page (David, 2026-08-11).
 *
 * This file is the single source of truth: markers render from `NOTE`, the
 * footer block renders from `CALCULATOR_NOTES`, so a marker cannot point at a
 * note that does not exist and a note cannot be orphaned.
 *
 * The wording below is assembled from language already published on this site —
 * the calculator's own disclaimer block, its helper notes, and the sign-up
 * page's statement of the account minimum — plus statements that are true of
 * the projection as it is actually computed in src/lib/feeProjection.ts. It has
 * NOT been through a compliance review in its new form.
 */

export const CALCULATOR_NOTES_ANCHOR = "calculator-notes";

export type CalculatorNote = {
  /** 1-based; also the visible superscript and the anchor suffix. */
  id: number;
  /** Short heading so a reader landing from a marker knows they arrived. */
  title: string;
  body: string;
};

export const CALCULATOR_NOTES: readonly CalculatorNote[] = [
  {
    id: 1,
    title: "Projected figures",
    body:
      "Every dollar figure on this page is a hypothetical illustration produced from the assumptions you enter — portfolio value, time horizon, asset-based fee, and annual growth rate. Both scenarios are compounded monthly from the same gross return, so the only difference between them is the fee. Figures are nominal, before taxes, and do not represent actual performance. They are not a forecast, a guarantee of savings, investment advice, or an advisory relationship. Actual results will vary.",
  },
  {
    id: 2,
    title: "The asset-based fee",
    body:
      "The asset-based fee is modeled as a single average rate, applied evenly across the whole period and deducted monthly. A real advisory fee may start above that average and decline as the portfolio grows, or step down at breakpoints, so this comparison is illustrative only and should not be relied on for a precise cost analysis. Where fund expenses are included, they are added to the advisory rate and treated the same way.",
  },
  {
    id: 3,
    title: "The $100 monthly fee",
    body:
      "Smarter Way Wealth charges a flat $100 per month. In this projection it is deducted monthly and does not change as the portfolio grows. It does not include fund expenses, custodian charges, or trading costs charged by third parties. Advisory services carry a $250,000 investable-asset minimum, which the firm may waive at its discretion.",
  },
  {
    id: 4,
    title: "The growth rate",
    body:
      "The annual growth rate is an assumption you choose, not a forecast or a recommendation. The same rate is applied to both scenarios, so the gap shown reflects fee drag alone. Markets do not deliver a constant return — a real path would vary year to year and could be negative. All investing involves risk, including possible loss of principal.",
  },
] as const;

/** Marker lookup, so call sites read `NOTE.projection` rather than a bare number. */
export const NOTE = {
  projection: 1,
  assetBasedFee: 2,
  flatFee: 3,
  growthRate: 4,
} as const;

export const noteHref = (id: number) => `#${CALCULATOR_NOTES_ANCHOR}-${id}`;
