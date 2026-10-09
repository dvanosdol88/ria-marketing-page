import assert from "node:assert/strict";
import { test } from "node:test";
import { recordMeasurement, EXACT_COUNTER, HISTORY_COUNTER, VERIFICATION_COUNTER, publicMeasurementResponse, validMeasurementInput } from "../src/lib/qrMeasurement.ts";
import { landingEvidence, resolveLanding, buildSharedResultQuery } from "../src/lib/qrLanding.ts";

export const printed = "portfolio=1000000&years=20&growth=8&fee=1";
const site = "https://youarepayingtoomuch.com/";
const input = (id = "opening-00000000001", extra = {}) => ({ browserId: "browser-00000000001", openingId: id, landing: landingEvidence(`${site}?${printed}`), verification: false, ...extra });
const now = new Date("2026-10-09T16:00:00Z");
export { memoryDb } from "./measurement-memory-db.mjs";
import { memoryDb } from "./measurement-memory-db.mjs";

test("printed evidence qualifies; defaults, shares, duplicate parameters and other hosts do not", () => {
  assert.equal(resolveLanding(input().landing).attributionMethod, "legacy_qr_signature");
  const queries = ["", `${printed}&flat=1200&mfe=0`, `${printed}&shared=1`, `${printed}&fee=1`, `${printed}&portfolio=1000000`, `${printed}&fee=2`, `${printed}&variant=direct-mail`];
  for (const query of queries) assert.equal(resolveLanding(landingEvidence(`${site}?${query}`)).attributionMethod, null, query);
  for (const hostname of ["onepercentblues.com", "example.com", "localhost"]) assert.equal(resolveLanding({ ...input().landing, hostname }).website, false);
  assert.equal(resolveLanding({ ...input().landing, pathname: "/save" }).website, false);
  assert.equal(resolveLanding({ ...input().landing, hostname: "www.youarepayingtoomuch.com" }).website, true);
  const full = "utm_source=eddm&utm_medium=print&utm_campaign=launch_5k&utm_content=qr_code";
  assert.equal(resolveLanding(landingEvidence(`${site}?${full}`)).attributionMethod, "explicit_utm");
  assert.equal(resolveLanding(landingEvidence(`${site}?${full}&flat=1200`)).attributionMethod, null);
  const shared = new URLSearchParams(buildSharedResultQuery(`${printed}&${full}&selftest=1&qrtest=1`));
  assert.equal(shared.get("shared"), "1");
  assert.equal(shared.has("utm_source"), false);
  assert.equal(shared.has("qrtest"), false);
  assert.equal(resolveLanding(landingEvidence(`${site}?${shared}`)).attributionMethod, null);
});

test("accepted document openings retry atomically; reopening adds openings, each browser adds one unique", async () => {
  const db = memoryDb({ [EXACT_COUNTER]: { count: 31, visits: 9 }, [HISTORY_COUNTER]: { count: 72, visits: 172 } });
  const receipts = await Promise.all(Array.from({ length: 8 }, () => recordMeasurement(db, input(), now)));
  assert.equal(receipts.filter((r) => !r.duplicate).length, 1);
  assert.equal(db.records.get(EXACT_COUNTER).qrOpenings, 1);
  assert.equal(db.records.get(EXACT_COUNTER).count, 32);
  assert.equal(db.records.get(EXACT_COUNTER).visits, 10);
  // Simulate a browser marker from before per-day receipts existed, without backfilling.
  for (const path of db.records.keys()) if (path.includes("/daily_browser_markers/")) db.records.delete(path);
  const second = await recordMeasurement(db, input("opening-00000000002"), now);
  assert.equal(second.qrFirstBrowser, false);
  assert.equal(db.records.get(EXACT_COUNTER).qrOpenings, 2);
  assert.equal(db.records.get(EXACT_COUNTER).daily["2026-10-09"].visits, 1);
  await recordMeasurement(db, input("opening-00000000003", { browserId: "browser-00000000002" }), now);
  assert.equal(db.records.get(EXACT_COUNTER).count, 33);
  assert.equal(db.records.get(EXACT_COUNTER).visits, 11);
  assert.deepEqual(db.records.get(HISTORY_COUNTER), { count: 72, visits: 172 });
  for (const [path, record] of db.records) {
    if (!path.includes("markers/") && !path.includes("receipts/")) continue;
    assert.match(path.split("/").at(-1), /^[a-f0-9]{64}$/);
    const serialized = JSON.stringify(record);
    for (const forbidden of ["browser-", "opening-", "1000000", "portfolio", "hostname", "landing", "search", "user-agent", "ip"]) assert.equal(serialized.includes(forbidden), false, forbidden);
  }
});

