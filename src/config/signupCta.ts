import { SMARTER_WAY_WEALTH_MEET_URL } from "@/config/campaignLinks";

/**
 * The single conversion pattern for the whole site: one primary button and one
 * secondary link, never two equal buttons.
 *
 * Before this existed the site offered seven differently-worded next steps
 * ("Get started", "Meet David — pick a time", "See if SWW is a good fit", …),
 * all of which landed on the same 15-minute call. A visitor who had already
 * decided had no faster door than a visitor who was still unsure.
 *
 * Primary  — the person who is sold. Goes to the on-site sign-up.
 * Secondary — the person who is not. Goes to the existing 15-minute fit call.
 *
 * The secondary link is what protects the primary: naming the hesitation out
 * loud ("Not sure yet?") gives an unready visitor somewhere to go that isn't
 * the back button. Keep both, keep the weighting.
 */

export const SIGNUP_PATH = "/become-a-client";

export const signupCta = {
  primary: {
    label: "Become a client — $100/month",
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
    eyebrow: "Ready when you are",
    // Deprecated from the full CTA card on the YAPT root. The headline remains
    // the inline calculator-result fallback; review the retired fee body with it.
    headline: "One flat fee, whatever your balance does.",
    body: "No commissions, no products, and no percentage of your money.",
  },
  /** Kept verbatim from the previous booking block — this line is required
   *  wherever an engagement is offered. */
  disclosure:
    "Personalized investment advice begins only after becoming a client.",
} as const;
