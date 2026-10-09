import assert from "node:assert/strict";
import { test } from "node:test";
import { registerHooks } from "node:module";
import { randomUUID } from "node:crypto";
import { recordMeasurement, EXACT_COUNTER, VERIFICATION_COUNTER } from "../src/lib/qrMeasurement.ts";
import { memoryDb, printed } from "./qr-measurement.mjs";
import { exitQrVerification, syncQrVerification } from "../src/lib/qrVerification.ts";

const site = "https://youarepayingtoomuch.com/";
const storage = () => { const values = new Map(); return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: (key) => values.delete(key), values }; };
let importId = 0;
function environment(url = site, options = {}) {
  const localStorage = options.localStorage ?? storage(), sessionStorage = options.sessionStorage ?? storage();
  const cookies = options.cookies ?? new Map();
  globalThis.document = { get cookie() { return Array.from(cookies).map(([key, value]) => `${key}=${value}`).join("; "); }, set cookie(value) {
    const [pair, ...attributes] = value.split(";"); const [key, content] = pair.split("=");
    if (!content || attributes.some((v) => v.trim() === "Max-Age=0")) cookies.delete(key); else cookies.set(key, content);
  } };
  globalThis.window = { location: new URL(url), localStorage, sessionStorage, crypto: { randomUUID }, navigator: { userAgent: "Mozilla/5.0 iPhone Safari", webdriver: false } };
  exitQrVerification();
  return { localStorage, sessionStorage, cookies };
}
const freshBrowserModule = () => import(`../src/lib/qrMeasurementBrowser.ts?document=${++importId}`);
function stubFetch(db, requests) {
  globalThis.fetch = async (_url, init) => {
    const input = JSON.parse(init.body); requests.push(input);
    return { ok: true, json: () => recordMeasurement(db, input, new Date("2026-10-09T16:00:00Z")) };
  };
}

test("document rerenders and cleanup share one accepted receipt; reload reuses browser and adds an opening", async () => {
  const db = memoryDb(), requests = [];
  const env = environment(`${site}?${printed}`); stubFetch(db, requests);
  const first = await freshBrowserModule();
  window.location = new URL(site); // calculator cleans the arriving query before effects
  const receipts = await Promise.all([first.reportDocumentMeasurement(), first.reportDocumentMeasurement(), first.reportDocumentMeasurement()]);
  assert.equal(requests.length, 1);
  assert.equal(requests[0].landing.search, `?${printed}`);
  assert.equal(first.claimQrEvent(receipts[0]), true);
  assert.equal(first.claimQrEvent(receipts[1]), false);
  await first.reportDocumentMeasurement(); assert.equal(requests.length, 1);
  environment(`${site}?${printed}`, env); const reloaded = await freshBrowserModule();
  const second = await reloaded.reportDocumentMeasurement();
  assert.equal(requests[0].browserId, requests[1].browserId);
  assert.notEqual(requests[0].openingId, requests[1].openingId);
  assert.equal(second.qrFirstBrowser, false);
  assert.equal(db.records.get(EXACT_COUNTER).qrOpenings, 2);
  assert.equal(db.records.get(EXACT_COUNTER).count, 1);
});

test("blocked local storage falls back to a cookie across documents; failed responses retry same opening", async () => {
  const blocked = { getItem() { throw Error("blocked"); }, setItem() { throw Error("blocked"); }, removeItem() { throw Error("blocked"); } };
  const db = memoryDb(), requests = []; const env = environment(`${site}?${printed}`, { localStorage: blocked, sessionStorage: blocked });
  let first = true;
  globalThis.fetch = async (_url, init) => {
    const input = JSON.parse(init.body); requests.push(input);
    // The counter committed; only the response was lost.
    const receipt = await recordMeasurement(db, input);
    if (first) { first = false; throw Error("lost response"); }
    return { ok: true, json: async () => receipt };
  };
  const module = await freshBrowserModule(); assert.equal(await module.reportDocumentMeasurement(), null);
  const retry = await module.reportDocumentMeasurement(); assert.equal(retry.duplicate, true);
  assert.equal(requests[0].openingId, requests[1].openingId);
  assert.equal(db.records.get(EXACT_COUNTER).qrOpenings, 1);
  environment(`${site}?${printed}`, env); await (await freshBrowserModule()).reportDocumentMeasurement();
  assert.equal(requests[0].browserId, requests[2].browserId);
  assert.equal(db.records.get(EXACT_COUNTER).count, 1);
});

