"use client";

import { useEffect, useRef, useState } from "react";

function formatWithCommas(value: number): string {
  return Math.round(value).toLocaleString("en-US");
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function useAnimatedValue(target: number, duration: number) {
  const roundedTarget = Math.round(target);
  const [display, setDisplay] = useState(roundedTarget);

  const rafRef = useRef<number | null>(null);
  const displayRef = useRef(display);

  useEffect(() => {
    displayRef.current = display;
  }, [display]);

  useEffect(() => {
    const startValue = displayRef.current;
    const endValue = roundedTarget;

    if (startValue === endValue || duration <= 0) {
      setDisplay(endValue);
      return;
    }

    const startTime = performance.now();
    const delta = endValue - startValue;

    const step = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = easeOutCubic(progress);
      const current = Math.round(startValue + delta * eased);
      setDisplay(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setDisplay(endValue);
        rafRef.current = null;
      }
    };

    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }
    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [roundedTarget, duration]);

  return display;
}

export interface OdometerProps {
  value: number;
  prefix?: string;
  className?: string;
  duration?: number;
}

export function Odometer({ value, prefix = "$", className = "", duration = 1400 }: OdometerProps) {
  const animatedValue = useAnimatedValue(value, duration);
  const formattedDisplay = formatWithCommas(animatedValue);
  const formattedFinal = formatWithCommas(value);

  return (
    <span
      className={`inline-block tabular-nums transition-transform duration-150 [transition-timing-function:cubic-bezier(0.25,1,0.5,1)] ${className}`}
      aria-label={`${prefix}${formattedFinal}`}
    >
      {prefix}
      {formattedDisplay}
    </span>
  );
}

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);

    handleChange();
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return prefersReducedMotion;
}

export interface RollingCurrencyOdometerProps {
  value: number;
  className?: string;
  debounceMs?: number;
  duration?: number;
  formatter?: (value: number) => string;
}

export function RollingCurrencyOdometer({
  value,
  className = "",
  debounceMs = 180,
  duration = 650,
  formatter = (currentValue) => `$${formatWithCommas(currentValue)}`,
}: RollingCurrencyOdometerProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [displayValue, setDisplayValue] = useState(value);
  const displayText = formatter(displayValue);
  const finalText = formatter(value);

  useEffect(() => {
    if (prefersReducedMotion || debounceMs <= 0) {
      setDisplayValue(value);
      return;
    }

    const timeoutId = window.setTimeout(() => setDisplayValue(value), debounceMs);
    return () => window.clearTimeout(timeoutId);
  }, [debounceMs, prefersReducedMotion, value]);

  return (
    <span className={className}>
      <span className="sr-only">{finalText}</span>
      <span aria-hidden="true" className="inline-flex items-baseline justify-center whitespace-nowrap tabular-nums">
        {Array.from(displayText).map((char, index) => {
          const digit = Number.parseInt(char, 10);
          if (Number.isNaN(digit)) {
            return (
              <span className="inline-block leading-none" key={`${index}-${char}`}>
                {char}
              </span>
            );
          }

          return (
            <span
              className="relative inline-block h-[1em] w-[0.62em] overflow-hidden leading-none"
              key={index}
            >
              <span
                className="absolute left-0 top-0 flex flex-col transition-transform ease-out motion-reduce:transition-none"
                style={{
                  transform: `translateY(-${digit}em)`,
                  transitionDuration: prefersReducedMotion ? "0ms" : `${duration}ms`,
                }}
              >
                {"0123456789".split("").map((rollingDigit) => (
                  <span className="block h-[1em] leading-none" key={rollingDigit}>
                    {rollingDigit}
                  </span>
                ))}
              </span>
            </span>
          );
        })}
      </span>
    </span>
  );
}
