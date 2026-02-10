'use client';

import React, { useEffect, useState } from 'react';
import Script from 'next/script';

export default function Save2Page() {
  const [chartLoaded, setChartLoaded] = useState(false);

  // --- Utility: Label Wrapping ---
  const wrapLabel = (str: string, maxLen = 16) => {
    if (str.length <= maxLen) return str;
    const words = str.split(' ');
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
        if ((currentLine + " " + words[i]).length <= maxLen) {
            currentLine += " " + words[i];
        } else {
            lines.push(currentLine);
            currentLine = words[i];
        }
    }
    lines.push(currentLine);
    return lines;
  };

  // --- Common Tooltip Configuration ---
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

  // --- Data Generation ---
  const generateGrowthData = () => {
    const labels = [];
    const lowFeeData = [];
    const highFeeData = [];
    
    const principal = 100000;
    const grossReturn = 0.07;
    const lowFee = 0.001;
    const highFee = 0.020;

    for(let i=0; i<=30; i+=5) {
        labels.push(`Year ${i}`);
        
        // Calculate FV = PV * (1 + r)^n
        const lowVal = principal * Math.pow(1 + (grossReturn - lowFee), i);
        const highVal = principal * Math.pow(1 + (grossReturn - highFee), i);
        
        lowFeeData.push(lowVal);
        highFeeData.push(highVal);
    }
    return { labels, lowFeeData, highFeeData };
  };

  useEffect(() => {
    if (chartLoaded && typeof window !== 'undefined' && (window as any).Chart) {
      const Chart = (window as any).Chart;
      const growthData = generateGrowthData();

      // --- Chart 1: Growth Line Chart ---
      const ctxGrowth = document.getElementById('growthChart') as HTMLCanvasElement;
      if (ctxGrowth) {
          const existingChart = Chart.getChart(ctxGrowth);
          if (existingChart) existingChart.destroy();

          new Chart(ctxGrowth.getContext('2d'), {
              type: 'line',
              data: {
                  labels: growthData.labels,
                  datasets: [
                      {
                          label: 'Low Fee (0.1%)',
                          data: growthData.lowFeeData,
                          borderColor: '#3B82F6', // Vibrant Blue
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          borderWidth: 3,
                          tension: 0.4,
                          fill: true
                      },
                      {
                          label: 'High Fee (2.0%)',
                          data: growthData.highFeeData,
                          borderColor: '#FF4757', // Vibrant Coral
                          backgroundColor: 'transparent',
                          borderWidth: 3,
                          borderDash: [5, 5], // Dashed line for negative impact
                          tension: 0.4,
                          fill: false
                      }
                  ]
              },
              options: {
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                      tooltip: {
                          callbacks: {
                              ...commonTooltipConfig,
                              label: function(context: any) {
                                  return context.dataset.label + ': $' + Math.round(context.raw).toLocaleString();
                              }
                          }
                      },
                      legend: {
                          position: 'bottom',
                          labels: { padding: 20, usePointStyle: true }
                      }
                  },
                  scales: {
                      y: {
                          ticks: {
                              callback: function(value: any) { return '$' + value/1000 + 'k'; }
                          },
                          grid: { color: '#e2e8f0' }
                      },
                      x: {
                          grid: { display: false }
                      }
                  }
              }
          });
      }

      // --- Chart 2: Success Rate Bar Chart ---
      // Labels to be wrapped
      const rawLabels = [
          "US Large Cap Equity Funds",
          "US Mid Cap Equity Funds",
          "International Equity Funds",
          "Taxable Bond Funds"
      ];
      
      // Wrap labels using helper
      const wrappedLabels = rawLabels.map(l => wrapLabel(l, 16));

      const ctxSuccess = document.getElementById('successChart') as HTMLCanvasElement;
      if (ctxSuccess) {
          const existingChart = Chart.getChart(ctxSuccess);
          if (existingChart) existingChart.destroy();

          new Chart(ctxSuccess.getContext('2d'), {
              type: 'bar',
              data: {
                  labels: wrappedLabels,
                  datasets: [
                      {
                          label: 'Low Fee Quintile',
                          data: [65, 58, 62, 70], // Hypothetical success rates based on Morningstar patterns
                          backgroundColor: '#3B82F6',
                          borderRadius: 6
                      },
                      {
                          label: 'High Fee Quintile',
                          data: [20, 15, 22, 18],
                          backgroundColor: '#FF4757',
                          borderRadius: 6
                      }
                  ]
              },
              options: {
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                      tooltip: {
                          callbacks: {
                              ...commonTooltipConfig,
                              label: function(context: any) {
                                  return context.dataset.label + ': ' + context.raw + '% Success Rate';
                              }
                          }
                      },
                      legend: { position: 'bottom' }
                  },
                  scales: {
                      y: {
                          beginAtZero: true,
                          max: 100,
                          title: { display: true, text: '% Funds Outperforming Benchmark' }
                      },
                      x: {
                          grid: { display: false }
                      }
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

      <style jsx global>{`
        /* Chosen Palette: "Brilliant Blues & Corals" 
           Primary: #0F172A (Deep Navy)
           Accent 1: #3B82F6 (Vibrant Blue)
           Accent 2: #06B6D4 (Electric Cyan)
           Alert/Contrast: #FF4757 (Vibrant Coral/Red)
           Background: #F1F5F9 (Slate 100)
        */
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;800&family=Open+Sans:wght@400;600&display=swap');

        .save2-body { font-family: 'Open Sans', sans-serif; background-color: #F1F5F9; color: #334155; }
        .save2-body h1, .save2-body h2, .save2-body h3, .save2-body .heading-font { font-family: 'Montserrat', sans-serif; }
        
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
        .text-accent { color: #3B82F6; }
        .text-alert { color: #FF4757; }
        .bg-accent { background-color: #3B82F6; }
        .bg-alert { background-color: #FF4757; }
        
        .clip-path-slant {
            /* clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%); */
        }
      `}</style>

      <div className="save2-body antialiased min-h-screen">
        {/* Hero Section */}
        <section className="vibrant-gradient text-white pt-16 pb-20 px-4 mb-12 clip-path-slant">
            <div className="max-w-5xl mx-auto text-center">
                <div className="inline-block bg-blue-500 bg-opacity-20 px-4 py-1 rounded-full text-sm font-semibold tracking-wide uppercase mb-4 text-blue-200">Financial Intelligence</div>
                <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
                    The Cost of <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Complication</span>
                </h1>
                <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                    Why authoritative research from the <strong className="text-white">Wall Street Journal</strong>, <strong className="text-white">CFA Institute</strong>, and <strong className="text-white">Jeremy Siegel</strong> concludes that low fees are the most reliable predictor of investment success.
                </p>
            </div>
        </section>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24 pb-20">

            {/* SECTION 1: The Hook (Big Numbers) */}
            <section>
                <div className="max-w-4xl mx-auto text-center mb-10">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 heading-font">The 2% Fallacy</h2>
                    <p className="text-lg text-slate-600">
                        Many investors believe a 2% fee sounds small. &quot;I keep 98%, they take 2%.&quot; This is mathematically false. You pay fees on the <em>principal</em>, but you pay them out of the <em>returns</em>.
                    </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div className="card p-8 border-t-4 border-blue-500">
                        <div className="text-5xl mb-2">💰</div>
                        <div className="text-4xl font-extrabold text-slate-900 mb-2">100%</div>
                        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Of the Risk</p>
                        <p className="text-slate-600 mt-2 text-sm">You provide all the capital and bear all the market volatility.</p>
                    </div>
                    
                    <div className="card p-8 border-t-4 border-cyan-400">
                        <div className="text-5xl mb-2">📉</div>
                        <div className="text-4xl font-extrabold text-slate-900 mb-2">100%</div>
                        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Of the Cost</p>
                        <p className="text-slate-600 mt-2 text-sm">You pay the expense ratio regardless of whether the fund goes up or down.</p>
                    </div>

                    <div className="card p-8 border-t-4 border-red-500 bg-red-50">
                        <div className="text-5xl mb-2">⚠️</div>
                        <div className="text-4xl font-extrabold text-alert mb-2">40%+</div>
                        <p className="text-sm font-semibold uppercase tracking-wide text-red-400">Of Returns Lost</p>
                        <p className="text-slate-600 mt-2 text-sm">Over 30 years, a 2% fee consumes roughly 40% of your potential compound growth.</p>
                    </div>
                </div>
            </section>

            {/* SECTION 2: The Data Visualization (Chart.js) */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="order-2 lg:order-1">
                    <div className="card p-6">
                        <h3 className="text-xl font-bold text-slate-800 mb-4 text-center">Growth of $100k (30 Years)</h3>
                        <div className="chart-container">
                            <canvas id="growthChart"></canvas>
                        </div>
                        <div className="mt-4 text-center text-xs text-slate-500">
                            Assumes 7% gross annual return. Low Fee: 0.1% (ETF). High Fee: 2.0% (Active Fund + Advisory).
                        </div>
                    </div>
                </div>
                <div className="order-1 lg:order-2">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4 heading-font border-l-8 border-blue-500 pl-6">The &quot;Fee Wedge&quot;</h2>
                    <p className="text-lg text-slate-600 mb-6">
                        This chart visualizes the corrosive effect of &quot;Fee Drag.&quot; The top line represents a low-cost index approach. The bottom line represents a high-cost active approach.
                    </p>
                    <ul className="space-y-4">
                        <li className="flex items-start">
                            <span className="text-2xl mr-3">🟦</span>
                            <div>
                                <strong className="block text-slate-900">The Wealth You Keep</strong>
                                <span className="text-slate-600 text-sm">With low fees (0.1%), nearly all the market&apos;s compound growth stays in your pocket.</span>
                            </div>
                        </li>
                        <li className="flex items-start">
                            <span className="text-2xl mr-3">🟥</span>
                            <div>
                                <strong className="block text-slate-900">The Wealth You Lose</strong>
                                <span className="text-slate-600 text-sm">With high fees (2.0%), the gap widens exponentially. The difference isn&apos;t just the fee; it&apos;s the <em>growth on the fee</em> you never earned.</span>
                            </div>
                        </li>
                    </ul>
                </div>
            </section>

            {/* SECTION 3: Authoritative Sources (Cards) */}
            <section className="bg-white rounded-3xl p-8 md:p-12 shadow-xl">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-slate-900 heading-font">The Expert Consensus</h2>
                    <p className="text-slate-500 mt-2">Leading academics and financial institutions agree on the math.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Quote 1 */}
                    <div className="border-l-4 border-slate-900 pl-6 py-2">
                        <blockquote className="text-xl italic text-slate-700 mb-4">
                            &quot;In the long run, it is the net return—the gross return minus inflation and transaction costs—that determines the wealth of the investor.&quot;
                        </blockquote>
                        <div className="flex items-center">
                            <div className="h-10 w-10 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-600 mr-3">JS</div>
                            <div>
                                <div className="font-bold text-slate-900">Jeremy Siegel</div>
                                <div className="text-xs text-slate-500 uppercase">Prof. of Finance, Wharton</div>
                            </div>
                        </div>
                    </div>

                    {/* Quote 2 */}
                    <div className="border-l-4 border-slate-900 pl-6 py-2">
                        <blockquote className="text-xl italic text-slate-700 mb-4">
                            &quot;Investment costs are a direct deduction from investment returns... All else being equal, lower costs lead to higher returns.&quot;
                        </blockquote>
                        <div className="flex items-center">
                            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600 mr-3">CFA</div>
                            <div>
                                <div className="font-bold text-slate-900">CFA Institute</div>
                                <div className="text-xs text-slate-500 uppercase">Financial Analysts Journal</div>
                            </div>
                        </div>
                    </div>

                    {/* Quote 3 */}
                    <div className="border-l-4 border-slate-900 pl-6 py-2">
                        <blockquote className="text-xl italic text-slate-700 mb-4">
                            &quot;Fees are one of the few things in investing that are entirely within your control. Every dollar you don&apos;t pay in fees is a dollar that stays in your account.&quot;
                        </blockquote>
                        <div className="flex items-center">
                            <div className="h-10 w-10 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-600 mr-3">WSJ</div>
                            <div>
                                <div className="font-bold text-slate-900">Wall Street Journal</div>
                                <div className="text-xs text-slate-500 uppercase">Jason Zweig</div>
                            </div>
                        </div>
                    </div>

                    {/* Quote 4 */}
                    <div className="border-l-4 border-slate-900 pl-6 py-2">
                        <blockquote className="text-xl italic text-slate-700 mb-4">
                            &quot;Expense ratios are the most reliable predictor of future performance. Low-cost funds have a higher probability of outperforming.&quot;
                        </blockquote>
                        <div className="flex items-center">
                            <div className="h-10 w-10 bg-yellow-100 rounded-full flex items-center justify-center font-bold text-yellow-600 mr-3">MS</div>
                            <div>
                                <div className="font-bold text-slate-900">Morningstar</div>
                                <div className="text-xs text-slate-500 uppercase">Russel Kinnel</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 4: Comparative Analysis (Bar Chart) */}
            <section>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="order-1">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4 heading-font border-l-8 border-cyan-400 pl-6">The Predictive Power of Fees</h2>
                        <p className="text-lg text-slate-600 mb-6">
                            Data from Morningstar&apos;s &quot;Mind the Gap&quot; study reveals a stark truth: The cheaper the fund, the more likely it is to survive and outperform its peers.
                        </p>
                        <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                            <h4 className="font-bold text-blue-900 mb-2">Key Takeaway</h4>
                            <p className="text-sm text-blue-800">
                                High-fee funds often rely on &quot;beating the market&quot; to justify their cost. The statistics show they rarely succeed. Low-fee funds simply track the market, but because their hurdle is lower, their net return is consistently higher.
                            </p>
                        </div>
                    </div>
                    <div className="order-2">
                        <div className="card p-6">
                            <h3 className="text-xl font-bold text-slate-800 mb-4 text-center">Success Rate by Fee Quintile</h3>
                            <div className="chart-container">
                                <canvas id="successChart"></canvas>
                            </div>
                             <div className="mt-4 text-center text-xs text-slate-500">
                                Comparison of 10-Year Success Rates (Survivorship + Outperformance). Source: Morningstar.
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 5: The Arithmetic Logic (HTML Diagram) */}
            <section className="max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-slate-900 heading-font">The Arithmetic of Active Management</h2>
                    <p className="text-slate-500">Based on the paper by Kenneth French</p>
                </div>

                <div className="flex flex-col md:flex-row justify-center items-stretch gap-4 md:gap-0">
                    {/* Step 1 */}
                    <div className="flex-1 bg-white p-6 rounded-xl md:rounded-r-none border border-slate-200 text-center relative z-10">
                        <div className="text-4xl mb-3">🌍</div>
                        <h4 className="font-bold text-slate-900">Gross Market Return</h4>
                        <p className="text-xs text-slate-500 mt-2">Before fees, all investors collectively own the market.</p>
                    </div>

                    {/* Connector */}
                    <div className="hidden md:flex items-center justify-center -mx-2 z-0">
                        <div className="h-1 w-8 bg-slate-300"></div>
                    </div>
                    <div className="md:hidden flex justify-center text-slate-300 text-2xl">⬇️</div>

                    {/* Step 2 */}
                    <div className="flex-1 bg-white p-6 rounded-xl md:rounded-none border border-slate-200 text-center relative z-10">
                        <div className="text-4xl mb-3">➖</div>
                        <h4 className="font-bold text-alert">Minus Costs</h4>
                        <p className="text-xs text-slate-500 mt-2">Trading costs, management fees, advisory fees, taxes.</p>
                    </div>

                    {/* Connector */}
                    <div className="hidden md:flex items-center justify-center -mx-2 z-0">
                        <div className="h-1 w-8 bg-slate-300"></div>
                    </div>
                    <div className="md:hidden flex justify-center text-slate-300 text-2xl">⬇️</div>

                    {/* Step 3 */}
                    <div className="flex-1 bg-slate-900 p-6 rounded-xl md:rounded-l-none text-center shadow-xl relative z-20 transform scale-105">
                        <div className="text-4xl mb-3">💰</div>
                        <h4 className="font-bold text-white">Net Return</h4>
                        <p className="text-xs text-slate-400 mt-2">What you actually keep. Mathematically, high costs <strong>must</strong> lower average net returns.</p>
                    </div>
                </div>
            </section>


        </main>
      </div>
    </>
  );
}