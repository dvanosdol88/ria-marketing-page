import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readSource = (relativePath) =>
  readFile(new URL(relativePath, import.meta.url), "utf8");

const [
  calculatorSource,
  calculatorExperienceSource,
  answersSource,
  navConfigSource,
  navSource,
  stickyNavConfigSource,
  advancedCalculatorCtaSource,
] = await Promise.all([
  readSource("../src/components/CostAnalysisCalculator.tsx"),
  readSource("../src/components/HomeCalculatorExperience.tsx"),
  readSource("../src/components/WhatWhyWhoHow.tsx"),
  readSource("../src/config/siteNavConfig.ts"),
  readSource("../src/components/SiteNav.tsx"),
  readSource("../src/config/stickyNavConfig.ts"),
  readSource("../src/components/AdvancedCalculatorCta.tsx"),
]);

const flatten = (source) => source.replace(/\s+/g, " ");

test("homepage WWWH keeps the locked order and exact approved answers", () => {
  const expected = [
    // Camel Case, not all-caps — David's call, 2026-08-07.
    [
      'label: "What"',
      "An investment and financial planning relationship with an experienced, highly credentialed advisor — for just $100 a month.",
    ],
    [
      'label: "Why"',
      "Because not everyone needs to be paying massive, asset-based fees to get good advice.",
    ],
    [
      'label: "Who"',
      "David Van Osdol, CFA Charter Holder and CFP Professional with over 20 years’ experience.",
    ],
    ['label: "How"', "No need to move your accounts."],
  ];

  let priorIndex = -1;
  for (const [label, body] of expected) {
    const labelIndex = answersSource.indexOf(label);
    const bodyIndex = answersSource.indexOf(body);
    assert.ok(labelIndex > priorIndex, `${label} must stay in locked order`);
    assert.ok(bodyIndex > labelIndex, `${label} must keep its approved answer`);
    priorIndex = bodyIndex;
  }
});

test("HOW states what the firm uses and what it does not carry, in order", () => {
  const uses = [
    "Technology to automate admin work",
    "Published model portfolios from top firms",
    "Virtual meetings",
  ];
  const skips = [
    "Layers of corporate overhead",
    "Massive marketing budgets",
    "A large real estate footprint",
  ];

  const usesIndex = answersSource.indexOf("uses: [");
  const skipsIndex = answersSource.indexOf("skips: [");
  assert.ok(usesIndex >= 0 && skipsIndex > usesIndex, "uses must precede skips");

  let priorIndex = usesIndex;
  for (const item of uses) {
    const index = answersSource.indexOf(item);
    assert.ok(index > priorIndex, `"${item}" must stay in the uses list, in order`);
    assert.ok(index < skipsIndex, `"${item}" must sit in uses, not skips`);
    priorIndex = index;
  }

  priorIndex = skipsIndex;
  for (const item of skips) {
    const index = answersSource.indexOf(item);
    assert.ok(index > priorIndex, `"${item}" must stay in the skips list, in order`);
    priorIndex = index;
  }
});

test("WWWH follows the complete calculation-details handoff and precedes advisor proof", () => {
  const detailLabelIndex = calculatorExperienceSource.indexOf(
    "View calculation details",
  );
  const advancedHandoffIndex = calculatorExperienceSource.indexOf(
    "<AdvancedCalculatorCta",
  );
  const calculatorIndex = calculatorSource.indexOf("<HomeCalculatorExperience");
  const calculatorSectionEndIndex = calculatorSource.indexOf(
    "</section>",
    calculatorIndex,
  );
  const answersIndex = calculatorSource.indexOf("<WhatWhyWhoHow />");
  const advisorIndex = calculatorSource.indexOf("<AdvisorProofSections />");

  for (const [marker, index] of [
    ["calculation-details label", detailLabelIndex],
    ["advanced-calculator handoff", advancedHandoffIndex],
    ["calculator experience", calculatorIndex],
    ["calculator section end", calculatorSectionEndIndex],
    ["WWWH component", answersIndex],
    ["advisor proof", advisorIndex],
  ]) {
    assert.ok(index >= 0, `${marker} must exist before placement is compared`);
  }

  assert.ok(
    detailLabelIndex < advancedHandoffIndex,
    "the state-carrying advanced calculator handoff must remain after calculation details",
  );
  assert.ok(
    calculatorSectionEndIndex < answersIndex,
    "WWWH must start after the complete calculator and its full-width handoff",
  );
  assert.ok(answersIndex < advisorIndex, "advisor proof must remain after HOW");
  assert.equal(
    calculatorSource.match(/<WhatWhyWhoHow \/>/g)?.length,
    1,
    "WWWH must render exactly once",
  );
});

