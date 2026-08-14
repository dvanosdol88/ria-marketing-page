import Link from "next/link";

export default function NotFound() {
  return (
    <main className="section-shell flex min-h-[60vh] flex-col items-center justify-center gap-6 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-2xl font-semibold text-brand-600">
        404
      </div>
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold text-neutral-900 sm:text-4xl">We can’t find that page.</h1>
        <p className="max-w-xl text-base text-neutral-600 sm:text-lg">
          The page you’re looking for may have moved or no longer exists. Try heading back to Your Fee Calculator.
        </p>
      </div>
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white no-underline shadow-sm transition hover:bg-brand-700"
      >
        Back to Your Fee Calculator
      </Link>
    </main>
  );
}
