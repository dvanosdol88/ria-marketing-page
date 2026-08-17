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
Last synced: 2026-08-17
syncVersion: 7

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

- **v7 (2026-08-17, one-tap share)**: one file, `ShareMyResults.tsx`, from
  David's four checked changes off the "One Tap to Share" research report.
  Where `navigator.share` exists — effectively all phone traffic — the
  primary "Share my results" button now fires `shareNative` directly on the
  tap (card image + summary text + state URL handed to the OS share sheet)
  instead of toggling a panel; the aria disclosure attributes apply only in
  the fallback mode where the button still toggles, and a quieter "More
  options" text button keeps the panel reachable on share-sheet browsers.
  The panel itself flips into a backup menu: "Copy or save" actions lead,
  the social tiles drop beneath them under "Or post it" (~1-in-500 usage
  across the published datasets), and the card preview shrinks to a
  max-w-[340px] thumbnail at the bottom. The in-panel native "More" tile is
  gone — its job moved to the primary button. The card canvas now draws on
  demand (`buildCardCanvas`) so the one-tap share works without the panel
  ever opening, and any cached canvas is invalidated when inputs change.
- **v6 (2026-08-16, the share is a picture now, and you can read it)**: one
  file, `ShareMyResults.tsx`, from David's round-5 review.
  *"What is being shared — text is too small."* The preview card's type ran
  from 8px to 13px, caption sizes doing body-copy work, on the one block that
  shows a visitor what they are about to put their name on. Every line but the
  savings figure moves up one step (subline 13→15px, tile labels 10→12px, tile
  values 18→20px, fee line and domain 11→13px, disclosure 10→12px with the
  leading opened to match). The hierarchy is unchanged and the 1200x630 canvas
  card is untouched — `drawShareCard` keeps its own proportions.
  *"Can the image be just that, an image, so it's not a link?"* It can, on the
  platforms that carry one. `shareNative` now builds the PNG as a `File` and,
  when `navigator.canShare({files})` agrees, shares the picture itself — so on
  a phone the card lands in the thread rather than a URL awaiting an unfurl.
  The link is not lost: the card renders the domain on its own face, and the
  URL is appended to the shared text. `canShare` is asked first because both
  WebKit and Chrome refuse an uncarriable `files:` payload by throwing from
  `share()`, which is indistinguishable from the visitor cancelling — without
  the check the link-only fallback would be dead code. A new **Copy image**
  button does the same job for desktop, putting the PNG on the clipboard so it
  pastes into a mail or a document; `ClipboardItem` is handed the *promise* of
  the blob because WebKit discards a write whose item was not constructed
  inside the gesture's own task.
  The social tiles still pass a link, and always will: Facebook, X, Reddit and
  LinkedIn web intents accept a URL and nothing else. Those platforms show the
  image through the page's Open Graph tags, not through anything this panel
  can hand them.

