#!/usr/bin/env node
// PreToolUse hook (matcher: Bash). Blocks `git commit` commands when the
// staged diff adds credential-shaped strings. Fails open on internal errors.
// ESM, node builtins only.
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

try {
  const input = JSON.parse(readFileSync(0, 'utf8'));
  const command = (input && input.tool_input && input.tool_input.command) || '';

  // Only inspect Bash commands that look like a git commit.
  if (!/\bgit\b[\s\S]*\bcommit\b/.test(command)) process.exit(0);

  const diff = execSync('git diff --cached', {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    cwd: (input && input.cwd) || process.cwd(),
  });

  // Patterns are assembled from fragments so this scanner never flags its
  // own source file.
  const patterns = [
    new RegExp('sk-' + 'ant-' + '[a-zA-Z0-9_-]{10,}'),
    new RegExp('sk-' + '[a-zA-Z0-9]{20,}'),
    new RegExp('AIza' + 'Sy' + '[a-zA-Z0-9_-]{10,}'),
    new RegExp('PLAID' + '_SECRET' + "\\s*[=:]\\s*['\"][^'\"]+"),
    new RegExp('-----BEGIN' + '[A-Z ]*' + 'PRIVATE KEY' + '-----'),
  ];

  const hits = [];
  let skipFile = false;
  for (const line of diff.split('\n')) {
    if (line.startsWith('+++')) {
      // Diff header for the incoming file; skip additions to the hook
      // scripts themselves.
      skipFile = line.includes('.claude/hooks/');
      continue;
    }
    if (skipFile) continue;
    if (!line.startsWith('+')) continue;
    for (const re of patterns) {
      const m = line.match(re);
      if (m) hits.push(m[0]);
    }
  }

  if (hits.length > 0) {
    process.stderr.write(
      'Blocked commit: ' +
        hits.length +
        ' credential-shaped addition(s) in staged diff; first hit: ' +
        hits[0].slice(0, 120) +
        '\n'
    );
    process.exit(2);
  }
  process.exit(0);
} catch {
  // Fail open: a broken hook must never block legitimate work.
  process.exit(0);
}
