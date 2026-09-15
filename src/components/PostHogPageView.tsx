'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
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

let eventReportedInMemory = false;
let receiptRecordedInMemory = false;
let receiptInFlight: Promise<void> | null = null;

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
      if (response.ok) {
        receiptRecordedInMemory = true;
        setSessionFlag(MAILER_SCAN_RECEIPT_SESSION_KEY);
      }
    } catch {
      // Leave the receipt unmarked so a later navigation/reload may try again.
    }
  })().finally(() => {
    receiptInFlight = null;
  });
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
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (pathname) {
      let url = window.location.origin + pathname
      if (searchParams.toString()) {
        url += `?${searchParams.toString()}`
      }
      capturePostHogEvent('$pageview', { $current_url: url })
      reportMailerScan(url)
    }
  }, [pathname, searchParams])

  return null
}
