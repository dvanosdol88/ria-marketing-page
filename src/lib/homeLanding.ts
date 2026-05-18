import type { CampaignLandingPreset } from "@/config/campaignLandingPresets";
import { getHomeMarketingVariantId } from "@/config/homeMarketingVariants";
import {
  buildQueryFromState,
  parseCalculatorState,
  paramsToRecord,
} from "@/lib/calculatorState";

export type HomeSearchParams = Record<string, string | string[] | undefined>;

export function normalizeSearchParams(searchParams: HomeSearchParams) {
  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((entry) => params.append(key, entry));
    } else if (typeof value === "string") {
      params.set(key, value);
    }
  });
  return params;
}

function applyPresetDefaults(params: URLSearchParams, preset: CampaignLandingPreset) {
  const merged = new URLSearchParams(buildQueryFromState(preset.calculatorState));

  params.forEach((value, key) => {
    merged.set(key, value);
  });

  merged.set("campaign", preset.id);
  merged.set("variant", preset.variantId);

  return merged;
}

export function resolveHomeLanding(searchParams: HomeSearchParams, preset?: CampaignLandingPreset) {
  const normalizedParams = normalizeSearchParams(searchParams);
  const params = preset ? applyPresetDefaults(normalizedParams, preset) : normalizedParams;
  const calculatorState = parseCalculatorState(params);
  const marketingVariantId = getHomeMarketingVariantId(params.get("variant") ?? undefined);

  return {
    calculatorState,
    marketingVariantId,
    searchParams: paramsToRecord(params),
  };
}
