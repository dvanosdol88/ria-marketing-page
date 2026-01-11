import Image from "next/image";
import Link from "next/link";

export default function Upgrade3() {
  return (
    <main className="bg-neutral-50 text-neutral-900 antialiased">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 pb-16">
        {/* Header / Nav */}
        <header className="flex justify-between items-center border-b border-neutral-200 py-4">
          <Link href="/" className="font-bold flex items-center gap-2 hover:opacity-90 no-underline text-neutral-900">
            <span className="w-3 h-3 rounded-full bg-brand-600"></span>
            <span>Upgrade Your Advisor</span>
          </Link>

          <nav className="hidden sm:flex gap-4 text-sm font-semibold">
            <a className="hover:underline" href="#problem">Problem</a>
            <span className="text-neutral-300">|</span>
            <a className="hover:underline" href="#cfa">CFA®</a>
            <span className="text-neutral-300">|</span>
            <a className="hover:underline" href="#cfp">CFP®</a>
            <span className="text-neutral-300">|</span>
            <a className="hover:underline" href="#both">Both</a>
            <span className="text-neutral-300">|</span>
            <a className="hover:underline" href="#fiduciary">Fiduciary</a>
            <span className="text-neutral-300">|</span>
            <a className="hover:underline" href="#pricing">Flat fee</a>
            <span className="text-neutral-300">|</span>
            <a className="text-brand-700 hover:underline" href="#cta">Get started →</a>
          </nav>

          <a
            href="#cta"
            className="sm:hidden text-sm font-semibold text-brand-700 hover:underline"
            aria-label="Jump to get started"
          >
            Get started →
          </a>
        </header>

        {/* HERO */}
        <section id="top" className="pt-12 pb-6 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
            Upgrade Your Advisor:
            <span className="text-brand-700"> Why Top Credentials Matter</span>
          </h1>

          <p className="mt-4 text-lg sm:text-xl text-neutral-700 max-w-3xl mx-auto">
            Not all financial advisors are held to the same standard.
            This one-page story explains what the <strong className="font-extrabold">CFA®</strong> and
            <strong className="font-extrabold"> CFP®</strong> credentials actually mean for you—rigor,
            planning depth, and ethics that are more than marketing language.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center items-center">
            <a
              href="#cta"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-white font-semibold shadow-sm hover:bg-brand-700 transition-colors no-underline"
            >
              Schedule a Free Consultation →
            </a>

            <a
              href="#problem"
              className="inline-flex items-center gap-2 text-brand-700 font-semibold hover:underline"
            >
              Start the story
              <span aria-hidden="true">↓</span>
            </a>
          </div>

          <div className="mt-8 bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 sm:p-8 max-w-3xl mx-auto text-left">
            <p className="text-sm text-neutral-600">
              Quick premise: a &quot;financial advisor&quot; title can mean many things. Credentials and standards help you audit
              <strong className="font-extrabold"> how</strong> advice is produced and
              <strong className="font-extrabold"> whose interests</strong> it serves.
            </p>
          </div>
        </section>

        {/* PROBLEM CONTEXT */}
        <section id="problem" className="mt-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
                Most advisors never go beyond basic licenses.
              </h2>

              <p className="text-[17px] text-neutral-700 max-w-prose">
                Many professionals meet minimum requirements and stop there. That may be &quot;fine&quot; for product distribution.
                It&apos;s not the same as deep investment training plus comprehensive financial planning.
              </p>

              <p className="mt-4 text-[17px] text-neutral-700 max-w-prose">
                Our founder chose a higher standard—building a practice around:
                <strong className="font-extrabold"> proof</strong> (proctored exams),
                <strong className="font-extrabold"> process</strong> (repeatable planning),
                and <strong className="font-extrabold">ethical constraints</strong> (client-first duty).
              </p>

              <div className="mt-5 p-4 border border-dashed border-neutral-300 rounded-xl bg-neutral-50 text-sm text-neutral-600">
                <strong className="font-extrabold">Plain-English filter:</strong>
                If an advisor can&apos;t clearly explain (1) how they&apos;re paid, (2) what standard they&apos;re held to, and
                (3) how decisions are made when markets get ugly—assume you&apos;re the product.
              </div>
            </div>

            <aside className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
              <h3 className="text-xl font-bold mb-2">Quick glossary</h3>

              <p className="text-sm text-neutral-600">
                <span className="font-extrabold text-neutral-900">Fiduciary</span>:
                legally and ethically required to act in the client&apos;s best interest—placing the client&apos;s interests ahead
                of the advisor&apos;s own.
              </p>

              <p className="mt-3 text-sm text-neutral-600">
                <span className="font-extrabold text-neutral-900">Credentials</span>:
                not vibes. Requirements are published (exam format, education, experience, ethics, ongoing standards).
              </p>

              <p className="mt-4 text-xs text-neutral-500">
                The rest of this page shows what CFA® and CFP® mean in practice—with sources you can check.
              </p>

              <a className="mt-4 inline-flex items-center gap-2 text-brand-700 font-semibold hover:underline" href="#sources">
                Jump to sources →
              </a>
            </aside>
          </div>
        </section>

        {/* CFA SECTION */}
        <section id="cfa" className="mt-14">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
                CFA® explained in plain English
              </h2>
              <p className="text-[17px] text-neutral-700 max-w-prose">
                Think of CFA® charterholders as &quot;investment specialists&quot;: valuation, risk, portfolio construction, and ethics—
                built for investment decision-making at a high technical bar.
              </p>
            </div>

            <details className="w-full sm:w-auto">
              <summary className="cursor-pointer list-none text-brand-700 font-semibold hover:underline">
                Learn more about the CFA® →
              </summary>
              <div className="mt-3 bg-white rounded-2xl shadow-sm border border-neutral-200 p-5 max-w-xl">
                <p className="text-sm text-neutral-600">
                  CFA Institute describes the CFA Program as three exams covering investment tools, valuing assets,
                  portfolio management, and wealth planning. <sup className="text-brand-700 font-semibold"><a href="#src-cfa-program">[1]</a></sup>
                </p>
                <p className="mt-2 text-sm text-neutral-600">
                  Exam session time is approximately 4.5 hours per level (plus tutorial/breaks). <sup className="text-brand-700 font-semibold"><a href="#src-cfa-exam">[2]</a></sup>
                </p>
                <p className="mt-2 text-xs text-neutral-500">
                  Pass rates vary by level and window and are published by CFA Institute. <sup className="text-brand-700 font-semibold"><a href="#src-cfa-pass">[3]</a></sup>
                </p>
              </div>
            </details>
          </div>

          <article className="mt-8 bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 sm:p-8">
            <div className="flex gap-5 items-start">
              <div className="w-[96px] h-[96px] rounded-xl border border-neutral-200 bg-white flex items-center justify-center p-2">
                <Image
                  src="/e7e2a584-b923-4249-a863-9a49b6850ef0.png"
                  alt="CFA Institute Charterholder badge"
                  className="object-contain"
                  width={80}
                  height={80}
                />
              </div>

              <div className="flex-1">
                <h3 className="text-xl font-bold mb-1">What it signals for clients</h3>
                <p className="text-[17px] text-neutral-700 max-w-prose">
                  It&apos;s a credential with real friction: three exams, published requirements, and an ethics code.
                  CFA Institute states charterholders commit to integrity and to placing the interests of clients above
                  their own personal interests. <sup className="text-brand-700 font-semibold"><a href="#src-cfa-ethics">[4]</a></sup>
                </p>

                <div className="mt-4 p-4 border border-dashed border-neutral-300 rounded-xl bg-neutral-50 text-sm text-neutral-600">
                  <strong className="font-extrabold">Client benefit:</strong>
                  You get investment decisions grounded in disciplined analysis—especially when the market narrative gets loud.
                </div>
              </div>
            </div>
          </article>
        </section>

        {/* CFP SECTION */}
        <section id="cfp" className="mt-14">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
                CFP® explained in plain English
              </h2>
              <p className="text-[17px] text-neutral-700 max-w-prose">
                If CFA® is investment depth, CFP® is holistic planning—turning the math into a plan that fits a real life:
                retirement, tax strategy, insurance, estate, cash flow, and tradeoffs.
              </p>
            </div>

            <details className="w-full sm:w-auto">
              <summary className="cursor-pointer list-none text-brand-700 font-semibold hover:underline">
                Learn more about the CFP® →
              </summary>
              <div className="mt-3 bg-white rounded-2xl shadow-sm border border-neutral-200 p-5 max-w-xl">
                <p className="text-sm text-neutral-600">
                  CFP Board describes the CFP® exam as 170 questions in two 3-hour sessions. <sup className="text-brand-700 font-semibold"><a href="#src-cfp-format">[5]</a></sup>
                </p>
                <p className="mt-2 text-sm text-neutral-600">
                  CFP Board requires substantial experience: 6,000 hours (standard) or 4,000 hours (apprenticeship). <sup className="text-brand-700 font-semibold"><a href="#src-cfp-exp">[6]</a></sup>
                </p>
                <p className="mt-2 text-xs text-neutral-500">
                  CFP Board&apos;s standards emphasize a fiduciary duty when providing financial advice. <sup className="text-brand-700 font-semibold"><a href="#src-cfp-standards">[7]</a></sup>
                </p>
              </div>
            </details>
          </div>

          <article className="mt-8 bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 sm:p-8">
            <div className="flex gap-5 items-start">
              <div className="w-[96px] h-[96px] rounded-xl border border-neutral-200 bg-white flex items-center justify-center p-2">
                <Image
                  src="/CFP_Logomark_Primary.png"
                  alt="CFP certification mark"
                  className="object-contain"
                  width={80}
                  height={80}
                />
              </div>

              <div className="flex-1">
                <h3 className="text-xl font-bold mb-1">What it signals for clients</h3>
                <p className="text-[17px] text-neutral-700 max-w-prose">
                  CFP® is about building comprehensive plans—and doing it under a published ethical framework.
                  CFP Board has reported the CFP® professional population surpassing 103,000 in 2024.
                  <sup className="text-brand-700 font-semibold"><a href="#src-cfp-pop">[8]</a></sup>
                </p>

                <div className="mt-4 p-4 border border-dashed border-neutral-300 rounded-xl bg-neutral-50 text-sm text-neutral-600">
                  <strong className="font-extrabold">Client benefit:</strong>
                  You get planning that ties your investments to your life—so the portfolio supports the plan, not the other way around.
                </div>
              </div>
            </div>
          </article>
        </section>

        {/* BOTH WORLDS */}
        <section id="both" className="mt-14">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
            CFA® + CFP® = a higher standard of advice
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="text-[17px] text-neutral-700 max-w-prose">
              <p>
                Alone, each credential is valuable. Together, they cover the two hardest parts of advice:
                <strong className="font-extrabold"> investment decisions under uncertainty</strong>
                and <strong className="font-extrabold">planning that survives real life</strong>.
              </p>

              <ul className="mt-4 list-disc pl-6 text-neutral-700 space-y-2">
                <li>Portfolio design with a repeatable process (not hot takes).</li>
                <li>Tradeoffs made explicit (so you can decide confidently).</li>
                <li>A plan that integrates retirement, tax, insurance, and estate considerations.</li>
                <li>Ethics and client-first duties that constrain behavior when incentives tempt shortcuts.</li>
              </ul>
            </div>

            <aside className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
              <h3 className="text-xl font-bold mb-2">Proof without bragging: a simple timeline</h3>
              <p className="text-sm text-neutral-600 mb-4">
                A timeline of dedication and standards achieved.
              </p>

              <div className="p-4 border border-dashed border-neutral-300 rounded-xl bg-neutral-50 text-sm text-neutral-700">
                <ul className="space-y-2">
                  <li><strong className="font-extrabold">Year 1:</strong> CFA® Level I</li>
                  <li><strong className="font-extrabold">Year 2:</strong> CFA® Level II</li>
                  <li><strong className="font-extrabold">Year 3:</strong> Earned CFA® charter</li>
                  <li><strong className="font-extrabold">Year 4:</strong> Earned CFP® certification</li>
                </ul>
              </div>
            </aside>
          </div>
        </section>

        {/* FIDUCIARY */}
        <section id="fiduciary" className="mt-14">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_420px] gap-8 items-start">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
                Fiduciary + ethics: where trust becomes enforceable
              </h2>

              <p className="text-[17px] text-neutral-700 max-w-prose">
                &quot;Trust me&quot; is not a standard. A fiduciary standard is a constraint—an obligation—especially when markets are stressful
                and incentives are noisy.
              </p>

              <p className="mt-4 text-[17px] text-neutral-700 max-w-prose">
                The SEC has stated that an investment adviser is a fiduciary and must act in the best interests of clients.
                <sup className="text-brand-700 font-semibold"><a href="#src-sec">[9]</a></sup>
                CFP Board&apos;s standards also describe a fiduciary duty when providing financial advice.
                <sup className="text-brand-700 font-semibold"><a href="#src-cfp-standards">[7]</a></sup>
              </p>

              <div className="mt-5 p-4 border border-dashed border-neutral-300 rounded-xl bg-neutral-50 text-sm text-neutral-600">
                <strong className="font-extrabold">Practical takeaway:</strong>
                Ask two questions: &quot;How are you paid?&quot; and &quot;What standard are you held to?&quot;
                Credentials help. Transparent incentives help more.
              </div>
            </div>

            <aside className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
              <h3 className="text-xl font-bold mb-2">A simple quote that says it cleanly</h3>
              <p className="text-sm text-neutral-600">John C. Bogle on the point of fiduciary duty:</p>

              <div className="mt-4 border-l-4 border-brand-600 pl-4">
                <p className="text-[15px] text-neutral-800">
                  &quot;Investors need… assurance that their broker is putting their interests first, rather than… his own…
                  And that&apos;s what a fiduciary is and does.&quot;
                  <sup className="text-brand-700 font-semibold"><a href="#src-bogle">[10]</a></sup>
                </p>
                <p className="mt-2 text-xs text-neutral-500">— John C. Bogle</p>
              </div>
            </aside>
          </div>
        </section>

        {/* PRICING / FLAT FEE */}
        <section id="pricing" className="mt-14">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
            The flat-fee advantage: reduce fee drag, reduce conflicts
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="text-[17px] text-neutral-700 max-w-prose">
              <p>
                AUM fees can be deceptively expensive over time. A flat fee can be simpler, more predictable, and less tied to portfolio size.
              </p>
              <p className="mt-4">
                Use our calculator to see how the math plays out:
                the numbers are transparent, shareable, and hard to ignore.
              </p>

              <Link
                href="/#calculator"
                className="mt-4 inline-flex items-center gap-2 text-brand-700 font-semibold hover:underline no-underline"
              >
                Open the fee calculator →
              </Link>

              <div className="mt-5 p-4 border border-dashed border-neutral-300 rounded-xl bg-neutral-50 text-sm text-neutral-600">
                <strong className="font-extrabold">Key insight:</strong>
                &quot;No 1% AUM fees here. Over time, that difference can be worth hundreds of thousands.&quot;
              </div>
            </div>

            <aside className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
              <h3 className="text-xl font-bold mb-2">What you&apos;re buying (when it&apos;s done right)</h3>
              <ul className="mt-3 list-disc pl-6 text-sm text-neutral-700 space-y-2">
                <li><strong className="font-extrabold">Decision quality:</strong> clear tradeoffs and repeatable process</li>
                <li><strong className="font-extrabold">Planning depth:</strong> not just portfolio performance</li>
                <li><strong className="font-extrabold">Accountability:</strong> written standards, disclosed incentives</li>
              </ul>

              <p className="mt-4 text-xs text-neutral-500">
                This page is educational and does not constitute investment, legal, or tax advice.
              </p>
            </aside>
          </div>
        </section>

        {/* CTA */}
        <section id="cta" className="mt-14">
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 sm:p-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
              Ready for an upgrade?
            </h2>

            <p className="text-[17px] text-neutral-700 max-w-prose">
              Work with the advisor who chose the harder road to serve you better—combining investment rigor, comprehensive planning,
              and a client-first ethic.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <a
                href="https://calendly.com"
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-white font-semibold shadow-sm hover:bg-brand-700 transition-colors no-underline"
              >
                Schedule a Free Consultation →
              </a>

              <a href="#sources" className="inline-flex items-center gap-2 text-brand-700 font-semibold hover:underline">
                Review sources →
              </a>
            </div>
          </div>
        </section>

        {/* SOURCES */}
        <section id="sources" className="mt-14">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
            Sources (the &quot;don&apos;t take our word for it&quot; section)
          </h2>

          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 sm:p-8">
            <ol className="list-decimal pl-6 space-y-3 text-sm text-neutral-700">
              <li id="src-cfa-program">
                CFA Institute — CFA Program overview (&quot;Join more than 200,000…&quot;).<br />
                <a className="text-brand-700 hover:underline" href="https://www.cfainstitute.org/programs/cfa-program" target="_blank" rel="noopener">
                  https://www.cfainstitute.org/programs/cfa-program
                </a>
              </li>

              <li id="src-cfa-exam">
                CFA Institute — CFA Program exam (exam session time details).<br />
                <a className="text-brand-700 hover:underline" href="https://www.cfainstitute.org/programs/cfa-program/exam" target="_blank" rel="noopener">
                  https://www.cfainstitute.org/programs/cfa-program/exam
                </a>
              </li>

              <li id="src-cfa-pass">
                CFA Institute — Exam results / pass rates (published by level and window).<br />
                <a className="text-brand-700 hover:underline" href="https://www.cfainstitute.org/programs/cfa-program/candidate-resources/exam-results" target="_blank" rel="noopener">
                  https://www.cfainstitute.org/programs/cfa-program/candidate-resources/exam-results
                </a>
              </li>

              <li id="src-cfa-ethics">
                CFA Institute — Code of Ethics &amp; Standards of Professional Conduct (PDF).<br />
                <a
                  className="text-brand-700 hover:underline"
                  href="https://www.cfainstitute.org/sites/default/files/-/media/documents/code/code-ethics-standards/code-of-ethics-standards-professional-conduct.pdf"
                  target="_blank"
                  rel="noopener"
                >
                  CFA Institute Code &amp; Standards (PDF)
                </a>
              </li>

              <li id="src-cfp-format">
                CFP Board — CFP® exam format (170 questions; two 3-hour sessions).<br />
                <a className="text-brand-700 hover:underline" href="https://www.cfp.net/certification-process/exam-requirement/about-the-cfp-exam/exam-format" target="_blank" rel="noopener">
                  https://www.cfp.net/.../exam-format
                </a>
              </li>

              <li id="src-cfp-exp">
                CFP Board — Experience requirement (6,000 hours / 4,000 apprenticeship).<br />
                <a className="text-brand-700 hover:underline" href="https://www.cfp.net/certification-process/experience-requirement" target="_blank" rel="noopener">
                  https://www.cfp.net/.../experience-requirement
                </a>
              </li>

              <li id="src-cfp-standards">
                CFP Board — Roadmap to the Code &amp; Standards (fiduciary duty language, PDF).<br />
                <a
                  className="text-brand-700 hover:underline"
                  href="https://www.cfp.net/-/media/files/cfp-board/standards-and-ethics/roadmap-to-code-and-standards.pdf"
                  target="_blank"
                  rel="noopener"
                >
                  CFP Board Roadmap (PDF)
                </a>
              </li>

              <li id="src-cfp-pop">
                CFP Board — CFP® population surpassing 103,000 in 2024 (CFP Board news page).<br />
                <a
                  className="text-brand-700 hover:underline"
                  href="https://www.cfp.net/news/2025/04/investmentnews-honors-top-financial-planners-across-the-us"
                  target="_blank"
                  rel="noopener"
                >
                  CFP Board news reference
                </a>
              </li>

              <li id="src-sec">
                U.S. SEC — &quot;Commission Interpretation Regarding Standard of Conduct for Investment Advisers&quot; (PDF).<br />
                <a className="text-brand-700 hover:underline" href="https://www.sec.gov/files/rules/interp/2019/ia-5248.pdf" target="_blank" rel="noopener">
                  https://www.sec.gov/.../ia-5248.pdf
                </a>
              </li>

              <li id="src-bogle">
                MarketWatch (2016) — John C. Bogle quote on fiduciary assurance.<br />
                <a className="text-brand-700 hover:underline" href="https://www.marketwatch.com/story/finally-john-bogles-dream-of-a-fiduciary-standard-will-come-true-2016-03-31" target="_blank" rel="noopener">
                  MarketWatch article
                </a>
              </li>
            </ol>

            <div className="mt-8 p-4 border border-dashed border-neutral-300 rounded-xl bg-neutral-50 text-xs text-neutral-600">
              <strong className="font-extrabold">Trademark notes:</strong><br />
              CFP® is a certification mark owned by Certified Financial Planner Board of Standards, Inc. (CFP Board) in the United States and is used by individuals who meet CFP Board&apos;s certification requirements.<br /><br />
              CFA® and Chartered Financial Analyst® are trademarks owned by CFA Institute. CFA Institute does not endorse, promote, or warrant the accuracy or quality of this site or the services described.
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-14 pt-6 border-t border-neutral-200 text-xs text-neutral-500">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div>Advisory services are for illustrative purposes only. Projections are hypothetical and not a guarantee of future returns.</div>
            <div className="flex gap-3 font-semibold">
              <a className="hover:underline no-underline text-neutral-500" href="/disclosures">Disclosures</a>
              <span className="text-neutral-300">|</span>
              <a className="hover:underline no-underline text-neutral-500" href="/adv">ADV</a>
              <span className="text-neutral-300">|</span>
              <a className="hover:underline no-underline text-neutral-500" href="/privacy">Privacy</a>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
