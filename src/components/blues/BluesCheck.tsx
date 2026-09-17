"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { disclaimerHref } from "@/config/calculatorNotes";
import {
  bluesCheckQuestions,
  bluesCopy,
  bluesDiagnoses,
  diagnoseBlues,
  parseBluesAnswers,
  type BluesAnswer,
  type BluesAnswers,
  type BluesQuestionId,
} from "@/config/onePercentBlues";
import { formatCurrency } from "@/lib/format";
import { capturePostHogEvent } from "@/lib/posthog";
import type { BluesOpeningProps } from "./BluesOpening";

const ANSWER_BUTTON =
  "flex min-h-[46px] items-center justify-center rounded-xl border-[1.5px] px-3 text-[15px] font-semibold transition-colors focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]";
const ANSWER_ON = "border-[#2563EB] bg-[#2563EB] text-white";
const ANSWER_OFF = "border-[#C7D7FF] bg-white text-[#0B1A44] hover:bg-[#F3F6FF]";

/** Three yes/no cards, then the diagnosis card once all three are answered.
 *
 *  Renders two siblings (the questions, the card) rather than one wrapper so
 *  BluesOpening's desktop grid can place the card under the copy and the
 *  questions beside it, while a phone reads copy → questions → card in DOM
 *  order. The card is conditional (David's brief): nothing to diagnose until
 *  the visitor has answered. */
