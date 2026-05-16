export type HomeTopBannerId = "founder-proof" | "qr-bridge" | "advisor-standard";

export type HomeTopBanner = {
  id: HomeTopBannerId;
  label: string;
  eyebrow: string;
  headline: string;
  body: string;
  ctaLabel: string;
  mobileCtaLabel: string;
  ctaHref: string;
  statLabel: string;
  statValue: string;
  proofPoints: string[];
  tone: "founder" | "qr" | "standard";
};

export const defaultHomeTopBannerId: HomeTopBannerId = "founder-proof";

export const homeTopBannerOrder: HomeTopBannerId[] = [
  "founder-proof",
  "qr-bridge",
  "advisor-standard",
];

export const homeTopBanners: Record<HomeTopBannerId, HomeTopBanner> = {
  "founder-proof": {
    id: "founder-proof",
    label: "Founder proof",
    eyebrow: "Smarter Way Wealth",
    headline: "A fee-drag check, built by a fiduciary.",
    body:
      "David J. Van Osdol, CFA, CFP built Smarter Way Wealth for investors who want serious planning, better tools, and a flat monthly fee.",
    ctaLabel: "Visit Smarter Way Wealth",
    mobileCtaLabel: "Visit firm",
    ctaHref: "https://smarterwaywealth.com/",
    statLabel: "Flat monthly fee",
    statValue: "$100/mo",
    proofPoints: ["CFA Charterholder", "CFP Practitioner"],
    tone: "founder",
  },
  "qr-bridge": {
    id: "qr-bridge",
    label: "QR bridge",
    eyebrow: "Scanned the QR code?",
    headline: "Start with your fee-drag number.",
    body:
      "Adjust the assumptions below, compare the asset-based fee to a flat monthly model, then decide whether the old pricing makes sense.",
    ctaLabel: "Meet the firm behind it",
    mobileCtaLabel: "Meet firm",
    ctaHref: "https://smarterwaywealth.com/",
    statLabel: "Takes about",
    statValue: "1 min",
    proofPoints: ["No account login", "Shareable result", "Plain-English assumptions"],
    tone: "qr",
  },
  "advisor-standard": {
    id: "advisor-standard",
    label: "Advisor standard",
    eyebrow: "The advisor standard matters",
    headline: "Built by a CFA/CFP fiduciary, not an asset-based fee model.",
    body:
      "The calculator gives you the math first. Smarter Way Wealth gives you the firm standard behind the math: serious planning, clear tradeoffs, and a flat monthly fee.",
    ctaLabel: "Continue to Smarter Way Wealth",
    mobileCtaLabel: "Continue",
    ctaHref: "https://smarterwaywealth.com/",
    statLabel: "Model",
    statValue: "Flat fee",
    proofPoints: ["Fiduciary standard", "Credentialed advice", "Better planning tools"],
    tone: "standard",
  },
};

export function getHomeTopBannerId(value: string | string[] | undefined): HomeTopBannerId {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (candidate && candidate in homeTopBanners) {
    return candidate as HomeTopBannerId;
  }

  return defaultHomeTopBannerId;
}
