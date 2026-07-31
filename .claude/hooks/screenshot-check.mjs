// Claude Code Stop hook: when a session changed a human-visible surface,
// nudge for a PRODUCTION screenshot in the David-facing answer
// (D:\AGENTS.md section 9 "Visual proof"; CRITICAL-RULES.md rule 2).
//
// Two failure modes it catches:
//   1. Visible work finished with no picture shown at all.
//   2. A picture was taken, but only local/preview URLs appear in the
//      session - i.e. the capture is of a dev copy, not the live site.
//      A local screenshot shown as finished work is a deploy-truth
//      violation, not a minor style slip.
//
// Deliberately a nudge, not a judge: it cannot know what got pasted into
// the final message, so it errs toward reminding and always fails open.
import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

// Matched on EXTENSION (plus public/ assets) rather than on directory, so
// that server/util .ts files under src/ do not masquerade as visible work.
const VISIBLE = /(^|\/)public\/|\.(tsx|jsx|css|scss|html)$/i;
const EXEMPT = /(^|\/)(scripts|docs|api|database|db|e2e|tests?)\/|\.test\.|\.spec\.|\.d\.ts$/i;

// This repo's real surface. A capture of anything else is not proof of live.
const PRODUCTION = /youarepayingtoomuch\.com/i;
const NOT_PRODUCTION = /(localhost|127\.0\.0\.1|\[::1\]|\.vercel\.app)/i;

// Actual screenshot tool invocations. Matching the bare word "screenshot"
// would self-trigger on this file and on the nudge text itself.
const SCREENSHOT_TOOL =
  /(browser_take_screenshot|__take_screenshot|Windows-MCP__Screenshot|computer-use__screenshot|"action"\s*:\s*"screenshot")/;

try {
  const input = JSON.parse(readFileSync(0, 'utf8'));
  if (input?.stop_hook_active) process.exit(0); // prevent block loops

  const run = (cmd) => {
    try {
      return execSync(cmd, { encoding: 'utf8' }).trim();
    } catch {
      return '';
    }
  };

  const committed = run('git log --since=midnight --name-only --pretty=format:')
    .split('\n')
    .map((f) => f.trim())
    .filter(Boolean);
  // -uall is required: plain --porcelain collapses a wholly-untracked
  // directory to "src/" instead of listing "src/Foo.tsx" inside it, which
  // would hide a brand-new page in a brand-new folder from this check.
  const dirty = run('git status --porcelain -uall')
    .split('\n')
    .map((l) => l.slice(3).trim())
    .filter(Boolean);

  const visible = [...new Set([...committed, ...dirty])].filter(
    (f) => VISIBLE.test(f) && !EXEMPT.test(f)
  );
  if (visible.length === 0) process.exit(0); // nothing a human can see changed

  let transcript = '';
  const p = input?.transcript_path;
  if (p && existsSync(p)) {
    try {
      transcript = readFileSync(p, 'utf8');
    } catch {
      process.exit(0); // unreadable transcript: fail open, never block on it
    }
  }
  if (!transcript) process.exit(0);

  const shot = SCREENSHOT_TOOL.test(transcript);
  const sawProd = PRODUCTION.test(transcript);
  const sawLocal = NOT_PRODUCTION.test(transcript);

  const sample = visible.slice(0, 3).join(', ');
  const more = visible.length > 3 ? ` (+${visible.length - 3} more)` : '';

  let problem = null;
  if (!shot) {
    problem =
      `this session changed a human-visible surface (${sample}${more}) but captured no screenshot. ` +
      'If the change is live, show David a picture of it on the production site. ' +
      'If it is NOT live yet, say "not live yet" and show nothing - never a local capture.';
  } else if (sawLocal && !sawProd) {
    problem =
      `a screenshot was captured but only local/preview URLs appear in this session, and ${sample}${more} changed. ` +
      'A local or preview capture must never be shown as evidence of finished work (deploy-truth, CRITICAL-RULES rule 2). ' +
      'Capture the production URL after confirming live, or show nothing and say why.';
  }

  if (problem) {
    process.stderr.write('Before ending the session: ' + problem + '\n');
    process.exit(2);
  }
  process.exit(0);
} catch {
  process.exit(0);
}
