# Calculator Canon Register

Canon principle: ONE calculator design, expressed identically (by file
content) in this repo (youarepayingtoomuch.com) and the sister repo
(smarterwaywealth.com, `D:\smarter-way-wealth`). See
`docs/plans/2026-08-12-calculator-canon.md` in the sister repo ("Lock
mechanism", "Phase B") for the full design and the Phase B1 controller
adjudication that narrowed this register (Option A, 2026-08-13).

Per-site differences are confined to `src/lib/siteCalculatorConfig.ts`
(domain, URL builders, brand line, analytics tags, details presentation) —
every file listed below imports that config rather than hard-coding
site-specific values, so its content can be identical across both repos
while its rendered *behavior* still varies per site.

Editing a listed file requires updating its hash below in the SAME commit
(and editing the sister repo's copy in the same working session — see the
plan's "Improvement flow"). This register is enforced by
`tests/calculator-canon-manifest.test.mjs`.

Counterpart repo: `D:\smarter-way-wealth` (smarterwaywealth.com)
Last synced: 2026-08-13
syncVersion: 2

## Narrowed scope (Phase B1 adjudication — read before editing this file)

The Phase B1 brief originally called for `CostAnalysisCalculator.tsx` and
`HomeCalculatorExperience.tsx` to also be installed byte-identical from the
sister repo. Investigation found the sister repo's versions of those two
files were never actually a faithful sync of this repo's — this repo's
copies are the entire homepage composition (hero variants, EDDM/QR mailer
campaign attribution, the "Advanced Calculator" handoff-link builder, its
own `PillSlider`/`SimpleRangeControl` input controls, variant/banner A-B
testing), all CI-gated (`test:eddm-attribution`), none of which the sister
repo's leaner calculator-only files have any equivalent for. A literal
overwrite would have deleted live, revenue-facing functionality and broken
CI. The controller adjudicated **Option A**: narrow the hash-locked
register to the files that are genuinely portable without engine or
composition differences, and treat the two base-experience files as
**design DNA to mirror by review discipline, not files to byte-lock**. See
`.superpowers/sdd/canon-b1-report.md` in the sister repo for the full
investigation.

## Why these files, and not others

- **Quiz.tsx (v2)**: unified in Phase B1. Built by merging this repo's
  existing API-backed voting UI (real `/api/quiz/vote` counts, no seeded
  numbers, no "Sample responses" caption, silent degradation on fetch
  failure — already the target behavior) with the sister repo's
  `siteCalculatorConfig`-driven `poll_voted` analytics capture, guarded so
  a missing capture util never blocks voting. This is the version the
  sister repo's own Phase B2 task installs next, byte-identical.
- **ShareMyResults.tsx, SocialShareRow.tsx, shareSummary.ts**: built in the
  sister repo (Phases A1/A2), installed here verbatim in Phase B1. Pure
  presentation + narrative-text generation — no dependency on either
  repo's fee-projection engine internals, so genuinely identical by
  content.
- **Excluded, deliberately**:
  - `src/lib/siteCalculatorConfig.ts` — the per-site parameter file itself;
    its content is SUPPOSED to differ between repos, so it has no register
    entry.
  - `CostAnalysisCalculator.tsx`, `HomeCalculatorExperience.tsx` — see
    "Narrowed scope" above. Listed instead in "Mirrored files" below.
  - `CalculationDetailsPanel.tsx`, `gapDecomposition.ts` — this repo
    already has its own "View calculation details" experience
    (`SeeOurMathBento` inside `HomeCalculatorExperience.tsx`: its own gap-
    breakdown bars, its own inline assumption editor), built independently
    and predating the canon program. Mounting the sister repo's separate
    `CalculationDetailsPanel` component alongside it would duplicate the
    same UI with two different implementations. `gapDecomposition.ts`
    additionally depends on `FeeProjectionResult.monthlyLedger`, a field
    this repo's simpler fee engine (no tiered fees, no market-mode replay)
    doesn't produce — engine freeze applies, so the file isn't portable as
    written. The one canon-bound addition that DOES apply — the gray
    fee-derivation annotation with its exact-equality guard — was ported
    by hand into the existing `SeeOurMathBento` gap-breakdown block
    instead (same formula, `directFeeGap === totalAssetBasedFees -
    totalFlatFees`, already computed locally there).
  - `shareCardData.ts`, `app/calculator/share-card/route.tsx` — both
    depend on `DetailedCalculatorState` (tiered fees, market-mode replay,
    `sp500Returns.ts`), none of which exist in this repo's engine. This
    repo already has its own dynamic OG-card route (`/api/og`, reading the
    exact `flat/portfolio/years/growth/fee/mfe` query shape
    `buildQueryFromState` produces) — `siteCalculatorConfig.buildShareCardPath`
    points there instead of standing up a parallel route.
  - The math engine (`src/lib/feeProjection.ts`, `src/lib/calculatorState.ts`)
    — per-repo by design; the two repos' engines have different
    capabilities (this repo: single-rate, steady-growth only) and are not
    meant to be identical. Not covered by any hash lock.

## Register

| Path | SHA-256 |
|---|---|
| src/components/Quiz.tsx | 9792DA77EE3DB89A5CE74A65E7506632D106B4D83FAF30BB1E6EB03EF353B227 |
| src/components/calculator/ShareMyResults.tsx | 773CB711CEE842D65DF959145FBBA1D94AC2191B9BCA5436873DD4D6011FE1E3 |
| src/components/calculator/SocialShareRow.tsx | EEACB43E402629A1C851B0BC2B7B64711B4175848B014F90F3542DB9CB1F4504 |
| src/lib/shareSummary.ts | F2562529515C5C851CD57380899D2D4C19C60A54921EA7FD67128CE903295E42 |

## Mirrored files (review discipline, not hash-locked)

These share the same design DNA as the sister repo's equivalents and
should be reviewed together whenever either changes, but their content is
NOT required to match byte-for-byte — each repo's composition around the
shared calculator design differs by necessity (see "Narrowed scope"
above).

| This repo | Sister repo equivalent | What must stay in sync |
|---|---|---|
| `src/components/CostAnalysisCalculator.tsx` | `src/components/CostAnalysisCalculator.tsx` | Control layout below the chart, 3-row results shape, range-hint presentation, share-button treatment |
| `src/components/HomeCalculatorExperience.tsx` (`SeeOurMathBento`'s gap-breakdown block) | `src/components/HomeCalculatorExperience.tsx` | Gray fee-derivation annotation wording/guard, "Actual fees"/"Lost compounding" bar-breakdown copy and colors, canon share-stack mount (ShareMyResults + SocialShareRow) placement relative to the poll and the details entry point |

## Register semantics (mirrors the sister repo's, same one-version-grace)

Layer 1 (this repo, `npm run test:calculator-canon-manifest`): every listed
file's hash must match this table. Layer 2 (local only, when
`D:\smarter-way-wealth` is present on this machine): compares this
register against the sister repo's; at the SAME `syncVersion`, hashes for
every path both registers list must agree exactly; a sibling exactly one
`syncVersion` behind is allowed and reported, not failed (covers the merge
gap while a canon change is mid-flight across both repos — the sister
repo's Phase B2 task lands Quiz v2 there next). Skips gracefully when the
sibling path or its register is absent.
