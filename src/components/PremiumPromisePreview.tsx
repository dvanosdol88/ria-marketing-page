"use client";

import { useId, useMemo, useState } from "react";
import Image from "next/image";
import { ArrowUpRight, BadgeDollarSign, LineChart, Sparkles } from "lucide-react";
import { formatCurrencyFloored } from "@/lib/format";

type PromiseKey = "upgrade" | "improve" | "save";

type PremiumPromisePreviewProps = {
  savings: number;
};

const PROMISES: Array<{
  key: PromiseKey;
  label: string;
  eyebrow: string;
  headline: string;
  body: string;
}> = [
  {
    key: "upgrade",
    label: "Upgrade",
    eyebrow: "Your advice",
    headline: "Upgrade your advice.",
    body: "A credentialed fiduciary conversation should feel personal, direct, and useful.",
  },
  {
    key: "improve",
    label: "Improve",
    eyebrow: "Your tools",
    headline: "Improve your tools.",
    body: "Better planning software turns abstract tradeoffs into decisions you can actually see.",
  },
  {
    key: "save",
    label: "Save",
    eyebrow: "Your cost",
    headline: "Save a ton.",
    body: "The flat-fee model keeps more of the long-term result in your plan.",
  },
];

const ICONS: Record<PromiseKey, typeof Sparkles> = {
  upgrade: Sparkles,
  improve: LineChart,
  save: BadgeDollarSign,
};

