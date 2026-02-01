'use client';

import React, { useEffect, useState, useRef } from 'react';
import Script from 'next/script';

export default function Save3Page() {
  const [chartLoaded, setChartLoaded] = useState(false);
  
  // State for calculator
  const [investment, setInvestment] = useState(100000);
  const [years, setYears] = useState(30);
  const [returnRate, setReturnRate] = useState(7.0);
  const [highFee, setHighFee] = useState(2.0);
  const lowFee = 0.1; // Benchmark low fee ETF

  // Chart references to manage instances
  const growthChartRef = useRef<any>(null);
  const impactChartRef = useRef<any>(null);

  // Tab State
  const [activeTab, setActiveTab] = useState<'academic' | 'media' | 'industry'>('academic');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // --- Formatters ---
  const formatCurrency = (num: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);

  // --- Core Calculation Logic ---
  const calculateGrowth = React.useCallback(() => {
    const dataLow = [];
    const dataHigh = [];
    const labels = [];
    
    let currentLow = investment;
    let currentHigh = investment;
    
    // Adjust return rates for fees
    const rateLow = (returnRate - lowFee) / 100;
    const rateHigh = (returnRate - highFee) / 100;

    for (let i = 0; i <= years; i++) {
        labels.push(`Year ${i}`);
        dataLow.push(currentLow);
        dataHigh.push(currentHigh);

        // Compound for next year
        currentLow = currentLow * (1 + rateLow);
        currentHigh = currentHigh * (1 + rateHigh);
    }

    return { labels, dataLow, dataHigh, finalLow: currentLow, finalHigh: currentHigh };
  }, [investment, years, returnRate, highFee, lowFee]);

  // Effect to update charts when inputs change or library loads
  useEffect(() => {
    if (chartLoaded && typeof window !== 'undefined' && (window as any).Chart) {
      const Chart = (window as any).Chart;
      const results = calculateGrowth();

      // --- 1. Growth Chart ---
      const ctxGrowth = document.getElementById('growthChart') as HTMLCanvasElement;
      if (ctxGrowth) {
        if (growthChartRef.current) {
            // Update existing chart
            growthChartRef.current.data.labels = results.labels;
            growthChartRef.current.data.datasets[0].data = results.dataLow;
            growthChartRef.current.data.datasets[1].data = results.dataHigh;
            growthChartRef.current.data.datasets[1].label = `High Fee Portfolio (${highFee}%)`;
            growthChartRef.current.update();
        } else {
            // Create new chart
            growthChartRef.current = new Chart(ctxGrowth.getContext('2d'), {
                type: 'line',
                data: {
                    labels: results.labels,
                    datasets: [
                        {
                            label: 'Low Fee Portfolio (0.1%)',
                            data: results.dataLow,
                            borderColor: '#1F2937', // Slate 800
                            backgroundColor: 'rgba(31, 41, 55, 0.1)',
                            borderWidth: 3,
                            fill: true,
                            tension: 0.4,
                            pointRadius: 0
                        },
                        {
                            label: `High Fee Portfolio (${highFee}%)`,
                            data: results.dataHigh,
                            borderColor: '#EF4444', // Red 500
                            backgroundColor: 'transparent',
                            borderWidth: 3,
                            borderDash: [5, 5],
                            tension: 0.4,
                            pointRadius: 0
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        tooltip: {
                            mode: 'index',
                            intersect: false,
                            callbacks: {
                                label: function(context: any) {
                                    return context.dataset.label + ': ' + formatCurrency(context.raw);
                                }
                            }
                        },
                        legend: { position: 'bottom' }
                    },
                    scales: {
                        y: {
                            ticks: { callback: (value: any) => '$' + value.toLocaleString() },
                            grid: { color: '#F3F4F6' }
                        },
                        x: {
                            grid: { display: false },
                            ticks: { maxTicksLimit: 6 }
                        }
                    }
                }
            });
        }
      }

      // --- 2. Impact Chart ---
      const ctxImpact = document.getElementById('impactChart') as HTMLCanvasElement;
      if (ctxImpact) {
        const totalGain = results.finalLow - investment;
        const lostToFees = results.finalLow - results.finalHigh;
        const keptGain = totalGain - lostToFees;

        if (impactChartRef.current) {
            impactChartRef.current.data.datasets[0].data = [keptGain, lostToFees];
            impactChartRef.current.update();
        } else {
            impactChartRef.current = new Chart(ctxImpact.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: ['Gains Kept', 'Gains Lost to Fees'],
                    datasets: [{
                        data: [keptGain, lostToFees],
                        backgroundColor: ['#1F2937', '#EF4444'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'bottom' },
                        tooltip: {
                            callbacks: {
                                label: function(context: any) {
                                    const value = context.raw;
                                    const total = context.chart._metasets[context.datasetIndex].total;
                                    const percentage = ((value / total) * 100).toFixed(1) + '%';
                                    return context.label + ': ' + percentage + ' (' + formatCurrency(value) + ')';
                                }
                            }
                        }
                    }
                }
            });
        }
      }
    }
  }, [chartLoaded, investment, years, returnRate, highFee, lowFee]);

  // Derived calculations for summary
  const results = calculateGrowth();
  const lostWealth = results.finalLow - results.finalHigh;

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        setMobileMenuOpen(false);
    }
  };

  return (
    <>
      <Script 
        src="https://cdn.tailwindcss.com" 
        strategy="beforeInteractive" 
      />
      <Script 
        src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js" 
        strategy="lazyOnload"
        onLoad={() => setChartLoaded(true)}
      />

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Merriweather:ital,wght@0,300;0,400;0,700;1,400&display=swap');

        .save3-body { font-family: 'Inter', sans-serif; background-color: #F9FAFB; color: #1F2937; }
        .save3-body h1, .save3-body h2, .save3-body h3, .save3-body .serif { font-family: 'Merriweather', serif; }
        
        .chart-container { 
            position: relative; 
            width: 100%; 
            max-width: 800px; 
            margin-left: auto; 
            margin-right: auto; 
            height: 350px; 
            max-height: 400px; 
        }
        @media (min-width: 768px) { .chart-container { height: 400px; } }
        
        .card-shadow { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); }
        .slider-thumb::-webkit-slider-thumb { appearance: none; width: 20px; height: 20px; background: #374151; border-radius: 50%; cursor: pointer; }
        .slider-thumb::-moz-range-thumb { width: 20px; height: 20px; background: #374151; border-radius: 50%; cursor: pointer; }
        
        .active-tab { border-bottom: 2px solid #1F2937; color: #111827; font-weight: 600; }
        .inactive-tab { color: #6B7280; }
        .inactive-tab:hover { color: #374151; }
      `}</style>

      <div className="save3-body bg-stone-50 text-slate-800 min-h-screen">

        {/* Navigation */}
        <nav className="bg-white border-b border-stone-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <span className="text-2xl font-bold serif text-slate-900 tracking-tight">Fee<span className="text-slate-500">Analytics</span></span>
                    </div>
                    <div className="hidden sm:flex items-center space-x-8">
                        <button onClick={() => scrollToSection('simulator')} className="text-sm font-medium text-slate-600 hover:text-slate-900 transition">Simulator</button>
                        <button onClick={() => scrollToSection('evidence')} className="text-sm font-medium text-slate-600 hover:text-slate-900 transition">Expert Evidence</button>
                        <button onClick={() => scrollToSection('analysis')} className="text-sm font-medium text-slate-600 hover:text-slate-900 transition">Visual Analysis</button>
                    </div>
                    {/* Mobile Menu Button */}
                    <div className="flex items-center sm:hidden">
                        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-500 hover:text-slate-700 p-2">
                            <span className="text-xl">☰</span>
                        </button>
                    </div>
                </div>
            </div>
            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div id="mobile-menu" className="sm:hidden bg-white border-b border-stone-200">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        <button onClick={() => scrollToSection('simulator')} className="block w-full text-left px-3 py-2 text-base font-medium text-slate-700 hover:bg-stone-100 rounded-md">Simulator</button>
                        <button onClick={() => scrollToSection('evidence')} className="block w-full text-left px-3 py-2 text-base font-medium text-slate-700 hover:bg-stone-100 rounded-md">Expert Evidence</button>
                        <button onClick={() => scrollToSection('analysis')} className="block w-full text-left px-3 py-2 text-base font-medium text-slate-700 hover:bg-stone-100 rounded-md">Visual Analysis</button>
                    </div>
                </div>
            )}
        </nav>

        {/* Hero Section */}
        <header className="bg-white pt-16 pb-12 sm:pt-24 sm:pb-20 px-4 sm:px-6 lg:px-8 text-center max-w-5xl mx-auto">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight">
                The Tyranny of Compounding Costs
            </h1>
            <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed font-light">
                Why a &quot;small&quot; 1% or 2% fee is the single largest threat to your financial future. authoritative analysis from the <span className="font-semibold text-slate-800">CFA Institute</span>, <span className="font-semibold text-slate-800">Wall Street Journal</span>, and leading academics.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button onClick={() => scrollToSection('simulator')} className="bg-slate-900 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-slate-800 transition shadow-lg transform hover:-translate-y-0.5">
                    Calculate Your Fee Drag
                </button>
                <button onClick={() => scrollToSection('evidence')} className="bg-white text-slate-700 border border-slate-300 px-8 py-3 rounded-lg text-lg font-medium hover:bg-stone-50 transition shadow-sm">
                    View the Research
                </button>
            </div>
        </header>

        {/* Context Bar */}
        <section className="bg-stone-100 border-y border-stone-200 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div>
                    <div className="text-3xl font-bold text-slate-900 mb-1">100%</div>
                    <div className="text-sm font-medium text-slate-500 uppercase tracking-wide">Risk Taken by You</div>
                </div>
                <div>
                    <div className="text-3xl font-bold text-slate-900 mb-1">100%</div>
                    <div className="text-sm font-medium text-slate-500 uppercase tracking-wide">Capital Provided by You</div>
                </div>
                <div>
                    <div className="text-3xl font-bold text-slate-900 mb-1 text-red-700">30%+</div>
                    <div className="text-sm font-medium text-slate-500 uppercase tracking-wide">Profits Lost to High Fees*</div>
                </div>
            </div>
            <div className="text-center mt-4 text-xs text-stone-500">*Over a 30-year period with 2% fees and 7% gross return.</div>
        </section>

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-24">

            {/* SECTION 1: Interactive Simulator */}
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
                            {/* Initial Investment */}
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm font-medium text-slate-700">Initial Investment</label>
                                    <span className="text-sm font-bold text-slate-900">{formatCurrency(investment)}</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="10000" 
                                    max="1000000" 
                                    step="5000" 
                                    value={investment} 
                                    onChange={(e) => setInvestment(Number(e.target.value))}
                                    className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer slider-thumb" 
                                />
                            </div>

                            {/* Years to Grow */}
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm font-medium text-slate-700">Time Horizon (Years)</label>
                                    <span className="text-sm font-bold text-slate-900">{years} Years</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="5" 
                                    max="50" 
                                    step="1" 
                                    value={years}
                                    onChange={(e) => setYears(Number(e.target.value))}
                                    className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer slider-thumb" 
                                />
                            </div>

                            {/* Expected Gross Return */}
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm font-medium text-slate-700">Gross Annual Return</label>
                                    <span className="text-sm font-bold text-slate-900">{returnRate}%</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="3" 
                                    max="12" 
                                    step="0.1" 
                                    value={returnRate}
                                    onChange={(e) => setReturnRate(Number(e.target.value))}
                                    className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer slider-thumb" 
                                />
                                <p className="text-xs text-stone-500 mt-1">Historical equity average approx. 7-10%</p>
                            </div>

                            {/* High Fee Scenario */}
                            <div className="pt-4 border-t border-stone-100">
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm font-medium text-slate-700">High Fee Fund Cost</label>
                                    <span className="text-sm font-bold text-red-600">{highFee.toFixed(2)}%</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="0.5" 
                                    max="3.0" 
                                    step="0.05" 
                                    value={highFee}
                                    onChange={(e) => setHighFee(Number(e.target.value))}
                                    className="w-full h-2 bg-red-100 rounded-lg appearance-none cursor-pointer slider-thumb accent-red-600" 
                                />
                                <p className="text-xs text-stone-500 mt-1">Typical active fund + advisor fee range.</p>
                            </div>
                        </div>

                        {/* Summary Results Card */}
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
                            <div className="flex gap-4 text-xs">
                                <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-slate-800 mr-2"></span>Low Fee (0.1%)</div>
                                <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>High Fee (<span>{highFee}%</span>)</div>
                            </div>
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

            {/* SECTION 2: Expert Evidence */}
            <section id="evidence" className="scroll-mt-24">
                <div className="mb-10 text-center max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">Authoritative Perspectives</h2>
                    <p className="text-lg text-slate-600">
                        Leading financial institutions, academic journals, and market commentators agree: minimizing costs is one of the few reliable ways to improve investment outcomes.
                    </p>
                </div>

                {/* Tab Navigation */}
                <div className="flex justify-center mb-8 border-b border-stone-200">
                    <button onClick={() => setActiveTab('academic')} className={`px-6 py-3 text-sm font-medium transition focus:outline-none ${activeTab === 'academic' ? 'active-tab' : 'inactive-tab'}`}>Academic & Research</button>
                    <button onClick={() => setActiveTab('media')} className={`px-6 py-3 text-sm font-medium transition focus:outline-none ${activeTab === 'media' ? 'active-tab' : 'inactive-tab'}`}>Financial Media</button>
                    <button onClick={() => setActiveTab('industry')} className={`px-6 py-3 text-sm font-medium transition focus:outline-none ${activeTab === 'industry' ? 'active-tab' : 'inactive-tab'}`}>Industry Analysis</button>
                </div>

                {/* Tab Content: Academic */}
                <div className={`${activeTab === 'academic' ? 'grid' : 'hidden'} grid-cols-1 md:grid-cols-2 gap-8`}>
                    <div className="bg-white p-8 rounded-xl border border-stone-200 shadow-sm hover:shadow-md transition">
                        <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-2xl">🎓</div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Professor Jeremy Siegel</h3>
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Wharton School of Business</div>
                        <blockquote className="text-slate-600 italic mb-4">
                            &quot;In the long run, it is the net return—the gross return minus inflation and transaction costs—that determines the wealth of the investor.&quot;
                        </blockquote>
                        <p className="text-sm text-slate-500 border-t border-stone-100 pt-4">
                            <strong>Insight:</strong> In <em>Stocks for the Long Run</em>, Siegel emphasizes that while you cannot control market returns, failing to control costs (fees) ensures a subpar net return.
                        </p>
                    </div>
                    <div className="bg-white p-8 rounded-xl border border-stone-200 shadow-sm hover:shadow-md transition">
                        <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-2xl">📊</div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">CFA Institute</h3>
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Financial Analysts Journal</div>
                        <blockquote className="text-slate-600 italic mb-4">
                            &quot;Investment costs are a direct deduction from investment returns... All else being equal, lower costs lead to higher returns.&quot;
                        </blockquote>
                        <p className="text-sm text-slate-500 border-t border-stone-100 pt-4">
                            <strong>Insight:</strong> The global association for investment professionals consistently teaches that fee reduction is a primary fiduciary duty because it is the most certain way to improve client outcomes.
                        </p>
                    </div>
                </div>

                {/* Tab Content: Media */}
                <div className={`${activeTab === 'media' ? 'grid' : 'hidden'} grid-cols-1 md:grid-cols-2 gap-8`}>
                    <div className="bg-white p-8 rounded-xl border border-stone-200 shadow-sm hover:shadow-md transition">
                        <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-2xl">📰</div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Wall Street Journal</h3>
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Jason Zweig / Intelligent Investor</div>
                        <blockquote className="text-slate-600 italic mb-4">
                            &quot;Fees are one of the few things in investing that are entirely within your control. Every dollar you don&apos;t pay in fees is a dollar that stays in your account to compound.&quot;
                        </blockquote>
                        <p className="text-sm text-slate-500 border-t border-stone-100 pt-4">
                            <strong>Insight:</strong> The WSJ repeatedly highlights that while chasing performance is often futile, cutting costs is a guaranteed mathematical win.
                        </p>
                    </div>
                    <div className="bg-white p-8 rounded-xl border border-stone-200 shadow-sm hover:shadow-md transition">
                        <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-2xl">🏛️</div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">SEC.gov</h3>
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Office of Investor Education</div>
                        <blockquote className="text-slate-600 italic mb-4">
                            &quot;High fees and expenses do not guarantee better performance... Even small differences in fees can translate into large differences in returns over time.&quot;
                        </blockquote>
                        <p className="text-sm text-slate-500 border-t border-stone-100 pt-4">
                            <strong>Insight:</strong> The U.S. Securities and Exchange Commission explicitly warns investors that high costs are a major drag on portfolio health.
                        </p>
                    </div>
                </div>

                {/* Tab Content: Industry */}
                <div className={`${activeTab === 'industry' ? 'grid' : 'hidden'} grid-cols-1 md:grid-cols-2 gap-8`}>
                    <div className="bg-white p-8 rounded-xl border border-stone-200 shadow-sm hover:shadow-md transition">
                        <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-2xl">⭐</div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Morningstar</h3>
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Russel Kinnel, Director of Research</div>
                        <blockquote className="text-slate-600 italic mb-4">
                            &quot;If there&apos;s one thing we know for certain, it&apos;s that fees are the best predictor of future performance. Low-cost funds have a higher probability of outperforming.&quot;
                        </blockquote>
                        <p className="text-sm text-slate-500 border-t border-stone-100 pt-4">
                            <strong>Insight:</strong> Their famous &quot;Mind the Gap&quot; studies consistently show that the cheapest quintile of funds outperforms the most expensive quintile across almost all asset classes.
                        </p>
                    </div>
                    <div className="bg-white p-8 rounded-xl border border-stone-200 shadow-sm hover:shadow-md transition">
                        <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-2xl">📉</div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Kenneth French</h3>
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Dartmouth College</div>
                        <blockquote className="text-slate-600 italic mb-4">
                            &quot;The aggregate portfolio of active investors must return the market minus fees. The aggregate portfolio of passive investors returns the market minus much smaller fees.&quot;
                        </blockquote>
                        <p className="text-sm text-slate-500 border-t border-stone-100 pt-4">
                            <strong>Insight:</strong> This is the &quot;Arithmetic of Active Management.&quot; It is a mathematical certainty that the average active investor <em>must</em> underperform the market by the amount of the fees they pay.
                        </p>
                    </div>
                </div>
            </section>

            {/* SECTION 3: Visual Analysis (Deep Dive) */}
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

            {/* Footer */}
            <footer className="text-center text-slate-500 text-sm pt-8 border-t border-stone-200">
                <p>© 2024 Fee Analysis Dashboard. For educational purposes only.</p>
                <p className="mt-2">Based on principles sourced from WSJ, CFA Institute, and Academic Research.</p>
            </footer>

        </main>
      </div>
    </>
  );
}
