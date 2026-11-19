import Link from "next/link";
import { ArrowRight, BadgeCheck, ExternalLink } from "lucide-react";
import { SCHEDULE_BUTTON_CLASS, SIGNUP_BUTTON_CLASS, signupCta } from "@/config/signupCta";

type SignupCtaProps = {
  /** PostHog CTA location tag so each placement is distinguishable. */
  location: string;
  /** Outer band background for the full-card ask. The One Percent Blues page
   *  passes bg-transparent so the card floats on its gradient. */
  surfaceClassName?: string;
  /** Absolute destination for the primary button, rendered as a plain <a>
   *  instead of next/link. The One Percent Blues page passes the green
   *  site's sign-up URL: on onepercentblues.com every green route redirects
   *  cross-domain, and a client-side prefetch of that redirect fails CORS. */
  primaryHref?: string;
};

/** Preserve the existing One Percent Blues button. */
const BLUES_PRIMARY_BUTTON_CLASS =
  "group flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-[#008532] px-6 text-center text-base font-bold !text-white !no-underline shadow-[0_10px_26px_rgba(3,26,42,0.35)] transition hover:-translate-y-0.5 hover:bg-[#006B28] hover:shadow-[0_16px_34px_rgba(3,26,42,0.45)] hover:!text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#008532]";

const HOME_CLIENT_VALUE_ITEMS = [
  { label: "Personal financial planning and tailored investment recommendations." },
  { label: "Direct access to David, regular meetings, and ongoing advice." },
  { label: "In-depth portfolio analysis." },
  { label: "Clear, step-by-step implementation help while you keep your accounts and place trades yourself." },
  { label: "More", href: "https://smarterwaywealth.com/" },
] as const;

/**
 * Secondary next step under the sign-up button. David, 2026-11-19 ("yes change
 * it"): the old "Talk to David first for 15 minutes to see if you are a good
 * fit" text link is now the standard navy "Questions? / Schedule 15 minutes"
 * call button (09-24 standard, Oct 30 audit). The click label stays the same
 * so analytics history is continuous.
 */
function SecondaryLink({ location }: { location: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <p className="text-sm text-white/90">{signupCta.secondary.prompt}</p>
      <a
        href={signupCta.secondary.href}
        data-schedule-call
        className={`${SCHEDULE_BUTTON_CLASS} mt-2 ring-1 ring-white/40`}
        data-posthog-cta="true"
        data-posthog-cta-label={signupCta.secondary.label}
        data-posthog-cta-location={`${location}_secondary`}
      >
        <span className="whitespace-nowrap text-xs font-semibold leading-tight text-white/85">Questions?</span>
        <span className="whitespace-nowrap text-sm font-extrabold leading-tight">
          Schedule 15 minutes
        </span>
      </a>
      <p className="text-xs leading-5 text-white/70">
        {signupCta.secondary.reassurance}
      </p>
    </div>
  );
}

/** The same two choices appear after the calculator and after the FAQ. */
function HomeActionPair({ location }: { location: string }) {
  return (
    <>
      <Link
        href={signupCta.primary.href}
        className={`${SIGNUP_BUTTON_CLASS} w-full`}
        data-posthog-cta="true"
        data-posthog-cta-label={signupCta.primary.analyticsLabel}
        data-posthog-cta-location={`${location}_primary`}
      >
        {signupCta.primary.label}
      </Link>
      <a
        href={signupCta.secondary.href}
        data-schedule-call
        className={`${SCHEDULE_BUTTON_CLASS} self-center`}
        data-posthog-cta="true"
        data-posthog-cta-label={signupCta.secondary.label}
        data-posthog-cta-location={`${location}_secondary`}
      >
        <span className="whitespace-nowrap text-xs font-semibold leading-tight text-white/85">Questions?</span>
        <span className="whitespace-nowrap text-sm font-extrabold leading-tight">
          Schedule 15 minutes
        </span>
      </a>
      <p className="text-center text-xs leading-5 text-[#536278]">
        {signupCta.disclosure}
      </p>
    </>
  );
}

