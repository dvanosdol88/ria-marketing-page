"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { installGoogleAdsTag, trackGoogleAdsPageView } from "@/lib/googleAdsTag";

// Loads the Google Ads tag on youarepayingtoomuch.com only and records a page
// view per page. The first view is sent by the tag's own setup call.
export default function GoogleAdsTag() {
  const pathname = usePathname();

  useEffect(() => {
    if (installGoogleAdsTag() === "present") trackGoogleAdsPageView();
  }, [pathname]);

  return null;
}
