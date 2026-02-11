# Build a Visual Triage Gallery for RIA Marketing Site

## Context

This is a Next.js 14+ project (App Router, Tailwind CSS, TypeScript) for an RIA (Registered Investment Advisor) marketing website at youarepayingtoomuch.com. Over the course of development, **50+ page variants and components** were built exploring different ways to present the same value propositions. Most are experimental iterations — only a handful will become production pages.

**The problem:** There's no way to see everything at a glance. The owner needs to visually evaluate all variants side by side, score them, and decide what to keep, merge, or cut.

**What to build:** A triage gallery page at `/gallery` that displays every page variant as a scaled-down live iframe preview, organized by category, with scoring controls next to each thumbnail.

## Existing Pattern to Follow

There's already a page at `src/app/upgrade-summary-1-10/page.tsx` that does something similar — it shows upgrade pages 1-10 as full-width iframes stacked vertically, grouped by theme. **Read that file first** to understand the component pattern (PagePreview component with iframe, "Open in new tab" link, title, description).

However, the gallery needs to be **more compact** than that page:
- Use a **grid layout** (2-3 columns on desktop) with scaled-down previews instead of full-width stacked iframes
- Each preview should be ~300-400px tall with `transform: scale(0.5)` or similar CSS scaling inside a fixed container to show the full page in miniature
- Click/expand to see full-size version (modal or inline expand)

## Gallery Organization

Organize the gallery into these sections. **Every route listed below MUST appear in the gallery.** The sections provide logical grouping, but include ALL items even if placement feels imperfect.

### Section 1: UPGRADE YOUR ADVICE
*"I am more qualified and less conflicted"*

**Sub-group: Personal Story**
| Route | Description |
|-------|-------------|
| `/upgrade1` | Original "I left a good firm" with credential cards |
| `/upgrade2` | Same + "What This Looks Like in Practice" section |

**Sub-group: Credential Education**
| Route | Description |
|-------|-------------|
| `/upgrade3` | Comprehensive with 10 cited sources, academic tone |
| `/upgrade4` | Near-duplicate of upgrade3 |
| `/upgrade5` | Data visualizations — Recharts FeeChart, CFA Funnel, Advisor Matrix |
| `/upgrade6` | Badge-focused design with CFA image, rarity stats |
| `/upgrade7` | Newspaper-style with "By The Numbers" comparison table |
| `/upgrade8` | Dark theme, FAQ structured data, verification links |

**Sub-group: Independence & Custodian**
| Route | Description |
|-------|-------------|
| `/upgrade-your-advice-v0` | Directory route variant |
| `/upgrade-your-advice-v0-cgpt` | Strongest "Keep your custodian" messaging + FAQ |
| `/upgrade-your-advice-v0-gemini` | Tailwind CDN standalone variant |

**Sub-group: Production & Meta**
| Route | Description |
|-------|-------------|
| `/upgrade` | Compact credential verification page |
| `/upgrade-your-advice` | ⚠️ PRODUCTION ROUTE — currently placeholder |
| `/quarterfinal-1` | Tournament-themed "1% Dynasty vs Flat-Fee Fiduciary" |
| `/upgrade-summary-1-10` | Existing meta page showing all 10 upgrades |

### Section 2: TASK vs PURPOSE (Jensen Huang Framework)
*"Your advisor does tasks. I focus on purpose."*

**IMPORTANT: This section must be prominent. The Jensen Huang "Task vs Purpose" concept is a key differentiator the owner wants to build around. The `/meaning` page has an embedded Spotify player with the actual Jensen Huang clip (episode URI: spotify:episode:4kSlkESoQ8GPU6meWACSlf, starts at 15:27).**

| Route | Description |
|-------|-------------|
| `/upgrade9` | "What's my job? Really." — The Dirty Secret, Task vs Purpose columns |
| `/upgrade10` | ★ Most polished — strikethrough headline, industry exposé, 4 solution cards |
| `/meaning` | **HAS JENSEN HUANG VIDEO** — Spotify embed at 15:27, "Task isn't the job" narrative |
| `/meaning1` | "The Radiologist & The Scan" — Engine vs Pilot framework, Jensen attribution |

### Section 3: IMPROVE YOUR TOOLS
*"Better software than off-the-shelf"*

