import { getAdminDb } from "@/lib/firebaseAdmin";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const VOTES_DOC = "quiz/votes";
const INTERNAL_SECRET = process.env.INTERNAL_RESET_SECRET || "internal-admin-reset-key";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const secret = request.nextUrl.searchParams.get("key");

    const isAuthorized =
      (authHeader && authHeader === `Bearer ${INTERNAL_SECRET}`) ||
      (secret && secret === INTERNAL_SECRET);

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await getAdminDb().doc(VOTES_DOC).delete();

    return NextResponse.json({
      success: true,
      message: "All votes have been reset to 0.",
    });
  } catch (error) {
    console.error("Vote reset error:", error);
    return NextResponse.json({ error: "Failed to reset votes" }, { status: 500 });
  }
}
