import { SMARTER_WAY_WEALTH_MEET_URL } from "@/config/campaignLinks";

/**
 * One primary button and one secondary link, never two equal buttons.
 */

export const SIGNUP_PATH = "https://smarterwaywealth.com/onboarding/verify";

// Match the signup and scheduling buttons on smarterwaywealth.com.
export const SIGNUP_BUTTON_CLASS =
  "inline-flex min-h-12 items-center justify-center rounded-md bg-[#007A2F] px-6 py-3 text-lg font-extrabold leading-6 !text-white !no-underline transition-colors hover:bg-[#00682B] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#66F0AC]";

export const SCHEDULE_BUTTON_CLASS =
  "inline-flex min-h-10 shrink-0 flex-col items-center justify-center rounded-md bg-[#064B84] px-4 py-1.5 text-center !text-white !no-underline transition-colors hover:bg-[#053B6A] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#064B84]";

export const signupCta = {
  primary: {
    label: "I'm Ready",
    analyticsLabel: "Become a client — $100/month",
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
