import { Fraunces } from "next/font/google";
import { bluesLookClassName } from "./bluesLook";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["600", "700"],
  style: ["normal", "italic"],
  variable: "--font-blues-serif",
  display: "swap",
});

/** Live Blues layout only. Crash and 404 chrome must not import this file. */
export const bluesShellClassName = `${fraunces.variable} ${bluesLookClassName}`;
