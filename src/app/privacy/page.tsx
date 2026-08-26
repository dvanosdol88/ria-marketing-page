import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Smarter Way Wealth",
  description:
    "How Smarter Way Wealth, LLC collects, uses, and protects information from visitors to youarepayingtoomuch.com.",
};

const LAST_UPDATED = "2026-08-26";

export default function PrivacyPolicy() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 text-neutral-900">
      <h1 className="text-3xl font-semibold tracking-tight">Privacy Policy</h1>
      <p className="mt-2 text-sm text-neutral-500">Last updated {LAST_UPDATED}</p>

      <section className="mt-8 space-y-4 text-base leading-relaxed text-neutral-700">
        <p>
          Smarter Way Wealth, LLC (&ldquo;we,&rdquo; &ldquo;our&rdquo;) operates
          youarepayingtoomuch.com. This notice explains what we collect when
          you visit, how we use it, and how to contact us about your
          information.
        </p>

        <h2 id="information-we-collect" className="pt-4 text-lg font-semibold text-neutral-900">
          Information we collect
        </h2>
        <p>
          The site offers a fee-savings calculator. Calculator assumptions such
          as portfolio value, fees, growth rate, and time horizon are processed
          in your browser, may be reflected in the URL, and may be included in
          analytics events so that we can understand how the tool is used.
          Calculator results are hypothetical and are not an account
          application. Do not enter confidential or personally identifying
          information into the calculator.
        </p>
        <p>
          If you submit a vote on an interactive poll, contact us, or sign up
          to be notified, we receive the information you choose to share
          (such as your selection or contact details).
        </p>
        <p>
          If you continue to smarterwaywealth.com and schedule a meeting
          through its embedded Calendly scheduler, Calendly receives the
          information needed to arrange the meeting, including your name,
          email address, conferencing choice, and any optional note you choose
          to provide. Please do not include account numbers, passwords, or
          other sensitive information in that note. We do not send your
          Calendly form responses to PostHog.
        </p>
        <p>
          Our hosting provider (Vercel), error-monitoring provider (Sentry), and
          analytics provider (PostHog) may receive standard technical and usage
          data &mdash; such as IP address, browser and device information,
          referring or campaign information, pages viewed, clicks, timestamps,
          and an anonymous identifier stored in your browser &mdash; for the
          purpose of operating, securing, and improving the site.
        </p>
        <p>
          We do not use PostHog or Sentry session replay on either public site.
          We use event-level signals such as page views, clicks, page leaves,
          device information, campaign attribution, and technical errors. You
          should still avoid entering sensitive financial or personal
          information into ordinary website fields.
        </p>

        <h2 id="how-we-use-information" className="pt-4 text-lg font-semibold text-neutral-900">
          How we use information
        </h2>
        <p>
          We use the information described above to operate and secure the
          site, monitor and fix errors, understand site and campaign
          performance, improve the visitor experience, and respond to inquiries
          you send us. We do not sell personal information.
        </p>

        <h2 id="third-parties" className="pt-4 text-lg font-semibold text-neutral-900">
          Third parties
        </h2>
        <p>
          Our sites are hosted on Vercel, use Sentry for error monitoring,
          PostHog for event-level product analytics, and Calendly for
          meeting scheduling on smarterwaywealth.com. These providers process
          data on our behalf under their own privacy practices.
        </p>

        <h2 id="disclosures" className="pt-4 text-lg font-semibold text-neutral-900">
          Important disclosures
        </h2>
        <p>
          Smarter Way Wealth, LLC is a registered investment adviser in the
          State of Connecticut (CRD #342140). Registration does not imply a
          certain level of skill or training.
        </p>
        <p>
          Information provided on this site, including the fee-savings
          calculator, is for educational purposes only and does not constitute
          investment advice, a solicitation, or a recommendation to buy or
          sell any security. Calculator outputs are hypothetical illustrations
          based on assumptions you provide; actual results will vary, and
          calculator use does not establish an advisory relationship with
          Smarter Way Wealth, LLC. Past performance is not indicative of
          future results. All investing involves risk, including possible
          loss of principal.
        </p>

        <h2 id="your-choices" className="pt-4 text-lg font-semibold text-neutral-900">
          Your choices and contact
        </h2>
        <p>
          Connecticut residents and residents of other states with applicable
          privacy laws may have rights to access, correct, or delete personal
          information we hold about them. To make a request, or for any other
          privacy question, contact us at{" "}
          <a
            href="mailto:compliance@smarterwaywealth.com"
            className="underline hover:text-neutral-900"
          >
            compliance@smarterwaywealth.com
          </a>{" "}
          or{" "}
          <a href="tel:+16464182867" className="underline hover:text-neutral-900">
            (646) 418-2867
          </a>
          .
        </p>

        <h2 id="updates" className="pt-4 text-lg font-semibold text-neutral-900">
          Updates to this notice
        </h2>
        <p>
          We will update this page when our practices change. The
          &ldquo;Last updated&rdquo; date above reflects the most recent
          revision.
        </p>
      </section>
    </main>
  );
}
