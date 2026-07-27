import assert from "node:assert/strict";
import { createServer } from "node:net";
import { execFileSync, spawn } from "node:child_process";
import { chromium } from "playwright";

const LEGACY_MAILER_QUERY =
  "portfolio=1000000&years=20&growth=8&fee=1";

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

async function waitForCapturedEvent(capturedEvents, eventName) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const event = capturedEvents.find((candidate) => candidate.event === eventName);
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

  await page.evaluate(() => {
    const link = document.querySelector(
      'a[href^="https://smarterwaywealth.com"]',
    );
    if (!(link instanceof HTMLAnchorElement)) {
      throw new Error("Smarter Way Wealth CTA not found");
    }
    link.addEventListener("click", (event) => event.preventDefault(), {
      once: true,
    });
    link.click();
  });

  const ctaEvent = await waitForCapturedEvent(capturedEvents, "cta_clicked");
  assertLegacyAttribution(ctaEvent);

  console.log(
    "Legacy EDDM printer-proof URL is attributed on pageview and remains attributed after URL cleanup.",
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
