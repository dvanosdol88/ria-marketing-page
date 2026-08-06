"use client";

import { usePathname } from "next/navigation";
import { WwwhCtaDivider } from "@/components/WwwhCtaDivider";

/**
 * Site-wide mount of the shared CTA divider. The homepage already renders
 * its own WwwhCtaDivider directly beneath the WWWH block, so this instance
 * stays hidden there to avoid a duplicate. Every other route gets exactly
 * one divider, placed immediately above the footer.
 */
export function SiteCtaDivider() {
  const pathname = usePathname();

  if (pathname === "/") {
    return null;
  }

  return <WwwhCtaDivider location="site_footer_divider" />;
}