test("WWWH is one plain panel of headed answers, with no rotated type or cards", () => {
  // each question word is the real heading for its answer. The class moved to a
  // shared constant when the labels went green (2026-08-11); what matters is
  // that both headings are h2 and share one treatment, not that the class sits
  // inline.
  assert.match(
    answersSource,
    /const WWWH_LABEL_CLASS =\s*\n?\s*"text-3xl font-black/,
    "the shared question-word treatment must stay a black 3xl heading",
  );
  assert.equal(
    answersSource.match(/<h2 className=\{WWWH_LABEL_CLASS\}>/g)?.length,
    2,
    "both the mapped answers and HOW must render the question word as an h2",
  );
  assert.match(answersSource, /className="fit-cta-band"/);
  assert.match(answersSource, /aria-label="What, why, who and how/);

  // the design David rejected must not creep back
  assert.doesNotMatch(answersSource, /writing-mode|vertical-rl|rotate\(/i);
  assert.doesNotMatch(answersSource, /<article|shadow-/i);
  // `rounded-full` is the WHO portrait, added 2026-08-11. Every other rounded
  // utility would be the card treatment David rejected.
  assert.doesNotMatch(answersSource, /rounded-(?!full)/i);
  assert.doesNotMatch(
    answersSource,
    /Read the full FAQ/,
    "the FAQ link was removed from HOW on purpose",
  );

  // static server component: no client directive, no animation runtime
  assert.doesNotMatch(answersSource, /"use client"/);
  assert.doesNotMatch(answersSource, /framer-motion|useReducedMotion/);
});

// DECISION CHANGED, 2026-08-07 — read before "fixing" this back.
//
// This test previously locked the skipped-cost marks as NEUTRAL grey crosses,
// on the reasoning that red reads as hazard while these items are savings.
// David overruled that directly: "Instead of a gray X, put a red dollar sign."
//
// The red dollar sign carries a different claim than the cross did. A grey X
// says merely "absent"; a red $ says "this is what you would be paying for at
// a traditional firm" — which is the argument for the $100 price, made in one
// glyph. The earlier rationale was sound but was not David's call to make.
test("HOW's skipped costs are red dollar signs — what you'd be paying for", () => {
  const flatAnswers = flatten(answersSource);
  assert.match(flatAnswers, /<Check[^>]*text-\[#108843\]/);
  assert.match(flatAnswers, /<DollarSign[^>]*text-\[#C62828\]/);
  assert.doesNotMatch(
    flatAnswers,
    /<X[^>]/,
    "the neutral cross was replaced by a red dollar sign (David, 2026-08-07)",
  );
});

// DECISION CHANGED, 2026-08-11 — read before "fixing" this back.
//
// The four question words previously shared the body ink (#10233A), on the
// reasoning from the 2026-08-07 redesign that header and body reading as one
// colour is what let the section collapse from five screens to about one.
//
// David asked for them in blue or green and chose one treatment for all four.
// Green (#007A2F) rather than blue (#064B84): every comparison on this page
// uses blue for the asset-based-fee side, and these are the firm's own
// affirmative answers, so blue would have read as the thing being argued
// against.
test("WWWH question words carry the brand green, not the AUM blue", () => {
  assert.match(answersSource, /WWWH_LABEL_CLASS =\s*\n?\s*"[^"]*text-\[#007A2F\]/);
  assert.doesNotMatch(
    answersSource,
    /WWWH_LABEL_CLASS =\s*\n?\s*"[^"]*text-\[#064B84\]/,
    "blue is reserved for the asset-based-fee side of the comparison",
  );
});

test("WHO shows David's photo beside the answer and says he does the work", () => {
  const flatAnswers = flatten(answersSource);
  assert.match(
    flatAnswers,
    /You will work directly with him\./,
    "David's addition, 2026-08-11",
  );
  assert.match(flatAnswers, /src="\/DVO Head Shot picture\.jpg"/);
  // Decorative alt on purpose: the paragraph beside the portrait opens with
  // "David Van Osdol", so descriptive alt text made a screen reader announce
  // the name twice in a row (accessibility review, 2026-08-11).
  assert.match(flatAnswers, /src="\/DVO Head Shot picture\.jpg" alt=""/);
  assert.match(
    flatAnswers,
    /answer\.key === "who" \?/,
    "only WHO carries a portrait — it is the one answer about a person",
  );
});

// Without accessible names on these two lists, a screen reader and any agent
// summarising the page announce six undifferentiated items and come away
// believing the firm HAS massive marketing budgets and layers of corporate
// overhead — the exact opposite of the claim, on the page's core
// differentiator. The icons that carry the distinction visually are
// aria-hidden, correctly, so the names have to live here.
test("HOW's two lists say which is which to assistive tech", () => {
  const flatAnswers = flatten(answersSource);
  assert.match(flatAnswers, /aria-label="What Smarter Way Wealth uses"/);
  assert.match(flatAnswers, /aria-label="Costs Smarter Way Wealth does not carry"/);
  // Tailwind's reset strips the list marker, and Safari/VoiceOver drops list
  // semantics along with it unless the role is explicit.
  assert.equal(
    flatAnswers.match(/<ul\s+role="list"/g)?.length,
    2,
    "both lists must keep explicit list semantics",
  );
});

test("advanced calculator motion preference is gated until after hydration", () => {
  assert.match(
    advancedCalculatorCtaSource,
    /const \[motionPreferenceReady, setMotionPreferenceReady\] = useState\(false\)/,
  );
  assert.match(
    advancedCalculatorCtaSource,
    /const shouldReduceMotion = motionPreferenceReady && Boolean\(reduceMotion\)/,
  );
  assert.match(advancedCalculatorCtaSource, /setMotionPreferenceReady\(true\)/);
  assert.match(advancedCalculatorCtaSource, /\{!shouldReduceMotion &&/);
});

test("site navigation preserves every existing item and adds tracked Fee Calculator", () => {
  const labels = ["Save", "Upgrade", "Improve", "Rates", "How?", "FAQ"];
  for (const label of labels) {
    assert.ok(
      navConfigSource.includes(`label: "${label}"`),
      `existing ${label} navigation item must remain`,
    );
  }

  const feeIndex = navConfigSource.indexOf('label: "Fee Calculator"');
  assert.ok(feeIndex >= 0, "Fee Calculator must exist");
  const objectEnd = navConfigSource.indexOf("},", feeIndex);
  assert.ok(objectEnd > feeIndex, "Fee Calculator config object must close");
  const feeSource = navConfigSource.slice(feeIndex, objectEnd);
  assert.match(feeSource, /href: "\/#calculator"/);
  assert.match(feeSource, /track: true/);
  assert.match(feeSource, /ctaLocation: "site_nav"/);
});

test("desktop and mobile nav expose the branded outbound firm link with tracking", () => {
  assert.match(
    navSource,
    /const SMARTER_WAY_WEALTH_URL = "https:\/\/smarterwaywealth\.com\/"/,
  );
  assert.equal(
    navSource.match(/href=\{SMARTER_WAY_WEALTH_URL\}/g)?.length,
    2,
    "desktop and mobile drawer must each render the firm link",
  );
  assert.equal(
    navSource.match(/data-posthog-cta-label="Smarter Way Wealth"/g)?.length,
    2,
    "both firm links must preserve the CTA label",
  );
  assert.match(navSource, /data-posthog-cta-location="site_nav"/);
  assert.match(navSource, /data-posthog-cta-location="site_nav_mobile"/);
  assert.ok(
    (navSource.match(/target="_blank"/g)?.length ?? 0) >= 2,
    "both outbound firm links must open a new tab",
  );
  assert.ok(
    (navSource.match(/rel="noreferrer"/g)?.length ?? 0) >= 2,
    "both outbound firm links must protect the opener",
  );
  assert.match(navSource, /min-h-11/);
  assert.match(navSource, /min-h-12/);
  assert.doesNotMatch(navSource, /\bh-10 w-10\b/);
});

test("navigation uses one safe 1280px breakpoint across rendering and viewport logic", () => {
  assert.match(stickyNavConfigSource, /DESKTOP_SITE_NAV_BREAKPOINT_PX = 1280/);
  assert.match(
    stickyNavConfigSource,
    /!window\.matchMedia\(DESKTOP_SITE_NAV_MEDIA_QUERY\)\.matches/,
  );
  assert.match(navSource, /window\.matchMedia\(DESKTOP_SITE_NAV_MEDIA_QUERY\)/);
  assert.match(navSource, /xl:hidden/);
  assert.match(navSource, /xl:flex/);
  assert.doesNotMatch(navSource, /\b(?:md|lg):(?:hidden|flex)\b/);
  assert.match(navSource, /desktopQuery\.addEventListener\("change", closeAtDesktop\)/);
});

test("drawer state keeps closed navigation inert and open navigation keyboard-accessible", () => {
  assert.match(navSource, /aria-hidden=\{!drawerOpen\}/);
  assert.match(navSource, /inert=\{!drawerOpen\}/);
  assert.match(navSource, /drawerOpen \? "translate-x-0" : "-translate-x-full"/);
  assert.match(navSource, /event\.key !== "Escape"/);
  assert.match(navSource, /menuButtonRef\.current\?\.focus\(\)/);
  assert.doesNotMatch(navSource, /tabIndex=\{-1\}/);
});
