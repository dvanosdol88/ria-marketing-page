import Image from "next/image";
import Link from "next/link";

export default function Upgrade2() {
  return (
    <main className="flex flex-col">
      {/* Navigation */}
      <nav className="section-shell flex justify-between items-center py-6 border-b border-stone-200">
        <Link href="/" className="text-lg font-semibold text-stone-800 no-underline hover:text-stone-600">
          YouArePayingTooMuch.com
        </Link>
        <div className="flex gap-6 text-sm text-stone-600">
          <Link href="/" className="no-underline hover:text-stone-900">Home</Link>
          <Link href="/upgrade2" className="no-underline hover:text-stone-900 font-medium text-stone-900">Upgrade</Link>
          <Link href="/#calculator" className="no-underline hover:text-stone-900">Calculator</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="section-shell py-16 md:py-24">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-stone-900 leading-tight mb-6">
              I left a good firm because I couldn&apos;t give you my best advice.
            </h1>
            <p className="text-lg text-stone-600 leading-relaxed">
              A fiduciary is legally and ethically bound to put your interests first—always. 
              But I learned that credentials alone don&apos;t guarantee unconflicted advice. 
              The business model matters more.
            </p>
          </div>
          <div className="flex-shrink-0">
            <Image
              src="/DVO Head Shot picture.jpg"
              alt="Advisor headshot"
              width={280}
              height={280}
              className="rounded-2xl shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* The Confession */}
      <section className="bg-stone-100 py-16 md:py-20">
        <div className="section-shell">
          <h2 className="text-2xl md:text-3xl font-bold text-stone-900 mb-8">
            The Problem I Couldn&apos;t Ignore
          </h2>
          <div className="max-w-3xl space-y-6 text-stone-700 leading-relaxed">
            <p>
              At my former firm, despite high ethical standards and good intentions, 
              I was limited to offering three things:
            </p>
            <ul className="space-y-3 pl-6">
              <li className="flex items-start gap-3">
                <span className="text-stone-400 mt-1">→</span>
                <span>A diversified portfolio of mutual funds <span className="text-stone-500">(with the standard 1% fee)</span></span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-stone-400 mt-1">→</span>
                <span>A handful of Separately Managed Accounts</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-stone-400 mt-1">→</span>
                <span>A fixed or variable annuity</span>
              </li>
            </ul>
            <p>
              That&apos;s it. Cookie-cutter. I have a CFA® charter. I have a CFP® certification. 
              And I was handing everyone the same playbook.
            </p>
            <p className="text-stone-900 font-medium">
              I wasn&apos;t doing anything differentiated. I started to feel like I was breaking 
              my own fiduciary promise—not because of bad intentions, but because of a 
              limited scope.
            </p>
          </div>
        </div>
      </section>

      {/* The Solution - Comparison */}
      <section className="section-shell py-16 md:py-20">
        <h2 className="text-2xl md:text-3xl font-bold text-stone-900 mb-4">
          The Model That Fixes It
        </h2>
        <p className="text-stone-600 mb-10 max-w-2xl">
          Two structural changes eliminate the conflicts entirely.
        </p>
        
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
          {/* Traditional Model */}
          <div className="bg-stone-100 rounded-xl p-8 border border-stone-200">
            <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wide mb-6">
              Traditional Model
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="text-red-400 text-lg">✗</span>
                <span className="text-stone-700">Products to sell</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 text-lg">✗</span>
                <span className="text-stone-700">Must transfer your assets</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 text-lg">✗</span>
                <span className="text-stone-700">Fee grows with your portfolio</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 text-lg">✗</span>
                <span className="text-stone-700">Same playbook for everyone</span>
              </li>
            </ul>
          </div>

          {/* My Model */}
          <div className="bg-emerald-50 rounded-xl p-8 border-2 border-emerald-200">
            <h3 className="text-sm font-semibold text-emerald-700 uppercase tracking-wide mb-6">
              My Model
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="text-emerald-500 text-lg">✓</span>
                <span className="text-stone-800 font-medium">No products. Advice only.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-500 text-lg">✓</span>
                <span className="text-stone-800 font-medium">Stay with your current custodian.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-500 text-lg">✓</span>
                <span className="text-stone-800 font-medium">Flat $100/month. Your growth is yours.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-500 text-lg">✓</span>
                <span className="text-stone-800 font-medium">Tailored strategy using top models.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* The Proof - Credentials */}
      <section className="bg-stone-900 text-white py-16 md:py-20">
        <div className="section-shell">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            The Credentials Behind the Promise
          </h2>
          <p className="text-stone-400 mb-12 max-w-2xl">
            The model removes the conflicts. The credentials prove I can deliver.
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl">
            {/* CFA Card */}
            <div className="bg-stone-800 rounded-xl p-8 border border-stone-700">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    CFA® Charterholder
                  </h3>
                  <p className="text-stone-400 text-sm">
                    Chartered Financial Analyst
                  </p>
                </div>
                <Image
                  src="/e7e2a584-b923-4249-a863-9a49b6850ef0.png"
                  alt="CFA Institute badge"
                  width={64}
                  height={64}
                  className="rounded"
                />
              </div>
              <p className="text-stone-300 text-sm leading-relaxed mb-6">
                The global standard for investment analysis and portfolio management. 
                Bound by a Code of Ethics I reaffirm annually—ensuring integrity even 
                in ambiguous situations.
              </p>
              <div className="flex gap-4 text-sm">
                <a 
                  href="https://www.cfainstitute.org/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-stone-400 hover:text-white no-underline"
                >
                  CFA Institute →
                </a>
                <a 
                  href="https://www.credential.net/be078a01-60c0-461a-b1fc-a78549bd0959" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 no-underline"
                >
                  Verify Credential →
                </a>
              </div>
            </div>

            {/* CFP Card */}
            <div className="bg-stone-800 rounded-xl p-8 border border-stone-700">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    CFP® Professional
                  </h3>
                  <p className="text-stone-400 text-sm">
                    Certified Financial Planner
                  </p>
                </div>
                <Image
                  src="/CFP_Logomark_Primary.png"
                  alt="CFP Board badge"
                  width={64}
                  height={64}
                  className="rounded"
                />
              </div>
              <p className="text-stone-300 text-sm leading-relaxed mb-6">
                The standard of excellence for comprehensive financial planning. 
                Rigorous training in retirement, tax, and estate strategies—designed 
                to protect your family for generations.
              </p>
              <div className="flex gap-4 text-sm">
                <a 
                  href="https://www.cfp.net/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-stone-400 hover:text-white no-underline"
                >
                  CFP Board →
                </a>
                <a 
                  href="https://certificates.cfp.net/611409ef-0a61-48c8-aed5-625120778436#acc.BkFE1LGJ" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 no-underline"
                >
                  Verify Credential →
                </a>
              </div>
            </div>
          </div>

          <p className="text-stone-500 text-xs mt-8 max-w-2xl">
            CFA Institute and CFP Board are not affiliated with this site. 
            All marks are the property of their respective owners.
          </p>
        </div>
      </section>

      {/* What This Looks Like */}
      <section className="section-shell py-16 md:py-20">
        <h2 className="text-2xl md:text-3xl font-bold text-stone-900 mb-4">
          What This Looks Like in Practice
        </h2>
        <p className="text-stone-600 mb-10 max-w-2xl">
          Unconflicted advice means I can say things most advisors can&apos;t.
        </p>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl">
          <div className="bg-white border border-stone-200 rounded-xl p-6">
            <div className="text-3xl mb-4">🚫</div>
            <p className="text-stone-800 font-medium">
              &quot;You don&apos;t need that product.&quot;
            </p>
            <p className="text-stone-500 text-sm mt-2">
              I don&apos;t earn a dime from what you buy—so I&apos;ll tell you when something isn&apos;t worth it.
            </p>
          </div>

          <div className="bg-white border border-stone-200 rounded-xl p-6">
            <div className="text-3xl mb-4">📍</div>
            <p className="text-stone-800 font-medium">
              &quot;Stay where you are.&quot;
            </p>
            <p className="text-stone-500 text-sm mt-2">
              Keep your custodian, your accounts, your broker. I&apos;ll work with what you have.
            </p>
          </div>

          <div className="bg-white border border-stone-200 rounded-xl p-6">
            <div className="text-3xl mb-4">💬</div>
            <p className="text-stone-800 font-medium">
              &quot;Here&apos;s the honest answer.&quot;
            </p>
            <p className="text-stone-500 text-sm mt-2">
              No sales pitch. No upsell. Just the answer to your question.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-stone-100 py-16 md:py-20">
        <div className="section-shell text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-stone-900 mb-4">
            Ready to see how it works?
          </h2>
          <p className="text-stone-600 mb-8 max-w-xl mx-auto">
            See how we take your existing portfolio and build a tailored, 
            low-cost strategy—without moving your accounts.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/how-it-works"
              className="inline-flex items-center gap-2 bg-stone-900 text-white px-8 py-4 rounded-lg font-medium hover:bg-stone-800 transition-colors no-underline"
            >
              See How It Works
              <span>→</span>
            </Link>
          </div>

          <div className="flex gap-6 justify-center mt-8 text-sm">
            <Link
              href={"/#calculator" as never}
              className="text-stone-500 hover:text-stone-700 no-underline"
            >
              Try the Fee Calculator →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="section-shell border-t border-stone-300 py-8 text-sm text-stone-500">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
          <p className="max-w-2xl">
            Advisory services are for illustrative purposes only. Chart projections 
            are hypothetical and not a guarantee of future returns.
          </p>
          <div className="flex gap-6 text-stone-500">
            <a href="#" className="hover:text-stone-700 no-underline">Disclosures</a>
            <a href="#" className="hover:text-stone-700 no-underline">ADV</a>
            <a href="#" className="hover:text-stone-700 no-underline">Privacy</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
