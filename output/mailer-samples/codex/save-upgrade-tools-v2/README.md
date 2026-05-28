# SWW · YAPTOM · EDDM v2 — Six Concept Proofs

**Client:** Smarter Way Wealth · `youarepayingtoomuch.com`
**Round:** v2 — six distinct concept proofs, no mint wash
**Trim:** 8.5 × 6.25 in · **Bleed:** 0.125 in all sides · **Artboard:** 8.75 × 6.5 in
**Render scale:** 200 px/in → **1750 × 1300 px** per side
**Generated:** 2026-05-27

This pass produces six paired front+back EDDM mailer concepts as HTML proofs + PNG renders + a contact sheet. **No PDFs in this pass** — proofs only. Pick favorites and I'll do the print-ready PDF pass for those.

---

## The six concepts at a glance

| # | Slug | Concept | Print-safety |
|---|------|---------|---|
| 01 | `editorial-rule` | Newspaper-style hairline grid; large headline; restrained green only on the $788K figure. | Medium |
| 02 | `structured-columns` | Three-column Swiss grid with a receipt-style numbers panel and chart in its own column. | Medium-high |
| 03 | `callout-band` | Single dark-ink band carries the headline; white everywhere else; a unifying ink strap on the back. | Medium |
| 04 | `paper-and-ink` | Warm paper-color field (NOT mint); dark ink type; brand green only on the dollar figure and a single keyline. | Medium |
| 05 | `chart-led-front` | Front dominated by the savings curve at scale; headline floats in a small card; back is the calm sibling. | Lower-medium |
| 06 | `print-safe-classic` | Big type, solid colors only, thick lines, no hairlines or gradients — the friendliest concept for any EDDM press. | **High (safety pick)** |

**Print-safety pick: `06_print-safe-classic`** — no fine line work, no tints, no gradients, no reversed small type. Any reputable EDDM printer can reproduce it cleanly on uncalibrated equipment.

Open `SWW_YAPTOM_v2_ContactSheet.png` to compare all six at a glance.

---

## What's preserved (per the locked brief)

- Exact approved copy verbatim on front and back (see `mailer-assets-manifest.json` → `approvedCopy`).
- Existing brand only: SWW logo, dark ink (#07140D), brand green (#00A540), slate (#34483C), DVO photo, the existing QR.
- Inter / DM Sans typography family — no decorative or display fonts.
- Front contains: domain top centered bold, "What would you do with $788,000*?" headline, "* potential savings over 20 years." footnote, founder-proof line, "David Van Osdol, CFA, CFP" byline, chart + QR, disclosure.
- Back preserves the top mailing/indicia clear zone (return address top-left, "LOCAL POSTAL CUSTOMER" centered, indicia top-right).
- Save / Upgrade / Improve are the only oversized/bold keywords on the back — and they do not repeat anywhere else on the back.
- QR is NOT in a box on any back; it sits on white (or in concept 04 on a very subtle solid field).
- QR caption is verbatim: "See how much you can save using your actual numbers."
- "youarepayingtoomuch.com" appears large, bold, black, with generous white space above it on every back.
- In "Better financial planning tools that **you** own.", the word "you" is bold black on every back.
- No mint wash, gradient, or large mint field as a dominant background on any concept.

---

## File inventory

### Per concept (× 6)

```
SWW_YAPTOM_v2_<NN>_<slug>_Proof.html        # single HTML, front + back stacked, with on-screen trim guides
SWW_YAPTOM_v2_<NN>_<slug>_Front_Proof.png   # 1750 × 1300 PNG, 200 px/in
SWW_YAPTOM_v2_<NN>_<slug>_Back_Proof.png    # 1750 × 1300 PNG, 200 px/in
SWW_YAPTOM_v2_<NN>_<slug>_Rationale.md      # concept intent + print-safety verdict
```

### Root of `save-upgrade-tools-v2/`

```
SWW_YAPTOM_v2_ContactSheet.html             # gallery of all 6 concepts side-by-side
SWW_YAPTOM_v2_ContactSheet.png              # rendered PNG of the contact sheet
README.md                                   # this file
mailer-assets-manifest.json                 # machine-readable index of every produced file
brand-assets/                               # logos, DVO photo, QR — referenced by relative path in proofs
  logo-800.png
  logo.svg
  logo-icon.svg
  logo-strong-primary-lightbg.png
  dvo-headshot.jpg                          # extracted from the Designer_Handoff base64 (56,977 bytes)
  yaptom_default_inputs_qr.png
build-concepts.cjs                          # generator for the 6 HTML proofs + rationales
render.cjs                                  # Playwright PNG renderer (200 px/in element screenshots)
build-contact-sheet.cjs                     # generator for the contact sheet HTML
render-contact-sheet.cjs                    # Playwright renderer for the contact sheet
extract-dvo-photo.cjs                       # one-time helper that pulled DVO photo from the handoff base64
```

---

## How to pick favorites for the next (PDF) pass

1. Open `SWW_YAPTOM_v2_ContactSheet.png` for a side-by-side view of all six.
2. For any concept you want to compare in detail, open both `..._Front_Proof.png` and `..._Back_Proof.png`.
3. For pixel-level inspection or to send to a printer for an estimate, open the matching `..._Proof.html` in a browser — the trim guides are dashed lines visible on screen only.
4. Reply with one or more slugs (e.g. `02_structured-columns` and `06_print-safe-classic`) and I'll produce a print-ready 8.75 × 6.5 PDF with proper trim/bleed marks for each.

---

## Notes / caveats

- **DVO photo source.** The DVO Head Shot was extracted from the base64 inside the Designer_Handoff HTML (56,977 bytes — matches the handoff's stated size). No separate JPG was present on disk in the project.
- **Chart numbers.** The savings curve uses the same assumptions documented in `mailer-assets-manifest.json` → `assumptions` / `calculatorValues`. The "$788,000" on the front is the rounded marketing figure; "$788,306 gap" in the chart annotation is the precise compounded value from a 20-year $1M / 8% growth / 1% AUM-fee scenario. Both are honest reflections of the same scenario.
- **Concept 03 strap.** The back of `03_callout-band` carries a thin ink strap with the domain reversed in white — that's the unifying motif from the front's headline band. A separate, large black `youarepayingtoomuch.com` still appears at the bottom of the back per the brief.
- **Concept 04 paper field.** The off-white field is `#FAF8F2`, distinctly NOT mint. If a printer's spec sheet flags it as a problem flood, switch to pure white — the layout still works.
- **Trim guides.** All HTML proofs show dashed trim guides (bleed inset 0.125 in) on screen; the PNG renders intentionally hide those so the PNGs represent what the printer will print.
