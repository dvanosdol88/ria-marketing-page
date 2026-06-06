export const SITE_ORIGIN = "https://youarepayingtoomuch.com";
export const SMARTER_WAY_WEALTH_ORIGIN = "https://smarterwaywealth.com";

export const EDDM_LAUNCH_QR_PARAMS = {
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

export function buildEddmLaunchQrUrl() {
  const url = new URL("/", SITE_ORIGIN);
  Object.entries(EDDM_LAUNCH_QR_PARAMS).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  return url.toString();
}

export const EDDM_LAUNCH_QR_URL = buildEddmLaunchQrUrl();
