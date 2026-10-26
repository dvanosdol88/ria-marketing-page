import ComplianceFooter from "@/components/ComplianceFooter";
import { CalculatorNotes } from "@/components/CalculatorNotes";
import { LegalLinks } from "@/components/LegalLinks";
import { bluesCopy } from "@/config/onePercentBlues";

const BLUES_GROUND = "bg-[#EEF3FF]";
const LEGAL_LINK_CLASS =
  "inline-flex items-center gap-1 !text-[#10233A] no-underline hover:!text-[#1E40AF]";

/** Same footer order as the green site: legal links, firm line, notes, then the regulatory block. */
export function BluesFooter() {
  return (
    <>
      <footer className={`border-t border-white/30 ${BLUES_GROUND} text-[#10233A]`}>
        <div className="mx-auto max-w-[1100px] px-4 pb-6 pt-10 sm:px-6">
          <LegalLinks className={LEGAL_LINK_CLASS} />
          <div className="mt-6 space-y-3">
            <p className="text-sm font-bold">{bluesCopy.footerLine}</p>
            <CalculatorNotes />
          </div>
        </div>
      </footer>
      <ComplianceFooter linksAbove ground={BLUES_GROUND} />
    </>
  );
}