| Route | Description |
|-------|-------------|
| `/improve` | Static hero headline, FeatureSection components, comparison cards |
| `/improve1` | ImprovePage component version=1 |
| `/improve2` | ImprovePage component version=2 |
| `/improve3` | ImprovePage component version=3 |
| `/improve-your-tools-v0` | Config-driven with AnimatedHeader + zoomable RightCapital images |
| `/improve-your-tools` | ⚠️ PRODUCTION ROUTE — has AnimatedHeader but placeholder content |

### Section 4: SAVE A TON
*"Are you REALLY getting $30K worth of value?"*

| Route | Description |
|-------|-------------|
| `/save1` | Foundation — "Arithmetic of Active Management", Control Matrix |
| `/save2` | Blues/Corals palette — quote cards, fee quintile bar chart |
| `/save3` | ★ Most interactive — 4-slider calculator, tabbed evidence, dual charts |
| `/save` | Wrapper rendering SaveProofClient with fee projection charts |
| `/save-a-ton` | ⚠️ PRODUCTION ROUTE — currently placeholder |

### Section 5: HOW IT WORKS
*"What happens when you sign up"*

| Route | Description |
|-------|-------------|
| `/how-it-works` | Technical page — URL param persistence, fee projection math |
| `/how-it-works/substitution` | ★ Interactive Portfolio Architect — 3-step process with Recharts donut, fund substitution demo, WordArt goal images |

### Section 6: HOME & ENTRY POINTS

| Route | Description |
|-------|-------------|
| `/` | Production home — CostAnalysisCalculator + footer |
| `/v2` | Extended home — Calculator + Equation of Value + Three Pillars + Philosophy |
| `/faq` | ⚠️ Placeholder — empty FAQ shell |

### Section 7: STANDALONE FILES (Not Iframeable)

These are `.html`, `.jsx`, and `.md` files sitting in `src/app/` that are NOT Next.js routes. They **cannot be loaded via iframe from localhost**. Instead, display them as **cards with file metadata** (name, size, summary) and a note that they must be opened directly. Include a "View Source" or file path reference.

| File | Description |
|------|-------------|
| `src/app/upgrade-your-advice-v0.html` (52KB) | Master reference HTML — extracts from upgrades v1-v8 |
| `src/app/upgrade-your-advice-v0-cgpt.html` (27KB) | Polished HTML — strongest "Keep your custodian" messaging |
| `src/app/upgrade-your-advice-v0-gemini.html` (12KB) | Tailwind CDN HTML with comparison table |
| `src/app/Improve-tools-header-final-responsive.jsx` (16KB) | Most polished animated header — responsive, uses brand #00A540, HAS green underlines |
| `src/app/Improve-tools-header-v0.jsx` (9.6KB) | Earlier animated header — desktop only |
| `src/app/new-route-gemini.md` (11.4KB) | HTML mockup despite .md extension — "Upgrade Your Advice" |
| `src/app/new-route-cgpt.md` (6KB) | Markdown copy with FAQ + publishing instructions |

### Section 8: SHARED COMPONENTS (Not Full Pages)

These are reusable components in `src/components/` that aren't standalone pages but contain important content and logic. Display as **info cards** with component name, file path, what imports them, and a brief description. No iframe needed.

**Calculator & Charts:**
| Component | Path | Used By |
|-----------|------|---------|
| CostAnalysisCalculator | `src/components/CostAnalysisCalculator.tsx` | `/` (home), `/v2` |
| CostAnalysisCalculator.original | `src/components/CostAnalysisCalculator.original.tsx` | Backup version |
| FeeComparisonChart | `src/components/charts/FeeComparisonChart.tsx` | SaveProofClient |
| FeeBreakdownBars | `src/components/charts/FeeBreakdownBars.tsx` | SaveProofClient |
| ProFeeChart | `src/components/charts/ProFeeChart.tsx` | Unknown |

**Improve Components:**
| Component | Path | Used By |
|-----------|------|---------|
| AnimatedHeader | `src/components/improve/AnimatedHeader.tsx` | `/improve-your-tools`, `/improve-your-tools-v0` |
| ImprovePage | `src/components/improve/ImprovePage.tsx` | `/improve1`, `/improve2`, `/improve3` |
| FeatureSection | `src/components/improve/FeatureSection.tsx` | `/improve` |
| FeatureSectionStacked | `src/components/improve/FeatureSectionStacked.tsx` | `/improve-your-tools-v0` |
| ComparisonCard | `src/components/improve/ComparisonCard.tsx` | `/improve` |
| HeroImage | `src/components/improve/HeroImage.tsx` | `/improve` |

