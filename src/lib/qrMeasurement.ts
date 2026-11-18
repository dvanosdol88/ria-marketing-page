import { createHash } from "node:crypto";
import type { Firestore } from "firebase-admin/firestore";
import { easternDayKey } from "./mailerScanPolicy.ts";
import { resolveLanding, MEASUREMENT_VERSION, type LandingEvidence } from "./qrLanding.ts";
import { publicServerCount } from "./qrServerCount.ts";

export const EXACT_COUNTER = "public_metrics/eddm_launch_2026_exact";
export const HISTORY_COUNTER = "public_metrics/eddm_launch_2026";
export const VERIFICATION_COUNTER = "public_metrics/eddm_launch_2026_verification";
export const UNIQUE_STARTED_AT = "2026-10-08T18:32:08Z";
// David, 2026-11-18: "I was the West Haven visitor." His own iPhone was counted as a
// scan on Nov 5 (same browser that visits from his home). It is shown, never as a stranger.
export const OWNER_SCANS: ReadonlyArray<{ date: string; note: string }> = [
  { date: "2026-11-05", note: "David's own iPhone (West Haven)" },
];
// The mailing began Sep 14, but this counter started Oct 8. Stranger scans found in the
// older analytics records (2026-11-18 audit) fill the gap; David's own test visits are left out.
export const CAMPAIGN_STARTED_ON = "2026-09-14";
export const PRE_COUNTER_STRANGER_SCANS: ReadonlyArray<{ date: string; place: string }> = [
  { date: "2026-09-26", place: "Lawrence, MA" },
];
export type MeasurementInput = {
  browserId: string; openingId: string; landing: LandingEvidence;
  verification: boolean;
  // 05-51: set by the server from the request's user agent, never trusted from the body.
  // Only phones add to the mailer-scan count; other devices are kept as a separate raw total.
  phone?: boolean;
  legacyQrSeen?: boolean; legacyWebsiteSeen?: boolean; legacyWebsiteDay?: string | null;
};
export type MeasurementReceipt = {
  counted: boolean; qrAccepted: boolean; qrFirstBrowser: boolean;
  qrOpeningId: string; verification: boolean; duplicate?: boolean;
};
const hash = (value: string) => createHash("sha256").update(`${MEASUREMENT_VERSION}:${value}`).digest("hex");
const total = (value: unknown) => typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : 0;
function iso(value: any): string | null {
  if (typeof value === "string" && !Number.isNaN(Date.parse(value))) return value;
  return value?.toDate?.().toISOString?.() ?? null;
}
export function validMeasurementInput(value: unknown): value is MeasurementInput {
  if (!value || typeof value !== "object") return false;
  const input = value as MeasurementInput;
  return /^[a-zA-Z0-9-]{16,100}$/.test(input.browserId ?? "") &&
    /^[a-zA-Z0-9-]{16,100}$/.test(input.openingId ?? "") &&
    typeof input.landing?.hostname === "string" && input.landing.hostname.length < 256 &&
    typeof input.landing.pathname === "string" && input.landing.pathname.length < 256 &&
    typeof input.landing.search === "string" && input.landing.search.length <= 2048;
}

// All reads precede writes, so concurrent retries/openings cannot double-count.
// Private records contain hashes, timestamps and dedup booleans, never landing evidence.
export async function recordMeasurement(db: Firestore, input: MeasurementInput, now = new Date(), serverTimestamp: () => unknown = () => now.toISOString()): Promise<MeasurementReceipt> {
  const eligibility = resolveLanding(input.landing);
  if (!eligibility.website) return { counted: false, qrAccepted: false, qrFirstBrowser: false, qrOpeningId: input.openingId, verification: input.verification };
  const counterPath = input.verification ? VERIFICATION_COUNTER : EXACT_COUNTER;
  const counterRef = db.doc(counterPath);
  const browserRef = db.doc(`${counterPath}/browser_markers/${hash(input.browserId)}`);
  const openingRef = db.doc(`${counterPath}/opening_receipts/${hash(`${input.browserId}:${input.openingId}`)}`);
  const day = easternDayKey(now);
  const dayRef = db.doc(`${counterPath}/daily_browser_markers/${hash(`${input.browserId}:${day}`)}`);
  const stamp = now.toISOString();
  return db.runTransaction(async (transaction) => {
    const [counterSnap, browserSnap, openingSnap, daySnap] = await Promise.all([
      transaction.get(counterRef), transaction.get(browserRef), transaction.get(openingRef), transaction.get(dayRef),
    ]);
    if (openingSnap.exists) {
      const previous = openingSnap.data()!;
      return { counted: true, qrAccepted: previous.qrAccepted === true, qrFirstBrowser: previous.qrFirstBrowser === true, qrOpeningId: input.openingId, verification: input.verification, duplicate: true };
    }
    const counter = counterSnap.data() ?? {};
    const browser = browserSnap.data() ?? {};
    const legacy = !input.verification;
    const qrSeen = browser.qrSeen === true || (legacy && input.legacyQrSeen === true);
    const websiteSeen = browser.websiteSeen === true || (legacy && input.legacyWebsiteSeen === true);
    // Preserve prior server/local migration markers; a delayed older day cannot erase a counted day.
    const daySeen = daySnap.exists || browser.lastWebsiteDay === day || (legacy && input.legacyWebsiteDay === day);
    const qrAccepted = eligibility.attributionMethod !== null;
    const qrFirstBrowser = qrAccepted && !qrSeen;
    const phone = input.phone !== false;
    const daily = { ...(counter.daily?.[day] ?? {}) };
    const update: Record<string, unknown> = {
      visits: total(counter.visits) + (websiteSeen ? 0 : 1),
      websiteVisitorsStartedAt: iso(counter.websiteVisitorsStartedAt) ?? (legacy ? UNIQUE_STARTED_AT : stamp),
      lastVisitAt: serverTimestamp(),
      measurementVersion: MEASUREMENT_VERSION,
    };
    if (!daySeen) daily.visits = total(daily.visits) + 1;
    if (qrAccepted) {
      update.qrOpenings = total(counter.qrOpenings) + 1;
      update.qrOpeningsStartedAt = iso(counter.qrOpeningsStartedAt) ?? stamp;
      update.qrVisitorsStartedAt = iso(counter.qrVisitorsStartedAt) ?? (legacy ? UNIQUE_STARTED_AT : stamp);
      daily.qrOpenings = total(daily.qrOpenings) + 1;
      if (phone) update.lastScanAt = serverTimestamp();
      if (qrFirstBrowser && phone) {
        update.count = total(counter.count) + 1;
        daily.scans = total(daily.scans) + 1;
        update.byAttribution = {
          [eligibility.attributionMethod!]: total(counter.byAttribution?.[eligibility.attributionMethod!]) + 1,
        };
      } else if (qrFirstBrowser) {
        // 05-51: a mailer link opened on a computer or tablet is not a phone scan.
        update.nonPhoneQrVisitors = total(counter.nonPhoneQrVisitors) + 1;
        update.nonPhoneQrVisitorsStartedAt = iso(counter.nonPhoneQrVisitorsStartedAt) ?? stamp;
        daily.nonPhoneScans = total(daily.nonPhoneScans) + 1;
      }
    }
    update.daily = { [day]: daily };
    transaction.set(counterRef, update, { merge: true });
    transaction.set(browserRef, {
      websiteSeen: true, qrSeen: qrSeen || qrAccepted,
      lastWebsiteDay: typeof browser.lastWebsiteDay === "string" && browser.lastWebsiteDay > day ? browser.lastWebsiteDay : day,
      lastSeenAt: stamp,
    }, { merge: true });
    transaction.set(dayRef, { recordedAt: stamp });
    transaction.set(openingRef, { qrAccepted, qrFirstBrowser, recordedAt: stamp });
    return { counted: true, qrAccepted, qrFirstBrowser, qrOpeningId: input.openingId, verification: input.verification };
  });
}

