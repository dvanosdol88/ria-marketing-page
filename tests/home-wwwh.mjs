import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readSource = (relativePath) =>
  readFile(new URL(relativePath, import.meta.url), "utf8");

const [
  pageSource,
  calculatorSource,
  calculatorExperienceSource,
  answersSource,
  firmVisitCardSource,
  navConfigSource,
  navSource,
  stickyNavConfigSource,
  advancedCalculatorCtaSource,
  footerSource,
] = await Promise.all([
  readSource("../src/app/page.tsx"),
  readSource("../src/components/CostAnalysisCalculator.tsx"),
  readSource("../src/components/HomeCalculatorExperience.tsx"),
  readSource("../src/components/WhatWhyWhoHow.tsx"),
  readSource("../src/components/SmarterWayWealthVisitCard.tsx"),
  readSource("../src/config/siteNavConfig.ts"),
  readSource("../src/components/SiteNav.tsx"),
  readSource("../src/config/stickyNavConfig.ts"),
  readSource("../src/components/AdvancedCalculatorCta.tsx"),
  readSource("../src/components/SiteFooter.tsx"),
]);

const flatten = (source) => source.replace(/\s+/g, " ");

/* Block comments only — `//` would eat the rest of any line holding a URL.
   Needed where a comment deliberately quotes copy that was removed, which is
   otherwise indistinguishable from the copy still being there. */
