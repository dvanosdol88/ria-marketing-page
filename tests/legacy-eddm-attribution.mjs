import assert from "node:assert/strict";
import { createServer } from "node:net";
import { execFileSync, spawn } from "node:child_process";
import { chromium } from "playwright";

const LEGACY_MAILER_QUERY =
  "portfolio=1000000&years=20&growth=8&fee=1";
const TAGGED_LEGACY_MAILER_QUERY =
  `${LEGACY_MAILER_QUERY}&variant=direct-mail&utm_source=eddm&utm_medium=print&utm_campaign=launch_5k&utm_content=qr_code`;

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
  for (let attempt = 0; attempt < 90; attempt += 1) {
    if (child.exitCode !== null) {
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

async function waitForCapturedEvent(
  capturedEvents,
  eventName,
  predicate = () => true,
) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const event = capturedEvents.find(
      (candidate) => candidate.event === eventName && predicate(candidate),
    );
    if (event) return event;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Timed out waiting for PostHog event: ${eventName}`);
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
  const port = await getUnusedPort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const mailerUrl = `${baseUrl}/?${LEGACY_MAILER_QUERY}`;
  nextProcess = spawn(
    process.execPath,
    [
      "node_modules/next/dist/bin/next",
      "dev",
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
      },
      stdio: "ignore",
      windowsHide: true,
    },
  );
  await waitForPage(mailerUrl, nextProcess);

  const calculatorApi = await fetch(`${baseUrl}/api/calculator`);
  const calculatorPayload = await calculatorApi.json();
  assert.equal(
    calculatorPayload.links.canonicalEddmQrUrl,
    "https://youarepayingtoomuch.com/",
    "the canonical QR destination must be the clean site root",
  );

  const agentInfo = await fetch(`${baseUrl}/agent-info.json`).then((response) => response.json());
  assert.equal(
    agentInfo.campaigns.eddmLaunchQr.url,
    "https://youarepayingtoomuch.com/",
    "agent-readable campaign metadata must publish the clean site root",
  );

  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const capturedEvents = [];
  await context.route("https://us.i.posthog.com/**", async (route) => {
    const request = route.request();
    if (request.url().endsWith("/capture/") && request.postData()) {
      capturedEvents.push(JSON.parse(request.postData()));
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: '{"status":1}',
    });
  });

  const page = await context.newPage();
  await page.goto(mailerUrl, { waitUntil: "domcontentloaded" });
  await page.getByRole("heading", { level: 1 }).waitFor();

  const pageview = await waitForCapturedEvent(capturedEvents, "$pageview");
  assertLegacyAttribution(pageview);
  assert.match(
    pageview.properties.$current_url,
    new RegExp(`\\?${LEGACY_MAILER_QUERY.replaceAll("?", "\\?")}`),
  );

  await page.waitForFunction(() => window.location.search === "");
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
  assert.equal(await retainedCta.count(), 1, "the homepage must retain one primary CTA");
  assert.equal(await retainedCta.getAttribute("href"), "/become-a-client");
  await retainedCta.evaluate((link) => {
    link.addEventListener("click", (event) => event.preventDefault(), { once: true });
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
    link.addEventListener("click", (event) => event.preventDefault(), { once: true });
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
  assert.equal(attributedAdvancedHref.searchParams.get("utm_campaign"), "launch_5k");
  assert.equal(attributedAdvancedHref.searchParams.get("utm_content"), "qr_code");

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
    link.addEventListener("click", (event) => event.preventDefault(), { once: true });
    link.click();
  });

  const attributedHandoffHref = new URL(await firmHandoff.getAttribute("href"));
  assert.equal(attributedHandoffHref.origin, "https://smarterwaywealth.com");
  assert.equal(attributedHandoffHref.searchParams.get("utm_source"), "eddm");
  assert.equal(attributedHandoffHref.searchParams.get("utm_medium"), "print");
  assert.equal(attributedHandoffHref.searchParams.get("utm_campaign"), "launch_5k");
  assert.equal(attributedHandoffHref.searchParams.get("utm_content"), "qr_code");
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
  assert.equal(firmHandoffEvent.properties.cta_href, attributedHandoffHref.toString());

  await page.goto(`${baseUrl}/?${TAGGED_LEGACY_MAILER_QUERY}`, {
    waitUntil: "domcontentloaded",
  });
  await page.locator("#calculator").waitFor();
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
  assert.equal(await directStartCta.getAttribute("href"), "/become-a-client");
  await directStartCta.click();
  await directStartPage.waitForURL(`${baseUrl}/become-a-client`);
  await directStartPage.getByRole("heading", {
    level: 1,
    name: "Direct onboarding is temporarily paused.",
  }).waitFor();
  assert.equal(
    await directStartPage.locator("main form, main input, main select, main textarea").count(),
    0,
    "the EDDM direct-start journey must collect no personal information while paused",
  );
  const pausedApiResponse = await directStartPage.request.post(
    `${baseUrl}/api/become-a-client`,
    { data: { sentinel: "THIS_EDDM_REQUEST_MUST_NOT_BE_READ_OR_SAVED" } },
  );
  assert.equal(pausedApiResponse.status(), 410);
  assert.deepEqual(await pausedApiResponse.json(), {
    error:
      "Secure direct onboarding is temporarily unavailable. No information was saved.",
  });
  await directStartPage.close();

  console.log(
    "The canonical QR destination is the clean root; legacy QR URLs and foreign explicit UTM traffic stay at the page top; the legacy EDDM direct-start journey reaches the no-collection pause and 410 API; attribution survives URL cleanup; every firm handoff enforces a UTM-only query, including the advanced-calculator path.",
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
