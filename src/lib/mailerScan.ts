import type { PostHogProperties } from "@/lib/posthog";
import {
  isApprovedMailerCampaign,
  isLikelyBotUserAgent,
} from "@/lib/mailerScanPolicy";

export const MAILER_SCAN_EVENT = "eddm_qr_landed";
// 05-54: fresh document from the Oct 8-9, 2026 mail drop. Scans are exact
// mailer-QR landings only; visits are unique visitors. The earlier document
// (public_metrics/eddm_launch_2026) mixed in homepage guesses and stays as history.
export const MAILER_SCAN_COUNTER_DOC = "public_metrics/eddm_launch_2026_exact";
// One scan and one visitor per browser: localStorage keys (05-54).
export const MAILER_SCAN_BROWSER_KEY = "yapt_mailer_scan_counted";
export const VISITOR_SEEN_KEY = "yapt_visitor_seen";
export const VISITOR_DAY_KEY = "yapt_visitor_day";
export const MAILER_SCAN_SESSION_KEY = "sww_eddm_qr_landed_reported";
export const MAILER_SCAN_RECEIPT_SESSION_KEY =
  "sww_eddm_qr_landed_receipt_recorded";

export function isMailerQrCampaign(
  properties: PostHogProperties,
): boolean {
  return isApprovedMailerCampaign(properties);
}

export { isLikelyBotUserAgent };
