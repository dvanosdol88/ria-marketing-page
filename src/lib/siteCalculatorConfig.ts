/**
 * Per-site parameters for the calculator share/details/poll stack
 * (ShareMyResults, SocialShareRow, Quiz, and shareSummary).
 *
 * The stack itself — every component's markup, copy, and disclosures — is
 * canon: identical on this site (youarepayingtoomuch.com) and the sister
 * firm site (smarterwaywealth.com, D:\smarter-way-wealth). The values below
 * are the ONLY sanctioned differences between the two installs. See
 * docs/plans/2026-08-12-calculator-canon.md (in the sister repo), Phase B1.
 *
 * Type shape is itself part of the canon contract — keep it identical to
 * the sister repo's copy of this file even though the VALUES differ.
 */

const CALCULATOR_PATH = "/";

export interface SiteCalculatorConfig {
  /** Bare site domain (no protocol, no path). Not directly rendered by the
   * share/details/poll stack today — captured here as the root value the
   * sister site overrides, alongside displayDomain below. */
  domain: string;

  /** Domain (+ path, when the calculator isn't at the site root) printed on
   * the share-card footer (ShareMyResults.tsx's drawShareCard canvas). This
   * site's calculator IS the homepage, so there is no separate path to
   * append. */
  displayDomain: string;

  /** Canonical path to the calculator. This site's calculator is the root
   * route itself, not a dedicated subpath. */
  calculatorPath: string;

  /** Builds the absolute, personalized calculator URL (origin + path +
   * query) — the link shared via "Copy link", native share, socials, and
   * embedded in the narrative share text. The `#calculator` anchor scrolls
   * a visitor who lands on the homepage straight to the section that
   * produced their numbers, since the root route also carries the hero,
   * WWWH, and other marketing sections above it. Callers guard the
   * empty-origin / empty-query case themselves. */
  buildCanonicalUrl: (origin: string, query: string) => string;

  /** Builds the share-card image path (used as the ShareMyResults <img>
   * fallback src when the client-side canvas preview isn't available).
   * This site already has a dynamic OG-card route (`/api/og`) that reads
   * this exact query-param shape (flat/portfolio/years/growth/fee/mfe, the
   * same keys `buildQueryFromState` produces) for its homepage
   * `generateMetadata` — reused here rather than standing up a second,
   * parallel share-card route. */
  buildShareCardPath: (query: string) => string;

  /** Firm/site display name inserted into shareSummary.ts's negative-savings
   * shortLine and native-share titles. */
  firmDisplayName: string;

  /** Attribution line drawn on the share-card canvas footer
   * (ShareMyResults.tsx). Mirrors the firm-identity language this site's
   * own ComplianceFooter already shows publicly. */
  brandAttributionLine: string;

  /** Path to the calculator methodology page, linked from the
   * results/details surfaces. */
  verifyMathPath: string;

  /** Link text for the verify-math link above. */
  verifyMathLabel: string;

  /** `data-posthog-cta-location` / analytics tags used across the stack. */
  analytics: {
    /** The "Share my results" toggle button rendered alongside the results
     * (HomeCalculatorExperience.tsx's SeeOurMathBento). */
    detailedCalculatorResultsLocation: string;
    /** The page-level SocialShareRow rendered under the results
     * (HomeCalculatorExperience.tsx's SeeOurMathBento). */
    detailedCalculatorResultsSocialLocation: string;
    /** Every CTA inside the expanded ShareMyResults panel — native share,
     * copy link, copy summary, email, download image — and its own
     * SocialShareRow (ShareMyResults.tsx). */
    shareMyResultsPanelLocation: string;
    /** PostHog event name captured on each poll vote (Quiz.tsx). */
    pollVotedEvent: string;
    /** Poll identifier included in the poll_voted event payload (Quiz.tsx).
     * Matches the sister repo's value so a future combined analysis can
     * group votes from both sites under one poll id. */
    pollId: string;
  };

  /** How the calculation-details surface presents on this site: as a
   * modal, opened from a button beside the results (this site's own
   * "View calculation details" / SeeOurMathBento dialog). The sister
   * site's RIA-page variant renders it inline instead. Read by convention
   * only — no shared component branches on this value today, since this
   * site's details modal predates the canon program and isn't itself a
   * canon-locked file (see CALCULATOR-CANON.md's "Mirrored files" note). */
  detailsPresentation: "inline" | "modal";
}

export const siteCalculatorConfig: SiteCalculatorConfig = {
  domain: "youarepayingtoomuch.com",
  displayDomain: "youarepayingtoomuch.com",
  calculatorPath: CALCULATOR_PATH,
  buildCanonicalUrl: (origin, query) => `${origin}/?${query}#calculator`,
  buildShareCardPath: (query) => `/api/og?${query}`,
  firmDisplayName: "Smarter Way Wealth",
  brandAttributionLine: "Smarter Way Wealth, LLC · Connecticut-registered RIA · CRD #342140",
  verifyMathPath: "/our-math",
  verifyMathLabel: "How this math is verified",
  analytics: {
    detailedCalculatorResultsLocation: "home_share_results",
    detailedCalculatorResultsSocialLocation: "home_share_results_social",
    shareMyResultsPanelLocation: "home_share_my_results_panel",
    pollVotedEvent: "poll_voted",
    pollId: "savings-use",
  },
  detailsPresentation: "modal",
};
