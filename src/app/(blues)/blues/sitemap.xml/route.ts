import { BLUES_ORIGIN } from "@/config/onePercentBlues";

/* Served at onepercentblues.com/sitemap.xml by the host rewrite. The blue
   host is one page by design (every other path redirects to the green site),
   so the sitemap lists exactly that page. */
export const dynamic = "force-static";

const BODY = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BLUES_ORIGIN}/</loc>
  </url>
</urlset>
`;

export function GET() {
  return new Response(BODY, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
