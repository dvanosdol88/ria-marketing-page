"use client";

import { useEffect } from "react";
import {
  capturePostHogEvent,
  getPostHogCampaignProperties,
  registerPostHogProperties,
  registerPostHogPropertiesOnce,
} from "@/lib/posthog";
import { POSTHOG_UTM_KEYS } from "@/lib/campaignAttribution";

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
    const campaignProperties = getPostHogCampaignProperties();

    registerPostHogProperties({
      site_domain: window.location.hostname,
      site_origin: window.location.origin,
      ...campaignProperties,
    });
    registerPostHogPropertiesOnce({
      first_landing_url: window.location.href,
      first_landing_domain: window.location.hostname,
      ...Object.fromEntries(
        POSTHOG_UTM_KEYS.flatMap((key) => {
          const value = campaignProperties[key];
          return typeof value === "string" ? [[`first_${key}`, value]] : [];
        }),
      ),
    });
  }, []);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const anchor = getAnchorFromEvent(event);
      if (!anchor || !isTrackedCta(anchor)) return;

      const url = new URL(anchor.href, window.location.href);
      // Canon privacy invariant (docs/plans/2026-08-12-calculator-canon.md
      // in the sister repo, Phase B1): the share-stack's social anchors
      // (SocialShareRow) embed the visitor's personalized calculator URL —
      // portfolio value, years, fee assumptions — inside their own
      // Facebook/X/Reddit share-intent query string. data-posthog-redact-query
      // marks any anchor whose href must never reach analytics intact;
      // origin+pathname still identifies which platform/page was clicked.
      const isRedacted = anchor.dataset.posthogRedactQuery === "true";
      capturePostHogEvent("cta_clicked", {
        cta_label: anchor.dataset.posthogCtaLabel ?? anchor.textContent?.trim().replace(/\s+/g, " ").slice(0, 120) ?? "",
        cta_href: isRedacted ? `${url.origin}${url.pathname}` : anchor.href,
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
