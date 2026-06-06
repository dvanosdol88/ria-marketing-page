# Analytics Agent Protocol

This protocol is strict because analytics silently rots when agents rename events, move CTAs, or change forms without updating tracking.

## Non-Negotiables

1. Do not rename a PostHog event without updating code, docs, dashboard specs, and any live dashboard/insight using that event.
2. Do not remove tracking because it appears unused. Confirm dashboard/report dependencies first.
3. Do not add capture of new user-entered data without a privacy/compliance review.
4. Do not identify users or attach calculator values to named people without explicit approval.
5. Do not claim analytics is verified until production events are visible in PostHog.
6. Do not claim technical health is verified until production Sentry/PostHog errors are checked.
7. Do not create a PostHog dashboard in the wrong project. First confirm the project contains the site events.

## Required Pre-Change Check

Before touching any of these areas, read this protocol and `docs/analytics-event-contract.json`:

- calculator inputs or outputs
- CTA text, hrefs, or placement
- routing and campaign landing URLs
- PostHog/Sentry providers
- privacy, contact, scheduling, or lead-capture flows
- Smarter Way Wealth handoff links
- EDDM/QR URLs
- public agent-readable files (`public/llms.txt`, `public/agent-info.json`, `public/robots.txt`, `public/sitemap.xml`)
- structured agent endpoints such as `/api/calculator`

## Campaign QR Protocol

The EDDM launch QR URL must remain traceable in PostHog. Its source of truth is `src/config/campaignLinks.ts`.

Current canonical QR URL:

```text
https://youarepayingtoomuch.com/?portfolio=1000000&years=20&growth=8&fee=1&variant=direct-mail&utm_source=eddm&utm_medium=print&utm_campaign=launch_5k&utm_content=qr_code
```

Required campaign parameters:

- `variant=direct-mail`
- `utm_source=eddm`
- `utm_medium=print`
- `utm_campaign=launch_5k`
- `utm_content=qr_code`

Tracked QR image assets:

- `public/assets/yaptom_default_inputs_qr.png`
- `output/mailer-samples/1-percent-blues/source-eddm/yaptom_default_inputs_qr.png`
- tracked copies under `output/mailer-samples/codex/**/brand-assets/yaptom_default_inputs_qr.png`

If the QR URL changes, update `src/config/campaignLinks.ts`, regenerate the QR PNGs, update `public/llms.txt`, update `public/agent-info.json`, update `docs/posthog-two-site-dashboard.md`, and rerender any print-ready PDF/proof that will actually be sent to a printer. Already-rendered PDFs do not automatically inherit a changed PNG.

## Agent-Readable Site Protocol

The site intentionally exposes a small set of crawler/agent-readable surfaces:

- `/llms.txt` for plain-English site, firm, campaign, and compliance context.
- `/agent-info.json` for structured site, firm, campaign, endpoint, and disclosure data.
- `/api/calculator` for structured calculator outputs from query parameters.
- `/robots.txt` and `/sitemap.xml` for crawl guidance and discoverability.

When changing firm identity, URLs, campaign links, disclosures, or calculator behavior, update these files/endpoints in the same change.

## Required Change Pattern

Every analytics-affecting change must include:

1. Code update.
2. Event contract update if event behavior changes.
3. User guide/dashboard recipe update if decision-making changes.
4. Agent protocol update if future maintenance rules change.
5. Production verification after deploy.

## Event Naming

Use stable snake_case event names.

Approved events:

- `calculator_started`
- `calculator_submitted`
- `cta_clicked`
- `firm_site_viewed`
- `calculator_cta_clicked`
- `intro_call_clicked`
- `verify_firm_clicked`
- `contact_clicked`
- `pricing_or_model_viewed` (planned)

New event names should describe a business milestone, not an implementation detail.

Good:

- `intro_call_clicked`
- `calculator_submitted`

Bad:

- `green_button_clicked`
- `component_v2_seen`

## Required Properties

Every custom event should include:

- `site_domain`
- `site_path`
- relevant UTM fields when present
- event-specific fields listed in `docs/analytics-event-contract.json`

CTA events should include:

- `cta_label`
- `cta_href`
- `cta_host`
- `cta_path`
- `cta_location`
- `opens_new_tab`

## Privacy Rules

Allowed:

- anonymous calculator assumptions
- campaign parameters
- CTA metadata
- page paths
- browser/device/session behavior

Restricted:

- email addresses typed into forms
- phone numbers typed into forms
- SSNs
- account numbers
- free-form personal financial details
- client names or identifiable financial information

If a new flow collects lead/client information, pause and design a privacy-safe analytics plan before instrumenting it.

## Dashboard Protocol

When asked to create, update, or use the two-site dashboard:

1. Confirm PostHog org/project.
2. Run schema discovery for actual events.
3. If events are missing, verify deploy/env first instead of inventing substitutes.
4. Build or update insights from `docs/posthog-two-site-dashboard.md`.
5. Write dashboard URL and insight IDs back into the dashboard doc.
6. Summarize what decisions the dashboard supports.

## Sentry Protocol

Use Sentry for technical failures, not marketing-funnel analysis.

Before blaming copy/design for a conversion drop:

1. Check Sentry unresolved issues for the affected production window.
2. Check whether errors align with the affected route/device/browser.
3. Check PostHog `$exception`, `$dead_click`, `$rageclick`, and session replay when available.
4. Fix production errors before changing marketing based on broken-session data.

Agents need `SENTRY_AUTH_TOKEN` set locally for direct Sentry API inspection. Never ask David to paste the token in chat.

## RIA Chief Reporting Protocol

RIA Chief should receive interpreted analytics, not raw charts.

Default weekly report:

- campaign traffic
- calculator funnel
- YAPTOM -> SWW handoff
- SWW intent actions
- mobile friction
- Sentry/error health
- one recommended next action

If using Google Workspace, prefer a Google Doc or email digest routed to David and any `riachief@smarterwaywealth.com` alias/group. Read-only/reporting automation should come before send-on-behalf-of automation.

Detailed reporting guidance lives in `docs/analytics-consumption-ria-chief.md`.
