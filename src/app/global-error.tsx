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
  const isBluesHost = useSyncExternalStore<boolean | null>(
    subscribe,
    () => isBluesHostname(window.location.hostname),
    () => null,
  );

  useEffect(() => {
    if (isBluesHost === false) {
      Sentry.captureException(error);
    }
  }, [error, isBluesHost]);

  if (isBluesHost === null) {
    return (
      <html lang="en">
        <body style={{ backgroundColor: "transparent" }} />
      </html>
    );
  }

  if (isBluesHost) {
    return (
      <html lang="en">
        <body className="bg-[#1E3A8A]">
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
