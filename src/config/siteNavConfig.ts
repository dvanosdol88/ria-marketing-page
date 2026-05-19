/**
 * Site-wide navigation links.
 * Single source of truth - every page's <SiteNav> reads from here.
 */
export interface SiteNavLink {
  label: string;
  href: string;
  sectionId?: string;
  activePaths?: string[];
}

export const siteNavLinks: SiteNavLink[] = [
  { label: "Save", href: "/", sectionId: "calculator" },
  {
    label: "Upgrade",
    href: "/#upgrade-your-advice",
    sectionId: "upgrade-your-advice",
    activePaths: ["/upgrade-your-advice"],
  },
  {
    label: "Improve",
    href: "/#improve-your-tools",
    sectionId: "improve-your-tools",
    activePaths: ["/improve-your-tools"],
  },
  { label: "How?", href: "/how-it-works" },
  { label: "FAQ", href: "/faq" },
];
