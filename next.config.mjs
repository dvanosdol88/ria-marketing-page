import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // typedRoutes is causing build failures in Next.js 16.x
  experimental: {
    typedRoutes: false,
  },
};

export default withSentryConfig(nextConfig);
