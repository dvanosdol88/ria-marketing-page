'use client';

import React, { useEffect, useState } from 'react';
import Script from 'next/script';

export default function Save1Page() {
  const [chartLoaded, setChartLoaded] = useState(false);

  useEffect(() => {
    if (chartLoaded && typeof window !== 'undefined' && (window as any).Chart) {
      const Chart = (window as any).Chart;
      
      // Common Tooltip Config
      const commonTooltipConfig = {
        title: function(tooltipItems: any) {
          const item = tooltipItems[0];
          let label = item.chart.data.labels[item.dataIndex];
          if (Array.isArray(label)) {
            return label.join(' ');
          } else {
            return label;
          }
        }
      };

      // --- CHART 1: The Hurdle (Bar Chart) ---
      const ctxHurdle = document.getElementById('hurdleChart') as HTMLCanvasElement;
      if (ctxHurdle) {
        // Destroy existing chart if any (for HMR)
        const existingChart = Chart.getChart(ctxHurdle);
        if (existingChart) existingChart.destroy();

        new Chart(ctxHurdle.getContext('2d'), {
          type: 'bar',
          data: {
            labels: ['Market Return', 'Low Cost Fund', 'High Cost Fund'],
            datasets: [
              {
                label: 'Gross Return',
                data: [7.0, 7.0, 7.0],
                backgroundColor: '#CBD5E1', // Slate 300
                stack: 'Stack 0',
              },
              {
                label: 'Fees Deducted',
                data: [0, -0.1, -2.0], // The "Hurdle"
                backgroundColor: '#FF4757', // Alert Red
                stack: 'Stack 0',
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              title: { display: true, text: 'Net Return after Costs (7% Gross)' },
              tooltip: {
                callbacks: {
                  label: function(context: any) {
                    let label = context.dataset.label || '';
                    if (label) { label += ': '; }
                    if (context.parsed.y !== null) { label += context.parsed.y + '%'; }
                    return label;
                  }
                }
              }
            },
            scales: {
              y: { 
                stacked: true,
                title: { display: true, text: 'Annual Return (%)' }
              },
              x: { grid: { display: false } }
            }
          }
        });
      }

      // --- CHART 3: Predictive Slope (Bar Chart) ---
      const ctxPredictive = document.getElementById('predictiveChart') as HTMLCanvasElement;
      if (ctxPredictive) {
        const existingChart = Chart.getChart(ctxPredictive);
        if (existingChart) existingChart.destroy();

        new Chart(ctxPredictive.getContext('2d'), {
          type: 'bar',
          data: {
            labels: ['Cheapest', 'Low Cost', 'Mid Cost', 'High Cost', 'Most Expensive'],
            datasets: [{
              label: 'Success Rate (%)',
              data: [62, 48, 39, 30, 19],
              backgroundColor: [
                '#3B82F6', // Blue (Best)
                '#60A5FA',
                '#94A3B8', // Grey (Mid)
                '#F87171',
                '#EF4444'  // Red (Worst)
              ],
              borderRadius: 4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  ...commonTooltipConfig,
                  label: function(context: any) {
                    return `Success Rate: ${context.raw}%`;
                  }
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                max: 80,
                title: { display: true, text: '% Outperforming Peers' }
              },
              x: { grid: { display: false } }
            }
          }
        });
      }
    }
  }, [chartLoaded]);

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
      
      {/* Styles from the HTML head */}
      <style jsx global>{`
        /* Chosen Palette: "Brilliant Blues & Corals" */
        /* Note: body styles might be overridden by globals.css, but we try to enforce them here wrapper-level if needed, or global */
        
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;800&family=Open+Sans:wght@400;600&display=swap');

        .save1-body { font-family: 'Open Sans', sans-serif; background-color: #F1F5F9; color: #334155; }
        .save1-body h1, .save1-body h2, .save1-body h3, .save1-body .heading-font { font-family: 'Montserrat', sans-serif; }
        
        .chart-container { 
            position: relative; 
            width: 100%; 
            max-width: 650px; 
            margin-left: auto; 
            margin-right: auto; 
            height: 350px; 
            max-height: 400px; 
        }
        @media (min-width: 768px) { .chart-container { height: 400px; } }
        
        .card { background: white; border-radius: 1rem; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); transition: transform 0.3s ease; }
        .card:hover { transform: translateY(-5px); }
        
        .vibrant-gradient { background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%); }
        .text-alert { color: #FF4757; }
        .bg-alert { background-color: #FF4757; }
        
        /* Custom Grid for the Control Matrix */
        .control-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
      `}</style>

      <div className="save1-body antialiased min-h-screen">
        {/* Hero Section */}
        <header className="vibrant-gradient text-white pt-16 pb-20 px-4 mb-12">
            <div className="max-w-5xl mx-auto text-center">
                <div className="inline-block bg-blue-500 bg-opacity-20 px-4 py-1 rounded-full text-sm font-semibold tracking-wide uppercase mb-4 text-blue-200">Financial Intelligence</div>
                <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
                    The Arithmetic of <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Active Management</span>
                </h1>
                <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                    Why <strong className="text-white">Average Returns</strong> minus <strong className="text-white">Controllable Costs</strong> equals your <strong className="text-white">Net Reality</strong>.
                </p>
            </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24 pb-20">

            {/* CONCEPT 1: PROVING "A" (Market Return) vs COSTS */}
            {/* The "Hurdle Rate" Visualization */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="order-2 lg:order-1">
                    <div className="card p-6">
                        <h3 className="text-xl font-bold text-slate-800 mb-4 text-center">The &quot;Head Start&quot; Problem</h3>
                        <div className="chart-container">
                            <canvas id="hurdleChart"></canvas>
                        </div>
                        <div className="mt-4 text-center text-xs text-slate-500">
                            To beat the market, high-fee funds must generate 9% returns in a 7% world.
                        </div>
                    </div>
                </div>
                <div className="order-1 lg:order-2">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4 heading-font border-l-8 border-blue-500 pl-6">Concept A: The Zero-Sum Game</h2>
                    <p className="text-lg text-slate-600 mb-4">
                        <strong>Professor Kenneth French</strong> (Dartmouth) posits that before fees, the market is a zero-sum game. If you win, someone else loses.
                    </p>
                    <p className="text-lg text-slate-600 mb-6">
                        But <em>after</em> fees, active management becomes a negative-sum game. The chart on the left illustrates the &quot;Head Start.&quot; A high-fee fund starts every year <strong>2% behind the starting line</strong>.
                    </p>
                    <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                        <p className="italic text-slate-700">&quot;The aggregate portfolio of active investors must return the market minus fees.&quot;</p>
                        <p className="text-xs font-bold text-slate-900 mt-2">— Kenneth French</p>
                    </div>
                </div>
            </section>

            {/* CONCEPT 2: PROVING "B" (Costs are Controllable) */}
            {/* The Control Matrix */}
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

            {/* CONCEPT 3: PROVING "C" (Result = Net Returns) */}
            {/* The Predictive Slope */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mt-20">
                <div className="order-1">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4 heading-font border-l-8 border-red-500 pl-6">Concept C: The Net Result</h2>
                    <p className="text-lg text-slate-600 mb-6">
                        If Concept A is true (Market is zero-sum) and Concept B is true (Costs are controllable), then Concept C must follow: <strong>Lower costs lead to higher net returns.</strong>
                    </p>
                    <p className="text-slate-600 mb-6">
                        This chart visualizes <strong>Morningstar&apos;s</strong> famous &quot;Predictive Power&quot; study. It divides funds into quintiles (buckets) from cheapest to most expensive. The trend is undeniable: as fees go up, performance goes down.
                    </p>
                    <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                        <p className="italic text-slate-700">&quot;Expense ratios are the most reliable predictor of future performance.&quot;</p>
                        <p className="text-xs font-bold text-slate-900 mt-2">— Morningstar</p>
                    </div>
                </div>
                <div className="order-2">
                    <div className="card p-6">
                        <h3 className="text-xl font-bold text-slate-800 mb-4 text-center">Cost vs. Future Success</h3>
                        <div className="chart-container">
                            <canvas id="predictiveChart"></canvas>
                        </div>
                        <div className="mt-4 text-center text-xs text-slate-500">
                            % of funds that survived and outperformed peers over 10 years.
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="text-center text-slate-500 pt-12 pb-8 border-t border-slate-200 mt-20">
                <p className="text-xs max-w-2xl mx-auto">
                    All concepts derived from &quot;The Arithmetic of Active Management&quot; (French) and &quot;Mind the Gap&quot; (Morningstar).
                    Visualizations generated for educational purposes.
                </p>
            </footer>

        </main>
      </div>
    </>
  );
}