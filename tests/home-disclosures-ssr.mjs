/**
 * The disclosures must be in the HTML the server sends, not painted in after
 * JavaScript runs.
 *
 * This site treats AI assistants as a primary audience, and an assistant that
 * cannot see the disclosures will quote the firm's fee claims without them.
 * Every other test in this directory asserts against SOURCE strings, so an SSR
 * regression here would pass all of them. This one fetches the real page and
 * reads the bytes.
 *
 * It also guards two defects found in review on 2026-08-11:
 *   - note markers rendering on pages where the notes block did not, leaving
 *     superscripts whose anchors led nowhere;
 *   - a note number placed directly after a currency figure inside SVG text,
 *     where the two concatenate and change the number ("$666,000" + "1").
 */
import assert from "node:assert/strict";
import { createServer } from "node:net";
import { execFileSync, spawn } from "node:child_process";

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

const { CALCULATOR_NOTES, CALCULATOR_NOTES_ANCHOR } = await import(
  "../src/config/calculatorNotes.ts"
).catch(async () => {
  // Node cannot import TypeScript directly; read the ids out of the source.
  const source = await (await import("node:fs/promises")).readFile(
    new URL("../src/config/calculatorNotes.ts", import.meta.url),
    "utf8",
  );
  const ids = [...source.matchAll(/^\s*id:\s*(\d+),/gm)].map((match) => Number(match[1]));
  return { CALCULATOR_NOTES: ids.map((id) => ({ id })), CALCULATOR_NOTES_ANCHOR: "calculator-notes" };
});

let nextProcess;

try {
  const port = await getUnusedPort();
  const base = `http://127.0.0.1:${port}`;
  nextProcess = spawn(
    process.execPath,
    ["node_modules/next/dist/bin/next", "dev", "--hostname", "127.0.0.1", "--port", String(port)],
    { cwd: process.cwd(), stdio: "ignore", windowsHide: true },
  );
  await waitForPage(`${base}/`, nextProcess);

  // Every URL shape that can render a note marker must also render the notes.
  const urls = ["/", "/?mode=calculator-first", "/?variant=final-home"];

  for (const path of urls) {
    const html = await (await fetch(`${base}${path}`)).text();

    assert.ok(
      html.includes(`id="${CALCULATOR_NOTES_ANCHOR}"`),
      `${path}: the notes block must be in the server-rendered HTML`,
    );

    for (const note of CALCULATOR_NOTES) {
      assert.ok(
        html.includes(`id="${CALCULATOR_NOTES_ANCHOR}-${note.id}"`),
        `${path}: note ${note.id} must have a server-rendered anchor`,
      );
    }

    // No marker may point at an anchor the page does not contain.
    const targets = new Set(
      [...html.matchAll(new RegExp(`href="#(${CALCULATOR_NOTES_ANCHOR}-\\d+)"`, "g"))].map(
        (match) => match[1],
      ),
    );
    for (const target of targets) {
      assert.ok(
        html.includes(`id="${target}"`),
        `${path}: marker points at #${target}, which is not on the page`,
      );
    }

    // A digit must never sit directly against a currency figure — that is the
    // SVG concatenation defect, and it corrupts the number.
    assert.doesNotMatch(
      html,
      /\$[\d,]+\d<\/tspan>|\$[\d,]+<tspan[^>]*baselineShift="super"/,
      `${path}: a note number must not fuse onto a dollar figure in SVG text`,
    );
  }

  // The disclosure text itself must be present, not just the anchors.
  const home = await (await fetch(`${base}/`)).text();
  for (const phrase of [
    "not adjusted for inflation",
    "no contributions or withdrawals",
    "it is not a quote",
    "Form ADV Part 2A",
    "possible loss of principal",
  ]) {
    assert.ok(
      home.includes(phrase),
      `the server-rendered home page must contain the disclosure phrase "${phrase}"`,
    );
  }

  // The machine-readable endpoint must not carry a weaker set than the page.
  const api = await (await fetch(`${base}/api/calculator`)).json();
  assert.equal(
    api.disclosures.length,
    CALCULATOR_NOTES.length + 2,
    "the calculator endpoint must serve every note plus the two standing firm statements",
  );
  assert.ok(
    api.links.disclosureNotes.endsWith(`#${CALCULATOR_NOTES_ANCHOR}`),
    "the endpoint must link agents to the notes anchor",
  );

  console.log(
    `Disclosures are server-rendered on ${urls.length} URL shapes, every marker resolves, and the calculator endpoint matches the page.`,
  );
} finally {
  if (nextProcess?.pid && nextProcess.exitCode === null) {
    if (process.platform === "win32") {
      execFileSync("taskkill", ["/pid", String(nextProcess.pid), "/T", "/F"], { stdio: "ignore" });
    } else {
      nextProcess.kill("SIGTERM");
    }
  }
}
