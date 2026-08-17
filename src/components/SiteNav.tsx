"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, Menu, X } from "lucide-react";
import { siteNavLinks } from "@/config/siteNavConfig";
import { SIGNUP_PATH } from "@/config/signupCta";
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
const DESKTOP_PEER_LINK_CLASS =
  "ml-3 inline-flex min-h-11 items-center gap-2 rounded-md px-3 py-2 text-sm font-extrabold transition-colors duration-200 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2";
const DRAWER_PEER_LINK_CLASS =
  "mt-3 flex min-h-12 items-center justify-between gap-3 rounded-lg px-3 py-3.5 text-base font-extrabold transition-colors duration-200 hover:bg-neutral-50 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2";

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
 * Mobile: hamburger + centered logo + compact Sign Up CTA.
 * Desktop: logo left + spaced nav links right, ending with two peer links.
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
          {/* The 62px mobile header preserves the first-screen calculator
              heading while fitting the menu, centered brand mark, and signup CTA. */}
          <div className={`relative flex items-center gap-2 xl:hidden transition-all duration-500 ease-out transform-gpu ${
            collapsed ? "h-[58px]" : "h-[62px]"
          }`}>
            <button
              ref={menuButtonRef}
              onClick={toggleDrawer}
              aria-label={drawerOpen ? "Close menu" : "Open menu"}
              aria-expanded={drawerOpen}
              className="relative z-10 flex h-11 w-11 items-center justify-center rounded-lg border border-neutral-300 bg-white text-neutral-800 shadow-sm transition-colors duration-300 hover:bg-neutral-100 active:bg-neutral-200"
            >
              {drawerOpen ? <X className="h-5 w-5" strokeWidth={2.2} /> : <Menu className="h-6 w-6" strokeWidth={2.2} />}
            </button>

            {/* Center the compact wordmark in the header whenever the 375px
                mobile budget permits. The side controls stay in normal flow,
                so their tap targets remain stable while the logo holds the
                visual center. */}
            <Link
              href={"/" as any}
              className="absolute left-1/2 flex min-h-11 -translate-x-1/2 items-center"
              aria-label="Smarter Way Wealth home"
            >
              <Logo
                heightClass={collapsed ? "h-7" : "h-[30px]"}
                fontSizeBase={collapsed ? "0.8rem" : "0.9rem"}
              />
            </Link>

            <Link
              href={SIGNUP_PATH as any}
              data-posthog-cta="true"
              data-posthog-cta-label="Become a Client"
              data-posthog-cta-location="site_nav_mobile"
              className="ml-auto inline-flex min-h-11 shrink-0 items-center rounded-md bg-[#064B84] px-4 text-sm font-bold !text-white !no-underline shadow-[0_6px_18px_rgba(6,75,132,0.26)] transition hover:bg-[#053B6A] hover:!text-white focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#062B43]"
            >
              Sign Up
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
                    data-posthog-cta-label={isTracked ? (link.ctaLabel ?? link.label) : undefined}
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
                /* A link, not a button (David, 2026-08-14). It wore a green
                   bordered pill, which made it the only button in the header
                   and set up a competition with the page's actual CTA. The
                   arrow stays — it is what says "this leaves the site" — and
                   the brand green keeps it the most prominent thing in the
                   nav without pretending to be an action. */
                className={`${DESKTOP_PEER_LINK_CLASS} hover:text-[#005A22] focus-visible:outline-[#007A2F]`}
                style={{ color: "#007A2F" }}
              >
                Smarter Way Wealth
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
              <Link
                href={SIGNUP_PATH as any}
                data-posthog-cta="true"
                data-posthog-cta-label="Become a Client"
                data-posthog-cta-location="site_nav"
                className={`${DESKTOP_PEER_LINK_CLASS} hover:text-[#043B68] focus-visible:outline-[#064B84]`}
                style={{ color: "#064B84" }}
              >
                Become a Client
              </Link>
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
                data-posthog-cta-label={isTracked ? (link.ctaLabel ?? link.label) : undefined}
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
            /* Matches the desktop treatment above — link, not button. */
            className={`${DRAWER_PEER_LINK_CLASS} focus-visible:outline-[#007A2F]`}
            style={{ color: "#007A2F" }}
          >
            Smarter Way Wealth
            <ExternalLink className="h-5 w-5" aria-hidden="true" />
          </a>
          <Link
            href={SIGNUP_PATH as any}
            onClick={closeDrawer}
            data-posthog-cta="true"
            data-posthog-cta-label="Become a Client"
            data-posthog-cta-location="site_nav_mobile_drawer"
            className={`${DRAWER_PEER_LINK_CLASS} focus-visible:outline-[#064B84]`}
            style={{ color: "#064B84" }}
          >
            Become a Client
          </Link>
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
