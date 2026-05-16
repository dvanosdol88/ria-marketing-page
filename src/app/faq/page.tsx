"use client";

import Link from "next/link";
import { FaqAccordion } from "@/components/FaqAccordion";
import { ScrollReveal } from "@/components/ScrollReveal";

export default function FAQPage() {
  return (
    <main className="flex flex-col gap-12 pb-16">
      {/* Hero */}
      <ScrollReveal>
        <header className="section-shell pt-12">
          <p className="text-xs font-semibold uppercase tracking-tightish text-brand-600">
            FAQ
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-neutral-900 sm:text-5xl">
            Frequently asked questions
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-neutral-600 sm:text-xl">
            The questions clients ask before signing on. Search to jump
            straight to the one on your mind, or tap any question to
            expand the answer.
          </p>
        </header>
      </ScrollReveal>

      {/* Searchable accordion */}
      <ScrollReveal delay={0.15}>
        <section className="section-shell">
          <FaqAccordion />
        </section>
      </ScrollReveal>

      {/* Footer nav */}
      <ScrollReveal delay={0.3}>
        <section className="section-shell">
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/"
              className="rounded-full bg-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-300"
            >
              ← Back to home
            </Link>
            <Link
              href="/how-it-works"
              className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              How it works →
            </Link>
          </div>
        </section>
      </ScrollReveal>
    </main>
  );
}
