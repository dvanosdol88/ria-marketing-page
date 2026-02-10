'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  Legend,
  ReferenceLine,
  Area,
  AreaChart,
} from 'recharts';

// --- VISUAL 1: FEE CHART COMPONENT ---
const FeeChart = () => {
  const initialPrincipal = 1000000;
  const growthRate = 0.08;
  const feeRate = 0.01;

  const data = [];
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
          <XAxis
            dataKey="year"
            tick={{ fontSize: 12 }}
            tickLine={false}
            interval={4}
          />
          <YAxis
            tickFormatter={formatValue}
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            formatter={(value: number) => formatValue(value)}
            labelStyle={{ fontWeight: 'bold' }}
          />
          <Area
            type="monotone"
            dataKey="noFee"
            stackId="1"
            stroke="#34A853"
            fill="#34A853"
            fillOpacity={0.3}
            name="Potential (No Fee)"
          />
          <Area
            type="monotone"
            dataKey="withFee"
            stackId="2"
            stroke="#4285F4"
            fill="#4285F4"
            fillOpacity={0.6}
            name="Realized (1% Fee)"
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-4 mt-4 text-sm justify-center">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#34A853]"></span>
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

// --- VISUAL 2: CFA FUNNEL COMPONENT (using horizontal bar chart) ---
const CFAFunnel = () => {
  const data = [
    { stage: 'Enrolled Candidates', value: 100, fill: '#E8F0FE' },
    { stage: 'Passed Level I', value: 43, fill: '#D2E3FC' },
    { stage: 'Passed Level II', value: 26, fill: '#A8C7FA' },
    { stage: 'Charter Awarded', value: 18, fill: '#1A73E8' },
  ];

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
          <YAxis type="category" dataKey="stage" tick={{ fontSize: 13 }} width={100} />
          <Tooltip formatter={(value: number) => `${value}%`} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="text-center text-sm text-neutral-500 mt-2">
        Fewer than 1 in 5 candidates ever earn the charter.
      </p>
    </div>
  );
};

