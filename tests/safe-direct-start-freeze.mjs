import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync, spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createServer } from "node:net";
import { chromium } from "playwright";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readSource = (relativePath) =>
  fs.readFileSync(path.join(root, relativePath), "utf8");

const pageSource = readSource("src/app/become-a-client/page.tsx");
const apiSource = readSource("src/app/api/become-a-client/route.ts");
const signupConfigSource = readSource("src/config/signupCta.ts");
const navSource = readSource("src/components/SiteNav.tsx");
const sharedCtaSource = readSource("src/components/SignupCta.tsx");
const fitCtaSource = readSource("src/config/fitCtaConfig.ts");
const llmsSource = readSource("public/llms.txt");
const sitemapSource = readSource("public/sitemap.xml");
const analyticsContract = JSON.parse(
  readSource("docs/analytics-event-contract.json"),
);
const dashboardSource = readSource("docs/posthog-two-site-dashboard.md");

const PAUSED_CTA_NAME = "Direct onboarding paused";
const PAUSED_CTA_SHORT_NAME = "Start paused";
const OPTIONAL_MEETING_NAME = "Meet David for 15 minutes";
const OPTIONAL_MEETING_HREF = "https://smarterwaywealth.com/meet";
const HOW_IT_WORKS_HREF = "https://smarterwaywealth.com/how";
const PAUSE_DISCLOSURE =
  "Direct onboarding is temporarily paused. No onboarding form accepts personal or financial information at this step; standard site analytics may still record page and CTA activity.";
const COMPLIANCE_DISCLOSURE =
  "Personalized investment advice begins only after becoming a client.";
const NO_SAVE_BODY =
  '{"error":"Secure direct onboarding is temporarily unavailable. No information was saved."}';
const screenshotOutputDir = process.env.SAFE_DIRECT_START_SCREENSHOT_DIR
  ? path.resolve(root, process.env.SAFE_DIRECT_START_SCREENSHOT_DIR)
  : null;

function parseRgb(value) {
  const channels = value.match(/[\d.]+/g)?.slice(0, 3).map(Number);
  assert.equal(channels?.length, 3, `expected an RGB color, received ${value}`);
  return channels;
}

