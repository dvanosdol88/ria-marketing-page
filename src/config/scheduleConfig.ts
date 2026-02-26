/**
 * scheduleConfig.ts — Rotating extended-hours schedule data
 * =========================================================
 *
 * HOW THIS WORKS:
 * Smarter Way Wealth offers one late-night evening per week (9am–7pm)
 * that rotates across Mon→Tue→Wed→Thu over a 4-week cycle. On the
 * second Saturday of the month (Week 2), the office is also open
 * (10am–4pm). Fridays close early at 4pm. Sunday is always closed.
 *
 * WHERE IT'S USED:
 * - <FlexibleSchedule /> component (src/components/FlexibleSchedule.tsx)
 * - Preview route: /components/calendar
 *
 * HOW TO UPDATE:
 * 1. To change standard hours → update DEFAULT_HOURS below
 * 2. To change Friday hours → update FRIDAY_HOURS
 * 3. To change extended hours → update EXTENDED_HOURS
 * 4. To change which day gets extended hours → edit the `weeks` array
 * 5. To move Saturday availability → move the "saturday" cell to a different week
 * 6. To change animation speed → adjust ANIMATION_CYCLE_S and ANIMATION_STAGGER_S
 *
 * ANIMATION NOTES:
 * Each "late" or "saturday" cell pulses green on a staggered loop.
 * The `delay` field (1-5) sets the stagger order. The total cycle and
 * per-cell stagger are controlled by the animation constants below.
 * Cells pulse sequentially: Week1 → Week2 → Week2 Sat → Week3 → Week4 → repeat.
 */

// ── Types ──────────────────────────────────────────────────────────

export type DayCellVariant = "normal" | "closed" | "late" | "saturday";

export type DayCell = {
  /** Optional bold label shown above hours (e.g. "Week 1", "2nd Sat") */
  label?: string;
  /** Display hours (e.g. "9am–6pm"). Omit for blank cells. */
  hours?: string;
  /** Cell style variant — controls color and animation eligibility */
  variant: DayCellVariant;
  /** Animation stagger index (1-based). Only used for "late" and "saturday" variants. */
  delay?: number;
};

// ── Constants ──────────────────────────────────────────────────────

/** Standard weekday hours (Mon–Thu) */
const DEFAULT_HOURS = "9am–6pm";

/** Friday hours (early close) */
const FRIDAY_HOURS = "9am–4pm";

/** Extended evening hours (rotates weekly, Mon–Thu) */
const EXTENDED_HOURS = "9am–7pm";

/** Second Saturday hours */
const SATURDAY_HOURS = "10am–4pm";

/** Total animation cycle duration in seconds */
export const ANIMATION_CYCLE_S = 8;

/** Delay between each cell's pulse start, in seconds */
export const ANIMATION_STAGGER_S = 1.5;

// ── Helpers ────────────────────────────────────────────────────────

const normal = (): DayCell => ({ hours: DEFAULT_HOURS, variant: "normal" });
const friday = (): DayCell => ({ hours: FRIDAY_HOURS, variant: "normal" });
const closed = (): DayCell => ({ variant: "closed" });

// ── Schedule Data ──────────────────────────────────────────────────

/** Column headers — Mon through Sat (Sunday excluded) */
export const SCHEDULE_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

/**
 * 4-week rotating schedule grid.
 * Each inner array has 6 cells matching SCHEDULE_DAYS (Mon–Sat).
 * The "late" variant cell shifts one column right each week.
 * Second Saturday (Week 2) is open.
 */
export const SCHEDULE_WEEKS: DayCell[][] = [
  // Week 1 — Monday extended
  [
    { label: "Week 1", hours: EXTENDED_HOURS, variant: "late", delay: 1 },
    normal(),
    normal(),
    normal(),
    friday(),
    closed(),
  ],
  // Week 2 — Tuesday extended + Second Saturday open
  [
    normal(),
    { label: "Week 2", hours: EXTENDED_HOURS, variant: "late", delay: 2 },
    normal(),
    normal(),
    friday(),
    { label: "2nd Sat", hours: SATURDAY_HOURS, variant: "saturday", delay: 3 },
  ],
  // Week 3 — Wednesday extended
  [
    normal(),
    normal(),
    { label: "Week 3", hours: EXTENDED_HOURS, variant: "late", delay: 4 },
    normal(),
    friday(),
    closed(),
  ],
  // Week 4 — Thursday extended
  [
    normal(),
    normal(),
    normal(),
    { label: "Week 4", hours: EXTENDED_HOURS, variant: "late", delay: 5 },
    friday(),
    closed(),
  ],
];
