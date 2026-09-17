import { ExternalLink } from "lucide-react";
import { bluesCopy } from "@/config/onePercentBlues";
import { SMARTER_WAY_WEALTH_ORIGIN } from "@/config/campaignLinks";

/** One Percent Blues header: the wordmark, the check's promise (desktop) and
 *  the one door to the firm site. No site nav — the page is the whole site. */
export function BluesHeader() {
  return (
    <header className="mx-auto flex w-full max-w-[1040px] items-center justify-between gap-3 px-4 py-3.5 sm:px-6 lg:py-5">
      <a
        href="/"
        className="whitespace-nowrap font-blues-serif text-[20px] font-bold !text-white !no-underline"
        aria-label="One Percent Blues home"
      >
        {bluesCopy.wordmark.lead}{" "}
        <em className="font-semibold italic opacity-85">{bluesCopy.wordmark.tail}</em>
      </a>
      <div className="flex items-center gap-2">
        <span className="hidden whitespace-nowrap rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold lg:inline-block">
          {bluesCopy.headerTag}
        </span>
        <a
          href={`${SMARTER_WAY_WEALTH_ORIGIN}/`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-bold !text-white !no-underline transition-colors hover:bg-white/10"
          data-posthog-cta="true"
          data-posthog-cta-label="Smarter Way Wealth"
          data-posthog-cta-location="blues_nav"
        >
          Smarter Way Wealth
          <ExternalLink aria-hidden="true" className="h-4 w-4" strokeWidth={2.5} />
        </a>
      </div>
    </header>
  );
}
