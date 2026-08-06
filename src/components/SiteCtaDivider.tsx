"use client";

import { usePathname } from "next/navigation";
import { WwwhCtaDivider } from "@/components/WwwhCtaDivider";
import { isSuppressedRoute } from "@/config/suppressedRoutePrefixes";

/**
 * Site-wide mount of the shared CTA divider. The homepage already renders
 * its own WwwhCtaDivider directly beneath the WWWH block, so this instance
 * stays hidden there to avoid a duplicate. It also stays hidden on routes
 * where SiteFooter itself is suppressed (see suppressedRoutePrefixes) so the
 * divider never renders orphaned with no footer beneath it. Every other
 * route gets exactly one divider, placed immediately above the footer.
 */
export function SiteCtaDivider() {
  const pathname = usePathname();

  if (pathname === "/" || isSuppressedRoute(pathname)) {
    return null;
  }

  return <WwwhCtaDivider location="site_footer_divider" />;
}
