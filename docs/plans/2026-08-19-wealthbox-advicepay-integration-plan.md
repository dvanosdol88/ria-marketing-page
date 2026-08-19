# WealthBox + AdvicePay + RightCapital: Onboarding Stack Integration Plan

**Date:** 2026-08-19
**Status:** Proposed — awaiting David's decisions (§4) and the logged-in verification pass (§6)
**Inputs:** *RightCapital Onboarding Capability Assessment* (2026-08-19, read-only platform assessment), *AI-Driven Client Onboarding Plan for a Tech-Enabled RIA*, and three sourced research reports in `docs/research/` (WealthBox, AdvicePay, RightCapital-stack — all 2026-08-19).

---

## 1. Goal

Assemble the prospect→client onboarding stack for Smarter Way Wealth / youarepayingtoomuch.com by assigning every stage of the capability assessment's recommended journey to a system that already does that job well — filling the gaps the assessment found in RightCapital (fit gating, e-signature, scheduling, qualitative discovery) with WealthBox (CRM/process) and AdvicePay (agreements + fees), with minimal custom build.

## 2. The one-line answer

**The pieces fit almost perfectly, and this is a known-good combination**: WealthBox + RightCapital + AdvicePay is XYPN's canonical launch stack (XYPN membership bundles all three). WealthBox is the hub — contacts push one-click from WealthBox to both AdvicePay and RightCapital, and RightCapital's notes/tasks flow back into WealthBox. AdvicePay's built-in eSignature bundles the advisory agreement with the first invoice, so "sign + activate autopay" is one 2–3 minute client flow — filling the assessment's stage-4 gap with a vendor we already planned to use. RightCapital and AdvicePay never talk directly; that's by design in this architecture, not a problem.

## 3. Journey → system-owner map

The capability assessment defined a 7-stage journey and left three stages without a concrete system. This assigns all seven:

| # | Stage (from assessment) | System owner | What specifically |
|---|---|---|---|
| 1 | Learn and build trust | **SWW / YAPTM sites** (unchanged) | Existing marketing funnel, calculator, fee-focus content |
| 2 | Share story / choose path | **SWW experience** (build) *or* secure form (interim) | The qualitative "Your Story" intake from the AI-onboarding plan. Not WealthBox (no native forms), not RightCapital (financial-only intake). See §4.4 |
| 3 | Confirm fit | **WealthBox** | Prospect pipeline/opportunities, contact record, notes, emails. David's fit decision recorded as a pipeline stage move |
| 4 | Make it official | **AdvicePay Professional** | Advisory agreement + Form ADV delivery via built-in eSignature, bundled with the first invoice; client signs and sets up ACH autopay in one flow. Client-authorized payments keep the firm custody-safe |
| 5 | Financial onboarding | **RightCapital** (invitation-only, per assessment) | Blueprint intake (Family/Income/Savings/Net Worth/Expenses/Goals), Yodlee aggregation (Premium), Vault, tasks. Triggered by "Send To → RightCapital" from WealthBox |
| 6 | Confirm what we heard | **SWW experience or manual secure doc** (interim: advisor-written summary delivered via RightCapital Vault + tasks) | Still the least-served stage. WealthBox AI Notetaker can draft it from meeting recordings later |
| 7 | Set agenda and meet | **Calendly + David** | Already in use; Calendly→WealthBox event logging via Zapier |

**Operational spine:** every stage transition is a WealthBox workflow step (WealthBox has templated onboarding workflows with milestone-relative due dates at every tier), so nothing depends on David's memory. The assessment's "manual handoffs" risk is mitigated by the workflow checklist first, automation second.

## 4. Decisions for David (in order of leverage)

> **Status update (2026-08-19, from David):** already live with WealthBox, RightCapital, and AdvicePay — the buy/tier decisions below are moot as purchase questions and become configuration verifications (§6). §4.1 (XYPN) is deferred to contract renewal; a one-shot reminder is set for 2027-04-19 to re-evaluate.

