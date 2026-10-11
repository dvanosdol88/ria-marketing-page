import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { isBluesContentHost, requestHostname } from "@/lib/bluesHost";

/**
 * Green-only / internal APIs have no business on the Blues host. A made-up
 * page already 404s there (#344); these routes used to return green payloads
 * instead. Apex and www both 404. The 1percentblues.com aliases are not in
 * this matcher’s host check — they keep their 308 to the apex.
 */
const BLUES_GATED_API =
  /^\/api\/(?:become-a-client|gallery\/statuses|eddm-evals(?:\/|$))/;

export function middleware(request: NextRequest) {
  if (!isBluesContentHost(requestHostname(request.headers))) {
    return NextResponse.next();
  }
  if (BLUES_GATED_API.test(request.nextUrl.pathname)) {
    return new NextResponse(null, { status: 404 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/become-a-client", "/api/gallery/statuses", "/api/eddm-evals", "/api/eddm-evals/:path*"],
};
