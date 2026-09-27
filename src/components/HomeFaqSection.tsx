"use client";

import { useState, type ReactNode } from "react";
import { ExternalLink, ChevronRight } from "lucide-react";
import { faqItems } from "@/data/faq";

const KEPT_FAQ_ID = "afford-100-per-month";

const KEPT_QUESTION_LABEL = "How can you offer these services for only $100/month?";

const AFFORDABILITY_FOOTNOTE =
  "AI is not used for any financial advice or recommendations.";

const ACCOUNTS_FAQ_ID = "do-i-have-to-move-my-assets";

const ACCOUNTS_QUESTION_LABEL = "Do I need to move my accounts to become a client?";

const RHETORICAL_FOOTNOTE =
  "S&P 500 total return, January 2023 through July 2026. Index performance is not the performance of any client account. Past performance does not guarantee future results.";

const ROW_X = "px-4 sm:px-6";
const ROW_Y = "py-4 sm:py-5";
const ANSWER_INSET = "pl-12 pr-4 sm:pl-14 sm:pr-6";

const TEXT_SIZE = "text-[17px] leading-7 sm:text-lg";

const QUESTION_CLASS = `min-w-0 transition-colors duration-200 ${TEXT_SIZE}`;

const ANSWER_CLASS = `text-[#10233A] ${TEXT_SIZE}`;

const QUESTION_INK_CLOSED = "text-[#333B45]";
const QUESTION_INK_OPEN = "text-[#8A939E]";

const ROW_FOCUS =
  "focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-[-3px] focus-visible:outline-[#064B84]";

type FaqTone = "light" | "blues";

/* Presentation per front door. "light" is the green home exactly as before;
   "blues" sits the same white card on the One Percent Blues gradient
   (src/app/(blues)), with the accents in that page's blue. */
const FAQ_TONES: Record<
  FaqTone,
  { section: string; heading: string; chevron: string; arrow: string; doorHover: string }
> = {
  light: {
    section: "bg-[#EEF0F5]",
    heading: "text-[#10233A]",
    chevron: "text-[#007A2F]",
    arrow: "text-[#007A2F]",
    doorHover: "group-hover:bg-[#F2FBF5] group-hover:ring-[#00A540]",
  },
  blues: {
    section: "bg-transparent",
    heading: "text-white",
    chevron: "text-[#2563EB]",
    arrow: "text-[#2563EB]",
    doorHover: "group-hover:bg-[#EEF3FF] group-hover:ring-[#2563EB]",
  },
};

