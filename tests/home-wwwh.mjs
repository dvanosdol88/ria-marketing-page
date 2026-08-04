import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readSource = (relativePath) =>
  readFile(new URL(relativePath, import.meta.url), "utf8");

const [
  calculatorSource,
  calculatorExperienceSource,
  answersSource,
  dividerSource,
  stylesSource,
  navConfigSource,
  navSource,
  advancedCalculatorCtaSource,
] = await Promise.all([
  readSource("../src/components/CostAnalysisCalculator.tsx"),
  readSource("../src/components/HomeCalculatorExperience.tsx"),
  readSource("../src/components/WhatWhyWhoHow.tsx"),
  readSource("../src/components/WwwhCtaDivider.tsx"),
  readSource("../src/components/WhatWhyWhoHow.module.css"),
  readSource("../src/config/siteNavConfig.ts"),
  readSource("../src/components/SiteNav.tsx"),
  readSource("../src/components/AdvancedCalculatorCta.tsx"),
]);

const flatten = (source) => source.replace(/\s+/g, " ");

const relativeLuminance = (hex) => {
  const channels = hex
    .slice(1)
    .match(/.{2}/g)
    .map((channel) => Number.parseInt(channel, 16) / 255)
    .map((channel) =>
      channel <= 0.04045
        ? channel / 12.92
        : ((channel + 0.055) / 1.055) ** 2.4,
    );
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
};

const contrastRatio = (foreground, background) => {
  const lighter = Math.max(
    relativeLuminance(foreground),
    relativeLuminance(background),
  );
  const darker = Math.min(
    relativeLuminance(foreground),
    relativeLuminance(background),
  );
  return (lighter + 0.05) / (darker + 0.05);
};

test("homepage WWWH keeps the locked order and exact approved answers", () => {
  const expected = [
    [
      'label: "WHAT"',
      "Smarter Way Wealth provides an investment and financial planning relationship with an experienced, highly credentialed advisor, for just $100 a month.",
    ],
    [
      'label: "WHY"',
      "Because not everyone needs to be paying massive, asset-based fees to get good advice.",
    ],
    [
      'label: "WHO"',
      "David Van Osdol, CFA charterholder and CFP® professional, with over 20 years’ experience.",
    ],
    [
      'label: "HOW"',
      "We use technology to automate back-office functions, have no corporate overhead, and use published asset allocation models from firms like Goldman Sachs, Fidelity, and Schwab, with low-to-no-cost mutual funds and ETFs. No need to move your accounts.",
    ],
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
  const dividerIndex = calculatorSource.indexOf("<WwwhCtaDivider />");
  const advisorIndex = calculatorSource.indexOf("<AdvisorProofSections />");

  for (const [marker, index] of [
    ["calculation-details label", detailLabelIndex],
    ["advanced-calculator handoff", advancedHandoffIndex],
    ["calculator experience", calculatorIndex],
    ["calculator section end", calculatorSectionEndIndex],
    ["WWWH component", answersIndex],
    ["CTA divider", dividerIndex],
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
  assert.ok(answersIndex < dividerIndex, "the action divider must follow HOW");
  assert.ok(dividerIndex < advisorIndex, "advisor proof must remain after the divider");
  assert.equal(
    calculatorSource.match(/<WhatWhyWhoHow \/>/g)?.length,
    1,
    "WWWH must render exactly once",
  );
});

test("WWWH uses semantic cardless fields with responsive spine and reduced motion", () => {
  assert.match(answersSource, /<motion\.section/);
  assert.match(answersSource, /<h2 className=\{styles\.label\}/);
  assert.doesNotMatch(answersSource, /<article|card|rounded|shadow/i);
  assert.doesNotMatch(stylesSource, /border-radius|box-shadow/);
  assert.match(stylesSource, /writing-mode: vertical-rl/);
  assert.match(stylesSource, /transform: rotate\(180deg\)/);
  assert.match(stylesSource, /writing-mode: horizontal-tb/);
  assert.match(stylesSource, /transform: none/);
  assert.match(stylesSource, /font-size: clamp\(2\.6rem, 6\.9vw, 6\.2rem\)/);
  assert.match(stylesSource, /@media \(max-width: 700px\)/);
  assert.match(answersSource, /useReducedMotion\(\)/);
  assert.match(stylesSource, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(stylesSource, /\.answer,\s*\.labelSettle\s*\{[^}]*opacity: 1 !important/s);
  assert.match(stylesSource, /\.answer,\s*\.labelSettle\s*\{[^}]*transform: none !important/s);
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

test("inline FAQ and equal divider links retain exact targets and analytics attributes", () => {
  const flatAnswers = flatten(answersSource);
  assert.match(
    flatAnswers,
    /href="\/faq" data-posthog-cta="true" data-posthog-cta-label="FAQ" data-posthog-cta-location="home_wwwh_how"/,
  );

  const expectedLinks = [
    ['label: "Get started"', 'href: "https://smarterwaywealth.com/meet"'],
    [
      'label: "See if SWW is a good fit"',
      'href: "https://smarterwaywealth.com/#fit"',
    ],
    ['label: "FAQ"', 'href: "/faq"'],
  ];
  let priorIndex = -1;
  for (const markers of expectedLinks) {
    const indexes = markers.map((marker) => dividerSource.indexOf(marker));
    assert.ok(
      indexes.every((index) => index > priorIndex),
      `${markers[0]} target must remain exact`,
    );
    priorIndex = Math.max(...indexes);
  }

  assert.match(dividerSource, /target=\{link\.external \? "_blank" : undefined\}/);
  assert.match(dividerSource, /rel=\{link\.external \? "noreferrer" : undefined\}/);
  assert.match(dividerSource, /data-posthog-cta="true"/);
  assert.match(dividerSource, /data-posthog-cta-label=\{link\.label\}/);
  assert.match(dividerSource, /data-posthog-cta-location="home_wwwh_divider"/);
  assert.match(stylesSource, /grid-template-columns: repeat\(3, minmax\(0, 1fr\)\)/);
  assert.match(stylesSource, /min-height: 88px/);
  assert.match(stylesSource, /linear-gradient/);
});

test("divider palette uses only approved token pairs with accessible contrast", () => {
  const approvedPairs = [
    ["#10233a", "#d9e9f3", "first link"],
    ["#10233a", "#c8ddea", "middle link"],
    ["#ffffff", "#064b84", "final link"],
    ["#10233a", "#eef0f5", "first hover"],
    ["#10233a", "#d9e9f3", "middle hover"],
    ["#ffffff", "#062b43", "final hover"],
  ];

  for (const [foreground, background, label] of approvedPairs) {
    assert.ok(
      contrastRatio(foreground, background) >= 4.5,
      `${label} must meet WCAG AA text contrast`,
    );
  }

  assert.doesNotMatch(stylesSource, /#b8d8ec|#357ead|#8fc0de|#1f6797/i);
  assert.match(stylesSource, /\.dividerLink:first-child \{\s*background: #d9e9f3/);
  assert.match(stylesSource, /\.dividerLink:nth-child\(2\) \{\s*background: #c8ddea/);
  assert.match(stylesSource, /\.dividerLink:last-child \{[^}]*background: #064b84/);
  assert.match(
    stylesSource,
    /\.dividerLink:first-child:focus-visible \{\s*background: #eef0f5;\s*color: #10233a/,
  );
  assert.match(
    stylesSource,
    /\.dividerLink:nth-child\(2\):focus-visible \{\s*background: #d9e9f3;\s*color: #10233a/,
  );
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
});
