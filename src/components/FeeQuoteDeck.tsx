"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useAnimationControls, useInView, useReducedMotion } from "framer-motion";
import {
  FEE_QUOTES,
  FEE_QUOTE_PORTRAITS,
  FEE_QUOTE_PORTRAIT_OFFSET,
  type FeeQuote,
} from "@/config/feeQuotes";
import { homeCalculatorConfig } from "@/config/homeCalculatorConfig";

/**
 * The homepage quote deck: two fee quotes stacked, each one its own
 * independently swipeable card — swipe (or drag, or arrow-key) the top quote
 * without moving the bottom one, and vice versa (David, 2026-08-13: "they
 * should be independent"). No visible prev/next buttons; the affordances are
 * the peeking card edge behind each quote, a one-time nudge animation when
 * the deck first scrolls into view, the grab cursor, and the hint line.
 *
 * It occupies the intentional pause between the primary conversion CTA and
 * the firm handoff card — the pause survives as generous breathing room, but
 * the space now works: voices the visitor already trusts, restating the
 * page's thesis while the ask settles.
 *
 * Compliance: every entry is a third-party statement about investment costs
 * generally — never a testimonial about this firm. Keep it that way.
 *
 * The pool is dealt alternately between the two slots (top gets 1st, 3rd,
 * 5th… — bottom gets 2nd, 4th, 6th…), so the two cards can never show the
 * same quote no matter how either is swiped, and the pool's deliberate
 * lead ordering (Bogle, then Fama) still opens the deck.
 */

function splitPoolAlternately(quotes: FeeQuote[]): [FeeQuote[], FeeQuote[]] {
  const top: FeeQuote[] = [];
  const bottom: FeeQuote[] = [];
  quotes.forEach((quote, index) => {
    (index % 2 === 0 ? top : bottom).push(quote);
  });
  return [top, bottom];
}

function QuoteCard({ quote, counter }: { quote: FeeQuote; counter: string }) {
  const portraitSrc = FEE_QUOTE_PORTRAITS[quote.lastName];
  const portraitOffset = FEE_QUOTE_PORTRAIT_OFFSET[quote.lastName];

  return (
    <figure className="flex items-start gap-4 rounded-2xl border border-[#D8E2EA] bg-white p-4 shadow-[0_10px_30px_rgba(17,33,52,0.07)] sm:gap-5 sm:p-6">
      {portraitSrc ? (
        <Image
          src={portraitSrc}
          alt=""
          width={128}
          height={128}
          className="h-14 w-14 shrink-0 rounded-full border border-[#E4ECF2] bg-[#F4F7FA] object-cover sm:h-16 sm:w-16"
          style={portraitOffset ? { objectPosition: `50% ${portraitOffset}%` } : undefined}
          draggable={false}
        />
      ) : (
        <span aria-hidden="true" className="h-14 w-14 shrink-0 rounded-full bg-[#EAF1F8] sm:h-16 sm:w-16" />
      )}
      <div className="min-w-0 flex-1">
        <blockquote className="text-[15px] font-medium leading-6 text-[#10233A] sm:text-base sm:leading-7">
          <span aria-hidden="true" className="mr-0.5 font-black text-[#00A540]">
            &ldquo;
          </span>
          {quote.quote}
          <span aria-hidden="true" className="ml-0.5 font-black text-[#00A540]">
            &rdquo;
          </span>
        </blockquote>
        <figcaption className="mt-2.5 flex items-baseline gap-3 text-sm leading-5">
          <span className="min-w-0 flex-1">
            <span className="font-bold text-[#062B43]">
              {quote.firstName} {quote.lastName}
            </span>
            <span className="text-[#52657A]"> · {quote.title}</span>
          </span>
          <span className="shrink-0 text-[11px] font-semibold tabular-nums text-[#AFC2D0]">{counter}</span>
        </figcaption>
      </div>
    </figure>
  );
}

