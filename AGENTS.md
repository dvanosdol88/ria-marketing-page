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
- **Dev server:** `npm run dev` (port 3000)
- **Lint:** `npm run lint`
- **Build:** `npm run build`
- **Type check:** `npx tsc --noEmit`
- See `README.md` "Available Scripts" table for full list.

### Non-obvious notes
- The build emits a warning about `./src/styles/tokens` not found (imported in `tailwind.config.ts`). This is a known issue and does **not** block the build or dev server.
- ESLint config is in `.eslintrc.json` (flat config is not used). Two `@next/next/no-img-element` warnings exist in `src/app/how-it-works/substitution/page.tsx` — these are expected.
- The quiz feature (`/api/quiz/vote`, `/api/quiz/reset`) requires Vercel KV env vars (`KV_REST_API_URL`, `KV_REST_API_TOKEN`). All other pages work without them.
- No database or Docker setup is needed. This is a single Next.js app.
