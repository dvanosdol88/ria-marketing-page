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
// MOBILE QUOTE CAROUSEL
// ============================================================================

export default function MobileQuoteCarousel({
  quotes,
  portraits,
  label,
  subLabel,
  autoAdvanceMs = 5000,
}: MobileQuoteCarouselProps) {
  const groups = useRef(groupByLastName(quotes)).current;
  const [activeGroup, setActiveGroup] = useState(0);
  const [activeQuoteInGroup, setActiveQuoteInGroup] = useState(0);
  const [swipeX, setSwipeX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nameStripRef = useRef<HTMLDivElement>(null);

  const totalQuotes = groups.reduce((sum, [, q]) => sum + q.length, 0);

  // Flatten current position to a global index for display
  const currentQuotes = groups[activeGroup][1];
  const currentQuote = currentQuotes[activeQuoteInGroup];

  // ── Auto-advance ──────────────────────────────────────────────────────
  const resetAutoTimer = useCallback(() => {
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    autoTimerRef.current = setTimeout(() => {
      setActiveQuoteInGroup((prev) => {
        const groupQuotes = groups[activeGroup][1];
        if (prev + 1 < groupQuotes.length) return prev + 1;
        // Move to next group
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

  // ── Scroll active name into view ──────────────────────────────────────
  useEffect(() => {
    const strip = nameStripRef.current;
    if (!strip) return;
    const activeEl = strip.children[activeGroup] as HTMLElement | undefined;
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
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
    setActiveGroup(index);
    setActiveQuoteInGroup(0);
  }, []);

  // ── Touch handlers ────────────────────────────────────────────────────
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
    setIsSwiping(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.touches[0];
    if (!touch) return;
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    // Only track horizontal movement
    if (Math.abs(dx) > Math.abs(dy)) {
      setSwipeX(dx);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    const threshold = 50;
    if (swipeX < -threshold) {
      goNext();
    } else if (swipeX > threshold) {
      goPrev();
    }
    setSwipeX(0);
    setIsSwiping(false);
    touchStartRef.current = null;
    resetAutoTimer();
  }, [swipeX, goNext, goPrev, resetAutoTimer]);

  // ── Global progress indicator ─────────────────────────────────────────
  let globalIndex = 0;
  for (let i = 0; i < activeGroup; i++) {
    globalIndex += groups[i][1].length;
  }
  globalIndex += activeQuoteInGroup;

  return (
    <div className="select-none">
      {/* Header */}
      {label && (
        <div className="mb-4 text-center">
          <p className="text-xl font-semibold tracking-tight text-stone-800">{label}</p>
          {subLabel && <p className="mt-1 text-sm text-stone-600">{subLabel}</p>}
        </div>
      )}

      {/* Name strip */}
      <div
        ref={nameStripRef}
        className="scrollbar-hide mb-4 flex gap-2 overflow-x-auto px-2 pb-1"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {groups.map(([lastName], i) => (
          <button
            key={lastName}
            type="button"
            onClick={() => jumpToGroup(i)}
            className={`flex-shrink-0 rounded-full px-3 py-1 text-sm font-medium transition-colors ${
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
        className="relative overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="px-4"
          style={{
            transform: isSwiping ? `translateX(${swipeX * 0.4}px)` : undefined,
            transition: isSwiping ? 'none' : 'transform 0.3s ease-out',
          }}
        >
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            {/* Quote text */}
            <p className="text-base leading-relaxed text-stone-700">
              &ldquo;{currentQuote.quote}&rdquo;
            </p>

            {/* Attribution */}
            <div className="mt-4 flex items-center gap-3">
              {portraits[currentQuote.lastName] ? (
                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border border-stone-200 bg-white">
                  <Image
                    src={portraits[currentQuote.lastName]}
                    alt={`${currentQuote.firstName} ${currentQuote.lastName}`}
                    width={96}
                    height={96}
                    unoptimized
                    className="h-full w-full object-cover object-top"
                  />
                </div>
              ) : (
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-stone-100">
                  <span className="text-sm font-bold text-stone-500">
                    {currentQuote.firstName[0]}{currentQuote.lastName[0]}
                  </span>
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-stone-800">
                  {currentQuote.firstName} {currentQuote.lastName}
                </p>
                <p className="text-xs text-stone-500">{currentQuote.title}</p>
              </div>
            </div>

            {/* Multi-quote indicator for this person */}
            {currentQuotes.length > 1 && (
              <div className="mt-3 flex items-center justify-center gap-1.5">
                {currentQuotes.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => { setActiveQuoteInGroup(i); resetAutoTimer(); }}
                    className={`h-1.5 rounded-full transition-all ${
                      i === activeQuoteInGroup ? 'w-4 bg-[#00A540]' : 'w-1.5 bg-stone-300'
                    }`}
                    aria-label={`Quote ${i + 1} of ${currentQuotes.length}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Global progress: "3 of 20" */}
      <p className="mt-3 text-center text-xs text-stone-400">
        {globalIndex + 1} of {totalQuotes}
      </p>
    </div>
  );
}
