"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="section-shell flex min-h-[60vh] flex-col items-center justify-center gap-6 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-2xl font-semibold text-rose-600">
        !
      </div>
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold text-neutral-900 sm:text-4xl">Something went wrong.</h1>
        <p className="max-w-xl text-base text-neutral-600 sm:text-lg">
          We hit a snag loading this page. Try again, or head back to Your Fee Calculator in a moment.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white no-underline shadow-sm transition hover:bg-brand-700"
        >
          Try again
        </button>
        <a
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-5 py-2 text-sm font-semibold text-neutral-700 shadow-sm transition hover:border-neutral-300 hover:text-neutral-900"
        >
          Back to home
        </a>
      </div>
    </main>
  );
}
