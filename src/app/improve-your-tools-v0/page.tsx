import Link from "next/link";
import Image from "next/image";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { FeatureSectionStacked } from "@/components/improve/FeatureSectionStacked";
import AnimatedHeader from "@/components/improve/AnimatedHeader";
import {
  heroContent,
  features,
  comparisonCards,
} from "@/config/improveToolsV0Config";

export const metadata = {
  title: "Improve Your Tools | Better Information = Better Decisions",
  description:
    "See what best-in-class financial planning looks like. Monte Carlo analysis, tax-smart Roth conversions, stress testing, and more.",
};

export default function ImproveYourToolsV0Page() {
  return (
    <main className="bg-neutral-50 text-neutral-900 antialiased">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 pb-16">

        {/* HERO - Animated Header */}
        <section id="top">
          <AnimatedHeader />

          {/* CTA buttons below animation */}
          <div className="pb-8 flex flex-col sm:flex-row gap-3 justify-center items-center">
            <a
              href="#cta"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-white font-semibold shadow-sm hover:bg-brand-700 transition-colors no-underline"
            >
              Questions? Let&apos;s Talk →
            </a>

            <a
              href={`#${features[0].id}`}
              className="inline-flex items-center gap-2 text-brand-700 font-semibold hover:underline no-underline"
            >
              See the tools
              <span aria-hidden="true">↓</span>
            </a>
          </div>

          {/* Hero Visual - Full Width */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-3 sm:p-4 overflow-hidden">
            <Zoom>
              <div className="relative w-full overflow-hidden rounded-lg" style={{ aspectRatio: 1.8 }}>
                <Image
                  src="/assets/rightcapital/cashflow-waterfall.gif"
                  alt="Cash flow waterfall animation showing income and expense flows over time"
                  fill
                  className="object-contain cursor-zoom-in"
                  loading="eager"
                  unoptimized
                  sizes="(max-width: 1100px) 100vw, 1100px"
                />
              </div>
            </Zoom>
            <p className="mt-3 text-sm text-neutral-500 text-center">
              {heroContent.caption}
            </p>
          </div>
        </section>

        {/* FEATURE SECTIONS - Stacked Layout */}
        {features.map((feature) => (
          <FeatureSectionStacked key={feature.id} feature={feature} />
        ))}

        {/* COMPARISON SECTION */}
        <section id="comparison" className="mt-16">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-6 text-center text-neutral-900">
            Not All Advice Is Created Equal
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {comparisonCards.map((card) => (
              <div
                key={card.title}
                className={`rounded-2xl p-6 ${
                  card.highlighted
                    ? "bg-brand-600 text-white shadow-lg"
                    : "bg-white border border-neutral-200"
                }`}
              >
                <h3
                  className={`font-bold text-lg mb-4 ${
                    card.highlighted ? "text-white" : "text-neutral-900"
                  }`}
                >
                  {card.title}
                </h3>
                <ul className="space-y-2">
                  {card.items.map((item, idx) => (
                    <li
                      key={idx}
                      className={`flex items-start gap-2 text-sm ${
                        card.highlighted ? "text-brand-100" : "text-neutral-600"
                      }`}
                    >
                      {card.checkmarks ? (
                        <span className="text-white font-bold">✓</span>
                      ) : (
                        <span className="text-neutral-400">•</span>
                      )}
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section id="cta" className="mt-16">
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 sm:p-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3 text-neutral-900">
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

      </div>
    </main>
  );
}
