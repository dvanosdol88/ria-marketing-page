"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { siteNavLinks } from "@/config/siteNavConfig";

/**
 * Site-wide navigation bar — "Authority" style.
 * Mobile: hamburger + centered logo + future CTA slot.
 * Desktop: logo left + spaced nav links right.
 * Sticky with shadow-on-scroll.
 */
export function SiteNav() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  /* Track scroll to toggle shadow */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll(); // check on mount
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Close drawer on route change */
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  /* Lock body scroll when drawer is open */
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const toggleDrawer = useCallback(() => setDrawerOpen((p) => !p), []);

  return (
    <>
      {/* ── Sticky Header Bar ── */}
      <header
        className={`sticky top-0 z-50 bg-white transition-shadow duration-300 ${
          scrolled ? "shadow-md" : ""
        }`}
      >
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          {/* ── Mobile Layout ── */}
          <div className="flex h-16 items-center justify-between md:hidden">
            {/* Hamburger */}
            <button
              onClick={toggleDrawer}
              aria-label={drawerOpen ? "Close menu" : "Open menu"}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-neutral-700 transition-colors hover:bg-neutral-100 active:bg-neutral-200"
            >
              <Menu className="h-6 w-6" strokeWidth={2} />
            </button>

            {/* Centered Logo */}
            <Link
              href={"/" as any}
              className="absolute left-1/2 -translate-x-1/2 no-underline"
              aria-label="Smarter Way Wealth home"
            >
              <Image
                src="/brand/logo.svg"
                alt="Smarter Way Wealth"
                width={200}
                height={80}
                className="h-10 w-auto"
                priority
              />
            </Link>

            {/* Right slot — reserved for future CTA */}
            <div className="w-10" aria-hidden="true" />
          </div>

          {/* ── Desktop Layout ── */}
          <div className="hidden h-[72px] items-center justify-between md:flex">
            {/* Logo */}
            <Link
              href={"/" as any}
              className="flex shrink-0 items-center no-underline rounded-md transition-opacity hover:opacity-90"
              aria-label="Smarter Way Wealth home"
            >
              <Image
                src="/brand/logo.svg"
                alt="Smarter Way Wealth"
                width={200}
                height={80}
                className="h-14 w-auto"
                priority
              />
            </Link>

            {/* Nav Links */}
            <nav className="flex items-center gap-1">
              {siteNavLinks.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== "/" && pathname.startsWith(link.href));

                return (
                  <Link
                    key={link.href}
                    href={link.href as any}
                    className={`relative px-3 py-2 text-sm font-medium no-underline rounded-md transition-colors ${
                      isActive
                        ? "text-brand-600"
                        : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
                    }`}
                  >
                    {link.label}
                    {/* Active indicator — subtle bottom bar */}
                    {isActive && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute inset-x-2 -bottom-[1px] h-[2px] rounded-full bg-brand-600"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[60] bg-black/40"
              onClick={toggleDrawer}
              aria-hidden="true"
            />

            {/* Panel */}
            <motion.nav
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 35 }}
              className="fixed inset-y-0 left-0 z-[70] flex w-[280px] flex-col bg-white shadow-2xl"
              aria-label="Mobile navigation"
            >
              {/* Drawer Header */}
              <div className="flex h-16 items-center justify-between px-4">
                <Link
                  href={"/" as any}
                  className="no-underline"
                  aria-label="Smarter Way Wealth home"
                  onClick={() => setDrawerOpen(false)}
                >
                  <Image
                    src="/brand/logo.svg"
                    alt="Smarter Way Wealth"
                    width={200}
                    height={80}
                    className="h-9 w-auto"
                  />
                </Link>
                <button
                  onClick={toggleDrawer}
                  aria-label="Close menu"
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-neutral-600 transition-colors hover:bg-neutral-100"
                >
                  <X className="h-5 w-5" strokeWidth={2} />
                </button>
              </div>

              {/* Divider */}
              <div className="mx-4 border-t border-neutral-100" />

              {/* Links */}
              <div className="flex-1 overflow-y-auto px-2 py-3">
                {siteNavLinks.map((link, i) => {
                  const isActive =
                    pathname === link.href ||
                    (link.href !== "/" && pathname.startsWith(link.href));

                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.06 * i, duration: 0.2 }}
                    >
                      <Link
                        href={link.href as any}
                        onClick={() => setDrawerOpen(false)}
                        className={`flex items-center gap-3 rounded-lg px-3 py-3.5 text-base font-medium no-underline transition-colors ${
                          isActive
                            ? "bg-brand-600/8 text-brand-600"
                            : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
                        }`}
                      >
                        {/* Active pip */}
                        {isActive && (
                          <span className="h-2 w-2 shrink-0 rounded-full bg-brand-600" />
                        )}
                        {link.label}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              {/* Drawer footer — brand accent */}
              <div className="border-t border-neutral-100 px-4 py-4">
                <p className="text-xs text-neutral-400">
                  Smarter Way Wealth
                </p>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
