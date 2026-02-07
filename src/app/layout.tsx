import type { Metadata } from "next";
import { ViewTransitions } from "next-view-transitions";
import "./globals.css";
import { inter } from "./fonts";

export const metadata: Metadata = {
  title: "Upgrade. Improve. Save.",
  description: "Landing calculator and proof for advisory fees.",
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
          {children}
        </body>
      </html>
    </ViewTransitions>
  );
}
