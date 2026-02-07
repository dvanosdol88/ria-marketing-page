'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from 'recharts';
import {
  ArrowRight,
  CheckCircle2,
  Play,
  Info,
  ChevronRight,
  ChevronLeft,
  Settings2,
  PieChart as PieIcon,
  TrendingUp,
  ShieldAlert,
  Wallet
} from 'lucide-react';

// --- WORDART IMAGES POOL ---
const WORDART_IMAGES = [
  { src: '/RETIRE_2036.png', alt: 'Retire 2036' },
  { src: '/INHERIT.png', alt: 'Inheritance' },
  { src: '/PENSION.png', alt: 'Pension' },
  { src: '/BeachHouse_cropped.png', alt: 'Beach House' },
  { src: '/Boat3D_cropped.png', alt: 'Buy Boat' },
  { src: '/BOAT2D_cropped.png', alt: 'Boat 2D' },
  { src: '/MedLoans_cropped.png', alt: 'Med School Loans' },
];

// Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// --- BRAND COLOR PALETTE ---
const PALETTE = {
  primary: '#006044',   // Evergreen
  blue600: '#009ddb',   // Mid-Blue
  blue800: '#00587a',   // Dark Blue
  red600: '#bc0b14',    // Brand Red
  purple500: '#8b5cf6', // Distinct Purple
  metal400: '#a3b5c2',
  metal600: '#6c8393',
  tangerine500: '#f5a700',
  gold: '#d97706',      // Gold for Legacy
};

// --- DATA: FUND DATABASE ---
const FUND_DATABASE: any = {
  large_cap: {
    name: 'US Large Cap', color: PALETTE.primary,
    client: { names: ['Growth Fund of America (AGTHX)', 'Fidelity Contrafund (FCNTX)'], er: 0.65 }, 
    our: { names: ['Vanguard Total Stock (VTI)', 'iShares Core S&P 500 (IVV)'], er: 0.03 }
  },
  small_cap: {
    name: 'US Small Cap', color: PALETTE.blue600,
    client: { names: ['Rydex Small Cap (RYAZX)', 'Franklin Small Cap (FSGRX)'], er: 1.12 },
    our: { names: ['Vanguard Small-Cap (VB)', 'iShares Core S&P Small (IJR)'], er: 0.05 }
  },
  intl: {
    name: 'International', color: PALETTE.blue800,
    client: { names: ['EuroPacific Growth (AEPGX)', 'Oakmark International (OAKIX)'], er: 0.84 },
    our: { names: ['Vanguard Total Int\'l (VXUS)', 'iShares MSCI Intl (IXUS)'], er: 0.07 }
  },
  emerging: {
    name: 'Emerging Mkts', color: PALETTE.red600,
    client: { names: ['New World Fund (NEWFX)', 'Oppenheimer Dev Mkts (ODMAX)'], er: 1.05 },
    our: { names: ['Vanguard Emerging Mkts (VWO)', 'iShares MSCI IEMG'], er: 0.10 }
  },
  alternatives: {
    name: 'Alternatives', color: PALETTE.purple500,
    client: { names: ['BlackRock Global Alloc (MALOX)', 'AQR Managed Futures (AQMIX)'], er: 1.25 },
    our: { names: ['Vanguard Real Estate (VNQ)', 'SPDR Gold (GLD)'], er: 0.12 }
  },
  bonds: {
    name: 'Fixed Income', color: PALETTE.metal600,
    client: { names: ['PIMCO Total Return (PTTRX)', 'DoubleLine Total Return (DBLTX)'], er: 0.55 },
    our: { names: ['Vanguard Total Bond (BND)', 'iShares Core Aggregate (AGG)'], er: 0.03 }
  },
  cash: {
    name: 'Cash / Equiv', color: PALETTE.metal400,
    client: { names: ['Prime Money Market', 'Bank Savings'], er: 0.25 },
    our: { names: ['Treasury Bill ETF (SGOV)', 'SPDR 1-3 Month (BIL)'], er: 0.07 }
  }
};

