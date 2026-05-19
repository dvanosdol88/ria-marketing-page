"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Maximize2, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { ScrollReveal } from "@/components/ScrollReveal";
import { fitCta } from "@/config/fitCtaConfig";

type ProofCard = {
  title: string;
  eyebrow: string;
  summary: string;
  details: string[];
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
    summary:
      "CFA investment rigor, CFP planning discipline, and 20+ years of real advisory experience.",
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
      "CFA Charterholders are trained in investment analysis, portfolio construction, risk, ethics, and disciplined decision-making under uncertainty.",
      "CFP professionals are trained to connect investments to real-life planning: retirement, taxes, estate, insurance, cash flow, and family tradeoffs.",
      "David's experience includes Morgan Stanley Smith Barney and Fidelity, plus the perspective that comes from seeing what large-firm advice can and cannot deliver.",
    ],
  },
  {
    eyebrow: "Standard",
    title: "100% Fiduciary",
    summary:
      "Advice should be built around your interests, not a product shelf, sales quota, or asset-gathering incentive.",
    stat: "1",
    statLabel: "person we answer to: you",
    details: [
      "A fiduciary standard means the advice process is constrained by your best interest.",
      "A flat monthly fee keeps the incentive structure clean: the firm is paid for advice, not for collecting a larger percentage of your portfolio.",
      "The practical question becomes simple: what would we recommend if we were not trying to sell a product or gather assets?",
    ],
  },
  {
    eyebrow: "Model",
    title: "Advice Without the Old Playbook",
    summary:
      "No proprietary product agenda. No requirement that your assets move before the advice can start.",
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
    eyebrow: "Planning",
    title: "Cash Flow Planning",
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
      "Tie the portfolio to the plan: location, withdrawal sequencing, rebalancing, and risk capacity.",
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
  secondary,
}: {
  eyebrow?: string;
  lead?: string;
  support?: string;
  secondary?: React.ReactNode;
}) {
  return (
    <section className="w-full py-6 sm:py-8">
      <div
        className="fit-cta-band relative overflow-hidden"
        style={{
          background:
            "radial-gradient(circle at 18% 16%, rgba(255, 255, 255, 0.72), transparent 28%), radial-gradient(circle at 82% 0%, rgba(16, 136, 67, 0.12), transparent 32%), linear-gradient(115deg, rgba(248, 251, 252, 0.82) 0%, rgba(228, 246, 235, 0.52) 52%, rgba(255, 255, 255, 0.76) 100%)",
          borderBottom: "1px solid rgba(16, 35, 58, 0.1)",
          borderTop: "1px solid rgba(16, 35, 58, 0.08)",
        }}
      >
        <div className="section-shell relative z-10 flex flex-col gap-5 py-7">
          <div className="max-w-4xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#10233A]/70">
              {eyebrow}
            </p>
            <h2 className="mt-2 max-w-3xl text-3xl font-black tracking-tight text-[#10233A] sm:text-4xl">
              {lead}
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#10233A]/75 sm:text-base">
              {support}
            </p>
          </div>
          <div className="flex flex-col items-stretch gap-3">
            <a
              href={fitCta.href}
              className="fit-cta-action inline-flex min-h-14 w-full items-center justify-center rounded-md px-5 py-3 text-center text-base font-extrabold !text-[#10233A] no-underline shadow-[0_12px_28px_rgba(6,36,23,0.10)] transition hover:!text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#10233A]/60 sm:text-lg"
              style={{
                background: "rgba(255, 255, 255, 0.58)",
                border: "1px solid rgba(16, 35, 58, 0.16)",
              }}
            >
              {fitCta.label}
            </a>
            {secondary ? (
              <div className="text-center text-sm font-bold text-[#10233A]/70 lg:text-right">{secondary}</div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProofSectionProgressCue() {
  const [activeSection, setActiveSection] = useState<string>("");

  useEffect(() => {
    let ticking = false;

    const update = () => {
      ticking = false;

      const triggerY = 116;
      const nextActive =
        proofSectionProgressItems.find(({ id }) => {
          const element = document.getElementById(id);
          if (!element) return false;
          const rect = element.getBoundingClientRect();
          return rect.top <= triggerY && rect.bottom > triggerY;
        })?.id ?? "";

      setActiveSection(nextActive);
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

  const activeIndex = proofSectionProgressItems.findIndex((item) => item.id === activeSection);
  const progressWidth =
    activeIndex >= 0 ? `${((activeIndex + 1) / proofSectionProgressItems.length) * 100}%` : "0%";

  return (
    <div
      className={`fixed inset-x-0 top-[58px] z-40 border-y border-[#D5E0EA] bg-white/95 px-3 py-2 shadow-[0_10px_28px_rgba(17,33,52,0.10)] backdrop-blur transition-all duration-300 ease-out md:hidden ${
        activeSection ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"
      }`}
      aria-hidden={!activeSection}
    >
      <div className="mx-auto max-w-md">
        <div className="flex items-center gap-2">
          {proofSectionProgressItems.map((item, index) => {
            const isActive = item.id === activeSection;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`flex min-h-8 flex-1 items-center justify-center rounded-full px-3 text-xs font-extrabold no-underline transition-[background-color,color,font-weight] duration-300 ${
                  isActive
                    ? "bg-[#108843] !text-white"
                    : "bg-[#EEF3F7] !text-[#41556C] hover:bg-[#E1EAF1] hover:!text-[#213B56]"
                }`}
                aria-current={isActive ? "location" : undefined}
              >
                <span className="mr-1.5 text-[10px] opacity-70">{index + 1}</span>
                {item.label}
              </a>
            );
          })}
        </div>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-[#E1EAF1]">
          <div
            className="h-full rounded-full bg-[#108843] transition-[width] duration-500 ease-out"
            style={{ width: progressWidth }}
          />
        </div>
      </div>
    </div>
  );
}

function SectionRail({ words }: { words: string[] }) {
  return (
    <div className="lg:sticky lg:top-36">
      <p className="text-[3.25rem] font-black leading-[0.9] tracking-tight text-[#062417] sm:text-[4.5rem] lg:text-[4.75rem] xl:text-[5rem]">
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
            David J. Van Osdol
          </h2>
          <p className="mt-2 text-base font-semibold text-[#213B56]">
            CFA Charterholder, CFP Practitioner
          </p>
          <p className="mt-4 max-w-xl text-sm leading-6 text-slate-600">
            Built for investors who want serious planning, better tools, and a flat monthly fee instead of asset-based fee drag.
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

function ProofExpandButton({
  cardTitle,
  isOpen,
  onClick,
}: {
  cardTitle: string;
  isOpen?: boolean;
  onClick: () => void;
}) {
  const Icon = isOpen ? X : Maximize2;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#EAF7EF] text-[#108843] transition-colors duration-300 hover:bg-[#D8F0E0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#108843]/35"
      aria-label={isOpen ? `Close ${cardTitle}` : `Expand ${cardTitle}`}
    >
      <motion.span
        aria-hidden="true"
        animate={{ rotate: isOpen ? 90 : 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="grid place-items-center"
      >
        <Icon className="h-[18px] w-[18px]" strokeWidth={2.25} />
      </motion.span>
    </motion.button>
  );
}

function ProofDetailDialog({
  card,
  onClose,
}: {
  card: ProofCard;
  onClose: () => void;
}) {
  const cardId = getProofCardId(card);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#10233A]/18 px-4 py-20 backdrop-blur-sm sm:px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClose}
    >
      <motion.article
        role="dialog"
        aria-modal="true"
        aria-labelledby={`proof-dialog-title-${cardId}`}
        className="relative w-full max-w-5xl overflow-hidden rounded-lg border border-[#D5DEE8] bg-white p-6 shadow-[0_24px_80px_rgba(17,33,52,0.24)] sm:p-8 lg:p-10"
        initial={{ y: 18, scale: 0.97 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 12, scale: 0.98 }}
        transition={{ duration: 0.72, ease: [0.165, 0.84, 0.44, 1] }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
          <ProofExpandButton cardTitle={card.title} isOpen onClick={onClose} />
        </div>

        <div className="grid gap-8 pr-12 lg:grid-cols-[1fr_0.85fr] lg:gap-12 lg:pr-16">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#108843]">
              {card.eyebrow}
            </p>
            <h3
              id={`proof-dialog-title-${cardId}`}
              className="mt-4 max-w-2xl text-3xl font-black leading-tight tracking-tight text-[#062417] sm:text-4xl"
            >
              {card.title}
            </h3>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              {card.summary}
            </p>
            {card.stat ? (
              <div className="mt-8">
                <p className="text-5xl font-black tracking-tight text-[#108843]">{card.stat}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  {card.statLabel}
                </p>
              </div>
            ) : null}
            {card.logos ? (
              <div className="mt-8 flex items-center gap-7" aria-label="Credential marks">
                {card.logos.map((logo) => (
                  <div key={logo.src} className="relative h-24 w-24 sm:h-28 sm:w-28">
                    <Image
                      src={logo.src}
                      alt={logo.alt}
                      fill
                      className="object-contain drop-shadow-[0_12px_22px_rgba(17,33,52,0.14)]"
                      sizes="112px"
                    />
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="rounded-md bg-[#F6FAFC] p-5 sm:p-6">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#41556C]">
              Why this matters
            </p>
            <ul className="mt-5 space-y-4">
              {card.details.map((detail) => (
                <li key={detail} className="flex gap-3 text-sm leading-6 text-slate-700">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#108843]" />
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.article>
    </motion.div>
  );
}

function ProofBento({ cards }: { cards: ProofCard[] }) {
  const [activeCardTitle, setActiveCardTitle] = useState<string | null>(null);
  const activeCard = cards.find((card) => card.title === activeCardTitle) ?? null;

  useEffect(() => {
    if (!activeCard) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveCardTitle(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeCard]);

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 md:items-start">
        {cards.map((card, index) => {
          return (
            <motion.article
              key={card.title}
              whileHover={{ y: -3, scale: 1.004 }}
              transition={{ duration: 0.8, ease: [0.165, 0.84, 0.44, 1] }}
              className={[
                "self-start rounded-lg border border-[#D8E2EA] bg-white p-6 shadow-[0_12px_32px_rgba(17,33,52,0.06)] transition-[border-color,box-shadow] duration-300 hover:border-[#C2D4E1] hover:shadow-[0_18px_44px_rgba(17,33,52,0.09)]",
                index === 0 ? "md:col-span-2" : "",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#108843]">
                    {card.eyebrow}
                  </p>
                  <h3 className="mt-2 text-xl font-black tracking-tight text-[#062417] sm:text-2xl">
                    {card.title}
                  </h3>
                </div>
                <ProofExpandButton
                  cardTitle={card.title}
                  onClick={() => setActiveCardTitle(card.title)}
                />
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">{card.summary}</p>
              <div className="mt-5 flex items-end justify-between gap-4">
                {card.stat ? (
                  <div>
                    <p className="text-3xl font-black tracking-tight text-[#108843]">{card.stat}</p>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                      {card.statLabel}
                    </p>
                  </div>
                ) : null}
                {card.logos ? (
                  <div className="ml-auto flex shrink-0 items-center gap-5 sm:gap-6" aria-hidden="true">
                    {card.logos.map((logo) => (
                      <span key={logo.src} className="relative block h-[72px] w-[72px] sm:h-20 sm:w-20">
                        <Image
                          src={logo.src}
                          alt=""
                          fill
                          className="object-contain drop-shadow-[0_8px_16px_rgba(17,33,52,0.12)]"
                          sizes="80px"
                        />
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </motion.article>
          );
        })}
      </div>

      <AnimatePresence>
        {activeCard ? (
          <ProofDetailDialog
            key={activeCard.title}
            card={activeCard}
            onClose={() => setActiveCardTitle(null)}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}

function StorySection({
  id,
  rail,
  children,
}: {
  id: string;
  rail: string[];
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-40 border-t border-[#DDE5EC] px-4 py-16 sm:px-6 sm:py-20 lg:scroll-mt-36 lg:py-24">
      <ScrollReveal className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[340px_1fr] lg:gap-14">
        <SectionRail words={rail} />
        <div>{children}</div>
      </ScrollReveal>
    </section>
  );
}

export function AdvisorProofSections() {
  return (
    <div className="bg-[#EEF0F5] text-slate-900">
      <ProofSectionProgressCue />
      <StorySection id="upgrade-your-advice" rail={["Upgrade", "Your", "Advice"]}>
        <div className="space-y-5">
          <AdvisorCard />
          <ProofBento cards={adviceCards} />
        </div>
      </StorySection>

      <FitCtaDivider
        eyebrow="Advisor fit"
        lead="The right advice model should feel clear before you hire anyone."
      />

      <StorySection id="improve-your-tools" rail={["Improve", "Your", "Tools"]}>
        <ProofBento cards={toolCards} />
      </StorySection>

      <FitCtaDivider
        eyebrow="Planning fit"
        lead="Ready to turn the fee result into a real planning conversation?"
        support="Smarter Way Wealth is built for households that want credentialed planning, better tools, and a fee model that does not grow just because the portfolio grows."
        secondary={
          <>
            <Link
              href="/improve-your-tools"
              className="!text-[#31506D] underline decoration-[#8BBE9E] underline-offset-4 transition hover:!text-[#062417]"
            >
              View the tools page
            </Link>
          </>
        }
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
