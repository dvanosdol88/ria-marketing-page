import { signupCta } from "@/config/signupCta";

/**
 * The "next steps" button on the proof sections. It used to read "See if you
 * are a good fit for David and Smarter Way Wealth" and point off-domain at the
 * booking page — one of seven differently-worded asks that all landed on the
 * same 15-minute call.
 *
 * It now carries the site's shared direct-onboarding status. While that path
 * is paused, the label says so everywhere instead of implying that a visitor
 * can complete sign-up. The optional 15-minute call remains the secondary
 * link inside `SignupCta`.
 */
export const fitCta = {
  href: signupCta.primary.href,
  label: signupCta.primary.label,
};
