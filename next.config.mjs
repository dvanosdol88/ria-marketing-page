import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typedRoutes: false,
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
    ];
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
