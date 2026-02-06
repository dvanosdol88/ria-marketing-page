/**
 * Site-wide navigation links.
 * Single source of truth - every page's <SiteNav> reads from here.
 */
export interface SiteNavLink {
  label: string;
  href: string;
}

export const siteNavLinks: SiteNavLink[] = [
  { label: "Upgrade", href: "/upgrade" },
  { label: "Save", href: "/save" },
  { label: "Improve", href: "/improve" },
  { label: "Home", href: "/" },
  { label: "About", href: "/meaning" },
];
