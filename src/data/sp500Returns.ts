/**
/**
 * S&P 500 calendar-year TOTAL returns (price change + dividends reinvested),
 * nominal — NOT inflation-adjusted — for the 40 calendar years 1986–2025.
 *
 * Provenance: figures are the S&P 500 Total Return Index (`SP500TR`,
 * S&P Dow Jones Indices) measured December close to December close.
 * 1989–2025 were reconstructed directly from index levels and agree with
 * Slickcharts to within 0.01 percentage points on every year. 1988 and
 * earlier predate the published SP500TR series, so 1986–1988 come from
 * Slickcharts, corroborated against Ibbotson SBBI large-company-stock
 * returns and a price-return cross-check.
 *
 * Note on 2025: some sources quote 17.44%. That figure is measured from the
 * January 2 OPEN rather than the prior-year close. On the close-to-close
 * basis used by every other row here, 2025 is 17.88%. Mixing the two would
 * make one row methodologically inconsistent with the other thirty-nine.
 *
 * IMPORTANT — this is index data, not investable return. It carries no fund
 * expense, advisory fee, trading cost, or tax drag. Any surface that renders
 * these numbers must display SP500_DISCLOSURE adjacent to the result.
 *
 * Maintenance: append the new year each January once the calendar year
 * closes, and bump SP500_DATA_LAST_YEAR. The 40-year window is a rolling
 * one — adding 2026 makes 1986 fall off the back of a 40-year selection.
 */

export type Sp500Year = {
  year: number;
  /** Calendar-year total return, in percent (e.g. -37 means -37.00%). */
  totalReturnPercent: number;
};

export const SP500_ANNUAL_TOTAL_RETURNS: readonly Sp500Year[] = [
  { year: 1986, totalReturnPercent: 18.67 },
  { year: 1987, totalReturnPercent: 5.25 },
  { year: 1988, totalReturnPercent: 16.61 },
  { year: 1989, totalReturnPercent: 31.69 },
  { year: 1990, totalReturnPercent: -3.1 },
  { year: 1991, totalReturnPercent: 30.47 },
  { year: 1992, totalReturnPercent: 7.62 },
  { year: 1993, totalReturnPercent: 10.08 },
  { year: 1994, totalReturnPercent: 1.32 },
  { year: 1995, totalReturnPercent: 37.58 },
  { year: 1996, totalReturnPercent: 22.96 },
  { year: 1997, totalReturnPercent: 33.36 },
  { year: 1998, totalReturnPercent: 28.58 },
  { year: 1999, totalReturnPercent: 21.04 },
  { year: 2000, totalReturnPercent: -9.1 },
  { year: 2001, totalReturnPercent: -11.89 },
  { year: 2002, totalReturnPercent: -22.1 },
  { year: 2003, totalReturnPercent: 28.68 },
  { year: 2004, totalReturnPercent: 10.88 },
  { year: 2005, totalReturnPercent: 4.91 },
  { year: 2006, totalReturnPercent: 15.79 },
  { year: 2007, totalReturnPercent: 5.49 },
  { year: 2008, totalReturnPercent: -37.0 },
  { year: 2009, totalReturnPercent: 26.46 },
  { year: 2010, totalReturnPercent: 15.06 },
  { year: 2011, totalReturnPercent: 2.11 },
  { year: 2012, totalReturnPercent: 16.0 },
  { year: 2013, totalReturnPercent: 32.39 },
  { year: 2014, totalReturnPercent: 13.69 },
  { year: 2015, totalReturnPercent: 1.38 },
  { year: 2016, totalReturnPercent: 11.96 },
  { year: 2017, totalReturnPercent: 21.83 },
  { year: 2018, totalReturnPercent: -4.38 },
  { year: 2019, totalReturnPercent: 31.49 },
  { year: 2020, totalReturnPercent: 18.4 },
  { year: 2021, totalReturnPercent: 28.71 },
  { year: 2022, totalReturnPercent: -18.11 },
  { year: 2023, totalReturnPercent: 26.29 },
  { year: 2024, totalReturnPercent: 25.02 },
  { year: 2025, totalReturnPercent: 17.88 },
] as const;

