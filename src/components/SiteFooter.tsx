"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ComplianceFooter from "@/components/ComplianceFooter";

const IAPD_URL = "https://adviserinfo.sec.gov/firm/summary/342140";

// The firm keeps one set of disclosures and one privacy policy, both on the
// firm site. These used to point at local copies on this domain, which is how
// the two sites drifted apart on what "important disclosures" meant.
const DISCLOSURES_URL = "https://smarterwaywealth.com/disclosures";
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
              <p className="text-sm leading-relaxed text-neutral-500">
                Calculator projections are hypothetical and for illustrative purposes only.
                They are not a guarantee of future returns.
              </p>
            </div>

            {/* Right: Legal links */}
            <div className="flex gap-6 text-sm text-neutral-500 shrink-0">
              <a
                href={DISCLOSURES_URL}
                className="hover:text-neutral-700 no-underline"
              >
                Disclosures
              </a>
              <a
                href={IAPD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-neutral-700 no-underline"
              >
                ADV
              </a>
              <a
                href={PRIVACY_URL}
                className="hover:text-neutral-700 no-underline"
              >
                Privacy
              </a>
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
