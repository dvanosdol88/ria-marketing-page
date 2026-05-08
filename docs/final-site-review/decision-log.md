# Final Site Review Decision Log

Generated: 2026-05-08T17:23:07.591Z

This is the working source of truth for deciding final public pages across You Are Paying Too Much and Smarter Way Wealth.

Visual cockpit: [artifacts/final-site-review/index.html](../../artifacts/final-site-review/index.html)
Structured page data: [pages.json](./pages.json)

## Decision States

- DONE: Accept as final or final with only minor launch verification.
- NOT DONE: Needs curation, redesign, copy work, implementation, or a route decision.
- CUT: Remove or redirect from final public surface.
- INTERNAL ONLY: Keep as dev/proof/QA/internal review surface, not public funnel.

## Page Decisions

| Site | Route | Role | Decision | Live | Recommendation |
|---|---:|---|---|---:|---|
| Smarter Way Wealth | `/` | Corporate trust hub home | NOT DONE | 200 | Use as the firm landing page after the calculator: advisor identity, fiduciary standard, flat monthly fee, and clear path back to the fee calculator. |
| Smarter Way Wealth | `/privacy` | Corporate privacy policy | DONE | 200 | Keep as the privacy baseline, then re-check only if launch forms, analytics, scheduling, or lead capture are added. |
| Smarter Way Wealth | `/` | Corporate footer and disclosure component | DONE | 200 | Keep the short disclosure model and mirror any approved text changes into the fee-calculator repo footer. |
| You Are Paying Too Much | `/` | Proposed QR root: calculator-first with founder banner | NOT DONE | 200 | Use this as the default QR-code destination unless another banner variant wins the final review. |
| You Are Paying Too Much | `/?banner=founder-proof` | Banner finalist: founder proof | NOT DONE | 200 | Recommended default because it gives the calculator immediate human/trust context without burying the tool. |
| You Are Paying Too Much | `/?banner=qr-bridge` | Banner finalist: QR bridge | NOT DONE | 200 | Use if the mailer context needs to be explicit at the top of the page. |
| You Are Paying Too Much | `/?banner=advisor-standard` | Banner finalist: advisor standard | NOT DONE | 200 | Use if the final homepage needs the quietest, most professional trust signal. |
| You Are Paying Too Much | `/?variant=direct-mail` | Direct-mail campaign variant check | INTERNAL ONLY | 200 | Treat as a campaign/test input until the variant system is intentionally shipped. |
| You Are Paying Too Much | `/?variant=fee-receipt` | Fee-receipt campaign variant check | INTERNAL ONLY | 200 | Keep as a possible ad or follow-up funnel angle, not a primary homepage direction. |
| You Are Paying Too Much | `/?variant=fiduciary-upgrade` | Fiduciary-upgrade campaign variant check | INTERNAL ONLY | 200 | Use this as a bridge between calculator proof and /upgrade-your-advice if the tone stays direct and not combative. |
| You Are Paying Too Much | `/?variant=final-home` | Proposed final home: advisor hero plus final calculator | NOT DONE | 200 | Use this as the current home-page finalist for review: advisor-led trust above the fold, then a clean calculator comparison immediately below. |
| You Are Paying Too Much | `/upgrade-your-advice` | Core funnel page: why upgrade the advice | NOT DONE | 200 | Curate into one final argument: keep your custodian, upgrade the advice, verify the credentials, and understand the fiduciary standard. |
| You Are Paying Too Much | `/improve-your-tools` | Core funnel page: planning tools and better information | NOT DONE | 200 | Keep the animated header, then sharpen the page around planning clarity and decision quality rather than a generic software showcase. |
| You Are Paying Too Much | `/save` | Core funnel page: fee proof and savings math | NOT DONE | 200 | Make /save the final proof page. Pull only the best fee simulator, fee wedge, and control-matrix ideas from old variants. |
| You Are Paying Too Much | `/save-a-ton` | Potential campaign/support page | NOT DONE | 200 | Either give this a distinct campaign job or cut/redirect it into /save. The phrase is memorable but may be too casual for the final trust system. |
| You Are Paying Too Much | `/meaning` | Purpose and advisor-standard page | NOT DONE | 200 | Cut this down to one memorable idea. Keep the point that the job is helping people, then remove repetition and anything that feels motivational instead of trustworthy. |
| You Are Paying Too Much | `/how-it-works` | Proof/support: calculator mechanics | INTERNAL ONLY | 200 | Keep for internal QA or convert into a client-safe method page. In its current form it reads like implementation documentation. |
| You Are Paying Too Much | `/how-it-works/substitution` | Proof/support: portfolio substitution demo | NOT DONE | 200 | Promote only if it supports the final story. Otherwise keep as proof/demo material outside the main funnel. |
| You Are Paying Too Much | `/faq` | Proof/support: objection handling | NOT DONE | 200 | Build the FAQ from real final-page objections after the core pages are chosen. |
| You Are Paying Too Much | `/our-math` | Proof/support: assumptions and math disclosure | NOT DONE | 200 | Use as the durable assumptions/disclosures companion for the calculator, then link to it wherever the calculator appears. |
| You Are Paying Too Much | `/privacy` | Privacy and disclosure support | DONE | 200 | Keep as support page, then re-check once final contact forms, analytics, or scheduling flows are chosen. |
| You Are Paying Too Much | `/gallery` | Internal visual triage tool | INTERNAL ONLY | 200 | Keep out of final public navigation. Replace its role with this final decision cockpit for page-level decisions. |
| You Are Paying Too Much | `/mobile-calculator` | Internal/mobile calculator test surface | INTERNAL ONLY | 200 | Keep only if it is a QA surface. The final mobile calculator should be the production home experience. |
| You Are Paying Too Much | `/experiment` | Internal experiment surface | INTERNAL ONLY | 200 | Keep out of final public navigation. Promote only after it has a clear prospect-facing job. |
| You Are Paying Too Much | `/components/calendar` | Internal component preview | INTERNAL ONLY | 200 | Keep as internal preview only unless scheduling becomes part of the final public funnel. |

