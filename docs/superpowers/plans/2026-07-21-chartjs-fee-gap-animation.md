# Chart.js Fee Gap Animation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create one standalone, mobile-first HTML artifact that uses Chart.js to draw a five-second comparison of a 1% asset-based fee and a $100 monthly fee on a $1,000,000 portfolio growing at 8% for 20 years, then reveals a large `$788,000` difference.

**Architecture:** The deliverable is one self-contained HTML document with inline CSS and JavaScript plus a pinned Chart.js CDN script. The JavaScript calculates both portfolios month by month using the same growth-then-fee convention as `src/lib/feeProjection.ts`, feeds all 241 monthly points into two Chart.js line datasets, and uses Chart.js's progressive-line animation configuration to finish in 5,000 ms. The existing Next.js app and the redesign catalog remain untouched.

**Tech Stack:** Semantic HTML5, responsive CSS, vanilla JavaScript, Chart.js 4.5.1 UMD from jsDelivr, Playwright browser verification.

## Global Constraints

- Create a single standalone HTML deliverable at `output/redesigns/v4-fee-gap-chart.html`; do not modify `output/redesigns/index.html`, app source, package files, deployment files, or the existing untracked `output/charts/` assets in the main checkout.
- Compare an asset-based fee of exactly `1%` against a flat monthly fee of exactly `$100`.
- Use a starting portfolio of exactly `$1,000,000`, an annual return of exactly `8%`, and a horizon of exactly `20 years` / `240 months`.
- Apply each month's growth first, then deduct that month's fee, matching `src/lib/feeProjection.ts`: flat path `balance = balance * monthlyGrowth - 100`; AUM path `balance = balance * monthlyGrowth * (1 - 0.01 / 12)`.
- The exact year-20 values must round to `$4,604,057` for the flat-fee path and `$3,815,751` for the 1%-AUM path; the exact gap must round to `$788,306`.
- Display the requested large, bold headline `$788,000` as the nearest-thousand summary only after the chart animation completes.
- Animate both lines progressively from left to right over a total of exactly `5,000 ms` using Chart.js; do not substitute a CSS clip-path animation for the graph draw.
- Pin the CDN dependency to `https://cdn.jsdelivr.net/npm/chart.js@4.5.1/dist/chart.umd.min.js`.
- Start design decisions at a 375px-wide viewport, then enhance tablet and desktop layouts.
- Preserve current brand continuity: DM Sans for display/logo text, Inter for body/data, core green `#00A540`, deep ink `#0F172A`, and a restrained warm-red comparison line.
- Provide a native Replay button, a meaningful canvas accessible name/fallback, visible keyboard focus, an `aria-live="polite"` result reveal, and immediate non-animated rendering for `prefers-reduced-motion: reduce`.
- If the Chart.js CDN cannot load, keep the explanatory copy and `$788,000` result usable and show a concise chart-load status instead of leaving a blank surface.

---

## Design Direction

**Concrete subject and audience:** A fee-projection instrument for a prospective investor comparing a traditional 1%-of-assets advisor against SmarterWay Wealth's flat $100 monthly fee. Its single job is to make the 20-year compounding cost difference unmistakable.

**Visual thesis:** A quiet fiduciary fee horizon on cool white paper: precise ink gridwork, one evergreen trajectory, one muted-rust trajectory, and a widening translucent field that makes “money kept” physically visible.

**Content plan:**

1. Compact SmarterWay Wealth wordmark and Replay control.
2. Headline: `One percent does not stay one percent.`
3. One-sentence scenario line: `$1,000,000 · 8% annual return · 20 years`.
4. Dominant Chart.js canvas with a two-item legend and a small `DRAWING 20 YEARS` status.
5. Completion reveal: `$788,000` and `more of your money after 20 years`, followed by the two exact rounded ending balances.
6. One concise illustration disclaimer.

**Interaction thesis:**

- The two trajectories draw together from year 0 to year 20 in one deliberate five-second sequence.
- The result block stays visually absent during the draw, then rises and sharpens into place when Chart.js reports animation completion.
- Replay resets the result and reconstructs the chart; button hover/focus movement is the only microinteraction. Reduced-motion users receive the final chart and result immediately.

**Token system:**

- `paper` — `#F7FAF8`
- `surface` — `#FFFFFF`
- `ink` — `#0F172A`
- `muted` — `#5E6B65`
- `grid` — `#DCE7E1`
- `brand` — `#00A540`
- `brand-deep` — `#006B2C`
- `aum` — `#B45A4A`
- Display/logo: `DM Sans`, 650–750 weights.
- Body/data: `Inter`, 400–700 weights with tabular numerals for money.

**Layout sketches:**

```text
375px mobile
┌──────────────────────────────┐
│ ▥ SmarterWay wealth  [Replay]│
│                              │
│ One percent does not         │
│ stay one percent.            │
│ $1M · 8% · 20 years          │
│ ─ Flat $100/mo  ─ 1% AUM     │
│ ┌──────────────────────────┐ │
│ │                      ╭── │ │
│ │                 ╭────╯   │ │
│ │            ╭────╯        │ │
│ │_______╭────╯_____________ │ │
│ └──────────────────────────┘ │
│          $788,000            │
│ more of your money…          │
│ $4.60M flat  ·  $3.82M AUM   │
└──────────────────────────────┘
```

