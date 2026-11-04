"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  installRedditPixel,
  metadataCarriesVisitorScenario,
  trackRedditEvent,
} from "@/lib/redditPixel";

// 05-14: loads the Reddit Pixel on youarepayingtoomuch.com only and records a
// PageVisit per page. Inert until REDDIT_PIXEL_ID is set.
export default function RedditPixel() {
  const pathname = usePathname();

  useEffect(() => {
    // A personalized calculator address renders personalized page metadata,
    // which may not be in <head> yet right after a client-side navigation.
    if (metadataCarriesVisitorScenario([window.location.href])) return;
    if (installRedditPixel()) trackRedditEvent("PageVisit");
  }, [pathname]);

  return null;
}
