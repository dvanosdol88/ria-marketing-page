export default function Loading() {
  return (
    <main className="section-shell flex min-h-[60vh] flex-col items-center justify-center gap-6 py-20 text-center">
      <div className="flex items-center gap-3 text-brand-600">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
        <span className="text-sm font-semibold uppercase tracking-[0.2em]">Loading</span>
      </div>
      <p className="max-w-xl text-base text-neutral-600 sm:text-lg">
        Crunching the numbers for your scenario. This should only take a moment.
      </p>
    </main>
  );
}
