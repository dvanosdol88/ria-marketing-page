import { getAdminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const VOTES_DOC = "quiz/votes";

const validOptions = [
  "retire-early",
  "vacation-home",
  "give-to-advisor",
  "invest-it",
  "pay-off-mortgage",
  "other",
];

type VoteBody = {
  vote?: string;
  votes?: string[];
};

function normalizeVotePayload(body: VoteBody): string[] {
  if (body.vote && typeof body.vote === "string") {
    return [body.vote];
  }

  if (Array.isArray(body.votes)) {
    return body.votes.filter((entry): entry is string => typeof entry === "string");
  }

  return [];
}

async function readCounts(): Promise<Record<string, number>> {
  const snap = await getAdminDb().doc(VOTES_DOC).get();
  if (!snap.exists) return {};

  const data = snap.data() as Record<string, unknown>;
  const counts: Record<string, number> = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "number") counts[key] = value;
  }
  return counts;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as VoteBody;
    const votes = normalizeVotePayload(body);

    if (votes.length === 0) {
      return NextResponse.json({ error: "No votes provided" }, { status: 400 });
    }

    const invalidVotes = votes.filter((v) => !validOptions.includes(v));
    if (invalidVotes.length > 0) {
      return NextResponse.json(
        { error: "Invalid vote options", invalid: invalidVotes },
        { status: 400 }
      );
    }

    // Atomically increment each voted option
    const updates: Record<string, FieldValue> = {};
    for (const vote of votes) {
      updates[vote] = FieldValue.increment(1);
    }
    await getAdminDb().doc(VOTES_DOC).set(updates, { merge: true });

    const counts = await readCounts();
    return NextResponse.json({ success: true, counts });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Vote submission error:", message, error);
    return NextResponse.json({ error: "Failed to submit vote", detail: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const counts = await readCounts();
    return NextResponse.json({ counts });
  } catch (error) {
    console.error("Vote fetch error:", error);
    // Graceful degradation: return empty counts so the UI still renders
    return NextResponse.json({ counts: {} });
  }
}
