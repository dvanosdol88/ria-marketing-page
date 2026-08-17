"use client";

import { useState, type ReactNode } from "react";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import { faqItems } from "@/data/faq";

/**
 * The homepage's whole FAQ, as of 2026-08-14: two questions and a door to the
 * full set on the firm site. It replaces the standalone /faq route, which
 * carried eighteen questions behind a search box, an expand-all control, a
 * "[18] questions" counter and a paragraph of instructions — all of which
 * David cut. The site's job is to move a visitor toward smarterwaywealth.com,
 * not to hold them here reading.
 *
 * PRESENTATION REVERSED, 2026-08-16 (David: "the entire section kind of feels
 * like an afterthought"). It did, and for a structural reason: it was the only
 * block on the page with no container of its own, so three lines of loose text
 * fell out of the bottom of the solid-green visit card and the eye read them as
 * spill rather than as a section. The earlier "deliberately plain — no boxes,
 * no rules between rows" direction is what produced that, so it is retired
 * here. The questions now sit in one white card in the same family as the
 * calculator's own cards (hairline border, soft shadow, hairline rules between
 * rows), which also buys three things the plain version could not have:
 *   - a real tap target. The whole row is the button now, not just the glyphs;
 *     at 375px that is a ~60px-tall strip instead of a line of text.
 *   - consistent rhythm. Every row is the same padding off one shared
 *     constant, so open and closed rows cannot drift apart (David #9).
 *   - a left gutter, which is where the chevron went (David #6).
 *
 * CHEVRON, moved left 2026-08-16. It was trailing the final word of the
 * question, which put it in a different place on every row and, on a question
 * that wrapped, at the end of the last line — the bottom of the block. As a
 * right-pointing ">" in a fixed left gutter it sits in one column down the
 * whole card, rotating 90° to point down when its answer is open. The answer
 * hangs to that same column so a question and its answer share a left edge.
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

/** Third question, added 2026-08-16 at David's request. The data file already
 *  answers this one — as "Do I have to move my assets?" — and its stored answer
 *  opens with the "No." he asked for, then earns it: you keep Fidelity or
 *  Schwab, the assets stay in your name, the firm never takes custody, and the
 *  statements still come from the custodian. Same treatment as the kept
 *  question above: David's phrasing on the outside, the approved answer
 *  untouched underneath, so this page never becomes a second source for an
 *  answer the firm site also gives. */
const ACCOUNTS_FAQ_ID = "do-i-have-to-move-my-assets";

const ACCOUNTS_QUESTION_LABEL = "Do I need to move my accounts to become a client?";

/** Placeholder attribution, per David: "add a footnote and we will get the
 *  attribution in the next round." It states the measure and the period and
 *  carries the required past-performance language, so the page is not making
 *  an unqualified performance claim while the source line is pending. */
const RHETORICAL_FOOTNOTE =
  "S&P 500 total return, January 2023 through July 2026. Index performance is not the performance of any client account. Past performance does not guarantee future results.";

/* One source for the row geometry, because David's #9 was that the gaps
   between questions be consistent and the surest way to keep them that way is
   to leave no second place to set them. ROW_X is the horizontal inset shared
   by every row; ANSWER_INSET is that same inset plus the chevron gutter
   (20px icon + 12px gap), so an answer's left edge lands under the first
   letter of its question rather than under the chevron. */
const ROW_X = "px-4 sm:px-6";
const ROW_Y = "py-4 sm:py-5";
const ANSWER_INSET = "pl-12 pr-4 sm:pl-14 sm:pr-6";

/* Question and answer are the SAME size now (David, 2026-08-16 #4). The answer
   used to be a step smaller, which is the ordinary way to say "supporting
   text" — but here the answer is the payload and the question is only the
   handle you grab it by, so size no longer carries that hierarchy. Colour does
   instead: see FOCUS below. */
const TEXT_SIZE = "text-[17px] leading-7 sm:text-lg";

const QUESTION_CLASS = `min-w-0 transition-colors duration-200 ${TEXT_SIZE}`;

const ANSWER_CLASS = `text-[#10233A] ${TEXT_SIZE}`;

/* David, 2026-08-16 #5: "when the answer is toggled ON, make the text black,
   and the QUESTION text grey, so that the answer is more of the focus." A
   closed question is the darkest thing in its row because it is the only thing
   in it; the moment its answer appears the question steps back to grey and the
   answer takes the near-black. Nothing moves and nothing resizes — the ink
   just changes hands. */
const QUESTION_INK_CLOSED = "text-[#333B45]";
const QUESTION_INK_OPEN = "text-[#8A939E]";

const ROW_FOCUS =
  "focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-[-3px] focus-visible:outline-[#064B84]";

