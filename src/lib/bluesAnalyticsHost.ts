/** Build `$pageview` `$current_url` from the address bar, not a rewritten Next path. */
export function buildPageviewCurrentUrl(location: {
  origin: string;
  pathname: string;
  search: string;
}): string {
  return `${location.origin}${location.pathname}${location.search}`;
}
