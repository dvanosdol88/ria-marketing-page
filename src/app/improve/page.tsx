import Image from "next/image";
import Link from "next/link";
import { FeatureSection } from "@/components/improve/FeatureSection";
import { ComparisonCard } from "@/components/improve/ComparisonCard";
import {
  features,
  comparisonCards,
  navItems,
} from "@/config/improvePageConfig";

export const metadata = {
  title: "Improve Your Tools | Better Information = Better Decisions",
  description:
    "See what best-in-class financial planning looks like. Monte Carlo analysis, tax-smart Roth conversions, stress testing, and more.",
};

export default function ImproveYourTools() {
  return (
    <main className="bg-neutral-50 text-neutral-900 antialiased">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 pb-16">
        {/* Header / Nav */}
        <header className="flex justify-between items-center border-b border-neutral-200 py-4">
          <Link
            href="/"
            className="font-bold flex items-center gap-2 hover:opacity-90 no-underline text-neutral-900"
          >
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
            <span>Improve Your Tools</span>
          </Link>

          <nav className="hidden sm:flex gap-4 text-sm font-semibold">
            {navItems.map((item, index) => (
              <span key={item.id} className="flex items-center gap-4">
                {index > 0 && <span className="text-neutral-300">|</span>}
                <a
                  className="hover:underline no-underline text-neutral-700"
                  href={`#${item.id}`}
                >
                  {item.label}
                </a>
              </span>
            ))}
            <span className="text-neutral-300">|</span>
            <a
              className="text-green-600 hover:underline no-underline"
              href="#cta"
            >
              Get started →
            </a>
          </nav>

          <a
            href="#cta"
            className="sm:hidden text-sm font-semibold text-green-600 hover:underline no-underline"
            aria-label="Jump to get started"
          >
            Get started →
          </a>
        </header>

        {/* HERO */}
        <section id="top" className="pt-12 pb-8 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
            Better Tools ={" "}
            <span className="text-green-600">Better Information</span> ={" "}
            <span className="text-green-600">Better Decisions</span>
          </h1>

          <p className="mt-4 text-lg sm:text-xl text-neutral-700 max-w-3xl mx-auto">
            See what state-of-the-art financial planning looks like—the same
            software used by top wealth management firms, now working for you.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center items-center">
            <a
              href="#cta"
              className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-white font-semibold shadow-sm hover:bg-green-700 transition-colors no-underline"
            >
              Questions? Let&apos;s Talk →
            </a>

            <a
              href={`#${features[0].id}`}
              className="inline-flex items-center gap-2 text-green-700 font-semibold hover:underline no-underline"
            >
              See the tools
              <span aria-hidden="true">↓</span>
            </a>
          </div>

          {/* Hero Visual */}
          <div className="mt-10 bg-white rounded-2xl shadow-sm border border-neutral-200 p-4 sm:p-6 max-w-4xl mx-auto overflow-hidden">
            <Image
              src="/assets/rightcapital/cashflow-waterfall.gif"
              alt="Cash flow waterfall animation showing income and expense flows over time"
              width={900}
              height={500}
              className="w-full h-auto rounded-lg"
              loading="eager"
              unoptimized
            />
            <p className="mt-3 text-sm text-neutral-500 text-center">
              Dynamic cash flow visualization—see exactly where your money goes
            </p>
          </div>
        </section>

        {/* FEATURE SECTIONS */}
        {features.map((feature) => (
          <FeatureSection key={feature.id} feature={feature} />
        ))}

        {/* COMPARISON SECTION */}
        <section id="comparison" className="mt-16">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-6 text-center">
            Not All Advice Is Created Equal
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {comparisonCards.map((card) => (
              <ComparisonCard key={card.title} card={card} />
            ))}
          </div>
        </section>

        {/* CTA */}
        <section id="cta" className="mt-16">
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 sm:p-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
              Questions about how this works for your situation?
            </h2>

            <p className="text-lg text-neutral-700 max-w-2xl mx-auto mb-6">
              See how best-in-class planning tools can help you make
              better decisions about retirement, taxes, and your financial
              future.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <a
                href="#"
                className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 text-white font-semibold shadow-sm hover:bg-green-700 transition-colors no-underline"
              >
                Schedule a Free Consultation →
              </a>

              <Link
                href="/"
                className="inline-flex items-center gap-2 text-neutral-700 font-semibold hover:underline no-underline"
              >
                ← Back to Calculator
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-14 pt-6 border-t border-neutral-200 text-xs text-neutral-500">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div>
              Software screenshots are for illustrative purposes. Features may
              vary based on individual circumstances.
            </div>
            <div className="flex gap-3 font-semibold">
              <a
                className="hover:underline no-underline text-neutral-500"
                href="/disclosures"
              >
                Disclosures
              </a>
              <span className="text-neutral-300">|</span>
              <a
                className="hover:underline no-underline text-neutral-500"
                href="/adv"
              >
                ADV
              </a>
              <span className="text-neutral-300">|</span>
              <a
                className="hover:underline no-underline text-neutral-500"
                href="/privacy"
              >
                Privacy
              </a>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