```text
desktop progressive enhancement
┌───────────────────────────────────────────────────────┐
│ ▥ SmarterWay wealth                         [Replay]  │
│ One percent does not stay one percent.                │
│ $1,000,000 · 8% annual return · 20 years              │
│                                                       │
│ ┌───────────────────────────────────────────────────┐ │
│ │                       widening money-kept field   │ │
│ │                                ╭────────────────  │ │
│ │                    ╭───────────╯                  │ │
│ │___________╭────────╯_____________________________ │ │
│ └───────────────────────────────────────────────────┘ │
│ exact endpoints                     $788,000          │
│                                      more after 20y   │
└───────────────────────────────────────────────────────┘
```

**Signature:** The translucent space between the paths is the primary visual object—the viewer watches the cost gap widen rather than merely seeing two unrelated lines.

**Uniqueness critique:** A centered statistic card, generic dark dashboard, or broadsheet ledger would be reusable template work. This direction instead treats fee drag itself as spatial material: the chart consumes the page and the large result is anchored to the terminal gap. The muted-rust AUM line preserves immediate loss semantics without introducing a loud second accent system.

---

### Task 1: Build and verify the standalone fee-gap animation

**Files:**

- Create: `output/redesigns/v4-fee-gap-chart.html`
- Scratch test/report only: `.superpowers/sdd/` (gitignored; do not commit scratch files)

**Interfaces:**

- Consumes: Chart.js global `Chart` from the pinned UMD script; existing repo math convention from `src/lib/feeProjection.ts`.
- Produces: one directly openable/servable HTML document with a canvas, replay control, calculated monthly series, progressive Chart.js animation, accessible completion reveal, and CDN-failure fallback.

- [ ] **Step 1: Run the failing acceptance check before the HTML exists**

Run this exact command from the worktree root:

```powershell
@'
const fs = require('node:fs');
const file = 'output/redesigns/v4-fee-gap-chart.html';
const html = fs.readFileSync(file, 'utf8');
const checks = [
  ['pinned Chart.js 4.5.1', /chart\.js@4\.5\.1\/dist\/chart\.umd\.min\.js/],
  ['five-second duration', /(?:TOTAL_DURATION|DRAW_DURATION_MS)\s*=\s*5_?000/],
  ['requested result', /\$788,000/],
  ['starting balance', /STARTING_BALANCE\s*=\s*1_?000_?000/],
  ['8% return', /ANNUAL_RETURN\s*=\s*0\.08/],
  ['1% fee', /AUM_FEE_RATE\s*=\s*0\.01/],
  ['$100 monthly fee', /MONTHLY_FLAT_FEE\s*=\s*100/],
  ['240 months', /MONTHS\s*=\s*240/],
  ['replay control', /id="replay"/],
  ['polite result announcement', /aria-live="polite"/],
  ['reduced motion handling', /prefers-reduced-motion:\s*reduce/],
];
for (const [name, pattern] of checks) {
  if (!pattern.test(html)) throw new Error(`Missing: ${name}`);
}
console.log(`PASS ${checks.length}/${checks.length} static requirements`);
'@ | node
```

Expected RED result: command exits non-zero with `ENOENT` for `output/redesigns/v4-fee-gap-chart.html`, proving the acceptance check detects the missing feature.

- [ ] **Step 2: Create the single HTML document**

Use this exact semantic skeleton and identifiers so the behavior and browser checks have stable hooks:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>The compounding cost of 1% | SmarterWay Wealth</title>
  <!-- Google font request, complete inline CSS, then pinned Chart.js UMD. -->
</head>
<body>
  <main class="projection" aria-labelledby="page-title">
    <header class="masthead">
      <a class="brand" href="https://smarterwaywealth.com" aria-label="SmarterWay Wealth home">SmarterWay <span>wealth</span></a>
      <button id="replay" type="button" aria-label="Replay the 20-year fee comparison">Replay</button>
    </header>
    <section class="intro">
      <p class="eyebrow">The compounding cost of advice</p>
      <h1 id="page-title">One percent does not stay one percent.</h1>
      <p class="scenario">$1,000,000 <span>·</span> 8% annual return <span>·</span> 20 years</p>
    </section>
    <section class="chart-region" aria-labelledby="chart-heading">
      <div class="chart-meta">
        <h2 id="chart-heading">Portfolio value</h2>
        <p id="draw-status" role="status">Drawing 20 years</p>
      </div>
      <div class="legend" aria-label="Chart legend">
        <span class="legend-item legend-flat">Flat fee · $100/mo</span>
        <span class="legend-item legend-aum">Asset fee · 1%</span>
      </div>
      <div class="chart-shell">
        <canvas id="fee-chart" role="img" aria-label="Line chart comparing a $100 monthly flat fee with a 1 percent asset-based fee on a one million dollar portfolio over 20 years. The flat-fee portfolio ends about $788,000 higher.">After 20 years, the flat-fee portfolio is $4,604,057 and the 1% asset-fee portfolio is $3,815,751.</canvas>
      </div>
    </section>
    <section id="result" class="result" data-state="pending" aria-live="polite" aria-hidden="true">
      <p class="result-kicker">The difference at year 20</p>
      <p id="result-value" class="result-value"></p>
      <p class="result-copy">more of your money after 20 years</p>
      <div class="endpoints" aria-label="Ending portfolio values">
        <span><strong id="flat-ending">$4,604,057</strong> with the flat fee</span>
        <span><strong id="aum-ending">$3,815,751</strong> with 1% AUM</span>
      </div>
    </section>
    <footer>Illustration assumes a constant 8% annual return and monthly fee deductions. Actual returns vary.</footer>
  </main>
