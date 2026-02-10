'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';

/* ═══════════════════════════════════════════════════════════════
   RECHARTS COMPONENT DEFINITIONS
   ═══════════════════════════════════════════════════════════════ */

// --- VISUAL 1: FEE CHART COMPONENT (from upgrade5) ---
const FeeChart = () => {
  const initialPrincipal = 1000000;
  const growthRate = 0.08;
  const feeRate = 0.01;

  const data: { year: string; noFee: number; withFee: number; lostToFees: number }[] = [];
  let pNoFee = initialPrincipal;
  let pWithFee = initialPrincipal;

  for (let i = 0; i <= 20; i++) {
    data.push({
      year: `Year ${i}`,
      noFee: Math.round(pNoFee),
      withFee: Math.round(pWithFee),
      lostToFees: Math.round(pNoFee - pWithFee),
    });
    pNoFee = pNoFee * (1 + growthRate);
    pWithFee = pWithFee * (1 + growthRate) * (1 - feeRate);
  }

  const finalGap = data[20].noFee - data[20].withFee;
  const formatValue = (value: number) => `$${(value / 1000000).toFixed(2)}M`;

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
          <XAxis dataKey="year" tick={{ fontSize: 12 }} tickLine={false} interval={4} />
          <YAxis tickFormatter={formatValue} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
          <Tooltip
            formatter={(value: number) => formatValue(value)}
            labelStyle={{ fontWeight: 'bold' }}
          />
          <Area type="monotone" dataKey="noFee" stackId="1" stroke="#00A540" fill="#00A540" fillOpacity={0.3} name="Potential (No Fee)" />
          <Area type="monotone" dataKey="withFee" stackId="2" stroke="#4285F4" fill="#4285F4" fillOpacity={0.6} name="Realized (1% Fee)" />
        </AreaChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-4 mt-4 text-sm justify-center">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#00A540]"></span>
          Potential (No Fee)
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#4285F4]"></span>
          Realized (1% Fee)
        </div>
        <div className="flex items-center gap-2 text-red-600 font-semibold">
          Lost to Fees: {formatValue(finalGap)}
        </div>
      </div>
    </div>
  );
};

// --- VISUAL 2: CFA FUNNEL COMPONENT (from upgrade5) ---
const CFAFunnel = () => {
  const data = [
    { stage: 'Enrolled Candidates', value: 100, fill: '#dcfce7' },
    { stage: 'Passed Level I', value: 43, fill: '#86efac' },
    { stage: 'Passed Level II', value: 26, fill: '#4ade80' },
    { stage: 'Charter Awarded', value: 18, fill: '#00A540' },
  ];

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical" margin={{ top: 20, right: 30, left: 100, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} tickFormatter={(v: number) => `${v}%`} />
          <YAxis type="category" dataKey="stage" tick={{ fontSize: 13 }} width={100} />
          <Tooltip formatter={(value: number) => `${value}%`} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="text-center text-sm text-stone-500 mt-2">
        Fewer than 1 in 5 candidates ever earn the charter.
      </p>
    </div>
  );
};

