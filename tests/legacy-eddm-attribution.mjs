import assert from "node:assert/strict";
import { createServer } from "node:net";
import { execFileSync, spawn } from "node:child_process";
import { chromium } from "playwright";
import { gunzipSync } from "node:zlib";

const LEGACY_MAILER_QUERY = "portfolio=1000000&years=20&growth=8&fee=1";
const TAGGED_LEGACY_MAILER_QUERY = `${LEGACY_MAILER_QUERY}&variant=direct-mail&utm_source=eddm&utm_medium=print&utm_campaign=launch_5k&utm_content=qr_code`;

async function getUnusedPort() {
  const server = createServer();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const { port } = server.address();
  await new Promise((resolve) => server.close(resolve));
  return port;
}

async function waitForPage(url, child) {
  let lastError;
  for (let attempt = 0; attempt < 180; attempt += 1) {
    if (child && child.exitCode !== null) {
      throw new Error(`next dev exited early with code ${child.exitCode}`);
    }
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(
    `Timed out waiting for ${url}: ${lastError?.message ?? "no response"}`,
  );
}

function decodePostHogEvents(rawBody) {
  if (!rawBody) return [];

  let bodyBuffer = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(rawBody);
  if (bodyBuffer[0] === 0x1f && bodyBuffer[1] === 0x8b) {
    bodyBuffer = gunzipSync(bodyBuffer);
  }
  const bodyText = bodyBuffer.toString("utf8");

  const candidates = [];
  try {
    candidates.push(JSON.parse(bodyText));
  } catch {
    const form = new URLSearchParams(bodyText);
    const encoded = form.get("data");
    if (encoded) {
      try {
        candidates.push(
          JSON.parse(Buffer.from(encoded, "base64").toString("utf8")),
        );
      } catch {
        return [];
      }
    }
  }

  return candidates.flatMap((candidate) => {
    if (candidate?.event) return [candidate];
    if (Array.isArray(candidate?.batch)) return candidate.batch;
    if (typeof candidate?.data === "string") {
      try {
        const decoded = JSON.parse(
          Buffer.from(candidate.data, "base64").toString("utf8"),
        );
        if (decoded?.event) return [decoded];
        if (Array.isArray(decoded?.batch)) return decoded.batch;
      } catch {
        return [];
      }
    }
    return [];
  });
}

async function waitForCapturedEvent(
  capturedEvents,
  eventName,
  predicate = () => true,
) {
  for (let attempt = 0; attempt < 900; attempt += 1) {
    const event = capturedEvents.find(
      (candidate) => candidate.event === eventName && predicate(candidate),
    );
    if (event) return event;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Timed out waiting for PostHog event: ${eventName}`);
}

async function waitForCondition(predicate, description) {
  for (let attempt = 0; attempt < 900; attempt += 1) {
    if (predicate()) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Timed out waiting for ${description}`);
}

async function stubPostHogRoutes(context, capturedEvents = []) {
  await context.route("https://us-assets.i.posthog.com/**", async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.includes("/config")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          config: {},
          supportedCompression: ["base64"],
        }),
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/javascript",
      body: "/* optional PostHog extension disabled in test */",
    });
  });
  await context.route("https://us.i.posthog.com/**", async (route) => {
    const decodedEvents = decodePostHogEvents(route.request().postDataBuffer());
    capturedEvents.push(...decodedEvents);
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: '{"status":1}',
    });
  });
}

async function stubMailerScanRoute(
  context,
  baseUrl,
  { scanReceipts, trafficReceipts },
) {
  await context.route(`${baseUrl}/api/analytics/mailer-scans`, async (route) => {
    const body = JSON.parse(route.request().postData() ?? "{}");
    if (body.kind === "visit") {
      trafficReceipts.push(body);
    } else {
      scanReceipts.push(body);
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: '{"counted":true}',
    });
  });
}

function assertLegacyAttribution(event) {
  assert.equal(event.properties.utm_source, "eddm");
  assert.equal(event.properties.utm_medium, "print");
  assert.equal(event.properties.utm_campaign, "launch_5k");
  assert.equal(event.properties.utm_content, "qr_code");
  assert.equal(event.properties.is_eddm_visitor, true);
  assert.equal(event.properties.legacy_eddm_qr, true);
  assert.equal(
    event.properties.campaign_attribution_method,
    "legacy_qr_signature",
  );
}

