"use client";

import { useEffect, useRef, useState } from "react";
import { FlexibleSchedule } from "@/components/FlexibleSchedule";

/**
 * ScheduleSection — scroll-triggered reveal of the FlexibleSchedule calendar.
 *
 * When the section scrolls into view:
 * 1. The calendar fades up with a slight scale entrance
 * 2. A speech-bubble tooltip types out a short message character by character
 * 3. Both effects fire once per page visit (no repeat on re-scroll)
 */

const TOOLTIP_TEXT =
  "We meet when it works for you — rotating evenings until 7, and one Saturday a month.";

export function ScheduleSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [hasRevealed, setHasRevealed] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [typingDone, setTypingDone] = useState(false);

  /* Observe scroll into view — fire once */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /* Type out the tooltip text after reveal */
  useEffect(() => {
    if (!hasRevealed) return;

    // Short pause before typing starts
    const startDelay = setTimeout(() => {
      let i = 0;
      const interval = setInterval(() => {
        i++;
        setTypedText(TOOLTIP_TEXT.slice(0, i));
        if (i >= TOOLTIP_TEXT.length) {
          clearInterval(interval);
          setTypingDone(true);
        }
      }, 28);

      return () => clearInterval(interval);
    }, 400);

    return () => clearTimeout(startDelay);
  }, [hasRevealed]);

  return (
    <section ref={sectionRef} className="section-shell">
      <div className="flex flex-col items-center gap-5">
        {/* Section heading */}
        <h3
          className={`text-xl font-semibold text-neutral-900 text-center transition-all duration-700 ${
            hasRevealed
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4"
          }`}
        >
          We meet on your schedule
        </h3>

        {/* Speech bubble tooltip */}
        <div
          className={`relative max-w-md w-full transition-all duration-500 ${
            hasRevealed
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-3"
          }`}
          style={{ transitionDelay: hasRevealed ? "200ms" : "0ms" }}
        >
          <div className="bg-white rounded-xl shadow-md border border-neutral-200 px-5 py-3 text-sm text-neutral-700 min-h-[3.5rem] flex items-center">
            <span>
              {typedText}
              {/* Blinking cursor while typing */}
              {hasRevealed && !typingDone && (
                <span className="inline-block w-[2px] h-[1em] bg-brand-600 ml-0.5 align-text-bottom animate-pulse" />
              )}
            </span>
          </div>
          {/* Caret pointing down to calendar */}
          <div className="flex justify-center">
            <div
              className="w-3 h-3 bg-white border-r border-b border-neutral-200 -mt-[7px]"
              style={{ transform: "rotate(45deg)" }}
            />
          </div>
        </div>

        {/* Calendar with entrance animation */}
        <div
          className={`w-full transition-all duration-700 ease-out ${
            hasRevealed
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 translate-y-6 scale-[0.97]"
          }`}
          style={{ transitionDelay: hasRevealed ? "500ms" : "0ms" }}
        >
          <FlexibleSchedule />
        </div>
      </div>
    </section>
  );
}
