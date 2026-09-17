import type { CalculatorAccentTheme, HomeCalculatorTheme } from "@/config/homeMarketingVariants";
import { SMARTER_WAY_WEALTH_MEET_URL } from "@/config/campaignLinks";

/**
 * One Percent Blues — the blue front door to the fee calculator, served on
 * onepercentblues.com. Spec: docs/superpowers/specs/2026-09-17-one-percent-
 * blues-design.md. Every visible string on the page lives here so the copy
 * has one source and the source-lock test (tests/blues-source-locks.mjs) has
 * one file to read.
 */

export const BLUES_HOST = "onepercentblues.com";
export const BLUES_ORIGIN = `https://${BLUES_HOST}`;

export const bluesCopy = {
  wordmark: { lead: "One Percent", tail: "Blues" },
  headerTag: "3-question check · 1 min",
  eyebrow: "A free check from a flat-fee fiduciary",
  headline: { lead: "Got the", emphasis: "1% Blues?" },
  sub: "Three quick questions. No email, no login. Then we show you the number and the cure.",
  diagnosisEyebrow: "Diagnosis",
  tiles: [
    { label: "Symptom", body: "A fee that grows with your balance and rarely shows up as a line item." },
    {
      label: "Treatment",
      body: "$100 a month. Period. Real human fiduciary advice from a CFA charterholder and CFP® professional.",
    },
    { label: "Next step", body: "Meet David for 15 minutes on video. Nothing to prepare." },
  ],
  primaryCta: { label: "Get the cure — meet David", href: SMARTER_WAY_WEALTH_MEET_URL },
  secondaryCta: { label: "Run it on my numbers first", href: "#calculator" },
  /** The site's receipt language for the figure (tests/share-receipt-language.test.mjs). */
  numberLabel: "Estimated advisory-fee difference",
  calculatorHeading: "Your numbers, not ours.",
  calculatorSub: "Every assumption is yours to change. The math is public and takes about a minute.",
  footerLine: "Smarter Way Wealth, LLC · Connecticut-registered investment adviser · CRD #342140",
  metaTitle: "Got the 1% Blues? | One Percent Blues",
  metaDescription:
    "Three yes/no questions, then the number: what a 1% advisory fee can cost over 20 years versus $100 a month. From Smarter Way Wealth, a flat-fee fiduciary.",
} as const;

export type BluesQuestionId = "q1" | "q2" | "q3";
export type BluesAnswer = "yes" | "no";
export type BluesAnswers = Record<BluesQuestionId, BluesAnswer | null>;

export const bluesCheckQuestions: ReadonlyArray<{
  id: BluesQuestionId;
  prompt: string;
  yesLabel: string;
  noLabel: string;
}> = [
  {
    id: "q1",
    prompt: "Do you pay a percentage of your portfolio for advice?",
    yesLabel: "Yes",
    noLabel: "No / not sure",
  },
  {
    id: "q2",
    prompt: "Do you know what you paid last year, in dollars?",
    yesLabel: "Yes",
    noLabel: "No",
  },
  {
    id: "q3",
    prompt: "Did the amount you actually pay go up?",
    yesLabel: "Yes",
    noLabel: "No / not sure",
  },
];

export const EMPTY_BLUES_ANSWERS: BluesAnswers = { q1: null, q2: null, q3: null };

/** The three answers as a URL value — `?check=yny` is q1 yes, q2 no, q3 yes —
 *  so a link can carry a completed check and the diagnosis card renders in
 *  the server HTML for that link (CLAUDE.md agent-readiness: tool state in
 *  the URL). Anything that is not exactly three of y/n leaves the check
 *  unanswered. */
export function parseBluesAnswers(value: string | null | undefined): BluesAnswers {
  if (!value || !/^[yn]{3}$/i.test(value)) return EMPTY_BLUES_ANSWERS;
  const [q1, q2, q3] = value.toLowerCase().split("") as Array<"y" | "n">;
  const toAnswer = (letter: "y" | "n"): BluesAnswer => (letter === "y" ? "yes" : "no");
  return { q1: toAnswer(q1), q2: toAnswer(q2), q3: toAnswer(q3) };
}

