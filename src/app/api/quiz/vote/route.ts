import { kv } from "@vercel/kv";
import { NextRequest, NextResponse } from "next/server";

const VOTE_KEY = "quiz:votes";
const KV_TIMEOUT_MS = 5000;

// Wraps a promise with a timeout so KV calls don't hang indefinitely
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`KV timeout after ${ms}ms`)), ms)
    ),
  ]);
}

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

function normalizeCounts(counts: Record<string, string | number> | null): Record<string, number> {
  const normalized: Record<string, number> = {};

  if (!counts) return normalized;

  for (const [key, value] of Object.entries(counts)) {
    const parsed = typeof value === "number" ? value : Number.parseInt(value, 10);
    normalized[key] = Number.isFinite(parsed) ? parsed : 0;
  }

  return normalized;
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

    const pipeline = kv.pipeline();
    for (const vote of votes) {
      pipeline.hincrby(VOTE_KEY, vote, 1);
    }
    await withTimeout(pipeline.exec(), KV_TIMEOUT_MS);

    const counts = await withTimeout(
      kv.hgetall<Record<string, string | number>>(VOTE_KEY),
      KV_TIMEOUT_MS
    );

    return NextResponse.json({ success: true, counts: normalizeCounts(counts) });
  } catch (error) {
    console.error("Vote submission error:", error);
    return NextResponse.json({ error: "Failed to submit vote" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const counts = await withTimeout(
      kv.hgetall<Record<string, string | number>>(VOTE_KEY),
      KV_TIMEOUT_MS
    );
    return NextResponse.json({ counts: normalizeCounts(counts) });
  } catch (error) {
    console.error("Vote fetch error:", error);
    // Graceful degradation: return empty counts so the UI still renders
    return NextResponse.json({ counts: {} });
  }
}
