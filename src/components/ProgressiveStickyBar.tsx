"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { LayoutGroup, motion } from "framer-motion";
import { formatCompactCurrency, formatCurrencyFloored } from "@/lib/format";
import { useSavingsBar, type SavingsBarData } from "@/components/SavingsBarContext";
import {
  getStickyScrollTriggerY,
  getStickyStackHeight,
  isMobileViewport,
  MOBILE_STICKY_BAR_HEIGHT,
  resolveActiveSection,
  STICKY_BAR_HEIGHT,
  STICKY_BAR_OPACITY_MS,
  STICKY_SECTION_SPRING,
} from "@/config/stickyNavConfig";

const COLLAPSE_SCROLL_Y = 132;
const EXPAND_SCROLL_Y = 82;

const ROUTE_LABELS: Record<string, string> = {
  "/upgrade-your-advice": "Upgrade Your Advice",
  "/improve-your-tools": "Improve Your Tools",
};

const STICKY_SECTIONS = [
  { id: "calculator", label: "Save", href: "/" },
  { id: "upgrade-your-advice", label: "Upgrade", href: "/#upgrade-your-advice" },
  { id: "improve-your-tools", label: "Improve", href: "/#improve-your-tools" },
] as const;

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
  const hiddenForInternalTool =
    pathname.startsWith("/evals") ||
    pathname.startsWith("/calculator-evals") ||
    pathname.startsWith("/url-evals") ||
    pathname.startsWith("/gallery");
  const { data: savingsData } = useSavingsBar();

  /* Bar visibility + savings-section detection via a single scroll/resize handler.
     Same pattern the previous in-component sticky bar used (proven across desktop +
     mobile + iOS Safari). IntersectionObserver was producing inconsistent results
     on real mobile devices, so we switched back to direct getBoundingClientRect. */
  const [scrolledPastTop, setScrolledPastTop] = useState(false);
  const [inSavingsSection, setInSavingsSection] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("calculator");
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setDismissed(false);
  }, [pathname]);

  useEffect(() => {
    if (hiddenForInternalTool) {
      setScrolledPastTop(false);
      setInSavingsSection(false);
      return;
    }

    setInSavingsSection(false);

    let ticking = false;

    const update = () => {
      ticking = false;

      const y = window.scrollY;
      setScrolledPastTop((prev) => (prev ? y > EXPAND_SCROLL_Y : y > COLLAPSE_SCROLL_Y));

      if (pathname !== "/") return;
      const target = document.getElementById("savings-section");
      if (!target) {
        setInSavingsSection(false);
        return;
      }
      const rect = target.getBoundingClientRect();
      /* "Engaged" = the savings-section top has scrolled up past the nav/bar area
         AND its bottom is still meaningfully below it. Mirrors the old bar's
         logic so behavior is consistent with what shipped before. */
      const isMobile = isMobileViewport();
      const stickyBarHeight = isMobile ? MOBILE_STICKY_BAR_HEIGHT : STICKY_BAR_HEIGHT;
      const stackHeight = getStickyStackHeight(isMobile, stickyBarHeight);
      const triggerY = getStickyScrollTriggerY(isMobile, stickyBarHeight);
      const isEngaged = rect.top <= stackHeight && rect.bottom > stackHeight + 80;
      setInSavingsSection(isEngaged);

      const sectionIds = STICKY_SECTIONS.map(({ id }) => id);
      setActiveSection(resolveActiveSection(sectionIds, triggerY, "calculator"));
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [hiddenForInternalTool, pathname]);

  const routeLabel = getRouteLabel(pathname);

  const label: LabelState = (() => {
    if (routeLabel) return { kind: "route", text: routeLabel };
    if (pathname === "/" && inSavingsSection && savingsData) {
      return { kind: "savings", data: savingsData };
    }
    return { kind: "brand", text: "Smarter Way Wealth" };
  })();

  /* Desktop: only show the bar when it has the rich-chip "Savings" content.
     The brand / route-name fallbacks are kept in the label model for future use. */
  const desktopVisible = !dismissed && scrolledPastTop && label.kind === "savings";

  /* Mobile: once the reader is past the hero and the calculator has produced a
     savings figure, keep a persistent "Savings + section" bar visible across the
     whole homepage so it works as a you-are-here indicator. */
  const mobileVisible = !dismissed && scrolledPastTop && pathname === "/" && Boolean(savingsData);

  if (hiddenForInternalTool || dismissed) return null;

  return (
    <>
      {/* Desktop: tucks under collapsed SiteNav (52px). */}
      <div
        className={`fixed inset-x-0 top-[52px] z-40 hidden h-10 transition-opacity ease-out xl:block ${
          desktopVisible ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        style={{ transitionDuration: `${STICKY_BAR_OPACITY_MS}ms` }}
        aria-hidden={!desktopVisible}
      >
        <BarInner label={label} onDismiss={() => setDismissed(true)} />
      </div>
      {/* Mobile: tucks under collapsed SiteNav (58px). Savings + section nav. */}
      <div
        className={`fixed inset-x-0 top-[58px] z-40 h-[72px] transition-opacity ease-out xl:hidden ${
          mobileVisible ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        style={{ transitionDuration: `${STICKY_BAR_OPACITY_MS}ms` }}
        aria-hidden={!mobileVisible}
      >
        {savingsData ? (
          <MobileBar
            savings={savingsData.savings}
            activeSection={activeSection}
            onDismiss={() => setDismissed(true)}
          />
        ) : null}
      </div>
    </>
  );
}

function BarInner({ label, onDismiss }: { label: LabelState; onDismiss: () => void }) {
  return (
    <div className="relative h-full w-full border-b border-[#D5E0EA] bg-white/95 backdrop-blur shadow-[0_12px_34px_rgba(17,33,52,0.08)]">
      <div className="relative mx-auto flex h-full max-w-[1380px] items-center px-4 sm:px-6">
        <LabelBrand active={label.kind === "brand"} text={label.kind === "brand" ? label.text : "Smarter Way Wealth"} />
        <LabelRoute active={label.kind === "route"} text={label.kind === "route" ? label.text : undefined} />
        <LabelSavings active={label.kind === "savings"} data={label.kind === "savings" ? label.data : null} />
        {label.kind === "savings" ? <StickyCloseButton onDismiss={onDismiss} /> : null}
      </div>
    </div>
  );
}

function LabelBrand({ active, text }: { active: boolean; text: string }) {
  return (
    <span
      className={`absolute inset-0 flex items-center justify-center transition-opacity ease-out ${
        active ? "opacity-100" : "opacity-0"
      }`}
      style={{ transitionDuration: `${STICKY_BAR_OPACITY_MS}ms` }}
    >
      <span className="text-sm font-semibold tracking-[0.04em] text-[#062B43] sm:text-base">{text}</span>
    </span>
  );
}

function LabelRoute({ active, text }: { active: boolean; text?: string }) {
  return (
    <span
      className={`absolute inset-0 flex items-center justify-center transition-opacity ease-out ${
        active ? "opacity-100" : "opacity-0"
      }`}
      style={{ transitionDuration: `${STICKY_BAR_OPACITY_MS}ms` }}
    >
      <span className="text-sm font-semibold tracking-[0.04em] text-[#062B43] sm:text-base">{text ?? ""}</span>
    </span>
  );
}

function LabelSavings({ active, data }: { active: boolean; data: SavingsBarData | null }) {
  if (!data) {
    return (
      <span
        className={`absolute inset-0 transition-opacity ease-out ${active ? "opacity-100" : "opacity-0"}`}
        style={{ transitionDuration: `${STICKY_BAR_OPACITY_MS}ms` }}
      />
    );
  }
  return (
    <span
      className={`absolute inset-0 flex items-center justify-center gap-2 px-14 transition-opacity ease-out ${
        active ? "opacity-100" : "opacity-0"
      }`}
      style={{ transitionDuration: `${STICKY_BAR_OPACITY_MS}ms` }}
      data-sticky-potential-savings
    >
      <span className="inline-flex shrink-0 items-baseline gap-2 text-sm font-bold text-[#062B43]">
        <span className="text-[11px] uppercase tracking-[0.14em] text-[#52657A] sm:text-xs">
          Potential savings
        </span>
        <span className="text-lg leading-none text-[#108843] sm:text-2xl">
          {formatCurrencyFloored(data.savings)}
          <span aria-hidden="true">*</span>
        </span>
      </span>
      <span className="absolute right-4 hidden min-w-0 flex-wrap items-center justify-end gap-1.5 text-[11px] text-[#41556C] lg:flex lg:gap-2 lg:text-xs">
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

function StickyCloseButton({ onDismiss }: { onDismiss: () => void }) {
  return (
    <button
      type="button"
      onClick={onDismiss}
      aria-label="Close potential savings header"
      className="absolute left-2 top-1/2 z-10 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md border border-[#A8CDB5] bg-[#E8F5ED] text-[#075D2D] shadow-sm transition-[background-color,border-color,transform] duration-200 hover:scale-105 hover:border-[#76AE89] hover:bg-[#D8EEDF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#108843] sm:left-3"
    >
      <X className="h-5 w-5" strokeWidth={2.75} aria-hidden="true" />
    </button>
  );
}

/**
 * Mobile sticky bar keeps the live amount centered and gives the close action
 * equal visual priority at the far left. The existing section guide remains
 * directly beneath it so the refinement does not remove homepage navigation.
 */
function MobileBar({
  savings,
  activeSection,
  onDismiss,
}: {
  savings: number;
  activeSection: string;
  onDismiss: () => void;
}) {
  return (
    <div className="relative h-full w-full border-b border-[#D5E0EA] bg-white/95 backdrop-blur shadow-[0_12px_34px_rgba(17,33,52,0.08)]">
      <div className="relative mx-auto flex h-10 max-w-[1380px] items-center justify-center px-12">
        <StickyCloseButton onDismiss={onDismiss} />
        <span
          className="inline-flex shrink-0 items-baseline gap-1.5"
          aria-label={`Potential savings ${formatCompactCurrency(savings)}`}
          data-sticky-potential-savings
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#52657A]">
            Potential savings
          </span>
          <span className="text-base font-bold leading-none text-[#108843]">
            {formatCompactCurrency(savings)}
            <span aria-hidden="true">*</span>
          </span>
        </span>
      </div>
      <SectionSegments activeSection={activeSection} />
    </div>
  );
}

function SectionSegments({ activeSection }: { activeSection: string }) {
  const knownActive = STICKY_SECTIONS.some((section) => section.id === activeSection)
    ? activeSection
    : "calculator";

  return (
    <LayoutGroup id="sticky-section-segments">
      <nav
        aria-label="Jump to homepage section"
        className="grid h-8 grid-cols-3 border-t border-[#DCE6ED]"
      >
        {STICKY_SECTIONS.map((section) => {
          const active = knownActive === section.id;
          return (
            <Link
              key={section.id}
              href={section.href as never}
              aria-current={active ? "page" : undefined}
              className={`relative flex h-full items-center justify-center px-2 text-sm font-bold leading-none !no-underline transition-colors ease-out focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#108843] ${
                active ? "!text-white" : "!text-[#108843]"
              }`}
              style={{ transitionDuration: `${STICKY_BAR_OPACITY_MS}ms` }}
            >
              {active ? (
                <motion.span
                  layoutId="sticky-section-active"
                  className="absolute inset-0 bg-[#108843]"
                  transition={STICKY_SECTION_SPRING}
                />
              ) : null}
              <span className="relative z-10">{section.label}</span>
            </Link>
          );
        })}
      </nav>
    </LayoutGroup>
  );
}
