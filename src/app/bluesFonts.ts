import { Fraunces } from "next/font/google";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["600", "700"],
  style: ["normal", "italic"],
  variable: "--font-blues-serif",
  display: "swap",
});

/** Same shell class for the live server layout and the client crash/404 chrome. */
export const bluesShellClassName =
  `${fraunces.variable} min-h-screen bg-[linear-gradient(180deg,#1E3A8A_0%,#2563EB_42%,#60A5FA_100%)] text-white`;
