"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { installRedditPixel, trackRedditEvent } from "@/lib/redditPixel";

// 05-14: loads the Reddit Pixel on youarepayingtoomuch.com only and records a
// PageVisit per page. Inert until REDDIT_PIXEL_ID is set.
export default function RedditPixel() {
  const pathname = usePathname();

  useEffect(() => {
    if (installRedditPixel()) trackRedditEvent("PageVisit");
  }, [pathname]);

  return null;
}
