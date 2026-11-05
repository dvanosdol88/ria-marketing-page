import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { isBluesHostname, requestHostname } from "@/lib/bluesHost";

/**
 * On the Blues host, green-only APIs (including /api/og, but not /api/og/blues
 * or the shared quiz vote routes) 404.
 */
const BLUES_GATED_PATH =
  /^\/(?:api\/(?:become-a-client|gallery\/statuses|eddm-evals(?:\/|$)|savings-rates|analytics\/mailer-scans|calculator|version|og(?!\/))|agent-info\.json)/;

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
    "/api/savings-rates",
    "/api/analytics/mailer-scans",
    "/api/calculator",
    "/api/version",
    "/api/og",
    "/agent-info.json",
  ],
};
