export type TrackedCtaInput = { href: string; label: string; location: string; opensNewTab: boolean; redactQuery: boolean };

export function buildTrackedCtaProperties(input: TrackedCtaInput) {
  const url = new URL(input.href);
  const isMailto = url.protocol === "mailto:";
  return {
    cta_label: input.label,
    cta_href: isMailto ? "mailto:" : input.redactQuery ? `${url.origin}${url.pathname}` : input.href,
    cta_host: isMailto ? "" : url.hostname,
    cta_path: isMailto ? "" : url.pathname,
    cta_location: input.location,
    opens_new_tab: input.opensNewTab,
  };
}
