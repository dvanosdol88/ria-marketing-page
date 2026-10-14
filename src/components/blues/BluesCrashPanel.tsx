"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export function BluesCrashPanel({
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
    <main className="mx-auto flex min-h-[60vh] max-w-[1040px] flex-col items-center justify-center gap-6 px-4 py-20 text-center sm:px-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15 text-2xl font-semibold text-white">
        !
      </div>
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold text-white sm:text-4xl">Something went wrong.</h1>
        <p className="max-w-xl text-base text-white/80 sm:text-lg">
          We hit a snag loading this page. Try again, or head back to One Percent Blues in a moment.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-[#1E3A8A] no-underline shadow-sm transition hover:bg-white/90"
        >
          Try again
        </button>
        <a
          href="/"
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/40 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-white/10"
        >
          Back to One Percent Blues
        </a>
      </div>
    </main>
  );
}