async function readCalculatorPosition(page) {
  return page.evaluate(() => {
    const calculator = document.getElementById("calculator");
    return {
      scrollY: window.scrollY,
      calculatorTop: calculator?.getBoundingClientRect().top ?? null,
    };
  });
}

let nextProcess;
let browser;

try {
  const externalBaseUrl = process.env.EDDM_TEST_BASE_URL;
  const port = externalBaseUrl ? null : await getUnusedPort();
  const baseUrl = externalBaseUrl ?? `http://127.0.0.1:${port}`;
  const mailerUrl = `${baseUrl}/?${LEGACY_MAILER_QUERY}`;
  if (!externalBaseUrl) {
    nextProcess = spawn(
      process.execPath,
      [
        "node_modules/next/dist/bin/next",
        "dev",
        "--webpack",
        "--hostname",
        "127.0.0.1",
        "--port",
        String(port),
      ],
      {
        cwd: process.cwd(),
        env: {
          ...process.env,
          NEXT_PUBLIC_POSTHOG_KEY: "phc_local_eddm_test",
          NEXT_PUBLIC_POSTHOG_HOST: "https://us.i.posthog.com",
          NEXT_PUBLIC_POSTHOG_TEST_MODE: "true",
        },
        stdio: "ignore",
        windowsHide: true,
      },
    );
  }
  await waitForPage(mailerUrl, nextProcess);

  const calculatorApi = await fetch(`${baseUrl}/api/calculator`);
  const calculatorPayload = await calculatorApi.json();
  assert.equal(
    calculatorPayload.links.canonicalEddmQrUrl,
    "https://youarepayingtoomuch.com/",
    "the canonical QR destination must be the clean site root",
  );

  const agentInfo = await fetch(`${baseUrl}/agent-info.json`).then((response) =>
    response.json(),
  );
  assert.equal(
    agentInfo.campaigns.eddmLaunchQr.url,
    "https://youarepayingtoomuch.com/",
    "agent-readable campaign metadata must publish the clean site root",
  );
  assert.equal(
    agentInfo.campaigns.eddmLaunchQr.cleanRootAttribution
      .campaign_attribution_method,
    "clean_root_launch",
  );

  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent:
      "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 " +
      "(KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36",
  });
  const capturedEvents = [];
  const scanReceipts = [];
  const trafficReceipts = [];
  await context.route("https://us-assets.i.posthog.com/**", async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.includes("/config")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          config: {},
          supportedCompression: ["base64"],
        }),
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/javascript",
      body: "/* optional PostHog extension disabled in test */",
    });
  });
  await context.route("https://us.i.posthog.com/**", async (route) => {
    const request = route.request();
    const rawBody = request.postDataBuffer();
    const decodedEvents = decodePostHogEvents(rawBody);
    if (decodedEvents.length === 0 && rawBody) {
      console.error(
        "Unrecognized PostHog payload",
        JSON.stringify({
          url: request.url(),
          contentType: request.headers()["content-type"],
          contentEncoding: request.headers()["content-encoding"],
          length: rawBody.length,
          prefixHex: rawBody.subarray(0, 48).toString("hex"),
          prefixText: rawBody.subarray(0, 160).toString("utf8"),
        }),
      );
    }
    capturedEvents.push(...decodedEvents);
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: '{"status":1}',
    });
  });
  await context.route(
    `${baseUrl}/api/analytics/mailer-scans`,
    async (route) => {
      const request = route.request();
      const body = JSON.parse(request.postData() ?? "{}");
      if (body.kind === "visit") {
        trafficReceipts.push(body);
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: '{"counted":true}',
        });
        return;
      }
      scanReceipts.push(body);
      await route.fulfill({
        status: scanReceipts.length === 1 ? 503 : 200,
        contentType: "application/json",
        body:
          scanReceipts.length === 1
            ? '{"error":"temporary test failure"}'
            : '{"counted":true}',
      });
    },
  );

  const page = await context.newPage();
  await page.goto(mailerUrl, { waitUntil: "domcontentloaded" });
  await page.getByRole("heading", { level: 1 }).waitFor();

  const pageview = await waitForCapturedEvent(capturedEvents, "$pageview");
  assertLegacyAttribution(pageview);
  assert.equal(
    pageview.properties.$lib,
    "web",
    "custom events must use the initialized PostHog browser client",
  );
  assert.equal(pageview.properties.$current_url, `${baseUrl}/`);

  const qrLanding = await waitForCapturedEvent(
    capturedEvents,
    "eddm_qr_landed",
  );
  assertLegacyAttribution(qrLanding);
  assert.equal(qrLanding.properties.scan_kind, "mailer_qr_landing");
  assert.equal(qrLanding.properties.$current_url, `${baseUrl}/`);
  await waitForCondition(
    () => trafficReceipts.length === 1,
    "the first privacy-safe traffic receipt",
  );
  assert.deepEqual(trafficReceipts[0], { kind: "visit" });
  await waitForCondition(
    () => scanReceipts.length === 1,
    "the first aggregate receipt attempt",
  );
  assert.deepEqual(scanReceipts[0], {
    attributionMethod: "legacy_qr_signature",
  });
  assert.equal(
    await page.evaluate(() =>
      window.sessionStorage.getItem("sww_eddm_qr_landed_receipt_recorded"),
    ),
    null,
    "a failed aggregate receipt must stay unmarked",
  );

  await page.goto(mailerUrl, { waitUntil: "domcontentloaded" });
  await page.getByRole("heading", { level: 1 }).waitFor();
  await waitForCondition(
    () => scanReceipts.length === 2,
    "the unmarked aggregate receipt to retry after reload",
  );
  assert.deepEqual(scanReceipts[1], {
    attributionMethod: "legacy_qr_signature",
  });
  assert.equal(
    trafficReceipts.length,
    1,
    "a reload in the same tab session must not duplicate the traffic visit",
  );
  assert.equal(
    capturedEvents.filter((event) => event.event === "eddm_qr_landed").length,
    1,
    "a receipt retry after reload must not duplicate the PostHog scan event",
  );

  await page.waitForFunction(() => window.location.search === "", undefined, {
    timeout: 90_000,
  });
  assert.equal(
    new URL(page.url()).search,
    "",
    "the visible URL should still be cleaned after attribution is captured",
  );
  await page.waitForTimeout(800);
  const legacyLanding = await readCalculatorPosition(page);
  assert.ok(
    legacyLanding.scrollY < 50 &&
      legacyLanding.calculatorTop !== null &&
      legacyLanding.calculatorTop > 160,
    `legacy printer QR should remain at the page top: ${JSON.stringify(legacyLanding)}`,
  );

  const retainedCta = page.locator(
    'a[data-posthog-cta-location="home_post_calculator_primary"]',
  );
  assert.equal(
    await retainedCta.count(),
    1,
    "the homepage must retain one primary CTA",
  );
  assert.equal(
    await retainedCta.getAttribute("href"),
    "https://smarterwaywealth.com/onboarding/verify",
  );
  await retainedCta.evaluate((link) => {
    link.addEventListener("click", (event) => event.preventDefault(), {
      once: true,
    });
    link.click();
  });

  const ctaEvent = await waitForCapturedEvent(capturedEvents, "cta_clicked");
  assertLegacyAttribution(ctaEvent);

  const advancedHandoff = page.locator(
    'a[data-posthog-cta-location="home_firm_visit_card_calculator"]',
  );
  assert.equal(
    await advancedHandoff.getAttribute("href"),
    "https://smarterwaywealth.com/save",
    "the rendered advanced-calculator handoff must not expose calculator state",
  );
  await advancedHandoff.evaluate((link) => {
    const contaminatedHref = new URL(link.href);
    for (const [key, value] of Object.entries({
      portfolio: "2500000",
      years: "30",
      growth: "9",
      fee: "1.25",
      flat: "1200",
      mfe: "0.2",
      variant: "direct-mail",
      distinct_id: "must-not-cross",
      session_id: "must-not-cross",
      unknown_future_key: "must-not-cross",
      utm_source: "must-be-overridden-by-persisted-attribution",
    })) {
      contaminatedHref.searchParams.set(key, value);
    }
    link.href = contaminatedHref.toString();
    link.addEventListener("click", (event) => event.preventDefault(), {
      once: true,
    });
    link.click();
  });

  const attributedAdvancedHref = new URL(
    await advancedHandoff.getAttribute("href"),
  );
  assert.equal(attributedAdvancedHref.origin, "https://smarterwaywealth.com");
  assert.equal(attributedAdvancedHref.pathname, "/save");
  assert.deepEqual(
    [...attributedAdvancedHref.searchParams.keys()].sort(),
    ["utm_campaign", "utm_content", "utm_medium", "utm_source"],
    "the advanced handoff query must contain standard campaign UTM fields only",
  );
  assert.equal(attributedAdvancedHref.searchParams.get("utm_source"), "eddm");
  assert.equal(attributedAdvancedHref.searchParams.get("utm_medium"), "print");
  assert.equal(
    attributedAdvancedHref.searchParams.get("utm_campaign"),
    "launch_5k",
  );
  assert.equal(
    attributedAdvancedHref.searchParams.get("utm_content"),
    "qr_code",
  );

  const advancedHandoffEvent = await waitForCapturedEvent(
    capturedEvents,
    "cta_clicked",
    (event) =>
      event.properties?.cta_location === "home_firm_visit_card_calculator",
  );
  assertLegacyAttribution(advancedHandoffEvent);
  assert.equal(
    advancedHandoffEvent.properties.cta_href,
    attributedAdvancedHref.toString(),
  );

  const firmHandoff = page.locator(
    'a[data-posthog-cta-location="home_firm_visit_card"]',
  );
  assert.equal(
    await firmHandoff.getAttribute("href"),
    "https://smarterwaywealth.com/",
    "the rendered handoff should remain clean before a campaign visitor clicks",
  );
  await firmHandoff.evaluate((link) => {
    link.addEventListener("click", (event) => event.preventDefault(), {
      once: true,
    });
    link.click();
  });

  const attributedHandoffHref = new URL(await firmHandoff.getAttribute("href"));
  assert.equal(attributedHandoffHref.origin, "https://smarterwaywealth.com");
  assert.equal(attributedHandoffHref.searchParams.get("utm_source"), "eddm");
  assert.equal(attributedHandoffHref.searchParams.get("utm_medium"), "print");
  assert.equal(
    attributedHandoffHref.searchParams.get("utm_campaign"),
    "launch_5k",
  );
  assert.equal(
    attributedHandoffHref.searchParams.get("utm_content"),
    "qr_code",
  );
  for (const forbiddenKey of [
    "portfolio",
    "years",
    "growth",
    "fee",
    "flat",
    "mfe",
    "variant",
    "distinct_id",
    "session_id",
  ]) {
    assert.equal(
      attributedHandoffHref.searchParams.has(forbiddenKey),
      false,
      `firm handoff must not carry ${forbiddenKey}`,
    );
  }

  const firmHandoffEvent = await waitForCapturedEvent(
    capturedEvents,
    "cta_clicked",
    (event) => event.properties?.cta_location === "home_firm_visit_card",
  );
  assertLegacyAttribution(firmHandoffEvent);
  assert.equal(
    firmHandoffEvent.properties.cta_href,
    attributedHandoffHref.toString(),
  );

  await page.goto(`${baseUrl}/?${TAGGED_LEGACY_MAILER_QUERY}`, {
    waitUntil: "domcontentloaded",
  });
  await page.locator("#calculator").waitFor();
  await page.waitForFunction(
    () =>
      JSON.parse(
        window.sessionStorage.getItem("sww_campaign_attribution") ?? "null",
      )?.campaign_attribution_method === "explicit_utm",
  );
  await page.waitForTimeout(800);
  const taggedLegacyLanding = await readCalculatorPosition(page);
  assert.ok(
    taggedLegacyLanding.scrollY < 50 &&
      taggedLegacyLanding.calculatorTop !== null &&
      taggedLegacyLanding.calculatorTop > 160,
    `tagged legacy EDDM QR should remain at the page top: ${JSON.stringify(taggedLegacyLanding)}`,
  );

  const unrelatedPage = await context.newPage();
  await unrelatedPage.goto(
    `${baseUrl}/?${LEGACY_MAILER_QUERY}&utm_source=google`,
    { waitUntil: "domcontentloaded" },
  );
  await unrelatedPage.locator("#calculator").waitFor();
  await unrelatedPage.waitForFunction(
    () => window.sessionStorage.getItem("sww_campaign_attribution") !== null,
  );
  assert.equal(
    await unrelatedPage.evaluate(() =>
      window.sessionStorage.getItem("sww_eddm_qr_landed_reported"),
    ),
    null,
    "partial EDDM UTM traffic must not create a mailer scan event",
  );
  await unrelatedPage.waitForTimeout(800);
  const unrelatedLanding = await readCalculatorPosition(unrelatedPage);
  assert.ok(
    unrelatedLanding.scrollY < 50 &&
      unrelatedLanding.calculatorTop !== null &&
      unrelatedLanding.calculatorTop > 160,
    `foreign explicit UTM traffic must keep the normal top-of-page landing: ${JSON.stringify(unrelatedLanding)}`,
  );
  await unrelatedPage.close();

  const directStartPage = await context.newPage();
  await directStartPage.goto(mailerUrl, { waitUntil: "domcontentloaded" });
  await directStartPage.locator("#calculator").waitFor();
  await directStartPage.waitForTimeout(800);
  const directStartLanding = await readCalculatorPosition(directStartPage);
  assert.ok(
    directStartLanding.scrollY < 50 &&
      directStartLanding.calculatorTop !== null &&
      directStartLanding.calculatorTop > 160,
    `the legacy EDDM direct-start journey must begin at the page top: ${JSON.stringify(directStartLanding)}`,
  );
  const directStartCta = directStartPage.locator(
    'a[data-posthog-cta-location="home_post_calculator_primary"]',
  );
  assert.equal(
    await directStartCta.getAttribute("href"),
    "https://smarterwaywealth.com/onboarding/verify",
    "the EDDM direct-start journey must enter Smarter Way Wealth secure onboarding",
  );
  await directStartPage.close();

  const cleanRootEvents = [];
  const cleanRootScans = [];
  const cleanRootVisits = [];
  const cleanRootContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent:
      "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 " +
      "(KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36",
  });
  await stubPostHogRoutes(cleanRootContext, cleanRootEvents);
  await stubMailerScanRoute(cleanRootContext, baseUrl, {
    scanReceipts: cleanRootScans,
    trafficReceipts: cleanRootVisits,
  });
  const cleanRootPage = await cleanRootContext.newPage();
  await cleanRootPage.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
  await cleanRootPage.getByRole("heading", { level: 1 }).waitFor();
  await waitForCondition(
    () => cleanRootVisits.length === 1,
    "a clean-root launch visit receipt",
  );
  await waitForCondition(
    () => cleanRootScans.length === 1,
    "a clean-root launch mailer-scan receipt",
  );
  assert.deepEqual(cleanRootScans[0], {
    attributionMethod: "clean_root_launch",
  });
  await waitForCapturedEvent(cleanRootEvents, "eddm_qr_landed");
  await cleanRootContext.close();

  const selfTestScans = [];
  const selfTestVisits = [];
  const selfTestContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent:
      "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 " +
      "(KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36",
  });
  await stubPostHogRoutes(selfTestContext);
  await stubMailerScanRoute(selfTestContext, baseUrl, {
    scanReceipts: selfTestScans,
    trafficReceipts: selfTestVisits,
  });
  const selfTestPage = await selfTestContext.newPage();
  await selfTestPage.goto(`${baseUrl}/?selftest=1`, {
    waitUntil: "domcontentloaded",
  });
  await selfTestPage.getByRole("heading", { level: 1 }).waitFor();
  await selfTestPage.waitForFunction(
    () => window.localStorage.getItem("sww_self_test") === "true",
  );
  await selfTestPage.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
  await selfTestPage.getByRole("heading", { level: 1 }).waitFor();
  await selfTestPage.waitForTimeout(2000);
  assert.equal(
    selfTestVisits.length,
    0,
    "self-test traffic must not increment the public visit total",
  );
  assert.equal(
    selfTestScans.length,
    0,
    "self-test traffic must not increment the public mailer-scan total",
  );
  await selfTestContext.close();

  console.log(
    "The canonical QR destination is the clean root and now counts as a launch_5k mailer scan; legacy QR URLs and foreign explicit UTM traffic stay at the page top; self-test traffic is omitted from public totals; the legacy EDDM direct-start journey points to Smarter Way Wealth secure onboarding; attribution survives URL cleanup; every firm handoff enforces a UTM-only query, including the advanced-calculator path.",
  );
} finally {
  await browser?.close();
  if (nextProcess?.pid && nextProcess.exitCode === null) {
    if (process.platform === "win32") {
      execFileSync("taskkill", ["/pid", String(nextProcess.pid), "/T", "/F"], {
        stdio: "ignore",
      });
    } else {
      nextProcess.kill("SIGTERM");
    }
  }
}
