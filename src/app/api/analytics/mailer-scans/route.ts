import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { publicMailerScanHeaders, requestHeadersCameFromThisSite, requestLooksAutomated } from "@/lib/mailerScanPolicy";
import { hasSelfTestCookie } from "@/lib/selfTestTraffic";
import { hasQrVerificationCookie } from "@/lib/qrVerification";
import { MEASUREMENT_HOSTS } from "@/lib/qrLanding";
import { EXACT_COUNTER, HISTORY_COUNTER, VERIFICATION_COUNTER, recordMeasurement, validMeasurementInput, publicMeasurementResponse } from "@/lib/qrMeasurement";

export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const db = getAdminDb();
    const [exact, history, verification] = await Promise.all([
      db.doc(EXACT_COUNTER).get(), db.doc(HISTORY_COUNTER).get(), db.doc(VERIFICATION_COUNTER).get(),
    ]);
    return NextResponse.json(publicMeasurementResponse(exact.data(), history.data(), verification.data()), { headers: publicMailerScanHeaders() });
  } catch (error) {
    console.error("Mailer scan counter read failed", error);
    return NextResponse.json({ error: "Mailer scan count is temporarily unavailable." }, { status: 503, headers: publicMailerScanHeaders() });
  }
}
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: {
    ...publicMailerScanHeaders(), "Access-Control-Allow-Methods": "GET, OPTIONS", "Access-Control-Allow-Headers": "Content-Type",
  } });
}
export async function POST(request: NextRequest) {
  if (!requestHeadersCameFromThisSite(request.headers)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const host = (request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ?? request.headers.get("host") ?? "").toLowerCase();
  if (!MEASUREMENT_HOSTS.has(host)) return NextResponse.json({ counted: false, reason: "other_host" });
  if (requestLooksAutomated(request.headers)) return NextResponse.json({ counted: false, reason: "automated_traffic" });
  const cookies = request.headers.get("cookie") ?? "";
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid landing evidence." }, { status: 400 }); }
  if (!validMeasurementInput(body) || body.landing.hostname.toLowerCase() !== host) {
    return NextResponse.json({ error: "Invalid landing evidence." }, { status: 400 });
  }
  // A caller may exclude itself into test totals; it cannot disable the server's test marker.
  const verification = hasQrVerificationCookie(cookies) || body.verification === true;
  if (hasSelfTestCookie(cookies) && !verification) return NextResponse.json({ counted: false, reason: "self_test" });
  try {
    return NextResponse.json(await recordMeasurement(getAdminDb(), { ...body, verification }, new Date(), FieldValue.serverTimestamp));
  } catch (error) {
    console.error("Mailer scan counter increment failed", error);
    return NextResponse.json({ error: "Mailer scan could not be counted." }, { status: 503 });
  }
}
