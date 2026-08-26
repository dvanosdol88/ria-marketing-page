import { SMARTER_WAY_WEALTH_MEET_URL } from "@/config/campaignLinks";

/**
 * The single next-step pattern for the whole site: one primary status link and
 * one secondary meeting link, never two equal buttons.
 *
 * Direct onboarding is temporarily paused, so every primary placement names
 * that state instead of inviting a visitor to sign up. The destination stays
 * stable so existing links, mailers, and attribution remain valid while the
 * route fails closed. When direct onboarding reopens, update this shared
 * config and its browser contract together.
 */

export const SIGNUP_PATH = "/become-a-client";

export const signupCta = {
  primary: {
    label: "Direct onboarding paused",
    shortLabel: "Start paused",
    href: SIGNUP_PATH,
  },
  secondary: {
    /** Names the doubt on purpose — see the note above. */
    prompt: "Not sure yet?",
    label: "Talk to David first for 15 minutes to see if you are a good fit",
    href: SMARTER_WAY_WEALTH_MEET_URL,
    reassurance: "No obligation. Nobody will try to sell you anything.",
  },
  /** Closing-block copy. The inline variant under the calculator result
   *  supplies its own headline built from the visitor's own number. */
  block: {
    eyebrow: "Secure onboarding update",
    // Deprecated from the full CTA card on the YAPT root. The headline remains
    // the inline calculator-result fallback; review the retired fee body with it.
    headline: "One flat fee, whatever your balance does.",
    body: "No commissions, no products, and no percentage of your money.",
  },
  /** Truthful release boundary shown anywhere the paused primary path appears. */
  disclosure:
    "Direct onboarding is temporarily paused. No information is collected at this step. Personalized investment advice begins only after becoming a client.",
} as const;
