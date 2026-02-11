# Project Backlog

Tracked items for youarepayingtoomuch.com. One-liner per item with enough context to act on later.

## Build & Tooling

- [ ] Investigate/silence Turbopack warning: `tailwind.config.ts` references `./src/styles/tokens` but Turbopack module resolution throws a non-fatal warning. Tokens file exists and utilities generate correctly  this is a resolution path issue, not a missing file. *(added 2025-02-11)*
- [ ] Audit `.gitignore` for completeness: current rules cover scratch file patterns (`2026-*.txt`, `nul`, `init.txt`, `*.log`). Review periodically as new temp file patterns emerge. *(added 2025-02-11)*

## Content & Pages

- [ ] Continue pillar consolidation: `/upgrade-your-advice` consolidation is complete. Apply same pattern to remaining pillars (`/save-a-ton`, `/improve-your-tools`, `/meaning`, `/how-it-works`). *(added 2025-02-11)*
- [ ] Gallery page: verify all route thumbnails render correctly after cleanup of deleted-route entries and removed sections. *(added 2025-02-11)*

## Design & Branding

- [ ] Logo refinement: continue Venn diagram concept exploration with dollar sign symbols and text arrangements around "The SMARTER way to wealth" tagline. *(added 2025-02-11)*
- [ ] Confirm design token coverage: ensure `src/styles/tokens.ts` covers all brand colors, typography, and spacing values used across production pages. *(added 2025-02-11)*

---

*Format guidelines: Keep items as one-liners with enough context to act on. Add date when item is created. Check off and move to a "## Done" section at the bottom when completed rather than deleting.*
