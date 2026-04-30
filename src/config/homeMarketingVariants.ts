export type HomeMarketingVariantId = "direct-mail" | "fee-receipt" | "fiduciary-upgrade";

export type HomeMarketingVariant = {
  id: HomeMarketingVariantId;
  label: string;
  layout: "photo" | "receipt" | "advisor";
  eyebrow: string;
  headline: string;
  highlight: string;
  body: string;
  primaryCta: string;
  secondaryCta: string;
  resultLabel: string;
  proofPoints: string[];
  image?: {
    src: string;
    alt: string;
    position: string;
  };
};

export const defaultHomeMarketingVariantId: HomeMarketingVariantId = "direct-mail";

export const homeMarketingVariantOrder: HomeMarketingVariantId[] = [
  "direct-mail",
  "fee-receipt",
  "fiduciary-upgrade",
];

export const homeMarketingVariants: Record<HomeMarketingVariantId, HomeMarketingVariant> = {
  "direct-mail": {
    id: "direct-mail",
    label: "QR mailer",
    layout: "photo",
    eyebrow: "Scanned from the mailer? Start here.",
    headline: "See what a 1% advisory fee could cost",
    highlight: "before you ignore it.",
    body:
      "Adjust four assumptions and compare a traditional asset-based advisory fee to a $100/month flat-fee model.",
    primaryCta: "Run my numbers",
    secondaryCta: "Share this scenario",
    resultLabel: "Potential fee drag in this scenario",
    proofPoints: ["No account login", "Takes under a minute", "Shareable result link"],
    image: {
      src: "/images/qr-mailer-calculator-hero.png",
      alt: "A mailer and phone showing an advisory fee calculator on a bright kitchen table",
      position: "center center",
    },
  },
  "fee-receipt": {
    id: "fee-receipt",
    label: "Fee receipt",
    layout: "receipt",
    eyebrow: "Your statements show performance. Do they show this?",
    headline: "Get a receipt for your advisory fee",
    highlight: "over time.",
    body:
      "Most investors know the percentage. Fewer see the compounding dollar impact. This calculator makes the tradeoff visible.",
    primaryCta: "Open the calculator",
    secondaryCta: "Copy this result",
    resultLabel: "Current projected fee gap",
    proofPoints: ["AUM fee", "Fund expenses", "$100/mo comparison"],
  },
  "fiduciary-upgrade": {
    id: "fiduciary-upgrade",
    label: "Advisor-led",
    layout: "advisor",
    eyebrow: "Fiduciary advice without the AUM meter running.",
    headline: "Upgrade the advice,",
    highlight: "not the fee.",
    body:
      "David J. Van Osdol, CFA, CFP built Smarter Way Wealth for investors who want serious planning, better tools, and a flat monthly fee.",
    primaryCta: "Compare my fee",
    secondaryCta: "Share this projection",
    resultLabel: "Estimated wealth kept with the flat-fee model",
    proofPoints: ["CFA Charterholder", "CFP Practitioner", "$100/month flat fee"],
    image: {
      src: "/DVO Head Shot picture.jpg",
      alt: "David J. Van Osdol",
      position: "right center",
    },
  },
};

export function getHomeMarketingVariantId(value: string | string[] | undefined): HomeMarketingVariantId {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (candidate && candidate in homeMarketingVariants) {
    return candidate as HomeMarketingVariantId;
  }

  return defaultHomeMarketingVariantId;
}
