"use client";

import { useEffect, useState, type ReactNode } from "react";
import { animate, motion, useMotionValue, useReducedMotion } from "framer-motion";
import { DEFAULT_STATE } from "@/lib/full-calculator/calculatorState";
import { buildFeeProjection } from "@/lib/feeProjection";
import { formatCurrency } from "@/lib/format";

/**
 * The step calculator's answer (idea B4, David 2026-11-11; reworked the same
 * day): right under the folded line, the advisory-fee difference in ending
 * value counts up in red (no "less": the heading already says it, David
 * 2026-11-11), both ending values to the dollar, then "What you would pay
 * for advice, year by year" (idea A7) and
 * one thin bar for the ending value at $100 a month (idea A6): a soft slate
 * part (what the asset-based fee leaves) then a solid red part (the share
 * lost to fees), both growing from the left over a light track:
 * "That's 17% of your wealth." The share button sits right under it.
 *
 * David: "All three elements need to move in unison." One clock drives all
 * three: the counted dollars say how far along the years are, the bars grow
 * up to that year, and the bar's two parts are the values at that same year
 * as shares of the final ending value.
 *
 * The count starts slowly, is up to speed after about two seconds, then
 * slows right down for the last $10,000 — and the final year's bar and the
 * end of the share bar slow down with it, so all three stop together.
 *
 * Arithmetic on the visitor's own numbers (steady growth, no fund expenses);
 * no forecast. Plays once per Go, and again on a refresh or a shared link.
 */

export type FeeAnswerRun = { portfolio: number; fee: number; years: number; growth: number };

const RED = "#B42318";
const BAR_RED = "#D92D20";
const BAR_CALM = "#9DB0C3";
const BAR_TRACK = "#E8EDF2";
const INK = "#10233A";
const MUTED = "#52657A";

/* Seconds after Go. */
const SLIDE = 0.9; // the answer slides down into place
const START = 0.55; // the count starts while the slide finishes
const RAMP = 2; // slow start, up to speed after about two seconds
const RUN = 1; // full speed
const TAIL = 1.9; // the last $10,000, slowing right down
const TAIL_DOLLARS = 10_000;

function percentText(value: number) {
  const twoPlaces = value.toFixed(2);
  return twoPlaces.endsWith("0") ? value.toFixed(1) : twoPlaces;
}

/** Dollars counted at `t` seconds into the count. Speed is continuous until
 *  the tail, where it drops sharply and eases to a stop. */
function countedAt(t: number, total: number) {
  const tail = Math.min(TAIL_DOLLARS, total * 0.25);
  const main = total - tail;
  if (t <= 0) return 0;
  if (t < RAMP) return (main / 2) * (t / RAMP) ** 2;
  if (t < RAMP + RUN) return main / 2 + (main / 2) * ((t - RAMP) / RUN);
  const u = Math.min(1, (t - RAMP - RUN) / TAIL);
  return main + tail * (1 - (1 - u) ** 3);
}

const COUNT_LENGTH = RAMP + RUN + TAIL;

