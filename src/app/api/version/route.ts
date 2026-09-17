import { NextResponse } from "next/server";

// Which commit this site serves, so the Rack board (dvo88.com, container 01-73) can tell a
// merged change from a served one. Vercel sets the commit at build time; anywhere else it is
// honestly null. Nothing here is secret: the repository is public.
export const dynamic = "force-static";

export function GET() {
  return NextResponse.json({
    commit: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
    source: process.env.VERCEL ? "vercel" : "local",
  });
}