// --- DATA: ALLOCATION STAGES (For Step 2) ---
const STAGE_ALLOCATIONS: any[] = [
  // Stage 0: Initial Balanced (Baseline)
  { large_cap: 35, small_cap: 10, intl: 15, emerging: 5, alternatives: 10, bonds: 20, cash: 5 },
  
  // Stage 1: "Retire in 14 Years" (More Conservative/Stable)
  { large_cap: 30, small_cap: 5, intl: 10, emerging: 0, alternatives: 5, bonds: 40, cash: 10 },

  // Stage 2: "Legacy is Important" (Longer Time Horizon)
  { large_cap: 40, small_cap: 5, intl: 10, emerging: 0, alternatives: 15, bonds: 25, cash: 5 },

  // Stage 3: "High Future Earnings" (Risk Tolerance Up)
  { large_cap: 40, small_cap: 15, intl: 15, emerging: 10, alternatives: 10, bonds: 10, cash: 0 }
];

// --- FAQ CONTENT ---
const FAQ_CONTENT = [
  {
    question: "Why do we start with my existing portfolio?",
    answer: "We need a baseline to understand your current exposures. Often, clients hold 'closet index funds'—expensive funds that mimic the market but charge 10x the price."
  },
  {
    question: "How do you determine the right allocation for me?",
    answer: "We don't guess. We listen. By adding your specific goals (like retirement timeline or legacy wishes) into our strategy engine, we mathematically derive the optimal asset mix for your life."
  },
  {
    question: "How does the expense ratio actually affect my returns?",
    answer: "Fees compound negatively just like interest compounds positively. A 1% fee difference on a $1M portfolio isn't just $10k today—it could be over $300k in lost growth over 20 years."
  }
];

// --- ACTIVE SHAPE (Donut Interaction) ---
const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 8} startAngle={startAngle} endAngle={endAngle} fill={fill} className="drop-shadow-lg transition-all duration-300" />
      <Sector cx={cx} cy={cy} startAngle={startAngle} endAngle={endAngle} innerRadius={outerRadius + 10} outerRadius={outerRadius + 12} fill={fill} fillOpacity={0.3} />
    </g>
  );
};

