import type { Metadata } from "next";

import { EddmEvalClient } from "./EddmEvalClient";

export const metadata: Metadata = {
  title: "EDDM Evals",
  robots: {
    index: false,
    follow: false,
  },
};

export default function EddmEvalsPage() {
  return <EddmEvalClient />;
}
