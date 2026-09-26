import { BLUES_ORIGIN } from "@/config/onePercentBlues";

/* Served at onepercentblues.com/robots.txt by the host rewrite in
   next.config.mjs. Same AI-crawler policy as public/robots.txt (this is a
   lead-gen page; agents are a primary audience), pointing at this host's
   own sitemap. The Disallow list matches the green file because /api/*
   stays on this host, so quiz and eval endpoints would otherwise be
   crawlable here. */
export const dynamic = "force-static";

const BODY = [
  "User-agent: *",
  "Allow: /",
  "Disallow: /api/quiz/",
  "Disallow: /api/eddm-evals/",
  "Disallow: /gallery",
  "Disallow: /eddm-evals",
  "Disallow: /evals",
  "Disallow: /calculator-evals",
  "Disallow: /url-evals",
  "",
  "User-agent: GPTBot",
  "Allow: /",
  "",
  "User-agent: ClaudeBot",
  "Allow: /",
  "",
  "User-agent: PerplexityBot",
  "Allow: /",
  "",
  "User-agent: Google-Extended",
  "Allow: /",
  "",
  "User-agent: CCBot",
  "Allow: /",
  "",
  `Sitemap: ${BLUES_ORIGIN}/sitemap.xml`,
  "",
].join("\n");

export function GET() {
  return new Response(BODY, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
