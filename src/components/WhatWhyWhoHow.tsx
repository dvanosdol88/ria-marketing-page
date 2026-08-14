import Image from "next/image";
import { Check, DollarSign } from "lucide-react";

export const WWWH_ANSWERS = [
  {
    key: "what",
    label: "What",
    body: "A registered investment advisor that offers an investment and financial planning relationship with an experienced, highly credentialed advisor — for just $100 a month.",
  },
  {
    key: "why",
    label: "Why",
    body: "Because not everyone needs to be paying massive, asset-based fees to get good advice.",
  },
  {
    key: "who",
    label: "Who",
    body: "David Van Osdol, CFA Charter Holder and CFP Professional with over 20 years’ experience. You will work directly with him.",
  },
] as const;

/* The question word is the firm's own affirmative answer, so it carries the
   brand green rather than the blue reserved for the asset-based-fee side of
   every comparison on this page (David, 2026-08-11). */
const WWWH_LABEL_CLASS =
  "text-3xl font-black tracking-tight text-[#007A2F] sm:text-4xl";

/* The Yes/No verdicts over the two "How" columns. Colour is set per column at
   the call site; everything else is shared so the pair always match.

   Indented to sit over the list's own text rather than centred on the column:
   dead-centre put them adrift above left-aligned items, especially in the wide
   desktop column (David, 2026-08-12).

   pl-8 anchors each label to the list text: icon (h-5 = 20px) plus gap-3
   (12px) = 32px. The intentional translate-x-3 then moves only Yes and No
   three spacing units (12px) right, per David's 2026-08-13 mobile review.
   If either list geometry changes, re-check the anchored padding first. */
const WWWH_VERDICT_CLASS =
  "mb-2 translate-x-3 pl-8 text-left text-xl font-black tracking-tight sm:text-2xl";

export const WWWH_HOW = {
  key: "how",
  label: "How",
  uses: [
    "Technology to automate admin work",
    "Published model portfolios from top firms",
    "Virtual meetings",
  ],
  skips: [
    "Layers of corporate overhead",
    "Massive marketing budgets",
    "A large real estate footprint",
  ],
  closing: "No need to move your accounts.",
} as const;

/* This section is deliberately ONE PLAIN PANEL — no cards, no rotated type
   (David rejected both; tests/home-wwwh.mjs locks the rejection). The 2026-08
   refinement below works entirely inside that constitution: hairline rules
   between the four answers give the panel a ledger rhythm, the two HOW columns
   each open with a rule in their verdict's colour so the comparison reads at a
   glance, and the WHO portrait gets a quiet ring so the one photograph on the
   page sits deliberately. Copy, order, colours, and verdict geometry are all
   the settled decisions — presentation only. */
export function WhatWhyWhoHow() {
  return (
    <section
      aria-label="What, why, who and how Smarter Way Wealth works"
      className="fit-cta-band"
    >
      <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="divide-y divide-[#10233A]/10">
          {WWWH_ANSWERS.map((answer) => (
            <div key={answer.key} className="py-8 first:pt-0 sm:py-9">
              {/* Only WHAT is completed into a question. It is the first of the
                  four, so it sets up the pattern the other three inherit without
                  having to repeat it (David, 2026-08-12). The completion is set
                  in the body's size, weight and ink so the question word still
                  carries the heading. */}
              <h2 className={WWWH_LABEL_CLASS}>
                {answer.label}
                {answer.key === "what" ? (
                  <span className="text-lg font-normal tracking-normal text-[#10233A] sm:text-xl">
                    {" "}
                    is Smarter Way Wealth
                  </span>
                ) : null}
              </h2>
              {answer.key === "who" ? (
                /* WHO is the only answer about a person, so it gets the face that
                   goes with the name — photo left, answer beside it (David,
                   2026-08-11). */
                <div className="mt-3 flex items-start gap-4 sm:gap-6">
                  {/* Decorative: the sentence beside it opens with the same name,
                      so alt text here would announce "David Van Osdol" twice. */}
                  <Image
                    src="/DVO Head Shot picture.jpg"
                    alt=""
                    width={112}
                    height={112}
                    className="h-20 w-20 shrink-0 rounded-full object-cover object-top ring-2 ring-[#10233A]/10 sm:h-28 sm:w-28"
                  />
                  <p className="max-w-3xl text-lg leading-7 text-[#10233A] sm:text-xl sm:leading-8">
                    {answer.body}
                  </p>
                </div>
              ) : (
                <p className="mt-2.5 max-w-3xl text-lg leading-7 text-[#10233A] sm:text-xl sm:leading-8">
                  {answer.body}
                </p>
              )}
            </div>
          ))}

          <div className="pt-8 sm:pt-9">
            <h2 className={WWWH_LABEL_CLASS}>{WWWH_HOW.label}</h2>
            {/* Lines within each list sit close together so each list reads as one
                block; gap-y keeps the two groups clearly apart when they stack on
                a phone (David, 2026-08-11). Each column opens with a rule in its
                verdict's colour — the same green/red the word and icons already
                carry — so the two sides separate before a single item is read. */}
            <div className="mt-4 grid gap-x-10 gap-y-7 sm:grid-cols-2">
              {/* The green check and the red dollar sign are the only thing
                  separating "what we use" from "what we skip", and both icons are
                  aria-hidden. Without these names a screen reader — and any agent
                  summarising the page — announces six undifferentiated items and
                  comes away believing the firm HAS massive marketing budgets and
                  layers of corporate overhead, the exact opposite of the claim.
                  role="list" is required alongside: Tailwind's reset removes the
                  list marker, and Safari/VoiceOver drops list semantics with it. */}
              {/* "Yes" and "No" give the two lists a visible verdict, so the
                  green/red distinction no longer rests entirely on icon colour —
                  which is invisible to a colour-blind reader and to anyone
                  skimming (David, 2026-08-12). Camel Case, matching
                  What/Why/Who/How. */}
              <div className="border-t-2 border-[#108843] pt-4">
                <p className={`${WWWH_VERDICT_CLASS} text-[#108843]`}>Yes</p>
                <ul role="list" aria-label="What Smarter Way Wealth uses" className="space-y-1.5">
                  {WWWH_HOW.uses.map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 text-lg leading-7 text-[#10233A] sm:text-xl sm:leading-8"
                    >
                      <Check
                        aria-hidden="true"
                        className="mt-1.5 h-5 w-5 shrink-0 text-[#108843] sm:mt-2"
                        strokeWidth={3}
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border-t-2 border-[#C62828] pt-4">
                <p className={`${WWWH_VERDICT_CLASS} text-[#C62828]`}>No</p>
                <ul
                  role="list"
                  aria-label="Costs Smarter Way Wealth does not carry"
                  className="space-y-1.5"
                >
                  {WWWH_HOW.skips.map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 text-lg leading-7 text-[#10233A]/70 sm:text-xl sm:leading-8"
                    >
                      {/* A red dollar sign, not a gray X — these are the costs a
                          traditional firm passes on, so the icon says "this is
                          what you'd be paying for" rather than merely "absent". */}
                      <DollarSign
                        aria-hidden="true"
                        className="mt-1.5 h-5 w-5 shrink-0 text-[#C62828] sm:mt-2"
                        strokeWidth={3}
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {/* Same weight as the Yes/No verdicts above it, so the closing line
                lands as a third verdict rather than as body copy. Its ink stays
                the body's — David asked for the weight, not the colour
                (2026-08-12). */}
            <p className="mt-7 text-lg font-black leading-7 text-[#10233A] sm:text-xl">
              {WWWH_HOW.closing}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
