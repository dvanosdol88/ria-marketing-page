import ComplianceFooter from "@/components/ComplianceFooter";
import { CalculatorNotes } from "@/components/CalculatorNotes";
import { bluesCopy } from "@/config/onePercentBlues";

const IAPD_URL = "https://adviserinfo.sec.gov/firm/summary/342140";
const DISCLOSURES_URL = "https://smarterwaywealth.com/disclosures";
const ADV_BROCHURE_URL = "https://smarterwaywealth.com/disclosures/ADV-Part-2A.pdf";
const PRIVACY_URL = "https://smarterwaywealth.com/privacy";

const LEGAL_LINK_CLASS = "!text-[#52657A] no-underline transition-colors hover:!text-[#10233A]";

/** The same footer contract as SiteFooter — the calculator disclaimer that
 *  every `*` marker on the page links to, plus the four legal links — on a
 *  pale-blue ground, followed by the unchanged regulatory ComplianceFooter. */
export function BluesFooter() {
  return (
    <>
      <footer className="border-t border-white/30 bg-[#EEF3FF] text-[#10233A]">
        <div className="mx-auto max-w-[1100px] px-4 py-10 sm:px-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-2xl space-y-3">
              <p className="text-sm font-bold">{bluesCopy.footerLine}</p>
              <CalculatorNotes />
            </div>
            <div className="flex shrink-0 flex-wrap gap-x-6 gap-y-2 text-sm">
              <a href={DISCLOSURES_URL} className={LEGAL_LINK_CLASS}>
                Disclosures
              </a>
              <a href={ADV_BROCHURE_URL} target="_blank" rel="noopener noreferrer" className={LEGAL_LINK_CLASS}>
                ADV Brochure (PDF)
              </a>
              <a href={IAPD_URL} target="_blank" rel="noopener noreferrer" className={LEGAL_LINK_CLASS}>
                Verify on IAPD
              </a>
              <a href={PRIVACY_URL} className={LEGAL_LINK_CLASS}>
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
