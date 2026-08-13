import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createServer } from "node:net";
import { execFileSync, spawn } from "node:child_process";
import { chromium } from "playwright";

// Privacy lock (review fix round, docs/plans/2026-08-12-calculator-canon.md
// in the sister repo, Phase B1): ShareMyResults.tsx's "Email results" anchor
// is a canon file (byte-identical with the sister repo) and is NOT modified
// here — its mailto href legitimately carries the visitor's scenario
// (dollar figures, the personalized share URL) inside the subject/body
// query. The redaction belongs in THIS repo's own PostHogCtaTracker.tsx
// (site-specific, not canon-registered), mirroring the sister repo's
// PostHogCtaTracker.js's isMailto branch exactly.

const readSource = (relativePath) =>
  readFile(new URL(relativePath, import.meta.url), "utf8");

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
  throw new Error(`Timed out waiting for ${url}: ${lastError?.message ?? "no response"}`);
}

async function waitForCapturedEvent(capturedEvents, predicate, label) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const event = capturedEvents.find(predicate);
    if (event) return event;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Timed out waiting for PostHog event: ${label}`);
}

// Source lock: the isMailto branch must gate cta_href/cta_host/cta_path
// construction — mirrors the sister repo's
// tests/posthog-cta-tracker-mailto.test.mjs "source lock" assertion.
const trackerSource = await readSource("../src/components/PostHogCtaTracker.tsx");
assert.match(
  trackerSource,
  /const isMailto = url\.protocol === ["']mailto:["'];/,
  "expected the mailto special-case to gate cta_href/cta_host/cta_path construction",
);
assert.match(
  trackerSource,
  /cta_href: isMailto\s*\?\s*["']mailto:["']/,
  "expected cta_href to collapse to the bare mailto scheme for mailto anchors",
);
console.log("source lock: PostHogCtaTracker.tsx redacts mailto hrefs at the property-construction level — OK");

let nextProcess;
let browser;

try {
  const port = await getUnusedPort();
  const baseUrl = `http://127.0.0.1:${port}`;
  // Deliberately the bare homepage, no query string: the page's own
  // history.replaceState logic strips the calculator params back off the
  // address bar whenever the state matches DEFAULT_STATE, so $current_url
  // (a pre-existing, unrelated property every PostHog event carries —
  // constructed in src/lib/posthog.ts, not by PostHogCtaTracker.tsx) stays
  // clean here. That keeps this test scoped to what the tracker itself
  // controls (cta_href/cta_host/cta_path) rather than also asserting on the
  // visitor's own browsable page URL, which is not a secret and is not
  // what this fix is about. DEFAULT_STATE (portfolio $1,000,000, 20 years,
  // 8% growth, 1% fee) still produces a real, multi-thousand-dollar
  // fee-comparison mailto body — a meaningful scenario to redact.
  const scenarioUrl = `${baseUrl}/`;

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
        NEXT_PUBLIC_POSTHOG_KEY: "phc_local_mailto_test",
        NEXT_PUBLIC_POSTHOG_HOST: "https://us.i.posthog.com",
      },
      stdio: "ignore",
      windowsHide: true,
    },
  );
  await waitForPage(`${baseUrl}/`, nextProcess);

  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 1400 } });
  const capturedEvents = [];
  await context.route("https://us.i.posthog.com/**", async (route) => {
    const request = route.request();
    if (request.url().endsWith("/capture/") && request.postData()) {
      capturedEvents.push(JSON.parse(request.postData()));
    }
    await route.fulfill({ status: 200, contentType: "application/json", body: '{"status":1}' });
  });

  const page = await context.newPage();
  await page.goto(scenarioUrl, { waitUntil: "networkidle" });

  const shareHeading = page.locator("#home-share-results-heading");
  await shareHeading.scrollIntoViewIfNeeded();
  await page.locator('button[aria-controls="share-my-results-panel"]').click();
  await page.locator("#share-my-results-panel").waitFor({ state: "visible" });

  const emailAnchor = page.locator('a[data-posthog-cta-label="Email results"]');
  await emailAnchor.waitFor({ state: "visible" });
  const mailtoHref = await emailAnchor.getAttribute("href");
  assert.match(mailtoHref, /^mailto:\?subject=/, "sanity check: the anchor really is the mailto CTA");
  assert.match(
    decodeURIComponent(mailtoHref),
    /\$[\d,]{4,}/,
    "sanity check: the mailto href itself DOES carry a dollar figure (proving the redaction, not an empty scenario, is what protects analytics)",
  );

  // Prevent the OS mail client from actually opening on click.
  await emailAnchor.evaluate((link) => {
    link.addEventListener("click", (event) => event.preventDefault(), { once: true });
  });
  await emailAnchor.click();

  const ctaEvent = await waitForCapturedEvent(
    capturedEvents,
    (event) => event.event === "cta_clicked" && event.properties?.cta_label === "Email results",
    "cta_clicked (Email results)",
  );

  assert.equal(ctaEvent.properties.cta_href, "mailto:", "cta_href must be exactly the redacted mailto scheme");
  assert.equal(ctaEvent.properties.cta_host, "");
  assert.equal(ctaEvent.properties.cta_path, "");

  const serialized = JSON.stringify(ctaEvent);
  assert.doesNotMatch(serialized, /\$[\d,]{4,}/, "no dollar figure anywhere in the captured payload");
  assert.doesNotMatch(serialized, /1,?000,?000/, "no default portfolio value in the captured payload");
  assert.doesNotMatch(serialized, /subject=|body=/i, "no encoded mailto query keys in the captured payload");
  assert.doesNotMatch(serialized, /portfolio=|years=|growth=|fee=|flat=/i, "no raw assumption param names in the captured payload");

  console.log(
    "Behavioral: the Email-results mailto CTA ships a fully redacted cta_href/cta_host/cta_path on cta_clicked, with no scenario figures anywhere in the captured payload.",
  );
} finally {
  await browser?.close();
  if (nextProcess?.pid && nextProcess.exitCode === null) {
    if (process.platform === "win32") {
      execFileSync("taskkill", ["/pid", String(nextProcess.pid), "/T", "/F"], { stdio: "ignore" });
    } else {
      nextProcess.kill("SIGTERM");
    }
  }
}
