import type { Metadata, Viewport } from "next";
import { bluesShellClassName } from "@/app/bluesFonts";
import { BluesFooter } from "@/components/blues/BluesFooter";
import { BluesHeader } from "@/components/blues/BluesHeader";
import { bluesIconMetadata } from "@/components/blues/bluesIcons";
import { BLUES_ORIGIN, bluesCopy, bluesJsonLd } from "@/config/onePercentBlues";

/**
 * One Percent Blues owns its metadata, share card, icon, JSON-LD and chrome;
 * fonts, analytics and providers come from the shared root layout.
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
  icons: bluesIconMetadata,
};

export const viewport: Viewport = {
  themeColor: "#1E3A8A",
};

export default function BluesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-theme="blues" className={bluesShellClassName}>
      <BluesHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bluesJsonLd) }}
      />
      {children}
      <BluesFooter />
    </div>
  );
}
