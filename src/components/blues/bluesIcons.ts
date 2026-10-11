import type { Metadata } from "next";
import { BLUES_ORIGIN } from "@/config/onePercentBlues";

export const bluesIconMetadata = {
  icon: [{ url: "/brand/blues-icon.svg", type: "image/svg+xml" }],
  shortcut: [{ url: "/brand/blues-icon.svg", type: "image/svg+xml" }],
  apple: [{ url: "/brand/blues-icon.svg", type: "image/svg+xml" }],
} as const;

const BLUES_NOT_FOUND_TITLE = "Page not found | One Percent Blues";
const BLUES_NOT_FOUND_DESCRIPTION =
  "That page is not on One Percent Blues. Head back to the fee check.";

/** Icon, title and share-card metadata for a Blues missing-page screen. */
export function bluesNotFoundMetadata(): Metadata {
  return {
    metadataBase: new URL(BLUES_ORIGIN),
    title: BLUES_NOT_FOUND_TITLE,
    description: BLUES_NOT_FOUND_DESCRIPTION,
    manifest: null,
    openGraph: {
      type: "website",
      siteName: "One Percent Blues",
      url: `${BLUES_ORIGIN}/`,
      title: BLUES_NOT_FOUND_TITLE,
      description: BLUES_NOT_FOUND_DESCRIPTION,
      images: [
        {
          url: "/api/og/blues",
          width: 1200,
          height: 630,
          alt: "Got the 1% Blues?",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: BLUES_NOT_FOUND_TITLE,
      description: BLUES_NOT_FOUND_DESCRIPTION,
      images: ["/api/og/blues"],
    },
    icons: bluesIconMetadata,
  };
}
