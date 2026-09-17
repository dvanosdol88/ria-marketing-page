# The 1% Test — Ad Copy Pack

**Companion to:** 2026-09_paid-ads-test-plan.md · **Prepared:** August 19, 2026
**Voice applied:** the site's own — plain-spoken, numbers-forward, zero jargon, short declaratives ("$100/month. Period."). Every variant pre-checked against the CT rules and Meta's personal-attributes policy (notes inline).

**Landing URL scheme** (the homepage's default calculator state already shows the $788,306 scenario, so every ad lands on math that matches its claim):

```
https://youarepayingtoomuch.com/?utm_source=SOURCE&utm_medium=MEDIUM&utm_campaign=fee_test_2026&utm_content=VARIANT
```

---

## 1. Meta — Facebook + Instagram (CT towns, special ad category: Financial products and services)

Campaign: Traffic (landing-page views) · "CT cold" ad set at $15/day · Advantage+ placements · 18+ (locked by category) · CT town list (each selection carries a ~15-mile radius — that's a platform rule, and it helpfully blankets Greater Hartford). A second "warm" retargeting ad set joins Oct 1 (§3).

> **Why the copy is shaped this way:** Meta auto-flags ads that assert things about a person's finances ("You are overpaying" reads like their own violating example "Are you bankrupt?"). So Meta copy asks questions, states facts about *fees*, or talks price — it never diagnoses the reader. If an ad still gets a false-positive rejection: appeal it unchanged once; if rejected twice, run variant C in its slot.

### Ad A — "The number" · `utm_content=788k_v1`

**Primary text:**
> What would you do with an extra $788,306?*
>
> That's the potential 20-year difference between paying a 1% asset-based fee and paying a flat $100/month for advice. Run your own numbers in about 2 minutes — every assumption is adjustable, and the math is public.
>
> *Hypothetical illustration: $1M portfolio, 20 years, 8% annual growth, 1% asset-based fee vs. $100/month flat. Not a guarantee; your results depend on your inputs.

**Headline:** See what 1% really costs
**Description:** Flat-fee fiduciary advice. CT-registered.
**CTA button:** Learn More
**Landing URL:** `https://youarepayingtoomuch.com/?utm_source=meta&utm_medium=paid_social&utm_campaign=fee_test_2026&utm_content=788k_v1`
**Compliance check:** assumptions + "hypothetical" + "not a guarantee" in the ad itself ✓ · no personal-attribute assertion ✓ · no testimonial ✓

### Ad B — "The 1% blues" · `utm_content=blues_v1`

**Primary text:**
> Got the 1% blues?
>
> An asset-based fee compounds year after year — and it's usually invisible on your statement. A flat $100/month doesn't compound against a portfolio. The free calculator shows the difference on your numbers, your timeline, your assumptions. No email required.

**Headline:** Got the 1% blues?
**Description:** The math takes 2 minutes.
**CTA button:** Learn More
**Landing URL:** `...utm_content=blues_v1` (same scheme)
**Compliance check:** question form, no assertion about the reader ✓ · "free" is accurate — the calculator is ungated ✓ · no projected figure, so no assumptions footnote needed ✓

### Ad C — "The price" (safest; also the rejection fallback) · `utm_content=flat100_v1`

**Primary text:**
> Real human fiduciary advice. CFA charterholder + CFP. $100 a month. Period.
>
> No percentage of your portfolio, and no need to transfer your accounts to another firm. Curious what a flat fee changes over 20 years? The calculator is free and takes about 2 minutes.

**Headline:** $100/month. Period.
**Description:** Smarter Way Wealth · CT-registered RIA
**CTA button:** Learn More
**Landing URL:** `...utm_content=flat100_v1`
**Compliance check:** pure price/credential statement — the lowest-risk financial ad copy that exists ✓

### Ad D (optional, Checkpoint-1 refresh) — "Postcard echo" · `utm_content=postcard_v1`

**Primary text:**
> If our postcard landed in your mailbox recently — this is the calculator behind it.
>
> See what an asset-based fee could add up to over 20 years, and what a flat $100/month leaves compounding for you. Every assumption is yours to adjust.

**Headline:** Got the postcard? Run the math.
**CTA button:** Learn More
**Landing URL:** `...utm_content=postcard_v1`
**Note:** run only in the ad set covering EDDM mailer towns; this is the mailer-compounding play.

### Image specs (3 cards, week 0)

1080×1080 (feed) + 1080×1920 (stories, same art), text-forward on brand navy `#064B84`, white type, logo small bottom-right:
- **Card A:** "$788,306*" huge; beneath, small: "potential 20-yr difference · 1% fee vs $100/mo flat"; assumptions footnote line at bottom in legible small type (12px-equivalent minimum — it must be readable, that's the point).
- **Card B:** "Got the 1% blues?" as the whole card.
- **Card C:** "$100/month. Period." with "fiduciary advice · CFA + CFP" beneath.

---

## 2. Reddit — national, community targeting (promoted posts, comments ON)

Ad group targeting: r/Bogleheads, r/personalfinance, r/financialindependence, r/investing, r/FinancialPlanning, r/fatFIRE, r/ChubbyFIRE, r/retirement (confirm each is selectable in-platform — community targeting reaches *people who frequent these subs*, wherever they browse). Geo: United States. Objective: Traffic.

> **Why the copy is shaped this way:** Reddit punishes ad-speak and rewards a person talking. These read like posts, not ads: first-person, credentials stated plainly, methodology offered up for critique, disclosures in the body. David should check comments ~15 min/week and answer like a human — that thread activity is where the real conversion happens.

### Post A — "The builder" · `utm_content=reddit_calc_v1`

**Title (≤300 chars):**
> I'm a flat-fee ($100/mo) CFA/CFP adviser. I built a free calculator showing what a 1% AUM fee compounds to over 20 years — no email gate, every assumption adjustable.

**Body:**
> Default scenario: $1M portfolio, 20 years, 8% growth. A 1% asset-based fee vs. a flat $100/month comes out to a **$788,306 difference in ending value** — hypothetical, obviously; change any input and it recalculates on your numbers. The methodology is public on the site (/our-math).
>
> I'm David Van Osdol, Smarter Way Wealth LLC, a Connecticut-registered investment adviser (CRD 342140). Happy to answer fee-structure questions in the comments either way. Not investment advice — just arithmetic.

**Landing URL:** `https://youarepayingtoomuch.com/?utm_source=reddit&utm_medium=paid_social&utm_campaign=fee_test_2026&utm_content=reddit_calc_v1`

### Post B — "The math" · `utm_content=reddit_math_v1`

**Title:**
> "1% doesn't sound like much" — but on $1M at 8% growth, a 1% AUM fee works out to a ~$788K difference over 20 years vs. flat-fee advice. Free calculator, all assumptions adjustable.

**Body:**
> The gap isn't just the fees you pay — it's the compounding those fees never do for you. Hypothetical defaults: $1M / 20 yrs / 8% / 1% vs $100/mo flat = $788,306. Skeptical? Good — the point of the tool is to change the assumptions and see what happens. Methodology is public.
>
> Posted by Smarter Way Wealth LLC, CT-registered investment adviser. Not a projection of any actual account; results vary with inputs.

**Landing URL:** `...utm_content=reddit_math_v1`

### Post C — "The Bogleheads play" · `utm_content=reddit_diy_v1`

**Title:**
> Advice-only and flat-fee advisers get recommended here a lot. I'm one — and I made a calculator comparing AUM vs. flat fees. Kick the tires; tell me what assumption I got wrong.

**Body:**
> $100/month flat, CFA + CFP, no custody of client funds, no asset transfer required. The calculator is ungated and shows its work. If you're happily DIY, the tool is still a decent answer for the "is my parents' 1% guy actually expensive?" conversation.
>
> Smarter Way Wealth LLC, Connecticut-registered investment adviser. Hypothetical illustrations, not a guarantee.

**Landing URL:** `...utm_content=reddit_diy_v1`

**Reddit compliance checks (all three):** licensed-entity identity stated in body ✓ · no guaranteed returns ✓ · projected figure travels with assumptions ✓ · no testimonials ✓ · comments monitored weekly ✓

---

## 3. Meta retargeting — the "warm" ad set (turns on Oct 1, $5/day)

Audience: website custom audience — all visitors, last 90 days (explicitly allowed under Meta's financial-services category; this includes your EDDM QR scanners). These people already ran the numbers once; the job now is the 15-minute conversation.

### Ad R — "The next step" · `utm_content=retarget_v1`

**Primary text:**
> Already run the numbers? The next step takes 15 minutes.
>
> Meet David on Zoom — nothing to prepare, and nobody will try to sell you anything. Real human fiduciary advice, CFA + CFP, for a flat $100 a month. No asset transfer required, and nothing begins until you say so.

**Headline:** Meet David for 15 minutes
**Description:** Flat $100/month. CT-registered RIA.
**CTA button:** Learn More
**Landing URL:** `https://youarepayingtoomuch.com/become-a-client?utm_source=meta&utm_medium=paid_social&utm_campaign=fee_test_2026&utm_content=retarget_v1`
**Compliance check:** question form (no "we know you visited" phrasing — Meta flags implied knowledge of personal info) ✓ · no testimonial ✓ · no guarantee ✓ · echoes the become-a-client page's own language ✓

> **A third channel?** Google search-keyword ads are **out of this plan** — never the intent (David, 8/19). If a slot opens at a checkpoint and you want a third *placement*, the candidates I'd price out are **Nextdoor** (town-level local ads, very EDDM-adjacent) and **YouTube** (15-sec screen-record of the calculator flipping to $788,306). Say the word and I'll research costs and draft the creative.

---

## 4. David's original hooks — where each one landed

| Your hook | Verdict |
|---|---|
| "Still paying hefty asset-based investment fees?" | ✔ Folded into Meta Ad C's "no percentage of your portfolio" framing — "hefty" dropped as unprovable-ish editorializing; the number argues better |
| "Got the 1% blues?" | ✔ Meta Ad B, verbatim — it's the best brand line in the set |
| "Psst! You are paying too much for financial advice." | ⚠ Kept OFF Meta (direct "you are…" financial assertion = personal-attributes flag risk). The *domain* delivers this line anyway the moment they land. Usable on Reddit if you want a 4th variant |
| "Use this calculator to find out how much your 1% is really costing you" | ✔ Became the CTA language across every variant ("run your numbers") |
| "What would you do with an extra $788,000?" | ✔ Meta Ad A + Reddit A/B — upgraded to the exact $788,306 (matches the live calculator to the dollar; verified 8/19/26) with assumptions attached, which is what CT/SEC-style substantiation wants |

---

*Every ad that runs gets a dated copy saved to the compliance file (5-year CT retention). Edit anything freely — then I'll re-run the compliance pass on the edits.*
