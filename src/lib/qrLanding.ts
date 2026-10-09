// 05-66: evaluate incoming evidence, never remembered campaign properties.
export const MEASUREMENT_VERSION = "05-66";
export const MEASUREMENT_HOSTS = new Set([
  "youarepayingtoomuch.com", "www.youarepayingtoomuch.com",
]);
export const PRINTED_QR_PARAMS = {
  portfolio: "1000000", years: "20", growth: "8", fee: "1",
};
export const APPROVED_QR_UTMS = {
  utm_source: "eddm", utm_medium: "print", utm_campaign: "launch_5k", utm_content: "qr_code",
};
export type LandingEvidence = { hostname: string; pathname: string; search: string };
export function landingEvidence(url: string): LandingEvidence {
  const parsed = new URL(url);
  return { hostname: parsed.hostname, pathname: parsed.pathname, search: parsed.search };
}
export function hasDuplicateParameters(params: URLSearchParams) {
  return Array.from(params.keys()).some((key) => params.getAll(key).length > 1);
}
export function isSharedResult(params: URLSearchParams) {
  return ["shared", "flat", "mfe", "intro", "experience", "returnMode", "scenario"].some((key) => params.has(key));
}
export function resolveQrSearch(search: string | URLSearchParams) {
  const params = typeof search === "string" ? new URLSearchParams(search) : search;
  if (hasDuplicateParameters(params) || isSharedResult(params)) return null;
  const fullUtm = Object.entries(APPROVED_QR_UTMS).every(([key, value]) => params.get(key) === value);
  if (fullUtm) return "explicit_utm" as const;
  // The printed signature permits only its four exact keys and traffic switches.
  const permitted = new Set([...Object.keys(PRINTED_QR_PARAMS), "qrtest", "selftest"]);
  if (Array.from(params.keys()).some((key) => !permitted.has(key))) return null;
  return Object.entries(PRINTED_QR_PARAMS).every(([key, value]) => params.get(key) === value)
    ? "legacy_qr_signature" as const : null;
}
export function resolveLanding(evidence: LandingEvidence) {
  const website = MEASUREMENT_HOSTS.has(evidence.hostname.toLowerCase()) && evidence.pathname === "/";
  return { website, attributionMethod: website ? resolveQrSearch(evidence.search) : null };
}
export function buildSharedResultQuery(query: string) {
  const params = new URLSearchParams(query);
  Array.from(params.keys()).forEach((key) => {
    if (key.startsWith("utm_") || key === "qrtest" || key === "selftest") params.delete(key);
  });
  params.set("shared", "1");
  return params.toString();
}
