// Compliance footer for Smarter Way Wealth, LLC.
// Source of truth: ~/.claude/plans/clone-https-github-com-dvanosdol88-smart-synthetic-muffin.md
// Mirror this file to the smarterwaywealth.com repo (smarter-way-wealth) when the text changes.
// Disclosures last updated 2026-04-28.

import Link from "next/link";

const DISCLOSURES_LAST_UPDATED = "2026-04-28";
const COMPLIANCE_EMAIL = "compliance@smarterwaywealth.com";
const COMPLIANCE_PHONE_DISPLAY = "(646) 418-2867";
const COMPLIANCE_PHONE_TEL = "+16464182867";
const IAPD_URL = "https://adviserinfo.sec.gov/firm/summary/342140";

export default function ComplianceFooter() {
  return (
    <section
      id="disclosures"
      className="border-t border-neutral-200 bg-[#EEF0F5] text-neutral-600"
    >
      <div className="mx-auto max-w-[1100px] px-4 py-8 text-xs leading-relaxed sm:px-6">
        <p>
          Smarter Way Wealth, LLC is a registered investment adviser in the
          State of Connecticut (CRD #342140 &mdash;{" "}
          <a
            href={IAPD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-neutral-900"
          >
            verify on IAPD
          </a>
          ). Registration does not imply a certain level of skill or training.
        </p>
        <p className="mt-3">
          Information provided is for educational purposes only and does not
          constitute investment advice, a solicitation, or a recommendation to
          buy or sell any security. Past performance is not indicative of
          future results. All investing involves risk, including possible loss
          of principal.
        </p>
        <p className="mt-3">
          For important disclosures, see our{" "}
          <Link href="/privacy" className="underline hover:text-neutral-900">
            Privacy Policy
          </Link>
          . For questions or concerns, contact us at{" "}
          <a
            href={`mailto:${COMPLIANCE_EMAIL}`}
            className="underline hover:text-neutral-900"
          >
            {COMPLIANCE_EMAIL}
          </a>{" "}
          or{" "}
          <a
            href={`tel:${COMPLIANCE_PHONE_TEL}`}
            className="underline hover:text-neutral-900"
          >
            {COMPLIANCE_PHONE_DISPLAY}
          </a>
          .
        </p>
        <p className="mt-4 text-[11px] text-neutral-500">
          Disclosures last updated {DISCLOSURES_LAST_UPDATED}. &copy;{" "}
          {new Date().getFullYear()} Smarter Way Wealth, LLC. All rights
          reserved.
        </p>
      </div>
    </section>
  );
}
