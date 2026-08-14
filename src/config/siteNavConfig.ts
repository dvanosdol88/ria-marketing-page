/**
 * Site-wide navigation links.
 * Single source of truth - every page's <SiteNav> reads from here.
 */
export interface SiteNavLink {
  label: string;
  href: string;
  sectionId?: string;
  activePaths?: string[];
  track?: boolean;
  ctaLocation?: string;
  /**
   * Visual weight. "primary" = main root actions; "secondary" = ancillary
   * navigation (How? / FAQ). Secondary items render muted with extra left
   * margin so the primary actions read as the core message.
   */
  tier?: "primary" | "secondary";
}

/**
 * SIMPLIFIED 2026-08-14 (David): "We are simplifying YA-PT in an effort to
 * more quickly drive the user to https://smarterwaywealth.com. To that end, we
 * will simplify the nav bar." Save, Rates and How? were removed along with the
 * pages behind them — "Save" pointed at this same homepage, Rates and How?
 * pointed at /savings-rates and /how-it-works, both now retired with
 * redirects. What is left is the one thing to do here, the one thing to read
 * here, and the door to the firm.
 *
 * FAQ no longer leaves the homepage: the FAQ is now two questions at the
 * bottom of this page (HomeFaqSection) plus a link out to the firm site's full
 * set, so the nav item scrolls rather than navigates.
 */
export const siteNavLinks: SiteNavLink[] = [
  {
    label: "Fee Calculator",
    href: "/#calculator",
    tier: "primary",
    track: true,
    ctaLocation: "site_nav",
  },
  { label: "FAQ", href: "/#faq", sectionId: "faq", tier: "secondary" },
];
