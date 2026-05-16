export const siteUrl = "https://youarepayingtoomuch.com";
export const siteName = "You Are Paying Too Much";
export const advisoryFirmName = "Smarter Way Wealth";
export const advisorName = "David J. Van Osdol";

export type PublicRoute = {
  path: string;
  title: string;
  description: string;
  changeFrequency: "weekly" | "monthly" | "yearly";
  priority: number;
};

export const publicRoutes: PublicRoute[] = [
  {
    path: "/",
    title: "Advisory Fee Calculator",
    description:
      "Compare a traditional asset-based advisory fee with Smarter Way Wealth's $100/month flat-fee model.",
    changeFrequency: "weekly",
    priority: 1,
  },
  {
    path: "/upgrade-your-advice",
    title: "Upgrade Your Advice",
    description:
      "Learn how credentialed fiduciary advice, financial planning, and a flat monthly fee can replace fee drag.",
    changeFrequency: "monthly",
    priority: 0.9,
  },
  {
    path: "/improve-your-tools",
    title: "Improve Your Tools",
    description:
      "See the planning tools used to model cash flow, taxes, retirement, and side-by-side decisions.",
    changeFrequency: "monthly",
    priority: 0.85,
  },
  {
    path: "/how-it-works",
    title: "How It Works",
    description:
      "Review the projection logic, query parameters, and reusable links behind the fee calculator.",
    changeFrequency: "monthly",
    priority: 0.85,
  },
  {
    path: "/how-it-works/substitution",
    title: "How Substitution Works",
    description:
      "Understand the substitution logic behind replacing an asset-based advisory fee with a flat monthly fee.",
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    path: "/save",
    title: "Save Proof",
    description:
      "Explore the deeper proof behind projected advisory fee savings with the same calculator assumptions.",
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    path: "/save-a-ton",
    title: "Save a Ton",
    description:
      "See how compounding fee drag can grow over time and how a flat-fee model changes the math.",
    changeFrequency: "monthly",
    priority: 0.75,
  },
  {
    path: "/meaning",
    title: "What the Savings Mean",
    description:
      "Translate projected fee savings into practical choices for retirement, family, giving, and flexibility.",
    changeFrequency: "monthly",
    priority: 0.75,
  },
  {
    path: "/our-math",
    title: "Our Math",
    description:
      "Read the formulas, assumptions, limitations, and worked example behind the advisory fee calculator.",
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    path: "/faq",
    title: "FAQ",
    description:
      "Answers to common questions about Smarter Way Wealth, the flat-fee model, credentials, custody, AI, and service scope.",
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    path: "/mobile-calculator",
    title: "Mobile Calculator",
    description:
      "A mobile-focused advisory fee calculator for quickly comparing asset-based fees with a flat monthly fee.",
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    path: "/privacy",
    title: "Privacy",
    description:
      "Privacy practices, disclosures, and important limitations for the You Are Paying Too Much calculator site.",
    changeFrequency: "yearly",
    priority: 0.5,
  },
];

export function absoluteUrl(path: string) {
  return new URL(path, siteUrl).toString();
}
