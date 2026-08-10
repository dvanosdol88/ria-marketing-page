"use client";

import { useState, useEffect, useCallback, useRef, type MouseEvent as ReactMouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, Menu, X } from "lucide-react";
import { siteNavLinks } from "@/config/siteNavConfig";
import {
  DESKTOP_SITE_NAV_MEDIA_QUERY,
  getSiteNavScrollTriggerY,
  isMobileViewport,
  MOBILE_STICKY_BAR_HEIGHT,
  resolveActiveSection,
  STICKY_BAR_HEIGHT,
} from "@/config/stickyNavConfig";

const COLLAPSE_SCROLL_Y = 158;
const EXPAND_SCROLL_Y = 104;
const SMARTER_WAY_WEALTH_URL = "https://smarterwaywealth.com/";
const FEE_CALCULATOR_HREF = "/#calculator";

/**
 * Site-wide navigation bar — "Authority" style with collapsing behavior.
 *
 * Two states driven by scroll position:
 *   Initial (scrollY ≤ 100): Full-height bar, full logo with wordmark, no shadow.
 *   Collapsed (scrollY > 100): Compact bar (~52px desktop, 48px mobile),
 *     icon-only logo (ascending green bars), light shadow.
 *
 * Logo swap uses an opacity cross-fade — both logo elements are always in the
 * DOM (grid-stacked) to avoid layout shifts.
 *
 * Mobile: hamburger + centered logo + future CTA slot.
 * Desktop: logo left + spaced nav links right.
 * Drawer uses CSS transitions (always in DOM) for reliability.
 */
