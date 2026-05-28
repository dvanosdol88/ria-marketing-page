import { NextRequest, NextResponse } from "next/server";

import {
  readEddmCatalog,
  readEddmState,
  updateEddmCandidateState,
  validateEddmStatePatch,
} from "@/lib/eddmEvals";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await readEddmState());
  } catch (error) {
    console.error("EDDM state fetch error:", error);
    return NextResponse.json({ error: "Failed to read EDDM state" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { candidateId?: unknown; patch?: unknown };
    const candidateId = typeof body.candidateId === "string" ? body.candidateId.trim() : "";

    if (!candidateId) {
      return NextResponse.json({ error: "candidateId must be a non-empty string" }, { status: 400 });
    }

    const catalog = await readEddmCatalog();
    const validation = validateEddmStatePatch(catalog, candidateId, body.patch);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: validation.status });
    }

    const state = await updateEddmCandidateState(candidateId, validation.patch);
    return NextResponse.json({
      ok: true,
      candidateId,
      candidateState: state.candidateStates[candidateId],
      state,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("EDDM state update error:", message, error);
    return NextResponse.json({ error: "Failed to update EDDM state", detail: message }, { status: 500 });
  }
}
