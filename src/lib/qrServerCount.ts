import type { Firestore } from "firebase-admin/firestore";
import { easternDayKey, requestIsFromPhone, requestLooksAutomated } from "./mailerScanPolicy.ts";
import { MEASUREMENT_HOSTS, resolveQrSearch } from "./qrLanding.ts";
import { hasSelfTestCookie, readSelfTestQueryValue } from "./selfTestTraffic.ts";

// David, 2026-11-18: "I do not trust the QR code." The browser counter only hears from
// phones that finish loading the page and run its script. This second, independent
// counter records the printed link at the moment the server receives the request, so a
// slow phone, a script blocker or an early close can no longer hide a scan.
export const SERVER_COUNTER = "public_metrics/eddm_launch_2026_server";
export const QR_SEEN_COOKIE = "yapt_qr_seen";
export const QR_SEEN_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 400;
const RECENT_LIMIT = 25;

type HeaderReader = Pick<Headers, "get">;
export type ServerQrRequest = {
  phone: boolean; firstVisit: boolean; place: string | null;
};

function cookieHas(cookieHeader: string, name: string) {
  return cookieHeader.split(";").some((part) => part.split("=")[0]?.trim() === name);
}

function decodePart(value: string | null) {
  if (!value) return null;
  try { return decodeURIComponent(value).trim().slice(0, 60) || null; } catch { return null; }
}

// City and state only (from the host's location headers); never the internet address.
export function requestPlace(headers: HeaderReader) {
  const city = decodePart(headers.get("x-vercel-ip-city"));
  const region = decodePart(headers.get("x-vercel-ip-country-region"));
  const country = decodePart(headers.get("x-vercel-ip-country"));
  const parts = [city, region ?? country].filter(Boolean);
  return parts.length ? parts.join(", ") : null;
}

// Returns the request to record, or null when this is not a real printed-link page load.
export function classifyServerQrRequest(
  url: { hostname: string; pathname: string; search: string },
  headers: HeaderReader,
): ServerQrRequest | null {
  if (!MEASUREMENT_HOSTS.has(url.hostname.toLowerCase()) || url.pathname !== "/") return null;
  if (resolveQrSearch(url.search) === null) return null;
  // Link prefetches and robots are not people.
  if (headers.get("next-router-prefetch") || /prefetch/i.test(headers.get("purpose") ?? headers.get("sec-purpose") ?? "")) return null;
  if (headers.get("rsc")) return null;
  if (requestLooksAutomated(headers)) return null;
  const cookies = headers.get("cookie") ?? "";
  if (hasSelfTestCookie(cookies) || readSelfTestQueryValue(url.search) === "1") return null;
  if (new URLSearchParams(url.search).has("qrtest")) return null;
  return { phone: requestIsFromPhone(headers), firstVisit: !cookieHas(cookies, QR_SEEN_COOKIE), place: requestPlace(headers) };
}

const total = (value: unknown) => typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : 0;

export async function recordServerQrRequest(db: Firestore, request: ServerQrRequest, now = new Date()) {
  const ref = db.doc(SERVER_COUNTER);
  const day = easternDayKey(now);
  const stamp = now.toISOString();
  await db.runTransaction(async (transaction) => {
    const data = (await transaction.get(ref)).data() ?? {};
    const daily = { ...(data.daily?.[day] ?? {}) };
    daily.requests = total(daily.requests) + 1;
    if (request.phone) daily.phoneRequests = total(daily.phoneRequests) + 1;
    if (request.phone && request.firstVisit) daily.newPhones = total(daily.newPhones) + 1;
    const recent = Array.isArray(data.recent) ? data.recent : [];
    transaction.set(ref, {
      startedAt: typeof data.startedAt === "string" ? data.startedAt : stamp,
      lastRequestAt: stamp,
      requests: total(data.requests) + 1,
      phoneRequests: total(data.phoneRequests) + (request.phone ? 1 : 0),
      newPhones: total(data.newPhones) + (request.phone && request.firstVisit ? 1 : 0),
      daily: { [day]: daily },
      recent: [{ at: stamp, place: request.place, phone: request.phone, firstVisit: request.firstVisit }, ...recent].slice(0, RECENT_LIMIT),
    }, { merge: true });
  });
}

export function publicServerCount(data: Record<string, any> = {}) {
  const startedAt = typeof data.startedAt === "string" ? data.startedAt : null;
  return {
    meaning: "Printed-link page requests recorded by the server when they arrive, whether or not the page finishes loading. Robots, prefetches and test devices are left out.",
    startedAt,
    requests: total(data.requests),
    phoneRequests: total(data.phoneRequests),
    newPhones: total(data.newPhones),
    lastRequestAt: typeof data.lastRequestAt === "string" ? data.lastRequestAt : null,
    recent: (Array.isArray(data.recent) ? data.recent : []).slice(0, 10).map((entry: any) => ({
      at: typeof entry?.at === "string" ? entry.at : null,
      place: typeof entry?.place === "string" ? entry.place : null,
      phone: entry?.phone === true,
      firstVisit: entry?.firstVisit === true,
    })),
  };
}
