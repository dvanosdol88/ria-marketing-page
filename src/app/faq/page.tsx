"use client";

import Link from "next/link";
import { ScrollReveal } from "@/components/ScrollReveal";

export default function FAQPage() {
  return (
    <main className="flex flex-col gap-12 pb-16">
      {/* Hero Section */}
      <ScrollReveal>
        <header className="section-shell pt-12">
          <p className="text-xs font-semibold uppercase tracking-tightish text-green-600">
            FAQ
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-neutral-900 sm:text-5xl">
            Frequently Asked Questions
          </h1>
          <p className="mt-4 text-lg text-neutral-600 sm:text-xl">
            {/* TODO: Add hero description */}
            Placeholder for FAQ introduction.
          </p>
        </header>
      </ScrollReveal>

      {/* FAQ Items - Add your Q&A components here */}
      <ScrollReveal delay={0.2}>
        <section className="section-shell">
          <div className="card p-8 text-center">
            <p className="text-neutral-500">
              FAQ items will be added here. Each question/answer pair wrapped in ScrollReveal.
            </p>
          </div>
        </section>
      </ScrollReveal>

      {/* Navigation */}
      <ScrollReveal delay={0.4}>
        <section className="section-shell">
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/"
              className="rounded-full bg-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-300"
            >
              ← Back to Home
            </Link>
            <Link
              href="/how-it-works"
              className="rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
            >
              How It Works →
            </Link>
          </div>
        </section>
      </ScrollReveal>
    </main>
  );
}
