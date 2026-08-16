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
    /* The tracked label stays the long-form wording it has always been so the
       PostHog series does not split in two on the day the visible copy
       changed. Only `text` — what the visitor reads — is David's new line. */
    label: "See our frequently asked questions",
    location: "home_firm_visit_card_faq",
    text: "See ALL of our FAQs.",
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
       the fee quotes instead of empty space (shipped 2026-08-13; the guard
       test asserts the spacer stays retired). This section keeps only its
       own breathing room. */
    <section
      aria-label="Visit Smarter Way Wealth"
      className="w-full bg-[#EEF0F5] px-4 pb-12 pt-16 sm:px-6 sm:pb-16 sm:pt-24"
    >
      {/* Premium pass, 2026-08-14 (David: "make the Visit Smarter Way Wealth
          button look more premium"). Everything here is depth and typography —
          an inset hairline so the block has a milled edge, a deeper green-tinted
          shadow that lifts on hover, a finer letterspaced eyebrow flanked by
          rules, and more air around the wordmark. The fill stays FLAT #007A2F
          on purpose: the solid-green-single-unit decision is a lock, and the
          guard test rejects any decorative blended fill (it greps this file's
          own source, so do not name that CSS function even in a comment). */}
      {/* Narrower than the sections above it (2026-08-14): a door should not be
          as wide as the room. max-w-2xl still fits the longest row —
          "use the advanced calculator and see how we do the math" — on one
          line at the sm: type size. */}
      <div className="group/card mx-auto max-w-2xl overflow-hidden rounded-2xl bg-[#007A2F] text-white shadow-[0_18px_46px_rgba(0,122,47,0.22)] ring-1 ring-inset ring-white/15 transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_28px_66px_rgba(0,122,47,0.30)]">
        <a
          aria-label="Visit Smarter Way Wealth home page (opens in a new tab)"
          /* No min-height any more: it existed to balance the arrow disc that
             sat under the wordmark, and with the disc struck out it just left
             a pool of empty green between the logo and the first row. Padding
             defines the block now. */
          className="group grid place-items-center px-5 py-10 text-center !text-white !no-underline transition-colors duration-200 hover:bg-white/[0.07] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-[-6px] focus-visible:outline-white sm:px-10 sm:py-11"
          data-posthog-cta="true"
          data-posthog-cta-label="Visit Smarter Way Wealth"
          data-posthog-cta-location="home_firm_visit_card"
          href="https://smarterwaywealth.com/"
          rel="noreferrer"
          target="_blank"
        >
          {/* Set up a step, 2026-08-16 (David: "make 'Visit' slightly larger
              and bolder"). 11px/extrabold at 75% opacity read as a caption
              rather than as the verb of the card; 13px/black at 90% gives it
              weight without letting it compete with the wordmark beneath.
              Tracking eases from .34em to .3em — letterspacing that wide at
              the larger size starts to break the word apart — and the flanking
              rules grow with it so the ratio of rule to word holds. */}
          <span className="flex items-center gap-3 text-[13px] font-black uppercase tracking-[0.3em] text-white/90">
            <span aria-hidden="true" className="h-px w-8 bg-white/35" />
            <span>Visit</span>
            <span aria-hidden="true" className="h-px w-8 bg-white/35" />
          </span>
          {/* The wordmark carries this block on its own — the arrow disc that
              used to sit beneath it was struck out by David (2026-08-14). Each
              row below still has its own arrow, so nothing about "these leave
              the site" is lost, and the logo gets the room the disc was
              taking. */}
          <Image
            alt="Smarter Way Wealth"
            className="mt-6 h-auto w-[min(92%,24rem)] brightness-0 invert transition-transform duration-300 group-hover:scale-[1.015]"
            height={144}
            src="/brand/logo.svg"
            width={360}
          />
        </a>

        <nav aria-label="Explore Smarter Way Wealth" className="border-t border-white/25">
          {destinations.map((destination) => (
            <a
              className="group flex min-h-16 items-center justify-between gap-4 border-b border-white/25 px-5 py-4 text-base font-semibold leading-6 !text-white !no-underline transition-colors duration-200 last:border-b-0 hover:bg-white/10 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-[-6px] focus-visible:outline-white sm:px-8 sm:text-lg"
              data-posthog-cta="true"
              data-posthog-cta-label={destination.label}
              data-posthog-cta-location={destination.location}
              href={destination.href}
              key={destination.location}
              rel="noreferrer"
              target="_blank"
            >
              <span className="transition-transform duration-200 group-hover:translate-x-1">{destination.text}</span>
              <span
                aria-hidden="true"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/12 transition-colors duration-200 group-hover:bg-white/22"
              >
                <ArrowUpRight
                  aria-hidden="true"
                  className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  strokeWidth={2.5}
                />
              </span>
            </a>
          ))}
        </nav>
      </div>
    </section>
  );
}
