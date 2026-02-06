"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteNavLinks } from "@/config/siteNavConfig";

/**
 * Shared site-wide navigation bar.
 * Renders links from siteNavConfig and highlights the active route.
 */
export function SiteNav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-neutral-200 py-4">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 flex justify-between items-center">
        {/* Logo / Site Name */}
        <Link
          href={"/" as any}
          className="font-bold flex items-center gap-2 hover:opacity-90 no-underline text-neutral-900"
        >
          <span className="w-3 h-3 rounded-full bg-green-500" />
          <span>YouArePayingTooMuch.com</span>
        </Link>

        {/* Nav Links */}
        <nav className="flex gap-4 text-sm font-semibold">
          {siteNavLinks.map((link, index) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));

            return (
              <span key={link.href} className="flex items-center gap-4">
                {index > 0 && (
                  <span className="text-neutral-300">|</span>
                )}
                <Link
                  href={link.href as any}
                  className={`hover:underline no-underline transition-colors ${
                    isActive
                      ? "text-green-600"
                      : "text-neutral-700"
                  }`}
                >
                  {link.label}
                </Link>
              </span>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
