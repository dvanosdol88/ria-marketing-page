import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const [faqSection, faqData, quiz] = await Promise.all([
  readFile(new URL("../src/components/HomeFaqSection.tsx", import.meta.url), "utf8"),
  readFile(new URL("../src/data/faq.ts", import.meta.url), "utf8"),
  readFile(new URL("../src/components/Quiz.tsx", import.meta.url), "utf8"),
]);

const flatten = (source) => source.replace(/\s+/g, " ");

test("homepage FAQ uses the approved affordability copy and AI boundary", () => {
  assert.match(faqSection, /How can you offer these services for only \$100\/month\?/);
  assert.match(faqSection, /AI is not used for any financial advice or recommendations\./);
  assert.match(faqSection, /<sup[^>]*>\*<\/sup>/);
  assert.match(
    flatten(faqData),
    /Until very recently, it wasn't possible\. But today, with advances in technology and AI\*, nearly all back-office functions can be automated, leaving us time, allowing us to spend nearly all of our time working with clients\./,
  );
  assert.match(
    flatten(faqData),
    /Even more importantly, we don't have massive marketing budgets, tens of millions in executive overhead, and \$100 billion legacy IT budgets\./,
  );
});

test("Very is a compact top insertion note in the FAQ heading color", () => {
  const source = flatten(faqSection);
  assert.match(source, /relative inline-block pt-10/);
  assert.match(source, /absolute left-0 top-0/);
  assert.match(source, /Very/);
  assert.match(source, /⌄/);
  assert.match(source, /\$\{t\.heading\}/);
  assert.match(source, /pl-\[1\.5ch\]/);
  assert.doesNotMatch(source, /flex items-end gap-2/);
});

test("Leaving site sits before the outbound FAQ sentence at the chevron gutter", () => {
  const source = flatten(faqSection);
  const label = source.indexOf("Leaving site");
  const sentence = source.indexOf("Read all of the FAQs on smarterwaywealth.com.");
  assert.ok(label >= 0 && sentence > label);
  assert.match(source, /\$\{ROW_X\} \$\{ROW_Y\} \$\{ROW_FOCUS\}/);
  assert.match(source, /grid grid-cols-\[auto_1fr\]/);
});

test("poll keeps percentages but no longer prints the total number of votes", () => {
  assert.match(quiz, /\{percentage\}%/);
  assert.doesNotMatch(quiz, /votes so far/);
  assert.match(quiz, /Thanks for voting!/);
});
