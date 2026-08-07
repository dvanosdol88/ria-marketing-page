/**
 * TEMPORARY design-review route for the WHAT / WHY / WHO / HOW section.
 * Delete before merge.
 *
 * One continuous panel (no rules between answers), the question word as a plain
 * horizontal header, header and body sharing one ink colour. HOW carries the
 * check / cross treatment borrowed from the "Not the service model" block --
 * with the crosses set neutral rather than red, because these are costs
 * deliberately not carried, not hazards being warned about.
 *
 * Three CTA treatments are shown beneath for comparison; only one ships.
 */

import { Check, X } from "lucide-react";

export const metadata = {
  title: "WWWH layout (internal preview)",
  robots: { index: false, follow: false },
};

const USES = [
  "Technology to automate admin work",
  "Published model portfolios from top firms",
  "Virtual meetings",
];

const SKIPS = [
  "Layers of corporate overhead",
  "Massive marketing budgets",
  "A large real estate footprint",
];

function Answer({
  word,
  children,
}: {
  word: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-3xl font-black tracking-tight text-[#10233A] sm:text-4xl">
        {word}
      </h2>
      {children}
    </div>
  );
}

function Body({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-3 max-w-3xl text-lg leading-7 text-[#10233A] sm:text-xl sm:leading-8">
      {children}
    </p>
  );
}

function Wwwh() {
  return (
    <section
      aria-label="What, why, who and how Smarter Way Wealth works"
      className="fit-cta-band"
    >
      <div className="mx-auto max-w-5xl space-y-9 px-5 py-12 sm:space-y-10 sm:px-8 sm:py-14">
        <Answer word="WHAT">
          <Body>
            An investment and financial planning relationship with an
            experienced, highly credentialed advisor — for just $100 a month.
          </Body>
        </Answer>

        <Answer word="WHY">
          <Body>
            Because not everyone needs to be paying massive, asset-based fees to
            get good advice.
          </Body>
        </Answer>

        <Answer word="WHO">
          <Body>
            David Van Osdol, CFA Charter Holder and CFP Professional with over
            20 years’ experience.
          </Body>
        </Answer>

        <Answer word="HOW">
          {/* gap-y separates the two groups when they stack on a phone */}
          <div className="mt-4 grid gap-x-10 gap-y-6 sm:grid-cols-2">
            <ul className="space-y-3">
              {USES.map((item) => (
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
              {SKIPS.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-lg leading-7 text-[#10233A]/70 sm:text-xl sm:leading-8"
                >
                  <X
                    aria-hidden="true"
                    className="mt-1.5 h-5 w-5 shrink-0 text-[#10233A]/45 sm:mt-2"
                    strokeWidth={3}
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-6 text-lg font-bold leading-7 text-[#10233A] sm:text-xl">
            No need to move your accounts.
          </p>
        </Answer>
      </div>
    </section>
  );
}

/* ------------------------- CTA option 1 ------------------------- */
function CtaCommitted() {
  return (
    <section className="fit-cta-band">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-5 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-14">
        <div className="max-w-xl">
          <h2 className="text-2xl font-black tracking-tight text-[#10233A] sm:text-3xl">
            Ready to talk it through?
          </h2>
          <p className="mt-2 text-base leading-7 text-[#10233A]/75">
            Fifteen minutes, on video, no obligation.
          </p>
        </div>
        <div className="flex flex-col items-start gap-3 sm:items-end">
          <a
            href="#get-started"
            className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-[#064B84] px-7 text-base font-extrabold !text-white no-underline"
          >
            Get started
          </a>
          <div className="flex gap-5 text-sm font-bold">
            <a href="#fit" className="text-[#064B84]">
              See if SWW is a good fit
            </a>
            <a href="/faq" className="text-[#064B84]">
              FAQ
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------- CTA option 2 ------------------------- */
const TILES = [
  {
    label: "Get started",
    note: "Book a 15-minute conversation with David.",
    href: "#get-started",
  },
  {
    label: "See if SWW is a good fit",
    note: "A short read on who this is built for.",
    href: "#fit",
  },
  {
    label: "FAQ",
    note: "Fees, custody, and how the relationship works.",
    href: "/faq",
  },
];

function CtaTiles() {
  return (
    <section className="fit-cta-band">
      <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-14">
        <div className="grid gap-4 sm:grid-cols-3">
          {TILES.map((tile) => (
            <a
              key={tile.label}
              href={tile.href}
              className="group flex min-h-[132px] flex-col justify-between rounded-xl border border-[#10233A]/12 bg-white/70 p-5 no-underline transition-colors hover:border-[#064B84]/45 hover:bg-white"
            >
              <span className="text-lg font-black tracking-tight text-[#10233A]">
                {tile.label}
              </span>
              <span className="mt-3 text-sm leading-6 text-[#10233A]/70">
                {tile.note}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------- CTA option 3 ------------------------- */
function CtaQuiet() {
  return (
    <section className="fit-cta-band">
      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-12">
        <div className="flex flex-col divide-y divide-[#10233A]/12 sm:flex-row sm:divide-y-0 sm:divide-x">
          {TILES.map((tile) => (
            <a
              key={tile.label}
              href={tile.href}
              className="flex min-h-[56px] flex-1 items-center justify-between gap-4 py-4 text-base font-extrabold text-[#064B84] no-underline sm:px-6 sm:py-2 sm:first:pl-0 sm:last:pr-0"
            >
              {tile.label}
              <span aria-hidden="true">→</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function OptionLabel({ n, name, note }: { n: string; name: string; note: string }) {
  return (
    <div className="mx-auto max-w-5xl px-5 pb-3 pt-12 sm:px-8">
      <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#007A2F]">
        CTA option {n}
      </p>
      <h3 className="mt-1 text-xl font-black tracking-tight text-[#10233A]">
        {name}
      </h3>
      <p className="mt-1 max-w-2xl text-sm leading-6 text-neutral-600">{note}</p>
    </div>
  );
}

export default function WwwhPreviewPage() {
  return (
    <main className="bg-white text-[#10233A]">
      <style>{css}</style>

      <Wwwh />

      <OptionLabel
        n="1"
        name="One clear next step"
        note="Picks a winner. Booking is the solid button; the other two sit quietly beside it. Same shape as the block you selected."
      />
      <CtaCommitted />

      <OptionLabel
        n="2"
        name="Three tiles"
        note="Equal weight, but each choice gets a line explaining what it is — so nobody has to guess what 'good fit' means before clicking."
      />
      <CtaTiles />

      <OptionLabel
        n="3"
        name="Quiet row"
        note="No panel, no buttons. Three links on the same background, hairline between. The most restrained option."
      />
      <CtaQuiet />

      <div className="h-16" />
    </main>
  );
}

const css = `
/* preview-only chrome suppression so captures show the section alone */
header { display: none !important; }
footer { display: none !important; }
[class*="WhatWhyWhoHow-module"] { display: none !important; }
`;
