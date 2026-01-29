'use client';

import Link from 'next/link';

interface PagePreviewProps {
  href: string;
  title: string;
  description: string;
}

function PagePreview({ href, title, description }: PagePreviewProps) {
  return (
    <div className="mb-8">
      {/* Header bar */}
      <div className="flex items-center justify-between bg-white border border-stone-200 border-b-0 rounded-t-xl px-4 py-3">
        <div>
          <h3 className="text-lg font-bold text-stone-900">{title}</h3>
          <p className="text-sm text-stone-500">{description}</p>
        </div>
        <Link
          href={href}
          target="_blank"
          className="text-sm font-medium text-blue-600 hover:text-blue-800 no-underline flex items-center gap-1"
        >
          Open in new tab
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </Link>
      </div>
      {/* Full page iframe */}
      <div className="border border-stone-200 rounded-b-xl overflow-hidden bg-white">
        <iframe
          src={href}
          title={title}
          className="w-full border-0"
          style={{ height: '800px' }}
          loading="lazy"
        />
      </div>
    </div>
  );
}

export default function UpgradeSummary() {
  return (
    <main className="min-h-screen bg-stone-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-12 text-center">
          <Link
            href="/"
            className="text-sm text-stone-500 hover:text-stone-700 no-underline mb-4 inline-block"
          >
            &larr; Back to Home
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4">
            Upgrade Pages Summary (1-10)
          </h1>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto">
            Ten different approaches to communicating the same value proposition.
            Scroll through each full page preview below.
          </p>

          {/* Quick Jump Navigation */}
          <nav className="mt-8 flex flex-wrap justify-center gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <a
                key={n}
                href={`#theme-${n <= 2 ? 1 : n <= 4 ? 2 : n === 5 ? 3 : n <= 7 ? 4 : n === 8 ? 5 : 6}`}
                className="px-3 py-1.5 text-sm font-medium bg-white border border-stone-200 rounded-full hover:bg-stone-50 no-underline text-stone-700"
              >
                /upgrade{n}
              </a>
            ))}
          </nav>
        </header>

        {/* Theme 1: Personal Story */}
        <section id="theme-1" className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center text-lg font-bold">
              1
            </span>
            <div>
              <h2 className="text-2xl font-bold text-stone-900">Personal Story: Why I Left</h2>
              <p className="text-stone-600">
                Narrative-driven pages about leaving a traditional firm due to conflicts of interest.
              </p>
            </div>
          </div>

          <div className="grid xl:grid-cols-2 gap-6">
            <PagePreview
              href="/upgrade1"
              title="Upgrade 1"
              description="Original personal story with credential cards and model comparison"
            />
            <PagePreview
              href="/upgrade2"
              title="Upgrade 2"
              description="Same story + 'What This Looks Like in Practice' section"
            />
          </div>
        </section>

        {/* Theme 2: Credential Education */}
        <section id="theme-2" className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-lg font-bold">
              2
            </span>
            <div>
              <h2 className="text-2xl font-bold text-stone-900">Credential Education with Sources</h2>
              <p className="text-stone-600">
                Comprehensive CFA/CFP explanations with 10 cited sources. Academic tone.
              </p>
            </div>
          </div>

          <div className="grid xl:grid-cols-2 gap-6">
            <PagePreview
              href="/upgrade3"
              title="Upgrade 3"
              description="Deep-dive educational page with sources and Bogle quote"
            />
            <PagePreview
              href="/upgrade4"
              title="Upgrade 4"
              description="Nearly identical to Upgrade 3"
            />
          </div>
        </section>

        {/* Theme 3: Visual/Data-Driven */}
        <section id="theme-3" className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-10 h-10 rounded-xl bg-purple-500 text-white flex items-center justify-center text-lg font-bold">
              3
            </span>
            <div>
              <h2 className="text-2xl font-bold text-stone-900">Visual & Data-Driven Analysis</h2>
              <p className="text-stone-600">
                Interactive Recharts visualizations showing fee impact and credential difficulty.
              </p>
            </div>
          </div>

          <PagePreview
            href="/upgrade5"
            title="Upgrade 5"
            description="FeeChart, CFA Funnel, Advisor Matrix, Scorecard, and Fiduciary Oath"
          />
        </section>

        {/* Theme 4: Credential Comparison */}
        <section id="theme-4" className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center text-lg font-bold">
              4
            </span>
            <div>
              <h2 className="text-2xl font-bold text-stone-900">Credential Comparison & Rarity</h2>
              <p className="text-stone-600">
                Side-by-side CFA vs CFP comparisons emphasizing &quot;&lt;1% hold both&quot; rarity.
              </p>
            </div>
          </div>

          <div className="grid xl:grid-cols-2 gap-6">
            <PagePreview
              href="/upgrade6"
              title="Upgrade 6"
              description="Badge-focused design with CFA image and rarity statistics"
            />
            <PagePreview
              href="/upgrade7"
              title="Upgrade 7"
              description="Newspaper-style with 'By The Numbers' comparison table"
            />
          </div>
        </section>

        {/* Theme 5: Fiduciary Deep Dive */}
        <section id="theme-5" className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-10 h-10 rounded-xl bg-slate-700 text-white flex items-center justify-center text-lg font-bold">
              5
            </span>
            <div>
              <h2 className="text-2xl font-bold text-stone-900">Fiduciary Standard Deep Dive</h2>
              <p className="text-stone-600">
                Dark-themed FAQ format explaining what &quot;fiduciary&quot; actually means.
              </p>
            </div>
          </div>

          <PagePreview
            href="/upgrade8"
            title="Upgrade 8"
            description="Dark mode with collapsible FAQs, verification links, SEO structured data"
          />
        </section>

        {/* Theme 6: Task vs Purpose */}
        <section id="theme-6" className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-10 h-10 rounded-xl bg-green-500 text-white flex items-center justify-center text-lg font-bold">
              6
            </span>
            <div>
              <h2 className="text-2xl font-bold text-stone-900">Task vs Purpose Philosophy</h2>
              <p className="text-stone-600">
                Jensen Huang-inspired framework separating mechanical tasks from meaningful outcomes.
              </p>
            </div>
          </div>

          <div className="grid xl:grid-cols-2 gap-6">
            <PagePreview
              href="/upgrade9"
              title="Upgrade 9"
              description="'What's my job?' opener with 'The Dirty Secret' revelation"
            />
            <PagePreview
              href="/upgrade10"
              title="Upgrade 10"
              description="Polished version with strikethrough headline and industry exposé"
            />
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-8 border-t border-stone-300 text-sm text-stone-500 text-center">
          <p>
            Each iframe shows the full page. Scroll within each preview to see all content,
            or click &quot;Open in new tab&quot; for the full experience.
          </p>
        </footer>
      </div>
    </main>
  );
}
