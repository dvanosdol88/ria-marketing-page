import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

// One-tap share contract (2026-08-17, David's checked change list from the
// "One Tap to Share" research): a button that says Share must share on the
// tap wherever the browser has a native share sheet, with the old panel
// demoted to a backup that leads with its actions. These are source-shape
// assertions in the same spirit as home-wwwh.mjs: they pin the structure a
// regression would silently undo. ShareMyResults.tsx is canon (byte-identical
// in the sister repo), so passing here vouches for both sites' copies.

const shareSource = readFileSync(
  new URL("../src/components/calculator/ShareMyResults.tsx", import.meta.url),
  "utf8",
);

const homeSource = readFileSync(
  new URL("../src/components/HomeCalculatorExperience.tsx", import.meta.url),
  "utf8",
);

test("the primary tap fires the native share directly when a share sheet exists", () => {
  assert.match(
    shareSource,
    /if \(canNativeShare\) \{\s*void shareNative\(\);\s*return;\s*\}\s*setOpen\(!open\);/,
    "expected the primary button handler to branch: native share first, panel toggle only as fallback",
  );
});

test("the disclosure aria wiring applies only when the button actually toggles the panel", () => {
  assert.match(
    shareSource,
    /canNativeShare\s*\?\s*\{\}\s*:\s*\{\s*"aria-expanded": open,\s*"aria-controls": "share-my-results-panel"/,
    "expected aria-expanded/aria-controls to be conditional on the fallback (non-native) mode",
  );
});

test("a More options trigger keeps the backup panel reachable on share-sheet browsers", () => {
  assert.match(
    shareSource,
    /canNativeShare \? \([\s\S]{0,900}?More options[\s\S]{0,400}?\) : null\}/,
    "expected a secondary, canNativeShare-gated trigger labelled More options",
  );
});

test("the backup panel leads with actions; social tiles and preview follow", () => {
  const panelStart = shareSource.indexOf('id="share-my-results-panel"');
  assert.ok(panelStart > -1, "expected the backup panel to keep its id");
  const panel = shareSource.slice(panelStart);
  const copyOrSave = panel.indexOf("Copy or save");
  const postIt = panel.indexOf("Or post it");
  const preview = panel.indexOf("Your share card");
  assert.ok(copyOrSave > -1, "expected the Copy or save action group inside the panel");
  assert.ok(postIt > -1, "expected the social tiles under an Or post it label");
  assert.ok(preview > -1, "expected the share-card thumbnail to keep its label");
  assert.ok(copyOrSave < postIt, "Copy or save actions must come before the social tiles");
  assert.ok(postIt < preview, "the preview must sit below both action groups, as a thumbnail");
});

test("the panel's old native More tile is gone — its job moved to the primary button", () => {
  assert.doesNotMatch(
    shareSource,
    /nativeTileLabel\}>More</,
    "expected the in-panel native share tile to be removed",
  );
});

test("the share card preview is constrained to a thumbnail inside the panel", () => {
  const panel = shareSource.slice(shareSource.indexOf('id="share-my-results-panel"'));
  assert.match(
    panel,
    /max-w-\[3\d{2}px\]/,
    "expected the panel's ShareCardPreview to sit inside a max-width thumbnail wrapper",
  );
});

test("the homepage share section reads as one heading and one button — no Share eyebrow", () => {
  const sectionStart = homeSource.indexOf('id="home-share-results-heading"');
  assert.ok(sectionStart > -1, "expected the share section heading to remain");
  const sectionWindow = homeSource.slice(sectionStart - 600, sectionStart + 200);
  assert.doesNotMatch(
    sectionWindow,
    />Share<\/p>/,
    "expected the SHARE eyebrow above the share heading to be removed (three stacked labels collapse to one heading + one button)",
  );
  assert.match(sectionWindow, /Send this comparison/, "expected the heading itself to survive the collapse");
});
