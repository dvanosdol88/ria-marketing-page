# Analytics Consumption and RIA Chief Reporting

The dashboard is not the product. The point is to make better weekly decisions.

## Best Ways To Consume The Information

Use three layers.

### 1. Live Dashboard

Use when something is happening now.

- Launch day
- Mailers landing
- Sudden traffic spike
- Conversion drop
- Bug report

Live dashboard:

- `https://us.posthog.com/project/452693/dashboard/1669847`

Do not make broad strategy changes from a single live spike. Use it to decide what to inspect next.

### 2. Weekly Decision Digest

Use for operating the business.

The digest should answer:

- Did the audience show up?
- Did they start the calculator?
- Did they get a result?
- Did they click to Smarter Way Wealth?
- Did they show firm-site intent: intro call, contact, verify firm, or return to calculator?
- Was there mobile friction?
- Were there Sentry/PostHog errors that made the behavior data untrustworthy?
- What is the one next change to test?

Recommended default: a weekly Google Doc or email sent every Monday morning.

### 3. Monthly Learning Review

Use for strategy.

Compare:

- campaign sources
- EDDM variants
- mobile vs desktop
- asset-tier mix
- CTA locations
- SWW intent quality
- technical reliability

The output should be a short decision log, not a chart dump.

## Weekly Digest Template

```text
RIA Chief Analytics Digest
Period: <date range>

1. Bottom line
<One paragraph with the most important read.>

2. Funnel
- Visits:
- EDDM visits:
- Calculator starts:
- Calculator results:
- Clicks to SWW:
- SWW pageviews:
- Intro-call clicks:
- Contact clicks:
- Verify-firm clicks:

3. What changed
<Traffic, conversion, source, device, or behavior shifts.>

4. Friction and bugs
- PostHog dead/rage clicks:
- Session replay themes:
- Sentry unresolved/new issues:
- Any reason behavior data may be distorted:

5. Recommended next action
<One test, fix, or decision.>

6. Watch list
<Things to keep watching, not act on yet.>
```

## RIA Chief Automation Options

### Recommended First Version: Read-Only Weekly Digest

RIA Chief reads PostHog/Sentry/reporting data and produces a short digest. Delivery can be:

- Google Doc in a reporting folder
- email to David
- markdown entry in the CTO/RIA inbox
- all of the above once stable

This is safest because it creates advice for David to review, not autonomous external action.

### Strong Second Version: Digest Plus Suggested Experiments

RIA Chief adds:

- which CTA/page/section likely needs work
- what evidence supports the idea
- a proposed test
- what metric would prove the test worked

### Later Version: Automated Issue Creation

Once stable, RIA Chief can create internal tasks:

- "Investigate mobile rage clicks on calculator"
- "Fix Sentry issue affecting /save"
- "Draft alternate SWW handoff CTA"

Keep these as internal tasks, not public/client communication.

## Email Alias Or Group For RIA Chief

An alias or Google Group like `riachief@smarterwaywealth.com` is useful as a routing identity.

Use it for:

- PostHog scheduled dashboard emails
- Sentry alert routing
- weekly digest copies
- Google Drive ownership/sharing clarity

Important distinction:

- An alias by itself does not create a separate mailbox.
- A Google Group can receive mail and retain a history if configured that way.
- Whether RIA Chief can "receive" or act on those emails depends on the Google Workspace connector/account permissions and whether the mailbox/group is searchable by the connected account.

Recommended setup:

1. Create a Google Group or alias such as `riachief@smarterwaywealth.com`.
2. Route copies to David at first.
3. Confirm the Google connector can search/read the messages.
4. Use read-only digest generation first.
5. Add send/action permissions only after a separate approval workflow is designed.

Do not allow autonomous client-facing email from RIA Chief without human approval.

## Sentry Reporting

Sentry should be part of the digest, but not a replacement for PostHog.

PostHog:

- behavior
- funnel
- CTAs
- session replay
- friction signals

Sentry:

- production errors
- affected routes
- releases
- browser/device context
- whether a conversion drop is caused by a broken site

Weekly digest should include:

- new unresolved production issues
- issues affecting YAPTOM/SWW public routes
- errors that overlap with conversion drops
- whether error rate invalidates the behavioral read

Agent requirement: before recommending marketing changes from a conversion drop, check Sentry or explicitly state that Sentry could not be checked.

Current local setup note from 2026-06-04:

- `SENTRY_AUTH_TOKEN` was not set in the local shell.
- `SENTRY_ORG` and `SENTRY_PROJECT` were not set in the local shell.
- Neither repo's `.env.local` exposed a Sentry DSN variable name during the check.
- Vercel/production may still have Sentry env vars; verify with Vercel before declaring production Sentry disabled.

## Automation Guardrails

- Read/report automation first.
- Human approval before external sends.
- No client-specific personal data in digests.
- No lead/client outreach without explicit workflow approval.
- If analytics suggests a compliance-sensitive content change, treat it as draft-only until David approves.
