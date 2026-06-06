# Project Backlog

Tracked items for youarepayingtoomuch.com. One-liner per item with enough context to act on later.

## Build & Tooling

- [ ] Investigate/silence Turbopack warning: `tailwind.config.ts` references `./src/styles/tokens` but Turbopack module resolution throws a non-fatal warning. Tokens file exists and utilities generate correctly  this is a resolution path issue, not a missing file. *(added 2025-02-11)*
- [ ] **Replace `tailwind.config.ts` `import { tokens }` pattern.** Reproduced on a fresh clone: Turbopack 16.1.5 fails to resolve `./src/styles/tokens` from `tailwind.config.ts`, surfacing as `Module not found` during `next build`. Tailwind v4 ignores `tailwind.config.ts`-style config in favor of the `@config "../../tailwind.config.ts";` directive in `globals.css` plus CSS-first `@theme` tokens, so the import is dead weight that still trips the bundler. Action: convert `src/styles/tokens.ts` to a `@theme` block in `globals.css` (or import the token values directly into the components that need them at runtime) and remove the `import { tokens }` line from `tailwind.config.ts`. Vercel currently treats it as a warning and ships, but a strict CI would fail. *(added 2026-05-15)*
- [ ] Audit `.gitignore` for completeness: current rules cover scratch file patterns (`2026-*.txt`, `nul`, `init.txt`, `*.log`). Review periodically as new temp file patterns emerge. *(added 2025-02-11)*

## Security & Supply Chain

- [ ] **Dependabot vulnerability backlog: 50 alerts (1 critical, 27 high, 18 moderate, 4 low)** on default branch as of 2026-05-15. View: https://github.com/dvanosdol88/ria-marketing-page/security/dependabot. Remaining work (some preconditions are now done, see Done section): (1) identify the **critical** alert in the Security tab and merge whichever queued dep PR resolves it (or open one if none exists), (2) once the Renovate-only policy is fully in effect (Settings toggle below), close the leftover `dependabot/*` PRs and let Renovate re-discover what's still needed, (3) run `npm audit --omit=dev` after merges to confirm count drops, (4) **decision recorded**: `firebase-admin` is still required — powers the quiz poll API (`src/lib/firebaseAdmin.ts` → `src/app/api/quiz/vote/route.ts` → Firestore, called from `src/components/Quiz.tsx`, embedded twice in `CostAnalysisCalculator.tsx`). Removing it requires migrating quiz vote storage to a lighter backend (Vercel KV or similar). Track that as a separate item if desired. *(added 2026-05-15, updated 2026-05-17)*
- [ ] **Finish disabling Dependabot security-update PRs.** PR #131 (merged 2026-05-17) added `.github/dependabot.yml` capping version-update PRs at 0, codifying the "Renovate only" policy already in `docs/DEPENDENCY_STRATEGY.md`. The matching toggle for security updates must be flipped manually: **Settings → Code security → "Dependabot security updates" → off**. Until that's done, Dependabot may still occasionally open a security PR that competes with Renovate's `vulnerabilityAlerts` flow. *(added 2026-05-17)*
- [ ] **Branch-protection rule on `main` is being bypassed.** Push produced `remote: Bypassed rule violations for refs/heads/main: Changes must be made through a pull request.` A "must use PRs" rule is configured, and the PAT used had enough scope to bypass it. Decide: (a) keep direct-to-main for solo work and remove the rule (less noise, honest with reality), or (b) enforce PR-and-merge for non-trivial changes and remove bypass-allowed roles from the rule. The mixed state is the worst of both worlds — the rule logs noise on every legit push without preventing anything. *(added 2026-05-15)*

## Open PR triage (non-dep)

- [ ] **#128** — Cursor Cloud dev-env section for AGENTS.md (newer/better version). Action: mark ready, merge. *(added 2026-05-17)*
- [ ] **#127** — duplicate of #128, smaller. Action: close in favor of #128 (the cleanup agent's PAT lacked PR-close permission). *(added 2026-05-17)*
- [x] **#126** — feat: agent-ready site metadata (robots.txt, sitemap.xml, /llms.txt, Org/WebSite/WebApplication JSON-LD, /api/calculator). Implemented directly on `main` with root agent files, structured calculator endpoint, and campaign QR context. *(added 2026-05-17, completed 2026-06-06)*
- [ ] **#112** — Vitest test infra + 2.6k-line unit-test addition (draft, 2026-04-20). User decision: adopt the framework now or defer. Decision required before this can be merged or closed. *(added 2026-05-17)*
- [ ] **#62** — `recovery/calculator-clean-20260227`: 178 add / 553 del mobile redesign of sticky header + calculator. 11+ weeks old; calculator has been polished multiple times since (#129, etc.). Likely superseded — verify nothing useful remains, then close. *(added 2026-05-17)*
- [ ] **#48** — `cursor/openclaw-installation-37e2`: 9.9k-line exploratory branch from 2026-02-16. `docs/openclaw-automation-ideas.md` already captures the concept. Action: close as exploratory unless there's specific code worth salvaging. *(added 2026-05-17)*

