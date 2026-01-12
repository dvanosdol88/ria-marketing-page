
import React from 'react';
import Head from 'next/head';

export default function Upgrade8() {
  return (
    <>
      <Head>
        <title>Upgrade: Fiduciary + CFA + CFP®</title>
        <meta
          name="description"
          content="What fiduciary really means—and why CFA + CFP® credentials matter. A higher standard of advice without the fee drag."
        />
        {/* FAQ structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "Is a fiduciary always fee-only?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "No. “Fiduciary” is a standard of care (acting in the client’s best interest). Advisors can be fiduciaries under different fee models. The key is transparency and managing conflicts of interest."
                  }
                },
                {
                  "@type": "Question",
                  "name": "What’s the difference between CFA and CFP®?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "CFA is investment-analysis and portfolio-management rigor (hard skills). CFP® is comprehensive financial planning and client-centered process (planning and communication)."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How do I verify these credentials?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Use the official directories: CFA Institute’s member directory for CFA charterholders, and CFP Board’s verification tool for CFP® certification status and background."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Does a flat fee guarantee better performance?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "No. A flat fee doesn’t guarantee returns. It simply removes the percentage-based fee drag and can reduce incentive conflicts tied to asset gathering."
                  }
                }
              ]
            })
          }}
        />
      </Head>
      <div className="bg-[#0b0d12] text-white min-h-screen font-sans leading-relaxed">
        <style jsx global>{`
          :root {
            --maxw: 1040px;
            --pad: 24px;
            --muted: rgba(255,255,255,.72);
            --muted2: rgba(255,255,255,.55);
            --card: rgba(255,255,255,.06);
            --card2: rgba(255,255,255,.09);
            --border: rgba(255,255,255,.12);
          }
          /* Additional global overrides if needed */
          details > summary {
            list-style: none;
          }
          details > summary::-webkit-details-marker {
            display: none;
          }
        `}</style>

        <main>
          {/* HERO */}
          <header className="py-14 border-b border-[rgba(255,255,255,.12)]">
            <div className="max-w-[1040px] mx-auto px-6">
              <div className="text-[rgba(255,255,255,.55)] text-sm tracking-[.08em] uppercase">Learn Way More: Upgrade</div>
              <h1 className="my-2.5 text-[clamp(34px,4vw,52px)] leading-[1.05]">Fiduciary</h1>
              <p className="mt-2.5 text-[rgba(255,255,255,.72)] max-w-[70ch] text-lg">
                “Fiduciary” isn’t a vibe. It’s an operating constraint—written down by multiple standards bodies—and it changes how advice should be delivered.
              </p>
              <div className="mt-2.5 text-[rgba(255,255,255,.55)] text-sm">fi·du·ci·ar·y · /fəˈdo͞oSHēˌerē/</div>

              <div className="flex flex-wrap gap-2.5 mt-4.5">
                {[
                  { href: "#fiduciary", label: "Fiduciary" },
                  { href: "#cfa", label: "CFA® (Rigor)" },
                  { href: "#cfp", label: "CFP® (Process)" },
                  { href: "#fees", label: "Incentives & Fees" },
                  { href: "#faq", label: "FAQ" }
                ].map((link) => (
                  <a key={link.href} href={link.href} className="inline-flex items-center gap-2 border border-[rgba(255,255,255,.12)] bg-[rgba(255,255,255,.03)] px-3 py-2.5 rounded-full text-sm text-white no-underline hover:bg-[rgba(255,255,255,.06)]">
                    {link.label}
                  </a>
                ))}
              </div>

              <div className="mt-4.5 flex flex-wrap gap-3 items-center">
                <a href="/start" className="inline-flex items-center gap-2.5 border border-[rgba(255,255,255,.12)] bg-white text-[#0b0d12] px-3.5 py-3 rounded-xl font-bold no-underline hover:opacity-90">
                  Start the Upgrade <span aria-hidden="true">→</span>
                </a>
                <a href="/#calculator" className="inline-flex items-center gap-2.5 border border-[rgba(255,255,255,.12)] bg-transparent text-white px-3.5 py-3 rounded-xl font-bold no-underline hover:bg-[rgba(255,255,255,.06)]">
                  See your “fee drag” number
                </a>
              </div>

              <p className="mt-3.5 text-[rgba(255,255,255,.55)] text-xs">
                Educational content only. Not investment, tax, or legal advice. Investing involves risk, including loss of principal.
              </p>
            </div>
          </header>

          {/* FIDUCIARY */}
          <section id="fiduciary" className="py-8">
            <div className="max-w-[1040px] mx-auto px-6">
              <h2 className="text-2xl mb-2.5">Fiduciary means “client first.” In writing.</h2>
              <p className="mb-4.5 text-[rgba(255,255,255,.72)] max-w-[76ch] text-[17px]">
                A fiduciary is required to act in your best interest—especially when conflicts of interest exist.
                On this site, the word “fiduciary” comes with receipts.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-4">
                <div>
                  <div className="bg-[rgba(255,255,255,.06)] border border-[rgba(255,255,255,.12)] rounded-[18px] p-4.5">
                    <h3 className="mb-2.5 text-base tracking-wide font-bold">Here’s the difference</h3>
                    <p className="mb-0 text-[rgba(255,255,255,.72)]">
                      Many advisors market trust. This page documents constraints: the standards David is held to,
                      the ethics he’s bound by, and the process you should expect.
                    </p>

                    <ul className="mt-3.5 pl-4.5 text-[rgba(255,255,255,.72)] list-disc">
                      <li className="my-2"><strong>Conflicts</strong> get disclosed and managed, not buried in fine print.</li>
                      <li className="my-2"><strong>Advice</strong> should be defensible and documented—not improvised.</li>
                      <li className="my-2"><strong>Planning</strong> should support real-life decisions, not just a portfolio.</li>
                    </ul>
                  </div>

                  <div className="mt-3.5 space-y-2.5">
                    <details className="border border-[rgba(255,255,255,.12)] bg-[rgba(255,255,255,.03)] rounded-[14px] p-3">
                      <summary className="cursor-pointer font-bold">CFP® Board: Fiduciary duty (short excerpt)</summary>
                      <div className="pt-2.5 text-[rgba(255,255,255,.72)]">
                        <blockquote className="my-3 py-2.5 px-3 border-l-3 border-[rgba(255,255,255,.25)] bg-[rgba(255,255,255,.04)] rounded-[10px] text-[rgba(255,255,255,.86)]">
                          “A CFP® professional must act as a fiduciary and act in the client’s best interests.”
                          <div className="mt-1.5 text-[13px] text-[rgba(255,255,255,.55)]">— CFP Board Standards (excerpt)</div>
                        </blockquote>
                        <ul className="pl-4.5 list-disc">
                          <li className="my-2"><strong>Loyalty:</strong> your interests come before the advisor’s.</li>
                          <li className="my-2"><strong>Care:</strong> skill, prudence, and diligence—especially when it’s complex.</li>
                        </ul>
                        <p className="mt-3.5 text-[rgba(255,255,255,.55)] text-xs">
                          Tip: Always ask, “How are conflicts identified, disclosed, and reduced?”
                        </p>
                      </div>
                    </details>

                    <details className="border border-[rgba(255,255,255,.12)] bg-[rgba(255,255,255,.03)] rounded-[14px] p-3">
                      <summary className="cursor-pointer font-bold">CFA Institute: Client-first + independent judgment (short excerpt)</summary>
                      <div className="pt-2.5 text-[rgba(255,255,255,.72)]">
                        <blockquote className="my-3 py-2.5 px-3 border-l-3 border-[rgba(255,255,255,.25)] bg-[rgba(255,255,255,.04)] rounded-[10px] text-[rgba(255,255,255,.86)]">
                          “Place the integrity of the profession and clients’ interests above your own.”
                          <div className="mt-1.5 text-[13px] text-[rgba(255,255,255,.55)]">— CFA Institute Code & Standards (excerpt)</div>
                        </blockquote>
                        <ul className="pl-4.5 list-disc">
                          <li className="my-2"><strong>Integrity:</strong> no cute loopholes.</li>
                          <li className="my-2"><strong>Independence:</strong> professional judgment isn’t for sale.</li>
                          <li className="my-2"><strong>Diligence:</strong> do the work; document the tradeoffs.</li>
                        </ul>
                      </div>
                    </details>

                    <details className="border border-[rgba(255,255,255,.12)] bg-[rgba(255,255,255,.03)] rounded-[14px] p-3">
                      <summary className="cursor-pointer font-bold">What “loyalty, prudence, and care” means (plain English)</summary>
                      <div className="pt-2.5 text-[rgba(255,255,255,.72)]">
                        <ul className="pl-4.5 list-disc">
                          <li className="my-2"><strong>Loyalty:</strong> recommendations are for your benefit, not the advisor’s revenue model.</li>
                          <li className="my-2"><strong>Prudence:</strong> disciplined decisions under uncertainty (not hot takes).</li>
                          <li className="my-2"><strong>Care:</strong> research-backed, explainable advice you can defend to your future self.</li>
                        </ul>
                      </div>
                    </details>
                  </div>
                </div>

                <aside>
                  <div className="bg-[rgba(255,255,255,.06)] border border-[rgba(255,255,255,.12)] rounded-[18px] p-4.5">
                    <h3 className="mb-2.5 text-base tracking-wide font-bold">Verify credentials</h3>
                    <p className="mb-0 text-[rgba(255,255,255,.72)]">
                      Don’t take anyone’s word for it. Use official directories.
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2.5" role="list">
                      <a role="listitem" href="https://directory.cfainstitute.org/" target="_blank" rel="noopener noreferrer" className="text-sm no-underline border border-[rgba(255,255,255,.12)] px-3 py-2.5 rounded-xl bg-[rgba(255,255,255,.03)] hover:bg-[rgba(255,255,255,.06)] text-white">
                        Verify CFA® (CFA Institute Directory) ↗
                      </a>
                      <a role="listitem" href="https://www.cfp.net/verify-a-cfp-professional" target="_blank" rel="noopener noreferrer" className="text-sm no-underline border border-[rgba(255,255,255,.12)] px-3 py-2.5 rounded-xl bg-[rgba(255,255,255,.03)] hover:bg-[rgba(255,255,255,.06)] text-white">
                        Verify CFP® (CFP Board) ↗
                      </a>
                    </div>

                    <p className="mt-3.5 text-[rgba(255,255,255,.55)] text-xs">
                      External sites are maintained by CFA Institute and CFP Board. Availability and results depend on their systems.
                    </p>
                  </div>

                  <div className="bg-[rgba(255,255,255,.06)] border border-[rgba(255,255,255,.12)] rounded-[18px] p-4.5 mt-3.5">
                    <h3 className="mb-2.5 text-base tracking-wide font-bold">Quick gut-check question</h3>
                    <p className="mb-0 text-[rgba(255,255,255,.72)]">
                      If your current advisor had to explain their strategy in writing—with assumptions, risks, and tradeoffs—could they?
                    </p>
                  </div>
                </aside>
              </div>
            </div>
          </section>

          <div className="border-t border-[rgba(255,255,255,.12)]"></div>

          {/* CFA */}
          <section id="cfa" className="py-8">
            <div className="max-w-[1040px] mx-auto px-6">
              <h2 className="text-2xl mb-2.5">CFA®: Rigor (hard skills)</h2>
              <p className="mb-4.5 text-[rgba(255,255,255,.72)] max-w-[76ch] text-[17px]">
                The CFA Program is built to test investment analysis and portfolio decision-making at a professional level.
                It’s not a weekend designation. It’s a multi-year commitment.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 mt-3" aria-label="CFA key facts">
                {[
                  { big: "3 levels", label: "A series of three exams (Levels I, II, III)" },
                  { big: "300 hrs", label: "Recommended study time per level" },
                  { big: "4,000 hrs", label: "Relevant work experience (minimum) to use the charter" },
                  { big: "10-yr avg", label: "Pass rates (2016–2025): L1 41% · L2 46% · L3 51%" }
                ].map((item, idx) => (
                  <div key={idx} className="border border-[rgba(255,255,255,.12)] bg-[rgba(255,255,255,.03)] rounded-[16px] p-3.5">
                    <div className="text-[22px] font-black">{item.big}</div>
                    <div className="mt-1.5 text-[rgba(255,255,255,.72)] text-[13px]">{item.label}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-4 mt-4">
                <div className="bg-[rgba(255,255,255,.06)] border border-[rgba(255,255,255,.12)] rounded-[18px] p-4.5">
                  <h3 className="mb-2.5 text-base tracking-wide font-bold">How this shows up in real advice</h3>
                  <ul className="pl-4.5 text-[rgba(255,255,255,.72)] list-disc">
                    <li className="my-2">Portfolio construction decisions grounded in risk/return tradeoffs—not narratives.</li>
                    <li className="my-2">Implementation that prioritizes costs, evidence, and repeatable decision-making.</li>
                    <li className="my-2">Clear explanations of “why this, why now, and what could go wrong.”</li>
                  </ul>
                </div>

                <div className="bg-[rgba(255,255,255,.06)] border border-[rgba(255,255,255,.12)] rounded-[18px] p-4.5">
                  <h3 className="mb-2.5 text-base tracking-wide font-bold">People “in the know” say it plainly</h3>
                  <blockquote className="my-3 py-2.5 px-3 border-l-3 border-[rgba(255,255,255,.25)] bg-[rgba(255,255,255,.04)] rounded-[10px] text-[rgba(255,255,255,.86)]">
                    “If you hire investment professionals with a CFA, you… have confidence at the level of qualification.”
                    <div className="mt-1.5 text-[13px] text-[rgba(255,255,255,.55)]">— Jenny Johnson, CEO/President, Franklin Templeton (excerpt)</div>
                  </blockquote>

                  <div className="mt-3 flex flex-wrap gap-2.5">
                    <a href="https://www.cfainstitute.org/programs/cfa-program" target="_blank" rel="noopener noreferrer" className="text-sm no-underline border border-[rgba(255,255,255,.12)] px-3 py-2.5 rounded-xl bg-[rgba(255,255,255,.03)] hover:bg-[rgba(255,255,255,.06)] text-white">
                      CFA Program overview ↗
                    </a>
                    <a href="https://www.cfainstitute.org/programs/cfa-program/candidate-resources/exam-results" target="_blank" rel="noopener noreferrer" className="text-sm no-underline border border-[rgba(255,255,255,.12)] px-3 py-2.5 rounded-xl bg-[rgba(255,255,255,.03)] hover:bg-[rgba(255,255,255,.06)] text-white">
                      CFA exam results & pass rates ↗
                    </a>
                  </div>
                </div>
              </div>

              <details className="mt-3.5 border border-[rgba(255,255,255,.12)] bg-[rgba(255,255,255,.03)] rounded-[14px] p-3">
                <summary className="cursor-pointer font-bold">Curriculum sampler (10-second skim)</summary>
                <div className="pt-2.5 text-[rgba(255,255,255,.72)]">
                  <p className="mb-2">
                    CFA curriculum evolves, but the “shape” is consistent: ethics + quantitative thinking + deep coverage
                    across major asset classes and portfolio management.
                  </p>
                  <ul className="pl-4.5 list-disc mb-3">
                    <li className="my-1">Ethics & professional standards</li>
                    <li className="my-1">Quantitative methods (risk, probability, data)</li>
                    <li className="my-1">Economics & market structure</li>
                    <li className="my-1">Financial statement analysis</li>
                    <li className="my-1">Equity, fixed income, derivatives, alternatives</li>
                    <li className="my-1">Portfolio management & wealth planning</li>
                  </ul>

                  <div className="flex flex-wrap gap-2.5">
                    {[
                      { href: "https://www.cfainstitute.org/programs/cfa-program/curriculum", label: "Official curriculum overview ↗" },
                      { href: "https://www.cfainstitute.org/programs/cfa-program/candidate-resources/level-i-exam", label: "Level I structure & topic weights ↗" },
                      { href: "https://www.cfainstitute.org/programs/cfa-program/candidate-resources/level-ii-exam", label: "Level II structure ↗" },
                      { href: "https://www.cfainstitute.org/programs/cfa-program/candidate-resources/level-iii-exam", label: "Level III structure ↗" }
                    ].map((link) => (
                      <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className="text-sm no-underline border border-[rgba(255,255,255,.12)] px-3 py-2.5 rounded-xl bg-[rgba(255,255,255,.03)] hover:bg-[rgba(255,255,255,.06)] text-white">
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              </details>
            </div>
          </section>

          <div className="border-t border-[rgba(255,255,255,.12)]"></div>

          {/* CFP */}
          <section id="cfp" className="py-8">
            <div className="max-w-[1040px] mx-auto px-6">
              <h2 className="text-2xl mb-2.5">CFP®: Process (planning + partnership)</h2>
              <p className="mb-4.5 text-[rgba(255,255,255,.72)] max-w-[76ch] text-[17px]">
                Financial planning is a collaborative process designed to help meet life goals through advice that integrates
                the relevant parts of your personal and financial situation.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-4">
                <div className="bg-[rgba(255,255,255,.06)] border border-[rgba(255,255,255,.12)] rounded-[18px] p-4.5">
                  <h3 className="mb-2.5 text-base tracking-wide font-bold">The planning process (simple, repeatable, client-centered)</h3>
                  <ol className="pl-4.5 text-[rgba(255,255,255,.72)] list-decimal">
                    <li className="my-2"><strong>Discovery</strong> — goals, constraints, risks, priorities.</li>
                    <li className="my-2"><strong>Analysis</strong> — where you are, what’s missing, what’s at stake.</li>
                    <li className="my-2"><strong>Recommendations</strong> — options, tradeoffs, and a clear plan.</li>
                    <li className="my-2"><strong>Implementation</strong> — execute with coordination and accountability.</li>
                    <li className="my-2"><strong>Monitoring</strong> — adapt as life and markets change.</li>
                  </ol>
                </div>

                <div className="bg-[rgba(255,255,255,.06)] border border-[rgba(255,255,255,.12)] rounded-[18px] p-4.5">
                  <h3 className="mb-2.5 text-base tracking-wide font-bold">Standards that emphasize trust</h3>
                  <p className="mb-0 text-[rgba(255,255,255,.72)]">
                    CFP® professionals are held to a professional code of ethics and standards of conduct.
                    When providing financial advice, the CFP Board requires a fiduciary duty.
                  </p>

                  <div className="grid grid-cols-2 gap-2.5 mt-3">
                    <div className="border border-[rgba(255,255,255,.12)] bg-[rgba(255,255,255,.03)] rounded-[16px] p-3.5">
                      <div className="text-[22px] font-black">64%</div>
                      <div className="mt-1.5 text-[rgba(255,255,255,.72)] text-[13px]">Nov 2025 CFP® exam pass rate (example of recent exam stats)</div>
                    </div>
                    <div className="border border-[rgba(255,255,255,.12)] bg-[rgba(255,255,255,.03)] rounded-[16px] p-3.5">
                      <div className="text-[22px] font-black">Verify</div>
                      <div className="mt-1.5 text-[rgba(255,255,255,.72)] text-[13px]">Certification status + disciplinary history via CFP Board</div>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2.5">
                    <a href="https://www.cfp.net/certification-process/exam-requirement/about-the-cfp-exam/scoring-and-results/exam-statistics" target="_blank" rel="noopener noreferrer" className="text-sm no-underline border border-[rgba(255,255,255,.12)] px-3 py-2.5 rounded-xl bg-[rgba(255,255,255,.03)] hover:bg-[rgba(255,255,255,.06)] text-white">
                      CFP® exam statistics ↗
                    </a>
                    <a href="https://www.cfp.net/verify-a-cfp-professional" target="_blank" rel="noopener noreferrer" className="text-sm no-underline border border-[rgba(255,255,255,.12)] px-3 py-2.5 rounded-xl bg-[rgba(255,255,255,.03)] hover:bg-[rgba(255,255,255,.06)] text-white">
                      Verify a CFP® professional ↗
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-[rgba(255,255,255,.06)] border border-[rgba(255,255,255,.12)] rounded-[18px] p-4.5 mt-3.5">
                <h3 className="mb-2.5 text-base tracking-wide font-bold">What this means for your family (multi-generational decisions)</h3>
                <ul className="pl-4.5 text-[rgba(255,255,255,.72)] list-disc">
                  <li className="my-2">Retirement decisions that don’t accidentally hurt the surviving spouse.</li>
                  <li className="my-2">Estate / legacy coordination so “equal” doesn’t become “unfair.”</li>
                  <li className="my-2">A partner who pressure-tests big decisions before you commit.</li>
                </ul>
              </div>
            </div>
          </section>

          <div className="border-t border-[rgba(255,255,255,.12)]"></div>

          {/* FEES / INCENTIVES */}
          <section id="fees" className="py-8">
            <div className="max-w-[1040px] mx-auto px-6">
              <h2 className="text-2xl mb-2.5">Fiduciary duty is table stakes. Incentives still matter.</h2>
              <p className="mb-4.5 text-[rgba(255,255,255,.72)] max-w-[76ch] text-[17px]">
                “Fiduciary” is a standard of care—not a fee structure. Fee-only fiduciaries can charge a percentage of assets
                or a flat fee. The question is whether your fee quietly takes a cut of your upside as your portfolio grows.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-4">
                <div className="bg-[rgba(255,255,255,.06)] border border-[rgba(255,255,255,.12)] rounded-[18px] p-4.5">
                  <h3 className="mb-2.5 text-base tracking-wide font-bold">One sentence that should change how you think about fees</h3>
                  <blockquote className="my-3 py-2.5 px-3 border-l-3 border-[rgba(255,255,255,.25)] bg-[rgba(255,255,255,.04)] rounded-[10px] text-[rgba(255,255,255,.86)]">
                    “The miracle of compounding returns is overwhelmed by the tyranny of compounding costs.”
                    <div className="mt-1.5 text-[13px] text-[rgba(255,255,255,.55)]">— John C. Bogle</div>
                  </blockquote>
                  <p className="mt-3.5 text-[rgba(255,255,255,.55)] text-xs">
                    This page does not promise higher returns. It explains a simple fact: lower ongoing costs leave more of your
                    market return in your account.
                  </p>
                </div>

                <div className="bg-[rgba(255,255,255,.06)] border border-[rgba(255,255,255,.12)] rounded-[18px] p-4.5">
                  <h3 className="mb-2.5 text-base tracking-wide font-bold">Do the math on your own portfolio</h3>
                  <p className="mb-0 text-[rgba(255,255,255,.72)]">
                    If you’ve used our fee calculator, you already know the punchline: small percentages compound into big dollar amounts.
                  </p>
                  <div className="mt-4.5 flex flex-wrap gap-3 items-center">
                    <a href="/#calculator" className="inline-flex items-center gap-2.5 border border-[rgba(255,255,255,.12)] bg-white text-[#0b0d12] px-3.5 py-3 rounded-xl font-bold no-underline hover:opacity-90">Run the calculator again →</a>
                    <a href="/start" className="inline-flex items-center gap-2.5 border border-[rgba(255,255,255,.12)] bg-transparent text-white px-3.5 py-3 rounded-xl font-bold no-underline hover:bg-[rgba(255,255,255,.06)]">Talk to David (with pre-work) →</a>
                  </div>
                  <p className="mt-3.5 text-[rgba(255,255,255,.55)] text-xs">
                    “Pre-work” = a short questionnaire so your call is useful, not a generic sales chat.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <div className="border-t border-[rgba(255,255,255,.12)]"></div>

          {/* FAQ */}
          <section id="faq" className="py-8">
            <div className="max-w-[1040px] mx-auto px-6">
              <h2 className="text-2xl mb-2.5">FAQ</h2>

              <div className="space-y-2.5">
                {[
                  {
                    q: "Is a fiduciary always fee-only?",
                    a: "No. “Fiduciary” is a standard of care (acting in the client’s best interest). Advisors can be fiduciaries under different fee models. What matters is transparency, disclosure, and how conflicts are identified and reduced."
                  },
                  {
                    q: "What’s the difference between CFA and CFP®?",
                    a: "CFA emphasizes investment analysis and portfolio decision-making (hard skills). CFP® emphasizes comprehensive financial planning and a client-centered process (planning + communication). Together, they cover both the “math” and the “life.”"
                  },
                  {
                    q: "How do I verify these credentials?",
                    a: (
                      <span>
                        Use the official directories:
                        <ul className="pl-4.5 list-disc mt-2">
                          <li className="my-1"><a href="https://directory.cfainstitute.org/" target="_blank" rel="noopener noreferrer" className="text-white underline decoration-[3px] hover:opacity-90">CFA Institute Member Directory ↗</a></li>
                          <li className="my-1"><a href="https://www.cfp.net/verify-a-cfp-professional" target="_blank" rel="noopener noreferrer" className="text-white underline decoration-[3px] hover:opacity-90">CFP Board verification tool ↗</a></li>
                        </ul>
                      </span>
                    )
                  },
                  {
                    q: "Does a flat fee guarantee better performance?",
                    a: "No. A flat fee doesn’t guarantee returns. It removes percentage-based fee drag and can reduce incentive conflicts tied to asset gathering. Investment results still depend on markets and your plan."
                  }
                ].map((item, idx) => (
                  <details key={idx} className="border border-[rgba(255,255,255,.12)] bg-[rgba(255,255,255,.03)] rounded-[14px] p-3">
                    <summary className="cursor-pointer font-bold">{item.q}</summary>
                    <div className="pt-2.5 text-[rgba(255,255,255,.72)]">
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* FOOTER */}
          <footer className="py-8 border-t border-[rgba(255,255,255,.12)]">
            <div className="max-w-[1040px] mx-auto px-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3.5">
                <div>
                  <strong>Bottom line</strong>
                  <p className="mt-3.5 text-[rgba(255,255,255,.55)] text-xs">
                    More credentials don’t automatically mean better outcomes—but they do raise the bar for competence, ethics, and process.
                    That’s the point of “upgrade.”
                  </p>
                </div>
                <div>
                  <strong>Trademarks</strong>
                  <p className="mt-3.5 text-[rgba(255,255,255,.55)] text-xs">
                    CFA®, Chartered Financial Analyst®, and related marks are trademarks owned by CFA Institute.
                    CFP®, CERTIFIED FINANCIAL PLANNER®, and related marks are certification marks owned by CFP Board.
                  </p>
                </div>
              </div>

              <p className="mt-3.5 text-[rgba(255,255,255,.55)] text-xs">
                © {new Date().getFullYear()} YouArePayingTooMuch.com. All rights reserved.
              </p>
            </div>
          </footer>
        </main>
      </div>
    </>
  );
}
