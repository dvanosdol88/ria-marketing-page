"use client";

import Image from "next/image";
import Link from "next/link";

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

function SectionRail({ words }: { words: string[] }) {
  return (
    <div className="lg:sticky lg:top-28">
      <p className="text-[3.25rem] font-black leading-[0.9] tracking-tight text-[#062417] sm:text-[4.5rem] lg:text-[5rem]">
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
          <h1 className="mt-3 text-2xl font-black tracking-tight text-[#062417] sm:text-3xl">
            David J. Van Osdol
          </h1>
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

function ProofBento({ cards }: { cards: ProofCard[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {cards.map((card, index) => (
        <details
          key={card.title}
          className={[
            "group rounded-md border border-[#D5DEE8] bg-white p-5 shadow-sm transition-colors",
            index === 0 ? "md:col-span-2" : "",
            "open:border-[#108843] open:bg-[#F7FCF9]",
          ].join(" ")}
        >
          <summary className="cursor-pointer list-none">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#108843]">
                  {card.eyebrow}
                </p>
                <h2 className="mt-2 text-xl font-black tracking-tight text-[#062417] sm:text-2xl">
                  {card.title}
                </h2>
              </div>
              {card.logos ? (
                <span className="flex shrink-0 gap-2">
                  {card.logos.map((logo) => (
                    <span
                      key={logo.src}
                      className="relative flex h-14 w-14 items-center justify-center rounded-md border border-[#D5DEE8] bg-white p-2 sm:h-16 sm:w-16"
                    >
                      <Image
                        src={logo.src}
                        alt={logo.alt}
                        fill
                        className="object-contain p-2"
                        sizes="64px"
                      />
                    </span>
                  ))}
                </span>
              ) : null}
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
              <span className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#CBD8E4] text-lg font-bold text-[#213B56] transition group-open:rotate-45">
                +
              </span>
            </div>
          </summary>
          <div className="mt-5 border-t border-[#D5DEE8] pt-5">
            <ul className="space-y-3">
              {card.details.map((detail) => (
                <li key={detail} className="flex gap-3 text-sm leading-6 text-slate-700">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#108843]" />
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </details>
      ))}
    </div>
  );
}

function StorySection({
  id,
  rail,
  eyebrow,
  body,
  children,
}: {
  id: string;
  rail: string[];
  eyebrow: string;
  body: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="border-t border-[#DDE5EC] px-4 py-14 sm:px-6 sm:py-18 lg:py-24">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[340px_1fr] lg:gap-14">
        <SectionRail words={rail} />
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-[#108843]">
            {eyebrow}
          </p>
          <p className="mt-3 max-w-2xl text-lg leading-8 text-slate-700">{body}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </section>
  );
}

export default function UpgradeYourAdvicePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FinancialService",
    name: "Smarter Way Wealth",
    url: "https://smarterwaywealth.com/",
    founder: {
      "@type": "Person",
      name: "David J. Van Osdol",
      jobTitle: "CFA Charterholder, CFP Practitioner",
    },
  };

  return (
    <main className="bg-[#EEF0F5] text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <section className="px-4 pb-10 pt-12 sm:px-6 sm:pb-14 sm:pt-16">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-[#108843]">
              After the fee math
            </p>
            <p className="mt-4 text-3xl font-black leading-tight tracking-tight text-[#062417] sm:text-5xl">
              Lower cost matters. Better advice matters more.
            </p>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-700">
              This site keeps the story lightweight: see the cost difference, then understand why Smarter Way Wealth is built to upgrade the advice itself.
            </p>
          </div>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <a
              href="https://smarterwaywealth.com/"
              className="inline-flex items-center justify-center rounded-md bg-[#108843] px-5 py-3 text-sm font-extrabold !text-white no-underline shadow-sm transition hover:bg-[#0A6E35] hover:!text-white"
            >
              Visit Smarter Way Wealth
            </a>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-md border border-[#CBD8E4] bg-white px-5 py-3 text-sm font-extrabold !text-[#213B56] no-underline transition hover:bg-[#F6FAFC] hover:!text-[#213B56]"
            >
              Back to calculator
            </Link>
          </div>
        </div>
      </section>

      <StorySection
        id="upgrade-your-advice"
        rail={["Upgrade", "Your", "Advice"]}
        eyebrow="Advisor standard"
        body="If the calculator shows what percentage fees can cost, this section answers the next question: who is giving the advice, what standard governs it, and why is the model different?"
      >
        <div className="space-y-5">
          <AdvisorCard />
          <ProofBento cards={adviceCards} />
        </div>
      </StorySection>

      <StorySection
        id="improve-your-tools"
        rail={["Improve", "Your", "Tools"]}
        eyebrow="Planning depth"
        body="Better tools let you explore decisions without clicking away or starting from scratch. The goal is not more dashboards. It is clearer answers before you commit."
      >
        <ProofBento cards={toolCards} />
        <div className="mt-7 rounded-md border border-[#CBD8E4] bg-white p-5 sm:p-6">
          <p className="text-lg font-black tracking-tight text-[#062417]">
            The full planning experience lives at Smarter Way Wealth.
          </p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            YouArePayingTooMuch.com should stay fast and focused. SmarterWayWealth.com can carry the deeper service pages, consultation flow, and planning examples.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <a
              href="https://smarterwaywealth.com/"
              className="inline-flex items-center justify-center rounded-md bg-[#108843] px-5 py-3 text-sm font-extrabold !text-white no-underline transition hover:bg-[#0A6E35] hover:!text-white"
            >
              Continue to Smarter Way Wealth
            </a>
            <Link
              href="/improve-your-tools"
              className="inline-flex items-center justify-center rounded-md border border-[#CBD8E4] px-5 py-3 text-sm font-extrabold !text-[#213B56] no-underline transition hover:bg-[#F6FAFC] hover:!text-[#213B56]"
            >
              View the tools page
            </Link>
          </div>
        </div>
      </StorySection>

      <section className="px-4 pb-16 sm:px-6">
        <div className="mx-auto max-w-6xl border-t border-[#D5DEE8] pt-8">
          <p className="max-w-3xl text-xs leading-5 text-slate-500">
            CFA and Chartered Financial Analyst are registered trademarks owned by CFA Institute. CFP marks are owned by CFP Board. Credentials do not guarantee investment results.
          </p>
        </div>
      </section>
    </main>
  );
}
