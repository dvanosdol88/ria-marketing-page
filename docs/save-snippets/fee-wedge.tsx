{/* THE FEE WEDGE — from /save3 */}
{/* Original: dark bg section with Chart.js doughnut chart */}
{/* Needs: impactChartRef, Chart.js doughnut, calculateGrowth() results */}

<section id="analysis" className="scroll-mt-24 bg-slate-900 rounded-2xl p-8 sm:p-12 text-white">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
            <h2 className="text-3xl font-bold text-white mb-6">The &quot;Fee Wedge&quot; Effect</h2>
            <p className="text-slate-300 text-lg mb-6">
                The chart to the right illustrates the &quot;Wedge.&quot; It is the invisible money that vanishes from your account. 
            </p>
            <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                    <span className="bg-red-500 rounded-full w-2 h-2 mt-2 mr-3 flex-shrink-0"></span>
                    <div>
                        <strong className="text-white block">Compounding works both ways</strong>
                        <span className="text-slate-400 text-sm">You pay fees on your principal, but you also lose the growth that the fee money would have earned had it stayed invested.</span>
                    </div>
                </li>
                <li className="flex items-start">
                    <span className="bg-red-500 rounded-full w-2 h-2 mt-2 mr-3 flex-shrink-0"></span>
                    <div>
                        <strong className="text-white block">The 2% Fallacy</strong>
                        <span className="text-slate-400 text-sm">A 2% fee doesn&apos;t reduce your ending wealth by 2%. Over 30 years, a 2% annual fee can consume over <strong>40% of your total potential returns</strong>.</span>
                    </div>
                </li>
                <li className="flex items-start">
                    <span className="bg-red-500 rounded-full w-2 h-2 mt-2 mr-3 flex-shrink-0"></span>
                    <div>
                        <strong className="text-white block">Zero Risk, guaranteed loss</strong>
                        <span className="text-slate-400 text-sm">Fees are the only aspect of investing where you pay 100% of the cost regardless of whether the fund performs well or poorly.</span>
                    </div>
                </li>
            </ul>
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                <div className="text-sm text-slate-400 mb-1">Key Insight from Research</div>
                <div className="text-white italic">&quot;Expense ratios are the most reliable predictor of future performance.&quot; — Morningstar</div>
            </div>
        </div>

        <div className="bg-white rounded-xl p-4 text-slate-900">
            <h3 className="text-center font-bold mb-2">Percentage of Total Gains Consumed by Fees</h3>
            <div className="chart-container">
                <canvas id="impactChart"></canvas>
            </div>
            <div className="text-center text-xs text-slate-500 mt-2">
                Impact of different fee levels over a 30-year horizon (7% Gross Return)
            </div>
        </div>
    </div>
</section>
