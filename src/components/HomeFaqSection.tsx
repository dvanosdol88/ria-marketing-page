"use client";

import { useState, type ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { faqItems } from "@/data/faq";

/**
 * The homepage's whole FAQ, as of 2026-08-14: two questions and a door to the
 * full set on the firm site. It replaces the standalone /faq route, which
 * carried eighteen questions behind a search box, an expand-all control, a
 * "[18] questions" counter and a paragraph of instructions — all of which
 * David cut. The site's job is to move a visitor toward smarterwaywealth.com,
 * not to hold them here reading.
 *
 * Deliberately plain, per his direction: no boxes, no chevrons, no rules
 * between rows. A question is dark grey text you tap; its answer unfolds
 * beneath in lighter grey. The third line looks identical to the two above it
 * so the eye reads all three as one list — but it leaves the site, so it wears
 * the same ringed diagonal arrow used everywhere else here to mean "this opens
 * somewhere new".
 *
 * The section heading is set large and near-black rather than as a small green
 * kicker (David, 2026-08-14): "Because both questions make important points,
 * we want to draw attention to it."
 */

/** The one existing question David kept. Pulled from the shared FAQ data
 *  rather than retyped, so its approved answer has exactly one source. */
const KEPT_FAQ_ID = "afford-100-per-month";

/** David's wording for the kept question (2026-08-14), which differs slightly
 *  from the stored "$100/mo" phrasing. The ANSWER still comes from the data
 *  file untouched. */
const KEPT_QUESTION_LABEL = "How can you afford to do this for $100 a month?";

/** Placeholder attribution, per David: "add a footnote and we will get the
 *  attribution in the next round." It states the measure and the period and
 *  carries the required past-performance language, so the page is not making
 *  an unqualified performance claim while the source line is pending. */
const RHETORICAL_FOOTNOTE =
  "S&P 500 total return, January 2023 through July 2026. Index performance is not the performance of any client account. Past performance does not guarantee future results.";

const QUESTION_CLASS =
  "block w-full text-left text-[17px] font-semibold leading-7 text-[#333B45] transition-colors duration-150 hover:text-[#10233A] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[#064B84] sm:text-lg";

const ANSWER_CLASS = "mt-2.5 max-w-3xl text-[15px] leading-7 text-[#6E7883] sm:text-base";

function FaqLine({
  question,
  answer,
  footnote,
  footnoteMarker,
}: {
  /** A node rather than a string so a marker can sit mid-sentence — David
   *  asked for the reference to land right after "2026" rather than trailing
   *  the whole question. */
  question: ReactNode;
  answer: ReactNode;
  footnote?: string;
  footnoteMarker?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="py-5">
      <button type="button" onClick={() => setOpen((current) => !current)} aria-expanded={open} className={QUESTION_CLASS}>
        {question}
      </button>
      {open ? (
        <div>
          {answer}
          {footnote ? (
            <p className="mt-3 max-w-3xl text-xs leading-5 text-[#8A939E]">
              <sup className="mr-0.5">{footnoteMarker}</sup>
              {footnote}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function HomeFaqSection() {
  const kept = faqItems.find((item) => item.id === KEPT_FAQ_ID);

  /* The stored answers were written for a page that listed all eighteen
     questions, so some end with a "See also:" pointing at siblings. Only two
     questions live here now, so those pointers would send the reader after
     questions this page does not have. Dropped at render rather than edited
     out of the data, because the full set still carries them — and they are
     still correct — on smarterwaywealth.com. */
  const keptParagraphs = (kept?.answer ?? "")
    .split("\n\n")
    .filter((paragraph) => !paragraph.trimStart().startsWith("See also:"));

  return (
    <section id="faq" aria-labelledby="home-faq-heading" className="w-full scroll-mt-24 bg-[#EEF0F5] px-4 pb-16 pt-4 sm:px-6 sm:pb-20">
      <div className="mx-auto max-w-3xl">
        <h2
          id="home-faq-heading"
          className="text-3xl font-black tracking-tight text-[#10233A] sm:text-4xl"
        >
          Frequently Asked Questions
        </h2>

        <div className="mt-5">
          {kept ? (
            <FaqLine
              question={KEPT_QUESTION_LABEL}
              answer={keptParagraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 32)} className={ANSWER_CLASS}>
                  {paragraph}
                </p>
              ))}
            />
          ) : null}

          <FaqLine
            /* The reference marker sits immediately after "2026" rather than at
               the end of the question, so it attaches to the figure it
               qualifies instead of to the joke (David, 2026-08-14). */
            question={
              <>
                My portfolio kept pace with the S&amp;P 500 from the start of 2023 through the end of July 2026
                <sup className="ml-0.5 font-normal text-[#6E7883]">1</sup> and is up just over 100%. Does that mean my
                advisor is doing twice as much work?
              </>
            }
            answer={
              <>
                {/* Two beats, deliberately weighted: the definition arrives
                    light and deadpan, then the point it exists to make lands
                    in its own paragraph, heavier and darker (David). */}
                <p className={`${ANSWER_CLASS} font-normal`}>
                  Luckily, a rhetorical question is a figure of speech framed as a question but meant to make a
                  statement rather than get an answer.
                </p>
                <p className="mt-3 max-w-3xl text-[15px] font-semibold leading-7 text-[#333B45] sm:text-base">
                  The speaker asks it to emphasize a point, create a dramatic effect, or make the listener think.
                </p>
              </>
            }
            footnote={RHETORICAL_FOOTNOTE}
            footnoteMarker="1"
          />

          {/* Same weight and ink as the two questions above, so the three read
              as one list — but this one leaves the site, hence the ringed
              diagonal arrow this project uses for every outbound door. */}
          <div className="py-5">
            <a
              href="https://smarterwaywealth.com/faq"
              target="_blank"
              rel="noreferrer"
              data-posthog-cta="true"
              data-posthog-cta-label="Read all FAQs on Smarter Way Wealth"
              data-posthog-cta-location="home_faq_all_questions"
              className="group flex items-start justify-between gap-4 !no-underline"
            >
              <span className="text-[17px] font-semibold leading-7 !text-[#333B45] transition-colors duration-150 group-hover:!text-[#10233A] sm:text-lg">
                Read all of the frequently asked questions on smarterwaywealth.com
              </span>
              <span
                aria-hidden="true"
                className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white ring-1 ring-inset ring-[#CFD6DF] transition-colors duration-200 group-hover:bg-[#F2FBF5] group-hover:ring-[#00A540]"
              >
                <ArrowUpRight className="h-4 w-4 text-[#007A2F]" strokeWidth={2.5} />
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