// --- VISUAL 3: ADVISOR MATRIX COMPONENT ---
const AdvisorMatrix = () => {
  const quadrantData = [
    { name: 'Insurance Agent', x: 2, y: 2, color: '#9AA0A6' },
    { name: 'Robo-Advisor', x: 3, y: 6, color: '#9AA0A6' },
    { name: 'Wirehouse Advisor', x: 5, y: 5, color: '#9AA0A6' },
    { name: 'CFP® Only', x: 8, y: 4, color: '#FBBC04' },
    { name: 'CFA® Only', x: 4, y: 8, color: '#FBBC04' },
    { name: 'CFA® + CFP®', x: 8.5, y: 8.5, color: '#1A73E8' },
  ];

  return (
    <div className="w-full relative">
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-xs text-neutral-500 font-medium">
        Investment Rigor →
      </div>
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 -rotate-90 text-xs text-neutral-500 font-medium">
        Holistic Planning →
      </div>
      <div className="bg-neutral-50 rounded-xl p-6">
        <div className="grid grid-cols-2 gap-4 h-[350px]">
          {/* Top Right - Best */}
          <div className="bg-blue-50 rounded-lg p-4 flex flex-col justify-between border border-blue-100">
            <span className="text-xs text-blue-600 font-semibold">High Rigor + Holistic</span>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-600"></span>
              <span className="text-sm font-medium">CFA® + CFP®</span>
            </div>
          </div>
          {/* Top Left */}
          <div className="bg-neutral-100 rounded-lg p-4 flex flex-col justify-between">
            <span className="text-xs text-neutral-500">High Rigor Only</span>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
              <span className="text-sm text-neutral-600">CFA® Only</span>
            </div>
          </div>
          {/* Bottom Right */}
          <div className="bg-neutral-100 rounded-lg p-4 flex flex-col justify-between">
            <span className="text-xs text-neutral-500">Holistic Only</span>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
              <span className="text-sm text-neutral-600">CFP® Only</span>
            </div>
          </div>
          {/* Bottom Left */}
          <div className="bg-neutral-50 rounded-lg p-4 flex flex-col justify-between border border-neutral-200">
            <span className="text-xs text-neutral-400">Basic</span>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-neutral-400"></span>
                <span className="text-xs text-neutral-500">Insurance Agent</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-neutral-400"></span>
                <span className="text-xs text-neutral-500">Wirehouse Advisor</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- VISUAL 4: SCORECARD COMPONENT ---
const Scorecard = () => (
  <div className="w-full overflow-hidden border border-neutral-200 rounded-lg shadow-sm">
    <div className="grid grid-cols-[1fr_1.2fr_1.2fr] text-sm md:text-base">
      {/* Header */}
      <div className="p-4 font-bold text-neutral-600 border-b bg-neutral-50 flex items-end">FEATURE</div>
      <div className="p-4 font-bold text-neutral-600 border-b bg-neutral-50 flex flex-col justify-end">
        BROKER/DEALER <span className="text-xs font-normal opacity-70">(Industry Norm)</span>
      </div>
      <div className="p-4 font-bold text-green-700 border-b border-green-200 bg-green-50 flex flex-col justify-end">
        TRUE FIDUCIARY <span className="text-xs font-normal opacity-70 text-neutral-600">(Our Standard)</span>
      </div>

      {/* Row 1 */}
      <div className="p-4 border-b border-neutral-100 font-medium">Legal Standard</div>
      <div className="p-4 border-b border-neutral-100 flex items-center gap-2">
        <span className="text-red-500">✕</span> Suitability <span className="text-xs opacity-50">(Good enough)</span>
      </div>
      <div className="p-4 border-b border-green-200 bg-green-50/50 flex items-center gap-2 font-medium">
        <span className="text-green-600">✓</span> Fiduciary <span className="text-xs opacity-75">(Best Interest)</span>
      </div>

      {/* Row 2 */}
      <div className="p-4 border-b border-neutral-100 font-medium">Compensation</div>
      <div className="p-4 border-b border-neutral-100">Commissions &amp; % Fees</div>
      <div className="p-4 border-b border-green-200 bg-green-50/50 font-medium">Flat Fee Only</div>

      {/* Row 3 */}
      <div className="p-4 border-b border-neutral-100 font-medium">Products</div>
      <div className="p-4 border-b border-neutral-100">Proprietary / Incentivized</div>
      <div className="p-4 border-b border-green-200 bg-green-50/50 font-medium">Entire Market</div>

      {/* Row 4 */}
      <div className="p-4 font-medium">Conflicts</div>
      <div className="p-4">Buried in fine print</div>
      <div className="p-4 bg-green-50/50 font-medium">Open &amp; Transparent</div>
    </div>
  </div>
);

// --- MAIN PAGE COMPONENT ---
export default function Upgrade5() {
  return (
    <main className="min-h-screen bg-white text-neutral-900 font-sans selection:bg-blue-100">

      {/* 1. HERO SECTION: The Manifesto */}
      <section className="relative px-6 py-24 md:py-32 max-w-5xl mx-auto text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-blue-50/50 to-transparent -z-10 rounded-full blur-3xl" />

        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-8">
          We Answer to One Person.
        </h1>
        <p className="text-xl md:text-2xl text-neutral-600 leading-relaxed max-w-3xl mx-auto">
          It isn&apos;t a sales manager, a fund provider, or a shareholder.<br />
          <span className="font-semibold text-neutral-900">It is you.</span>
        </p>

        <div className="mt-12 text-lg text-neutral-600 max-w-3xl mx-auto">
          <p className="mb-6">
            The <strong>Fiduciary Standard</strong> isn&apos;t just a badge we wear. It&apos;s the legal and ethical bedrock of our entire firm. No commissions. No hidden incentives. Just advice.
          </p>
          <p>
             Most advisors are incentivized to keep your money. We are incentivized to keep your trust.
          </p>
        </div>
      </section>

      {/* 2. THE PROBLEM: The Cost of Non-Fiduciary Advice */}
      <section className="px-6 py-20 bg-neutral-50">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">The High Cost of &quot;Standard&quot; Advice</h2>
            <p className="text-lg text-neutral-600 mb-4">
              A 1% fee sounds small. But over 20 years, it acts as a massive wealth transfer—moving hundreds of thousands of dollars from your family to your advisor.
            </p>
            <p className="text-lg text-neutral-600">
              Minimizing cost is not just about saving money; it is a <strong>fiduciary act of prudence</strong>. Prudence dictates that we should not waste your assets.
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
            <FeeChart />
          </div>
        </div>
      </section>

      {/* 3. HARD SKILLS: CFA Section */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1 bg-white p-2 rounded-xl">
             <CFAFunnel />
          </div>
          <div className="order-1 md:order-2">
            <h2 className="text-3xl font-bold mb-6">The Science of Wealth Management</h2>
            <h3 className="text-xl text-blue-600 font-medium mb-4">Chartered Financial Analyst (CFA®)</h3>
            <p className="text-neutral-600 mb-6">
              Investing is not a guessing game. It is a discipline grounded in economics, quantitative analysis, and behavioral science.
            </p>
            <p className="text-neutral-600 mb-6">
              The CFA charter is widely regarded as the <strong>&quot;Gold Standard&quot;</strong> of the investment profession. The curriculum covers over 9,000 pages of advanced finance and takes an average of 4 years to complete.
            </p>
            <blockquote className="border-l-4 border-blue-600 pl-4 italic text-neutral-700 bg-blue-50/50 py-2 pr-2 rounded-r">
              &quot;The most respected and recognized investment designation in the world.&quot;
              <footer className="text-xs text-neutral-500 mt-2 not-italic">— Financial Times</footer>
            </blockquote>
          </div>
        </div>
      </section>

      {/* 4. SOFT SKILLS: CFP Section */}
      <section className="px-6 py-20 bg-neutral-50">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">The Art of Life Planning</h2>
            <h3 className="text-xl text-blue-600 font-medium mb-4">Certified Financial Planner (CFP®)</h3>
            <p className="text-neutral-600 mb-6">
              Your money doesn&apos;t exist in a vacuum. It exists to support your life, your family, and your legacy.
            </p>
            <p className="text-neutral-600 mb-6">
              While the CFA ensures your <em>investments</em> are sound, the CFP ensures your <em>plan</em> is sound. We are trained in the <strong>Psychology of Financial Planning</strong>, helping you navigate fear and anxiety to make rational decisions.
            </p>
            <p className="font-medium text-neutral-900">
              We don&apos;t just plan for your money. We plan for your peace of mind.
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
            <AdvisorMatrix />
          </div>
        </div>
      </section>

      {/* 5. COMPARISON & OATH */}
      <section className="px-6 py-20 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">The Standard You Deserve</h2>

        <div className="mb-20">
          <Scorecard />
        </div>

        <div className="bg-neutral-900 text-white p-12 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-10">
            <svg width="200" height="200" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L1 21h22L12 2zm0 3.516L20.297 19H3.703L12 5.516zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z"/>
            </svg>
          </div>

          <h3 className="text-2xl font-bold mb-8 font-serif">Our Fiduciary Oath</h3>
          <ul className="space-y-4 text-lg text-neutral-300">
            <li className="flex gap-3">
              <span className="text-green-400">1.</span> I will always put your best interests first.
            </li>
            <li className="flex gap-3">
              <span className="text-green-400">2.</span> I will act with prudence; with the skill, care, diligence, and good judgment of a professional.
            </li>
            <li className="flex gap-3">
              <span className="text-green-400">3.</span> I will not mislead you, and I will provide conspicuous, full and fair disclosure of all important facts.
            </li>
            <li className="flex gap-3">
              <span className="text-green-400">4.</span> I will fully disclose and fairly manage, in your favor, any unavoidable conflicts.
            </li>
          </ul>

          <div className="mt-12 pt-8 border-t border-neutral-700 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="font-serif italic text-2xl">David Van Osdol</div>
            <a
              href="https://calendly.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-neutral-900 px-8 py-3 rounded-full font-semibold hover:bg-neutral-200 transition-colors no-underline"
            >
              Start the Conversation
            </a>
          </div>
        </div>
      </section>

    </main>
  );
}
