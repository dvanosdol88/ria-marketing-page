# Calculator Canon Register

This agent rule document is identical in the two repositories:
- Firm site: smarterwaywealth.com, `D:\smarter-way-wealth`.
- Fee site: youarepayingtoomuch.com, `D:\ria-marketing-page` (also serves onepercentblues.com).

Canon principle: ONE calculator design, with the five registered files below
identical by content in both repositories. Page compositions are deliberately
site-specific. Since v10 (2026-11-25, David's fee-lab plan: "the math stays
shared, so the numbers always match") the fee engine `src/lib/feeProjection.ts`
is one shared, hash-locked file; other engine files remain site-specific.
The full design is `docs/plans/2026-08-12-calculator-canon.md` in the firm-site
repository ("Lock mechanism", "Phase B", and "Improvement flow").

For the registered files, per-site domain, URL builders, brand line, analytics
tags, details presentation and poll upstream origin come from
`src/lib/siteCalculatorConfig.ts`. Those configuration values may differ.
The fee site's One Percent Blues accent values also remain site-specific.

Editing a registered file requires updating its hash here in the SAME commit
and editing the other repository's copy in the same working session. Review
the mirrored files together whenever either side changes. Do not copy other
engine files or change page wording, disclosures or calculations to reconcile this
document. David's website, language and compliance rules still govern those
changes.

Last synced: 2026-11-25
syncVersion: 10

The date and version above describe the shared implementation, not this
documentation reconciliation (DAV-17, 2026-11-26). No registered hash or
implementation changed during that reconciliation.

## Narrowed scope (Phase B1 adjudication)

Phase B1 originally called for `CostAnalysisCalculator.tsx` and
`HomeCalculatorExperience.tsx` to be byte-identical too. The fee site's
versions include its homepage composition, EDDM/QR mailer attribution,
Advanced Calculator handoff, PillSlider/SimpleRangeControl inputs and A/B
variants. The firm site's leaner files are not equivalent. Overwriting the
fee-site copies would have removed working features and broken checks.

The controller chose Option A (2026-08-13): lock only genuinely portable
files, and mirror the base experience by review rather than by file hash.
See `.superpowers/sdd/canon-b1-report.md` in the firm-site repository.

## Why these files, and not others

- **v10 (2026-11-25, shared fee engine)**: `src/lib/feeProjection.ts` is
  shared and hash-locked on both sites (David's fee-lab plan, step 1). Both
  repositories' `.gitattributes` force `text eol=lf` on it. It is exempt from
  the CANON banner check because it must stay byte-identical. Each repository
  also checks 300 fixed vectors (`tests/fee-engine-shared.test.mjs`).
- **v9 (2026-09-22, quieter poll result)**: `Quiz.tsx` still records the
  visitor's vote and reveals the real percentage distribution, result bars,
  and top answer, but no longer prints the aggregate number of votes. The
  confirmation now says only **Thanks for voting!** on both sites.
- **v8 (2026-08-20, standardized fee-comparison receipt language)**: the
  shared summary and share-card artifact now say **estimated advisory-fee
  difference**, keep the result explicitly tied to the visitor's assumptions,
  and remove the stronger "lost to fees" sentence from copy/email/social
  variants. The YAPT OG card and SWW server share card use the same neutral
  label. This is a fee-comparison receipt, not a performance or realized-
  savings claim.
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
- **Quiz.tsx (v2, Phases B1/B2)**: Phase B1 merged the fee site's real
  `/api/quiz/vote` counts and silent no-percentage fallback with the firm
  site's config-driven `poll_voted` capture. Phase B2 installed that file
  byte-identically in the firm site (firm-site PR #103, 2026-08-13).
  That installation is completed history, not future work. The fee site
  owns the Firestore vote endpoint; the firm site's same-origin endpoint
  forwards to it. No seeded counts or sample-response caption remain.
- **ShareMyResults.tsx, SocialShareRow.tsx, shareSummary.ts**: built in the
  firm site (Phases A1/A2), installed verbatim in the fee site (Phase B1).
  Presentation and summary generation do not depend on either math engine.
- **Excluded, deliberately**: per-site configuration, engine files other than
  the shared fee engine, base page
  compositions, details implementations, share-card routes, gap helpers
  and the firm site's advanced calculator chrome. Their distinctions and
  review obligations are listed below; exclusion from this lock
  does not remove the separate protections on either engine.

## Register

| Path | SHA-256 |
|---|---|
| src/components/Quiz.tsx | D4AB746065ACEE7A1000A4645170705D24D5E13592ABC1A88C76D2BD2F8653F6 |
| src/components/calculator/ShareMyResults.tsx | 4618AD2CAD62F05ABC3B9D038D2C0288971C190C5B7614BC103921566CF546B1 |
| src/components/calculator/SocialShareRow.tsx | 8A221CD817F4D0A171CECCB6E217A43FAF8433CB0AA856DA42B69DCA4086934D |
| src/lib/shareSummary.ts | 54BB6E49E805E1CC7861AEC4E53B9358394F592A26B0560FF7460CAA07B325E7 |
| src/lib/feeProjection.ts | 6AFD56D8FD36A74C02CC434FF75D6A93269FF41036DC1932474C84775B9D46E0 |

**Line endings:** both repositories' `.gitattributes` force `text eol=lf`
on all five registered paths. The Phase B1 review found a real CRLF/LF
round-trip difference in ShareMyResults.tsx; Phase B2 applied the equivalent
firm-site rule. The old instruction that the firm site still needed to do
this was stale. The current register above is authoritative for current
hashes; historical hashes are not targets to restore. Verify committed
content as well as the worktree when investigating line-ending drift.

## Mirrored / site-specific (not hash-locked)

Review the shared design together; do not require these files to match byte
for byte. Each table row describes both sites, regardless of which repository
contains this document.

| Firm site | Fee site | Shared rule or deliberate distinction |
|---|---|---|
| `src/components/CostAnalysisCalculator.tsx` | Same path | Mirror the base control layout below the chart, three-row results shape, range hints and share-button treatment. Preserve the fee site's mailer attribution, inputs and variants. |
| `src/components/HomeCalculatorExperience.tsx` | Same path, including `SeeOurMathBento` | Mirror gray fee-derivation wording and its exact-equality guard (`directFeeGap === totalAssetBasedFees - totalFlatFees`), Actual fees/Lost compounding breakdown copy and colors, and ShareMyResults placement relative to poll and details. SocialShareRow lives inside the share panel, with no duplicate at page level. |
| Review the equivalent shared design | `HomeCalculatorExperience.tsx`, `CalculatorAccentTheme`, `theme.accent` | Since 2026-09-17, the fee site's final-c layout accepts an accent theme for One Percent Blues. Mirror the type, not the blue values. |
| `src/components/calculator/CalculationDetailsPanel.tsx` | Inline `SeeOurMathBento` modal | The fee site's pre-existing details experience serves this role. Do not add a second details UI. The common gray derivation annotation was ported by hand. |
| `src/lib/gapDecomposition.ts` | Formula inline in `SeeOurMathBento` | The firm-site helper needs `FeeProjectionResult.monthlyLedger`, absent from the fee site's simpler engine. Preserve the engine freeze; review the equivalent annotation rather than copying the helper. |
| `src/app/calculator/share-card/route.tsx`, `src/lib/shareCardData.ts` | Home page: existing `/api/og` route. Full calculator page `/calculator` (fee lab, 2026-11-26): `src/app/(site)/calculator/share-card/route.tsx` and the `full-calculator` copies | The fee site's home share stack keeps its own OG route and flat/portfolio/years/growth/fee/mfe query shape. The fee site's `/calculator` page carries the firm site's detailed card (tiered fees, market replay) through its own per-page share settings, not `siteCalculatorConfig`. |
| `src/components/calculator/ThemedCalculatorExperience.tsx`, `CalculatorChrome.tsx`, `MarketTimeMachine.tsx`, `CalculatorStickyHeader.tsx`, `InlineFeeScheduleEditor.tsx`, `CanonCalculatorExperience.tsx` | Copies for the fee site's `/calculator` page (fee lab, 2026-11-26), under `src/components/full-calculator/` and `src/lib/full-calculator/` where a fee-site file of the same name already existed | Not hash-locked. They were copied from the firm site with only import and link-destination changes; review both sides together when either changes. The fee site's home calculator does not use them. |
| `src/app/api/quiz/vote/route.ts` (proxy) | Same route path (real Firestore backend) | Same address, deliberately different implementation. Firm-site proxy has its own `tests/quiz-vote-proxy.test.mjs`. |
| `src/lib/siteCalculatorConfig.ts` | Same path | Values intentionally differ by site; firm-site value assertions are in `tests/site-calculator-config.test.mjs`. |
| `src/data/sp500Returns.ts` and related engine files | `src/lib/calculatorState.ts` | Since v10 `src/lib/feeProjection.ts` itself is shared and registered above. The firm site's market data and state files remain site-specific; firm-site math is independently checked by `scripts/verify-calculator.mjs`. No other engine changes are authorized by matching the rule documents. |

## Register semantics and actual check entry points

Layer 1: every registered file must match its hash above and carry the CANON
banner. Layer 2: paths appearing in both registers must have identical hashes
at the same syncVersion. A difference of exactly one version is reported and
allowed while a coordinated update is between merges; a larger difference
fails. Both repositories currently use the same five paths, without prefix
mapping. Missing sibling directories or registers are skipped gracefully.

| Repository | Focused check | Sibling read behavior |
|---|---|---|
| Firm site | `node --test tests/calculator-canon-manifest.test.mjs` (also included in local `npm test`) | Reads the fee site's `origin/main` register first, then falls back to its working copy if that ref is unavailable. |
| Fee site | `npm run test:calculator-canon-manifest` (`tests/calculator-canon-manifest.mjs`, without `.test.`) | Reads the firm site's working-copy register. |

Both checks accept `CALCULATOR_CANON_SIBLING_ROOT` for an explicit sibling
directory. Neither writes to the sibling. Do not describe these two read
strategies as identical or mistake a stale shared checkout for published drift.

As checked on 2026-11-26, neither site's automatic pull-request jobs invoke
this focused manifest check. The firm site's local `npm test` includes it;
no workflow runs the full `npm test`. The fee site's manual-only `test` job
in `.github/workflows/ci.yml` invokes its focused command. Both sites have separate
wording approval and selectively run calculator checks. Adding a remote gate
would be separate work; this document does not install or change a gate.
