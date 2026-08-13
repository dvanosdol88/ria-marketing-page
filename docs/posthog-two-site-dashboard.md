# PostHog Two-Site Journey Dashboard

This is the canonical dashboard recipe for `youarepayingtoomuch.com` and `smarterwaywealth.com`.

The connected PostHog MCP project available during setup did not yet show the site-specific events (`calculator_started`, `calculator_submitted`, `cta_clicked`, etc.). A live dashboard shell and planned insights were created anyway so the reporting structure exists before launch traffic arrives. If the dashboard stays empty after deployment, verify production env vars and event ingestion before changing insight definitions.

## Dashboard

Name: `Two-Site Marketing Journey`

Recommended scope: one PostHog project containing both domains, split by the event property `site_domain`.

Live dashboard:

- Project/team ID: `452693`
- Dashboard ID: `1669847`
- URL: `https://us.posthog.com/project/452693/dashboard/1669847`

Tags:

- `marketing`
- `two-site-journey`
- `eddm`
- `sww`

Primary date range: last 30 days. During EDDM launch week, also view last 24 hours and last 7 days.

## Required Tiles

The live dashboard was created on 2026-06-04 with the following saved insights. Some tiles may remain empty until both sites are deployed with the event contract and production traffic is visible in this PostHog project.

1. `EDDM landing traffic`
   - Live insight: `EDDM Landing Traffic by Site`
   - Insight ID: `9074095`
   - Short ID: `XbJ93cM1`
   - URL: `https://us.posthog.com/project/452693/insights/XbJ93cM1`
   - Type: trend
   - Event: `$pageview`
   - Filter: `utm_source = eddm` OR `is_eddm_visitor = true`
   - Audit breakdown: `campaign_attribution_method`; the mailed printer proofs should report `legacy_qr_signature`.
   - Breakdown: `site_domain`
   - Question answered: are mailer/QR scans arriving, and which site are they hitting?

2. `Calculator funnel`
   - Live insight: `Calculator Funnel: YAPTOM to SWW`
   - Insight ID: `9074085`
   - Short ID: `UObunxLj`
   - URL: `https://us.posthog.com/project/452693/insights/UObunxLj`
   - Type: funnel
   - Steps:
     1. `$pageview` where `site_domain` contains `youarepayingtoomuch.com`
     2. `calculator_started`
     3. `calculator_submitted`
     4. `cta_clicked` where `cta_host` contains `smarterwaywealth.com`
   - Breakdown: `utm_campaign` when campaign data exists
   - Question answered: where does YAPTOM lose people?

3. `YAPTOM to SWW handoff`
   - Live insight: `YAPTOM to SWW Handoff CTAs`
   - Insight ID: `9074131`
   - Short ID: `MOtoaDif`
   - URL: `https://us.posthog.com/project/452693/insights/MOtoaDif`
   - Type: trend or funnel
   - Event: `cta_clicked`
   - Filter: `cta_host` contains `smarterwaywealth.com`
   - Breakdown: `cta_location`
   - The solid-green post-calculator firm handoff keeps its home-doorway event
     at `cta_location=home_firm_visit_card` and
     `cta_label=Visit Smarter Way Wealth`. Its four destination rows use
     `home_firm_visit_card_calculator`, `home_firm_visit_card_how`,
     `home_firm_visit_card_david`, and `home_firm_visit_card_faq`; this makes
     the firm-home handoff and each visitor intent comparable with navigation
     and other firm-site handoffs.
   - Question answered: which page/CTA is sending visitors to the firm site?

4. `Firm-site intent`
   - Live insight: `SWW Intent Actions`
   - Insight ID: `9074109`
   - Short ID: `5MoHhrJK`
   - URL: `https://us.posthog.com/project/452693/insights/5MoHhrJK`
   - Type: trend
   - Events:
     - `firm_site_viewed`
     - `intro_call_clicked`
     - `contact_clicked`
     - `verify_firm_clicked`
     - `cta_clicked`, filtered to `cta_path` exactly `/save`, labeled
       `Why Smarter Way clicked`
     - `cta_clicked`, filtered to `cta_location` exactly
       `home_decision_fork` and `cta_label` exactly `See How It Works`, labeled
       `Homepage fork — See How It Works`
     - `cta_clicked`, filtered to `cta_location` exactly
       `home_decision_fork` and `cta_label` exactly `Meet David`, labeled
       `Homepage fork — Meet David`
     - `cta_clicked`, filtered to `cta_location` exactly
       `save_decision_fork` and `cta_label` exactly `See How It Works`, labeled
       `Save fork — See How It Works`
     - `cta_clicked`, filtered to `cta_location` exactly
       `save_decision_fork` and `cta_label` exactly `Meet David`, labeled
       `Save fork — Meet David`
     - `calculator_cta_clicked`
   - Breakdown: event name plus the explicit fork series labels above.
   - Question answered: what do visitors do after they reach SWW, and do
     homepage or `/save` visitors prefer self-guided details or a conversation?
   - Semantics: the filtered `/save` series measures internal interest in the
     flagship Smarter Way Wealth cost-model experience.
     `calculator_cta_clicked` remains limited to outbound clicks from the firm
     site back to `youarepayingtoomuch.com`.
     The Decision Fork series reuse `cta_clicked`; they add no event and no
     personal-information capture. Meet David clicks also retain the existing
     `intro_call_clicked` event.

