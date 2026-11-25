# Fee lab, stage 1, section 1: the full calculator on youarepayingtoomuch.com (hidden)

Owner order (David, 2026-11-25): "Swap, in two stages" — chosen on the Nov 25 decision page, whose order text reads: "Swap the calculators in two stages: first give youarepayingtoomuch.com the full calculator (market history, fee schedules, details), one section at a time, shown to me before each goes live; only after that is live, simplify the smarterwaywealth.com calculator and add a "go deeper" link to the fee site, keeping old shared links working."

Spec: `D:\dvo-downloads\Executive Summaries\2026-11-25_1345_fee-lab-steps-1-2_v1.html` (Decision 1) and the Nov 17 plan `D:\dvo-downloads\Executive Summaries\2026-11-17_1405_fee-lab-plan_v1.html`.

This plan covers section 1 only: a new page `/calculator` on the fee site that carries the firm site's full calculator (the experience at https://smarterwaywealth.com/calculator, including the step-by-step entry, the advanced view with Steady/Market tabs, market-history replay and range, the fee-schedule editor, calculation details, the poll and share stack). Section 2 (linking it from the fee site and listing it publicly) and stage 2 (simplifying the firm site) come later.

## Global Constraints

- Repo `D:\yaptm-fee-lab`, branch `claude/fee-lab-shared-math` (already carries the shared engine, commit a8c47c0). Source of the full calculator: the firm site, read from `D:\sww-fee-lab` (branch `sw/fee-lab-calc-split`, same as smarterwaywealth.com main for these files) — read-only.
- HIDDEN: the new page is not linked from anywhere on the fee site, is `noindex, nofollow` in its metadata, and is not added to the sitemap or llms.txt.
- No change to any existing fee-site page: the home page, its calculator, mailer attribution, A/B variants, every existing route must render and behave exactly as before. Do not edit an existing fee-site file except to add the minimum needed for the new route (e.g. a config entry); if an existing shared file (same path in both repos, different content) is needed by the firm calculator, put the firm version under a new namespace (e.g. `src/components/full-calculator/`, `src/lib/full-calculator/`) and rewrite only the new copies' imports. Report every existing file you touched and why.
- Words: use only wording already live on the firm site's calculator (it is approved). Do NOT add the new "About these numbers" disclosure note (not approved yet). Keep every existing firm-calculator disclosure that travels with these components (including the S&P 500 market-history disclosure and the calculator illustration notes).
- Conversion links on the new page (Become a client, Questions? / Schedule 15 minutes, Email David) go to the firm site's real destinations as absolute URLs on https://smarterwaywealth.com (same paths the firm calculator uses). Keep their PostHog labels ("Become a client", "Meet David"); use a distinct `cta_location`/site tag so the fee-site page's clicks are told apart (use the fee site's existing `siteCalculatorConfig` analytics fields if they exist).
- Shared math: the new page must use `src/lib/feeProjection.ts` (the hash-locked shared engine) — do not copy a second engine.
- Look: the fee site's header/footer/layout wrap the page (route under `src/app/(site)/calculator/`); the calculator body keeps the firm calculator's look.
- Tests: add one focused test that renders or requests the new page and asserts (a) it contains the firm calculator's headline "Model the fees you actually pay.", (b) its robots metadata is noindex, (c) it is absent from the sitemap. Run that test, `npx tsc --noEmit -p .`, `npm run lint` on touched files, and `npm run build` once (the build must pass). Do not run the full test suite. Report pre-existing failures as pre-existing.
- Commit on the branch; do not push, open a pull request or merge.

## Task 1: Build the hidden /calculator page with the firm site's full calculator

1. Inventory the firm calculator's import graph from `D:\sww-fee-lab\src\app\calculator\page.tsx` (39 files, about 10,000 lines). Of those, 6 already exist byte-identical in the fee repo, 23 are missing, and 10 exist with different content: `src/components/CostAnalysisCalculator.tsx`, `src/components/HomeCalculatorExperience.tsx`, `src/components/MathMotionField.tsx`, `src/components/Odometer.tsx`, `src/config/fitCtaConfig.ts`, `src/config/redditPixel.ts`, `src/lib/calculatorState.ts`, `src/lib/format.ts`, `src/lib/redditPixel.ts`, `src/lib/siteCalculatorConfig.ts`.
2. Copy the 23 missing files to the same paths. For the 10 conflicting files, follow the namespace rule in the Global Constraints (prefer reusing the fee-site version only where it is provably a superset with identical behavior for the firm calculator's usage; otherwise namespace the firm version).
3. Create `src/app/(site)/calculator/page.tsx` mirroring the firm page (metadata adjusted: fee-site domain, noindex), wrapped by the fee site's (site) layout.
4. Make the conversion links absolute to https://smarterwaywealth.com as described; keep share links/share card on the fee-site domain via the fee site's `siteCalculatorConfig`.
5. Add the focused test; run the checks listed; commit: "Fee lab: hidden full calculator page on the fee site (stage 1, section 1)".
