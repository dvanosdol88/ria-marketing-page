import Image from "next/image";
import Link from "next/link";

/**
 * Shared site-wide footer.
 * Renders logo, disclaimer, and legal links.
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-neutral-200 dark:border-slate-700 bg-[#EEF0F5] dark:bg-slate-950">
      <div className="mx-auto max-w-[1100px] px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:justify-between sm:items-start">
          {/* Left: Logo + Disclaimer */}
          <div className="max-w-2xl space-y-3">
            <Link href={"/" as any} aria-label="Smarter Way Wealth home">
              <Image
                src="/brand/logo.svg"
                alt="Smarter Way Wealth"
                width={170}
                height={68}
                className="h-6 w-auto opacity-75 grayscale dark:invert"
              />
            </Link>
            <p className="text-sm leading-relaxed text-neutral-500 dark:text-slate-400">
              Advisory services are for illustrative purposes only. Chart
              projections are hypothetical and not a guarantee of future returns.
            </p>
          </div>

          {/* Right: Legal links */}
          <div className="flex gap-6 text-sm text-neutral-500 dark:text-slate-400 shrink-0">
            <a href="#" className="hover:text-neutral-700 dark:hover:text-slate-200 no-underline">
              Disclosures
            </a>
            <a href="#" className="hover:text-neutral-700 dark:hover:text-slate-200 no-underline">
              ADV
            </a>
            <a href="#" className="hover:text-neutral-700 dark:hover:text-slate-200 no-underline">
              Privacy
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-neutral-200 dark:border-slate-700 pt-6 text-xs text-neutral-400 dark:text-slate-500">
          © {new Date().getFullYear()} Smarter Way Wealth. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
