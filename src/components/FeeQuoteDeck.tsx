"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useAnimationControls, useInView, useReducedMotion } from "framer-motion";
import { ChevronRight } from "lucide-react";
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

/**
 * Attribution sits in its own left-hand column beneath the portrait rather
 * than under the quote (David, 2026-08-14).
 *
 * DECISION, 2026-09-23 (David: the portrait, name and title "are not evenly
 * balanced vertically — see the Charlie Munger / Berkshire Hathaway example"):
 * the attribution column is now centred top-to-bottom in the card, with equal
 * padding above and below, and the quote is centred in its own column. The
 * card's height no longer comes from a fixed number: each slot sizes itself to
 * the tallest card in the whole pool (see QuoteSlot's sizer), so a two- or
 * three-line title can never be clipped at the card's bottom edge again, and
 * swiping between quotes still never changes the card's height.
 */
function QuoteCard({
  quote,
  counter,
  measureOnly = false,
}: {
  quote: FeeQuote;
  counter: string;
  /** Sizer copy: same geometry, no image request. */
  measureOnly?: boolean;
}) {
  const portraitSrc = FEE_QUOTE_PORTRAITS[quote.lastName];
  const portraitOffset = FEE_QUOTE_PORTRAIT_OFFSET[quote.lastName];
  const portraitClass = "h-20 w-20 rounded-full sm:h-[88px] sm:w-[88px]";

  return (
    <figure className="relative flex h-full items-center gap-4 rounded-2xl border border-[#D8E2EA] bg-white px-3 py-3 shadow-[0_10px_30px_rgba(17,33,52,0.07)] sm:gap-6 sm:px-4">
      <div className="flex w-[96px] shrink-0 flex-col sm:w-[128px]">
        {portraitSrc && !measureOnly ? (
          <Image
            src={portraitSrc}
            alt=""
            width={192}
            height={192}
            className={`${portraitClass} border border-[#E4ECF2] bg-[#F4F7FA] object-cover`}
            style={portraitOffset ? { objectPosition: `50% ${portraitOffset}%` } : undefined}
            draggable={false}
          />
        ) : (
          <span aria-hidden="true" className={`${portraitClass} block bg-[#EAF1F8]`} />
        )}
        <figcaption className="mt-2.5">
          <span className="block text-[13px] font-bold leading-4 text-[#062B43] sm:text-sm">
            {quote.firstName} {quote.lastName}
          </span>
          <span className="mt-1 block text-[11px] leading-4 text-[#52657A]">{quote.title}</span>
        </figcaption>
      </div>

      <div className="flex h-full min-w-0 flex-1 flex-col">
        <div className="flex flex-1 items-center justify-center">
          <blockquote className="text-center text-[15px] font-medium leading-6 text-[#10233A] sm:text-base sm:leading-7">
            {/* Marks at the text's own size, weight and color (David, 2026-09-23;
                color 2026-09-24) — bolder or green, they read louder than the
                words they hold. */}
            <span aria-hidden="true" className="mr-0.5">
              &ldquo;
            </span>
            {quote.quote}
            <span aria-hidden="true" className="ml-0.5">
              &rdquo;
            </span>
          </blockquote>
        </div>
        <p className="mt-2 whitespace-nowrap text-center text-[11px] leading-4 text-[#52657A]">
          Not an endorsement.
        </p>
      </div>

      <span
        aria-hidden="true"
        className="absolute right-3 bottom-2 text-[11px] font-semibold tabular-nums text-[#C2CFDA]"
      >
        {counter}
      </span>
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
  /* Dragging with a mouse is genuinely awkward — David, 2026-08-14: "It's a
     little bit difficult to rotate them on desktop. You have to swipe with
     your mouse, which isn't easy, but I like the simplicity of no more clutter
     or buttons." So the whole card is now clickable and advances one quote,
     which costs no chrome at all. This ref keeps the click from firing at the
     end of a real drag: onDragStart only runs once a drag passes framer's
     threshold, so a plain click never sets it, and the browser's click event
     lands well inside the 50ms it stays true. */
  const draggedRef = useRef(false);
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
  const slideTransition = prefersReducedMotion
    ? { duration: 0.15 }
    : { type: "spring" as const, stiffness: 340, damping: 34, mass: 0.9 };

  return (
    <motion.div
      ref={slotRef}
      role="group"
      aria-roledescription="carousel"
      aria-label={slotLabel}
      className="group relative grid overflow-hidden rounded-2xl"
    >
      {/* Sizer: every quote in the pool, stacked invisibly in the same grid
          cell, so the slot is exactly as tall as its tallest card at the
          current width. The live card below fills that same cell. */}
      <div aria-hidden="true" className="pointer-events-none invisible col-start-1 row-start-1 mr-2.5 grid sm:mr-3">
        {FEE_QUOTES.map((sizerQuote, sizerIndex) => (
          <div key={`sizer-${sizerIndex}`} className="col-start-1 row-start-1">
            <QuoteCard quote={sizerQuote} counter="00 / 00" measureOnly />
          </div>
        ))}
      </div>

      {/* The next card's edge, peeking out from behind the active quote —
          the always-visible cue that there are more behind it. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-2 left-6 right-0 rounded-2xl border border-[#D8E2EA] bg-white/75"
      />

      {/* The standing hint line under the deck is gone (David struck it out),
          so this is what carries discoverability on a mouse: nothing at rest,
          a soft chevron on hover. Pointer-devices only — a touch device gets
          no hover state, and swiping a card is already the obvious gesture
          there. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 z-10 hidden -translate-y-1/2 text-[#AFC2D0] opacity-0 transition-opacity duration-200 group-hover:opacity-100 sm:block"
      >
        <ChevronRight className="h-6 w-6" strokeWidth={2.5} />
      </span>
      <motion.div
        animate={nudge}
        drag={prefersReducedMotion ? false : "x"}
        dragDirectionLock
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.24}
        dragMomentum={false}
        onDragStart={() => {
          draggedRef.current = true;
          setHasInteracted(true);
        }}
        onDragEnd={(_event, info) => {
          if (info.offset.x < -70 || info.velocity.x < -400) {
            goTo(1);
          } else if (info.offset.x > 70 || info.velocity.x > 400) {
            goTo(-1);
          }
          window.setTimeout(() => {
            draggedRef.current = false;
          }, 50);
        }}
        onClick={() => {
          if (draggedRef.current) return;
          goTo(1);
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
        aria-label={`${slotLabel}: click it, swipe it sideways, or use the left and right arrow keys to see another.`}
        aria-live="polite"
        className="group/card relative col-start-1 row-start-1 mr-2.5 h-full cursor-pointer focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#064B84] active:cursor-grabbing sm:mr-3"
        style={{ touchAction: "pan-y" }}
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
            transition={slideTransition}
            className="h-full"
          >
            <QuoteCard quote={quotes[index]} counter={`${index + 1} / ${quotes.length}`} />
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

export function FeeQuoteDeck() {
  const [topQuotes, bottomQuotes] = useMemo(() => splitPoolAlternately(FEE_QUOTES), []);

  return (
    <section
      aria-label="What respected investors say about long-term costs"
      className="w-full bg-transparent px-4 pb-4 pt-[38px] sm:px-6 sm:pb-4 sm:pt-[54px]"
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

        {/* The standing hint line that sat here was struck out by David
            (2026-08-14). Discoverability moved into the cards themselves: a
            hover chevron on a mouse, and swiping on touch, where it is the
            obvious gesture anyway. */}
      </div>
    </section>
  );
}
