#!/usr/bin/env node
// Stop hook. Blocks ending the session when the worktree is dirty or when
// commits were made today without a matching REPO-LOG.md session entry.
// Fails open on internal errors. ESM, node builtins only.
import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

try {
  const input = JSON.parse(readFileSync(0, 'utf8'));

  // Prevent block loops: if we already blocked once, let the stop proceed.
  if (input && input.stop_hook_active) process.exit(0);

  const run = (cmd) => {
    try {
      return execSync(cmd, {
        encoding: 'utf8',
        maxBuffer: 16 * 1024 * 1024,
      }).trim();
    } catch {
      return '';
    }
  };

  const dirty = run('git status --porcelain') !== '';
  const commitsToday = run('git log --oneline --since=midnight') !== '';

  const today = new Date().toISOString().slice(0, 10);
  let logHasToday = false;
  try {
    logHasToday =
      existsSync('REPO-LOG.md') &&
      readFileSync('REPO-LOG.md', 'utf8').includes('### ' + today);
  } catch {
    logHasToday = false;
  }

  const problems = [];
  if (dirty) {
    problems.push(
      'uncommitted changes in the worktree (commit every logical unit per AGENTS.md)'
    );
  }
  if (commitsToday && !logHasToday) {
    problems.push(
      'commits exist today but REPO-LOG.md has no session entry for today — run the wrap-up skill first'
    );
  }

  if (problems.length > 0) {
    process.stderr.write('Before ending the session: ' + problems.join('; ') + '\n');
    process.exit(2);
  }
  process.exit(0);
} catch {
  // Fail open: a broken hook must never trap the session.
  process.exit(0);
}
