import Link from "next/link";
import { FeatureSection } from "@/components/improve/FeatureSection";
import { ComparisonCard } from "@/components/improve/ComparisonCard";
import { HeroImage } from "@/components/improve/HeroImage";
import { features, comparisonCards } from "@/config/improvePageConfig";

export const metadata = {
  title: "Improve Your Tools | Better Information = Better Decisions",
  description:
    "See what best-in-class financial planning looks like. Monte Carlo analysis, tax-smart Roth conversions, stress testing, and more.",
};

export default function ImproveYourTools() {
  return (
    <main className="bg-neutral-50 text-neutral-900 antialiased">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 pb-16">
        {/* HERO */}
        <section id="top" className="pt-6 pb-8 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
            Better Tools ={" "}
            <span className="text-brand-600">Better Information</span> ={" "}
            <span className="text-brand-600">Better Decisions</span>
          </h1>

          <p className="mt-4 text-lg sm:text-xl text-neutral-700 max-w-3xl mx-auto">
            See what state-of-the-art financial planning looks like—the same
            software used by top wealth management firms, now working for you.
          </p>

          {/* Hero Visual */}
          <HeroImage
            src="/assets/rightcapital/cashflow-waterfall.gif"
            alt="Cash flow waterfall animation showing income and expense flows over time"
            caption="Dynamic cash flow visualization—see exactly where your money goes"
          />
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
                className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-white font-semibold shadow-sm hover:bg-brand-700 transition-colors no-underline"
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
