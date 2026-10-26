"use client";

import { NoteMarker } from "@/components/CalculatorNotes";
import { formatCurrency, formatCurrencyFloored } from "@/lib/format";

export type SavingsLeadIntroStyle = "rule" | "panel" | "quote";

export function SavingsLeadHero({
  annualFeePercent,
  annualFlatFee,
  annualGrowthPercent,
  introStyle,
  mutualFundExpensePercent,
  portfolioValue,
  savings,
  years,
}: {
  annualFeePercent: number;
  annualFlatFee: number;
  annualGrowthPercent: number;
  introStyle: SavingsLeadIntroStyle;
  mutualFundExpensePercent: number;
  portfolioValue: number;
  savings: number;
  years: number;
}) {
  const currentFees = `${annualFeePercent.toFixed(2)}% asset-based fee${
    mutualFundExpensePercent > 0
      ? ` + ${mutualFundExpensePercent.toFixed(2)}% fund expenses`
      : ""
  }`;
  /* The promise reads in full the moment the page paints. It used to fade in
     one clause at a time and swap the name between "David" and "Smarter Way
     Wealth" on scroll; that sequence was retired (David, 2026-08-10) because
     the statement now sits on the first mobile screen, where a line that
     rewrites itself under the visitor reads as distracting rather than
     deliberate. */
  const statement = (
    <>
      <span className="block text-center">Smarter Way Wealth</span>
      <span className="block">
        delivers{" "}
        <span className="text-[#007A2F]">
          personal, real human fiduciary advice and planning
        </span>{" "}
        for a simple{" "}
        <span className="whitespace-nowrap">$100/month. Period.</span>
      </span>
    </>
  );
  const introContent =
    introStyle === "panel" ? (
      <div className="relative mx-auto max-w-4xl px-0 py-6 sm:px-10 sm:py-8">
        <div
          data-home-promise-divider="top"
          className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-[#108843] to-transparent shadow-[0_1px_0_rgba(255,255,255,0.75)]"
        />
        <p className="mx-auto max-w-3xl text-2xl font-semibold leading-[1.14] tracking-normal text-[#10233A] sm:text-[clamp(1.55rem,3.8vw,2.35rem)]">
          {statement}
        </p>
        <p className="mx-auto mt-6 max-w-3xl text-center text-[clamp(1.15rem,3.15vw,2rem)] font-medium leading-[1.14] tracking-normal text-[#10233A] sm:mt-7">
          <span className="whitespace-nowrap">David Van Osdol,</span>{" "}
          <span className="whitespace-nowrap">CFA, CFP®</span>
        </p>
        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-[#108843] to-transparent shadow-[0_1px_0_rgba(255,255,255,0.75)]" />
      </div>
    ) : introStyle === "quote" ? (
      <div className="mx-auto max-w-4xl px-3 py-8 sm:py-10">
        <div className="mx-auto max-w-3xl border-l-[6px] border-[#108843] pl-6 text-left">
          <p className="text-[clamp(1.55rem,3.8vw,2.35rem)] font-semibold leading-[1.14] tracking-normal text-[#10233A]">
            {statement}
          </p>
        </div>
      </div>
    ) : (
      <div className="mx-auto max-w-4xl py-7 sm:py-9">
        <div className="mx-auto h-1.5 w-[min(570px,72%)] rounded-full bg-[#108843]" />
        <p className="mx-auto mt-7 max-w-3xl text-[clamp(1.55rem,3.8vw,2.35rem)] font-semibold leading-[1.14] tracking-normal text-[#10233A]">
          {statement}
        </p>
        <div className="mx-auto mt-7 h-1.5 w-[min(570px,72%)] rounded-full bg-[#108843]" />
      </div>
    );
  const introBlock = <div className="mt-10 sm:mt-[90px]">{introContent}</div>;

  /* Mobile spacing here is a fixed budget, not a free choice. Two rules
     compete: the page must breathe, and "The Fee Calculator" must still be on
     the first screen (David, 2026-08-10, -11 and -12). The pre-simplification
     padding totals about 158px more than fits above the fold on a phone, so
     these values give back 56px of it — the most the heading can absorb — split
     in proportion to the original three gaps. Desktop was never tightened and
     keeps its original values through the sm: steps.

     2026-08-12: each of the three gaps gained 6px, paid for by 7px trimmed from
     the mobile header. 8px was tried first and rendered fine at 393px wide, but
     tests/home-first-screen.mjs measures 390px too — where the layout runs a
     few pixels taller and the heading's letterforms crossed the fold on an
     iPhone 14. Trust that test, not a screenshot at one width.

     Later the same day David asked for 5px more between the header and the top
     of the "?" (44px → 49px), with everything below pushed down in turn. Done,
     and it spent the budget exactly: the heading's letters ended at 659px on an
     iPhone 14, which is the fold — zero margin — and 8px above it on an
     iPhone 15/16.

     DECISION CHANGED, 2026-08-14 — read before "fixing" this back. David asked
     for another 5px in BOTH gaps (header → "?" 49px → 54px, and promise → The
     Fee Calculator 73px → 78px) and explicitly released the first-screen
     constraint that had been rationing them: "I'm not concerned about the fee
     calculator being below the fold on older phones, I think the visual clarity
     is more important — if they came to the site from the QR code, they will at
     least scroll down some." So the heading may now cross the fold on the
     smallest profiles by design. tests/home-first-screen.mjs still measures the
     geometry and still asserts the heading is actually PAINTED (the invisible-
     heading defect it was written for is unrelated to the fold and must stay
     caught); only its fold-clearance expectation moved. */
  return (
    <section
      data-url-eval-section="opening-promise"
      className="w-full bg-[#EEF0F5] pb-11 text-center text-[#10233A] sm:pb-[110px]"
    >
      <div className="relative isolate overflow-hidden bg-gradient-to-b from-[#E7EAF0] via-[#EAEDF3] to-[#EEF0F5] px-4 pt-[69px] pb-10 sm:pt-20 sm:pb-[90px]">
        {/* The decorative mark uses the bundled DM Sans face instead of an
            external font stylesheet. That keeps its visible top stable when a
            browser or CI runner cannot reach a font CDN. At 48.6% the measured
            mobile gap stays inside David's approved 54px ±1px guard on both
            Windows and Linux font rasterizers.
            Desktop is untouched. tests/home-first-screen.mjs measures the gap
            for real — trust it over arithmetic here. */}
        <div
          aria-hidden="true"
          data-hero-mark
          className="pointer-events-none absolute left-1/2 top-[48.6%] z-0 -translate-x-1/2 -translate-y-1/2 scale-y-[1.05] select-none text-[12.5rem] font-bold leading-none text-white sm:top-[50%] sm:text-[17rem]"
          style={{ fontFamily: "var(--font-logo)" }}
        >
          ?
        </div>
        <div className="relative z-10 mx-auto max-w-6xl">
          {/* Two lines, always. The question line carries a smaller floor than
              the dollar line so it stays unbroken at 375px instead of orphaning
              "with" on a third line; both lines converge on the same size once
              the viewport is wide enough for the fluid step to take over. */}
          <h1 className="font-semibold leading-[1.06] tracking-normal">
            <span className="block text-[clamp(1.7rem,4.8vw,4rem)]">What would you do with</span>
            <span className="block text-[clamp(2.25rem,4.8vw,4rem)] text-[#007A2F] tabular-nums">
              {formatCurrencyFloored(savings)}
              <NoteMarker />
            </span>
          </h1>
          {/* One step down, and the attribution line below the promise with it:
              the two of them paid for the 5px David added to each of the three
              gaps on 2026-08-12. */}
          <p className="mt-3 text-sm font-medium leading-snug text-[#10233A]/80 sm:text-base">
            Potential savings over {years} years.
          </p>
        </div>
      </div>
      <p
        data-home-assumptions
        className="mx-auto max-w-4xl px-4 text-xs leading-4 text-[#52657A] sm:text-sm"
      >
        Based on a {formatCurrency(portfolioValue)} portfolio · {currentFees} ·{" "}
        {annualGrowthPercent.toFixed(2)}% annual growth · {years} years · compared with{" "}
        {formatCurrency(annualFlatFee / 12)}/month flat fee.{" "}
        <a
          href="#calculator-assumptions"
          className="whitespace-nowrap font-semibold text-[#064B84] underline decoration-[#064B84]/40 underline-offset-2"
        >
          Use my numbers
        </a>
      </p>
      <div className="mx-auto max-w-6xl px-4">{introBlock}</div>
    </section>
  );
}
