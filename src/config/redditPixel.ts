// 05-14: Reddit Pixel for Reddit Ads measurement on youarepayingtoomuch.com.
// The ID comes from Reddit Ads Manager → Events Manager (set by 05-03 on
// David's 2026-10-07 approval). While it is empty the pixel never loads. A pixel
// ID is public by design (it is visible in every page that loads the pixel).
export const REDDIT_PIXEL_ID = "a2_jp3m1rbbkshb";

// The pixel runs only on youarepayingtoomuch.com from this codebase; sibling
// campaign sites served from here never load it. smarterwaywealth.com loads
// the same pixel from its own repo (2026-11-03).
export const REDDIT_PIXEL_HOSTS = new Set([
  "youarepayingtoomuch.com",
  "www.youarepayingtoomuch.com",
]);

// PostHog event → Reddit standard event. Only the event name crosses over:
// no names, emails, phone numbers, portfolio amounts or calculator results.
export const REDDIT_EVENT_FOR_POSTHOG_EVENT: Record<string, RedditEventName> = {
  calculator_started: "ViewContent",
  calculator_submitted: "Lead",
};

export type RedditEventName = "PageVisit" | "ViewContent" | "Lead" | "SignUp";
