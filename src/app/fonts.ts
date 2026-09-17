import { Inter, DM_Sans, Fraunces } from "next/font/google";

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-logo",
  display: "swap",
});

/** One Percent Blues display face (headline, the questions, the diagnosis
 *  number). Self-hosted by next/font at build time like the two above, so the
 *  blue page has no runtime font dependency either. */
export const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["600", "700"],
  style: ["normal", "italic"],
  variable: "--font-blues-serif",
  display: "swap",
});
