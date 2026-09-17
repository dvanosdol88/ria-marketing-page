# One Percent Blues — design spec

**Date:** 2026-09-17 · **Author:** Claude Fable 5.1 · **Status:** approved concept (Concept C, "Feeling Blue?", with the "Got the 1% Blues?" headline), spec written for build
**Concept round:** https://claude.ai/artifact/3WiVMnyqm27ybCd2DMR9A7 (David picked Concept C, headline from Concept A, capital B)

## 1. What we are building

A second front door to the fee calculator: **onepercentblues.com**, a blue campaign page served by the
youarepayingtoomuch.com codebase. **1percentblues.com** redirects there. Same engine, same math, same share
tools, same FAQ, same compliance footer — new skin, new opening.

Page order (mobile first, top to bottom):

1. **Header** — wordmark "One Percent *Blues*", a "3-question check · 1 min" tag (desktop), a link to Smarter Way Wealth.
2. **Opening** — eyebrow, the headline **"Got the 1% Blues?"**, one line of sub-copy.
3. **The check** — three yes/no questions.
4. **Diagnosis card** — appears once all three are answered. Live number (defaults to $788,306), the $100/month cure, "Get the cure — meet David" and "Run it on my numbers first".
5. **Calculator** — the same calculator experience as the green home (sliders, chart, results, "View calculation details", the canon share panel, the poll), in a blue theme.
6. **Conversion block** — the site's standard Become a client / talk to David block.
7. **FAQ** — the same three questions as the green home, blue accents.
8. **Footer** — disclaimer (the calculator notes every `*` marker links to), disclosure links, then the same regulatory compliance footer as youarepayingtoomuch.com.

Mentor check-in (answers proposed; David corrects in one reply if wrong):
(1) Done = onepercentblues.com serves this page live, 1percentblues.com lands there, both proven on the apex.
(2) Mechanism = one codebase, two front doors keyed by domain; it will not create a second site to maintain and will not change what youarepayingtoomuch.com shows.
(3) Number = completed 3-question checks and "meet David" clicks from onepercentblues.com in PostHog next week (first goal: 10 completed checks).

## 2. Copy (final)

