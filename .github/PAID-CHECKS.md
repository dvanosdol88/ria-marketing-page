# Paid checks - DAV-53

David approved the lighter policy on November 24, 2026.

- Batch the complete task locally, including its journal, before the final push.
- Routine checks cover changed math/code; do not repeatedly run passing checks.
- Full browser/full-site suites are manual release tools. Use the Actions page to request the relevant workflow once when a major release warrants it. SWW Calculator verification requires the release_checks input for browser jobs.
- Website wording approval stays automatic; unchanged complete snapshot evidence can be reused for exact matching site trees, trusted collector and runtime. Approval is always evaluated again. Never copy an approval from another proposal.
- Backend validation builds only affected backend directories. Production deployment still compiles/packages actual changed functions as needed; this is not a second validation suite.
- Workflow-only maintenance does not justify rerunning unchanged website/browser tests. Verify the saved workflows and selector logic instead.
- These changes do not remove tests or change budgets. They reduce when paid automation starts.
