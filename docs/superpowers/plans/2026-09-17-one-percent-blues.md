# One Percent Blues Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Serve a blue "Got the 1% Blues?" campaign page on onepercentblues.com from this codebase (1percentblues.com redirecting there), reusing the home calculator, share stack, FAQ and compliance footer, without changing what youarepayingtoomuch.com renders.

**Architecture:** Route groups split the site chrome (`(site)` = green header/footer/JSON-LD; `(blues)` = blue header/footer/JSON-LD) under one thin root layout. Host-based rewrites in `next.config.mjs` map `onepercentblues.com/` to `/blues` and bounce every other path on that host to the green domain; the other three hostnames redirect to onepercentblues.com. `CostAnalysisCalculator` gains a fourth `experienceMode` ("one-percent-blues") that composes check → diagnosis → calculator → CTA → FAQ, with the calculator's hard-coded greens routed through a new `theme.accent` group whose defaults are the current greens.

**Tech Stack:** Next.js 16 App Router (Turbopack), React 18, TypeScript, Tailwind 4, framer-motion, lucide-react, `next/font/google` (Fraunces), `next/og`, Node test runner + Playwright-free fetch tests.

**Spec:** `docs/superpowers/specs/2026-09-17-one-percent-blues-design.md`

## Global Constraints

- Work in the worktree `D:\worktrees\one-percent-blues-20260917` on branch `feat/one-percent-blues-20260917` (based on `origin/main` 7378509). Never touch `D:\ria-marketing-page` (David's dirty checkout).
- Do NOT edit the hash-locked canon files: `src/components/Quiz.tsx`, `src/components/calculator/ShareMyResults.tsx`, `src/components/calculator/SocialShareRow.tsx`, `src/lib/shareSummary.ts`. Do NOT change the TYPE shape of `src/lib/siteCalculatorConfig.ts`.
- The green site must render the same HTML after this work. Task 3 proves it by diffing the server HTML of `/` before and after.
- Mobile first: every new block is laid out for 375px first, desktop (`lg:`) is an enhancement. Tap targets ≥ 44px.
- Copy is exact — take every string from the spec's §2 table. Headline is `Got the 1% Blues?` (capital B). No phone-call language, no custody language, no new disclaimer text (the disclaimer is `CalculatorNotes`, unchanged).
- Blue palette: deep `#1E3A8A`, cobalt `#2563EB`, sky `#60A5FA`, ink `#0B1A44`, muted `#4B5F8F`, pale `#BFDBFE`, card-tint `#EEF3FF`.
- Commit after every task with a conventional message; `npm run lint`, `npm run build` and the named tests must pass before each commit that touches `src/`.
- Ship only through PR → CI → merge to `main`. Never `vercel --prod` / deploy / promote / alias.

---

### Task 1: Route groups — split the site chrome out of the root layout

**Files:**
- Modify: `src/app/layout.tsx` (remove JSON-LD const + script, `<SiteNav/>`, `<div className="min-h-screen">`, `<SiteFooter/>`)
- Create: `src/app/(site)/layout.tsx`
- Move (git mv): `src/app/page.tsx`, `src/app/become-a-client/`, `src/app/components/` (the `/components/calendar` preview page), `src/app/experiment/`, `src/app/gallery/`, `src/app/improve-your-tools/`, `src/app/meaning/`, `src/app/mobile-calculator/`, `src/app/our-math/`, `src/app/privacy/`, `src/app/save-a-ton/`, `src/app/upgrade-your-advice/` → under `src/app/(site)/`
- Modify: `src/app/not-found.tsx` (render SiteNav/SiteFooter itself)
- Modify: `tests/home-wwwh.mjs:23` (`../src/app/page.tsx` → `../src/app/(site)/page.tsx`), `tests/active-direct-start.mjs:9,14`

**Interfaces:**
- Produces: `src/app/(site)/layout.tsx` (default export `SiteLayout`), root layout with only `<html>/<body>` + providers + `{children}`. URLs are unchanged.

- [ ] **Step 1: Move the pages**

```bash
cd /d/worktrees/one-percent-blues-20260917
mkdir -p "src/app/(site)"
for p in page.tsx become-a-client components experiment gallery improve-your-tools meaning mobile-calculator our-math privacy save-a-ton upgrade-your-advice; do git mv "src/app/$p" "src/app/(site)/$p"; done
git status --short | head -30
```
Expected: renames only (`R  src/app/page.tsx -> src/app/(site)/page.tsx` …). `src/app/api`, `error.tsx`, `global-error.tsx`, `loading.tsx`, `not-found.tsx`, `layout.tsx`, `fonts.ts`, `globals.css` stay put.

- [ ] **Step 2: Create `src/app/(site)/layout.tsx`** — move `siteJsonLd` verbatim from the root layout into this file (lines 13–56 of the current `src/app/layout.tsx`), then:

```tsx
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";

/* Green site chrome — header, footer and the site-level JSON-LD — lives on
   this route group rather than on the root layout so the blue front door
   (src/app/(blues)) can carry its own. Route groups never appear in URLs:
   every page under (site) keeps the address it had. */

const siteJsonLd = [ /* … moved verbatim from the root layout … */ ];

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
      />
      <SiteNav />
      <div className="min-h-screen">{children}</div>
      <SiteFooter />
    </>
  );
}
```

- [ ] **Step 3: Thin the root layout.** In `src/app/layout.tsx` delete the `siteJsonLd` const, the `<script type="application/ld+json">` in `<head>`, the `SiteNav`/`SiteFooter` imports, and replace the body's inner tree with:

```tsx
      <body className={`${inter.variable} ${dmSans.variable} bg-[#EEF0F5] text-neutral-900`}>
        <PostHogProvider>
          <ViewTransitions>
            <SavingsBarProvider>
              <PostHogCtaTracker />
              <Suspense fallback={null}>
                <PostHogPageView />
              </Suspense>
              {children}
            </SavingsBarProvider>
          </ViewTransitions>
        </PostHogProvider>
      </body>
```
Keep the `ProgressiveStickyBar` comment next to `PostHogCtaTracker`. `metadata` and `viewport` exports stay in the root layout.

- [ ] **Step 4: Root `not-found.tsx` keeps the green chrome** (it renders outside every route group):

```tsx
import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";

export default function NotFound() {
  return (
    <>
      <SiteNav />
      <main className="section-shell flex min-h-[60vh] flex-col items-center justify-center gap-6 py-20 text-center">
        {/* …existing content unchanged… */}
      </main>
      <SiteFooter />
    </>
  );
}
```

- [ ] **Step 5: Fix the two source-reading tests**

`tests/home-wwwh.mjs`: `readSource("../src/app/page.tsx")` → `readSource("../src/app/(site)/page.tsx")`.
`tests/active-direct-start.mjs`: `"src/app/become-a-client/page.tsx"` → `"src/app/(site)/become-a-client/page.tsx"`, `"src/app/privacy/page.tsx"` → `"src/app/(site)/privacy/page.tsx"`.

- [ ] **Step 6: Verify**

```bash
npm run lint && npm run build && npm run test:home-wwwh && npm run test:active-direct-start && npm run test:home-disclosures-ssr
```
Expected: all pass; build lists the same routes as before (`/`, `/become-a-client`, … — no `(site)` in any path).

- [ ] **Step 7: Commit**

```bash
git add -A src/app tests/home-wwwh.mjs tests/active-direct-start.mjs
git commit -m "refactor: move green site chrome into a (site) route group"
```

---

### Task 2: Host rules in `next.config.mjs`

**Files:**
- Modify: `next.config.mjs` (redirects list; add `rewrites()`)

**Interfaces:**
- Produces: on host `onepercentblues.com`: `/` → `/blues`, `/robots.txt|/sitemap.xml|/llms.txt` → `/blues/…` (rewrites); `/blues` → `/` and every non-asset path → `https://youarepayingtoomuch.com/:path` (redirects). Hosts `1percentblues.com`, `www.1percentblues.com`, `www.onepercentblues.com` → `https://onepercentblues.com/:path*` (308).

- [ ] **Step 1: Add the constants above `nextConfig`**

```js
/**
 * One Percent Blues — the second front door (docs/superpowers/specs/
 * 2026-09-17-one-percent-blues-design.md). onepercentblues.com serves the
 * blue page at /blues through a host rewrite; the other three hostnames
 * redirect there; and any path on the blue host that is not the page or an
 * asset bounces to the green domain, so the blue address stays one page.
 */
const BLUES_HOST = "onepercentblues.com";
const BLUES_ORIGIN = `https://${BLUES_HOST}`;
const GREEN_ORIGIN = "https://youarepayingtoomuch.com";
const bluesHost = { type: "host", value: BLUES_HOST };
// Paths the blue host must keep serving itself. `.+` (not `.*`) so "/" never
// matches this rule — the rewrite below owns "/".
const BLUES_PASSTHROUGH =
  "api/|_next/|blues|brand/|images/|assets/|monitoring|favicon|apple-touch-icon|site\\.webmanifest|robots\\.txt|sitemap\\.xml|llms\\.txt";
```

- [ ] **Step 2: Extend `redirects()`** — append after the existing `/faq` entry:

```js
      ...["1percentblues.com", "www.1percentblues.com", `www.${BLUES_HOST}`].map((host) => ({
        source: "/:path*",
        has: [{ type: "host", value: host }],
        destination: `${BLUES_ORIGIN}/:path*`,
        permanent: true,
      })),
      { source: "/blues", has: [bluesHost], destination: "/", permanent: true },
      {
        source: `/:path((?!${BLUES_PASSTHROUGH}).+)`,
        has: [bluesHost],
        destination: `${GREEN_ORIGIN}/:path`,
        permanent: false,
      },
```

- [ ] **Step 3: Add `rewrites()`** directly after `redirects()`:

```js
  async rewrites() {
    return {
      // beforeFiles: these must win over public/robots.txt, sitemap.xml and
      // llms.txt, which Next would otherwise serve from the filesystem first.
      beforeFiles: [
        { source: "/", has: [bluesHost], destination: "/blues" },
        { source: "/robots.txt", has: [bluesHost], destination: "/blues/robots.txt" },
        { source: "/sitemap.xml", has: [bluesHost], destination: "/blues/sitemap.xml" },
        { source: "/llms.txt", has: [bluesHost], destination: "/blues/llms.txt" },
      ],
    };
  },
```

- [ ] **Step 4: Smoke it by hand** (dev server on a free port; `windowsHide` — no visible window):

```bash
node node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port 3457 > /dev/null 2>&1 &
sleep 12
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" -H "Host: 1percentblues.com" "http://127.0.0.1:3457/?fee=1.5"
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" -H "Host: onepercentblues.com" http://127.0.0.1:3457/our-math
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" -H "Host: onepercentblues.com" http://127.0.0.1:3457/blues
curl -s -o /dev/null -w "%{http_code}\n" -H "Host: onepercentblues.com" http://127.0.0.1:3457/
```
Expected: `308 https://onepercentblues.com/?fee=1.5`, `307 https://youarepayingtoomuch.com/our-math`, `308 http://onepercentblues.com/` (or `/`), and `404` for the last line (the `/blues` page does not exist yet — Task 7 makes it 200). Kill the dev server afterwards (`taskkill /PID <pid> /T /F`).

- [ ] **Step 5: Commit**

```bash
git add next.config.mjs
git commit -m "feat(blues): host rewrites and redirects for onepercentblues.com"
```

---

### Task 3: Calculator accent theme (greens become a theme value, defaults unchanged)

**Files:**
- Modify: `src/config/homeMarketingVariants.ts` (add `CalculatorAccentTheme`, `calculatorAccentGreen`, `accent` on `HomeCalculatorTheme`, set it on all four variants)
- Modify: `src/components/HomeCalculatorExperience.tsx` (context + replace literals in the final-c path)
- Modify: `CALCULATOR-CANON.md` ("Mirrored files" table note)

**Interfaces:**
- Produces: `export type CalculatorAccentTheme`, `export const calculatorAccentGreen: CalculatorAccentTheme`, `HomeCalculatorTheme.accent: CalculatorAccentTheme`; inside `HomeCalculatorExperience.tsx` a module-private `CalculatorAccentContext` (default `calculatorAccentGreen`) provided by `FinalHomeCalculatorExperience`.

- [ ] **Step 1: Capture the green site's HTML before touching anything**

```bash
node node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port 3458 > /dev/null 2>&1 &
sleep 12
curl -s http://127.0.0.1:3458/ | sed -E 's/_next\/static\/[^"]+//g' > /tmp/home-before.html
curl -s "http://127.0.0.1:3458/?variant=final-home" | sed -E 's/_next\/static\/[^"]+//g' > /tmp/final-before.html
curl -s "http://127.0.0.1:3458/?variant=direct-mail" | sed -E 's/_next\/static\/[^"]+//g' > /tmp/dm-before.html
```

- [ ] **Step 2: Add the accent type and green default** in `src/config/homeMarketingVariants.ts` (above `HomeCalculatorTheme`):

```ts
/**
 * The calculator's accent colour, as complete Tailwind class strings (Tailwind
 * only emits classes it can see in source) plus one hex for SVG/inline use.
 * The green site sets this to exactly the literals it used before the One
 * Percent Blues front door existed, so its HTML is unchanged; the blue page
 * supplies a blue set (src/config/onePercentBlues.ts).
 */
export type CalculatorAccentTheme = {
  hex: string;
  textClassName: string;
  strongTextClassName: string;
  borderClassName: string;
  tileClassName: string;
  tileHoverClassName: string;
  tileGroupHoverClassName: string;
  tileAltClassName: string;
  rowHoverClassName: string;
  linkHoverClassName: string;
  focusOutlineClassName: string;
  focusRingClassName: string;
  focusWithinBorderClassName: string;
  focusWithinOutlineClassName: string;
  focusWithinRingClassName: string;
};

export const calculatorAccentGreen: CalculatorAccentTheme = {
  hex: "#108843",
  textClassName: "text-[#108843]",
  strongTextClassName: "text-[#007A2F]",
  borderClassName: "border-[#108843]",
  tileClassName: "bg-[#EAF7EF]",
  tileHoverClassName: "hover:bg-[#D8F0E0]",
  tileGroupHoverClassName: "group-hover:bg-[#D8F0E0]",
  tileAltClassName: "bg-[#E4F6EB]",
  rowHoverClassName: "hover:bg-[#F5FAF7]",
  linkHoverClassName: "hover:text-[#0A6E35]",
  focusOutlineClassName: "focus-visible:outline-[#108843]",
  focusRingClassName: "focus-visible:ring-[#108843]/35",
  focusWithinBorderClassName: "focus-within:border-[#108843]",
  focusWithinOutlineClassName: "focus-within:outline-[#108843]",
  focusWithinRingClassName: "focus-within:ring-[#108843]/20",
};
```
Add `accent: CalculatorAccentTheme;` to `HomeCalculatorTheme` (after `linkClassName`), and `accent: calculatorAccentGreen,` to each of the four `calculator:` objects (`direct-mail`, `fee-receipt`, `fiduciary-upgrade`, `final-home`).

- [ ] **Step 3: Context in `HomeCalculatorExperience.tsx`.** Add to the imports: `createContext, useContext` from react and `calculatorAccentGreen` + `type CalculatorAccentTheme` from `@/config/homeMarketingVariants`. Below the props type:

```ts
/* Accent colour for the final-c layout's sub-components. A context rather than
   a prop on six signatures: the default is the green the site always used, so
   every layout that does not provide it renders exactly as before. */
const CalculatorAccentContext = createContext<CalculatorAccentTheme>(calculatorAccentGreen);
const useCalculatorAccent = () => useContext(CalculatorAccentContext);
```
In `FinalHomeCalculatorExperience` add `theme,` to the destructured props and wrap the returned tree: `return (<CalculatorAccentContext.Provider value={theme.accent}> …existing JSX… </CalculatorAccentContext.Provider>);`.

- [ ] **Step 4: Replace the literals** (current line numbers; each function gets `const accent = useCalculatorAccent();` at its top — components only, never inside a callback):

| Line | Function | Replace | With |
|---|---|---|---|
| 274 | `EditableHeaderButton` | `focus-visible:outline-[#108843]` | `${accent.focusOutlineClassName}` |
| 280 | `EditableHeaderButton` | `text-[#108843]` | `${accent.textClassName}` |
| 391 | `FinalHeaderNumberInput` | `focus-within:border-[#108843]` … `focus-within:outline-[#108843]` | `${accent.focusWithinBorderClassName}` … `${accent.focusWithinOutlineClassName}` (turn the string into a template literal) |
| 499 | `MathAssumptionInputCard` | `focus-within:border-[#108843] focus-within:ring-2 focus-within:ring-[#108843]/20` | `${accent.focusWithinBorderClassName} focus-within:ring-2 ${accent.focusWithinRingClassName}` |
| 1164 | `FinalHomeLineChart` | `stroke="#108843"` | `stroke={accent.hex}` |
| 1267 | `FinalHomeLineChart` | `color: "#108843",` | `color: accent.hex,` |
| 1484 | `SimpleMathResults` | `text-[#007A2F]` | `${accent.strongTextClassName}` |
| 1511 | `MathExpandButton` | `bg-[#EAF7EF] text-[#108843]` … `hover:bg-[#D8F0E0]` … `focus-visible:ring-[#108843]/35` | `${accent.tileClassName} ${accent.textClassName}` … `${accent.tileHoverClassName}` … `${accent.focusRingClassName}` |
| 1693 | `SeeOurMathBento` | `hover:bg-[#F5FAF7]` … `focus-visible:outline-[#108843]` | `${accent.rowHoverClassName}` … `${accent.focusOutlineClassName}` |
| 1695, 1783, 1788, 1795, 1799, 1868, 2011, 2054 | `SeeOurMathBento` | `text-[#108843]` | `${accent.textClassName}` |
| 1700 | `SeeOurMathBento` | `bg-[#EAF7EF] text-[#108843]` … `group-hover:bg-[#D8F0E0]` | `${accent.tileClassName} ${accent.textClassName}` … `${accent.tileGroupHoverClassName}` |
| 1869 | `SeeOurMathBento` | `bg-[#E4F6EB]` | `${accent.tileAltClassName}` |
| 2054 | `SeeOurMathBento` | `hover:text-[#0A6E35]` | `${accent.linkHoverClassName}` |
| 2419, 2440, 2457 | `FinalHomeCalculatorExperience` | `text-[#108843]` | `${accent.textClassName}` |
| 2446 | `FinalHomeCalculatorExperience` | `border-[#108843]` … `text-[#108843]` | `${accent.borderClassName}` … `${accent.textClassName}` |

Leave lines 658/665 (`DirectMailCalculatorExperience`) alone — that layout is not on the blue path. Leave `CostAnalysisCalculator.tsx` lines 231, 900 and 1114 as they are: 231 is `SimpleRangeControl`, which the final-c layout does not render; 900 is the share-error fallback input and 1114 the pre-hydration placeholder bar, both acceptable green on the blue page and recorded in the Task 9 backlog item.

- [ ] **Step 5: Prove the green HTML is byte-identical**

```bash
# restart the dev server from Step 1 (same port), then:
curl -s http://127.0.0.1:3458/ | sed -E 's/_next\/static\/[^"]+//g' > /tmp/home-after.html
curl -s "http://127.0.0.1:3458/?variant=final-home" | sed -E 's/_next\/static\/[^"]+//g' > /tmp/final-after.html
curl -s "http://127.0.0.1:3458/?variant=direct-mail" | sed -E 's/_next\/static\/[^"]+//g' > /tmp/dm-after.html
diff /tmp/home-before.html /tmp/home-after.html && diff /tmp/final-before.html /tmp/final-after.html && diff /tmp/dm-before.html /tmp/dm-after.html && echo IDENTICAL
```
Expected: `IDENTICAL`. Any diff other than a build id means a class string moved or changed — fix it.

- [ ] **Step 6: Note it in `CALCULATOR-CANON.md`** — in the "Mirrored files" table row for `HomeCalculatorExperience.tsx`, append to "What must stay in sync": `; accent colours read from theme.accent (CalculatorAccentTheme, defaults = the previous green literals) since 2026-09-17 — mirror the type, not the blue values`.

- [ ] **Step 7: Verify and commit**

```bash
npm run lint && npm run build && npm run test:home-wwwh && npm run test:calculator-canon-manifest
git add src/config/homeMarketingVariants.ts src/components/HomeCalculatorExperience.tsx CALCULATOR-CANON.md
git commit -m "refactor(calculator): route final-c accent greens through theme.accent"
```

---

### Task 4: Blue foundation — font, config, global CSS, icon

**Files:**
- Modify: `src/app/fonts.ts` (add `fraunces`)
- Create: `src/config/onePercentBlues.ts`
- Modify: `src/app/globals.css` (append a blues block)
- Modify: `tailwind.config.ts` (`fontFamily["blues-serif"]`)
- Create: `public/brand/blues-icon.svg`

**Interfaces:**
- Produces: `fraunces` (`--font-blues-serif`, class `font-blues-serif`); `BLUES_HOST`, `BLUES_ORIGIN`, `bluesCopy`, `bluesCheckQuestions`, `diagnoseBlues()`, `bluesDiagnoses`, `bluesCalculatorTheme`, `bluesJsonLd`, `BluesAnswers`, `BluesAnswer`, `BluesQuestionId`, `BluesDiagnosisKey`.

- [ ] **Step 1: `src/app/fonts.ts`** — append:

```ts
import { Fraunces } from "next/font/google";

/** One Percent Blues display face (headline, questions, the diagnosis number). */
export const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["600", "700"],
  style: ["normal", "italic"],
  variable: "--font-blues-serif",
  display: "swap",
});
```
(Merge into the existing `import { Inter, DM_Sans } from "next/font/google"` line.) In `tailwind.config.ts` add `"blues-serif": ["var(--font-blues-serif)", "Georgia", "serif"],` to `fontFamily`.

- [ ] **Step 2: `src/config/onePercentBlues.ts`**

```ts
import {
  type HomeCalculatorTheme,
  type CalculatorAccentTheme,
} from "@/config/homeMarketingVariants";
import { SMARTER_WAY_WEALTH_MEET_URL } from "@/config/campaignLinks";

/**
 * One Percent Blues — the blue front door to the fee calculator.
 * Spec: docs/superpowers/specs/2026-09-17-one-percent-blues-design.md
 * Every visible string on the page lives here so copy has one source.
 */

export const BLUES_HOST = "onepercentblues.com";
export const BLUES_ORIGIN = `https://${BLUES_HOST}`;

export const bluesCopy = {
  wordmark: { lead: "One Percent", tail: "Blues" },
  headerTag: "3-question check · 1 min",
  eyebrow: "A free check from a flat-fee fiduciary",
  headline: { lead: "Got the", emphasis: "1% Blues?" },
  sub: "Three quick questions. No email, no login. Then we show you the number and the cure.",
  diagnosisEyebrow: "Diagnosis",
  tiles: [
    { label: "Symptom", body: "A fee that grows with your balance, invisible on the statement." },
    {
      label: "Treatment",
      body: "$100 a month. Period. Real human fiduciary advice from a CFA charterholder and CFP® professional.",
    },
    { label: "Next step", body: "Meet David for 15 minutes on video. Nothing to prepare." },
  ],
  primaryCta: { label: "Get the cure — meet David", href: SMARTER_WAY_WEALTH_MEET_URL },
  secondaryCta: { label: "Run it on my numbers first", href: "#calculator" },
  calculatorHeading: "Your numbers, not ours.",
  calculatorSub: "Every assumption is yours to change. The math is public and takes about a minute.",
  footerLine: "Smarter Way Wealth, LLC · Connecticut-registered investment adviser · CRD #342140",
  metaTitle: "Got the 1% Blues? | One Percent Blues",
  metaDescription:
    "Three yes/no questions, then the number: what a 1% advisory fee can cost over 20 years versus $100 a month. From Smarter Way Wealth, a flat-fee fiduciary.",
} as const;

export type BluesQuestionId = "q1" | "q2" | "q3";
export type BluesAnswer = "yes" | "no";
export type BluesAnswers = Record<BluesQuestionId, BluesAnswer | null>;

export const bluesCheckQuestions: ReadonlyArray<{
  id: BluesQuestionId;
  prompt: string;
  yesLabel: string;
  noLabel: string;
}> = [
  { id: "q1", prompt: "Do you pay a percentage of your portfolio for advice?", yesLabel: "Yes", noLabel: "No / not sure" },
  { id: "q2", prompt: "Do you know what you paid last year, in dollars?", yesLabel: "Yes", noLabel: "No" },
  { id: "q3", prompt: "Did your fee go up when your portfolio did?", yesLabel: "Yes", noLabel: "No / not sure" },
];

export type BluesDiagnosisKey = "full" | "mild" | "unsure";

/** Null until all three questions are answered. */
export function diagnoseBlues(answers: BluesAnswers): BluesDiagnosisKey | null {
  if (!answers.q1 || !answers.q2 || !answers.q3) return null;
  if (answers.q1 === "no") return "unsure";
  if (answers.q2 === "no" || answers.q3 === "yes") return "full";
  return "mild";
}

export const bluesDiagnoses: Record<BluesDiagnosisKey, { heading: string; lead: string }> = {
  full: {
    heading: "Yep. That's the 1% Blues.",
    lead: "A percentage fee you cannot see, growing with your balance. Here is what it can add up to.",
  },
  mild: {
    heading: "A mild case. Still a case.",
    lead: "You can see the fee. It still compounds against you every year.",
  },
  unsure: {
    heading: "Not sure? That's the most common answer.",
    lead: "Asset-based fees rarely show up as a line item. If your advisor is paid a percentage, this is your number.",
  },
};

const bluesAccent: CalculatorAccentTheme = {
  hex: "#2563EB",
  textClassName: "text-[#1D4ED8]",
  strongTextClassName: "text-[#1E3A8A]",
  borderClassName: "border-[#2563EB]",
  tileClassName: "bg-[#EAF0FF]",
  tileHoverClassName: "hover:bg-[#DCE6FF]",
  tileGroupHoverClassName: "group-hover:bg-[#DCE6FF]",
  tileAltClassName: "bg-[#E3ECFF]",
  rowHoverClassName: "hover:bg-[#F3F6FF]",
  linkHoverClassName: "hover:text-[#1E40AF]",
  focusOutlineClassName: "focus-visible:outline-[#2563EB]",
  focusRingClassName: "focus-visible:ring-[#2563EB]/35",
  focusWithinBorderClassName: "focus-within:border-[#2563EB]",
  focusWithinOutlineClassName: "focus-within:outline-[#2563EB]",
  focusWithinRingClassName: "focus-within:ring-[#2563EB]/20",
};

/** Same shape as the green variants' `calculator` theme; blue values. The
 *  section and backdrop are transparent so the page gradient shows through
 *  and the white calculator card floats on it, as in the approved mock. */
export const bluesCalculatorTheme: HomeCalculatorTheme = {
  sectionClassName: "bg-transparent text-slate-950",
  backdropClassName: "bg-transparent",
  eyebrowClassName: "text-[#BFDBFE]",
  titleClassName: "text-white",
  amountClassName: "text-[#1E3A8A]",
  bodyClassName: "text-white/90",
  shareButtonClassName:
    "border border-white/40 bg-white/10 px-4 text-sm font-semibold text-white backdrop-blur hover:bg-white/20",
  disclaimerClassName: "text-white/70",
  frameClassName:
    "overflow-hidden rounded-[20px] border border-white/60 bg-white shadow-[0_18px_40px_rgba(11,26,68,0.22)]",
  chartFrameClassName: "bg-white",
  controlsClassName: "border-t border-[#DFE6EE] bg-white px-4 pb-4 pt-2 sm:px-6 sm:pb-6 sm:pt-3 lg:px-8 lg:pb-8 lg:pt-4",
  collapseButtonClassName: "text-slate-500 hover:bg-slate-50",
  helperTextClassName: "text-white/80",
  linkClassName: "text-white underline transition-colors hover:text-[#BFDBFE]",
  accent: bluesAccent,
  slider: {
    labelClassName: "text-[#213B56]",
    trackClassName: "bg-[#DCE4EB]",
    destructiveColor: "#1E3A8A",
    destructiveTrack: "#BFD3FF",
    accumulationColor: "#2563EB",
    accumulationTrack: "#C7DBFF",
    addButtonClassName: "text-[#1D4ED8] hover:text-[#1E3A8A]",
    removeButtonClassName: "text-slate-500 hover:text-slate-700",
  },
  chart: {
    mode: "light",
    chartBg: "#FFFFFF",
    panelBgClassName: "border-[#DFE6EE] bg-white",
    panelBorderClassName: "border-[#DFE6EE]",
    mutedTextClassName: "text-[#52657A]",
    strongTextClassName: "text-[#10233A]",
    smarterStroke: "#2563EB",
    traditionalStroke: "#1E3A8A",
    traditionalArea: "#BFD3FF",
    grid: "#DCE4EB",
    xTick: "#52657A",
    yTick: "#52657A",
    cursor: "#DCE4EB",
    lostStart: "#60A5FA",
    lostEnd: "#60A5FA",
    lostFillEnd: "#DBEAFE",
    keptStart: "#1E3A8A",
    keptEnd: "#1E3A8A",
  },
};

const FIRM_ENTITY_ID = "https://youarepayingtoomuch.com/#smarter-way-wealth";
const CALCULATOR_ENTITY_ID = "https://youarepayingtoomuch.com/#fee-calculator";

/** Declared once on the blue layout. The firm and the calculator application
 *  are declared on youarepayingtoomuch.com; here they are referenced by @id,
 *  never repeated (CLAUDE.md agent-readiness: one declaration per concept). */
export const bluesJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${BLUES_ORIGIN}/#website`,
    name: "One Percent Blues",
    url: `${BLUES_ORIGIN}/`,
    about: { "@id": FIRM_ENTITY_ID },
  },
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${BLUES_ORIGIN}/#page`,
    url: `${BLUES_ORIGIN}/`,
    name: bluesCopy.metaTitle,
    description: bluesCopy.metaDescription,
    isPartOf: { "@id": `${BLUES_ORIGIN}/#website` },
    about: { "@id": FIRM_ENTITY_ID },
    mainEntity: { "@id": CALCULATOR_ENTITY_ID },
  },
];
```

- [ ] **Step 3: `src/app/globals.css`** — append at the end:

```css
/* One Percent Blues (src/app/(blues)). Scoped to the page wrapper; the two
   `:root:has` lines paint the document canvas deep blue so rubber-band
   overscroll never flashes the green site's grey behind the gradient. */
