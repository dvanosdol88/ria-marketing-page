# RIA Marketing Page — Cleanup Phase: Root Clutter + Gallery Update

## Context

This prompt continues a multi-step repo cleanup of `D:\RIA\RIA-marketing-page` (Next.js 14, TypeScript, Tailwind CSS).

### What's already done

**Pillar consolidation (all 4 complete):**
- **Upgrade Your Advice** — consolidated to `/upgrade-your-advice` (done in prior session)
- **Improve Your Tools** — consolidated to `/improve-your-tools`; deleted `/improve`, `/improve1`, `/improve2`, `/improve3`, `/improve-your-tools-v0`, plus 2 loose JSX files
- **Save A Ton** — `/save` edited (removed Cumulative Fees card + FeeBreakdownBars import); deleted `/save1`, `/save2`, `/save3`; snippets preserved to `docs/save-snippets/`
- **Task vs Purpose** — all content from `/meaning1`, `/upgrade9`, `/upgrade10` merged into `/meaning`; source routes deleted

**Other deletions already done:**
- `/v2` (home variant)
- `/upgrade-your-advice-v0-gemini` (route dir + loose HTML)
- `src/app/new-route-gemini.md`, `src/app/new-route-cgpt.md`, `src/app/upgrade-quarter-finals-1.css`
- 6 zombie HTML files in `public/` (were already gone before this session)

**Kept intentionally:**
- `public/images/html_calendar1.html`
- `docs/save-snippets/` (reference material for rebuilding Save sections)

---

## Current production routes (keep all)

```
/                        → Home (CostAnalysisCalculator + footer)
/faq                     → Placeholder shell
/upgrade-your-advice     → Production ✅
/meaning                 → Consolidated Task vs Purpose (695 lines, needs future curation)
/improve-your-tools      → Production ⚠️ (has content but needs polish)
/save                    → Fee projection chart + savings meters
/save-a-ton              → Placeholder (future home for merged Save content)
/how-it-works            → Production
/how-it-works/substitution → Production (Portfolio Architect)
/gallery                 → Dev triage tool (needs SECTIONS update — see Task 2)
```

---

## Tasks for this session

### Task 1: Root clutter sweep

Move or delete non-config files cluttering the repo root. Here's the inventory:

**Move to `docs/`:**
- `ARCHITECTURE.md`
- `DEPENDENCY_STRATEGY.md`
- `devops-audit-and-action-plan-final.md`
- `StoryBrand Framework.md`
- `IMPROVE_YOUR_TOOLS_PAGE_PROMPT_1.md`
- `phase2-delete-merged-sources.md`
- `_catalog-prompt.md`
- `_catalog.md`
- `_gallery-prompt.md`

**Move to `scripts/`:**
- `strip-dupes.ps1`
- `strip-footer.ps1`
- `analyze_chart.js`

**Delete (temp/scratch):**
- `2026-02-10-this-session-is-being-continued-from-a-previous-co.txt`
- `nul`
- `init.txt`
- `server.log`
- `slider_styling.txt`
- `assets.html`

**Move to `docs/` or `public/assets/` (images):**
- `Referral-free-month-flow-RIA-marketing.png`
- `shadow-couple-A.png`

**Leave at root (config files — do not move):**
- `.cursorrules`, `.eslintrc.json`, `.env.local`, `.gitignore`
- `CLAUDE.md`, `AGENTS.md`, `GEMINI.md` (AI agent instruction files)
- `next.config.mjs`, `package.json`, `package-lock.json`
- `postcss.config.js`, `tailwind.config.ts`, `tsconfig.json`, `tsconfig.tsbuildinfo`
- `next-env.d.ts`, `renovate.json`, `vercel.json`
- `dvo-projects.code-workspace`, `README.md`
- `logo/` directory

**After moving files, update `.gitignore` to prevent future clutter:**
```
# Session dumps and temp files
2026-*.txt
nul
*.log
init.txt
```

### Task 2: Update gallery SECTIONS

The `SECTIONS` array in `src/app/gallery/page.tsx` is now stale. Many routes it references no longer exist. Update it to match the current production routes listed above.

**Remove these entries from SECTIONS (routes deleted):**
- `/upgrade-your-advice-v0-gemini`
- `/v2`
- `/improve`, `/improve1`, `/improve2`, `/improve3`, `/improve-your-tools-v0`
- `/save1`, `/save2`, `/save3`
- `/meaning1`, `/upgrade9`, `/upgrade10`

**Remove the "STANDALONE FILES" section entirely** — all those files have been deleted or moved.

**Remove the "SHARED COMPONENTS" section** — component cleanup is deferred to a later pass.

**Keep and update these sections:**
- UPGRADE YOUR ADVICE — only `/upgrade-your-advice`
- TASK vs PURPOSE — only `/meaning`
- IMPROVE YOUR TOOLS — only `/improve-your-tools`
- SAVE A TON — `/save` and `/save-a-ton`
- HOW IT WORKS — `/how-it-works` and `/how-it-works/substitution`
- HOME & ENTRY POINTS — `/` and `/faq`

### Task 3: Verify build

After all changes, run:
```powershell
Set-Location D:\RIA\RIA-marketing-page
npm run build
```

Fix any import errors from deleted files. Likely candidates:
- Components in `src/components/improve/` that were only used by deleted routes (ImprovePage, FeatureSection, ComparisonCard, HeroImage, FeatureSectionStacked)
- `FeeBreakdownBars` — import was removed from SaveProofClient but component file still exists
- Any references to deleted routes in navigation components

---

## Principles

- **When in doubt, keep it.** Deletion is easy later; recovery is hard.
- **Don't touch production page content.** This session is structural cleanup only.
- **Don't add CI, linting rules, or governance tooling.** That's premature.