export function BluesCheck({
  savings,
  portfolioValue,
  years,
  annualGrowthPercent,
  annualFeePercent,
  annualFlatFee,
  initialCheck,
}: BluesOpeningProps) {
  const [answers, setAnswers] = useState<BluesAnswers>(() => parseBluesAnswers(initialCheck));
  const completedRef = useRef(false);
  const reduceMotion = useReducedMotion();
  const diagnosis = diagnoseBlues(answers);
  const cardRef = useRef<HTMLElement | null>(null);
  const scrolledRef = useRef(false);

  /* On a phone the third answer sits near the bottom of the screen and the
     card renders below it, so the payoff would land under the fold. The first
     time the card appears, bring it into view if it is not already there. */
  useEffect(() => {
    if (!diagnosis || scrolledRef.current) return;
    scrolledRef.current = true;
    const frame = window.requestAnimationFrame(() => {
      const card = cardRef.current;
      if (!card) return;
      if (card.getBoundingClientRect().top > window.innerHeight - 120) {
        card.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [diagnosis, reduceMotion]);

  const answer = useCallback((id: BluesQuestionId, value: BluesAnswer) => {
    setAnswers((prev) => {
      const next = { ...prev, [id]: value };
      capturePostHogEvent("blues_check_answered", { question: id, answer: value });
      const result = diagnoseBlues(next);
      if (result && !completedRef.current) {
        completedRef.current = true;
        capturePostHogEvent("blues_check_completed", { diagnosis: result });
      }
      return next;
    });
  }, []);

  return (
    <>
      <div className="mt-5 flex flex-col gap-3 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-0">
        {bluesCheckQuestions.map((question, index) => {
          const labelId = `blues-${question.id}-label`;
          const current = answers[question.id];
          return (
            <div
              key={question.id}
              role="group"
              aria-labelledby={labelId}
              className="rounded-[20px] bg-white px-4 pb-3.5 pt-4 text-[#0B1A44] shadow-[0_18px_40px_rgba(11,26,68,0.22)]"
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#2563EB]">
                Question {index + 1} of 3
              </p>
              <p id={labelId} className="mt-1.5 font-blues-serif text-[22px] font-semibold leading-[1.15]">
                {question.prompt}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  aria-pressed={current === "yes"}
                  onClick={() => answer(question.id, "yes")}
                  className={`${ANSWER_BUTTON} ${current === "yes" ? ANSWER_ON : ANSWER_OFF}`}
                >
                  {question.yesLabel}
                </button>
                <button
                  type="button"
                  aria-pressed={current === "no"}
                  onClick={() => answer(question.id, "no")}
                  className={`${ANSWER_BUTTON} ${current === "no" ? ANSWER_ON : ANSWER_OFF}`}
                >
                  {question.noLabel}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="lg:col-start-1 lg:row-start-2" aria-live="polite">
        <AnimatePresence initial={false}>
          {diagnosis ? (
            <motion.section
              ref={cardRef}
              key={diagnosis}
              id="diagnosis"
              aria-labelledby="blues-diagnosis-heading"
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: 8 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="mt-3 rounded-[22px] border border-white/15 bg-[#1E3A8A] px-[18px] py-5 text-white shadow-[0_22px_50px_rgba(11,26,68,0.35)] lg:mt-0"
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#93C5FD]">
                {bluesCopy.diagnosisEyebrow}
              </p>
              <h3
                id="blues-diagnosis-heading"
                className="mt-1.5 font-blues-serif text-[30px] font-semibold leading-[1.05]"
              >
                {bluesDiagnoses[diagnosis].heading}
              </h3>
              <p className="mt-2 text-[15px] leading-6 text-white/85">{bluesDiagnoses[diagnosis].lead}</p>
              <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.12em] text-[#93C5FD]">
                {bluesCopy.numberLabel}
              </p>
              <p
                className="mt-1 font-blues-serif text-[clamp(48px,14vw,84px)] font-bold leading-none tracking-[-0.03em] tabular-nums"
                data-blues-savings={Math.round(savings)}
              >
                {formatCurrency(savings)}
                <a
                  href={disclaimerHref}
                  aria-label="See the calculator disclaimer"
                  className="ml-1 align-super text-[0.4em] font-bold !text-white/70 !no-underline"
                >
                  *
                </a>
              </p>
              <p className="mt-1 text-[13px] leading-[1.45] text-white/85">
                Projected {years}-year difference between a {annualFeePercent.toFixed(2)}% asset-based fee and{" "}
                {formatCurrency(annualFlatFee / 12)}/month flat, on {formatCurrency(portfolioValue)} at{" "}
                {annualGrowthPercent.toFixed(1)}% growth. Hypothetical, adjustable, not a guarantee.
              </p>
              <div className="mt-3.5 grid grid-cols-1 gap-2 sm:grid-cols-3">
                {bluesCopy.tiles.map((tile) => (
                  <div key={tile.label} className="rounded-[14px] bg-white/10 px-3.5 py-3 text-sm leading-[1.4]">
                    <p className="mb-0.5 text-xs font-bold uppercase tracking-[0.1em] text-[#93C5FD]">{tile.label}</p>
                    {tile.body}
                  </div>
                ))}
              </div>
              <a
                href={bluesCopy.primaryCta.href}
                className="mt-4 flex min-h-[54px] items-center justify-center rounded-[14px] bg-white px-4 text-center text-base font-bold !text-[#1E3A8A] !no-underline transition-colors hover:bg-[#EEF3FF]"
                data-posthog-cta="true"
                data-posthog-cta-label={bluesCopy.primaryCta.label}
                data-posthog-cta-location="blues_diagnosis_meet"
              >
                {bluesCopy.primaryCta.label}
              </a>
              {/* One button, one link — the site's single conversion pattern
                  (src/config/signupCta.ts): the secondary step is a plain
                  underlined link, never a second button of equal weight. */}
              <a
                href={bluesCopy.secondaryCta.href}
                className="mt-3 block min-h-11 py-2 text-center text-[15px] font-semibold !text-white underline decoration-white/50 underline-offset-4 transition-colors hover:decoration-white"
                data-posthog-cta="true"
                data-posthog-cta-label={bluesCopy.secondaryCta.label}
                data-posthog-cta-location="blues_diagnosis_calculator"
              >
                {bluesCopy.secondaryCta.label}
              </a>
            </motion.section>
          ) : null}
        </AnimatePresence>
      </div>
    </>
  );
}
