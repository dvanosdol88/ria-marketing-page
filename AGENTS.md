# AGENTS.md (Project)

## Project: RIA-marketing-page
- Domain: youarepayingtoomuch.com (no dashes)
- Purpose: Fee calculator/visualization tool showing the impact of investment fees over time

For all architecture rules, safety rules, coding standards, tool usage, and workflow — follow your global ~/.codex/AGENTS.md instructions.


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