## Historical Variant Families

### Upgrade Your Advice

Recommendation: Keep the current route, then curate it into one sharper final page using the custodian message, source rigor, and the most useful visuals.

Finalists:
- upgrade10: most polished task-vs-purpose framing
- upgrade8: strongest fiduciary education and FAQ structure
- upgrade5: best data visualizations
- upgrade-your-advice-v0-cgpt: strongest keep-your-custodian message
- upgrade3: strongest source/citation base

Duplicates summarized: upgrade4 duplicates upgrade3. upgrade1/upgrade2 are useful personal-story foundations but not standalone finalists.

### Save

Recommendation: Build one final /save proof page and either cut or redirect /save-a-ton unless that phrase becomes a campaign-specific page.

Finalists:
- save3: most complete interactive fee education
- save2: strongest arithmetic diagram and quote-card style
- save1: cleanest control-matrix concept
- docs/save-snippets: preserved simulator, fee wedge, and control matrix references

Duplicates summarized: save1/save2/save3 overlap heavily on fee arithmetic, quotes, and charts.

### Improve Your Tools

Recommendation: Keep the current route, tighten the first viewport, and make the RightCapital/tool proof feel like a serious planning workflow rather than a software tour.

Finalists:
- AnimatedHeader.tsx: canonical animated header with brand green
- improveToolsPageConfig versions 1-3: recoverable content order and hero copy variants
- improve-your-tools-v0: prior full-page structure referenced in the catalog

Duplicates summarized: The improve variants mostly share structure and differ in copy/order. The current route already carries the canonical header.

### Meaning / Purpose

Recommendation: Keep one purpose page only. Use the Engine/Pilot idea if it supports trust, and remove anything that sounds like generic motivational copy.

Finalists:
- meaning1: best Engine vs Pilot visual
- upgrade10: most polished strikethrough task-vs-purpose version
- upgrade9: useful but less polished task-vs-purpose copy
- current /meaning: consolidated live route

Duplicates summarized: Jensen/task-vs-purpose material appears in four places and now needs curation, not more accumulation.

### Home

Recommendation: Make / the decision engine: calculator first, then a concise route into Upgrade, Improve, Save, and the Smarter Way Wealth trust hub.

Finalists:
- current local /: final-C calculator-first landing page
- top banner finalists: founder-proof, qr-bridge, advisor-standard
- branch homeMarketingVariants: direct-mail, fee-receipt, fiduciary-upgrade
- final-home: fiduciary-upgrade hero combined with fee-calculator-final-c calculator shape
- historical /v2: Equation of Value, Three Pillars, Philosophy

Duplicates summarized: The current production URL query variants return the same live page today; the differentiated variant copy exists on the local branch.

## Screenshot Evidence

### Smarter Way Wealth - /

- Desktop: [screenshots/sww-home-desktop.jpg](../../artifacts/final-site-review/screenshots/sww-home-desktop.jpg)
- Mobile: [screenshots/sww-home-mobile.jpg](../../artifacts/final-site-review/screenshots/sww-home-mobile.jpg)

### Smarter Way Wealth - /privacy

