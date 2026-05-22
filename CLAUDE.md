# CLAUDE.md (Project)

## Project: RIA-marketing-page
- Domain: youarepayingtoomuch.com (no dashes)
- Purpose: Fee calculator/visualization tool showing the impact of investment fees over time

For all architecture rules, safety rules, coding standards, tool usage, and workflow — follow your global ~/.claude/CLAUDE.md instructions.

## Design: mobile-first

Effective 2026-05-22, this site is **mobile-first**, not mobile-aware. Design and build for the smallest viewport first, then scale up to tablet and desktop via responsive utilities — not the other way around. This applies to every new component, section, copy block, and visual treatment.

- Layout reasoning starts at ~375px width. Typography, spacing, tap targets, and information density are decided there first.
- Desktop is a progressive enhancement of the mobile layout, not the source of truth that gets shrunk down.
- No need to retroactively re-audit existing pages for mobile-first compliance. Only flag and fix glaring mobile breaks (overflow, illegible text, broken tap targets) you encounter during normal work.

## Project Backlog
- Tracked items live in docs/backlog.md
- When encountering new issues or tech debt during a session, suggest adding them to the backlog
- When completing work that resolves a backlog item, mark it done

## Agent-readiness (apply on every page; this is a public-facing marketing site)

This site will be read, summarized, and quoted by AI agents (ChatGPT, Claude, Perplexity, Google AI Overviews, custom user agents). Treat them as a primary audience — not an afterthought.

**Site-level (verify present; add if missing):**
- `robots.txt` with explicit policy for AI bots: `GPTBot`, `ClaudeBot`, `Google-Extended`, `PerplexityBot`, `CCBot`. This site is lead-gen — allow them.
- `sitemap.xml` (Next.js `app/sitemap.ts`) listing every public route.
- `/llms.txt` at the root: short markdown index of the site's high-quality pages with one-line descriptions for agents.
- JSON-LD `Organization` + `WebSite` schema in the root layout (one declaration per concept, declared once site-wide).
- Open Graph + Twitter Card metadata defaults in the root layout (already present — keep current).

**Per new page or significant new section:**
- Pick the right schema.org type for what THIS page is and embed page-specific JSON-LD: `WebApplication`/`SoftwareApplication` for the calculator, `FAQPage` on `/faq`, `Article` on blog posts, `BreadcrumbList` on deep pages. Don't copy the same site-level Organization blob onto every page.
- Critical content must render without JavaScript (server component or SSR). Don't move headlines, calculator outputs, or disclosures into client-only `useEffect` rendering.
- Reachable from `sitemap.xml`.
- Descriptive `<title>` and `<meta name="description">`.
- Meaningful URL slug (kebab-case, semantic — `/our-math` not `/p3`).
- For interactive tools, encode the tool's state in the URL so an agent can construct a link with specific assumptions and read back results (the home calculator already does this via `buildQueryFromState` — keep that pattern).
- For data-driven results, expose a JSON endpoint at `/api/...` when feasible so agents can call rather than scrape.

**Patterns to avoid:**
- Critical text rendered only as images (no alt or transcript).
- Cookie banners or interaction gates blocking content.
- Different content for bots vs humans (cloaking — violates platform policies).
- Repeating the same Organization JSON-LD across many pages — agents weight repetition down.

When in doubt, check the canonical agent-readiness notes in the global write-up; surface gaps as backlog items.
