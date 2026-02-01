"use client";

import Link from "next/link";
import { ScrollReveal } from "@/components/ScrollReveal";

export default function SaveATonPage() {
  return (
    <main className="flex flex-col gap-12 pb-16">
      {/* Hero Section */}
      <ScrollReveal>
        <header className="section-shell pt-12">
          <p className="text-xs font-semibold uppercase tracking-tightish text-green-600">
            Save a TON of Money
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-neutral-900 sm:text-5xl">
            <span className="text-green-600">Save</span> a TON of Money
          </h1>
          <p className="mt-4 text-lg text-neutral-600 sm:text-xl">
            {/* TODO: Add hero description */}
            Placeholder for hero section content.
          </p>
        </header>
      </ScrollReveal>

      {/* Content Sections - Add your components here */}
      <ScrollReveal delay={0.2}>
        <section className="section-shell">
          <div className="card p-8 text-center">
            <p className="text-neutral-500">
              Content sections will be added here. Each wrapped in ScrollReveal for animation.
            </p>
          </div>
        </section>
      </ScrollReveal>

      {/* Navigation */}
      <ScrollReveal delay={0.4}>
        <section className="section-shell">
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/improve-your-tools"
              className="rounded-full bg-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-300"
            >
              ← Improve Your Tools
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
