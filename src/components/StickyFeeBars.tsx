"use client";

import { NoteMarker } from "@/components/CalculatorNotes";
import { Odometer } from "@/components/Odometer";
import { homeCalculatorConfig } from "@/config/homeCalculatorConfig";
import { formatCurrency } from "@/lib/format";

export function StickyFeeBars({
  isDarkMode,
  monthlyFlatFee,
  savings,
  showDesktopBar,
  smarterValue,
  traditionalValue,
}: {
  isDarkMode: boolean;
  monthlyFlatFee: number;
  savings: number;
  showDesktopBar: boolean;
  smarterValue: number;
  traditionalValue: number;
}) {
  return (
    <>
      {/* Mobile Sticky Fee Bar */}
      <div
        className={`fixed left-0 right-0 top-[58px] z-40 bg-white/95 backdrop-blur-sm transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] transform-gpu dark:bg-slate-900/90 md:hidden ${
          showDesktopBar ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-full opacity-0"
        }`}
      >
        <div className="flex h-12 items-center justify-center px-4">
          <div
            className="flex items-center gap-2 rounded-full px-4 py-1.5 shadow-sm"
            style={{
              backgroundColor: isDarkMode
                ? homeCalculatorConfig.cards.lostToFeesDarkBg
                : homeCalculatorConfig.cards.lostToFeesBg,
              color: homeCalculatorConfig.cards.lostToFeesText
            }}
          >
            <Odometer value={Math.floor(savings / 1000) * 1000} prefix="$" duration={1000} className="text-lg font-bold" />
            <NoteMarker />
            <span className="text-xs font-bold uppercase tracking-wider">
              lost to asset-based fees!
            </span>
          </div>
        </div>
      </div>

      {/* Desktop Sticky Fee Bar */}
      <div
        className={`fixed left-0 right-0 top-[52px] z-40 hidden bg-white/95 backdrop-blur-sm transition-all duration-800 ease-[cubic-bezier(0.22,1,0.36,1)] transform-gpu md:block ${
          showDesktopBar ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-full opacity-0"
        }`}
      >
        <div className="mx-auto flex h-11 max-w-5xl items-center justify-center gap-6 px-4 text-sm font-medium">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 dark:text-slate-400">SMARTER Way ({formatCurrency(monthlyFlatFee)}/mo):</span>
            <Odometer
              value={Math.floor(smarterValue / 1000) * 1000}
              prefix="$"
              duration={800}
              className="font-bold text-[#00A540]"
            />
          </div>

          <div
            className="flex items-center gap-2 rounded-lg px-3 py-1 shadow-sm"
            style={{
              backgroundColor: isDarkMode
                ? homeCalculatorConfig.cards.lostToFeesDarkBg
                : homeCalculatorConfig.cards.lostToFeesBg,
              color: homeCalculatorConfig.cards.lostToFeesText
            }}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Lost to Fees:</span>
            <Odometer
              value={Math.floor(savings / 1000) * 1000}
              prefix="-$"
              duration={800}
              className="font-bold"
            />
            <NoteMarker />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-500 dark:text-slate-400">AUM Advisor:</span>
            <Odometer
              value={Math.floor(traditionalValue / 1000) * 1000}
              prefix="$"
              duration={800}
              className="font-bold text-gray-900 dark:text-slate-100"
            />
          </div>
        </div>
      </div>
    </>
  );
}
