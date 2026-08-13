// CANON: shared verbatim with the sister repo (youarepayingtoomuch.com,
// D:\ria-marketing-page). Edit both repos in the same session or CI fails.
// See CALCULATOR-CANON.md.

import { formatCurrency } from "./format.ts";

export interface ShareSummaryInput {
  /** projection.savings (may be negative) */
  savings: number;
  flatEndingValue: number;
  traditionalEndingValue: number;
  portfolioValue: number;
  years: number;
  /** state.annualFlatFee / 12 */
  monthlyFlatFee: number;
  /** e.g. "S&P 500 total returns, 2006-2025" or "8% steady annual return" */
  returnLabel: string;
  /** e.g. "1.00% asset-based fee" or "Tiered schedule (3 tiers, 1.250% starting effective rate)" */
  feeLabel: string;
  /** "steady" for a constant assumed growth rate, "market" for replayed S&P 500 history. */
  returnMode: "steady" | "market";
  /** Steady annual growth rate, or the market window's annualized (CAGR) return, in percent. */
  growthPercent: number;
  /** Calendar-year window label for market mode, e.g. "2006–2025". Unused in steady mode. */
  marketWindow?: string;
  /** absolute share URL */
  url: string;
  /** Absolute URL (with a #poll anchor) for the optional poll question line. */
  pollUrl?: string;
  /** Firm/site display name for the negative-savings shortLine ("<name>
   * calculator: in this scenario…"). Optional — defaults to
   * siteCalculatorConfig.firmDisplayName's value ("Smarter Way Wealth") so
   * existing callers that omit it keep producing byte-identical output. */
  firmDisplayName?: string;
}

export interface ShareSummary {
  /** "Fee comparison: $788,306 potential difference" (negative savings ->
   *  "Fee comparison: flat fee costs $X more in this scenario") */
  title: string;
  /** one-liner for native share text */
  shortLine: string;
  /** multi-line narrative block for copy/paste */
  text: string;
  /** "What would YOU do with an extra $X? Vote in the 10-second poll: <pollUrl>" —
   *  null when savings <= 0 or no pollUrl was supplied. */
  pollLine: string | null;
  /** `text` with `pollLine` inserted as its own paragraph before the "Run it"
   *  line — null whenever `pollLine` is null, so callers never string-surgery
   *  the plain `text` themselves. */
  textWithPoll: string | null;
  /** Compact variant for X/Twitter — always starts "Educational illustration —"
   *  and stays within the platform's character budget at any reachable input. */
  socialText: string;
  /** Title-cased one-liner for a Reddit link submission. */
  redditTitle: string;
  emailSubject: string;
  /** text, unchanged — kept as a distinct field so callers never have to
   *  remember which field is mailto-safe. */
  emailBody: string;
  imageFileName: string;
  /** the vetted disclosure sentence used everywhere */
  disclosure: string;
}

const DISCLOSURE =
  "Educational illustration only — not investment advice, a forecast, or a guarantee. Actual results will vary.";

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

const TIERED_FEE_LABEL_RE = /^Tiered schedule \((.+)\)$/;
const SINGLE_FEE_LABEL_RE = /^([\d.]+)% asset-based fee$/;

/** Turns the consumer-supplied `feeLabel` into the "paying ___ on a ___
 * portfolio" clause David's narrative template requires, without asking
 * every caller to also pass a separate machine-readable fee description. */
function buildFeeClause(feeLabel: string): string {
  const tieredMatch = feeLabel.match(TIERED_FEE_LABEL_RE);
  if (tieredMatch) {
    return `a tiered asset-based fee schedule (${tieredMatch[1]})`;
  }
  const singleMatch = feeLabel.match(SINGLE_FEE_LABEL_RE);
  if (singleMatch) {
    return `${singleMatch[1]}% in annual asset-based fees`;
  }
  // Unrecognized label shape — degrade gracefully rather than mangling text.
  return feeLabel;
}

/** Compact fee descriptor for the X/Twitter variant, which has a hard
 * character budget. The full tiered detail ("6 tiers, 0.736% starting
 * effective rate") is exactly the kind of thing that pushes a max-input
 * scenario over the limit, so socialText drops it and keeps "a tiered
 * asset-based fee" — still accurate, just shorter. */
function buildCompactFeeLabel(feeLabel: string): string {
  if (TIERED_FEE_LABEL_RE.test(feeLabel)) {
    return "a tiered asset-based fee";
  }
  const singleMatch = feeLabel.match(SINGLE_FEE_LABEL_RE);
  if (singleMatch) {
    return `a ${singleMatch[1]}% asset-based fee`;
  }
  return `a ${feeLabel}`;
}

