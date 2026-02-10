'use client';

import Link from 'next/link';

export default function Upgrade10() {
  return (
    <main className="font-sans bg-neutral-50 text-stone-800">
      {/* Hero: The Statement */}
      <section className="bg-white py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <span className="inline-block px-4 py-1.5 bg-brand-100 text-brand-600 text-sm font-semibold rounded-full">
              My Philosophy
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-stone-900 leading-tight mb-8">
            I&apos;m not in the business of<br />
            <span className="relative text-stone-400">
              managing money
              <span className="absolute left-0 right-0 top-1/2 h-1 bg-red-500 -rotate-1"></span>
            </span>
          </h1>
          <p className="text-2xl md:text-3xl font-bold text-stone-800 mb-8">
            I&apos;m in the business of{' '}
            <span className="bg-gradient-to-r from-brand-500 to-brand-600 bg-clip-text text-transparent">
              helping you succeed.
            </span>
          </p>
          <p className="text-lg text-stone-600 leading-relaxed">
            There&apos;s a difference. A big one. And it changes everything about how I work—and how you pay.
          </p>
        </div>
      </section>

      {/* The Industry's Lie */}
      <section className="py-20 px-6 bg-stone-900 text-white">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-5 gap-12 items-center">
            <div className="md:col-span-3">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-white">
                Here&apos;s what the industry doesn&apos;t want you to know:
              </h2>
              <div className="space-y-6 text-stone-300 text-lg leading-relaxed">
                <p>
                  When you pay an advisor 1% of your assets to &quot;manage your portfolio,&quot; you&apos;re not paying for portfolio management.
                </p>
                <p>
                  The actual managing? That&apos;s done by mutual funds, model portfolios, algorithms, or some combination. Your advisor picks from a menu and clicks a few buttons.
                </p>
                <p className="text-white font-semibold text-xl">
                  You&apos;re paying 1% of your life savings for someone to perform <em>tasks</em>.
                </p>
              </div>
            </div>
            <div className="md:col-span-2">
              <div className="bg-stone-800 rounded-2xl p-8 border border-stone-700">
                <p className="text-stone-400 text-sm uppercase tracking-wide mb-4">On a $1M portfolio</p>
                <p className="text-4xl font-bold text-red-400 mb-2">$10,000</p>
                <p className="text-stone-400 mb-6">per year in fees</p>
                <div className="h-px bg-stone-700 mb-6"></div>
                <p className="text-stone-400 text-sm uppercase tracking-wide mb-4">For tasks like:</p>
                <ul className="space-y-2 text-stone-400 text-sm">
                  <li>• Quarterly rebalancing clicks</li>
                  <li>• Pre-built model selection</li>
                  <li>• Automated reporting</li>
                  <li>• Compliance paperwork</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Reframe */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4">
              Task vs. Purpose
            </h2>
            <p className="text-lg text-stone-600 max-w-2xl mx-auto">
              A simple framework that changes how you think about financial advice
            </p>
          </div>

          {/* The Visual Framework */}
          <div className="relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-1 bg-stone-200"></div>

            <div className="grid md:grid-cols-2 gap-8 md:gap-16">
              {/* Task Side */}
              <div className="relative">
                <div className="bg-red-50 rounded-3xl p-8 md:p-10 border-2 border-red-100">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                      <span className="text-3xl">📋</span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-red-500 uppercase tracking-wide">What they charge for</p>
                      <h3 className="text-2xl font-bold text-stone-900">The Task</h3>
                    </div>
                  </div>
                  <p className="text-stone-700 leading-relaxed mb-6">
                    The mechanics. The spreadsheets. The button-clicking. The compliance forms. The quarterly reports that go straight to your drawer.
                  </p>
                  <div className="bg-white rounded-xl p-4">
                    <p className="text-sm text-stone-500 mb-1">Typical advisor charges</p>
                    <p className="text-2xl font-bold text-red-500">1% of AUM</p>
                    <p className="text-xs text-stone-400">($10k/year on $1M)</p>
                  </div>
                </div>
              </div>

              {/* Purpose Side */}
              <div className="relative">
                <div className="bg-brand-50 rounded-3xl p-8 md:p-10 border-2 border-brand-200">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                      <span className="text-3xl">🎯</span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-brand-600 uppercase tracking-wide">What you actually need</p>
                      <h3 className="text-2xl font-bold text-stone-900">The Purpose</h3>
                    </div>
                  </div>
                  <p className="text-stone-700 leading-relaxed mb-6">
                    Helping you retire confidently. Navigating life changes. Optimizing your entire financial picture. Giving you peace of mind.
                  </p>
                  <div className="bg-white rounded-xl p-4">
                    <p className="text-sm text-stone-500 mb-1">My flat fee</p>
                    <p className="text-2xl font-bold text-brand-600">$100/month</p>
                    <p className="text-xs text-stone-400">($1,200/year, period)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Irony Callout */}
      <section className="py-16 px-6 bg-amber-50 border-y border-amber-200">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 rounded-full text-amber-800 text-sm font-medium mb-6">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            The Ultimate Irony
          </div>
          <blockquote className="text-2xl md:text-3xl font-bold text-stone-800 leading-snug mb-6">
            &quot;Your advisor gets paid to manage your money. But your advisor is{' '}
            <span className="text-amber-700">almost never the one actually managing the money.</span>&quot;
          </blockquote>
          <p className="text-stone-600 text-lg max-w-2xl mx-auto">
            It&apos;s usually a portfolio of mutual funds, a model portfolio designed by someone else, or an algorithm. The &quot;management&quot; is a middleman fee for access to products you could buy yourself.
          </p>
        </div>
      </section>

      {/* How I'm Different */}
      <section className="py-20 px-6 bg-neutral-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-stone-900 mb-4">
              I built a practice focused on purpose, not tasks.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-stone-200">
              <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-3">No Products = No Conflicts</h3>
              <p className="text-stone-600 leading-relaxed">
                I don&apos;t sell insurance, annuities, or proprietary funds. I have nothing to sell you except my advice. Traditional advisors blur task and purpose because{' '}
                <strong>selling products IS their business model.</strong>
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-stone-200">
              <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-3">Flat Fee = Pure Incentives</h3>
              <p className="text-stone-600 leading-relaxed">
                I get paid the same whether you have $500k or $5M. My incentive is to give you the best possible advice—not to gather more assets or sell you products.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-stone-200">
              <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-3">Stay Where You Are</h3>
              <p className="text-stone-600 leading-relaxed">
                Keep your existing accounts at Fidelity, Schwab, Vanguard—wherever. I work with your custodian. No transfers, no disruption, no asset-gathering games.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-stone-200">
              <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-3">Better Tools, Better Decisions</h3>
              <p className="text-stone-600 leading-relaxed">
                You get access to institutional-grade financial planning software. Monte Carlo simulations, Roth conversion analysis, tax optimization—tools that actually help.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-6">
            Ready to work with an advisor focused on{' '}
            <span className="bg-gradient-to-r from-brand-500 to-brand-600 bg-clip-text text-transparent">
              your purpose
            </span>
            ?
          </h2>
          <p className="text-lg text-stone-600 mb-10 max-w-xl mx-auto">
            See exactly how it works—no pressure, no sales pitch, just clarity.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/how-it-works"
              className="inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold px-8 py-4 rounded-lg transition shadow-lg shadow-green-200"
            >
              See How It Works
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-stone-50 text-stone-700 font-semibold px-8 py-4 rounded-lg transition border border-stone-300"
            >
              Calculate Your Savings
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