| Slot | Copy |
|---|---|
| Eyebrow | A free check from a flat-fee fiduciary |
| H1 | Got the **1% Blues?** (the "1% Blues?" span is italic, lighter blue) |
| Sub | Three quick questions. No email, no login. Then we show you the number and the cure. |
| Q1 | Do you pay a percentage of your portfolio for advice? — **Yes** / **No / not sure** |
| Q2 | Do you know what you paid last year, in dollars? — **Yes** / **No** |
| Q3 | Did the amount you actually pay go up? — **Yes** / **No / not sure** (David, 2026-09-17: "fee" read as a percentage, which probably did not go up; the dollars did) |
| Diagnosis, full case (Q1 yes and Q2 no, or Q1 yes and Q3 yes) | eyebrow "Diagnosis" · **Yep. That's the 1% Blues.** |
| Diagnosis, mild case (Q1 yes, Q2 yes, Q3 no) | **A mild case. Still a case.** |
| Diagnosis, unsure (Q1 no / not sure) | **No percentage fee, or not sure?** — "If nobody takes a percentage of your portfolio, this is the number you are avoiding. If you are not sure, check one statement: asset-based fees rarely show up as a line item." |
| Number label | Estimated advisory-fee difference (the site's receipt language) |
| Number | live projected difference from the calculator state (default $788,306), with the `*` disclaimer marker |
| Under the number | Projected {years}-year difference between a {fee}% asset-based fee and ${monthly}/month flat, on {portfolio} at {growth}% growth. Hypothetical, adjustable, not a guarantee. |
| Tile: Symptom | A fee that grows with your balance and rarely shows up as a line item. |
| Tile: Treatment | $100 a month. Period. Real human fiduciary advice from a CFA charterholder and CFP® professional. |
| Tile: Next step | Meet David for 15 minutes on video. Nothing to prepare. |
| Primary button | Get the cure — meet David → https://smarterwaywealth.com/meet |
| Secondary link (underlined text, not a second button — the site's one-button-one-link pattern) | Run it on my numbers first → `#calculator` |
| Calculator heading | Your numbers, not ours. |
| Calculator sub | Every assumption is yours to change. The math is public and takes about a minute. |
| Footer line | Smarter Way Wealth, LLC · Connecticut-registered investment adviser · CRD #342140 |

Fixed rules carried over: video meetings only (no phone), no custody language, the calculator disclaimer stays
the single short paragraph from `src/config/calculatorNotes.ts`, the account minimum stays off the page.

## 3. Architecture — one engine, two front doors

```
  onepercentblues.com/        ──rewrite──▶  /blues            (blue skin)
  onepercentblues.com/x       ──redirect─▶  youarepayingtoomuch.com/x   (anything that is not the page or an asset)
  1percentblues.com/*         ──redirect─▶  onepercentblues.com/*
  www.onepercentblues.com/*   ──redirect─▶  onepercentblues.com/*
  youarepayingtoomuch.com/*   unchanged    (green site, untouched)
```

### 3.1 Route groups (why files move)

The root layout renders the green header and footer on every route. A page cannot remove what its parent
layout renders, and the client-side `usePathname()` check the header and footer already use is unreliable
under a host rewrite (the browser URL stays `/`). So the site chrome moves into a route group:

```
src/app/layout.tsx                 html, body, fonts, providers, PostHog, site-level metadata  (thin)
src/app/(site)/layout.tsx          green JSON-LD + <SiteNav/> + children + <SiteFooter/>
src/app/(site)/page.tsx            ← moved: every existing page directory moves under (site)/
src/app/(site)/become-a-client/…   (URLs do not change; route groups are invisible in the URL)
src/app/(blues)/blues/layout.tsx   blue metadata, JSON-LD, <BluesHeader/> + children + <BluesFooter/>
src/app/(blues)/blues/page.tsx     the page
src/app/(blues)/blues/robots.txt/route.ts, sitemap.xml/route.ts, llms.txt/route.ts
src/app/api/…                      unchanged (api routes have no chrome)
src/app/not-found.tsx              renders SiteNav/SiteFooter itself so 404s keep the green chrome
```

`tests/home-wwwh.mjs` and `tests/active-direct-start.mjs` read moved pages by path; those three lines update
to the new locations. `loading.tsx` and `error.tsx` move under `(site)` too, so their fallbacks keep the green
header and footer around them. The root `not-found.tsx` renders the green chrome itself.

Review round (2026-09-17, three-lens panel with adversarial verification) changed four things from the first
draft: the blue page declares its own firm and calculator entities in JSON-LD instead of pointing at nodes that
only exist on the green site; the page-level Open Graph restates the site name and type (a page's `openGraph`
replaces the layout's, it does not merge); the diagnosis card scrolls into view the first time it appears on a
phone; and cross-domain doors from the blue page (sign-up, our-math) are plain absolute links, never `next/link`,
because a client-side prefetch of a redirecting route fails CORS. The host-routing test uses `node:http`, since
Node's `fetch` replaces a caller-set Host header.

### 3.2 Host rules (`next.config.mjs`)

Rewrites (`beforeFiles`, so they beat the static files in `public/`), all with `has: [{ type: "host", value: "onepercentblues.com" }]`:

| source | destination |
|---|---|
| `/` | `/blues` |
| `/robots.txt` | `/blues/robots.txt` |
| `/sitemap.xml` | `/blues/sitemap.xml` |
| `/llms.txt` | `/blues/llms.txt` |

Redirects (added to the existing list):

| host | source | destination | status |
|---|---|---|---|
| `1percentblues.com`, `www.1percentblues.com`, `www.onepercentblues.com` | `/:path*` | `https://onepercentblues.com/:path*` | 308 |
| `onepercentblues.com` | `/blues` | `/` | 308 |
| `onepercentblues.com` | `/:path((?!api/\|_next/\|blues\|brand/\|images/\|assets/\|monitoring\|favicon\|apple-touch-icon\|site\.webmanifest\|robots\.txt\|sitemap\.xml\|llms\.txt).+)` | `https://youarepayingtoomuch.com/:path` | 307 |

The last rule is what keeps the blue domain to one page: `/our-math`, `/become-a-client`, `/privacy` and
every other green route bounce to the green domain instead of rendering green pages under a blue address.
Assets, the share-card and calculator APIs, and Next internals are excluded. `.+` (not `.*`) so `/` itself
never matches.

### 3.3 The page (`/blues`)

`page.tsx` is a server component mirroring the green home: parse the calculator query params (`flat`,
`portfolio`, `years`, `growth`, `fee`, `mfe`) with `parseCalculatorState`, compute the projection for
metadata, and render `<CostAnalysisCalculator experienceMode="one-percent-blues" …/>`. Because the share
stack builds its link from `window.location.origin` + `/?query#calculator`, a link shared from
onepercentblues.com lands back on onepercentblues.com with the visitor's numbers — no change to the canon files.

`CostAnalysisCalculator` gains a fourth `experienceMode`, `"one-percent-blues"`, which composes:

```
<BluesOpening …>            eyebrow · h1 · sub · <BluesCheck/> (questions + diagnosis card)
<section id="calculator">   blue intro heading + <HomeCalculatorExperience layout="final-c" theme={bluesCalculatorTheme} …/>
<SignupCta location="blues_post_calculator" surfaceClassName="bg-transparent"/>
<HomeFaqSection tone="blues"/>
```

The diagnosis card reads the live projection from the calculator state (same object the sliders drive), so
the number in the card and the number in the chart never disagree. All calculator state management,
URL sync, PostHog `calculator_*` events, share and poll wiring are reused as-is.

### 3.4 Theme

- Palette (from the approved mock): deep `#1E3A8A`, cobalt `#2563EB`, sky `#60A5FA`, ink `#0B1A44`,
  muted `#4B5F8F`, pale `#BFDBFE`. Page ground: `linear-gradient(180deg,#1E3A8A 0%,#2563EB 42%,#60A5FA 100%)`.
- Fonts: Fraunces (headline, question text, big numbers; added to `src/app/fonts.ts` as `--font-blues-serif`)
  + the site's Inter.
- `bluesCalculatorTheme: HomeCalculatorTheme` lives in `src/config/onePercentBlues.ts` (NOT in
  `homeMarketingVariants`, so `youarepayingtoomuch.com/?variant=…` can never select it).
- `HomeCalculatorTheme` gains an `accent` group (text, strong text, soft background, hover, border,
  focus, SVG stroke class/colour strings). `HomeCalculatorExperience.tsx` and `CostAnalysisCalculator.tsx`
  route their ~30 hard-coded green literals (`#108843`, `#007A2F`, `#EAF7EF`, `#D8F0E0`, `#E4F6EB`,
  `#DFF7EA`, `#F5FAF7`, `#0A6E35`) through it. The four existing variants set `accent` to exactly the
  current greens, so the green site renders byte-for-byte the same HTML.
- `[data-theme="blues"]` on the page wrapper; `globals.css` adds: html background deep blue while a
  blues page is mounted (`:root:has([data-theme="blues"])`), link colour cobalt inside the wrapper,
  slider accent blue. No other global styles change.
- Known, accepted: the poll's vote button and focus rings inside the hash-locked canon files stay green /
  navy; the share card's footer text reads "youarepayingtoomuch.com" and its image is the green card.
  Both need a canon change synced with the sister repo — logged in the backlog, out of scope here.

### 3.5 Metadata, agents, analytics

- Blues layout overrides `metadataBase` (`https://onepercentblues.com`), title ("Got the 1% Blues? | One
  Percent Blues"), description, OG/Twitter (siteName "One Percent Blues", image `/api/og/blues?…`), icons
  (new `public/brand/blues-icon.svg`), theme colour `#1E3A8A`. Page sets `alternates.canonical` to
  `https://onepercentblues.com/`.
- JSON-LD on the blues layout: `WebSite` (`#website` on onepercentblues.com, `about` → the firm entity
  already declared on youarepayingtoomuch.com), `WebPage` (`mainEntity` → the calculator `WebApplication`
  entity on youarepayingtoomuch.com), `FAQPage` with the two data-backed questions. Green JSON-LD moves
  into the `(site)` layout unchanged. No entity is repeated across the two sites.
- `/api/og/blues` — the 1200×630 share card in the blue palette (same query shape as `/api/og`).
- Blues `robots.txt` (AI bots allowed, sitemap → onepercentblues.com), `sitemap.xml` (one URL),
  `llms.txt` (short index pointing at the page, the calculator JSON endpoint on the green domain, our-math,
  the firm FAQ, and the standing agent guidance). Green `public/llms.txt` gains one line naming the sister page.
- The check renders its questions and both answer buttons server-side; the diagnosis card renders after
  interaction, and a `<noscript>` block carries the number, the cure and the meet link for readers without
  JavaScript. The calculator's result and the disclaimer are already in the server HTML.
- PostHog: pageviews already carry the hostname. New events `blues_check_answered`
  `{question, answer}` and `blues_check_completed` `{diagnosis}`; CTAs carry `data-posthog-cta`
  with locations `blues_diagnosis_meet`, `blues_diagnosis_calculator`, `blues_post_calculator_*`.

### 3.6 Tests

- `tests/blues-source-locks.mjs` (node:test, no browser): headline, three questions, diagnosis outcomes,
  primary CTA target, host rules present in `next.config.mjs`, canon files not imported anywhere new.
- `tests/blues-host-routing.mjs` (real `next dev`, `node:http` requests with `Host` headers, redirects read
  and never followed): `/blues` serves the page
  with "Got the 1% Blues?", the default number, `id="calculator"`, the disclaimer anchor and the compliance
  text, and no green nav; `Host: onepercentblues.com` on `/`, `/robots.txt`, `/sitemap.xml`, `/llms.txt`
  serves the blue versions; `/our-math` on that host redirects to youarepayingtoomuch.com; `1percentblues.com`
  and `www.onepercentblues.com` redirect to onepercentblues.com with the query preserved; the green home on
  the default host is unchanged; `/api/og/blues` returns a PNG.
- Both wired into `package.json` and the CI test job. All existing suites keep passing (the source-lock
  suite's path update is the only edit).

## 4. Shipping and proof

Short-lived branch → PR → CI green → merge to `main` (the merge is the deploy). Then, in order:

1. Platform read: the production deployment is `READY` and its commit is `origin/main` HEAD.
2. Prove `/blues` on the green apex serves the page (works before any domain is attached).
3. Attach `onepercentblues.com` and `1percentblues.com` to the Vercel project `you-are-paying-too-much.com`
   (team `dvo`) — both already live in the team's domain list and resolve to Vercel, so attaching is the
   only step. `www` variants added alongside so the code redirects can catch them.
4. Prove on the apex: `https://onepercentblues.com/` → 200 blue page; `https://1percentblues.com/` → 308 →
   onepercentblues.com; `/our-math` on the blue host → youarepayingtoomuch.com; robots/sitemap/llms on the
   blue host; the share card image; and screenshots at 375px and 1280px of the live apex.
5. REPO-LOG entry, backlog items, and a David-facing report page with the live screenshots.

## 5. Out of scope

Ads and mailer creative for the campaign (the "Got the 1% blues?" Meta ad already exists in
`docs/marketing/2026-09_paid-ads-copy-pack.md`); a blue share-card domain line / poll button (canon change);
any change to what youarepayingtoomuch.com shows; a separate repo or Vercel project.
