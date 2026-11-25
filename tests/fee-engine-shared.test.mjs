// Fee engine shared with the firm site (fee-lab step 1).
// (a) 300 fixed vectors, generated from the original fee-site engine, must still hold.
// (b) the engine file must be byte-identical (LF-normalised) to the firm site's copy.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { buildFeeProjection } from "../src/lib/feeProjection.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SIBLING_ROOT = process.env.FEE_ENGINE_SIBLING_ROOT || path.resolve(ROOT, "..", "sww-fee-lab");
const SHARED_FILES = ["src/lib/feeProjection.ts"];

const fixture = JSON.parse(readFileSync(path.join(ROOT, "tests/fixtures/fee-engine-vectors.json"), "utf8"));

test("engine reproduces all fixed vectors within 0.005", () => {
  assert.equal(fixture.cases.length, 300);
  for (const { input, expected } of fixture.cases) {
    const out = buildFeeProjection(input);
    for (const key of Object.keys(expected)) {
      assert.ok(
        Math.abs(out[key] - expected[key]) <= 0.005,
        `${key} for ${JSON.stringify(input)}: got ${out[key]}, expected ${expected[key]}`,
      );
    }
  }
});

test("shared engine files are byte-identical to the firm site's copy", (t) => {
  if (!existsSync(SIBLING_ROOT)) {
    t.skip(`firm site checkout not present (${SIBLING_ROOT}); comparison skipped`);
    return;
  }
  const norm = (file) => readFileSync(file, "utf8").replace(/\r\n/g, "\n");
  for (const rel of SHARED_FILES) {
    assert.equal(norm(path.join(ROOT, rel)), norm(path.join(SIBLING_ROOT, rel)), `${rel} differs from the firm site's copy`);
  }
});
