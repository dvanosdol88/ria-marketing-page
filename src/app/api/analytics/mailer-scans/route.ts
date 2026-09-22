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
  buildTrafficVisitUpdate,
  easternDayKey,
  publicMailerScanHeaders,
  requestHeadersCameFromThisSite,
} from "@/lib/mailerScanPolicy";

export const dynamic = "force-dynamic";

type ScanReceiptBody = {
  attributionMethod?: string;
  kind?: "visit";
};

function publicDailyTraffic(value: unknown) {
  if (!value || typeof value !== "object") return [];
  return Object.entries(value as Record<string, unknown>)
    .filter(([date]) => /^\d{4}-\d{2}-\d{2}$/.test(date))
    .map(([date, raw]) => {
      const day =
        raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
      return {
        date,
        scans: typeof day.scans === "number" && day.scans >= 0 ? day.scans : 0,
        visits:
          typeof day.visits === "number" && day.visits >= 0 ? day.visits : 0,
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30);
}

export async function GET() {
  try {
    const snapshot = await getAdminDb().doc(MAILER_SCAN_COUNTER_DOC).get();
    const data = snapshot.data();
    const count = typeof data?.count === "number" ? data.count : 0;
    const visits = typeof data?.visits === "number" ? data.visits : 0;
    const lastScanAt = data?.lastScanAt?.toDate?.().toISOString?.() ?? null;

    return NextResponse.json(
      {
        count,
        lastScanAt,
        label: "Mailer QR scans",
        scans: { total: count, lastScanAt },
        visits: { total: visits },
        daily: publicDailyTraffic(data?.daily),
        timeZone: "America/New_York",
      },
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
    const dayKey = easternDayKey();
    if (body.kind === "visit") {
      await getAdminDb()
        .doc(MAILER_SCAN_COUNTER_DOC)
        .set(
          buildTrafficVisitUpdate(
            dayKey,
            FieldValue.increment,
            FieldValue.serverTimestamp,
          ),
          { merge: true },
        );
      return NextResponse.json({ counted: true });
    }

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
          dayKey,
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
