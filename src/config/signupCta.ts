import { SMARTER_WAY_WEALTH_MEET_URL } from "@/config/campaignLinks";

/**
 * One primary button and one secondary link, never two equal buttons.
 */

export const SIGNUP_PATH = "https://smarterwaywealth.com/onboarding/verify";

export const signupCta = {
  primary: {
    label: "Become a client — $100/month",
    href: SIGNUP_PATH,
  },
  secondary: {
    /** Names the doubt on purpose so the secondary door stays a link, not a second button. */
    prompt: "Not sure yet?",
    label: "Talk to David first for 15 minutes to see if you are a good fit",
    href: SMARTER_WAY_WEALTH_MEET_URL,
    reassurance: "No obligation. Nobody will try to sell you anything.",
  },
  /** Closing-block copy. The inline variant under the calculator result
   *  supplies its own headline built from the visitor's own number. */
  block: {
    eyebrow: "Ready when you are",
  },
  /** Kept verbatim from the previous booking block — this line is required
   *  wherever an engagement is offered. */
  disclosure:
    "Personalized investment advice begins only after becoming a client.",
} as const;
