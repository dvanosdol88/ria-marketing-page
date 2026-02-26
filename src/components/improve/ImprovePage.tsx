"use client";

import Image from "next/image";
import Link from "next/link";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { FeatureSection } from "@/components/improve/FeatureSection";
import { ComparisonCard } from "@/components/improve/ComparisonCard";
import {
  improveToolsVariants,
} from "@/config/improveToolsPageConfig";

interface ImprovePageProps {
  version: number;
}

export function ImprovePage({ version }: ImprovePageProps) {
  const variant = improveToolsVariants[version] ?? improveToolsVariants[1];
  const [firstFeature] = variant.features;

  return (
    <main className="bg-[#EEF0F5] text-neutral-900 antialiased">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 pb-16">
        <section id="top" className="pt-12 pb-8 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
            {variant.hero.headline}
          </h1>

          <p className="mt-4 text-lg sm:text-xl text-neutral-700 max-w-3xl mx-auto">
            {variant.hero.subhead}
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center items-center">
            <a
              href="#cta"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-white font-semibold shadow-sm hover:bg-brand-700 transition-colors no-underline"
            >
              Questions? Let&apos;s Talk →
            </a>

            {firstFeature && (
              <a
                href={`#${firstFeature.id}`}
                className="inline-flex items-center gap-2 text-brand-700 font-semibold hover:underline no-underline"
              >
                See the tools
                <span aria-hidden="true">↓</span>
              </a>
            )}
          </div>

          <div className="mt-10 bg-white rounded-2xl shadow-sm border border-neutral-200 p-4 sm:p-6 max-w-4xl mx-auto overflow-hidden">
            <Zoom>
              <Image
                src="/assets/rightcapital/cashflow-waterfall.gif"
                alt="Cash flow waterfall animation showing income and expense flows over time"
                width={900}
                height={500}
                className="w-full h-auto rounded-lg cursor-zoom-in"
                loading="lazy"
                unoptimized
              />
            </Zoom>
            <p className="mt-3 text-sm text-neutral-500 text-center">
              {variant.hero.caption}
            </p>
          </div>
        </section>

        {variant.features.map((feature) => (
          <FeatureSection key={feature.id} feature={feature} />
        ))}

        <section id="comparison" className="mt-16">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-6 text-center">
            Not All Advice Is Created Equal
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {variant.comparisonCards.map((card) => (
              <ComparisonCard key={card.title} card={card} />
            ))}
          </div>
        </section>

        <section id="cta" className="mt-16">
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 sm:p-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
              Questions about how this works for your situation?
            </h2>

            <p className="text-lg text-neutral-700 max-w-2xl mx-auto mb-6">
              We&apos;ll walk through the tools, explain the insights, and show how they apply
              to your retirement and tax decisions.
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
