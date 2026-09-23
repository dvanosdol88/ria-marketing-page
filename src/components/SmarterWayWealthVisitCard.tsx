import { ExternalLink } from "lucide-react";

type SmarterWayWealthVisitCardProps = {
  advancedCalculatorHref: string;
  surfaceClassName?: string;
};

/* Row copy (David, 2026-09-23): the rows are link labels, not sentences, so
   each opens with a capital and none ends in a period. */
const FIRM_DESTINATIONS = [
  {
    href: "https://smarterwaywealth.com/how",
    label: "Find out how we work",
    location: "home_firm_visit_card_how",
    text: "Find out how we work",
  },
  {
    href: "https://smarterwaywealth.com/#david",
    label: "Learn more about David",
    location: "home_firm_visit_card_david",
    text: "Learn more about David",
  },
  {
    href: "https://smarterwaywealth.com/faq",
    /* The tracked label stays the long-form wording it has always been so the
       PostHog series does not split in two on the day the visible copy
       changed. Only `text` — what the visitor reads — is David's new line. */
    label: "See our frequently asked questions",
    location: "home_firm_visit_card_faq",
    text: "See ALL of our FAQs",
  },
] as const;

export function SmarterWayWealthVisitCard({
  advancedCalculatorHref,
  surfaceClassName = "bg-[#EEF0F5]",
}: SmarterWayWealthVisitCardProps) {
  const destinations = [
    {
      href: advancedCalculatorHref,
      label: "Use the advanced calculator and see how we do the math",
      location: "home_firm_visit_card_calculator",
      text: "Use the advanced calculator and see how we do the math",
    },
    ...FIRM_DESTINATIONS,
  ];

  return (
    /* The small-iPhone-height spacer (pt-[667px]) that used to sit here now
       belongs to the quote deck above: the pause still exists, but it carries
       the fee quotes instead of empty space (shipped 2026-08-13; the guard
       test asserts the spacer stays retired). This section keeps only its
       own breathing room. */
    <section
      aria-label="Visit Smarter Way Wealth"
      className={`w-full ${surfaceClassName} px-4 pb-12 pt-16 sm:px-6 sm:pb-16 sm:pt-24`}
    >
      {/* REDESIGN, 2026-09-23 (David: the bright green slab read as "very not
          premium"). He chose option A1 — a flat card in brand-950 (#002A11),
          the deepest green in the brand ramp (src/styles/tokens.ts) — over a
          brighter-to-darker blended variant he also reviewed. This replaces the
          flat #007A2F lock of 2026-08-14 at his direction; it is still one
          solid brand-green unit, just the ramp's darkest step.

          Type is the brand's own: the name is set in the logo face (DM Sans,
          var(--font-logo)) and tracked like the wordmark; rows are Inter. Green
          is an accent only (eyebrow, numerals, one short rule). */}
      <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl bg-[#002A11] text-white shadow-[0_24px_60px_rgba(0,42,17,0.28)] ring-1 ring-inset ring-white/10">
        <a
          aria-label="Visit Smarter Way Wealth home page (opens in a new tab)"
          className="group block px-7 pb-7 pt-9 !text-white !no-underline focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-[-6px] focus-visible:outline-white sm:px-12 sm:pb-8 sm:pt-11"
          data-posthog-cta="true"
          data-posthog-cta-label="Visit Smarter Way Wealth"
          data-posthog-cta-location="home_firm_visit_card"
          href="https://smarterwaywealth.com/"
          rel="noreferrer"
          target="_blank"
        >
          <span className="block text-[12px] font-bold uppercase tracking-[0.28em] text-[#3FC87C]">
            <span>Visit</span>
          </span>
          <span className="mt-3 flex items-end justify-between gap-6">
            <span className="font-logo leading-none" aria-label="Smarter Way Wealth">
              <span aria-hidden="true" className="block text-[30px] font-bold tracking-[0.14em] sm:text-[36px]">
                SMARTER
              </span>
              <span aria-hidden="true" className="mt-2 block text-[13px] font-medium tracking-[0.42em] text-[#7ADCA6] sm:text-[14px]">
                WAY WEALTH
              </span>
            </span>
            <ExternalLink
              aria-hidden="true"
              className="mb-1 h-6 w-6 shrink-0 text-white/65 transition duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white"
              strokeWidth={2}
            />
          </span>
          <span aria-hidden="true" className="mt-5 block h-0.5 w-11 bg-[#00A540]" />
        </a>

        <nav aria-label="Explore Smarter Way Wealth" className="px-7 pb-3 sm:px-12 sm:pb-5">
          {destinations.map((destination, index) => (
            <a
              className="group flex items-center gap-4 border-t border-white/15 py-[18px] !text-white !no-underline focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-white sm:gap-5"
              data-posthog-cta="true"
              data-posthog-cta-label={destination.label}
              data-posthog-cta-location={destination.location}
              href={destination.href}
              key={destination.location}
              rel="noreferrer"
              target="_blank"
            >
              <span aria-hidden="true" className="w-6 shrink-0 text-[13px] font-bold tabular-nums tracking-[0.04em] text-[#3FC87C]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="flex-1 text-[17px] font-medium leading-6 text-white/90 transition-colors duration-200 group-hover:text-white sm:text-lg">
                {destination.text}
              </span>
              <ExternalLink
                aria-hidden="true"
                className="h-5 w-5 shrink-0 text-white/50 transition duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white"
                strokeWidth={2}
              />
            </a>
          ))}
        </nav>
      </div>
    </section>
  );
}
