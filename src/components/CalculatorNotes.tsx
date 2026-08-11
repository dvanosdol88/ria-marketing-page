import {
  CALCULATOR_DISCLAIMER,
  CALCULATOR_NOTES_ANCHOR,
  disclaimerHref,
} from "@/config/calculatorNotes";

/**
 * The superscript marker beside a figure the disclaimer governs.
 *
 * It is a real link, which is what makes it worth more than the asterisk it
 * replaced: one tap reaches the disclaimer, and a screen reader announces where
 * it goes rather than reading "star".
 *
 * Padding grows the hit box without growing the line box, so the marker keeps
 * its footnote scale while staying tappable with a thumb — the bare glyph was
 * roughly 4x9px.
 */
export function NoteMarker() {
  return (
    <a
      href={disclaimerHref}
      className="-my-2 ml-[0.1em] inline-block px-1.5 py-2 align-super text-[0.62em] font-bold !text-inherit !no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#108843]"
      aria-label="See the calculator disclaimer"
    >
      1
    </a>
  );
}

/**
 * The disclaimer. Sits at the foot of the page, directly above the site-wide
 * compliance footer, so this page's disclaimer and the firm's standing
 * disclosures read as one block rather than being scattered through the
 * calculator (David, 2026-08-11).
 */
export function CalculatorNotes() {
  return (
    <section
      id={CALCULATOR_NOTES_ANCHOR}
      aria-labelledby={`${CALCULATOR_NOTES_ANCHOR}-heading`}
      tabIndex={-1}
      className="w-full scroll-mt-24 border-t border-[#D7E0E8] bg-[#EEF0F5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#108843]"
    >
      <div className="mx-auto max-w-[1100px] px-4 py-8 sm:px-6 sm:py-10">
        <h2 id={`${CALCULATOR_NOTES_ANCHOR}-heading`} className="sr-only">
          Calculator disclaimer
        </h2>
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
    </section>
  );
}
