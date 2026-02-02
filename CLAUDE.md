# CLAUDE.md
# Location: Project root

## Project: RIA-marketing-page (youarepayingtoomuch.com)

See `AGENTS.md` in this directory for full project context, deprecated files, and conventions.

## Project Commands

```bash
npm run dev         # Dev server (Next.js)
npm run build       # Production build
npm run lint        # ESLint
npx tsc --noEmit    # Type check
```

## Stack

- Next.js 14 + TypeScript
- Tailwind CSS
- Recharts (charts/visualizations)
- Lucide React (icons)
- Deployed on Vercel

## Project-Specific Rules

- This is a fee calculator/visualization tool
- Keep the UI simple and focused on the calculator functionality
- Follow existing component patterns in `src/components/`
- If a change has been made, ALWAYS test it in the browser using Playwright (or similar) tools

## ALWAYS:
1. Test any changes in the browser using your Playwright (or similar) tools
2. Check the main README.md.  Is this change important enough to modify the README file?  If so, CHANGE the README.md file
3. Commit and Push changes after (1) and (2)