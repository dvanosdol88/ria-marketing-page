{/* CONCEPT B: "The Only Lever You Can Pull" — from /save1 */}
{/* Original: standalone CDN page with Montserrat/Open Sans fonts */}

<section>
    <div className="max-w-4xl mx-auto text-center mb-10">
        <h2 className="text-3xl font-bold text-slate-900 heading-font">Concept B: The Only Lever You Can Pull</h2>
        <p className="text-slate-600 max-w-2xl mx-auto mt-4">
            According to the <strong>Wall Street Journal</strong>, most investors obsess over things they cannot control (market returns) and ignore the one thing they can (fees).
        </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Uncontrollable Side */}
        <div className="card bg-slate-50 border border-slate-200 p-8 opacity-75">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-500">The Uncontrollables</h3>
                <span className="text-3xl">🎲</span>
            </div>
            <ul className="space-y-4">
                <li className="flex items-center">
                    <span className="h-2 w-2 bg-slate-400 rounded-full mr-3"></span>
                    <span className="text-slate-500">Market Direction (Bull/Bear)</span>
                </li>
                <li className="flex items-center">
                    <span className="h-2 w-2 bg-slate-400 rounded-full mr-3"></span>
                    <span className="text-slate-500">Interest Rates</span>
                </li>
                <li className="flex items-center">
                    <span className="h-2 w-2 bg-slate-400 rounded-full mr-3"></span>
                    <span className="text-slate-500">Inflation</span>
                </li>
                <li className="flex items-center">
                    <span className="h-2 w-2 bg-slate-400 rounded-full mr-3"></span>
                    <span className="text-slate-500">Short-term Volatility</span>
                </li>
            </ul>
        </div>

        {/* Controllable Side */}
        <div className="card bg-white border-2 border-cyan-400 p-8 shadow-xl transform scale-105">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900">The Controllables</h3>
                <span className="text-3xl">🎛️</span>
            </div>
            <ul className="space-y-4">
                <li className="flex items-center">
                    <span className="h-3 w-3 bg-cyan-500 rounded-full mr-3"></span>
                    <span className="text-lg font-bold text-slate-800">FEES & COSTS</span>
                </li>
                <li className="flex items-center">
                    <span className="h-3 w-3 bg-cyan-500 rounded-full mr-3"></span>
                    <span className="text-lg font-bold text-slate-800">Diversification</span>
                </li>
                <li className="flex items-center">
                    <span className="h-3 w-3 bg-cyan-500 rounded-full mr-3"></span>
                    <span className="text-lg font-bold text-slate-800">Time in Market</span>
                </li>
                <li className="flex items-center">
                    <span className="h-3 w-3 bg-cyan-500 rounded-full mr-3"></span>
                    <span className="text-lg font-bold text-slate-800">Asset Allocation</span>
                </li>
            </ul>
            <div className="mt-6 pt-6 border-t border-slate-100">
                <p className="italic text-slate-600 text-sm">&quot;Fees are one of the few things in investing that are entirely within your control.&quot; — Wall Street Journal</p>
            </div>
        </div>
    </div>
</section>
