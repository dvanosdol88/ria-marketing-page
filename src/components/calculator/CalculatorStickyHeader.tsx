"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { formatCurrency, formatCurrencyFloored } from "@/lib/format";

const DISMISSAL_STORAGE_KEY = "sww_calculator_sticky_header_dismissed_v1";

type CalculatorStickyHeaderProps = {
  savings: number;
  years: number;
  annualFeePercent: number;
  isBlendedFee?: boolean;
  monthlyFlatFee: number;
};

export function CalculatorStickyHeader({
  savings,
  years,
  annualFeePercent,
  isBlendedFee = false,
  monthlyFlatFee,
}: CalculatorStickyHeaderProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = window.localStorage.getItem(DISMISSAL_STORAGE_KEY) === "1";
    } catch {
      // Restricted storage should not hide the reminder.
    }
    const frame = window.requestAnimationFrame(() => setVisible(!dismissed));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const dismiss = () => {
    try {
      window.localStorage.setItem(DISMISSAL_STORAGE_KEY, "1");
    } catch {
      // Storage can be unavailable in private or restricted browser contexts.
      // Dismissal should still work for the current page.
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      aria-label="Calculator savings reminder"
      className="sticky top-[var(--site-nav-height)] z-40 border-y border-[#C9D8E4] bg-white/95 shadow-[0_12px_34px_rgba(17,33,52,0.1)] backdrop-blur"
    >
      <div className="relative mx-auto flex min-h-14 max-w-7xl items-center justify-center px-14 sm:px-16 lg:px-[23rem]">
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss potential savings header"
          className="absolute left-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-md bg-[#007A2F] text-white shadow-sm transition hover:bg-[#00682B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#007A2F] sm:left-6"
        >
          <X className="h-6 w-6" strokeWidth={2.4} aria-hidden="true" />
        </button>
        <div
          aria-atomic="true"
          aria-live="polite"
          className="text-center text-[#062B43]"
        >
          <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] sm:text-xs">
            Potential savings
          </p>
          <p className="mt-0.5 text-xl font-bold leading-none tabular-nums text-[#007A2F] sm:text-2xl">
            {formatCurrencyFloored(savings)}
          </p>
        </div>
        <div className="absolute right-3 hidden min-w-0 flex-wrap items-center justify-end gap-1.5 text-[11px] text-[#41556C] sm:right-6 lg:flex lg:gap-2 lg:text-xs">
          <span className="rounded-full border border-[#D5E0EA] bg-[#F7FAFC] px-3 py-1">
            {years} years
          </span>
          <span className="rounded-full border border-[#D5E0EA] bg-[#F7FAFC] px-3 py-1">
            {isBlendedFee
              ? `${annualFeePercent.toFixed(3)}% blended advisory fee`
              : `${annualFeePercent.toFixed(2)}% asset-based fee`}
          </span>
          {/* Names the comparison the two chips are making, so the row reads as
              one sentence instead of three unrelated facts. */}
          <span className="px-0.5 font-bold text-[#41556C]">vs.</span>
          <span className="rounded-full border border-[#BFE3CC] bg-[#F2FBF5] px-3 py-1 text-[#007A2F]">
            {formatCurrency(monthlyFlatFee)}/mo flat fee
          </span>
        </div>
      </div>
    </div>
  );
}
