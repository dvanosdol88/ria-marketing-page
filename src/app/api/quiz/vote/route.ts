import { kv } from "@vercel/kv";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const VOTE_KEY = "quiz:votes";

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
    await pipeline.exec();

    const counts = await kv.hgetall<Record<string, string | number>>(VOTE_KEY);

    return NextResponse.json({ success: true, counts: normalizeCounts(counts) });
  } catch (error) {
    console.error("Vote submission error:", error);
    return NextResponse.json({ error: "Failed to submit vote" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const counts = await kv.hgetall<Record<string, string | number>>(VOTE_KEY);
    return NextResponse.json({ counts: normalizeCounts(counts) });
  } catch (error) {
    console.error("Vote fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch votes" }, { status: 500 });
  }
}
