import { meetDavidCta } from "@/config/meetDavidCta";

type MeetDavidCtaProps = {
  /** PostHog CTA location tag so each placement is distinguishable. */
  location: string;
};

/**
 * Compact booking block pointing at the firm site's scheduler page.
 * Mobile-first: single column, full-width 48px tap target; the facts row
 * becomes three columns from `sm` up.
 */
export function MeetDavidCta({ location }: MeetDavidCtaProps) {
  return (
    <section className="w-full bg-[#EEF0F5] px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-3xl rounded-2xl bg-[#064B84] p-6 text-white shadow-[0_18px_44px_rgba(6,75,132,0.22)] sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">
          {meetDavidCta.eyebrow}
        </p>
        <h2 className="mt-3 text-balance text-3xl font-black leading-tight tracking-normal sm:text-4xl">
          {meetDavidCta.headline}
        </h2>
        <p className="mt-4 text-sm leading-6 text-white/85 sm:text-base sm:leading-7">
          {meetDavidCta.body}
        </p>

        <dl className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {meetDavidCta.facts.map((fact) => (
            <div
              key={fact.label}
              className="rounded-lg bg-white/10 px-4 py-3 ring-1 ring-white/15"
            >
              <dt className="text-[10px] font-bold uppercase tracking-wider text-white/60">
                {fact.label}
              </dt>
              <dd className="mt-1 text-sm font-semibold text-white">{fact.value}</dd>
            </div>
          ))}
        </dl>

        <a
          href={meetDavidCta.href}
          className="mt-7 flex min-h-[48px] w-full items-center justify-center rounded-full bg-white px-6 text-base font-bold !text-[#064B84] !no-underline shadow-sm transition hover:bg-white/90 hover:!text-[#053E6D] sm:w-auto sm:self-start"
          data-posthog-cta-label={meetDavidCta.ctaLabel}
          data-posthog-cta-location={location}
        >
          {meetDavidCta.ctaLabel}
        </a>
      </div>
    </section>
  );
}
