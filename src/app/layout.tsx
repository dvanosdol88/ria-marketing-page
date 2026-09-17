import type { Metadata, Viewport } from "next";
import { ViewTransitions } from "next-view-transitions";
import { Suspense } from "react";
import "./globals.css";
import { inter, dmSans } from "./fonts";
import { PostHogCtaTracker } from "@/components/PostHogCtaTracker";
import { SavingsBarProvider } from "@/components/SavingsBarContext";
import { PostHogProvider } from "@/components/PostHogProvider";
import { PostHogPageView } from "@/components/PostHogPageView";

/* The site's header, footer and JSON-LD moved to src/app/(site)/layout.tsx on
   2026-09-17 so the One Percent Blues front door (src/app/(blues)) can render
   its own chrome. This root layout carries only what BOTH front doors share:
   the document, fonts, analytics and providers. */

export const metadata: Metadata = {
  metadataBase: new URL("https://youarepayingtoomuch.com"),
  title: "Investment Fee Calculator | You Are Paying Too Much",
  description:
    "See how asset-based advisory fees can compound over time and compare them with Smarter Way Wealth's flat $100 monthly fee.",
  manifest: "/site.webmanifest",
  openGraph: {
    title: "See What a 1% Advisory Fee Can Cost",
    description:
      "Run your numbers and compare an asset-based advisory fee with a flat $100 monthly fee.",
    type: "website",
    url: "https://youarepayingtoomuch.com/",
    siteName: "You Are Paying Too Much",
    images: [
      {
        url: "/brand/logo-800.png",
        width: 800,
        height: 320,
        alt: "Smarter Way Wealth",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "See What a 1% Advisory Fee Can Cost",
    description:
      "Run your numbers and compare an asset-based advisory fee with a flat $100 monthly fee.",
    images: ["/brand/logo-800.png"],
  },
  icons: {
    icon: [
      { url: "/brand/logo-icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#00A540",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${dmSans.variable} bg-[#EEF0F5] text-neutral-900`}>
        <PostHogProvider>
          <ViewTransitions>
            <SavingsBarProvider>
              <PostHogCtaTracker />
              {/* ProgressiveStickyBar (the pinned "Potential savings" line and
                  the Save / Upgrade / Improve strip under it) is deliberately
                  not rendered. It covered 72px of every scrolled screen and cut
                  against the simplification pass (David, 2026-08-10).
                  Deprecated, not deleted — the component is kept for reuse. */}
              <Suspense fallback={null}>
                <PostHogPageView />
              </Suspense>
              {children}
            </SavingsBarProvider>
          </ViewTransitions>
        </PostHogProvider>
      </body>
    </html>
  );
}
