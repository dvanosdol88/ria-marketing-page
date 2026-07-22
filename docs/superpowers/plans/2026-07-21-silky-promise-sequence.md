# Silky Promise Sequence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the homepage promise animation read `human` → `David` → the full sentence with David → a settled 1.0-second hold → the same full sentence with `Smarter Way Wealth`, while keeping `Period.` on the same mobile line as `$100/month.`.

**Architecture:** Keep the current reserved final geometry so no phase can reflow the paragraph. Replace serialized presence/translate/blur motion with chained phase state and opacity-only crossfades. The full-copy fade completes before the 1,000 ms hold begins; only then may the stable name slot crossfade from David to Smarter Way Wealth.

**Verifier architecture:** `node scripts/verify-promise-animation.mjs` is standalone on a clean checkout with installed dependencies: it first runs a hidden `next build` and requires exit 0, then starts the built app with hidden `next start` on a per-process port. This avoids the broken HMR hydration path without requiring callers to prepare `.next` separately.

**Tech Stack:** Next.js 16 App Router, React 18, TypeScript, Framer Motion 12, Tailwind CSS 4, Playwright 1.58.

## Global Constraints

- Mobile first: the primary visual and browser acceptance viewport is exactly `375x812`.
- The visible order must be exactly `human` → `David` → full text → a 1.0-second settled hold → `Smarter Way Wealth`.
- David remains visible in the reserved name slot while the full text fades in and throughout the 1.0-second hold.
- `Smarter Way Wealth` replaces only David after the hold; the rest of the full sentence stays visible.
- `$100/month. Period.` must be one nonbreaking inline ending and both pieces must have the same visual top coordinate at `375x812`.
- Use opacity-only transitions for this sequence: no vertical translation, blur, scale, or `AnimatePresence mode="wait"` blank interval.
- Preserve the existing navy/green palette, typography, copy, semantic screen-reader sentence, and reserved layout geometry.
- Preserve reduced-motion behavior: visitors requesting reduced motion immediately see the settled full sentence with `Smarter Way Wealth` and do not get scroll-driven name swaps.
- Preserve the later scroll-driven David/brand swap, but arm it only after the brand phase and use separate enter/exit thresholds to prevent boundary flicker.
- Do not change dependencies, deployment configuration, calculator math, or unrelated homepage content.
- Keep the regression command self-contained: it must produce its own production build before starting the browser server.

## Design Direction

- **Visual thesis:** A calm typographic baton-pass on the existing paper/navy/green surface, with no object visibly snapping to make room for another.
- **Content plan:** Isolate `human`, then `David`; build the full promise around the stable David name; let the complete thought breathe; finish by identifying the firm.
- **Interaction thesis:** Chain phases so browser scheduling cannot bunch them, crossfade opacity over roughly 0.5–0.65 seconds, and use a true 1,000 ms hold measured only after the full-copy fade settles.
- **Existing tokens:** navy `#10233A`, promise green `#007A2F`, divider green `#108843`, existing mobile `text-2xl` and desktop clamp typography.
- **Layout:** keep one reserved two-line-or-wrapped text frame; do not mount and unmount flow content between phases.
- **Signature:** `human → David → David delivers… → [1.0 s] → Smarter Way Wealth delivers…`.

```text
┌──────────────────────────────────────────────┐
│                  human                       │
│                    ↓                         │
│                  David                       │
│                    ↓                         │
│                  David                       │
│ delivers personal, real human fiduciary…     │
│ for a simple $100/month. Period.              │
│               [hold 1.0 s]                   │
│                    ↓                         │
│           Smarter Way Wealth                  │
│ delivers personal, real human fiduciary…     │
│ for a simple $100/month. Period.              │
└──────────────────────────────────────────────┘
```

Self-critique: adding new decoration, type, or color would turn a precise motion repair into a generic redesign. The distinctive choice is the orchestrated human-to-advisor-to-firm narrative itself, so everything else stays quiet.

---

### Task 1: Promise sequence, inline ending, and regression verifier

**Files:**
- Modify: `src/components/CostAnalysisCalculator.tsx:4,363-618`
- Create: `scripts/verify-promise-animation.mjs`
- Modify after verification: `REPO-LOG.md`