export function SiteNav() {
  const pathname = usePathname();
  const hiddenForInternalTool =
    pathname.startsWith("/evals") ||
    pathname.startsWith("/calculator-evals") ||
    pathname.startsWith("/url-evals") ||
    pathname.startsWith("/gallery");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("calculator");
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const toggleDrawer = useCallback(() => setDrawerOpen((p) => !p), []);

  /* Scroll to the calculator without leaving "#calculator" in the address bar:
     a persisted hash replays on refresh and drops the visitor mid-page instead
     of at the top. Guarded by tests/refresh-position.mjs. */
  const handleFeeCalculatorJump = useCallback(
    (event: ReactMouseEvent<HTMLAnchorElement>) => {
      if (pathname !== "/") return;

      const calculator = document.getElementById("calculator");
      if (!calculator) return;

      event.preventDefault();
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      calculator.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start",
      });

      const urlWithoutHash = `${window.location.pathname}${window.location.search}`;
      window.history.replaceState(window.history.state, "", urlWithoutHash);
    },
    [pathname],
  );
  const closeDrawer = useCallback(() => {
    if (document.activeElement?.closest('nav[aria-label="Mobile navigation"]')) {
      menuButtonRef.current?.focus();
    }
    setDrawerOpen(false);
  }, []);

  /* Track scroll to toggle collapsed state */
  useEffect(() => {
    let ticking = false;

    const updateState = () => {
      const currentY = window.scrollY;
      setCollapsed((prev) => {
        if (prev) return currentY > EXPAND_SCROLL_Y;
        return currentY > COLLAPSE_SCROLL_Y;
      });
      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateState);
    };

    updateState();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Close drawer on route change */
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  /* Next can hydrate the calculator before hash targets exist; retry briefly. */
  useEffect(() => {
    if (pathname !== "/") return;

    const timeoutIds: number[] = [];

    const scrollToHashTarget = () => {
      const targetId = window.location.hash.slice(1);
      if (!targetId) return;

      const scroll = () => {
        const target = document.getElementById(targetId);
        if (target) target.scrollIntoView({ block: "start" });
      };

      window.requestAnimationFrame(scroll);
      timeoutIds.push(window.setTimeout(scroll, 180));
      timeoutIds.push(window.setTimeout(scroll, 650));
    };

    scrollToHashTarget();
    window.addEventListener("hashchange", scrollToHashTarget);
    return () => {
      window.removeEventListener("hashchange", scrollToHashTarget);
      timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
    };
  }, [pathname]);

  /* Lock body scroll when drawer is open */
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  /* Keep the drawer state aligned with the same 1280px breakpoint that swaps
     the mobile and desktop header layouts. */
  useEffect(() => {
    const desktopQuery = window.matchMedia(DESKTOP_SITE_NAV_MEDIA_QUERY);
    const closeAtDesktop = (event: MediaQueryListEvent) => {
      if (!event.matches) return;
      if (document.activeElement?.closest('nav[aria-label="Mobile navigation"]')) {
        (document.activeElement as HTMLElement).blur();
      }
      setDrawerOpen(false);
    };

    desktopQuery.addEventListener("change", closeAtDesktop);
    return () => desktopQuery.removeEventListener("change", closeAtDesktop);
  }, []);

  useEffect(() => {
    if (!drawerOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      closeDrawer();
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [closeDrawer, drawerOpen]);

  /* On the homepage, make nav state follow the section currently in view. */
  useEffect(() => {
    if (pathname !== "/") {
      setActiveSection("");
      return;
    }

    const sectionIds = siteNavLinks
      .map((link) => link.sectionId)
      .filter((sectionId): sectionId is string => !!sectionId);
    let ticking = false;

    const updateActiveSection = () => {
      ticking = false;

      const isMobile = isMobileViewport();
      const stickyBarHeight = isMobile ? MOBILE_STICKY_BAR_HEIGHT : STICKY_BAR_HEIGHT;
      const triggerY = getSiteNavScrollTriggerY(collapsed, isMobile, stickyBarHeight);
      setActiveSection(resolveActiveSection(sectionIds, triggerY, "calculator"));
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateActiveSection);
    };

    updateActiveSection();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("hashchange", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("hashchange", onScroll);
    };
  }, [collapsed, pathname]);

  const isLinkActive = useCallback(
    (link: (typeof siteNavLinks)[number]) => {
      if (pathname === "/" && link.sectionId) {
        return activeSection === link.sectionId;
      }

      if (link.activePaths?.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
        return true;
      }

      return pathname === link.href || (link.href !== "/" && !link.href.includes("#") && pathname.startsWith(link.href));
    },
    [activeSection, pathname]
  );

  if (hiddenForInternalTool) return null;

  /* ── Tiered Logo Component ── */
  const Logo = ({ 
    heightClass,
    isCentered = false,
    fontSizeBase = "1rem"
  }: {
    heightClass: string,
    isCentered?: boolean,
    fontSizeBase?: string
  }) => (
    <div className={`flex items-end gap-2 sm:gap-3 transition-all duration-500 ease-out transform-gpu ${isCentered ? "justify-center" : "justify-start"}`}>
      <img
        src="/brand/logo-icon.svg"
        alt="Smarter Way Wealth"
        className={`w-auto transition-all duration-500 ease-out transform-gpu ${heightClass}`}
      />
      <div
        className={`flex flex-col items-start leading-[1.1] transition-all duration-500 ease-out transform-gpu font-logo`}
        style={{ fontSize: fontSizeBase }}
      >
        <span className={`block font-bold uppercase text-[#4A4A4A] tracking-[0.166em] transition-all duration-500 ease-out`}>
          Smarter
        </span>
        <span className={`block font-medium uppercase text-[#007A2F] tracking-[0.222em] transition-all duration-500 ease-out`} style={{ fontSize: '0.5em' }}>
          Way Wealth
        </span>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Sticky Header Bar ── */}
      <header
        className={`sticky top-0 z-50 bg-white transition-[height,box-shadow] duration-500 ease-out transform-gpu will-change-[height,box-shadow] ${
          collapsed ? "shadow-sm" : ""
        }`}
      >
        {/* Reset link styles for nav */}
        <style>{`
          .site-nav a { color: inherit; text-decoration: none; }
          .site-nav a:hover { text-decoration: none; }
        `}</style>

        <div className="site-nav mx-auto max-w-[1200px] px-4 transition-all duration-500 ease-out sm:px-6">
          {/* ── Mobile Layout ── */}
          {/* Three slots in normal flow: menu | logo | calculator. The logo used
              to be absolutely centered on the full bar, which is fine with an
              empty right slot but collides with a real CTA. It now centers
              inside the space actually left over. */}
          <div className={`flex items-center gap-2 xl:hidden transition-all duration-500 ease-out transform-gpu ${
            collapsed ? "h-[58px]" : "h-[77px]"
          }`}>
            <button
              ref={menuButtonRef}
              onClick={toggleDrawer}
              aria-label={drawerOpen ? "Close menu" : "Open menu"}
              aria-expanded={drawerOpen}
              className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-neutral-300 bg-white text-neutral-800 shadow-sm transition-colors duration-300 hover:bg-neutral-100 active:bg-neutral-200"
            >
              {drawerOpen ? <X className="h-5 w-5" strokeWidth={2.2} /> : <Menu className="h-6 w-6" strokeWidth={2.2} />}
            </button>

            {/* Mobile logo — tiered implementation */}
            <Link
              href={"/" as any}
              className="flex min-h-11 min-w-0 flex-1 items-center justify-center transform-gpu"
              aria-label="Smarter Way Wealth home"
            >
              <Logo
                heightClass={collapsed ? "h-[30px]" : "h-[44px]"}
                fontSizeBase={collapsed ? "0.95rem" : "1.1rem"}
                isCentered={true}
              />
            </Link>

            {/* Right slot — the calculator shortcut. On mobile every nav item
                is otherwise sealed behind the hamburger, so a visitor landing
                from the mailed QR code had no visible route to the calculator
                without opening the menu first (David, 2026-08-10). */}
            <Link
              href={FEE_CALCULATOR_HREF as any}
              onClick={handleFeeCalculatorJump}
              data-posthog-cta="true"
              data-posthog-cta-label="Fee Calculator"
              data-posthog-cta-location="site_nav_mobile_header"
              className="relative z-10 inline-flex min-h-11 shrink-0 items-center rounded-lg px-2.5 text-center text-[13px] font-extrabold leading-[1.1] transition-colors duration-200 hover:bg-[#D6F5E2] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#007A2F]"
              style={{
                border: "1px solid #007A2F",
                background: "#EAF7EF",
                color: "#062B43",
              }}
            >
              Fee
              <br />
              Calculator
            </Link>
          </div>

          {/* ── Desktop Layout ── */}
          <div className={`hidden items-center justify-between xl:flex transition-all duration-500 ease-out transform-gpu ${
            collapsed ? "h-[52px]" : "h-[84px]"
          }`}>
            {/* Desktop logo — tiered implementation */}
            <Link
              href={"/" as any}
              className="inline-flex min-h-11 shrink-0 items-center rounded-md transition-opacity duration-300 hover:opacity-90"
              aria-label="Smarter Way Wealth home"
            >
              <Logo 
                heightClass={collapsed ? "h-7" : "h-16"}
                fontSizeBase={collapsed ? "1rem" : "1.9rem"}
              />
            </Link>

            <nav className="flex items-center gap-1">
              {siteNavLinks.map((link, idx) => {
                const isActive = isLinkActive(link);
                const isSecondary = link.tier === "secondary";
                const isTracked = link.track === true;
                const isFirstSecondary =
                  isSecondary && siteNavLinks[idx - 1]?.tier !== "secondary";

                return (
                  <Link
                    key={link.href}
                    href={link.href as any}
                    data-posthog-cta={isTracked ? "true" : undefined}
                    data-posthog-cta-label={isTracked ? link.label : undefined}
                    data-posthog-cta-location={isTracked ? link.ctaLocation : undefined}
                    className={`relative inline-flex min-h-11 items-center rounded-md px-3 py-2 text-sm transition-[color,font-weight] duration-300 ease-out ${
                      isFirstSecondary ? "ml-4" : ""
                    } ${
                      isActive
                        ? "font-extrabold text-[#007A2F]"
                        : isSecondary
                          ? "text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50"
                          : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
                    }`}
                  >
                    {link.label}
                    <span
                      className={`absolute inset-x-2 -bottom-[1px] h-[2px] origin-left rounded-full bg-[#007A2F] transition-transform duration-300 ease-out ${
                        isActive ? "scale-x-100" : "scale-x-0"
                      }`}
                    />
                  </Link>
                );
              })}
              <a
                href={SMARTER_WAY_WEALTH_URL}
                target="_blank"
                rel="noreferrer"
                data-posthog-cta="true"
                data-posthog-cta-label="Smarter Way Wealth"
                data-posthog-cta-location="site_nav"
                className="ml-3 inline-flex min-h-11 items-center gap-2 rounded-md px-4 py-2 text-sm font-extrabold transition-[background-color,border-color,color] duration-200 hover:bg-[#D6F5E2] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#007A2F]"
                style={{
                  border: "1px solid #007A2F",
                  background: "#EAF7EF",
                  color: "#062B43",
                }}
              >
                Smarter Way Wealth
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* ── Mobile Drawer (always in DOM, toggled via CSS) ── */}
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300 xl:hidden ${
          drawerOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Panel */}
      <nav
        className={`site-nav fixed inset-y-0 left-0 z-[70] flex w-[280px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out xl:hidden ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Mobile navigation"
        aria-hidden={!drawerOpen}
        inert={!drawerOpen}
      >
        {/* Drawer Header */}
        <div className="flex h-[77px] items-center justify-between px-4">
          <Link
            href={"/" as any}
            aria-label="Smarter Way Wealth home"
            onClick={closeDrawer}
            className="inline-flex min-h-11 items-center"
          >
            <Logo 
              heightClass="h-10" 
              fontSizeBase="1.4rem"
            />
          </Link>
          <button
            onClick={closeDrawer}
            aria-label="Close menu"
            className="flex h-11 w-11 items-center justify-center rounded-lg text-neutral-600 transition-colors hover:bg-neutral-100"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>

        <div className="mx-4 border-t border-neutral-100" />

        {/* Links */}
        <div className="flex-1 overflow-y-auto px-2 py-3">
          {siteNavLinks.map((link, idx) => {
            const isActive = isLinkActive(link);
            const isSecondary = link.tier === "secondary";
            const isTracked = link.track === true;
            const isFirstSecondary =
              isSecondary && siteNavLinks[idx - 1]?.tier !== "secondary";

            return (
              <Link
                key={link.href}
                href={link.href as any}
                onClick={closeDrawer}
                data-posthog-cta={isTracked ? "true" : undefined}
                data-posthog-cta-label={isTracked ? link.label : undefined}
                data-posthog-cta-location={isTracked ? "site_nav_mobile" : undefined}
                className={`flex items-center gap-3 rounded-lg px-3 py-3.5 text-base underline-offset-8 transition-[color,font-weight,text-decoration-color] duration-300 ${
                  isFirstSecondary ? "mt-3 border-t border-neutral-100 pt-4" : ""
                } ${
                  isActive
                    ? "font-extrabold text-[#007A2F] underline decoration-[#007A2F]"
                    : isSecondary
                      ? "text-neutral-400 hover:bg-neutral-50 hover:text-neutral-700"
                      : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <a
            href={SMARTER_WAY_WEALTH_URL}
            target="_blank"
            rel="noreferrer"
            onClick={closeDrawer}
            data-posthog-cta="true"
            data-posthog-cta-label="Smarter Way Wealth"
            data-posthog-cta-location="site_nav_mobile"
            className="mt-3 flex min-h-12 items-center justify-between gap-3 rounded-lg px-3 py-3.5 text-base font-extrabold transition-colors duration-200 hover:bg-[#D6F5E2] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#007A2F]"
            style={{
              border: "1px solid #007A2F",
              background: "#EAF7EF",
              color: "#062B43",
            }}
          >
            Smarter Way Wealth
            <ExternalLink className="h-5 w-5" aria-hidden="true" />
          </a>
        </div>

        <div className="border-t border-neutral-100 px-4 py-4">
          <p className="text-xs text-neutral-400">
            Smarter Way Wealth
          </p>
        </div>
      </nav>
    </>
  );
}
