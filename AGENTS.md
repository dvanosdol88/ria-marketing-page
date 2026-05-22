# AGENTS.md (Project)

## Project: RIA-marketing-page
- Domain: youarepayingtoomuch.com (no dashes)
- Purpose: Fee calculator/visualization tool showing the impact of investment fees over time

For all architecture rules, safety rules, coding standards, tool usage, and workflow — follow your global ~/.codex/AGENTS.md instructions.

## Design: mobile-first

Effective 2026-05-22, `youarepayingtoomuch.com` is mobile-first, not merely mobile-aware. For new design and implementation work, start with the smallest practical viewport first, then scale up to tablet and desktop.

- Make layout, typography, spacing, tap targets, and information density work first around a 375px-wide mobile viewport.
- Treat desktop as a progressive enhancement of the mobile experience, not the source design that gets compressed afterward.
- Do not perform a retroactive mobile-first audit of the full site unless explicitly requested. During normal work, flag and fix only glaring mobile issues such as overflow, illegible text, broken tap targets, or incoherent stacking.


## Project Backlog
- Tracked items live in docs/backlog.md
- When encountering new issues or tech debt during a session, suggest adding them to the backlog
- When completing work that resolves a backlog item, mark it done
