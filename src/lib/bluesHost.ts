import { BLUES_HOST } from "@/config/onePercentBlues";

/**
 * Host names for the One Percent Blues front door.
 *
 * Apex + www skip green page counts, wear blue chrome, and must never serve
 * green-only files or internal APIs. The short-name aliases stay out of this
 * check so their existing 308 to onepercentblues.com is unchanged.
 */

/**
 * Apex and www. Production sends www to the apex first; both still count as Blues.
 * Strip a port and a trailing FQDN dot so callers cannot disagree on the same host.
 */
export function isBluesHostname(host: string | null | undefined): boolean {
  const name = (host ?? "").trim().toLowerCase().split(":")[0].replace(/\.$/, "");
  return name === BLUES_HOST || name === `www.${BLUES_HOST}`;
}

export function requestHostname(headers: { get(name: string): string | null }): string {
  const raw =
    headers.get("x-forwarded-host")?.split(",")[0]?.trim() ?? headers.get("host") ?? "";
  return raw.split(":")[0].toLowerCase();
}
