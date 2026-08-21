// Canon lock tripwire — docs/plans/2026-08-12-calculator-canon.md's "Lock
// mechanism" section (in the sister repo, D:\smarter-way-wealth), Phase B1.
// Reads CALCULATOR-CANON.md at the repo root as the source of truth: the
// list of files that must stay byte-identical to the sister repo
// (smarterwaywealth.com, D:\smarter-way-wealth), each with its own SHA-256
// hash and a repo-wide syncVersion. Mirrors the sister repo's own
// tests/calculator-canon-manifest.test.mjs, adapted to this repo's test
// convention (`node --test`, no ".test." in the filename — see the other
// files in this directory).
//
// Layer 1 (always runs, therefore in every PR gate — see .github/workflows/
// ci.yml): each listed file's current hash must match the register. Editing
// a canon file without deliberately updating CALCULATOR-CANON.md fails this
// locally and at merge time — that is the point.
//
// Layer 2 (this machine only): when the sibling repo's checkout is present
// on disk, compare its own register against this one. Skips gracefully (not
// a failure) when the sibling path is absent, or when the sibling has no
// register of its own yet. At the same syncVersion, every canon file's hash
// must agree exactly. A sibling exactly one syncVersion behind (either
// direction) is allowed and reported, not failed. Never writes to the
// sibling repo.

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const REPO_ROOT = new URL("..", import.meta.url);
const REGISTER_PATH = new URL("../CALCULATOR-CANON.md", import.meta.url);
const SIBLING_ROOT = process.env.CALCULATOR_CANON_SIBLING_ROOT || "D:\\smarter-way-wealth";
const SIBLING_REGISTER_PATH = path.join(SIBLING_ROOT, "CALCULATOR-CANON.md");

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex").toUpperCase();
}

/** Parses the register's `syncVersion: N` line and its `| path | HASH |`
 *  table rows. Deliberately tolerant of the surrounding prose — only the
 *  two structural pieces this tripwire depends on are extracted. */
function parseRegister(markdown) {
  const syncVersionMatch = markdown.match(/^syncVersion:\s*(\d+)\s*$/m);
  assert.ok(syncVersionMatch, "expected a top-level 'syncVersion: N' line in the register");
  const syncVersion = Number(syncVersionMatch[1]);

  const files = [...markdown.matchAll(/^\|\s*(src\/[^\s|]+)\s*\|\s*([0-9A-F]{64})\s*\|\s*$/gm)]
    .map((match) => ({ path: match[1], hash: match[2] }));
  assert.ok(files.length > 0, "expected at least one canon file row in the register");

  return { syncVersion, files };
}

test("layer 1: every registered canon file's hash matches CALCULATOR-CANON.md", () => {
  assert.ok(existsSync(REGISTER_PATH), "expected CALCULATOR-CANON.md at the repo root");
  const register = parseRegister(readFileSync(REGISTER_PATH, "utf8"));

  for (const { path: relativePath, hash: expectedHash } of register.files) {
    const absolutePath = new URL(relativePath, REPO_ROOT);
    assert.ok(existsSync(absolutePath), `registered canon file is missing on disk: ${relativePath}`);
    const actualHash = sha256(readFileSync(absolutePath));
    assert.equal(
      actualHash,
      expectedHash,
      `${relativePath} has drifted from its registered hash — edit CALCULATOR-CANON.md's entry ` +
        "deliberately (and mirror the edit in the sister repo's copy in the same working session) " +
        "rather than let this fail silently at merge time.",
    );
  }
});

test("layer 1: every canon file carries the CANON banner comment", () => {
  const register = parseRegister(readFileSync(REGISTER_PATH, "utf8"));
  for (const { path: relativePath } of register.files) {
    const source = readFileSync(new URL(relativePath, REPO_ROOT), "utf8");
    assert.match(
      source,
      /CANON: shared verbatim with the sister repo/,
      `${relativePath} is registered as canon but is missing the banner comment`,
    );
  }
});

test("layer 2: cross-repo register comparison with the sister repo", (t) => {
  if (!existsSync(SIBLING_ROOT)) {
    t.skip(`sister repo not present on this machine (${SIBLING_ROOT}) — expected in CI, informational locally`);
    return;
  }
  if (!existsSync(SIBLING_REGISTER_PATH)) {
    t.skip("sister repo has no CALCULATOR-CANON.md yet");
    return;
  }

  const local = parseRegister(readFileSync(REGISTER_PATH, "utf8"));
  const sibling = parseRegister(readFileSync(SIBLING_REGISTER_PATH, "utf8"));
  const versionDelta = local.syncVersion - sibling.syncVersion;

  if (versionDelta === 0) {
    for (const { path: relativePath, hash: localHash } of local.files) {
      const siblingFile = sibling.files.find((file) => file.path === relativePath);
      if (!siblingFile) continue; // Only compare paths both registers actually list.
      assert.equal(
        siblingFile.hash,
        localHash,
        `canon drift at the SAME syncVersion (${local.syncVersion}): ${relativePath} differs between ` +
          "this repo and the sister repo. Canon changes must land in both repos in the same working " +
          "session (docs/plans/2026-08-12-calculator-canon.md's \"Improvement flow\", in the sister repo).",
      );
    }
  } else if (Math.abs(versionDelta) === 1) {
    console.log(
      `sister repo update pending: local syncVersion ${local.syncVersion}, sibling ${sibling.syncVersion} ` +
        "(one version behind is allowed while a canon change is mid-flight across both repos).",
    );
  } else {
    assert.fail(
      `canon syncVersion drift too large: local=${local.syncVersion} sibling=${sibling.syncVersion} — ` +
        "more than one canon change landed in one repo without the other catching up.",
    );
  }
});