**Interfaces:**
- Consumes: the existing `SavingsLeadHero`, `useReducedMotion`, viewport-entry trigger, reserved `brandSlotRef`, and Playwright dependency.
- Produces: `data-promise-phase`, `data-promise-name`, `data-promise-copy`, `data-promise-fee`, and `data-promise-period` browser hooks; no public TypeScript API changes.

- [x] **Step 1: Write the failing Playwright regression verifier**

Create `scripts/verify-promise-animation.mjs` with these exact behavioral assertions. The initial RED used a hidden local Next dev server; the final verified harness must build and serve production output because HMR hydration is not reliable in this environment:

```js
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORT = Number(process.env.PROMISE_TEST_PORT ?? 3217);
const BASE_URL = `http://127.0.0.1:${PORT}`;
const nextBin = path.join(ROOT, "node_modules", "next", "dist", "bin", "next");

const server = spawn(process.execPath, [nextBin, "dev", "-p", String(PORT)], {
  cwd: ROOT,
  stdio: ["ignore", "pipe", "pipe"],
  windowsHide: true,
});

async function waitForServer() {
  const deadline = Date.now() + 45_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(BASE_URL);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("Timed out waiting for the local Next server");
}

async function collectTimeline(page) {
  const promise = page.locator("[data-promise-phase]");
  await promise.waitFor();
  await page.evaluate(() => {
    const element = document.querySelector("[data-promise-phase]");
    window.__promiseTimeline = [{
      phase: element.dataset.promisePhase,
      name: element.dataset.promiseName,
      at: performance.now(),
    }];
    new MutationObserver(() => {
      const latest = window.__promiseTimeline.at(-1);
      const next = {
        phase: element.dataset.promisePhase,
        name: element.dataset.promiseName,
        at: performance.now(),
      };
      if (latest.phase !== next.phase || latest.name !== next.name) {
        window.__promiseTimeline.push(next);
      }
    }).observe(element, { attributes: true, attributeFilter: ["data-promise-phase", "data-promise-name"] });
  });
  await promise.scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelector("[data-promise-phase]")?.dataset.promisePhase === "brand", null, { timeout: 10_000 });
  return page.evaluate(() => window.__promiseTimeline);
}

const browser = await chromium.launch();
try {
  await waitForServer();
  const context = await browser.newContext({ viewport: { width: 375, height: 812 }, reducedMotion: "no-preference" });
  const page = await context.newPage();
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  const timeline = await collectTimeline(page);
  assert.deepEqual([...new Set(timeline.map((entry) => entry.phase))], ["waiting", "human", "david", "full-copy", "full-copy-hold", "brand"]);
  const fullCopy = timeline.find((entry) => entry.phase === "full-copy");
  const hold = timeline.find((entry) => entry.phase === "full-copy-hold");
  const brand = timeline.find((entry) => entry.phase === "brand");
  assert.equal(fullCopy.name, "david");
  assert.equal(hold.name, "david");
  assert.ok(brand.at - hold.at >= 975, `Full-copy hold was only ${brand.at - hold.at}ms`);
  const lineGeometry = await page.evaluate(() => {
    const fee = document.querySelector("[data-promise-fee]").getBoundingClientRect();
    const period = document.querySelector("[data-promise-period]").getBoundingClientRect();
    return { delta: Math.abs(fee.top - period.top), overflow: document.documentElement.scrollWidth - window.innerWidth };
  });
  assert.ok(lineGeometry.delta <= 1, `Period moved to another line by ${lineGeometry.delta}px`);
  assert.ok(lineGeometry.overflow <= 0, `Promise introduced ${lineGeometry.overflow}px of horizontal overflow`);
  await context.close();

  const reducedContext = await browser.newContext({ viewport: { width: 375, height: 812 }, reducedMotion: "reduce" });
  const reducedPage = await reducedContext.newPage();
  await reducedPage.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await reducedPage.locator('[data-promise-phase="brand"]').waitFor();
  await reducedPage.locator('[data-promise-name="smarter-way-wealth"]').waitFor();
  await reducedContext.close();
} finally {
  await browser.close();
  server.kill();
}

console.log("Promise animation verification passed");
```

- [x] **Step 2: Run the verifier and prove RED**

Run: `node scripts/verify-promise-animation.mjs`

Expected: FAIL before implementation because the current component has no `data-promise-phase` hook and still renders `Period.` as a separate block.

- [x] **Step 3: Implement the chained phase machine**

In `CostAnalysisCalculator.tsx`, remove `AnimatePresence` from the import and replace the phase union/timer effect with this exact model:

```ts
type PromisePhase = "waiting" | "human" | "david" | "full-copy" | "full-copy-hold" | "brand";

