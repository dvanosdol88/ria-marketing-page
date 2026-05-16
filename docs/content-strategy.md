# Two-Site Content Strategy: smarterwaywealth.com + youarepayingtoomuch.com

This document defines how content is split between the two sites, what each
page should say, and the editorial and compliance guardrails to apply. It is
intended for use by a copywriter, designer, or developer working on either
repo.

## 1. Current-state summary

### youarepayingtoomuch.com (repo: ria-marketing-page)

**What it's doing now**
- Home is the fee-drag calculator (`CostAnalysisCalculator`) with multiple
  experience modes: `marketing`, `calculator-first`,
  `savings-calculator-upgrade`, plus banner and variant configs for A/B
  testing.
- Existing routes: `/faq`, `/how-it-works` (+ `/how-it-works/substitution`),
  `/our-math`, `/save`, `/save-a-ton`, `/gallery`, `/mobile-calculator`,
  `/improve-your-tools`, `/meaning`, `/upgrade-your-advice`, `/experiment`,
  `/privacy`.
- AGENTS / SEO disciplined: agent-readiness rules, JSON-LD, sitemap,
  llms.txt expectations.
- Tone: urgent, math-forward, problem-stated.

**Gaps and overlap**
- Several routes look like overlapping variants of the same "what to do
  about it" idea (`/save`, `/save-a-ton`, `/upgrade-your-advice`,
  `/improve-your-tools`, `/meaning`). Decide which one is canonical;
  redirect the others.
- FAQ exists but is short. It should absorb calculator-specific objections
  (limitations, assumptions, "is this trustworthy?") rather than full firm
  trust content.
- "How it works" today lives on the calculator site. Strategy: keep a
  stripped-down version here ("how the calculator works"), move the full
  "how the advisory engagement works" to smarterwaywealth.com.
- No explicit founder teaser linking out to Smarter Way Wealth from above
  the fold.
- Compliance footer references Smarter Way Wealth, LLC. Confirm it is
  consistent with the firm site.

### smarterwaywealth.com (repo: smarter-way-wealth)

