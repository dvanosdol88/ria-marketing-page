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

### Workspace layout
This workspace contains two independent Next.js repos:
- `/agent/repos/ria-marketing-page` — TypeScript, Next.js 16, React 18, port **3000**
- `/agent/repos/smarter-way-wealth` — JavaScript, Next.js 16, React 19, port **3001**

### Running services
| Service | Command | Port | Notes |
|---------|---------|------|-------|
| RIA marketing dev server | `npm run dev` (from ria-marketing-page) | 3000 | Main calculator app |
| Smarter Way Wealth dev server | `npm run dev -- -p 3001` (from smarter-way-wealth) | 3001 | Use `-p 3001` to avoid port conflict |

### Lint / Type-check / Build
| Repo | Lint | Type-check | Build |
|------|------|------------|-------|
| ria-marketing-page | `npm run lint` | `npx tsc --noEmit` | `npm run build` |
| smarter-way-wealth | `npm run lint` | N/A (JavaScript) | `npm run build` |

### Non-obvious notes
- **Port conflict**: Both repos default to port 3000. Always start smarter-way-wealth with `-p 3001` (or another port) when running both simultaneously.
- **Firebase (quiz API)**: The `/api/quiz/vote` and `/api/quiz/reset` routes in ria-marketing-page require `FIREBASE_SERVICE_ACCOUNT_KEY` env var. The rest of the site (calculator, pillar pages) works fine without it.
- **Sentry**: Only enabled in production (`NODE_ENV=production`). No DSN needed for local dev.
- **ESLint version**: ria-marketing-page uses ESLint 8 with legacy config (`.eslintrc`-style); smarter-way-wealth uses ESLint 9 with flat config.
