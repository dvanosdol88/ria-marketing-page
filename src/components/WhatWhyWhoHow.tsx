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
    body: "David Van Osdol, CFA Charter Holder and CFP Professional with over 20 years’ experience.",
  },
] as const;

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
            <h2 className="text-3xl font-black tracking-tight text-[#10233A] sm:text-4xl">
              {answer.label}
            </h2>
            <p className="mt-3 max-w-3xl text-lg leading-7 text-[#10233A] sm:text-xl sm:leading-8">
              {answer.body}
            </p>
          </div>
        ))}

        <div>
          <h2 className="text-3xl font-black tracking-tight text-[#10233A] sm:text-4xl">
            {WWWH_HOW.label}
          </h2>
          {/* gap-y separates the two groups when they stack on a phone */}
          <div className="mt-4 grid gap-x-10 gap-y-6 sm:grid-cols-2">
            <ul className="space-y-3">
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
            <ul className="space-y-3">
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
          <p className="mt-6 text-lg font-bold leading-7 text-[#10233A] sm:text-xl">
            {WWWH_HOW.closing}
          </p>
        </div>
      </div>
    </section>
  );
}