export type BluesDiagnosisKey = "full" | "mild" | "unsure";

/** Null until all three questions are answered. */
export function diagnoseBlues(answers: BluesAnswers): BluesDiagnosisKey | null {
  if (!answers.q1 || !answers.q2 || !answers.q3) return null;
  if (answers.q1 === "no") return "unsure";
  if (answers.q2 === "no" || answers.q3 === "yes") return "full";
  return "mild";
}

export const bluesDiagnoses: Record<BluesDiagnosisKey, { heading: string; lead: string }> = {
  full: {
    heading: "Yep. That's the 1% Blues.",
    lead: "A percentage fee that grows with your balance and rarely shows up as a line item. Here is what it can add up to.",
  },
  mild: {
    heading: "A mild case. Still a case.",
    lead: "You can see the fee. It still compounds against you every year.",
  },
  unsure: {
    heading: "No percentage fee, or not sure?",
    lead: "If nobody takes a percentage of your portfolio, this is the number you are avoiding. If you are not sure, check one statement: asset-based fees rarely show up as a line item.",
  },
};

/** Cross-domain doors from the blue page. Plain absolute links, never
 *  next/link: on onepercentblues.com every green route redirects to the green
 *  domain, and a client-side prefetch of a redirecting route fails CORS on
 *  every page view. The UTM tags keep the campaign visible in PostHog once
 *  the visitor lands on the green site. */
export const bluesLinks = {
  signup:
    "https://youarepayingtoomuch.com/become-a-client?utm_source=onepercentblues&utm_medium=referral&utm_campaign=one_percent_blues",
  ourMath: "https://youarepayingtoomuch.com/our-math",
} as const;

const bluesAccent: CalculatorAccentTheme = {
  hex: "#2563EB",
  textClassName: "text-[#1D4ED8]",
  strongTextClassName: "text-[#1E3A8A]",
  borderClassName: "border-[#2563EB]",
  tileClassName: "bg-[#EAF0FF]",
  tileHoverClassName: "hover:bg-[#DCE6FF]",
  tileGroupHoverClassName: "group-hover:bg-[#DCE6FF]",
  tileAltClassName: "bg-[#E3ECFF]",
  rowHoverClassName: "hover:bg-[#F3F6FF]",
  linkHoverClassName: "hover:text-[#1E40AF]",
  focusOutlineClassName: "focus-visible:outline-[#2563EB]",
  focusRingClassName: "focus-visible:ring-[#2563EB]/35",
  focusWithinBorderClassName: "focus-within:border-[#2563EB]",
  focusWithinOutlineClassName: "focus-within:outline-[#2563EB]",
  focusWithinRingClassName: "focus-within:ring-[#2563EB]/20",
};

/** The calculator's four stepper controls (portfolio, years, growth, fee)
 *  sit in a white card on the blue page and were getting lost (David,
 *  2026-09-17). Blue outline, pale-blue fill and blue +/- so they read as
 *  the thing to touch. Green site keeps its own defaults. */
export const bluesControlClasses = {
  frameClassName:
    "rounded-md border-[1.5px] border-[#2563EB] bg-[#EEF3FF] shadow-[0_1px_0_rgba(37,99,235,0.18)] focus-within:border-[#1E3A8A] focus-within:ring-2 focus-within:ring-[#2563EB]/30",
  buttonClassName:
    "text-[#1D4ED8] transition hover:bg-[#DCE6FF] disabled:cursor-not-allowed disabled:text-[#A8B5C2] disabled:hover:bg-transparent",
  dividerClassName: "border-[#C7D7FF]",
} as const;

/** Same shape as the green variants' `calculator` theme, blue values. The
 *  section and backdrop are transparent so the page gradient shows through
 *  and the white calculator card floats on it, as in the approved mock. */
