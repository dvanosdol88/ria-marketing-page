# DevOps Advisor: Infrastructure Audit & Action Plan

**Date:** February 9, 2026
**Repo:** dvanosdol88/ria-marketing-page
**Reviewed by:** Claude (primary), Claude Code CLI (peer review)

---

## Findings

### Infrastructure Status: Healthy (with one config bug)

The foundational infrastructure is in good shape. Renovate is installed and running, the Dependency Dashboard is active (Issue #31) and tracking updates, and all three required GitHub secrets are configured: ANTHROPIC_API_KEY (Jan 28), SLACK_WEBHOOK_URL (Jan 28), and GEMINI_API_KEY (Feb 4). The three-tier risk model is partially working — React v19 is correctly gated behind dashboard approval, which confirms the system's core logic is functional.

### Bug Found: Tier 3 Rule Uses AND Logic Instead of OR

The current Tier 3 rule combines `matchUpdateTypes: ["major"]` with `matchPackageNames: ["next", "react", "react-dom", "tailwindcss"]` in a single rule. In Renovate, multiple match criteria within one rule combine as AND logic, meaning the rule only catches updates that are both a major version bump AND one of those four specific packages. Every other major update in the project has no gate at all.

This is why ESLint v9, @types/node v24, and eslint-config-next v16 are sitting as open PRs right now. They are all major updates that should have required dashboard approval but slipped through unprotected. The glob v13, recharts v3, and slack-github-action v2 updates in the rate-limited queue would also bypass the approval gate once they come off the rate limit.

The fix is to split the single Tier 3 rule into three separate rules:

- **Rule A (RED LANE):** Catches ALL major updates regardless of package name — the universal safety net.
- **Rule B (YELLOW LANE):** Gates Next.js for any version change, not just majors.
- **Rule C (YELLOW LANE):** Gates React for any version change, not just majors.

Renovate processes rules in order, and later rules override earlier ones. So the React/Next.js rules (requiring approval) come after the production-patches rule (automerge), meaning a React patch will correctly require approval rather than auto-merging. The RED LANE catch-all at the bottom is the final safety net.

### Additional Issues Found

**No schedule configured.** The current config has no `schedule` property, so Renovate runs on its default timing (essentially continuous). Adding a Monday morning schedule aligns updates with the planned weekly review cadence.

**No PR rate limiting.** No `prHourlyLimit` is set, meaning Renovate can create many PRs in rapid succession.

**No vulnerability override.** Without a `vulnerabilityAlerts` config, security patches follow the same Monday schedule as everything else. A critical CVE discovered on Tuesday would sit for 6 days before Renovate acts on it. The fix is a vulnerability alerts override that runs "at any time" regardless of schedule.

**Tailwind ecosystem not grouped.** Tailwind, PostCSS, and autoprefixer are tightly coupled in the build pipeline. Updating one without the others can cause build failures.

**TypeScript type definitions have no special handling.** These are zero-risk for production and should auto-merge silently (except `@types/react` and `@types/react-dom`, which should follow the React gating rule).

**@vercel/kv is deprecated with no replacement.** The dashboard flags this, but there is no action plan for it. If it is actively used in the project, it needs a migration plan. If it is not used, it should be removed from dependencies.

**eslint-config-next is not grouped with Next.js.** This package is tightly coupled to the Next.js version. The corrected config adds it to the Next.js group so they are gated and reviewed together.

### Glob Pattern Syntax: Verified

The CLI agent flagged that `@types/**` and `@next/**` glob patterns should be verified against current Renovate docs. Confirmed: Renovate's `matchPackageNames` supports glob patterns via the minimatch library. The older `matchPackagePrefixes` is deprecated, and Renovate auto-migrates to `matchPackageNames` with glob syntax. The patterns in the corrected config are valid and current.

### Current Dashboard State (Issue #31)

| Category | Count | Details |
|----------|-------|---------|
| Deprecations | 2 | @vercel/kv (no replacement), framer-motion (→ motion) |
| Pending Approval | 1 | React monorepo → v19 |
| Rate-Limited | 10 | Includes next v16.1.6, glob v13, recharts v3, slack-github-action v2 |
| Pending Status Checks | 3 | @types/node v20.19.33, @types/react v18.3.28, chart.js v4 |
| Open PRs | 10 | PRs #29-39 (various actions, eslint v9, @types/node v24, eslint-config-next v16) |
| Blocked | 1 | PR #28 (actions/checkout digest — closed/blocked) |

---

## Action Plan

### Step 1: Close the Ungated Major PRs (do this first)

Go to the Pull Requests tab in your repo and **close** (do not merge) these PRs that slipped through due to the config bug:

- ESLint v9
- @types/node v24
- eslint-config-next v16

Any other open PRs that are major version bumps should also be closed. Once the corrected config is in place, these updates will reappear properly gated in the Dependency Dashboard where they belong.

### Step 2: Replace renovate.json (via config-only PR)

Open `renovate.json` in your repo root. Replace the entire file contents with the corrected configuration in the section below.
Use a dedicated branch and config-only PR instead of committing directly to `main`.

Before merge, run:

```
npx --yes --package renovate renovate-config-validator renovate.json
```

Then merge after CI is green.

Suggested commit message:

```
fix: correct Tier 3 AND logic bug, add vulnerability alert fast-lane
```

### Step 3: Check @vercel/kv Usage (completed)

Search your codebase for any imports or references to `@vercel/kv`. If you find active usage, flag it for a migration plan (this becomes a future task). If there are no references, remove it from `package.json` and commit.

Current result: `@vercel/kv` is actively used in:

- `src/app/api/quiz/vote/route.ts`
- `src/app/api/quiz/reset/route.ts`

Do not remove `@vercel/kv` yet. Create and track a separate migration task.

### Step 4: Monitor Next Renovate Run/Cycle

Renovate should pick up the new config on the next run/cycle. With the Monday schedule enabled, the dashboard should reorganize:

- Major updates move to "Awaiting Approval" (no PR created until you check the box)
- Next.js and React updates move to "Awaiting Approval" regardless of version type
- DevDependency patches and minors start auto-merging silently (no PR, no notification)
- Production patches create auto-merge PRs (visible as audit trail, but no action needed)
- Security vulnerabilities bypass the Monday schedule entirely and create PRs immediately

### Step 5: Triage the Dashboard (Monday morning, 5-10 minutes)

Once the dashboard has reorganized, review what is in each lane.

**Approve the Green Lane items** that have been waiting: autoprefixer patch, playwright patch, framer-motion patch. These should auto-merge after CI passes.

**Leave the Red Lane items unapproved.** Sequence them one at a time, one per week maximum, in this order (lowest blast radius first):

1. **glob → v13** — Check if you use it directly first. If only an indirect dependency, risk is lower.
2. **slackapi/slack-github-action → v2** — Workflow-only change. Test in a non-critical Slack channel. Verify inputs/outputs match new version requirements.
3. **recharts → v3** — Chart API changes. Needs visual verification of all chart components. Isolate in its own PR.
4. **framer-motion → motion** — Package rename. Requires import path refactor across all animation components. Treat as a controlled refactor PR.
5. **React → v19** — Do this LAST. Largest blast radius, most ecosystem churn. Dedicate a full session to this upgrade.

### Step 6: Set Up the Monday Report (next session)

Once the config is stable and you have seen one clean Monday cycle, build the GitHub Action workflow for automated AI-powered Slack reports. This is Phase 1 of the DevOps Advisor agent and will be covered in a follow-up session.

### Step 7: v2 Acceptance Checklist (required)

Confirm all of the following after one full run/cycle:

- No ungated major PRs are created.
- Next.js and React updates require dashboard approval for all version types.
- Vulnerability updates bypass normal cadence and appear immediately.
- DevDependency patch/minor updates continue to auto-merge silently.
- Production patch updates continue to auto-merge via PR for audit visibility.

### Step 8: Rollback Path

If behavior regresses:

1. Revert the `renovate.json` config PR.
2. Re-check Dependency Dashboard behavior on the next run.
3. Re-apply changes incrementally (rule order first, then schedule/rate limits, then vulnerability settings).

---

## Corrected renovate.json

Copy this entire block and paste it as the complete contents of `renovate.json` in your repo root.

```json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": [
    "config:recommended",
    ":dependencyDashboard",
    ":semanticCommits",
    ":timezone(America/New_York)"
  ],

  "schedule": ["before 6am on monday"],
  "minimumReleaseAge": "7 days",
  "prConcurrentLimit": 10,
  "prHourlyLimit": 4,
  "rebaseWhen": "conflicted",
  "platformAutomerge": true,

  "vulnerabilityAlerts": {
    "enabled": true,
    "labels": ["security"],
    "schedule": ["at any time"]
  },

  "lockFileMaintenance": {
    "enabled": true,
    "automerge": true,
    "automergeType": "branch",
    "schedule": ["before 5am on monday"]
  },

  "packageRules": [
    {
      "description": "GREEN LANE: DevDependencies patch/minor — silent automerge (no PR created)",
      "matchDepTypes": ["devDependencies"],
      "matchUpdateTypes": ["minor", "patch"],
      "automerge": true,
      "automergeType": "branch"
    },
    {
      "description": "GREEN LANE: TypeScript types — silent automerge (except React/Node types)",
      "matchPackageNames": ["@types/**", "!@types/react", "!@types/react-dom", "!@types/node"],
      "matchUpdateTypes": ["minor", "patch"],
      "groupName": "TypeScript Definitions",
      "automerge": true,
      "automergeType": "branch"
    },
    {
      "description": "GREEN LANE: Production patches — automerge with PR (audit trail)",
      "matchDepTypes": ["dependencies"],
      "matchUpdateTypes": ["patch"],
      "automerge": true,
      "automergeType": "pr"
    },
    {
      "description": "GREEN LANE: Tailwind ecosystem — automerge non-major (grouped together)",
      "matchPackageNames": ["tailwindcss", "postcss", "autoprefixer", "@tailwindcss/**", "tailwind-merge", "clsx"],
      "groupName": "Tailwind CSS",
      "matchUpdateTypes": ["minor", "patch"],
      "automerge": true
    },
    {
      "description": "YELLOW LANE: Next.js framework — ALWAYS require approval (any version change)",
      "matchPackageNames": ["next", "eslint-config-next", "@next/**"],
      "groupName": "Next.js",
      "dependencyDashboardApproval": true,
      "automerge": false,
      "labels": ["dependencies", "framework", "requires-approval"]
    },
    {
      "description": "YELLOW LANE: React ecosystem — ALWAYS require approval (any version change)",
      "matchPackageNames": ["react", "react-dom", "@types/react", "@types/react-dom"],
      "groupName": "React",
      "dependencyDashboardApproval": true,
      "automerge": false,
      "labels": ["dependencies", "framework", "requires-approval"]
    },
    {
      "description": "RED LANE: ALL major updates — require dashboard approval (safety net)",
      "matchUpdateTypes": ["major"],
      "dependencyDashboardApproval": true,
      "automerge": false,
      "labels": ["dependencies", "major-update", "requires-approval"]
    }
  ]
}
```

---

## Change Log: What's Different from the Previous Config

### Bug Fixes

| Change | Before | After | Why |
|--------|--------|-------|-----|
| Tier 3 rule | Single rule with AND logic (matchUpdateTypes + matchPackageNames) | Split into 3 separate rules | Fixes the bug — all majors are now gated, not just 4 packages |
| Next.js gating | Only caught by the combined Tier 3 rule for majors | Dedicated rule gates ANY version change | Next.js patches can break rendering; gate everything |
| React gating | Only caught by the combined Tier 3 rule for majors | Dedicated rule gates ANY version change | React patches can break hooks/lifecycle; gate everything |
| eslint-config-next | Not handled | Included in Next.js group | Tightly coupled to Next.js version; must be reviewed together |

### New Features Added

| Feature | What It Does | Why |
|---------|-------------|-----|
| `schedule: ["before 6am on monday"]` | Constrains Renovate to Monday mornings | Aligns with weekly review cadence |
| `prHourlyLimit: 4` | Max 4 PRs created per hour | Prevents notification floods |
| `vulnerabilityAlerts` with `schedule: ["at any time"]` | Security patches bypass the Monday schedule | Critical CVEs should not wait 6 days |
| Tailwind grouping | PostCSS, autoprefixer, and Tailwind update together | Prevents partial build pipeline updates |
| TypeScript types rule | `@types/*` silent automerge (excluding React/Node types) | Zero production risk, reduces noise |

### What Was Kept (Already Correct)

| Feature | Why It Stays |
|---------|-------------|
| `minimumReleaseAge: "7 days"` | Supply chain quarantine — blocks brand-new releases |
| `automergeType: "branch"` for devDeps | Truly silent updates — no PR, no notification |
| `platformAutomerge: true` | Uses GitHub's native merge instead of Renovate polling |
| `rebaseWhen: "conflicted"` | Only rebases when necessary, not on every push |
| Lock file maintenance on Monday | Keeps lock file clean weekly |

### Design Decision: Gating All React/Next.js Patches

The CLI agent noted that gating every patch (not just minors and majors) for React and Next.js is aggressive, since routine security fixes would wait for Monday review. This is a valid tradeoff. However, the newly added `vulnerabilityAlerts` config resolves this: known CVEs bypass the schedule entirely and create PRs immediately with a "security" label. Non-security patches (which can still introduce subtle breaking changes in frameworks) wait for your Monday review. For a solo developer on a small project, this balance prioritizes safety without leaving security holes open.
