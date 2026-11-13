import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Smarter Way Wealth",
  description:
    "How Smarter Way Wealth, LLC collects, uses, and protects information from visitors to youarepayingtoomuch.com.",
};

const LAST_UPDATED = "2026-11-13";

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
          The site offers a fee calculator. The assumptions you enter, such as
          portfolio value, fees, growth rate, and time horizon, may appear in
          the page address and in our site analytics. Results are hypothetical
          and are not an account application. Please do not enter confidential
          or personally identifying information into the calculator.
        </p>
        <p>
          If you vote in a poll, contact us, sign up to be notified, or use the
          Become a Client form, we receive the information you choose to share,
          such as your name, email address, state, and any optional note. We use Become a
          Client details to assess fit and follow up with the advisory agreement
          and required disclosures. Please do not include account numbers,
          passwords, or other sensitive information in a note.
        </p>
        <p>
          When you visit, our service providers automatically receive standard
          technical and usage information, such as IP address, browser and
          device information, referring or campaign information, pages viewed,
          clicks, timestamps, and an identifier stored in your browser. This
          site also records how visitors move through its pages, with anything
          typed into form fields masked.
        </p>

        <h2 id="advertising-measurement" className="pt-4 text-lg font-semibold text-neutral-900">
          Advertising measurement
        </h2>
        <p>
          We and our advertising partners, such as social media companies, use
          pixels and similar technologies on our sites to learn whether our ads
          lead people to use our sites. These tools may record a visit, a
          calculator start, a calculator result, a Become a Client request, or a
          booked introductory call, together with standard browser and device
          information and an identifier stored in your browser. We do not send
          our advertising partners your name, email address, phone number,
          portfolio amount, or calculator results. Each partner handles this
          information under its own privacy policy. You can limit ad
          personalization in your social media account settings or block
          third-party cookies in your browser. Secure onboarding pages do not
          use these tools.
        </p>
        <p>
          On this site, our advertising partners include Google. You can limit
          Google ad personalization in Google&rsquo;s{" "}
          <a href="https://myadcenter.google.com/" className="underline" target="_blank" rel="noopener noreferrer">
            My Ad Center
          </a>
          .
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
          We use service providers for website hosting, secure storage, error
          monitoring, site analytics, and meeting scheduling, and advertising
          partners as described above. These providers process information on
          our behalf or under their own privacy policies.
        </p>

        <h2 id="do-not-track" className="pt-4 text-lg font-semibold text-neutral-900">
          Do Not Track
        </h2>
        <p>
          This site does not currently respond to browser &ldquo;Do Not
          Track&rdquo; signals.
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
