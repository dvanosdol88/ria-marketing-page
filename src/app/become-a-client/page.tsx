import type { Metadata } from "next";
import Link from "next/link";
import { signupCta } from "@/config/signupCta";

const TITLE = "Secure onboarding | Smarter Way Wealth";
const DESCRIPTION =
  "Smarter Way Wealth direct onboarding is temporarily paused while final identity, privacy, and provider checks are completed.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: signupCta.primary.href },
  robots: { index: false, follow: true },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: signupCta.primary.href,
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

const JOURNEY = [
  "Verify",
  "Your Story",
  "Confirm Fit",
  "Make It Official",
  "Financial Picture",
  "First Meeting",
] as const;

export default function BecomeAClientPage() {
  return (
    <main className="bg-[#EEF0F5] pb-16">
      <header className="section-shell pt-10 sm:pt-14">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#007A2F]">
          Secure direct onboarding
        </p>
        <h1 className="mt-3 max-w-3xl text-balance text-3xl font-black leading-tight text-[#10233A] sm:text-5xl">
          Direct onboarding is temporarily paused.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[#31465F] sm:text-lg">
          We are finishing the verified-access, privacy, and provider checks that must work before
          anyone shares personal information or signs an advisory agreement.
        </p>
      </header>

      <section className="section-shell mt-10 max-w-3xl" aria-labelledby="pause-boundary">
        <div className="border border-[#B8C9D8] border-t-4 border-t-[#108843] bg-white p-5 shadow-[8px_8px_0_rgba(16,35,58,0.08)] sm:p-8">
          <h2 id="pause-boundary" className="text-2xl font-black text-[#10233A]">
            Nothing is being collected on this page.
          </h2>
          <ul className="mt-5 grid gap-3 text-sm leading-6 text-[#31465F] sm:text-base">
            <li className="border-l-4 border-[#108843] bg-[#EEF9F2] px-4 py-3">
              Do not send your name, email, financial details, documents, or account information
              here.
            </li>
            <li className="border-l-4 border-[#108843] bg-[#EEF9F2] px-4 py-3">
              No agreement, disclosure delivery, signature request, or billing authorization is
              created from this page.
            </li>
            <li className="border-l-4 border-[#108843] bg-[#EEF9F2] px-4 py-3">
              No advisory relationship begins until the complete secure process is available and
              every required item is executed.
            </li>
          </ul>
        </div>
      </section>

      <section className="section-shell mt-12 max-w-3xl" aria-labelledby="secure-journey">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#007A2F]">
          What will reopen here
        </p>
        <h2 id="secure-journey" className="mt-3 text-2xl font-black text-[#10233A] sm:text-3xl">
          One private journey with clear ownership at every step.
        </h2>
        <ol className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {JOURNEY.map((phase, index) => (
            <li key={phase} className="flex min-h-16 items-center gap-3 border border-[#D8E2EA] bg-white px-4 py-3">
              <span
                aria-hidden="true"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#10233A] text-sm font-bold text-white"
              >
                {index + 1}
              </span>
              <span className="font-bold text-[#10233A]">{phase}</span>
            </li>
          ))}
        </ol>
        <p className="mt-5 text-sm leading-6 text-[#5A6B80]">
          The permanent direct path will reopen here only after the entire mobile and desktop
          journey is production-proven.
        </p>
      </section>

      <section className="section-shell mt-12 max-w-3xl">
        <div className="bg-[#064B84] p-6 text-white sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#A8D8F0]">
            Optional while direct onboarding is paused
          </p>
          <h2 className="mt-3 text-2xl font-black">Talk with David first.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/85">
            You may schedule the existing 15-minute, no-obligation conversation. This is optional
            and does not replace the secure direct-onboarding path.
          </p>
          <a
            href={signupCta.secondary.href}
            className="mt-5 inline-flex min-h-[48px] w-full items-center justify-center rounded-full bg-white px-6 text-base font-bold !text-[#064B84] !no-underline transition hover:bg-white/90 sm:w-auto"
            data-posthog-cta="true"
            data-posthog-cta-label={signupCta.secondary.label}
            data-posthog-cta-location="signup_pause_optional_meeting"
          >
            Meet David for 15 minutes
          </a>
        </div>
      </section>

      <section className="section-shell mt-8 max-w-3xl">
        <Link
          href="https://smarterwaywealth.com/how"
          className="text-sm font-semibold text-[#064B84] underline underline-offset-4"
        >
          See how Smarter Way Wealth works
        </Link>
      </section>
    </main>
  );
}
