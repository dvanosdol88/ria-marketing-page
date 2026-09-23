"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
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
      {/* PROPOSAL v2 (2026-09-23, David: redundancies + alignment). One footer,
          one left edge: the legal links sit once, at the top, flush with the
          text below; the small grey logo is gone (its SVG carries built-in
          padding, so it could never line up with the text, and the brand is
          already shown full-size in the Visit card directly above). */}
      <footer className="border-t border-neutral-200 bg-[#EEF0F5]">
        <div className="mx-auto max-w-[1100px] px-4 pb-6 pt-10 sm:px-6">
          <nav aria-label="Legal" className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold">
            <a
              href={DISCLOSURES_URL}
              className="inline-flex items-center gap-1 !text-[#10233A] no-underline hover:!text-[#007A2F]"
            >
              Disclosures
              <ExternalLink aria-hidden="true" className="h-[1.25em] w-[1.25em] shrink-0" />
            </a>
            <a
              href={ADV_BROCHURE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 !text-[#10233A] no-underline hover:!text-[#007A2F]"
            >
              ADV Brochure (PDF)
              <ExternalLink aria-hidden="true" className="h-[1.25em] w-[1.25em] shrink-0" />
            </a>
            <a
              href={IAPD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 !text-[#10233A] no-underline hover:!text-[#007A2F]"
            >
              Verify on IAPD
              <ExternalLink aria-hidden="true" className="h-[1.25em] w-[1.25em] shrink-0" />
            </a>
            <a
              href={PRIVACY_URL}
              className="inline-flex items-center gap-1 !text-[#10233A] no-underline hover:!text-[#007A2F]"
            >
              Privacy Policy
              <ExternalLink aria-hidden="true" className="h-[1.25em] w-[1.25em] shrink-0" />
            </a>
          </nav>
          <div className="mt-6 empty:hidden">
            {/* The calculator disclaimer itself, gated to the calculator route
                (see git history for the full rationale). */}
            {isCalculatorPage ? <CalculatorNotes /> : null}
          </div>
        </div>
      </footer>
      <ComplianceFooter linksAbove />
    </>
  );
}
