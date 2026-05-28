import { NextRequest, NextResponse } from "next/server";

import { seedEddmStateIfEmpty } from "@/lib/eddmEvals";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const expectedSecret = process.env.INTERNAL_RESET_SECRET;
  const providedSecret = request.headers.get("x-internal-secret");

  if (!expectedSecret || providedSecret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await seedEddmStateIfEmpty();
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("EDDM state seed error:", message, error);
    return NextResponse.json({ error: "Failed to seed EDDM state", detail: message }, { status: 500 });
  }
}