test("legacy flags preserve both lifetime and today's unique counters; daily rolls at Eastern midnight", async () => {
  const db = memoryDb({ [EXACT_COUNTER]: { count: 31, visits: 9, daily: { "2026-10-09": { scans: 5, visits: 4 } } } });
  const legacy = { legacyQrSeen: true, legacyWebsiteSeen: true, legacyWebsiteDay: "2026-10-09" };
  const r = await recordMeasurement(db, input(undefined, legacy), now);
  assert.equal(r.qrFirstBrowser, false);
  assert.equal(db.records.get(EXACT_COUNTER).count, 31);
  assert.equal(db.records.get(EXACT_COUNTER).visits, 9);
  assert.equal(db.records.get(EXACT_COUNTER).daily["2026-10-09"].visits, 4);
  await recordMeasurement(db, input("opening-00000000002", legacy), new Date("2026-10-10T03:59:59Z"));
  assert.equal(db.records.get(EXACT_COUNTER).daily["2026-10-09"].visits, 4);
  await recordMeasurement(db, input("opening-00000000003", legacy), new Date("2026-10-10T04:00:00Z"));
  assert.equal(db.records.get(EXACT_COUNTER).daily["2026-10-10"].visits, 1);
  assert.equal(db.records.get(EXACT_COUNTER).visits, 9);
  assert.equal(db.records.get(EXACT_COUNTER).daily["2026-10-09"].scans, 5);
});

test("ordinary and verification visitors never add QR prospects; verification ignores normal dedup flags", async () => {
  const db = memoryDb();
  await recordMeasurement(db, input(undefined, { landing: landingEvidence(site) }), now);
  assert.equal(db.records.get(EXACT_COUNTER).visits, 1);
  assert.equal(db.records.get(EXACT_COUNTER).qrOpenings, undefined);
  const receipt = await recordMeasurement(db, input("opening-00000000002", { verification: true, legacyQrSeen: true, legacyWebsiteSeen: true }), now);
  assert.equal(receipt.verification, true);
  assert.equal(receipt.qrFirstBrowser, true);
  assert.equal(db.records.get(VERIFICATION_COUNTER).count, 1);
  assert.equal(db.records.get(EXACT_COUNTER).count, undefined);
  await recordMeasurement(db, input("opening-00000000003", { landing: landingEvidence(site), verification: true }), now);
  assert.equal(db.records.get(VERIFICATION_COUNTER).visits, 1);
  assert.equal(db.records.get(VERIFICATION_COUNTER).qrOpenings, 1);
});

test("daily browser markers survive out-of-order Eastern midnight commits", async () => {
  const db = memoryDb({ [HISTORY_COUNTER]: { count: 72, visits: 172 } });
  const times = ["2026-10-10T04:00:00.010Z", "2026-10-10T03:59:59.990Z", "2026-10-10T04:00:00.030Z"];
  for (const [index, time] of times.entries()) {
    await recordMeasurement(db, input(`opening-0000000000${index + 1}`), new Date(time));
  }
  const counter = db.records.get(EXACT_COUNTER);
  assert.equal(counter.daily["2026-10-10"].visits, 1);
  assert.equal(counter.daily["2026-10-09"].visits, 1);
  assert.equal(counter.visits, 1);
  assert.equal(counter.count, 1);
  assert.equal(counter.qrOpenings, 3);
  assert.deepEqual(db.records.get(HISTORY_COUNTER), { count: 72, visits: 172 });
});

test("public aggregates retain saved history and starts, with null opening coverage before first acceptance", async () => {
  const exact = { count: 31, visits: 9, daily: { "2026-10-08": { scans: 2, visits: 3 } } };
  const history = { count: 72, visits: 172, lastScanAt: "2026-10-08T19:00:00Z" };
  const before = publicMeasurementResponse(exact, history, {}, now);
  assert.deepEqual(before.qrOpenings, { total: null, startedAt: null });
  assert.equal(before.daily[0].qrOpenings, null);
  assert.equal(before.qrVisitors.total, 31);
  assert.equal(before.websiteVisitors.startedAt, "2026-10-08T18:32:08Z");
  assert.equal(before.history.count, 72);
  assert.equal(before.history.visits, 172);
  assert.equal(before.history.lastUpdatedAt, history.lastScanAt);
  assert.equal(before.asOf, now.toISOString());
  assert.equal(before.verification.websiteVisitors.startedAt, null);
  const db = memoryDb({ [EXACT_COUNTER]: exact });
  await recordMeasurement(db, input(), now);
  const after = publicMeasurementResponse(db.records.get(EXACT_COUNTER), history, {}, now);
  assert.deepEqual(after.qrOpenings, { total: 1, startedAt: now.toISOString() });
  assert.equal(after.daily[0].qrOpenings, null);
  assert.equal(after.daily[1].qrOpenings, 1);
  assert.equal(after.timeZone, "America/New_York");
  const saved = publicMeasurementResponse({ ...db.records.get(EXACT_COUNTER), qrVisitorsStartedAt: "2026-10-08T18:32:08.000Z" });
  assert.equal(saved.qrVisitors.startedAt, "2026-10-08T18:32:08.000Z");
  assert.equal(validMeasurementInput({ attributionMethod: "legacy_qr_signature" }), false);
  assert.equal(validMeasurementInput(input()), true);
});
