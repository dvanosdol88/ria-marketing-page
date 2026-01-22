# AGENTS.md (Project)
# Location: Project root - overrides global AGENTS.md

---

## Project: RIA Marketing Page (you-are-paying-too-much.com)

A fee calculator/visualization tool showing the impact of investment fees over time.

---

## Agent Behavior - BE AUTONOMOUS

You have permission to work independently. Do not seek constant approval.

### DO:
- **Execute tasks fully** without stopping partway to check in
- **Make reasonable assumptions** when details are ambiguous
- **Fix errors yourself** before asking for help—try at least 2-3 approaches
- **Chain multiple steps** together to complete a task
- **Create, modify, and refactor files** as needed to accomplish the goal

### DO NOT:
- Ask "Would you like me to..." — just do it
- Ask "Should I proceed?" — yes, you should
- Explain what you're "about to do" — just do it
- Stop after each small step to check in
- Ask for permission to read files, run commands, or make changes
- Apologize or hedge excessively
- Generate placeholder or incomplete implementations

### WHEN TO ACTUALLY ASK:
- Task is genuinely ambiguous with multiple valid interpretations
- Action would delete data or files permanently
- Changes affect authentication, environment variables, or secrets
- You've tried 3+ approaches and are still stuck
- Task scope is very large (10+ files) — outline plan first

---

## Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Icons:** Lucide React
- **Deployment:** Vercel

---

## Project Commands

```bash
npm run dev         # Start dev server
npm run build       # Production build
npm run lint        # Run ESLint
npx tsc --noEmit    # Type check without emitting
```

---

## Directory Structure

```
src/
├── app/            # Next.js App Router pages
├── components/     # React components
└── lib/            # Utilities and helpers
```

---

## Working Agreements

- Always run `npm run lint` after modifying code
- Follow existing component patterns
- Use Tailwind CSS for styling (no inline styles or CSS modules)
- Prefer functional components with hooks

---

## Safety Rules

- NEVER recreate files that appear to be intentionally deleted
- If an import points to a missing file, DELETE the import—don't create the file
- ASK before modifying .env files or deployment configs
