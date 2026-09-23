import Link from "next/link";
import { ArrowRight, BadgeCheck, ExternalLink } from "lucide-react";
import { signupCta } from "@/config/signupCta";

type SignupCtaProps = {
  /** PostHog CTA location tag so each placement is distinguishable. */
  location: string;
  /**
   * "block" — the page's closing ask, a full dark card.
   * "inline" — compact, sits directly under the calculator result while the
   * number is still on screen. Pass `savingsLabel` to carry it into the copy.
   */
  variant?: "block" | "inline";
  /** Formatted savings figure (e.g. "$184,000"). Inline variant only. */
  savingsLabel?: string | null;
  /** Outer band background for the block variant. The One Percent Blues page
   *  passes bg-transparent so the card floats on its gradient. */
  surfaceClassName?: string;
  /** Absolute destination for the primary button, rendered as a plain <a>
   *  instead of next/link. The One Percent Blues page passes the green
   *  site's sign-up URL: on onepercentblues.com every green route redirects
   *  cross-domain, and a client-side prefetch of that redirect fails CORS. */
  primaryHref?: string;
};

const INLINE_PRIMARY_BUTTON_CLASS =
  "flex min-h-[48px] w-full items-center justify-center rounded-full bg-[#00D8FF] px-6 text-center text-base font-bold !text-[#052E45] !no-underline shadow-sm transition hover:bg-[#3FE3FF] hover:!text-[#052E45] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#00D8FF]";

/** The retained full-card CTA is intentionally quiet: the white pill is the
 * single primary action after the headline/body were deprecated. The group/
 * arrow treatment is presentation only — one button, same label, same door. */
const BLOCK_PRIMARY_BUTTON_CLASS =
  "group flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-white px-6 text-center text-base font-bold !text-[#052E45] !no-underline shadow-[0_10px_26px_rgba(3,26,42,0.35)] transition hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_16px_34px_rgba(3,26,42,0.45)] hover:!text-[#052E45] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white";

const HOME_CLIENT_VALUE_ITEMS = [
  { label: "Personal financial planning and tailored investment recommendations." },
  { label: "Direct access to David, regular meetings, and ongoing advice." },
  { label: "In-depth portfolio analysis." },
  { label: "Clear, step-by-step implementation help while you keep your accounts and place trades yourself." },
  { label: "More", href: "https://smarterwaywealth.com/" },
] as const;

/**
 * Secondary next step. Deliberately a plain underlined link, never a second
 * button — two buttons of equal weight make the visitor classify themselves
 * before they can act, and most resolve that by doing nothing.
 */
function SecondaryLink({ location }: { location: string }) {
  return (
    <div className="text-center">
      <p className="text-sm text-white/90">{signupCta.secondary.prompt}</p>
      <a
        href={signupCta.secondary.href}
        className="mt-1 inline-flex min-h-[44px] items-center text-sm font-semibold !text-[#8ED3A8] underline decoration-[#8ED3A8]/60 underline-offset-4 transition hover:!text-[#B6E8C8]"
        data-posthog-cta="true"
        data-posthog-cta-label={signupCta.secondary.label}
        data-posthog-cta-location={`${location}_secondary`}
      >
        {signupCta.secondary.label}
      </a>
      <p className="text-xs leading-5 text-white/70">
        {signupCta.secondary.reassurance}
      </p>
    </div>
  );
}

export function SignupCta({
  location,
  variant = "block",
  savingsLabel = null,
  surfaceClassName = "bg-[#EEF0F5]",
  primaryHref,
}: SignupCtaProps) {
  // The homepage uses David's compact two-choice layout. Other placements keep
  // their existing presentation and all analytics labels remain stable.
  if (variant === "block" && location === "home_post_calculator") {
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
          <div
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
          </div>
          <Link
            href={signupCta.primary.href}
            className="flex min-h-[56px] w-full items-center justify-center gap-2 rounded-md bg-[#064B84] px-6 py-4 text-center text-lg font-bold !text-white !no-underline shadow-sm transition hover:bg-[#053B6A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#064B84]"
            data-posthog-cta="true"
            data-posthog-cta-label={signupCta.primary.label}
            data-posthog-cta-location={`${location}_primary`}
          >
            Sign me up — Become a client
            <ExternalLink aria-hidden="true" className="h-[1.25em] w-[1.25em] shrink-0" strokeWidth={2.5} />
          </Link>
          <a
            href={signupCta.secondary.href}
            className="flex min-h-[80px] w-full flex-col items-center justify-center gap-1 rounded-md bg-[#008532] px-6 py-4 text-center !text-white !no-underline shadow-sm transition hover:bg-[#006B28] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#008532]"
            data-posthog-cta="true"
            data-posthog-cta-label={signupCta.secondary.label}
            data-posthog-cta-location={`${location}_secondary`}
          >
            <span className="inline-flex items-center gap-2 text-lg font-bold">
              See if I&apos;m a good fit
              <ExternalLink aria-hidden="true" className="h-[1.25em] w-[1.25em] shrink-0" strokeWidth={2.5} />
            </span>
            <span className="text-sm">Schedule a 15-minute talk with David</span>
          </a>
          <p className="text-center text-xs leading-5 text-[#536278]">
            {signupCta.disclosure}
          </p>
        </div>
      </section>
    );
  }

  const primaryButtonClass =
    variant === "block" ? BLOCK_PRIMARY_BUTTON_CLASS : INLINE_PRIMARY_BUTTON_CLASS;

  const primaryContent = (
    <>
      {signupCta.primary.label}
      {variant === "block" ? (
        <ArrowRight
          aria-hidden="true"
          className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-1"
          strokeWidth={2.75}
        />
      ) : null}
    </>
  );

  const primary = primaryHref ? (
    <a
      href={primaryHref}
      className={primaryButtonClass}
      data-posthog-cta="true"
      data-posthog-cta-label={signupCta.primary.label}
      data-posthog-cta-location={`${location}_primary`}
    >
      {primaryContent}
    </a>
  ) : (
    <Link
      href={signupCta.primary.href}
      className={primaryButtonClass}
      data-posthog-cta="true"
      data-posthog-cta-label={signupCta.primary.label}
      data-posthog-cta-location={`${location}_primary`}
    >
      {primaryContent}
    </Link>
  );

  if (variant === "inline") {
    return (
      <section className="mt-4 w-full rounded-lg bg-[#064B84] p-5 text-white sm:p-6">
        <h2 className="text-balance text-xl font-black leading-tight sm:text-2xl">
          {savingsLabel
            ? `That ${savingsLabel} doesn't have to go to fees.`
            : signupCta.block.headline}
        </h2>
        <div className="mt-4">{primary}</div>
        <div className="mt-4">
          <SecondaryLink location={location} />
        </div>
        <p className="mt-4 text-[11px] leading-4 text-white/60">
          {signupCta.disclosure}
        </p>
      </section>
    );
  }

  return (
    <section className={`w-full ${surfaceClassName} px-4 py-10 sm:px-6 sm:py-14`}>
      <div className="relative mx-auto max-w-3xl overflow-hidden rounded-2xl bg-gradient-to-br from-[#0A5A9C] via-[#064B84] to-[#04324F] p-6 text-white shadow-[0_22px_54px_rgba(6,75,132,0.30)] sm:p-10">
        {/* Quiet brand mark in the card's corner — the same three rising bars
            as the logo, screened way back. Identity, not decoration; carries
            no copy, so the deprecated headline/body stay deprecated. */}
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
