# RightCapital Integrations & Onboarding Gaps — Research Report

*For a solo fee-for-service RIA on RightCapital + Wealthbox + AdvicePay. Compiled August 2026 via parallel research agent. Note: help.rightcapital.com, rightcapital.com, wealthbox.com, kitces.com, xyplanningnetwork.com, advicepay.com, and reddit.com were egress-blocked in the research environment, so facts from those domains come from search-index summaries of those pages; source URLs are given so they can be verified directly.*

---

## 1. Client onboarding / data-gathering capabilities and known limitations

**What RightCapital has:**
- **Client portal intake ("Blueprint" / onboarding steps):** Advisors invite clients to a portal where clients self-enter initial data through a customizable sequence — default steps are Family, Income, Savings, Net Worth, Expenses, Goals; advisors can add, remove, and re-order steps. Sources: [Onboarding Tab](https://help.rightcapital.com/knowledge-base/advisor-portal/clients/onboarding-tab-clients), [Onboard Clients with the Blueprint](https://help.rightcapital.com/how-to-videos/advisor-portal/clients/how-to-onboard-clients-with-the-blueprint), [Invite Clients](https://help.rightcapital.com/client-experience/invite-clients-to-access-their-portal)
- **Account aggregation — the aggregator is Envestnet | Yodlee** (not Plaid). Credentials held by Yodlee, read-only, balances refresh ~nightly. Only if aggregation is enabled on the firm's subscription (Premium+). Sources: [Security page](https://www.rightcapital.com/security/), [Linking Accounts via Yodlee](https://help.rightcapital.com/article/194-linking-accounts-via-yodlee/), [Using Account Aggregation](https://help.rightcapital.com/knowledge-base/profile/net-worth/using-account-aggregation)
- **Document Vault:** Shared and Private folders, drag-and-drop upload, mobile app support. Sources: [Vault Storage](https://help.rightcapital.com/module-overview/client-portal/vault-storage), [Advisor Portal Vault](https://help.rightcapital.com/module-overview/advisor-portal/vault-advisor-portal)
- **Tasks:** Clients can create/assign tasks to themselves, partner, or advisor; advisors can assign tasks to clients. Source: [Tasks](https://help.rightcapital.com/module-overview/client-portal/dashboard/tasks)
- **RightFlows (workflow management, Platinum-only add-on):** ordered workflows (new-client onboarding, annual review) with tasks assigned to advisors, assistants, and clients; completing a task auto-triggers the next step. Sources: [RightFlows page](https://www.rightcapital.com/rightflows/), [RightFlows Help Center](https://help.rightcapital.com/module-overview/advisor-portal/rightflows)
- **RightExpress (Premium+):** lightweight prospect plans built from six simplified modules; one-click conversion to a full plan. Sources: [RightExpress page](https://www.rightcapital.com/rightexpress/), [launch PR](https://finance.yahoo.com/news/rightcapital-launches-rightexpress-tm-transformative-130000184.html)
- **Smart Import / Document Intelligence:** OCR/AI reads unstructured docs and automates Holdings CSV imports (~70% manual-entry reduction); OCR-based migration from eMoney. Sources: [T3 on Smart Import](https://t3technologyhub.com/rightcapital-introduces-smart-import-ai-powered-tool-to-reduce-the-time-to-manually-input-plan-data-by-70-percent/)
- **RightCapital Leads:** a lead/prospecting directory feature ([Help Center](https://help.rightcapital.com/marketing-prospecting/right-capital-leads)) — not CRM-style lead capture on your own site.

**Known limitations / common complaints:**
- **Aggregation reliability is the #1 recurring gripe** — Yodlee connection failures, linking/maintenance friction. Manual entry is the standard fallback. ([G2 comparison](https://www.g2.com/compare/rightcapital-vs-emoney), [SelectHub roundup](https://www.selecthub.com/p/fp-and-a-software/rightcapital/))
- **No CRM** (no pipeline, no email logging, no lead capture) — RightCapital's own marketing positions CRM as a separate category it integrates with. ([Best CRMs blog](https://www.rightcapital.com/blog/best-crm-for-financial-advisors/))
- **No native e-signature, no agreement handling, no client billing/fee collection** in the traditional integrations list — though note **RightPay** (Stripe-based invoicing inside RightCapital) now exists as a lightweight billing option; see the AdvicePay research report.
- **Workflow automation only at Platinum** (RightFlows); Basic/Premium users have flat Tasks with no sequencing.
- **No periodic auto-reminders for clients to update data** (reviewer request, [G2](https://www.g2.com/products/rightcapital/reviews)).
- Planning-depth gaps noted by reviewers: international planning, AMT/stock-option modeling, deep multi-year tax projections, complex estate planning. ([Kitces review](https://www.kitces.com/blog/rightcapital-financial-planning-software-review-tax-sensitive-decumulation-planning-and-a-collaborative-planning-interface/))
- Context: RightCapital is the **#2 most-used planning software with an 8.6/10 satisfaction** in the Kitces AdvisorTech research — the complaints are edges, not core.

## 2. RightCapital ↔ Wealthbox integration — exactly what it does

- **Contact sync: Wealthbox → RightCapital, one-way, on-demand** ("one-click contact transfer"). Syncs household contact info including names and DOB. **Requirements: the Wealthbox contact must be in a Household and have a valid date of birth.** Sources: [RightCapital Help – Wealthbox](https://help.rightcapital.com/integrations/crm/wealthbox), [Wealthbox Help](https://help.wealthbox.com/hc/en-us/articles/29980409889819-The-RightCapital-Integration)
- **Notes & Tasks sync: RightCapital → Wealthbox, one-way, real-time** (enhanced April 2025). Edits made in Wealthbox do NOT flow back; only items created after April 15, 2025 sync. Sources: [Wealthbox announcement](https://www.wealthbox.com/rightcapital-enhances-wealthbox-integration-with-real-time-notes-and-tasks-sync/), [RC Help](https://help.rightcapital.com/integrations/crm/rightcapital-notes-tasks-in-wealthbox)
- **SSO:** enabling the integration turns on single sign-on RightCapital ⇄ Wealthbox. Sources: [Wealthbox CRM SSO – RC Help](https://help.rightcapital.com/integrations/sso/wealthbox-crm)
- **Not included:** no plan data (net worth, plan results, aggregation balances) surfaces inside Wealthbox; no Wealthbox→RightCapital note/task sync; no two-way contact updating.
- **How to enable:** RightCapital → **Integrations > Wealthbox > Connect**, enter Wealthbox credentials (OAuth).
- **Tier needed: no premium gate found** — RightCapital's plan explainer says Basic includes CRM/custodian integrations. Confirm with RightCapital if buying Basic. ([Plans Explained](https://www.rightcapital.com/blog/which-rightcapital-plan-is-right-for-you/))

## 3. RightCapital integrations overview

Canonical lists: [rightcapital.com/integrations](https://www.rightcapital.com/integrations/), [Help Center overview](https://help.rightcapital.com/integrations/overview).

- **CRMs:** Wealthbox, Redtail, Salesforce FSC, SmartOffice, Advyzon
- **Custodians (daily feeds):** Altruist, Apex, Axos, Betterment, BNY Pershing, Charles Schwab, Fidelity, First Clearing, Flourish, Folio, Interactive Brokers, LPL, Nationwide, Pacific Life, Raymond James, RBC, SEI, my529
- **Portfolio mgmt / aggregator feeds:** Orion, Black Diamond, Addepar, Tamarac, Albridge, AssetMark, Advyzon, Capitect, SEI
- **Client aggregation:** Envestnet | Yodlee (built-in, Premium+)
- **Data gathering:** PreciseFP bi-directional API integration ([PR Newswire](https://www.prnewswire.com/news-releases/rightcapital-and-precisefp-announce-new-data-integration-to-better-serve-financial-planning-community-301904299.html)) — notable because PreciseFP also integrates with AdvicePay
- **Risk:** built-in RightRisk (Premium+); no Nitrogen/Holistiplan integration confirmed
- **AI meeting tools:** Jump ([Jump help center](https://help.jumpapp.com/en/articles/11408193-rightcapital-integration))
- **AdvicePay: NO integration with RightCapital, direct or indirect.** AdvicePay's integration list has no planning software. The practical link between RightCapital and AdvicePay is **Wealthbox in the middle** (or PreciseFP for intake data). ([AdvicePay integrations](https://advicepay.com/integrations/))

## 4. RightCapital API and export options

- **No public/developer API.** All connectivity is via named partner integrations.
- **Partner API exists but is invitation-only** (Capitect, PreciseFP, Jump use it). A solo RIA cannot get credentials.
- **What an automation CAN use:**
  - **Inbound:** Holdings CSV upload and Smart Import OCR for unstructured docs.
  - **Outbound:** PDF plan reports/exports; the notes/tasks that sync into Wealthbox become reachable via **Wealthbox's public API** — the practical extraction path for this stack. No CSV export of plan data is documented.
- Bottom line: treat RightCapital as an integration **terminus**; automate around it through Wealthbox's API and AdvicePay, with RightCapital as the manual/CSV endpoint.

## 5. Tiers: Basic / Premium / Platinum

Sources: [pricing page](https://www.rightcapital.com/pricing/), [Plans Explained](https://www.rightcapital.com/blog/which-rightcapital-plan-is-right-for-you/).

| | Basic (~$149.95/mo) | Premium (~$209.95/mo) | Platinum (~$254.95/mo) |
|---|---|---|---|
| Core planning (retirement, tax, insurance, Social Security) | Yes | Yes | Yes |
| Client portal, mobile app, custom branding | Yes | Yes | Yes |
| **Vault + Tasks + templates** | **Yes** | Yes | Yes |
| **CRM/custodian integrations** | **Yes** | Yes | Yes |
| **Account aggregation (Yodlee)** | **No** | Yes | Yes |
| Budgeting w/ transaction categorization | No | Yes | Yes |
| Tax Analyzer (OCR tax returns) | No | Yes | Yes |
| RightRisk, RightIntel BI dashboard | No | Yes | Yes |
| **RightExpress (prospect plans)** | No | **Yes** | Yes |
| **RightFlows (workflow automation)** | No | No | **Yes (add-on, must be enabled)** |
| Firm-level assumptions/models, custom asset classes | No | No | Yes |

(Annual billing ≈ $1,800 / $2,520 / $3,060. **XYPN members get RightCapital included in membership** — historically the Premium-equivalent: [XYPN tech stack](https://www.xyplanningnetwork.com/advisor-blog/spend-less-and-get-more-with-the-xypn-tech-stack).)

**Implication:** the onboarding stack you'd want (client self-links accounts via aggregation + RightExpress prospect intake) requires **Premium**. Workflow automation requires **Platinum** — most solos instead run workflows in Wealthbox, which has them at every tier.

## 6. Division of labor in a Wealthbox + RightCapital + AdvicePay stack

This is XYPN's canonical stack — membership bundles **all three** (Wealthbox CRM, RightCapital, AdvicePay Professional at no extra fee): [XYPN tech stack](https://www.xyplanningnetwork.com/advisor-blog/spend-less-and-get-more-with-the-xypn-tech-stack), [XYPN "7 Tech Tools"](https://www.xyplanningnetwork.com/advisor-blog/the-7-tech-tools-you-need-to-launch-a-fee-only-firm), [XYPN core tech first year](https://www.xyplanningnetwork.com/advisor-blog/what-core-tech-does-my-ria-need-in-the-first-year).

**Wealthbox = system of record for people and process.** Prospect→client pipeline, contact records, emails, meeting notes, workflows (XYPN ships pre-built workflows matching its Financial Planning Process). Hub of the integrations: pushes contacts to RightCapital and AdvicePay; receives RightCapital notes/tasks back.

**AdvicePay = agreements + fees.** Issues planning agreements for client e-signature, then bills against them: ACH/card, hourly, one-time, recurring retainer/subscription.

**RightCapital = planning data + client deliverable.** All plan inputs/outputs, client portal, vault, aggregation-fed net worth, plan-related tasks; notes/tasks flow back into Wealthbox so the CRM stays the single activity timeline.

**The canonical flow:**
1. Lead lands in **Wealthbox** (pipeline stage: prospect); meetings and emails logged there.
2. At engagement: push contact **Wealthbox → AdvicePay**, send agreement for **e-signature in AdvicePay**, set up billing there.
3. At onboarding: push contact **Wealthbox → RightCapital**, invite client to the portal, client self-completes Blueprint intake + links accounts (aggregation, Premium+), uploads docs to Vault.
4. Ongoing: planning tasks/notes in RightCapital sync into Wealthbox; annual-review process runs as a Wealthbox workflow; fee changes/renewals in AdvicePay.

**Gap to know about:** RightCapital ↔ AdvicePay never talk directly — client status, signed agreements, and payment events only meet in Wealthbox (or in your inbox). Any automation for "signed agreement → create RightCapital onboarding" has to be human-triggered or driven off Wealthbox/AdvicePay APIs, ending at a manual "import contact into RightCapital" click, since RightCapital has no public API.

### Key takeaways for the solo RIA
1. Buy **RightCapital Premium** if clients should self-link accounts (Yodlee) and you want RightExpress prospect intake; Basic covers portal/vault/tasks/integrations but no aggregation. Skip Platinum — Wealthbox workflows cover the same need at every Wealthbox tier.
2. Enable both Wealthbox integrations (RightCapital and AdvicePay) from day one; keep Wealthbox households + DOBs clean or the RightCapital contact push fails.
3. Remember sync directionality: contacts WB→RC only; notes/tasks RC→WB only (post-Apr-2025 items only); nothing flows RC↔AdvicePay.
4. Don't plan automations against a RightCapital API — there isn't a public one. Automate via Wealthbox's API and AdvicePay, with RightCapital as the manual/CSV terminus.
