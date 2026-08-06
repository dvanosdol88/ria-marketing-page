/**
 * Path prefixes that opt out of standard site chrome (the footer and the
 * site-wide CTA divider). These are internal review/curation surfaces, not
 * public marketing pages.
 *
 * Single source of truth - SiteFooter and SiteCtaDivider both read this list
 * so their exclusions can't drift apart again.
 */
export const SUPPRESSED_ROUTE_PREFIXES = [
  "/evals",
  "/calculator-evals",
  "/url-evals",
  "/gallery",
] as const;

export function isSuppressedRoute(pathname: string): boolean {
  return SUPPRESSED_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}
