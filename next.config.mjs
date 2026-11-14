import { withSentryConfig } from "@sentry/nextjs";

/**
 * One Percent Blues host rules: onepercentblues.com rewrites / to /blues; the
 * other three hostnames redirect there; known green doors on the blue host
 * bounce to youarepayingtoomuch.com; unknown paths stay for the Blues 404.
 */
const BLUES_HOST = "onepercentblues.com";
const BLUES_ORIGIN = `https://${BLUES_HOST}`;
const GREEN_ORIGIN = "https://youarepayingtoomuch.com";
const bluesHost = { type: "host", value: BLUES_HOST };
// Allowlist of green-site pages that bounce from the blue host; a made-up path stays for the Blues 404.
const BLUES_GREEN_PATHS = [
  "/our-math",
  "/become-a-client",
  "/become-a-client/:path*",
  "/privacy",
  "/save-a-ton",
  "/upgrade-your-advice",
  "/improve-your-tools",
  "/mobile-calculator",
  "/meaning",
  "/experiment",
  "/gallery",
  "/components/:path*",
];

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
   * Retired routes stay as permanent redirects so old printed, indexed, or
   * bookmarked URLs still land somewhere useful.
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
      // David, 2026-11-13: the old three-field form and the Meaning page are
      // retired. Sign-up is the secure sign-up on smarterwaywealth.com. The blue
      // host keeps its own bounce to the green site first (BLUES_GREEN_PATHS).
      {
        source: "/become-a-client",
        missing: [bluesHost],
        destination: "https://smarterwaywealth.com/onboarding/verify",
        permanent: true,
      },
      {
        source: "/become-a-client/:path*",
        missing: [bluesHost],
        destination: "https://smarterwaywealth.com/onboarding/verify",
        permanent: true,
      },
      // Absolute, so the short Blues names cannot land it on the blue home.
      { source: "/meaning", missing: [bluesHost], destination: `${GREEN_ORIGIN}/`, permanent: true },

      // Off the blue host, /blues and /blues/<file> 308 to the same path on onepercentblues.com.
      { source: "/blues", missing: [bluesHost], destination: `${BLUES_ORIGIN}/`, permanent: true },
      {
        source: "/blues/:path*",
        missing: [bluesHost],
        destination: `${BLUES_ORIGIN}/:path*`,
        permanent: true,
      },
      // One Percent Blues: the three other hostnames land on onepercentblues.com.
      ...["1percentblues.com", "www.1percentblues.com", `www.${BLUES_HOST}`].map((host) => ({
        source: "/:path*",
        has: [{ type: "host", value: host }],
        destination: `${BLUES_ORIGIN}/:path*`,
        permanent: true,
      })),
      // On the blue host the page's own address is "/", never "/blues".
      { source: "/blues", has: [bluesHost], destination: "/", permanent: true },
      // Known green doors only. Unknown blue-host paths fall through to the
      // Blues-branded 404 instead of a catch-all hop to the green site.
      ...BLUES_GREEN_PATHS.map((source) => ({
        source,
        has: [bluesHost],
        destination: `${GREEN_ORIGIN}${source}`,
        permanent: false,
      })),
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
        // Stay on this host with Blues branding. Do not add these paths to BLUES_GREEN_PATHS.
        {
          source: "/site.webmanifest",
          has: [bluesHost],
          destination: "/blues/site.webmanifest",
        },
        {
          source: "/:file((?:favicon|apple-touch-icon|android-chrome).*)",
          has: [bluesHost],
          destination: "/brand/blues-icon.svg",
        },
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