5. `Intro-call conversion`
   - Live insight: `SWW Intro-Call Conversion`
   - Insight ID: `9074113`
   - Short ID: `ZYzzj6Js`
   - URL: `https://us.posthog.com/project/452693/insights/ZYzzj6Js`
   - Type: funnel
   - Steps:
     1. `firm_site_viewed`
     2. `intro_call_clicked`
   - Breakdown: `first_utm_source`
   - Question answered: which sources produce scheduling intent?

6. `Mobile friction`
   - Live insight: `Mobile Friction and Error Signals`
   - Insight ID: `9074121`
   - Short ID: `cZghBwkV`
   - URL: `https://us.posthog.com/project/452693/insights/cZghBwkV`
   - Type: trend/session replay workflow
   - Events:
     - `$dead_click`
     - `$rageclick`
     - `$pageleave`
   - Filters:
     - `site_domain` in both public domains
     - Optional: `utm_source = eddm`
   - Question answered: are mobile QR visitors confused or stuck?

7. `Asset-tier mix`
   - Live insight: `Calculator Result Asset-Tier Mix`
   - Insight ID: `9074129`
   - Short ID: `w93bGCXZ`
   - URL: `https://us.posthog.com/project/452693/insights/w93bGCXZ`
   - Type: trend or bar
   - Event: `calculator_submitted`
   - Breakdown: `calculated_asset_tier`
   - Question answered: what kind of investor is using the calculator?

8. `Technical health next to behavior`
   - Live coverage: included in `Mobile Friction and Error Signals` via `$exception`; direct Sentry issue counts remain a separate reporting input unless Sentry is connected to the digest workflow.
   - Type: error trend
   - Events:
     - `$exception` in PostHog, if enabled
     - Sentry unresolved issue count, reported separately if Sentry remains the primary error platform
   - Breakdown: `site_domain` or release
   - Question answered: did conversion drop because the site broke?

## Launch-Day Views

Use these filters before the mailers land:

- `utm_source = eddm`
- `utm_medium = print`
- `utm_campaign = launch_5k`
- `utm_content = qr_code`

The 2026 printer-approved mailer proofs contain an earlier untagged URL. The
site recognizes its exact calculator signature as the same campaign and adds:

- `campaign_attribution_method = legacy_qr_signature`
- `legacy_eddm_qr = true`

Keep a launch-day view filtered by `legacy_eddm_qr = true` so scans from the
physical mail piece are visible independently of explicitly tagged test visits.

Canonical QR URL:

```text
https://youarepayingtoomuch.com/?portfolio=1000000&years=20&growth=8&fee=1&variant=direct-mail&utm_source=eddm&utm_medium=print&utm_campaign=launch_5k&utm_content=qr_code
```

## Weekly Review Questions

The dashboard is useful only if it changes decisions. Ask these every week:

- Did enough people scan or visit to validate the channel?
- Where is the largest drop-off?
- Are mobile users behaving differently from desktop users?
- Which CTA moves people to SWW?
- Are people verifying the firm, contacting, or scheduling?
- Did any Sentry/PostHog error spike line up with lower conversion?
- What one copy, layout, speed, or CTA test should be run next?

## Live Creation Protocol

Before creating or editing the dashboard in PostHog:

1. Confirm the connected PostHog organization/project is the marketing analytics project.
2. Run schema discovery and confirm the events in `docs/analytics-event-contract.json` exist.
3. Create the dashboard only after the event schema is visible.
4. Add dashboard URL and insight IDs back to this file.
5. Do not rename events to make a dashboard easier; update code and docs together.
