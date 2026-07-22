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

  await page.getByRole("link", { name: "Calculator", exact: true }).click();
  await page.waitForFunction(() => window.scrollY > 1_000);
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
