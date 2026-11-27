# Fee lab, stage 1, section 2: make the fee site's full calculator public (built, shown, not merged)

Owner order (David, 2026-11-26): "Approve, build section 2" — answering the section 1 preview page, whose order reads: "Section 1 (the full calculator on youarepayingtoomuch.com) is approved as previewed. Build section 2: point the fee site's advanced-calculator link to the new page, list it for search engines, and make shared links reopen the full scenario. Show me section 2 before it goes live." Share name line: keep the fee site's line (his recommended default). Disclosure note: decide later (not used).

## Global Constraints

- Repo `D:\yaptm-fee-lab`, branch `claude/fee-lab-shared-math` (section 1 at afb748c, merged with origin/main at 37ac3fe). Do not push, open a PR or merge; commit only.
- No wording changes anywhere: link labels, headings and disclosures stay word for word. The home page's visible copy, mailer attribution, A/B variants and the home calculator's behavior do not change, except where this plan says so.
- Do not modify hash-locked canon files (see `CALCULATOR-CANON.md` register). If a share behavior can only be fixed by editing one, stop and report NEEDS_CONTEXT.
- One engine: everything uses `src/lib/feeProjection.ts`.
- Site conventions (from the firm repo's CLAUDE.md, same on this site): internal links never use the external-link (box-with-arrow) icon and open in the same tab; outbound links use lucide `ExternalLink` sized `h-[1.25em] w-[1.25em] shrink-0`.
- Tests: update `tests/full-calculator-hidden.mjs` to the new public state (rename it if you like) asserting the page is indexable and listed in sitemap and llms.txt; add a focused test for shared-link round-trip (a detailed scenario query — market return mode with a year range, and a tiered fee schedule — produces a share URL on `/calculator` that, when parsed by the page, restores the same scenario). Run only these tests, the canon manifest test, `npm run test:fee-engine-shared`, `npx tsc --noEmit -p .`, lint on touched files, the existing tests that cover the home visit card / advanced-calculator link if any (find them by grepping tests for `advancedCalculator` / `home_firm_visit_card`), and `npm run build` once. If the build stops early with an upgrade/security recommendation message, re-run once; never run an upgrade.

## Task 1: Go-live wiring for /calculator

1. Point the home page's advanced-calculator link (`src/config/advancedCalculator.ts`, used by `SmarterWayWealthVisitCard`) at the fee site's own `/calculator`. Because it is now an internal link, render that one row without the external-link icon and without `target="_blank"`; keep its label, text and PostHog label/location exactly as they are. The other rows (they leave the site) are unchanged.
2. Make `/calculator` public: remove noindex/nofollow (both metadata branches), add `/calculator` to the sitemap and to `public/llms.txt` (one line in the existing style, describing it as the detailed fee calculator with market history and fee schedules — reuse the page's existing meta description wording; do not invent new claims).
3. Shared links from `/calculator` must reopen `/calculator` with the full scenario (mode, market year range, fee tiers, fund expense, custom flat fee — everything the firm site's detailed query carries). Shared links from the home page keep working exactly as today. Prefer doing this through a per-page share configuration rather than changing `siteCalculatorConfig`'s home behavior. The share-card image for a detailed scenario must show that scenario's own figures (port the firm's share-card approach for detailed scenarios under the fee site's namespace if the existing `/api/og` route cannot express them); the home page's share card is unchanged.
4. Old links: the firm site's handoff path (`/save` → `/calculator` with params) is unaffected; nothing to do there in this task.
5. Commit: "Fee lab: the full calculator goes public on the fee site (stage 1, section 2)".
