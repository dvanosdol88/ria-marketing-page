"use client";

/**
 * FlexibleSchedule — animated calendar showing rotating extended hours.
 *
 * Schedule data lives in src/config/scheduleConfig.ts — update hours,
 * rotation pattern, or animation speed there without touching this file.
 *
 * Layout: 6-column grid (Mon–Sat, no Sunday).
 * Animation: staggered green pulse across the "late" and "saturday" cells.
 */

import {
  SCHEDULE_DAYS,
  SCHEDULE_WEEKS,
  ANIMATION_CYCLE_S,
  ANIMATION_STAGGER_S,
} from "@/config/scheduleConfig";

export function FlexibleSchedule() {
  return (
    <>
      {/* Scoped animation keyframes */}
      <style>{`
        @keyframes fs-pulse-late {
          0%, 100% {
            background-color: var(--fs-cell-bg);
            transform: scale(1);
            box-shadow: none;
            z-index: 1;
          }
          50% {
            background-color: var(--fs-green-medium);
            transform: scale(1.05);
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(102, 217, 128, 0.25);
            z-index: 10;
          }
        }
        @keyframes fs-pulse-sat {
          0%, 100% {
            background-color: var(--fs-cell-bg);
            transform: scale(1);
            box-shadow: none;
            z-index: 1;
          }
          50% {
            background-color: var(--fs-green-dark);
            transform: scale(1.05);
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(51, 191, 96, 0.25);
            z-index: 10;
          }
        }
        /* Disable scale on mobile to prevent grid overflow */
        @media (max-width: 480px) {
          @keyframes fs-pulse-late {
            0%, 100% {
              background-color: var(--fs-cell-bg);
              transform: scale(1);
              box-shadow: none;
              z-index: 1;
            }
            50% {
              background-color: var(--fs-green-medium);
              transform: scale(1);
              box-shadow: 0 0 8px rgba(102, 217, 128, 0.2);
              z-index: 10;
            }
          }
          @keyframes fs-pulse-sat {
            0%, 100% {
              background-color: var(--fs-cell-bg);
              transform: scale(1);
              box-shadow: none;
              z-index: 1;
            }
            50% {
              background-color: var(--fs-green-dark);
              transform: scale(1);
              box-shadow: 0 0 8px rgba(51, 191, 96, 0.2);
              z-index: 10;
            }
          }
        }
      `}</style>

      <div
        className="w-full max-w-[600px] mx-auto rounded-xl p-4 max-[480px]:p-2 box-border"
        style={{
          "--fs-cell-bg": "#333333",
          "--fs-green-light": "#3DA85C",
          "--fs-green-medium": "#1E8F42",
          "--fs-green-dark": "#007A2F",
          backgroundColor: "#2A2A2A",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        } as React.CSSProperties}
      >
        <div
          className="grid grid-cols-6 gap-[2px] rounded-lg overflow-hidden"
          style={{ backgroundColor: "#404040", border: "1px solid #404040" }}
        >
          {/* Day headers */}
          {SCHEDULE_DAYS.map((day) => (
            <div
              key={day}
              className="text-center font-semibold py-3 px-1 text-[0.8rem] max-[480px]:text-[0.7rem] max-[480px]:py-2 tracking-wide"
              style={{ backgroundColor: "#222222", color: "#3DA85C" }}
            >
              {day}
            </div>
          ))}

          {/* Week rows */}
          {SCHEDULE_WEEKS.map((week, wi) =>
            week.map((cell, di) => {
              const isAnimated = cell.variant === "late" || cell.variant === "saturday";
              const animName = cell.variant === "saturday" ? "fs-pulse-sat" : "fs-pulse-late";
              const delaySeconds = cell.delay ? (cell.delay - 1) * ANIMATION_STAGGER_S : 0;

              return (
                <div
                  key={`${wi}-${di}`}
                  className={`
                    flex flex-col items-center justify-center text-center
                    text-[0.75rem] max-[480px]:text-[0.65rem]
                    py-2 px-1 max-[480px]:py-1.5 max-[480px]:px-0.5
                    min-h-[65px] max-[480px]:min-h-[55px]
                    transition-all duration-300 relative
                  `}
                  style={{
                    backgroundColor: cell.variant === "closed" ? "#2E2E2E" : "#333333",
                    color: cell.variant === "closed" ? "#888888" : "#F5F5F5",
                    ...(isAnimated
                      ? {
                          animation: `${animName} ${ANIMATION_CYCLE_S}s infinite`,
                          animationDelay: `${delaySeconds}s`,
                          zIndex: 1,
                        }
                      : {}),
                  }}
                >
                  {cell.label && (
                    <span className="font-bold mb-0.5" style={{ color: "#F5F5F5" }}>
                      {cell.label}
                    </span>
                  )}
                  {cell.hours && <span>{cell.hours}</span>}
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
