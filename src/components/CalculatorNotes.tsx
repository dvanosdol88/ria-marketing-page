import {
  CALCULATOR_NOTES,
  CALCULATOR_NOTES_ANCHOR,
  type CalculatorNote,
  noteHref,
} from "@/config/calculatorNotes";

/**
 * A superscript note marker — the numbered replacement for the asterisks that
 * used to sit beside every projected figure.
 *
 * It is a real link to the matching note at the bottom of the page, which is
 * what makes the number worth more than the asterisk was: a reader can reach
 * the specific disclosure for the specific claim in one tap, and a screen
 * reader announces where the link goes rather than reading "star".
 */
export function NoteMarker({ id }: { id: number }) {
  const note = CALCULATOR_NOTES.find((entry) => entry.id === id);

  /* Padding on an inline element grows the hit box without growing the line
     box, so the marker keeps its footnote scale while becoming tappable with a
     thumb. At 0.55em on 13px body text the bare glyph was roughly 4x9px. The
     opacity is gone: inherited on the green Difference figure it dropped the
     effective contrast to 3.76:1, under the 4.5:1 bar. */
  return (
    <a
      href={noteHref(id)}
      className="-my-2 ml-[0.1em] inline-block px-1.5 py-2 align-super text-[0.62em] font-bold !text-inherit !no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#108843]"
      aria-label={note ? `Note ${id}: ${note.title}` : `Note ${id}`}
    >
      {id}
    </a>
  );
}

function Note({ note }: { note: CalculatorNote }) {
  /* tabIndex makes the jump target focusable, so a reader who taps a marker
     lands on the note rather than only scrolling the page under it. The number
     is repeated inside the title text because Tailwind's reset strips the list
     marker, and Safari/VoiceOver drops list semantics with it — without this a
     visitor follows "Note 3" and arrives somewhere that never says three. */
  return (
    <li
      id={`${CALCULATOR_NOTES_ANCHOR}-${note.id}`}
      tabIndex={-1}
      className="grid scroll-mt-24 grid-cols-[1.4rem_minmax(0,1fr)] gap-x-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#108843]"
    >
      <span
        aria-hidden="true"
        className="text-[13px] font-bold leading-6 text-[#10233A]"
      >
        {note.id}
      </span>
      <p className="text-[13px] leading-6 text-[#52657A]">
        <span className="font-bold text-[#10233A]">
          <span className="sr-only">{note.id}. </span>
          {note.title}.{" "}
        </span>
        {note.body}
      </p>
    </li>
  );
}

/**
 * The notes block. Sits at the foot of the page, directly above the site-wide
 * compliance footer, so the disclosures for this page and the firm's standing
 * disclosures read as one continuous block rather than being scattered through
 * the calculator (David, 2026-08-11).
 */
export function CalculatorNotes() {
  return (
    <section
      id={CALCULATOR_NOTES_ANCHOR}
      aria-labelledby={`${CALCULATOR_NOTES_ANCHOR}-heading`}
      className="w-full scroll-mt-24 border-t border-[#D7E0E8] bg-[#EEF0F5]"
    >
      <div className="mx-auto max-w-[1100px] px-4 py-8 sm:px-6 sm:py-10">
        {/* #52657A rather than #7A8899: at 11px bold the lighter grey scored
            3.17:1 on this background, under the 4.5:1 bar for normal text. */}
        <h2
          id={`${CALCULATOR_NOTES_ANCHOR}-heading`}
          className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#52657A]"
        >
          Notes on the numbers in this calculator
        </h2>
        <ol role="list" className="mt-4 space-y-3">
          {CALCULATOR_NOTES.map((note) => (
            <Note key={note.id} note={note} />
          ))}
        </ol>
      </div>
    </section>
  );
}