function relativeLuminance(value) {
  const channels = parseRgb(value).map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrastRatio(foreground, background) {
  const foregroundLuminance = relativeLuminance(foreground);
  const backgroundLuminance = relativeLuminance(background);
  return (
    (Math.max(foregroundLuminance, backgroundLuminance) + 0.05) /
    (Math.min(foregroundLuminance, backgroundLuminance) + 0.05)
  );
}

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
  for (let attempt = 0; attempt < 120; attempt += 1) {
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

test("the public direct-start page renders no legacy PII collection or agreement promise", () => {
  assert.doesNotMatch(pageSource, /BecomeAClientForm|<form|<input|<select|<textarea/i);
  assert.doesNotMatch(
    pageSource,
    /Send me the agreement|David sends one email|You fill in three fields/i,
  );
  assert.match(
    pageSource,
    /No onboarding submission or personal or financial information is accepted here/,
  );
  assert.match(
    pageSource,
    /Standard site analytics may record this page visit and link clicks/,
  );
  assert.match(pageSource, /does not replace the secure direct-onboarding path/);
});

test("the retired legacy PII form modules are absent", () => {
  assert.equal(
    fs.existsSync(path.join(root, "src/components/BecomeAClientForm.tsx")),
    false,
  );
  assert.equal(
    fs.existsSync(path.join(root, "src/config/becomeAClient.ts")),
    false,
  );
});

test("the pause page preserves the exact six-phase permanent journey", () => {
  const phases = [
    "Verify",
    "Your Story",
    "Confirm Fit",
    "Make It Official",
    "Financial Picture",
    "First Meeting",
  ];
  let lastIndex = -1;
  for (const phase of phases) {
    const index = pageSource.indexOf(`\"${phase}\"`);
    assert.ok(index > lastIndex, `${phase} must appear once in approved order`);
    lastIndex = index;
  }
});

test("every reachable direct-start CTA and machine-readable name tells the paused truth", () => {
  assert.match(signupConfigSource, /label: "Direct onboarding paused"/);
  assert.match(signupConfigSource, /shortLabel: "Start paused"/);
  assert.ok(signupConfigSource.includes(PAUSE_DISCLOSURE));
  assert.ok(signupConfigSource.includes(COMPLIANCE_DISCLOSURE));
  assert.match(
    signupConfigSource,
    /Direct onboarding is temporarily paused\. No onboarding form accepts personal or financial information at this step; standard site analytics may still record page and CTA activity\. Personalized investment advice begins only after becoming a client\./,
    "the pause boundary must preserve the original compliance sentence in order",
  );
  assert.doesNotMatch(signupConfigSource, /Become a client|Ready when you are/i);

  assert.equal(
    navSource.match(/href=\{signupCta\.primary\.href as any\}/g)?.length,
    3,
    "desktop, mobile header, and mobile drawer must share the paused destination",
  );
  assert.equal(
    navSource.match(/aria-label=\{signupCta\.primary\.label\}/g)?.length,
    2,
    "desktop and drawer labels must match their visible full paused text",
  );
  assert.match(
    navSource,
    /href=\{signupCta\.primary\.href as any\}\s+data-posthog-cta="true"[\s\S]*?\{signupCta\.primary\.shortLabel\}/,
    "the compact header must derive its accessible name from its visible short label",
  );
  assert.equal(
    navSource.match(/data-posthog-cta-label=\{signupCta\.primary\.label\}/g)?.length,
    3,
    "all three navigation placements must expose the truthful analytics label",
  );
  assert.doesNotMatch(navSource, /Become a Client|Sign Up/);
  assert.match(sharedCtaSource, /data-posthog-cta-label=\{signupCta\.primary\.label\}/);
  assert.match(sharedCtaSource, /\{signupCta\.primary\.label\}/);
  assert.equal(
    sharedCtaSource.match(/\{signupCta\.disclosure\}/g)?.length,
    2,
    "both shared CTA variants must render the combined pause and compliance disclosure",
  );
  assert.match(fitCtaSource, /label: signupCta\.primary\.label/);

  assert.match(
    llmsSource,
    /Secure direct onboarding status \(temporarily paused; no onboarding, personal, or financial submission is accepted; standard site analytics may record page and link activity\)/,
  );
  assert.doesNotMatch(llmsSource, /Become a client \(sign-up/);
});

test("paused onboarding has explicit analytics semantics and consistent crawler guidance", () => {
  const ctaContract = analyticsContract.events.find(
    (event) => event.name === "cta_clicked",
  );
  assert.ok(ctaContract, "cta_clicked must remain in the canonical event contract");
  assert.ok(
    ctaContract.semanticRules.includes(
      "Clicks with cta_label=Direct onboarding paused are status-navigation events, not client-start conversions, and must be segmented or excluded from client-start reporting.",
    ),
  );
  assert.ok(
    ctaContract.semanticRules.includes(
      "Clicks with cta_location=signup_pause_optional_meeting represent optional meeting intent while direct onboarding is paused and must be reported separately from permanent onboarding starts.",
    ),
  );
  assert.match(
    dashboardSource,
    /cta_label=Direct onboarding paused[\s\S]*?not[\s\S]*?client-start conversions/,
  );
  assert.match(
    dashboardSource,
    /cta_location=signup_pause_optional_meeting[\s\S]*?Report it separately/,
  );
  assert.match(
    pageSource,
    /robots:\s*\{\s*index:\s*false,\s*follow:\s*true\s*\}/,
  );
  assert.doesNotMatch(
    sitemapSource,
    /<loc>https:\/\/youarepayingtoomuch\.com\/become-a-client<\/loc>/,
  );
  assert.match(sitemapSource, /become-a-client is temporarily[\s\S]*?noindex/);
});

test("the retired API never reads, logs, stores, or forwards a request body", () => {
  assert.doesNotMatch(
    apiSource,
    /firebase|firestore|request\.json|becomeAClientLeads|fullName|body\.email|assetBand|notes|fetch\s*\(/i,
  );
  assert.match(apiSource, /status:\s*410/);
  assert.match(apiSource, /No information was saved/);
});

test("the running pause route fails closed and is accessible at 375px and 1440px", async () => {
  const port = await getUnusedPort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const routeUrl = `${baseUrl}/become-a-client`;
  const child = spawn(
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
      cwd: root,
      env: process.env,
      stdio: "ignore",
      windowsHide: true,
    },
  );
  let browser;

  try {
    await waitForPage(routeUrl, child);

    const response = await fetch(`${baseUrl}/api/become-a-client`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sentinel: "THIS_MUST_NOT_BE_READ_OR_STORED" }),
    });
    assert.equal(response.status, 410);
    assert.equal(await response.text(), NO_SAVE_BODY);

    browser = await chromium.launch({ headless: true });
    for (const viewport of [
      { width: 375, height: 812 },
      { width: 1440, height: 1000 },
    ]) {
      const context = await browser.newContext({ viewport });
      const page = await context.newPage();
      const consoleErrors = [];
      const pageErrors = [];
      page.on("console", (message) => {
        if (message.type() === "error") consoleErrors.push(message.text());
      });
      page.on("pageerror", (error) => pageErrors.push(error.message));

      await page.goto(routeUrl, { waitUntil: "domcontentloaded" });
      await page.getByRole("heading", {
        level: 1,
        name: "Direct onboarding is temporarily paused.",
      }).waitFor();

      const widths = await page.evaluate(() => ({
        documentClient: document.documentElement.clientWidth,
        documentScroll: document.documentElement.scrollWidth,
        bodyScroll: document.body.scrollWidth,
      }));
      assert.deepEqual(
        widths,
        {
          documentClient: viewport.width,
          documentScroll: viewport.width,
          bodyScroll: viewport.width,
        },
        `${viewport.width}px page must have no horizontal overflow`,
      );
      assert.equal(await page.locator("main form, main input, main select, main textarea").count(), 0);

      const compactHeader = viewport.width < 1280;
      const expectedHeaderStatusName = compactHeader
        ? PAUSED_CTA_SHORT_NAME
        : PAUSED_CTA_NAME;
      const visibleStatusCta = page.getByRole("link", {
        name: expectedHeaderStatusName,
        exact: true,
      });
      assert.equal(await visibleStatusCta.count(), 1);
      assert.equal(
        await visibleStatusCta.getAttribute("aria-label"),
        compactHeader ? null : PAUSED_CTA_NAME,
      );
      assert.equal((await visibleStatusCta.innerText()).trim(), expectedHeaderStatusName);

      if (compactHeader) {
        await page.getByRole("button", { name: "Open menu" }).click();
        const drawerStatusCta = page.getByRole("link", {
          name: PAUSED_CTA_NAME,
          exact: true,
        });
        assert.equal(await drawerStatusCta.count(), 1);
        assert.equal((await drawerStatusCta.innerText()).trim(), PAUSED_CTA_NAME);
        assert.equal(await drawerStatusCta.getAttribute("aria-label"), PAUSED_CTA_NAME);
        await page
          .getByRole("navigation", { name: "Mobile navigation" })
          .getByRole("button", { name: "Close menu" })
          .click();
      }

      const meetingCta = page.getByRole("link", {
        name: OPTIONAL_MEETING_NAME,
        exact: true,
      });
      assert.equal(await meetingCta.count(), 1);
      assert.equal(await meetingCta.getAttribute("href"), OPTIONAL_MEETING_HREF);
      const howItWorksCta = page.getByRole("link", {
        name: "See how Smarter Way Wealth works",
        exact: true,
      });
      assert.equal(await howItWorksCta.count(), 1);
      assert.equal(await howItWorksCta.getAttribute("href"), HOW_IT_WORKS_HREF);

      const smallTextStyles = await page.locator("main p").evaluateAll((elements) =>
        elements
          .map((element) => {
            const style = window.getComputedStyle(element);
            if (Number.parseFloat(style.fontSize) > 12.01) return null;
            let ancestor = element;
            let backgroundColor = "rgb(255, 255, 255)";
            while (ancestor) {
              const candidate = window.getComputedStyle(ancestor).backgroundColor;
              if (candidate && !candidate.endsWith(", 0)")) {
                backgroundColor = candidate;
                break;
              }
              ancestor = ancestor.parentElement;
            }
            return {
              text: element.textContent?.trim() ?? "",
              color: style.color,
              backgroundColor,
            };
          })
          .filter(Boolean),
      );
      assert.ok(smallTextStyles.length >= 3, "expected all three 12px status labels");
      for (const style of smallTextStyles) {
        const ratio = contrastRatio(style.color, style.backgroundColor);
        assert.ok(
          ratio >= 4.5,
          `${viewport.width}px small text must meet 4.5:1 contrast: ${style.text} (${ratio.toFixed(2)}:1)`,
        );
      }

      await page.evaluate(() => {
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
      });
      const focusSequence = [];
      for (let press = 0; press < 40; press += 1) {
        await page.keyboard.press("Tab");
        const focused = await page.evaluate(() => {
          const element = document.activeElement;
          return {
            name:
              element?.getAttribute("aria-label") ??
              element?.textContent?.replace(/\s+/g, " ").trim() ??
              "",
            href: element?.getAttribute("href") ?? null,
          };
        });
        focusSequence.push(focused);
        if (focused.href === HOW_IT_WORKS_HREF) break;
      }
      const statusFocusIndex = focusSequence.findIndex(
        (entry) =>
          entry.href === "/become-a-client" && entry.name === expectedHeaderStatusName,
      );
      const meetingFocusIndex = focusSequence.findIndex(
        (entry) => entry.href === OPTIONAL_MEETING_HREF,
      );
      const howFocusIndex = focusSequence.findIndex(
        (entry) => entry.href === HOW_IT_WORKS_HREF,
      );
      assert.ok(statusFocusIndex >= 0, `${viewport.width}px paused CTA must be keyboard reachable`);
      assert.ok(
        meetingFocusIndex > statusFocusIndex,
        `${viewport.width}px optional meeting CTA must follow the paused status CTA`,
      );
      assert.ok(
        howFocusIndex > meetingFocusIndex,
        `${viewport.width}px how-it-works CTA must follow the optional meeting CTA`,
      );

      assert.deepEqual(consoleErrors, [], `${viewport.width}px console errors`);
      assert.deepEqual(pageErrors, [], `${viewport.width}px page errors`);
      if (screenshotOutputDir) {
        fs.mkdirSync(screenshotOutputDir, { recursive: true });
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForFunction(() => window.scrollY === 0);
        await page.screenshot({
          path: path.join(screenshotOutputDir, `freeze-${viewport.width}.png`),
          fullPage: true,
        });
      }
      await context.close();
    }
  } finally {
    await browser?.close();
    if (child.pid && child.exitCode === null) {
      if (process.platform === "win32") {
        try {
          execFileSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], {
            stdio: "ignore",
          });
        } catch {
          // The process may have exited between the guard and taskkill.
        }
      } else {
        child.kill("SIGTERM");
      }
    }
  }
});
