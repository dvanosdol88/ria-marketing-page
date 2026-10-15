"use client";

import * as Sentry from "@sentry/nextjs";
import NextError from "next/error";
import { useEffect, useSyncExternalStore } from "react";
import "./globals.css";
import { BluesChrome } from "@/components/blues/BluesChrome";
import { BluesCrashPanel } from "@/components/blues/BluesCrashPanel";
import { isBluesHostname } from "@/lib/bluesHost";

function subscribe() {
  return () => {};
}

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  const isBlues = useSyncExternalStore(
    subscribe,
    () => isBluesHostname(window.location.hostname),
    () => false,
  );

  if (isBlues) {
    return (
      <html lang="en">
        <body>
          <BluesChrome>
            <BluesCrashPanel error={error} reset={reset} />
          </BluesChrome>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body>
        {/* `NextError` is the default Next.js error page component. Its type
        definition requires a `statusCode` prop. However, since the App Router
        does not expose status codes for errors, we simply pass 0 to render a
        generic error message. */}
        <NextError statusCode={0} />
      </body>
    </html>
  );
}
