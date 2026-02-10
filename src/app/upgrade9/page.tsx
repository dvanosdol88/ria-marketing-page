'use client';

import Link from 'next/link';

export default function Upgrade9() {
  return (
    <main className="font-sans bg-neutral-50 text-stone-800">
      {/* Hero Section: The Question */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-brand-500 font-semibold text-sm uppercase tracking-wide mb-4">
            A Different Kind of Advisor
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-stone-900 leading-tight mb-6">
            What&apos;s my job?<br />
            <span className="text-stone-500">Really.</span>
          </h1>
          <p className="text-xl text-stone-600 max-w-2xl mx-auto">
            Most advisors would say &quot;managing your money.&quot; But here&apos;s the uncomfortable truth...
          </p>
        </div>
      </section>

      {/* The Revelation Section */}
      <section className="py-16 px-6 bg-neutral-50">
        <div className="max-w-4xl mx-auto">
          {/* The Irony Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8 md:p-12 mb-12">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-stone-900 mb-2">The Dirty Secret</h2>
                <p className="text-stone-600 text-lg leading-relaxed">
                  Traditional advisors get paid to &quot;manage your assets.&quot; But here&apos;s the irony:
                </p>
              </div>
            </div>

            <blockquote className="border-l-4 border-red-400 pl-6 py-4 bg-stone-50 rounded-r-lg mb-6">
              <p className="text-xl md:text-2xl font-semibold text-stone-800 leading-relaxed">
                The advisor is{' '}
                <span className="bg-gradient-to-r from-yellow-200 to-yellow-100 px-1">
                  almost never the person actually managing the money.
                </span>
              </p>
            </blockquote>

            <p className="text-stone-600 text-lg leading-relaxed">
              It&apos;s usually a portfolio of mutual funds, a model portfolio, or an algorithm. Your advisor picks from a menu, clicks a button, and collects a percentage of your entire net worth—every single year—for what amounts to a <strong>task</strong>.
            </p>
          </div>

          {/* Task vs Purpose Visual */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Task Column */}
            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-bl-full -mr-10 -mt-10"></div>
              <div className="relative">
                <span className="inline-block px-3 py-1 bg-red-100 text-red-600 text-xs font-semibold rounded-full mb-4">
                  THE TASK
                </span>
                <h3 className="text-xl font-bold text-stone-900 mb-4">What They Get Paid For</h3>
                <ul className="space-y-3 text-stone-600">
                  {[
                    'Clicking "rebalance" once a quarter',
                    'Selecting from a pre-approved product menu',
                    'Paperwork and account transfers',
                    'Generating quarterly performance reports',
                    'Compliance checkboxes',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 pt-6 border-t border-stone-100">
                  <p className="text-sm text-stone-500">
                    Typical cost: <span className="font-semibold text-red-500">1% of your assets, every year</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Purpose Column */}
            <div className="bg-white rounded-2xl shadow-sm border-2 border-brand-500 p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-bl-full -mr-10 -mt-10"></div>
              <div className="relative">
                <span className="inline-block px-3 py-1 bg-brand-100 text-brand-600 text-xs font-semibold rounded-full mb-4">
                  THE PURPOSE
                </span>
                <h3 className="text-xl font-bold text-stone-900 mb-4">What I Actually Do</h3>
                <ul className="space-y-3 text-stone-600">
                  {[
                    'Help you retire with confidence',
                    'Navigate major life transitions',
                    'Optimize taxes across your entire financial picture',
                    "Make sure you don't run out of money",
                    'Help you sleep at night',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-brand-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 pt-6 border-t border-brand-100">
                  <p className="text-sm text-stone-500">
                    My cost: <span className="font-semibold text-brand-600">$100/month flat fee</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Huang Framework Section */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-stone-900 mb-4">Task vs. Purpose</h2>
            <p className="text-lg text-stone-600 max-w-2xl mx-auto">
              A framework for understanding what you&apos;re actually paying for.
            </p>
          </div>

          <div className="bg-gradient-to-br from-stone-50 to-stone-100 rounded-2xl p-8 md:p-12 border border-stone-200">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-stone-600 text-lg leading-relaxed mb-6">
                  When you pay an advisor 1% of your assets, you&apos;re paying them to perform <em>tasks</em>—spreadsheets, paperwork, compliance boxes.
                </p>
                <p className="text-stone-600 text-lg leading-relaxed mb-6">
                  But their <strong>purpose</strong>—the reason you hired them—is to help you achieve your goals. To give you clarity. To be your guide.
                </p>
                <p className="text-stone-800 text-lg leading-relaxed font-medium">
                  Traditional fee structures blur this distinction. My flat-fee model doesn&apos;t.
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-200">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg bg-red-100 flex items-center justify-center">
                      <span className="text-2xl">📋</span>
                    </div>
                    <div>
                      <p className="font-semibold text-stone-900">Tasks</p>
                      <p className="text-sm text-stone-500">The mechanics, the busywork</p>
                    </div>
                  </div>
                  <div className="h-px bg-stone-200"></div>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg bg-brand-100 flex items-center justify-center">
                      <span className="text-2xl">🎯</span>
                    </div>
                    <div>
                      <p className="font-semibold text-stone-900">Purpose</p>
                      <p className="text-sm text-stone-500">Your goals, your future, your peace of mind</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Commitment Section */}
      <section className="py-16 px-6 bg-neutral-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">My Commitment</h2>
          <p className="text-xl text-stone-600 max-w-2xl mx-auto mb-8">
            I don&apos;t get paid to manage a portfolio. I get paid to help you succeed financially. That&apos;s not a marketing line—it&apos;s how my fee structure actually works.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-200">
              <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-stone-900 mb-2">No Products to Sell</h3>
              <p className="text-sm text-stone-600">I don&apos;t earn commissions. Ever. My only incentive is your success.</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-200">
              <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-semibold text-stone-900 mb-2">No Conflicts</h3>
              <p className="text-sm text-stone-600">Flat fee means I give you my best advice, not the advice that maximizes my revenue.</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-200">
              <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-stone-900 mb-2">Stay Where You Are</h3>
              <p className="text-sm text-stone-600">Keep your existing accounts. I work with your custodian, not against them.</p>
            </div>
          </div>

          <Link
            href="/how-it-works"
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold px-8 py-4 rounded-lg transition shadow-lg shadow-green-200"
          >
            See How It Works
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>
    </main>
  );
}
