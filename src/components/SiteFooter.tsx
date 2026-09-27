"use client";

import { usePathname } from "next/navigation";
import ComplianceFooter from "@/components/ComplianceFooter";
import { CalculatorNotes } from "@/components/CalculatorNotes";
import { LegalLinks } from "@/components/LegalLinks";

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
      {/* DECISION, 2026-09-23 (David: remove the redundancies, fix the alignment). One footer,
          one left edge: the legal links sit once, at the top, flush with the
          text below; the small grey logo is gone (its SVG carries built-in
          padding, so it could never line up with the text, and the brand is
          already shown full-size in the Visit card directly above). */}
      <footer className="border-t border-neutral-200 bg-[#EEF0F5]">
        <div className="mx-auto max-w-[1100px] px-4 pb-6 pt-10 sm:px-6">
          <LegalLinks className="inline-flex items-center gap-1 !text-[#10233A] no-underline hover:!text-[#007A2F]" />
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
