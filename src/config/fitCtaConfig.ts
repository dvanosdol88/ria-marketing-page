import { signupCta } from "@/config/signupCta";

/**
 * The "next steps" button on the proof sections. It used to read "See if you
 * are a good fit for David and Smarter Way Wealth" and point off-domain at the
 * booking page — one of seven differently-worded asks that all landed on the
 * same 15-minute call.
 *
 * It now carries the site's single primary ask. The 15-minute call is still
 * offered, but as the secondary link inside `SignupCta` — see the note in
 * `src/config/signupCta.ts`.
 */
export const fitCta = {
  href: signupCta.primary.href,
  label: signupCta.primary.label,
};