:root:has([data-theme="blues"]) {
  background-color: #1e3a8a;
}
:root:has([data-theme="blues"]) body {
  background-color: #1e3a8a;
}
@layer base {
  [data-theme="blues"] a {
    color: #1d4ed8;
  }
  [data-theme="blues"] a:hover {
    color: #1e3a8a;
  }
}
[data-theme="blues"] .custom-slider {
  background: linear-gradient(to right, #2563eb 0%, #2563eb var(--value-percent, 50%), #e5e7eb var(--value-percent, 50%), #e5e7eb 100%);
}
[data-theme="blues"] .custom-slider::-webkit-slider-thumb,
[data-theme="blues"] .custom-slider::-moz-range-thumb {
  background: #2563eb;
}
```

- [ ] **Step 4: `public/brand/blues-icon.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#1E3A8A"/><rect x="14" y="34" width="8" height="16" rx="2" fill="#BFDBFE"/><rect x="28" y="24" width="8" height="26" rx="2" fill="#60A5FA"/><rect x="42" y="14" width="8" height="36" rx="2" fill="#FFFFFF"/></svg>
```

- [ ] **Step 5: Verify and commit**

```bash
npm run lint && npx tsc --noEmit
git add src/app/fonts.ts src/config/onePercentBlues.ts src/app/globals.css tailwind.config.ts public/brand/blues-icon.svg
git commit -m "feat(blues): copy, theme, font and global styles for One Percent Blues"
```

---

### Task 5: Blue components — header, footer, opening (questions + diagnosis)

**Files:**
- Create: `src/components/blues/BluesHeader.tsx`, `src/components/blues/BluesFooter.tsx`, `src/components/blues/BluesCheck.tsx`, `src/components/blues/BluesOpening.tsx`

**Interfaces:**
- Consumes: Task 4 config; `NoteMarker`-equivalent link via `disclaimerHref` from `@/config/calculatorNotes`; `capturePostHogEvent` from `@/lib/posthog`; `formatCurrency`, `formatCurrencyFloored` from `@/lib/format`.
- Produces: `BluesHeader()` and `BluesFooter()` (server components, no props); `BluesOpening(props: BluesOpeningProps)` (client) where

```ts
export type BluesOpeningProps = {
  savings: number;
  portfolioValue: number;
  years: number;
  annualGrowthPercent: number;
  annualFeePercent: number;
  annualFlatFee: number;
};
```

- [ ] **Step 1: `BluesHeader.tsx`**

```tsx
import { ExternalLink } from "lucide-react";
import { bluesCopy } from "@/config/onePercentBlues";
import { SMARTER_WAY_WEALTH_ORIGIN } from "@/config/campaignLinks";

export function BluesHeader() {
  return (
    <header className="mx-auto flex w-full max-w-[1040px] items-center justify-between gap-3 px-4 py-3.5 sm:px-6 lg:py-5">
      <a
        href="/"
        className="whitespace-nowrap font-blues-serif text-[20px] font-bold !text-white !no-underline"
        aria-label="One Percent Blues home"
      >
        {bluesCopy.wordmark.lead} <em className="font-semibold italic opacity-85">{bluesCopy.wordmark.tail}</em>
      </a>
      <div className="flex items-center gap-2">
        <span className="hidden whitespace-nowrap rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold lg:inline-block">
          {bluesCopy.headerTag}
        </span>
        <a
          href={`${SMARTER_WAY_WEALTH_ORIGIN}/`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-bold !text-white !no-underline hover:bg-white/10"
          data-posthog-cta="true"
          data-posthog-cta-label="Smarter Way Wealth"
          data-posthog-cta-location="blues_nav"
        >
          Smarter Way Wealth
          <ExternalLink aria-hidden="true" className="h-4 w-4" strokeWidth={2.5} />
        </a>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: `BluesFooter.tsx`**

```tsx
import ComplianceFooter from "@/components/ComplianceFooter";
import { CalculatorNotes } from "@/components/CalculatorNotes";
import { bluesCopy } from "@/config/onePercentBlues";

const IAPD_URL = "https://adviserinfo.sec.gov/firm/summary/342140";
const DISCLOSURES_URL = "https://smarterwaywealth.com/disclosures";
const ADV_BROCHURE_URL = "https://smarterwaywealth.com/disclosures/ADV-Part-2A.pdf";
const PRIVACY_URL = "https://smarterwaywealth.com/privacy";

/** Same footer contract as SiteFooter (disclaimer + the four legal links)
 *  on a pale-blue ground, then the unchanged ComplianceFooter. */
export function BluesFooter() {
  return (
    <>
      <footer className="border-t border-white/30 bg-[#EEF3FF] text-[#10233A]">
        <div className="mx-auto max-w-[1100px] px-4 py-10 sm:px-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-2xl space-y-3">
              <p className="text-sm font-bold">{bluesCopy.footerLine}</p>
              <CalculatorNotes />
            </div>
            <div className="flex shrink-0 flex-wrap gap-x-6 gap-y-2 text-sm">
              <a href={DISCLOSURES_URL} className="!text-[#52657A] no-underline hover:!text-[#10233A]">Disclosures</a>
              <a href={ADV_BROCHURE_URL} target="_blank" rel="noopener noreferrer" className="!text-[#52657A] no-underline hover:!text-[#10233A]">ADV Brochure (PDF)</a>
              <a href={IAPD_URL} target="_blank" rel="noopener noreferrer" className="!text-[#52657A] no-underline hover:!text-[#10233A]">Verify on IAPD</a>
              <a href={PRIVACY_URL} className="!text-[#52657A] no-underline hover:!text-[#10233A]">Privacy Policy</a>
            </div>
          </div>
        </div>
      </footer>
      <ComplianceFooter />
    </>
  );
}
```

- [ ] **Step 3: `BluesCheck.tsx`** (client)

```tsx
"use client";

import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { disclaimerHref } from "@/config/calculatorNotes";
import {
  bluesCheckQuestions,
  bluesCopy,
  bluesDiagnoses,
  diagnoseBlues,
  type BluesAnswer,
  type BluesAnswers,
  type BluesQuestionId,
} from "@/config/onePercentBlues";
import { formatCurrency, formatCurrencyFloored } from "@/lib/format";
import { capturePostHogEvent } from "@/lib/posthog";
import type { BluesOpeningProps } from "./BluesOpening";

const EMPTY: BluesAnswers = { q1: null, q2: null, q3: null };

const ANSWER_BUTTON =
  "flex min-h-[46px] items-center justify-center rounded-xl border-[1.5px] px-3 text-[15px] font-semibold transition-colors focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]";
const ANSWER_ON = "border-[#2563EB] bg-[#2563EB] text-white";
const ANSWER_OFF = "border-[#C7D7FF] bg-white text-[#0B1A44] hover:bg-[#F3F6FF]";

/** Three yes/no cards, then the diagnosis card once all three are answered.
 *  Renders two siblings (questions, card) so the desktop grid in
 *  BluesOpening can place the card under the copy and the questions beside it,
 *  while a phone reads copy → questions → card in DOM order. */
export function BluesCheck({
  savings,
  portfolioValue,
  years,
  annualGrowthPercent,
  annualFeePercent,
  annualFlatFee,
}: BluesOpeningProps) {
  const [answers, setAnswers] = useState<BluesAnswers>(EMPTY);
  const completedRef = useRef(false);
  const reduceMotion = useReducedMotion();
  const diagnosis = diagnoseBlues(answers);

  const answer = useCallback((id: BluesQuestionId, value: BluesAnswer) => {
    setAnswers((prev) => {
      const next = { ...prev, [id]: value };
      capturePostHogEvent("blues_check_answered", { question: id, answer: value });
      const result = diagnoseBlues(next);
      if (result && !completedRef.current) {
        completedRef.current = true;
        capturePostHogEvent("blues_check_completed", { diagnosis: result });
      }
      return next;
    });
  }, []);

  return (
    <>
      <div className="mt-5 flex flex-col gap-3 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-0">
        {bluesCheckQuestions.map((question, index) => {
          const labelId = `blues-${question.id}-label`;
          const current = answers[question.id];
          return (
            <div
              key={question.id}
              role="group"
              aria-labelledby={labelId}
              className="rounded-[20px] bg-white px-4 pb-3.5 pt-4 text-[#0B1A44] shadow-[0_18px_40px_rgba(11,26,68,0.22)]"
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#2563EB]">
                Question {index + 1} of 3
              </p>
              <p id={labelId} className="mt-1.5 font-blues-serif text-[22px] font-semibold leading-[1.15]">
                {question.prompt}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button type="button" aria-pressed={current === "yes"} onClick={() => answer(question.id, "yes")} className={`${ANSWER_BUTTON} ${current === "yes" ? ANSWER_ON : ANSWER_OFF}`}>
                  {question.yesLabel}
                </button>
                <button type="button" aria-pressed={current === "no"} onClick={() => answer(question.id, "no")} className={`${ANSWER_BUTTON} ${current === "no" ? ANSWER_ON : ANSWER_OFF}`}>
                  {question.noLabel}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="lg:col-start-1 lg:row-start-2" aria-live="polite">
        <AnimatePresence initial={false}>
          {diagnosis ? (
            <motion.section
              key={diagnosis}
              id="diagnosis"
              aria-labelledby="blues-diagnosis-heading"
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: 8 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="mt-3 rounded-[22px] border border-white/15 bg-[#1E3A8A] px-[18px] py-5 text-white shadow-[0_22px_50px_rgba(11,26,68,0.35)] lg:mt-0"
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#93C5FD]">{bluesCopy.diagnosisEyebrow}</p>
              <h3 id="blues-diagnosis-heading" className="mt-1.5 font-blues-serif text-[30px] font-semibold leading-[1.05]">
                {bluesDiagnoses[diagnosis].heading}
              </h3>
              <p className="mt-2 text-[15px] leading-6 text-white/85">{bluesDiagnoses[diagnosis].lead}</p>
              <p
                className="mt-3.5 font-blues-serif text-[clamp(48px,14vw,84px)] font-bold leading-none tracking-[-0.03em] tabular-nums"
                data-blues-savings={Math.round(savings)}
              >
                {formatCurrencyFloored(savings)}
                <a href={disclaimerHref} aria-label="See the calculator disclaimer" className="ml-1 align-super text-[0.4em] font-bold !text-white/70 !no-underline">*</a>
              </p>
              <p className="mt-1 text-[13px] leading-[1.45] text-white/85">
                Projected {years}-year difference between a {annualFeePercent.toFixed(2)}% asset-based fee and {formatCurrency(annualFlatFee / 12)}/month flat, on {formatCurrency(portfolioValue)} at {annualGrowthPercent.toFixed(1)}% growth. Hypothetical, adjustable, not a guarantee.
              </p>
              <div className="mt-3.5 grid grid-cols-1 gap-2 sm:grid-cols-3">
                {bluesCopy.tiles.map((tile) => (
                  <div key={tile.label} className="rounded-[14px] bg-white/10 px-3.5 py-3 text-sm leading-[1.4]">
                    <p className="mb-0.5 text-xs font-bold uppercase tracking-[0.1em] text-[#93C5FD]">{tile.label}</p>
                    {tile.body}
                  </div>
                ))}
              </div>
              <a
                href={bluesCopy.primaryCta.href}
                className="mt-4 flex min-h-[54px] items-center justify-center rounded-[14px] bg-white px-4 text-center text-base font-bold !text-[#1E3A8A] !no-underline hover:bg-[#EEF3FF]"
                data-posthog-cta="true"
                data-posthog-cta-label={bluesCopy.primaryCta.label}
                data-posthog-cta-location="blues_diagnosis_meet"
              >
                {bluesCopy.primaryCta.label}
              </a>
              <a
                href={bluesCopy.secondaryCta.href}
                className="mt-2 flex min-h-[54px] items-center justify-center rounded-[14px] border-[1.5px] border-white/50 px-4 text-center text-base font-bold !text-white !no-underline hover:bg-white/10"
                data-posthog-cta="true"
                data-posthog-cta-label={bluesCopy.secondaryCta.label}
                data-posthog-cta-location="blues_diagnosis_calculator"
              >
                {bluesCopy.secondaryCta.label}
              </a>
            </motion.section>
          ) : null}
        </AnimatePresence>
      </div>
    </>
  );
}
```

- [ ] **Step 4: `BluesOpening.tsx`** (client — it renders the client check)

```tsx
"use client";

import { bluesCopy, bluesDiagnoses } from "@/config/onePercentBlues";
import { formatCurrencyFloored } from "@/lib/format";
import { BluesCheck } from "./BluesCheck";

export type BluesOpeningProps = {
  savings: number;
  portfolioValue: number;
  years: number;
  annualGrowthPercent: number;
  annualFeePercent: number;
  annualFlatFee: number;
};

/** Eyebrow, headline, sub-copy and the check. Phone: copy → questions → card.
 *  Desktop (lg): two columns — copy over the diagnosis card on the left,
 *  the three questions on the right spanning both rows. */
export function BluesOpening(props: BluesOpeningProps) {
  return (
    <section
      aria-labelledby="blues-heading"
      className="mx-auto w-full max-w-[1040px] px-4 pb-5 pt-6 text-white sm:px-6 lg:grid lg:grid-cols-2 lg:grid-rows-[auto_auto] lg:items-start lg:gap-x-11 lg:gap-y-6 lg:pb-8 lg:pt-11"
    >
      <div className="lg:col-start-1 lg:row-start-1">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-white/85">{bluesCopy.eyebrow}</p>
        <h1 id="blues-heading" className="mt-2.5 font-blues-serif text-[clamp(44px,12.5vw,96px)] font-semibold leading-[0.98] tracking-[-0.02em]">
          {bluesCopy.headline.lead}
          <br />
          <em className="italic text-[#BFDBFE]">{bluesCopy.headline.emphasis}</em>
        </h1>
        <p className="mt-3.5 max-w-[34ch] text-[17px] leading-[1.5] text-white/90">{bluesCopy.sub}</p>
        <noscript>
          <p className="mt-4 text-[15px] leading-6 text-white/90">
            {bluesDiagnoses.full.heading} With the calculator&rsquo;s starting assumptions the projected {props.years}-year difference is {formatCurrencyFloored(props.savings)}. The cure: {bluesCopy.tiles[1].body}{" "}
            <a href={bluesCopy.primaryCta.href} className="!text-white underline">{bluesCopy.primaryCta.label}</a>
          </p>
        </noscript>
      </div>
      <BluesCheck {...props} />
    </section>
  );
}
```

- [ ] **Step 5: Verify and commit**

```bash
npm run lint && npx tsc --noEmit
git add src/components/blues
git commit -m "feat(blues): header, footer, opening check and diagnosis card"
```

---

### Task 6: The blue composition inside `CostAnalysisCalculator`, FAQ tone, CTA surface

**Files:**
- Modify: `src/components/CostAnalysisCalculator.tsx` (`Props`, imports, mode flags, theme pick, `bluesHandoff`, calculator props, post-calculator blocks)
- Modify: `src/components/HomeFaqSection.tsx` (add `tone` prop)
- Modify: `src/components/SignupCta.tsx` (add `surfaceClassName` prop)

**Interfaces:**
- Produces: `experienceMode?: "marketing" | "calculator-first" | "savings-calculator-upgrade" | "one-percent-blues"`; `HomeFaqSection({ tone = "light" }: { tone?: "light" | "blues" })`; `SignupCta({ …, surfaceClassName = "bg-[#EEF0F5]" })`.

- [ ] **Step 1: `SignupCta.tsx`** — add `surfaceClassName?: string;` to `SignupCtaProps` (doc: "Outer band background for the block variant; the blue page passes bg-transparent"), destructure `surfaceClassName = "bg-[#EEF0F5]"`, and change the block variant's outer `<section className="w-full bg-[#EEF0F5] px-4 py-10 sm:px-6 sm:py-14">` to ``<section className={`w-full ${surfaceClassName} px-4 py-10 sm:px-6 sm:py-14`}>``.

- [ ] **Step 2: `HomeFaqSection.tsx`** — add above `FaqRow`:

```ts
type FaqTone = "light" | "blues";

/* Presentation per host. "light" is the green home exactly as before; "blues"
   sits the same white card on the One Percent Blues gradient. */
const FAQ_TONES: Record<FaqTone, { section: string; heading: string; chevron: string; arrow: string; doorHover: string }> = {
  light: {
    section: "bg-[#EEF0F5]",
    heading: "text-[#10233A]",
    chevron: "text-[#007A2F]",
    arrow: "text-[#007A2F]",
    doorHover: "group-hover:bg-[#F2FBF5] group-hover:ring-[#00A540]",
  },
  blues: {
    section: "bg-transparent",
    heading: "text-white",
    chevron: "text-[#2563EB]",
    arrow: "text-[#2563EB]",
    doorHover: "group-hover:bg-[#EEF3FF] group-hover:ring-[#2563EB]",
  },
};
```
`FaqRow` gains a `chevronClassName: string` prop used in place of `text-[#007A2F]` on the `ChevronRight`. `HomeFaqSection({ tone = "light" }: { tone?: FaqTone })` reads `const t = FAQ_TONES[tone];` and uses `t.section` in the section className (replacing `bg-[#EEF0F5]`), `t.heading` in the h2 (replacing `text-[#10233A]`), passes `chevronClassName={t.chevron}` to each `FaqRow`, and in the door link replaces `group-hover:bg-[#F2FBF5] group-hover:ring-[#00A540]` with `${t.doorHover}` and the arrow's `text-[#007A2F]` with `${t.arrow}` (template literals). The strings `How does your lean model make $100 a month possible?` and `<em className="font-[440]">rhetorical question</em>` must stay byte-identical (tests/home-wwwh.mjs:715-716).

- [ ] **Step 3: `CostAnalysisCalculator.tsx`**

Imports: add `import { BluesOpening } from "@/components/blues/BluesOpening";` and `import { bluesCalculatorTheme, bluesCopy } from "@/config/onePercentBlues";`.

`Props.experienceMode` type becomes `"marketing" | "calculator-first" | "savings-calculator-upgrade" | "one-percent-blues"`.

After `const usesOpeningMarketingHero = experienceMode === "marketing";` add:

```ts
  const isOnePercentBlues = experienceMode === "one-percent-blues";
  /* The blue page shares the lean home's calculator behaviour (inputs view,
     chart heading, no view tabs, disclaimer in the footer rather than the
     card) but not its grey section ground or its sections below. */
  const usesLeanCalculator = isSavingsCalculatorUpgrade || isOnePercentBlues;
```
Change `const calculatorTheme = marketingVariant.calculator;` to `const calculatorTheme = isOnePercentBlues ? bluesCalculatorTheme : marketingVariant.calculator;`.

Add next to `calculatorHandoff`:

```tsx
  const bluesHandoff = isOnePercentBlues ? (
    <div className="relative z-10 mx-auto w-full max-w-[1040px] px-4 pt-3 sm:px-6 sm:pt-5">
      <h2 className="font-blues-serif text-[30px] font-semibold leading-[1.05] text-white sm:text-[40px]">
        {bluesCopy.calculatorHeading}
      </h2>
      <p className="mt-2 max-w-2xl text-base leading-6 text-white/90 sm:text-lg">{bluesCopy.calculatorSub}</p>
    </div>
  ) : null;
```

In the JSX: before `{isSavingsCalculatorUpgrade && (<SavingsLeadHero …` insert

```tsx
      {isOnePercentBlues && (
        <BluesOpening
          savings={projection.savings}
          portfolioValue={state.portfolioValue}
          years={state.years}
          annualGrowthPercent={state.annualGrowthPercent}
          annualFeePercent={state.annualFeePercent}
          annualFlatFee={state.annualFlatFee}
        />
      )}
```
Inside `<section id="calculator">`: after `{calculatorHandoff}` add `{bluesHandoff}`. On `<HomeCalculatorExperience>` change `disclosure={isSavingsCalculatorUpgrade ? null : disclosure}` → `disclosure={usesLeanCalculator ? null : disclosure}`, `showViewTabs={!isSavingsCalculatorUpgrade}` → `showViewTabs={!usesLeanCalculator}`, `initialView={isSavingsCalculatorUpgrade ? "inputs" : "header"}` → `initialView={usesLeanCalculator ? "inputs" : "header"}`, `showChartHeading={isSavingsCalculatorUpgrade}` → `showChartHeading={usesLeanCalculator}`. Leave the section's `isSavingsCalculatorUpgrade ? "bg-[#EEF0F5] …" : calculatorTheme.sectionClassName` ternaries as they are (the blue theme's section/backdrop are transparent).

After `{isSavingsCalculatorUpgrade && <HomeFaqSection />}` add:

```tsx
      {isOnePercentBlues && <SignupCta location="blues_post_calculator" surfaceClassName="bg-transparent" />}

      {isOnePercentBlues && <HomeFaqSection tone="blues" />}
```

- [ ] **Step 4: Verify (green HTML still identical, locks still pass) and commit**

```bash
npm run lint && npx tsc --noEmit && npm run test:home-wwwh
# repeat Task 3 Step 5's diff against /tmp/*-before.html — expected IDENTICAL
git add src/components/CostAnalysisCalculator.tsx src/components/HomeFaqSection.tsx src/components/SignupCta.tsx
git commit -m "feat(blues): one-percent-blues experience mode, FAQ tone, CTA surface"
```

---

### Task 7: The `/blues` route — layout, page, share card, robots/sitemap/llms

**Files:**
- Create: `src/app/(blues)/blues/layout.tsx`, `src/app/(blues)/blues/page.tsx`, `src/app/(blues)/blues/robots.txt/route.ts`, `src/app/(blues)/blues/sitemap.xml/route.ts`, `src/app/(blues)/blues/llms.txt/route.ts`, `src/app/api/og/blues/route.tsx`
- Modify: `public/llms.txt` (one line)

- [ ] **Step 1: `layout.tsx`**

```tsx
import type { Metadata, Viewport } from "next";
import { fraunces } from "@/app/fonts";
import { BluesFooter } from "@/components/blues/BluesFooter";
import { BluesHeader } from "@/components/blues/BluesHeader";
import { BLUES_ORIGIN, bluesCopy, bluesJsonLd } from "@/config/onePercentBlues";

export const metadata: Metadata = {
  metadataBase: new URL(BLUES_ORIGIN),
  title: bluesCopy.metaTitle,
  description: bluesCopy.metaDescription,
  openGraph: {
    type: "website",
    siteName: "One Percent Blues",
    url: `${BLUES_ORIGIN}/`,
    title: bluesCopy.metaTitle,
    description: bluesCopy.metaDescription,
    images: [{ url: "/api/og/blues", width: 1200, height: 630, alt: "Got the 1% Blues? Estimated advisory-fee difference" }],
  },
  twitter: { card: "summary_large_image", title: bluesCopy.metaTitle, description: bluesCopy.metaDescription, images: ["/api/og/blues"] },
  icons: { icon: [{ url: "/brand/blues-icon.svg", type: "image/svg+xml" }] },
};

export const viewport: Viewport = { themeColor: "#1E3A8A" };

export default function BluesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-theme="blues"
      className={`${fraunces.variable} min-h-screen bg-[linear-gradient(180deg,#1E3A8A_0%,#2563EB_42%,#60A5FA_100%)] text-white`}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(bluesJsonLd) }} />
      <BluesHeader />
      {children}
      <BluesFooter />
    </div>
  );
}
```

- [ ] **Step 2: `page.tsx`** — same shape as `src/app/(site)/page.tsx` (copy `normalizeSearchParams` verbatim):

```tsx
import type { Metadata } from "next";
import { CostAnalysisCalculator } from "@/components/CostAnalysisCalculator";
import { BLUES_ORIGIN, bluesCopy } from "@/config/onePercentBlues";
import { buildQueryFromState, parseCalculatorState } from "@/lib/calculatorState";
import { buildFeeProjection } from "@/lib/feeProjection";
import { formatCurrency } from "@/lib/format";

type BluesSearchParams = Record<string, string | string[] | undefined>;

function normalizeSearchParams(searchParams: BluesSearchParams) { /* verbatim from (site)/page.tsx */ }

export async function generateMetadata({ searchParams }: { searchParams: Promise<BluesSearchParams> }): Promise<Metadata> {
  const params = normalizeSearchParams(await searchParams);
  const state = parseCalculatorState(params);
  const projection = buildFeeProjection({
    annualFlatFee: state.annualFlatFee,
    initialInvestment: state.portfolioValue,
    years: state.years,
    annualFeePercent: state.annualFeePercent + state.mutualFundExpensePercent,
    annualGrowthPercent: state.annualGrowthPercent,
  });
  const query = buildQueryFromState(state, params);
  const image = `/api/og/blues?${query}`;
  const description = `${bluesCopy.metaDescription} This scenario: ${formatCurrency(projection.savings)} over ${state.years} years on ${formatCurrency(state.portfolioValue)}.`;
  return {
    title: bluesCopy.metaTitle,
    description,
    alternates: { canonical: `${BLUES_ORIGIN}/` },
    openGraph: { title: bluesCopy.metaTitle, description, url: `${BLUES_ORIGIN}/?${query}`, images: [{ url: image, width: 1200, height: 630, alt: `${formatCurrency(projection.savings)} estimated advisory-fee difference` }] },
    twitter: { card: "summary_large_image", title: bluesCopy.metaTitle, description, images: [image] },
  };
}

export default async function OnePercentBluesPage({ searchParams }: { searchParams: Promise<BluesSearchParams> }) {
  const resolved = await searchParams;
  const state = parseCalculatorState(normalizeSearchParams(resolved));
  return (
    <main className="flex flex-col pb-10">
      <CostAnalysisCalculator
        initialState={state}
        searchParams={resolved}
        marketingVariantId="final-home"
        experienceMode="one-percent-blues"
      />
    </main>
  );
}
```

- [ ] **Step 3: `robots.txt/route.ts`, `sitemap.xml/route.ts`, `llms.txt/route.ts`**

```ts
// robots.txt/route.ts
import { BLUES_ORIGIN } from "@/config/onePercentBlues";
export const dynamic = "force-static";
const BODY = [
  "User-agent: *", "Allow: /", "Disallow: /api/quiz/", "",
  "User-agent: GPTBot", "Allow: /", "", "User-agent: ClaudeBot", "Allow: /", "",
  "User-agent: PerplexityBot", "Allow: /", "", "User-agent: Google-Extended", "Allow: /", "",
  "User-agent: CCBot", "Allow: /", "", `Sitemap: ${BLUES_ORIGIN}/sitemap.xml`, "",
].join("\n");
export function GET() {
  return new Response(BODY, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
```
```ts
// sitemap.xml/route.ts
import { BLUES_ORIGIN } from "@/config/onePercentBlues";
export const dynamic = "force-static";
const BODY = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${BLUES_ORIGIN}/</loc>\n  </url>\n</urlset>\n`;
export function GET() {
  return new Response(BODY, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
```
```ts
// llms.txt/route.ts
import { BLUES_ORIGIN } from "@/config/onePercentBlues";
export const dynamic = "force-static";
const BODY = `# One Percent Blues

A campaign front door to the Smarter Way Wealth fee calculator: three yes/no questions, then the projected difference between a 1% asset-based advisory fee and a flat $100/month fee. Same calculator, same math and same disclosures as https://youarepayingtoomuch.com/.

Primary URLs:

- The page (check, diagnosis, calculator, FAQ): ${BLUES_ORIGIN}/
- Structured calculator API (prefer this over scraping): https://youarepayingtoomuch.com/api/calculator
- Math and assumptions: https://youarepayingtoomuch.com/our-math
- Full FAQ: https://smarterwaywealth.com/faq
- Firm site and 15-minute video meeting: https://smarterwaywealth.com/meet
- SEC/IAPD firm record: https://adviserinfo.sec.gov/firm/summary/342140

Firm context:

- Firm: Smarter Way Wealth, LLC — Connecticut-registered investment adviser, CRD 342140
- Founder: David J. Van Osdol, CFA, CFP
- Pricing model referenced by the calculator: flat $100/month advisory fee
- Smarter Way Wealth never takes custody of client funds

Agent guidance:

- The calculator's default illustration is $1,000,000 for 20 years at 8% growth with a 1% asset-based fee; the URL carries the assumptions (portfolio, years, growth, fee, flat, mfe).
- Treat all calculator results as hypothetical educational illustrations, not investment advice, and never as a guarantee.
- Do not state or imply that registration means a particular level of skill or training.
`;
export function GET() {
  return new Response(BODY, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
```

- [ ] **Step 4: `src/app/api/og/blues/route.tsx`** — copy `src/app/api/og/route.tsx` and change only: no `runtime = "edge"` line (default Node runtime); background `linear-gradient(135deg, #1E3A8A 0%, #2563EB 55%, #60A5FA 100%)`; text colours white/`#BFDBFE`; the glow `rgba(255,255,255,0.18)`; header text `One Percent Blues` (was `Smarter Way Wealth`) and `Got the 1% Blues?` (was `Fee drag projection`); the pill background `#ffffff` with colour `#1E3A8A`; keep the label `Estimated advisory-fee difference` exactly (tests/share-receipt-language.test.mjs wording); the big number in white; footer row colour `#DBEAFE`, border `2px solid rgba(255,255,255,0.28)`; add a final `<span>Smarter Way Wealth · $100/month. Period.</span>` to the footer row.

- [ ] **Step 5: `public/llms.txt`** — under "Primary URLs:" add `- Sister campaign page (same calculator, blue skin): https://onepercentblues.com/`.

- [ ] **Step 6: Look at it** (dev server + Playwright MCP at 375 and 1280; answer the three questions; check the card appears under the questions on the phone and beside them on desktop; no horizontal scroll; the calculator, share panel, poll, FAQ and footer render). Fix anything glaring before moving on.

- [ ] **Step 7: Verify and commit**

```bash
npm run lint && npm run build
git add "src/app/(blues)" src/app/api/og/blues public/llms.txt
git commit -m "feat(blues): /blues route, blue share card, robots, sitemap and llms.txt"
```

---

### Task 8: Tests and CI

**Files:**
- Create: `tests/blues-source-locks.mjs`, `tests/blues-host-routing.mjs`
- Modify: `package.json` scripts, `.github/workflows/ci.yml` test job

- [ ] **Step 1: `tests/blues-source-locks.mjs`**

```js
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (p) => readFile(new URL(p, import.meta.url), "utf8");
const [config, opening, check, calculator, nextConfig, rootLayout, siteLayout, bluesLayout, bluesPage] = await Promise.all([
  read("../src/config/onePercentBlues.ts"),
  read("../src/components/blues/BluesOpening.tsx"),
  read("../src/components/blues/BluesCheck.tsx"),
  read("../src/components/CostAnalysisCalculator.tsx"),
  read("../next.config.mjs"),
  read("../src/app/layout.tsx"),
  read("../src/app/(site)/layout.tsx"),
  read("../src/app/(blues)/blues/layout.tsx"),
  read("../src/app/(blues)/blues/page.tsx"),
]);

test("the approved headline and check copy are the single source", () => {
  assert.match(config, /headline: \{ lead: "Got the", emphasis: "1% Blues\?" \}/);
  for (const q of [
    "Do you pay a percentage of your portfolio for advice?",
    "Do you know what you paid last year, in dollars?",
    "Did your fee go up when your portfolio did?",
  ]) assert.ok(config.includes(q), `question missing: ${q}`);
  assert.match(config, /heading: "Yep\. That's the 1% Blues\."/);
  assert.match(config, /heading: "A mild case\. Still a case\."/);
  assert.match(config, /heading: "Not sure\? That's the most common answer\."/);
  assert.match(config, /primaryCta: \{ label: "Get the cure — meet David", href: SMARTER_WAY_WEALTH_MEET_URL \}/);
  assert.doesNotMatch(config, /phone|call us|custody of/i);
});

test("the diagnosis card is conditional on all three answers and carries the disclaimer link", () => {
  assert.match(config, /if \(!answers\.q1 \|\| !answers\.q2 \|\| !answers\.q3\) return null;/);
  assert.match(check, /diagnoseBlues\(answers\)/);
  assert.match(check, /href=\{disclaimerHref\}/);
  assert.match(check, /data-posthog-cta-location="blues_diagnosis_meet"/);
  assert.match(opening, /<noscript>/);
});

test("the blue page composes the shared engine in one-percent-blues mode", () => {
  assert.match(bluesPage, /experienceMode="one-percent-blues"/);
  assert.match(calculator, /const isOnePercentBlues = experienceMode === "one-percent-blues";/);
  assert.match(calculator, /<BluesOpening/);
  assert.match(calculator, /<SignupCta location="blues_post_calculator" surfaceClassName="bg-transparent" \/>/);
  assert.match(calculator, /<HomeFaqSection tone="blues" \/>/);
  assert.match(calculator, /calculatorTheme = isOnePercentBlues \? bluesCalculatorTheme : marketingVariant\.calculator/);
});

test("site chrome lives on the route groups, never on the root layout", () => {
  assert.doesNotMatch(rootLayout, /SiteNav|SiteFooter|application\/ld\+json/);
  assert.match(siteLayout, /<SiteNav \/>/);
  assert.match(siteLayout, /<SiteFooter \/>/);
  assert.match(bluesLayout, /data-theme="blues"/);
  assert.match(bluesLayout, /<BluesHeader \/>/);
  assert.match(bluesLayout, /<BluesFooter \/>/);
  assert.match(bluesLayout, /metadataBase: new URL\(BLUES_ORIGIN\)/);
});

test("host rules: the blue domain is one page, the other hostnames redirect there", () => {
  assert.match(nextConfig, /beforeFiles: \[/);
  assert.match(nextConfig, /source: "\/", has: \[bluesHost\], destination: "\/blues"/);
  for (const host of ["1percentblues.com", "www.1percentblues.com"]) assert.ok(nextConfig.includes(`"${host}"`), host);
  assert.match(nextConfig, /destination: `\$\{GREEN_ORIGIN\}\/:path`/);
  assert.match(nextConfig, /\(\?!\$\{BLUES_PASSTHROUGH\}\)\.\+/, "the catch-all must never match '/'");
});
```

- [ ] **Step 2: `tests/blues-host-routing.mjs`** — reuse the dev-server harness from `tests/home-disclosures-ssr.mjs` (`getUnusedPort`, `waitForPage`, spawn with `windowsHide: true`, the `finally` taskkill), then:

```js
const blues = { Host: "onepercentblues.com" };
const get = (path, headers = {}) => fetch(`${base}${path}`, { headers, redirect: "manual" });

// 1. /blues on the default host serves the page with the required content and no green nav
let html = await (await get("/blues")).text();
for (const needle of ["Got the", "1% Blues?", "$788,306", 'id="calculator"', 'id="calculator-notes"', "Registration does not imply", 'data-theme="blues"', "Do you pay a percentage of your portfolio for advice?"]) {
  assert.ok(html.includes(needle), `/blues must contain ${needle}`);
}
assert.ok(!html.includes('aria-label="Mobile navigation"'), "the green nav must not render on the blue page");
assert.ok(!html.includes("What would you do with"), "the green hero must not render on the blue page");

// 2. the blue host serves the page at / and its own agent files
html = await (await get("/", blues)).text();
assert.ok(html.includes('data-theme="blues"') && html.includes("1% Blues?"), "Host: onepercentblues.com must serve the blue page at /");
html = await (await get("/?portfolio=2000000&years=20&growth=8&fee=1", blues)).text();
assert.ok(html.includes("/api/og/blues?"), "the blue OG card must carry the scenario query");
assert.ok(!html.includes("$788,306"), "a custom scenario must not show the default number");
assert.match(await (await get("/robots.txt", blues)).text(), /Sitemap: https:\/\/onepercentblues\.com\/sitemap\.xml/);
assert.match(await (await get("/sitemap.xml", blues)).text(), /<loc>https:\/\/onepercentblues\.com\/<\/loc>/);
assert.match(await (await get("/llms.txt", blues)).text(), /# One Percent Blues/);
// the green host still serves its own
assert.match(await (await get("/robots.txt")).text(), /Sitemap: https:\/\/youarepayingtoomuch\.com\/sitemap\.xml/);

// 3. redirects
const expectRedirect = async (path, headers, location, statuses = [307, 308]) => {
  const res = await get(path, headers);
  assert.ok(statuses.includes(res.status), `${path} (${headers.Host ?? "default"}) → ${res.status}, expected ${statuses}`);
  assert.equal(res.headers.get("location"), location);
};
await expectRedirect("/our-math", blues, "https://youarepayingtoomuch.com/our-math", [307]);
await expectRedirect("/become-a-client", blues, "https://youarepayingtoomuch.com/become-a-client", [307]);
await expectRedirect("/?fee=1.5", { Host: "1percentblues.com" }, "https://onepercentblues.com/?fee=1.5", [308]);
await expectRedirect("/", { Host: "www.onepercentblues.com" }, "https://onepercentblues.com/", [308]);
const bluesSelf = await get("/blues", blues);
assert.equal(bluesSelf.status, 308);
assert.match(bluesSelf.headers.get("location") ?? "", /^(https?:\/\/onepercentblues\.com)?\/$/);

// 4. the green home is untouched and the share card renders
html = await (await get("/")).text();
assert.ok(html.includes("What would you do with") && html.includes('aria-label="Mobile navigation"'), "the green home must still render its hero and nav");
const og = await get("/api/og/blues?portfolio=1000000&years=20&growth=8&fee=1");
assert.equal(og.status, 200);
assert.match(og.headers.get("content-type") ?? "", /image\/png/);

console.log("Blue front door: page, agent files, redirects and share card all behave; green home unchanged.");
```

- [ ] **Step 3: Wire in**

`package.json` scripts: `"test:blues-source-locks": "node --test tests/blues-source-locks.mjs",` and `"test:blues-host-routing": "node tests/blues-host-routing.mjs",`.
`.github/workflows/ci.yml` test job: after the `Source locks (WWWH, nav, spacing constants)` step add `- name: Source locks (One Percent Blues)` / `run: npm run test:blues-source-locks`; after `Mailto CTA redaction` add `- name: One Percent Blues host routing` / `run: npm run test:blues-host-routing`.

- [ ] **Step 4: Run everything, commit**

```bash
npm run test:blues-source-locks && npm run test:blues-host-routing && npm run test:home-wwwh && npm run test:home-disclosures-ssr && npm run test:active-direct-start && npm run test:calculator-canon-manifest && npm run test:share-one-tap && npm run lint && npm run build
git add tests/blues-source-locks.mjs tests/blues-host-routing.mjs package.json .github/workflows/ci.yml
git commit -m "test(blues): source locks and host-routing contract"
```

---

### Task 9: Records, PR, ship, domains, proof

**Files:**
- Modify: `REPO-LOG.md` (new top entry), `docs/backlog.md` (three items), `docs/superpowers/specs/…` + `plans/…` already committed in the first commit of the branch

- [ ] **Step 1: REPO-LOG entry** (top of file, same format as the existing entries; status "locally verified; production proof required after merge", updated after proof). Backlog items: (1) blue share-card domain line + blue poll button need a canon change synced with `D:\smarter-way-wealth`; (2) `CostAnalysisCalculator.tsx` lines 231/900/1114 still literal green (unused or fallback paths on the blue page); (3) `youarepayingtoomuch.com/blues` also serves the page — decide whether to redirect it to onepercentblues.com once the domain is proven.

- [ ] **Step 2: Push and open the PR**

```bash
git push -u origin feat/one-percent-blues-20260917
gh pr create --title "One Percent Blues: blue front door on onepercentblues.com" --body-file <body written from the spec's §1 + §3 diagram; ends with the required attribution line>
```
Watch CI (`verify` + `test`), fix, re-push. Merge with `gh pr merge --squash` when green.

- [ ] **Step 3: Deploy truth** — read the production deployment from the platform (Vercel MCP `list_deployments`/`get_deployment`, team `dvo`, project `you-are-paying-too-much.com`): `READY`, `target=production`, commit == `origin/main` HEAD. Then `curl -sI https://youarepayingtoomuch.com/blues` → 200 and the page HTML contains `1% Blues?`.

- [ ] **Step 4: Attach the domains** (project config, explicitly requested): `vercel domains add onepercentblues.com you-are-paying-too-much.com --scope dvo`, then `1percentblues.com`, `www.onepercentblues.com`, `www.1percentblues.com`. `vercel domains inspect onepercentblues.com --scope dvo` must show the project. (No deploy commands.)

- [ ] **Step 5: Prove on the apex** — `curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n"` for `https://onepercentblues.com/` (200), `https://1percentblues.com/` (308 → onepercentblues.com), `https://onepercentblues.com/our-math` (307 → youarepayingtoomuch.com), `https://onepercentblues.com/robots.txt`, `/sitemap.xml`, `/llms.txt`, `https://onepercentblues.com/api/og/blues` (200 image/png); `https://youarepayingtoomuch.com/` still 200 with its hero. Playwright MCP screenshots of `https://onepercentblues.com/` at 375 and 1280, answering the three questions.

- [ ] **Step 6: Close out** — update the REPO-LOG entry with the proof (deployment id, commit, URLs), commit it on a tiny follow-up branch → PR → merge, remove the worktree (`git worktree remove --force D:\worktrees\one-percent-blues-20260917` + delete the local branch), and publish the David-facing report page with the live screenshots.

---

## Execution notes (2026-09-17, same session)

What the build did differently from the tasks above, so the plan stays an honest record:

- **Task 3:** the accent reaches the seven final-c sub-components through a module-private
  `CalculatorAccentContext` (default `calculatorAccentGreen`) rather than props; each of
  `EditableHeaderButton`, `FinalHeaderNumberInput`, `MathAssumptionInputCard`, `FinalHomeLineChart`,
  `SimpleMathResults`, `MathExpandButton` and `SeeOurMathBento` opens with
  `const accent = useCalculatorAccent();`, and `FinalHomeCalculatorExperience` wraps its tree in the
  provider with `props.theme.accent`. The first pass inserted the hook into only one component and the
  green page fell into its error boundary — caught by the structural HTML comparison, not by eye.
- **Task 3, the identity check:** a line diff of the streamed HTML is noise (random Sentry trace ids,
  chunk boundaries), so the comparison is structural — the sorted multisets of every class attribute,
  inline style, SVG stroke/fill, href and text node before vs. after (`compare-html.cjs` in the session
  scratchpad). It also has to wait for a fully compiled response; a capture taken while Turbopack was
  still recompiling holds only the loading shell.
- **Task 1:** `loading.tsx` and `error.tsx` moved under `(site)` too (review finding: their fallbacks
  had lost the green chrome). Shared files are CRLF on this machine; the scripted edits normalise
  line endings before matching.
- **Task 5/6, review round:** diagnosis card gets the receipt label "Estimated advisory-fee difference",
  scrolls into view on first appearance when it lands under the fold, and its secondary step is an
  underlined link (one-button-one-link). `?check=yny` seeds the three answers so a link renders its
  diagnosis server-side (`parseBluesAnswers`, threaded `page → CostAnalysisCalculator → BluesOpening →
  BluesCheck` as `initialCheck`). Cross-domain doors (`SignupCta primaryHref`, "For finance nerds") are
  plain absolute links with UTM tags — a `next/link` prefetch of a redirecting route fails CORS.
- **Task 7:** blue JSON-LD declares the firm, WebSite, WebApplication and WebPage itself (no dangling
  cross-site `@id` references); the page's `openGraph` restates `siteName`/`type` because a page-level
  `openGraph` replaces the layout's whole object; `manifest: null` keeps the green PWA manifest off the
  blue host.
- **Task 8:** the host-routing test uses `node:http` — Node's `fetch` (undici) silently replaces a
  caller-set Host header — and reads redirects without following them, so CI never calls production.
