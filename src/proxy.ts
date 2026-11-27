import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";

import { isBluesHostname, requestHostname } from "@/lib/bluesHost";
import {
  QR_SEEN_COOKIE,
  QR_SEEN_COOKIE_MAX_AGE_SECONDS,
  classifyServerQrRequest,
} from "@/lib/qrServerCount";

/**
 * On the Blues host, green-only APIs (including /api/og, but not /api/og/blues
 * or the shared quiz vote routes) 404, and so does the green full calculator
 * (/calculator and its share card, fee-lab stage 1, section 2): One Percent
 * Blues is a separate campaign and keeps the not-found it had before.
 */
const BLUES_GATED_PATH =
  /^\/(?:api\/(?:become-a-client|gallery\/statuses|eddm-evals(?:\/|$)|savings-rates|analytics\/mailer-scans|calculator|version|og(?!\/))|agent-info\.json|calculator(?:\/|$))/;

// David, 2026-11-18: count a printed-QR arrival on the server, the moment it is
// requested, so a scan no longer depends on the phone running the page's script.
function countPrintedQrRequest(request: NextRequest, event: NextFetchEvent) {
  const hostname = requestHostname(request.headers) || request.nextUrl.hostname;
  const scan = classifyServerQrRequest(
    { hostname, pathname: request.nextUrl.pathname, search: request.nextUrl.search },
    request.headers,
  );
  if (!scan) return NextResponse.next();
  event.waitUntil(
    (async () => {
      try {
        const [{ getAdminDb }, { recordServerQrRequest }] = await Promise.all([
          import("@/lib/firebaseAdmin"),
          import("@/lib/qrServerCount"),
        ]);
        await recordServerQrRequest(getAdminDb(), scan);
      } catch (error) {
        console.error("Server QR count failed", error);
      }
    })(),
  );
  const response = NextResponse.next();
  response.cookies.set(QR_SEEN_COOKIE, "1", {
    path: "/",
    maxAge: QR_SEEN_COOKIE_MAX_AGE_SECONDS,
    sameSite: "lax",
    secure: true,
  });
  return response;
}

export function proxy(request: NextRequest, event: NextFetchEvent) {
  if (!isBluesHostname(requestHostname(request.headers))) {
    if (request.nextUrl.pathname === "/") return countPrintedQrRequest(request, event);
    return NextResponse.next();
  }
  if (BLUES_GATED_PATH.test(request.nextUrl.pathname)) {
    return new NextResponse(null, { status: 404 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
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
    "/calculator",
    "/calculator/:path*",
  ],
};
