"use client";

import { useId, useMemo, useState } from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { formatCurrencyFloored } from "@/lib/format";

type PromiseKey = "upgrade" | "improve" | "save";

type PremiumPromisePreviewProps = {
  savings: number;
};

const PROMISES: Array<{
  key: PromiseKey;
  label: string;
  overlay: [string, string, string];
}> = [
  { key: "save", label: "Save", overlay: ["Save", "A", "Ton"] },
  { key: "upgrade", label: "Upgrade", overlay: ["Upgrade", "Your", "Advice"] },
  { key: "improve", label: "Improve", overlay: ["Improve", "Your", "Tools"] },
];

const SMARTER_WAY_WEALTH_URL = "https://smarterwaywealth.com/";
const UPGRADE_VIDEO_URL = "https://smarterwaywealth.com/upgrade";

export function PremiumPromisePreview({ savings }: PremiumPromisePreviewProps) {
  const [activeKey, setActiveKey] = useState<PromiseKey>("upgrade");
  const baseId = useId();
  const reduceMotion = useReducedMotion();
  const activePromise = PROMISES.find((item) => item.key === activeKey) ?? PROMISES[0];
  const activeIndex = Math.max(
    PROMISES.findIndex((item) => item.key === activeKey),
    0
  );
  const projectedSavings = useMemo(() => formatCurrencyFloored(savings), [savings]);

  return (
    <motion.section
      className="relative -mx-4 mt-24 w-[calc(100%+2rem)] overflow-hidden text-left sm:mx-0 sm:mt-32 sm:w-auto sm:overflow-visible lg:mx-auto lg:mt-36 lg:max-w-5xl xl:max-w-[1040px]"
      aria-label="Upgrade, improve, and save preview"
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.22 }}
      transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="overflow-hidden bg-white shadow-[0_18px_55px_rgba(16,35,58,0.16)] sm:rounded-lg">
        <div
          className="relative grid h-12 grid-cols-3 border-b border-[#D7E0E8] bg-white/95 backdrop-blur"
          role="tablist"
          aria-label="Promise preview categories"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 left-0 z-0 h-[3px] w-1/3 bg-[#007A2F] transition-transform duration-300 ease-out"
            style={{ transform: `translateX(${activeIndex * 100}%)` }}
          />
          {PROMISES.map((item) => {
            const selected = item.key === activeKey;
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
                className={`relative z-10 flex h-12 items-center justify-center px-3 text-sm font-semibold transition focus-visible:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#007A2F] sm:text-base ${
                  selected ? "text-[#061421]" : "text-[#667587] hover:bg-[#F6F9FB]/72 hover:text-[#061421]"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div
          id={`${baseId}-${activeKey}-panel`}
          role="tabpanel"
          aria-labelledby={`${baseId}-${activeKey}-tab`}
          className="relative min-h-[520px] overflow-hidden bg-[#EDF2F5] sm:min-h-[560px] lg:min-h-[540px]"
        >
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={activeKey}
              className="absolute inset-0"
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
            >
              {activeKey === "upgrade" ? (
                <UpgradeVideoPanel />
              ) : activeKey === "improve" ? (
                <ImproveToolsPanel />
              ) : (
                <SaveProofPanel projectedSavings={projectedSavings} />
              )}

              <div className="pointer-events-none absolute inset-y-0 left-0 w-[78%] bg-gradient-to-r from-white/88 via-white/56 to-transparent sm:w-[58%]" />
              <OverlayHeadline lines={activePromise.overlay} />

              {activeKey === "upgrade" ? (
                <PanelLink href={UPGRADE_VIDEO_URL} label="View the entire video" align="right" />
              ) : (
                <PanelLink href={SMARTER_WAY_WEALTH_URL} label="Learn more at smarterwaywealth.com" />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.section>
  );
}

function OverlayHeadline({ lines }: { lines: [string, string, string] }) {
  return (
    <h2 className="pointer-events-none absolute left-4 top-14 z-10 text-[clamp(3.25rem,14vw,5.75rem)] font-black uppercase leading-[0.88] tracking-normal text-black sm:left-8 sm:top-20 sm:text-[clamp(4.5rem,8.2vw,7rem)]">
      {lines.map((line) => (
        <span key={line} className="block">
          {line}
        </span>
      ))}
    </h2>
  );
}

function UpgradeVideoPanel() {
  return (
    <div className="absolute inset-0 bg-[#0A1520]">
      <video
        className="h-full w-full object-cover object-[72%_center] sm:object-[66%_center]"
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
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/58 via-black/16 to-transparent" />
    </div>
  );
}

function PanelLink({
  href,
  label,
  align = "left",
}: {
  href: string;
  label: string;
  align?: "left" | "right";
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`absolute bottom-5 z-20 inline-flex max-w-[calc(100%-2rem)] items-center gap-2 bg-transparent text-sm font-bold !text-[#00A540] !no-underline drop-shadow-[0_2px_6px_rgba(255,255,255,0.9)] transition hover:!text-[#008435] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#00A540] sm:bottom-7 sm:max-w-[calc(100%-4rem)] sm:text-base ${
        align === "right" ? "right-4 text-right sm:right-8" : "left-4 sm:left-8"
      }`}
    >
      {label}
      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
    </a>
  );
}

function ImproveToolsPanel() {
  return (
    <div className="absolute inset-0 bg-[#F3F7F9]">
      <div className="absolute inset-x-4 bottom-6 top-44 overflow-hidden rounded-md border border-[#D7E0E8] bg-white shadow-[0_24px_60px_rgba(16,35,58,0.16)] sm:inset-x-10 sm:bottom-10 sm:top-24">
        <Image
          src="/assets/rightcapital/cashflow-waterfall.gif"
          alt="Planning software cash flow waterfall view"
          fill
          unoptimized
          className="object-contain"
          sizes="(max-width: 640px) 100vw, 960px"
        />
      </div>
    </div>
  );
}

function SaveProofPanel({ projectedSavings }: { projectedSavings: string }) {
  return (
    <div className="absolute inset-0 bg-[#F8FAFC]">
      <div className="absolute inset-x-5 bottom-8 top-48 rounded-md border border-[#D7E0E8] bg-white/92 p-4 shadow-[0_24px_60px_rgba(16,35,58,0.14)] sm:inset-x-10 sm:bottom-10 sm:top-32 sm:p-8">
        <p className="text-right text-[clamp(2.5rem,8vw,6.25rem)] font-black leading-none tracking-normal text-[#007A2F]">
          {projectedSavings}
          <span aria-hidden="true">*</span>
        </p>
        <svg viewBox="0 0 740 320" role="img" aria-label="Chart showing the fee gap widening over time" className="mt-4 h-[58%] w-full sm:mt-6">
          <defs>
            <linearGradient id="saveGapPreview" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#14B254" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#14B254" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <path d="M44 254 C 170 226, 282 168, 392 116 C 512 60, 604 42, 696 30" fill="none" stroke="#007A2F" strokeWidth="10" strokeLinecap="round" />
          <path d="M44 254 C 170 226, 282 168, 392 116 C 512 60, 604 42, 696 30 L 696 280 L 44 280 Z" fill="url(#saveGapPreview)" />
          <path d="M44 254 C 184 242, 294 218, 408 190 C 525 161, 608 139, 696 125" fill="none" stroke="#064B84" strokeWidth="9" strokeLinecap="round" strokeDasharray="16 18" />
          <line x1="44" x2="696" y1="280" y2="280" stroke="#D7E0E8" strokeWidth="3" />
          <circle cx="696" cy="30" r="11" fill="#007A2F" />
          <circle cx="696" cy="125" r="11" fill="#064B84" />
          <text x="44" y="310" fill="#667587" fontSize="24" fontWeight="800">Today</text>
          <text x="604" y="310" fill="#667587" fontSize="24" fontWeight="800">Later</text>
        </svg>
      </div>
    </div>
  );
}
