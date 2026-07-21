"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, CalendarDays, ChevronDown, MapPin } from "lucide-react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { ScrollReveal } from "@/components/ScrollReveal";
import { fitCta } from "@/config/fitCtaConfig";
import {
  getStickyScrollTriggerY,
  resolveActiveSection,
  STICKY_BAR_OPACITY_MS,
  STICKY_SECTION_SPRING,
} from "@/config/stickyNavConfig";

type ProofCard = {
  title: string;
  eyebrow: string;
  summary: string | string[];
  summaryEmphasis?: boolean;
  details: string[];
  detailLink?: {
    href: string;
    label: string;
  };
  stat?: string;
  statLabel?: string;
  logos?: {
    src: string;
    alt: string;
  }[];
};

const adviceCards: ProofCard[] = [
  {
    eyebrow: "Credentials",
    title: "Highly Credentialed, Highly Experienced",
    summary: [
      "The rigor and investment expertise of a CFA Charterholder.",
      "The planning and process of a CFP® professional.",
      "20+ years of real advisory experience.",
    ],
    summaryEmphasis: true,
    stat: "20+",
    statLabel: "years experience",
    logos: [
      {
        src: "/cfa-charterholder-badge.png",
        alt: "CFA Charterholder badge",
      },
      {
        src: "/CFP_Logomark_Primary.png",
        alt: "CFP certification mark",
      },
    ],
    details: [
      "The rigor of a CFA Charterholder: investment analysis, portfolio construction, risk, ethics, and disciplined decision-making under uncertainty.",
      "The process of a CFP® professional: connecting investments to real-life planning, including retirement, taxes, estate, insurance, cash flow, and family tradeoffs.",
      "David's experience includes Morgan Stanley Smith Barney and Fidelity, plus the perspective that comes from seeing what large-firm advice can and cannot deliver.",
    ],
    detailLink: {
      href: "https://smarterwaywealth.com/",
      label: "Learn more about CFA and CFP® at smarterwaywealth.com",
    },
  },
  {
    eyebrow: "Standard",
    title: "100% Fiduciary",
    summary:
      "Advice should be built around your unique situation and goals, not a product shelf, sales quota, or asset-gathering incentive.",
    stat: "1",
    statLabel: "person we answer to: you",
    details: [
      "A fiduciary is someone who is legally and ethically required to act in your best interest.",
      "A flat monthly fee keeps the incentive structure clean: the firm is paid for advice, not for collecting a larger percentage of your portfolio.",
      "The practical question becomes simple: what would we recommend if we were not trying to sell a product or gather assets?",
    ],
  },
  {
    eyebrow: "Model",
    title: "Advice Without the Old Playbook",
    summary: [
      "No proprietary product agenda.",
      "No requirement that your assets move before the advice can start.",
      "See what it's like to get advice from an advisor who is truly independent.",
    ],
    stat: "$100",
    statLabel: "per month flat fee",
    details: [
      "Your accounts can stay where they are, which makes the relationship easier to inspect.",
      "The work starts with your goals, risks, tax situation, and family context instead of a standard allocation template.",
      "The point is not cheaper generic advice. It is better-aligned advice at a fee that does not punish portfolio growth.",
    ],
  },
];

const toolCards: ProofCard[] = [
  {
    eyebrow: "Timing matters",
    title: "Cash Flow Planning in Retirement",
    summary:
      "See how income, spending, taxes, and portfolio withdrawals interact before you make a major decision.",
    stat: "Flow",
    statLabel: "retirement income clarity",
    details: [
      "Map income sources, expenses, withdrawals, and tax drag across retirement years.",
      "Stress-test timing decisions so a plan is not built on one perfect market path.",
      "Use the plan as a living model, not a static PDF that goes stale after the meeting.",
    ],
  },
  {
    eyebrow: "Tax strategy",
    title: "Roth Conversions",
    summary:
      "Compare conversion windows, tax brackets, Medicare impacts, and legacy goals in one plan.",
    stat: "Roth",
    statLabel: "conversion analysis",
    details: [
      "Evaluate whether paying tax now may reduce lifetime taxes later.",
      "Coordinate conversions with Social Security, RMDs, charitable giving, and estate goals.",
      "Avoid treating Roth conversion advice as a yes/no rule. It is a year-by-year planning problem.",
    ],
  },
  {
    eyebrow: "Decisions",
    title: "Social Security and Medicare",
    summary:
      "Coordinate claiming, income, IRMAA exposure, and survivor planning instead of viewing each choice in isolation.",
    stat: "Age",
    statLabel: "timing matters",
    details: [
      "Compare claiming ages and survivor outcomes, especially for married couples.",
      "Model the Medicare premium effects of income decisions before they surprise you.",
      "Make the tradeoffs visible so the plan fits the household, not just the spreadsheet.",
    ],
  },
  {
    eyebrow: "Portfolio",
    title: "Tax-Aware Investment Strategy",
    summary:
      "We believe asset location is as important as asset allocation. Do you have the right assets in the right accounts? We have found many investors do not, and this is one more way we add value.",
    stat: "Fit",
    statLabel: "portfolio tied to plan",
    details: [
      "Look beyond the account-level return and ask what each account is supposed to do.",
      "Coordinate taxable, tax-deferred, and Roth assets with the spending plan.",
      "Keep the portfolio understandable enough that you can stay with it when markets get loud.",
    ],
  },
];

