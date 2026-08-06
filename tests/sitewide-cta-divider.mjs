import assert from "node:assert/strict";
import { createServer } from "node:net";
import { execFileSync, spawn } from "node:child_process";
import { readdir } from "node:fs/promises";
import path from "node:path";
import {
  SUPPRESSED_ROUTE_PREFIXES,
  isSuppressedRoute,
} from "../src/config/suppressedRoutePrefixes.ts";

const HOME_LOCATION = "home_wwwh_divider";
const SITE_LOCATION = "site_footer_divider";
const DIVIDER_LABELS = ["Get started", "See if SWW is a good fit", "FAQ"];
const APP_DIR = path.join(process.cwd(), "src", "app");

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
      throw new Error(`next start exited early with code ${child.exitCode}`);
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

/**
 * Walk src/app for page.tsx files and translate directory paths into URL
 * routes. Dynamic segments ([slug], [...path]) and route groups ((group))
 * are skipped by not descending into them at all. This repo has neither
 * today (verified against the current tree), so skipping the whole subtree
 * is a deliberate simplification rather than a claim of correct route-group
 * URL flattening - if either pattern is introduced later this walker will
 * need updating to match Next's actual routing semantics for it.
 */
async function discoverPageRoutes(dir, segments) {
  const entries = await readdir(dir, { withFileTypes: true });
  const routes = [];

  if (entries.some((entry) => entry.isFile() && entry.name === "page.tsx")) {
    routes.push(segments.length === 0 ? "/" : `/${segments.join("/")}`);
  }

  const subdirs = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => !name.startsWith("[") && !(name.startsWith("(") && name.endsWith(")")))
    .sort();

  for (const name of subdirs) {
    const childRoutes = await discoverPageRoutes(path.join(dir, name), [...segments, name]);
    routes.push(...childRoutes);
  }

  return routes;
}

function countOccurrences(haystack, needle) {
  let count = 0;
  let index = 0;
  while ((index = haystack.indexOf(needle, index)) !== -1) {
    count += 1;
    index += needle.length;
  }
  return count;
}

/**
 * The divider's <nav aria-label="Next steps"> is the one unique,
 * unambiguous marker of a rendered WwwhCtaDivider instance - no other <nav>
 * in this codebase uses that aria-label. Extracting exactly that block
 * keeps label checks from false-positiving on unrelated elements that reuse
 * the same label text elsewhere on the page: the site nav has its own "FAQ"
 * link, and on the homepage WhatWhyWhoHow's inline FAQ link also carries
 * data-posthog-cta-label="FAQ" (with a different, non-divider location), so
 * a whole-page substring search for the label would not be discriminating.
 */
function extractDividerBlock(html) {
  const markerIndex = html.indexOf('aria-label="Next steps"');
  if (markerIndex === -1) return null;
  const openStart = html.lastIndexOf("<nav", markerIndex);
  if (openStart === -1) {
    throw new Error('found aria-label="Next steps" with no preceding <nav');
  }
  const closeIndex = html.indexOf("</nav>", markerIndex);
  if (closeIndex === -1) {
    throw new Error("found the divider's <nav> opening tag with no matching </nav>");
  }
  return html.slice(openStart, closeIndex + "</nav>".length);
}

async function fetchRoute(baseUrl, route) {
  const response = await fetch(`${baseUrl}${route}`);
  assert.equal(response.status, 200, `[${route}] expected HTTP 200, got ${response.status}`);
  return response.text();
}

/**
 * Applies to "/" (expects home_wwwh_divider) and to every non-suppressed
 * route (expects site_footer_divider). WwwhCtaDivider always tags all three
 * of its links with the same location value, so one rendered divider always
 * produces three occurrences of that location string - "exactly one
 * divider" is proven by the unique aria-label marker, not by the location
 * count.
 */
