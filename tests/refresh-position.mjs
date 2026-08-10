import assert from "node:assert/strict";
import { createServer } from "node:net";
import { execFileSync, spawn } from "node:child_process";
import { chromium } from "playwright";

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

async function returnToPageTop(page) {
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
  });
  await page.waitForFunction(() => window.scrollY === 0);
  await waitForStableLayout(page);
}

/**
 * The home page keeps settling for a few hundred milliseconds after it is
 * scrolled back to the top (the promise sequence and the media preview both
 * change height). Reloading mid-settle makes Chrome persist a scroll anchor
 * from a layout that no longer matches the fresh page, so scroll restoration
 * lands a handful of pixels below the top for reasons unrelated to the hash
 * regression this file guards. Waiting for the document height to hold steady
 * keeps the assertions measuring the anchor/hash behavior instead of a
 * restoration race.
 */
async function waitForStableLayout(page) {
  await page.waitForFunction(
    () =>
      new Promise((resolve) => {
        let stableFrames = 0;
        let lastHeight = document.documentElement.scrollHeight;
        const check = () => {
          const height = document.documentElement.scrollHeight;
          stableFrames = height === lastHeight ? stableFrames + 1 : 0;
          lastHeight = height;
          if (stableFrames >= 20) resolve(true);
          else window.requestAnimationFrame(check);
        };
        window.requestAnimationFrame(check);
      }),
    null,
    { timeout: 10_000 },
  );
}

async function readPosition(page) {
  return page.evaluate(() => {
    const calculatorHeading = [...document.querySelectorAll("h1,h2,h3")].find((element) =>
      element.textContent?.includes("The Fee Calculator"),
    );
    return {
      hash: window.location.hash,
      scrollY: window.scrollY,
      calculatorHeadingTop: calculatorHeading?.getBoundingClientRect().top ?? null,
    };
  });
}

let nextProcess;
let browser;

try {
  const port = await getUnusedPort();
  const url = `http://127.0.0.1:${port}/?refresh-position-test=1`;
  nextProcess = spawn(
    process.execPath,
    ["node_modules/next/dist/bin/next", "dev", "--hostname", "127.0.0.1", "--port", String(port)],
    { cwd: process.cwd(), stdio: "ignore", windowsHide: true },
  );
  await waitForPage(url, nextProcess);

  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1144, height: 1000 } });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "networkidle" });

  assert.equal(
    await page.getByRole("link", { name: "Go to Advanced Calculator", exact: true }).count(),
    0,
    "the removed top-of-page Advanced Calculator bridge must stay absent",
  );
  assert.equal(
    await page
      .getByText(
        "Model your own time horizon against 40 years of actual S&P 500 returns at smarterwaywealth.com.",
        { exact: true },
      )
      .count(),
    0,
    "the removed Advanced Calculator supporting copy must stay absent",
  );

  assert.equal(
    await page
      .getByRole("link", { name: "Go directly to the fee calculator", exact: true })
      .count(),
    0,
    "the retired in-page calculator shortcut link must stay absent",
  );

  // The in-page shortcut link is gone: the calculator now sits directly under
  // the promise block, so visitors reach it by scrolling rather than by a CTA.
  // The regression guarded here — a refresh landing mid-page instead of at the
  // top — does not depend on how the visitor got down the page.
  await page.evaluate(() => {
    document.getElementById("calculator")?.scrollIntoView({ behavior: "auto", block: "start" });
  });
  await page.waitForFunction(() => window.scrollY > 300);
  await page.waitForTimeout(1_200);
  await returnToPageTop(page);

  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1_200);
  const normalRefresh = await readPosition(page);

  await returnToPageTop(page);
  const cdp = await context.newCDPSession(page);
  const loaded = page.waitForEvent("domcontentloaded");
  await cdp.send("Page.reload", { ignoreCache: true });
  await loaded;
  await cdp.detach();
  await page.waitForTimeout(1_200);
  const hardRefresh = await readPosition(page);

  assert.deepEqual(
    [normalRefresh.scrollY, hardRefresh.scrollY],
    [0, 0],
    `refresh should stay at page top after using the Calculator CTA: ${JSON.stringify({ normalRefresh, hardRefresh })}`,
  );
  assert.deepEqual(
    [normalRefresh.hash, hardRefresh.hash],
    ["", ""],
    "the Calculator CTA should not leave a persistent hash that replays after refresh",
  );

  console.log("Refresh position regression passed for normal and cache-bypassed reloads.");
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
