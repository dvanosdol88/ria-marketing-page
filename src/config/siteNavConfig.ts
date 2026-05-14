/**
 * Site-wide navigation links.
 * Single source of truth - every page's <SiteNav> reads from here.
 */
export interface SiteNavLink {
  label: string;
  href: string;
}

export const siteNavLinks: SiteNavLink[] = [
  { label: "Save", href: "/" },
  { label: "Upgrade", href: "/upgrade-your-advice" },
  { label: "Improve", href: "/improve-your-tools" },
  { label: "How?", href: "/how-it-works" },
  { label: "FAQ", href: "/faq" },
];
