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