**Save Components:**
| Component | Path | Used By |
|-----------|------|---------|
| SaveProofClient | `src/components/save/SaveProofClient.tsx` | `/save` |
| SavingsMeter | `src/components/save/SavingsMeter.tsx` | SavingsMetersGrid |
| SavingsMetersGrid | `src/components/save/SavingsMetersGrid.tsx` | SaveProofClient |

**Other Components:**
| Component | Path | Used By |
|-----------|------|---------|
| DesignerNav | `src/components/DesignerNav.tsx` | Many pages (dev navigation) |
| ScrollReveal | `src/components/ScrollReveal.tsx` | Production routes |
| Quiz | `src/components/Quiz.tsx` | Unknown |
| QuoteTicker | `src/components/QuoteTicker.tsx` | Unknown |
| QuoteTickerWithPortraits | `src/components/QuoteTickerWithPortraits.tsx` | Unknown |
| ValueCards | `src/components/value-cards/ValueCards.tsx` | Unknown |
| ValueSection | `src/components/value-cards/ValueSection.tsx` | Unknown |
| DonutChart | `src/components/value-cards/DonutChart.tsx` | Unknown |

## Status Code Scoring System

Each preview card needs a dropdown or button group for scoring. Persist selections to localStorage so the owner can revisit without losing progress.

| Code | Label | Color | Meaning |
|------|-------|-------|---------|
| ★ | Winner | Gold/Yellow | Production ready — slot into final page |
| W | Workshop | Blue | Needs refinement — rework later |
| C | Compare | Purple | Need side-by-side view with another |
| M | Merge | Orange | Combine best parts of two versions |
| A | Archive | Gray | Not using but don't delete |
| X | Cut | Red | No value — delete in cleanup |
| ? | Revisit | Light gray | Can't decide yet (default) |

## UI Requirements

1. **Grid layout**: 2 columns on desktop (xl: 3 columns), 1 column on mobile
2. **Iframe scaling**: Use CSS transform to show full pages in ~350px tall containers. Something like:
   ```css
   .preview-frame {
     width: 1280px;
     height: 900px;
     transform: scale(0.3);
     transform-origin: top left;
   }
   .preview-container {
     width: 100%;
     height: 350px;
     overflow: hidden;
   }
   ```
3. **Click to expand**: Clicking a preview opens it larger (modal overlay or inline expansion to full width). Include "Open in new tab" link.
4. **Section headers**: Each section gets a colored header with the section name and tagline
5. **Section navigation**: Sticky jump-nav at top to scroll to any section
6. **Status controls**: Dropdown or segmented button below each preview. Color-coded. Saved to localStorage key like `gallery-status-{route}`.
7. **Summary bar**: Floating or sticky bottom bar showing counts: "★: 3 | W: 5 | C: 2 | M: 1 | A: 8 | X: 4 | ?: 22"
8. **Filter/sort**: Option to show only items with a specific status (e.g., "Show only ★" or "Show only ?")
9. **For non-iframeable items** (Sections 7 & 8): Show as styled info cards with file details instead of iframe previews. Use a different card style (e.g., dashed border) so they're visually distinct.

## Technical Notes

- This is a **Next.js App Router** project. Create the gallery as `src/app/gallery/page.tsx`.
- Use `'use client'` since it needs useState for status tracking and localStorage.
- The dev server runs on `localhost:3000`. All iframe `src` values should use relative paths (e.g., `/upgrade1` not `http://localhost:3000/upgrade1`).
- Use Tailwind CSS classes (already configured in the project).
- Use `loading="lazy"` on all iframes for performance.
- The project uses TypeScript — type everything properly.
- Do NOT install any new dependencies. Use only what's already in the project (React, Next.js, Tailwind).

## What Success Looks Like

When the owner visits `localhost:3000/gallery`, they see:
1. A sticky nav bar at top with section links
2. A grid of scaled-down page previews organized by section
3. Each preview has: title, one-line description, status dropdown, "Open in new tab" link
4. Clicking a preview expands it for closer inspection
5. Status selections persist across page reloads
6. A summary bar showing how many items are in each status category
7. The Jensen Huang / "Task vs Purpose" section is visually prominent (Section 2)
8. Non-route files appear as info cards with metadata
9. Shared components appear as reference cards showing what uses them

Build the complete page in a single file at `src/app/gallery/page.tsx`. It will be long — that's expected. Prioritize functionality over visual polish.
