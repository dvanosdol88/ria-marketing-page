import { NextResponse } from "next/server";
import { servedVersion } from "@/lib/servedVersion";

export const dynamic = "force-dynamic";

/**
 * The commit this deployment was built from, as `{ surface, commit, ref, env }`.
 * Read by the command centre's Rack observer (www.dvo88.com/rack) so a container
 * whose change merged here turns solid green only once this site serves it.
 */
export function GET() {
  return NextResponse.json(servedVersion(process.env), {
    headers: { "Cache-Control": "no-store" },
  });
}
