import { isBluesHostname } from "./bluesHost";

/** Address-bar host for the One Percent Blues front door, including www. */
export function isBluesAnalyticsHost(hostname: string): boolean {
  return isBluesHostname(hostname.trim().replace(/\.$/, ""));
}

/** Build `$pageview` `$current_url` from the address bar, not a rewritten Next path. */
export function buildPageviewCurrentUrl(location: {
  origin: string;
  pathname: string;
  search: string;
}): string {
  return `${location.origin}${location.pathname}${location.search}`;
}
