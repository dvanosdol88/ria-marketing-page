"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import {
  capturePostHogEvent,
  getPostHogCampaignProperties,
} from "@/lib/posthog";
import {
  MAILER_SCAN_BROWSER_KEY,
  MAILER_SCAN_EVENT,
  MAILER_SCAN_RECEIPT_SESSION_KEY,
  MAILER_SCAN_SESSION_KEY,
  VISITOR_DAY_KEY,
  VISITOR_SEEN_KEY,
  isMailerQrCampaign,
} from "@/lib/mailerScan";
import { easternDayKey } from "@/lib/mailerScanPolicy";
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

// 05-54: scripted browsers (Playwright, Puppeteer, Selenium) announce themselves.
function isAutomatedBrowser() {
  try {
    return window.navigator.webdriver === true;
  } catch {
    return false;
  }
}

function readLocal(key: string) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeLocal(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Session and in-memory flags still prevent repeats for this visit.
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
    isAutomatedBrowser() ||
    readLocal(MAILER_SCAN_BROWSER_KEY) === "1" ||
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
      writeLocal(MAILER_SCAN_BROWSER_KEY, "1");
    } catch {
      // Leave the receipt unmarked so a later navigation/reload may try again.
    }
  })().finally(() => {
    receiptInFlight = null;
  });
}

function reportTrafficVisit() {
  const today = easternDayKey();
  if (
    isAutomatedBrowser() ||
    readLocal(VISITOR_DAY_KEY) === today ||
    visitRecordedInMemory ||
    hasSessionFlag(TRAFFIC_VISIT_SESSION_KEY, visitRecordedInMemory) ||
    visitInFlight
  )
    return;

  const firstEver = readLocal(VISITOR_SEEN_KEY) !== "1";
  visitInFlight = fetch("/api/analytics/mailer-scans", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind: "visit", firstEver }),
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
      writeLocal(VISITOR_DAY_KEY, today);
      writeLocal(VISITOR_SEEN_KEY, "1");
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
