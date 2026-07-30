---
name: wrap-up
description: Session closeout ritual for ria-marketing-page. Use when the user says "wrap up", "/wrap-up", "end the session", or "closeout", and before ending any session in this repo where files changed or commits were made.
---

# Wrap-up — ria-marketing-page session closeout

Run every step. Skipping a step is only allowed if it truly does not apply,
and you must say so explicitly in the final report.

## 1. Commit outstanding work

- `git status --porcelain` — if dirty, commit every logical unit with a
  concise conventional message.
- Git policy for this repo (AGENTS.md "Workflow"): **ship by default**. When
  the task completed successfully (tsc/lint/build pass, work verified),
  commit and ship to `main` unless David said "wait" / "bundle later" or the
  work is exploratory/WIP. Production releases go through the PR-to-`main`
  path (squash merge); merge to `main` IS the deploy (Vercel).
- Never commit `.env.local`, secrets, tokens, or credential-shaped values.

## 2. Journal in REPO-LOG.md

Decide whether the session is meaningful per AGENTS.md "Global Constraints"
(user-visible behavior, material UI/workflow/production change, security or
data decision, real blocker, completed/cancelled work order). Formatting-only
edits and routine churn do not merit an entry.

If meaningful, append a session entry at the TOP of the `## Sessions`
section (newest first) using the repo's exact template:

```markdown
### YYYY-MM-DD — <Short workstream title>
**Agent:** <agent name> | **Surface:** <area touched> | **Goal:** <id/link, if any>
- changed: <what changed and why>
- verified: <commands run and their results — honest evidence; "not run" is
  acceptable, silence is not>
- deployed: <PR #/commit and production proof, or `not deployed`>
- <optional: preserved / added / blockers / next steps / links>
```

If the site's capabilities changed, also update the `## Current
Capabilities` section.

## 3. Push and PR

- Push the branch and open or update the PR (or push `main` when shipping
  directly per the policy above). The journal entry rides in the
  implementation PR or an immediately linked follow-up journal PR.
- If production behavior changed, verify the Vercel deploy picked it up.

## 4. Verify clean

- `git status --porcelain` must be empty. If not, return to step 1.

## 5. Final report

Report the REPO-LOG.md entry heading/path and the PR link (or commit on
`main`), plus exactly one of the AGENTS.md closeout blocks:

```text
JOURNAL:
- REPO-LOG updated: <heading or path>
```

or `- Covered by existing entry: <heading/link>` or
`- Not needed: <one-sentence reason>` under the same `JOURNAL:` line.
