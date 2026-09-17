// /api/version publishes which build this site serves, for the command centre's
// Rack observer. Run: npm run test:served-version
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { servedVersion } from "../src/lib/servedVersion.ts";

const sha = "0123456789abcdef0123456789abcdef01234567";

test("a Vercel deployment names its commit, branch and environment", () => {
  assert.deepEqual(
    servedVersion({ VERCEL_GIT_COMMIT_SHA: sha.toUpperCase(), VERCEL_GIT_COMMIT_REF: "main", VERCEL_ENV: "production" }),
    { surface: "you-are-paying-too-much", commit: sha, ref: "main", env: "production" },
  );
});

test("outside Vercel, or with a malformed value, the answer is honestly null rather than invented", () => {
  assert.deepEqual(servedVersion({}), { surface: "you-are-paying-too-much", commit: null, ref: null, env: null });
  assert.equal(servedVersion({ VERCEL_GIT_COMMIT_SHA: "abc123" }).commit, null);
  assert.equal(servedVersion({ VERCEL_GIT_COMMIT_SHA: " " }).commit, null);
});

// The route itself imports next/server, which plain Node cannot load outside a
// Next build, so its contract is locked at the source: it answers from the
// process environment through servedVersion, is dynamic, and is never cached.
test("the route answers from the process environment, dynamically, and is never cached", async () => {
  const source = await readFile(new URL("../src/app/api/version/route.ts", import.meta.url), "utf8");
  assert.match(source, /import \{ servedVersion \} from "@\/lib\/servedVersion";/);
  assert.match(source, /export const dynamic = "force-dynamic";/);
  assert.match(source, /NextResponse\.json\(servedVersion\(process\.env\)/);
  assert.match(source, /"Cache-Control": "no-store"/);
});
