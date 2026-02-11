# RIA Marketing Page — Content Catalog Prompt (Claude Code — Batch 5)

## YOUR ROLE
You are scanning source files for an RIA marketing website (Next.js). Read each file listed below, identify every distinct content section/component, and APPEND your findings to the existing `_catalog.md` at the project root.

## CONTEXT
- Three final production pages: `/save-a-ton`, `/upgrade-your-advice`, `/improve-your-tools`
- Numbered variants (upgrade1-10, save1-3, improve1-3) are content experiments
- David needs a complete inventory so he can decide what to keep vs. discard
- The business is a flat-fee RIA ($100/month) vs. traditional AUM fees. David holds CFA and CFP credentials.
- **Brand primary green: #00A540** — note if files use the correct color vs. other greens

## PREVIOUS BATCHES ALREADY COMPLETE
`_catalog.md` already contains:
- **Batch 1 — UPGRADE** (17 files, ~85 sections)
- **Batch 2 — SAVE** (8 files, ~35 sections)
- **Batch 3 — IMPROVE** (8 files, ~25 sections)
- **Batch 4 — OTHER PAGES + PLANNING DOCS** (9 files, ~55 sections)

**Do NOT overwrite the file.** Append to the end.

Key findings from ALL previous batches:
- **Brand green #00A540** — Only found in Improve-tools-header-final-responsive.jsx and Improve-tools-header-v0.jsx (Batch 3). Check if globals.css or AnimatedHeader.tsx define it.
- **Jensen Huang "Task vs Purpose/Meaning"** — Found in upgrade9, upgrade10, meaning, meaning1. Note if any components reference it.
- **Chart libraries:** Upgrade files use Recharts; Save files use Chart.js (CDN); Improve files use neither; how-it-works/substitution uses Recharts.
- **All production routes** (upgrade-your-advice, save-a-ton, improve-your-tools) + faq are empty placeholders.
- **Component references flagged "not scanned" in earlier batches:**
  - `@/components/improve/AnimatedHeader` — imported by improve-your-tools (production) and improve-your-tools-v0
  - `@/components/improve/ImprovePage` — imported by improve1/2/3 with version={1|2|3} prop
  - `@/components/save/SaveProofClient` — imported by save/page.tsx with calculatorState prop

## RULES
- **READ ONLY.** Do not move, rename, delete, or modify any source files.
- **APPEND to the existing `_catalog.md` on disk.** Do not overwrite.
- Keep terminal output to brief progress updates.
- For utility files, be brief — note what they define and move on.

## STATUS KEY SYSTEM

Use `[_]` (underscore) as the blank marker. David will replace the underscore with one of these codes:

```
★  Winner — Best version. Goes to production as-is.
W  Workshop — Good idea, needs refinement before it's ready.
C  Compare — Need to see next to similar versions before deciding.
     → Add a note saying WHICH files to compare against.
M  Merge — Combine best of this with another version.
     → Note which file has the other piece.
A  Archive — Not using, but worth keeping for reference.
X  Cut — No value. Safe to delete.
?  Revisit — Can't decide yet. Come back later.
```

## WHAT TO EXTRACT

**For shared components:** Describe what the component renders, its props/configuration interface, and cross-reference which page files from Batches 1-4 import or use it.

**For utility files (layout, globals, error, etc.):** Brief note — what they define, any brand colors, shared fonts, global styles.

## OUTPUT FORMAT

**For components** — append a block like this to `_catalog.md`:

```
---
### [filename] — shared component
**Path:** `src/components/improve/AnimatedHeader.tsx`
**Size:** 15.8KB
**Summary:** One-sentence description of what this component renders.

**Color note:** [Does it use brand #00A540 or something else?]

**Props/Config:**
- [list props and their types/purpose]

**What it renders:**
- [_] [visual element]: [description]
- [_] [visual element]: [description]

**Used by (from previous batches):**
- improve-your-tools/page.tsx (Batch 3 — production route)
- improve-your-tools-v0/page.tsx (Batch 3)
- [etc.]

**Unique content worth noting:**
- [what makes this component notable]

**Relationship to other files:**
- [how does this compare to Improve-tools-header-final-responsive.jsx and Improve-tools-header-v0.jsx from Batch 3?]
---
```

**For utility files** — shorter format:

