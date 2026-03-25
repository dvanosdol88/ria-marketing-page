"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { siteNavLinks } from "@/config/siteNavConfig";

const COLLAPSE_SCROLL_Y = 132;
const EXPAND_SCROLL_Y = 82;

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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

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

  /* Lock body scroll when drawer is open */
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const toggleDrawer = useCallback(() => setDrawerOpen((p) => !p), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  /* Easing: overshoot ease-out when collapsing, gentler ease-out when expanding */
  const easingClass = collapsed
    ? "ease-[cubic-bezier(0.22,1,0.36,1)]"
    : "ease-[cubic-bezier(0.33,1,0.68,1)]";

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
    <div className={`flex items-end gap-2 sm:gap-3 transition-all duration-800 ${easingClass} transform-gpu ${isCentered ? "justify-center" : "justify-start"}`}>
      <img
        src="/brand/logo-icon.svg"
        alt="Smarter Way Wealth"
        className={`w-auto transition-all duration-800 ${easingClass} transform-gpu ${heightClass}`}
      />
      <div
        className={`flex flex-col items-start leading-[1.1] transition-all duration-800 ${easingClass} transform-gpu font-logo`}
        style={{ fontSize: fontSizeBase }}
      >
        <span className={`hidden sm:block font-bold uppercase text-[#4A4A4A] tracking-[0.166em] transition-all duration-800 ${easingClass}`}>
          Smarter
        </span>
        <span className={`hidden md:block font-medium uppercase text-[#007A2F] tracking-[0.222em] transition-all duration-800 ${easingClass}`} style={{ fontSize: '0.5em' }}>
          Way Wealth
        </span>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Sticky Header Bar ── */}
      <header
        className={`sticky top-0 z-50 transition-all duration-800 ${easingClass} transform-gpu will-change-[height,background-color,backdrop-filter,box-shadow] ${
          collapsed
            ? "bg-white/90 backdrop-blur-md shadow-sm supports-[backdrop-filter]:bg-white/85"
            : "bg-white"
        }`}
      >
        {/* Reset link styles for nav */}
        <style>{`
          .site-nav a { color: inherit; text-decoration: none; }
          .site-nav a:hover { text-decoration: none; }
        `}</style>

        <div className="site-nav mx-auto max-w-[1200px] px-4 sm:px-6 transition-all duration-800">
          {/* ── Mobile Layout ── */}
          <div className={`flex items-center justify-between md:hidden transition-all duration-800 ${easingClass} transform-gpu ${
            collapsed ? "h-[58px]" : "h-[77px]"
          }`}>
            <button
              onClick={toggleDrawer}
              aria-label={drawerOpen ? "Close menu" : "Open menu"}
              aria-expanded={drawerOpen}
              className="relative z-10 flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-300 bg-white text-neutral-800 shadow-sm transition-colors duration-300 hover:bg-neutral-100 active:bg-neutral-200"
            >
              {drawerOpen ? <X className="h-5 w-5" strokeWidth={2.2} /> : <Menu className="h-6 w-6" strokeWidth={2.2} />}
            </button>

            {/* Mobile logo — tiered implementation */}
            <Link
              href={"/" as any}
              className="absolute left-1/2 -translate-x-1/2 flex items-center transform-gpu"
              aria-label="Smarter Way Wealth home"
            >
              <Logo
                heightClass={collapsed ? "h-[34px]" : "h-[58px]"}
                fontSizeBase={collapsed ? "1.1rem" : "1.4rem"}
                isCentered={true}
              />
            </Link>

            {/* Right slot — reserved for future CTA */}
            <div className="w-10" aria-hidden="true" />
          </div>

          {/* ── Desktop Layout ── */}
          <div className={`hidden items-center justify-between md:flex transition-all duration-800 ${easingClass} transform-gpu ${
            collapsed ? "h-[52px]" : "h-[104px]"
          }`}>
            {/* Desktop logo — tiered implementation */}
            <Link
              href={"/" as any}
              className="shrink-0 rounded-md transition-opacity duration-300 hover:opacity-90"
              aria-label="Smarter Way Wealth home"
            >
              <Logo 
                heightClass={collapsed ? "h-8" : "h-20"} 
                fontSizeBase={collapsed ? "1.2rem" : "2.4rem"}
              />
            </Link>

            <nav className="flex items-center gap-1">
              {siteNavLinks.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== "/" && pathname.startsWith(link.href));

                return (
                  <Link
                    key={link.href}
                    href={link.href as any}
                    className={`relative px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? "text-[#007A2F]"
                        : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute inset-x-2 -bottom-[1px] h-[2px] rounded-full bg-[#007A2F]" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* ── Mobile Drawer (always in DOM, toggled via CSS) ── */}
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300 md:hidden ${
          drawerOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Panel */}
      <nav
        className={`site-nav fixed inset-y-0 left-0 z-[70] flex w-[280px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out md:hidden ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Mobile navigation"
        aria-hidden={!drawerOpen}
      >
        {/* Drawer Header */}
        <div className="flex h-[77px] items-center justify-between px-4">
          <Link
            href={"/" as any}
            aria-label="Smarter Way Wealth home"
            onClick={closeDrawer}
          >
            <Logo 
              heightClass="h-10" 
              fontSizeBase="1.4rem"
            />
          </Link>
          <button
            onClick={closeDrawer}
            aria-label="Close menu"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-neutral-600 transition-colors hover:bg-neutral-100"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>

        <div className="mx-4 border-t border-neutral-100" />

        {/* Links */}
        <div className="flex-1 overflow-y-auto px-2 py-3">
          {siteNavLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));

            return (
              <Link
                key={link.href}
                href={link.href as any}
                onClick={closeDrawer}
                className={`flex items-center gap-3 rounded-lg px-3 py-3.5 text-base font-medium transition-colors ${
                  isActive
                    ? "bg-[#007A2F]/8 text-[#007A2F]"
                    : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
                }`}
              >
                {isActive && (
                  <span className="h-2 w-2 shrink-0 rounded-full bg-[#007A2F]" />
                )}
                {link.label}
              </Link>
            );
          })}
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
