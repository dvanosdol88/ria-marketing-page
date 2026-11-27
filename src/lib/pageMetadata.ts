import type { Metadata } from "next";

/**
 * Builds a page's metadata so its share preview matches the page itself.
 *
 * Without an explicit `openGraph` block, Next.js falls back to the root
 * layout's — which meant every page was shared as the home page. Pass the same
 * title/description the page already uses and both cards stay in sync.
 *
 * The image is named explicitly rather than left to inheritance: declaring a
 * page-level `openGraph` replaces the parent's whole object, which would drop
 * the root `opengraph-image` on every page but the home page.
 */
const SHARE_IMAGE = "/opengraph-image";
export function pageMetadata({
  title,
  description,
  path,
  image = SHARE_IMAGE,
}: {
  title: string;
  description: string;
  path: string;
  /** Defaults to the site-wide `/opengraph-image`. Pass a page-specific image
   * (e.g. a personalized share card) to override it without duplicating this
   * function's whole object shape. */
  image?: string;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: "Smarter Way Wealth",
      type: "website",
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