```
---
### [filename] — utility
**Path:** `src/app/globals.css`
**Size:** 2.3KB
**Summary:** [what it defines]
**Brand color check:** [Is #00A540 defined here?]
**Notable:** [fonts, animations, shared classes]
---
```

---

## BATCH 5 — Shared Components + Utility Files (8 files)

Scan in this order (largest first):

### Shared Components (close out "not scanned" flags from Batches 1-4)

1. `src/components/improve/AnimatedHeader.tsx` (15.8KB) — the signature animated header
   - Compare with the two .jsx versions in src/app/ cataloged in Batch 3
2. `src/components/improve/ImprovePage.tsx` (7KB) — version-driven component
   - Used by improve1 (version=1), improve2 (version=2), improve3 (version=3)
3. `src/components/save/SaveProofClient.tsx` (4.5KB) — save page client component
   - Used by save/page.tsx with calculatorState from URL params

### Utility Files

4. `src/app/globals.css` (2.3KB) — **CHECK IF BRAND GREEN #00A540 IS DEFINED HERE**
5. `src/app/layout.tsx` (0.6KB) — root layout (fonts, metadata, body wrapper)
6. `src/app/error.tsx` (1.5KB) — error boundary
7. `src/app/not-found.tsx` (1KB) — 404 page
8. `src/app/loading.tsx` (0.6KB) — loading state

---

**Step 1 — Append the section header to `_catalog.md`:**

```

---

## Shared Components + Utility Files
```

**Step 2 — Read and catalog all 8 files, appending to `_catalog.md`.**

**Step 3 — Append the batch summary:**

```
---
### BATCH 5 SUMMARY — Shared Components + Utility Files
- Total files scanned: X
- Key findings:
  - AnimatedHeader.tsx vs the two .jsx versions: [how do they compare?]
  - ImprovePage.tsx: [what do the 3 versions render differently?]
  - SaveProofClient.tsx: [what does it actually show?]
  - globals.css brand color status: [is #00A540 defined?]

### Animated Header Comparison (all 3 implementations)
- [_] src/components/improve/AnimatedHeader.tsx — [description]
- [_] src/app/Improve-tools-header-final-responsive.jsx (Batch 3) — [how it differs]
- [_] src/app/Improve-tools-header-v0.jsx (Batch 3) — [how it differs]
→ Recommendation: [which is the canonical version?]

### ImprovePage Versions
- [_] version=1: [what it renders]
- [_] version=2: [what it renders]
- [_] version=3: [what it renders]
→ Recommendation: [best version?]
---
```

**Step 4 — Append the FINAL CATALOG STATS:**

```
---

## CATALOG COMPLETE

**Total across all batches:**
- Batch 1 — Upgrade: 17 files
- Batch 2 — Save: 8 files
- Batch 3 — Improve: 8 files
- Batch 4 — Other Pages + Planning Docs: 9 files
- Batch 5 — Shared Components + Utility Files: 8 files
- **TOTAL: 50 files cataloged**

**Brand green #00A540 usage:** [final tally — which files use it, which don't]

**Jensen Huang "Task vs Purpose" locations:** [final list of all files containing it]

**Production route status:**
- /upgrade-your-advice — [placeholder or has content?]
- /save-a-ton — [placeholder or has content?]
- /improve-your-tools — [placeholder or has content?]
- /how-it-works — [placeholder or has content?]
- /faq — [placeholder or has content?]
- / (home) — [placeholder or has content?]

**Uncatalogued components remaining in src/components/:**
[List the ~19 components NOT included in any batch, with file sizes, so David can decide if a component inventory batch is needed]
---
```

**Step 5 — Print a final summary to the terminal** with the total file count, total line count of `_catalog.md`, and a "CATALOG COMPLETE" confirmation.

---

## BATCH PROGRESS TRACKER

- [x] Batch 1 — Upgrade (17 files) ✅
- [x] Batch 2 — Save (8 files) ✅
- [x] Batch 3 — Improve (8 files) ✅
- [x] Batch 4 — Other Pages + Planning Docs (9 files) ✅
- [ ] **Batch 5 — Shared Components + Utility Files (8 files) ← CURRENT (FINAL SCAN)**
- [ ] Next — David reviews catalog, fills in status codes, then we build the visual content map

**This is the final scanning batch.** After this, the full page-level catalog is complete.
