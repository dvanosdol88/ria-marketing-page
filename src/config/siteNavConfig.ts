/**
 * Site-wide navigation links.
 * Single source of truth - every page's <SiteNav> reads from here.
 */
export interface SiteNavLink {
  label: string;
  href: string;
}

export const siteNavLinks: SiteNavLink[] = [
  { label: "Home", href: "/" },
  { label: "Upgrade Your Advice", href: "/upgrade-your-advice" },
  { label: "Improve Your Tools", href: "/improve-your-tools" },
  { label: "Save a Ton", href: "/save-a-ton" },
  { label: "How It Works", href: "/how-it-works" },
];
