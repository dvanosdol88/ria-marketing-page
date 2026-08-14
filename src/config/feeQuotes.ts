/**
 * The fee-quote pool — the single source for every surface that cites what
 * respected investors say about long-term costs. Extracted verbatim from
 * QuoteTickerWithPortraits.tsx (which now imports from here) so the homepage
 * quote deck and the legacy ticker can never drift apart.
 *
 * These are third-party statements about investment COSTS generally — not
 * testimonials about this firm — and must stay that way (compliance).
 */

export interface FeeQuote {
  firstName: string;
  lastName: string;
  title: string;
  quote: string;
  portrait?: string;
}

export const FEE_QUOTE_PORTRAITS: Record<string, string> = {
  "Bogle": "/images/portraits/WSJ-john-bogle.jpg",
  "Fama": "/images/portraits/WSJ-eugene-fama.jpg",
  "Buffett": "/images/portraits/WSJ-warren-buffett.jpg",
  "Malkiel": "/images/portraits/WSJ-burton-malkiel.jpg",
  "Swensen": "/images/portraits/WSJ-david-swensen.jpg",
  "Munger": "/images/portraits/WSJ-charlie-munger.jpg",
  "Sharpe": "/images/portraits/WSJ-william-sharpe.jpg",
  "Orman": "/images/portraits/WSJ-suzie-orman.jpg",
  "Franklin": "/images/portraits/WSJ-benjamin-franklin.jpg",
  "Ramsey": "/images/portraits/WSJ-dave-ramsey.jpg",
  "Van Osdol": "/images/portraits/WSJ-DVO.jpg",
  "Viewpoints": "/images/portraits/optimized/fidelity-logo.png",
};

/** Portrait crops whose faces sit low in the frame; the ticker nudges these
 *  down by this many percent when it renders them. */
export const FEE_QUOTE_PORTRAIT_OFFSET: Record<string, number> = {
  "Fama": 10,
  "Munger": 10,
  "Franklin": 10,
  "Sharpe": 10,
};

export const FEE_QUOTES: FeeQuote[] = [
  {
    firstName: "John C.",
    lastName: "Bogle",
    title: "Founder, Vanguard",
    quote: "The miracle of compounding returns is overwhelmed by the tyranny of compounding costs.",
  },
  {
    firstName: "Eugene",
    lastName: "Fama",
    title: "Nobel Laureate in Economics",
    quote: "Active management is a zero-sum game before costs, and a negative-sum game after costs.",
  },
  {
    firstName: "Warren",
    lastName: "Buffett",
    title: "Chairman, Berkshire Hathaway",
    quote: "If returns are going to be 7 or 8 percent and you're paying 1 percent for fees, that makes an enormous difference.",
  },
  {
    firstName: "Burton",
    lastName: "Malkiel",
    title: "Author, A Random Walk Down Wall Street",
    quote: "Large advisory fees and substantial portfolio turnover tend to reduce investment yields.",
  },
  {
    firstName: "David",
    lastName: "Swensen",
    title: "Former CIO, Yale Endowment",
    quote: "When you look at the results on an after-fee, after-tax basis, there's almost no chance that you end up beating the index fund.",
  },
  {
    firstName: "Charlie",
    lastName: "Munger",
    title: "Vice Chairman, Berkshire Hathaway",
    quote: "Beating the market averages, after paying substantial costs and fees, is an against-the-odds game.",
  },
  {
    firstName: "William F.",
    lastName: "Sharpe",
    title: "Nobel Laureate in Economics",
    quote: "A person saving for retirement who chooses low-cost investments could have a standard of living 20% higher than a high-cost investor.",
  },
  {
    firstName: "Suze",
    lastName: "Orman",
    title: "Personal Finance Expert",
    quote: "You can't afford to be paying 1% or more when there are alternatives that cost you hardly anything.",
  },
  {
    firstName: "John C.",
    lastName: "Bogle",
    title: "Founder, Vanguard",
    quote: "Where returns are concerned, time is your friend. But where costs are concerned, time is your enemy.",
  },
  {
    firstName: "Warren",
    lastName: "Buffett",
    title: "Berkshire Hathaway Letter, 2018",
    quote: "A 1% management fee cut returns in half over a 77-year period.",
  },
  {
    firstName: "Fidelity",
    lastName: "Viewpoints",
    title: "November 2025",
    quote: "On a $100,000 portfolio earning 4% annually, the difference between a 0.25% and 1.00% fee could cost you nearly $30,000 over 20 years.",
  },
  {
    firstName: "David",
    lastName: "Swensen",
    title: "Unconventional Success",
    quote: "Excessive management fees take their toll, and manager profits dominate fiduciary responsibility.",
  },
  {
    firstName: "Eugene",
    lastName: "Fama",
    title: "Nobel Laureate in Economics",
    quote: "I can't figure out why anyone invests in active management. My advice would be to avoid high fees.",
  },
  {
    firstName: "John C.",
    lastName: "Bogle",
    title: "Founder, Vanguard",
    quote: "The investor put up 100% of the capital and assumed 100% of the risk, yet earned only 31% of the market return. Fees confiscated 70%.",
  },
  {
    firstName: "Charlie",
    lastName: "Munger",
    title: "Vice Chairman, Berkshire Hathaway",
    quote: "They're used to charging big fees for stuff that isn't doing their clients any good.",
  },
  {
    firstName: "Benjamin",
    lastName: "Franklin",
    title: "Founding Father",
    quote: "Money makes money. And the money that money makes, makes money.",
  },
  {
    firstName: "Warren",
    lastName: "Buffett",
    title: "Berkshire Hathaway Letter, 2016",
    quote: "The massive fees levied by 'helpers' would leave clients worse off than if they simply invested in an unmanaged low-cost index fund.",
  },
  {
    firstName: "Benjamin",
    lastName: "Franklin",
    title: "Founding Father",
    quote: "A penny saved is a penny earned.",
  },
  {
    firstName: "William F.",
    lastName: "Sharpe",
    title: "Financial Analysts Journal, 1991",
    quote: "After costs, the return on the average actively managed dollar will be less than the return on the average passively managed dollar.",
  },
  {
    firstName: "John C.",
    lastName: "Bogle",
    title: "Founder, Vanguard",
    quote: "Fund performance comes and goes. Costs go on forever.",
  },
  {
    firstName: "Suze",
    lastName: "Orman",
    title: "Personal Finance Expert",
    quote: "Paying less in fees means keeping more of your money growing for your future.",
  },
];
