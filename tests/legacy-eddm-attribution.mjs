import assert from "node:assert/strict";
import { createServer } from "node:net";
import { execFileSync, spawn } from "node:child_process";
import { chromium } from "playwright";
import { gunzipSync } from "node:zlib";
import { recordMeasurement, EXACT_COUNTER, VERIFICATION_COUNTER } from "../src/lib/qrMeasurement.ts";
import { memoryDb } from "./measurement-memory-db.mjs";

const PRINTED = "portfolio=1000000&years=20&growth=8&fee=1";
const SITE = "https://youarepayingtoomuch.com";
const UTM = "utm_source=eddm&utm_medium=print&utm_campaign=launch_5k&utm_content=qr_code";
async function freePort() {
  const server = createServer(); await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port; await new Promise((resolve) => server.close(resolve)); return port;
}
async function until(predicate, description, timeout = 60000) {
  const end = Date.now() + timeout;
  while (Date.now() < end) { if (await predicate()) return; await new Promise((resolve) => setTimeout(resolve, 100)); }
  throw Error(`Timed out: ${description}`);
}
function decodeEvents(raw) {
  if (!raw) return [];
  if (raw[0] === 0x1f && raw[1] === 0x8b) raw = gunzipSync(raw);
  let data;
  try { data = JSON.parse(raw.toString()); } catch {
    try { data = JSON.parse(Buffer.from(new URLSearchParams(raw.toString()).get("data"), "base64").toString()); } catch { return []; }
  }
  if (data.event) return [data];
  if (Array.isArray(data)) return data;
  if (data.batch) return data.batch;
  if (data.data) { try { const value = JSON.parse(Buffer.from(data.data, "base64").toString()); return value.batch ?? [value]; } catch { return []; } }
  return [];
}
let nextProcess, browser;
const db = memoryDb();
const requests = [], events = [], errors = [];
try {
  const port = await freePort(); const base = `http://127.0.0.1:${port}`;
  const testEnv = { ...process.env, NEXT_PUBLIC_POSTHOG_KEY: "phc_local_eddm_test", NEXT_PUBLIC_POSTHOG_HOST: "https://us.i.posthog.com", NEXT_PUBLIC_POSTHOG_TEST_MODE: "true", FIREBASE_SERVICE_ACCOUNT_KEY: "" };
  // Dev host proxies failed before React initialization. Exercise the optimized
  // app used in production instead. The default gate always builds fresh;
  // explicit reuse is reserved for a caller that just built these exact inputs.
  if (process.env.EDDM_TEST_PRODUCTION_BUILD !== "true") {
    const build = spawn(process.execPath, ["node_modules/next/dist/bin/next", "build"], { env: testEnv, stdio: "inherit", windowsHide: true });
    await new Promise((resolve, reject) => { build.once("error", reject); build.once("exit", (code) => code === 0 ? resolve() : reject(Error(`Local optimized test build failed (${code})`))); });
  }
  const args = ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", String(port)];
  nextProcess = spawn(process.execPath, args, {
    env: testEnv,
    stdio: "ignore", windowsHide: true,
  });
  await until(async () => { try { return (await fetch(`${base}/`, { signal: AbortSignal.timeout(30000) })).ok; } catch { return false; } }, "local website startup", 240000);
  browser = await chromium.launch({ headless: true });
  async function context({ human = true, host = "youarepayingtoomuch.com" } = {}) {
    const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile Safari/604.1", reducedMotion: "reduce" });
    if (human) await ctx.addInitScript(() => Object.defineProperty(Navigator.prototype, "webdriver", { get: () => false }));
    await ctx.route("**/*", async (route) => {
      const url = new URL(route.request().url());
      if (url.hostname === "us.i.posthog.com") {
        events.push(...decodeEvents(route.request().postDataBuffer()));
        await route.fulfill({ contentType: "application/json", body: '{"status":1}' }); return;
      }
      if (url.hostname === "us-assets.i.posthog.com") {
        await route.fulfill({ contentType: url.pathname.includes("config") ? "application/json" : "application/javascript", body: url.pathname.includes("config") ? '{"config":{},"supportedCompression":["base64"]}' : "/* disabled in local test */" }); return;
      }
      if (url.hostname !== host) { await route.fulfill({ status: 200, body: "" }); return; }
      if (url.pathname === "/_vercel/insights/script.js") {
        // The hosting platform serves this adapter; local next start does not.
        await route.fulfill({ contentType: "application/javascript", body: "/* platform adapter excluded from local QR proof */" }); return;
      }
      if (url.pathname === "/api/analytics/mailer-scans") {
        const body = route.request().postDataJSON(); requests.push(body);
        const verification = (route.request().headers().cookie ?? "").includes("yapt_qr_verification=1");
        const receipt = await recordMeasurement(db, { ...body, verification });
        await route.fulfill({ contentType: "application/json", body: JSON.stringify(receipt) }); return;
      }
      // Every production-looking URL is intercepted and served by the local worktree.
      try {
        const response = await route.fetch({ url: `${base}${url.pathname}${url.search}`, headers: { ...route.request().headers(), host, origin: base, referer: `${base}/` }, timeout: 90000 });
        await route.fulfill({ response });
      } catch (error) {
        // Page/context teardown can cancel requests still delivering large dev chunks.
        if (!/disposed|closed/.test(error.message)) throw error;
      }
    });
    return ctx;
  }
  const ctx = await context(); const page = await ctx.newPage(); page.on("pageerror", (error) => errors.push(error.message));
  const consoleErrors = [], failedRequests = [], responseFailures = [];
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text().slice(0, 500)); });
  page.on("requestfailed", (request) => failedRequests.push({ path: new URL(request.url()).pathname, error: request.failure()?.errorText }));
  page.on("response", (response) => { if (response.status() >= 400) responseFailures.push({ path: new URL(response.url()).pathname, status: response.status() }); });
  await page.goto(`${SITE}/?${PRINTED}`, { waitUntil: "domcontentloaded" });
  try {
    await until(() => events.some((e) => e.event === "eddm_qr_landed"), "accepted QR event");
  } catch (error) {
    console.error(JSON.stringify({ events: events.map((e) => e.event), receipts: requests.length, errors, consoleErrors, failedRequests, browser: await page.evaluate(() => ({ ready: document.readyState, scripts: document.scripts.length, automated: navigator.webdriver, ua: navigator.userAgent, host: location.hostname, campaign: sessionStorage.getItem("sww_campaign_attribution"), htmlLength: document.body.innerHTML.length })) }));
    throw error;
  }
  const qr = events.find((e) => e.event === "eddm_qr_landed");
  assert.equal(qr.properties.measurement_version, "05-66");
  assert.equal(qr.properties.qr_first_browser, true);
  assert.equal(qr.properties.qr_verification, false);
  assert.equal(qr.properties.$current_url, `${SITE}/`);
  assert.equal(qr.properties.$lib, "web");
  assert.equal(qr.properties.is_eddm_visitor, true);
  assert.equal(qr.properties.campaign_attribution_method, "legacy_qr_signature");
  assert.equal(qr.properties.qr_opening_id, requests[0].openingId);
  assert.equal(requests.length, 1);
  assert.equal(await page.evaluate(() => window.scrollY), 0);
  assert.equal(db.records.get(EXACT_COUNTER).count, 1);
  // A query rewrite/rerender retains the same document opening.
  await page.evaluate(() => window.history.replaceState(window.history.state, "", "/"));
  await page.waitForTimeout(400); assert.equal(requests.length, 1);
  const handoff = page.locator('a[data-posthog-cta-location="home_firm_visit_card_calculator"]');
  await handoff.evaluate((link) => { link.addEventListener("click", (event) => event.preventDefault(), { once: true }); link.click(); });
  const href = new URL(await handoff.getAttribute("href"));
  assert.equal(href.pathname, "/save");
  assert.deepEqual([...href.searchParams.keys()].sort(), ["utm_campaign", "utm_content", "utm_medium", "utm_source"]);
  await until(() => events.some((e) => e.event === "cta_clicked" && e.properties.cta_location === "home_firm_visit_card_calculator"), "attributed conversion after cleanup");
  assert.equal(events.find((e) => e.event === "cta_clicked" && e.properties.cta_location === "home_firm_visit_card_calculator").properties.is_eddm_visitor, true);
  const oldId = requests[0].openingId;
  await page.goto(`${SITE}/?${PRINTED}`, { waitUntil: "domcontentloaded" });
  await until(() => events.filter((e) => e.event === "eddm_qr_landed").length === 2, "reopened QR event");
  assert.notEqual(requests[1].openingId, oldId);
  assert.equal(requests[1].browserId, requests[0].browserId);
  assert.equal(events.filter((e) => e.event === "eddm_qr_landed")[1].properties.qr_first_browser, false);
  assert.equal(db.records.get(EXACT_COUNTER).qrOpenings, 2);
  assert.equal(db.records.get(EXACT_COUNTER).count, 1);
  // Fresh ordinary document clears the legitimate campaign from the preceding page.
  await page.goto(`${SITE}/`, { waitUntil: "domcontentloaded" });
  await until(() => requests.length === 3, "ordinary opening");
  assert.equal(await page.evaluate(() => window.sessionStorage.getItem("sww_campaign_attribution")), null);
  assert.equal(db.records.get(EXACT_COUNTER).qrOpenings, 2);
  for (const query of [`${PRINTED}&flat=1200&mfe=0`, `${PRINTED}&shared=1`, `${PRINTED}&fee=1`]) {
    const before = requests.length;
    await page.goto(`${SITE}/?${query}`, { waitUntil: "domcontentloaded" });
    await until(() => requests.length === before + 1, "ordinary/shared receipt");
    assert.equal(await page.evaluate(() => window.sessionStorage.getItem("sww_campaign_attribution")), null);
    assert.equal(db.records.get(EXACT_COUNTER).qrOpenings, 2);
  }
  // Full approved UTMs remain recognized.
  await page.goto(`${SITE}/?${UTM}`, { waitUntil: "domcontentloaded" });
  await until(() => events.filter((e) => e.event === "eddm_qr_landed").length === 3, "approved campaign receipt");
  assert.equal(events.filter((e) => e.event === "eddm_qr_landed")[2].properties.campaign_attribution_method, "explicit_utm");
  // Owner exclusion suppresses both public receipt and normal QR alert.
  await page.evaluate(() => { localStorage.setItem("sww_self_test", "true"); document.cookie = "yapt_selftest=1; Path=/"; });
  const prospectBefore = requests.length, qrEventsBefore = events.filter((e) => e.event === "eddm_qr_landed").length;
  await page.goto(`${SITE}/?${PRINTED}`, { waitUntil: "domcontentloaded" });
  await page.getByRole("heading", { level: 1 }).waitFor(); await page.waitForTimeout(400);
  assert.equal(requests.length, prospectBefore);
  assert.equal(events.filter((e) => e.event === "eddm_qr_landed").length, qrEventsBefore);
  // Preparation link is ordinary; test session survives opening printed card address.
  await page.goto(`${SITE}/?qrtest=1`, { waitUntil: "domcontentloaded" });
  await page.getByRole("status", { name: "QR verification mode" }).waitFor();
  await until(() => requests.length === prospectBefore + 1, "ordinary verification receipt");
  assert.equal(db.records.get(VERIFICATION_COUNTER).qrOpenings, undefined);
  await page.goto(`${SITE}/?${PRINTED}`, { waitUntil: "domcontentloaded" });
  await page.getByRole("status", { name: "QR verification mode" }).waitFor();
  await until(() => events.some((e) => e.event === "eddm_qr_landed" && e.properties.qr_verification === true), "phone verification QR event");
  const testEvent = events.find((e) => e.event === "eddm_qr_landed" && e.properties.qr_verification === true);
  assert.equal(testEvent.properties.self_test, true);
  assert.equal(testEvent.properties.qr_first_browser, true);
  assert.equal(db.records.get(EXACT_COUNTER).qrOpenings, 3);
  assert.equal(db.records.get(VERIFICATION_COUNTER).qrOpenings, 1);
  const notice = page.getByRole("status", { name: "QR verification mode" });
  const noticeBox = await notice.boundingBox(); const buttonBox = await notice.getByRole("button", { name: "Exit test" }).boundingBox();
  assert.ok(noticeBox.x >= 0 && noticeBox.x + noticeBox.width <= 375);
  assert.ok(buttonBox.height >= 44);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
  await page.screenshot({ path: ".superpowers/sdd/05-66-plan/qr-verification-mobile.png", fullPage: false });
  await notice.getByRole("button", { name: "Exit test" }).click();
  await until(async () => await notice.count() === 0, "exit notice");
  assert.equal((await ctx.cookies()).some((c) => c.name === "yapt_qr_verification"), false);
  await page.goto(`${SITE}/?qrtest=1`, { waitUntil: "domcontentloaded" }); await notice.waitFor();
  await page.goto(`${SITE}/?qrtest=0`, { waitUntil: "domcontentloaded" });
  await page.getByRole("heading", { level: 1 }).waitFor(); assert.equal(await notice.count(), 0);
  // True automation remains excluded even when a test marker is present.
  const robot = await context({ human: false }); const robotPage = await robot.newPage(); const beforeRobot = requests.length;
  await robotPage.goto(`${SITE}/?${PRINTED}&qrtest=1`, { waitUntil: "domcontentloaded" });
  await robotPage.getByRole("status", { name: "QR verification mode" }).waitFor(); await robotPage.waitForTimeout(400);
  assert.equal(requests.length, beforeRobot); await robot.close();
  const blues = await context({ host: "onepercentblues.com" }); const bluesPage = await blues.newPage(); const beforeBlues = requests.length;
  await bluesPage.goto(`https://onepercentblues.com/?${PRINTED}`, { waitUntil: "domcontentloaded" });
  await bluesPage.getByRole("heading", { level: 1 }).waitFor(); await bluesPage.waitForTimeout(400);
  assert.equal(requests.length, beforeBlues); await blues.close();
  assert.deepEqual(errors, [], "no browser execution errors");
  if (consoleErrors.length) console.error(JSON.stringify({ consoleErrors, responseFailures }));
  assert.deepEqual(consoleErrors, [], "no browser console errors");
  console.log("05-66 browser measurement passed: QR/reopen/rerender, ordinary/old-new shares, duplicate parameters, attribution cleanup/handoff, full UTMs, owner/automation/Blues exclusions, separate phone verification and accessible 375px exit notice. Local intercepted routes only; no live writes.");
} finally {
  await browser?.close();
  if (nextProcess?.pid && nextProcess.exitCode === null) {
    if (process.platform === "win32") execFileSync("taskkill", ["/pid", String(nextProcess.pid), "/T", "/F"], { stdio: "ignore", windowsHide: true });
    else nextProcess.kill("SIGTERM");
  }
}
