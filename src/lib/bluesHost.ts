import { BLUES_HOST } from "@/config/onePercentBlues";

/**
 * Host names for the One Percent Blues front door.
 *
 * Apex + www skip green page counts, wear blue chrome, and must never serve
 * green-only files or internal APIs. The short-name aliases stay out of this
 * set so their existing 308 to onepercentblues.com is unchanged.
 */

export const BLUES_APEX_HOST = BLUES_HOST;
export const BLUES_WWW_HOST = `www.${BLUES_HOST}`;
export const BLUES_CONTENT_HOSTS = new Set([BLUES_HOST, BLUES_WWW_HOST]);
export const BLUES_ALIAS_HOSTS = new Set(["1percentblues.com", "www.1percentblues.com"]);

/** Apex and www. Production sends www to the apex first; both still count as Blues. */
export function isBluesHostname(host: string | null | undefined): boolean {
  const name = (host ?? "").split(":")[0].toLowerCase();
  return name === BLUES_HOST || name === `www.${BLUES_HOST}`;
}

export function requestHostname(headers: { get(name: string): string | null }): string {
  const raw =
    headers.get("x-forwarded-host")?.split(",")[0]?.trim() ?? headers.get("host") ?? "";
  return raw.split(":")[0].toLowerCase();
}

export function isBluesContentHost(host: string): boolean {
  return isBluesHostname(host);
}