export function SignupCta({
  location,
  surfaceClassName = "bg-[#EEF0F5]",
  primaryHref,
}: SignupCtaProps) {
  // The homepage uses David's compact two-choice layout.
  if (location === "home_post_calculator" || location === "home_post_faq") {
    return (
      <section className={`w-full ${surfaceClassName} px-4 pb-4 pt-10 sm:px-6 sm:pb-6 sm:pt-14`}>
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
          {/* DECISION, 2026-09-23 (David: "the layout seems off on desktop — it's
              fine on mobile since it's stacked"): the list stays one stacked
              column at every width. The old two-column desktop grid paired a
              one-line item with a three-line one and left "More" orphaned on a
              row of its own. Desktop gets a slightly larger type step instead,
              so the wider card reads as a list, not a grid. The card is also
              opaque now: at 75% white the page's floating $ / = glyphs showed
              through behind the text. */}
          {location === "home_post_calculator" && <div
            data-home-client-value
            className="rounded-md border border-[#CFD9E3] bg-white px-4 py-4 text-[#10233A] shadow-[0_8px_24px_rgba(17,33,52,0.05)] sm:px-6 sm:py-5"
          >
            <h2 className="text-lg font-bold">What you get for $100/month</h2>
            <ul className="mt-3 grid gap-3 text-sm leading-5 sm:mt-4 sm:text-base sm:leading-6" role="list">
              {HOME_CLIENT_VALUE_ITEMS.map((item) => (
                <li key={item.label} className="flex items-start gap-3">
                  <BadgeCheck
                    aria-hidden="true"
                    className="mt-0.5 h-7 w-7 shrink-0 fill-[#E6F6EC] text-[#108843] sm:-mt-0.5"
                    strokeWidth={2.25}
                  />
                  {"href" in item ? (
                    <a
                      href={item.href}
                      className="inline-flex min-h-6 items-center gap-1.5 font-bold !text-[#064B84] underline decoration-[#064B84]/40 underline-offset-2"
                      data-posthog-cta="true"
                      data-posthog-cta-label="More"
                      data-posthog-cta-location={`${location}_more`}
                    >
                      More
                      <ExternalLink aria-hidden="true" className="h-[1.25em] w-[1.25em] shrink-0" strokeWidth={2.5} />
                    </a>
                  ) : (
                    <span>{item.label}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>}
          <HomeActionPair location={location} />
        </div>
      </section>
    );
  }

  const primaryLeavesSite = Boolean(primaryHref && /^https?:\/\//i.test(primaryHref));
  const primary = primaryHref ? (
    <a
      href={primaryHref}
      className={BLUES_PRIMARY_BUTTON_CLASS}
      data-posthog-cta="true"
      data-posthog-cta-label={signupCta.primary.analyticsLabel}
      data-posthog-cta-location={`${location}_primary`}
    >
      {signupCta.primary.analyticsLabel}
      {primaryLeavesSite ? (
        <ExternalLink aria-hidden="true" className="h-[1.25em] w-[1.25em] shrink-0" strokeWidth={2.5} />
      ) : (
        <ArrowRight
          aria-hidden="true"
          className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-1"
          strokeWidth={2.75}
        />
      )}
    </a>
  ) : (
    <Link
      href={signupCta.primary.href}
      className={`${SIGNUP_BUTTON_CLASS} w-full`}
      data-posthog-cta="true"
      data-posthog-cta-label={signupCta.primary.analyticsLabel}
      data-posthog-cta-location={`${location}_primary`}
    >
      {signupCta.primary.label}
    </Link>
  );

  return (
    <section className={`w-full ${surfaceClassName} px-4 py-10 sm:px-6 sm:py-14`}>
      <div className="relative mx-auto max-w-3xl overflow-hidden rounded-2xl bg-gradient-to-br from-[#0A5A9C] via-[#064B84] to-[#04324F] p-6 text-white shadow-[0_22px_54px_rgba(6,75,132,0.30)] sm:p-10">
        {/* Quiet brand mark in the card's corner — the same three rising bars
            as the logo, screened way back. Identity, not decoration. */}
        <div aria-hidden="true" className="pointer-events-none absolute -right-4 -top-8 flex items-end gap-2.5 opacity-[0.08] sm:-right-2 sm:gap-3">
          <span className="h-16 w-6 rounded-sm bg-white sm:h-20 sm:w-7" />
          <span className="h-24 w-6 rounded-sm bg-white sm:h-32 sm:w-7" />
          <span className="h-32 w-6 rounded-sm bg-white sm:h-44 sm:w-7" />
        </div>

        <div className="relative">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#8ED3A8]">
            {signupCta.block.eyebrow}
          </p>

          <div className="mt-6 sm:mx-auto sm:max-w-md">{primary}</div>

          <div className="mt-6 rounded-xl bg-white/[0.07] px-4 py-4 ring-1 ring-white/10 sm:px-6">
            <SecondaryLink location={location} />
          </div>

          <p className="mt-5 text-[11px] leading-4 text-white/60">
            {signupCta.disclosure}
          </p>
        </div>
      </div>
    </section>
  );
}