**What it's doing now**
- Single home page: hero "Upgrade the advice, not the fee," three pillars
  (Serious planning, Better tools, Flat monthly fee), proof chips
  (20 yrs, CFA, CFP), `$100/mo` sidebar, two CTAs (Compare my fee → off-site
  calculator; Verify the firm → IAPD CRD #342140).
- Site is pre-launch: `noindex, nofollow`.
- No `/about`, no `/how-it-works`, no `/faq`, no `/services`, no `/start`,
  no `/disclosures`.
- Only `/privacy` exists besides home.

**Gaps**
- Founder story / About Me page is missing. This is the biggest hole and
  the trust hub.
- No How It Works. "What happens when I sign up" is unanswered.
- No FAQ. Fee model, fiduciary status, AI use, data privacy, robo vs.
  traditional comparisons all have nowhere to live.
- No "Our Model" page. The "how we keep costs low" explanation has no home.
- No service description. What is included for the $100/month, what is not.
- No formal disclosures page linking ADV Part 2A/2B, Form CRS, privacy.
- Hero CTA "Compare my fee" sends users away before any trust has been
  established. Fine as a secondary CTA. The primary CTA should keep them
  on-site (e.g., "See how it works" or "Start a no-cost intro call").

## 2. Recommended two-site architecture

### Role of each domain

| Domain | Job | Audience moment | Primary metric |
| --- | --- | --- | --- |
| youarepayingtoomuch.com | Wake-up + lead-gen. Show the cost of asset-based fees. Convert mild curiosity into a click toward Smarter Way Wealth. | "I just saw a QR code / heard radio / saw a post and I'm skeptical." | Calculator completions, then click-through to smarterwaywealth.com or intro form. |
| smarterwaywealth.com | Trust hub + conversion. Explain who David is, how the firm works, what you get, and what it costs. Close the relationship. | "OK, I'm interested. Who is this person? Is this real? What happens if I sign up?" | Intro-call bookings / qualified contact form submissions. |

Treat them as a two-step funnel, not two competing sites.
youarepayingtoomuch.com almost never explains the firm in depth.
smarterwaywealth.com almost never tries to "shock" the visitor about fees.

### youarepayingtoomuch.com — section map

```
/  (home)
  - Top banner (optional A/B): "Your advisor's % fee adds up. Run the math →"
  - H1 + 1-line subhead
  - Calculator (the hero is the tool)
  - "What this is telling you" — 2–3 sentence interpretation block
  - Mini trust strip: "Built by David J. Van Osdol, CFA, CFP. 20 years in
    the industry." + link to smarterwaywealth.com/about
  - CTA: "Talk to David at Smarter Way Wealth →" (opens smarterwaywealth.com)
  - Calculator assumptions / disclosures (collapsed)

/our-math       canonical "explain the math" page — already exists, keep
/how-it-works   rename/scope: how the CALCULATOR works, not the advisory
                engagement; the advisory engagement lives on the firm site
/faq            calculator-scoped FAQs only; link out to firm FAQ for
                service questions
/privacy
/disclosures    light: who runs this site, link to smarterwaywealth.com
                firm disclosures, no marketing claims
```

**Consolidate / redirect.** Pick one of `/save`, `/save-a-ton`,
`/upgrade-your-advice`, `/improve-your-tools`, `/meaning` as the canonical
post-calculator "what now" page (recommend `/upgrade-your-advice`). 301 the
others to it. Keep `/experiment` and `/gallery` out of the sitemap.

### smarterwaywealth.com — section map

```
/  (home)
  - Hero (existing concept is good; rework primary CTA — see §8)
  - "What we do" (one-line) → links to /services
  - "How we keep the fee flat" snippet → links to /how-it-works
  - Founder snapshot → links to /about
  - Trust strip: CT-registered RIA, CRD #342140, CFA, CFP, link to IAPD
  - Secondary CTA: "Run the fee-drag calculator" → youarepayingtoomuch.com

/about              Founder story (David). Full version of "why I built this."
/services           What you get for $100/month. What's included. What's not.
/how-it-works       The advisory engagement: intake → plan → ongoing review.
                    Includes "how we keep costs low."
/our-model          (optional split-off) Deep explanation of virtual-first +
                    lean + AI-assisted + flat fee. Could live as a section of
                    /how-it-works instead.
/faq                Firm/service/AI/privacy questions (the long FAQ).
/start              Intake / scheduling page. The conversion endpoint.
/disclosures        Form ADV 2A/2B, Form CRS, privacy policy, CRD link,
                    compliance footer reference.
/privacy
/legal              (if needed separately)
```

## 3. Messaging hierarchy

| Layer | Calculator site (youarepayingtoomuch.com) | Firm site (smarterwaywealth.com) |
| --- | --- | --- |
| Primary message | "An asset-based advisory fee compounds against you. See your number." | "Credentialed fiduciary planning, on a flat monthly fee — built by David J. Van Osdol, CFA, CFP." |
| Secondary message | "It doesn't have to be this way. There's a flat-fee firm built around this problem." | "Lower overhead, modern tools, and AI-assisted workflows let serious advice cost less." |
| Proof points | Math is transparent → linked `/our-math` page. Calculator state is in the URL (anyone can audit). Built by a CFA/CFP. | CFA charterholder; CFP practitioner; ~20 years in the industry (Smith Barney → Morgan Stanley, then Fidelity); Connecticut-registered RIA (CRD #342140) — link to IAPD; ADV Part 2A and Form CRS published. |
| Calls to action | Primary: "Run the calculator." Secondary: "Talk to David →" (off-site to smarterwaywealth.com). | Primary: "Start an intro call." Secondary: "See how it works." Tertiary: "Run the fee-drag calculator" (off-site to youarepayingtoomuch.com). |
| Compliance/disclosure reminders | Calculator assumptions, no performance projection, no guarantee, all inputs are user-supplied. Firm reference + IAPD link in footer. | Credentials don't guarantee skill or outcomes. No testimonials. No performance claims. Mission framing only on fee savings. Link Form ADV 2A, 2B, Form CRS. |

## 4. Founder story placement

Treat the founder story as a layered asset. The same source content
appears in shrinking depths across the surface area.

| Surface | Depth | What appears | Rationale |
| --- | --- | --- | --- |
| youarepayingtoomuch.com — homepage micro-strip | One line | "Built by David J. Van Osdol, CFA, CFP — 20 years in the industry. About David →" | The calculator is the hero; founder credibility is a footnote that earns the click out. Anything longer competes with the math. |
| youarepayingtoomuch.com — FAQ entry "Who built this?" | 2–3 sentences | Credentials + experience + link to firm About page. | Lets a curious user verify the source without leaving the calculator flow. |
| smarterwaywealth.com — homepage hero/sub-hero | 1–2 sentences | "David J. Van Osdol, CFA, CFP built Smarter Way Wealth for investors who want serious planning, better tools, and a flat monthly fee." | The visitor is now in trust-building mode; introduce the human immediately. |
| smarterwaywealth.com — homepage "Founder snapshot" block | ~80–120 words | Concise "Why I built this" (see §5). | Gives the homepage emotional pull and a reason to click into About. |
| smarterwaywealth.com — /about | Full version | Career arc, credentials, why now, why technology, the mission framing, a clear photo, link to IAPD. | This is the trust hub. Treat it as the most important page on the firm site. |
| smarterwaywealth.com — /how-it-works | Process voice | "Here's what we do together" — David shows up as the person delivering each step. | Reassures the prospect that a credentialed human is in the loop, not an algorithm. |
| smarterwaywealth.com — /faq | Q&A voice | Short answers to "Are you a real advisor?", "Who reviews my plan?", "Are credentials enough?" — point to /about. | Catches prospects who skim. |
| Both sites — footer / trust strip | One sentence | "Smarter Way Wealth, LLC — Connecticut-registered investment adviser. CRD #342140. Verify on IAPD →" | Regulator-friendly. Same wording on both sites. |

## 5. "Why I built this" copy

Both versions follow the same editorial guardrails: critique the legacy
pricing model, not advisors as people; describe AI as leverage, not a magic
wand; never imply better performance.

### Concise version (~130 words) — for the firm homepage "Founder snapshot" block

> I spent nearly ten years at Smith Barney, later Morgan Stanley, working
> closely with families and high-net-worth investors, and then five years
> at Fidelity delivering advice at scale. I learned what serious planning
> looks like — and I also saw how much an asset-based fee can quietly cost
> a client over a working lifetime.
>
> I started Smarter Way Wealth because the tools finally caught up to the
> idea. Modern planning software, virtual meetings, and AI-assisted
> workflows let one credentialed advisor cover the administrative weight
> that used to require a back office. The advisor still does the thinking;
> the technology takes the drudgery.
>
> The point isn't cheaper advice. It's keeping more of the advice — and
> more of your wealth — for you.
>
> — David J. Van Osdol, CFA, CFP

### Fuller version (~340 words) — for /about

> When I was a kid, I had ideas but very little leverage. That's part of
> why technology has always interested me — it's the closest thing most
> people get to leverage that doesn't require capital or permission.
>
> My career started inside the industry that needed that leverage most. I
> spent nearly a decade at Smith Barney — which became Morgan Stanley —
> sitting across from families and high-net-worth investors, walking
> through retirement timing, taxes, cash flow, risk, and the tradeoffs
> that don't have one right answer. Later I spent about five years at
> Fidelity, where I learned what it looks like to deliver advice at scale
> to a much wider audience.
>
> Two things stuck with me.
>
> The first is that good planning isn't complicated to describe. It's a
> careful set of decisions — about when to retire, how to draw down, what
> to keep liquid, how much risk you can actually live with. The work is in
> the judgment, not the jargon.
>
> The second is that the legacy pricing model — an annual percentage of
> every dollar you've saved — quietly compounds against the client. It
> often has very little to do with the amount of advice you actually use
> that year. For investors with meaningful balances, it can become one of
> the largest line items in their financial life.
>
> Smarter Way Wealth is my attempt to combine the things I care about:
> the CFA and CFP work I've spent two decades on, a fiduciary standard,
> modern planning software, virtual meetings, a lean back office, and
> AI-assisted workflows for the repeatable parts of the job. The
> technology doesn't replace the advisor — it carries the administrative
> weight so the advisor's time can stay on judgment, planning, and
> tradeoffs.
>
> The mission is straightforward: help investors keep more of their wealth
> instead of losing large amounts to percentage-based advisory fees.
> Credentials and registration don't guarantee outcomes, and no one can.
> But a flat fee, a clear process, and serious planning are within our
> control. That's what we offer.

## 6. "How we keep costs low" explanation

Use the same source block at three depths.

### Short (homepage tile or FAQ answer, ~70 words)

> Smarter Way Wealth runs on a deliberately lean model: virtual meetings,
> no expensive office footprint, modern planning software, and AI-assisted
> workflows that handle the repeatable administrative work behind the
> scenes. A credentialed human — David — still owns the planning, the
> judgment, and the recommendations. The savings come from cutting
> overhead and drudgery, not from cutting advice.

### Medium (How It Works section, ~180 words)

> A traditional 1% advisory fee is built on top of a traditional cost
> structure: physical offices, large support staff, and a business model
> that grows revenue automatically as account balances grow. Smarter Way
> Wealth is built differently.
>
> - **Virtual-first meetings.** Planning conversations happen on video, by
>   phone, or by secure message — wherever the client prefers. No required
>   office visits.
> - **Lean real estate footprint.** We don't pass commercial-lease costs
>   through to clients.
> - **Modern planning software.** The same caliber of planning tools used
>   by larger firms.
> - **AI-assisted workflows.** AI helps with the repeatable parts of the
>   job — preparing meeting summaries, drafting routine correspondence,
>   organizing documents, pulling research, and surfacing planning items
>   for review. It does not make investment decisions, and it does not
>   replace fiduciary judgment.
> - **Human review.** Every plan, every recommendation, and every client
>   communication is reviewed and owned by David, a CFA charterholder and
>   CFP practitioner.
> - **Flat monthly fee.** Pricing stays the same whether your portfolio is
>   up or down for the quarter.

### Long (Our Model / About, ~350 words)

Use the medium block above, then add:

> **Why this is possible now and not ten years ago.** Three things
> changed: planning software stopped being the exclusive property of big
> firms; secure video meetings became standard; and AI tools became
> genuinely useful for the administrative work that used to fill an
> advisor's calendar. Each of those, on its own, only chips away at cost.
> Together they make a lean firm viable.
>
> **What AI does, in plain English.** AI helps draft, summarize, organize,
> and surface — the same way a good junior team member would. It can
> prepare a first draft of a meeting summary, organize a stack of
> statements, flag a tax-loss-harvesting candidate for human review, or
> write a routine follow-up email. It does not select investments for
> clients, manage risk, or replace a fiduciary's judgment. Final decisions
> and final words come from a credentialed human.
>
> **What you should expect from the flat fee.** $100 per month is a
> planning-and-advice fee. It is not a brokerage commission, and it is not
> an asset-based advisory fee that grows with your balance. Specific
> services included and excluded are described in Form ADV Part 2A and in
> your client agreement.

Compliance note for the page footer:

> Use of AI tools is in support of, not in place of, advice delivered by a
> credentialed fiduciary. Smarter Way Wealth retains responsibility for
> every client recommendation.

## 7. FAQ strategy

### Split rule

- **Calculator FAQ (youarepayingtoomuch.com/faq)** — anything that defends
  or explains the calculator itself, or the fee-drag concept. Short. End
  every answer with a link to the firm site for service questions.
- **Firm FAQ (smarterwaywealth.com/faq)** — everything about David, the
  firm, the advisory engagement, what $100/month includes, AI, privacy,
  custody, suitability.

### Calculator site — keep these 4

1. **What is this calculator actually showing me?**
   It estimates how much an annual percentage-of-assets advisory fee can
   compound over time, using inputs you provide. It is an illustration,
   not a projection of returns, and not personalized financial advice.

2. **What are the calculator's limitations?**
   It uses simplified assumptions: a single growth rate, a single fee
   rate, and a single time horizon. Real portfolios have variable returns,
   taxes, contributions, and withdrawals. The result is meant to make a
   structural point about percentage fees, not to forecast your account.

3. **Who built this?**
   David J. Van Osdol, CFA, CFP, founder of Smarter Way Wealth, LLC. More
   about David →

4. **What do I do with this number?**
   If the lifetime cost looks larger than you expected, that's the point.
   The next step is to look at firms that don't charge an asset-based fee.
   Smarter Way Wealth is one of them.

### Firm site — long FAQ

5. **How can this cost $100 per month?**
   Smarter Way Wealth was built lean on purpose: virtual meetings, no
   expensive office, modern planning software, and AI-assisted workflows
   for repeatable administrative work. A credentialed human still owns
   every recommendation. We pass the cost savings through as a flat
   monthly fee rather than a percentage of your assets.

6. **Are you a real fiduciary advisor?**
   Yes. Smarter Way Wealth, LLC is a Connecticut-registered investment
   adviser, CRD #342140. You can verify the firm on the SEC's Investment
   Adviser Public Disclosure site. As an investment adviser, we act as a
   fiduciary to our clients.

7. **What credentials does David hold?**
   David is a CFA charterholder and a CFP practitioner. Credentials
   describe training and ongoing standards; they do not guarantee
   investment results or specific client outcomes.

8. **Do I have to move my accounts?**
   Not necessarily. Many clients keep their existing custodian. We'll
   discuss what makes sense for your situation during the intake
   conversation.

9. **What exactly do I get for the monthly fee?**
   Planning and advice: retirement and cash-flow planning, portfolio
   review, tax-aware planning input, risk and insurance review, and
   ongoing access for questions and check-ins. The specifics are described
   in Form ADV Part 2A and in your client agreement.

10. **What is NOT included?**
    Tax preparation and legal documents are not included; we coordinate
    with your CPA and attorney. We do not sell insurance products,
    annuities, or proprietary funds. We do not earn commissions.

11. **What does the AI do — and what does it not do?**
    AI helps with the repeatable, administrative parts of the job:
    summarizing meetings, organizing documents, drafting routine
    correspondence, surfacing items for review, and pulling research. AI
    does not select your investments, manage risk, or replace fiduciary
    judgment. David reviews and owns every client recommendation.

12. **Is my data private?**
    Yes. We follow industry-standard practices for data security, and our
    privacy policy describes what we collect, how it's used, and how it's
    protected. We do not sell client data.

13. **How is this different from a robo-advisor?**
    A robo-advisor is an algorithm that allocates and rebalances a
    portfolio with limited human involvement. Smarter Way Wealth is the
    opposite: a credentialed human handles planning and recommendations,
    and technology handles administrative drudgery. Pricing is flat, not
    assets-based.

14. **How is this different from a traditional 1% advisor?**
    The advice and the standard of care are similar in spirit —
    credentialed, fiduciary planning. The pricing model is different. A
    1% fee grows automatically as your balance grows; a flat fee does
    not. Specific services vary by firm and are spelled out in each
    firm's Form ADV.

15. **What if I already have an advisor I like?**
    Keep them, or get a second opinion. The fee-drag calculator is a free
    way to see what the current arrangement is likely to cost over time.
    If a conversation is useful from there, we're happy to have one.

16. **Who is a good fit for this model?**
    People who want serious planning without an asset-based fee, are
    comfortable meeting virtually, and want one credentialed point of
    contact. We're a smaller firm by design; we're not a fit for clients
    who need a large in-person team or specialized institutional services.

Optional 17–20: "Can my spouse be in the meetings?", "How often do we
meet?", "What happens if my situation gets more complex?", "How do I
cancel?" — same plain-English voice.

## 8. Specific page recommendations

### youarepayingtoomuch.com — homepage

| Element | Copy |
| --- | --- |
| Top banner (optional) | "Most investors don't see the lifetime cost of a percentage-based fee until it's behind them." |
| H1 | "You might be paying too much for advice." |
| Subheadline | "Run the math on what an asset-based fee can compound to over a working lifetime. Built by a CFA, CFP." |
| Trust strip (under calc) | "Built by David J. Van Osdol, CFA, CFP. Smarter Way Wealth, LLC — Connecticut-registered investment adviser. CRD #342140." |
| Section order | 1. Hero H1 + sub. 2. Calculator. 3. "What this is telling you" (2–3 sentences). 4. "There's a different way" panel → CTA to smarterwaywealth.com. 5. Calculator assumptions / disclosures (collapsed). 6. Footer with firm registration. |
| Primary CTA | "See your number" (scroll to calculator) or "Run the calculator" |
| Secondary CTA | "Talk to David at Smarter Way Wealth →" (off-site) |
| FAQ topics here | Q1–Q4 above only. |
| Disclosures | "Illustration only. Not a projection of returns. Not personalized financial advice. Inputs are user-supplied. Assumptions are described on /our-math." |

### smarterwaywealth.com — homepage

| Element | Copy |
| --- | --- |
| H1 (keep) | "Upgrade the advice, not the fee." |
| Subheadline (lightly revise) | "Credentialed, fiduciary planning on a flat $100/month — built by David J. Van Osdol, CFA, CFP." |
| Trust strip | CFA · CFP · 20 years in the industry · CT-registered RIA · CRD #342140 (link to IAPD) |
| Section order | 1. Hero. 2. "What changes" pillars (keep existing three). 3. Founder snapshot (concise version from §5) → "Read David's story →" to /about. 4. "How we keep the fee flat" snippet → /how-it-works. 5. "What you get for $100/month" → /services. 6. CTA band: "Start an intro call" (primary on-site) + "Run the fee-drag calculator" (secondary off-site). 7. Compliance footer. |
| Primary CTA | Change the current primary CTA. Replace "Compare my fee" (which sends visitors off-site) with **"Start an intro call"** going to /start. Keep "Run the fee-drag calculator" as a secondary CTA. |
| Secondary CTA | "Verify the firm" → IAPD. Keep this. |
| FAQ topics here | Q5–Q16. |
| Disclosures | "Smarter Way Wealth, LLC is a Connecticut-registered investment adviser. CRD #342140. Registration does not imply a certain level of skill or training. Verify the firm on the SEC's IAPD site." |

### smarterwaywealth.com — /about

| Element | Copy |
| --- | --- |
| H1 | "About David." |
| Subheadline | "Two decades inside the advisory industry. One firm built to fix the part that bothered him most." |
| Sections | 1. Career arc (Smith Barney → Morgan Stanley → Fidelity → founding Smarter Way Wealth). 2. Credentials (CFA, CFP) with the standard disclosure that designations don't guarantee outcomes. 3. Why this firm, why now (fuller "Why I built this" — §5). 4. How David works with clients. 5. Outside-of-work paragraph (one short, human paragraph). 6. Verification block: CT-registered RIA, CRD #342140, link to IAPD and to Form ADV. |
| CTA | "Start an intro call" |

### smarterwaywealth.com — /how-it-works

| Element | Copy |
| --- | --- |
| H1 | "How it works." |
| Subheadline | "From the first call through the first year — what we'll actually do together." |
| Sections | 1. Intro call (no cost, no commitment). 2. Discovery and intake. 3. Plan build. 4. Implementation. 5. Ongoing review. 6. "How we keep the fee flat" (medium block from §6). 7. What we coordinate with (CPA, attorney). 8. What we don't do. |
| CTA | "Start an intro call" |

### smarterwaywealth.com — /services

| Element | Copy |
| --- | --- |
| H1 | "What's included for $100 a month." |
| Sections | 1. What's included (clear bulleted list). 2. What's not included. 3. How the fee is billed. 4. How to cancel. 5. Link to Form ADV Part 2A. |
| CTA | "Start an intro call" |

### smarterwaywealth.com — /start

| Element | Copy |
| --- | --- |
| H1 | "Let's schedule an intro call." |
| Subheadline | "No cost. No commitment. Bring a question, a statement, or just curiosity." |
| Form fields | Name, email, phone (optional), one short question. |
| Disclosure | "Submitting this form does not create an advisory relationship." |

## 9. Editorial guardrails

### Words/claims to avoid → safer alternatives

| Avoid | Why | Safer alternative |
| --- | --- | --- |
| "Guaranteed savings" / "you'll save $X" | Guarantee + projection. | "Potential fee savings based on the calculator's assumptions" / "illustrative, not a projection" |
| "Same great advice" | Implies parity of service. | "Credentialed fiduciary planning without an asset-based advisory fee" |
| "AI manages your money" / "AI-driven portfolio" | Misrepresents the role of AI; invites scrutiny. | "AI helps with administrative work so a credentialed advisor's time stays on judgment and planning" |
| "Billions back in investors' pockets" | Unverifiable, performance-adjacent. | "Our mission is to help investors keep more of their wealth instead of losing meaningful amounts to percentage-based advisory fees over a lifetime" |
| "Top advisor" / "award-winning" / "trusted by thousands" | Testimonial-adjacent, ranking-adjacent. | Omit. State credentials and registration; let those speak. |
| "Fiduciary-grade" / "we always put clients first" as a slogan | Empty without context. | "Smarter Way Wealth is a registered investment adviser and acts as a fiduciary to its clients." |
| "CFA / CFP means better results" | Designations don't guarantee outcomes. | "Holding the CFA and CFP marks reflects training and ongoing standards; they do not guarantee investment performance or specific outcomes." |
| "Better than your current advisor" | Comparative + disparaging. | "A different pricing model. The right fit depends on what you need." |
| "Beat the market" / "outperform" / past performance examples | Performance claims. | Omit. Talk about planning, process, and pricing. |
| "Set it and forget it" | Implies passive auto-advice. | "Reviewed regularly, with a human in the loop." |
| "Disrupting the industry" / "next-gen RIA" / fintech buzzwords | Generic AI-fintech tone. | Plain English. State what changed and why it's possible now. |

### "Always include" reflexes

- After every credentials reference: "do not guarantee skill or outcomes."
- After every fee-savings reference: tie it to the calculator's
  assumptions or to mission framing, not a promise.
- After every AI reference on a service page: a one-sentence "human review
  and judgment" sentence.
- Footer on every page of the firm site: legal name, state of
  registration, CRD #, IAPD link, "Registration does not imply a certain
  level of skill or training."

## 10. Final recommendation

Put it where it belongs and stop hedging.

1. **youarepayingtoomuch.com is a single-purpose calculator + lead-gen
   site.** Keep it lean. Calculator as hero, `/our-math` and a short FAQ
   as supporting pages, one canonical "now what?" page (recommend
   `/upgrade-your-advice`) and redirect the duplicates. The only founder
   content on this site is a one-line trust strip and one FAQ entry that
   links to the firm About page. Nothing else about David belongs here.

2. **smarterwaywealth.com is the trust hub and the conversion engine.**
   Build out the missing pages in this order: `/about` → `/how-it-works`
   → `/services` → `/faq` → `/start` → `/disclosures`. Replace the
   homepage's primary CTA so it keeps users on-site (`/start`) and demote
   "Run the calculator" to a secondary CTA off-site. Drop `noindex` only
   after `/about`, `/how-it-works`, and `/services` exist with real
   content and disclosures.

3. **The "how we keep costs low" explanation appears three times at three
   depths:** a 70-word block on the homepage, a 180-word block inside
   `/how-it-works`, and a 350-word block on `/about` (or a dedicated
   `/our-model` page). One source, three depths — easier to keep
   consistent.

4. **The founder story is layered the same way:** a one-line trust strip
   on the calculator site, a 130-word snapshot on the firm homepage, a
   full version on `/about`. Don't write it four different ways; write it
   once and shrink it.

5. **Compliance posture:** assume a regulator will read both sites end to
   end. No testimonials, no performance claims, no awards, no AUM, no
   "billions back." Mission framing only. CFA/CFP carry a credentials
   disclaimer wherever they appear. CRD #342140 + IAPD link in every
   footer.

6. **Tone:** The critique is of an industry pricing model, not of
   advisors. The optimism is about technology as leverage, not about AI
   as a miracle. The founder is a credentialed human who wanted to
   combine planning and technology — that's the whole story; resist
   embellishing it.
