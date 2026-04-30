# REPO-LOG — ria-marketing-page

> Persistent activity memory for this repo. Read by any agent or human.
> Newest sessions on top.

## Current Capabilities

Lead-gen marketing site for Smarter Way Wealth, LLC deployed at https://youarepayingtoomuch.com via Vercel.

- Home fee-savings calculator (`CostAnalysisCalculator` + `ProFeeChart`): pill-slider inputs (advisory fee, mutual fund expenses, portfolio value, annual growth, time horizon), live odometer of "lost to asset-based fees", URL-shareable state via `buildQueryFromState`, share-to-clipboard, sticky fee bar (mobile + desktop), interactive Quiz, scrolling QuoteTicker.
- Three inline regulatory disclosures around the home calculator: hypothetical-illustration caveat, advisory-relationship disclaimer, growth-rate-is-an-assumption + third-party data caveat.
- Site-wide `SiteFooter` (logo + marketing disclaimer + Disclosures/ADV/Privacy links wired to `/privacy#disclosures`, IAPD URL, `/privacy`) followed by `ComplianceFooter` (CRD identification, IAPD link, educational/risk text, Privacy link, contact, last-updated date, copyright).
- `/privacy` page with CT Data Privacy Act-aware notice, canonical disclosures, and a `#disclosures` anchor target.
- Secondary surfaces: `/our-math`, `/faq`, `/how-it-works`, `/how-it-works/substitution`, `/save`, `/save-a-ton`, `/gallery`, `/improve-your-tools`, `/upgrade-your-advice`, `/meaning`, `/experiment`, `/mobile-calculator` (carries advisory-relationship disclosure near heading), `/components/calendar`. API routes for quiz vote.
- OpenGraph + Twitter Card metadata defaults set in root layout.
- Sentry error tracking wired (`@sentry/nextjs`), Renovate dep-update bot active.
- Stack: Next.js, React 19, TypeScript, Tailwind, Recharts. Build: `next build`. Lint: `eslint . --ext .js,.jsx,.ts,.tsx`. No test framework configured.
- Project canon in `CLAUDE.md`: project description + per-page agent-readiness checklist (treats AI agents as primary audience for this lead-gen site).

---

## Sessions

