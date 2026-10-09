import { landingEvidence, resolveLanding } from "./qrLanding.ts";
import { syncQrVerification } from "./qrVerification.ts";
import { shouldExcludePublicTraffic } from "./selfTestTraffic.ts";
import { isLikelyBotUserAgent } from "./mailerScanPolicy.ts";
import type { MeasurementInput, MeasurementReceipt } from "./qrMeasurement.ts";

export const ANONYMOUS_BROWSER_KEY = "yapt_measurement_browser";
export const ANONYMOUS_BROWSER_COOKIE = "yapt_measurement_browser";
export const LEGACY_QR_KEY = "yapt_mailer_scan_counted";
export const LEGACY_WEBSITE_KEY = "yapt_visitor_seen";
export const LEGACY_DAY_KEY = "yapt_visitor_day";
const read = (storage: Storage, key: string) => { try { return storage.getItem(key); } catch { return null; } };
const write = (storage: Storage, key: string, value: string) => { try { storage.setItem(key, value); } catch { /* Cookie/memory fallback. */ } };
let memoryBrowserId: string | null = null;
function browserId() {
  let local: string | null = null, session: string | null = null;
  try { local = read(window.localStorage, ANONYMOUS_BROWSER_KEY); } catch { /* Storage getter can throw. */ }
  const cookie = document.cookie.split(";").find((p) => p.trim().startsWith(`${ANONYMOUS_BROWSER_COOKIE}=`))?.trim().split("=")[1];
  try { session = read(window.sessionStorage, ANONYMOUS_BROWSER_KEY); } catch { /* Cookie/memory fallback. */ }
  const stored = [local, cookie, session, memoryBrowserId].find((value) => value && /^[a-zA-Z0-9-]{16,100}$/.test(value));
  const id = stored ?? window.crypto.randomUUID();
  memoryBrowserId = id;
  try { write(window.localStorage, ANONYMOUS_BROWSER_KEY, id); } catch { /* Cookie fallback. */ }
  try { write(window.sessionStorage, ANONYMOUS_BROWSER_KEY, id); } catch { /* Cookie fallback. */ }
  document.cookie = `${ANONYMOUS_BROWSER_COOKIE}=${id}; Path=/; Max-Age=31536000; SameSite=Lax`;
  return id;
}
// Capture before React child effects remove/rewrite calculator parameters.
const arrivingUrl = typeof window === "undefined" ? null : window.location.href;
const openingId = typeof window === "undefined" ? null : window.crypto.randomUUID();
let inFlight: Promise<MeasurementReceipt | null> | null = null;
let accepted: MeasurementReceipt | null = null;
let eventReported = false;
export function currentDocumentLandingUrl() { return arrivingUrl ?? window.location.href; }
export function browserIsAutomated() {
  return window.navigator.webdriver === true || isLikelyBotUserAgent(window.navigator.userAgent);
}
export async function reportDocumentMeasurement(): Promise<MeasurementReceipt | null> {
  if (accepted) return accepted;
  if (inFlight) return inFlight;
  const landing = landingEvidence(currentDocumentLandingUrl());
  const verification = syncQrVerification(landing.search);
  const owner = shouldExcludePublicTraffic(landing.search);
  if (browserIsAutomated() || (owner && !verification) || !resolveLanding(landing).website) return null;
  let legacyQrSeen = false, legacyWebsiteSeen = false, legacyWebsiteDay: string | null = null;
  try {
    legacyQrSeen = read(window.localStorage, LEGACY_QR_KEY) === "1";
    legacyWebsiteSeen = read(window.localStorage, LEGACY_WEBSITE_KEY) === "1";
    legacyWebsiteDay = read(window.localStorage, LEGACY_DAY_KEY);
  } catch { /* Server markers remain authoritative after the first receipt. */ }
  const body: MeasurementInput = { browserId: browserId(), openingId: openingId ?? window.crypto.randomUUID(), landing, verification, legacyQrSeen, legacyWebsiteSeen, legacyWebsiteDay };
  inFlight = (async () => {
    try {
      const response = await fetch("/api/analytics/mailer-scans", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), keepalive: true });
      if (!response.ok) return null;
      const receipt = await response.json() as MeasurementReceipt;
      if (!receipt.counted || receipt.qrOpeningId !== body.openingId) return null;
      accepted = receipt;
      if (!receipt.verification) {
        try {
          write(window.localStorage, LEGACY_WEBSITE_KEY, "1");
          if (receipt.qrAccepted) write(window.localStorage, LEGACY_QR_KEY, "1");
        } catch { /* Server dedup remains in effect. */ }
      }
      return receipt;
    } catch { return null; }
  })().finally(() => { inFlight = null; });
  return inFlight;
}
export function claimQrEvent(receipt: MeasurementReceipt) {
  if (eventReported || !receipt.counted || !receipt.qrAccepted) return false;
  eventReported = true;
  return true;
}
