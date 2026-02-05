"use client";

import Link from "next/link";
import Image from "next/image";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { DesignerNav } from "@/components/DesignerNav";
import AnimatedHeader from "@/components/improve/AnimatedHeader";
import { ScrollReveal } from "@/components/ScrollReveal";
import { TabbedFeatures } from "@/components/improve/TabbedFeatures";
import {
  heroContent,
  features,
  comparisonCards,
  navItems,
} from "@/config/improveToolsV0Config";

export default function ImproveYourToolsPage() {
  return (
    <main className="bg-neutral-50 text-neutral-900 antialiased">
      <DesignerNav />
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 pb-16">
        {/* Header / Nav */}
        <header className="flex justify-between items-center border-b border-neutral-200 py-4">
          <Link
            href="/"
            className="font-bold flex items-center gap-2 hover:opacity-90 no-underline text-brand-600"
          >
            <span className="w-3 h-3 rounded-full bg-brand-600"></span>
            <span>Improve Your Tools</span>
          </Link>

          <nav className="hidden sm:flex gap-4 text-sm font-semibold">
            {navItems.slice(0, 4).map((item, index) => (
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
              className="text-brand-600 hover:underline no-underline"
              href="#cta"
            >
              Get started →
            </a>
          </nav>

          <a
            href="#cta"
            className="sm:hidden text-sm font-semibold text-brand-600 hover:underline no-underline"
            aria-label="Jump to get started"
          >
            Get started →
          </a>
        </header>

        {/* HERO - Animated Header (has its own animations, no ScrollReveal) */}
        <section id="top">
          <AnimatedHeader />

          {/* CTA buttons below animation */}
          <ScrollReveal delay={0.1}>
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
          </ScrollReveal>

          {/* Hero Visual - Full Width */}
          <ScrollReveal delay={0.2}>
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-3 sm:p-4 overflow-hidden">
              <Zoom>
                <div
                  className="relative w-full overflow-hidden rounded-lg"
                  style={{ aspectRatio: 1.8 }}
                >
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
          </ScrollReveal>
        </section>

        {/* FEATURE SECTIONS - Tabbed Layout */}
        <ScrollReveal>
          <TabbedFeatures features={features} tabs={navItems} />
        </ScrollReveal>

        {/* COMPARISON SECTION */}
        <ScrollReveal>
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
        </ScrollReveal>

        {/* CTA */}
        <ScrollReveal>
          <section id="cta" className="mt-16">
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 sm:p-8 text-center">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3 text-neutral-900">
                Questions about how this works for your situation?
              </h2>

              <p className="text-lg text-neutral-700 max-w-2xl mx-auto mb-6">
                See how best-in-class planning tools can help you make better
                decisions about retirement, taxes, and your financial future.
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
        </ScrollReveal>

        {/* Footer */}
        <ScrollReveal>
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
        </ScrollReveal>
      </div>
    </main>
  );
}
