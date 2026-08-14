import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

type SmarterWayWealthVisitCardProps = {
  advancedCalculatorHref: string;
};

const FIRM_DESTINATIONS = [
  {
    href: "https://smarterwaywealth.com/how",
    label: "Find out how we work",
    location: "home_firm_visit_card_how",
    text: "find out how we work.",
  },
  {
    href: "https://smarterwaywealth.com/#david",
    label: "Learn more about David",
    location: "home_firm_visit_card_david",
    text: "learn more about David.",
  },
  {
    href: "https://smarterwaywealth.com/faq",
    label: "See our frequently asked questions",
    location: "home_firm_visit_card_faq",
    text: "see our frequently asked questions.",
  },
] as const;

export function SmarterWayWealthVisitCard({
  advancedCalculatorHref,
}: SmarterWayWealthVisitCardProps) {
  const destinations = [
    {
      href: advancedCalculatorHref,
      label: "Use the advanced calculator and see how we do the math",
      location: "home_firm_visit_card_calculator",
      text: "use the advanced calculator and see how we do the math",
    },
    ...FIRM_DESTINATIONS,
  ];

  return (
    /* The small-iPhone-height spacer (pt-[667px]) that used to sit here now
       belongs to the quote deck above: the pause still exists, but it carries
       the fee quotes instead of empty space (David approved from the
       2026-08-13 mockups). This section keeps only its own breathing room;
       tests/home-wwwh.mjs asserts the spacer stays retired. */
    <section
      aria-label="Visit Smarter Way Wealth"
      className="w-full bg-[#EEF0F5] px-4 pb-12 pt-16 sm:px-6 sm:pb-16 sm:pt-24"
    >
      <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl bg-[#007A2F] text-white shadow-[0_16px_42px_rgba(6,43,67,0.16)]">
        <a
          aria-label="Visit Smarter Way Wealth home page (opens in a new tab)"
          className="group grid min-h-52 place-items-center px-5 py-8 text-center !text-white !no-underline transition-colors duration-200 hover:bg-white/10 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-[-6px] focus-visible:outline-white sm:px-10"
          data-posthog-cta="true"
          data-posthog-cta-label="Visit Smarter Way Wealth"
          data-posthog-cta-location="home_firm_visit_card"
          href="https://smarterwaywealth.com/"
          rel="noreferrer"
          target="_blank"
        >
          <span className="text-sm font-extrabold uppercase tracking-[0.24em]">Visit</span>
          <Image
            alt="Smarter Way Wealth"
            className="mt-4 h-auto w-[min(88%,22rem)] brightness-0 invert"
            height={144}
            src="/brand/logo.svg"
            width={360}
          />
          <ArrowUpRight
            aria-hidden="true"
            className="mt-4 h-5 w-5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            strokeWidth={2.5}
          />
        </a>

        <nav aria-label="Explore Smarter Way Wealth" className="border-t border-white/30">
          {destinations.map((destination) => (
            <a
              className="group flex min-h-16 items-center justify-between gap-4 border-b border-white/30 px-5 py-4 text-base font-semibold leading-6 !text-white !no-underline transition-colors duration-200 last:border-b-0 hover:bg-white/10 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-[-6px] focus-visible:outline-white sm:px-8 sm:text-lg"
              data-posthog-cta="true"
              data-posthog-cta-label={destination.label}
              data-posthog-cta-location={destination.location}
              href={destination.href}
              key={destination.location}
              rel="noreferrer"
              target="_blank"
            >
              <span>{destination.text}</span>
              <ArrowUpRight
                aria-hidden="true"
                className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                strokeWidth={2.5}
              />
            </a>
          ))}
        </nav>
      </div>
    </section>
  );
}
