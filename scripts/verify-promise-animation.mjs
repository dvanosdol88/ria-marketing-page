import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORT = Number(process.env.PROMISE_TEST_PORT ?? 33000 + (process.pid % 1000));
const BASE_URL = `http://127.0.0.1:${PORT}`;
const nextBin = path.join(ROOT, "node_modules", "next", "dist", "bin", "next");

async function buildProductionApp() {
  const build = spawn(process.execPath, [nextBin, "build"], {
    cwd: ROOT,
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  });
  let buildOutput = "";
  const captureBuildOutput = (chunk) => {
    buildOutput = `${buildOutput}${chunk}`.slice(-16_000);
  };
  build.stdout?.on("data", captureBuildOutput);
  build.stderr?.on("data", captureBuildOutput);

  const { code, signal } = await new Promise((resolve, reject) => {
    build.once("error", reject);
    build.once("exit", (exitCode, exitSignal) => resolve({ code: exitCode, signal: exitSignal }));
  });
  if (code !== 0) {
    throw new Error(`Next production build failed (code=${code}, signal=${signal})\n${buildOutput}`);
  }
}

let server;
let serverOutput = "";
const captureServerOutput = (chunk) => {
  serverOutput = `${serverOutput}${chunk}`.slice(-8_000);
};
let serverExitError;

function startProductionServer() {
  server = spawn(process.execPath, [nextBin, "start", "-H", "127.0.0.1", "-p", String(PORT)], {
    cwd: ROOT,
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  });
  server.stdout?.on("data", captureServerOutput);
  server.stderr?.on("data", captureServerOutput);
  server.once("exit", (code, signal) => {
    serverExitError = new Error(`Local Next server exited before verification (code=${code}, signal=${signal})\n${serverOutput}`);
  });
}

async function waitForServer() {
  const deadline = Date.now() + 45_000;
  while (Date.now() < deadline) {
    if (serverExitError) throw serverExitError;
    try {
      const response = await fetch(BASE_URL);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("Timed out waiting for the local Next server");
}

async function collectTimeline(page) {
  const promise = page.locator("[data-promise-phase]");
  await promise.waitFor();
  await page.evaluate(() => {
    const element = document.querySelector("[data-promise-phase]");
    window.__promiseTimeline = [{
      phase: element.dataset.promisePhase,
      name: element.dataset.promiseName,
      at: performance.now(),
    }];
    new MutationObserver(() => {
      const latest = window.__promiseTimeline.at(-1);
      const next = {
        phase: element.dataset.promisePhase,
        name: element.dataset.promiseName,
        at: performance.now(),
      };
      if (latest.phase !== next.phase || latest.name !== next.name) {
        window.__promiseTimeline.push(next);
      }
    }).observe(element, { attributes: true, attributeFilter: ["data-promise-phase", "data-promise-name"] });
  });
  await promise.scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelector("[data-promise-phase]")?.dataset.promisePhase === "brand", null, { timeout: 10_000 });
  return page.evaluate(() => window.__promiseTimeline);
}

async function stopServer() {
  if (!server || server.exitCode !== null || server.signalCode !== null) return;

  const exited = new Promise((resolve) => server.once("exit", resolve));
  server.kill();
  const exitedGracefully = await Promise.race([
    exited.then(() => true),
    new Promise((resolve) => {
      const timeout = setTimeout(() => resolve(false), 5_000);
      timeout.unref?.();
    }),
  ]);

  if (!exitedGracefully && server.exitCode === null && server.signalCode === null) {
    server.kill("SIGKILL");
    await exited;
  }
}

let browser;
try {
  await buildProductionApp();
  startProductionServer();
  browser = await chromium.launch();
  await waitForServer();
  const context = await browser.newContext({ viewport: { width: 375, height: 812 }, reducedMotion: "no-preference" });
  const page = await context.newPage();
  page.on("console", (message) => {
    if (message.type() === "error") console.error(`Browser console error: ${message.text()}`);
  });
  page.on("requestfailed", (request) => {
    const errorText = request.failure()?.errorText;
    if (errorText !== "net::ERR_ABORTED") {
      console.error(`Browser request failed: ${request.url()} (${errorText})`);
    }
  });
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await page.locator('[data-promise-motion-ready="true"]').waitFor();
  const timeline = await collectTimeline(page);
  assert.deepEqual([...new Set(timeline.map((entry) => entry.phase))], ["waiting", "human", "david", "full-copy", "full-copy-hold", "brand"]);
  const fullCopy = timeline.find((entry) => entry.phase === "full-copy");
  const hold = timeline.find((entry) => entry.phase === "full-copy-hold");
  const brand = timeline.find((entry) => entry.phase === "brand");
  assert.equal(fullCopy.name, "david");
  assert.equal(hold.name, "david");
  assert.ok(brand.at - hold.at >= 975, `Full-copy hold was only ${brand.at - hold.at}ms`);
  const lineGeometry = await page.evaluate(() => {
    const fee = document.querySelector("[data-promise-fee]").getBoundingClientRect();
    const period = document.querySelector("[data-promise-period]").getBoundingClientRect();
    return { delta: Math.abs(fee.top - period.top), overflow: document.documentElement.scrollWidth - window.innerWidth };
  });
  assert.ok(lineGeometry.delta <= 1, `Period moved to another line by ${lineGeometry.delta}px`);
  assert.ok(lineGeometry.overflow <= 0, `Promise introduced ${lineGeometry.overflow}px of horizontal overflow`);
  await context.close();

  const reducedContext = await browser.newContext({ viewport: { width: 375, height: 812 }, reducedMotion: "reduce" });
  const reducedPage = await reducedContext.newPage();
  await reducedPage.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await reducedPage.locator('[data-promise-phase="brand"]').waitFor();
  await reducedPage.locator('[data-promise-name="smarter-way-wealth"]').waitFor();
  await reducedContext.close();
} finally {
  try {
    await browser?.close();
  } finally {
    await stopServer();
  }
}

console.log("Promise animation verification passed");
