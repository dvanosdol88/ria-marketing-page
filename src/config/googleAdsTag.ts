// Google Ads tag (gtag.js) for youarepayingtoomuch.com — David, 2026-10-22,
// from his new Google Ads account. A tag ID is public by design (it is visible
// in every page that loads the tag). While it is empty the tag never loads.
export const GOOGLE_ADS_TAG_ID = "AW-18531165881";

// The tag runs only on the ad landing site. smarterwaywealth.com and the
// sibling campaign sites served from this codebase never load it.
export const GOOGLE_ADS_TAG_HOSTS = new Set([
  "youarepayingtoomuch.com",
  "www.youarepayingtoomuch.com",
]);

// The calculator writes its inputs (portfolio, fee, years, growth) into the
// page address. Only these ad-attribution parameters travel to Google with a
// page address; everything else in the query string is dropped.
export const GOOGLE_ADS_KEPT_QUERY_PARAMS = [
  "gclid",
  "gbraid",
  "wbraid",
  "gad_source",
  "gad_campaignid",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;
