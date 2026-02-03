'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

// ============================================================================
// TYPES
// ============================================================================

interface Quote {
  firstName: string;
  lastName: string;
  title: string;
  quote: string;
  portrait?: string; // Path to WSJ-style portrait image
}

interface QuoteTickerProps {
  label?: string;
  showLabel?: boolean;
  speed?: number;
}

// ============================================================================
// PORTRAIT MAPPING
// ============================================================================

const PORTRAITS: Record<string, string> = {
  'Bogle': '/images/portraits/WSJ-john-bogle.jpg',
  'Fama': '/images/portraits/WSJ-eugene-fama.jpg',
  'Buffett': '/images/portraits/WSJ-warren-buffett.jpg',
  'Malkiel': '/images/portraits/WSJ-burton-malkiel.jpg',
  'Swensen': '/images/portraits/WSJ-david-swensen.jpg',
  'Munger': '/images/portraits/WSJ-charlie-munger.jpg',
  'Sharpe': '/images/portraits/WSJ-william-sharpe.jpg',
  'Orman': '/images/portraits/WSJ-suzie-orman.jpg',
  'Franklin': '/images/portraits/WSJ-benjamin-franklin.jpg',
  'Ramsey': '/images/portraits/WSJ-dave-ramsey.jpg',
  'Van Osdol': '/images/portraits/WSJ-DVO.jpg',
};

// ============================================================================
// QUOTES DATA
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
// QUOTE TICKER WITH PORTRAITS COMPONENT
// ============================================================================

export default function QuoteTickerWithPortraits({ 
  label = "Don't take our word for it.",
  showLabel = true,
  speed = 159,
}: QuoteTickerProps) {
  const [hoveredQuote, setHoveredQuote] = useState<Quote | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
  const tickerRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<Animation | null>(null);
  const tweenRef = useRef<number | null>(null);

  const tweenPlaybackRate = (animation: Animation, targetRate: number, duration: number) => {
    if (tweenRef.current) cancelAnimationFrame(tweenRef.current);
    
    const startRate = animation.playbackRate;
    const startTime = performance.now();

    const update = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic for a "heavy", smooth feel
      const ease = 1 - Math.pow(1 - progress, 3);
      
      animation.playbackRate = startRate + (targetRate - startRate) * ease;

      if (progress < 1) {
        tweenRef.current = requestAnimationFrame(update);
      }
    };
    
    tweenRef.current = requestAnimationFrame(update);
  };

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

  const handleWrapperMouseEnter = () => {
    if (scrollerRef.current) {
      // Very slow come to a stop over 1.5 seconds
      tweenPlaybackRate(scrollerRef.current, 0, 1500);
    }
  };

  const handleWrapperMouseLeave = () => {
    setHoveredQuote(null);
    if (scrollerRef.current) {
      // Gradual acceleration back to full speed over 1 second
      tweenPlaybackRate(scrollerRef.current, 1, 1000);
    }
  };

  useEffect(() => {
    const ticker = tickerRef.current;
    if (!ticker) return;

    // Use Web Animation API for smooth programmatic control
    const animation = ticker.animate(
      [
        { transform: 'translateX(0)' },
        { transform: 'translateX(-50%)' }
      ],
      {
        duration: speed * 1000,
        iterations: Infinity,
        easing: 'linear'
      }
    );

    scrollerRef.current = animation;

    return () => {
      animation.cancel();
      if (tweenRef.current) cancelAnimationFrame(tweenRef.current);
    };
  }, [speed]);

  const tickerItems = [...QUOTES, ...QUOTES];

  return (
    <>
      {hoveredQuote && (
        <div
          className="fixed z-[9999] w-80"
          style={{
            left: `${Math.min(Math.max(tooltipPosition.x, 170), typeof window !== 'undefined' ? window.innerWidth - 170 : 600)}px`,
            top: `${tooltipPosition.y - 16}px`,
            transform: 'translate(-50%, -100%)',
            pointerEvents: 'none',
          }}
        >
          <div className="rounded-2xl border border-stone-800 overflow-hidden shadow-2xl" style={{ backgroundColor: '#e7e5e4' }}>
            <div style={{ backgroundColor: '#e7e5e4', padding: '24px 24px 20px 24px' }}>
              <p className="text-stone-700 text-base leading-relaxed" style={{ backgroundColor: '#e7e5e4' }}>
                &ldquo;{hoveredQuote.quote}&rdquo;
              </p>
            </div>

            <div
              className="flex items-center gap-4 border-t border-stone-400"
              style={{ backgroundColor: '#e7e5e4', padding: '16px 24px 24px 24px' }}
            >
              {/* Portrait or Initials Fallback */}
              {PORTRAITS[hoveredQuote.lastName] ? (
                <div className="w-[90px] h-[90px] rounded-full overflow-hidden flex-shrink-0 border border-stone-300 bg-white">
                  <Image
                    src={PORTRAITS[hoveredQuote.lastName]}
                    alt={`${hoveredQuote.firstName} ${hoveredQuote.lastName}`}
                    width={90}
                    height={90}
                    quality={100}
                    unoptimized
                    className="object-cover object-top w-full h-full"
                  />
                </div>
              ) : (
                <div
                  className="w-[90px] h-[90px] rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: '#d6d3d1' }}
                >
                  <span className="text-stone-600 text-base font-bold">
                    {hoveredQuote.firstName[0]}{hoveredQuote.lastName[0]}
                  </span>
                </div>
              )}
              <div style={{ backgroundColor: '#e7e5e4' }}>
                <p className="text-stone-800 font-semibold text-base" style={{ backgroundColor: '#e7e5e4' }}>
                  {hoveredQuote.firstName} {hoveredQuote.lastName}
                </p>
                <p className="text-stone-600 text-sm" style={{ backgroundColor: '#e7e5e4' }}>
                  {hoveredQuote.title}
                </p>
              </div>
            </div>
          </div>

          {/* Pointer arrow */}
          <div
            className="absolute left-1/2 w-4 h-4 border-r border-b border-stone-800 shadow-xl"
            style={{
              backgroundColor: '#e7e5e4',
              bottom: '-8px',
              transform: 'translateX(-50%) rotate(45deg)',
            }}
          />
        </div>
      )}

      <div
        className="relative overflow-hidden bg-transparent ticker-wrapper" 
        onMouseEnter={handleWrapperMouseEnter}
        onMouseLeave={handleWrapperMouseLeave}
      >
        {showLabel && (
          <div className="text-center mb-[18px] mt-2">
            <span className="text-base font-medium tracking-wide text-stone-800">
              {label}
            </span>
          </div>
        )}

        <div 
          className="flex ticker-scroll pt-2 pb-6" 
          ref={tickerRef}
          style={{
            width: 'max-content',
            willChange: 'transform'
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
                <span className="text-stone-400 font-medium text-lg leading-none whitespace-nowrap transition-all duration-300 ease-in-out transform group-hover:scale-110 group-hover:text-green-600">
                  {item.firstName}
                </span>
                <span className="text-stone-400 font-semibold text-3xl leading-none -mt-0.5 whitespace-nowrap transition-all duration-300 ease-in-out transform group-hover:scale-110 group-hover:text-green-600">
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
