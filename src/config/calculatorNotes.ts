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
      "The dollar figures in this calculator are hypothetical illustrations produced from the assumptions entered on this page — portfolio value, time horizon, asset-based fee, annual growth rate, and the flat fee itself. Both scenarios are compounded monthly from the same gross return. Figures are nominal: they are not adjusted for inflation, are shown before taxes, and assume no contributions or withdrawals at any point in the period. They do not represent actual performance, are not a forecast or a guarantee of savings, and are not investment advice or an advisory relationship. Actual results will vary.",
  },
  {
    id: 2,
    title: "The asset-based fee",
    body:
      "The asset-based fee is modeled as a single average rate, applied evenly across the whole period and deducted monthly. A real advisory fee may start above that average and decline as the portfolio grows, or step down at breakpoints, so this comparison is illustrative only and should not be relied on for a precise cost analysis. The rate used is the one entered on this page; it is not a quote and may differ from what any particular advisor charges. If fund expenses are added to the comparison, they are combined with that rate and charged only to the asset-based scenario — a flat-fee client would pay fund expenses too, so in that case the gap shown is wider than the difference in advisory fees alone.",
  },
  {
    id: 3,
    title: "The flat monthly fee",
    body:
      "Smarter Way Wealth's standard advisory fee is $100 per month. The projection deducts the flat fee entered on this page, monthly, and does not increase it as the portfolio grows; changing that input changes the comparison. The fee does not cover fund expenses, custodian charges, or trading costs charged by third parties. The standard account minimum is $250,000 in investable assets — liquid financial accounts, excluding real estate, business interests, and illiquid holdings — which the firm may waive or reduce at its sole discretion, as disclosed in its Form ADV Part 2A.",
  },
  {
    id: 4,
    title: "The growth rate",
    body:
      "The annual growth rate is an assumption you choose from a limited range, not a forecast or a recommendation, and it starts at a rate the firm selected. The same rate is applied to both scenarios. Markets do not deliver a constant return — a real path would vary year to year and could be negative. All investing involves risk, including possible loss of principal.",
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
