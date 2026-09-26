/**
 * One Percent Blues — source locks. File-only, no browser: the approved copy,
 * the diagnosis rule, the composition, the chrome split and the host rules
 * must stay exactly as David approved them (docs/superpowers/specs/
 * 2026-09-17-one-percent-blues-design.md). tests/blues-host-routing.mjs
 * exercises the same contract against a running server.
 */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (relativePath) => readFile(new URL(relativePath, import.meta.url), "utf8");

const [config, opening, check, calculator, nextConfig, rootLayout, siteLayout, bluesLayout, bluesPage, bluesRobots] =
  await Promise.all([
    read("../src/config/onePercentBlues.ts"),
    read("../src/components/blues/BluesOpening.tsx"),
    read("../src/components/blues/BluesCheck.tsx"),
    read("../src/components/CostAnalysisCalculator.tsx"),
    read("../next.config.mjs"),
    read("../src/app/layout.tsx"),
    read("../src/app/(site)/layout.tsx"),
    read("../src/app/(blues)/blues/layout.tsx"),
    read("../src/app/(blues)/blues/page.tsx"),
    read("../src/app/(blues)/blues/robots.txt/route.ts"),
  ]);

test("the approved headline and check copy have one source", () => {
  assert.match(config, /headline: \{ lead: "Got the", emphasis: "1% Blues\?" \}/);
  for (const question of [
    "Do you pay a percentage of your portfolio for advice?",
    "Do you know what you paid last year, in dollars?",
    "Did the amount you actually pay go up?",
  ]) {
    assert.ok(config.includes(question), `question missing: ${question}`);
  }
  assert.match(config, /heading: "Yep\. That's the 1% Blues\."/);
  assert.match(config, /heading: "A mild case\. Still a case\."/);
  assert.match(config, /heading: "No percentage fee, or not sure\?"/);
  assert.match(
    config,
    /primaryCta: \{ label: "Get the cure — meet David", href: SMARTER_WAY_WEALTH_MEET_URL \}/,
  );
  // Video meetings only, never custody: both are standing decisions.
  assert.doesNotMatch(config, /phone|call us|takes custody|custody of your/i);
});

test("the diagnosis card waits for all three answers and links the disclaimer", () => {
  assert.match(config, /if \(!answers\.q1 \|\| !answers\.q2 \|\| !answers\.q3\) return null;/);
  assert.match(check, /diagnoseBlues\(answers\)/);
  assert.match(check, /parseBluesAnswers\(initialCheck\)/, "a ?check= link seeds the answers");
  assert.match(calculator, /initialCheck=\{paramsFromServer\.get\("check"\)\}/);
  assert.match(check, /href=\{disclaimerHref\}/);
  assert.match(check, /data-posthog-cta-location="blues_diagnosis_meet"/);
  assert.match(check, /data-posthog-cta-location="blues_diagnosis_calculator"/);
  assert.match(opening, /<noscript>/, "readers without JavaScript still get the number and the cure");
});

test("the blue page composes the shared engine in one-percent-blues mode", () => {
  assert.match(bluesPage, /experienceMode="one-percent-blues"/);
  assert.match(calculator, /const isOnePercentBlues = experienceMode === "one-percent-blues";/);
  assert.match(calculator, /<BluesOpening/);
  assert.match(
    calculator,
    /<SignupCta location="blues_post_calculator" surfaceClassName="bg-transparent" primaryHref=\{bluesLinks\.signup\} \/>/,
  );
  assert.match(calculator, /<a href=\{bluesLinks\.ourMath\}/, "green routes are absolute plain links on the blue page");
  assert.match(calculator, /<HomeFaqSection tone="blues" \/>/);
  assert.match(
    calculator,
    /const calculatorTheme = isOnePercentBlues \? bluesCalculatorTheme : marketingVariant\.calculator;/,
  );
});

test("site chrome lives on the route groups, never on the root layout", () => {
  assert.doesNotMatch(rootLayout, /SiteNav|SiteFooter|application\/ld\+json/);
  assert.match(siteLayout, /<SiteNav \/>/);
  assert.match(siteLayout, /<SiteFooter \/>/);
  assert.match(bluesLayout, /data-theme="blues"/);
  assert.match(bluesLayout, /<BluesHeader \/>/);
  assert.match(bluesLayout, /<BluesFooter \/>/);
  assert.match(bluesLayout, /metadataBase: new URL\(BLUES_ORIGIN\)/);
});

test("host rules: the blue domain is one page and the other hostnames redirect there", () => {
  assert.match(nextConfig, /beforeFiles: \[/);
  assert.match(nextConfig, /\{ source: "\/", has: \[bluesHost\], destination: "\/blues" \}/);
  for (const host of ["1percentblues.com", "www.1percentblues.com"]) {
    assert.ok(nextConfig.includes(`"${host}"`), `${host} must redirect to onepercentblues.com`);
  }
  assert.match(nextConfig, /destination: `\$\{GREEN_ORIGIN\}\/:path`/);
  assert.match(nextConfig, /\(\?!\$\{BLUES_PASSTHROUGH\}\)\.\+/, "the catch-all must never match '/'");
  assert.ok(
    !nextConfig.includes("webmanifest"),
    "the green PWA manifest must bounce off the blue host, not stay in the passthrough",
  );
  for (const line of [
    "Disallow: /api/quiz/",
    "Disallow: /api/eddm-evals/",
    "Disallow: /gallery",
    "Disallow: /eddm-evals",
    "Disallow: /evals",
    "Disallow: /calculator-evals",
    "Disallow: /url-evals",
  ]) {
    assert.ok(bluesRobots.includes(line), `blues robots must include ${line}`);
  }
});
