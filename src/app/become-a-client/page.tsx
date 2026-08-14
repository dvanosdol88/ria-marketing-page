import type { Metadata } from "next";
import Link from "next/link";
import { BecomeAClientForm } from "@/components/BecomeAClientForm";
import { signupCta } from "@/config/signupCta";
import { HOME_STATE } from "@/config/becomeAClient";

const TITLE = "Become a client | Smarter Way Wealth";
const DESCRIPTION =
  "Start with Smarter Way Wealth for a flat $100 a month. Fill in three fields and David sends the advisory agreement, Form ADV Part 2, and Form CRS in a single email.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: signupCta.primary.href },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: signupCta.primary.href,
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

/**
 * Page-specific schema. The site-wide Organization/WebSite declarations live
 * in the root layout — this describes only what THIS page offers.
 */
const structuredData = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Flat-fee investment advice",
  provider: {
    "@type": "FinancialService",
    name: "Smarter Way Wealth, LLC",
    url: "https://smarterwaywealth.com",
  },
  areaServed: HOME_STATE,
  offers: {
    "@type": "Offer",
    price: "100",
    priceCurrency: "USD",
    description: "Flat $100 per month advisory fee, regardless of portfolio size.",
  },
};

const STEPS = [
  {
    title: "You fill in three fields",
    body: "Name, email, and your state. It takes about a minute.",
  },
  {
    title: "David sends one email",
    body: "The advisory agreement to sign, with the firm's Form ADV Part 2 and Form CRS attached. No separate confirmation step to click through.",
  },
  {
    title: "You sign — and that's the start",
    body: "Nothing is owed and nothing begins until you do. Your money stays where it is; Smarter Way Wealth never takes custody of client funds.",
  },
];

export default function BecomeAClientPage() {
  return (
    <main className="bg-[#EEF0F5] pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <header className="section-shell pt-10 sm:pt-14">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#108843]">
          Become a client
        </p>
        <h1 className="mt-3 text-balance text-3xl font-black leading-tight text-[#10233A] sm:text-5xl">
          One flat fee. $100 a month.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[#31465F] sm:text-lg">
          No commissions, no products, and no percentage of your money. Your fee
          stays exactly the same as your portfolio grows.
        </p>
      </header>

      <section className="section-shell mt-10 max-w-2xl">
        <ol className="flex flex-col gap-4">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="flex gap-4 rounded-xl border border-[#D8E2EA] bg-white p-4 sm:p-5"
            >
              <span
                aria-hidden="true"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#064B84] text-sm font-bold text-white"
              >
                {index + 1}
              </span>
              <div className="min-w-0">
                <h2 className="text-base font-bold text-[#10233A]">{step.title}</h2>
                <p className="mt-1 text-sm leading-6 text-[#31465F]">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="section-shell mt-10 max-w-2xl">
        <div className="rounded-2xl border border-[#D8E2EA] bg-white p-5 sm:p-8">
          <BecomeAClientForm />
        </div>
      </section>

      <section className="section-shell mt-8 max-w-2xl">
        <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-[#5A6B80]">
          Two things worth knowing first
        </h2>
        <dl className="mt-3 flex flex-col gap-4">
          <div>
            <dt className="text-base font-bold text-[#10233A]">
              There is a $250,000 minimum.
            </dt>
            <dd className="mt-1 text-sm leading-6 text-[#31465F]">
              That is the standard minimum in investable assets disclosed in the
              firm&apos;s Form ADV Part 2A. It can be waived at the firm&apos;s
              discretion — if you are close, say so and David will tell you
              honestly.
            </dd>
          </div>
          <div>
            <dt className="text-base font-bold text-[#10233A]">
              The firm is registered in {HOME_STATE}.
            </dt>
            <dd className="mt-1 text-sm leading-6 text-[#31465F]">
              Most states allow an out-of-state adviser to serve a limited
              number of their residents without separate registration, so living
              elsewhere is usually fine. David confirms it before anything is
              signed.
            </dd>
          </div>
        </dl>
      </section>

      <section className="section-shell mt-10 max-w-2xl">
        <div className="rounded-2xl bg-[#064B84] p-6 text-center text-white sm:p-8">
          <p className="text-lg font-bold">{signupCta.secondary.prompt}</p>
          <p className="mt-2 text-sm leading-6 text-white/85">
            Talk it through first. Fifteen minutes over Zoom, nothing to
            prepare, and nobody will try to sell you anything.
          </p>
          <a
            href={signupCta.secondary.href}
            className="mt-5 inline-flex min-h-[48px] w-full items-center justify-center rounded-full bg-white px-6 text-base font-bold !text-[#064B84] !no-underline transition hover:bg-white/90 sm:w-auto"
            data-posthog-cta="true"
            data-posthog-cta-label={signupCta.secondary.label}
            data-posthog-cta-location="signup_page_secondary"
          >
            Meet David for 15 minutes
          </a>
        </div>
      </section>

      <section className="section-shell mt-8 max-w-2xl">
        <Link
          href="/#faq"
          className="text-sm font-semibold text-[#064B84] underline underline-offset-4"
        >
          Read the FAQ first
        </Link>
      </section>
    </main>
  );
}
