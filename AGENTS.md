# AGENTS.md (Project)

## Project: RIA-marketing-page
- Domain: youarepayingtoomuch.com (no dashes)
- Purpose: Fee calculator/visualization tool showing the impact of investment fees over time

Shared cross-agent rules live in `D:\AGENTS.md`. This project file contains only RIA marketing-page-specific additions or true overrides.

## Design: mobile-first

Effective 2026-05-22, `youarepayingtoomuch.com` is mobile-first, not merely mobile-aware. For new design and implementation work, start with the smallest practical viewport first, then scale up to tablet and desktop.

- Make layout, typography, spacing, tap targets, and information density work first around a 375px-wide mobile viewport.
- Treat desktop as a progressive enhancement of the mobile experience, not the source design that gets compressed afterward.
- Do not perform a retroactive mobile-first audit of the full site unless explicitly requested. During normal work, flag and fix only glaring mobile issues such as overflow, illegible text, broken tap targets, or incoherent stacking.



## Workflow

**Ship by default:** After a task completes successfully (tsc/lint/build pass, user-requested work verified), commit and push to `main` and verify production unless the user explicitly said not to ship, said "wait" or "bundle later", or the change is exploratory/WIP. Do not ask "want me to ship?" when the task is done — ship it.

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