const [revealPhase, setRevealPhase] = useState<PromisePhase>("waiting");

useEffect(() => {
  if (!hasEnteredView || shouldReduceMotion) return;
  const transitions: Partial<Record<PromisePhase, { delay: number; next: PromisePhase }>> = {
    waiting: { delay: 500, next: "human" },
    human: { delay: 1000, next: "david" },
    david: { delay: 700, next: "full-copy" },
    "full-copy-hold": { delay: 1000, next: "brand" },
  };
  const transition = transitions[revealPhase];
  if (!transition) return;
  const timer = window.setTimeout(() => setRevealPhase(transition.next), transition.delay);
  return () => window.clearTimeout(timer);
}, [hasEnteredView, revealPhase, shouldReduceMotion]);

const visiblePhase: PromisePhase = shouldReduceMotion ? "brand" : revealPhase;
const fullCopyVisible = ["full-copy", "full-copy-hold", "brand"].includes(visiblePhase);
const humanVisible = visiblePhase === "human" || fullCopyVisible;
const davidVisible = visiblePhase === "david" || visiblePhase === "full-copy" || visiblePhase === "full-copy-hold" || (visiblePhase === "brand" && showScrollDavid);
const brandVisible = visiblePhase === "brand" && !showScrollDavid;

const completeCopyReveal = () => {
  if (!shouldReduceMotion && revealPhase === "full-copy") {
    setRevealPhase("full-copy-hold");
  }
};
```

The full-copy context motion uses `duration: 0.64`, opacity only, and calls `completeCopyReveal` once from the first surrounding-copy span. The human fade uses `duration: 0.52`. Both name layers remain mounted in the reserved absolute slot and crossfade with `duration: 0.56`; delete all `y`, `filter`, exit objects, delayed copy start, and `AnimatePresence mode="wait"`.

- [x] **Step 4: Add stable browser hooks and the nonbreaking fee ending**

Put `data-promise-phase={visiblePhase}` and `data-promise-name={...}` on the same stable `aria-hidden` statement wrapper. Add `data-promise-copy={fullCopyVisible ? "visible" : "hidden"}` to the visible sentence block. Replace the separate block-level `Period.` node with:

```tsx
<motion.span
  initial={false}
  animate={{ opacity: fullCopyVisible ? 1 : 0 }}
  transition={copyRevealTransition}
>
  {" "}for a simple{" "}
  <span data-promise-fee-ending className="whitespace-nowrap">
    <span data-promise-fee>$100/month.</span>{" "}
    <span data-promise-period>Period.</span>
  </span>
</motion.span>
```

- [x] **Step 5: Add scroll hysteresis after the brand phase**

Run the scroll effect only when `visiblePhase === "brand"` and motion is allowed. Keep brand visible until the visitor has first moved at least 48 px from the slot’s center. After arming, enter the David state at 24 px or closer and return to the firm name only at 48 px or farther. Update React state only when the derived boolean actually changes.

- [x] **Step 6: Run GREEN and the full local gates**

Run:

```powershell
node scripts/verify-promise-animation.mjs
npx tsc --noEmit
npm run lint
npm run build
```

Expected: verifier prints `Promise animation verification passed`; typecheck/build exit 0; lint exits 0 with only the repository’s three pre-existing `<img>` warnings.

The verifier command itself runs `next build` before `next start`, so this standalone invocation covers both production compilation and browser behavior without a pre-existing `.next` directory.

- [x] **Step 7: Mobile-first visual critique and documentation**

Capture the local sequence at `375x812` and inspect the phase handoffs frame by frame. Confirm no blank name interval, no one-frame text jump, no overflow, and the fee ending stays together. Then check a desktop viewport and reduced motion. Append a concise factual entry to `REPO-LOG.md` only after these checks pass.

- [x] **Step 8: Commit**

```powershell
git add src/components/CostAnalysisCalculator.tsx scripts/verify-promise-animation.mjs docs/superpowers/plans/2026-07-21-silky-promise-sequence.md REPO-LOG.md
git commit -m "Polish promise animation sequence"
```
