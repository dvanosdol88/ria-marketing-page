import { SMARTER_WAY_WEALTH_ORIGIN } from "@/config/campaignLinks";

/* The green home page's advanced-calculator link opens this site's own full
   calculator (fee-lab stage 1, section 2, David 2026-11-26: "point the fee
   site's advanced-calculator link to the new page"). It used to hand off to
   smarterwaywealth.com/save. Internal, so it opens in the same tab. */
export const ADVANCED_CALCULATOR_URL = "/calculator";

/* One Percent Blues is a separate campaign and keeps its pre-section-2
   destination: the firm site's /save, in a new tab. */
export const BLUES_ADVANCED_CALCULATOR_URL = `${SMARTER_WAY_WEALTH_ORIGIN}/save`;