### 4.1 XYPN membership — evaluate FIRST, before buying anything à la carte
XYPN membership bundles **all three tools** (WealthBox, RightCapital ~Premium-equivalent, AdvicePay Professional) plus discounted AdvicePay transaction rates (1.0% ACH vs 1.5%; 2.9%+30¢ card vs 3.5%+30¢) and pre-built WealthBox workflow templates matching their Financial Planning Process. À la carte, the same stack runs roughly $75–99 (WealthBox Pro/Premier) + $50 (AdvicePay Pro) + $210 (RightCapital Premium) ≈ **$335–360/mo** before transaction fees. If XYPN membership cost is in that neighborhood, the bundled compliance/community support for a startup RIA likely makes it strictly better. **Action: price XYPN membership vs à la carte.**

### 4.2 AdvicePay vs RightPay
RightCapital now includes **RightPay** (Stripe-based invoicing inside RightCapital, no extra subscription). It is cheaper but lacks AdvicePay's core value: agreement-linked billing, built-in eSignature, client-controlled payment credentials (custody posture), and the exam-recognized audit trail. **Recommendation: AdvicePay Professional** — the compliance layer is the point for a state-registered startup; revisit RightPay only if the ~$50/mo + fee premium ever matters more than that. Verify RightPay's current scope during the logged-in pass anyway (§6).

### 4.3 Tier selections (pending two verifications)
- **WealthBox:** Pro ($75/user/mo) minimum — two-way Gmail sync + API live there. **Open question: whether "Send To" actions (the AdvicePay/RightCapital hand-off buttons) work on Pro or require Premier ($99)** — sources conflict; test on the 14-day trial. That single answer decides the tier.
- **AdvicePay:** Professional ($50/mo). Essential ($10) has no eSignature and no WealthBox integration, which removes the reasons to use AdvicePay at all. (Moot if XYPN bundles Professional.)
- **RightCapital:** Premium (~$210/mo) for Yodlee aggregation + RightExpress prospect plans. Skip Platinum — RightFlows is redundant with WealthBox workflows. (Moot if XYPN includes it.)

### 4.4 Where "Your Story" (stage 2) lives
Options, cheapest-first:
1. **Interim:** a Calendly booking + short intake questions, with answers logged to the WealthBox contact (manual or Zapier). Zero build.
2. **SWW purpose-built experience** per the AI-onboarding plan (conversational intake, no financial data, no login) writing to WealthBox via its API. This is the differentiated experience the plan doc envisions, and WealthBox's API (contacts, notes, tasks, workflow-start, webhooks) makes it feasible without Clerk — consistent with the assessment's "defer Clerk" recommendation.
3. **PreciseFP** (~paid) if we later want structured data gathering that pre-fills both WealthBox and RightCapital. Not needed at launch; RightCapital's Blueprint covers post-agreement financial intake.

**Recommendation: 1 now, 2 as the first real SWW product build, 3 only if 2 proves insufficient.**

## 5. Implementation phases

### Phase A — Accounts and plumbing (after §4 decisions; ~1 afternoon each)
1. WealthBox trial → verify Send-To tier question → subscribe. Connect Gmail + Google Calendar. Import the "onboard a new client" workflow template; adapt to the 7-stage journey.
2. AdvicePay signup (self-serve; needs firm checking account + Stripe KYC). Configure firm branding, load the advisory-agreement template for eSign bundling, set billing to arrears/monthly (stays under SEC $1,200/6-mo and state $500/6-mo prepayment thresholds).
3. RightCapital: enable Integrations → Wealthbox → Connect (SSO + contact push + notes/tasks sync). Build the onboarding (Blueprint) template + Planning Access template per the assessment's "next decisions" — test with a sample household, not a real one.
4. WealthBox → Applications → AdvicePay → Connect.
5. Zapier (or WealthBox API script): Calendly `invitee.created` → WealthBox event/contact. (Also feeds the PostHog `call_booked` backlog item.)

