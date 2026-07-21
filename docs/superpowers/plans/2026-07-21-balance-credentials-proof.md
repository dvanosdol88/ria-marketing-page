# Balanced Credentials Proof Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebalance the credentials accordion so the three credential words align and read as the focal points, while the 20%-larger CFA and CFP badges form a centered right-hand group on desktop and remain comfortable on mobile.

**Architecture:** Keep the existing `ProofAccordionCard` and its data-driven rendering. Represent the three credential sentences as structured summary lines so the emphasized word can occupy one shared CSS-grid column without changing the sentence wording; only the credentials card receives the two-column proof layout. Add one real-browser regression script that starts the existing Next.js app, checks the requested geometry at 375px and 1405px, and exits cleanly.

**Tech Stack:** Next.js 16, React 18, TypeScript, Tailwind CSS 4, Playwright 1.58, Node.js.

## Global Constraints

- Start at a 375px-wide mobile viewport, then scale to desktop.
- Preserve the exact three sentences: `The rigor and investment expertise of a CFA Charterholder.`, `The planning and process of a CFP® professional.`, and `20+ years of real advisory experience.`
- Align the starts of the three bold words `CFA`, `CFP®`, and `experience` in one vertical column at desktop widths.
- Put the sentences a little closer together than the current `space-y-3` rhythm.
- Add visible padding between the green accordion header and the first sentence.
- Increase both badge containers by 20% from their current sizes: CFA from 86px/96px to approximately 103px/115px and CFP from 108px/120px to 130px/144px.
- Put the badges to the right of the sentence/stat block and center them as one balanced group on desktop; at 375px, stack them below and center them without horizontal overflow.
- Preserve accordion toggling, reduced-motion behavior, accessible sentence text, logo alternative-text behavior, the 20+ stat, and all unrelated cards.
- Do not add dependencies or change production/deployment configuration.
- Preserve the user-owned untracked `output/charts/` directory in the primary checkout.

---

### Task 1: Rebalance and verify the credentials proof card

**Files:**
- Modify: `src/components/AdvisorProofSections.tsx:12-67,351-462`
- Create: `tests/advisor-proof-credentials-layout.mjs`
- Modify: `package.json:scripts`

**Interfaces:**
- Consumes: `ProofAccordionCard`, the existing credential badge assets, the `/upgrade-your-advice` route, and the locally installed `playwright` package.
- Produces: structured credential summary lines rendered as complete sentences, `data-credential-summary`, `data-credential-keyword`, and `data-credential-badges` hooks for the browser regression; `npm run test:credentials-layout` as the focused verification command.

- [x] **Step 1: Write the failing browser regression before production code**

Create `tests/advisor-proof-credentials-layout.mjs`. The script must:

1. Start `next dev` on an unused localhost port with `windowsHide: true`.
2. Wait for `/upgrade-your-advice` to respond.
3. Launch Chromium through the existing `playwright` package.
4. At 375px, assert the page has no horizontal overflow, the three keywords are bold and in document order, the badge group sits below the summary, and badge containers are approximately 103px and 130px.
5. At 1405px, assert the three keyword left edges are aligned within 1px, the first sentence begins at least 16px below the accordion header, adjacent sentence rows have less than the current 12px blank-space rhythm, the badge group begins to the right of the summary, and badge containers are approximately 115px and 144px.
6. Close Chromium and terminate the spawned Next.js process in `finally`, including Windows descendants via `taskkill /pid <pid> /T /F` only for that exact spawned PID.

Use the exact stable hooks named in **Interfaces** and Node's `assert/strict`. Do not assert screenshots or implementation-only class strings.

- [x] **Step 2: Run the regression and verify the RED state**

Run: `node tests/advisor-proof-credentials-layout.mjs`

Expected: FAIL because `data-credential-summary`, `data-credential-keyword`, and `data-credential-badges` do not exist yet.

- [x] **Step 3: Implement the structured summary and responsive layout**

In `src/components/AdvisorProofSections.tsx`:

1. Add a structured summary-line type with `lead`, `emphasis`, and optional `tail` fields; allow `ProofCard.summary` arrays to contain strings or structured lines.
2. Convert only the credentials card's three summary entries to structured lines whose rendered text remains exactly the three sentences in **Global Constraints**.
3. Render each structured line as a semantic `<p>` that is inline on mobile and uses `md:contents` inside a shared `md:grid-cols-[max-content_minmax(0,1fr)]` summary grid. Put only `CFA`, `CFP®`, and `experience` in `<strong data-credential-keyword>` elements.
4. Use an 8px row rhythm (`space-y-2` / `gap-y-2`) for the structured summary and keep the existing 12px rhythm for other string-array summaries.
5. Give only the credentials body `pt-5 md:pt-6`, then switch it at `md` to `grid-cols-[minmax(0,1fr)_auto]`, with the copy/stat in the left column and the centered badge group in the right column.
6. Keep the 20+ stat below the sentences. Keep unrelated card rendering unchanged.
7. Set CFA badge containers to `h-[103px] w-[103px] md:h-[115px] md:w-[115px]` and CFP to `h-[130px] w-[130px] md:h-36 md:w-36`; update the Next Image `sizes` values to 115px and 144px.
8. Center the badge pair below the copy on mobile, remove the top margin at `md`, and keep at least a 40px desktop column gap.
9. Add the three stable data hooks named in **Interfaces** only to the credentials layout.

- [x] **Step 4: Add the focused package script and verify GREEN**

Add this script to `package.json`:

```json
"test:credentials-layout": "node tests/advisor-proof-credentials-layout.mjs"
```

Run: `npm run test:credentials-layout`

Expected: PASS for both 375px and 1405px assertions, with the spawned server/browser cleaned up.

- [x] **Step 5: Run the full local quality gates**

Run: `npm run lint`

Expected: 0 errors; the same three pre-existing `@next/next/no-img-element` warnings are allowed and must be reported as baseline noise.

Run: `npm run build`

Expected: successful production build; the existing Tailwind module-type and NFT trace warnings are allowed and must be reported as baseline noise.

- [x] **Step 6: Self-review and commit**

Check the rendered sentence text, mobile overflow, desktop alignment, badge sizes, and unrelated-card classes against the Global Constraints. Then commit only `.gitignore`, the plan, `package.json`, `src/components/AdvisorProofSections.tsx`, and `tests/advisor-proof-credentials-layout.mjs` with a concise message such as `Polish credentials proof layout`.
