// Stop-hook contract for .claude/hooks/wrap-up-check.mjs.
//
// The hook blocks a session end (exit 2) when commits exist today and
// REPO-LOG.md has no session entry for today. Since the Rack rule (D:\AGENTS.md
// §12D, 2026-09-21) every journal heading carries the container address FIRST:
//
//   ### 02-70 — 2026-09-24 — Stacked buttons: …
//
// and the older form is still valid for entries that predate the rule:
//
//   ### 2026-09-24 — Count clean-root EDDM scans …
//
// The hook must accept either shape on a `### ` heading line that carries
// today's Eastern date, and must NOT be satisfied by the date appearing in
// body text. The loop guard (`stop_hook_active`) and the dirty-worktree check
// are unchanged and covered here so a future edit cannot drop them silently.
//
// Each case runs the real hook as a child process inside a throwaway git
// repository whose REPO-LOG.md (when present) is committed now — so "commits
// exist today" is true on any clock and the worktree starts clean — with an
// isolated git config (no user hooks, signing, or templates).

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const HOOK = fileURLToPath(new URL("../.claude/hooks/wrap-up-check.mjs", import.meta.url));

// Same clock the hook uses: the Eastern business day, en-CA => YYYY-MM-DD.
const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(new Date());
const ANOTHER_DAY = "2001-01-01";

const EM_DASH = "\u2014";
const addressFirst = (date, title) => `### 02-70 ${EM_DASH} ${date} ${EM_DASH} ${title}`;
const dateFirst = (date, title) => `### ${date} ${EM_DASH} ${title}`;

function fixtureRepo({ repoLog, dirty = false } = {}) {
  const root = mkdtempSync(path.join(tmpdir(), "wrap-up-check-"));
  // The config file lives beside the repo, not inside it, so it never shows
  // up as an untracked file and trips the dirty-worktree check.
  const emptyConfig = path.join(root, "gitconfig-empty");
  writeFileSync(emptyConfig, "");
  const dir = path.join(root, "repo");
  mkdirSync(dir);
  const env = {
    ...process.env,
    GIT_CONFIG_GLOBAL: emptyConfig,
    GIT_CONFIG_NOSYSTEM: "1",
    GIT_AUTHOR_NAME: "fixture",
    GIT_AUTHOR_EMAIL: "fixture@example.invalid",
    GIT_COMMITTER_NAME: "fixture",
    GIT_COMMITTER_EMAIL: "fixture@example.invalid",
  };
  const git = (...args) => {
    const result = spawnSync("git", args, { cwd: dir, env, encoding: "utf8" });
    assert.equal(result.status, 0, `git ${args.join(" ")} failed: ${result.stderr}`);
  };
  git("init", "-q", "-b", "main");
  if (repoLog !== undefined) writeFileSync(path.join(dir, "REPO-LOG.md"), repoLog);
  git("add", "-A");
  git("commit", "-q", "--allow-empty", "-m", "fixture commit made now");
  if (dirty) writeFileSync(path.join(dir, "untracked.txt"), "dirty\n");
  return { dir, root, env };
}

function runHook({ repoLog, dirty, stdin = {} }) {
  const { dir, root, env } = fixtureRepo({ repoLog, dirty });
  try {
    const result = spawnSync(process.execPath, [HOOK], {
      cwd: dir,
      env,
      input: JSON.stringify({ session_id: "test", stop_hook_active: false, ...stdin }),
      encoding: "utf8",
    });
    return { status: result.status, stderr: result.stderr };
  } finally {
    rmSync(root, { recursive: true, force: true, maxRetries: 5 });
  }
}

const journal = (...headings) =>
  `# REPO-LOG — fixture\n\n${headings.map((h) => `${h}\n**Agent:** test\n- changed: something\n`).join("\n")}`;

test("address-first heading with today's Eastern date satisfies the journal check", () => {
  const { status, stderr } = runHook({ repoLog: journal(addressFirst(today, "Today's work")) });
  assert.equal(status, 0, `expected exit 0, got ${status}: ${stderr}`);
});

test("date-first heading with today's Eastern date still satisfies the journal check", () => {
  const { status, stderr } = runHook({ repoLog: journal(dateFirst(today, "Today's work")) });
  assert.equal(status, 0, `expected exit 0, got ${status}: ${stderr}`);
});

test("address-first heading for another day does not count as today's entry", () => {
  const { status, stderr } = runHook({ repoLog: journal(addressFirst(ANOTHER_DAY, "Old work")) });
  assert.equal(status, 2, `expected exit 2, got ${status}: ${stderr}`);
  assert.match(stderr, /no session entry for today/);
});

test("today's date in body text (not on a ### heading) does not count", () => {
  const body = `${journal(addressFirst(ANOTHER_DAY, "Old work"))}- note: David asked on ${today} for a follow-up\n`;
  const { status, stderr } = runHook({ repoLog: body });
  assert.equal(status, 2, `expected exit 2, got ${status}: ${stderr}`);
  assert.match(stderr, /no session entry for today/);
});

test("missing REPO-LOG.md with commits today blocks", () => {
  const { status, stderr } = runHook({});
  assert.equal(status, 2, `expected exit 2, got ${status}: ${stderr}`);
  assert.match(stderr, /no session entry for today/);
});

test("stop_hook_active loop guard lets the stop proceed even with no entry", () => {
  const { status } = runHook({ stdin: { stop_hook_active: true } });
  assert.equal(status, 0);
});

test("dirty worktree blocks even when today's entry exists", () => {
  const { status, stderr } = runHook({ repoLog: journal(addressFirst(today, "Today's work")), dirty: true });
  assert.equal(status, 2, `expected exit 2, got ${status}: ${stderr}`);
  assert.match(stderr, /uncommitted changes/);
});
