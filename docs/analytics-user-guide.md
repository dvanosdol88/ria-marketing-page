# Analytics User Guide

This guide has two tracks: plain English for business decisions, and technical guidance for implementation/debugging.

## Track 1: Plain English

PostHog answers: "What are visitors doing?"

Sentry answers: "Is the site breaking?"

Together, they tell the story:

1. Someone sees a mailer or other campaign.
2. They scan a QR code or visit `youarepayingtoomuch.com`.
3. They start or ignore the calculator.
4. They get a result or leave.
5. They click through to `smarterwaywealth.com`, schedule, email, verify the firm, or go back to the calculator.
6. If behavior looks bad, Sentry helps check whether a technical problem caused it.

## What To Watch

Watch these numbers first:

- Visits from the QR/mail campaign.
- Percent who start the calculator.
- Percent who reach a result.
- Percent who click through to Smarter Way Wealth.
- Percent who click intro-call/contact/verify-firm CTAs on Smarter Way Wealth.
- Mobile rage clicks, dead clicks, and session replays.
- Sentry errors around the same time as conversion changes.

## What To Do With The Information

Do not treat the dashboard as a scorecard only. Use it to choose the next test.

Examples:

- Lots of scans, few calculator starts: fix first-screen clarity, input affordance, or mobile layout.
- Many starts, few submissions/results: simplify the calculator interaction or reduce confusing fields.
- Many results, few SWW clicks: improve the bridge copy from "fee gap" to "what to do next."
- Many SWW visits, few intro clicks: make trust/proof/contact path clearer.
- Rage/dead clicks on mobile: watch recordings before changing copy.
- Conversion drop plus Sentry spike: fix the bug before changing marketing.

## Recommended Cadence

- Launch day: check every few hours, mostly for broken tracking, traffic arrival, and obvious mobile friction.
- First week: daily 15-minute review.
- After launch: weekly review with one decision: keep, kill, or test one change.
- Monthly: compare campaigns, device mix, and lead-intent quality.

## RIA Chief Consumption

Best default: RIA Chief should receive a short weekly digest, not raw dashboards.

Digest shape:

- Traffic by source/campaign.
- Funnel conversion: visit -> calculator start -> result -> SWW click -> intro/contact.
- Top friction signals.
- Notable session replay themes.
- Sentry/PostHog error notes.
- Recommended next action.

This can be delivered by email, Google Doc, or a dated markdown file in the CTO/RIA inbox. A dashboard is for investigation; the digest is for decisions.

## Email Alias For RIA Chief

An alias such as `riachief@smarterwaywealth.com` can be useful as a routing identity for reports, alerts, and Google Workspace search. Whether RIA Chief can actively receive or act on those emails depends on how the Google Workspace connector and mailbox routing are configured.

Practical recommendation:

- Use an alias or Google Group for inbound analytics/reporting messages.
- Route copies to David until automation behavior is proven.
- Keep permission narrow: read/report first, write/send only after explicit workflow design.
- For regulated-business context, do not let an agent send client-facing email without human approval.

## Track 2: Technical

PostHog client env vars:

```text
NEXT_PUBLIC_POSTHOG_KEY
NEXT_PUBLIC_POSTHOG_HOST
```

Sentry env vars:

```text
NEXT_PUBLIC_SENTRY_DSN
SENTRY_DSN
SENTRY_AUTH_TOKEN
SENTRY_ORG
SENTRY_PROJECT
```

`SENTRY_AUTH_TOKEN` is only for agent/API issue inspection. Never paste it in chat; set it locally.

Canonical event contract:

- `docs/analytics-event-contract.json`

Canonical dashboard recipe:

- `docs/posthog-two-site-dashboard.md`

Decision and RIA Chief reporting guide:

- `docs/analytics-consumption-ria-chief.md`

Primary implementation files:

- `src/components/PostHogProvider.tsx`
- `src/components/PostHogPageView.tsx`
- `src/components/PostHogCtaTracker.tsx`
- `src/lib/posthog.ts`
- `src/components/CostAnalysisCalculator.tsx`
- `D:/smarter-way-wealth/src/app/providers.js`
- `D:/smarter-way-wealth/src/components/PostHogPageView.js`
- `D:/smarter-way-wealth/src/components/PostHogCtaTracker.js`
- `D:/smarter-way-wealth/src/lib/posthog.js`

Verification checklist:

1. Run type/lint/build for the repo being changed.
2. Confirm `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` exist in the deployed environment.
3. Visit the production site with a test UTM URL.
4. Trigger one event from each touched flow.
5. Confirm events appear in PostHog with `site_domain`, UTM fields, and expected CTA/calculator properties.
6. Check Sentry for new errors caused by the release.

For production claims, local success is not enough. Production verification is required.
