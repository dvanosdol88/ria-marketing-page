import { withSentryConfig } from "@sentry/nextjs";

/**
 * One Percent Blues — the second front door (docs/superpowers/specs/
 * 2026-09-17-one-percent-blues-design.md §3.2). onepercentblues.com serves
 * the blue page at /blues through a host rewrite; the other three hostnames
 * redirect there; and any path on the blue host that is not the page or an
 * asset bounces to the green domain, so the blue address stays one page.
 */
const BLUES_HOST = "onepercentblues.com";
const BLUES_ORIGIN = `https://${BLUES_HOST}`;
const GREEN_ORIGIN = "https://youarepayingtoomuch.com";
const bluesHost = { type: "host", value: BLUES_HOST };
// Paths the blue host must keep serving itself. The catch-all below uses `.+`
// (not `.*`) so "/" itself never matches it — the rewrite owns "/".
const BLUES_PASSTHROUGH =
  "api/|_next/|blues(?:/|$)|brand/|images/|assets/|monitoring|favicon|apple-touch-icon|site\\.webmanifest|robots\\.txt|sitemap\\.xml|llms\\.txt";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typedRoutes: false,
  // Container 02-90: stop `next dev` from appending its generated
  // "BEGIN:nextjs-agent-rules" block to AGENTS.md whenever an AI agent starts
  // a preview. David had it removed; without this it came back on every run.
  agentRules: false,
  serverExternalPackages: ["firebase-admin"],
  /**
   * Retired routes, 2026-08-14. David simplified this site to drive visitors
   * to smarterwaywealth.com faster, which meant deleting /save, /savings-rates
   * and /how-it-works along with their nav items, and folding /faq into the
   * homepage as two questions plus a link to the firm site's full set.
   *
   * These are permanent (308) rather than deletions-to-404 because he asked
   * for redirects explicitly: nothing already printed is known to point at
   * them — every mailer and QR code lands on "/" with calculator parameters,
   * verified against src/config/campaignLinks.ts and
   * tests/legacy-eddm-attribution.mjs — but a redirect costs nothing and
   * protects anything in the mail, in a search index, or in someone's
   * bookmarks.
   *
   * /how-it-works's client-facing content did not vanish with it: the
   * technology-and-AI opening, the published-models paragraph and the meeting
   * availability all moved to smarterwaywealth.com/how in the same session.
   */
  async redirects() {
    return [
      { source: "/save", destination: "/", permanent: true },
      { source: "/savings-rates", destination: "/", permanent: true },
      { source: "/how-it-works", destination: "https://smarterwaywealth.com/how", permanent: true },
      {
        source: "/how-it-works/:path*",
        destination: "https://smarterwaywealth.com/how",
        permanent: true,
      },
      { source: "/faq", destination: "/#faq", permanent: true },

      // One Percent Blues: the three other hostnames land on onepercentblues.com.
      ...["1percentblues.com", "www.1percentblues.com", `www.${BLUES_HOST}`].map((host) => ({
        source: "/:path*",
        has: [{ type: "host", value: host }],
        destination: `${BLUES_ORIGIN}/:path*`,
        permanent: true,
      })),
      // On the blue host the page's own address is "/", never "/blues".
      { source: "/blues", has: [bluesHost], destination: "/", permanent: true },
      // Everything else on the blue host belongs to the green site.
      {
        source: `/:path((?!${BLUES_PASSTHROUGH}).+)`,
        has: [bluesHost],
        destination: `${GREEN_ORIGIN}/:path`,
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return {
      // beforeFiles: these must win over public/robots.txt, sitemap.xml and
      // llms.txt, which Next would otherwise serve from the filesystem first.
      beforeFiles: [
        { source: "/", has: [bluesHost], destination: "/blues" },
        { source: "/robots.txt", has: [bluesHost], destination: "/blues/robots.txt" },
        { source: "/sitemap.xml", has: [bluesHost], destination: "/blues/sitemap.xml" },
        { source: "/llms.txt", has: [bluesHost], destination: "/blues/llms.txt" },
      ],
    };
  },
  outputFileTracingIncludes: {
    "/api/eddm-evals/**/*": [
      "./docs/eddm-evals/**/*",
      "./output/mailer-samples/**/*",
      "./output/redesigns/**/*",
      "./crapFromGemini.html",
    ],
  },
};

export default withSentryConfig(nextConfig, {
  // Sentry organization and project slugs
  org: "dvo-inc",
  project: "youarepayingtoomuch",

  // Upload wider set of client source files for better stack trace resolution
  widenClientFileUpload: true,

  // Create a proxy API route to bypass ad-blockers
  tunnelRoute: "/monitoring",

  // Suppress non-CI output
  silent: !process.env.CI,
});