### Phase B — Dry run (assessment requirement, pre-EDDM)
Full mobile + desktop rehearsal as a fake prospect: site → story → fit stage move in WealthBox → AdvicePay agreement e-sign + $1 invoice → WealthBox "Send To → RightCapital" (household + DOB set!) → portal invite → Blueprint intake → Vault upload → summary → Calendly booking. Fix friction; document each step as the operating SOP in WealthBox workflow steps.

### Phase C — Automation (after manual flow proven; per `docs/openclaw-automation-ideas.md`)
- All automation targets **WealthBox's REST API** (personal token, webhooks, workflow-start endpoint) and **Zapier for AdvicePay** (its native API is Enterprise-only). RightCapital has **no public API** — treat it as the manual terminus; its notes/tasks surface in WealthBox where agents can read them.
- First automations: (1) agreement-signed → start WealthBox onboarding workflow; (2) meeting notes → WealthBox tasks; (3) daily pipeline/exceptions digest.
- Rate-limit note: WealthBox API ≈ 1 req/sec sustained; design agents with backoff.

## 6. Logged-in verification checklist (the credential-assisted phase)

Answers that require being inside the accounts — the agenda for the session where David logs in:

**WealthBox (14-day trial):**
- [ ] Do "Send To → AdvicePay" and "Send To → RightCapital" appear on the Pro tier, or Premier only?
- [ ] Generate a personal API token; confirm contacts/tasks/workflow endpoints and webhook registration work.
- [ ] Confirm the RightCapital push succeeds only with Household + Head-of-Household + DOB set (and codify that as a required field in the intake step).
- [ ] Is the 2026 AI suite (Agents/Playbooks/Notetaker) available on this account, and at what price?

**AdvicePay:**
- [ ] Confirm current pricing + transaction fees (research figures are search-snippet sourced).
- [ ] Load a draft advisory agreement; run a test eSign + invoice bundle end-to-end.
- [ ] Confirm "require signed agreement before invoicing" enforcement exists on Professional.
- [ ] Confirm state-registration fit for CT (prepayment threshold configuration).

**RightCapital (existing account):**
- [ ] Verify the Wealthbox integration has no tier gate on the current subscription.
- [ ] Check RightPay's presence/scope in the account (comparison data point for §4.2).
- [ ] Build and test the onboarding template + Planning Access template (assessment next-decision items) on a sample household.
- [ ] Confirm current tier and whether aggregation (Yodlee) is enabled.

**Credentials handling:** prefer a supervised desktop session where David types credentials himself, or enters them into the agent-driven browser at the login prompt. Credentials must never be pasted into chat, committed, or stored in the repo; if shared at all, rotate passwords afterward. Since there are no clients yet, the data-exposure risk is low — but building the right habit now is cheap.

## 7. Known gaps and accepted limits

- **Stage 6 ("here is what we heard") has no vendor.** Interim manual process; candidate for the SWW build in §4.4-option-2. Suggest adding to `docs/backlog.md`.
- **Sync thinness:** contact push WB→RC carries name+DOB only; AdvicePay↔WealthBox carries no invoice/payment status (Zapier can backfill); notes/tasks flow RC→WB one-way. The CRM is the single timeline only if we work from it.
- **WealthBox workflows don't auto-start natively** — API/Zapier glue or the early-access AI Playbooks close this; until then the workflow is started by hand at fit-confirmation.
- **Yodlee aggregation reliability** is RightCapital's most-complained-about feature; the Blueprint's manual entry + Vault statement upload is the documented fallback.
- **Research provenance:** several vendor sites were egress-blocked during research; facts came from search-index extracts of vendor help pages (URLs cited in `docs/research/`). The §6 checklist re-verifies every load-bearing claim in-product before money is spent.
