import ratesData from "@/data/savingsRates.json";

/**
 * Typed access + derived values for the verified savings/money-market
 * rate dataset in src/data/savingsRates.json.
 *
 * The dataset is maintained under a fail-closed verification policy:
 * every figure carries a lastVerified date and at least two public
 * sources, and the refresh job (scripts/refresh-savings-rates.mjs) only
 * bumps dates it can re-verify — it never invents a new number. See the
 * "policyNotes" field in the JSON for the full statement.
 */

export interface RateSource {
  name: string;
  url: string;
  role?: string;
}

/**
 * Bank contact facts, each verified against the bank's own site and
 * dated. Slow-changing by nature; `verified` records the check date.
 * `rateUrl` is the consumer-facing page where the rate is visible —
 * kept separate from `sources` so display links can improve without
 * touching the URLs the weekly verifier depends on.
 */
export interface BankContact {
  phone: string;
  phoneSource: string;
  hq: string;
  rateUrl: string;
  verified: string;
}

export interface RateRow {
  institution: string;
  product: string;
  apyPercent: number;
  verifyString: string;
  minToOpen: string;
  conditions: string;
  institutionRateAsOf: string | null;
  lastVerified: string;
  verification: string;
  sources: RateSource[];
  contact?: BankContact;
}

/** Why a bank appears in the big-bank comparison table. */
export type BigBankTag = "money-center" | "regional" | "ct-top5" | "ny-top5";

export interface BigBankRow {
  institution: string;
  product: string;
  apyPercent: number;
  verifyString: string;
  /** Base-rate caveats, e.g. relationship tiers or state-specific sheets. */
  apyNote: string;
  /**
   * "branch" = traditional branch bank (the 0.01%-0.05% story);
   * "online-arm" = branchless online-only product of a large
   * institution — shown in a separate labeled subgroup so the two are
   * never mixed.
   */
  group: "branch" | "online-arm";
  tags: BigBankTag[];
  /** FDIC SOD in-state deposit market share, percent (only for tagged banks). */
  ctSharePercent?: number;
  nySharePercent?: number;
  institutionRateAsOf: string | null;
  lastVerified: string;
  verification: string;
  /**
   * Whether the weekly job can re-check this row against its primary
   * source with a plain fetch. Rows behind ZIP gates, PDFs, or bot
   * challenges are autoCheck=false and are flagged for a manual
   * re-verification pass when their lastVerified date ages out.
   */
  autoCheck: boolean;
  sources: RateSource[];
  contact?: BankContact;
}

export interface BigBanksSection {
  /** Selection criteria, stated on the page. */
  criteria: {
    moneyCenter: string;
    regional: string;
    statePresence: string;
  };
  sod: {
    vintage: string;
    sourceName: string;
    sourceUrl: string;
    retrieved: string;
  };
  /** Top-5 CT/NY deposit holders with no standard retail savings account. */
  exclusions: { institution: string; reason: string }[];
  rows: BigBankRow[];
}

export interface SavingsRatesData {
  meta: {
    datasetVersion: number;
    lastFullVerification: string;
    policy: string;
    policyNotes: string;
  };
  fdic: {
    sourceName: string;
    sourceUrl: string;
    ratesAsOf: string;
    updateCadence: string;
    savingsApyPercent: number;
    moneyMarketApyPercent: number;
    interestCheckingApyPercent: number;
    lastVerified: string;
  };
  bigBankAnchor: {
    label: string;
    apyPercent: number;
    lastVerified: string;
    sources: RateSource[];
  };
  topRates: {
    savings: RateRow[];
    moneyMarket: RateRow[];
  };
  bigBanks: BigBanksSection;
  excludedUnverifiable: {
    institution: string;
    product: string;
    advertised: string;
    reason: string;
  }[];
  excludedPromotions: {
    institution: string;
    advertised: string;
    reason: string;
  }[];
}

export const savingsRates = ratesData as SavingsRatesData;

/** Highest verified standard savings APY in the dataset. */
export function getTopSavingsApy(): number {
  return Math.max(...savingsRates.topRates.savings.map((r) => r.apyPercent));
}

/** Highest verified standard money market APY in the dataset. */
export function getTopMoneyMarketApy(): number {
  return Math.max(...savingsRates.topRates.moneyMarket.map((r) => r.apyPercent));
}

/** Highest verified APY across both tables — the calculator's benchmark. */
export function getTopVerifiedApy(): number {
  return Math.max(getTopSavingsApy(), getTopMoneyMarketApy());
}

/**
 * First-year extra interest from moving `balance` from `currentApyPercent`
 * to `targetApyPercent`. Simple one-year difference, deliberately without
 * compounding, so the page can honestly say "in the first year, roughly".
 */
export function extraInterestPerYear(
  balance: number,
  currentApyPercent: number,
  targetApyPercent: number,
): number {
  const delta = (targetApyPercent - currentApyPercent) / 100;
  return Math.max(0, balance * delta);
}

/** Days since the dataset was last fully verified, at render time. */
export function daysSinceVerification(now: Date = new Date()): number {
  const verified = new Date(`${savingsRates.meta.lastFullVerification}T00:00:00-05:00`);
  return Math.floor((now.getTime() - verified.getTime()) / 86_400_000);
}

/** After this many days without re-verification the page shows a stale notice. */
export const STALE_AFTER_DAYS = 21;

const DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

/** "2026-07-31" -> "July 31, 2026" (dates in the dataset are plain days). */
export function formatRateDate(isoDate: string): string {
  return DATE_FORMAT.format(new Date(`${isoDate}T00:00:00Z`));
}