function ownerScansOn(date: string, verification: boolean) {
  return verification ? 0 : OWNER_SCANS.filter((scan) => scan.date === date).length;
}
export function publicMeasurement(data: Record<string, any> = {}, verification = false) {
  // Only subtract an owner scan the counter actually recorded on that day.
  const ownerTotal = verification ? 0 : OWNER_SCANS.filter((scan) => total(data.daily?.[scan.date]?.scans) > 0).length;
  const count = Math.max(0, total(data.count) - ownerTotal), visits = total(data.visits);
  const started = iso(data.qrOpeningsStartedAt);
  const startedDay = started ? easternDayKey(new Date(started)) : null;
  const lastScanAt = iso(data.lastScanAt);
  return {
    count, lastScanAt, label: "Mailer QR browsers",
    scans: { total: count, lastScanAt, phoneOnly: true }, visits: { total: visits },
    nonPhoneQrVisitors: { total: total(data.nonPhoneQrVisitors), startedAt: iso(data.nonPhoneQrVisitorsStartedAt) },
    qrOpenings: { total: started ? total(data.qrOpenings) : null, startedAt: started },
    qrVisitors: { total: count, startedAt: iso(data.qrVisitorsStartedAt) ?? (verification ? null : UNIQUE_STARTED_AT) },
    websiteVisitors: { total: visits, startedAt: iso(data.websiteVisitorsStartedAt) ?? (verification ? null : UNIQUE_STARTED_AT) },
    daily: Object.entries(data.daily ?? {}).filter(([date]) => /^\d{4}-\d{2}-\d{2}$/.test(date))
      .map(([date, raw]) => {
        const day = raw && typeof raw === "object" ? raw as Record<string, unknown> : {};
        const scans = Math.max(0, total(day.scans) - ownerScansOn(date, verification));
        return { date, scans, visits: total(day.visits), qrOpenings: startedDay && date >= startedDay ? total(day.qrOpenings) : null, qrVisitors: scans, nonPhoneScans: total(day.nonPhoneScans), websiteVisitors: total(day.visits) };
      }).sort((a, b) => a.date.localeCompare(b.date)).slice(-30),
    dailyQrVisitorsMeaning: "Phone browsers first added to the QR counter that day; returning QR browsers add openings only. Computers and tablets are counted separately as nonPhoneScans.",
  };
}
export function publicMeasurementResponse(exact: Record<string, any> = {}, history: Record<string, any> = {}, verification: Record<string, any> = {}, now = new Date(), server: Record<string, any> = {}) {
  const current = publicMeasurement(exact);
  return {
    ...current,
    campaign: {
      startedOn: CAMPAIGN_STARTED_ON,
      strangerScans: current.count + PRE_COUNTER_STRANGER_SCANS.length,
      meaning: "Different phones that opened the printed QR link since the first mail drop, not counting David's own phone.",
      beforeCounter: PRE_COUNTER_STRANGER_SCANS,
      ownerScansExcluded: OWNER_SCANS,
    },
    serverCount: publicServerCount(server),
    asOf: now.toISOString(), timeZone: "America/New_York", measurementVersion: MEASUREMENT_VERSION,
    history: { count: total(history.count), visits: total(history.visits), lastUpdatedAt: iso(history.lastUpdatedAt) ?? [iso(history.lastScanAt), iso(history.lastVisitAt)].filter((v): v is string => !!v).sort().at(-1) ?? null, note: "Older mixed history; includes inferred homepage scans. Preserved as saved, never added to current totals." },
    verification: publicMeasurement(verification, true),
  };
}
