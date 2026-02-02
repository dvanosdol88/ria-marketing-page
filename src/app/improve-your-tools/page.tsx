import Link from "next/link";
import { ScrollReveal } from "@/components/ScrollReveal";
import AnimatedHeader from "@/components/improve/AnimatedHeader";

export const metadata = {
  title: "Improve Your Tools | Better Information = Better Decisions",
  description:
    "See what best-in-class financial planning looks like. Monte Carlo analysis, tax-smart Roth conversions, stress testing, and more.",
};

export default function ImproveYourToolsPage() {
  return (
    <main className="flex flex-col gap-12 pb-16">
      {/* Hero Section - Animated Header */}
      <AnimatedHeader />

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
              href="/upgrade-your-advice"
              className="rounded-full bg-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-300"
            >
              ← Upgrade Your Advice
            </Link>
            <Link
              href="/save-a-ton"
              className="rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
            >
              Save a TON →
            </Link>
          </div>
        </section>
      </ScrollReveal>
    </main>
  );
}
