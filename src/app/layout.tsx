import type { Metadata, Viewport } from "next";
import { ViewTransitions } from "next-view-transitions";
import { Suspense } from "react";
import "./globals.css";
import { inter, dmSans } from "./fonts";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { ProgressiveStickyBar } from "@/components/ProgressiveStickyBar";
import { PostHogCtaTracker } from "@/components/PostHogCtaTracker";
import { SavingsBarProvider } from "@/components/SavingsBarContext";
import { PostHogProvider } from "@/components/PostHogProvider";
import { PostHogPageView } from "@/components/PostHogPageView";

export const metadata: Metadata = {
  metadataBase: new URL("https://youarepayingtoomuch.com"),
  title: "Upgrade. Improve. Save.",
  description: "Landing calculator and proof for advisory fees.",
  manifest: "/site.webmanifest",
  openGraph: {
    title: "Upgrade. Improve. Save.",
    description: "Landing calculator and proof for advisory fees.",
    type: "website",
    url: "https://youarepayingtoomuch.com",
    siteName: "Smarter Way Wealth",
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
    title: "Upgrade. Improve. Save.",
    description: "Landing calculator and proof for advisory fees.",
    images: ["/brand/logo-800.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
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
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=satoshi@700&display=swap"
        />
      </head>
      <body className={`${inter.variable} ${dmSans.variable} bg-[#EEF0F5] text-neutral-900`}>
        <PostHogProvider>
          <ViewTransitions>
            <SavingsBarProvider>
              <PostHogCtaTracker />
              <SiteNav />
              <ProgressiveStickyBar />
              <Suspense fallback={null}>
                <PostHogPageView />
              </Suspense>
              <div className="min-h-screen">{children}</div>
              <SiteFooter />
            </SavingsBarProvider>
          </ViewTransitions>
        </PostHogProvider>
      </body>
    </html>
  );
}
