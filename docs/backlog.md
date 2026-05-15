# Project Backlog

Tracked items for youarepayingtoomuch.com. One-liner per item with enough context to act on later.

## Build & Tooling

- [ ] Investigate/silence Turbopack warning: `tailwind.config.ts` references `./src/styles/tokens` but Turbopack module resolution throws a non-fatal warning. Tokens file exists and utilities generate correctly  this is a resolution path issue, not a missing file. *(added 2025-02-11)*
- [ ] **Replace `tailwind.config.ts` `import { tokens }` pattern.** Reproduced on a fresh clone: Turbopack 16.1.5 fails to resolve `./src/styles/tokens` from `tailwind.config.ts`, surfacing as `Module not found` during `next build`. Tailwind v4 ignores `tailwind.config.ts`-style config in favor of the `@config "../../tailwind.config.ts";` directive in `globals.css` plus CSS-first `@theme` tokens, so the import is dead weight that still trips the bundler. Action: convert `src/styles/tokens.ts` to a `@theme` block in `globals.css` (or import the token values directly into the components that need them at runtime) and remove the `import { tokens }` line from `tailwind.config.ts`. Vercel currently treats it as a warning and ships, but a strict CI would fail. *(added 2026-05-15)*
- [ ] Audit `.gitignore` for completeness: current rules cover scratch file patterns (`2026-*.txt`, `nul`, `init.txt`, `*.log`). Review periodically as new temp file patterns emerge. *(added 2025-02-11)*

## Security & Supply Chain

- [ ] **Dependabot vulnerability backlog: 50 alerts (1 critical, 27 high, 18 moderate, 4 low)** on default branch as of 2026-05-15. View: https://github.com/dvanosdol88/ria-marketing-page/security/dependabot. Dedicate one session to: (1) triage the **critical** alert first  do not defer past first paying client, (2) batch-merge the queued Dependabot PRs (`#118` `#119` `#122` `#123` `#124` were observed in deploy history), (3) run `npm audit --omit=dev` after merges to confirm count drops, (4) decide whether `firebase-admin` is still needed  it pulls a large transitive surface and may be replaceable now that the calculator is fully client-side. *(added 2026-05-15)*
- [ ] **Branch-protection rule on `main` is being bypassed.** Push from this session produced `remote: Bypassed rule violations for refs/heads/main: Changes must be made through a pull request.` Someone (probably you, possibly Codex) configured a "must use PRs" rule, and the PAT used had enough scope to bypass it. Decide: (a) keep direct-to-main for solo work and remove the rule (less noise, honest with reality), or (b) enforce PR-and-merge for non-trivial changes and remove bypass-allowed roles from the rule. The mixed state is the worst of both worlds  the rule logs noise on every legit push without preventing anything. *(added 2026-05-15)*

## Content & Pages

- [ ] Continue pillar consolidation: `/upgrade-your-advice` consolidation is complete. Apply same pattern to remaining pillars (`/save-a-ton`, `/improve-your-tools`, `/meaning`, `/how-it-works`). *(added 2025-02-11)*
- [ ] Gallery page: verify all route thumbnails render correctly after cleanup of deleted-route entries and removed sections. *(added 2025-02-11)*

## Design & Branding

- [ ] Logo refinement: continue Venn diagram concept exploration with dollar sign symbols and text arrangements around "The SMARTER way to wealth" tagline. *(added 2025-02-11)*
- [ ] Confirm design token coverage: ensure `src/styles/tokens.ts` covers all brand colors, typography, and spacing values used across production pages. *(added 2025-02-11)*

---

*Format guidelines: Keep items as one-liners with enough context to act on. Add date when item is created. Check off and move to a "## Done" section at the bottom when completed rather than deleting.*