## Done (2026-05-17 session)

- [x] **Editorial canon (one of three model outputs)** landed on `main` of both repos as `docs/content-strategy.md`, with a top-of-file disclaimer that this is one of three model responses and that the three should be reviewed together by David before any section becomes adopted policy. Sister: `smarter-way-wealth#13`. This repo: #125. *(2026-05-17)*
- [x] **Gemini auto-review on PR open disabled** (#130). Setting `GEMINI_CLI_TRUST_WORKSPACE=true` in the action env did not stop the trusted-folder failure, so `pull_request: opened` was removed from the dispatch trigger. `@gemini-cli /review` slash-command remains. *(2026-05-17)*
- [x] **Dependabot version-update PRs silenced** (#131). `.github/dependabot.yml` caps open PRs per ecosystem at 0; `docs/DEPENDENCY_STRATEGY.md` updated with the "One bot, not two" section. Renovate is now the documented sole bot. *(2026-05-17)*
- [x] **Sister repo `smarter-way-wealth` brought under the same dep policy** (PR open at `smarter-way-wealth#14`, not yet merged — needs Renovate App install on that repo first; see SWW PR body). *(2026-05-17)*

## Content & Pages

- [ ] **Decide on default hero at unparameterized root.** `youarepayingtoomuch.com/` currently renders the "savings-calculator-upgrade" experience ("What would you do with $788,000?" hero). Campaign URLs like `?variant=fiduciary-upgrade` and `?variant=final-home` render the "Upgrade the advice, not the fee" portrait hero. Direct-mail QR codes presumably carry the variant param, so the question only affects organic root traffic. Loop in RIA Chief on riabuilder.dvo88.com for input. **Target check-in: Monday 2026-05-18 10:00 AM CT.** (Originally planned as an iOS reminder for that time; reminder tool was unresponsive during the 2026-05-16 session, so logging here as the durable record.) *(added 2026-05-16)*
- [ ] Continue pillar consolidation: `/upgrade-your-advice` consolidation is complete. Apply same pattern to remaining pillars (`/save-a-ton`, `/improve-your-tools`, `/meaning`, `/how-it-works`). *(added 2025-02-11)*
- [ ] Gallery page: verify all route thumbnails render correctly after cleanup of deleted-route entries and removed sections. *(added 2025-02-11)*

## Design & Branding

- [ ] Logo refinement: continue Venn diagram concept exploration with dollar sign symbols and text arrangements around "The SMARTER way to wealth" tagline. *(added 2025-02-11)*
- [ ] Confirm design token coverage: ensure `src/styles/tokens.ts` covers all brand colors, typography, and spacing values used across production pages. *(added 2025-02-11)*
- [ ] **Hero `?` watermark vs. small-mobile heading collision.** The Satoshi `?` is `text-[13rem]` on mobile and the heading sits at `clamp(2.25rem, 4.8vw, 4rem)`. On 320–375px viewports the `?` can crowd the right edge and feel oversized relative to the 36–48px heading. Options surfaced during a session: (A) drop the mobile `?` to ~`11rem`; (B) keep size but tighten section horizontal padding to give the `?` more breathing room. Decide which after eyeballing on a real phone. Code: `src/components/CostAnalysisCalculator.tsx` ~line 406. *(added 2026-05-22)*

## Declined / Won't Do

- [ ] **Scrollable/zoomable year-window on the fee-projection chart.** User idea: let visitors pan a sub-window of years (e.g. 0–5 or 15–20) so the Y-axis auto-rescales and the fee differential reads larger at any horizon. Prototyped with a Recharts `<Brush>` in #133 against `ProFeeChart` (which powers the default `direct-mail` variant). Discovered the screenshot the user wanted to enhance was actually the `final-home` (`final-c` layout) variant, whose chart is a hand-rolled inline SVG in `HomeCalculatorExperience.tsx` around line 644 — not Recharts — so the Brush approach doesn't transfer. Implementing for the inline SVG would require building a custom drag/window UI (~half-day). **Decision (2026-05-17): not worth the time, skipping for now.** PR #133 closed without merge. *(added 2026-05-17)*

---

*Format guidelines: Keep items as one-liners with enough context to act on. Add date when item is created. Check off and move to a "## Done" section at the bottom when completed rather than deleting.*