export const SP500_DATA_FIRST_YEAR = SP500_ANNUAL_TOTAL_RETURNS[0].year;
export const SP500_DATA_LAST_YEAR =
  SP500_ANNUAL_TOTAL_RETURNS[SP500_ANNUAL_TOTAL_RETURNS.length - 1].year;
export const SP500_MAX_YEARS = SP500_ANNUAL_TOTAL_RETURNS.length;

/** One-line attribution for footnotes and chart captions. */
export const SP500_SOURCE_LABEL =
  `S&P 500 Total Return Index, calendar years ${SP500_DATA_FIRST_YEAR}–${SP500_DATA_LAST_YEAR}, ` +
  "dividends reinvested, nominal (not inflation-adjusted). Source: S&P Dow Jones Indices.";

/**
 * Full regulatory disclosure. Must appear on any page that renders a
 * projection built from this data.
 */
export const SP500_DISCLOSURE =
  "Historical mode replays actual S&P 500 calendar-year total returns in the order they occurred. " +
  "Past performance does not guarantee or indicate future results, and no projection here is a " +
  "forecast. Index returns are not investable: you cannot buy an index directly, and index figures " +
  "carry no fund expenses, transaction costs, taxes, or advisory fees of any kind. The only costs " +
  "reflected in this illustration are the ones you enter above. " +
  // Both ends of the window are reader-selectable, so this has to name both.
  // A window can be positioned over a flattering stretch of history, and the
  // disclosure is what keeps that from reading as a claim.
  "You choose the first and last year shown; a different period produces a materially " +
  "different result. " +
  SP500_SOURCE_LABEL;

/**
 * Shortest horizon either calculator will model.
 *
 * A one- or two-year window is a fee comparison in name only: the flat fee and
 * the asset-based fee have barely diverged, and the window is short enough
 * that a single outlier year drives the whole result. Five years is the floor
 * for the year-strip handles and for every numeric Years input on both
 * calculators, so the two cannot disagree about what a legal horizon is.
 *
 * Lives here rather than in calculatorState because this module has no imports
 * of its own, which is what lets the year-window rules be tested directly.
 */
export const MIN_HORIZON_YEARS = 5;

function clampYears(years: number): number {
  if (!Number.isFinite(years)) return 1;
  return Math.min(SP500_MAX_YEARS, Math.max(1, Math.round(years)));
}

/** The window may end on any year in the table, not only the most recent. */
export function clampEndYear(endYear: number): number {
  if (!Number.isFinite(endYear)) return SP500_DATA_LAST_YEAR;
  return Math.min(SP500_DATA_LAST_YEAR, Math.max(SP500_DATA_FIRST_YEAR, Math.round(endYear)));
}

/** A window cannot reach back past the first year in the table. */
export function clampYearsForEnd(years: number, endYear: number): number {
  const end = clampEndYear(endYear);
  const available = end - SP500_DATA_FIRST_YEAR + 1;
  if (!Number.isFinite(years)) return 1;
  return Math.min(available, Math.max(1, Math.round(years)));
}

/**
 * Where each end of the year strip is allowed to stop.
 *
 * Both handles enforce MIN_HORIZON_YEARS by parking against the minimum rather
 * than refusing to move: drag the start handle into the end handle and it
 * settles MIN_HORIZON_YEARS - 1 years short of it. These are pure so the
 * pointer path, the keyboard path and the tests all share one definition of a
 * legal window.
 */

/** The latest start year that still leaves a full minimum window before `endYear`. */
export function latestWindowStartYear(endYear: number): number {
  const end = clampEndYear(endYear);
  return Math.max(SP500_DATA_FIRST_YEAR, end - MIN_HORIZON_YEARS + 1);
}

/** The earliest end year that still leaves a full minimum window after `startYear`. */
export function earliestWindowEndYear(startYear: number): number {
  const start = clampEndYear(startYear);
  return Math.min(SP500_DATA_LAST_YEAR, start + MIN_HORIZON_YEARS - 1);
}

/** Snap a proposed START year into the range that handle may occupy. */
export function clampWindowStartYear(nextStart: number, endYear: number): number {
  if (!Number.isFinite(nextStart)) return SP500_DATA_FIRST_YEAR;
  const latest = latestWindowStartYear(endYear);
  return Math.min(latest, Math.max(SP500_DATA_FIRST_YEAR, Math.round(nextStart)));
}

