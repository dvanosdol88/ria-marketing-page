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

**Ship by default:** After a task completes successfully (tsc/lint/build pass, user-requested work verified), commit and push to `main` and verify production unless the user explicitly said not to ship, said "wait" or "bundle later", or the change is exploratory/WIP. Do not ask "want me to ship?" when the task is done � ship it.

## Project Backlog
- Tracked items live in docs/backlog.md
- When encountering new issues or tech debt during a session, suggest adding them to the backlog
- When completing work that resolves a backlog item, mark it done

## Cursor Cloud specific instructions

### Quick reference
- **Dev server:** `npm run dev` (serves at http://localhost:3000)
- **Lint:** `npm run lint`
- **Type check:** `npx tsc --noEmit`
- **Build:** `npm run build`
- See `README.md` for full script list and project structure.

### Non-obvious notes
- **No `.env` file in repo.** Environment variables (`FIREBASE_SERVICE_ACCOUNT_KEY`, `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`) are managed via Vercel dashboard. The app runs fine locally without them — Firebase (quiz voting) degrades gracefully and Sentry is disabled in development (`enabled: process.env.NODE_ENV === "production"`).
- **Build warning about `./src/styles/tokens`:** Turbopack emits a "Module not found" warning for `./src/styles/tokens` in `tailwind.config.ts`. This is a non-blocking warning — the build and dev server work correctly despite it.
- **No Docker or local database required.** Firestore is a managed cloud service; no emulator is configured.
- **Calculator state is URL-driven.** Use query params `?pv=1000000&fee=1&growth=7&years=30` to test specific calculator states directly.
