"use client";

import { BluesCrashPanel } from "@/components/blues/BluesCrashPanel";

/** Page-level crash: the Blues layout already wraps this with the shared chrome. */
export default function BluesPageError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <BluesCrashPanel error={error} reset={reset} />;
}
