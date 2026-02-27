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

function DigitColumn({ digit }: { digit: number }) {
  return (
    <span className="relative inline-block h-[1em] w-[0.62em] overflow-hidden align-baseline" aria-hidden="true">
      <span
        className="flex flex-col transition-transform duration-150 [transition-timing-function:cubic-bezier(0.25,1,0.5,1)]"
        style={{ transform: `translateY(-${digit * 10}%)` }}
      >
        {Array.from({ length: 10 }, (_, value) => (
          <span key={value} className="flex h-[1em] items-center justify-center">
            {value}
          </span>
        ))}
      </span>
    </span>
  );
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
  const chars = formattedDisplay.split("");

  return (
    <span className={`inline-flex items-baseline tabular-nums ${className}`} aria-label={`${prefix}${formattedFinal}`}>
      {prefix ? <span aria-hidden="true">{prefix}</span> : null}
      {chars.map((char, index) => {
        if (!/\d/.test(char)) {
          return (
            <span key={`sep-${index}`} className="inline-block" aria-hidden="true">
              {char}
            </span>
          );
        }

        return <DigitColumn key={`digit-${index}-${char}-${chars.length}`} digit={Number.parseInt(char, 10)} />;
      })}
    </span>
  );
}
