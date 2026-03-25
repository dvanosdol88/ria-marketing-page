'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';

// ============================================================================
// TYPES
// ============================================================================

interface Quote {
  firstName: string;
  lastName: string;
  title: string;
  quote: string;
}

interface MobileQuoteCarouselProps {
  quotes: Quote[];
  portraits: Record<string, string>;
  label?: string;
  subLabel?: string;
  autoAdvanceMs?: number;
}

// ============================================================================
// GROUP QUOTES BY LAST NAME (preserve order of first appearance)
// ============================================================================

function groupByLastName(quotes: Quote[]) {
  const seen = new Map<string, Quote[]>();
  for (const q of quotes) {
    const existing = seen.get(q.lastName);
    if (existing) {
      existing.push(q);
    } else {
      seen.set(q.lastName, [q]);
    }
  }
  return Array.from(seen.entries()); // [lastName, quotes[]]
}

// ============================================================================
// CONSTANTS
// ============================================================================

const ROLL_MS = 400;   // quote text roll duration
const FADE_MS = 300;   // full-card crossfade duration

// Per-person horizontal offset (px) to center portraits in the circle
const PORTRAIT_OFFSET: Record<string, number> = {
  'Fama': 10,
  'Malkiel': 10,
  'Munger': 10,
  'Franklin': 10,
  'Sharpe': -10,
};

// ============================================================================
// MOBILE QUOTE CAROUSEL
// ============================================================================

