import { SMARTER_WAY_WEALTH_MEET_URL } from "@/config/campaignLinks";

/**
 * "Meet David" booking block shown on the direct-mail (QR) landing
 * experience. Copy mirrors smarterwaywealth.com/meet so the promise a
 * visitor reads here matches the page they land on.
 */
export const meetDavidCta = {
  eyebrow: "Next step",
  headline: "Talk it through with David.",
  body: "A focused first conversation to see whether Smarter Way Wealth is a good fit. No obligation. Personalized investment advice begins only after becoming a client.",
  facts: [
    { label: "Time", value: "15 minutes" },
    { label: "Where", value: "Zoom or Google Meet" },
    { label: "Preparation", value: "None required" },
  ],
  ctaLabel: "Meet David — pick a time",
  href: SMARTER_WAY_WEALTH_MEET_URL,
} as const;
