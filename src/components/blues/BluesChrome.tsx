"use client";

import { bluesShellClassName } from "@/app/bluesFonts";
import { BluesFooter } from "@/components/blues/BluesFooter";
import { BluesHeader } from "@/components/blues/BluesHeader";

/** Thin client shell for crash/missing-page screens that cannot import the server layout. */
export function BluesChrome({ children }: { children: React.ReactNode }) {
  return (
    <div data-theme="blues" className={bluesShellClassName}>
      <BluesHeader />
      {children}
      <BluesFooter />
    </div>
  );
}
