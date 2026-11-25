/*
 * Firm-site copy (smarterwaywealth.com src/config/fitCtaConfig.ts) for the
 * hidden full calculator page on this site. Wording and analytics labels are
 * unchanged; the links point at the firm site's real pages as absolute URLs.
 * The fee site's own src/config/fitCtaConfig.ts is separate and unchanged.
 */
import { FIRM_SITE_ORIGIN } from "./fullCalculatorSite.ts";

/*
 * Single source for the two conversion actions so button wording cannot
 * drift page by page.
 */
export const fitCta = {
  href: `${FIRM_SITE_ORIGIN}/meet`,
  questionLabel: "Questions?",
  /** Standard button wording, used site-wide. */
  label: "Schedule 15 minutes",
  /** Longer wording for the homepage hero and the closing band. */
  heroLabel: "Book a free 15-minute call",
  /**
   * PostHog label. The visible wording changed on 2026-09-23, but PostHog
   * groups clicks by this string, so it keeps the ORIGINAL label and the
   * trend line stays continuous (same convention as siteNavConfig ctaLabel).
   */
  analyticsLabel: "Meet David",
} as const;

export const becomeClientCta = {
  /* David, 2026-11-10: "I'm Ready" replaces "Become a client". The
     analytics label keeps the original so click history stays one series. */
  label: "I'm Ready",
  analyticsLabel: "Become a client",
  href: `${FIRM_SITE_ORIGIN}/onboarding/verify`,
} as const;

/** David's direct address: the Who answer and the bottom of the phone menu. */
export const DAVID_EMAIL = "david@smarterwaywealth.com";

export const meetScheduling = {
  calendlyUrl:
    "https://calendly.com/david-smarterwaywealth/meet-david-smarter-way-wealth",
  description:
    "An easy 15-minute conversation about what you’re looking for and whether Smarter Way Wealth is a good fit. No obligation or sales pitch. Personalized investment advice begins only after becoming a client.",
  directLinkLabel: "Prefer a new window? Open the scheduler.",
  failureMessage:
    "This can happen with some browser privacy settings. David’s available times will open in a new window.",
  facts: [
    { label: "Time", value: "15 minutes" },
    { label: "Where", value: "Zoom or Google Meet" },
    { label: "Preparation", value: "None required" },
  ],
  heading: "See if Smarter Way Wealth is a good fit.",
  loadingMessage: "Loading available times…",
} as const;

/**
 * The two conversations offered on /meet (David, 2026-11-18). The 15-minute
 * call keeps its approved wording from `meetScheduling`; the 50-minute
 * Planning Meeting opens after the visitor verifies an email address. Its
 * calendar address is deliberately NOT here: it lives on the server
 * (`src/server/meet/planningMeetingAccess.ts`) and reaches the browser only
 * after verification.
 */
export const meetChoices = {
  heading: "Two ways to talk with David.",
  intro:
    "Start with a quick hello, or set aside time to go deeper. Choose the one that fits where you are.",
  chooserLabel: "Choose a conversation",
  platformNote:
    "Choose whichever video platform works better for you. You will receive the meeting link with your calendar invitation.",
  /* David, 2026-11-23: "New language: 15 minutes - meet with David to get
     answers to your questions and see if you are a good fit for Smarter Way
     Wealth. 50 minutes - 50 minutes with David for new or existing clients"
     and '"None required" should not be an option.' His words, exactly. */
  intro15: {
    minutes: 15,
    name: "Intro call",
    summary:
      "Meet with David to get answers to your questions and see if you are a good fit for Smarter Way Wealth.",
    facts: [
      { label: "Where", value: "Zoom or Google Meet" },
      { label: "To book", value: "Pick a time" },
    ],
  },
  planning50: {
    minutes: 50,
    name: "Planning meeting",
    summary: "50 minutes with David for new or existing clients",
    facts: [
      { label: "Where", value: "Zoom or Google Meet" },
      { label: "Preparation", value: "Share anything helpful when you book" },
      { label: "To book", value: "Verify your email, then pick a time" },
    ],
  },
  verify: {
    checking: "Checking whether your email is already verified…",
    heading: "First, verify your email.",
    lead: "We’ll email you a link. Open it and David’s 50-minute calendar opens right here. If you have already verified your email with us on this device, you won’t be asked again.",
    emailLabel: "Email address",
    send: "Send verification link",
    sending: "Sending…",
    noMarketing: "Your email will never be used for marketing purposes.",
    sentHeading: "Open the link we just sent.",
    sentLead:
      "The link brings you back here with David’s 50-minute calendar open. You can close this page while you check your email.",
    resend: "Resend verification link",
    resending: "Resending…",
    resent: "A new verification link is on its way.",
    differentEmail: "Use a different email",
    verified: "Your email is verified.",
    incompleteEmail: "Enter a complete email address.",
    rateLimited: "Too many links were requested. Wait a little, then try again.",
    sendFailed: "We could not send that link. Please try again.",
    expiredLink:
      "That link has expired or was already used. Request a new one to continue.",
    unavailable:
      "Email verification isn’t available right now. You can still schedule a 15-minute call, or email David.",
    switchTo15: "Schedule 15 minutes instead",
  },
} as const;
