import {
  CALCULATOR_DISCLAIMER,
  CALCULATOR_NOTES_ANCHOR,
  disclaimerHref,
} from "@/config/calculatorNotes";

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

/** The disclaimer keeps its own id because every marker on the page links here. */
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
            <span key={index} className={`font-bold text-[#10233A] ${segment.bold.length < 24 ? "whitespace-nowrap" : ""}`}>
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
