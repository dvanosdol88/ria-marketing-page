"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import {
  capturePostHogEvent,
  getPostHogCampaignProperties,
} from "@/lib/posthog";
import {
  MAILER_SCAN_EVENT,
  MAILER_SCAN_RECEIPT_SESSION_KEY,
  MAILER_SCAN_SESSION_KEY,
  isMailerQrCampaign,
} from "@/lib/mailerScan";
import {
  SELF_TEST_QUERY_PARAM,
  shouldExcludePublicTraffic,
} from "@/lib/selfTestTraffic";

let eventReportedInMemory = false;
let receiptRecordedInMemory = false;
let receiptInFlight: Promise<void> | null = null;
let visitRecordedInMemory = false;
let visitInFlight: Promise<void> | null = null;
const TRAFFIC_VISIT_SESSION_KEY = "sww_traffic_visit_recorded";

function hasSessionFlag(key: string, memoryFallback: boolean) {
  try {
    return window.sessionStorage.getItem(key) === "true";
  } catch {
    return memoryFallback;
  }
}

function setSessionFlag(key: string) {
  try {
    window.sessionStorage.setItem(key, "true");
  } catch {
    // The in-memory fallback still prevents duplicates for this page lifetime.
  }
}

function reportScanReceipt(attributionMethod: string) {
  if (
    receiptRecordedInMemory ||
    hasSessionFlag(MAILER_SCAN_RECEIPT_SESSION_KEY, receiptRecordedInMemory) ||
    receiptInFlight
  ) {
    return;
  }

  receiptInFlight = (async () => {
    try {
      const response = await fetch("/api/analytics/mailer-scans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attributionMethod }),
        keepalive: true,
      });
      if (!response.ok) return;
      const payload = (await response.json().catch(() => ({}))) as {
        counted?: boolean;
      };
      if (payload.counted === false) return;
      receiptRecordedInMemory = true;
      setSessionFlag(MAILER_SCAN_RECEIPT_SESSION_KEY);
    } catch {
      // Leave the receipt unmarked so a later navigation/reload may try again.
    }
  })().finally(() => {
    receiptInFlight = null;
  });
}

function reportTrafficVisit() {
  if (
    visitRecordedInMemory ||
    hasSessionFlag(TRAFFIC_VISIT_SESSION_KEY, visitRecordedInMemory) ||
    visitInFlight
  )
    return;

  visitInFlight = fetch("/api/analytics/mailer-scans", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind: "visit" }),
    keepalive: true,
  })
    .then(async (response) => {
      if (!response.ok) return;
      const payload = (await response.json().catch(() => ({}))) as {
        counted?: boolean;
      };
      if (payload.counted === false) return;
      visitRecordedInMemory = true;
      setSessionFlag(TRAFFIC_VISIT_SESSION_KEY);
    })
    .catch(() => {
      // Leave unmarked so a later navigation may try again.
    })
    .finally(() => {
      visitInFlight = null;
    });
}

function stripSelfTestQueryFromLocation() {
  const url = new URL(window.location.href);
  if (!url.searchParams.has(SELF_TEST_QUERY_PARAM)) return;
  url.searchParams.delete(SELF_TEST_QUERY_PARAM);
  const nextUrl = `${url.pathname}${url.search}${url.hash}`;
  window.history.replaceState(window.history.state, "", nextUrl);
}

function reportMailerScan(currentUrl: string) {
  const campaign = getPostHogCampaignProperties(currentUrl);
  if (!isMailerQrCampaign(campaign)) return;

  if (
    !eventReportedInMemory &&
    !hasSessionFlag(MAILER_SCAN_SESSION_KEY, eventReportedInMemory)
  ) {
    capturePostHogEvent(MAILER_SCAN_EVENT, {
      $current_url: currentUrl,
      scan_kind: "mailer_qr_landing",
    });
    eventReportedInMemory = true;
    setSessionFlag(MAILER_SCAN_SESSION_KEY);
  }

  const attributionMethod =
    typeof campaign.campaign_attribution_method === "string"
      ? campaign.campaign_attribution_method
      : "explicit_utm";

  reportScanReceipt(attributionMethod);
}

export function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname) {
      const search = searchParams.toString();
      const excludePublicTraffic = shouldExcludePublicTraffic(search);
      if (searchParams.has(SELF_TEST_QUERY_PARAM)) {
        stripSelfTestQueryFromLocation();
      }
      let url = window.location.origin + pathname;
      if (search) {
        url += `?${search}`;
      }
      capturePostHogEvent("$pageview", {
        $current_url: url,
        ...(excludePublicTraffic ? { self_test: true } : {}),
      });
      if (excludePublicTraffic) return;
      reportTrafficVisit();
      reportMailerScan(url);
    }
  }, [pathname, searchParams]);

  return null;
}
