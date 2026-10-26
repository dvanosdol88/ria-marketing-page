"use client";

import { type ReactNode, useCallback, useMemo, useRef, useState } from "react";
import type { HomeCalculatorTheme } from "@/config/homeMarketingVariants";

export interface PillSliderProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  format: (v: number) => string;
  variant: "destructive" | "accumulation";
  labelAction?: ReactNode;
  pillColorOverride?: string;
  theme: HomeCalculatorTheme["slider"];
  // Standard mode (min/max/step)
  min?: number;
  max?: number;
  step?: number;
  // Array mode - overrides min/max/step when provided
  values?: number[];
}

export function PillSlider({
  label,
  value,
  onChange,
  format,
  variant,
  labelAction,
  pillColorOverride,
  theme,
  min,
  max,
  step,
  values,
}: PillSliderProps) {
  const isArrayMode = !!values;

  // Array mode: find closest index for the current value
  const arrayIdx = useMemo(() => {
    if (!values) return 0;
    let best = 0;
    for (let i = 1; i < values.length; i++) {
      if (Math.abs(values[i] - value) < Math.abs(values[best] - value)) best = i;
    }
    return best;
  }, [value, values]);

  const lastRef = useRef(isArrayMode ? arrayIdx : value);
  const [isActive, setIsActive] = useState(false);

  // Native input props
  const inputMin = isArrayMode ? 0 : (min ?? 0);
  const inputMax = isArrayMode ? values!.length - 1 : (max ?? 100);
  const inputStep = isArrayMode ? 1 : (step ?? 1);
  const inputValue = isArrayMode ? arrayIdx : value;

  // Percentage for positioning
  const pct =
    inputMax > inputMin ? ((inputValue - inputMin) / (inputMax - inputMin)) * 100 : 0;

  // Displayed value (resolved from array if needed)
  const displayValue = isArrayMode ? values![arrayIdx] : value;

  const basePillColor = variant === "destructive" ? theme.destructiveColor : theme.accumulationColor;
  const pillColor = pillColorOverride ?? basePillColor;
  const trackColor = variant === "destructive" ? theme.destructiveTrack : theme.accumulationTrack;

  const precision = useMemo(() => {
    if (isArrayMode || !step) return 0;
    return step.toString().split(".")[1]?.length ?? 0;
  }, [isArrayMode, step]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = Number.parseFloat(e.target.value);
      if (Number.isNaN(raw)) return;

      if (isArrayMode) {
        const newIdx = Math.round(raw);
        const clamped = Math.min(values!.length - 1, Math.max(0, newIdx));
        if (clamped !== lastRef.current) {
          const newVal = values![clamped];
          lastRef.current = clamped;
          onChange(newVal);
        }
      } else {
        const s = step ?? 1;
        const snapped = Number((Math.round(raw / s) * s).toFixed(precision));
        const clamped = Math.min(max ?? 100, Math.max(min ?? 0, snapped));
        lastRef.current = clamped;
        onChange(clamped);
      }
    },
    [isArrayMode, values, min, max, step, precision, onChange]
  );

  return (
    <div>
      <div className="mb-0 flex items-center justify-between gap-3">
        <p className={`text-[13px] font-semibold uppercase tracking-wider ${theme.labelClassName}`}>
          {label}
        </p>
        {labelAction}
      </div>
      <div className="relative flex h-12 items-center">
        {/* Track background */}
        <div className={`absolute inset-x-0 h-1 rounded-full ${theme.trackClassName}`} />
        {/* Track fill */}
        <div
          className="absolute left-0 h-1 rounded-full transition-[width] duration-75"
          style={{ width: `${pct}%`, backgroundColor: trackColor }}
        />
        {/* Native range input - 48px hit zone (exceeds 44px HIG min). */}
        <input
          type="range"
          min={inputMin}
          max={inputMax}
          step={inputStep}
          value={inputValue}
          onChange={handleChange}
          onPointerDown={(e) => {
            if (e.pointerType === "touch") setIsActive(true);
          }}
          onPointerUp={() => setIsActive(false)}
          onPointerCancel={() => setIsActive(false)}
          onPointerLeave={() => setIsActive(false)}
          className="pill-slider-input absolute inset-x-0 z-20 h-12 w-full cursor-grab opacity-0 active:cursor-grabbing"
          aria-label={label}
        />
        {/* Visual pill thumb - translucent blue halo on touch only; no scaling. */}
        <div
          className="pointer-events-none absolute z-10 flex h-9 items-center justify-center rounded-full px-3.5 transition-[box-shadow] duration-150"
          style={{
            left: `${pct}%`,
            transform: `translateX(-${pct}%)`,
            backgroundColor: pillColor,
            boxShadow: isActive
              ? "0 0 0 8px rgba(59,130,246,0.22), 0 0 0 14px rgba(59,130,246,0.10), 0 2px 12px rgba(0,0,0,0.2)"
              : "0 2px 12px rgba(0,0,0,0.2)",
          }}
        >
          <span className="text-sm font-bold tabular-nums text-white whitespace-nowrap">
            {format(displayValue)}
          </span>
        </div>
      </div>
    </div>
  );
}