function FaqRow({
  question,
  answer,
  footnote,
  footnoteMarker,
}: {
  /** A node rather than a string so a footnote marker can sit mid-sentence and
   *  so a question can carry its own per-sentence weights — David's #4: the
   *  sentence that sets a question up is normal weight, the sentence that asks
   *  it is heavy. */
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
        {/* mt-0.5 rather than centred: the glyph should sit on the FIRST line
            of a question that wraps to two, not halfway down the block. */}
        <ChevronRight
          aria-hidden="true"
          strokeWidth={2.75}
          className={`mt-0.5 h-5 w-5 shrink-0 text-[#007A2F] transition-transform duration-200 ${
            open ? "rotate-90" : ""
          }`}
        />
        {/* A span, not a paragraph: a <button>'s content model is phrasing
            content, and a block element inside it is invalid markup that some
            engines reflow unpredictably. */}
        <span className={`${QUESTION_CLASS} ${open ? QUESTION_INK_OPEN : QUESTION_INK_CLOSED}`}>
          {question}
        </span>
      </button>

      {open ? (
        <div className={`pb-5 sm:pb-6 ${ANSWER_INSET}`}>
          <div className="max-w-3xl space-y-3">{answer}</div>
          {footnote ? (
            /* David's #8: the footnote used to run straight on from the answer
               in nothing but a smaller grey, so it read as a third paragraph.
               A hairline and real space above it make it a different kind of
               text — the note under the line, not the end of the answer. */
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
    .map((paragraph) => (
      <p key={paragraph.slice(0, 32)} className={ANSWER_CLASS}>
        {paragraph}
      </p>
    ));
}

export function HomeFaqSection() {
  const keptAnswer = storedAnswer(KEPT_FAQ_ID);
  const accountsAnswer = storedAnswer(ACCOUNTS_FAQ_ID);

  return (
    <section
      id="faq"
      aria-labelledby="home-faq-heading"
      className="w-full scroll-mt-24 bg-[#EEF0F5] px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-14"
    >
      <div className="mx-auto max-w-3xl">
        <h2
          id="home-faq-heading"
          className="text-3xl font-black tracking-tight text-[#10233A] sm:text-4xl"
        >
          Frequently Asked Questions
        </h2>

        <div className="mt-6 overflow-hidden rounded-2xl border border-[#DDE4EC] bg-white shadow-[0_12px_32px_rgba(17,33,52,0.06)]">
          <div className="divide-y divide-[#EAEFF4]">
            {keptAnswer ? (
              <FaqRow
                question={<span className="font-bold">{KEPT_QUESTION_LABEL}</span>}
                answer={keptAnswer}
              />
            ) : null}

            <FaqRow
              /* One paragraph, two weights (David, 2026-08-15 for the single
                 paragraph; 2026-08-16 for the weights). The market fact is the
                 setup and carries the reference marker for the figure it
                 qualifies; the question itself is the heavy half, because that
                 is the line doing the work. */
              question={
                <>
                  <span className="font-normal">
                    The S&amp;P 500 and my portfolio have both doubled over the past few years.
                    <sup className="ml-0.5 font-normal text-[#6E7883]">1</sup>
                  </span>{" "}
                  <span className="font-bold">
                    Does that mean my advisor is doing twice as much work?
                  </span>
                </>
              }
              /* One weight throughout and inside quotation marks (David,
                 2026-08-16). Half of it used to be bold, which read as the
                 answer emphasising itself; the whole thing is one borrowed
                 definition, so it is set as one quotation. "Listener" became
                 "reader", then "speaker" became "writer" the same day — nobody
                 is speaking to, or listening on, a web page.

                 The defined term is set the way a dictionary sets one: <em>
                 for the italic, +10% on the size and 440 on the weight (David:
                 "about 10% heavier and 10% larger"). Both are relative rather
                 than fixed — 1.1em tracks whatever the answer size is, and 440
                 is a real value because Inter is loaded as a variable font, so
                 this is a genuine 10% step up from 400 rather than the 25%
                 jump that font-medium would have been. */
              answer={
                <p className={ANSWER_CLASS}>
                  {/* Explicit {" "} on BOTH sides of the <em>. JSX drops the
                      space that sits between an element and a text node when
                      the line wraps there, which is exactly how this rendered
                      "rhetorical questionis a figure of speech" the first
                      time. */}
                  &ldquo;A{" "}
                  <em className="text-[1.1em] font-[440]">rhetorical question</em>{" "}
                  is a figure of speech framed as a question but meant to make a statement rather
                  than get an answer. The writer asks it to emphasize a point, create a dramatic
                  effect, or make the reader think.&rdquo;
                </p>
              }
              footnote={RHETORICAL_FOOTNOTE}
              footnoteMarker="1"
            />

            {/* Added 2026-08-16 (David). Third and last question before the
                door out. */}
            {accountsAnswer ? (
              <FaqRow
                question={<span className="font-bold">{ACCOUNTS_QUESTION_LABEL}</span>}
                answer={accountsAnswer}
              />
            ) : null}

            {/* The door out, and the last row of the same card. It is indented
                to the answer column so all three rows share a left edge, but it
                is not a question: it wears the tinted ground of a card footer
                and the ringed diagonal arrow this project uses for every
                outbound link. The arrow stays immediately after the words
                rather than out at the right margin (David, 2026-08-14: "Put the
                narrow circle closer to it") — it is inside the text span, not a
                flex sibling, so it wraps with the sentence instead of drifting
                to the far right whenever the line breaks. */}
            <div className="bg-[#F7F9FB]">
              <a
                href="https://smarterwaywealth.com/faq"
                target="_blank"
                rel="noreferrer"
                data-posthog-cta="true"
                data-posthog-cta-label="Read all FAQs on Smarter Way Wealth"
                data-posthog-cta-location="home_faq_all_questions"
                className={`group block !no-underline transition-colors duration-150 hover:bg-[#F1F6F3] ${ROW_Y} ${ANSWER_INSET} ${ROW_FOCUS}`}
              >
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
      </div>
    </section>
  );
}
