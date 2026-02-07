"use client";

import Image from "next/image";
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
          className="flex items-center gap-2 text-sm font-semibold text-neutral-600 hover:text-neutral-800 transition-colors no-underline"
        >
          <Image
            src="/logo/logo-nav.png"
            alt="YouArePayingTooMuch.com logo"
            width={24}
            height={24}
            className="flex-shrink-0"
          />
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
