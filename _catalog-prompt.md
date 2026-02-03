# RIA Marketing Page — Content Catalog Prompt

## YOUR ROLE
You are scanning source files for an RIA (Registered Investment Advisor) marketing website built with Next.js. Your job is to read each file, identify every distinct content section/component, and append your findings to a catalog file on disk.

## CONTEXT
- This is a Next.js project at `D:\RIA\RIA-marketing-page`
- The site has three final production pages: `/save-a-ton`, `/upgrade-your-advice`, `/improve-your-tools`
- There are many experimental iterations (upgrade1-10, save1-3, improve1-3, etc.) that contain content worth cataloging
- The owner (David) needs a complete inventory of every unique content piece across all iterations so he can decide what to keep vs. discard
- The RIA business uses a flat-fee model ($100/month) instead of traditional AUM fees. David holds CFA and CFP credentials.

## TOOLS
Use Desktop Commander to read files and write output. You have access to the Windows filesystem.

## OUTPUT FILE
Append all findings to: `D:\RIA\RIA-marketing-page\_catalog.md`

**CRITICAL:** Use `mode: 'append'` when writing to `_catalog.md` (except for the very first batch, which creates the file). Never overwrite — only append.

## WHAT TO EXTRACT FROM EACH FILE
For each file you scan, identify and record:

1. **Sections/Components** — Every visually distinct section of the page (hero, features, testimonials, CTA, footer, etc.)
2. **Interactive elements** — Calculators, sliders, charts, animations, embedded videos
3. **Key content** — Specific value propositions, statistics, quotes, or messaging that's unique to that iteration
4. **Assets referenced** — Images, GIFs, videos, icons referenced by the file (src paths)
5. **Notable code patterns** — Shared components imported, custom hooks, animation libraries used

## OUTPUT FORMAT
For each file, write a block like this:

```
---
### [filename] — [category: upgrade/save/improve/other]
**Path:** `src/app/upgrade3/page.tsx`
**Size:** 29KB | **Last modified:** 2026-01-22
**Summary:** One-sentence description of what this page iteration focuses on.

**Sections found:**
- [ ] Hero: Animated header with "Upgrade Your Advice" tagline
- [ ] Fee Comparison: Interactive bar chart showing AUM vs flat-fee savings
- [ ] Credentials: CFA/CFP badges with verification links
- [ ] Three Pillars: "Better Tools → Better Info → Better Decisions"
- [ ] Jensen Huang Video: Embedded video about "task vs purpose"
- [ ] CTA: "Schedule a consultation" button

**Assets referenced:**
- `/public/DVO Head Shot picture.jpg`
- `/public/e7e2a584-b923-4249-a863-9a49b6850ef0.png` (CFA badge)

**Unique content worth noting:**
- Contains a donut chart calculator not seen in other versions
- Uses framer-motion for scroll animations

**Duplicates/overlaps:**
- Hero section is nearly identical to upgrade2
- Fee chart is a refined version of the one in upgrade1
---
```

The checkboxes `- [ ]` are intentional. David will later use these to mark what to keep.

## HOW TO WORK
1. Read each file using Desktop Commander's `read_file` tool
2. Analyze the content — don't just dump raw code, interpret what each section IS
3. Append your findings to `_catalog.md`
4. After finishing all files in the batch, write a brief summary at the end noting: total unique components found, most common duplicates, and any surprises
5. Report back to David in the chat with a short summary (NOT the full catalog — that's on disk)

## IMPORTANT RULES
- **Do NOT paste full file contents into the conversation.** Summarize and write to disk.
- **Do NOT move, rename, or delete any files.** Read-only operation.
- **Do NOT modify any source code.** You are only cataloging.
- For very small files (<1KB), they're likely thin wrappers. Note what they import/redirect to and move on.
- If two iterations have nearly identical sections, note the duplication but still catalog both. David decides what to keep.

---

## BATCH INSTRUCTIONS

**Current batch: BATCH 1 — Upgrade files**

Scan these files in order (largest first, they have the most content):

1. `src/app/upgrade-your-advice-v0.html` (52KB)
2. `src/app/upgrade8/page.jsx` (31KB)
3. `src/app/upgrade3/page.tsx` (29KB)
4. `src/app/upgrade4/page.tsx` (29KB)
5. `src/app/upgrade-your-advice-v0-cgpt.html` (27KB)
6. `src/app/upgrade5/page.tsx` (18KB)
7. `src/app/upgrade2/page.tsx` (15KB)
8. `src/app/upgrade10/page.tsx` (15KB)
9. `src/app/upgrade9/page.tsx` (14KB)
10. `src/app/upgrade1/page.tsx` (13KB)
11. `src/app/upgrade6/page.jsx` (13KB)
12. `src/app/upgrade-your-advice-v0-gemini.html` (12KB)
13. `src/app/upgrade7/page.jsx` (11KB)
14. `src/app/upgrade-summary-1-10/page.tsx` (9KB)
15. `src/app/upgrade/page.tsx` (8KB)
16. `src/app/quarterfinal-1/page.tsx` (7KB)
17. `src/app/upgrade-your-advice/page.tsx` (2KB) — this is the FINAL production route

**Start by creating `_catalog.md` with this header:**

```markdown
# RIA Marketing Page — Content Catalog
Generated starting: [today's date]
Purpose: Inventory of all content sections across page iterations.
Check the box next to sections you want to KEEP for production.

## How to Use This Document
1. Review each section listing
2. Check the `[ ]` box for sections/content you want to keep: change to `[x]`
3. Leave unchecked items will be candidates for archival/deletion
4. Notes can be added after any line

---

## UPGRADE Category
```

**Then scan all 17 files and append findings.**

**When done, end with:**
```markdown
---
### BATCH 1 SUMMARY — Upgrade Category
- Total files scanned: X
- Unique sections/components found: X
- Most duplicated content: [list top 3]
- Recommended "best version" candidates: [your picks]
- Surprises or notable findings: [anything unexpected]
---
```

Then report back to David with a short chat summary.
