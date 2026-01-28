# Dependency Automation & Maintenance Strategy

## 1. Executive Summary

We have transitioned from a high-maintenance, manual dependency update process to an automated, "agent-based" workflow using **Renovate**.

Instead of reviewing dozens of individual Pull Requests weekly, we utilize a centralized **Dependency Dashboard** and automated grouping rules. This shift prioritizes developer velocity without sacrificing security or stability.

## 2. What We Implemented & Why

| Feature | Implementation | Reasoning |
| :---- | :---- | :---- |
| **The "Agent"** | **Renovate** (GitHub App) | Advanced grouping and "dashboard" features reduce alert fatigue. |
| **Noise Reduction** | **Grouped Updates** | Minor/patch updates are grouped into single PRs to minimize review overhead. |
| **Automation** | **Auto-Merge** | If the "Safe Group" passes CI (lint & build), it is automatically merged. |
| **Safety Net** | **Auto-Bisect** | If a group fails, Renovate automatically "un-groups" them to isolate the failing package. |
| **Scheduling** | **Continuous/Immediate** | Updates are processed as they are released to ensure the repo stays current (schedule constraints removed for initialization). |

## 3. The New Workflow (Maintenance Guide)

### A. Routine Operations

Most of the time, you will do nothing. The agent will run, group updates, run tests, and auto-merge them.

### B. The Dependency Dashboard

*   **Location:** Repository **Issues** tab.
*   **Title:** "Dependency Dashboard" (pinned).
*   **Purpose:** This is your control center. **Do not close this issue.**

**Handling "Pending" Updates:**
*   Major version upgrades (e.g., v4.0.0 → v5.0.0) are listed here.
*   **Action:** Click the checkbox next to the update to trigger the PR creation when you are ready to handle breaking changes.

**Handling Failures:**
*   If a "Weekly Group" PR fails CI, Renovate lists the failed package in the Dashboard.
*   **Action:** Click the checkbox to **"update individually"** the suspect package. Renovate will isolate it so you can debug it separately.

### C. Configuration (`renovate.json`)

To change behavior (e.g., ignore a package), edit `renovate.json` in the root directory.

**Example: Ignoring a specific package**

```json
{
  "packageRules": [
    {
      "matchPackageNames": ["react-native-breaking-lib"],
      "enabled": false
    }
  ]
}
```

## 4. Summary of Benefits

*   **Zero Noise:** You are no longer notified for every single patch.
*   **Zero Friction:** Safe updates happen automatically.
*   **High Control:** A dashboard manages the risky updates on your terms.