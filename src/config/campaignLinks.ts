export const SITE_ORIGIN = "https://youarepayingtoomuch.com";
export const SMARTER_WAY_WEALTH_ORIGIN = "https://smarterwaywealth.com";

// The single booking destination for the whole funnel. Every "talk to David"
// CTA on this site points here — never at the firm-site homepage, which costs
// an extra hop before the scheduler.
export const SMARTER_WAY_WEALTH_MEET_URL = `${SMARTER_WAY_WEALTH_ORIGIN}/meet`;

// Historical mail pieces encoded these parameters. Keep the signature for
// attribution, but do not use it as the destination for newly generated QR
// codes: the current QR must open the homepage at the top.
export const LEGACY_EDDM_QR_PARAMS = {
  portfolio: "1000000",
  years: "20",
  growth: "8",
  fee: "1",
  variant: "direct-mail",
  utm_source: "eddm",
  utm_medium: "print",
  utm_campaign: "launch_5k",
  utm_content: "qr_code",
} as const;

export const EDDM_LAUNCH_QR_URL = `${SITE_ORIGIN}/`;
