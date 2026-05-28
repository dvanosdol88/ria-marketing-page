import type { Metadata } from "next";
import { EvalsHubClient } from "./EvalsHubClient";

export const metadata: Metadata = {
  title: "Eval Hub",
  robots: {
    index: false,
    follow: false,
  },
};

export default function EvalsPage() {
  return <EvalsHubClient />;
}
