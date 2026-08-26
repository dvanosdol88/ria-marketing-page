import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * The legacy public lead collector is intentionally fail-closed while the
 * approved verified-email onboarding journey is completed. The request body
 * is never read, logged, stored, or forwarded.
 */
export async function POST() {
  return NextResponse.json(
    {
      error:
        "Secure direct onboarding is temporarily unavailable. No information was saved.",
    },
    { status: 410 },
  );
}
