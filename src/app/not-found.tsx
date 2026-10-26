import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { BluesChrome } from "@/components/blues/BluesChrome";
import { bluesNotFoundMetadata } from "@/components/blues/bluesIcons";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteNav } from "@/components/SiteNav";
import { BLUES_ORIGIN } from "@/config/onePercentBlues";
import { isBluesHostname, requestHostname } from "@/lib/bluesHost";

/* Root 404: blue host uses Blues chrome; everyone else uses the green site chrome. */
async function isBluesHost() {
  return isBluesHostname(requestHostname(await headers()));
}

export async function generateMetadata(): Promise<Metadata> {
  if (!(await isBluesHost())) {
    return { title: "Page not found | You Are Paying Too Much" };
  }
  return {
    ...bluesNotFoundMetadata(),
    metadataBase: new URL(BLUES_ORIGIN),
  };
}

export default async function NotFound() {
  const isBlues = await isBluesHost();

  if (isBlues) {
    return (
      <BluesChrome>
        <main className="mx-auto flex min-h-[60vh] max-w-[1040px] flex-col items-center justify-center gap-6 px-4 py-20 text-center sm:px-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15 text-2xl font-semibold text-white">
            404
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold text-white sm:text-4xl">We can’t find that page.</h1>
            <p className="max-w-xl text-base text-white/80 sm:text-lg">
              The page you’re looking for may have moved or no longer exists.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-[#1E3A8A] no-underline shadow-sm transition hover:bg-white/90"
          >
            Back to One Percent Blues
          </Link>
        </main>
      </BluesChrome>
    );
  }

  return (
    <>
      <SiteNav />
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
      <SiteFooter />
    </>
  );
}
