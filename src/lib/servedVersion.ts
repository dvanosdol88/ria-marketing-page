// Which build this site is serving. The command centre's Rack observer reads it
// from /api/version to confirm a merged change is live on youarepayingtoomuch.com
// rather than take a worker's word for it. Vercel stamps these values on every
// deployment; outside Vercel (local dev, CI) they are honestly null.
export type ServedVersion = {
  surface: "you-are-paying-too-much";
  commit: string | null;
  ref: string | null;
  env: string | null;
};

const COMMIT = /^[0-9a-f]{40}$/;

export function servedVersion(
  env: Record<string, string | undefined>,
): ServedVersion {
  const sha = (env.VERCEL_GIT_COMMIT_SHA ?? "").trim().toLowerCase();
  return {
    surface: "you-are-paying-too-much",
    commit: COMMIT.test(sha) ? sha : null,
    ref: env.VERCEL_GIT_COMMIT_REF?.trim() || null,
    env: env.VERCEL_ENV?.trim() || null,
  };
}
