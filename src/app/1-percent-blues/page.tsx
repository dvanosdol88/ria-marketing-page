import type { Metadata } from "next";
import { CostAnalysisCalculator } from "@/components/CostAnalysisCalculator";
import { campaignLandingPresets } from "@/config/campaignLandingPresets";
import { type HomeSearchParams, resolveHomeLanding } from "@/lib/homeLanding";

const preset = campaignLandingPresets["one-percent-blues"];

export const metadata: Metadata = {
  title: "1% Blues Fee Calculator | Smarter Way Wealth",
  description:
    "Run the 1% Blues mailer scenario: $1,000,000, 20 years, 8% growth, and a 1% advisory fee compared with $100/month.",
  alternates: {
    canonical: preset.qrTargetUrl,
  },
  openGraph: {
    title: "1% Blues Fee Calculator",
    description:
      "See what a 1% advisory fee could cost over time using the mailer assumptions.",
    url: preset.qrTargetUrl,
    siteName: "Smarter Way Wealth",
    images: [
      {
        url: "/brand/logo-800.png",
        width: 800,
        height: 320,
        alt: "Smarter Way Wealth",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "1% Blues Fee Calculator",
    description:
      "See what a 1% advisory fee could cost over time using the mailer assumptions.",
    images: ["/brand/logo-800.png"],
  },
};

export default async function OnePercentBluesPage({
  searchParams,
}: {
  searchParams: Promise<HomeSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const landing = resolveHomeLanding(resolvedSearchParams, preset);

  return (
    <main className="flex flex-col pb-16">
      <CostAnalysisCalculator
        initialState={landing.calculatorState}
        searchParams={landing.searchParams}
        marketingVariantId={landing.marketingVariantId}
      />
    </main>
  );
}
