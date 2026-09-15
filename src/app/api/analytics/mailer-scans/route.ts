import { FieldValue } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import {
  MAILER_SCAN_COUNTER_DOC,
  isLikelyBotUserAgent,
} from "@/lib/mailerScan";
import {
  ALLOWED_MAILER_ATTRIBUTION_METHODS,
  buildMailerScanUpdate,
  publicMailerScanHeaders,
  requestHeadersCameFromThisSite,
} from "@/lib/mailerScanPolicy";

export const dynamic = "force-dynamic";

type ScanReceiptBody = {
  attributionMethod?: string;
};

export async function GET() {
  try {
    const snapshot = await getAdminDb().doc(MAILER_SCAN_COUNTER_DOC).get();
    const data = snapshot.data();
    const count = typeof data?.count === "number" ? data.count : 0;
    const lastScanAt = data?.lastScanAt?.toDate?.().toISOString?.() ?? null;

    return NextResponse.json(
      { count, lastScanAt, label: "Mailer QR scans" },
      { headers: publicMailerScanHeaders() },
    );
  } catch (error) {
    console.error("Mailer scan counter read failed", error);
    return NextResponse.json(
      { error: "Mailer scan count is temporarily unavailable." },
      { status: 503, headers: publicMailerScanHeaders() },
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...publicMailerScanHeaders(),
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function POST(request: NextRequest) {
  if (!requestHeadersCameFromThisSite(request.headers)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (isLikelyBotUserAgent(request.headers.get("user-agent") ?? "")) {
    return NextResponse.json({ counted: false, reason: "automated_traffic" });
  }

  try {
    const body = (await request.json()) as ScanReceiptBody;
    if (!ALLOWED_MAILER_ATTRIBUTION_METHODS.has(body.attributionMethod ?? "")) {
      return NextResponse.json(
        { error: "Invalid campaign attribution." },
        { status: 400 },
      );
    }

    await getAdminDb()
      .doc(MAILER_SCAN_COUNTER_DOC)
      .set(
        buildMailerScanUpdate(
          body.attributionMethod ?? "",
          FieldValue.increment,
          FieldValue.serverTimestamp,
        ),
        { merge: true },
      );

    return NextResponse.json({ counted: true });
  } catch (error) {
    console.error("Mailer scan counter increment failed", error);
    return NextResponse.json(
      { error: "Mailer scan could not be counted." },
      { status: 503 },
    );
  }
}
