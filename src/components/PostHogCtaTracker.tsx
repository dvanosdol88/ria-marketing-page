"use client";

import { useEffect } from "react";
import { capturePostHogEvent, registerPostHogProperties, registerPostHogPropertiesOnce } from "@/lib/posthog";

const CTA_HOSTS = new Set([
  "smarterwaywealth.com",
  "www.smarterwaywealth.com",
  "calendly.com",
  "www.calendly.com",
]);

function getAnchorFromEvent(event: MouseEvent) {
  const target = event.target;
  if (!(target instanceof Element)) return null;
  return target.closest("a[href]") as HTMLAnchorElement | null;
}

function isTrackedCta(anchor: HTMLAnchorElement) {
  if (anchor.dataset.posthogCta === "true") return true;

  const href = anchor.getAttribute("href") ?? "";
  if (href.startsWith("mailto:")) return true;

  const url = new URL(anchor.href, window.location.href);
  return CTA_HOSTS.has(url.hostname.toLowerCase());
}

export function PostHogCtaTracker() {
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const campaignProperties = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].reduce<Record<string, string>>(
      (properties, key) => {
        const value = searchParams.get(key);
        if (value) properties[key] = value;
        return properties;
      },
      {}
    );

    registerPostHogProperties({
      site_domain: window.location.hostname,
      site_origin: window.location.origin,
      is_eddm_visitor: campaignProperties.utm_source === "eddm",
      ...campaignProperties,
    });
    registerPostHogPropertiesOnce({
      first_landing_url: window.location.href,
      first_landing_domain: window.location.hostname,
      ...Object.fromEntries(
        Object.entries(campaignProperties).map(([key, value]) => [`first_${key}`, value])
      ),
    });
  }, []);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const anchor = getAnchorFromEvent(event);
      if (!anchor || !isTrackedCta(anchor)) return;

      const url = new URL(anchor.href, window.location.href);
      capturePostHogEvent("cta_clicked", {
        cta_label: anchor.dataset.posthogCtaLabel ?? anchor.textContent?.trim().replace(/\s+/g, " ").slice(0, 120) ?? "",
        cta_href: anchor.href,
        cta_host: url.hostname,
        cta_path: url.pathname,
        cta_location: anchor.dataset.posthogCtaLocation ?? "global_link",
        opens_new_tab: anchor.target === "_blank",
      });
    };

    document.addEventListener("click", handleClick, { capture: true });
    return () => document.removeEventListener("click", handleClick, { capture: true });
  }, []);

  return null;
}
