'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import { homeCalculatorConfig } from '@/config/homeCalculatorConfig';
import {
  FEE_QUOTES,
  FEE_QUOTE_PORTRAITS,
  FEE_QUOTE_PORTRAIT_OFFSET,
  type FeeQuote,
} from '@/config/feeQuotes';
import MobileQuoteCarousel from './MobileQuoteCarousel';

// ============================================================================
// TYPES
// ============================================================================

type Quote = FeeQuote;

interface QuoteTickerProps {
  label?: string;
  subLabel?: string;
  showLabel?: boolean;
  speed?: number;
}

// ============================================================================
// QUOTES DATA — single source: src/config/feeQuotes.ts (shared with the
// homepage FeeQuoteDeck). Local names kept so the rest of this file reads
// unchanged.
// ============================================================================

const PORTRAITS = FEE_QUOTE_PORTRAITS;
const PORTRAIT_OFFSET = FEE_QUOTE_PORTRAIT_OFFSET;
const QUOTES = FEE_QUOTES;

/* The Buffett quote used for the first-visit auto-demo */
const DEMO_QUOTE = QUOTES[2]; // Warren Buffett

// ============================================================================
// QUOTE TICKER WITH PORTRAITS COMPONENT
// ============================================================================

export default function QuoteTickerWithPortraits({
  label = homeCalculatorConfig.quoteTicker.label,
  subLabel = homeCalculatorConfig.quoteTicker.subLabel,
  showLabel = true,
  speed = 159,
}: QuoteTickerProps) {
  const [hoveredQuote, setHoveredQuote] = useState<Quote | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showHint, setShowHint] = useState(true);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const tickerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<Animation | null>(null);
  const tweenRef = useRef<number | null>(null);
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);
  const swipeResumeRef = useRef<number | null>(null);
  const hasAutoPlayedRef = useRef(false);
  const hasInteractedRef = useRef(false);

  /* Detect touch device */
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  /* Fade out hint after 5 seconds */
  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const dismissHint = useCallback(() => {
    if (!hasInteractedRef.current) {
      hasInteractedRef.current = true;
      setShowHint(false);
    }
  }, []);

  const tweenPlaybackRate = useCallback((animation: Animation, targetRate: number, duration: number) => {
    if (tweenRef.current) cancelAnimationFrame(tweenRef.current);

    const startRate = animation.playbackRate;
    const startTime = performance.now();

    const update = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);

      animation.playbackRate = startRate + (targetRate - startRate) * ease;

      if (progress < 1) {
        tweenRef.current = requestAnimationFrame(update);
      }
    };

    tweenRef.current = requestAnimationFrame(update);
  }, []);

  const handleMouseEnter = useCallback((quote: Quote, e: React.MouseEvent<HTMLDivElement>) => {
    dismissHint();
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
    setHoveredQuote(quote);
  }, [dismissHint]);

  const handleMouseLeave = useCallback(() => {
    setHoveredQuote(null);
  }, []);

  const nudgeTicker = useCallback((direction: 'next' | 'prev') => {
    const animation = scrollerRef.current;
    if (!animation) return;

    const baseTime = typeof animation.currentTime === 'number' ? animation.currentTime : 0;
    const jump = speed * 1000 * 0.08;
    const delta = direction === 'next' ? jump : -jump;
    animation.currentTime = Math.max(0, baseTime + delta);

    tweenPlaybackRate(animation, 0.55, 220);
    if (swipeResumeRef.current) window.clearTimeout(swipeResumeRef.current);
    swipeResumeRef.current = window.setTimeout(() => {
      if (scrollerRef.current) tweenPlaybackRate(scrollerRef.current, 1, 550);
    }, 220);
  }, [speed, tweenPlaybackRate]);

  /* Touch/tap handler for mobile — toggles tooltip on tap */
  const handleItemClick = useCallback((quote: Quote, e: React.MouseEvent<HTMLDivElement>) => {
    if (!isTouchDevice) return; // Desktop uses hover
    e.preventDefault();
    e.stopPropagation();
    dismissHint();

    if (hoveredQuote && hoveredQuote.lastName === quote.lastName && hoveredQuote.quote === quote.quote) {
      // Tap same item → dismiss
      setHoveredQuote(null);
      if (scrollerRef.current) tweenPlaybackRate(scrollerRef.current, 1, 1000);
    } else {
      // Tap new item → show tooltip
      const rect = e.currentTarget.getBoundingClientRect();
      setTooltipPosition({ x: rect.left + rect.width / 2, y: rect.top });
      setHoveredQuote(quote);
      if (scrollerRef.current) tweenPlaybackRate(scrollerRef.current, 0, 1500);
    }
  }, [isTouchDevice, hoveredQuote, dismissHint, tweenPlaybackRate]);

  /* Click-outside handler for mobile — dismiss tooltip when tapping outside ticker */
  useEffect(() => {
    if (!hoveredQuote || !isTouchDevice) return;

    const handleOutside = (e: TouchEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setHoveredQuote(null);
        if (scrollerRef.current) tweenPlaybackRate(scrollerRef.current, 1, 1000);
      }
    };

    document.addEventListener('touchstart', handleOutside, { passive: true });
    return () => document.removeEventListener('touchstart', handleOutside);
  }, [hoveredQuote, isTouchDevice, tweenPlaybackRate]);

  const handleWrapperMouseEnter = useCallback(() => {
    if (isTouchDevice) return; // Mobile uses tap
    if (scrollerRef.current) {
      tweenPlaybackRate(scrollerRef.current, 0, 1500);
    }
  }, [isTouchDevice, tweenPlaybackRate]);

  const handleWrapperMouseLeave = useCallback(() => {
    if (isTouchDevice) return;
    setHoveredQuote(null);
    if (scrollerRef.current) {
      tweenPlaybackRate(scrollerRef.current, 1, 1000);
    }
  }, [isTouchDevice, tweenPlaybackRate]);

  const handleWrapperTouchStart = useCallback((event: React.TouchEvent<HTMLDivElement>) => {
    if (!isTouchDevice) return;
    const touch = event.touches[0];
    if (!touch) return;
    swipeStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, [isTouchDevice]);

  const handleWrapperTouchEnd = useCallback((event: React.TouchEvent<HTMLDivElement>) => {
    if (!isTouchDevice || !swipeStartRef.current) return;
    const touch = event.changedTouches[0];
    if (!touch) return;

    const deltaX = touch.clientX - swipeStartRef.current.x;
    const deltaY = touch.clientY - swipeStartRef.current.y;
    swipeStartRef.current = null;

    const isHorizontalSwipe = Math.abs(deltaX) > 36 && Math.abs(deltaX) > Math.abs(deltaY);
    if (!isHorizontalSwipe) return;

    dismissHint();
    setHoveredQuote(null);
    nudgeTicker(deltaX < 0 ? 'next' : 'prev');
  }, [dismissHint, isTouchDevice, nudgeTicker]);

  /* Set up Web Animation API scroller */
  useEffect(() => {
    const ticker = tickerRef.current;
    if (!ticker) return;

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
      if (swipeResumeRef.current) window.clearTimeout(swipeResumeRef.current);
    };
  }, [speed]);

  /* Auto-demo: on first session visit, showcase Buffett quote */
  useEffect(() => {
    if (hasAutoPlayedRef.current) return;

    // Check sessionStorage
    try {
      if (sessionStorage.getItem('ticker-demo-played')) {
        hasAutoPlayedRef.current = true;
        return;
      }
    } catch { /* sessionStorage unavailable — proceed anyway */ }

    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAutoPlayedRef.current) {
          hasAutoPlayedRef.current = true;
          observer.disconnect();

          // Delay before triggering the demo
          const startTimer = setTimeout(() => {
            // Find the first Buffett element in the ticker
            const buffettEl = wrapper.querySelector('[data-demo-name="Buffett"]') as HTMLElement;
            if (!buffettEl || !scrollerRef.current) return;

            // Decelerate ticker
            tweenPlaybackRate(scrollerRef.current, 0, 1500);

            // Show tooltip after deceleration starts
            const showTimer = setTimeout(() => {
              const rect = buffettEl.getBoundingClientRect();
              setTooltipPosition({ x: rect.left + rect.width / 2, y: rect.top });
              setHoveredQuote(DEMO_QUOTE);
              setShowHint(false);

              // Dismiss after 3.5 seconds and resume scrolling
              const dismissTimer = setTimeout(() => {
                setHoveredQuote(null);
                if (scrollerRef.current) {
                  tweenPlaybackRate(scrollerRef.current, 1, 1000);
                }
              }, 3500);

              return () => clearTimeout(dismissTimer);
            }, 800);

            return () => clearTimeout(showTimer);
          }, 2500);

          try { sessionStorage.setItem('ticker-demo-played', '1'); } catch { /* ignore */ }

          return () => clearTimeout(startTimer);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(wrapper);
    return () => observer.disconnect();
  }, [tweenPlaybackRate]);

  const tickerItems = [...QUOTES, ...QUOTES];

  return (
    <>
      {/* Mobile: card carousel */}
      <div className="sm:hidden">
        <MobileQuoteCarousel
          quotes={QUOTES}
          portraits={PORTRAITS}
          label={showLabel ? label : undefined}
          subLabel={showLabel ? subLabel : undefined}
        />
      </div>

      {/* Desktop: scrolling ticker with hover tooltips */}
      <div className="hidden sm:block">
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
              {PORTRAITS[hoveredQuote.lastName] ? (
                <div className="w-[90px] h-[90px] rounded-full overflow-hidden flex-shrink-0 border border-stone-300 bg-white">
                  <Image
                    src={PORTRAITS[hoveredQuote.lastName]}
                    alt={`${hoveredQuote.firstName} ${hoveredQuote.lastName}`}
                    width={1024}
                    height={1024}
                    unoptimized
                    className="object-cover object-top w-full h-full"
                    style={PORTRAIT_OFFSET[hoveredQuote.lastName] ? {
                      objectPosition: `calc(50% + ${PORTRAIT_OFFSET[hoveredQuote.lastName]}px) top`,
                    } : undefined}
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
        ref={wrapperRef}
        className="relative overflow-hidden bg-transparent ticker-wrapper"
        onMouseEnter={handleWrapperMouseEnter}
        onMouseLeave={handleWrapperMouseLeave}
        onTouchStart={handleWrapperTouchStart}
        onTouchEnd={handleWrapperTouchEnd}
      >
        {showLabel && (
          <div className="mb-3 mt-0 text-center">
            <p className="text-xl font-semibold tracking-tight text-stone-800">
              {label}
            </p>
            <p className="mt-1 text-sm text-stone-600">
              {subLabel.split(/(legends)/i).map((part, i) =>
                part.toLowerCase() === 'legends'
                  ? <span key={i} className="font-bold text-[#00A540]">{part}</span>
                  : part
              )}
            </p>
            {/* Subtle interaction hint — fades out after 5s or first interaction */}
            <div
              className={`mt-1 transition-opacity duration-700 ${
                showHint ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              <span className="text-xs text-stone-400">
                {isTouchDevice ? homeCalculatorConfig.quoteTicker.touchHint : homeCalculatorConfig.quoteTicker.hoverHint}
              </span>
            </div>
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
              data-demo-name={item.lastName}
              onMouseEnter={(e) => handleMouseEnter(item, e)}
              onMouseLeave={handleMouseLeave}
              onClick={(e) => handleItemClick(item, e)}
            >
              <div className="flex flex-col items-center">
                <span className="text-stone-400 font-medium text-lg leading-none whitespace-nowrap transition-all duration-300 ease-in-out transform group-hover:scale-110 group-hover:text-[#007A2F]">
                  {item.firstName}
                </span>
                <span className="text-stone-400 font-semibold text-3xl leading-none -mt-0.5 whitespace-nowrap transition-all duration-300 ease-in-out transform group-hover:scale-110 group-hover:text-[#007A2F]">
                  {item.lastName}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>
    </>
  );
}
