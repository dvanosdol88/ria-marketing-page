import assert from "node:assert/strict";
import { buildTrackedCtaProperties } from "../src/lib/ctaAnalytics.ts";

const properties = buildTrackedCtaProperties({
  href: "mailto:?subject=Results&body=Portfolio%20%241%2C000%2C000%20portfolio%3D1000000%26fee%3D1",
  label: "Email results",
  location: "share_results",
  opensNewTab: false,
  redactQuery: false,
});

assert.deepEqual(properties, {
  cta_label: "Email results",
  cta_href: "mailto:",
  cta_host: "",
  cta_path: "",
  cta_location: "share_results",
  opens_new_tab: false,
});
const serialized = JSON.stringify(properties);
assert.doesNotMatch(serialized, /1,?000,?000|subject=|body=|portfolio=|fee=/i);
console.log("Mailto CTA analytics properties are fully redacted — OK");
