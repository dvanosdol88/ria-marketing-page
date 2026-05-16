import type { Metadata, Viewport } from "next";
import { ViewTransitions } from "next-view-transitions";
import "./globals.css";
import { inter, dmSans } from "./fonts";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { JsonLd } from "@/components/JsonLd";
import { absoluteUrl, advisoryFirmName, siteName, siteUrl } from "@/config/siteMetadata";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Upgrade. Improve. Save.",
    template: "%s | You Are Paying Too Much",
  },
  description:
    "Compare traditional advisory fees with Smarter Way Wealth's $100/month flat-fee model.",
  manifest: "/site.webmanifest",
  openGraph: {
    title: "Upgrade. Improve. Save.",
    description:
      "Compare traditional advisory fees with Smarter Way Wealth's $100/month flat-fee model.",
    type: "website",
    url: siteUrl,
    siteName,
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
    description:
      "Compare traditional advisory fees with Smarter Way Wealth's $100/month flat-fee model.",
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

const siteStructuredData = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: advisoryFirmName,
    url: siteUrl,
    logo: absoluteUrl("/brand/logo-800.png"),
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    name: siteName,
    url: siteUrl,
    publisher: {
      "@id": `${siteUrl}/#organization`,
    },
    inLanguage: "en-US",
  },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${dmSans.variable} bg-[#EEF0F5] text-neutral-900`}>
        <ViewTransitions>
          <JsonLd data={siteStructuredData} />
          <SiteNav />
          <div className="min-h-screen">{children}</div>
          <SiteFooter />
        </ViewTransitions>
      </body>
    </html>
  );
}
