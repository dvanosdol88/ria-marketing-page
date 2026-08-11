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

export const siteNavLinks: SiteNavLink[] = [
  // Retired root anchors are omitted because the lean homepage no longer
  // renders those sections; their standalone reusable experiences remain.
  { label: "Save", href: "/", sectionId: "calculator", tier: "primary" },
  {
    label: "Fee Calculator",
    href: "/#calculator",
    tier: "primary",
    track: true,
    ctaLocation: "site_nav",
  },
  { label: "Rates", href: "/savings-rates", tier: "secondary" },
  { label: "How?", href: "/how-it-works", tier: "secondary" },
  { label: "FAQ", href: "/faq", tier: "secondary" },
];