function assertExactlyOneDivider(html, route, expectedLocation, otherLocation) {
  const ariaCount = countOccurrences(html, 'aria-label="Next steps"');
  assert.equal(
    ariaCount,
    1,
    `[${route}] expected exactly one divider instance (aria-label="Next steps"), found ${ariaCount}`,
  );

  const expectedCount = countOccurrences(html, `data-posthog-cta-location="${expectedLocation}"`);
  assert.equal(
    expectedCount,
    3,
    `[${route}] expected exactly 3 links tagged "${expectedLocation}", found ${expectedCount}`,
  );

  const otherCount = countOccurrences(html, `data-posthog-cta-location="${otherLocation}"`);
  assert.equal(
    otherCount,
    0,
    `[${route}] expected zero links tagged "${otherLocation}", found ${otherCount}`,
  );

  const block = extractDividerBlock(html);
  assert.ok(block, `[${route}] could not isolate the divider <nav> block for label verification`);
  for (const label of DIVIDER_LABELS) {
    assert.ok(
      block.includes(`data-posthog-cta-label="${label}"`),
      `[${route}] divider is missing the "${label}" link`,
    );
  }
}

/** Applies to routes matching SUPPRESSED_ROUTE_PREFIXES - no divider at all. */
function assertZeroDividers(html, route) {
  const ariaCount = countOccurrences(html, 'aria-label="Next steps"');
  assert.equal(
    ariaCount,
    0,
    `[${route}] suppressed route must render zero dividers, found ${ariaCount}`,
  );
  for (const location of [HOME_LOCATION, SITE_LOCATION]) {
    const count = countOccurrences(html, `data-posthog-cta-location="${location}"`);
    assert.equal(
      count,
      0,
      `[${route}] suppressed route must carry zero "${location}" tags, found ${count}`,
    );
  }
}

let nextProcess;

try {
  console.log("Building production bundle (next build)...");
  execFileSync(process.execPath, ["node_modules/next/dist/bin/next", "build"], {
    cwd: process.cwd(),
    stdio: "inherit",
    windowsHide: true,
    timeout: 300_000,
  });

  const allRoutes = await discoverPageRoutes(APP_DIR, []);
  assert.ok(
    allRoutes.length >= 10,
    `route discovery found suspiciously few routes: ${allRoutes.length} (${allRoutes.join(", ")})`,
  );
  assert.ok(allRoutes.includes("/"), "route discovery must find the homepage");

  const homeRoutes = allRoutes.filter((route) => route === "/");
  const suppressedRoutes = allRoutes.filter((route) => route !== "/" && isSuppressedRoute(route));
  const standardRoutes = allRoutes.filter((route) => route !== "/" && !isSuppressedRoute(route));

  assert.equal(homeRoutes.length, 1, "there should be exactly one homepage route");
  assert.ok(
    suppressedRoutes.length > 0,
    `no discovered route matched a suppressed prefix (${SUPPRESSED_ROUTE_PREFIXES.join(", ")}) - suppressed-route coverage would be vacuous`,
  );
  assert.ok(
    standardRoutes.length > 0,
    "no standard (non-home, non-suppressed) routes discovered - site-wide coverage would be vacuous",
  );

  console.log(
    `Discovered ${allRoutes.length} routes: 1 home, ${suppressedRoutes.length} suppressed ` +
      `(${suppressedRoutes.join(", ")}), ${standardRoutes.length} standard.`,
  );

  const port = await getUnusedPort();
  const baseUrl = `http://127.0.0.1:${port}`;
  nextProcess = spawn(
    process.execPath,
    ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", String(port)],
    { cwd: process.cwd(), stdio: "ignore", windowsHide: true },
  );
  await waitForPage(`${baseUrl}/`, nextProcess);

  for (const route of homeRoutes) {
    const html = await fetchRoute(baseUrl, route);
    assertExactlyOneDivider(html, route, HOME_LOCATION, SITE_LOCATION);
    console.log(`[home]       ${route} - OK (home_wwwh_divider x3, site_footer_divider x0)`);
  }

  for (const route of suppressedRoutes) {
    const html = await fetchRoute(baseUrl, route);
    assertZeroDividers(html, route);
    console.log(`[suppressed] ${route} - OK (zero dividers)`);
  }

  for (const route of standardRoutes) {
    const html = await fetchRoute(baseUrl, route);
    assertExactlyOneDivider(html, route, SITE_LOCATION, HOME_LOCATION);
    console.log(`[standard]   ${route} - OK (site_footer_divider x3, home_wwwh_divider x0)`);
  }

  console.log(
    `Sitewide CTA divider check passed for all ${allRoutes.length} routes ` +
      `(1 home, ${suppressedRoutes.length} suppressed, ${standardRoutes.length} standard).`,
  );
} finally {
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
