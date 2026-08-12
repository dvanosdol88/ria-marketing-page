import {
  CALCULATOR_DISCLAIMER,
  CALCULATOR_NOTES_ANCHOR,
  disclaimerHref,
} from "@/config/calculatorNotes";

/**
 * The marker beside a figure the disclaimer governs.
 *
 * An asterisk in the muted grey, not a numeral in the figure's own colour.
 * There is only one note on this page, so a number implied a list that does not
 * exist, and at the hero's size it read as loudly as the dollar figure it was
 * annotating (David, 2026-08-12).
 *
 * Still a real link, which is what it gained when it stopped being a bare
 * asterisk: one tap reaches the disclaimer, and a screen reader announces where
 * it goes rather than reading "star". Padding grows the hit box without growing
 * the line box, so the marker keeps its footnote scale while staying tappable
 * with a thumb — the bare glyph was roughly 4x9px.
 */
export function NoteMarker() {
  return (
    <a
      href={disclaimerHref}
      className="-my-2 ml-[0.08em] inline-block px-1.5 py-2 align-super text-[0.5em] font-bold !text-[#52657A] !no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#108843]"
      aria-label="See the calculator disclaimer"
    >
      *
    </a>
  );
}

/**
 * The disclaimer, rendered inside the site footer directly beneath the grey
 * logo — the slot that held a shorter paragraph saying the same thing in weaker
 * words ("Calculator projections are hypothetical and for illustrative purposes
 * only"). Two disclaimers, one of them the real one, is worse than one, so
 * David had this take that paragraph's place rather than sit above it
 * (2026-08-12).
 *
 * It keeps its own id and focus target because every marker on the page links
 * here.
 */
export function CalculatorNotes() {
  return (
    <div
      id={CALCULATOR_NOTES_ANCHOR}
      tabIndex={-1}
      className="scroll-mt-24 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#108843]"
    >
      <h2 className="sr-only">Calculator disclaimer</h2>
      <p className="text-[13px] leading-6 text-[#52657A]">
        {CALCULATOR_DISCLAIMER.map((segment, index) =>
          "bold" in segment ? (
            <span key={index} className="font-bold text-[#10233A]">
              {segment.bold}
            </span>
          ) : (
            <span key={index}>{segment.text}</span>
          ),
        )}
      </p>
    </div>
  );
}
