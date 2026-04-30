"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowDown, Calculator, CheckCircle2, Share2 } from "lucide-react";
import { HomeMarketingVariant } from "@/config/homeMarketingVariants";
import { formatCurrency } from "@/lib/format";

type HomeMarketingHeroProps = {
  variant: HomeMarketingVariant;
  savings: number;
  portfolioValue: number;
  years: number;
  onShare: () => void;
  shareButtonLabel: string;
};

function HeroBackdrop({ variant }: { variant: HomeMarketingVariant }) {
  if (variant.layout === "receipt") {
    return (
      <div className="absolute inset-0 overflow-hidden bg-[#F7F8FA]">
        <div className="absolute inset-y-0 right-0 w-[70%] bg-[linear-gradient(115deg,transparent_0%,transparent_31%,rgba(0,122,47,0.08)_31%,rgba(0,122,47,0.08)_44%,transparent_44%,transparent_100%)]" />
        <div className="absolute bottom-0 right-[-8%] h-[74%] w-[70%] rotate-[-8deg] border-l border-t border-slate-300/70 bg-white/60" />
        <div className="absolute bottom-16 right-0 h-28 w-[62%] rounded-l-full bg-red-100/80 blur-3xl" />
        <div className="absolute right-[8%] top-20 hidden h-[390px] w-[390px] rounded-full border border-slate-200/70 md:block" />
      </div>
    );
  }

  const isAdvisor = variant.layout === "advisor";

  return (
    <div className="absolute inset-0 overflow-hidden bg-slate-950">
      {variant.image && (
        <Image
          src={variant.image.src}
          alt={variant.image.alt}
          fill
          priority
          sizes="100vw"
          className={`object-cover ${isAdvisor ? "opacity-60" : "opacity-100"}`}
          style={{ objectPosition: variant.image.position }}
        />
      )}
      <div
        className={
          isAdvisor
            ? "absolute inset-0 bg-[linear-gradient(90deg,rgba(2,21,13,0.96)_0%,rgba(3,37,21,0.82)_45%,rgba(3,37,21,0.48)_74%,rgba(3,37,21,0.35)_100%)]"
            : "absolute inset-0 bg-[linear-gradient(90deg,rgba(247,248,250,0.98)_0%,rgba(247,248,250,0.9)_34%,rgba(247,248,250,0.42)_62%,rgba(247,248,250,0.05)_100%)]"
        }
      />
      {!isAdvisor && (
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#EEF0F5] to-transparent" />
      )}
    </div>
  );
}