const proofSectionProgressItems = [
  { id: "upgrade-your-advice", label: "Upgrade" },
  { id: "improve-your-tools", label: "Improve" },
];

function getProofCardId(card: ProofCard) {
  return card.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function FitCtaDivider({
  eyebrow = "Next step",
  lead = "Ready to see whether this planning model fits your household?",
  support = "Bring your calculator result into a fuller conversation about goals, tax strategy, investment fit, and whether a flat monthly planning relationship makes sense.",
}: {
  eyebrow?: React.ReactNode;
  lead?: React.ReactNode;
  support?: React.ReactNode;
}) {
  return (
    <section className="w-full py-3 sm:py-4">
      <div
        className="fit-cta-band relative overflow-hidden"
        style={{
          background:
            "radial-gradient(circle at 18% 16%, rgba(255, 255, 255, 0.72), transparent 28%), radial-gradient(circle at 82% 0%, rgba(6, 75, 132, 0.12), transparent 32%), linear-gradient(115deg, rgba(248, 251, 252, 0.82) 0%, rgba(228, 236, 246, 0.52) 52%, rgba(255, 255, 255, 0.76) 100%)",
          borderBottom: "1px solid rgba(16, 35, 58, 0.1)",
          borderTop: "1px solid rgba(16, 35, 58, 0.08)",
        }}
      >
        <div className="relative z-10 mx-auto grid max-w-5xl gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] lg:items-center lg:gap-8 lg:px-8 lg:py-5">
          <div className="max-w-3xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#10233A]/70">
              {eyebrow}
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-[#10233A] sm:text-4xl">
              {lead}
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#10233A]/75 sm:text-base">
              {support}
            </p>
          </div>
          <div className="flex flex-col items-start gap-3 lg:items-stretch">
            <a
              href={fitCta.href}
              target="_blank"
              rel="noreferrer"
              className="fit-cta-action inline-flex min-h-14 w-full items-center justify-center rounded-md px-5 py-3 text-center text-base font-extrabold !text-white !no-underline shadow-[0_12px_28px_rgba(6,36,23,0.14)] transition-transform duration-200 ease-out hover:!text-white hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(6,36,23,0.22)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#10233A]/60 sm:w-auto sm:px-8 sm:text-lg lg:w-full"
              style={{
                background: "#064B84",
                border: "1px solid rgba(6, 75, 132, 0.92)",
                textDecoration: "none",
              }}
            >
              {fitCta.label}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProofSectionProgressCue() {
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState<string>("");

  useEffect(() => {
    let ticking = false;

    const update = () => {
      ticking = false;

      const triggerY = getStickyScrollTriggerY();
      const sectionIds = proofSectionProgressItems.map(({ id }) => id);
      setActiveSection(resolveActiveSection(sectionIds, triggerY, ""));
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("hashchange", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("hashchange", onScroll);
    };
  }, []);

  // On the home page the global SectionSegments bar is the sole mobile section
  // nav; suppress this cue there to avoid a colliding/redundant sticky header.
  if (pathname === "/") return null;

  return (
    <div
      className={`fixed inset-x-0 top-[58px] z-40 h-10 transition-opacity ease-out md:hidden ${
        activeSection ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      style={{ transitionDuration: `${STICKY_BAR_OPACITY_MS}ms` }}
      aria-hidden={!activeSection}
    >
      <div className="relative h-full w-full border-y border-[#D5E0EA] bg-white/95 shadow-[0_10px_28px_rgba(17,33,52,0.10)] backdrop-blur">
        <LayoutGroup id="proof-section-cue">
          <nav
            aria-label="Jump to advisor proof section"
            className="grid h-full shrink-0 grid-cols-2"
          >
            {proofSectionProgressItems.map((item) => {
              const isActive = item.id === activeSection;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  aria-current={isActive ? "location" : undefined}
                  className={`relative flex h-full items-center justify-center px-2.5 text-base font-bold leading-none !no-underline transition-colors ease-out focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#108843] ${
                    isActive ? "!text-white" : "!text-[#108843]"
                  }`}
                  style={{ transitionDuration: `${STICKY_BAR_OPACITY_MS}ms` }}
                >
                  {isActive ? (
                    <motion.span
                      layoutId="proof-section-cue-active"
                      className="absolute inset-0 bg-[#108843]"
                      transition={STICKY_SECTION_SPRING}
                    />
                  ) : null}
                  <span className="relative z-10">{item.label}</span>
                </a>
              );
            })}
          </nav>
        </LayoutGroup>
      </div>
    </div>
  );
}

function SectionRail({ words, sticky = true }: { words: string[]; sticky?: boolean }) {
  return (
    <div className={sticky ? "lg:sticky lg:top-36" : undefined}>
      <p className="text-[3.25rem] font-extrabold leading-[0.9] tracking-tight text-[#062417] sm:text-[4.5rem] lg:text-[4.75rem] xl:text-[5rem]">
        {words.map((word) => (
          <span key={word} className="block">
            {word}
          </span>
        ))}
      </p>
    </div>
  );
}

function AdvisorCard() {
  return (
    <aside className="overflow-hidden rounded-md border border-[#CBD8E4] bg-white shadow-[0_18px_44px_rgba(17,33,52,0.10)]">
      <div className="grid gap-0 sm:grid-cols-[190px_1fr]">
        <div className="relative min-h-[240px] bg-[#DDE8F0] sm:min-h-full">
          <Image
            src="/DVO Head Shot picture.jpg"
            alt="David J. Van Osdol"
            fill
            priority
            className="object-cover object-[50%_18%]"
            sizes="(max-width: 640px) 100vw, 190px"
          />
        </div>
        <div className="p-5 sm:p-6">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#108843]">
            Smarter Way Wealth
          </p>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-[#062417] sm:text-3xl">
            David J. Van Osdol, CFA, CFP®
          </h2>
          <p className="mt-[3px] text-base font-semibold text-[#213B56]">
            Founder
          </p>
          <p className="mt-4 max-w-xl text-sm leading-6 text-slate-600">
            Built for investors who want serious planning, better tools, and a flat monthly fee instead of asset-based fee drag. We make it easy!
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-full border border-[#CBD8E4] bg-[#F6FAFC] px-3 py-1 text-xs font-bold text-[#213B56]">
              20+ years experience
            </span>
            <span className="rounded-full border border-[#C9E8D3] bg-[#F1FBF5] px-3 py-1 text-xs font-bold text-[#108843]">
              Flat-fee fiduciary
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}

function ProofAccordionCard({
  card,
  index,
  isOpen,
  onToggle,
}: {
  card: ProofCard;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const cardId = getProofCardId(card);
  const panelId = `proof-panel-${cardId}`;
  const headerId = `proof-header-${cardId}`;

  return (
    <article
      className={[
        "self-start overflow-hidden rounded-lg border bg-white transition-[border-color,box-shadow] duration-300",
        isOpen
          ? "border-[#108843]/55 shadow-[0_18px_44px_rgba(17,33,52,0.10)]"
          : "border-[#D8E2EA] shadow-[0_12px_32px_rgba(17,33,52,0.06)] hover:border-[#C2D4E1] hover:shadow-[0_18px_44px_rgba(17,33,52,0.09)]",
        index === 0 ? "md:col-span-2" : "",
      ].join(" ")}
    >
      {/* The entire header row is the toggle target, not just the icon. */}
      <button
        type="button"
        id={headerId}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={onToggle}
        className="group/header flex w-full items-start justify-between gap-4 p-6 text-left transition-colors duration-200 hover:bg-[#F3F9F5] active:bg-[#E7F3EC] focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#108843]"
      >
        <span className="min-w-0">
          <span className="block text-xs font-extrabold uppercase tracking-[0.2em] text-[#108843]">
            {card.eyebrow}
          </span>
          <span className="mt-2 block text-xl font-black tracking-tight text-[#062417] sm:text-2xl">
            {card.title}
          </span>
        </span>
        <span
          className={`mt-0.5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md transition-colors duration-200 ${
            isOpen
              ? "bg-[#D8F0E0] text-[#0A6E35]"
              : "bg-[#EAF7EF] text-[#108843] group-hover/header:bg-[#D8F0E0]"
          }`}
        >
          <motion.span
            aria-hidden="true"
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="grid place-items-center"
          >
            <ChevronDown className="h-6 w-6" strokeWidth={2.5} />
          </motion.span>
        </span>
      </button>

      {/* Always-visible summary + stat/logos preserve the card's identity. */}
      <div className="px-6 pb-2">
        {Array.isArray(card.summary) ? (
          <div
            className={`space-y-3 text-slate-600 ${
              card.summaryEmphasis ? "text-lg leading-7" : "text-sm leading-6"
            }`}
          >
            {card.summary.map((sentence) => (
              <p key={sentence}>{sentence}</p>
            ))}
          </div>
        ) : (
          <p className="text-sm leading-6 text-slate-600">{card.summary}</p>
        )}
        <div className="relative mt-5 min-h-[108px] sm:min-h-[120px]">
          {card.stat ? (
            <div className="absolute bottom-0 left-0 z-10">
              <p className="text-3xl font-black tracking-tight text-[#108843]">{card.stat}</p>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                {card.statLabel}
              </p>
            </div>
          ) : null}
          {card.logos ? (
            <div className="absolute inset-x-0 bottom-0 flex justify-center gap-3 sm:gap-4" aria-hidden="true">
              {card.logos.map((logo) => {
                const isCfp = logo.src === "/CFP_Logomark_Primary.png";
                return (
                  <span
                    key={logo.src}
                    className={
                      isCfp
                        ? "relative block h-[108px] w-[108px] sm:h-[120px] sm:w-[120px]"
                        : "relative block h-[86px] w-[86px] sm:h-24 sm:w-24"
                    }
                  >
                    <Image
                      src={logo.src}
                      alt=""
                      fill
                      className="object-contain drop-shadow-[0_8px_16px_rgba(17,33,52,0.12)]"
                      sizes={isCfp ? "120px" : "96px"}
                    />
                  </span>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            key="panel"
            id={panelId}
            role="region"
            aria-labelledby={headerId}
            initial={reduceMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : {
                    height: { duration: 0.34, ease: [0.16, 1, 0.3, 1] },
                    opacity: { duration: 0.26, ease: "easeOut" },
                  }
            }
            className="overflow-hidden"
          >
            <div className="mx-6 mt-3 mb-6 rounded-md bg-[#F6FAFC] p-5">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#41556C]">
                Why this matters
              </p>
              <ul className="mt-4 space-y-3">
                {card.details.map((detail) => (
                  <li key={detail} className="flex gap-3 text-sm leading-6 text-slate-700">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#108843]" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
              {card.detailLink ? (
                <Link
                  href={card.detailLink.href}
                  className="mt-5 inline-flex text-sm font-extrabold leading-6 !text-[#108843] underline decoration-[#8BBE9E] decoration-2 underline-offset-4 transition hover:!text-[#062417]"
                >
                  {card.detailLink.label}
                </Link>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </article>
  );
}

function ProofBento({ cards }: { cards: ProofCard[] }) {
  const [openTitles, setOpenTitles] = useState<Set<string>>(() => new Set());

  const toggle = (title: string) => {
    setOpenTitles((prev) => {
      const next = new Set(prev);
      if (next.has(title)) {
        next.delete(title);
      } else {
        next.add(title);
      }
      return next;
    });
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 md:items-start">
      {cards.map((card, index) => (
        <ProofAccordionCard
          key={card.title}
          card={card}
          index={index}
          isOpen={openTitles.has(card.title)}
          onToggle={() => toggle(card.title)}
        />
      ))}
    </div>
  );
}

function StorySection({
  id,
  rail,
  children,
}: {
  id: string;
  rail?: string[];
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-40 border-t border-[#DDE5EC] px-4 py-16 sm:px-6 sm:py-20 lg:scroll-mt-36 lg:py-24">
      <ScrollReveal
        className={`mx-auto max-w-6xl gap-8 ${
          rail ? "grid lg:grid-cols-[340px_1fr] lg:gap-14" : ""
        }`}
      >
        {rail ? <SectionRail words={rail} /> : null}
        <div>{children}</div>
      </ScrollReveal>
    </section>
  );
}

function LowFrictionUpgradeSection() {
  const frictionPoints = [
    {
      lead: "Where",
      leadRest: "you are",
      title: "Keep your accounts where they are.",
      summary:
        "Schwab, Fidelity, Morgan Stanley, or multiple custodians - no need to transfer assets to another firm. We can advise you no matter where your assets are.",
      icon: MapPin,
    },
    {
      lead: "When",
      leadRest: "you can",
      title: "Meet when real life allows.",
      summary:
        "Virtual-first conversations, rotating Tuesday evenings, and one Saturday per month.",
      icon: CalendarDays,
    },
  ];

  return (
    <section
      id="upgrade-your-advice"
      aria-labelledby="low-friction-upgrade-title"
      className="scroll-mt-40 border-t border-[#DDE5EC] px-4 py-12 sm:px-6 sm:py-16 lg:scroll-mt-36 lg:py-20"
    >
      <ScrollReveal className="mx-auto flex max-w-6xl flex-col gap-8 lg:gap-10">
        <SectionRail words={["Upgrade", "Your", "Advice"]} sticky={false} />
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(248px,320px)] lg:items-stretch lg:gap-6">
        <div className="border border-[#CBD8E4] bg-white p-5 shadow-[0_18px_44px_rgba(17,33,52,0.08)] sm:p-7 lg:p-8">
          <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-[#108843]">
            Simplicity
          </p>
          <h2
            id="low-friction-upgrade-title"
            className="mt-3 max-w-2xl text-3xl font-black leading-tight tracking-normal text-[#062417] sm:text-4xl lg:text-5xl"
          >
            <span className="block">Better advice</span>
            <span className="block">should be easy.</span>
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            &ldquo;Always Add Value&rdquo; is our mantra. Convenience is just one of those ways.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {frictionPoints.map((point) => {
              const Icon = point.icon;
              return (
                <article
                  key={point.lead}
                  className="relative min-h-[188px] border border-[#D8E2EA] bg-[#F6FAFC] p-4 pr-16 sm:p-5 sm:pr-16"
                >
                  <div className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-md bg-[#EAF7EF] text-[#108843] sm:right-5 sm:top-5">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <p className="max-w-[13rem] whitespace-nowrap text-xl font-black leading-none tracking-normal text-[#062417] sm:text-2xl">
                    <span className="text-[#108843]">{point.lead}</span> {point.leadRest}
                  </p>
                  <h3 className="mt-5 text-xl font-black leading-tight tracking-normal text-[#064B84]">
                    {point.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{point.summary}</p>
                </article>
              );
            })}
          </div>
        </div>

        <a
          href={fitCta.href}
          target="_blank"
          rel="noreferrer"
          className="group flex min-h-[224px] flex-col justify-between bg-[#064B84] p-6 !text-white !no-underline shadow-[0_18px_44px_rgba(6,75,132,0.22)] transition-[background-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:bg-[#053E6D] hover:!text-white hover:shadow-[0_24px_58px_rgba(6,75,132,0.28)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#064B84] sm:min-h-[260px] lg:min-h-0"
        >
          <span className="flex items-center justify-between gap-4">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-white/12 text-white ring-1 ring-white/20">
              <ArrowUpRight
                className="h-6 w-6 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden="true"
              />
            </span>
            <span className="text-xl font-black leading-none tracking-normal text-white/88 sm:text-2xl">
              Next Steps
            </span>
          </span>
          <span>
            <span className="block text-balance text-3xl font-black leading-tight tracking-normal sm:text-4xl">
              See if Smarter Way Wealth is a good fit for you.
            </span>
            <span className="mt-4 block text-sm font-bold leading-6 text-white/82">
              Talk to David at Smarter Way Wealth.
            </span>
          </span>
        </a>
        </div>
      </ScrollReveal>
    </section>
  );
}

export function AdvisorProofSections() {
  return (
    <div className="bg-[#EEF0F5] text-slate-900">
      <ProofSectionProgressCue />
      <LowFrictionUpgradeSection />
      <StorySection id="advisor-proof">
        <div className="space-y-5">
          <AdvisorCard />
          <ProofBento cards={adviceCards} />
        </div>
      </StorySection>

      <StorySection id="improve-your-tools" rail={["Improve", "Your", "Tools"]}>
        <ProofBento cards={toolCards} />
      </StorySection>

      <FitCtaDivider
        eyebrow="Planning fit"
        lead="Ready to Learn More?"
        support="Smarter Way Wealth is built for households that want credentialed planning, better tools, and a fee model that does not grow just because the portfolio grows."
      />

      <section className="px-4 pb-16 sm:px-6">
        <div className="mx-auto max-w-6xl border-t border-[#D5DEE8] pt-8">
          <p className="max-w-3xl text-xs leading-5 text-slate-500">
            CFA and Chartered Financial Analyst are registered trademarks owned by CFA Institute. CFP marks are owned by CFP Board. Credentials do not guarantee investment results.
          </p>
        </div>
      </section>
    </div>
  );
}
