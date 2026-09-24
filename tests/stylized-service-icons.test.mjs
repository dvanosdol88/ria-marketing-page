import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const [howSource, signupSource] = await Promise.all([
  readFile(new URL("../src/components/WhatWhyWhoHow.tsx", import.meta.url), "utf8"),
  readFile(new URL("../src/components/SignupCta.tsx", import.meta.url), "utf8"),
]);

const flatten = (source) => source.replace(/\s+/g, " ");

test("HOW uses matched stylized badges for included services and avoided costs", () => {
  const source = flatten(howSource);

  assert.match(source, /import \{ BadgeCheck, BadgeDollarSign, Mail \} from "lucide-react"/);
  assert.match(source, /<BadgeCheck[^>]*fill-\[#E6F6EC\][^>]*text-\[#108843\]/);
  assert.match(source, /<BadgeDollarSign[^>]*fill-\[#FDECEC\][^>]*text-\[#C62828\]/);
  assert.doesNotMatch(source, /<Check\b|<DollarSign\b/);
});

test("What you get uses the stylized green badge and the approved portfolio-analysis copy", () => {
  const source = flatten(signupSource);

  assert.match(source, /import \{ ArrowRight, BadgeCheck, ExternalLink \} from "lucide-react"/);
  assert.match(source, /In-depth portfolio analysis\./);
  assert.doesNotMatch(source, /State-of-the-art financial/);
  assert.match(source, /<BadgeCheck[^>]*fill-\[#E6F6EC\][^>]*text-\[#108843\]/);
  assert.doesNotMatch(source, /<Check\b/);
});