function ReceiptVisual({ savings, portfolioValue, years }: { savings: number; portfolioValue: number; years: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.18, duration: 0.55, ease: "easeOut" }}
      className="hidden md:block"
      aria-hidden="true"
    >
      <div className="relative h-[430px] w-[430px]">
        <div className="absolute left-4 top-12 h-[300px] w-[300px] rounded-full border border-slate-300/80" />
        <div className="absolute right-0 top-0 w-[340px] border-l border-slate-300 bg-white/70 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Fee receipt</p>
          <p className="mt-8 text-5xl font-semibold tracking-normal text-slate-950">{formatCurrency(savings)}</p>
          <p className="mt-2 text-sm text-slate-600">Projected gap over {years} years</p>
          <div className="mt-8 space-y-4 text-sm">
            <div className="flex justify-between border-b border-slate-200 pb-3">
              <span className="text-slate-500">Starting value</span>
              <span className="font-semibold text-slate-900">{formatCurrency(portfolioValue)}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-3">
              <span className="text-slate-500">Flat fee</span>
              <span className="font-semibold text-[#007A2F]">$100/mo</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Traditional fee</span>
              <span className="font-semibold text-red-700">asset-based</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function HomeMarketingHero({
  variant,
  savings,
  portfolioValue,
  years,
  onShare,
  shareButtonLabel,
}: HomeMarketingHeroProps) {
  const isDarkHero = variant.layout === "advisor";
  const isPhotoHero = variant.layout === "photo";
  const textColor = isDarkHero ? "text-white" : "text-slate-950";
  const mutedColor = isDarkHero ? "text-emerald-50/80" : "text-slate-700";
  const eyebrowColor = isDarkHero ? "text-emerald-200" : isPhotoHero ? "text-[#00682B]" : "text-red-700";

  return (
    <section className="relative w-full overflow-hidden">
      <HeroBackdrop variant={variant} />
      <div className="relative mx-auto grid min-h-[calc(100svh-170px)] w-full max-w-7xl items-center gap-8 px-4 py-9 sm:px-6 md:min-h-[calc(100svh-150px)] md:grid-cols-[minmax(0,1fr)_minmax(320px,0.82fr)] md:py-16 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="max-w-2xl"
        >
          <p className={`text-sm font-bold uppercase tracking-[0.2em] ${eyebrowColor}`}>{variant.eyebrow}</p>
          <h1 className={`mt-4 max-w-[13ch] text-[clamp(2.35rem,10vw,6.4rem)] font-semibold leading-[0.92] tracking-normal ${textColor}`}>
            {variant.headline} <span className={isDarkHero ? "text-emerald-300" : "text-[#007A2F]"}>{variant.highlight}</span>
          </h1>
          <p className={`mt-5 max-w-xl text-base leading-6 sm:text-xl sm:leading-7 ${mutedColor}`}>{variant.body}</p>

          <div className="mt-7 flex flex-col gap-3 min-[420px]:flex-row">
            <a
              href="#calculator"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#007A2F] px-5 text-sm font-bold !text-white no-underline shadow-lg shadow-emerald-900/15 transition hover:bg-[#00682B] hover:!text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00A540]"
            >
              <Calculator className="h-4 w-4" />
              {variant.primaryCta}
              <ArrowDown className="h-4 w-4" />
            </a>
            <button
              type="button"
              onClick={onShare}
              className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border px-5 text-sm font-bold transition ${
                isDarkHero
                  ? "border-white/25 bg-white/10 text-white hover:bg-white/20"
                  : "border-slate-300 bg-white/80 text-slate-800 hover:bg-white"
              }`}
            >
              <Share2 className="h-4 w-4" />
              {shareButtonLabel === "Share your result" ? variant.secondaryCta : shareButtonLabel}
            </button>
          </div>

          <div className={`mt-6 grid gap-1.5 text-sm sm:grid-cols-3 ${isDarkHero ? "text-emerald-50/90" : "text-slate-700"}`}>
            {variant.proofPoints.map((point) => (
              <div key={point} className="flex items-center gap-2">
                <CheckCircle2 className={`h-4 w-4 shrink-0 ${isDarkHero ? "text-emerald-300" : "text-[#007A2F]"}`} />
                <span>{point}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="relative hidden items-end justify-end md:flex">
          {variant.layout === "receipt" ? (
            <ReceiptVisual savings={savings} portfolioValue={portfolioValue} years={years} />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16, duration: 0.55, ease: "easeOut" }}
              className={`w-full max-w-sm ${isDarkHero ? "text-white" : "text-slate-950"}`}
              aria-label={`${variant.resultLabel}: ${formatCurrency(savings)}`}
            >
              <div className={`border-l pl-5 ${isDarkHero ? "border-emerald-300/70" : "border-[#007A2F]"}`}>
                <p className={`text-xs font-bold uppercase tracking-[0.18em] ${isDarkHero ? "text-emerald-200" : "text-slate-600"}`}>
                  {variant.resultLabel}
                </p>
                <p className="mt-3 text-5xl font-semibold tracking-normal">{formatCurrency(savings)}</p>
                <p className={`mt-2 text-sm ${isDarkHero ? "text-emerald-50/80" : "text-slate-600"}`}>
                  Based on the current calculator assumptions.
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
