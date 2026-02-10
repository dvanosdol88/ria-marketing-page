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
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 flex justify-between items-center gap-3">
        {/* Logo / Site Name */}
        <Link
          href={"/" as any}
          className="flex shrink-0 items-center gap-2 rounded-md px-1 py-1 transition-opacity hover:opacity-90 no-underline"
          aria-label="Smarter Way Wealth home"
        >
          <Image
            src="/brand/logo.svg"
            alt="Smarter Way Wealth"
            width={200}
            height={80}
            className="h-[3.5rem] w-auto sm:h-[4.5rem]"
            priority
          />
        </Link>

        {/* Nav Links */}
        <nav className="flex items-center gap-2 overflow-x-auto whitespace-nowrap text-xs font-semibold sm:gap-4 sm:text-sm">
          {siteNavLinks.map((link, index) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));

            return (
              <span key={link.href} className="flex items-center gap-2 sm:gap-4">
                {index > 0 && (
                  <span className="text-neutral-300">|</span>
                )}
                <Link
                  href={link.href as any}
                  className={`hover:underline no-underline transition-colors ${
                    isActive
                      ? "text-brand-600"
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
