import { SMARTER_WAY_WEALTH_ORIGIN } from "@/config/campaignLinks";

const ADVANCED_CALCULATOR_URL = `${SMARTER_WAY_WEALTH_ORIGIN}/save`;
const ADVANCED_CALCULATOR_LABEL = "Go to Advanced Calculator";

/**
 * Slim hand-off band that sits above the home fee calculator.
 *
 * This is the bridge from the simple mailed-QR-code calculator to the richer
 * Market Time Machine calculator on smarterwaywealth.com. It is a plain server
 * component so the link and its label render without JavaScript. Click
 * telemetry is handled by the site-wide `PostHogCtaTracker`, which already
 * treats smarterwaywealth.com anchors as tracked CTAs and reads the
 * `data-posthog-cta-*` attributes below for `cta_label` / `cta_location`.
 *
 * Same-tab navigation is deliberate: this is a hand-off, not a side trip.
 */
export function AdvancedCalculatorBridge() {
  return (
    <div className="w-full border-b border-[#D6DBE4] bg-white">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-1.5 px-4 py-3 text-center sm:py-4">
        <a
          href={ADVANCED_CALCULATOR_URL}
          data-posthog-cta-label={ADVANCED_CALCULATOR_LABEL}
          data-posthog-cta-location="home_above_calculator_bridge"
          className="inline-flex min-h-12 w-full max-w-sm items-center justify-center rounded-lg bg-[#064B84] px-6 text-base font-bold !text-white !no-underline transition-colors duration-200 hover:bg-[#053E6D] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#064B84] sm:w-auto sm:px-8"
        >
          {ADVANCED_CALCULATOR_LABEL}
        </a>
        <p className="text-[13px] font-medium leading-snug text-[#10233A]/70 sm:text-sm">
          Model your own time horizon against 40 years of actual S&amp;P 500
          returns at smarterwaywealth.com.
        </p>
      </div>
    </div>
  );
}
