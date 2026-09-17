"use client";

import { bluesCopy, bluesDiagnoses } from "@/config/onePercentBlues";
import { formatCurrency } from "@/lib/format";
import { BluesCheck } from "./BluesCheck";

export type BluesOpeningProps = {
  savings: number;
  portfolioValue: number;
  years: number;
  annualGrowthPercent: number;
  annualFeePercent: number;
  annualFlatFee: number;
  /** The `check` query value (e.g. "yny"), so a shared link renders its
   *  diagnosis server-side. Absent on a fresh visit. */
  initialCheck?: string | null;
};

/** Eyebrow, headline, sub-copy and the check. Phone: copy → questions → card
 *  in DOM order. Desktop (lg): two columns — copy over the diagnosis card on
 *  the left, the three questions on the right spanning both rows. The number
 *  props are the calculator's live state, so the card and the chart below
 *  never disagree. */
export function BluesOpening(props: BluesOpeningProps) {
  return (
    <section
      aria-labelledby="blues-heading"
      className="mx-auto w-full max-w-[1040px] px-4 pb-5 pt-6 text-white sm:px-6 lg:grid lg:grid-cols-2 lg:grid-rows-[auto_auto] lg:items-start lg:gap-x-11 lg:gap-y-6 lg:pb-8 lg:pt-11"
    >
      <div className="lg:col-start-1 lg:row-start-1">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-white/85">{bluesCopy.eyebrow}</p>
        <h1
          id="blues-heading"
          className="mt-2.5 font-blues-serif text-[clamp(44px,12.5vw,96px)] font-semibold leading-[0.98] tracking-[-0.02em]"
        >
          {bluesCopy.headline.lead}
          <br />
          <em className="italic text-[#BFDBFE]">{bluesCopy.headline.emphasis}</em>
        </h1>
        <p className="mt-3.5 max-w-[34ch] text-[17px] leading-[1.5] text-white/90">{bluesCopy.sub}</p>
        <noscript>
          <p className="mt-4 text-[15px] leading-6 text-white/90">
            {bluesDiagnoses.full.heading} With the calculator&rsquo;s starting assumptions the projected{" "}
            {props.years}-year difference is {formatCurrency(props.savings)}. The cure:{" "}
            {bluesCopy.tiles[1].body}{" "}
            <a href={bluesCopy.primaryCta.href} className="!text-white underline">
              {bluesCopy.primaryCta.label}
            </a>
          </p>
        </noscript>
      </div>
      <BluesCheck {...props} />
    </section>
  );
}
