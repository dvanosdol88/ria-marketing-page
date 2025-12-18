'use client';

import { useState } from 'react';

// ============================================================================
// TYPES
// ============================================================================

interface Quote {
  firstName: string;
  lastName: string;
  title: string;
  quote: string;
}

interface QuoteTickerProps {
  label?: string;
  showLabel?: boolean;
  speed?: number;
}

// ============================================================================
// QUOTES DATA (randomized order, hardcoded)
// ============================================================================

const QUOTES: Quote[] = [
  {
    firstName: "John C.",
    lastName: "Bogle",
    title: "Founder, Vanguard",
    quote: "The miracle of compounding returns is overwhelmed by the tyranny of compounding costs.",
  },
  {
    firstName: "Eugene",
    lastName: "Fama",
    title: "Nobel Laureate in Economics",
    quote: "Active management is a zero-sum game before costs, and a negative-sum game after costs.",
  },
  {
    firstName: "Warren",
    lastName: "Buffett",
    title: "Chairman, Berkshire Hathaway",
    quote: "If returns are going to be 7 or 8 percent and you're paying 1 percent for fees, that makes an enormous difference.",
  },
  {
    firstName: "Burton",
    lastName: "Malkiel",
    title: "Author, A Random Walk Down Wall Street",
    quote: "Large advisory fees and substantial portfolio turnover tend to reduce investment yields.",
  },
  {
    firstName: "David",
    lastName: "Swensen",
    title: "Former CIO, Yale Endowment",
    quote: "When you look at the results on an after-fee, after-tax basis, there's almost no chance that you end up beating the index fund.",
  },
  {
    firstName: "Charlie",
    lastName: "Munger",
    title: "Vice Chairman, Berkshire Hathaway",
    quote: "Beating the market averages, after paying substantial costs and fees, is an against-the-odds game.",
  },
  {
    firstName: "William F.",
    lastName: "Sharpe",
    title: "Nobel Laureate in Economics",
    quote: "A person saving for retirement who chooses low-cost investments could have a standard of living 20% higher than a high-cost investor.",
  },
  {
    firstName: "Suze",
    lastName: "Orman",
    title: "Personal Finance Expert",
    quote: "You can't afford to be paying 1% or more when there are alternatives that cost you hardly anything.",
  },
  {
    firstName: "John C.",
    lastName: "Bogle",
    title: "Founder, Vanguard",
    quote: "Where returns are concerned, time is your friend. But where costs are concerned, time is your enemy.",
  },
  {
    firstName: "Warren",
    lastName: "Buffett",
    title: "Berkshire Hathaway Letter, 2018",
    quote: "A 1% management fee cut returns in half over a 77-year period.",
  },
  {
    firstName: "Fidelity",
    lastName: "Viewpoints",
    title: "November 2025",
    quote: "On a $100,000 portfolio earning 4% annually, the difference between a 0.25% and 1.00% fee could cost you nearly $30,000 over 20 years.",
  },
  {
    firstName: "David",
    lastName: "Swensen",
    title: "Unconventional Success",
    quote: "Excessive management fees take their toll, and manager profits dominate fiduciary responsibility.",
  },
  {
    firstName: "Eugene",
    lastName: "Fama",
    title: "Nobel Laureate in Economics",
    quote: "I can't figure out why anyone invests in active management. My advice would be to avoid high fees.",
  },
  {
    firstName: "John C.",
    lastName: "Bogle",
    title: "Founder, Vanguard",
    quote: "The investor put up 100% of the capital and assumed 100% of the risk, yet earned only 31% of the market return. Fees confiscated 70%.",
  },
  {
    firstName: "Charlie",
    lastName: "Munger",
    title: "Vice Chairman, Berkshire Hathaway",
    quote: "They're used to charging big fees for stuff that isn't doing their clients any good.",
  },
  {
    firstName: "Benjamin",
    lastName: "Franklin",
    title: "Founding Father",
    quote: "Money makes money. And the money that money makes, makes money.",
  },
  {
    firstName: "Warren",
    lastName: "Buffett",
    title: "Berkshire Hathaway Letter, 2016",
    quote: "The massive fees levied by 'helpers' would leave clients worse off than if they simply invested in an unmanaged low-cost index fund.",
  },
  {
    firstName: "William F.",
    lastName: "Sharpe",
    title: "Financial Analysts Journal, 1991",
    quote: "After costs, the return on the average actively managed dollar will be less than the return on the average passively managed dollar.",
  },
  {
    firstName: "John C.",
    lastName: "Bogle",
    title: "Founder, Vanguard",
    quote: "Fund performance comes and goes. Costs go on forever.",
  },
  {
    firstName: "Suze",
    lastName: "Orman",
    title: "Personal Finance Expert",
    quote: "Paying less in fees means keeping more of your money growing for your future.",
  },
];

