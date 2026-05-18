import type { CalculatorState } from "@/lib/calculatorState";
import type { HomeMarketingVariantId } from "@/config/homeMarketingVariants";

export type CampaignLandingPresetId = "one-percent-blues";

export type CampaignLandingPreset = {
  id: CampaignLandingPresetId;
  slug: string;
  path: `/${string}`;
  label: string;
  mailerName: string;
  variantId: HomeMarketingVariantId;
  calculatorState: CalculatorState;
  qrTargetUrl: string;
  explicitStateUrl: string;
  mathHook: {
    flatFeeMonthly: number;
    flatFeeEndingValue: number;
    assetBasedFeeEndingValue: number;
    estimatedFeeDrag: number;
    percentLost: number;
    totalFlatFeesPaid: number;
    totalAumFeesPaidApprox: number;
  };
};

const productionOrigin = "https://youarepayingtoomuch.com";

export const campaignLandingPresets: Record<CampaignLandingPresetId, CampaignLandingPreset> = {
  "one-percent-blues": {
    id: "one-percent-blues",
    slug: "1-percent-blues",
    path: "/1-percent-blues",
    label: "1% Blues",
    mailerName: "1% Blues EDDM mailer",
    variantId: "direct-mail",
    calculatorState: {
      portfolioValue: 1000000,
      years: 20,
      annualGrowthPercent: 8,
      annualFeePercent: 1,
      mutualFundExpensePercent: 0,
    },
    qrTargetUrl: `${productionOrigin}/1-percent-blues`,
    explicitStateUrl: `${productionOrigin}/1-percent-blues?portfolio=1000000&years=20&growth=8&fee=1&mfe=0`,
    mathHook: {
      flatFeeMonthly: 100,
      flatFeeEndingValue: 4604057,
      assetBasedFeeEndingValue: 3815751,
      estimatedFeeDrag: 788306,
      percentLost: 17.1,
      totalFlatFeesPaid: 24000,
      totalAumFeesPaidApprox: 422058,
    },
  },
};

export function getCampaignLandingPresetBySlug(slug: string): CampaignLandingPreset | undefined {
  return Object.values(campaignLandingPresets).find((preset) => preset.slug === slug);
}
