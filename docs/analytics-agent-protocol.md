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
https://youarepayingtoomuch.com/
```

The printer-approved 2026 launch proofs contain this legacy URL:

```text
https://youarepayingtoomuch.com/?portfolio=1000000&years=20&growth=8&fee=1
```

05-66 measurement resolves the arriving URL, before calculator cleanup, on the
production root (`youarepayingtoomuch.com` or `www.youarepayingtoomuch.com`).
The printed four exact parameters and the full approved EDDM UTM tuple qualify.
Ordinary homepages with identical displayed defaults do not. Clean-root launch
inference is historical only; existing events/data are retained. Shared results
(old flat/mfe additions or new `shared=1`) and duplicate query parameters do not
qualify. New shared URLs carry `shared=1` and remove EDDM UTMs. Public QR image
assets remain unchanged; the original printed card address remains unchanged.

`eddm_qr_landed` follows an accepted server receipt once per qualifying document
opening/reload. It includes `measurement_version='05-66'`, `qr_opening_id`,
receipt-derived `qr_first_browser`, and explicit `qr_verification`. React rerenders,
URL cleanup and retries reuse the opening ID. Reopening the printed address creates
another opening; lifetime QR and website unique-browser counts still count each
browser once. Website daily uniques count once per Eastern day. Daily QR uniques
mean browsers first added to the QR counter that day, not every returning browser.

`public_metrics/eddm_launch_2026_exact` retains count/visits/daily data. Additive
GET fields are `qrOpenings`, `qrVisitors`, `websiteVisitors` (total and startedAt),
`asOf`, `timeZone`, opening-aware daily rows, a saved mixed-history summary, and
separate `verification` aggregates. Existing unique counters started
2026-10-08T18:32:08Z; QR opening total/start and prior daily opening coverage are
null until the first accepted opening. Never reset/backfill; read older mixed
history from `public_metrics/eddm_launch_2026` without modifying it.

Private dedup records below the counter store SHA-256 hashes of random anonymous
browser/opening identifiers, seen flags and timestamps. A server transaction
updates dedup markers and aggregate totals together. Separate hashed browser/day
markers preserve daily uniqueness even when delayed requests commit out of order
across Eastern midnight. No raw browser IDs, landing
URLs, calculator inputs, IP addresses or personal information are stored in these
receipts or exposed by GET. Browser identity uses local storage, a first-party
cookie, then session storage/memory fallback. Existing local dedup flags preserve
already-counted lifetime/daily totals during migration. If all storage is blocked,
identity lasts only for that document; do not promise cross-reload uniqueness.

Owner exclusion (`?selftest=1`, existing persistent flag/cookie) suppresses normal
QR events and counts. `?qrtest=1` is an ordinary preparation link: it sets a
session-only phone-verification marker/cookie and displays a small fixed notice
with an accessible Exit test button. The original printed card URL then records
separate verification openings/uniques even if owner exclusion is active. Requests
are verification when either the server cookie or the explicit boolean
request flag is true, so blocked cookies or an older tab's session marker cannot
silently turn a test into a prospect. A false request flag cannot disable a server
test cookie. Callers can only opt themselves out of prospect totals into test.
These events carry `self_test:true` and `qr_verification:true`. `?qrtest=0` or Exit test
clears the mode; it never alters normal legacy dedup flags. Recognized bots and
browser automation remain excluded in both modes. Real phone/card and email
proof remain separate from local automated tests.

Fresh ordinary/shared document entry clears stale campaign attribution; legitimate
QR context survives later calculator cleanup and conversion events in that same
document. Firm-site handoffs allow only available UTM fields, never calculator
assumptions, browser/session IDs or visitor-entered information. Analytics URL
stripping remains in place.

Legacy campaign parameters retained only for attribution of existing mail:

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

Do not remove the legacy printer-proof fallback until all physical mail from
that print run is outside its useful response window and the retirement is
documented in the dashboard guide and `REPO-LOG.md`.

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

- `eddm_qr_landed`
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

`eddm_qr_landed` is the immediate-alert milestone. It fires once per browser
tab session only for `is_eddm_visitor=true`. The complete campaign traffic
ledger remains `$pageview`, so analysts must not substitute the alert event for
historical landing analysis.

The RIA Builder display reads only the aggregate endpoint at
`/api/analytics/mailer-scans`. That endpoint may expose the total and latest
timestamp, never visitor-level receipts, browser identifiers, locations,
calculator inputs, or URLs.

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
