"use client";

import { fraunces } from "@/app/bluesFonts";
import { BluesFooter } from "@/components/blues/BluesFooter";
import { BluesHeader } from "@/components/blues/BluesHeader";

const BLUES_SHELL_CLASS_NAME =
  `${fraunces.variable} min-h-screen bg-[linear-gradient(180deg,#1E3A8A_0%,#2563EB_42%,#60A5FA_100%)] text-white`;

/** Shared blue-site shell: gradient, header and footer. */
export function BluesChrome({ children }: { children: React.ReactNode }) {
  return (
    <div data-theme="blues" className={BLUES_SHELL_CLASS_NAME}>
      <BluesHeader />
      {children}
      <BluesFooter />
    </div>
  );
}