test("owners, bots, automation and other hosts are excluded, including automation in phone test mode", async () => {
  const requests = []; const db = memoryDb(); stubFetch(db, requests);
  for (const kind of ["owner", "bot", "automation", "testautomation", "blues"]) {
    environment(kind === "blues" ? `https://onepercentblues.com/?${printed}` : `${site}?${printed}${kind === "testautomation" ? "&qrtest=1" : ""}`);
    if (kind === "owner") window.localStorage.setItem("sww_self_test", "true");
    if (kind === "bot") window.navigator.userAgent = "Googlebot";
    if (kind.includes("automation")) window.navigator.webdriver = true;
    assert.equal(await (await freshBrowserModule()).reportDocumentMeasurement(), null, kind);
  }
  assert.equal(requests.length, 0);
});

test("phone test mode overrides owner exclusion, keeps session cookie and never changes legacy flags", async () => {
  const env = environment(`${site}?qrtest=1`); window.localStorage.setItem("sww_self_test", "true");
  window.localStorage.setItem("yapt_mailer_scan_counted", "1");
  window.localStorage.setItem("yapt_visitor_seen", "1");
  const before = Array.from(window.localStorage.values);
  const db = memoryDb(), requests = []; stubFetch(db, requests);
  const ordinary = await (await freshBrowserModule()).reportDocumentMeasurement();
  assert.equal(ordinary.qrAccepted, false); assert.equal(ordinary.verification, true);
  assert.equal(db.records.has(EXACT_COUNTER), false);
  assert.equal(db.records.get(VERIFICATION_COUNTER).visits, 1);
  window.location = new URL(`${site}?${printed}`);
  const qr = await (await freshBrowserModule()).reportDocumentMeasurement();
  assert.equal(qr.qrAccepted, true); assert.equal(qr.qrFirstBrowser, true);
  assert.deepEqual(Array.from(window.localStorage.values).filter(([key]) => key !== "yapt_measurement_browser"), before);
  assert.equal(syncQrVerification(), true);
  exitQrVerification(); assert.equal(syncQrVerification(), false);
  assert.equal(env.cookies.has("yapt_qr_verification"), false);
  window.location = new URL(`${site}?qrtest=1`); assert.equal(syncQrVerification(), true);
  window.location = new URL(`${site}?qrtest=0`); assert.equal(syncQrVerification(), false);
});

// Import real handlers and analytics code with only their network/database adapters replaced.
registerHooks({ resolve(specifier, context, nextResolve) {
  if (specifier === "next/server") return { shortCircuit: true, url: `data:text/javascript,${encodeURIComponent('export class NextRequest {} export const NextResponse={json:(body,options={})=>({body,status:options.status??200,json:async()=>body})};')}` };
  if (specifier === "@/lib/firebaseAdmin") return { shortCircuit: true, url: `data:text/javascript,${encodeURIComponent('export const getAdminDb=()=>globalThis.__measurementDb;')}` };
  if (specifier === "posthog-js") return { shortCircuit: true, url: `data:text/javascript,${encodeURIComponent('export default {capture:(event,properties)=>globalThis.__events.push({event,properties}),unregister:()=>{}};')}` };
  if (specifier === "@/lib/redditPixel") return { shortCircuit: true, url: `data:text/javascript,${encodeURIComponent('export const mirrorPostHogEventToReddit=()=>{};')}` };
  if (specifier.startsWith("@/")) return nextResolve(new URL(`../src/${specifier.slice(2)}.ts`, import.meta.url).href, context);
  return nextResolve(specifier, context);
} });

