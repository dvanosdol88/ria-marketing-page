/**
 * Site-wide navigation links.
 * Single source of truth - every page's <SiteNav> reads from here.
 */
export interface SiteNavLink {
  label: string;
  href: string;
  sectionId?: string;
  activePaths?: string[];
  /**
   * Visual weight. "primary" = three pillars (Save / Upgrade / Improve);
   * "secondary" = ancillary nav (How? / FAQ). Secondary items render muted
   * with extra left margin so the pillars read as the core message.
   */
  tier?: "primary" | "secondary";
}

export const siteNavLinks: SiteNavLink[] = [
  { label: "Save", href: "/", sectionId: "calculator", tier: "primary" },
  {
    label: "Upgrade",
    href: "/#upgrade-your-advice",
    sectionId: "upgrade-your-advice",
    activePaths: ["/upgrade-your-advice"],
    tier: "primary",
  },
  {
    label: "Improve",
    href: "/#improve-your-tools",
    sectionId: "improve-your-tools",
    activePaths: ["/improve-your-tools"],
    tier: "primary",
  },
  { label: "How?", href: "/how-it-works", tier: "secondary" },
  { label: "FAQ", href: "/faq", tier: "secondary" },
];