### 2026-04-30 — Home marketing variants for QR-code traffic
**Agent:** Codex | **Surface:** marketing | **Duration:** 1 session
- changed: `src/app/page.tsx` now awaits Next 16 `searchParams` and selects a home variant from `?variant=...`; default is `direct-mail`.
- added: `src/config/homeMarketingVariants.ts`, `src/components/HomeMarketingHero.tsx`, and generated hero asset `public/images/qr-mailer-calculator-hero.png`.
- variants: `/` = QR mailer/direct-mail framing; `/?variant=fee-receipt` = fee-receipt framing; `/?variant=fiduciary-upgrade` = advisor-led fiduciary framing. All preserve the same calculator, share behavior, and URL state.
- calculator polish: moved the poll below the calculator, added a stronger calculator intro, simplified `Odometer` markup so page text no longer exposes repeated digit columns, and added client-only chart mounting fallback to avoid Recharts hydration warnings. Follow-up pass added variant-specific calculator themes: QR mailer uses airy glass/green, fee-receipt uses paper/dashed-line/red accent, advisor-led uses dark fiduciary green. Chart height was tightened so the first calculator viewport shows the controls beginning below the chart.
- calculator redesign follow-up: added `src/components/HomeCalculatorExperience.tsx` and changed `CostAnalysisCalculator` to render three distinct calculator workflows while preserving the same projection math, URL state, share behavior, and range inputs. Direct-mail now uses a mobile-first step-by-step fee scan, fee-receipt uses an itemized receipt/statement layout, and fiduciary-upgrade uses a dark advisor planning console.
- verified locally: `npm run lint` (passes with 3 pre-existing `<img>` warnings), `npm run build` (passes with known Turbopack tokens warning already in backlog), Playwright mobile/desktop screenshots for all 3 variants, direct-mail CTA anchor to `#calculator`, 4 range inputs present, console clean. Follow-up browser pass rechecked themed calculator sections for all variants.
- verified follow-up: `npm run lint` (passes with same 3 pre-existing `<img>` warnings), `npm run build` (passes with the known Tailwind tokens warning), and Playwright mobile checks for all 3 variant URLs confirmed unique calculator headings, 4 range inputs, 2 chart SVGs, working advisory-fee slider updates, and zero console errors.
- quote ticker polish: desktop hover portraits now offset Fama, Munger, Franklin, and Sharpe left within the circular crop; mobile Sharpe crop matches the leftward offset; Franklin quotes are separated in both ticker data arrays.
- verified quote ticker polish: `npm run lint` (passes with same 3 pre-existing `<img>` warnings), `npm run build` (passes with known Tailwind tokens warning), local browser hover check confirmed the four portrait offsets, no consecutive Franklin items, and zero console errors.
- fiduciary hero mini-calculator follow-up: replaced the hero overlay sliders with four subtle 12px text inputs (Portfolio, Fee, Growth, Years), moved the control higher/right on desktop, and reduced the output to a single 30px Savings number.
- verified mini-calculator follow-up: `npm run lint` (passes with same 3 pre-existing `<img>` warnings), `npm run build` (passes with known Tailwind tokens warning), in-app browser screenshot at `/?variant=fiduciary-upgrade`, and Playwright desktop/mobile checks confirmed 4 visible text inputs, 0 visible hero range inputs, Fee edits update Savings, and zero console errors.
- fiduciary hero disclosure/math follow-up: removed the mini-calculator's left rule, shrank text input widths to content-sized boxes, added "vs. $100/mo. flat fee*" below Savings linking to `/our-math#assumptions`, and corrected `/our-math` worked example numbers to match `buildFeeProjection`.
- verified disclosure/math follow-up: independent math check confirmed the default 20-year example deducts $100/mo ($24,000 total flat fees) and produces flat-fee value $4,604,057, AUM value $3,815,751, savings $788,306, total AUM fees ~$422,058. `npm run lint` and `npm run build` passed with the same known warnings; Playwright desktop/mobile checks confirmed the hero has 4 visible text inputs, 0 visible range inputs, the assumption link renders, Fee edits update Savings, and `/our-math#assumptions` renders the corrected example + disclosures link.
- fiduciary copy/field follow-up: added a visible `$` to the hero Portfolio field with wider content-sized input sizing, changed the eyebrow to "Fiduciary advice without the fee drag.", changed proof points to lead with "20 years experience", removed the advisor calculator "Planning console" eyebrow, and changed that section headline to "See how much you could save".
- verified copy/field follow-up: `npm run lint` and `npm run build` passed with the same known warnings; in-app browser screenshot confirmed the desktop hero changes; Playwright desktop/mobile checks confirmed the new copy, removed old copy, 4 visible text inputs, 0 hero range inputs, no portfolio text clipping, and zero console errors.
- fiduciary gradient/cleanup follow-up: changed the advisor calculator section backdrop to a brand-green-to-white gradient, added a bold white 24px "$100/mo. flat monthly fee" line below the hero proof points, removed "Fee stack" and "Planning model" subheads from the assumption controls, and removed the quote section's repeating dollar-sign background image.
- verified gradient/cleanup follow-up: `npm run lint` and `npm run build` passed with the same known warnings; in-app browser screenshots checked the hero, calculator, and quote sections; Playwright desktop/mobile checks confirmed 24px bold white flat-fee text, green-to-white calculator gradient, no Fee Stack/Planning Model text, quote background image `none`, and zero console errors.
- fiduciary hero savings follow-up: moved the mini-calculator Savings result above the transparent Portfolio/Fee/Growth/Years inputs so the payoff appears first on desktop and within the first mobile viewport.
- verified savings follow-up: `npm run lint` and `npm run build` passed with the same known warnings; Playwright mobile check confirmed no horizontal overflow, zero console errors, and the default `$788,306` amount visible in the first `390x844` viewport; in-app browser screenshot confirmed the desktop right-side hero placement.
- not deployed: left as local/branch work for David to review before choosing what should become production default.

### 2026-04-29 — Compliance footer + inline calculator disclosures + agent-readiness canon
**Agent:** Claude (Sonnet) | **Surface:** marketing | **Duration:** ~1 session
- changed: `src/components/SiteFooter.tsx` (wired Disclosures/ADV/Privacy footer links, render `ComplianceFooter` site-wide), `src/components/CostAnalysisCalculator.tsx` (added 3 inline disclosures around hero CTA + chart card; preserved all calculator math/layout), `src/app/mobile-calculator/page.tsx` (added advisory-relationship disclosure under heading), `CLAUDE.md` (added Agent-readiness section)
- added: `src/components/ComplianceFooter.tsx`, `src/app/privacy/page.tsx`
- deployed: https://youarepayingtoomuch.com — verified live via curl (3 inline disclosures, footer present site-wide, `/privacy` returns 200, `/mobile-calculator` carries advisory disclosure, `/our-math` `/faq` `/how-it-works` `/save` `/gallery` all 200)
- next: add `robots.txt` with explicit AI-bot allow policy, `sitemap.xml`, `/llms.txt`; add JSON-LD `Organization` + `FinancialService` + `WebApplication` (calculator) + `FAQPage` (`/faq`) schemas; consider exposing `/api/calculate?…` JSON endpoint mirroring `buildFeeProjection` so agents can call rather than scrape; investigate preexisting tailwind tokens-import build warning; mirror any compliance-footer wording change to `D:\smarter-way-wealth\src\components\ComplianceFooter.js`
