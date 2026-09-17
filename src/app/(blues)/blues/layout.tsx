import type { Metadata, Viewport } from "next";
import { fraunces } from "@/app/fonts";
import { BluesFooter } from "@/components/blues/BluesFooter";
import { BluesHeader } from "@/components/blues/BluesHeader";
import { BLUES_ORIGIN, bluesCopy, bluesJsonLd } from "@/config/onePercentBlues";

/**
 * One Percent Blues — the blue front door, served on onepercentblues.com by
 * the host rewrite in next.config.mjs (/ → /blues). Own metadata base, share
 * card, icon, JSON-LD and chrome; everything else (fonts, analytics,
 * providers) comes from the root layout it shares with the green site.
 * Spec: docs/superpowers/specs/2026-09-17-one-percent-blues-design.md.
 */

export const metadata: Metadata = {
  metadataBase: new URL(BLUES_ORIGIN),
  title: bluesCopy.metaTitle,
  description: bluesCopy.metaDescription,
  // The green PWA manifest (and its green icons) must not leak onto this host.
  manifest: null,
  openGraph: {
    type: "website",
    siteName: "One Percent Blues",
    url: `${BLUES_ORIGIN}/`,
    title: bluesCopy.metaTitle,
    description: bluesCopy.metaDescription,
    images: [
      {
        url: "/api/og/blues",
        width: 1200,
        height: 630,
        alt: "Got the 1% Blues? Estimated advisory-fee difference",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: bluesCopy.metaTitle,
    description: bluesCopy.metaDescription,
    images: ["/api/og/blues"],
  },
  icons: {
    icon: [{ url: "/brand/blues-icon.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#1E3A8A",
};

export default function BluesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-theme="blues"
      className={`${fraunces.variable} min-h-screen bg-[linear-gradient(180deg,#1E3A8A_0%,#2563EB_42%,#60A5FA_100%)] text-white`}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bluesJsonLd) }}
      />
      <BluesHeader />
      {children}
      <BluesFooter />
    </div>
  );
}
