import { AdvisorProofSections } from "@/components/AdvisorProofSections";

export default function UpgradeYourAdvicePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FinancialService",
    name: "Smarter Way Wealth",
    url: "https://smarterwaywealth.com/",
    founder: {
      "@type": "Person",
      name: "David J. Van Osdol",
      jobTitle: "CFA Charterholder, CFP Practitioner",
    },
  };

  return (
    <main className="bg-[#EEF0F5] text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <AdvisorProofSections />
    </main>
  );
}
