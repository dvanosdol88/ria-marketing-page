# 05-94 — David's website change approval policy

Approved by David on 2026-10-12 in [the source chat](codex://threads/01a1260b-d353-7870-890b-daa645566904), selecting the four rules below and saying "Implement that". Applies to both youarepayingtoomuch.com and smarterwaywealth.com, for every agent, scheduled task and guest worker.

## The four standing rules

1. **David owns the wording and visitor experience.** No unapproved changes to copy, images, design, navigation, offers, disclosures, calculator assumptions, or visitor steps.
2. **Approval happens once per proposed change.** Show David the exact before-and-after wording and a visual preview where relevant. That approval covers the work needed to deliver it; anything beyond it needs a new approval.
3. **Routine maintenance can ship automatically** when it preserves the approved wording, appearance, calculations, and behavior. "Improve," "clean up," or "fix mobile" does not authorize editorial changes.
4. **Uncertain changes stay as drafts.** Agents may suggest improvements, but may not publish them without approval.

## Applying the rules

- This policy overrides broader proactive-fix, mobile-improvement, agent-readiness, SEO and ship-by-default instructions for visitor-facing changes. Passing checks, another agent's review, an existing backlog item or a request to ship is not editorial approval.
- Record David's actual approval and its scope in the work container or work record, with a link to the conversation and the approved wording/preview. A direct request containing exact wording or a specific change authorizes that change; a broad request does not authorize agent-selected editorial decisions.
- Approval covers implementation, tests, conflict repairs and release within that scope. Do not ask David to review each PR or repeat approval merely because the commit changed. Show him only a new decision or a change beyond the approved scope.
- Review the final diff against the approved proposal before release. Keep opportunistic copy/design changes out of maintenance and approved work. If a repair needs a visitor-facing change outside the approved scope, prepare it as a clearly labelled unpublished draft and obtain approval before including it in the release.
- "Copy" includes headings, buttons, labels, descriptions, metadata, accessibility text, email templates and other prospect/client-facing wording. Proposed ideas and content inventories are not approved copy. Existing production content is not retrospectively certified as David-approved by this policy.
- Agents must not invent approval, approve their own exception, or weaken this policy without David's explicit approval. Independently proposing a draft is allowed; merging or deploying that draft is not.

## Enforcement boundary

These are standing agent instructions and a required pre-release scope check. This change does not install an automatic publishing lock, change repository permissions, or claim that already-running sessions on other machines have loaded the new instructions. New and resumed work must read this policy before continuing.

## 10-10 — wording publication check

The required `wording-approval` check compares built pages before and after a
pull request on phone and desktop, across the green and Blues hosts. It reads
page text, labels, alternative text, search metadata, structured search text,
local text resources and explored buttons, tabs and disclosures. Comparison-only pages render the real loading and crash panels inside the isolated build; those pages are never included in the production build. It runs the
candidate inside a container without repository credentials; the trusted
browser and approval reader stay outside it. Missing pages, build failures,
uncovered dynamic pages and missing approval evidence block publication.

Wording-identical maintenance needs no approval. Design is outside this
wording-only check. Site Change Watch remains the separate after-publication
watch. The Nightly Audit Engineer's cleanup PRs use this same required check;
there is no second wording hold in this repository.

Agents share the owner's GitHub identity, so GitHub approvals cannot establish
that David himself answered. The supported evidence is a direct Google or
personal-key answer on a David-only Rack question. The question must carry the
complete `before` and `after` proposal generated in the run's `wording-proposal`
artifact, its repository, PR number and digest. The server independently hashes
those displayed words and refuses a mismatch. Relays, deputies, labels, files,
comments and agent-written approvals never grant this check.

Add `Wording approval card: <card UUID>` on its own line to the PR description.
After David answers, rerun **Website wording approval** for that PR number.
Approval follows the exact words, not commit IDs. Changes larger than the
current complete-display limit remain blocked; never truncate a proposal to
fit. The same collector is intended for the sister site's separate work item.

Coverage is bounded browser exploration, not a mathematical proof over every
possible interactive input. New dynamically generated page routes fail closed
until covered. Error-only and input-dependent states require dedicated journey
coverage; do not claim that arbitrary client-side behavior has been exhaustively
explored. Protection still depends on the repository's required-check settings;
changes to those settings are not approvals of website wording.
