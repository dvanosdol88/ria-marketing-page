/**
 * Locks the calculator input behaviour David asked for on 2026-08-10: tapping a
 * field selects the number already in it, so the next thing typed REPLACES it.
 * Without this, editing on a phone means double-tapping, deleting, and only
 * then typing — his words: "that's annoying."
 *
 * The hard case is iOS Safari, which routinely collapses a programmatic
 * selection to a caret immediately after focus. Case 2 below reproduces that
 * exact behaviour, because a passing selection check on desktop Chromium
 * proves nothing about the device this is actually for.
 */
import assert from "node:assert/strict";
import { createServer } from "node:net";
import { execFileSync, spawn } from "node:child_process";
import { chromium, devices } from "playwright";

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

let nextProcess;
let browser;

try {
  const port = await getUnusedPort();
  const url = `http://127.0.0.1:${port}/`;
  nextProcess = spawn(
    process.execPath,
    ["node_modules/next/dist/bin/next", "dev", "--hostname", "127.0.0.1", "--port", String(port)],
    { cwd: process.cwd(), stdio: "ignore", windowsHide: true },
  );
  await waitForPage(url, nextProcess);

  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    ...devices["iPhone 14 Pro"],
    viewport: { width: 375, height: 630 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(1_500);

  const field = page.locator("#final-portfolio-value-input");
  await field.scrollIntoViewIfNeeded();

  // Case 1: the browser honours the selection (desktop, Android).
  await field.focus();
  await page.waitForTimeout(200);
  const selectionLength = await field.evaluate((el) => el.selectionEnd - el.selectionStart);
  assert.ok(selectionLength > 0, "focusing a calculator input must select the value already in it");
  await page.keyboard.type("5");
  assert.equal(await field.inputValue(), "5", "typing after focus must replace the whole value");
  await field.blur();
  await page.waitForTimeout(300);

  // Case 2: iOS Safari drops the selection to a caret right after focus.
  await field.focus();
  await page.waitForTimeout(200);
  await field.evaluate((el) => el.setSelectionRange(el.value.length, el.value.length));
  await page.keyboard.type("5");
  assert.equal(
    await field.inputValue(),
    "5",
    "typing must still replace the value when the selection was collapsed (iOS Safari)",
  );
  await field.blur();
  await page.waitForTimeout(300);

  // Case 3: only the FIRST keystroke replaces — ordinary editing still appends.
  await field.focus();
  await page.waitForTimeout(200);
  await page.keyboard.type("12");
  assert.equal(
    await field.inputValue(),
    "12",
    "keystrokes after the first must append rather than replace",
  );

  console.log("Calculator input typing behaviour passed, including the collapsed-selection case.");
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
