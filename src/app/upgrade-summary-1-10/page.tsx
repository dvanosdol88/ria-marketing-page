import Link from 'next/link';

export const metadata = {
  title: 'Upgrade Pages Summary (1-10)',
  description: 'Overview and comparison of all upgrade page variants, organized by theme.',
};

interface PageCardProps {
  href: string;
  title: string;
  description: string;
  highlights: string[];
}

function PageCard({ href, title, description, highlights }: PageCardProps) {
  return (
    <Link
      href={href}
      className="block bg-white rounded-xl border border-stone-200 p-6 hover:border-stone-400 hover:shadow-md transition-all no-underline"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-bold text-stone-900">{title}</h3>
        <span className="text-xs font-mono bg-stone-100 text-stone-600 px-2 py-1 rounded">
          {href}
        </span>
      </div>
      <p className="text-stone-600 text-sm mb-4">{description}</p>
      <ul className="space-y-1">
        {highlights.map((h, i) => (
          <li key={i} className="text-xs text-stone-500 flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-stone-400" />
            {h}
          </li>
        ))}
      </ul>
    </Link>
  );
}

export default function UpgradeSummary() {
  return (
    <main className="min-h-screen bg-stone-50 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="mb-12">
          <Link
            href="/"
            className="text-sm text-stone-500 hover:text-stone-700 no-underline mb-4 inline-block"
          >
            &larr; Back to Home
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4">
            Upgrade Pages Summary
          </h1>
          <p className="text-lg text-stone-600 max-w-2xl">
            Ten different approaches to communicating the same value proposition: elite credentials,
            fiduciary duty, and flat-fee pricing. Organized by theme below.
          </p>
        </header>

        {/* Theme 1: Personal Story */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">
              1
            </span>
            <h2 className="text-xl font-bold text-stone-900">Personal Story: Why I Left</h2>
          </div>
          <p className="text-stone-600 mb-6 max-w-2xl">
            Narrative-driven pages telling the advisor&apos;s personal journey of leaving a traditional
            firm due to conflicts of interest. Emphasizes authenticity and the &quot;confession&quot; angle.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <PageCard
              href="/upgrade1"
              title="Upgrade 1"
              description="Original personal story with credential cards and traditional vs. flat-fee comparison."
              highlights={[
                'Hero with advisor photo',
                'The Problem I Couldn\'t Ignore section',
                'CFA/CFP credential cards with verification links',
                'Simple model comparison grid',
              ]}
            />
            <PageCard
              href="/upgrade2"
              title="Upgrade 2"
              description="Same core story as Upgrade 1 with added 'What This Looks Like in Practice' section."
              highlights={[
                'Nearly identical to Upgrade 1',
                'Added practical advice examples',
                'Quotes: \"You don\'t need that product\"',
                'Slightly expanded content',
              ]}
            />
          </div>
        </section>

        {/* Theme 2: Credential Education with Sources */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm font-bold">
              2
            </span>
            <h2 className="text-xl font-bold text-stone-900">Credential Education with Sources</h2>
          </div>
          <p className="text-stone-600 mb-6 max-w-2xl">
            Comprehensive educational pages explaining CFA and CFP credentials in plain English
            with extensive citations and verifiable sources. Academic tone with high credibility.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <PageCard
              href="/upgrade3"
              title="Upgrade 3"
              description="Deep-dive educational page with collapsible details, sources section, and Bogle quote."
              highlights={[
                '10 numbered source citations',
                'CFA and CFP explained in plain English',
                'Fiduciary + ethics section',
                'Flat-fee advantage with calculator link',
              ]}
            />
            <PageCard
              href="/upgrade4"
              title="Upgrade 4"
              description="Nearly identical to Upgrade 3. Same structure and content."
              highlights={[
                'Same comprehensive sources',
                'Same credential breakdown',
                'Same fiduciary explanation',
                'Identical to Upgrade 3',
              ]}
            />
          </div>
        </section>

        {/* Theme 3: Visual/Data-Driven */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold">
              3
            </span>
            <h2 className="text-xl font-bold text-stone-900">Visual & Data-Driven Analysis</h2>
          </div>
          <p className="text-stone-600 mb-6 max-w-2xl">
            Interactive charts and visualizations that make the fee impact tangible.
            Uses Recharts for data visualization with a &quot;manifesto&quot; tone.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <PageCard
              href="/upgrade5"
              title="Upgrade 5"
              description="Data-rich page with four custom visualizations: fee chart, CFA funnel, advisor matrix, and scorecard."
              highlights={[
                'FeeChart: 20-year compound fee impact',
                'CFAFunnel: Pass rate visualization',
                'AdvisorMatrix: Credential quadrant',
                'Scorecard: Broker vs Fiduciary table',
                'Fiduciary Oath commitment section',
              ]}
            />
          </div>
        </section>

        {/* Theme 4: Credential Comparison & Rarity */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center text-sm font-bold">
              4
            </span>
            <h2 className="text-xl font-bold text-stone-900">Credential Comparison & Rarity</h2>
          </div>
          <p className="text-stone-600 mb-6 max-w-2xl">
            Side-by-side credential comparisons emphasizing how rare it is to have both
            CFA and CFP. Statistics-heavy with testimonials from industry leaders.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <PageCard
              href="/upgrade6"
              title="Upgrade 6"
              description="Badge-focused design with CFA image, side-by-side credentials, and rarity statistics."
              highlights={[
                'CFA badge image prominently displayed',
                'Credential stats: pass rates, time, rarity',
                'Jenny Johnson (Franklin Templeton) quote',
                'Emerald/stone color scheme',
                '\"<1% hold both\" callout',
              ]}
            />
            <PageCard
              href="/upgrade7"
              title="Upgrade 7"
              description="Minimal newspaper-style design with a comparison table showing CFA vs CFP vs 'David'."
              highlights={[
                'Clean serif typography',
                'By The Numbers comparison table',
                'Blue/slate professional color scheme',
                'Three-benefit synergy section',
              ]}
            />
          </div>
        </section>

        {/* Theme 5: Fiduciary Deep Dive */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-8 h-8 rounded-lg bg-slate-700 text-white flex items-center justify-center text-sm font-bold">
              5
            </span>
            <h2 className="text-xl font-bold text-stone-900">Fiduciary Standard Deep Dive</h2>
          </div>
          <p className="text-stone-600 mb-6 max-w-2xl">
            Dark-themed, comprehensive page focused on what &quot;fiduciary&quot; actually means.
            FAQ format with SEO structured data. Emphasizes verification and transparency.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <PageCard
              href="/upgrade8"
              title="Upgrade 8"
              description="Dark mode page with collapsible FAQ sections, external verification links, and structured data."
              highlights={[
                'Dark theme (#0b0d12 background)',
                'JSON-LD FAQ structured data for SEO',
                'CFP/CFA verification links',
                'Bogle quote on compounding costs',
                'Collapsible details sections',
              ]}
            />
          </div>
        </section>

        {/* Theme 6: Task vs Purpose */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center text-sm font-bold">
              6
            </span>
            <h2 className="text-xl font-bold text-stone-900">Task vs Purpose Philosophy</h2>
          </div>
          <p className="text-stone-600 mb-6 max-w-2xl">
            Philosophical reframe inspired by Jensen Huang&apos;s &quot;task vs purpose&quot; concept.
            Challenges the traditional advisor value proposition by separating mechanical
            tasks from meaningful outcomes.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <PageCard
              href="/upgrade9"
              title="Upgrade 9"
              description="Provocative 'What's my job?' opener with task vs purpose comparison cards."
              highlights={[
                '\"The Dirty Secret\" revelation card',
                'Task list vs Purpose list comparison',
                'Red/green visual contrast',
                '$100/month vs 1% AUM comparison',
                'Three commitment cards',
              ]}
            />
            <PageCard
              href="/upgrade10"
              title="Upgrade 10"
              description="Polished version with strikethrough headline and industry exposé angle."
              highlights={[
                'Strikethrough \"managing money\" headline',
                'Dark section: \"What the industry doesn\'t want you to know\"',
                '$10k/year task breakdown',
                'Amber \"Ultimate Irony\" callout',
                'Four benefit cards with icons',
              ]}
            />
          </div>
        </section>

        {/* Quick Reference Table */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-stone-900 mb-4">Quick Reference</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse bg-white rounded-xl border border-stone-200">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50">
                  <th className="text-left p-4 font-semibold text-stone-700">Page</th>
                  <th className="text-left p-4 font-semibold text-stone-700">Theme</th>
                  <th className="text-left p-4 font-semibold text-stone-700">Style</th>
                  <th className="text-left p-4 font-semibold text-stone-700">Unique Feature</th>
                </tr>
              </thead>
              <tbody className="text-stone-600">
                <tr className="border-b border-stone-100">
                  <td className="p-4 font-mono">/upgrade1</td>
                  <td className="p-4">Personal Story</td>
                  <td className="p-4">Light, minimal</td>
                  <td className="p-4">Original narrative</td>
                </tr>
                <tr className="border-b border-stone-100">
                  <td className="p-4 font-mono">/upgrade2</td>
                  <td className="p-4">Personal Story</td>
                  <td className="p-4">Light, minimal</td>
                  <td className="p-4">+Practice examples</td>
                </tr>
                <tr className="border-b border-stone-100">
                  <td className="p-4 font-mono">/upgrade3</td>
                  <td className="p-4">Credential Education</td>
                  <td className="p-4">Academic, sourced</td>
                  <td className="p-4">10 citations</td>
                </tr>
                <tr className="border-b border-stone-100">
                  <td className="p-4 font-mono">/upgrade4</td>
                  <td className="p-4">Credential Education</td>
                  <td className="p-4">Academic, sourced</td>
                  <td className="p-4">Same as /upgrade3</td>
                </tr>
                <tr className="border-b border-stone-100">
                  <td className="p-4 font-mono">/upgrade5</td>
                  <td className="p-4">Visual/Data</td>
                  <td className="p-4">Charts, manifesto</td>
                  <td className="p-4">4 Recharts visualizations</td>
                </tr>
                <tr className="border-b border-stone-100">
                  <td className="p-4 font-mono">/upgrade6</td>
                  <td className="p-4">Credential Rarity</td>
                  <td className="p-4">Badge-focused</td>
                  <td className="p-4">CFA badge image</td>
                </tr>
                <tr className="border-b border-stone-100">
                  <td className="p-4 font-mono">/upgrade7</td>
                  <td className="p-4">Credential Rarity</td>
                  <td className="p-4">Newspaper/table</td>
                  <td className="p-4">Comparison table</td>
                </tr>
                <tr className="border-b border-stone-100">
                  <td className="p-4 font-mono">/upgrade8</td>
                  <td className="p-4">Fiduciary Deep Dive</td>
                  <td className="p-4">Dark, FAQ</td>
                  <td className="p-4">SEO structured data</td>
                </tr>
                <tr className="border-b border-stone-100">
                  <td className="p-4 font-mono">/upgrade9</td>
                  <td className="p-4">Task vs Purpose</td>
                  <td className="p-4">Provocative</td>
                  <td className="p-4">&quot;Dirty Secret&quot; reveal</td>
                </tr>
                <tr>
                  <td className="p-4 font-mono">/upgrade10</td>
                  <td className="p-4">Task vs Purpose</td>
                  <td className="p-4">Polished exposé</td>
                  <td className="p-4">Strikethrough headline</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-8 border-t border-stone-200 text-sm text-stone-500">
          <p>
            This summary page helps compare different messaging approaches for the same
            service offering. Each page targets slightly different angles and audiences.
          </p>
        </footer>
      </div>
    </main>
  );
}
