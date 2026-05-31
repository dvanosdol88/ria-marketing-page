import Image from "next/image";
import { ArrowUpRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { homeTopBanners, type HomeTopBannerId } from "@/config/homeTopBanners";
import { formatCurrency } from "@/lib/format";

type HomeTopBannerProps = {
  bannerId: HomeTopBannerId;
  savings: number;
  years: number;
};

const toneStyles = {
  founder: {
    shell: "bg-[#062B43] text-white",
    accent: "text-[#6FCF76]",
    imageRing: "ring-[#6FCF76]/45",
    metric: "bg-white/[0.07]",
  },
  qr: {
    shell: "bg-[#0A3A31] text-white",
    accent: "text-[#6FCF76]",
    imageRing: "ring-[#6FCF76]/40",
    metric: "bg-white/[0.08]",
  },
  standard: {
    shell: "bg-[#073522] text-white",
    accent: "text-[#9BE7A0]",
    imageRing: "ring-[#9BE7A0]/35",
    metric: "bg-white/[0.07]",
  },
};

export function HomeTopBanner({ bannerId, savings, years }: HomeTopBannerProps) {
  const banner = homeTopBanners[bannerId];
  const tone = toneStyles[banner.tone];

  return (
    <div className="section-shell relative z-10 pt-6 sm:pt-8">
      <section
        aria-label={`${banner.label} banner`}
        className={`relative overflow-hidden rounded-md border border-white/10 ${tone.shell} shadow-[0_18px_42px_rgba(17,33,52,0.10)]`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_13%_14%,rgba(111,207,118,0.24),transparent_26%),linear-gradient(110deg,rgba(255,255,255,0.08),transparent_45%)]" />
        <div className="relative grid gap-4 px-5 py-5 sm:gap-6 sm:px-7 lg:grid-cols-[minmax(0,0.92fr)_minmax(300px,0.48fr)] lg:items-center lg:px-8 lg:py-6">
          <div className="flex items-start gap-4 sm:items-center">
            <div className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-full ring-2 sm:h-20 sm:w-20 ${tone.imageRing}`}>
              <Image
                src="/DVO Head Shot picture.jpg"
                alt="David J. Van Osdol"
                fill
                priority
                sizes="(max-width: 640px) 64px, 80px"
                className="object-cover"
              />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.18em] ${tone.accent}`}>
                  <ShieldCheck className="h-4 w-4" />
                  {banner.eyebrow}
                </span>
              </div>
              <h1 className="mt-2 max-w-4xl text-[clamp(1.55rem,7vw,3.15rem)] font-bold leading-[0.96] tracking-normal">
                {banner.headline}
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-white/82 sm:mt-3 sm:text-lg sm:leading-7">
                {banner.body}
              </p>
              <div className="mt-4 hidden flex-wrap gap-3 text-sm font-semibold text-white/82 sm:flex">
                {banner.proofPoints.map((point) => (
                  <span key={point} className="inline-flex items-center gap-2">
                    <CheckCircle2 className={`h-4 w-4 ${tone.accent}`} />
                    {point}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
            <div className={`rounded-md border border-white/10 ${tone.metric} px-4 py-3`}>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/62">
                Your current projected fee drag
              </p>
              <p className={`mt-1 text-[clamp(1.6rem,7vw,3.2rem)] font-extrabold leading-none ${tone.accent}`}>
                {formatCurrency(savings)}
                <span aria-hidden="true">*</span>
              </p>
              <p className="mt-1 text-sm font-semibold text-white/78">over {years} years</p>
            </div>

            <a
              href={banner.ctaHref}
              className="group flex min-h-[76px] items-center justify-between gap-3 rounded-md bg-[#108843] px-4 py-3 text-sm font-bold !text-white no-underline transition hover:bg-[#0B7639] sm:gap-4 sm:text-base"
            >
              <span>
                <span className="hidden text-xs uppercase tracking-[0.16em] text-white/72 sm:block">
                  {banner.statLabel}: {banner.statValue}
                </span>
                <span className="mt-1 hidden sm:block">{banner.ctaLabel}</span>
                <span className="block sm:hidden">{banner.mobileCtaLabel}</span>
              </span>
              <ArrowUpRight className="h-5 w-5 shrink-0 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
