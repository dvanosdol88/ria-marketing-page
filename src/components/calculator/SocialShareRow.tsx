"use client";

// CANON: shared verbatim with the sister repo (youarepayingtoomuch.com,
// D:\ria-marketing-page). Edit both repos in the same session or CI fails.
// See CALCULATOR-CANON.md.

import type { ReactNode } from "react";
import { X as XIcon } from "lucide-react";

/**
 * lucide-react 1.x dropped brand icons (no Facebook/Twitter/Reddit glyphs —
 * verified against the installed package), so Facebook and Reddit get small
 * hand-drawn monochrome glyphs below. "X" reuses lucide's generic X icon,
 * which happens to be exactly the platform's own mark.
 */
function FacebookGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="currentColor">
      <path d="M13.9 21v-7.55h2.53l.38-2.94h-2.91v-1.88c0-.85.24-1.43 1.46-1.43h1.56V4.56c-.27-.04-1.2-.12-2.28-.12-2.26 0-3.8 1.38-3.8 3.91v2.18H8.3v2.94h2.54V21h3.06Z" />
    </svg>
  );
}

function RedditGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="currentColor">
      <path d="M22 12.7a2.1 2.1 0 0 0-3.53-1.55c-1.37-.94-3.26-1.55-5.36-1.62l1-4.55 3.16.72a1.53 1.53 0 1 0 .16-.82L14 3.5a.42.42 0 0 0-.5.31l-1.11 5.03c-2.15.05-4.08.66-5.47 1.62A2.1 2.1 0 0 0 3.28 12.7c0 .82.44 1.53 1.1 1.92-.03.2-.04.4-.04.6 0 2.72 3.17 4.93 7.08 4.93s7.08-2.21 7.08-4.93c0-.2-.02-.4-.05-.6.65-.4 1.09-1.11 1.09-1.92ZM8.4 13.87a1.16 1.16 0 1 1 2.32 0 1.16 1.16 0 0 1-2.32 0Zm7.66 3.03c-.82.82-2.38.89-3.02.89-.63 0-2.2-.07-3.02-.89a.35.35 0 1 1 .5-.5c.5.5 1.63.7 2.52.7.9 0 2.03-.2 2.52-.7a.35.35 0 1 1 .5.5Zm-.24-1.87a1.16 1.16 0 1 1 0-2.32 1.16 1.16 0 0 1 0 2.32Z" />
    </svg>
  );
}

const PLATFORMS = ["Facebook", "X", "Reddit"] as const;
type Platform = (typeof PLATFORMS)[number];

const GLYPH_BY_PLATFORM: Record<Platform, ReactNode> = {
  Facebook: <FacebookGlyph />,
  X: <XIcon aria-hidden="true" size={18} />,
  Reddit: <RedditGlyph />,
};

const containerClass = "flex flex-wrap gap-3";

const VARIANT_CLASSES: Record<"dark" | "light", { anchor: string; placeholder: string }> = {
  dark: {
    anchor:
      "flex min-h-11 items-center gap-2 rounded-md border border-white/25 bg-white/5 px-4 text-sm font-bold text-white hover:bg-white/10 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#66F0AC]",
    placeholder:
      "flex min-h-11 cursor-not-allowed items-center gap-2 rounded-md border border-white/10 bg-white/5 px-4 text-sm font-bold text-white/35",
  },
  light: {
    anchor:
      "flex min-h-11 items-center gap-2 rounded-md border border-[#C9D8E4] bg-white px-4 text-sm font-bold text-[#10233A] hover:bg-[#F4F7FA] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#064B84]",
    placeholder:
      "flex min-h-11 cursor-not-allowed items-center gap-2 rounded-md border border-[#D8E2EA] bg-[#F4F7FA] px-4 text-sm font-bold text-neutral-400",
  },
};

/**
 * Facebook/X/Reddit share intents for the personalized calculator URL.
 * `url` is null before the parent has resolved window.location.origin (or
 * when the current inputs have no valid share URL yet) — renders disabled
 * placeholders instead of anchors in that state so nothing links out with a
 * missing/incomplete target and no `data-posthog-cta` element exists to
 * misfire a click before it has a real href.
 *
 * Every anchor carries `data-posthog-redact-query="true"` because the
 * personalized URL (with every visitor assumption) is nested inside these
 * intent URLs' own query string (u=/url=), which `sanitizeAnalyticsUrl` does
 * not reach — see PostHogCtaTracker.js's redaction branch.
 */
export function SocialShareRow({
  url,
  socialText,
  redditTitle,
  location,
  variant,
}: {
  url: string | null;
  socialText: string;
  redditTitle: string;
  location: string;
  variant: "dark" | "light";
}) {
  const classes = VARIANT_CLASSES[variant];

  if (!url) {
    return (
      <div className={containerClass}>
        {PLATFORMS.map((label) => (
          <button key={label} type="button" disabled aria-disabled="true" className={classes.placeholder}>
            {GLYPH_BY_PLATFORM[label]}
            <span>{label}</span>
          </button>
        ))}
      </div>
    );
  }

  const encodedUrl = encodeURIComponent(url);
  const hrefByPlatform: Record<Platform, string> = {
    Facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    X: `https://x.com/intent/post?text=${encodeURIComponent(socialText)}&url=${encodedUrl}`,
    Reddit: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodeURIComponent(redditTitle)}`,
  };

  return (
    <div className={containerClass}>
      {PLATFORMS.map((label) => (
        <a
          key={label}
          href={hrefByPlatform[label]}
          target="_blank"
          rel="noopener noreferrer"
          data-posthog-cta="true"
          data-posthog-cta-label={`Share to ${label}`}
          data-posthog-cta-location={location}
          data-posthog-redact-query="true"
          className={classes.anchor}
        >
          {GLYPH_BY_PLATFORM[label]}
          <span>{label}</span>
        </a>
      ))}
    </div>
  );
}
