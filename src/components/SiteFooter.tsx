"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ComplianceFooter from "@/components/ComplianceFooter";
import { CalculatorNotes } from "@/components/CalculatorNotes";

const IAPD_URL = "https://adviserinfo.sec.gov/firm/summary/342140";

// The firm keeps one set of disclosures and one privacy policy, both on the
// firm site. These used to point at local copies on this domain, which is how
// the two sites drifted apart on what "important disclosures" meant.
const DISCLOSURES_URL = "https://smarterwaywealth.com/disclosures";
const ADV_BROCHURE_URL = "https://smarterwaywealth.com/disclosures/ADV-Part-2A.pdf";
const PRIVACY_URL = "https://smarterwaywealth.com/privacy";

/**
 * Shared site-wide footer. Renders the marketing footer block and the
 * full regulatory compliance disclosures below it.
 */
export function SiteFooter() {
  const pathname = usePathname();

  if (
    pathname.startsWith("/evals") ||
    pathname.startsWith("/calculator-evals") ||
    pathname.startsWith("/url-evals") ||
    pathname.startsWith("/gallery")
  ) {
    return null;
  }

  /* Query strings do not reach pathname, so the calculator's variant URLs
     (/?mode=calculator-first, /?variant=final-home) are covered by this too —
     which matters, because they render the markers that link to the notes. */
  const isCalculatorPage = pathname === "/";

  return (
    <>
      <footer className="border-t border-neutral-200 bg-[#EEF0F5]">
        <div className="mx-auto max-w-[1100px] px-4 py-10 sm:px-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:justify-between sm:items-start">
            {/* Left: Logo + Disclaimer */}
            <div className="max-w-2xl space-y-3">
              <Link href={"/" as any} aria-label="Smarter Way Wealth home">
                <Image
                  src="/brand/logo.svg"
                  alt="Smarter Way Wealth"
                  width={170}
                  height={68}
                  className="h-6 w-auto opacity-75 grayscale"
                />
              </Link>
              {/* The calculator disclaimer itself, not a paraphrase of it. This
                  slot used to hold "Calculator projections are hypothetical and
                  for illustrative purposes only. They are not a guarantee of
                  future returns." — a weaker restatement of the real disclaimer
                  that sat further up the page, so the site said the same thing
                  twice and neither one was clearly the operative version
                  (David, 2026-08-12).

                  Only where the calculator is. The footer is site-wide, and
                  this text speaks of "the assumptions entered here" — which on
                  /faq or /privacy would refer to assumptions the page gives the
                  reader no way to enter. The home page is the only route that
                  renders the calculator, and therefore the only one carrying
                  the markers that link down to this. */}
              {isCalculatorPage ? <CalculatorNotes /> : null}
            </div>

            {/* Right: Legal links */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-neutral-500 shrink-0">
              <a
                href={DISCLOSURES_URL}
                className="hover:text-neutral-700 no-underline"
              >
                Disclosures
              </a>
              <a
                href={ADV_BROCHURE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-neutral-700 no-underline"
              >
                ADV Brochure (PDF)
              </a>
              <a
                href={IAPD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-neutral-700 no-underline"
              >
                Verify on IAPD
              </a>
              {/* One link, not two. "Privacy" and "Privacy Policy" sat side by
                  side pointing at the same page once both were aimed at the
                  firm site. */}
              <a
                href={PRIVACY_URL}
                className="hover:text-neutral-700 no-underline"
              >
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
      <ComplianceFooter />
    </>
  );
}
