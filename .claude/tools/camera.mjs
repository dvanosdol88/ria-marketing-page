#!/usr/bin/env node
// Cross-environment production camera for the screenshot Stop hook.
//
// Desktop sessions have the gstack browse binary in ~/.claude and should
// keep using it. Cloud sessions (Claude Code on the web) start from a fresh
// clone and never have it — but they DO ship a Chromium at
// /opt/pw-browsers/chromium and route all egress through an HTTPS proxy
// (HTTPS_PROXY) whose CA is already in the browser trust store. This script
// works in both worlds using the repo's own Playwright dependency, so a
// cloud session can capture the production site with no extra setup beyond
// an environment whose network access allows the production domain.
//
// Usage:
//   node .claude/tools/camera.mjs <url> <out.png> [--width N] [--height N]
//        [--mobile] [--full-page] [--wait ms] [--scroll-to <text>]
//
// --mobile      390x844 iPhone-ish viewport at 2x with touch enabled
// --scroll-to   scrolls the first element containing <text> to center first
import { existsSync } from "node:fs";

const args = process.argv.slice(2);
const positional = args.filter((a, i) => !a.startsWith("--") && (i === 0 || !args[i - 1].startsWith("--") || flagOnly(args[i - 1])));
function flagOnly(name) {
  return ["--mobile", "--full-page"].includes(name);
}
const flag = (name) => args.includes(`--${name}`);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] !== undefined ? args[i + 1] : fallback;
};
const [url, out] = positional;
if (!url || !out) {
  console.error(
    "usage: node .claude/tools/camera.mjs <url> <out.png> [--width N] [--height N] [--mobile] [--full-page] [--wait ms] [--scroll-to <text>]"
  );
  process.exit(1);
}

let chromium;
try {
  ({ chromium } = await import("@playwright/test"));
} catch {
  ({ chromium } = await import("playwright-core"));
}

// Cloud containers pin browsers here; a pinned @playwright/test version may
// expect a build that was never downloaded, so point at the provided one
// explicitly. Desktop installs resolve their own browser normally.
const CLOUD_CHROMIUM = "/opt/pw-browsers/chromium";
const launchOptions = {};
if (existsSync(CLOUD_CHROMIUM)) {
  launchOptions.executablePath = CLOUD_CHROMIUM;
  if (process.env.HTTPS_PROXY) {
    launchOptions.proxy = { server: process.env.HTTPS_PROXY };
  }
}

const browser = await chromium.launch(launchOptions);
try {
  const context = await browser.newContext(
    flag("mobile")
      ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }
      : { viewport: { width: Number(opt("width", 1440)), height: Number(opt("height", 900)) } }
  );
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(Number(opt("wait", 2500)));

  const needle = opt("scroll-to", null);
  if (needle) {
    const found = await page.evaluate((text) => {
      const node = document.evaluate(
        `//*[contains(text(), ${JSON.stringify(text)})]`,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      ).singleNodeValue;
      if (!node) return false;
      node.scrollIntoView({ block: "center" });
      return true;
    }, needle);
    if (!found) console.error(`warning: --scroll-to ${JSON.stringify(needle)} matched nothing on the page`);
    await page.waitForTimeout(600);
  }

  await page.screenshot({ path: out, fullPage: flag("full-page") });
  console.log(`captured ${url} -> ${out}`);
} finally {
  await browser.close();
}
