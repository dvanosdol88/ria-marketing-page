<!-- COPY of dvo-canon playbooks/compliance.md — edit the master, never this copy -->
<!-- COMPLIANCE PLAYBOOK v1 2026-11-16 (David's order 2026-11-16 9:22 AM EST) -->
# Compliance: recommend only

This is the one master rule for every agent (Claude, Codex, Gemini, any other) in any RIA work or repo: Smarter Way Wealth (smarterwaywealth.com), youarepayingtoomuch.com, RIA Builder and RIA Chief, and any other RIA content. If another file disagrees with this one, this one wins.

## 1. The rule (David, 2026-11-16)

> I do NOT want you or any other agent to freelance, especially when it comes to compliance!!
>
> You are NOT our compliance guru.  I don't care if you think that something needs stronger wording.   You may RECOMMEND ONLY. You may not change without authorization, not even a single word, change of placement, footnote, or anything else.
>
> Your job is to SURFACE any issues, not resolve them.  Your job is to make recommendations only.

In plain terms:
- Agents **surface and recommend only**. David (owner and Chief Compliance Officer) **decides**.
- **Never change, add, remove, move or reword anything for compliance reasons** without David's explicit instruction for that exact change. That covers a single word, placement, a footnote and a disclosure.
- **Never call anything "compliant", "approved" or "passed".** Say "no issues flagged by me" if that is the truth; only David approves.
- A compliance tool's own "clean redraft" (for example the financial-advisors compliance skill, Pass 4C) is **a recommendation only**. Never apply it, and never slip it into a build prompt, a draft or a "safer" version.
- When David tells you to make a change, make **exactly** his words, nothing extra. If you think his words raise an issue, flag it in the format below; do not soften or add to them yourself.
- **If you already made a compliance change on your own**, report it now in the format below and offer to put the original back. Put it back only when David says so.

## 2. When it applies

- Any words a visitor, prospect or client can see or hear: website pages, emails, social posts, video scripts, RIA Chief answers, letters, documents, slides, ads.
- Any time you notice something that **might** be a compliance issue, even in passing and even if nobody asked you to look.
- **Testimonials:** Connecticut examiners say "Investment advisers are prohibited from using testimonials." Flag (never add) any client quote, review, star rating, "what clients say" block or award.

## 3. The procedure, every time

1. **Notice** the possible issue.
2. **Do not change it.** Not a word, not its placement.
3. **Write it up** in the format in section 4.
4. **Report it** in a separate section titled `COMPLIANCE` in your report. For a very small item that does not need an HTML summary, put the same format inline in the chat.
5. **Add a row to the register.** smarterwaywealth.com: `docs/compliance/register.md` in the `dvanosdol88/smarter-way-wealth` repository (reachable from every computer and cloud agent; add the row in the same pull request as your report, or a separate docs-only one). Any other site: `docs/compliance/register.md` in that site's own repository, same columns. If you truly cannot reach it, say "Not yet in the register" in your report.
6. **Wait for David.** An open item stays open. Never close, resolve or withdraw it to tidy up.
7. **Only on David's explicit words**, make exactly that change. Then record his words verbatim, with date and time, in the register, and save a dated full-page screenshot of the changed page to David's local compliance shots folder (name: `<page>-YYYY-MM-DD.png`).

**Status values** (use exactly these):
- `OPEN` — waiting for David. No change made.
- `DAVID DECIDED: CHANGE` — David gave the exact change (his words quoted).
- `DAVID DECIDED: KEEP AS IS` — David chose to leave it (his words quoted).
- `WITHDRAWN` — the agent found its own flag was wrong; give the reason. The original row stays.

## 4. The format

David's block. Keep his field names and order exactly:

```
COMPLIANCE
Issue (specific, citing the rule or resource):            Recommended Fix:
Estimated severity level (1-10):
Confidence (%):
Checkboxes:
[ ] Consistency Issue (What is the issue, where are the inconsistencies?)
[ ] Misleading
[ ] Truthfulness
```

How to fill it in:
- In the blank form, "Issue" and "Recommended Fix" share one line, as David wrote it. When you fill it in as text, write the issue after its label, then start `Recommended Fix:` on the next line. Same names, same order. In HTML, show them side by side.
- Mark a checked box `[x]`. For Consistency Issue, write the issue and every place it appears.
- **Citation rule.** The firm is registered in Connecticut, so cite the Connecticut rule **first**: Conn. Gen. Stat. 36b-5(a)(2) (misleading statement or omission), 36b-5(f) (dishonest or unethical practice), Conn. Regs. 36b-31-5a (advertising). Then cite the SEC rule as **"SEC benchmark"**, for example Rule 206(4)-1 (the Marketing Rule). The SEC rule does not bind a Connecticut-registered adviser directly; NASAA's May 2026 model-rule changes move states toward it, but Connecticut has not been confirmed to adopt them. Never write "violates the SEC Marketing Rule" as if it bound the firm.
- **Recommended Fix** offers David choices (including "keep as is"). It is never already done.

**Interim rule (in use now, until David approves the additions below):** use David's block exactly, then add two lines at the end:

```
Where: <site, page and section> "<the exact words, quoted>"
Status: OPEN — no change made
```

"Where" makes the item findable on the page. "Status" shows nothing was changed. Both are needed until David decides on the additions.

### Recommended additions (pending David's OK)

Proposals only. None is in use until David says so; this list will then mark which are in use.

| Proposed field | Why (one line) | Research basis |
|---|---|---|
| ID (e.g. SWW-001) | One number links the chat, report, register and screenshot. | IIA Standard 15.2 (track status in a tracking system) |
| Where: page + exact quoted words | Auditors state the "condition" (exactly what is there) separately from the rule. | IIA 2024 Glossary, "finding" |
| Governing rule (CT) + SEC benchmark, own lines | Keeps the Connecticut-first citation easy to check. | CT 36b-5; SEC rule scope (206(4)-1 opening sentence) |
| Risk: what could happen | The "consequence" step of a standard finding; helps David weigh it. | IIA 5 Cs; IIA Standard 14.3 |
| Support on file | Every fact claim needs a record showing the basis, made at the time. | SEC Release IA-5653; XYPN 2026 calendar |
| Status | Shows at a glance nothing was changed without David. | IIA Standard 15.2 |
| David's decision: his words verbatim + date and time | Proves the human decided; examiners ask for evidence the review happened. | IIA Three Lines; NIST AI RMF; FINRA 24-09 |
| Severity and confidence basis (one line each) | Makes different agents rate alike. | NIST SP 800-30; ICD 203 |

## 5. Severity and confidence

**Severity (1-10)** = how likely a reader or examiner is to be misled, times how much harm it would do (the IIA's likelihood-and-impact test). NIST notes that ratings vary between people unless each level is clearly defined, so use these anchors and add one line saying why:

| Score | Meaning |
|---|---|
| 10 | Plainly false statement of material fact, a guarantee, or a prohibited item (a testimonial, review, rating or award), on a public page. |
| 9 | Likely untrue or materially misleading statement of material fact that a regulator would cite. |
| 8 | Likely a rule problem as written, about fees, performance, credentials, conflicts or AI claims. |
| 7 | Likely a rule problem as written, on any other topic. |
| 6 | Missing disclosure, context or support for a material claim; depends on what is nearby. |
| 5 | Depends on context; a careful reviewer could go either way. |
| 4 | Small gap in context; low chance anyone is misled. |
| 3 | Best practice: e.g. a true fact with no support saved on file. |
| 2 | Polish: clarity, readability, size or placement of small print. |
| 1 | Trivial; noted only for completeness. |

**Confidence (%)** = your honest probability that the firm's compliance reviewer (David, or counsel he hires) would agree this is a real issue at about that severity. It is not how bad the issue is; keep the two separate. Use these bands (from the US intelligence standard ICD 203) and give a one-line basis such as "rule text is explicit" or "my reading; no regulator guidance found":

| Confidence | Word to use |
|---|---|
| 95-99% | almost certain |
| 80-95% | very likely |
| 55-80% | likely |
| Under 55% | possible: still report it, and say it is a judgment call |

Never write 100%.

**The check boxes:**
- **Consistency Issue:** the same fact, number or promise is stated differently in two or more places (pages, sites, documents, the firm's filings). Name every place.
- **Misleading:** the words may be literally true but could leave a false impression, leave out needed context, or show a benefit without its limits or costs.
- **Truthfulness:** a statement of fact that may be untrue, or that the firm cannot prove today with support on file.

## 6. Filled example (EXAMPLE ONLY: not a live item and not in the register)

```
COMPLIANCE
Issue (specific, citing the rule or resource): The About page draft says "Instead of the typical fee, which is based on your assets and slowly and consistently erodes the wealth you work so hard to build". It compares our fee with "the typical fee" without saying at what account size our $100/month ($1,200 a year) flat fee costs less (about $120,000 against a 1% fee), that fund expenses and other costs are separate, or where "typical fee" comes from. Below about $120,000 a 1% fee costs less than ours, so the line can leave a false impression. Governing rule: Conn. Gen. Stat. 36b-5(a)(2); Conn. Regs. 36b-31-5a. SEC benchmark: Rule 206(4)-1(a)(1) and (a)(3).
Recommended Fix: David's choice. (A) Keep the line and add a footnote such as "Our flat fee costs less on any account over $120,000 than a 1% asset-based fee. Fund expenses and other costs are separate. Source for the typical fee: [source]." (B) Keep as is. (C) Reword in David's own words.
Estimated severity level (1-10): 7 (one-sided fee comparison; likely a problem as written for smaller accounts)
Confidence (%): 75% (likely; the omission is clear, but nearby context could change how an examiner weighs it)
Checkboxes:
[ ] Consistency Issue (What is the issue, where are the inconsistencies?)
[x] Misleading
[ ] Truthfulness
Where: smarterwaywealth.com, About page draft, opening line: "Instead of the typical fee, which is based on your assets and slowly and consistently erodes the wealth you work so hard to build"
Status: OPEN — no change made
```

## 7. Where the records live

- **Register** (every flag, every decision): `docs/compliance/register.md` in the `dvanosdol88/smarter-way-wealth` repository 
- **Master compliance document** for smarterwaywealth.com (annotated page images, risks, decisions): David's local master compliance document (on his Linux laptop; not in this repo)
- **Format one-pager** for David: David's local format one-pager (not in this repo)
- **Page captures:** David's local compliance shots folder
- Connecticut requires a separate advertising file, website included, kept at least five years (Regs. 36b-31-14b(b)(4)); examiners review it. The register plus dated screenshots are the backbone of that file. Never delete a row or a capture.

## 8. Sources

1. Connecticut Uniform Securities Act, Conn. Gen. Stat. 36b-5(a)(2) and (f): https://www.cga.ct.gov/current/pub/chap_672a.htm
2. CT Department of Banking, advertising order (36b-31-5a; separate advertising file, 36b-31-14b(b)(4)): https://portal.ct.gov/dob/securities-licensing/advisers-state/advertising-filing-exemption-for-state-registered-ias
3. CT Department of Banking, Investment Adviser Examination Program (testimonials prohibited; advertising file includes websites): https://portal.ct.gov/dob/securities-division-administration/securities-examination-program/investment-adviser-examination-program-in-connecticut
4. SEC Marketing Rule 17 CFR 275.206(4)-1 (benchmark; seven general prohibitions): https://www.law.cornell.edu/cfr/text/17/275.206(4)-1
5. SEC Risk Alert, Marketing Rule observations (Apr. 17, 2024; websites must be covered by written, followed policies): https://www.sec.gov/files/exams-risk-alert-marketing-observation-2024.pdf
6. IIA Three Lines Model (2020; reviewer advises and challenges, management decides): https://www.theiia.org/globalassets/site/communication/2020/three-lines-model-updated.pdf
7. IIA Global Internal Audit Standards (2024; finding = criteria vs condition; likelihood and impact): https://www.theiia.org/globalassets/site/standards/editable-versions/globalinternalauditstandards_2024january9_editable.pdf
8. ODNI ICD 203, Analytic Standards (fixed words for probability bands): https://archive.dni.gov/files/documents/ICD/ICD-203.pdf

Also used with care: NIST SP 800-30 Rev. 1, section 2.3.2 (defined rating levels; it describes 1-10 scales as one option, not a requirement): https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-30r1.pdf. NIST AI RMF (human roles defined): https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf. FINRA Notice 24-09 (rules apply whether a person or AI wrote it): https://www.finra.org/rules-guidance/notices/24-09.

Still to confirm (David or counsel): the official text of Conn. Regs. 36b-31-5a and 36b-31-14b, and whether Connecticut has adopted NASAA's May 2026 changes.
