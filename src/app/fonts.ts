import { Inter, DM_Sans, DM_Serif_Display } from "next/font/google";

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

export const dmSerifDisplay = DM_Serif_Display({
  weight: ["400"],
  style: ["italic"],
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});