function FaqRow({
  question,
  answer,
  footnote,
  footnoteMarker,
  chevronClassName,
}: {
  chevronClassName: string;
  question: ReactNode;
  answer: ReactNode;
  footnote?: string;
  footnoteMarker?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className={`group flex w-full items-start gap-3 text-left transition-colors duration-150 hover:bg-[#F5F8FB] ${ROW_X} ${ROW_Y} ${ROW_FOCUS}`}
      >
        <ChevronRight
          aria-hidden="true"
          strokeWidth={2.75}
          className={`mt-0.5 h-5 w-5 shrink-0 ${chevronClassName} transition-transform duration-200 ${
            open ? "rotate-90" : ""
          }`}
        />
        <span className={`${QUESTION_CLASS} ${open ? QUESTION_INK_OPEN : QUESTION_INK_CLOSED}`}>
          {question}
        </span>
      </button>

      {open ? (
        <div className={`pb-5 sm:pb-6 ${ANSWER_INSET}`}>
          <div className="max-w-3xl space-y-3">{answer}</div>
          {footnote ? (
            <div className="mt-5 max-w-3xl border-t border-[#E7ECF2] pt-3">
              <p className="text-xs leading-5 text-[#8A939E]">
                <sup className="mr-0.5">{footnoteMarker}</sup>
                {footnote}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/* The stored answers were written for a page that listed all eighteen
   questions, so some end with a "See also:" pointing at siblings. Only three
   questions live here now, so those pointers would send the reader after
   questions this page does not have. Dropped at render rather than edited out
   of the data, because the full set still carries them — and they are still
   correct — on smarterwaywealth.com. */
function storedAnswer(id: string) {
  const item = faqItems.find((entry) => entry.id === id);
  if (!item) return null;

  return (item.answer ?? "")
    .split("\n\n")
    .filter((paragraph) => !paragraph.trimStart().startsWith("See also:"))
    .filter((paragraph) => !paragraph.trimStart().startsWith("* AI is not used"))
    .map((paragraph) => (
      <p key={paragraph.slice(0, 32)} className={ANSWER_CLASS}>
        {paragraph.split("*").map((part, i) =>
          i === 0 ? part : [<sup key={i} className="ml-0.5 text-[#6E7883]">*</sup>, part],
        )}
      </p>
    ));
}

export function HomeFaqSection({
  tone = "light",
  topPaddingClassName = "pt-10 sm:pt-14",
}: { tone?: FaqTone; topPaddingClassName?: string } = {}) {
  const t = FAQ_TONES[tone];
  const keptAnswer = storedAnswer(KEPT_FAQ_ID);
  const accountsAnswer = storedAnswer(ACCOUNTS_FAQ_ID);

  return (
    <section
      id="faq"
      aria-labelledby="home-faq-heading"
      className={`w-full scroll-mt-24 ${t.section} px-4 pb-16 ${topPaddingClassName} sm:px-6 sm:pb-20`}
    >
      <div className="mx-auto max-w-3xl">
        <div className="relative inline-block pt-10">
          <span
            aria-hidden="true"
            className={`absolute left-0 top-0 flex flex-col items-center ${t.heading}`}
          >
            <span className="translate-x-[0.85em] rotate-[-4deg] font-serif text-xl font-[800] italic leading-none sm:text-2xl">
              Very
            </span>
            <span className="-mt-0.5 text-lg font-black leading-none">⌄</span>
          </span>
          <h2
            id="home-faq-heading"
            className={`pl-[1.5ch] text-3xl font-black tracking-tight ${t.heading} sm:text-4xl`}
          >
            Frequently Asked Questions
          </h2>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-[#DDE4EC] bg-white shadow-[0_12px_32px_rgba(17,33,52,0.06)]">
          <div className="divide-y divide-[#EAEFF4]">
            {keptAnswer ? (
              <FaqRow
                question={
                  <span className="font-bold">
                    {KEPT_QUESTION_LABEL}
                    <sup className="ml-0.5 font-normal text-[#6E7883]">*</sup>
                  </span>
                }
                answer={keptAnswer}
                footnote={AFFORDABILITY_FOOTNOTE}
                footnoteMarker="*"
                chevronClassName={t.chevron}
              />
            ) : null}

            <FaqRow
              question={
                <>
                  <span className="font-normal">
                    The S&amp;P 500, my portfolio, and my advisory fees have all doubled in the past few years.<sup className="font-normal">1</sup>
                  </span>{" "}
                  <span className="font-bold">
                    Does that mean my advisor is doing double the work?
                  </span>
                </>
              }
              answer={
                <p className={ANSWER_CLASS}>
                  &ldquo;A{" "}
                  <em className="font-[440]">rhetorical question</em>{" "}
                  is a figure of speech framed as a question but meant to make a statement rather
                  than get an answer. The writer asks it to emphasize a point, create a dramatic
                  effect, or make the reader think.&rdquo;
                </p>
              }
              footnote={RHETORICAL_FOOTNOTE}
              footnoteMarker="1"
              chevronClassName={t.chevron}
            />

            {accountsAnswer ? (
              <FaqRow
                question={<span className="font-bold">{ACCOUNTS_QUESTION_LABEL}</span>}
                answer={accountsAnswer}
                chevronClassName={t.chevron}
              />
            ) : null}

            <div className="bg-[#F7F9FB]">
              <a
                href="https://smarterwaywealth.com/faq"
                target="_blank"
                rel="noreferrer"
                data-posthog-cta="true"
                data-posthog-cta-label="Read all FAQs on Smarter Way Wealth"
                data-posthog-cta-location="home_faq_all_questions"
                className={`group block !no-underline transition-colors duration-150 hover:bg-[#F1F6F3] ${ROW_X} ${ROW_Y} ${ROW_FOCUS}`}
              >
                <span className="block">
                  <span className="text-[17px] font-semibold leading-7 !text-[#333B45] transition-colors duration-150 group-hover:!text-[#10233A] sm:text-lg">
                    Read all of the FAQs on smarterwaywealth.com.
                    <ExternalLink
                      aria-hidden="true"
                      className={`ml-1.5 inline-block h-[1.25em] w-[1.25em] shrink-0 -translate-y-px align-middle transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 ${t.arrow}`}
                      strokeWidth={2.5}
                    />
                  </span>
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