- Desktop: [screenshots/sww-privacy-desktop.jpg](../../artifacts/final-site-review/screenshots/sww-privacy-desktop.jpg)
- Mobile: [screenshots/sww-privacy-mobile.jpg](../../artifacts/final-site-review/screenshots/sww-privacy-mobile.jpg)

### Smarter Way Wealth - /

- Desktop: [screenshots/sww-footer-disclosures-desktop.jpg](../../artifacts/final-site-review/screenshots/sww-footer-disclosures-desktop.jpg)
- Mobile: [screenshots/sww-footer-disclosures-mobile.jpg](../../artifacts/final-site-review/screenshots/sww-footer-disclosures-mobile.jpg)

### You Are Paying Too Much - /

- Desktop: [screenshots/yattm-home-desktop.jpg](../../artifacts/final-site-review/screenshots/yattm-home-desktop.jpg)
- Mobile: [screenshots/yattm-home-mobile.jpg](../../artifacts/final-site-review/screenshots/yattm-home-mobile.jpg)

### You Are Paying Too Much - /?banner=founder-proof

- Desktop: [screenshots/yattm-home-banner-founder-proof-desktop.jpg](../../artifacts/final-site-review/screenshots/yattm-home-banner-founder-proof-desktop.jpg)
- Mobile: [screenshots/yattm-home-banner-founder-proof-mobile.jpg](../../artifacts/final-site-review/screenshots/yattm-home-banner-founder-proof-mobile.jpg)

### You Are Paying Too Much - /?banner=qr-bridge

- Desktop: [screenshots/yattm-home-banner-qr-bridge-desktop.jpg](../../artifacts/final-site-review/screenshots/yattm-home-banner-qr-bridge-desktop.jpg)
- Mobile: [screenshots/yattm-home-banner-qr-bridge-mobile.jpg](../../artifacts/final-site-review/screenshots/yattm-home-banner-qr-bridge-mobile.jpg)

### You Are Paying Too Much - /?banner=advisor-standard

- Desktop: [screenshots/yattm-home-banner-advisor-standard-desktop.jpg](../../artifacts/final-site-review/screenshots/yattm-home-banner-advisor-standard-desktop.jpg)
- Mobile: [screenshots/yattm-home-banner-advisor-standard-mobile.jpg](../../artifacts/final-site-review/screenshots/yattm-home-banner-advisor-standard-mobile.jpg)

### You Are Paying Too Much - /?variant=direct-mail

- Desktop: [screenshots/yattm-home-direct-mail-desktop.jpg](../../artifacts/final-site-review/screenshots/yattm-home-direct-mail-desktop.jpg)
- Mobile: [screenshots/yattm-home-direct-mail-mobile.jpg](../../artifacts/final-site-review/screenshots/yattm-home-direct-mail-mobile.jpg)

### You Are Paying Too Much - /?variant=fee-receipt

- Desktop: [screenshots/yattm-home-fee-receipt-desktop.jpg](../../artifacts/final-site-review/screenshots/yattm-home-fee-receipt-desktop.jpg)
- Mobile: [screenshots/yattm-home-fee-receipt-mobile.jpg](../../artifacts/final-site-review/screenshots/yattm-home-fee-receipt-mobile.jpg)

### You Are Paying Too Much - /?variant=fiduciary-upgrade

- Desktop: [screenshots/yattm-home-fiduciary-upgrade-desktop.jpg](../../artifacts/final-site-review/screenshots/yattm-home-fiduciary-upgrade-desktop.jpg)
- Mobile: [screenshots/yattm-home-fiduciary-upgrade-mobile.jpg](../../artifacts/final-site-review/screenshots/yattm-home-fiduciary-upgrade-mobile.jpg)

### You Are Paying Too Much - /?variant=final-home

- Desktop: [screenshots/yattm-home-final-home-desktop.jpg](../../artifacts/final-site-review/screenshots/yattm-home-final-home-desktop.jpg)
- Mobile: [screenshots/yattm-home-final-home-mobile.jpg](../../artifacts/final-site-review/screenshots/yattm-home-final-home-mobile.jpg)
- Reference: [Final-C calculator reference](../../artifacts/final-site-review/screenshots/fee-calculator-final-c-reference.png)

### You Are Paying Too Much - /upgrade-your-advice

- Desktop: [screenshots/yattm-upgrade-desktop.jpg](../../artifacts/final-site-review/screenshots/yattm-upgrade-desktop.jpg)
- Mobile: [screenshots/yattm-upgrade-mobile.jpg](../../artifacts/final-site-review/screenshots/yattm-upgrade-mobile.jpg)

### You Are Paying Too Much - /improve-your-tools

