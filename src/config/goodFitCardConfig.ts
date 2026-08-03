import { SMARTER_WAY_WEALTH_MEET_URL } from "@/config/campaignLinks";

export const goodFitCardConfig = {
  eyebrow: "Planning fit",
  title: "Are you a good fit?",
  description:
    "Smarter Way Wealth is designed for households seeking an ongoing planning and investment relationship, not predictions or trading tips.",
  representativeLead: "Includes, among other things:",
  link: {
    href: SMARTER_WAY_WEALTH_MEET_URL,
    label: "Meet David for 15 minutes",
  },
  aligned: [
    {
      title: "Financial Planning",
      items: [
        "Retirement income and cash-flow decisions",
        "Tax, Roth conversion, Social Security, and Medicare planning",
        "Estate, insurance, and family-goal coordination",
      ],
    },
    {
      title: "Investment Planning",
      items: [
        "Portfolio allocation, diversification, and risk alignment",
        "Tax-aware asset location and rebalancing",
        "A long-term investment plan tied to your financial plan",
      ],
    },
  ],
  notAligned: [
    {
      title: "Stock Picks",
      items: [
        "A stream of individual-security tips",
        "Short-term trading calls or speculative ideas",
      ],
    },
    {
      title: "Market Timing",
      items: [
        "Predictions about when to enter or leave the market",
        "Promises to avoid downturns or guarantee outcomes",
      ],
    },
  ],
} as const;
