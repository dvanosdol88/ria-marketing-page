import Link from "next/link";

export const metadata = {
  title: "Our Math | Smarter Way Wealth",
  description: "The formulas and methodology behind our fee comparison calculator.",
};

export default function OurMathPage() {
  return (
    <main className="pb-20">
      <header className="section-shell pt-12 pb-8">
        <p className="text-xs font-semibold uppercase tracking-tightish text-brand-600">
          For finance nerds
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-neutral-900 sm:text-5xl">
          How the calculator works
        </h1>
        <p className="mt-4 text-lg text-neutral-600 max-w-2xl">
          Our savings calculator compares two scenarios: keeping your current
          AUM-based advisor vs. switching to Smarter Way Wealth&apos;s $100/month flat fee. Here
          is the exact math.
        </p>
        <div className="mt-6">
          <Link
            href="/"
            className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
          >
            Back to calculator
          </Link>
        </div>
      </header>

      <div className="section-shell flex flex-col gap-10 max-w-3xl">
        {/* Monthly compounding */}
        <section className="card p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">
            Monthly compounding
          </h2>
          <p className="text-sm text-neutral-600 mb-4">
            Both scenarios compound monthly using a true monthly equivalent of
            your selected annual growth rate. This is more accurate than annual
            compounding because fees and growth happen continuously throughout
            the year.
          </p>
          <div className="bg-neutral-50 rounded-lg p-4 font-mono text-sm text-neutral-800 overflow-x-auto">
            <p>r<sub>monthly</sub> = (1 + r<sub>annual</sub>)<sup>1/12</sup> &minus; 1</p>
            <p className="mt-2 text-neutral-500">
              Example: 8% annual &rarr; (1.08)<sup>1/12</sup> &minus; 1 &asymp; 0.6434% per month
            </p>
          </div>
        </section>

        {/* Scenario A */}
        <section className="card p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-brand-700 mb-4">
            Scenario A: Smarter Way Wealth flat fee ($100/month)
          </h2>
          <p className="text-sm text-neutral-600 mb-4">
            Each month, the portfolio grows by the monthly rate, then $100 is
            deducted. The dollar cost is fixed regardless of portfolio size.
          </p>
          <div className="bg-neutral-50 rounded-lg p-4 font-mono text-sm text-neutral-800 overflow-x-auto space-y-1">
            <p>balance<sub>0</sub> = initial portfolio</p>
            <p className="mt-2">For each month <em>m</em> = 1 to N &times; 12:</p>
            <p className="ml-4">balance<sub>m</sub> = balance<sub>m&minus;1</sub> &times; (1 + r<sub>monthly</sub>) &minus; $100</p>
          </div>
          <p className="text-sm text-neutral-500 mt-3">
            Total flat fees = $100 &times; total months = $1,200 &times; years
          </p>
        </section>

        {/* Scenario B */}
        <section className="card p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-slate-700 mb-4">
            Scenario B: Traditional AUM advisor
          </h2>
          <p className="text-sm text-neutral-600 mb-4">
            Each month, the portfolio grows by the monthly rate, then a
            proportional share of the annual AUM fee is deducted. The dollar
            cost scales with the portfolio &mdash; the larger it grows, the more
            you pay.
          </p>
          <div className="bg-neutral-50 rounded-lg p-4 font-mono text-sm text-neutral-800 overflow-x-auto space-y-1">
            <p>aum<sub>monthly</sub> = annual AUM% / 12</p>
            <p className="mt-2">For each month <em>m</em> = 1 to N &times; 12:</p>
            <p className="ml-4">gross<sub>m</sub> = balance<sub>m&minus;1</sub> &times; (1 + r<sub>monthly</sub>)</p>
            <p className="ml-4">fee<sub>m</sub> = gross<sub>m</sub> &times; aum<sub>monthly</sub></p>
            <p className="ml-4">balance<sub>m</sub> = gross<sub>m</sub> &minus; fee<sub>m</sub></p>
          </div>
          <p className="text-sm text-neutral-500 mt-3">
            Equivalently: balance<sub>m</sub> = balance<sub>m&minus;1</sub> &times;
            (1 + r<sub>monthly</sub>) &times; (1 &minus; aum<sub>monthly</sub>)
          </p>
        </section>

        {/* Savings */}
        <section className="card p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">
            Your savings
          </h2>
          <div className="bg-neutral-50 rounded-lg p-4 font-mono text-sm text-neutral-800 overflow-x-auto space-y-1">
            <p>savings = Smarter Way Wealth ending balance &minus; AUM ending balance</p>
          </div>
          <p className="text-sm text-neutral-600 mt-4">
            This is the additional wealth you keep by paying a fixed $100/month
            instead of a percentage of your growing portfolio. The difference
            compounds over time because every dollar not lost to fees continues
            earning returns.
          </p>
        </section>

        {/* Worked example */}
        <section className="card p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">
            Worked example
          </h2>
          <p className="text-sm text-neutral-600 mb-4">
            $1,000,000 portfolio &bull; 8% annual growth &bull; 1% AUM fee &bull; 20 years
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-neutral-500 uppercase border-b border-neutral-200">
                <tr>
                  <th className="py-2 pr-4">Year</th>
                  <th className="py-2 pr-4">With Smarter Way Wealth ($100/mo)</th>
                  <th className="py-2 pr-4">With 1% AUM</th>
                  <th className="py-2">Savings</th>
                </tr>
              </thead>
              <tbody className="text-neutral-700">
                <tr className="border-b border-neutral-100">
                  <td className="py-2 pr-4">0</td>
                  <td className="py-2 pr-4">$1,000,000</td>
                  <td className="py-2 pr-4">$1,000,000</td>
                  <td className="py-2">&mdash;</td>
                </tr>
                <tr className="border-b border-neutral-100">
                  <td className="py-2 pr-4">5</td>
                  <td className="py-2 pr-4">$1,450,305</td>
                  <td className="py-2 pr-4">$1,400,498</td>
                  <td className="py-2 text-brand-700 font-medium">$49,807</td>
                </tr>
                <tr className="border-b border-neutral-100">
                  <td className="py-2 pr-4">10</td>
                  <td className="py-2 pr-4">$2,108,568</td>
                  <td className="py-2 pr-4">$1,961,399</td>
                  <td className="py-2 text-brand-700 font-medium">$147,169</td>
                </tr>
                <tr className="border-b border-neutral-100">
                  <td className="py-2 pr-4">20</td>
                  <td className="py-2 pr-4">$4,478,105</td>
                  <td className="py-2 pr-4">$3,842,165</td>
                  <td className="py-2 text-brand-700 font-semibold">$635,940</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-neutral-500 mt-4">
            Total flat fees paid: $24,000. Total AUM fees paid: ~$399,084.
          </p>
        </section>

        {/* Assumptions */}
        <section className="card p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">
            Assumptions &amp; limitations
          </h2>
          <ul className="text-sm text-neutral-600 space-y-2 list-disc list-inside">
            <li>Constant annual rate of return (no sequence-of-returns risk).</li>
            <li>No taxes, inflation adjustments, or withdrawals modeled.</li>
            <li>No additional contributions during the projection period.</li>
            <li>AUM fee divided linearly across 12 months (industry standard).</li>
            <li>Fees deducted after growth is applied each month.</li>
            <li>
              This calculator is for illustration only and does not constitute
              financial advice. Past performance does not guarantee future results.
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