export default function MobileQuoteCarousel({
  quotes,
  portraits,
  label,
  subLabel,
  autoAdvanceMs = 6000,
}: MobileQuoteCarouselProps) {
  const groups = useRef(groupByLastName(quotes)).current;
  const [activeGroup, setActiveGroup] = useState(0);
  const [activeQuoteInGroup, setActiveQuoteInGroup] = useState(0);

  // ── Displayed content (lags behind active when animating) ───────────
  const [displayedGroup, setDisplayedGroup] = useState(0);
  const [displayedQuoteInGroup, setDisplayedQuoteInGroup] = useState(0);

  // ── Animation state ─────────────────────────────────────────────────
  const [isRolling, setIsRolling] = useState(false);     // within-person quote roll
  const [cardFade, setCardFade] = useState(true);         // full-card opacity (true = visible)

  // ── Quote area fixed height ─────────────────────────────────────────
  const [quoteHeight, setQuoteHeight] = useState<number | undefined>(undefined);
  const measureRef = useRef<HTMLDivElement>(null);

  // Touch tracking via refs (no re-renders during swipe)
  const cardRef = useRef<HTMLDivElement>(null);
  const touchRef = useRef<{
    startX: number;
    startY: number;
    currentX: number;
    locked: 'horizontal' | 'vertical' | null;
  } | null>(null);

  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nameStripRef = useRef<HTMLDivElement>(null);

  const totalQuotes = groups.reduce((sum, [, q]) => sum + q.length, 0);

  const displayedQuotes = groups[displayedGroup][1];
  const displayedQuote = displayedQuotes[displayedQuoteInGroup];
  const nextQuote = groups[activeGroup][1][activeQuoteInGroup];

  // ── Measure max quote height on mount ───────────────────────────────
  useEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    let maxH = 0;
    const children = el.children;
    for (let i = 0; i < children.length; i++) {
      const h = (children[i] as HTMLElement).offsetHeight;
      if (h > maxH) maxH = h;
    }
    if (maxH > 0) setQuoteHeight(maxH);
  }, []);

  // ── Handle navigation changes with animations ──────────────────────
  useEffect(() => {
    const sameGroup = activeGroup === displayedGroup;
    const sameQuote = activeQuoteInGroup === displayedQuoteInGroup;
    if (sameGroup && sameQuote) return;

    if (sameGroup) {
      // Within-person: roll quote text only
      setIsRolling(true);
      const timer = setTimeout(() => {
        setDisplayedQuoteInGroup(activeQuoteInGroup);
        setIsRolling(false);
      }, ROLL_MS);
      return () => clearTimeout(timer);
    } else {
      // Different person: fade entire card
      setCardFade(false);
      const timer = setTimeout(() => {
        setDisplayedGroup(activeGroup);
        setDisplayedQuoteInGroup(activeQuoteInGroup);
        requestAnimationFrame(() => setCardFade(true));
      }, FADE_MS);
      return () => clearTimeout(timer);
    }
  }, [activeGroup, activeQuoteInGroup, displayedGroup, displayedQuoteInGroup]);

  // ── Auto-advance ──────────────────────────────────────────────────────
  const resetAutoTimer = useCallback(() => {
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    autoTimerRef.current = setTimeout(() => {
      setActiveQuoteInGroup((prev) => {
        const groupQuotes = groups[activeGroup][1];
        if (prev + 1 < groupQuotes.length) return prev + 1;
        setActiveGroup((g) => (g + 1) % groups.length);
        return 0;
      });
    }, autoAdvanceMs);
  }, [activeGroup, autoAdvanceMs, groups]);

  useEffect(() => {
    resetAutoTimer();
    return () => {
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    };
  }, [activeGroup, activeQuoteInGroup, resetAutoTimer]);

  // ── Scroll active name into view (start flush-left for Bogle) ───────
  useEffect(() => {
    const strip = nameStripRef.current;
    if (!strip) return;
    if (activeGroup === 0) {
      strip.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      const activeEl = strip.children[activeGroup] as HTMLElement | undefined;
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [activeGroup]);

  // ── Navigation helpers ────────────────────────────────────────────────
  const goNext = useCallback(() => {
    const groupQuotes = groups[activeGroup][1];
    if (activeQuoteInGroup + 1 < groupQuotes.length) {
      setActiveQuoteInGroup((p) => p + 1);
    } else {
      setActiveGroup((g) => (g + 1) % groups.length);
      setActiveQuoteInGroup(0);
    }
  }, [activeGroup, activeQuoteInGroup, groups]);

  const goPrev = useCallback(() => {
    if (activeQuoteInGroup > 0) {
      setActiveQuoteInGroup((p) => p - 1);
    } else {
      const prevGroup = (activeGroup - 1 + groups.length) % groups.length;
      setActiveGroup(prevGroup);
      setActiveQuoteInGroup(groups[prevGroup][1].length - 1);
    }
  }, [activeGroup, activeQuoteInGroup, groups]);

  const jumpToGroup = useCallback((index: number) => {
    if (index === activeGroup) return;
    setActiveGroup(index);
    setActiveQuoteInGroup(0);
  }, [activeGroup]);

  const jumpToQuoteInGroup = useCallback((index: number) => {
    if (index === activeQuoteInGroup) return;
    setActiveQuoteInGroup(index);
    resetAutoTimer();
  }, [activeQuoteInGroup, resetAutoTimer]);

  // ── Touch handlers (direct DOM, direction-locked) ─────────────────────
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;
    touchRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      locked: null,
    };
    if (cardRef.current) {
      cardRef.current.style.transition = 'none';
    }
  }, []);

  // Check if swiping in a direction stays within the same person
  const wouldStayInGroup = useCallback((direction: 'next' | 'prev') => {
    const groupQuotes = groups[activeGroup][1];
    return direction === 'next'
      ? activeQuoteInGroup + 1 < groupQuotes.length
      : activeQuoteInGroup > 0;
  }, [activeGroup, activeQuoteInGroup, groups]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const state = touchRef.current;
    if (!state) return;
    const touch = e.touches[0];
    if (!touch) return;

    const dx = touch.clientX - state.startX;
    const dy = touch.clientY - state.startY;

    if (!state.locked) {
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);
      if (absDx < 8 && absDy < 8) return;
      state.locked = absDx > absDy ? 'horizontal' : 'vertical';
    }

    if (state.locked === 'vertical') return;

    e.preventDefault();
    state.currentX = touch.clientX;

    // Only slide card if swipe would change person; within-person uses text roll only
    const direction = dx < 0 ? 'next' : 'prev';
    if (cardRef.current && !wouldStayInGroup(direction)) {
      const offset = dx * 0.5;
      cardRef.current.style.transform = `translateX(${offset}px)`;
    }
  }, [wouldStayInGroup]);

  const handleTouchEnd = useCallback(() => {
    const state = touchRef.current;
    touchRef.current = null;

    if (cardRef.current) {
      cardRef.current.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      cardRef.current.style.transform = 'translateX(0)';
    }

    if (!state || state.locked !== 'horizontal') return;

    const dx = state.currentX - state.startX;
    const threshold = 40;
    if (dx < -threshold) {
      goNext();
    } else if (dx > threshold) {
      goPrev();
    }
    resetAutoTimer();
  }, [goNext, goPrev, resetAutoTimer]);

  // ── Global progress ─────────────────────────────────────────────────
  let globalIndex = 0;
  for (let i = 0; i < activeGroup; i++) {
    globalIndex += groups[i][1].length;
  }
  globalIndex += activeQuoteInGroup;

  // Currently displayed person's quotes (for dots)
  const currentPersonQuotes = groups[displayedGroup][1];

  return (
    <div className="select-none">
      {/* Hidden measurement container — renders all quotes to find max height */}
      <div ref={measureRef} className="pointer-events-none absolute left-0 right-0 -z-10 px-8 opacity-0" aria-hidden="true">
        {quotes.map((q, i) => (
          <p key={i} className="text-base leading-relaxed">
            &ldquo;{q.quote}&rdquo;
          </p>
        ))}
      </div>

      {/* Header */}
      {label && (
        <div className="mb-4 text-center">
          <p className="text-xl font-semibold tracking-tight text-stone-800">{label}</p>
          {subLabel && (
            <p className="mt-1 text-sm text-stone-600">
              {subLabel.split(/(legends)/i).map((part, i) =>
                part.toLowerCase() === 'legends'
                  ? <span key={i} className="font-bold text-[#00A540]">{part}</span>
                  : part
              )}
            </p>
          )}
        </div>
      )}

      {/* Name strip */}
      <div
        ref={nameStripRef}
        className="scrollbar-hide mb-3 flex gap-2 overflow-x-auto px-2 pb-1"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {groups.map(([lastName], i) => (
          <button
            key={lastName}
            type="button"
            onClick={() => jumpToGroup(i)}
            className={`flex-shrink-0 rounded-full px-3 py-1 text-sm font-medium transition-colors duration-300 ${
              i === activeGroup
                ? 'bg-[#00A540] text-white'
                : 'bg-stone-100 text-stone-500'
            }`}
          >
            {lastName}
          </button>
        ))}
      </div>

      {/* Quote card with swipe */}
      <div
        className="relative overflow-hidden touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          ref={cardRef}
          className="px-4"
          style={{ willChange: 'transform' }}
        >
          <div className="rounded-2xl border border-stone-200 bg-white p-4 pb-2 shadow-sm">

            {/* ── Quote text area (rolls within person, fades between persons) ── */}
            <div
              className="relative overflow-hidden"
              style={quoteHeight ? { height: quoteHeight } : undefined}
            >
              {/* Outgoing quote (current displayed) */}
              <div
                className="absolute inset-x-0 top-0"
                style={{
                  transform: isRolling ? 'translateY(-100%)' : 'translateY(0)',
                  opacity: cardFade ? 1 : 0,
                  transition: isRolling
                    ? `transform ${ROLL_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`
                    : `opacity ${FADE_MS}ms ease-in-out`,
                }}
              >
                <p className="text-base leading-relaxed text-stone-700">
                  &ldquo;{displayedQuote.quote}&rdquo;
                </p>
              </div>

              {/* Incoming quote (rolls up into view) — only during roll */}
              {isRolling && (
                <div
                  className="absolute inset-x-0 top-0"
                  style={{
                    transform: 'translateY(0)',
                    opacity: 1,
                    animation: `rollIn ${ROLL_MS}ms cubic-bezier(0.4, 0, 0.2, 1) both`,
                  }}
                >
                  <p className="text-base leading-relaxed text-stone-700">
                    &ldquo;{nextQuote.quote}&rdquo;
                  </p>
                </div>
              )}
            </div>

            {/* ── Attribution (static within person, fades between persons) ── */}
            <div
              className="mt-2 flex items-center gap-3"
              style={{
                opacity: cardFade ? 1 : 0,
                transition: `opacity ${FADE_MS}ms ease-in-out`,
              }}
            >
              {portraits[displayedQuote.lastName] ? (
                <div className="h-[67px] w-[67px] flex-shrink-0 overflow-hidden rounded-full border border-stone-200 bg-white">
                  <Image
                    src={portraits[displayedQuote.lastName]}
                    alt={`${displayedQuote.firstName} ${displayedQuote.lastName}`}
                    width={134}
                    height={134}
                    unoptimized
                    className="h-full w-full object-cover object-top"
                    style={PORTRAIT_OFFSET[displayedQuote.lastName] ? {
                      objectPosition: `calc(50% + ${PORTRAIT_OFFSET[displayedQuote.lastName]}px) top`,
                    } : undefined}
                  />
                </div>
              ) : (
                <div className="flex h-[67px] w-[67px] flex-shrink-0 items-center justify-center rounded-full bg-stone-100">
                  <span className="text-base font-bold text-stone-500">
                    {displayedQuote.firstName[0]}{displayedQuote.lastName[0]}
                  </span>
                </div>
              )}
              <div>
                <p className="text-base font-semibold text-stone-800">
                  {displayedQuote.firstName} {displayedQuote.lastName}
                </p>
                <p className="text-sm text-stone-500">{displayedQuote.title}</p>
              </div>
            </div>

            {/* ── Multi-quote dots (always rendered for uniform height) ── */}
            <div className="mt-1 flex h-4 items-center justify-center gap-2">
              {currentPersonQuotes.length > 1 &&
                currentPersonQuotes.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => jumpToQuoteInGroup(i)}
                    className={`rounded-full transition-all duration-300 ${
                      i === activeQuoteInGroup
                        ? 'h-2.5 w-6 bg-[#00A540]'
                        : 'h-2.5 w-2.5 bg-stone-300'
                    }`}
                    aria-label={`Quote ${i + 1} of ${currentPersonQuotes.length}`}
                  />
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Roll-in keyframe */}
      <style>{`
        @keyframes rollIn {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      {/* Global progress: "3 of 20" */}
      <p className="mt-2 text-center text-xs text-stone-400">
        {globalIndex + 1} of {totalQuotes}
      </p>
    </div>
  );
}
