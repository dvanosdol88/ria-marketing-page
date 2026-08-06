# Plan: site-wide CTA divider on both sites

## Context

David asked for a WHAT/WHY/WHO/HOW section plus a full-width CTA divider on both
youarepayingtoomuch.com (YAPTM) and smarterwaywealth.com (SWW).

Verified against reality on 2026-08-06: the WWWH sections, the approved copy, the FAQ
link, the "Fee Calculator" nav link on both sites, and the stylized Smarter Way Wealth
nav link on YAPTM are **already merged to `main` and live in production** (YAPTM PR #196
= commit `2b764c4`; SWW PR #89 = commit `6bd829d`). Do not rebuild any of it.

One requirement from David's spec is **not** met:

> "a divider that acts as our CTA and is consistent on **every page at every site**,
> between separate sections. **Full screen width**, no matter the size of the screen
> or device."

Today the divider renders on each site's homepage only — one mount per site:
- YAPTM: `src/components/CostAnalysisCalculator.tsx:1533`
- SWW: `src/app/page.js:268`

Confirmed by fetching production: `/faq`, `/how-it-works` (YAPTM) and `/faq`, `/save`
(SWW) contain zero occurrences of the divider's "See if SWW is a good fit" link.
That is 26 of 28 routes missing it.

## Goal

Every public route on both sites renders exactly one full-bleed CTA divider.

## Global Constraints

- **Reuse the shipped component.** `WwwhCtaDivider` and the `.divider` / `.dividerLink`
  rules in `WhatWhyWhoHow.module.css` already exist on `main` in both repos and are
  live. Do not fork, restyle, duplicate, or rewrite them. Do not change the gradient,
  the three labels, or the hrefs.
- **Exactly one divider per page.** The homepage already renders one directly beneath
  the WWWH block; that placement is David's explicit spec ("Then a divider…") and must
  stay exactly where it is. The new site-wide instance must therefore NOT render on the
  homepage.
- **Full viewport width on every device.** Both root layouts wrap content without a
  max-width, so a full-width element inside reaches the viewport edges. Do not add
  `w-screen` (it overflows when a scrollbar is present) and do not use negative margins.
- **Must render without JavaScript.** Per the repo's agent-readiness rules, the divider's
  links must be present in server-rendered HTML. A client component is acceptable only
  because Next.js App Router server-renders client components; verify the links appear
  in the HTML returned by the server.
- **Placement:** immediately above the site footer, so it sits between the page's last
  content section and the footer — the "between separate sections" break that is
  consistent on every page.
- **Tracking:** the shipped component emits `data-posthog-cta-location="home_wwwh_divider"`.
  The site-wide instance must report a distinct location so David can tell homepage
  clicks from site-wide clicks. Add a `location` prop with the existing value as the
  default so the homepage's tracking is unchanged.
- Do not touch the WWWH sections, the nav, or any copy.
- Do not merge, push, deploy, or open a PR. Commit to the working branch only.

## Task 1 — YAPTM: `location` prop + site-wide mount

Repo/worktree: `D:\ria-marketing-page\.claude\worktrees\website-wwwh-sections-f90b0b`
(branch `claude/website-wwwh-sections-f90b0b`).

1. In `src/components/WwwhCtaDivider.tsx`, add an optional prop:
   `{ location = "home_wwwh_divider" }: { location?: string }`, and use it for
   `data-posthog-cta-location`. The existing homepage call site passes nothing and must
   keep emitting `home_wwwh_divider`. Change nothing else in the file.
2. Create `src/components/SiteCtaDivider.tsx` — a client component (`"use client"`) that
   calls `usePathname()` from `next/navigation`, returns `null` when the pathname is
   exactly `/`, and otherwise renders
   `<WwwhCtaDivider location="site_footer_divider" />`.
3. Mount `<SiteCtaDivider />` in `src/app/layout.tsx` immediately before `<SiteFooter />`.

Verify: `npm run build` succeeds, and `npm run lint` reports no new problems.

## Task 2 — YAPTM: prove it on every route

Add `tests/sitewide-cta-divider.mjs`, following the existing ad-hoc Node test style in
`tests/` (plain `.mjs`, exits non-zero on failure, no test framework — this repo has no
Jest/Vitest).

The test must start the production server against a real build, then for **every** public
route under `src/app` (discover them by walking the directory for `page.tsx`, skipping
dynamic segments and route groups) fetch the URL and assert:
- routes other than `/` contain exactly one `site_footer_divider` occurrence and all
  three link labels ("Get started", "See if SWW is a good fit", "FAQ");
- `/` contains exactly one `home_wwwh_divider` and zero `site_footer_divider`.

Add an `npm` script `test:sitewide-divider` that runs it. Run it and paste the real
output in the report. Do not weaken an assertion to make it pass — if a route legitimately
cannot render the divider, stop and report it.

## Task 3 — SWW: `location` prop + site-wide mount

Repo/worktree: `D:\ria-marketing-page\.claude\worktrees\sww-wwwh-sections`
(branch `claude/sww-wwwh-sections`).

Same three changes as Task 1, adapted to this repo:
- `src/components/WwwhCtaDivider.tsx` gains the same optional `location` prop.
- New `src/components/SiteCtaDivider.tsx` client component, same `/`-returns-null rule.
- Mount before the footer in `src/app/layout.js`.

Note this repo's homepage is `src/app/page.js` and mounts the divider at line 268 — leave
that mount untouched.

Verify: `npm run build` succeeds and `npm run lint` reports no new problems.

## Task 4 — SWW: prove it on every route

Same as Task 2, adapted to this repo's test conventions (`tests/*.test.mjs`), covering
every public route under `src/app`. Add the npm script, run it, paste real output.