- **v5 (2026-08-14, LinkedIn share + the copy buttons actually copy)**: two
  files, both from David's round-3 review.
  `SocialShareRow.tsx` gains a fourth tile, LinkedIn, and it leads the row —
  his call: "that could be more fruitful than Facebook and X combined." The
  mark is the official rounded square (Simple Icons CC0 path, inlined like the
  other three, so still no icon dependency), sharing via
  `linkedin.com/sharing/share-offsite`, which builds its post from the page's
  own Open Graph tags rather than from passed text. Four tiles do not fit
  across a narrow phone, so the sub-480px grid drops to two columns and
  returns to four from 420px up.
  `ShareMyResults.tsx` fixes the copy buttons he reported dead ("I don't think
  either of the copy buttons worked"). They call
  `navigator.clipboard.writeText`, which succeeds in a desktop browser but is
  gated by WebKit and by the in-app browsers a mailed-QR visitor arrives from;
  a hidden-textarea `execCommand` fallback now runs when it is refused. The
  confirmation also moved out from under the thumb — it was the button's own
  13px label, covered by the finger that had just pressed it and reverting
  after 1.8s — to a live-region line beneath the row. And the share card's
  positive-case eyebrow now reads "I could potentially save" rather than
  "Potential difference" (also his), in both the canvas and its DOM replica.
- **v4 (2026-08-14, share button goes blue)**: presentation-only, one file.
  The "Share my results" toggle moves off the mint `#66F0AC` it launched in
  (David: "I do not like the minty green") to `#064B84`, the navy the
  conversion card and the chart's accumulation line already use, with white
  label, a soft blue-tinted shadow, a hover step to `#053B6A`, and a `#062B43`
  focus ring (the shared mint ring would have been near-invisible on a blue
  face). Nothing else changed: same label, same analytics attributes, same
  panel, same disclosures. Because this file is canon, the change lands on
  BOTH sites by design.
- **v3 (2026-08-13, poll & share redesign, David's direct feedback)**: same
  behavior, new presentation across Quiz.tsx, ShareMyResults.tsx, and
  SocialShareRow.tsx. Poll: results (percentages/bars/total) now REVEAL
  after voting — a clean ballot first, animated result bars after. Share
  panel: the scaled 1200×630 canvas `<img>` preview (illegible on phones)
  is replaced by a responsive DOM replica of the same card (the canvas
  remains solely for "Download image", with the server share-card route as
  fallback), the panel scrolls itself into view on open, and actions are
  grouped ("Share it" / "Copy or save"). Social row: official Facebook/X/
  Reddit brand logos (Simple Icons CC0 path data, inlined — no icon-lib
  dependency) as app-style tiles. Both compositions dropped their
  page-level duplicate SocialShareRow (it now lives only inside the
  panel); PostHog CTA labels/locations are unchanged except that the
  page-level `detailed_calculator_results_social` surface no longer exists.
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
| src/components/Quiz.tsx | 769737A1B4482CB775F4829C883BC8D79EE09632CCAC61AAFF1ED1D1EC3551C4 |
| src/components/calculator/ShareMyResults.tsx | 8EA87826227E55A55510769021A808CADF5CA3346154651BAEB52DCB9C831DAF |
| src/components/calculator/SocialShareRow.tsx | 8A221CD817F4D0A171CECCB6E217A43FAF8433CB0AA856DA42B69DCA4086934D |
| src/lib/shareSummary.ts | F2562529515C5C851CD57380899D2D4C19C60A54921EA7FD67128CE903295E42 |

**Line endings (review fix round, 2026-08-13):** `.gitattributes` now forces
`text eol=lf` on all four paths above, closing a real drift: this repo's
`core.autocrlf=true` had round-tripped `ShareMyResults.tsx`'s committed
CRLF content back onto disk unchanged during a `git stash`/rebase cycle,
and forcing it to LF changed ITS hash (was `773CB711CEE842D65DF959145FBBA1D94AC2191B9BCA5436873DD4D6011FE1E3`,
the value that matched the sister repo's own CRLF copy at the time — now
`23767A947D889085DCDCBA6135530B434ABE969A28BA94460EE07600915DE5B6`). Quiz.tsx,
SocialShareRow.tsx, and shareSummary.ts were already LF and are unchanged.
**The sister repo (`D:\smarter-way-wealth`) must add the equivalent
`.gitattributes` rule and renormalize its own `ShareMyResults.tsx` to LF**
so both repos converge on the new hash above — until then, Layer 2's
same-syncVersion comparison would flag `ShareMyResults.tsx` as drifted for
that one file even though nothing meaningful changed, only its line
endings became deterministic.

## Mirrored files (review discipline, not hash-locked)

These share the same design DNA as the sister repo's equivalents and
should be reviewed together whenever either changes, but their content is
NOT required to match byte-for-byte — each repo's composition around the
shared calculator design differs by necessity (see "Narrowed scope"
above).

| This repo | Sister repo equivalent | What must stay in sync |
|---|---|---|
| `src/components/CostAnalysisCalculator.tsx` | `src/components/CostAnalysisCalculator.tsx` | Control layout below the chart, 3-row results shape, range-hint presentation, share-button treatment |
| `src/components/HomeCalculatorExperience.tsx` (`SeeOurMathBento`'s gap-breakdown block) | `src/components/HomeCalculatorExperience.tsx` | Gray fee-derivation annotation wording/guard, "Actual fees"/"Lost compounding" bar-breakdown copy and colors, canon share-stack mount (ShareMyResults; since v3 the SocialShareRow renders only inside its panel, with no page-level duplicate) placement relative to the poll and the details entry point |

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
