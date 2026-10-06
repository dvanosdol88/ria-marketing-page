const BLUES_ANALYTICS_HOSTS = new Set(["onepercentblues.com", "www.onepercentblues.com"]);

/** Address-bar host for the One Percent Blues front door, including www. */
export function isBluesAnalyticsHost(hostname: string): boolean {
  return BLUES_ANALYTICS_HOSTS.has(hostname.trim().toLowerCase().replace(/\.$/, ""));
}

/** Build `$pageview` `$current_url` from the address bar, not a rewritten Next path. */
export function buildPageviewCurrentUrl(location: {
  origin: string;
  pathname: string;
  search: string;
}): string {
  return `${location.origin}${location.pathname}${location.search}`;
}