</body>
</html>
```

Implement the math with these exact constants and update rules:

```js
const STARTING_BALANCE = 1_000_000;
const ANNUAL_RETURN = 0.08;
const AUM_FEE_RATE = 0.01;
const MONTHLY_FLAT_FEE = 100;
const MONTHS = 240;
const DRAW_DURATION_MS = 5_000;
const monthlyGrowth = (1 + ANNUAL_RETURN) ** (1 / 12);

let flatBalance = STARTING_BALANCE;
let aumBalance = STARTING_BALANCE;
const flatSeries = [{ x: 0, y: flatBalance }];
const aumSeries = [{ x: 0, y: aumBalance }];

for (let month = 1; month <= MONTHS; month += 1) {
  flatBalance = flatBalance * monthlyGrowth - MONTHLY_FLAT_FEE;
  aumBalance = aumBalance * monthlyGrowth * (1 - AUM_FEE_RATE / 12);
  flatSeries.push({ x: month / 12, y: flatBalance });
  aumSeries.push({ x: month / 12, y: aumBalance });
}
```

Use the official Chart.js progressive-line approach for both `x` and `y`: `type: 'number'`, `easing: 'linear'`, per-point duration `DRAW_DURATION_MS / flatSeries.length`, and a one-time per-context delay of `ctx.index * delayBetweenPoints`. The `x` animation begins from `NaN`; the `y` animation begins from the prior rendered point. Configure `responsive: true`, `maintainAspectRatio: false`, a linear x-axis from 0–20, compact currency y-axis labels, no point markers, monotone interpolation, index tooltips, and a restrained translucent fill between the two datasets.

Put the completion callback under top-level `options.animation.onComplete`. Guard it once per chart run, set `#result-value` to `$788,000`, switch `#result` to `data-state="complete"` and `aria-hidden="false"`, change `#draw-status` to `20-year comparison complete`, and re-enable Replay. Replay must hide/reset the result, destroy the current Chart instance, and create a fresh one so progressive animation state cannot leak between runs.

If `matchMedia('(prefers-reduced-motion: reduce)')` matches, omit animations and reveal the final result on the next animation frame. If `window.Chart` is unavailable, show a concise failure message in `#draw-status`, reveal `$788,000`, and leave the textual values usable.

- [ ] **Step 3: Run the static acceptance check and verify GREEN**

Re-run the exact Node command from Step 1.

Expected GREEN result:

```text
PASS 11/11 static requirements
```

- [ ] **Step 4: Run repository quality gates**

Run:

```powershell
npm run lint
npm run build
```

Expected: both commands exit `0`; no new errors attributable to the standalone HTML artifact.

- [ ] **Step 5: Verify the animation in a real browser at mobile and desktop sizes**

Serve the artifact over local HTTP with a hidden background process, not `file://`:

```powershell
Start-Process -FilePath 'py' -ArgumentList '-m','http.server','4173','--directory','output/redesigns' -WindowStyle Hidden -PassThru
```

In Playwright or equivalent browser automation:

1. Open `http://127.0.0.1:4173/v4-fee-gap-chart.html` at 375×812.
2. Confirm the canvas and both legend entries render without horizontal overflow.
3. Before 4,500 ms, confirm `#result` remains `data-state="pending"` and `$788,000` is not visible.
4. After 5,500 ms, confirm `#result` is `data-state="complete"`, `$788,000` is visible and large, `#flat-ending` is `$4,604,057`, and `#aum-ending` is `$3,815,751`.
5. Click Replay and confirm the result hides, the lines redraw, and the result reappears after the next run.
6. Repeat the final-state visual check at 1440×1000.
7. Emulate reduced motion, reload, and confirm the completed chart and `$788,000` appear without the five-second wait.
8. Capture mobile and desktop screenshots in `.superpowers/sdd/` for review; do not commit them.
9. Check the browser console for errors and the page for clipping, muddy labels, or competing decoration.

- [ ] **Step 6: Self-review and commit the artifact**

Re-read the Global Constraints and verify each against the file and browser evidence. Remove one nonessential decorative element if it does not improve fee-comparison comprehension. Commit only the standalone HTML deliverable:

```powershell
git add -- output/redesigns/v4-fee-gap-chart.html
git commit -m "feat: add animated Chart.js fee gap comparison"
```

Write the full TDD/browser report to the assigned `.superpowers/sdd/task-1-report.md` path and return the required concise status.