export default function PortfolioArchitect() {
  const [step, setStep] = useState(1); 
  const [totalValue, setTotalValue] = useState(1000000);
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Step 2 Sequence State
  const [persStage, setPersStage] = useState(0); // 0, 1, 2, 3, 4
  const [highlightChart, setHighlightChart] = useState(false);
  const [selectedImages, setSelectedImages] = useState(() => shuffleArray(WORDART_IMAGES)); 
  
  // Step 3 Animation States
  const [isDemoActive, setIsDemoActive] = useState(false);
  const [demoStep, setDemoStep] = useState(-1);
  const [showSavings, setShowSavings] = useState(false);

  // --- DERIVED ALLOCATIONS ---
  const currentAllocations = useMemo(() => {
    if (step === 2) return STAGE_ALLOCATIONS[Math.min(persStage, 3)];
    if (step === 3) return STAGE_ALLOCATIONS[3];
    return STAGE_ALLOCATIONS[0];
  }, [step, persStage]);

  // Map to Chart Data
  const chartData = useMemo(() => {
    return Object.keys(currentAllocations).map(key => ({
      id: key,
      name: FUND_DATABASE[key].name,
      value: currentAllocations[key],
      color: FUND_DATABASE[key].color,
      ...FUND_DATABASE[key] 
    })).filter((item: any) => item.value > 0);
  }, [currentAllocations]);

  // --- FEE STATS ---
  const feeStats = useMemo(() => {
    let oldWeightedER = 0;
    let newWeightedER = 0;
    chartData.forEach((item: any) => {
      const weight = item.value / 100;
      oldWeightedER += item.client.er * weight;
      newWeightedER += item.our.er * weight;
    });
    return { 
      oldWeightedER, 
      newWeightedER, 
      annualSavings: totalValue * ((oldWeightedER - newWeightedER) / 100) 
    };
  }, [chartData, totalValue]);

  // --- STEP 2 SEQUENCER (Strict Timing) ---
  useEffect(() => {
    if (step === 2) {
        // Reshuffle images when entering step 2
        setSelectedImages(shuffleArray(WORDART_IMAGES));
        setPersStage(0);
        setHighlightChart(false);

        // Sequence logic for 7 drops:
        // Each drop: 0.6s fall + 0.4s pause = 1.0s interval
        const dropInterval = 1000;
        const highlightDuration = 600;
        const initialDelay = 800;

        const timeouts: NodeJS.Timeout[] = [];

        for (let i = 1; i <= 7; i++) {
            const dropTime = initialDelay + (i - 1) * dropInterval;
            timeouts.push(setTimeout(() => {
                setPersStage(i);
                setHighlightChart(true);
            }, dropTime));
            timeouts.push(setTimeout(() => setHighlightChart(false), dropTime + highlightDuration));
        }

        return () => {
            timeouts.forEach(t => clearTimeout(t));
        };
    } else {
        setHighlightChart(false);
    }
  }, [step]);

  // --- STEP 3 OPTIMIZER ---
  const triggerOptimization = () => {
    setIsDemoActive(true);
    setDemoStep(-1);
    setShowSavings(false);
    let current = 0;
    const interval = setInterval(() => {
      if (current >= chartData.length) {
        clearInterval(interval);
        setDemoStep(-1);
        setShowSavings(true); 
      } else {
        setDemoStep(current);
        current++;
      }
    }, 600); 
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  const formatPercent = (val: number) => val.toFixed(2) + '%';

  return (
    <div className="min-h-screen bg-[#f9fafb] text-[#1a1a1a] font-source p-4 sm:p-6 lg:p-8 flex flex-col">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
        
        {/* --- 1. PROGRESS HEADER --- */}
        <div className="mb-8">
          <h1 className="text-center font-montserrat font-bold text-[#01793d] text-3xl mb-6">
            Portfolio Architecture Process
          </h1>
          <div className="flex items-center justify-center max-w-3xl mx-auto">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center w-full last:w-auto">
                <div className={`flex flex-col items-center relative z-10 ${step >= s ? 'opacity-100' : 'opacity-50'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold font-montserrat transition-all duration-500 ${step >= s ? 'bg-[#006044] text-white shadow-lg scale-110' : 'bg-gray-200 text-gray-500'}`}>
                    {s}
                  </div>
                  <div className="absolute top-12 whitespace-nowrap text-xs font-bold uppercase tracking-wider font-montserrat">
                    {s === 1 ? 'Analyze' : s === 2 ? 'Personalize' : 'Optimize'}
                  </div>
                </div>
                {s < 3 && (
                  <div className="flex-1 h-1 mx-4 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full bg-[#006044] transition-all duration-700 ease-out`} style={{ width: step > s ? '100%' : '0%' }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* --- 2. MAIN CONTENT GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
          
          {/* LEFT: THE HERO CHART (Shared across steps) */}
          <div className="lg:col-span-5 flex flex-col">
            {/* TARGET STRATEGY BOX - HIGHLIGHTS ON CHANGE */}
            <div 
                className={`
                    bg-white border rounded-2xl shadow-lg p-6 relative flex-1 min-h-[400px] flex flex-col items-center justify-center overflow-hidden transition-all duration-[1000ms]
                    ${highlightChart ? 'border-[#009ddb] ring-4 ring-blue-100 shadow-xl' : 'border-[#e5e2dc]'}
                `}
            >
               
               <div className="absolute top-6 left-6 z-10">
                 <h3 className="font-montserrat font-bold text-[#1a1a1a] flex items-center gap-2">
                   <PieIcon className={`w-5 h-5 transition-colors duration-500 ${highlightChart ? 'text-[#009ddb]' : 'text-[#006044]'}`} />
                   {step === 1 ? 'Current Allocation' : step === 2 ? 'Target Strategy' : 'Optimized Portfolio'}
                 </h3>
                 <p className="text-xs text-[#4a4a4a] mt-1">
                   {step === 1 ? 'Based on external statements' : step === 2 ? 'Dynamic Goal Adjustment' : 'Low-Cost Implementation'}
                 </p>
               </div>

               <div className="w-full aspect-square max-w-[400px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            activeIndex={activeIndex}
                            activeShape={renderActiveShape}
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={100}
                            outerRadius={150}
                            dataKey="value"
                            onMouseEnter={(_, index) => setActiveIndex(index)}
                            paddingAngle={2}
                            animationDuration={800} 
                        >
                            {chartData.map((entry: any, index: number) => (
                                <Cell key={entry.id} fill={entry.color} stroke="none" />
                            ))}
                        </Pie>
                    </PieChart>
                 </ResponsiveContainer>
                 
                 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pt-8">
                    <div className="text-xs font-bold text-[#4a4a4a] uppercase tracking-widest font-montserrat">Total Value</div>
                    <div className="text-2xl font-extrabold text-[#1a1a1a] font-montserrat">{formatCurrency(totalValue)}</div>
                 </div>
               </div>
            </div>
          </div>

          {/* RIGHT: DYNAMIC CONTROL PANEL */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            <div className="bg-white border border-[#e5e2dc] rounded-2xl shadow-sm p-6 flex-1 transition-all duration-500 flex flex-col relative overflow-hidden">
              
              {/* --- STEP 1: ANALYZE VIEW --- */}
              {step === 1 && (
                <div className="animate-fadeIn space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-blue-50 text-blue-700 rounded-lg"><Settings2 className="w-6 h-6" /></div>
                    <div>
                      <h2 className="text-xl font-bold font-montserrat text-[#1a1a1a]">Step 1: Benchmark Analysis</h2>
                      <p className="text-sm text-[#4a4a4a]">We start by digitizing your current holdings from Fidelity, Schwab, or others.</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-xl border border-[#e5e2dc]">
                    <label className="text-xs font-bold text-[#4a4a4a] uppercase mb-2 block">Enter Portfolio Value</label>
                    <div className="flex items-center gap-2 bg-white border border-[#e5e2dc] rounded-lg p-3">
                      <span className="font-bold text-[#4a4a4a]">$</span>
                      <input 
                        type="number" 
                        value={totalValue} 
                        onChange={(e) => setTotalValue(Number(e.target.value))}
                        className="w-full font-montserrat font-bold text-lg outline-none text-[#1a1a1a]" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     {chartData.slice(0, 4).map((item: any) => (
                       <div key={item.id} className="p-3 border rounded-lg flex justify-between items-center opacity-75">
                         <span className="text-sm font-bold" style={{color: item.color}}>{item.name}</span>
                         <span className="text-xs bg-gray-100 px-2 py-1 rounded">{item.client.names[0].split('(')[0]}</span>
                       </div>
                     ))}
                     <div className="col-span-2 text-center text-xs text-[#4a4a4a] italic mt-2">
                       + {chartData.length - 4} other legacy positions imported...
                     </div>
                  </div>
                </div>
              )}

              {/* --- STEP 2: PERSONALIZATION (LITERAL IMPLEMENTATION) --- */}
              {step === 2 && (
                <div className="flex flex-col h-full relative">
                   {/* Top Header Box */}
                   <div className="flex items-center gap-3 mb-6 relative z-50 bg-white pb-4 border-b border-[#e5e2dc]">
                    <div className="p-3 bg-purple-50 text-purple-700 rounded-lg"><TrendingUp className="w-6 h-6" /></div>
                    <div>
                      <h2 className="text-xl font-bold font-montserrat text-[#1a1a1a]">Step 2: Strategic Personalization</h2>
                      <p className="text-sm text-[#4a4a4a]">We adjust the asset mix based on your risk tolerance and goals.</p>
                    </div>
                  </div>

                  <div className="flex flex-1 gap-6 relative">
                    
                    {/* LEFT: REPLACED AVATAR WITH UPLOADED IMAGE */}
                    <div className="w-1/3 flex flex-col items-center justify-end pb-4 pr-4 relative z-20">
                        <div className="w-full h-auto relative" style={{ maxHeight: '600px', overflow: 'hidden' }}>
                            <img
                                src="/avatar-cropped.png"
                                alt="Client Avatar"
                                className="w-full h-full object-contain mix-blend-multiply opacity-70"
                            />
                        </div>
                    </div>

                    {/* RIGHT: THE DROP ZONE (Behind elements) */}
                    <div className="flex-1 relative overflow-hidden flex flex-col justify-end pb-2">
                        {selectedImages.map((img, index) => (
                            <div
                                key={img.src}
                                className="absolute w-full flex justify-center transition-all duration-[600ms] ease-bounce"
                                style={{
                                    transform: persStage >= index + 1 ? 'translateY(0)' : 'translateY(-300%)',
                                    bottom: `${index * 40}px`,
                                    zIndex: (index + 1) * 10,
                                    opacity: persStage >= index + 1 ? 1 : 0
                                }}
                            >
                                <img src={img.src} alt={img.alt} className="max-h-[40px] object-contain drop-shadow-lg" />
                            </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}

              {/* --- STEP 3: OPTIMIZE VIEW --- */}
              {step === 3 && (
                <div className="animate-fadeIn flex flex-col h-full">
                   {/* Header & Fee Meter */}
                   <div className="mb-6">
                      <div className="flex justify-between items-end mb-2">
                         <div>
                            <h2 className="text-xl font-bold font-montserrat text-[#1a1a1a] flex items-center gap-2">
                               Step 3: Optimization
                               {showSavings && <span className="bg-green-100 text-[#006044] text-xs px-2 py-1 rounded-full border border-green-200">Completed</span>}
                            </h2>
                            <p className="text-sm text-[#4a4a4a]">Reducing structural costs to improve long-term returns.</p>
                         </div>
                         {showSavings && (
                            <div className="text-right">
                               <div className="text-xs font-bold text-[#4a4a4a] uppercase">Annual Savings</div>
                               <div className="text-xl font-extrabold text-[#006044] animate-pulse">{formatCurrency(feeStats.annualSavings)}/yr</div>
                            </div>
                         )}
                      </div>

                      {/* Fee Bar Visualization */}
                      <div className="bg-gray-100 rounded-lg p-3 border border-gray-200">
                          <div className="flex justify-between text-xs font-bold text-[#4a4a4a] mb-1">
                             <span>Weighted Expense Ratio (Cost)</span>
                             <span className={showSavings ? 'text-[#006044]' : 'text-red-500'}>
                                {showSavings ? formatPercent(feeStats.newWeightedER) : formatPercent(feeStats.oldWeightedER)}
                             </span>
                          </div>
                          <div className="h-3 bg-gray-300 rounded-full overflow-hidden relative">
                              <div 
                                className="absolute top-0 left-0 h-full bg-red-400 transition-all duration-1000 ease-in-out" 
                                style={{ width: `${(feeStats.oldWeightedER / 1.5) * 100}%` }} 
                              />
                              <div 
                                className="absolute top-0 left-0 h-full bg-[#006044] transition-all duration-[1500ms] ease-out z-10" 
                                style={{ width: showSavings ? `${(feeStats.newWeightedER / 1.5) * 100}%` : '0%' }}
                              />
                          </div>
                      </div>
                   </div>

                   {!showSavings && (
                     <button 
                       onClick={triggerOptimization}
                       disabled={isDemoActive}
                       className={`w-full py-3 rounded-xl font-bold font-montserrat flex items-center justify-center gap-2 mb-4 transition-all ${isDemoActive ? 'bg-gray-100 text-gray-400' : 'bg-[#006044] text-white hover:bg-[#004d36] shadow-lg hover:shadow-xl'}`}
                     >
                       {isDemoActive ? 'Optimizing Portfolio...' : <><Play className="w-5 h-5 fill-current" /> Execute Optimization</>}
                     </button>
                   )}

                   <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                     <div className="space-y-2">
                       <div className="grid grid-cols-12 text-[10px] font-bold text-[#4a4a4a] uppercase px-2 mb-1">
                          <div className="col-span-4">Asset Class</div>
                          <div className="col-span-3 text-right">Legacy Cost</div>
                          <div className="col-span-2"></div>
                          <div className="col-span-3 text-right">New Cost</div>
                       </div>

                       {chartData.map((item: any, index: number) => {
                          const isActive = demoStep === index || (isDemoActive && demoStep === -1) || showSavings;
                          const hasSwapped = isActive || showSavings;
                          return (
                            <div key={item.id} className={`p-3 rounded-lg border text-sm transition-all duration-500 ${hasSwapped ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100'}`}>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                                  <span className="font-bold text-[#1a1a1a]">{item.name}</span>
                                </div>
                                <div className="text-xs text-[#4a4a4a] bg-white px-2 py-0.5 rounded border border-gray-200">{item.value}%</div>
                              </div>
                              <div className="grid grid-cols-12 items-center gap-2">
                                <div className="col-span-5 text-right opacity-70">
                                   <div className={`text-xs truncate ${hasSwapped ? 'line-through' : ''}`}>{item.client.names[0].split('(')[0]}</div>
                                   <div className="text-xs font-bold text-red-500">{item.client.er}%</div>
                                </div>
                                <div className="col-span-2 flex justify-center">
                                   <ArrowRight className={`w-4 h-4 text-gray-300 ${hasSwapped ? 'text-[#006044]' : ''}`} />
                                </div>
                                <div className={`col-span-5 text-right transition-all duration-500 ${hasSwapped ? 'opacity-100 transform translate-x-0' : 'opacity-0 transform translate-x-4'}`}>
                                   <div className="text-xs truncate font-medium text-[#1a1a1a]">{item.our.names[0].split('(')[0]}</div>
                                   <div className="text-xs font-bold text-[#006044]">{item.our.er}%</div>
                                </div>
                              </div>
                            </div>
                          )
                       })}
                     </div>
                   </div>
                </div>
              )}
            </div>

            {/* ---NAVIGATIONBUTTONS --- */}
            <div className="flex justify-between items-center pt-2">
              <button 
                onClick={() => setStep(Math.max(1, step - 1))}
                disabled={step === 1}
                className={`flex items-center gap-1 font-montserrat font-bold text-sm ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-[#4a4a4a] hover:text-[#1a1a1a]'}`}
              >
                <ChevronLeft className="w-4 h-4" /> Previous Step
              </button>

              <button 
                onClick={() => setStep(Math.min(3, step + 1))}
                disabled={step === 3}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-full font-montserrat font-bold text-sm transition-all
                  ${step === 3 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-[#1a1a1a] text-white hover:bg-gray-800 shadow-md'}
                `}
              >
                Next Step <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

        {/* --- FAQ FOOTER --- */}
        <div className="mt-12 bg-white border-t-4 border-[#006044] rounded-lg shadow-sm p-6 max-w-4xl mx-auto w-full animate-fadeIn">
          <div className="flex gap-4 items-start">
            <div className="p-2 bg-green-100 rounded-full text-[#006044] flex-shrink-0">
               <Info className="w-6 h-6" />
            </div>
            <div>
               <h4 className="font-montserrat font-bold text-[#1a1a1a] text-lg mb-1">
                 {FAQ_CONTENT[step - 1] ? FAQ_CONTENT[step - 1].question : ''}
               </h4>
               <p className="text-[#4a4a4a] text-sm leading-relaxed">
                 {FAQ_CONTENT[step - 1] ? FAQ_CONTENT[step - 1].answer : ''}
               </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}