- Desktop: [screenshots/yattm-improve-desktop.jpg](../../artifacts/final-site-review/screenshots/yattm-improve-desktop.jpg)
- Mobile: [screenshots/yattm-improve-mobile.jpg](../../artifacts/final-site-review/screenshots/yattm-improve-mobile.jpg)

### You Are Paying Too Much - /save

- Desktop: [screenshots/yattm-save-desktop.jpg](../../artifacts/final-site-review/screenshots/yattm-save-desktop.jpg)
- Mobile: [screenshots/yattm-save-mobile.jpg](../../artifacts/final-site-review/screenshots/yattm-save-mobile.jpg)

### You Are Paying Too Much - /save-a-ton

- Desktop: [screenshots/yattm-save-a-ton-desktop.jpg](../../artifacts/final-site-review/screenshots/yattm-save-a-ton-desktop.jpg)
- Mobile: [screenshots/yattm-save-a-ton-mobile.jpg](../../artifacts/final-site-review/screenshots/yattm-save-a-ton-mobile.jpg)

### You Are Paying Too Much - /meaning

- Desktop: [screenshots/yattm-meaning-desktop.jpg](../../artifacts/final-site-review/screenshots/yattm-meaning-desktop.jpg)
- Mobile: [screenshots/yattm-meaning-mobile.jpg](../../artifacts/final-site-review/screenshots/yattm-meaning-mobile.jpg)

### You Are Paying Too Much - /how-it-works

- Desktop: [screenshots/yattm-how-it-works-desktop.jpg](../../artifacts/final-site-review/screenshots/yattm-how-it-works-desktop.jpg)
- Mobile: [screenshots/yattm-how-it-works-mobile.jpg](../../artifacts/final-site-review/screenshots/yattm-how-it-works-mobile.jpg)

### You Are Paying Too Much - /how-it-works/substitution

- Desktop: [screenshots/yattm-substitution-desktop.jpg](../../artifacts/final-site-review/screenshots/yattm-substitution-desktop.jpg)
- Mobile: [screenshots/yattm-substitution-mobile.jpg](../../artifacts/final-site-review/screenshots/yattm-substitution-mobile.jpg)

### You Are Paying Too Much - /faq

- Desktop: [screenshots/yattm-faq-desktop.jpg](../../artifacts/final-site-review/screenshots/yattm-faq-desktop.jpg)
- Mobile: [screenshots/yattm-faq-mobile.jpg](../../artifacts/final-site-review/screenshots/yattm-faq-mobile.jpg)

### You Are Paying Too Much - /our-math

- Desktop: [screenshots/yattm-our-math-desktop.jpg](../../artifacts/final-site-review/screenshots/yattm-our-math-desktop.jpg)
- Mobile: [screenshots/yattm-our-math-mobile.jpg](../../artifacts/final-site-review/screenshots/yattm-our-math-mobile.jpg)

### You Are Paying Too Much - /privacy

- Desktop: [screenshots/yattm-privacy-desktop.jpg](../../artifacts/final-site-review/screenshots/yattm-privacy-desktop.jpg)
- Mobile: [screenshots/yattm-privacy-mobile.jpg](../../artifacts/final-site-review/screenshots/yattm-privacy-mobile.jpg)

### You Are Paying Too Much - /gallery

- Desktop: [screenshots/yattm-gallery-desktop.jpg](../../artifacts/final-site-review/screenshots/yattm-gallery-desktop.jpg)
- Mobile: [screenshots/yattm-gallery-mobile.jpg](../../artifacts/final-site-review/screenshots/yattm-gallery-mobile.jpg)

### You Are Paying Too Much - /mobile-calculator

- Desktop: [screenshots/yattm-mobile-calculator-desktop.jpg](../../artifacts/final-site-review/screenshots/yattm-mobile-calculator-desktop.jpg)
- Mobile: [screenshots/yattm-mobile-calculator-mobile.jpg](../../artifacts/final-site-review/screenshots/yattm-mobile-calculator-mobile.jpg)

### You Are Paying Too Much - /experiment

- Desktop: [screenshots/yattm-experiment-desktop.jpg](../../artifacts/final-site-review/screenshots/yattm-experiment-desktop.jpg)
- Mobile: [screenshots/yattm-experiment-mobile.jpg](../../artifacts/final-site-review/screenshots/yattm-experiment-mobile.jpg)

### You Are Paying Too Much - /components/calendar

- Desktop: [screenshots/yattm-calendar-desktop.jpg](../../artifacts/final-site-review/screenshots/yattm-calendar-desktop.jpg)
- Mobile: [screenshots/yattm-calendar-mobile.jpg](../../artifacts/final-site-review/screenshots/yattm-calendar-mobile.jpg)

