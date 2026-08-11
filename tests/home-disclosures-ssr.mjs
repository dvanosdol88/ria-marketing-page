/**
 * The disclaimer must be in the HTML the server sends, not painted in after
 * JavaScript runs.
 *
 * This site treats AI assistants as a primary audience, and an assistant that
 * cannot see the disclaimer will quote the firm's fee claims without it. Every
 * other test in this directory asserts against SOURCE strings, so an SSR
 * regression here would pass all of them. This one fetches the real page and
 * reads the bytes.
 *
 * It also guards three defects found in review on 2026-08-11:
 *   - markers rendering on pages where the disclaimer did not, leaving
 *     superscripts whose anchors led nowhere;
 *   - a note number placed directly after a currency figure inside SVG text,
 *     where the two concatenate and change the number ("$666,000" + "1");
 *   - the calculator endpoint serving weaker disclosure text than the page,
 *     while llms.txt tells agents to prefer the endpoint.
 */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
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

// Read the disclaimer straight out of the config so the test cannot drift from
// the copy. Parsed rather than imported: Node's TS support varies by version.
const configSource = await readFile(
  new URL("../src/config/calculatorNotes.ts", import.meta.url),
  "utf8",
);
const leads = [...configSource.matchAll(/lead:\s*"([^"]+)"/g)].map((match) => match[1]);
assert.ok(leads.length >= 3, "expected at least three bolded lead-ins in the disclaimer config");

const ANCHOR = "calculator-notes";

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

  // Every URL shape that can render a marker must also render the disclaimer.
  const urls = ["/", "/?mode=calculator-first", "/?variant=final-home"];

  for (const path of urls) {
    const html = await (await fetch(`${base}${path}`)).text();

    assert.ok(
      html.includes(`id="${ANCHOR}"`),
      `${path}: the disclaimer must be in the server-rendered HTML`,
    );

    for (const lead of leads) {
      assert.ok(
        html.includes(lead),
        `${path}: the server-rendered HTML must contain "${lead}"`,
      );
    }

    // No marker may point at an anchor the page does not contain.
    const targets = new Set(
      [...html.matchAll(/href="#(calculator-notes[^"]*)"/g)].map((match) => match[1]),
    );
    for (const target of targets) {
      assert.ok(
        html.includes(`id="${target}"`),
        `${path}: a marker points at #${target}, which is not on the page`,
      );
    }

    // A digit must never sit directly against a currency figure — that is the
    // SVG concatenation defect, and it corrupts the number.
    assert.doesNotMatch(
      html,
      /\$[\d,]+<tspan[^>]*baselineShift="super"/,
      `${path}: a note number must not fuse onto a dollar figure in SVG text`,
    );
  }

  // The machine-readable endpoint must not carry a weaker set than the page.
  const api = await (await fetch(`${base}/api/calculator`)).json();
  for (const lead of leads) {
    assert.ok(
      api.disclosures.some((entry) => entry.startsWith(lead)),
      `the calculator endpoint must serve the "${lead}" statement`,
    );
  }
  assert.ok(
    api.links.disclosureNotes.endsWith(`#${ANCHOR}`),
    "the endpoint must link agents to the disclaimer anchor",
  );

  console.log(
    `Disclaimer is server-rendered on ${urls.length} URL shapes, every marker resolves, and the calculator endpoint matches the page.`,
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
