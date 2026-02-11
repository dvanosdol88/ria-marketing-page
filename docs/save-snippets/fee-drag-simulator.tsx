{/* FEE DRAG SIMULATOR — from /save3 */}
{/* Original: standalone CDN page with Inter/Merriweather, Chart.js line chart */}
{/* State variables needed: investment, years, returnRate, highFee, lowFee (0.1) */}
{/* Also needs: calculateGrowth(), formatCurrency(), growthChartRef, Chart.js */}

<section id="simulator" className="scroll-mt-24">
    <div className="max-w-3xl mx-auto text-center mb-10">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">The Fee Drag Simulator</h2>
        <p className="text-lg text-slate-600">
            Use this interactive tool to visualize how fees erode compound interest. Adjust the sliders to see the impact on your ending portfolio balance. Notice how the gap widens significantly over time.
        </p>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls */}
        <div className="lg:col-span-4 bg-white p-6 rounded-xl border border-stone-200 shadow-sm h-fit">
            <h3 className="text-lg font-bold text-slate-900 mb-6 border-b pb-2">Input Assumptions</h3>
            <div className="space-y-6">
                <div>
                    <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium text-slate-700">Initial Investment</label>
                        <span className="text-sm font-bold text-slate-900">{formatCurrency(investment)}</span>
                    </div>
                    <input type="range" min="10000" max="1000000" step="5000" value={investment}
                        onChange={(e) => setInvestment(Number(e.target.value))}
                        className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer" />
                </div>
                <div>
                    <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium text-slate-700">Time Horizon (Years)</label>
                        <span className="text-sm font-bold text-slate-900">{years} Years</span>
                    </div>
                    <input type="range" min="5" max="50" step="1" value={years}
                        onChange={(e) => setYears(Number(e.target.value))}
                        className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer" />
                </div>
                <div>
                    <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium text-slate-700">Gross Annual Return</label>
                        <span className="text-sm font-bold text-slate-900">{returnRate}%</span>
                    </div>
                    <input type="range" min="3" max="12" step="0.1" value={returnRate}
                        onChange={(e) => setReturnRate(Number(e.target.value))}
                        className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer" />
                    <p className="text-xs text-stone-500 mt-1">Historical equity average approx. 7-10%</p>
                </div>
                <div className="pt-4 border-t border-stone-100">
                    <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium text-slate-700">High Fee Fund Cost</label>
                        <span className="text-sm font-bold text-red-600">{highFee.toFixed(2)}%</span>
                    </div>
                    <input type="range" min="0.5" max="3.0" step="0.05" value={highFee}
                        onChange={(e) => setHighFee(Number(e.target.value))}
                        className="w-full h-2 bg-red-100 rounded-lg appearance-none cursor-pointer" />
                    <p className="text-xs text-stone-500 mt-1">Typical active fund + advisor fee range.</p>
                </div>
            </div>
            <div className="mt-8 bg-stone-50 rounded-lg p-4 border border-stone-200">
                <div className="text-xs font-semibold text-stone-500 uppercase mb-1">Total Lost to Fees</div>
                <div className="text-3xl font-extrabold text-red-600">{formatCurrency(lostWealth)}</div>
                <div className="text-xs text-stone-500 mt-2">
                    This is money that went to fees and the <em>growth that money would have earned</em>.
                </div>
            </div>
        </div>

        {/* Visualization */}
        <div className="lg:col-span-8 bg-white p-6 rounded-xl border border-stone-200 shadow-sm flex flex-col">
            <div className="mb-4 flex justify-between items-end">
                <h3 className="text-lg font-bold text-slate-900">Wealth Trajectory Analysis</h3>
            </div>
            <div className="chart-container flex-grow">
                <canvas id="growthChart"></canvas>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="p-3 bg-slate-50 rounded border border-slate-100">
                    <div className="text-xs text-slate-500">Low Fee Ending Balance</div>
                    <div className="text-lg font-bold text-slate-900">{formatCurrency(results.finalLow)}</div>
                </div>
                <div className="p-3 bg-red-50 rounded border border-red-100">
                    <div className="text-xs text-red-600">High Fee Ending Balance</div>
                    <div className="text-lg font-bold text-red-700">{formatCurrency(results.finalHigh)}</div>
                </div>
            </div>
        </div>
    </div>
</section>
