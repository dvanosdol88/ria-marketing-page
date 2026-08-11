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

  return (
    <a
      href={noteHref(id)}
      className="ml-[0.1em] align-super text-[0.55em] font-bold !text-inherit !no-underline opacity-80 transition-opacity hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#108843]"
      aria-label={note ? `Note ${id}: ${note.title}` : `Note ${id}`}
    >
      {id}
    </a>
  );
}

function Note({ note }: { note: CalculatorNote }) {
  return (
    <li
      id={`${CALCULATOR_NOTES_ANCHOR}-${note.id}`}
      className="grid scroll-mt-24 grid-cols-[1.4rem_minmax(0,1fr)] gap-x-2"
    >
      <span
        aria-hidden="true"
        className="text-[13px] font-bold leading-6 text-[#10233A]"
      >
        {note.id}
      </span>
      <p className="text-[13px] leading-6 text-[#52657A]">
        <span className="font-bold text-[#10233A]">{note.title}. </span>
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
        <h2
          id={`${CALCULATOR_NOTES_ANCHOR}-heading`}
          className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#7A8899]"
        >
          Notes on the numbers
        </h2>
        <ol className="mt-4 space-y-3">
          {CALCULATOR_NOTES.map((note) => (
            <Note key={note.id} note={note} />
          ))}
        </ol>
      </div>
    </section>
  );
}
