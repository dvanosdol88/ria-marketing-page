import { NextResponse } from "next/server";

import { readEddmCatalog } from "@/lib/eddmEvals";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await readEddmCatalog());
  } catch (error) {
    console.error("EDDM catalog fetch error:", error);
    return NextResponse.json({ error: "Failed to read EDDM catalog" }, { status: 500 });
  }
}
