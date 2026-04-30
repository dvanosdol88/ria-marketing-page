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
