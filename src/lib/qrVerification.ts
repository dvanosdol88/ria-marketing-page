export const QR_VERIFICATION_QUERY = "qrtest";
export const QR_VERIFICATION_COOKIE = "yapt_qr_verification";
export const QR_VERIFICATION_SESSION = "yapt_qr_verification";
let enabledInMemory = false;
export function hasQrVerificationCookie(cookie: string) {
  return cookie.split(";").some((part) => part.trim() === `${QR_VERIFICATION_COOKIE}=1`);
}
export function syncQrVerification(search?: string | URLSearchParams) {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(search ?? window.location.search);
  const value = params.getAll(QR_VERIFICATION_QUERY).length === 1 ? params.get(QR_VERIFICATION_QUERY) : null;
  if (value === "1" || value === "0") {
    enabledInMemory = value === "1";
    try {
      if (enabledInMemory) window.sessionStorage.setItem(QR_VERIFICATION_SESSION, "1");
      else window.sessionStorage.removeItem(QR_VERIFICATION_SESSION);
    } catch { /* Session cookie and memory cover restricted storage. */ }
    document.cookie = enabledInMemory
      ? `${QR_VERIFICATION_COOKIE}=1; Path=/; SameSite=Lax`
      : `${QR_VERIFICATION_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
  }
  try {
    return enabledInMemory || window.sessionStorage.getItem(QR_VERIFICATION_SESSION) === "1" || hasQrVerificationCookie(document.cookie);
  } catch { return enabledInMemory || hasQrVerificationCookie(document.cookie); }
}
export function exitQrVerification() {
  syncQrVerification("qrtest=0");
}
