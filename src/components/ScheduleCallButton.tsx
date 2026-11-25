import Link from "next/link";
import { fitCta } from "@/config/full-calculator/fitCtaConfig";

/**
 * Shared call button. PostHog keeps the original "Meet David" label so the
 * click history stays continuous.
 */
export function ScheduleCallButton({
  location,
  onClick,
  className = "",
}: {
  location?: string;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <Link
      href={fitCta.href}
      onClick={onClick}
      data-schedule-call
      data-posthog-cta="true"
      data-posthog-cta-label={fitCta.analyticsLabel}
      data-posthog-cta-location={location}
      className={`inline-flex min-h-10 shrink-0 flex-col items-center justify-center rounded-md bg-[#064B84] px-4 py-1.5 text-center !text-white !no-underline transition-colors hover:bg-[#053B6A] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#064B84] ${className}`}
    >
      <span className="whitespace-nowrap text-xs font-semibold leading-tight text-white/85">
        {fitCta.questionLabel}
      </span>
      <span className="whitespace-nowrap text-sm font-extrabold leading-tight">{fitCta.label}</span>
    </Link>
  );
}
