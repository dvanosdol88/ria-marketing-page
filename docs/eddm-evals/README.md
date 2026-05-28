# EDDM Evals

Local review board for EDDM mailer candidates, planning-copy references, scores, decisions, and notes.

## Run

From `D:\ria-marketing-page`:

```powershell
npm run eddm:evals
```

Default URL:

```text
http://localhost:3044/
```

Optional port:

```powershell
npm run eddm:evals -- --port 3050
```

The main Next eval hub also embeds this board from the EDDM tab at `/evals`, but the local EDDM server must be running.

## Public route

The public-safe board runs inside the Next app at:

```text
/eddm-evals
```

This route reads the same catalog and assets, but saves scores and notes through `POST /api/eddm-evals/state` to Firestore. The Vercel project must have `FIREBASE_SERVICE_ACCOUNT_KEY` configured for persistent public scoring.

## Files

- Catalog: `docs/eddm-evals/catalog.json`
- Review state: `docs/eddm-evals/state.json`
- Local server/UI: `scripts/eddm-evals-server.mjs`
- Catalog import helper: `scripts/eddm-catalog-add-round.mjs`

The server uses only built-in Node modules. It serves repo files through a guarded static route that rejects traversal and realpath escapes outside `D:\ria-marketing-page`.

## Adding revision rounds

Do not overwrite existing candidate IDs when agents revise mailers. Public scores and notes are keyed by candidate ID in Firestore, so a real visual/copy/layout revision needs a new folder and new IDs.

Put revised proof assets in a new folder under `output/mailer-samples`, then dry-run the import helper:

```powershell
npm run eddm:catalog:add-round -- --source output/mailer-samples/round-02 --group "G. Round 2 revisions" --id-prefix eddm-r2 --title-prefix "Round 2"
```

If the summary looks right, write the catalog/state updates:

```powershell
npm run eddm:catalog:add-round -- --source output/mailer-samples/round-02 --group "G. Round 2 revisions" --id-prefix eddm-r2 --title-prefix "Round 2" --write
```

The helper scans for front/back pairs using these patterns:

```text
*_Front.png
*_Back.png
*_Front_Proof.png
*_Back_Proof.png
```

It also attaches nearby `*_Proof.html`, `*_Rationale.md`, `README.md`, `*manifest*.json`, and contact-sheet files when present. It refuses duplicate candidate IDs and missing asset paths.

Agent prompt for revisions:

```text
Create revised EDDM mailer proof assets in a new folder under output/mailer-samples/<round-name>.
Do not edit or overwrite existing mailer folders.
Use front/back filenames that end in _Front_Proof.png and _Back_Proof.png.
After generating assets, run npm run eddm:catalog:add-round first as a dry-run, then with --write only if the generated candidate IDs and asset paths look correct.
Do not reuse existing candidate IDs.
```

## Organization

The board now publishes 29 curated entries and groups them for fast triage:

- `A. V2 six-concept proof set` — overview/contact sheet plus six proof-only concepts from `output/mailer-samples/codex/save-upgrade-tools-v2`.
- `B. Paired six-concept set` — overview/contact sheet/PDF plus six paired concepts from `output/mailer-samples/codex/save-upgrade-tools/paired-concepts`.
- `C. Back-side supporting variants` — eight back-side-only Save/Upgrade/Improve v1 treatments promoted to individual scoreable rows, each paired with the shared front proof for context.
- `D. Print-ready proof packages` — Save/Upgrade/Improve v1, Claude restrained, and Gradient Stack packages with print-ready PDFs.
- `E. Earlier baseline/reference` — 1% Blues corrected proof and the original extracted source package.
- `F. Planning and landing references` — external RIA Chief A/B/C planning bundle and QR landing-page prototypes.

Use the group pills and search box at the top of the board instead of scrolling through every candidate.

## Current Asset Roots

```text
output/mailer-samples/codex/save-upgrade-tools-v2
output/mailer-samples/codex/save-upgrade-tools/paired-concepts
output/mailer-samples/codex/save-upgrade-tools
output/mailer-samples/claude
output/mailer-samples/gradient-stack
output/mailer-samples/1-percent-blues
```

Raw image-generation dumps under `output/mailer-samples/codex/save-upgrade-tools/Codex-image-web` are intentionally not cataloged as review candidates. The board uses finished proof packages, contact sheets, manifests, rationales, and production notes.

## Review Flow

1. Start with the overview/contact-sheet entries for group A and group B.
2. Use group filters to narrow to one concept set.
3. Score individual concepts only after the overview pass.
4. Use group C only for back-side treatment scoring; these rows are supporting variants, not complete standalone mailers.
5. Compare likely finalists against the print-ready proof packages in group D.
6. Keep the 1% Blues package in group E as the historical fee-shock baseline.

The v2 six-concept pass is proof-only and has no per-concept print-ready PDFs yet. Its manifest identifies `06_print-safe-classic` as the print-safety pick.

## External Planning Bundle

External local ZIP:

```text
C:\Users\user2\Downloads\eddm_ria_chief_bundle.zip
```

Observed contents include:

- `copy/mailer_variants.md`
- `data/campaign_spec.json`
- `mini_site_mock/index.html`
- `docs/planning materials`

This bundle contains the earlier EDDM planning-copy variants:

- Variant A: Fee Shock / Loss Aversion
- Variant B: Fiduciary Expertise / CFA + CFP
- Variant C: Keep Control / No Disruption

It does not contain finished front/back/contact-sheet proof packages. Because it is outside the repo root, the eval server documents it but does not serve or preview it.

## Save Behavior

The board saves one candidate at a time via `POST /api/state`.

Each save merges that candidate patch into `state.json` and preserves other candidates' scores, notes, and decisions. Server-side state writes are queued so concurrent saves do not overwrite each other.
