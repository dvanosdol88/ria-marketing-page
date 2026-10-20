<!-- PLAIN-ENGLISH:START v1 2026-10-09 (master: D:\PLAIN-ENGLISH.md, container 05-58; edit the master, never this copy) -->
## Speak plain English to David — every agent, every machine, every message

David is a financial advisor (CFA, CFP) running a business, not a programmer. He has asked for this many times; drifting from it is a defect, not a style choice.

1. **Plain English, bottom line first.** Say what happened, what it means for him, and anything he must do, in words a non-programmer gets at a glance.
2. **No technical jargon** (file paths, code, commands, error text, version numbers, infrastructure or tool names) unless David asks for it, or one term is truly needed to avoid confusion; then explain it in a few plain words.
3. **Talk in products, features and benefits**, not plumbing. Technical detail belongs in the work records, not in what you say to him.
4. **Hold the line during long technical work**, which is exactly when agents drift. Before sending, reread your reply: if a sentence needs a programmer to understand it, rewrite it or cut it.
<!-- PLAIN-ENGLISH:END -->

# AGENTS.md (Project)

## David's website change approval — mandatory

Before new or resumed work, read [the website change approval policy](docs/website-change-approval.md). David owns the wording and visitor experience; approval is once per exact proposed change, not once per PR. Routine maintenance may ship only while preserving approved wording, appearance, calculations and behavior. Uncertain changes remain unpublished drafts. This policy takes precedence over broader automatic shipping, proactive fixes, mobile improvements and agent-readiness guidance.

## Project: RIA-marketing-page
- Domain: youarepayingtoomuch.com (no dashes)
- Purpose: Fee calculator/visualization tool showing the impact of investment fees over time

Shared cross-agent rules live in `D:\AGENTS.md`. This project file contains only RIA marketing-page-specific additions or true overrides.

## Design: mobile-first

Effective 2026-05-22, `youarepayingtoomuch.com` is mobile-first, not merely mobile-aware. For new design and implementation work, start with the smallest practical viewport first, then scale up to tablet and desktop.

- Make layout, typography, spacing, tap targets, and information density work first around a 375px-wide mobile viewport.
- Treat desktop as a progressive enhancement of the mobile experience, not the source design that gets compressed afterward.
- Do not perform a retroactive mobile-first audit of the full site unless explicitly requested. During normal work, flag glaring mobile issues such as overflow, illegible text, broken tap targets, or incoherent stacking. Fix them only within David-approved scope or as maintenance that preserves approved wording, appearance, calculations and behavior; otherwise show a draft for approval.



## Workflow

**Ship by default within approved scope:** The website change approval policy above must be satisfied first. After a task completes successfully (tsc/lint/build pass, user-requested work verified), commit and push to `main` and verify production unless the user explicitly said not to ship, said "wait" or "bundle later", or the change is exploratory/WIP. Do not ask "want me to ship?" when the task is done — ship it.

## Global Constraints

- `REPO-LOG.md` is a durable work journal and handoff aid, not live task status or a substitute for the canonical Kanban/task source. Create one concise entry for each meaningful completed workstream, material decision, real blocker, or completed/cancelled work order, including as applicable what changed and why, verification/evidence, deployed status or `not deployed`, material decisions/limitations/blockers/next steps, and useful links.
- Meaningful work includes user-visible behavior; material UI/workflow or production changes; security, privacy, compliance, auth, data, cost, infrastructure, or integration decisions; significant dependency/security updates; rollbacks; reusable failed-attempt learning; important blockers; and completed, paused, or cancelled work orders. Do not journal every tiny commit: formatting-only edits, ordinary intermediate commits, generated churn, narrow test-only changes without independent behavior, routine dependency-bot noise without security/behavior impact, and discarded local experiments usually do not merit their own entry.
- Never include secrets, tokens, personal data, raw customer/tenant data, or credential-shaped information. Journal in the implementation PR or an immediately linked follow-up journal PR that identifies the workstream/implementation PR; do not leave a meaningful merged workstream without a journal disposition.
- Every agent closeout MUST use exactly one of these complete two-line blocks:

```text
JOURNAL:
- REPO-LOG updated: <heading or path>
```

or

```text
JOURNAL:
- Covered by existing entry: <heading/link>
```

or

```text
JOURNAL:
- Not needed: <one-sentence reason>
```
- When meaningful work or decisions affect multiple Smarter Way Wealth company surfaces, coordinate an appropriate private company-level record while keeping technical details in the local `REPO-LOG.md`.

## Project Backlog
- Tracked items live in docs/backlog.md
- When encountering new issues or tech debt during a session, suggest adding them to the backlog
- When completing work that resolves a backlog item, mark it done

## Project Secrets

Canonical vault: GCP Secret Manager, project `mg-dashboard-ee066`.

Runtime mirror: Vercel Production env for `dvo/you-are-paying-too-much.com`.

Known private/server secret names include:
- `FIREBASE_SERVICE_ACCOUNT_KEY`
- `INTERNAL_RESET_SECRET`
- `SENTRY_AUTH_TOKEN` (agent/local inspection only; do not deploy unless a runtime route needs it)
- `SENTRY_DSN`

Known public deployment config names include:
- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_POSTHOG_HOST`
- `NEXT_PUBLIC_SENTRY_DSN`

Safe verification commands:
- `gcloud secrets describe <NAME> --project=mg-dashboard-ee066`
- `vercel env ls --scope dvo`

Safe mirror pattern:

```powershell
gcloud secrets versions access latest --secret=<NAME> --project=mg-dashboard-ee066 |
  vercel env add <NAME> production --scope dvo
```

Do not store raw values in this file or commit `.env.local`. Public `NEXT_PUBLIC_*` values may live in Vercel, but provider/admin tokens belong in the vault.

## 07-64 — Linux working-copy preparation (2026-10-16)

- Claude remains the accountable lead. Keep the existing Claude project home and conversation history in the shared [05-64 directory](https://github.com/dvanosdol88/dvo88-command-center/blob/main/docs/project-records/README.md).
- Approved destination: `~/projects/ria-marketing-page` on `david-HP-Laptop-1`. Container [07-64](https://www.dvo88.com/rack?card=07-64) owns the move. Preparation is **not a completed cutover**: read its latest return for actual locations and checks before starting new work.
- PC copies are retained recovery/reference copies during preparation. Do not delete, overwrite, relocate or repurpose them; preserve active sessions and unique work. An exact measured removal list on 07-64 and David's approval must precede any PC removal.
- Linux shared rules live under `~/d/` (the equivalent of `D:\`); cross-project references use the corresponding sibling under `~/projects/`. Keep this repository, its remote history and its existing journal; do not create a competing Claude home.
- Use Node 24.15.0 or a compatible newer patch for current locked dependencies. Run one build/test workload at a time on the laptop: recent memory exhaustion closed applications. A successful check does not establish unattended reliability.
- Never copy credential files or client records into a new checkout. Existing vault and production configuration stay unchanged. Production behavior, visitor wording, permissions and Portfolio PM are outside this move. Never use the backup drive for staging.
- For cross-site calculator checks, set `CALCULATOR_CANON_SIBLING_ROOT` to the other Linux repository explicitly; the older test default names the Windows folder and otherwise skips the comparison.