test("API rejects claims without landing evidence and bot/owner/host writes; session cookie controls test separation", async () => {
  const { POST, GET } = await import("../src/app/api/analytics/mailer-scans/route.ts");
  globalThis.__measurementDb = memoryDb();
  const baseHeaders = { host: "youarepayingtoomuch.com", origin: "https://youarepayingtoomuch.com", "sec-fetch-site": "same-origin", "user-agent": "Mozilla/5.0 iPhone Safari", "accept-language": "en-US" };
  const baseBody = { browserId: "browser-00000000001", openingId: "opening-00000000001", landing: { hostname: "youarepayingtoomuch.com", pathname: "/", search: `?${printed}` } };
  const request = (body = baseBody, headers = {}) => ({ headers: new Headers({ ...baseHeaders, ...headers }), json: async () => body });
  assert.equal((await POST(request({ attributionMethod: "legacy_qr_signature" }))).status, 400);
  assert.equal((await POST(request(baseBody, { "user-agent": "Googlebot" }))).body.reason, "automated_traffic");
  assert.equal((await POST(request(baseBody, { "accept-language": "" }))).body.reason, "automated_traffic");
  assert.equal((await POST(request(baseBody, { cookie: "yapt_selftest=1" }))).body.reason, "self_test");
  assert.equal((await POST(request(baseBody, { host: "onepercentblues.com", origin: "https://onepercentblues.com" }))).body.reason, "other_host");
  assert.equal((await POST(request(baseBody, { origin: "https://example.com" }))).status, 403);
  assert.equal(globalThis.__measurementDb.records.size, 0);
  const verification = await POST(request(baseBody, { cookie: "yapt_selftest=1; yapt_qr_verification=1" }));
  assert.equal(verification.body.verification, true);
  assert.equal(globalThis.__measurementDb.records.has(EXACT_COUNTER), false);
  const forged = await POST(request({ ...baseBody, verification: true, openingId: "opening-00000000002", landing: { ...baseBody.landing, search: "" } }));
  assert.equal(forged.body.verification, false);
  assert.equal(forged.body.qrAccepted, false);
  const publicResult = await GET(); assert.equal(publicResult.body.verification.qrOpenings.total, 1);
  assert.equal(publicResult.body.qrOpenings.total, null);
  assert.equal(JSON.stringify(publicResult.body).includes("browserId"), false);
});

test("fresh ordinary/shared documents clear stale campaigns; a legitimate QR keeps campaign for conversions after cleanup", async () => {
  for (const query of ["", `${printed}&flat=1200&mfe=0`, `${printed}&shared=1`]) {
    environment(`${site}?${query}`); globalThis.__events = [];
    window.sessionStorage.setItem("sww_campaign_attribution", JSON.stringify({ is_eddm_visitor: true, utm_source: "eddm", campaign_attribution_method: "clean_root_launch" }));
    const ph = await import(`../src/lib/posthog.ts?document=${++importId}`);
    ph.capturePostHogEvent("calculator_submitted");
    assert.equal(__events[0].properties.is_eddm_visitor, false, query);
    assert.equal(window.sessionStorage.getItem("sww_campaign_attribution"), null);
  }
  environment(`${site}?${printed}`); globalThis.__events = [];
  const ph = await import(`../src/lib/posthog.ts?document=${++importId}`);
  ph.initializeDocumentCampaign(); window.location = new URL(site);
  ph.capturePostHogEvent("calculator_submitted");
  assert.equal(__events[0].properties.is_eddm_visitor, true);
  assert.equal(__events[0].properties.campaign_attribution_method, "legacy_qr_signature");
  window.location = new URL(`${site}?${printed}&flat=1200&mfe=0`);
  ph.capturePostHogEvent("calculator_submitted");
  assert.equal(__events[1].properties.is_eddm_visitor, true, "calculator state rewrites within an attributed document retain conversion context");
  environment(`${site}?${printed}&qrtest=1`); globalThis.__events = [];
  const testPh = await import(`../src/lib/posthog.ts?document=${++importId}`);
  testPh.capturePostHogEvent("eddm_qr_landed", { $current_url: window.location.href, qr_verification: true });
  assert.equal(__events[0].properties.self_test, true);
  assert.equal(__events[0].properties.qr_verification, true);
  assert.equal(new URL(__events[0].properties.$current_url).search, "");
});
