/**
 * Fee-site settings for the hidden full calculator page (/calculator), which
 * carries smarterwaywealth.com's full calculator (fee-lab stage 1, section 1;
 * docs/plans/2026-11-25-fee-lab-stage1-full-calculator.md).
 *
 * The firm calculator's conversion and methodology links point at the firm
 * site's real pages as absolute URLs, because this site has no /meet,
 * /onboarding or /verify-math page. Share links and the share card stay on
 * this site through src/lib/siteCalculatorConfig.ts.
 */
export const FIRM_SITE_ORIGIN = "https://smarterwaywealth.com";

export const fullCalculatorSite = {
  /** The firm calculator's "How this math is verified" destination. */
  verifyMathHref: `${FIRM_SITE_ORIGIN}/verify-math`,
  /** cta_location for the results-band call button, distinct from every
   *  location the fee-site home page sends. */
  resultsCtaLocation: "full_calculator_results",
} as const;
