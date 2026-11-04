/** Navy gradient shell with no next/font import. Crash and 404 chrome use this. */
export const bluesLookClassName =
  "min-h-screen bg-[linear-gradient(180deg,#1E3A8A_0%,#2563EB_42%,#60A5FA_100%)] text-white";

/** Same navy look; Georgia/serif if Fraunces is not loaded. */
export const bluesCrashShellClassName =
  `${bluesLookClassName} [--font-blues-serif:Georgia,serif]`;
