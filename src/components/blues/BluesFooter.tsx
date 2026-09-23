import { ExternalLink } from "lucide-react";
import ComplianceFooter from "@/components/ComplianceFooter";
import { CalculatorNotes } from "@/components/CalculatorNotes";

const IAPD_URL = "https://adviserinfo.sec.gov/firm/summary/342140";
const DISCLOSURES_URL = "https://smarterwaywealth.com/disclosures";
const ADV_BROCHURE_URL = "https://smarterwaywealth.com/disclosures/ADV-Part-2A.pdf";
const PRIVACY_URL = "https://smarterwaywealth.com/privacy";

const LEGAL_LINK_CLASS =
  "inline-flex items-center gap-1 !text-[#10233A] no-underline transition-colors hover:!text-[#2563EB]";
const LEGAL_ICON_CLASS = "h-[1.25em] w-[1.25em] shrink-0";

/** The same footer contract as SiteFooter, on the page's pale-blue ground.
 *
 *  DECISION, 2026-09-23 (David: apply the YAPT single-footer cleanup here too):
 *  one footer, one left edge. The four legal links sit once, at the top, each
 *  with the leave-site icon; the calculator disclaimer every `*` marker links
 *  to runs full width beneath them instead of in a narrow side column; and the
 *  regulatory block joins as the same unit (`linksAbove`) without repeating
 *  the IAPD / disclosures / privacy pointers. The bold line "Smarter Way
 *  Wealth, LLC · Connecticut-registered investment adviser · CRD #342140" was
 *  dropped: the registration sentence directly below states the same three
 *  facts. (It is still in bluesCopy.footerLine if David wants it back.) */
export function BluesFooter() {
  return (
    <>
      <footer className="border-t border-white/30 bg-[#EEF3FF] text-[#10233A]">
        <div className="mx-auto max-w-[1100px] px-4 pb-6 pt-10 sm:px-6">
          <nav aria-label="Legal" className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold">
            <a href={DISCLOSURES_URL} className={LEGAL_LINK_CLASS}>
              Disclosures
              <ExternalLink aria-hidden="true" className={LEGAL_ICON_CLASS} />
            </a>
            <a href={ADV_BROCHURE_URL} target="_blank" rel="noopener noreferrer" className={LEGAL_LINK_CLASS}>
              ADV Brochure (PDF)
              <ExternalLink aria-hidden="true" className={LEGAL_ICON_CLASS} />
            </a>
            <a href={IAPD_URL} target="_blank" rel="noopener noreferrer" className={LEGAL_LINK_CLASS}>
              Verify on IAPD
              <ExternalLink aria-hidden="true" className={LEGAL_ICON_CLASS} />
            </a>
            <a href={PRIVACY_URL} className={LEGAL_LINK_CLASS}>
              Privacy Policy
              <ExternalLink aria-hidden="true" className={LEGAL_ICON_CLASS} />
            </a>
          </nav>
          <div className="mt-6">
            <CalculatorNotes />
          </div>
        </div>
      </footer>
      <ComplianceFooter linksAbove surfaceClassName="bg-[#EEF3FF]" />
    </>
  );
}