export function FeeAnswer({ run, share = null }: { run: FeeAnswerRun; share?: ReactNode }) {
  const reducedMotion = Boolean(useReducedMotion());

  const projection = buildFeeProjection({
    annualFlatFee: DEFAULT_STATE.annualFlatFee,
    initialInvestment: run.portfolio,
    years: run.years,
    annualFeePercent: run.fee,
    annualFundExpensePercent: 0,
    annualGrowthPercent: run.growth,
  });
  const series = projection.series;
  const last = series[series.length - 1];
  const flatEnding = Math.round(last.withoutFees);
  const feeEnding = Math.round(last.withFees);
  const difference = flatEnding - feeEnding;
  const flatMonthly = formatCurrency(DEFAULT_STATE.annualFlatFee / 12);
  const flatYearly = formatCurrency(DEFAULT_STATE.annualFlatFee);
  const feeText = `${percentText(run.fee)}%`;
  const sharePercent = flatEnding > 0 ? Math.round((difference / flatEnding) * 100) : 0;

  /* The bar's opening grow-in from the left. A motion value driven from an
     effect, because the answer sits inside an AnimatePresence with
     initial={false}, which would switch off a plain `initial` here. It starts
     at 0 on the server and the first client render, so markup matches. */
  const intro = useMotionValue(0);
  useEffect(() => {
    if (reducedMotion) {
      intro.set(1);
      return;
    }
    intro.set(0);
    const controls = animate(intro, 1, { duration: START, ease: "easeOut" });
    return () => controls.stop();
  }, [intro, reducedMotion]);

  /* The one clock: dollars counted so far. */
  const [counted, setCounted] = useState(0);
  useEffect(() => {
    if (reducedMotion || difference <= 0) {
      setCounted(difference);
      return;
    }
    setCounted(0);
    const controls = animate(0, COUNT_LENGTH, {
      delay: START,
      duration: COUNT_LENGTH,
      ease: "linear",
      onUpdate: (t) => setCounted(countedAt(t, difference)),
      onComplete: () => setCounted(difference),
    });
    return () => controls.stop();
  }, [difference, reducedMotion]);

  if (difference <= 0) return null;

  /* The same dollars as a point in time. The main count (all but the last
     $10,000) grows the bars up to the next-to-last year, the way the
     difference grows year by year; the slow last $10,000 grows the final
     year, on the same easing, so the bars and the share bar keep moving
     until the count stops (David, 2026-11-11: "They all need to be the same
     timing."). */
  const gaps = series.map((row) => row.withoutFees - row.withFees);
  const tailDollars = Math.min(TAIL_DOLLARS, difference * 0.25);
  const mainDollars = difference - tailDollars;
  const lastFull = run.years - 1;
  let yearsShown = run.years;
  if (counted < difference) {
    if (counted >= mainDollars) {
      yearsShown = lastFull + (tailDollars > 0 ? (counted - mainDollars) / tailDollars : 1);
    } else {
      const target = mainDollars > 0 ? (counted / mainDollars) * gaps[lastFull] : 0;
      yearsShown = 0;
      for (let k = 1; k <= lastFull; k += 1) {
        if (target >= gaps[k]) {
          yearsShown = k;
          continue;
        }
        const span = gaps[k] - gaps[k - 1];
        yearsShown = k - 1 + (span > 0 ? (target - gaps[k - 1]) / span : 1);
        break;
      }
    }
  }
  /* The bar's two parts at the year shown, as shares of the final $100-a-month value. */
  const lo = Math.min(Math.floor(yearsShown), series.length - 1);
  const hi = Math.min(Math.ceil(yearsShown), series.length - 1);
  const frac = yearsShown - lo;
  const mix = (pick: (row: (typeof series)[number]) => number) => pick(series[lo]) + (pick(series[hi]) - pick(series[lo])) * frac;
  const calmShare = flatEnding > 0 ? Math.max(0, mix((row) => row.withFees) / flatEnding) : 0;
  const redShare = flatEnding > 0 ? Math.max(0, mix((row) => row.withoutFees - row.withFees) / flatEnding) : 0;
  const shownPercent = counted >= difference ? sharePercent : Math.round(redShare * 100);

  /* Bar chart geometry (idea A7): one bar per year from $0. */
  const W = 640;
  const H = 232;
  const padX = 8;
  const top = 50;
  const base = 190;
  const fees = series.slice(1).map((row) => row.annualAdvisoryFeesPaid);
  const maxFee = Math.max(...fees, DEFAULT_STATE.annualFlatFee);
  const slot = (W - padX * 2) / run.years;
  const barWidth = Math.max(3, Math.min(22, slot * 0.72));
  const barX = (year: number) => padX + slot * (year - 0.5) - barWidth / 2;
  const h = (value: number) => (value / maxFee) * (base - top);
  const mid = Math.max(1, Math.round(run.years / 2));
  const marked = [1, mid, run.years].filter((year, index, list) => list.indexOf(year) === index);
  const flatY = base - h(DEFAULT_STATE.annualFlatFee);
  const labelX = (year: number) =>
    year === 1 ? padX : year === run.years ? W - padX : barX(year) + barWidth / 2;
  const anchor = (year: number) => (year === 1 ? "start" : year === run.years ? "end" : "middle");

  return (
    <motion.section
      data-step-answer
      aria-labelledby="fee-answer-heading"
      initial={reducedMotion ? false : { opacity: 0, y: -28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: SLIDE, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col px-4 pb-1 pt-4 text-[#10233A] sm:px-7 sm:pt-6 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-start lg:gap-10"
    >
      <div>
        <h3 id="fee-answer-heading" className="text-base font-bold leading-snug sm:text-lg">
          Estimated advisory-fee difference in ending value
        </h3>
        <p className="mt-1 flex flex-wrap items-baseline gap-x-2" data-step-answer-amount>
          <span className="sr-only">{formatCurrency(difference)}</span>
          <span
            aria-hidden="true"
            className="text-[2.6rem] font-extrabold leading-none tracking-[-0.02em] tabular-nums sm:text-[3.4rem]"
            style={{ color: RED }}
            data-step-answer-count
          >
            {formatCurrency(Math.round(counted))}
          </span>
        </p>
        <p className="mt-2 text-sm leading-snug sm:text-base" style={{ color: MUTED }}>
          Paying {feeText} instead of {flatMonthly} a month. Hypothetical, from your numbers.
        </p>

        {/* The ending values, above the chart (David, 2026-11-11): same type
            scale as the home page's ending-value table; only the Difference
            amount is red. */}
        <div
          className="mt-2 grid max-w-xl grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4 lg:mt-4"
          data-step-answer-rows
        >
          <div className="col-span-2 flex items-baseline justify-between gap-x-3 text-[11px] font-bold uppercase tracking-[0.06em] text-[#52657A] sm:text-[12px] sm:tracking-[0.14em]">
            <p className="min-w-0" data-step-answer-header-left>Ending value after {run.years} years</p>
            <p className="shrink-0 whitespace-nowrap" data-step-answer-header-right>Estimate</p>
          </div>
          <div className="col-span-2 mt-1.5 h-px w-full bg-[#D7E0E8]" />

          <p className="mt-2.5 text-[15px] leading-snug text-[#10233A] sm:text-base">Paying {flatMonthly} a month</p>
          <p
            className="mt-2.5 text-right text-[19px] font-bold leading-none tabular-nums text-[#10233A] sm:text-2xl"
            data-step-answer-flat
          >
            {formatCurrency(flatEnding)}
          </p>

          <p className="mt-2.5 text-[15px] leading-snug text-[#10233A] sm:text-base">Paying {feeText} of assets</p>
          <p
            className="mt-2.5 text-right text-[19px] font-bold leading-none tabular-nums text-[#10233A] sm:text-2xl"
            data-step-answer-fee
          >
            {formatCurrency(feeEnding)}
          </p>

          <div className="col-span-2 mt-2 h-px w-full bg-[#10233A]" />

          <p className="mt-2.5 text-[18px] font-bold leading-snug text-[#10233A] sm:text-xl">Difference</p>
          <p
            className="mt-2.5 text-right text-[19px] font-bold leading-none tabular-nums sm:text-2xl"
            style={{ color: RED }}
            data-step-answer-difference
          >
            <span className="sr-only">{formatCurrency(difference)}</span>
            <span aria-hidden="true">{formatCurrency(Math.round(counted))}</span>
          </p>
        </div>
      </div>

      <div className="mt-3 lg:mt-0">
        <h4 className="text-sm font-bold sm:text-lg">What you would pay for advice, year by year</h4>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="mt-1 block h-auto w-full max-w-3xl"
          role="img"
          aria-label={`Bar chart from $0: at ${feeText} the yearly fee grows from ${formatCurrency(fees[0] ?? 0)} in year 1 to ${formatCurrency(fees[fees.length - 1] ?? 0)} in year ${run.years}, while the flat fee stays ${flatYearly} a year.`}
          data-step-answer-chart
          data-scale-top={Math.round(maxFee)}
        >
          <line x1={padX} x2={padX + 34} y1={16} y2={16} stroke={INK} strokeWidth="5" />
          <text x={padX + 44} y={23} fontSize="21" fontWeight="800" fill={INK}>
            Flat fee: {flatYearly} a year
          </text>
          {fees.map((fee, index) => {
            const year = index + 1;
            const grown = Math.max(0, Math.min(1, yearsShown - index));
            if (grown <= 0) return null;
            const height = h(fee) * grown;
            return (
              <rect
                key={year}
                x={barX(year)}
                y={base - height}
                width={barWidth}
                height={height}
                rx={Math.min(4, barWidth / 3)}
                fill={BAR_RED}
                fillOpacity={marked.includes(year) ? 1 : 0.5}
              />
            );
          })}
          <line x1={padX} x2={W - padX} y1={flatY} y2={flatY} stroke={INK} strokeWidth="5" />
          {marked.map((year) =>
            yearsShown >= year ? (
              <text
                key={`v${year}`}
                x={labelX(year)}
                y={base - h(fees[year - 1]) - 9}
                textAnchor={anchor(year)}
                fontSize={year === run.years ? 23 : 20}
                fontWeight={year === run.years ? 800 : 700}
                fill={INK}
              >
                {formatCurrency(fees[year - 1])}
              </text>
            ) : null,
          )}
          {marked.map((year) => (
            <text key={`y${year}`} x={labelX(year)} y={H - 12} textAnchor={anchor(year)} fontSize="20" fontWeight="600" fill={MUTED}>
              Year {year}
            </text>
          ))}
        </svg>

        {/* Idea A6, as simple as it can be: the ending value at $100 a month.
            Both parts grow from the left over a light track; the red part
            is the share lost to fees. */}
        <div className="mt-3" data-step-answer-share>
          <div
            className="h-[18px] overflow-hidden rounded-[5px]"
            style={{ background: BAR_TRACK }}
            role="img"
            aria-label={`The ending value at ${flatMonthly} a month; ${sharePercent}% of it, ${formatCurrency(difference)}, goes to the ${feeText} fee and the growth it would have earned.`}
            data-step-answer-share-track
          >
            <motion.div
              className="flex h-full w-full"
              style={{ scaleX: intro, originX: 0 }}
            >
              <div className="h-full shrink-0" style={{ width: `${calmShare * 100}%`, background: BAR_CALM }} data-step-answer-share-fill />
              <div className="h-full shrink-0" style={{ width: `${redShare * 100}%`, background: BAR_RED }} data-step-answer-share-red />
            </motion.div>
          </div>
          <p className="mt-2 text-center text-lg font-bold sm:text-xl lg:mt-1.5" data-step-answer-share-text>
            <span className="sr-only">That&rsquo;s {sharePercent}% of your wealth.</span>
            <span aria-hidden="true">
              That&rsquo;s <span className="tabular-nums" style={{ color: RED }}>{shownPercent}%</span> of your wealth.
            </span>
          </p>
        </div>
      </div>

      {/* Share (David, 2026-11-11 3:58 PM, his pick from the options page):
          one green button, centered under the whole answer on every screen,
          with room above and below and one line saying what it sends. "More options" is gone
          here: on a phone the share menu already copies, saves and mails.
          The button is the shared ShareMyResults (kept identical with
          youarepayingtoomuch.com), so only its look in this answer changes;
          where a browser has no share menu it still opens the copy / save
          list, which lands under the line. */}
      {share ? (
        <div
          className="mb-7 mt-7 flex flex-col items-center lg:col-span-2 lg:mt-0 [&>#share-my-results-panel]:order-2 [&>[data-posthog-cta-label='More_sharing_options']]:hidden [&>button:first-of-type:hover]:bg-[#00682B] [&>button:first-of-type]:bg-[#007A2F] [&>button:first-of-type]:shadow-[0_6px_18px_rgba(0,122,47,0.24)]"
          data-step-answer-share-button
        >
          {share}
          <p className="order-1 mt-2.5 text-center text-sm leading-snug" style={{ color: MUTED }} data-step-answer-share-note>
            Sends a picture of your result and a link that reopens it.
          </p>
        </div>
      ) : null}
    </motion.section>
  );
}
