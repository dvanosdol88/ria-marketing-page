/**
 * Fee-site settings for the full calculator page (/calculator), which
 * carries smarterwaywealth.com's full calculator (fee-lab stage 1, section 1;
 * docs/plans/2026-11-25-fee-lab-stage1-full-calculator.md). Public since
 * section 2 (docs/plans/2026-11-26-fee-lab-stage1-section2-go-live.md).
 *
 * The firm calculator's conversion and methodology links point at the firm
 * site's real pages as absolute URLs, because this site has no /meet,
 * /onboarding or /verify-math page.
 *
 * Share links and the share card for this page are set here, not in
 * src/lib/siteCalculatorConfig.ts: that config builds the home page's links
 * (`/?...&shared=1#calculator`, card `/api/og`), whose basic query shape
 * cannot carry a market-history window or a tiered fee schedule. A link
 * shared from this page reopens this page with the whole detailed scenario,
 * and its card (/calculator/share-card) draws that scenario's own figures.
 * The share panel's wording, card footer domain and attribution line still
 * come from siteCalculatorConfig, unchanged.
 */
export const FIRM_SITE_ORIGIN = "https://smarterwaywealth.com";

/** This page's own address on the fee site. */
export const FULL_CALCULATOR_PATH = "/calculator";

/** The detailed-scenario share card (src/app/(site)/calculator/share-card). */
export const FULL_CALCULATOR_SHARE_CARD_PATH = `${FULL_CALCULATOR_PATH}/share-card`;

export const fullCalculatorSite = {
  /** The firm calculator's "How this math is verified" destination. */
  verifyMathHref: `${FIRM_SITE_ORIGIN}/verify-math`,
  /** cta_location for the results-band call button, distinct from every
   *  location the fee-site home page sends. */
  resultsCtaLocation: "full_calculator_results",
  calculatorPath: FULL_CALCULATOR_PATH,
  /** The absolute link shared from this page ("Copy link", native share,
   *  socials, the share text): this page plus the detailed scenario query
   *  (`buildDetailedCalculatorQuery`), the same shape the firm site shares. */
  buildShareUrl: (origin: string, query: string) => `${origin}${FULL_CALCULATOR_PATH}?${query}`,
  /** The share-card image for a detailed scenario. */
  buildShareCardPath: (query: string) => `${FULL_CALCULATOR_SHARE_CARD_PATH}?${query}`,
} as const;
