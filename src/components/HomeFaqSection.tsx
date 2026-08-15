"use client";

import { useState, type ReactNode } from "react";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { faqItems } from "@/data/faq";

/**
 * The homepage's whole FAQ, as of 2026-08-14: two questions and a door to the
 * full set on the firm site. It replaces the standalone /faq route, which
 * carried eighteen questions behind a search box, an expand-all control, a
 * "[18] questions" counter and a paragraph of instructions — all of which
 * David cut. The site's job is to move a visitor toward smarterwaywealth.com,
 * not to hold them here reading.
 *
 * Deliberately plain, per his direction: no boxes, no rules between rows. A
 * question is dark grey text you tap; its answer unfolds beneath in lighter
 * grey. The third line looks identical to the two above it so the eye reads
 * all three as one list — but it leaves the site, so it wears the ringed
 * diagonal arrow used everywhere else here to mean "this opens somewhere new".
 *
 * DECISION REVERSED, 2026-08-14: chevrons are back. They were dropped in the
 * first pass at David's request, then restored the same day ("please do now
 * put a chevron with each question") — with nothing but plain text, a visitor
 * had no way to tell the questions were tappable at all. The chevron sits
 * immediately after the question rather than out at the right margin, so on
 * every one of the three lines the affordance touches the words it belongs to.
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

/** One line of the question, so a question can run to two weighted paragraphs.
 *  `className` overrides the shared question styling for that line only. */
type QuestionLine = { content: ReactNode; className?: string };

function FaqLine({
  question,
  answer,
  footnote,
  footnoteMarker,
}: {
  /** One entry per paragraph. Nodes rather than strings so a footnote marker
   *  can sit mid-sentence — David asked for the reference to attach to the
   *  market figure rather than trail the whole question. */
  question: QuestionLine[];
  answer: ReactNode;
  footnote?: string;
  footnoteMarker?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="py-5">
      <button type="button" onClick={() => setOpen((current) => !current)} aria-expanded={open} className={QUESTION_CLASS}>
        {/* Spans, not paragraphs: a <button>'s content model is phrasing
            content, and a block element inside it is invalid markup that
            some engines reflow unpredictably. `block` gives the same result. */}
        {question.map((line, index) => (
          <span key={index} className={`block ${index > 0 ? "mt-2 " : ""}${line.className ?? ""}`}>
            {line.content}
            {index === question.length - 1 ? (
              <ChevronDown
                aria-hidden="true"
                strokeWidth={2.5}
                className={`ml-1.5 inline-block h-4 w-4 shrink-0 align-[-3px] text-[#007A2F] transition-transform duration-200 ${
                  open ? "rotate-180" : ""
                }`}
              />
            ) : null}
          </span>
        ))}
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
              question={[{ content: KEPT_QUESTION_LABEL }]}
              answer={keptParagraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 32)} className={ANSWER_CLASS}>
                  {paragraph}
                </p>
              ))}
            />
          ) : null}

          <FaqLine
            /* One paragraph (David, 2026-08-15: collapse the market-fact
               setup and the question into a single paragraph rather than two
               weighted lines). The reference marker still sits with the
               figure it qualifies rather than at the end of the sentence. */
            question={[
              {
                content: (
                  <>
                    The S&amp;P 500 and my portfolio have both doubled over the past few years.
                    <sup className="ml-0.5 font-normal text-[#6E7883]">1</sup> Does that mean my advisor is doing
                    twice as much work?
                  </>
                ),
              },
            ]}
            answer={
              <p className={ANSWER_CLASS}>
                A rhetorical question is a figure of speech framed as a question but meant to make a statement
                rather than get an answer.{" "}
                <strong className="font-semibold text-[#333B45]">
                  The speaker asks it to emphasize a point, create a dramatic effect, or make the listener think.
                </strong>
              </p>
            }
            footnote={RHETORICAL_FOOTNOTE}
            footnoteMarker="1"
          />

          {/* Same weight and ink as the two questions above, so the three read
              as one list — but this one leaves the site, hence the ringed
              diagonal arrow this project uses for every outbound door. The
              arrow sits right after the words rather than out at the right
              margin (David, 2026-08-14: "Put the narrow circle closer to
              it"), which also matches where the questions' chevrons sit. */}
          <div className="py-5">
            <a
              href="https://smarterwaywealth.com/faq"
              target="_blank"
              rel="noreferrer"
              data-posthog-cta="true"
              data-posthog-cta-label="Read all FAQs on Smarter Way Wealth"
              data-posthog-cta-location="home_faq_all_questions"
              className="group inline-block !no-underline"
            >
              {/* The arrow is inside the text span, not a flex sibling, so it
                  wraps with the words and sits immediately after the final
                  full stop at every width. As a sibling it drifted to the far
                  right of the block whenever the line wrapped. */}
              <span className="text-[17px] font-semibold leading-7 !text-[#333B45] transition-colors duration-150 group-hover:!text-[#10233A] sm:text-lg">
                Read all of the FAQs on smarterwaywealth.com.
                <span
                  aria-hidden="true"
                  className="ml-2 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white align-middle ring-1 ring-inset ring-[#CFD6DF] transition-colors duration-200 group-hover:bg-[#F2FBF5] group-hover:ring-[#00A540]"
                >
                  <ArrowUpRight className="h-4 w-4 text-[#007A2F]" strokeWidth={2.5} />
                </span>
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
