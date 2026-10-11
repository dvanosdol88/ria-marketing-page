/* Served at onepercentblues.com/site.webmanifest by the host rewrite in
   next.config.mjs. The green PWA file in public/ must not leak onto this host
   (name, theme color, or icons). Do not bounce the request to the green site
   — that is the open #317 approach and it conflicts with the #344 rule that
   unknown/non-blue paths stay on this host. */
export const dynamic = "force-static";

const BODY = {
  name: "One Percent Blues",
  short_name: "1% Blues",
  icons: [
    {
      src: "/brand/blues-icon.svg",
      sizes: "any",
      type: "image/svg+xml",
      purpose: "any",
    },
  ],
  start_url: "/",
  scope: "/",
  theme_color: "#1E3A8A",
  background_color: "#1E3A8A",
  display: "standalone",
};

export function GET() {
  return new Response(JSON.stringify(BODY, null, 2), {
    headers: { "Content-Type": "application/manifest+json; charset=utf-8" },
  });
}
