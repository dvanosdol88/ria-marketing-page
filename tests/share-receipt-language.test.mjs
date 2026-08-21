import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const shareSummarySource = readFileSync(
  new URL("../src/lib/shareSummary.ts", import.meta.url),
  "utf8",
);
const shareCardSource = readFileSync(
  new URL("../src/components/calculator/ShareMyResults.tsx", import.meta.url),
  "utf8",
);
const ogSource = readFileSync(
  new URL("../src/app/api/og/route.tsx", import.meta.url),
  "utf8",
);

test("fee receipt copy is an assumption-bound advisory-fee comparison", () => {
  assert.match(shareSummarySource, /estimated advisory-fee difference/);
  assert.match(shareCardSource, /ESTIMATED ADVISORY-FEE DIFFERENCE/);
  assert.doesNotMatch(shareSummarySource, /lost to fees/);
  assert.doesNotMatch(shareSummarySource, /Potential savings of/);
  assert.doesNotMatch(shareCardSource, /I COULD POTENTIALLY SAVE/);
});

test("the dynamic share card uses the same neutral receipt label", () => {
  assert.match(ogSource, /Estimated advisory-fee difference/);
  assert.doesNotMatch(ogSource, />Projected savings</);
});