function buildGrowthSentence(returnMode: "steady" | "market", growthPercent: number, marketWindow?: string): string {
  if (returnMode === "market") {
    const windowPart = marketWindow ? `${marketWindow}, ` : "";
    return `Using actual S&P 500 returns (${windowPart}${growthPercent.toFixed(2)}% annualized), here are the results.`;
  }
  return `Assuming ${growthPercent}% annual growth, here are the results.`;
}

export function buildShareSummary(input: ShareSummaryInput): ShareSummary {
  const {
    savings,
    flatEndingValue,
    traditionalEndingValue,
    portfolioValue,
    years,
    monthlyFlatFee,
    feeLabel,
    returnMode,
    growthPercent,
    marketWindow,
    url,
    pollUrl,
    firmDisplayName = "Smarter Way Wealth",
  } = input;

  const isPositive = savings >= 0;
  const magnitude = formatCurrency(Math.abs(savings));
  const percentLost = flatEndingValue > 0 ? clamp((savings / flatEndingValue) * 100, 0, 100) : 0;
  const percentLostLabel = percentLost.toFixed(1);

  const title = isPositive
    ? `Fee comparison: ${magnitude} potential difference`
    : `Fee comparison: flat fee costs ${magnitude} more in this scenario`;

  const shortLine = isPositive
    ? `Educational illustration — I compared a ${formatCurrency(monthlyFlatFee)}/month flat advisory fee to a ${feeLabel} on a ${formatCurrency(portfolioValue)} portfolio over ${years} years: potential difference ${magnitude} (${percentLostLabel}% of the final wealth).`
    : `${firmDisplayName} calculator: in this scenario, the flat fee costs ${magnitude} more over ${years} years.`;

  const comparisonBlock = [
    `I compared paying ${formatCurrency(monthlyFlatFee)} a month for advice from a highly qualified advisor`,
    "TO",
    `paying ${buildFeeClause(feeLabel)} on a ${formatCurrency(portfolioValue)} portfolio for ${years} years.`,
  ].join("\n");

  const growthSentence = buildGrowthSentence(returnMode, growthPercent, marketWindow);

  const valuesBlock = [
    `Flat monthly fee: ending value ${formatCurrency(flatEndingValue)}.`,
    `Asset-based fee: ending value ${formatCurrency(traditionalEndingValue)}.`,
  ].join("\n");

  const savingsParagraph = isPositive
    ? `Potential savings of ${magnitude} over that time period. That's ${percentLostLabel}% of the wealth, lost to fees.`
    : `In this scenario the flat fee costs ${magnitude} more than the asset-based fee over that time period.`;

  const finalBlock = [`Run it with your own numbers: ${url}`, DISCLOSURE].join("\n");

  const bodyParagraphs = [comparisonBlock, growthSentence, valuesBlock, savingsParagraph];
  const text = [...bodyParagraphs, finalBlock].join("\n\n");

  const pollLine = savings > 0 && pollUrl
    ? `What would YOU do with an extra ${magnitude}? Vote in the 10-second poll: ${pollUrl}`
    : null;
  const textWithPoll = pollLine ? [...bodyParagraphs, pollLine, finalBlock].join("\n\n") : null;

  const compactFeeLabel = buildCompactFeeLabel(feeLabel);
  const socialText = isPositive
    ? `Educational illustration — I compared ${formatCurrency(monthlyFlatFee)}/month flat-fee advice to ${compactFeeLabel} on a ${formatCurrency(portfolioValue)} portfolio over ${years} years: potential difference ${magnitude}. That's ${percentLostLabel}% of the wealth, lost to fees.`
    : `Educational illustration — I compared ${formatCurrency(monthlyFlatFee)}/month flat-fee advice to ${compactFeeLabel} on a ${formatCurrency(portfolioValue)} portfolio over ${years} years: in this scenario, the flat fee costs ${magnitude} more.`;

  const redditTitle = isPositive
    ? `Fee comparison illustration: ${formatCurrency(monthlyFlatFee)}/month flat fee vs ${feeLabel} on ${formatCurrency(portfolioValue)} over ${years} years — potential difference ${magnitude}`
    : `Fee comparison illustration: ${formatCurrency(monthlyFlatFee)}/month flat fee vs ${feeLabel} on ${formatCurrency(portfolioValue)} over ${years} years — flat fee costs ${magnitude} more`;

  return {
    title,
    shortLine,
    text,
    pollLine,
    textWithPoll,
    socialText,
    redditTitle,
    emailSubject: title,
    emailBody: text,
    imageFileName: "smarter-way-wealth-fee-comparison.png",
    disclosure: DISCLOSURE,
  };
}
