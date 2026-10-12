import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { isBluesHostname, requestHostname } from "@/lib/bluesHost";

/**
 * Green-only / internal APIs have no business on the Blues host. A made-up
 * page already 404s there (#344); these routes used to return green payloads
 * instead. Apex and www both 404. The 1percentblues.com aliases are not in
 * this matcher’s host check — they keep their 308 to the apex.
 *
 * /api/og is the green share card only. /api/og/blues stays live (the matcher
 * is the exact path, not /api/og/:path*). The quiz vote/reset routes stay
 * live: the shared calculator poll on the blue page calls them.
 *
 * Next.js 16 names this file proxy.ts (the older middleware.ts name still
 * works but prints a deprecation warning on every build).
 */
const BLUES_GATED_PATH =
  /^\/(?:api\/(?:become-a-client|gallery\/statuses|eddm-evals(?:\/|$)|og$|savings-rates|analytics\/mailer-scans|calculator|version)|agent-info\.json)/;

export function proxy(request: NextRequest) {
  if (!isBluesHostname(requestHostname(request.headers))) {
    return NextResponse.next();
  }
  if (BLUES_GATED_PATH.test(request.nextUrl.pathname)) {
    return new NextResponse(null, { status: 404 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/become-a-client",
    "/api/gallery/statuses",
    "/api/eddm-evals",
    "/api/eddm-evals/:path*",
    "/api/og",
    "/api/savings-rates",
    "/api/analytics/mailer-scans",
    "/api/calculator",
    "/api/version",
    "/agent-info.json",
  ],
};
