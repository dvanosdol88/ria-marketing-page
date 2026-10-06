import { ExternalLink } from "lucide-react";

const IAPD_URL = "https://adviserinfo.sec.gov/firm/summary/342140";
const DISCLOSURES_URL = "https://smarterwaywealth.com/disclosures";
const ADV_BROCHURE_URL = "https://smarterwaywealth.com/disclosures/ADV-Part-2A.pdf";
const PRIVACY_URL = "https://smarterwaywealth.com/privacy";

/**
 * The four legal links shared by SiteFooter and BluesFooter. Hrefs and the
 * unbounded ExternalLink size live here; each host passes its own ink.
 */
export function LegalLinks({ className }: { className: string }) {
  return (
    <nav aria-label="Legal" className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold">
      <a href={DISCLOSURES_URL} className={className}>
        Disclosures
        <ExternalLink aria-hidden="true" className="h-[1.25em] w-[1.25em] shrink-0" />
      </a>
      <a href={ADV_BROCHURE_URL} target="_blank" rel="noopener noreferrer" className={className}>
        ADV Brochure (PDF)
        <ExternalLink aria-hidden="true" className="h-[1.25em] w-[1.25em] shrink-0" />
      </a>
      <a href={IAPD_URL} target="_blank" rel="noopener noreferrer" className={className}>
        Verify on IAPD
        <ExternalLink aria-hidden="true" className="h-[1.25em] w-[1.25em] shrink-0" />
      </a>
      <a href={PRIVACY_URL} className={className}>
        Privacy Policy
        <ExternalLink aria-hidden="true" className="h-[1.25em] w-[1.25em] shrink-0" />
      </a>
    </nav>
  );
}
