# GEMINI.md (Project)
# Location: Project root - overrides global GEMINI.md

---

## Project: RIA-marketing-page (youarepayingtoomuch.com)

A fee calculator/visualization tool showing the impact of investment fees over time.

---

## Autonomy Level: FULL

You have permission to operate autonomously. This means:

- **DO NOT** ask "Would you like me to..." — just do it
- **DO NOT** ask "Should I proceed?" — the answer is yes
- **DO NOT** explain what you're about to do — just do it
- **DO NOT** stop after each step to check in
- **DO NOT** generate placeholder implementations

When given a task, **complete it fully**. Make reasonable assumptions. Fix errors yourself (try 2-3 times before asking). Only ask when something is genuinely ambiguous.

---

## Stack

- Next.js 14 + TypeScript
- Tailwind CSS
- Recharts
- Lucide React
- Vercel deployment

---

## Commands

```bash
npm run dev         # Dev server
npm run build       # Production build
npm run lint        # ESLint
```

---

## Boundaries

Ask before:
- Deleting files permanently
- Changing .env or deployment configs
- Large refactors (10+ files) — outline first

---

## Safety Rules

- NEVER recreate files that appear to be intentionally deleted
- If an import points to a missing file, DELETE the import—don't create the file
- Follow existing patterns in the codebase
- After creating any web page or editing a web page or app, ALWAYS use a tool (like Playwright MCP) to perform end-to-end testing, ensuring visual regression and functional integrity.

## Workflow

-  If a change has been made, ALWAYS test it in the browser using Playwright (or similar) tools
-  ALWAYS check README.md on every commit.  Was this change important enought to change the main README page?  If so, make that change.
-  After testing your changes, (1) if successful: always commit and push to remote, (2) if UNsuccessful: fix issues or ask David what to do next.

## ALWAYS:
1. Test any changes in the browser using your Playwright (or similar) tools
2. Check the main README.md.  Is this change important enough to modify the README file?  If so, CHANGE the README.md file
3. Commit and Push changes after (1) and (2)