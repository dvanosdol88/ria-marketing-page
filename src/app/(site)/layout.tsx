import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";

/**
 * Green site chrome — header, footer and the site-level JSON-LD — lives on
 * this route group rather than on the root layout, so the blue front door
 * (src/app/(blues), served on onepercentblues.com) can carry its own without
 * inheriting this one. Route groups never appear in URLs: every page under
 * (site) keeps the address it had. See docs/superpowers/specs/
 * 2026-09-17-one-percent-blues-design.md §3.1.
 */

const siteJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "FinancialService",
    "@id": "https://youarepayingtoomuch.com/#smarter-way-wealth",
    name: "Smarter Way Wealth, LLC",
    url: "https://smarterwaywealth.com/",
    description:
      "Connecticut-registered investment adviser offering credentialed fiduciary planning for a flat monthly fee.",
    identifier: "CRD #342140",
    sameAs: ["https://adviserinfo.sec.gov/firm/summary/342140"],
    founder: {
      "@type": "Person",
      name: "David J. Van Osdol",
      jobTitle: "Founder",
      honorificSuffix: "CFA, CFP",
    },
    contactPoint: {
      "@type": "ContactPoint",
      email: "compliance@smarterwaywealth.com",
      telephone: "+1-646-418-2867",
      contactType: "Compliance",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://youarepayingtoomuch.com/#website",
    name: "You Are Paying Too Much",
    url: "https://youarepayingtoomuch.com/",
    about: { "@id": "https://youarepayingtoomuch.com/#smarter-way-wealth" },
  },
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "@id": "https://youarepayingtoomuch.com/#fee-calculator",
    name: "Investment Fee Calculator",
    url: "https://youarepayingtoomuch.com/",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    about: { "@id": "https://youarepayingtoomuch.com/#smarter-way-wealth" },
  },
];

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
      />
      <SiteNav />
      <div className="min-h-screen">{children}</div>
      <SiteFooter />
    </>
  );
}
