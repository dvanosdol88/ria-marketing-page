"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { formatCurrencyFloored } from "@/lib/format";
import { useSavingsBar, type SavingsBarData } from "@/components/SavingsBarContext";

const COLLAPSE_SCROLL_Y = 132;
const EXPAND_SCROLL_Y = 82;

const ROUTE_LABELS: Record<string, string> = {
  "/upgrade-your-advice": "Upgrade Your Advice",
  "/improve-your-tools": "Improve Your Tools",
};

type LabelState =
  | { kind: "brand" | "route"; text: string }
  | { kind: "savings"; data: SavingsBarData };

function getRouteLabel(pathname: string): string | null {
  for (const [prefix, label] of Object.entries(ROUTE_LABELS)) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return label;
    }
  }
  return null;
}

export function ProgressiveStickyBar() {
  const pathname = usePathname();
  const { data: savingsData } = useSavingsBar();

  const [collapsed, setCollapsed] = useState(false);
  const [inSavingsSection, setInSavingsSection] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  /* Mirror SiteNav scroll-collapse so the bar tucks under the collapsed header. */
  useEffect(() => {
    let ticking = false;

    const update = () => {
      const y = window.scrollY;
      setCollapsed((prev) => (prev ? y > EXPAND_SCROLL_Y : y > COLLAPSE_SCROLL_Y));
      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Watch #calculator visibility on the home route. */
  useEffect(() => {
    observerRef.current?.disconnect();
    setInSavingsSection(false);

    if (pathname !== "/") return;

    const target = document.getElementById("calculator");
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInSavingsSection(entry.isIntersecting && entry.intersectionRatio > 0);
      },
      { threshold: [0, 0.1] }
    );
    observer.observe(target);
    observerRef.current = observer;

    return () => observer.disconnect();
  }, [pathname]);

  const routeLabel = getRouteLabel(pathname);

  const label: LabelState = (() => {
    if (routeLabel) return { kind: "route", text: routeLabel };
    if (pathname === "/" && inSavingsSection && savingsData) {
      return { kind: "savings", data: savingsData };
    }
    return { kind: "brand", text: "Smarter Way Wealth" };
  })();

  const desktopTop = collapsed ? 52 : 104;
  const mobileTop = collapsed ? 58 : 77;

  return (
    <>
      <div
        className="pointer-events-none fixed inset-x-0 z-40 hidden h-10 transition-[top] duration-500 ease-out md:block"
        style={{ top: desktopTop }}
        aria-hidden={label.kind !== "savings"}
      >
        <BarInner label={label} />
      </div>
      <div
        className="pointer-events-none fixed inset-x-0 z-40 h-10 transition-[top] duration-500 ease-out md:hidden"
        style={{ top: mobileTop }}
        aria-hidden={label.kind !== "savings"}
      >
        <BarInner label={label} />
      </div>
    </>
  );
}

function BarInner({ label }: { label: LabelState }) {
  return (
    <div className="relative h-full w-full border-b border-[#D5E0EA] bg-white/95 backdrop-blur shadow-[0_12px_34px_rgba(17,33,52,0.08)]">
      <div className="relative mx-auto flex h-full max-w-[1380px] items-center px-4 sm:px-6">
        <LabelBrand active={label.kind === "brand"} text={label.kind === "brand" ? label.text : "Smarter Way Wealth"} />
        <LabelRoute active={label.kind === "route"} text={label.kind === "route" ? label.text : undefined} />
        <LabelSavings active={label.kind === "savings"} data={label.kind === "savings" ? label.data : null} />
      </div>
    </div>
  );
}

function LabelBrand({ active, text }: { active: boolean; text: string }) {
  return (
    <span
      className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ease-out ${
        active ? "opacity-100" : "opacity-0"
      }`}
    >
      <span className="text-sm font-semibold tracking-[0.04em] text-[#062B43] sm:text-base">{text}</span>
    </span>
  );
}

function LabelRoute({ active, text }: { active: boolean; text?: string }) {
  return (
    <span
      className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ease-out ${
        active ? "opacity-100" : "opacity-0"
      }`}
    >
      <span className="text-sm font-semibold tracking-[0.04em] text-[#062B43] sm:text-base">{text ?? ""}</span>
    </span>
  );
}

function LabelSavings({ active, data }: { active: boolean; data: SavingsBarData | null }) {
  if (!data) {
    return (
      <span
        className={`absolute inset-0 transition-opacity duration-300 ease-out ${active ? "opacity-100" : "opacity-0"}`}
      />
    );
  }
  return (
    <span
      className={`absolute inset-0 flex items-center justify-between gap-3 px-4 transition-opacity duration-300 ease-out sm:px-6 ${
        active ? "opacity-100" : "opacity-0"
      }`}
    >
      <span className="inline-flex shrink-0 items-baseline gap-2 text-sm font-bold text-[#062B43]">
        <span className="text-[11px] uppercase tracking-[0.14em] text-[#52657A] sm:text-xs">Savings</span>
        <span className="text-lg leading-none text-[#108843] sm:text-2xl">{formatCurrencyFloored(data.savings)}</span>
      </span>
      <span className="flex min-w-0 flex-wrap items-center justify-end gap-1.5 text-[11px] text-[#41556C] sm:gap-2 sm:text-xs">
        <span className="rounded-full border border-[#D5E0EA] bg-[#F7FAFC] px-2 py-0.5 sm:px-3 sm:py-1">
          {data.years}
          <span className="hidden sm:inline"> years</span>
          <span className="sm:hidden"> yrs</span>
        </span>
        <span className="rounded-full border border-[#D5E0EA] bg-[#F7FAFC] px-2 py-0.5 sm:px-3 sm:py-1">
          {data.annualFeePercent.toFixed(2)}%<span className="hidden sm:inline"> asset-based</span> fee
        </span>
        <span className="rounded-full border border-[#BFE3CC] bg-[#F2FBF5] px-2 py-0.5 text-[#108843] sm:px-3 sm:py-1">
          $100/mo<span className="hidden sm:inline"> flat fee</span>
        </span>
      </span>
    </span>
  );
}
