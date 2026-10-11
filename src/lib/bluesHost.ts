import { BLUES_HOST } from "@/config/onePercentBlues";

/** Apex and www. Production sends www to the apex first; both still count as Blues. */
export function isBluesHostname(host: string | null | undefined): boolean {
  const name = (host ?? "").split(":")[0].toLowerCase();
  return name === BLUES_HOST || name === `www.${BLUES_HOST}`;
}
