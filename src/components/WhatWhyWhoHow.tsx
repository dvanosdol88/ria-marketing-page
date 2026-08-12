import Image from "next/image";
import { Check, DollarSign } from "lucide-react";

export const WWWH_ANSWERS = [
  {
    key: "what",
    label: "What",
    body: "An investment and financial planning relationship with an experienced, highly credentialed advisor — for just $100 a month.",
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
   the call site; everything else is shared so the pair always match. */
const WWWH_VERDICT_CLASS =
  "mb-2 text-center text-xl font-black tracking-tight sm:text-2xl";

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

export function WhatWhyWhoHow() {
  return (
    <section
      aria-label="What, why, who and how Smarter Way Wealth works"
      className="fit-cta-band"
    >
      <div className="mx-auto max-w-5xl space-y-9 px-5 py-12 sm:space-y-10 sm:px-8 sm:py-14">
        {WWWH_ANSWERS.map((answer) => (
          <div key={answer.key}>
            <h2 className={WWWH_LABEL_CLASS}>{answer.label}</h2>
            {answer.key === "who" ? (
              /* WHO is the only answer about a person, so it gets the face that
                 goes with the name — photo left, answer beside it (David,
                 2026-08-11). */
              <div className="mt-1.5 flex items-start gap-4 sm:gap-5">
                {/* Decorative: the sentence beside it opens with the same name,
                    so alt text here would announce "David Van Osdol" twice. */}
                <Image
                  src="/DVO Head Shot picture.jpg"
                  alt=""
                  width={112}
                  height={112}
                  className="h-20 w-20 shrink-0 rounded-full object-cover object-top sm:h-28 sm:w-28"
                />
                <p className="max-w-3xl text-lg leading-7 text-[#10233A] sm:text-xl sm:leading-8">
                  {answer.body}
                </p>
              </div>
            ) : (
              <p className="mt-1.5 max-w-3xl text-lg leading-7 text-[#10233A] sm:text-xl sm:leading-8">
                {answer.body}
              </p>
            )}
          </div>
        ))}

        <div>
          <h2 className={WWWH_LABEL_CLASS}>{WWWH_HOW.label}</h2>
          {/* Lines within each list sit close together so each list reads as one
              block; gap-y keeps the two groups clearly apart when they stack on
              a phone (David, 2026-08-11). */}
          <div className="mt-2 grid gap-x-10 gap-y-6 sm:grid-cols-2">
            {/* The green check and the red dollar sign are the only thing
                separating "what we use" from "what we skip", and both icons are
                aria-hidden. Without these names a screen reader — and any agent
                summarising the page — announces six undifferentiated items and
                comes away believing the firm HAS massive marketing budgets and
                layers of corporate overhead, the exact opposite of the claim.
                role="list" is required alongside: Tailwind's reset removes the
                list marker, and Safari/VoiceOver drops list semantics with it. */}
            {/* "Yes" and "No" centred over each column give the two lists a
                visible verdict, so the green/red distinction no longer rests
                entirely on icon colour — which is invisible to a colour-blind
                reader and to anyone skimming (David, 2026-08-12). Camel Case,
                matching What/Why/Who/How. */}
            <div>
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
            <div>
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
          <p className="mt-6 text-lg font-bold leading-7 text-[#10233A] sm:text-xl">
            {WWWH_HOW.closing}
          </p>
        </div>
      </div>
    </section>
  );
}
