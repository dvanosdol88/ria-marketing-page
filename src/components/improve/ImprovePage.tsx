"use client";

import Image from "next/image";
import Link from "next/link";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { FeatureSection } from "@/components/improve/FeatureSection";
import { ComparisonCard } from "@/components/improve/ComparisonCard";
import {
  improveToolsNavItems,
  improveToolsVariants,
} from "@/config/improveToolsPageConfig";

interface ImprovePageProps {
  version: number;
}

export function ImprovePage({ version }: ImprovePageProps) {
  const variant = improveToolsVariants[version] ?? improveToolsVariants[1];
  const navItems = improveToolsNavItems(version);
  const [firstFeature] = variant.features;

  return (
    <main className="bg-neutral-50 text-neutral-900 antialiased">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 pb-16">
        <header className="flex justify-between items-center border-b border-neutral-200 py-4">
          <Link
            href="/"
            className="font-bold flex items-center gap-3 hover:opacity-90 no-underline text-neutral-900"
            aria-label="Smarter Way Wealth home"
          >
            <Image
              src="/brand/logo.svg"
              alt="Smarter Way Wealth"
              width={180}
              height={72}
              className="h-[3.5rem] w-auto sm:h-[4.5rem]"
              priority
            />
            <span className="hidden sm:inline text-sm font-semibold text-neutral-600">
              Improve Your Tools
            </span>
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
              className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-white font-semibold shadow-sm hover:bg-green-700 transition-colors no-underline"
            >
              Questions? Let&apos;s Talk →
            </a>

            {firstFeature && (
              <a
                href={`#${firstFeature.id}`}
                className="inline-flex items-center gap-2 text-green-700 font-semibold hover:underline no-underline"
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

        <footer className="mt-14 pt-6 border-t border-neutral-200 text-xs text-neutral-500">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div>
              Software screenshots are for illustrative purposes. Features may vary based on
              individual circumstances.
            </div>
            <div className="flex gap-3 font-semibold">
              <a
                className="hover:underline no-underline text-neutral-500"
                href="/disclosures"
              >
                Disclosures
              </a>
              <span className="text-neutral-300">|</span>
              <a className="hover:underline no-underline text-neutral-500" href="/adv">
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
