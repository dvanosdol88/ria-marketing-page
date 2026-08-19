# AdvicePay Research Report (as of August 2026)

**Sourcing note:** advicepay.com, its help desks (helpscoutdocs), docs.advicepay.com, and kitces.com were blocked by the research session's network egress proxy, so direct page fetches were not possible. All facts below come from web-search result content quoting those pages plus reachable third-party coverage. Facts drawn from AdvicePay's own marketing pages are flagged as such; independently corroborated items are marked confirmed. Prices/fees should be re-verified on advicepay.com/pricing before signing up.

---

## 1. Core capabilities

**Billing types** (confirmed across AdvicePay help desk and plan pages):
- **One-time invoices** — for project, hourly, or ad-hoc fees. Hourly billing has no dedicated timer/timesheet feature; you calculate the amount and issue a one-time invoice (bulk CSV upload of one-time invoices is available on Professional/Enterprise). Sources: [Billing & Payments](https://advicepay.com/solutions/billing-payments/), [Essential plan page](https://advicepay.com/essential/)
- **Recurring subscriptions / retainers** — auto-billing on a recurring schedule; Professional adds up-front payment attached to a subscription, subscription end dates, and custom legal disclosures on invoices. Sources: [Choosing Your AdvicePay Plan](https://advicepay.helpscoutdocs.com/article/192-differences-between-advicepay-plans), [Professional page](https://advicepay.com/professional/)
- **AUM-based billing** — supported only as a workaround, not a fee engine: calculate the AUM fee outside the platform and issue a one-time invoice each period (or bulk CSV). It does not compute fees from custodial account values. Source: [How to Bill AUM Fees on AdvicePay](https://advicepay.helpscoutdocs.com/article/509-how-to-bill-aum-fees-on-advicepay)

**Payment methods** (confirmed): ACH bank draft and credit/debit cards. ACH bank linking is via Plaid instant-connect (500+ banks) or manual routing/account entry. Card processing runs on Stripe underneath (tokenized; AdvicePay never stores payment credentials). Sources: [How Clients Register their Account](https://advicepay.helpscoutdocs.com/article/96-how-does-my-client-set-up-their-account), [Security](https://advicepay.com/security/)

**Client payment experience** (confirmed via help desk): client gets an email with a secure link; they can **pay without creating a portal login**, or sign in to a client portal where they can view/pay invoices, sign documents, download agreements, update payment methods, and add a spouse/partner as a separate login. Advisor can white-label the portal with firm logo (Professional+). Link-based hosted checkout — invoices are addressed to a named client; no anonymous public "buy now" page. Sources: [How Clients Make Payments](https://advicepay.helpscoutdocs.com/article/181-how-does-my-client-make-a-payment), [Client Payment Portal tour](https://advicepay-enterprise.helpscoutdocs.com/article/115-what-do-clients-see-after-logging-in), [Customizable Client Experience](https://advicepay.com/features/customizable-client-experience/)

## 2. Additional capabilities beyond payments

- **eSignature** (confirmed): built-in "complimentary" eSignature on Professional and Enterprise plans; **agreements can be bundled with an invoice so the client signs and activates auto-pay in one 2–3 minute flow**. A [Dropbox Sign customer story](https://sign.dropbox.com/customers/advicepay) indicates the embedded eSign is powered by Dropbox Sign (HelloSign). AdvicePay also lists DocuSign and Dropbox Sign as external eSign integrations. Sources: [Professional](https://advicepay.com/professional/), [Engagement Workflows](https://advicepay.com/solutions/engagement-workflows/), [InvestmentNews RIA billing roundup](https://www.investmentnews.com/goria/technology/best-ria-billing-software-solutions-for-accuracy-and-efficiency/261798)
- **Compliance enforcement in billing flow** (marketing claim, plausible): can require a signed agreement before any bill is sent, and enforce that invoice amounts match the fees in the signed contract. Source: [Compliance Oversight](https://advicepay.com/solutions/compliance-oversight)
- **Deliverables tracking** (confirmed, **Enterprise-only**): track open/past-due/completed financial-plan deliverables as compliance evidence that services were delivered; can auto-cancel subscriptions if evidence isn't submitted. Not on Essential or Professional. Sources: [Deliverables release](https://blog.advicepay.com/blog/new-feature-release-deliverables-for-enterprise), [ThinkAdvisor coverage](https://www.thinkadvisor.com/2021/04/07/advicepay-adds-financial-plan-compliance-tool/)
- **Engagement workflows ("Engagements")** (Enterprise): invoices + eSignature + approvals + deliverables bundled into configurable automated sequences. Source: [Engagement Workflows](https://advicepay.com/solutions/engagement-workflows/)
- **Custody avoidance mechanics** (confirmed, the core value prop): advisors cannot pull funds unilaterally — the client approves payment requests and is the only party who can enter, view, or update their payment accounts, designed to avoid triggering custody under the Advisers Act custody rule. Source: [Compliance Oversight](https://advicepay.com/solutions/compliance-oversight), [SEC custody rule FAQ](https://www.sec.gov/rules-regulations/staff-guidance/division-investment-management-frequently-asked-questions/staff-responses-questions-about-custody-rule)
- **Prepayment-rule context**: SEC threshold is >$1,200 collected ≥6 months in advance (triggers audited balance sheet/ADV disclosure); many states still use $500/6-month, and some states treat any prepayment beyond limits as custody. AdvicePay's structure (bill in arrears or small advance increments, subscriptions billed monthly) is marketed as keeping advisors under these thresholds; no hard-coded "$500 blocker" setting was found in public docs — treat as configuration/practice, not a documented feature. Source: [Kitces on retainer-fee regulation](https://www.kitces.com/blog/regulation-of-financial-planning-subscription-and-retainer-fee-for-service/)

## 3. Integrations

- **WealthBox** (confirmed): native two-way link, enabled from Wealthbox → Applications → AdvicePay → Connect. Create the contact in Wealthbox, use **"Send To" → AdvicePay** to create the client in AdvicePay in one click; records stay linked with deep links both ways. It is a contact-sync/navigation integration — it does not push invoices or payment status into Wealthbox (use Zapier for that). Sources: [Wealthbox help article](https://help.wealthbox.com/hc/en-us/articles/29980397162523-The-AdvicePay-Integration), [AdvicePay announcement](https://blog.advicepay.com/blog/announcing-the-advicepay-and-wealthbox-integration), [Wealthbox integration page](https://www.wealthbox.com/integrations/advicepay/)
- **RightCapital**: **no direct integration exists.** RightCapital instead built its own competing product, **RightPay** (invoicing + payments powered directly by Stripe, included in RightCapital) — worth evaluating as an alternative, though it lacks AdvicePay's agreement/eSign/compliance workflow depth. Sources: [RightPay page](https://www.rightcapital.com/rightpay/), [WealthManagement.com launch coverage](https://www.wealthmanagement.com/technology/rightcapital-has-launched-rightpay), [RightCapital integrations](https://www.rightcapital.com/integrations/)
- **Calendly**: no direct integration; connect via **Zapier** (e.g., "New Calendly invitee" → "Create AdvicePay invoice"). Sources: [AdvicePay Zapier blog](https://blog.advicepay.com/blog/zapier-integration)
- **Zapier** (confirmed): official AdvicePay Zapier app; triggers/actions to find/create clients and generate invoices from other apps. Requires Professional plan or above. Sources: [Zapier integration page](https://advicepay.com/integrations/zapier/), [Choosing Your Plan](https://advicepay.helpscoutdocs.com/article/192-differences-between-advicepay-plans)
- **Other integrations** (confirmed list): eMoney, Envestnet MoneyGuide, Redtail, Salesforce/XLR8, Orion, PreciseFP, Pontera, Panoramix, Schwab Advisor Center, DocuSign/Dropbox Sign. Sources: [Integrations](https://advicepay.com/integrations/)
- **API** (confirmed): REST API v1.0.1 at [docs.advicepay.com](https://docs.advicepay.com/), OAuth 2.0 (client-credentials), objects for Advisors, Clients, Invoices, eSign (Signers, Templates, Agreements), Transfers, Transactions. **Enterprise plan only** — not available to a solo firm on Essential/Professional. Sources: [Enterprise API use cases](https://advicepay.helpscoutdocs.com/article/530-enterprise-plus-api-use-cases)

## 4. Pricing (verify on [advicepay.com/pricing](https://advicepay.com/pricing/) — search-snippet data)

| Plan | Price | Fits |
|---|---|---|
| **Essential** | **$10/month** | 1 advisor, up to **10 client accounts**, one-time + recurring auto-billing, ACH + cards, e-invoicing, reports. No integrations, no eSignature, no custom branding. |
| **Professional** | **$50/user/month** | Unlimited clients, admin users, white-label branding, **built-in eSignature**, integrations (Wealthbox, Zapier), subscription up-front payments/end dates/custom disclosures, bulk CSV invoicing. |
| **Enterprise** | Custom | Deliverables, engagement workflows, API, compliance dashboards, volume-discounted fees. |

**Transaction fees** (confirmed via help desk snippets, paid by the firm by default):
- ACH: **1.5%** per transaction ($0.30 minimum)
- Credit/debit: **3.5% + $0.30** per transaction (+1.5% foreign cards)
- **ACP / XYPN member rates: 1.0% ACH, 2.9% + $0.30 card** — XYPN membership also bundles/discounts AdvicePay itself. Sources: [AdvicePay Fees](https://advicepay.helpscoutdocs.com/article/31-fees-on-advicepay), [ACP partner page](https://www.acplanners.org/acpmainsite/advisors/why-join/vendor-partners/advicepay), [XYPN tech platform](https://www.xyplanningnetwork.com/member-benefit/technology-platform/)

Note ACH at 1.5% uncapped is *more expensive* than raw Stripe ACH (0.8% capped at $5) — the premium is the compliance layer.

## 5. Why RIAs use AdvicePay instead of Stripe directly

- **Custody rule (Advisers Act 206(4)-2 and state equivalents):** direct-debiting planning fees through your own Stripe account, where you control the charge and hold client payment credentials, can constitute custody → surprise-audit obligations (~$10k+/yr). AdvicePay is architected so the **client** authorizes payments and is the only one who can see/modify payment credentials. Founded by Michael Kitces and Alan Moore of XYPN. Sources: [Kitces AdvicePay review](https://www.kitces.com/blog/advicepay-review-sec-custody-compliant-fee-for-service-financial-planning-payment-processor/), [SEC custody FAQ](https://www.sec.gov/rules-regulations/staff-guidance/division-investment-management-frequently-asked-questions/staff-responses-questions-about-custody-rule)
- **Prepayment limits:** SEC $1,200/6-month (and state $500/6-month) prepayment rules make "charge the full annual fee upfront via Stripe" a compliance trap; AdvicePay's subscription/arrears billing patterns are built around staying under them.
- **Processor ToS risk:** generic processors (PayPal, Square, QuickBooks Payments) prohibit or shut down financial-services billing.
- **Documentation/audit trail:** signed agreement linked to each invoice, amount-matching enforcement, transaction reports — the exam-ready paper trail raw Stripe doesn't give you.
- Counterpoint: Stripe direct is cheaper and API-rich, and whether client-initiated Stripe invoices actually trigger custody is a facts-and-circumstances question — but AdvicePay is the tool state examiners recognize, which has real value for a startup RIA in state registration.

## 6. Onboarding a new firm

From the help desk "[Set Up Your New AdvicePay Account in 6 Simple Steps](https://advicepay.helpscoutdocs.com/article/611-set-up-your-new-advicepay-account)" and "[How to Sign Up](https://advicepay.helpscoutdocs.com/article/516-how-to-sign-up-for-a-new-account)":
- **Self-serve signup** — choose Essential or Professional during signup (switchable), enter billing info (coupon codes accepted, e.g. XYPN/ACP).
- **Requirements:** a **US-based checking account** for payouts; standard Stripe-connected-account KYC (legal/entity name, EIN or SSN for sole prop, owner identity).
- **Setup steps:** configure Firm Settings (logo, invoice settings, custom disclosures, billing in advance vs. arrears), connect the payout bank account, load your planning-agreement template for eSign bundling (Professional), add clients (name + email), send first invoice/agreement.
- **Timeline:** "issuing billing to clients within an afternoon"; first ACH payouts take a few business days. No sales call required below Enterprise.
- **Client onboarding:** add client name + email → AdvicePay emails them a secure link → they pay immediately or register a portal, linking bank via Plaid or entering a card. Source: [Get Your Clients Started](https://advicepay.helpscoutdocs.com/article/14-get-your-clients-started-on-advicepay)

---

### Fit assessment (solo, flat-fee, no clients yet, RightCapital + Wealthbox)

- **Essential at $10/mo covers you until client #11**, but lacks integrations, eSignature, and branding — the three things that make AdvicePay more than a payment link. Professional at $50/mo is where the Wealthbox integration, bundled agreement+invoice eSign flow, and Zapier live.
- The Wealthbox integration works in your favor; there is **no RightCapital integration**, and RightCapital's own **RightPay** (included with RightCapital) is the closest free alternative worth a look before committing.
- Deliverables tracking and the API — the deepest compliance-evidence features — are **Enterprise-only**; at Professional tier your compliance evidence is signed agreements + invoice matching + reports.