// --- VISUAL 3: ADVISOR MATRIX COMPONENT (from upgrade5) ---
const AdvisorMatrix = () => (
  <div className="w-full relative">
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-xs text-stone-500 font-medium">
      Investment Rigor &rarr;
    </div>
    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 -rotate-90 text-xs text-stone-500 font-medium">
      Holistic Planning &rarr;
    </div>
    <div className="bg-stone-50 rounded-xl p-6">
      <div className="grid grid-cols-2 gap-4 h-[350px]">
        {/* Top Right - Best */}
        <div className="bg-green-50 rounded-lg p-4 flex flex-col justify-between border border-green-100">
          <span className="text-xs text-[#00A540] font-semibold">High Rigor + Holistic</span>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#00A540]"></span>
            <span className="text-sm font-medium">CFA&reg; + CFP&reg;</span>
          </div>
        </div>
        {/* Top Left */}
        <div className="bg-stone-100 rounded-lg p-4 flex flex-col justify-between">
          <span className="text-xs text-stone-500">High Rigor Only</span>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
            <span className="text-sm text-stone-600">CFA&reg; Only</span>
          </div>
        </div>
        {/* Bottom Right */}
        <div className="bg-stone-100 rounded-lg p-4 flex flex-col justify-between">
          <span className="text-xs text-stone-500">Holistic Only</span>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
            <span className="text-sm text-stone-600">CFP&reg; Only</span>
          </div>
        </div>
        {/* Bottom Left */}
        <div className="bg-stone-50 rounded-lg p-4 flex flex-col justify-between border border-stone-200">
          <span className="text-xs text-stone-400">Basic</span>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-stone-400"></span>
              <span className="text-xs text-stone-500">Insurance Agent</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-stone-400"></span>
              <span className="text-xs text-stone-500">Wirehouse Advisor</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// --- VISUAL 4: SCORECARD COMPONENT (from upgrade5) ---
const Scorecard = () => (
  <div className="w-full overflow-hidden border border-stone-200 rounded-xl shadow-sm">
    <div className="grid grid-cols-[1fr_1.2fr_1.2fr] text-sm md:text-base">
      {/* Header */}
      <div className="p-4 font-bold text-stone-600 border-b bg-stone-50 flex items-end">FEATURE</div>
      <div className="p-4 font-bold text-stone-600 border-b bg-stone-50 flex flex-col justify-end">
        BROKER/DEALER <span className="text-xs font-normal opacity-70">(Industry Norm)</span>
      </div>
      <div className="p-4 font-bold text-[#00A540] border-b border-green-200 bg-green-50 flex flex-col justify-end">
        TRUE FIDUCIARY <span className="text-xs font-normal opacity-70 text-stone-600">(Our Standard)</span>
      </div>
      {/* Row 1 */}
      <div className="p-4 border-b border-stone-100 font-medium">Legal Standard</div>
      <div className="p-4 border-b border-stone-100 flex items-center gap-2">
        <span className="text-red-500">&times;</span> Suitability <span className="text-xs opacity-50">(Good enough)</span>
      </div>
      <div className="p-4 border-b border-green-200 bg-green-50/50 flex items-center gap-2 font-medium">
        <span className="text-[#00A540]">✓</span> Fiduciary <span className="text-xs opacity-75">(Best Interest)</span>
      </div>
      {/* Row 2 */}
      <div className="p-4 border-b border-stone-100 font-medium">Compensation</div>
      <div className="p-4 border-b border-stone-100">Commissions &amp; % Fees</div>
      <div className="p-4 border-b border-green-200 bg-green-50/50 font-medium">Flat Fee Only</div>
      {/* Row 3 */}
      <div className="p-4 border-b border-stone-100 font-medium">Products</div>
      <div className="p-4 border-b border-stone-100">Proprietary / Incentivized</div>
      <div className="p-4 border-b border-green-200 bg-green-50/50 font-medium">Entire Market</div>
      {/* Row 4 */}
      <div className="p-4 font-medium">Conflicts</div>
      <div className="p-4">Buried in fine print</div>
      <div className="p-4 bg-green-50/50 font-medium">Open &amp; Transparent</div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function UpgradeYourAdvice() {
  // Structured data for SEO (FAQ JSON-LD) — merged from upgrade8 + existing
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Do I need to transfer my accounts?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "No. Your accounts can stay with your current broker/custodian. That's the point—independence you can verify.",
        },
      },
      {
        '@type': 'Question',
        name: 'Is a fiduciary always fee-only?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. "Fiduciary" is a standard of care (acting in the client\'s best interest). Advisors can be fiduciaries under different fee models. The key is transparency and managing conflicts of interest.',
        },
      },
      {
        '@type': 'Question',
        name: "What's the difference between CFA and CFP\u00AE?",
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'CFA is investment-analysis and portfolio-management rigor (hard skills). CFP\u00AE is comprehensive financial planning and client-centered process (planning and communication).',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I verify these credentials?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "Use the official directories: CFA Institute's member directory for CFA charterholders, and CFP Board's verification tool for CFP\u00AE certification status and background.",
        },
      },
      {
        '@type': 'Question',
        name: 'Does a flat fee guarantee better performance?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "No. A flat fee doesn't guarantee returns. It simply removes the percentage-based fee drag and can reduce incentive conflicts tied to asset gathering.",
        },
      },
    ],
  };

  // CFA credential data (from upgrade6)
  const cfaStats = [
    { value: '3', label: 'sequential exams' },
    { value: '~45%', label: 'pass rate per exam' },
    { value: '<4%', label: 'of advisors hold this' },
  ];

  const cfaRequirements = [
    'Over 900 hours of study across three 6-hour exams—one of the most rigorous financial credentials globally.',
    'Deep expertise in portfolio management, investment analysis, economics, and ethics.',
  ];

  // CFP credential data (from upgrade6)
  const cfpStats = [
    { value: '~10hr', label: 'board examination' },
    { value: '~65%', label: 'pass rate' },
    { value: '~20%', label: 'of advisors certified' },
  ];

  const cfpRequirements = [
    'Rigorous education covering taxes, retirement, estate planning, insurance, and investment management.',
    'Required client-focused experience demonstrating real-world planning competence.',
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="min-h-screen bg-white text-stone-800">
        <main>

          {/* ═══════════════════════════════════════════════════════════════
              HERO
          ═══════════════════════════════════════════════════════════════ */}
          <section className="pt-24 pb-16 px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="font-['Source_Serif_4'] text-4xl md:text-5xl font-bold text-stone-900 leading-[1.15] mb-6">
                Not Your Typical Advisor.
              </h1>
              <p className="text-xl md:text-2xl text-[#00A540] font-semibold mb-6">
                A CFA&reg; Charterholder. A CFP&reg; Professional. 100% Fiduciary.
              </p>
              <div className="w-24 h-1 bg-[#00A540] mx-auto mb-6" />
              <p className="text-lg text-stone-600 leading-relaxed max-w-2xl mx-auto">
                Experience elite investment expertise and gold-standard financial planning &mdash; all in one advisor.
              </p>

              {/* Premise box (from upgrade3) */}
              <div className="mt-8 bg-stone-50 rounded-xl shadow-sm border border-stone-200 p-6 sm:p-8 max-w-3xl mx-auto text-left">
                <p className="text-sm text-stone-600">
                  Quick premise: a &quot;financial advisor&quot; title can mean many things. Credentials and standards help you audit
                  <strong className="font-extrabold"> how</strong> advice is produced and
                  <strong className="font-extrabold"> whose interests</strong> it serves.
                </p>
              </div>
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════════════════
              SECTION A — PERSONAL STORY (exact approved text)
          ═══════════════════════════════════════════════════════════════ */}
          <section className="py-16 px-4 bg-stone-50">
            <div className="max-w-3xl mx-auto">
              <h2 className="font-['Source_Serif_4'] text-3xl font-bold text-stone-900 mb-8">
                The Problem I Couldn&apos;t Ignore
              </h2>
              <p className="text-lg text-stone-700 mb-6">
                At my former firm, despite high ethical standards and good intentions, I was limited to offering three things:
              </p>
              <ul className="space-y-3 mb-6 pl-2">
                <li className="flex items-start gap-3 text-lg text-stone-700">
                  <span className="text-[#00A540] font-bold mt-0.5">&rarr;</span>
                  <span>A diversified portfolio of mutual funds <span className="text-stone-500">(with the standard 1% fee)</span></span>
                </li>
                <li className="flex items-start gap-3 text-lg text-stone-700">
                  <span className="text-[#00A540] font-bold mt-0.5">&rarr;</span>
                  <span>A handful of Separately Managed Accounts</span>
                </li>
                <li className="flex items-start gap-3 text-lg text-stone-700">
                  <span className="text-[#00A540] font-bold mt-0.5">&rarr;</span>
                  <span>A fixed or variable annuity</span>
                </li>
              </ul>
              <p className="text-lg text-stone-700 mb-4">
                That&apos;s it. Cookie-cutter. I have a CFA&reg; charter. I have a CFP&reg; certification. And I was handing everyone the same playbook.
              </p>
              <p className="text-lg text-stone-700 italic">
                I wasn&apos;t doing anything differentiated. I started to feel like I was breaking my own fiduciary promise&mdash;not because of bad intentions, but because of a limited scope.
              </p>
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════════════════
              SECTION B — THE MODEL THAT FIXES IT
          ═══════════════════════════════════════════════════════════════ */}
          <section className="py-16 px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-['Source_Serif_4'] text-3xl font-bold text-stone-900 mb-4">
                The Model That Fixes It
              </h2>
              <p className="text-lg text-stone-600 mb-10">
                Two structural changes eliminate the conflicts entirely.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Traditional */}
                <div className="bg-white p-8 rounded-xl border-2 border-stone-200">
                  <div className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-6">Traditional Model</div>
                  <div className="space-y-4">
                    {[
                      'Products to sell',
                      'Must transfer your assets',
                      'Fee grows with your portfolio',
                      'Same playbook for everyone',
                    ].map((item) => (
                      <div key={item} className="flex items-start gap-3">
                        <span className="text-red-500 font-bold text-lg">&times;</span>
                        <span className="text-stone-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* My Model */}
                <div className="bg-green-50 p-8 rounded-xl border-2 border-green-200">
                  <div className="text-xs font-bold uppercase tracking-widest text-[#00A540] mb-6">My Model</div>
                  <div className="space-y-4">
                    {[
                      'No products. Advice only.',
                      'Stay with your current custodian.',
                      'Flat $100/month. Your growth is yours.',
                      'Tailored strategy using top models.',
                    ].map((item) => (
                      <div key={item} className="flex items-start gap-3">
                        <span className="text-[#00A540] font-bold text-lg">✓</span>
                        <span className="text-stone-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Additional context from v0-cgpt */}
              <div className="mt-8 max-w-3xl">
                <p className="text-lg text-stone-700 mb-4">
                  <strong>This isn&apos;t a convenience feature. It&apos;s proof.</strong>
                </p>
                <p className="text-lg text-stone-600">
                  If I earned money by moving your assets, I would need you to transfer. I don&apos;t. Your accounts can stay where they are&mdash;so you can verify the relationship is advice-first.
                </p>
              </div>
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════════════════
              SECTION C — CREDENTIAL EDUCATION
              Merged from upgrade3, upgrade5, upgrade6, upgrade7, upgrade8
          ═══════════════════════════════════════════════════════════════ */}

          {/* ─── C.1: "We Answer to One Person" Manifesto (from upgrade5) ─── */}
          <section className="py-20 px-4 bg-stone-50">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="font-['Source_Serif_4'] text-3xl md:text-4xl font-bold text-stone-900 mb-8">
                We Answer to One Person.
              </h2>
              <p className="text-xl md:text-2xl text-stone-600 leading-relaxed max-w-3xl mx-auto">
                It isn&apos;t a sales manager, a fund provider, or a shareholder.<br />
                <span className="font-semibold text-stone-900">It is you.</span>
              </p>
              <div className="mt-12 text-lg text-stone-600 max-w-3xl mx-auto">
                <p className="mb-6">
                  The <strong>Fiduciary Standard</strong> isn&apos;t just a badge we wear. It&apos;s the legal and ethical bedrock of our entire firm. No commissions. No hidden incentives. Just advice.
                </p>
                <p>
                  Most advisors are incentivized to keep your money. We are incentivized to keep your trust.
                </p>
              </div>
            </div>
          </section>

          {/* ─── C.2: CFA® — Deep Dive (from upgrade3, upgrade5, upgrade7, upgrade8) ─── */}
          <section className="py-20 px-4">
            <div className="max-w-6xl mx-auto">

              {/* CFA Header + Badge (from upgrade3) */}
              <div className="flex items-start justify-between gap-6 flex-wrap mb-8">
                <div>
                  <h2 className="font-['Source_Serif_4'] text-2xl sm:text-3xl font-bold text-stone-900 mb-2">
                    CFA&reg; explained in plain English
                  </h2>
                  <p className="text-[17px] text-stone-700 max-w-prose">
                    Think of CFA&reg; charterholders as &quot;investment specialists&quot;: valuation, risk, portfolio construction, and ethics&mdash;
                    built for investment decision-making at a high technical bar.
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-16 items-start">
                {/* CFA Funnel Chart (from upgrade5) */}
                <div className="bg-white p-2 rounded-xl border border-stone-200 shadow-sm">
                  <CFAFunnel />
                </div>

                {/* The Science of Wealth Management (from upgrade5) */}
                <div>
                  <h3 className="font-['Source_Serif_4'] text-2xl font-bold text-stone-900 mb-6">The Science of Wealth Management</h3>
                  <h4 className="text-xl text-[#00A540] font-medium mb-4">Chartered Financial Analyst (CFA&reg;)</h4>
                  <p className="text-stone-600 mb-6">
                    Investing is not a guessing game. It is a discipline grounded in economics, quantitative analysis, and behavioral science.
                  </p>
                  <p className="text-stone-600 mb-6">
                    The CFA charter is widely regarded as the <strong>&quot;Gold Standard&quot;</strong> of the investment profession. The curriculum covers over 9,000 pages of advanced finance and takes an average of 4 years to complete.
                  </p>
                  <blockquote className="border-l-4 border-[#00A540] pl-4 italic text-stone-700 bg-green-50/50 py-2 pr-2 rounded-r">
                    &quot;The most respected and recognized investment designation in the world.&quot;
                    <footer className="text-xs text-stone-500 mt-2 not-italic">&mdash; Financial Times</footer>
                  </blockquote>
                </div>
              </div>

              {/* CFA Badge + "What it signals" (from upgrade3) */}
              <article className="mt-12 bg-white rounded-xl shadow-sm border border-stone-200 p-6 sm:p-8">
                <div className="flex gap-5 items-start">
                  <div className="w-[96px] h-[96px] rounded-xl border border-stone-200 bg-white flex items-center justify-center p-2">
                    <Image
                      src="/e7e2a584-b923-4249-a863-9a49b6850ef0.png"
                      alt="CFA Institute Charterholder badge"
                      className="object-contain"
                      width={80}
                      height={80}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-stone-900 mb-1">What it signals for clients</h3>
                    <p className="text-[17px] text-stone-700 max-w-prose">
                      It&apos;s a credential with real friction: three exams, published requirements, and an ethics code.
                      CFA Institute states charterholders commit to integrity and to placing the interests of clients above
                      their own personal interests. <sup className="text-[#00A540] font-semibold"><a href="#src-cfa-ethics">[4]</a></sup>
                    </p>
                    <div className="mt-4 p-4 border border-dashed border-stone-300 rounded-xl bg-stone-50 text-sm text-stone-600">
                      <strong className="font-extrabold">Client benefit:</strong> You get investment decisions grounded in disciplined analysis&mdash;especially when the market narrative gets loud.
                    </div>
                  </div>
                </div>
              </article>

              {/* CFA Card from upgrade7 */}
              <div className="mt-8 bg-white p-8 rounded-xl shadow-sm border border-stone-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-green-50 rounded-full">
                    <svg className="w-6 h-6 text-[#00A540]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M12 20V10M18 20V4M6 20v-6" /></svg>
                  </div>
                  <h3 className="text-2xl font-sans font-bold text-stone-900">The CFA&reg; Charter</h3>
                </div>
                <p className="text-sm font-sans font-bold text-[#00A540] mb-4 uppercase tracking-wide">Hard Skills &amp; Rigor</p>
                <ul className="space-y-4">
                  <li className="flex gap-3">
                    <span className="text-[#00A540] font-bold">&bull;</span>
                    <span className="text-stone-700"><strong>Global Toughness:</strong> Requires passing 3 sequential 6-hour exams known for low pass rates (historically ~40-50%).</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#00A540] font-bold">&bull;</span>
                    <span className="text-stone-700"><strong>Deep Focus:</strong> Investment analysis, portfolio management, and ethics. We place client interests above our own.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#00A540] font-bold">&bull;</span>
                    <span className="text-stone-700"><strong>Elite Company:</strong> Fewer than 1 in 25 advisors holds a CFA charter. It is the mark of technical mastery.</span>
                  </li>
                </ul>
              </div>

              {/* CFA key facts from upgrade8 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-8">
                {[
                  { big: '3 levels', label: 'A series of three exams (Levels I, II, III)' },
                  { big: '300 hrs', label: 'Recommended study time per level' },
                  { big: '4,000 hrs', label: 'Relevant work experience (minimum) to use the charter' },
                  { big: '10-yr avg', label: 'Pass rates (2016\u20132025): L1 41% \u00B7 L2 46% \u00B7 L3 51%' },
                ].map((item, idx) => (
                  <div key={idx} className="border border-stone-200 bg-stone-50 rounded-xl p-4">
                    <div className="text-[22px] font-black text-stone-900">{item.big}</div>
                    <div className="mt-1.5 text-stone-600 text-[13px]">{item.label}</div>
                  </div>
                ))}
              </div>

              {/* "How this shows up in real advice" from upgrade8 */}
              <div className="mt-8 bg-stone-50 border border-stone-200 rounded-xl p-6">
                <h3 className="mb-3 text-base tracking-wide font-bold text-stone-900">How this shows up in real advice</h3>
                <ul className="pl-5 text-stone-600 list-disc space-y-2">
                  <li>Portfolio construction decisions grounded in risk/return tradeoffs&mdash;not narratives.</li>
                  <li>Implementation that prioritizes costs, evidence, and repeatable decision-making.</li>
                  <li>Clear explanations of &quot;why this, why now, and what could go wrong.&quot;</li>
                </ul>
              </div>

              {/* CFA credential stats from upgrade6 */}
              <div className="mt-8 bg-white border border-stone-200 rounded-xl p-6">
                <span className="text-xs font-medium tracking-[0.2em] text-stone-400 uppercase">Investment Expertise</span>
                <h3 className="text-2xl font-['Source_Serif_4'] text-stone-800 mt-1 mb-1">CFA Charterholder</h3>
                <p className="text-sm text-stone-500 mt-1 italic mb-4">The gold standard for investment analysis</p>
                <div className="flex flex-wrap gap-x-6 gap-y-3 mb-6">
                  {cfaStats.map((stat, idx) => (
                    <div key={idx} className="flex items-baseline gap-2">
                      <span className="text-2xl md:text-3xl font-light text-[#00A540]">{stat.value}</span>
                      <span className="text-sm text-stone-600">{stat.label}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-2 max-w-lg">
                  {cfaRequirements.map((req, idx) => (
                    <p key={idx} className="text-sm text-stone-600 leading-relaxed">{req}</p>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-stone-200 max-w-lg">
                  <p className="text-xs text-stone-500 leading-relaxed">
                    <span className="font-medium text-stone-600">Ethics Code: </span>
                    CFA charterholders must &quot;act with integrity, competence, diligence&quot; and &quot;place clients&apos; interests above their own.&quot;
                  </p>
                </div>
              </div>

              {/* CFA Learn More details (from upgrade3) */}
              <details className="mt-6 w-full">
                <summary className="cursor-pointer list-none text-[#00A540] font-semibold hover:underline">
                  Learn more about the CFA&reg; &rarr;
                </summary>
                <div className="mt-3 bg-white rounded-xl shadow-sm border border-stone-200 p-5 max-w-xl">
                  <p className="text-sm text-stone-600">
                    CFA Institute describes the CFA Program as three exams covering investment tools, valuing assets,
                    portfolio management, and wealth planning. <sup className="text-[#00A540] font-semibold"><a href="#src-cfa-program">[1]</a></sup>
                  </p>
                  <p className="mt-2 text-sm text-stone-600">
                    Exam session time is approximately 4.5 hours per level (plus tutorial/breaks). <sup className="text-[#00A540] font-semibold"><a href="#src-cfa-exam">[2]</a></sup>
                  </p>
                  <p className="mt-2 text-xs text-stone-500">
                    Pass rates vary by level and window and are published by CFA Institute. <sup className="text-[#00A540] font-semibold"><a href="#src-cfa-pass">[3]</a></sup>
                  </p>
                </div>
              </details>

              {/* CFA Curriculum sampler from upgrade8 */}
              <details className="mt-4 border border-stone-200 bg-stone-50 rounded-xl p-4">
                <summary className="cursor-pointer font-bold list-none text-stone-900">Curriculum sampler (10-second skim)</summary>
                <div className="pt-3 text-stone-600">
                  <p className="mb-2">
                    CFA curriculum evolves, but the &quot;shape&quot; is consistent: ethics + quantitative thinking + deep coverage
                    across major asset classes and portfolio management.
                  </p>
                  <ul className="pl-5 list-disc mb-3 space-y-1">
                    <li>Ethics &amp; professional standards</li>
                    <li>Quantitative methods (risk, probability, data)</li>
                    <li>Economics &amp; market structure</li>
                    <li>Financial statement analysis</li>
                    <li>Equity, fixed income, derivatives, alternatives</li>
                    <li>Portfolio management &amp; wealth planning</li>
                  </ul>
                  <div className="flex flex-wrap gap-2.5">
                    {[
                      { href: 'https://www.cfainstitute.org/programs/cfa-program/curriculum', label: 'Official curriculum overview' },
                      { href: 'https://www.cfainstitute.org/programs/cfa-program/candidate-resources/level-i-exam', label: 'Level I structure & topic weights' },
                      { href: 'https://www.cfainstitute.org/programs/cfa-program/candidate-resources/level-ii-exam', label: 'Level II structure' },
                      { href: 'https://www.cfainstitute.org/programs/cfa-program/candidate-resources/level-iii-exam', label: 'Level III structure' },
                    ].map((link) => (
                      <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className="text-sm no-underline border border-stone-200 px-3 py-2 rounded-xl bg-white hover:bg-stone-100 text-stone-700">
                        {link.label} &nearr;
                      </a>
                    ))}
                  </div>
                </div>
              </details>
            </div>
          </section>

          {/* ─── C.3: CFP® — Deep Dive (from upgrade3, upgrade5, upgrade7, upgrade8) ─── */}
          <section className="py-20 px-4 bg-stone-50">
            <div className="max-w-6xl mx-auto">

              {/* CFP Header (from upgrade3) */}
              <div className="flex items-start justify-between gap-6 flex-wrap mb-8">
                <div>
                  <h2 className="font-['Source_Serif_4'] text-2xl sm:text-3xl font-bold text-stone-900 mb-2">
                    CFP&reg; explained in plain English
                  </h2>
                  <p className="text-[17px] text-stone-700 max-w-prose">
                    If CFA&reg; is investment depth, CFP&reg; is holistic planning&mdash;turning the math into a plan that fits a real life:
                    retirement, tax strategy, insurance, estate, cash flow, and tradeoffs.
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-16 items-start">
                {/* The Art of Life Planning (from upgrade5) */}
                <div>
                  <h3 className="font-['Source_Serif_4'] text-2xl font-bold text-stone-900 mb-6">The Art of Life Planning</h3>
                  <h4 className="text-xl text-[#00A540] font-medium mb-4">Certified Financial Planner (CFP&reg;)</h4>
                  <p className="text-stone-600 mb-6">
                    Your money doesn&apos;t exist in a vacuum. It exists to support your life, your family, and your legacy.
                  </p>
                  <p className="text-stone-600 mb-6">
                    While the CFA ensures your <em>investments</em> are sound, the CFP ensures your <em>plan</em> is sound. We are trained in the <strong>Psychology of Financial Planning</strong>, helping you navigate fear and anxiety to make rational decisions.
                  </p>
                  <p className="font-medium text-stone-900">
                    We don&apos;t just plan for your money. We plan for your peace of mind.
                  </p>
                </div>

                {/* Advisor Matrix (from upgrade5) */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100">
                  <AdvisorMatrix />
                </div>
              </div>

              {/* CFP Badge + "What it signals" (from upgrade3) */}
              <article className="mt-12 bg-white rounded-xl shadow-sm border border-stone-200 p-6 sm:p-8">
                <div className="flex gap-5 items-start">
                  <div className="w-[96px] h-[96px] rounded-xl border border-stone-200 bg-white flex items-center justify-center p-2">
                    <Image
                      src="/CFP_Logomark_Primary.png"
                      alt="CFP certification mark"
                      className="object-contain"
                      width={80}
                      height={80}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-stone-900 mb-1">What it signals for clients</h3>
                    <p className="text-[17px] text-stone-700 max-w-prose">
                      CFP&reg; is about building comprehensive plans&mdash;and doing it under a published ethical framework.
                      CFP Board has reported the CFP&reg; professional population surpassing 103,000 in 2024.
                      <sup className="text-[#00A540] font-semibold"><a href="#src-cfp-pop">[8]</a></sup>
                    </p>
                    <div className="mt-4 p-4 border border-dashed border-stone-300 rounded-xl bg-stone-50 text-sm text-stone-600">
                      <strong className="font-extrabold">Client benefit:</strong> You get planning that ties your investments to your life&mdash;so the portfolio supports the plan, not the other way around.
                    </div>
                  </div>
                </div>
              </article>

              {/* CFP Card from upgrade7 */}
              <div className="mt-8 bg-white p-8 rounded-xl shadow-sm border border-stone-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-green-50 rounded-full">
                    <svg className="w-6 h-6 text-[#00A540]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" /></svg>
                  </div>
                  <h3 className="text-2xl font-sans font-bold text-stone-900">The CFP&reg; Professional</h3>
                </div>
                <p className="text-sm font-sans font-bold text-[#00A540] mb-4 uppercase tracking-wide">Holistic Planning &amp; Trust</p>
                <ul className="space-y-4">
                  <li className="flex gap-3">
                    <span className="text-[#00A540] font-bold">&bull;</span>
                    <span className="text-stone-700"><strong>The Gold Standard:</strong> The benchmark for planning. Requires rigorous education, a board exam, and years of experience.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#00A540] font-bold">&bull;</span>
                    <span className="text-stone-700"><strong>Real Life Application:</strong> Tailored roadmaps for <em>your</em> life (taxes, retirement, estate)&mdash;not just managing investments in a vacuum.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#00A540] font-bold">&bull;</span>
                    <span className="text-stone-700"><strong>Proven Trust:</strong> Roughly 20% of advisors have this. It guarantees proven competence and a pledge to serve you ethically.</span>
                  </li>
                </ul>
              </div>

              {/* CFP credential stats from upgrade6 */}
              <div className="mt-8 bg-white border border-stone-200 rounded-xl p-6">
                <span className="text-xs font-medium tracking-[0.2em] text-stone-400 uppercase">Financial Planning</span>
                <h3 className="text-2xl font-['Source_Serif_4'] text-stone-800 mt-1 mb-1">CFP&reg; Professional</h3>
                <p className="text-sm text-stone-500 mt-1 italic mb-4">Comprehensive financial planning expertise</p>
                <div className="flex flex-wrap gap-x-6 gap-y-3 mb-6">
                  {cfpStats.map((stat, idx) => (
                    <div key={idx} className="flex items-baseline gap-2">
                      <span className="text-2xl md:text-3xl font-light text-[#00A540]">{stat.value}</span>
                      <span className="text-sm text-stone-600">{stat.label}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-2 max-w-lg">
                  {cfpRequirements.map((req, idx) => (
                    <p key={idx} className="text-sm text-stone-600 leading-relaxed">{req}</p>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-stone-200 max-w-lg">
                  <p className="text-xs text-stone-500 leading-relaxed">
                    <span className="font-medium text-stone-600">Ethics Code: </span>
                    CFP professionals commit to integrity, objectivity, competence, fairness, confidentiality, and placing your interests first.
                  </p>
                </div>
              </div>

              {/* CFP Learn More details (from upgrade3) */}
              <details className="mt-6 w-full">
                <summary className="cursor-pointer list-none text-[#00A540] font-semibold hover:underline">
                  Learn more about the CFP&reg; &rarr;
                </summary>
                <div className="mt-3 bg-white rounded-xl shadow-sm border border-stone-200 p-5 max-w-xl">
                  <p className="text-sm text-stone-600">
                    CFP Board describes the CFP&reg; exam as 170 questions in two 3-hour sessions. <sup className="text-[#00A540] font-semibold"><a href="#src-cfp-format">[5]</a></sup>
                  </p>
                  <p className="mt-2 text-sm text-stone-600">
                    CFP Board requires substantial experience: 6,000 hours (standard) or 4,000 hours (apprenticeship). <sup className="text-[#00A540] font-semibold"><a href="#src-cfp-exp">[6]</a></sup>
                  </p>
                  <p className="mt-2 text-xs text-stone-500">
                    CFP Board&apos;s standards emphasize a fiduciary duty when providing financial advice. <sup className="text-[#00A540] font-semibold"><a href="#src-cfp-standards">[7]</a></sup>
                  </p>
                </div>
              </details>

              {/* CFP planning process from upgrade8 */}
              <div className="mt-8 bg-white border border-stone-200 rounded-xl p-6">
                <h3 className="mb-3 text-base tracking-wide font-bold text-stone-900">The planning process (simple, repeatable, client-centered)</h3>
                <ol className="pl-5 text-stone-600 list-decimal space-y-2">
                  <li><strong>Discovery</strong> &mdash; goals, constraints, risks, priorities.</li>
                  <li><strong>Analysis</strong> &mdash; where you are, what&apos;s missing, what&apos;s at stake.</li>
                  <li><strong>Recommendations</strong> &mdash; options, tradeoffs, and a clear plan.</li>
                  <li><strong>Implementation</strong> &mdash; execute with coordination and accountability.</li>
                  <li><strong>Monitoring</strong> &mdash; adapt as life and markets change.</li>
                </ol>
              </div>

              {/* CFP standards with stats from upgrade8 */}
              <div className="mt-8 bg-white border border-stone-200 rounded-xl p-6">
                <h3 className="mb-3 text-base tracking-wide font-bold text-stone-900">Standards that emphasize trust</h3>
                <p className="mb-4 text-stone-600">
                  CFP&reg; professionals are held to a professional code of ethics and standards of conduct.
                  When providing financial advice, the CFP Board requires a fiduciary duty.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="border border-stone-200 bg-stone-50 rounded-xl p-4">
                    <div className="text-[22px] font-black text-stone-900">64%</div>
                    <div className="mt-1.5 text-stone-600 text-[13px]">Nov 2025 CFP&reg; exam pass rate (example of recent exam stats)</div>
                  </div>
                  <div className="border border-stone-200 bg-stone-50 rounded-xl p-4">
                    <div className="text-[22px] font-black text-stone-900">Verify</div>
                    <div className="mt-1.5 text-stone-600 text-[13px]">Certification status + disciplinary history via CFP Board</div>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2.5">
                  <a href="https://www.cfp.net/certification-process/exam-requirement/about-the-cfp-exam/scoring-and-results/exam-statistics" target="_blank" rel="noopener noreferrer" className="text-sm no-underline border border-stone-200 px-3 py-2 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-700">
                    CFP&reg; exam statistics &nearr;
                  </a>
                  <a href="https://www.cfp.net/verify-a-cfp-professional" target="_blank" rel="noopener noreferrer" className="text-sm no-underline border border-stone-200 px-3 py-2 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-700">
                    Verify a CFP&reg; professional &nearr;
                  </a>
                </div>
              </div>

              {/* "What this means for your family" from upgrade8 */}
              <div className="mt-8 bg-white border border-stone-200 rounded-xl p-6">
                <h3 className="mb-3 text-base tracking-wide font-bold text-stone-900">What this means for your family (multi-generational decisions)</h3>
                <ul className="pl-5 text-stone-600 list-disc space-y-2">
                  <li>Retirement decisions that don&apos;t accidentally hurt the surviving spouse.</li>
                  <li>Estate / legacy coordination so &quot;equal&quot; doesn&apos;t become &quot;unfair.&quot;</li>
                  <li>A partner who pressure-tests big decisions before you commit.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* ─── C.4: CFA® + CFP® = Both Worlds (from upgrade3, upgrade7) ─── */}
          <section className="py-20 px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="font-['Source_Serif_4'] text-2xl sm:text-3xl font-bold text-stone-900 mb-3">
                CFA&reg; + CFP&reg; = a higher standard of advice
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div className="text-[17px] text-stone-700 max-w-prose">
                  <p>
                    Alone, each credential is valuable. Together, they cover the two hardest parts of advice:
                    <strong className="font-extrabold"> investment decisions under uncertainty</strong>{' '}
                    and <strong className="font-extrabold">planning that survives real life</strong>.
                  </p>
                  <ul className="mt-4 list-disc pl-6 text-stone-700 space-y-2">
                    <li>Portfolio design with a repeatable process (not hot takes).</li>
                    <li>Tradeoffs made explicit (so you can decide confidently).</li>
                    <li>A plan that integrates retirement, tax, insurance, and estate considerations.</li>
                    <li>Ethics and client-first duties that constrain behavior when incentives tempt shortcuts.</li>
                  </ul>
                </div>

                {/* Proof timeline sidebar (from upgrade3) */}
                <aside className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
                  <h3 className="text-xl font-bold text-stone-900 mb-2">Proof without bragging: a simple timeline</h3>
                  <p className="text-sm text-stone-600 mb-4">
                    A timeline of dedication and standards achieved.
                  </p>
                  <div className="p-4 border border-dashed border-stone-300 rounded-xl bg-stone-50 text-sm text-stone-700">
                    <ul className="space-y-2">
                      <li><strong className="font-extrabold">Year 1:</strong> CFA&reg; Level I</li>
                      <li><strong className="font-extrabold">Year 2:</strong> CFA&reg; Level II</li>
                      <li><strong className="font-extrabold">Year 3:</strong> Earned CFA&reg; charter</li>
                      <li><strong className="font-extrabold">Year 4:</strong> Earned CFP&reg; certification</li>
                    </ul>
                  </div>
                </aside>
              </div>

              {/* "By The Numbers" table from upgrade7 */}
              <div className="mt-12">
                <h3 className="font-['Source_Serif_4'] text-2xl font-bold text-center text-stone-900 mb-10">By The Numbers</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b-2 border-stone-800 text-sm font-sans uppercase tracking-wider">
                        <th className="py-4 text-stone-500 font-medium">Feature</th>
                        <th className="py-4 text-stone-500 font-medium">CFA Charterholder</th>
                        <th className="py-4 text-stone-500 font-medium">CFP&reg; Professional</th>
                        <th className="py-4 text-[#00A540] font-extrabold bg-green-50 px-2">David (You)</th>
                      </tr>
                    </thead>
                    <tbody className="text-stone-700">
                      <tr className="border-b border-stone-200">
                        <td className="py-4 font-bold">Primary Focus</td>
                        <td className="py-4">Investment Analysis</td>
                        <td className="py-4">Holistic Planning</td>
                        <td className="py-4 font-bold text-[#00A540] bg-green-50 px-2">Both</td>
                      </tr>
                      <tr className="border-b border-stone-200">
                        <td className="py-4 font-bold">Exam Rigor</td>
                        <td className="py-4">3 Exams (18 hrs)</td>
                        <td className="py-4">1 Board Exam (10 hrs)</td>
                        <td className="py-4 font-bold text-[#00A540] bg-green-50 px-2">All Passed</td>
                      </tr>
                      <tr className="border-b border-stone-200">
                        <td className="py-4 font-bold">Pass Rates</td>
                        <td className="py-4">~40-50% (Historic)</td>
                        <td className="py-4">~65%</td>
                        <td className="py-4 font-bold text-[#00A540] bg-green-50 px-2">Top Tier</td>
                      </tr>
                      <tr>
                        <td className="py-4 font-bold">Market Rarity</td>
                        <td className="py-4">&lt; 4% of Advisors</td>
                        <td className="py-4">~20% of Advisors</td>
                        <td className="py-4 font-bold text-[#00A540] bg-green-50 px-2">The Rare &lt; 1%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-center text-sm text-stone-400 mt-4 italic">
                  *Both designations require strict adherence to ethical codes and annual continuing education.
                </p>
              </div>

              {/* "Why settle for either/or?" synergy section from upgrade7 */}
              <div className="mt-16 bg-stone-100 rounded-xl py-16 px-6">
                <div className="max-w-4xl mx-auto text-center mb-12">
                  <h3 className="font-['Source_Serif_4'] text-2xl font-bold text-stone-900 mb-4">Why settle for either/or?</h3>
                  <p className="text-lg text-stone-600">
                    You get the rare advisor who blends analytic rigor with comprehensive planning.
                  </p>
                </div>
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center p-6 bg-white rounded-xl border border-stone-200 shadow-sm">
                    <div className="w-12 h-12 bg-[#00A540] rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    </div>
                    <h4 className="font-sans font-bold text-lg text-stone-900 mb-2">360&deg; Expertise</h4>
                    <p className="text-stone-600 text-sm">From complex investment strategy to life planning. No need for a separate &quot;investment guy&quot; and &quot;planning person.&quot;</p>
                  </div>
                  <div className="text-center p-6 bg-white rounded-xl border border-stone-200 shadow-sm">
                    <div className="w-12 h-12 bg-[#00A540] rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    </div>
                    <h4 className="font-sans font-bold text-lg text-stone-900 mb-2">Higher Fiduciary Standard</h4>
                    <p className="text-stone-600 text-sm">Not just a marketing promise; it is embedded in the professional codes we are sworn to follow.</p>
                  </div>
                  <div className="text-center p-6 bg-white rounded-xl border border-stone-200 shadow-sm">
                    <div className="w-12 h-12 bg-[#00A540] rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                    </div>
                    <h4 className="font-sans font-bold text-lg text-stone-900 mb-2">Continuous Improvement</h4>
                    <p className="text-stone-600 text-sm">We don&apos;t rest on minimum licenses. We stay ahead of the curve with mandatory ongoing education.</p>
                  </div>
                </div>
              </div>

              {/* "Why Both Credentials Matter" benefit cards from upgrade6 */}
              <div className="mt-16">
                <div className="text-center mb-12">
                  <h3 className="font-['Source_Serif_4'] text-2xl md:text-3xl font-bold text-stone-800">
                    Why Both Credentials Matter
                  </h3>
                  <p className="text-stone-600 mt-3 max-w-lg mx-auto">
                    No need for separate &quot;investment person&quot; and &quot;planning person&quot;&mdash;it&apos;s all integrated.
                  </p>
                </div>
                <div className="grid md:grid-cols-3 gap-6 md:gap-8">
                  {[
                    { icon: '\u25CE', title: '360\u00B0 Expertise', description: 'From complex investment strategy to holistic life planning\u2014integrated, not fragmented.' },
                    { icon: '\u25C8', title: 'Reinforced Fiduciary Duty', description: 'Both credentials embed client-first obligations into their professional codes.' },
                    { icon: '\u25C7', title: 'Continuous Excellence', description: 'Ongoing education requirements ensure current knowledge, not outdated advice.' },
                  ].map((benefit, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-xl border border-stone-200 text-center">
                      <div className="text-3xl text-[#00A540] mb-3">{benefit.icon}</div>
                      <h4 className="font-medium text-stone-800 mb-2">{benefit.title}</h4>
                      <p className="text-sm text-stone-600 leading-relaxed">{benefit.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social proof blockquote from upgrade7 */}
              <div className="mt-12 bg-stone-50 rounded-xl p-8">
                <blockquote className="max-w-3xl mx-auto text-xl md:text-2xl text-stone-700 italic font-['Source_Serif_4'] text-center">
                  &quot;The difference between advisors with top credentials and those without can be vast. Designations like CFP&reg; or CFA signal a commitment to excellence that every client deserves.&quot;
                </blockquote>
              </div>
            </div>
          </section>

          {/* ─── C.5: "What Makes This Rare" rarity stats (from upgrade6) ─── */}
          <section className="py-16 px-4 bg-stone-100">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="font-['Source_Serif_4'] text-2xl md:text-3xl font-bold text-stone-900 mb-12">
                What Makes This Rare
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-12">
                <div className="text-center py-4 sm:py-0">
                  <div className="text-4xl md:text-5xl font-light text-[#00A540]">&lt;4%</div>
                  <div className="text-sm font-medium text-stone-900 mt-2">hold CFA</div>
                  <div className="text-xs text-stone-500 mt-1">of financial advisors</div>
                </div>
                <div className="hidden sm:flex items-center justify-center">
                  <div className="w-px h-16 bg-stone-300" />
                </div>
                <div className="text-center py-4 sm:py-0">
                  <div className="text-4xl md:text-5xl font-light text-[#00A540]">~20%</div>
                  <div className="text-sm font-medium text-stone-900 mt-2">hold CFP&reg;</div>
                  <div className="text-xs text-stone-500 mt-1">of financial advisors</div>
                </div>
              </div>
              <div className="mt-8">
                <div className="text-4xl md:text-5xl font-light text-[#00A540]">&lt;1%</div>
                <div className="text-sm font-medium text-stone-900 mt-2">hold both</div>
                <div className="text-xs text-stone-500 mt-1">estimated</div>
              </div>
              <p className="mt-12 text-stone-600 text-sm max-w-xl mx-auto">
                Most advisors meet minimum licensing requirements. These credentials represent
                thousands of additional hours of study and demonstrated expertise beyond the baseline.
              </p>
            </div>
          </section>

          {/* ─── C.6: Jenny Johnson Testimonial (single copy from upgrade6/8) ─── */}
          <section className="px-6 py-12 md:py-16 bg-stone-50">
            <div className="max-w-3xl mx-auto text-center">
              <svg className="w-8 h-8 text-[#00A540] mx-auto mb-4 opacity-60" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <blockquote className="text-xl md:text-2xl font-['Source_Serif_4'] text-stone-700 leading-relaxed">
                &quot;If you hire investment professionals with a CFA, you&hellip; have confidence at the level of qualification.&quot;
              </blockquote>
              <cite className="block mt-4 text-sm text-stone-500 not-italic">
                &mdash; <span className="font-medium text-stone-600">Jenny Johnson</span>, CEO/President, Franklin Templeton
              </cite>
            </div>
          </section>

          {/* ─── C.7: Fiduciary Deep Dive (from upgrade3, upgrade5, upgrade8) ─── */}
          <section className="py-20 px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="font-['Source_Serif_4'] text-2xl sm:text-3xl font-bold text-stone-900 mb-3">
                Fiduciary + ethics: where trust becomes enforceable
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-[1fr_420px] gap-8 items-start">
                <div>
                  <p className="text-[17px] text-stone-700 max-w-prose">
                    &quot;Trust me&quot; is not a standard. A fiduciary standard is a constraint&mdash;an obligation&mdash;especially when markets are stressful
                    and incentives are noisy.
                  </p>
                  <p className="mt-4 text-[17px] text-stone-700 max-w-prose">
                    The SEC has stated that an investment adviser is a fiduciary and must act in the best interests of clients.
                    <sup className="text-[#00A540] font-semibold"><a href="#src-sec">[9]</a></sup>{' '}
                    CFP Board&apos;s standards also describe a fiduciary duty when providing financial advice.
                    <sup className="text-[#00A540] font-semibold"><a href="#src-cfp-standards">[7]</a></sup>
                  </p>
                  <div className="mt-5 p-4 border border-dashed border-stone-300 rounded-xl bg-stone-50 text-sm text-stone-600">
                    <strong className="font-extrabold">Practical takeaway:</strong>{' '}
                    Ask two questions: &quot;How are you paid?&quot; and &quot;What standard are you held to?&quot;
                    Credentials help. Transparent incentives help more.
                  </div>
                </div>

                {/* Bogle quote sidebar (from upgrade3) */}
                <aside className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
                  <h3 className="text-xl font-bold text-stone-900 mb-2">A simple quote that says it cleanly</h3>
                  <p className="text-sm text-stone-600">John C. Bogle on the point of fiduciary duty:</p>
                  <div className="mt-4 border-l-4 border-[#00A540] pl-4">
                    <p className="text-[15px] text-stone-800">
                      &quot;Investors need&hellip; assurance that their broker is putting their interests first, rather than&hellip; his own&hellip;
                      And that&apos;s what a fiduciary is and does.&quot;
                      <sup className="text-[#00A540] font-semibold"><a href="#src-bogle">[10]</a></sup>
                    </p>
                    <p className="mt-2 text-xs text-stone-500">&mdash; John C. Bogle</p>
                  </div>
                </aside>
              </div>

              {/* "Here's the difference" box from upgrade8 */}
              <div className="mt-10 bg-stone-50 border border-stone-200 rounded-xl p-6">
                <h3 className="mb-3 text-base tracking-wide font-bold text-stone-900">Here&apos;s the difference</h3>
                <p className="mb-4 text-stone-600">
                  Many advisors market trust. This page documents constraints: the standards David is held to,
                  the ethics he&apos;s bound by, and the process you should expect.
                </p>
                <ul className="pl-5 text-stone-600 list-disc space-y-2">
                  <li><strong>Conflicts</strong> get disclosed and managed, not buried in fine print.</li>
                  <li><strong>Advice</strong> should be defensible and documented&mdash;not improvised.</li>
                  <li><strong>Planning</strong> should support real-life decisions, not just a portfolio.</li>
                </ul>
              </div>

              {/* Expandable fiduciary details from upgrade8 */}
              <div className="mt-6 space-y-3">
                <details className="border border-stone-200 bg-white rounded-xl p-4">
                  <summary className="cursor-pointer font-bold list-none text-stone-900">CFP&reg; Board: Fiduciary duty (short excerpt)</summary>
                  <div className="pt-3 text-stone-600">
                    <blockquote className="my-3 py-3 px-4 border-l-4 border-stone-300 bg-stone-50 rounded-r-xl text-stone-800">
                      &quot;A CFP&reg; professional must act as a fiduciary and act in the client&apos;s best interests.&quot;
                      <div className="mt-1.5 text-[13px] text-stone-500">&mdash; CFP Board Standards (excerpt)</div>
                    </blockquote>
                    <ul className="pl-5 list-disc space-y-2">
                      <li><strong>Loyalty:</strong> your interests come before the advisor&apos;s.</li>
                      <li><strong>Care:</strong> skill, prudence, and diligence&mdash;especially when it&apos;s complex.</li>
                    </ul>
                    <p className="mt-4 text-stone-500 text-xs">
                      Tip: Always ask, &quot;How are conflicts identified, disclosed, and reduced?&quot;
                    </p>
                  </div>
                </details>

                <details className="border border-stone-200 bg-white rounded-xl p-4">
                  <summary className="cursor-pointer font-bold list-none text-stone-900">CFA Institute: Client-first + independent judgment (short excerpt)</summary>
                  <div className="pt-3 text-stone-600">
                    <blockquote className="my-3 py-3 px-4 border-l-4 border-stone-300 bg-stone-50 rounded-r-xl text-stone-800">
                      &quot;Place the integrity of the profession and clients&apos; interests above your own.&quot;
                      <div className="mt-1.5 text-[13px] text-stone-500">&mdash; CFA Institute Code &amp; Standards (excerpt)</div>
                    </blockquote>
                    <ul className="pl-5 list-disc space-y-2">
                      <li><strong>Integrity:</strong> no cute loopholes.</li>
                      <li><strong>Independence:</strong> professional judgment isn&apos;t for sale.</li>
                      <li><strong>Diligence:</strong> do the work; document the tradeoffs.</li>
                    </ul>
                  </div>
                </details>

                <details className="border border-stone-200 bg-white rounded-xl p-4">
                  <summary className="cursor-pointer font-bold list-none text-stone-900">What &quot;loyalty, prudence, and care&quot; means (plain English)</summary>
                  <div className="pt-3 text-stone-600">
                    <ul className="pl-5 list-disc space-y-2">
                      <li><strong>Loyalty:</strong> recommendations are for your benefit, not the advisor&apos;s revenue model.</li>
                      <li><strong>Prudence:</strong> disciplined decisions under uncertainty (not hot takes).</li>
                      <li><strong>Care:</strong> research-backed, explainable advice you can defend to your future self.</li>
                    </ul>
                  </div>
                </details>
              </div>

              {/* Verify credentials sidebar from upgrade8 */}
              <div className="mt-8 bg-stone-50 border border-stone-200 rounded-xl p-6">
                <h3 className="mb-3 text-base tracking-wide font-bold text-stone-900">Verify credentials</h3>
                <p className="mb-4 text-stone-600">
                  Don&apos;t take anyone&apos;s word for it. Use official directories.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a href="https://directory.cfainstitute.org/" target="_blank" rel="noopener noreferrer" className="text-sm no-underline border border-stone-200 px-3 py-2 rounded-xl bg-white hover:bg-stone-100 text-stone-700">
                    Verify CFA&reg; (CFA Institute Directory) &nearr;
                  </a>
                  <a href="https://www.cfp.net/verify-a-cfp-professional" target="_blank" rel="noopener noreferrer" className="text-sm no-underline border border-stone-200 px-3 py-2 rounded-xl bg-white hover:bg-stone-100 text-stone-700">
                    Verify CFP&reg; (CFP Board) &nearr;
                  </a>
                </div>
                <p className="mt-4 text-stone-500 text-xs">
                  External sites are maintained by CFA Institute and CFP Board. Availability and results depend on their systems.
                </p>
              </div>

              {/* Quick gut-check question from upgrade8 */}
              <div className="mt-6 bg-stone-50 border border-stone-200 rounded-xl p-6">
                <h3 className="mb-3 text-base tracking-wide font-bold text-stone-900">Quick gut-check question</h3>
                <p className="text-stone-600">
                  If your current advisor had to explain their strategy in writing&mdash;with assumptions, risks, and tradeoffs&mdash;could they?
                </p>
              </div>

              {/* Fiduciary commitment from upgrade6 */}
              <div className="mt-8 bg-stone-100 border border-stone-200 rounded-xl p-6 text-center">
                <div className="inline-flex items-center gap-2 text-[#00A540] mb-4">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium tracking-wide uppercase">100% Fiduciary</span>
                </div>
                <p className="text-stone-700 leading-relaxed max-w-3xl mx-auto">
                  Both CFA and CFP require adherence to strict ethical codes. As a fee-only fiduciary,
                  I&apos;m legally obligated to act in your best interest&mdash;not sell you products for commission.
                </p>
              </div>

              {/* Plain-English filter callout from upgrade3 */}
              <div className="mt-6 p-4 border border-dashed border-stone-300 rounded-xl bg-stone-50 text-sm text-stone-600">
                <strong className="font-extrabold">Plain-English filter:</strong>{' '}
                If an advisor can&apos;t clearly explain (1) how they&apos;re paid, (2) what standard they&apos;re held to, and
                (3) how decisions are made when markets get ugly&mdash;assume you&apos;re the product.
              </div>
            </div>
          </section>

          {/* ─── C.8: Scorecard & Fiduciary Oath (from upgrade5) ─── */}
          <section className="py-20 px-4 bg-stone-50">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-['Source_Serif_4'] text-3xl font-bold text-center text-stone-900 mb-12">The Standard You Deserve</h2>
              <div className="mb-20">
                <Scorecard />
              </div>

              {/* Fiduciary Oath (from upgrade5, single copy) */}
              <div className="bg-stone-900 text-white p-12 rounded-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-10">
                  <svg width="200" height="200" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L1 21h22L12 2zm0 3.516L20.297 19H3.703L12 5.516zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-8 font-['Source_Serif_4']">Our Fiduciary Oath</h3>
                <ul className="space-y-4 text-lg text-stone-300">
                  <li className="flex gap-3">
                    <span className="text-[#00A540]">1.</span> I will always put your best interests first.
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#00A540]">2.</span> I will act with prudence; with the skill, care, diligence, and good judgment of a professional.
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#00A540]">3.</span> I will not mislead you, and I will provide conspicuous, full and fair disclosure of all important facts.
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#00A540]">4.</span> I will fully disclose and fairly manage, in your favor, any unavoidable conflicts.
                  </li>
                </ul>
                <div className="mt-12 pt-8 border-t border-stone-700">
                  <div className="font-['Source_Serif_4'] italic text-2xl">David Van Osdol</div>
                </div>
              </div>
            </div>
          </section>

          {/* ─── C.9: Fee Chart (from upgrade5 — visual) ─── */}
          <section className="py-20 px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="font-['Source_Serif_4'] text-2xl sm:text-3xl font-bold text-stone-900 mb-3">
                The flat-fee advantage: reduce fee drag, reduce conflicts
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div className="text-[17px] text-stone-700 max-w-prose">
                  <p>
                    AUM fees can be deceptively expensive over time. A flat fee can be simpler, more predictable, and less tied to portfolio size.
                  </p>
                  <p className="mt-4">
                    Use our calculator to see how the math plays out:
                    the numbers are transparent, shareable, and hard to ignore.
                  </p>
                  <Link href="/#calculator" className="mt-4 inline-flex items-center gap-2 text-[#00A540] font-semibold hover:underline no-underline">
                    Open the fee calculator &rarr;
                  </Link>
                  <div className="mt-5 p-4 border border-dashed border-stone-300 rounded-xl bg-stone-50 text-sm text-stone-600">
                    <strong className="font-extrabold">Key insight:</strong>{' '}
                    &quot;No 1% AUM fees here. Over time, that difference can be worth hundreds of thousands.&quot;
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100">
                  <FeeChart />
                </div>
              </div>

              {/* "What you're buying" sidebar from upgrade3 */}
              <aside className="mt-8 bg-white rounded-xl shadow-sm border border-stone-200 p-6 max-w-xl">
                <h3 className="text-xl font-bold text-stone-900 mb-2">What you&apos;re buying (when it&apos;s done right)</h3>
                <ul className="mt-3 list-disc pl-6 text-sm text-stone-700 space-y-2">
                  <li><strong className="font-extrabold">Decision quality:</strong> clear tradeoffs and repeatable process</li>
                  <li><strong className="font-extrabold">Planning depth:</strong> not just portfolio performance</li>
                  <li><strong className="font-extrabold">Accountability:</strong> written standards, disclosed incentives</li>
                </ul>
              </aside>
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════════════════
              SECTION D — INDEPENDENCE & CUSTODIAN (from v0-cgpt + existing)
          ═══════════════════════════════════════════════════════════════ */}
          <section className="py-16 px-4 bg-stone-50">
            <div className="max-w-3xl mx-auto">
              <h2 className="font-['Source_Serif_4'] text-3xl font-bold text-stone-900 mb-6">
                Keep your custodian. Upgrade your advice.
              </h2>
              <p className="text-lg text-stone-700 mb-2">
                It&apos;s easy for any advisor to say &quot;objective,&quot; &quot;independent,&quot; and &quot;unconflicted.&quot;
              </p>
              <p className="text-lg text-stone-700 mb-8">
                Here&apos;s proof you can verify: <strong>we don&apos;t require you to move your money.</strong>
              </p>
              <ul className="space-y-3 mb-8 pl-2">
                {[
                  'With Fidelity? Stay with Fidelity.',
                  'With Schwab? Stay with Schwab.',
                  'Interactive Brokers? Great.',
                  'Vanguard or E*TRADE? Also fine.',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-lg text-stone-700">
                    <span className="text-[#00A540] font-bold mt-0.5">&rarr;</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-lg text-stone-600 mb-8">
                Most major custodians offer broad, overlapping menus of low-cost ETFs and mutual funds.
                We build your strategy using what&apos;s already available where you invest&mdash;so you keep control.
              </p>

              {/* Advice on your terms (from v0-cgpt) */}
              <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 mb-8">
                <h3 className="text-xl font-bold text-stone-900 mb-4">Advice on your terms</h3>
                <ul className="space-y-3 pl-2">
                  <li className="flex items-start gap-3 text-stone-700">
                    <span className="text-[#00A540] font-bold mt-0.5">&rarr;</span>
                    <span>Standard hours: Mon&ndash;Fri, 9:00 AM &ndash; 6:00 PM</span>
                  </li>
                  <li className="flex items-start gap-3 text-stone-700">
                    <span className="text-[#00A540] font-bold mt-0.5">&rarr;</span>
                    <span>Select evening appointments (rotating): until 7:00 PM</span>
                  </li>
                  <li className="flex items-start gap-3 text-stone-700">
                    <span className="text-[#00A540] font-bold mt-0.5">&rarr;</span>
                    <span>One Saturday per month: 10:00 AM &ndash; 4:00 PM</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* ─── D.2: What This Looks Like in Practice (from v0-cgpt) ─── */}
          <section className="py-16 px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="font-['Source_Serif_4'] text-3xl font-bold text-stone-900 mb-4">
                What This Looks Like in Practice
              </h2>
              <p className="text-lg text-stone-600 mb-8">Unconflicted advice means I can say things most advisors can&apos;t.</p>

              <div className="space-y-8">
                <div className="flex gap-5 pb-8 border-b border-stone-100">
                  <span className="text-3xl flex-shrink-0">&#x1F6AB;</span>
                  <div>
                    <h3 className="text-xl font-bold text-stone-900 mb-2">&quot;You don&apos;t need that product.&quot;</h3>
                    <p className="text-stone-600">I don&apos;t earn a dime from what you buy&mdash;so I&apos;ll tell you when something isn&apos;t worth it.</p>
                  </div>
                </div>
                <div className="flex gap-5 pb-8 border-b border-stone-100">
                  <span className="text-3xl flex-shrink-0">&#x1F4CD;</span>
                  <div>
                    <h3 className="text-xl font-bold text-stone-900 mb-2">&quot;Stay where you are.&quot;</h3>
                    <p className="text-stone-600">Keep your custodian, your accounts, your broker. I&apos;ll work with what you have. That&apos;s how you know the advice is unconflicted: I have no incentive to move you.</p>
                  </div>
                </div>
                <div className="flex gap-5">
                  <span className="text-3xl flex-shrink-0">&#x1F4AC;</span>
                  <div>
                    <h3 className="text-xl font-bold text-stone-900 mb-2">&quot;Here&apos;s the honest answer.&quot;</h3>
                    <p className="text-stone-600">No sales pitch. No upsell. Just the answer to your question.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ─── D.3: How this works (from v0-cgpt) ─── */}
          <section className="py-16 px-4 bg-stone-50">
            <div className="max-w-3xl mx-auto">
              <h2 className="font-['Source_Serif_4'] text-3xl font-bold text-stone-900 mb-8">
                How this works (without moving your accounts)
              </h2>

              <div className="space-y-8">
                <div className="flex gap-5 pb-8 border-b border-stone-100">
                  <div className="w-10 h-10 bg-[#00A540] text-white rounded-full flex items-center justify-center font-extrabold text-lg flex-shrink-0">1</div>
                  <div>
                    <h3 className="text-xl font-bold text-stone-900 mb-2">Start with what you already have</h3>
                    <p className="text-stone-600">You share your current holdings (statement/export). We review fees, risk, taxes, and what you&apos;re actually getting for what you pay.</p>
                  </div>
                </div>
                <div className="flex gap-5 pb-8 border-b border-stone-100">
                  <div className="w-10 h-10 bg-[#00A540] text-white rounded-full flex items-center justify-center font-extrabold text-lg flex-shrink-0">2</div>
                  <div>
                    <h3 className="text-xl font-bold text-stone-900 mb-2">Get a plan built for your current platform</h3>
                    <p className="text-stone-600">We recommend specific, low-cost funds and ETFs available at your current custodian&mdash;without forcing a transfer.</p>
                  </div>
                </div>
                <div className="flex gap-5">
                  <div className="w-10 h-10 bg-[#00A540] text-white rounded-full flex items-center justify-center font-extrabold text-lg flex-shrink-0">3</div>
                  <div>
                    <h3 className="text-xl font-bold text-stone-900 mb-2">Implement at your pace</h3>
                    <p className="text-stone-600">You stay in control. We guide execution step-by-step and keep the strategy aligned over time.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ─── D.4: FAQ (from v0-cgpt) ─── */}
          <section className="py-16 px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="font-['Source_Serif_4'] text-3xl font-bold text-stone-900 mb-8">FAQ</h2>

              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-bold text-stone-900 mb-2">Do I need to transfer my accounts?</h3>
                  <p className="text-stone-600">No. Your accounts can stay with your current broker/custodian. That&apos;s the point&mdash;independence you can verify.</p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-stone-900 mb-2">What custodians do you work with?</h3>
                  <p className="text-stone-600">Most major brokerages offer broad menus of low-cost ETFs and mutual funds. If you&apos;re at a large, reputable platform, you&apos;re typically already in a great place.</p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-stone-900 mb-2">Do you sell products or earn commissions?</h3>
                  <p className="text-stone-600">No. We don&apos;t earn commissions and we don&apos;t get paid by what you buy. We charge a flat monthly fee, so incentives don&apos;t change based on your portfolio size or product selection.</p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-stone-900 mb-2">Why does staying with my custodian matter?</h3>
                  <p className="text-stone-600">Because it removes the most common conflict: an advisor who needs your assets on their platform to get paid. Keeping your assets where they are makes it easier to verify the relationship is advice-first.</p>
                </div>
              </div>
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════════════════
              SOURCES (from upgrade3)
          ═══════════════════════════════════════════════════════════════ */}
          <section id="sources" className="py-16 px-4 bg-stone-50">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-['Source_Serif_4'] text-2xl sm:text-3xl font-bold text-stone-900 mb-6">
                Sources (the &quot;don&apos;t take our word for it&quot; section)
              </h2>

              <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 sm:p-8">
                <ol className="list-decimal pl-6 space-y-3 text-sm text-stone-700">
                  <li id="src-cfa-program">
                    CFA Institute &mdash; CFA Program overview (&quot;Join more than 200,000&hellip;&quot;).<br />
                    <a className="text-[#00A540] hover:underline" href="https://www.cfainstitute.org/programs/cfa-program" target="_blank" rel="noopener">
                      https://www.cfainstitute.org/programs/cfa-program
                    </a>
                  </li>
                  <li id="src-cfa-exam">
                    CFA Institute &mdash; CFA Program exam (exam session time details).<br />
                    <a className="text-[#00A540] hover:underline" href="https://www.cfainstitute.org/programs/cfa-program/exam" target="_blank" rel="noopener">
                      https://www.cfainstitute.org/programs/cfa-program/exam
                    </a>
                  </li>
                  <li id="src-cfa-pass">
                    CFA Institute &mdash; Exam results / pass rates (published by level and window).<br />
                    <a className="text-[#00A540] hover:underline" href="https://www.cfainstitute.org/programs/cfa-program/candidate-resources/exam-results" target="_blank" rel="noopener">
                      https://www.cfainstitute.org/programs/cfa-program/candidate-resources/exam-results
                    </a>
                  </li>
                  <li id="src-cfa-ethics">
                    CFA Institute &mdash; Code of Ethics &amp; Standards of Professional Conduct (PDF).<br />
                    <a className="text-[#00A540] hover:underline" href="https://www.cfainstitute.org/sites/default/files/-/media/documents/code/code-ethics-standards/code-of-ethics-standards-professional-conduct.pdf" target="_blank" rel="noopener">
                      CFA Institute Code &amp; Standards (PDF)
                    </a>
                  </li>
                  <li id="src-cfp-format">
                    CFP Board &mdash; CFP&reg; exam format (170 questions; two 3-hour sessions).<br />
                    <a className="text-[#00A540] hover:underline" href="https://www.cfp.net/certification-process/exam-requirement/about-the-cfp-exam/exam-format" target="_blank" rel="noopener">
                      https://www.cfp.net/.../exam-format
                    </a>
                  </li>
                  <li id="src-cfp-exp">
                    CFP Board &mdash; Experience requirement (6,000 hours / 4,000 apprenticeship).<br />
                    <a className="text-[#00A540] hover:underline" href="https://www.cfp.net/certification-process/experience-requirement" target="_blank" rel="noopener">
                      https://www.cfp.net/.../experience-requirement
                    </a>
                  </li>
                  <li id="src-cfp-standards">
                    CFP Board &mdash; Roadmap to the Code &amp; Standards (fiduciary duty language, PDF).<br />
                    <a className="text-[#00A540] hover:underline" href="https://www.cfp.net/-/media/files/cfp-board/standards-and-ethics/roadmap-to-code-and-standards.pdf" target="_blank" rel="noopener">
                      CFP Board Roadmap (PDF)
                    </a>
                  </li>
                  <li id="src-cfp-pop">
                    CFP Board &mdash; CFP&reg; population surpassing 103,000 in 2024 (CFP Board news page).<br />
                    <a className="text-[#00A540] hover:underline" href="https://www.cfp.net/news/2025/04/investmentnews-honors-top-financial-planners-across-the-us" target="_blank" rel="noopener">
                      CFP Board news reference
                    </a>
                  </li>
                  <li id="src-sec">
                    U.S. SEC &mdash; &quot;Commission Interpretation Regarding Standard of Conduct for Investment Advisers&quot; (PDF).<br />
                    <a className="text-[#00A540] hover:underline" href="https://www.sec.gov/files/rules/interp/2019/ia-5248.pdf" target="_blank" rel="noopener">
                      https://www.sec.gov/.../ia-5248.pdf
                    </a>
                  </li>
                  <li id="src-bogle">
                    MarketWatch (2016) &mdash; John C. Bogle quote on fiduciary assurance.<br />
                    <a className="text-[#00A540] hover:underline" href="https://www.marketwatch.com/story/finally-john-bogles-dream-of-a-fiduciary-standard-will-come-true-2016-03-31" target="_blank" rel="noopener">
                      MarketWatch article
                    </a>
                  </li>
                </ol>
              </div>
            </div>
          </section>


        </main>
      </div>
    </>
  );
}