export function PremiumPromisePreview({ savings }: PremiumPromisePreviewProps) {
  const [activeKey, setActiveKey] = useState<PromiseKey>("upgrade");
  const baseId = useId();
  const activePromise = PROMISES.find((item) => item.key === activeKey) ?? PROMISES[0];
  const projectedSavings = useMemo(() => formatCurrencyFloored(savings), [savings]);

  return (
    <section
      className="relative left-1/2 mt-10 w-screen -translate-x-1/2 overflow-hidden text-left sm:left-auto sm:mt-14 sm:w-auto sm:translate-x-0 sm:overflow-visible"
      aria-label="Upgrade, improve, and save preview"
    >
      <div className="bg-[#091521] text-white shadow-[0_24px_70px_rgba(9,21,33,0.25)] sm:rounded-lg">
        <div className="grid overflow-hidden sm:rounded-lg lg:min-h-[500px] lg:grid-cols-[0.92fr_1.08fr]">
          <div className="flex flex-col justify-between border-b border-white/10 bg-[#0C1C2B] px-4 py-4 sm:px-6 sm:py-7 lg:border-b-0 lg:border-r">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7ADCA6]">
                See the promise
              </p>
              <h2 className="mt-2 max-w-sm text-3xl font-semibold leading-tight tracking-normal sm:mt-3 sm:text-4xl">
                Upgrade. Improve. Save.
              </h2>
              <p className="mt-3 hidden max-w-sm text-sm leading-6 text-slate-300 sm:block sm:text-base">
                One model, three reasons this message should drive the next step to Smarter Way Wealth.
              </p>
            </div>

            <div
              className="mt-4 grid grid-cols-3 gap-1 rounded-lg border border-white/10 bg-white/5 p-1 sm:mt-6"
              role="tablist"
              aria-label="Promise preview categories"
            >
              {PROMISES.map((item) => {
                const selected = item.key === activeKey;
                const Icon = ICONS[item.key];
                const tabId = `${baseId}-${item.key}-tab`;
                const panelId = `${baseId}-${item.key}-panel`;

                return (
                  <button
                    key={item.key}
                    type="button"
                    id={tabId}
                    role="tab"
                    aria-controls={panelId}
                    aria-selected={selected}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => setActiveKey(item.key)}
                    onFocus={() => setActiveKey(item.key)}
                    onMouseEnter={() => setActiveKey(item.key)}
                    className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-md px-2 py-2 text-center text-[13px] font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7ADCA6] sm:min-h-14 ${
                      selected
                        ? "bg-white text-[#091521] shadow-[0_10px_25px_rgba(0,0,0,0.18)]"
                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 hidden rounded-md border border-white/10 bg-white/[0.04] p-4 sm:block">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#B0EBC8]">
                {activePromise.eyebrow}
              </p>
              <p className="mt-2 text-2xl font-semibold leading-tight tracking-normal text-white">
                {activePromise.headline}
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-300">{activePromise.body}</p>
            </div>
          </div>

          <div
            id={`${baseId}-${activeKey}-panel`}
            role="tabpanel"
            aria-labelledby={`${baseId}-${activeKey}-tab`}
            className="relative min-h-[310px] overflow-hidden bg-[#F8FAFC] text-[#10233A] sm:min-h-[430px] lg:min-h-full"
          >
            {activeKey === "upgrade" ? (
              <UpgradeVideoPanel />
            ) : activeKey === "improve" ? (
              <ImproveToolsPanel />
            ) : (
              <SaveProofPanel projectedSavings={projectedSavings} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function UpgradeVideoPanel() {
  return (
    <div className="relative h-full min-h-[310px] bg-[#0A1520] sm:min-h-[430px]">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/assets/promise-preview/upgrade-poster.png"
        aria-label="Placeholder video of David explaining the Smarter Way Wealth advice model"
      >
        <source src="/assets/promise-preview/upgrade-placeholder.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-t from-[#07111B]/82 via-[#07111B]/20 to-transparent" />
      <a
        href="https://smarterwaywealth.com/upgrade"
        target="_blank"
        rel="noreferrer"
        className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-md bg-white px-4 py-3 text-sm font-bold text-[#091521] no-underline shadow-[0_16px_35px_rgba(0,0,0,0.25)] transition hover:bg-[#EEFBF3] hover:text-[#00682B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:bottom-6 sm:left-6"
      >
        View the entire video
        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
      </a>
    </div>
  );
}

function ImproveToolsPanel() {
  return (
    <div className="flex h-full min-h-[310px] flex-col bg-[#EEF4F7] p-3 sm:min-h-[430px] sm:p-5">
      <div className="relative flex-1 overflow-hidden rounded-md border border-[#C7D4DF] bg-white">
        <Image
          src="/assets/rightcapital/cashflow-waterfall.gif"
          alt="Planning software cash flow waterfall view"
          fill
          unoptimized
          className="object-contain"
          sizes="(max-width: 640px) 100vw, 640px"
        />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px] font-bold uppercase tracking-[0.12em] text-[#52657A] sm:text-xs">
        <span className="rounded-md border border-[#D7E0E8] bg-white px-2 py-2">Plan</span>
        <span className="rounded-md border border-[#D7E0E8] bg-white px-2 py-2">Stress test</span>
        <span className="rounded-md border border-[#D7E0E8] bg-white px-2 py-2">Decide</span>
      </div>
    </div>
  );
}

function SaveProofPanel({ projectedSavings }: { projectedSavings: string }) {
  return (
    <div className="flex h-full min-h-[310px] flex-col justify-center bg-[#F8FAFC] px-5 py-8 sm:min-h-[430px] sm:px-8">
      <div className="mx-auto w-full max-w-xl">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#007A2F]">
          Projected fee gap
        </p>
        <p className="mt-2 text-4xl font-bold tracking-normal text-[#062B43] sm:text-6xl">
          {projectedSavings}
        </p>
        <div className="mt-7 h-52 rounded-md border border-[#D7E0E8] bg-white p-4 shadow-[0_20px_45px_rgba(16,35,58,0.09)]">
          <svg viewBox="0 0 520 210" role="img" aria-label="Chart showing the fee gap widening over time" className="h-full w-full">
            <defs>
              <linearGradient id="saveGap" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#14B254" stopOpacity="0.26" />
                <stop offset="100%" stopColor="#14B254" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            <path d="M35 168 C 135 151, 202 118, 285 84 C 366 51, 430 39, 485 27" fill="none" stroke="#007A2F" strokeWidth="7" strokeLinecap="round" />
            <path d="M35 168 C 135 151, 202 118, 285 84 C 366 51, 430 39, 485 27 L 485 180 L 35 180 Z" fill="url(#saveGap)" />
            <path d="M35 168 C 142 160, 214 141, 292 121 C 382 98, 431 86, 485 78" fill="none" stroke="#064B84" strokeWidth="6" strokeLinecap="round" strokeDasharray="10 12" />
            <line x1="35" x2="485" y1="180" y2="180" stroke="#D7E0E8" strokeWidth="2" />
            <text x="34" y="199" fill="#667587" fontSize="18" fontWeight="700">Today</text>
            <text x="405" y="199" fill="#667587" fontSize="18" fontWeight="700">Later</text>
            <circle cx="485" cy="27" r="8" fill="#007A2F" />
            <circle cx="485" cy="78" r="8" fill="#064B84" />
          </svg>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-[#42556C]">
          <span className="rounded-md bg-[#EEFBF3] px-3 py-2 text-[#00682B]">Flat monthly fee</span>
          <span className="rounded-md bg-[#EAF1F8] px-3 py-2 text-[#064B84]">Asset-based fee drag</span>
        </div>
      </div>
    </div>
  );
}
