import ComplianceFooter from "@/components/ComplianceFooter";
import { CalculatorNotes } from "@/components/CalculatorNotes";
import { LegalLinks } from "@/components/LegalLinks";
import { bluesCopy } from "@/config/onePercentBlues";

const BLUES_GROUND = "bg-[#EEF3FF]";
const LEGAL_LINK_CLASS =
  "inline-flex items-center gap-1 !text-[#10233A] no-underline hover:!text-[#007A2F]";

/** DECISION (David, 2026-09-23 on the green site; applied here 2026-09-24):
 *  the same single footer as SiteFooter — the four legal links once, at the
 *  top, each with the leave-site icon (all four leave this domain), then the
 *  firm line and the calculator disclaimer every `*` marker links to — on the
 *  pale-blue ground, joined by the regulatory block in its `linksAbove` form. */
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
