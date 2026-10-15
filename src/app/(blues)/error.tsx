"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { BluesChrome } from "@/components/blues/BluesChrome";
import { BluesCrashPanel } from "@/components/blues/BluesCrashPanel";

export default function BluesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <BluesChrome>
      <BluesCrashPanel error={error} reset={reset} />
    </BluesChrome>
  );
}
