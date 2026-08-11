import Link from "next/link";
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
};

const INLINE_PRIMARY_BUTTON_CLASS =
  "flex min-h-[48px] w-full items-center justify-center rounded-full bg-[#00D8FF] px-6 text-center text-base font-bold !text-[#052E45] !no-underline shadow-sm transition hover:bg-[#3FE3FF] hover:!text-[#052E45] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#00D8FF]";

/** The retained full-card CTA is intentionally quiet: the white pill is the
 * single primary action after the headline/body were deprecated. */
const BLOCK_PRIMARY_BUTTON_CLASS =
  "flex min-h-[48px] w-full items-center justify-center rounded-full bg-white px-6 text-center text-base font-bold !text-[#052E45] !no-underline shadow-sm transition hover:bg-white/90 hover:!text-[#052E45] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white";

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
}: SignupCtaProps) {
  const primaryButtonClass =
    variant === "block" ? BLOCK_PRIMARY_BUTTON_CLASS : INLINE_PRIMARY_BUTTON_CLASS;

  const primary = (
    <Link
      href={signupCta.primary.href}
      className={primaryButtonClass}
      data-posthog-cta="true"
      data-posthog-cta-label={signupCta.primary.label}
      data-posthog-cta-location={`${location}_primary`}
    >
      {signupCta.primary.label}
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
    <section className="w-full bg-[#EEF0F5] px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-3xl rounded-2xl bg-[#064B84] p-6 text-white shadow-[0_18px_44px_rgba(6,75,132,0.22)] sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">
          {signupCta.block.eyebrow}
        </p>

        <div className="mt-6 sm:mx-auto sm:max-w-md">{primary}</div>

        <div className="mt-6 border-t border-white/20 pt-6">
          <SecondaryLink location={location} />
        </div>

        <p className="mt-6 text-[11px] leading-4 text-white/60">
          {signupCta.disclosure}
        </p>
      </div>
    </section>
  );
}
