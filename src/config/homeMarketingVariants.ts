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
  calculator: HomeCalculatorTheme;
};

export type HomeCalculatorTheme = {
  sectionClassName: string;
  backdropClassName: string;
  eyebrowClassName: string;
  titleClassName: string;
  amountClassName: string;
  bodyClassName: string;
  shareButtonClassName: string;
  disclaimerClassName: string;
  frameClassName: string;
  chartFrameClassName: string;
  controlsClassName: string;
  collapseButtonClassName: string;
  helperTextClassName: string;
  linkClassName: string;
  slider: {
    labelClassName: string;
    trackClassName: string;
    destructiveColor: string;
    destructiveTrack: string;
    accumulationColor: string;
    accumulationTrack: string;
    addButtonClassName: string;
    removeButtonClassName: string;
  };
  chart: CalculatorChartTheme;
};

export type CalculatorChartTheme = {
  mode: "light" | "dark";
  chartBg: string;
  panelBgClassName: string;
  panelBorderClassName: string;
  mutedTextClassName: string;
  strongTextClassName: string;
  smarterStroke: string;
  traditionalStroke: string;
  traditionalArea: string;
  grid: string;
  xTick: string;
  yTick: string;
  cursor: string;
  lostStart: string;
  lostEnd: string;
  lostFillEnd: string;
  keptStart: string;
  keptEnd: string;
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
    calculator: {
      sectionClassName: "bg-[#EEF0F5] text-slate-950",
      backdropClassName:
        "bg-[radial-gradient(circle_at_20%_0%,rgba(0,122,47,0.12),transparent_34%),linear-gradient(180deg,#EEF0F5_0%,#F8FAFC_62%,#EEF0F5_100%)]",
      eyebrowClassName: "text-[#00682B]",
      titleClassName: "text-[#2A3F63]",
      amountClassName: "text-[#007A2F]",
      bodyClassName: "text-slate-700",
      shareButtonClassName:
        "border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50",
      disclaimerClassName: "text-neutral-500",
      frameClassName:
        "overflow-hidden rounded-[28px] border border-white/80 bg-white/80 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl ring-1 ring-slate-900/5",
      chartFrameClassName: "bg-white",
      controlsClassName: "border-t border-slate-100 bg-white/90 px-4 pb-4 pt-2 sm:px-6 sm:pb-6 sm:pt-3 lg:px-8 lg:pb-8 lg:pt-4",
      collapseButtonClassName:
        "text-slate-500 hover:bg-slate-50",
      helperTextClassName: "text-neutral-500",
      linkClassName: "text-brand-700 underline transition-colors hover:text-brand-800",
      slider: {
        labelClassName: "text-neutral-600",
        trackClassName: "bg-slate-200",
        destructiveColor: "#991B1B",
        destructiveTrack: "#FECACA",
        accumulationColor: "#4B5563",
        accumulationTrack: "#D1D5DB",
        addButtonClassName: "text-[#4C7AB6] hover:text-[#3C6393]",
        removeButtonClassName: "text-slate-500 hover:text-slate-700",
      },
      chart: {
        mode: "light",
        chartBg: "#FFFFFF",
        panelBgClassName: "border-slate-200 bg-white/80",
        panelBorderClassName: "border-slate-200",
        mutedTextClassName: "text-slate-600",
        strongTextClassName: "text-slate-950",
        smarterStroke: "#0F172A",
        traditionalStroke: "#000000",
        traditionalArea: "#64748B",
        grid: "#CBD5E1",
        xTick: "#8B95A5",
        yTick: "#64748B",
        cursor: "#CBD5E1",
        lostStart: "#F87171",
        lostEnd: "#7F1D1D",
        lostFillEnd: "#FEE2E2",
        keptStart: "#475569",
        keptEnd: "#0F172A",
      },
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
    calculator: {
      sectionClassName: "bg-[#F7F8FA] text-slate-950",
      backdropClassName:
        "bg-[linear-gradient(112deg,transparent_0%,transparent_26%,rgba(0,122,47,0.08)_26%,rgba(0,122,47,0.08)_39%,transparent_39%,transparent_100%),radial-gradient(circle_at_85%_22%,rgba(185,28,28,0.12),transparent_30%)]",
      eyebrowClassName: "text-red-700",
      titleClassName: "text-slate-950",
      amountClassName: "text-[#007A2F]",
      bodyClassName: "text-slate-700",
      shareButtonClassName:
        "border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50",
      disclaimerClassName: "text-slate-500",
      frameClassName:
        "overflow-hidden rounded-none border-y border-slate-300 bg-white/90 shadow-[0_28px_90px_rgba(15,23,42,0.10)] backdrop-blur-xl md:rounded-[4px] md:border",
      chartFrameClassName: "bg-[#FFFEFB]",
      controlsClassName:
        "border-t border-dashed border-slate-300 bg-[#FFFEFB] px-4 pb-4 pt-2 sm:px-6 sm:pb-6 sm:pt-3 lg:px-8 lg:pb-8 lg:pt-4",
      collapseButtonClassName:
        "text-slate-500 hover:bg-red-50 hover:text-red-700",
      helperTextClassName: "text-slate-500",
      linkClassName: "text-red-700 underline transition-colors hover:text-red-800",
      slider: {
        labelClassName: "text-slate-700",
        trackClassName: "bg-slate-200",
        destructiveColor: "#B91C1C",
        destructiveTrack: "#FCA5A5",
        accumulationColor: "#1F2937",
        accumulationTrack: "#CBD5E1",
        addButtonClassName: "text-red-700 hover:text-red-800",
        removeButtonClassName: "text-slate-500 hover:text-red-700",
      },
      chart: {
        mode: "light",
        chartBg: "#FFFEFB",
        panelBgClassName: "border-slate-300 bg-white/90",
        panelBorderClassName: "border-slate-300",
        mutedTextClassName: "text-slate-600",
        strongTextClassName: "text-slate-950",
        smarterStroke: "#111827",
        traditionalStroke: "#111827",
        traditionalArea: "#9CA3AF",
        grid: "#D8D3C8",
        xTick: "#9A8F82",
        yTick: "#6B7280",
        cursor: "#D8D3C8",
        lostStart: "#DC2626",
        lostEnd: "#7F1D1D",
        lostFillEnd: "#FDE2E2",
        keptStart: "#374151",
        keptEnd: "#111827",
      },
    },
  },
  "fiduciary-upgrade": {
    id: "fiduciary-upgrade",
    label: "Advisor-led",
    layout: "advisor",
    eyebrow: "Fiduciary advice without the fee drag.",
    headline: "Upgrade the advice,",
    highlight: "not the fee.",
    body:
      "David J. Van Osdol, CFA, CFP built Smarter Way Wealth for investors who want serious planning, better tools, and a flat monthly fee.",
    primaryCta: "Compare my fee",
    secondaryCta: "Share this projection",
    resultLabel: "Estimated wealth kept with the flat-fee model",
    proofPoints: ["20 years experience", "CFA Charterholder", "CFP Practitioner"],
    image: {
      src: "/DVO Head Shot picture.jpg",
      alt: "David J. Van Osdol",
      position: "right center",
    },
    calculator: {
      sectionClassName: "bg-white text-slate-950",
      backdropClassName:
        "bg-[linear-gradient(180deg,#007A2F_0%,#00993B_24%,#E5F7EC_64%,#FFFFFF_100%)]",
      eyebrowClassName: "text-emerald-200",
      titleClassName: "text-white",
      amountClassName: "text-emerald-300",
      bodyClassName: "text-emerald-50/80",
      shareButtonClassName:
        "border border-white/20 bg-white/10 px-4 text-sm font-semibold text-white backdrop-blur hover:bg-white/20",
      disclaimerClassName: "text-emerald-50/60",
      frameClassName:
        "overflow-hidden rounded-[28px] border border-white/15 bg-[#062417]/90 shadow-[0_28px_110px_rgba(0,0,0,0.42)] ring-1 ring-emerald-300/10",
      chartFrameClassName: "bg-[#061B12]",
      controlsClassName:
        "border-t border-white/10 bg-[#062417] px-4 pb-4 pt-2 sm:px-6 sm:pb-6 sm:pt-3 lg:px-8 lg:pb-8 lg:pt-4",
      collapseButtonClassName:
        "text-emerald-50/70 hover:bg-white/10 hover:text-white",
      helperTextClassName: "text-emerald-50/60",
      linkClassName: "text-emerald-200 underline transition-colors hover:text-emerald-100",
      slider: {
        labelClassName: "text-emerald-50/80",
        trackClassName: "bg-white/10",
        destructiveColor: "#F87171",
        destructiveTrack: "rgba(248,113,113,0.28)",
        accumulationColor: "#34D399",
        accumulationTrack: "rgba(52,211,153,0.28)",
        addButtonClassName: "text-emerald-200 hover:text-white",
        removeButtonClassName: "text-emerald-50/60 hover:text-white",
      },
      chart: {
        mode: "dark",
        chartBg: "#061B12",
        panelBgClassName: "border-white/15 bg-[#082A1A]/80",
        panelBorderClassName: "border-white/15",
        mutedTextClassName: "text-emerald-50/60",
        strongTextClassName: "text-white",
        smarterStroke: "#D1FAE5",
        traditionalStroke: "#F8FAFC",
        traditionalArea: "#6B7F76",
        grid: "rgba(209,250,229,0.14)",
        xTick: "rgba(236,253,245,0.55)",
        yTick: "rgba(236,253,245,0.55)",
        cursor: "rgba(236,253,245,0.26)",
        lostStart: "#FCA5A5",
        lostEnd: "#B91C1C",
        lostFillEnd: "rgba(127,29,29,0.18)",
        keptStart: "#A7F3D0",
        keptEnd: "#064E3B",
      },
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
