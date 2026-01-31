import { kv } from "@vercel/kv";
import { NextRequest, NextResponse } from "next/server";

const VOTE_KEY = "quiz:votes";
// Simple internal secret for protection. 
// In production, this should ideally be an environment variable.
const INTERNAL_SECRET = process.env.INTERNAL_RESET_SECRET || "internal-admin-reset-key";

export async function POST(request: NextRequest) {
  try {
    // Check for authorization header
    const authHeader = request.headers.get("authorization");
    const secret = request.nextUrl.searchParams.get("key");

    const isAuthorized = 
      (authHeader && authHeader === `Bearer ${INTERNAL_SECRET}`) ||
      (secret && secret === INTERNAL_SECRET);

    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Delete the votes key
    await kv.del(VOTE_KEY);

    return NextResponse.json({ 
      success: true, 
      message: "All votes have been reset to 0." 
    });
  } catch (error) {
    console.error("Vote reset error:", error);
    return NextResponse.json(
      { error: "Failed to reset votes" },
      { status: 500 }
    );
  }
}
