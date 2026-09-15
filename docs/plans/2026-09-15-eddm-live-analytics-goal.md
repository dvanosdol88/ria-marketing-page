# Goal Brief

Work ID: `docs/plans/2026-09-15-eddm-live-analytics-goal.md`
Owner: Codex parent/integrator
Repositories: `D:\ria-marketing-page`, `D:\smarter-way-wealth`, `D:\riabuilder\RIA-builder`
Branches/worktrees:

- `codex/eddm-analytics-20260915` at `D:\worktrees\yapt-eddm-analytics-20260915`
- `codex/eddm-analytics-20260915` at `D:\worktrees\sww-eddm-analytics-20260915`
- `codex/eddm-counter-20260915` at `D:\worktrees\ria-builder-eddm-counter-20260915`

## Outcome

David can see a trustworthy mailed-QR scan count on the RIA Builder homepage and at the top of RIA Chief chat, receive an alert for each new scan, and use an illustrated report to understand the privacy-safe analytics collected across youarepayingtoomuch.com and smarterwaywealth.com.

## In scope

- Verify the actual printer QR attribution contract and both public sites' production analytics wiring.
- Remove the split PostHog identity path on youarepayingtoomuch.com.
- Emit one explicit `eddm_qr_landed` milestone per mailed-QR browser session.
- Maintain a privacy-safe public aggregate scan count in the existing Firebase project.
- Display that count on the RIA Builder launch homepage and RIA Chief chat header.
- Prepare and test the existing-stack alert path; activate only after required PostHog authentication and workflow sign-off.
- Update event contracts, dashboard guidance, backlog, work journals, and the private cross-site record.
- Publish an illustrated executive brief.

## Out of scope

- Capturing visitor names, emails, financial inputs, precise locations, or client/onboarding data.
- Changing the approved mailer, QR destination, public copy, calculator math, onboarding, auth, or RIA Chief model behavior.
- Adding a new analytics provider or notification service.
- Rebuilding historical scan totals without live PostHog proof.

## Constraints

- Preserve unrelated dirty work by using isolated worktrees.
- Keep one writer per worktree and keep changes narrow.
- Follow the nearest AGENTS.md/CODEX.md and production approval gates.
- Never expose secrets, credentials, client data, or other PII.
- Count only the existing explicit UTM campaign or exact legacy printer-proof signature.
- Test youarepayingtoomuch.com at 375px before desktop.

## Acceptance criteria

- [x] The exact printed four-parameter URL and canonical tagged QR URL are still recognized as EDDM traffic.
- [x] youarepayingtoomuch.com sends custom events through the initialized PostHog browser client with one stitched identity/session.
- [x] A mailed-QR landing emits `eddm_qr_landed` once per browser session with no financial or personal data.
- [x] A same-origin scan receipt uses one aggregate Firestore increment and obvious bots are rejected in executable policy/browser proof.
- [ ] The aggregate count is readable without exposing scan-level records or visitor data.
- [x] RIA Builder homepage and RIA Chief chat top display the same count and a truthful unavailable state in local build/component proof.
- [x] The alert workflow is test-run and enabled after explicit sign-off, or the exact authentication blocker is reported.
- [ ] The illustrated report inventories tracked events, properties, privacy exclusions, proof, and remaining owner action.

## Proof required

- [x] YAPT targeted tests: `npm run test:eddm-attribution` plus new counter tests.
- [x] YAPT full checks: `npx tsc --noEmit`, `npm run lint`, `npm run build`.
- [x] RIA Builder focused tests for the counter service/component.
- [ ] RIA Builder full unit suite and `npm run build`.
- [ ] PR checks pass in every changed repository.
- [ ] Production serves each merged `main` SHA and the real QR/counter flows are exercised at 375px and desktop.
- [ ] Live PostHog contains the expected production event before analytics is called verified.
- [ ] Work journals and private cross-site record identify the work and evidence.

## Parallel work map

Codex is the sole writer/integrator across isolated worktrees. One read-only
goal reviewer and its read-only review axes inspect the immutable integrated
diffs; they make no file changes.

## Stop conditions

- Secret creation, PostHog reauthentication, or notification subscription requires David's action-time confirmation.
- The implementation would expose visitor-level data or calculator/onboarding content.
- Acceptance criteria conflict with printed-mail attribution or live production evidence.
- One lean review and focused repair fail to produce a safe release.

## Checkpoint

Review rounds completed: 1/1 (repair and re-review complete; runtime clean)

Completed criteria:

- Current `origin/main` SHAs and isolated worktrees established.
- Exact printer-proof and canonical EDDM attribution contracts located.
- Live PostHog connector and browser session both require reauthentication.
- Exact campaign matching, sanitized event URLs, aggregate receipt policy,
  Firestore update shape, and both RIA placements passed independent re-review.

Evidence already collected:

- YAPT `origin/main`: `03bfd3d56b091b187d4ec8c1352e98cbd7106f7a`.
- SWW `origin/main`: `7e0ecfd171d8307f99eddd09d75805706a5b7866`.
- RIA Builder `origin/main`: `d311ef3d3755f84ca69686cce4595640ce4060d6`.
- Vercel CLI live-verified as 54.14.0 at the canonical launcher.

Remaining delta:

- Ship and verify production, restore PostHog access, activate the alert after a
  test delivery/sign-off, and publish the report.
