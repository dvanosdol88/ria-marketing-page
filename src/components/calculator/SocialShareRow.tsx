"use client";

// CANON: shared verbatim with the sister repo (youarepayingtoomuch.com,
// D:\ria-marketing-page). Edit both repos in the same session or CI fails.
// See CALCULATOR-CANON.md.

/**
 * Official brand marks, inlined as SVG path data (Simple Icons set, CC0 path
 * data; nominative trademark use for share links). Inlining keeps both repos
 * pixel-identical with no icon-library dependency — lucide-react dropped
 * brand icons long ago, and the two repos pin different lucide majors.
 * Facebook and Reddit publish disc-shaped marks (the glyph is knocked out of
 * the disc by the path itself), so a single brand-color fill reproduces the
 * real logo; X publishes a bare letterform, so it gets its brand-black disc
 * behind a white glyph.
 */
const FACEBOOK_BRAND_PATH =
  "M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z";

const REDDIT_BRAND_PATH =
  "M12 0C5.373 0 0 5.373 0 12c0 3.314 1.343 6.314 3.515 8.485l-2.286 2.286C.775 23.225 1.097 24 1.738 24H12c6.627 0 12-5.373 12-12S18.627 0 12 0Zm4.388 3.199c1.104 0 1.999.895 1.999 1.999 0 1.105-.895 2-1.999 2-.946 0-1.739-.657-1.947-1.539v.002c-1.147.162-2.032 1.15-2.032 2.341v.007c1.776.067 3.4.567 4.686 1.363.473-.363 1.064-.58 1.707-.58 1.547 0 2.802 1.254 2.802 2.802 0 1.117-.655 2.081-1.601 2.531-.088 3.256-3.637 5.876-7.997 5.876-4.361 0-7.905-2.617-7.998-5.87-.954-.447-1.614-1.415-1.614-2.538 0-1.548 1.255-2.802 2.803-2.802.645 0 1.239.218 1.712.585 1.275-.79 2.881-1.291 4.64-1.365v-.01c0-1.663 1.263-3.034 2.88-3.207.188-.911.993-1.595 1.959-1.595Zm-8.085 8.376c-.784 0-1.459.78-1.506 1.797-.047 1.016.64 1.429 1.426 1.429.786 0 1.371-.369 1.418-1.385.047-1.017-.553-1.841-1.338-1.841Zm7.406 0c-.786 0-1.385.824-1.338 1.841.047 1.017.634 1.385 1.418 1.385.785 0 1.473-.413 1.426-1.429-.046-1.017-.721-1.797-1.506-1.797Zm-3.703 4.013c-.974 0-1.907.048-2.77.135-.147.015-.241.168-.183.305.483 1.154 1.622 1.964 2.953 1.964 1.33 0 2.47-.81 2.953-1.964.057-.137-.037-.29-.184-.305-.863-.087-1.795-.135-2.769-.135Z";

const X_BRAND_PATH =
  "M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z";

const PLATFORMS = ["Facebook", "X", "Reddit"] as const;
type Platform = (typeof PLATFORMS)[number];

function BrandBadge({ platform, variant }: { platform: Platform; variant: "dark" | "light" }) {
  if (platform === "Facebook") {
    return (
      <svg viewBox="0 0 24 24" className="h-9 w-9" aria-hidden="true" fill="#0866FF">
        <path d={FACEBOOK_BRAND_PATH} />
      </svg>
    );
  }
  if (platform === "Reddit") {
    return (
      <svg viewBox="0 0 24 24" className="h-9 w-9" aria-hidden="true" fill="#FF4500">
        <path d={REDDIT_BRAND_PATH} />
      </svg>
    );
  }
  // X's brand-black disc disappears against the dark panel without a hairline.
  return (
    <span
      aria-hidden="true"
      className={`flex h-9 w-9 items-center justify-center rounded-full bg-black ${variant === "dark" ? "ring-1 ring-white/40" : ""}`}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="#FFFFFF">
        <path d={X_BRAND_PATH} />
      </svg>
    </span>
  );
}

// Below 480px the host panels get too narrow for three fixed-width tiles
// (they staggered 2/1) — a three-column grid lets the tiles shrink fluidly
// and always hold one row; from 480px up they revert to fixed-width tiles.
const containerClass =
  "grid w-full grid-cols-3 gap-2 min-[480px]:flex min-[480px]:w-auto min-[480px]:flex-wrap min-[480px]:items-start min-[480px]:gap-3";

const tileBase =
  "flex min-h-11 w-full min-w-0 flex-col items-center gap-1.5 rounded-2xl border px-1.5 pb-2 pt-2.5 text-center min-[480px]:w-[76px]";

const VARIANT_CLASSES: Record<"dark" | "light", { anchor: string; placeholder: string; label: string }> = {
  dark: {
    anchor:
      `${tileBase} border-white/15 bg-white/5 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#66F0AC]`,
    placeholder: `${tileBase} cursor-not-allowed border-white/10 bg-white/5 opacity-45 grayscale`,
    label: "text-[11px] font-bold leading-none text-white/80",
  },
  light: {
    anchor:
      `${tileBase} border-[#E3EAF1] bg-white shadow-[0_2px_10px_rgba(17,33,52,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#C9D8E4] hover:shadow-[0_10px_24px_rgba(17,33,52,0.12)] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#064B84]`,
    placeholder: `${tileBase} cursor-not-allowed border-[#E3EAF1] bg-white opacity-45 grayscale`,
    label: "text-[11px] font-bold leading-none text-[#33465A]",
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
            <BrandBadge platform={label} variant={variant} />
            <span className={classes.label}>{label}</span>
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
          // One host site styles bare `a` elements outside any cascade layer
          // (underline + green), which outranks every layered utility class —
          // inline is the only cross-site-safe override for a canon file.
          style={{ textDecoration: "none" }}
        >
          <BrandBadge platform={label} variant={variant} />
          <span className={classes.label}>{label}</span>
        </a>
      ))}
    </div>
  );
}