// ============================================================================
// QUOTE TICKER COMPONENT
// ============================================================================

export default function QuoteTicker({ 
  label = "Don't take our word for it.",
  showLabel = true,
  speed = 159,
}: QuoteTickerProps) {
  const [hoveredQuote, setHoveredQuote] = useState<Quote | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const handleMouseEnter = (quote: Quote, e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPosition({ 
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
    setHoveredQuote(quote);
  };

  const handleMouseLeave = () => {
    setHoveredQuote(null);
  };

  const tickerItems = [...QUOTES, ...QUOTES];

  return (
    <>
      <style>{`
        @keyframes tickerScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ticker-scroll {
          will-change: transform;
        }
        .ticker-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>

      {hoveredQuote && (
        <div
          className="fixed z-[9999] w-80"
          style={{
            left: `${Math.min(Math.max(tooltipPosition.x, 170), typeof window !== 'undefined' ? window.innerWidth - 170 : 600)}px`,
            top: `${tooltipPosition.y - 16}px`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="rounded-2xl border border-stone-800 overflow-hidden" style={{ backgroundColor: '#e7e5e4' }}>
            <div style={{ backgroundColor: '#e7e5e4', padding: '20px 20px 16px 20px' }}>
              <p className="text-stone-700 text-sm leading-relaxed" style={{ backgroundColor: '#e7e5e4' }}>
                "{hoveredQuote.quote}"
              </p>
            </div>

            <div
              className="flex items-center gap-3 border-t border-stone-400"
              style={{ backgroundColor: '#e7e5e4', padding: '12px 20px 20px 20px' }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#d6d3d1' }}
              >
                <span className="text-stone-600 text-xs font-bold">
                  {hoveredQuote.firstName[0]}{hoveredQuote.lastName[0]}
                </span>
              </div>
              <div style={{ backgroundColor: '#e7e5e4' }}>
                <p className="text-stone-800 font-semibold text-sm" style={{ backgroundColor: '#e7e5e4' }}>
                  {hoveredQuote.firstName} {hoveredQuote.lastName}
                </p>
                <p className="text-stone-600 text-xs" style={{ backgroundColor: '#e7e5e4' }}>
                  {hoveredQuote.title}
                </p>
              </div>
            </div>
          </div>

          {/* Pointer arrow */}
          <div
            className="absolute left-1/2 w-4 h-4 border-r border-b border-stone-800"
            style={{
              backgroundColor: '#e7e5e4',
              bottom: '-8px',
              transform: 'translateX(-50%) rotate(45deg)',
            }}
          />
        </div>
      )}

      <div className="relative py-8 overflow-hidden bg-transparent">
        {showLabel && (
          <div className="text-center mb-[18px]">
            <span className="text-base font-medium tracking-wide text-stone-800">
              {label}
            </span>
          </div>
        )}

        <div 
          className="flex ticker-scroll"
          style={{
            animation: `tickerScroll ${speed}s linear infinite`,
            width: 'max-content',
          }}
        >
          {tickerItems.map((item, index) => (
            <div
              key={`${item.lastName}-${index}`}
              className="flex-shrink-0 px-12 cursor-pointer text-center group"
              onMouseEnter={(e) => handleMouseEnter(item, e)}
              onMouseLeave={handleMouseLeave}
            >
              <div className="flex flex-col items-center">
                <span className="text-stone-400 font-medium text-lg leading-none whitespace-nowrap">
                  {item.firstName}
                </span>
                <span className="text-stone-400 font-semibold text-3xl leading-none -mt-0.5 whitespace-nowrap">
                  {item.lastName}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