const stripComments = (source) => source.replace(/\/\*[\s\S]*?\*\//g, "");

test("the default root caller selects the lean savings-calculator-upgrade path", () => {
  const selectionStart = pageSource.indexOf("let experienceMode");
  const selectionEnd = pageSource.indexOf("return (", selectionStart);
  const rootSelection = pageSource.slice(selectionStart, selectionEnd);

  assert.match(
    rootSelection,
    /else if \(\s*sequence === "savings-calculator-upgrade" \|\|\s*!hasExplicitVariant \|\|\s*isDirectMailVariant\s*\) \{\s*experienceMode = "savings-calculator-upgrade";/,
    "the default root request must select the lean homepage composition",
  );
  assert.match(
    pageSource,
    /<CostAnalysisCalculator[\s\S]*experienceMode=\{experienceMode\}/,
    "the root must pass its selected composition mode to the calculator",
  );
});

test("homepage WWWH keeps the locked order and exact approved answers", () => {
  const expected = [
    // Camel Case, not all-caps — David's call, 2026-08-07.
    [
      'label: "What"',
      "A registered investment advisor that offers an investment and financial planning relationship with an experienced, highly credentialed advisor — for just $100 a month.",
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

test("lean root composition retains the approved homepage order", () => {
  const detailLabelIndex = calculatorExperienceSource.indexOf(
    "View calculation details",
  );
  const savingsHeroIndex = calculatorSource.indexOf("<SavingsLeadHero");
  const calculatorHandoffIndex = calculatorSource.indexOf("{calculatorHandoff}");
  const calculatorIndex = calculatorSource.indexOf("<HomeCalculatorExperience");
  const calculatorSectionEndIndex = calculatorSource.indexOf(
    "</section>",
    calculatorIndex,
  );
  const answersIndex = calculatorSource.indexOf("<WhatWhyWhoHow />");
  const homeSignupIndex = calculatorSource.indexOf(
    '<SignupCta location="home_post_calculator" />',
  );
  const quoteDeckIndex = calculatorSource.indexOf("<FeeQuoteDeck />");
  const firmVisitCardIndex = calculatorSource.indexOf(
    "<SmarterWayWealthVisitCard",
  );
  for (const [marker, index] of [
    ["calculation-details label", detailLabelIndex],
    ["Savings lead hero", savingsHeroIndex],
    ["Fee Calculator handoff", calculatorHandoffIndex],
    ["calculator experience", calculatorIndex],
    ["calculator section end", calculatorSectionEndIndex],
    ["WWWH component", answersIndex],
    ["homepage primary CTA", homeSignupIndex],
    ["fee quote deck", quoteDeckIndex],
    ["homepage firm visit card", firmVisitCardIndex],
  ]) {
    assert.ok(index >= 0, `${marker} must exist before placement is compared`);
  }

  assert.ok(
    savingsHeroIndex < calculatorHandoffIndex,
    "the Savings lead must precede the Fee Calculator handoff",
  );
  assert.ok(
    calculatorHandoffIndex < calculatorIndex,
    "the Fee Calculator handoff must precede the calculator experience",
  );
  assert.ok(calculatorSectionEndIndex < answersIndex, "WWWH must follow the calculator");
  assert.ok(answersIndex < homeSignupIndex, "the primary homepage CTA must follow WWWH");
  // DECISION PROPOSED, 2026-08-13 (mockup round) — pending David's approval.
  // The swipeable fee-quote deck sits in the intentional pause between the
  // primary CTA and the firm handoff: the separation survives, but it now
  // carries the fee quotes instead of empty space.
  assert.ok(
    homeSignupIndex < quoteDeckIndex,
    "the fee quote deck must follow the primary CTA",
  );
  assert.ok(
    quoteDeckIndex < firmVisitCardIndex,
    "the firm visit card must follow the fee quote deck",
  );
  assert.equal(
    calculatorSource.match(/<FeeQuoteDeck \/>/g)?.length,
    1,
    "the quote deck must render exactly once",
  );
  assert.equal(
    calculatorSource.match(/<WhatWhyWhoHow \/>/g)?.length,
    1,
    "WWWH must render exactly once",
  );
  assert.equal(
    calculatorSource.match(/<SignupCta location="home_post_calculator" \/>/g)?.length,
    1,
    "the root must retain exactly one homepage CTA",
  );
  assert.equal(
    calculatorSource.match(/<SmarterWayWealthVisitCard\b/g)?.length,
    1,
    "the root must render exactly one broad firm visit card",
  );
  assert.match(
    calculatorSource,
    /<SmarterWayWealthVisitCard\s+advancedCalculatorHref=\{advancedCalculatorHref\}/,
    "the secondary card must carry the visitor's calculator assumptions to Save",
  );
});

test("the firm visit card is one solid green visual unit with separate tracked destinations", () => {
  const flatCard = flatten(firmVisitCardSource);
  const destinations = [
    [
      "Use the advanced calculator and see how we do the math",
      "home_firm_visit_card_calculator",
      "advancedCalculatorHref",
    ],
    ["Find out how we work", "home_firm_visit_card_how", "https://smarterwaywealth.com/how"],
    ["Learn more about David", "home_firm_visit_card_david", "https://smarterwaywealth.com/#david"],
    [
      "See our frequently asked questions",
      "home_firm_visit_card_faq",
      "https://smarterwaywealth.com/faq",
    ],
  ];

  assert.match(flatCard, /href="https:\/\/smarterwaywealth\.com\/"/);
  assert.match(flatCard, /src="\/brand\/logo\.svg"/);
  assert.match(flatCard, /alt="Smarter Way Wealth"/);
  assert.match(flatCard, /data-posthog-cta="true"/);
  assert.match(flatCard, /data-posthog-cta-label="Visit Smarter Way Wealth"/);
  assert.match(flatCard, /data-posthog-cta-location="home_firm_visit_card"/);
  // DECISION PROPOSED, 2026-08-13 (mockup round) — pending David's approval.
  //
  // The card used to follow a hard small-iPhone-height spacer (pt-[667px]) so
  // the handoff began a full phone screen after the primary CTA. The quote
  // deck now occupies that pause — the composition test above proves the deck
  // sits between the CTA and this card; this proves the empty spacer did not
  // quietly return alongside it. Comments stripped: the component's comment
  // names the retired spacer on purpose.
  assert.doesNotMatch(
    stripComments(firmVisitCardSource),
    /pt-\[667px\]/,
    "the empty phone-height spacer's job moved to the quote deck (2026-08-13)",
  );
  assert.match(flatCard, /bg-\[#007A2F\]/, "the visual unit uses solid brand green");
  assert.doesNotMatch(flatCard, /gradient/, "the visual unit stays solid rather than decorative");
  assert.match(flatCard, /target="_blank"/);
  assert.match(flatCard, /rel="noreferrer"/);
  assert.match(flatCard, />Visit<\/span>/);
  assert.equal(
    flatCard.match(/<a\b/g)?.length,
    2,
    "the source has one home link and one mapped row link, never nested links",
  );

  for (const [label, location, href] of destinations) {
    assert.ok(firmVisitCardSource.includes(label), `"${label}" must remain a destination`);
    assert.ok(firmVisitCardSource.includes(location), `"${label}" needs its own CTA location`);
    assert.ok(firmVisitCardSource.includes(href), `"${label}" must keep its direct destination`);
  }
});

test("WHAT presents the registered-advisor explanation as one sentence", () => {
  assert.match(
    answersSource,
    /A registered investment advisor that offers an investment and financial planning relationship with an experienced, highly credentialed advisor — for just \$100 a month\./,
  );
  assert.doesNotMatch(answersSource, /offers\.\.\./, "the explanation is not split by an ellipsis");
});

// DECISION CHANGED, 2026-08-12 — read before "fixing" this back.
//
// The disclaimer used to be the last block the home page rendered, and this
// suite asserted that ordering. It now lives inside the site footer, beneath
// the grey logo, where it replaced a weaker paraphrase of itself ("Calculator
// projections are hypothetical and for illustrative purposes only") that had
// been sitting there saying the same thing in softer words.
//
// Rendering it in BOTH places is the failure mode this locks against: two
// disclaimers, neither obviously the operative one, on a page whose whole
// argument is about being straight with people on fees.
test("the calculator disclaimer renders once, in the footer", () => {
  assert.match(footerSource, /<CalculatorNotes \/>/, "the footer carries the disclaimer");
  // The footer is site-wide but this text speaks of "the assumptions entered
  // here". On /faq or /privacy that refers to assumptions the page gives no way
  // to enter, so it is gated to the one route that renders the calculator.
  assert.match(
    footerSource,
    /const isCalculatorPage = pathname === "\/";/,
    "the disclaimer is gated to the calculator route",
  );
  assert.match(footerSource, /\{isCalculatorPage \? <CalculatorNotes \/> : null\}/);
  assert.doesNotMatch(
    calculatorSource,
    /<CalculatorNotes \/>/,
    "the page must not render a second copy above the footer",
  );
  // Comments stripped: the code comment there quotes the removed copy on
  // purpose, so the next person can see exactly what this replaced.
  assert.doesNotMatch(
    stripComments(footerSource),
    /Calculator projections are hypothetical/,
    "the weaker paraphrase it replaced must not come back alongside it",
  );
});

test("retired homepage conversion placements do not remain wired into the root", () => {
  assert.doesNotMatch(
    calculatorExperienceSource,
    /<(?:SignupCta|AdvancedCalculatorCta)\b/,
    "the calculator experience must not duplicate the homepage CTA or advanced promotion",
  );
  assert.doesNotMatch(
    calculatorSource,
    /AdvisorProofSections|calculatorFooter|fee_calculator_footer/,
    "advisor proof and the footer Advanced Calculator promotion must stay off-root",
  );
  assert.doesNotMatch(
    navConfigSource,
    /label: "(?:Upgrade|Improve)"|href: "\/#(?:upgrade-your-advice|improve-your-tools)"/,
    "retired root-anchor choices must not remain in site navigation",
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

// The two HOW columns were distinguished only by icon colour — green check vs
// red dollar sign. That is invisible to a red/green colour-blind reader (about
// 1 in 12 men, and this page sells to households), and it is the page's core
// differentiator. The word carries the verdict now; the colour reinforces it.
test("HOW's two columns are headed by a green Yes and a red No", () => {
  const flatAnswers = flatten(answersSource);
  assert.match(flatAnswers, /WWWH_VERDICT_CLASS\}\s*text-\[#108843\]`}>Yes</);
  assert.match(flatAnswers, /WWWH_VERDICT_CLASS\}\s*text-\[#C62828\]`}>No</);
  // DECISION CHANGED, 2026-08-13 — read before "fixing" this back. Each label
  // remains anchored to its list text, then David asked to move the verdicts
  // three spacing units (12px) right on the mobile review.
  assert.match(answersSource, /WWWH_VERDICT_CLASS =\s*\n?\s*"[^"]*text-left/);
  assert.match(answersSource, /WWWH_VERDICT_CLASS =\s*\n?\s*"[^"]*pl-8/);
  assert.match(answersSource, /WWWH_VERDICT_CLASS =\s*\n?\s*"[^"]*translate-x-3/);
  assert.doesNotMatch(answersSource, /WWWH_VERDICT_CLASS =\s*\n?\s*"[^"]*text-center/);
  // Camel Case to match What/Why/Who/How rather than shouting in caps.
  assert.doesNotMatch(answersSource, /WWWH_VERDICT_CLASS =\s*\n?\s*"[^"]*uppercase/);
  // The closing line carries the verdicts' weight but keeps the body's ink —
  // David asked for the weight, not the colour.
  //
  // DECISION EXTENDED, 2026-08-14: the line is now centred, and its opening
  // "No" is set at the verdicts' SIZE as well as their weight, so it lands as
  // the section's final answer rather than as a footnote under the right-hand
  // column. Ink still deliberately stays body-dark — David asked for the red
  // No's size and weight, not its colour.
  assert.match(answersSource, /text-center text-lg font-black leading-7 text-\[#10233A\] sm:text-xl/);
  assert.match(
    answersSource,
    /<span className="text-xl tracking-tight sm:text-2xl">\{closingLeadWord\}<\/span>/,
    "the closing line's lead word must match the verdicts' size",
  );
  // The approved copy keeps exactly one source: the lead word is split off
  // WWWH_HOW.closing rather than hard-coded beside it.
  assert.match(answersSource, /WWWH_HOW\.closing\.split\(" "\)/);
  // The verdicts must carry the same greens and reds as the icons beneath them.
  assert.match(flatAnswers, /<Check[^>]*text-\[#108843\]/);
  assert.match(flatAnswers, /<DollarSign[^>]*text-\[#C62828\]/);
});

// The results block is arithmetic, not a list. Both rules span the full grid so
// the figures sit inside a bounded column: one opens the block above the
// labels, one closes it under the second operand (David, 2026-08-12).
test("the results grid is ruled top and bottom, full width", () => {
  const flatCalc = flatten(calculatorExperienceSource);
  const rules = flatCalc.match(/<div className="col-span-2[^"]*h-px w-full bg-\[#10233A\]" \/>/g);
  assert.equal(rules?.length, 2, "a header rule and a subtraction rule, both spanning both columns");
  // The old half-width rule left an empty spacer cell beside it.
  assert.doesNotMatch(
    flatCalc,
    /<div aria-hidden="true" \/>\s*<div className="mt-2 h-px/,
    "the subtraction rule spans the grid now — no spacer cell",
  );
});

// "Difference" is the line the visitor is meant to leave with, so it outranks
// the two operand labels above it instead of matching them (David, 2026-08-12).
test("the Difference label is set larger than the operand labels", () => {
  const flatCalc = flatten(calculatorExperienceSource);
  assert.match(flatCalc, /text-\[18px\] font-bold leading-snug text-\[#10233A\] sm:text-xl">\s*Difference/);
  assert.match(flatCalc, /Paying \{formatCurrency\(annualFlatFee \/ 12\)\} a month/);
  const operandSizes = flatCalc.match(/mt-\d\s+text-\[15px\] leading-snug/g);
  assert.ok(
    (operandSizes?.length ?? 0) >= 2,
    "the two operand rows stay at 15px so Difference reads as the conclusion",
  );
});

// Locks the four spacing CONSTANTS so they cannot be nudged casually — it does
// not, and cannot, prove the heading still clears the fold. String matching is
// blind to a font-size change, a line-height change, or a new element anywhere
// above the calculator, any of which would push "The Fee Calculator" under
// while leaving these four literals untouched.
//
// The actual guarantee is measured in tests/home-first-screen.mjs, which
// renders the page at two iPhone widths and asserts the heading's bounding box
// against the usable Safari height. If you change a number here, re-measure
// there — that is the test that can fail honestly.
test("the mobile first-screen spacing constants are the measured ones", () => {
  assert.match(navSource, /collapsed \? "h-\[58px\]" : "h-\[62px\]"/, "expanded mobile header is 62px");
  // David chose to shrink the brand mark 10% rather than lose the calculator
  // heading off the first screen. That trade is what pays for the gaps below.
  assert.match(
    navSource,
    /heightClass=\{collapsed \? "h-\[34px\]" : "h-\[52px\]"\}/,
    "the 10% smaller mobile logo",
  );
  // DECISION CHANGED, 2026-08-14 — read before "fixing" these back. David asked
  // for 5px more in both gaps (header → "?" 49px → 54px; promise → The Fee
  // Calculator 73px → 78px) and released the fold constraint that had been
  // rationing them: "I'm not concerned about the fee calculator being below the
  // fold on older phones, I think the visual clarity is more important."
  assert.match(calculatorSource, /px-4 pt-\[69px\] pb-11 sm:pt-20 sm:pb-20/, "gap above the headline");
  assert.match(calculatorSource, /absolute left-1\/2 top-\[49\.6%\]/, "the decorative ? keeps pace with the taller hero");
  // The geometry test measures this element; without the hook it would fall
  // back to guessing which node is the mark.
  assert.match(calculatorSource, /data-hero-mark/, "the decorative ? keeps its stable test hook");
  assert.match(calculatorSource, /<div className="mt-\[47px\] sm:mt-20">\{introContent\}<\/div>/, "gap above the promise");
  assert.match(calculatorSource, /pb-\[78px\] text-center/, "gap below the promise");
});

// The single worst defect found on 2026-08-12, and it was invisible to every
// check that existed. The block holding "The Fee Calculator" faded in via
// whileInView with a -40px margin, so it had to be 40px inside the viewport
// before it would paint. On a phone it never is — the heading sat at rest at
// opacity 0 while measuring as comfortably above the fold, and a visitor
// arriving from the mailed QR code saw blank space until they scrolled.
//
// Animating on mount was the first fix and still wrong: an `initial` of
// opacity 0 puts opacity 0 in the server HTML, so slow hydration or no
// JavaScript leaves the heading invisible for the visitors least able to wait.
//
// `initial={false}` renders it in its final state. The geometry test proves it
// is painted; this proves nobody reintroduces the mechanism.
test("the calculator heading is never hidden behind an entrance animation", () => {
  // Comments stripped: the comment there names the mechanism on purpose, so the
  // next person knows what was removed and why it must not come back.
  const source = stripComments(calculatorSource);
  const handoffStart = source.indexOf("const calculatorHandoff =");
  assert.ok(handoffStart >= 0, "the calculator handoff block must exist");
  const handoff = source.slice(handoffStart, handoffStart + 700);

  assert.match(handoff, /initial=\{false\}/, "the block must render in its final, visible state");
  assert.doesNotMatch(
    handoff,
    /whileInView|viewport=\{/,
    "this heading must not wait to be scrolled into view before it paints",
  );
  assert.doesNotMatch(
    handoff,
    /initial=\{[^}]*opacity:\s*0/,
    "an initial opacity of 0 ships opacity 0 in the server HTML",
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

// DECISION CHANGED, 2026-08-14 — read before "fixing" this back. This test used
// to require Save, Rates, How? and FAQ all remain in the nav. David simplified
// the bar to move visitors to smarterwaywealth.com faster: "We are simplifying
// YA-PT... To that end, we will simplify the nav bar." Save pointed at this same
// homepage; Rates and How? pointed at /savings-rates and /how-it-works, both now
// retired with redirects. What the nav must still do is lock the two survivors —
// and lock that the retired three do NOT quietly return.
test("site navigation is the simplified pair, with the retired items gone", () => {
  for (const label of ["Save", "Rates", "How?"]) {
    assert.ok(
      !navConfigSource.includes(`label: "${label}"`),
      `the retired ${label} navigation item must not come back`,
    );
  }
  assert.ok(navConfigSource.includes('label: "FAQ"'), "FAQ must remain in the nav");
  // FAQ now scrolls to the homepage section rather than leaving for /faq,
  // which is retired.
  assert.match(navConfigSource, /label: "FAQ",\s*href: "\/#faq"/);

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
