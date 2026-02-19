# OpenClaw Automation Ideas for David's RIA

## Goal
Design your operation so you spend most of your time in Zoom meetings with clients, while OpenClaw handles repeatable prep, follow-up, and compliance operations around your stack:

- RightCapital (planning)
- Wealthbox (CRM/workflows)
- RIA Compliance (compliance tasks)

## 1) "Client Meeting Co-Pilot" workflow
Use OpenClaw to orchestrate all work before and after your Zoom meetings.

### Before the meeting (T-24h / T-1h)
- Pull latest household data from Wealthbox and summarize:
  - household members
  - active opportunities
  - recent notes/tasks
  - service requests
- Pull latest planning deltas from RightCapital:
  - projected retirement readiness changes
  - probability changes
  - any stale assumptions (income, spending, rates)
- Generate a **1-page meeting brief**:
  - what changed since last call
  - decisions needed today
  - recommended agenda (ranked by importance)

### During the meeting
- OpenClaw listens to the transcript source (Zoom recording/transcript export) and extracts:
  - decisions made
  - action items + owner + due date
  - compliance-relevant statements (recommendation, risk tolerance changes)

### After the meeting (T+10 min)
- Write a meeting summary into Wealthbox note template.
- Create Wealthbox tasks automatically for action items.
- Prepare compliance-ready summary for your records review process.
- Draft client follow-up email for your approval/send.

## 2) "Data Hygiene Sentinel" workflow
Use OpenClaw on a daily schedule to detect data drift and missing items.

- Compare key client fields across RightCapital and Wealthbox.
- Flag mismatches (DOB, income, account balances, goals).
- Identify missing annual review dates and IPS-related records.
- Post a daily "exceptions" digest so you only handle edge cases.

## 3) "Compliance Calendar + Evidence Pack" workflow
Automate recurring compliance work to reduce manual burden.

- Build a recurring control checklist in OpenClaw tied to RIA Compliance cycles.
- For each control period, auto-assemble an evidence packet:
  - advisory communications sampled
  - meeting notes with recommendation rationale
  - task completion logs
  - policy acknowledgment reminders
- Auto-create "needs human sign-off" queue for final approval.

## 4) "Onboarding Conveyor Belt" workflow
When a prospect becomes a client, OpenClaw launches a standard sequence.

- Trigger onboarding checklist in Wealthbox.
- Generate account-opening and planning data request checklist.
- Track document receipt and nudge reminders.
- Once minimum dataset is complete, OpenClaw creates:
  - first-plan prep packet in RightCapital
  - first-meeting agenda draft
  - compliance documentation placeholders

## 5) "Proactive Service Engine" workflow
Keep clients engaged without manually touching every account each month.

- Run monthly scans for major life/portfolio events:
  - large cash build-up
  - tax-loss harvesting windows (if relevant)
  - insurance gaps
  - retirement projection deterioration
- Generate prioritized outreach queue in Wealthbox.
- Draft personalized check-in messages for your approval.

## 6) "SOP Builder" workflow (great with your AI building skills)
Use OpenClaw as a procedure generator and operator for your firm.

- Capture your best manual process once (video + notes + checklist).
- Convert it into:
  - machine-readable SOP
  - automated steps
  - exception handling path
  - QA checklist
- Version-control SOPs and improve after each run.

## 7) "Weekly CEO Dashboard" workflow
Give yourself one weekly operations page so you stay in advisor mode.

Track:
- meetings held vs. target
- follow-ups completed within SLA
- outstanding compliance tasks
- onboarding pipeline stage times
- AUM/household service load indicators

OpenClaw can compile this every Friday and send a concise digest.

## Practical implementation roadmap (first 30 days)

### Week 1: Foundation
- Define your canonical client record (which system is source-of-truth per field).
- Set naming conventions for households, tasks, tags, and meeting notes.
- Create a secure secrets strategy on Ubuntu (vault/env management).

### Week 2: Highest-ROI automation
- Implement Meeting Co-Pilot (summary + tasks + follow-up drafts).
- Start with one note template and one task format.
- Add human-approval gate before writes to systems.

### Week 3: Compliance and onboarding
- Implement Compliance Calendar evidence collection.
- Implement Onboarding Conveyor triggers and reminders.

### Week 4: Scale and harden
- Add monitoring, retries, and failure notifications.
- Add audit logs for every action OpenClaw takes.
- Measure hours saved and tune prompts/rules.

## Guardrails to require from day one
- **Human-in-the-loop** for all client-facing communications and any portfolio recommendation.
- **Write permissions** limited by role and workflow stage.
- **Full audit trail** of data read/written and prompts used.
- **PII protection**: encrypted secrets, least privilege, and strict retention.
- **Exception routing**: all uncertain outputs become tasks for your review.

## Suggested starter automations (in order)
1. Meeting summary + Wealthbox task creation
2. RightCapital assumption drift alert
3. Compliance evidence packet assembler
4. Onboarding checklist + reminder sequence
5. Weekly CEO dashboard digest

## Backlog suggestion
Add a backlog item in `docs/backlog.md` for: "Design canonical data map and source-of-truth rules across RightCapital, Wealthbox, and compliance records before enabling write automations." This prevents fragile automations caused by conflicting client records.
