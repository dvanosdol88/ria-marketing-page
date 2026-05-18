import type { MetadataRoute } from "next";
import { siteUrl } from "@/config/siteMetadata";

const aiBots = ["GPTBot", "ClaudeBot", "Google-Extended", "PerplexityBot", "CCBot"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      ...aiBots.map((userAgent) => ({
        userAgent,
        allow: "/",
      })),
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
