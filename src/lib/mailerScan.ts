import type { PostHogProperties } from "@/lib/posthog";
import {
  isApprovedMailerCampaign,
  isLikelyBotUserAgent,
} from "@/lib/mailerScanPolicy";

export const MAILER_SCAN_EVENT = "eddm_qr_landed";
export const MAILER_SCAN_COUNTER_DOC = "public_metrics/eddm_launch_2026";
export const MAILER_SCAN_SESSION_KEY = "sww_eddm_qr_landed_reported";
export const MAILER_SCAN_RECEIPT_SESSION_KEY =
  "sww_eddm_qr_landed_receipt_recorded";

export function isMailerQrCampaign(
  properties: PostHogProperties,
): boolean {
  return isApprovedMailerCampaign(properties);
}

export { isLikelyBotUserAgent };
