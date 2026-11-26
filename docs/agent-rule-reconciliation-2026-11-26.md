# DAV-17 — Paired rule document reconciliation

David's order: "Match them."
Source: David's handoff to Windows Codex, 2026-11-26; no source-chat URL was supplied.
Road to 50: side work - prevents agents following stale or contradictory instructions while preparing the two sites.

Scope: `docs/content-strategy.md` and `CALCULATOR-CANON.md` only, plus this
audit and the work journals. No visitor-facing content, disclosures,
calculations, application files, dependencies or workflow settings changed.

## Content strategy: all four differences

Both files began with the same May 17 draft (firm-site commit `0bd4e02`,
PR #13; fee-site commit `a238b9e`, PR #125). The fee-site file had no later
updates. The firm-site file received October 28 and November 3-4 historical
inventory corrections (`9a3893e`, `1c19220`, `77e31db`). Its current copy is
the newer one for all four differences below and is copied verbatim.

| Difference | Which is newer/correct and why | Disposition |
|---|---|---|
| Section 1 snapshot warning | Firm site: explicitly dates the inventory to November and distinguishes old draft recommendations from live state. Fee site omits it. | Keep firm-site text in both. |
| Section 1 firm-site inventory | Firm site: records the November 3 twelve-page sitemap and indexed status. Fee site still describes the original single-page, noindex launch state. | Keep the dated firm-site snapshot in both; it is historical, not a claim of today's full inventory. |
| Section 10 snapshot warning | Firm site: repeats that recommendations are old draft input. Fee site omits the warning. | Keep firm-site text in both. |
| Section 10 instruction to drop noindex later | Firm site: marks the old instruction obsolete and cites indexing since PR #43 (July 28). Fee site presents it as future work. | Keep firm-site text in both. |

The one-of-three-models disclaimer, David's editorial authority and all draft
recommendations are retained without edits. Matching these files does not
approve or implement any proposed page copy or architecture.

## Calculator register: every difference, including intentional distinctions

The raw comparison groups these differences into three adjacent blocks;
this table separates every distinct difference within those blocks. The
four register paths, their hashes, `syncVersion: 9`, September 22 sync date,
and v3-v9 history already matched. They are retained.

| Difference | Which copy is newer/correct and why | Disposition |
|---|---|---|
| Opening domains and "this/sister repo" wording | Both correct from their own viewpoint. | Name firm site and fee site explicitly in both copies. |
| Plan location and adjudication pointer | Both correct: the plan and Phase B1 report are in the firm repo; the fee copy explains the adjudication. | One explicit firm-repo pointer and a shared narrowed-scope section. |
| Poll upstream origin in the config list | Firm copy has the additional real per-site setting introduced with Phase B2 (`800965f`, PR #103, August 13). | Retain it in both. |
| Manifest test filename | Firm copy correctly uses `.test.mjs`; fee copy's introduction incorrectly uses that name, while its closing section and actual file use `.mjs`. | List each real filename and command side by side. |
| Checks described in the introduction | Firm copy was corrected November 1 (`26b9b52`) to say local npm test is not an automatic full remote suite. Fee copy gives no detail. Current fee workflow makes its test job manual-only. | Describe both actual entry points and distinguish manual from automatic jobs. No gate added. |
| Counterpart path | Both correct in their original viewpoint. | List both repository roots once in common text. |
| Narrowed-scope section | Fee copy has the full August 13 Option A explanation (`e8ba2c5`, PR #221); firm copy only points to it. | Preserve the reason in both: copying homepage compositions would remove features. |
| Quiz v2 history | Firm copy is later: Phase B2 completed in PR #103; fee copy still says the firm install happens next. | State completed B1/B2 history and the two endpoint roles. |
| Shared share-file origins | Both agree but reverse "this/sister" names. | State built in firm repo, installed into fee repo. |
| Configuration exclusion | Firm copy adds its value-level test pointer; fee copy omits it. | Preserve the pointer, explicitly scoped to the firm repo. |
| Vote route exclusion | Firm copy explains its proxy but incorrectly implies the fee repo has no same-path file; both repos have that path with different implementations. | State proxy versus real Firestore endpoint; preserve the proxy test. |
| Base-composition exclusions | Both correct: same design obligations, different surrounding features. | Keep shared layout/results/range/share obligations and fee-site attribution/variants. |
| Details panel and gap helper exclusions | Both correct from their own viewpoint. Fee copy has more detail on its pre-existing modal; firm copy explains monthlyLedger. | Preserve both explanations and the exact-equality annotation guard; no engine copy. |
| Share-card route/data exclusions | Both correct: firm DetailedCalculatorState differs from fee OG route and query format. | Preserve both paths and reasons in one row. |
| Advanced chrome exclusions and directory claim | Firm copy lists all six advanced components; both copies make a broader stale claim that fee site has no calculator directory, despite registered share components living there. | Preserve advanced chrome exclusion; distinguish absence of advanced chrome from the existing shared presentation directory. |
| Engine exclusions | Both correct for their site: firm oracle/market history versus simpler fee engine. | Preserve both protections and capabilities; no new lock or engine change. |
| Line endings | Firm copy is later and correct: PR #103 added firm-side LF rules. Fee copy still orders that completed work and lists historical hashes. Both current attributes enforce LF. | Describe completed repair and preserve current hashes, not old targets. |
| Mirrored table headings and row coverage | Firm copy lists all site-specific components/routes; fee copy names only the two base files. These are complementary, not competing rules. | Combined two-site table retains all rows. |
| Base-control design detail | Fee copy explicitly lists below-chart controls, three-row results and range hints; firm copy summarizes them. | Preserve the fee copy's detail. |
| Home design detail | Fee copy explicitly names Actual fees/Lost compounding, no duplicate SocialShareRow and details position; firm copy is shorter. | Preserve that detail with the firm copy's exact guard. |
| One Percent Blues accent note | Fee copy is newer here (`fcd2663`, PR #268, September 17); firm copy omits it. | Retain "Mirror the type, not the blue values" and scope the theme to the fee site. |
| Layer 1 command | Both have different valid commands. | List both; no command is renamed. |
| Layer 2 path/reader | Firm test reads sibling origin/main then falls back; fee test reads sibling working copy. Firm copy's prose only partly records its September 26 test correction. | Document both existing behaviors and the common environment override. Do not silently change either test. |
| Layer 2 path mapping and pending Phase B2 sentence | Firm copy correctly notes identical registered paths and removes the obsolete pending installation; fee copy still says Phase B2 is next. | Retain same-path comparison, existing one-version grace and missing-sibling skip; remove stale pending-work wording. |

## Disagreements requiring David

None found in these two document pairs. No competing policy was chosen over
another. All differences were dated corrections, complementary detail or
intentional site distinctions now described explicitly in both copies.
There is consequently no open LANGUAGE recommendation for David.

## Verification

- Both paired documents are byte-identical after reconciliation.
- Both existing focused manifest checks pass (three tests in each repo).
- Shared implementation version and all four hashes are unchanged; all
  corresponding registered implementation files still match.
- Content strategy is an exact copy of the firm site's existing published
  draft, with no alteration to its proposed visitor-facing wording.
- Final changes are confined to Markdown agent documents and journals.
  No website runtime change is part of this job, so production page testing
  is not applicable. PR gate results and merge receipts are recorded in the
  job result at `D:\dvo-downloads\agent-jobs\DAV-17\result.md`.
