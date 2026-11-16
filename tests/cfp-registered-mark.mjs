/**
 * CFP registered mark — David's order (2026-11-16): wherever the public sites
 * name his CFP credential, it reads "CFP®". File-only checks.
 */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (relativePath) => readFile(new URL(`../${relativePath}`, import.meta.url), "utf8");

const checks = [
  ["src/components/WhatWhyWhoHow.tsx", "CFA Charter Holder and CFP® Professional with over 20 years’ experience.", "CFA Charter Holder and CFP Professional with over 20 years’ experience."],
  ["src/app/(site)/layout.tsx", 'honorificSuffix: "CFA, CFP®",', 'honorificSuffix: "CFA, CFP",'],
  ["src/config/onePercentBlues.ts", 'honorificSuffix: "CFA, CFP®",', 'honorificSuffix: "CFA, CFP",'],
  ["src/app/(site)/upgrade-your-advice/page.tsx", 'jobTitle: "CFA Charterholder, CFP® Practitioner",', 'jobTitle: "CFA Charterholder, CFP Practitioner",'],
  ["public/agent-info.json", "David J. Van Osdol, CFA, CFP®", "David J. Van Osdol, CFA, CFP\""],
  ["public/llms.txt", "David J. Van Osdol, CFA, CFP®", "David J. Van Osdol, CFA, CFP\n"],
  ["src/app/(blues)/blues/llms.txt/route.ts", "David J. Van Osdol, CFA, CFP®", "David J. Van Osdol, CFA, CFP\n"],
  ["src/app/api/calculator/route.ts", "David J. Van Osdol, CFA, CFP®", "David J. Van Osdol, CFA, CFP\""],
];

for (const [file, present, absent] of checks) {
  test(`${file} carries the CFP® mark`, async () => {
    const text = (await read(file)).replace(/\r\n/g, "\n");
    assert.ok(text.includes(present), `${file} should contain: ${present}`);
    assert.ok(!text.includes(absent), `${file} should not contain: ${absent}`);
  });
}
