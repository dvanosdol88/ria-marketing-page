"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { siteNavLinks } from "@/config/siteNavConfig";

/**
 * Site-wide navigation bar — "Authority" style.
 * Mobile: hamburger + centered logo + future CTA slot.
 * Desktop: logo left + spaced nav links right.
 * Sticky with shadow-on-scroll.
 * Drawer uses CSS transitions (always in DOM) for reliability.
 */
export function SiteNav() {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  /* Track scroll to toggle shadow */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
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

  return (
    <>
      {/* ── Sticky Header Bar ── */}
      <header
        className={`sticky top-0 z-50 bg-white transition-shadow duration-300 ${
          scrolled ? "shadow-md" : ""
        }`}
      >
        {/* Reset link styles for nav */}
        <style>{`
          .site-nav a { color: inherit; text-decoration: none; }
          .site-nav a:hover { text-decoration: none; }
        `}</style>

        <div className="site-nav mx-auto max-w-[1200px] px-4 sm:px-6">
          {/* ── Mobile Layout ── */}
          <div className="flex h-16 items-center justify-between md:hidden">
            <button
              onClick={toggleDrawer}
              aria-label={drawerOpen ? "Close menu" : "Open menu"}
              aria-expanded={drawerOpen}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-neutral-700 transition-colors hover:bg-neutral-100 active:bg-neutral-200"
            >
              <Menu className="h-6 w-6" strokeWidth={2} />
            </button>

            <Link
              href={"/" as any}
              className="absolute left-1/2 -translate-x-1/2"
              aria-label="Smarter Way Wealth home"
            >
              <Image
                src="/brand/logo-strong-primary-lightbg.png"
                alt="Smarter Way Wealth"
                width={1000}
                height={375}
                className={isLandingPage ? "h-12 w-auto" : "h-10 w-auto"}
                priority
              />
            </Link>

            {/* Right slot — reserved for future CTA */}
            <div className="w-10" aria-hidden="true" />
          </div>

          {/* ── Desktop Layout ── */}
          <div className={`hidden items-center justify-between md:flex ${isLandingPage ? "h-[104px]" : "h-[88px]"}`}>
            <Link
              href={"/" as any}
              className="flex shrink-0 items-center rounded-md transition-opacity hover:opacity-90"
              aria-label="Smarter Way Wealth home"
            >
              <Image
                src="/brand/logo-strong-primary-lightbg.png"
                alt="Smarter Way Wealth"
                width={1000}
                height={375}
                className={isLandingPage ? "h-24 w-auto" : "h-20 w-auto"}
                priority
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
                        ? "text-brand-600"
                        : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute inset-x-2 -bottom-[1px] h-[2px] rounded-full bg-brand-600" />
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
        className={`fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300 ${
          drawerOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Panel */}
      <nav
        className={`site-nav fixed inset-y-0 left-0 z-[70] flex w-[280px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Mobile navigation"
        aria-hidden={!drawerOpen}
      >
        {/* Drawer Header */}
        <div className="flex h-16 items-center justify-between px-4">
          <Link
            href={"/" as any}
            aria-label="Smarter Way Wealth home"
            onClick={closeDrawer}
          >
            <Image
              src="/brand/logo-strong-primary-lightbg.png"
              alt="Smarter Way Wealth"
              width={1000}
              height={375}
              className={isLandingPage ? "h-10 w-auto" : "h-9 w-auto"}
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
                    ? "bg-brand-600/8 text-brand-600"
                    : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
                }`}
              >
                {isActive && (
                  <span className="h-2 w-2 shrink-0 rounded-full bg-brand-600" />
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
