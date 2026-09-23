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
import {
  getUnusedPort,
  startNextDev,
  stopNextDev,
  waitForPage,
} from "./lib/nextDevHarness.mjs";

// Read the disclaimer straight out of the config so the test cannot drift from
// the copy. Parsed rather than imported: Node's TS support varies by version.
const configSource = await readFile(
  new URL("../src/config/calculatorNotes.ts", import.meta.url),
  "utf8",
);
const leads = [...configSource.matchAll(/bold:\s*"([^"]+)"/g)].map((match) => match[1]);
assert.ok(leads.length >= 3, "expected at least three bolded lead-ins in the disclaimer config");
const phrases = [
  "should not be relied on for a precise cost analysis",
  "Actual results will vary and your fees may change",
];

const ANCHOR = "calculator-notes";

let nextProcess;

try {
  const port = await getUnusedPort();
  const base = `http://127.0.0.1:${port}`;
  const started = startNextDev(port);
  nextProcess = started.child;
  await waitForPage(`${base}/`, nextProcess, started.logs);

  // Every URL shape that can render a marker must also render the disclaimer.
  const urls = ["/", "/?mode=calculator-first", "/?variant=final-home"];

  for (const path of urls) {
    const html = await (await fetch(`${base}${path}`)).text();

    assert.ok(
      html.includes(`id="${ANCHOR}"`),
      `${path}: the disclaimer must be in the server-rendered HTML`,
    );

    for (const lead of [...leads, ...phrases]) {
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
  for (const lead of [...leads, ...phrases]) {
    assert.ok(
      api.disclosures.some((entry) => entry.includes(lead)),
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
  await stopNextDev(nextProcess);
}