export const bluesCalculatorTheme: HomeCalculatorTheme = {
  sectionClassName: "bg-transparent text-slate-950",
  backdropClassName: "bg-transparent",
  eyebrowClassName: "text-[#BFDBFE]",
  titleClassName: "text-white",
  amountClassName: "text-[#1E3A8A]",
  bodyClassName: "text-white/90",
  shareButtonClassName:
    "border border-white/40 bg-white/10 px-4 text-sm font-semibold text-white backdrop-blur hover:bg-white/20",
  disclaimerClassName: "text-white/70",
  frameClassName:
    "overflow-hidden rounded-[20px] border border-white/60 bg-white shadow-[0_18px_40px_rgba(11,26,68,0.22)]",
  chartFrameClassName: "bg-white",
  controlsClassName:
    "border-t border-[#DFE6EE] bg-white px-4 pb-4 pt-2 sm:px-6 sm:pb-6 sm:pt-3 lg:px-8 lg:pb-8 lg:pt-4",
  collapseButtonClassName: "text-slate-500 hover:bg-slate-50",
  helperTextClassName: "text-white/80",
  linkClassName: "text-white underline transition-colors hover:text-[#BFDBFE]",
  accent: bluesAccent,
  slider: {
    labelClassName: "text-[#213B56]",
    trackClassName: "bg-[#DCE4EB]",
    destructiveColor: "#1E3A8A",
    destructiveTrack: "#BFD3FF",
    accumulationColor: "#2563EB",
    accumulationTrack: "#C7DBFF",
    addButtonClassName: "text-[#1D4ED8] hover:text-[#1E3A8A]",
    removeButtonClassName: "text-slate-500 hover:text-slate-700",
  },
  chart: {
    mode: "light",
    chartBg: "#FFFFFF",
    panelBgClassName: "border-[#DFE6EE] bg-white",
    panelBorderClassName: "border-[#DFE6EE]",
    mutedTextClassName: "text-[#52657A]",
    strongTextClassName: "text-[#10233A]",
    smarterStroke: "#2563EB",
    traditionalStroke: "#1E3A8A",
    traditionalArea: "#BFD3FF",
    grid: "#DCE4EB",
    xTick: "#52657A",
    yTick: "#52657A",
    cursor: "#DCE4EB",
    lostStart: "#60A5FA",
    lostEnd: "#60A5FA",
    lostFillEnd: "#DBEAFE",
    keptStart: "#1E3A8A",
    keptEnd: "#1E3A8A",
  },
};

/* The firm is the same entity the green site declares, under the same @id, so
   an agent that reads both sites merges them; it is declared here in full
   because a bare @id reference with no node in the document dangles. */
const FIRM_ENTITY_ID = "https://youarepayingtoomuch.com/#smarter-way-wealth";
const CALCULATOR_ENTITY_ID = `${BLUES_ORIGIN}/#fee-calculator`;

/** Declared once, on the blue layout — one declaration per concept per site
 *  (CLAUDE.md agent-readiness). The blue host is a single page, so this is
 *  also the only place it appears. */
export const bluesJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "FinancialService",
    "@id": FIRM_ENTITY_ID,
    name: "Smarter Way Wealth, LLC",
    url: "https://smarterwaywealth.com/",
    description:
      "Connecticut-registered investment adviser offering credentialed fiduciary planning for a flat monthly fee.",
    identifier: "CRD #342140",
    sameAs: ["https://adviserinfo.sec.gov/firm/summary/342140"],
    founder: {
      "@type": "Person",
      name: "David J. Van Osdol",
      jobTitle: "Founder",
      honorificSuffix: "CFA, CFP",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${BLUES_ORIGIN}/#website`,
    name: "One Percent Blues",
    url: `${BLUES_ORIGIN}/`,
    about: { "@id": FIRM_ENTITY_ID },
  },
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "@id": CALCULATOR_ENTITY_ID,
    name: "Investment Fee Calculator",
    url: `${BLUES_ORIGIN}/`,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    sameAs: ["https://youarepayingtoomuch.com/"],
    about: { "@id": FIRM_ENTITY_ID },
  },
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${BLUES_ORIGIN}/#page`,
    url: `${BLUES_ORIGIN}/`,
    name: bluesCopy.metaTitle,
    description: bluesCopy.metaDescription,
    isPartOf: { "@id": `${BLUES_ORIGIN}/#website` },
    about: { "@id": FIRM_ENTITY_ID },
    mainEntity: { "@id": CALCULATOR_ENTITY_ID },
  },
];