function QuoteSlot({
  quotes,
  slotLabel,
  nudgeDelayMs,
}: {
  quotes: FeeQuote[];
  /** Accessible name for this carousel ("Top quote" / "Bottom quote"). */
  slotLabel: string;
  /** Stagger the two slots' one-time swipe hints so they read as two
   *  independent cards rather than one synchronized block. */
  nudgeDelayMs: number;
}) {
  const prefersReducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  /** +1 when this slot last advanced forward, -1 backward — drives the slide
   *  direction so the card always exits the way the visitor pushed it. */
  const [direction, setDirection] = useState(1);
  const [hasInteracted, setHasInteracted] = useState(false);
  const slotRef = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(slotRef, { once: true, amount: 0.6 });
  const nudge = useAnimationControls();

  const goTo = (step: 1 | -1) => {
    setHasInteracted(true);
    setDirection(step);
    setIndex((current) => (current + step + quotes.length) % quotes.length);
  };

  // One-time "you can swipe this" cue: the card leans left and settles back
  // the first time it scrolls into view, unless the visitor has already
  // swiped (or asked for reduced motion). This is the mobile affordance that
  // replaced the arrow buttons (David, 2026-08-13).
  useEffect(() => {
    if (!isInView || hasInteracted || prefersReducedMotion) return;
    const timeout = window.setTimeout(() => {
      void nudge.start({ x: [0, -14, 0], transition: { duration: 0.7, ease: "easeInOut" } });
    }, nudgeDelayMs);
    return () => window.clearTimeout(timeout);
  }, [isInView, hasInteracted, prefersReducedMotion, nudge, nudgeDelayMs]);

  const slideDistance = prefersReducedMotion ? 0 : 320;

  return (
    <div
      ref={slotRef}
      role="group"
      aria-roledescription="carousel"
      aria-label={slotLabel}
      className="relative overflow-hidden rounded-2xl"
    >
      {/* The next card's edge, peeking out from behind the active quote —
          the always-visible cue that there are more behind it. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-2 left-6 right-0 rounded-2xl border border-[#D8E2EA] bg-white/75"
      />
      <motion.div
        animate={nudge}
        drag={prefersReducedMotion ? false : "x"}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.55}
        onDragStart={() => setHasInteracted(true)}
        onDragEnd={(_event, info) => {
          if (info.offset.x < -70 || info.velocity.x < -400) {
            goTo(1);
          } else if (info.offset.x > 70 || info.velocity.x > 400) {
            goTo(-1);
          }
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") {
            event.preventDefault();
            goTo(1);
          } else if (event.key === "ArrowLeft") {
            event.preventDefault();
            goTo(-1);
          }
        }}
        tabIndex={0}
        aria-label={`${slotLabel}: swipe or drag it sideways, or use the left and right arrow keys, to see another.`}
        aria-live="polite"
        className="relative mr-2.5 cursor-grab active:cursor-grabbing focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#064B84] sm:mr-3"
      >
        <AnimatePresence initial={false} mode="popLayout" custom={direction}>
          <motion.div
            key={index}
            custom={direction}
            variants={{
              enter: (dir: number) => ({ x: dir * slideDistance, opacity: 0 }),
              center: { x: 0, opacity: 1 },
              exit: (dir: number) => ({ x: -dir * slideDistance, opacity: 0 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: prefersReducedMotion ? 0.15 : 0.34, ease: [0.32, 0.72, 0, 1] }}
          >
            <QuoteCard quote={quotes[index]} counter={`${index + 1} / ${quotes.length}`} />
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export function FeeQuoteDeck() {
  const [topQuotes, bottomQuotes] = useMemo(() => splitPoolAlternately(FEE_QUOTES), []);

  return (
    <section
      aria-label="What respected investors say about long-term costs"
      className="w-full bg-[#EEF0F5] px-4 pb-4 pt-16 sm:px-6 sm:pt-24"
    >
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#007A2F]">
          {homeCalculatorConfig.quoteTicker.label}
        </p>
        <h2 className="mt-2 text-balance text-xl font-bold tracking-tight text-[#062B43] sm:text-2xl">
          {homeCalculatorConfig.quoteTicker.subLabel}
        </h2>

        <div className="mt-6 space-y-3.5">
          <QuoteSlot quotes={topQuotes} slotLabel="Top quote" nudgeDelayMs={900} />
          <QuoteSlot quotes={bottomQuotes} slotLabel="Bottom quote" nudgeDelayMs={1450} />
        </div>

        <p className="mt-4 text-center text-xs font-semibold text-[#52657A]">
          <span className="sm:hidden">&lsaquo; Swipe either quote for more — each moves on its own &rsaquo;</span>
          <span className="hidden sm:inline">
            Drag either quote sideways for more — each moves on its own
          </span>
        </p>
      </div>
    </section>
  );
}