/** Snap a proposed END year into the range that handle may occupy. */
export function clampWindowEndYear(nextEnd: number, startYear: number): number {
  const earliest = earliestWindowEndYear(startYear);
  if (!Number.isFinite(nextEnd)) return earliest;
  return Math.min(SP500_DATA_LAST_YEAR, Math.max(earliest, Math.round(nextEnd)));
}

/**
 * `years` complete calendar years ending on `endYear`, oldest first.
 * `getWindow(20, 2025)` returns 2006 through 2025 in chronological order, so
 * index 0 is applied to projection year 1.
 *
 * Both ends are selectable, so this is the general form and the trailing
 * helpers below are the special case where the window ends on the most recent
 * year. Slicing from an index derived from the calendar year — rather than
 * from the end of the array — is what keeps the two consistent.
 */
export function getWindow(years: number, endYear: number = SP500_DATA_LAST_YEAR): Sp500Year[] {
  const end = clampEndYear(endYear);
  const count = clampYearsForEnd(years, end);
  const endIndex = end - SP500_DATA_FIRST_YEAR;
  return SP500_ANNUAL_TOTAL_RETURNS.slice(endIndex - count + 1, endIndex + 1);
}

/** Same window as getWindow, reduced to bare percentages. */
export function getWindowReturnPercents(
  years: number,
  endYear: number = SP500_DATA_LAST_YEAR,
): number[] {
  return getWindow(years, endYear).map((entry) => entry.totalReturnPercent);
}

/**
 * The most recent `years` complete calendar years, oldest first.
 * `getTrailingWindow(20)` returns 2006 through 2025.
 */
export function getTrailingWindow(years: number): Sp500Year[] {
  const count = clampYears(years);
  return SP500_ANNUAL_TOTAL_RETURNS.slice(SP500_MAX_YEARS - count);
}

/** Same window as getTrailingWindow, reduced to bare percentages. */
export function getTrailingReturnPercents(years: number): number[] {
  return getTrailingWindow(years).map((entry) => entry.totalReturnPercent);
}

/**
 * Compound annual growth rate of a run of yearly percentages, returned in
 * percent. This is the geometric mean — the return an investor actually
 * realized — not the arithmetic average, which overstates outcomes and
 * reads as misleading in a regulatory review.
 */
export function annualizedReturnPercent(returnPercents: readonly number[]): number {
  if (returnPercents.length === 0) return 0;
  const growth = returnPercents.reduce(
    (product, percent) => product * (1 + percent / 100),
    1,
  );
  if (growth <= 0) return -100;
  return (Math.pow(growth, 1 / returnPercents.length) - 1) * 100;
}

/** CAGR of the trailing `years`-year window, in percent. */
export function getTrailingAnnualizedReturnPercent(years: number): number {
  return annualizedReturnPercent(getTrailingReturnPercents(years));
}

/**
 * CAGR of any window, in percent. This is the number shown to the reader as
 * "Annualized return", so it must stay the geometric figure — the arithmetic
 * mean of the same years is higher and would overstate the outcome.
 */
export function getWindowAnnualizedReturnPercent(
  years: number,
  endYear: number = SP500_DATA_LAST_YEAR,
): number {
  return annualizedReturnPercent(getWindowReturnPercents(years, endYear));
}

/** Best and worst single years inside the window. */
export function getWindowExtremes(
  years: number,
  endYear: number = SP500_DATA_LAST_YEAR,
): { best: Sp500Year; worst: Sp500Year } {
  const window = getWindow(years, endYear);
  let best = window[0];
  let worst = window[0];
  window.forEach((entry) => {
    if (entry.totalReturnPercent > best.totalReturnPercent) best = entry;
    if (entry.totalReturnPercent < worst.totalReturnPercent) worst = entry;
  });
  return { best, worst };
}

/** How many years in the window finished negative. */
export function countDownYears(
  years: number,
  endYear: number = SP500_DATA_LAST_YEAR,
): number {
  return getWindow(years, endYear).filter((entry) => entry.totalReturnPercent < 0).length;
}
