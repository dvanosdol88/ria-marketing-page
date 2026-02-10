import type { Metadata, Viewport } from "next";
import { ViewTransitions } from "next-view-transitions";
import "./globals.css";
import { inter } from "./fonts";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";

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
    <ViewTransitions>
      <html lang="en">
        <body className={`${inter.variable} bg-neutral-50 text-neutral-900`}>
          <SiteNav />
          <div className="min-h-screen">{children}</div>
          <SiteFooter />
        </body>
      </html>
    </ViewTransitions>
  );
}
