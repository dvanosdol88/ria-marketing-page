"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { BluesCrashPanel } from "@/components/blues/BluesCrashPanel";

/** Page-level crash: the Blues layout already wraps this with the shared chrome. */
export default function BluesPageError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return <BluesCrashPanel error={error} reset={reset} />;
}
