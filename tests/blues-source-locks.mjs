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

const [config, opening, check, calculator, nextConfig, rootLayout, siteLayout, bluesLayout, bluesPage] =
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
  assert.doesNotMatch(opening, /["']use client["']/, "opening copy has no hooks or browser APIs");
});

test("the blue page composes the shared engine in one-percent-blues mode", () => {
  assert.match(bluesPage, /experienceMode="one-percent-blues"/);
  assert.match(calculator, /const isOnePercentBlues = experienceMode === "one-percent-blues";/);
  assert.match(calculator, /<BluesOpening/);
  assert.match(
    calculator,
    /<SignupCta location="blues_post_calculator" surfaceClassName="bg-transparent" primaryHref=\{bluesLinks\.signup\} \/>/,
  );
  assert.match(calculator, /<HomeFaqSection tone="blues" \/>/);
  assert.match(
    calculator,
    /const calculatorTheme = isOnePercentBlues \? bluesCalculatorTheme : marketingVariant\.calculator;/,
  );
});

test("site chrome lives on the route groups, never on the root layout", async () => {
  const chrome = await read("../src/components/blues/BluesChrome.tsx");
  assert.doesNotMatch(rootLayout, /SiteNav|SiteFooter|application\/ld\+json/);
  assert.match(siteLayout, /<SiteNav \/>/);
  assert.match(siteLayout, /<SiteFooter \/>/);
  assert.match(bluesLayout, /from ["']@\/app\/bluesFonts["']/);
  assert.match(bluesLayout, /bluesShellClassName/);
  assert.match(bluesLayout, /data-theme="blues"/);
  assert.match(bluesLayout, /<BluesHeader \/>/);
  assert.match(bluesLayout, /<BluesFooter \/>/);
  assert.doesNotMatch(bluesLayout, /BluesChrome/);
  assert.match(chrome, /["']use client["']/);
  assert.match(chrome, /data-theme="blues"/);
  assert.match(chrome, /<BluesHeader \/>/);
  assert.match(chrome, /<BluesFooter \/>/);
});

test("host rules: known green doors bounce; unknown paths stay for the blues 404", () => {
  assert.match(nextConfig, /beforeFiles: \[/);
  assert.match(nextConfig, /\{ source: "\/", has: \[bluesHost\], destination: "\/blues" \}/);
  for (const host of ["1percentblues.com", "www.1percentblues.com"]) {
    assert.ok(nextConfig.includes(`"${host}"`), `${host} must redirect to onepercentblues.com`);
  }
  assert.match(nextConfig, /BLUES_GREEN_PATHS/);
  for (const path of ["/our-math", "/become-a-client", "/privacy"]) {
    assert.ok(nextConfig.includes(`"${path}"`), `green bounce missing: ${path}`);
  }
  assert.match(nextConfig, /destination: `\$\{GREEN_ORIGIN\}\$\{source\}`/);
  // Rack 05-75: /blues off the blue host 308s to the blue home, not a duplicate page.
  assert.match(
    nextConfig,
    /\{ source: "\/blues", missing: \[bluesHost\], destination: `\$\{BLUES_ORIGIN\}\/`, permanent: true \}/,
  );
  assert.doesNotMatch(
    nextConfig,
    /BLUES_PASSTHROUGH|\(\?!\s*\$\{BLUES_PASSTHROUGH\}\)/,
    "a catch-all bounce would send unknown blue-host paths to the green 404",
  );
});

test("the blue layout overrides every icon slot with the blues mark", async () => {
  const icons = await read("../src/components/blues/bluesIcons.ts");
  const iconsBlock = icons.match(/export const bluesIconMetadata[\s\S]*?\n\};/)?.[0] ?? "";
  assert.match(bluesLayout, /icons:\s*bluesIconMetadata/);
  assert.match(iconsBlock, /icon: \[\{ url: "\/brand\/blues-icon\.svg", type: "image\/svg\+xml" \}\]/);
  assert.match(iconsBlock, /shortcut: \[\{ url: "\/brand\/blues-icon\.svg", type: "image\/svg\+xml" \}\]/);
  assert.match(iconsBlock, /apple: \[\{ url: "\/brand\/blues-icon\.svg", type: "image\/svg\+xml" \}\]/);
  assert.doesNotMatch(iconsBlock, /apple-touch-icon\.png|favicon-\d+x\d+\.png|logo-icon\.svg/);
});

test("the blue host rewrites conventional favicon paths to the blues icon", async () => {
  const config = await read("../next.config.mjs");
  assert.match(
    config,
    /source: "\/:file\(\(\?:favicon\|apple-touch-icon\|android-chrome\)\.\*\)"[\s\S]*destination: "\/brand\/blues-icon\.svg"/,
  );
});

test("the blue host serves its own PWA file and does not bounce it to green", async () => {
  const [config, bluesManifest, proxy] = await Promise.all([
    read("../next.config.mjs"),
    read("../src/app/(blues)/blues/site.webmanifest/route.ts"),
    read("../src/proxy.ts"),
  ]);
  const greenPaths = config.match(/const BLUES_GREEN_PATHS = \[([\s\S]*?)\];/)?.[1] ?? "";
  assert.doesNotMatch(
    greenPaths,
    /webmanifest|android-chrome/,
    "a 307 of the green PWA files would conflict with the stay-on-blue 404 rule",
  );
  assert.match(
    config,
    /source: "\/site\.webmanifest"[\s\S]*destination: "\/blues\/site\.webmanifest"/,
  );
  assert.match(bluesManifest, /name: "One Percent Blues"/);
  assert.match(bluesManifest, /theme_color: "#1E3A8A"/);
  assert.match(bluesManifest, /src: "\/brand\/blues-icon\.svg"/);
  assert.doesNotMatch(bluesManifest, /Smarter Way Wealth|#00A540|android-chrome-\d+x\d+\.png/);
  assert.match(proxy, /\/api\/become-a-client/);
  assert.match(proxy, /\/api\/gallery\/statuses/);
  assert.match(proxy, /\/api\/eddm-evals/);
  assert.match(proxy, /\/api\/savings-rates/);
  assert.match(proxy, /\/api\/analytics\/mailer-scans/);
  assert.match(proxy, /\/api\/calculator/);
  assert.match(proxy, /\/api\/version/);
  assert.match(proxy, /\/agent-info\.json/);
  const matcher = proxy.match(/matcher:\s*\[([\s\S]*?)\]/)?.[1] ?? "";
  assert.match(matcher, /"\/api\/og"/);
  assert.doesNotMatch(matcher, /"\/api\/og\/blues"/);
  assert.doesNotMatch(matcher, /"\/api\/quiz/);
  assert.match(proxy, /og\(\?!\\?\//);
  assert.match(proxy, /isBluesHostname/);
  assert.doesNotMatch(proxy, /isBluesContentHost/);
  assert.match(proxy, /status: 404/);
  assert.match(proxy, /export function proxy/);
});

test("the shared Blues host helper is one function, not unused host lists", async () => {
  const bluesHost = await read("../src/lib/bluesHost.ts");
  assert.match(bluesHost, /export function isBluesHostname/);
  assert.match(bluesHost, /export function requestHostname/);
  assert.doesNotMatch(
    bluesHost,
    /BLUES_APEX_HOST|BLUES_WWW_HOST|BLUES_CONTENT_HOSTS|BLUES_ALIAS_HOSTS|isBluesContentHost/,
  );
});

test("root not-found uses blues chrome on the blue host and green chrome elsewhere", async () => {
  const notFound = await read("../src/app/not-found.tsx");
  const icons = await read("../src/components/blues/bluesIcons.ts");
  assert.match(notFound, /BluesChrome/);
  assert.match(notFound, /SiteNav/);
  assert.match(notFound, /SiteFooter/);
  assert.match(notFound, /headers\(\)/);
  assert.match(notFound, /requestHostname\(await headers\(\)\)/);
  assert.match(notFound, /BLUES_ORIGIN/);
  assert.match(notFound, /generateMetadata/);
  assert.match(notFound, /bluesNotFoundMetadata/);
  assert.match(icons, /Page not found \| One Percent Blues/);
  assert.match(icons, /siteName: "One Percent Blues"/);
});

test("the share and poll panels show the blue domain and blue card on the blue host", async () => {
  const shareConfig = await read("../src/lib/siteCalculatorConfig.ts");
  const experience = await read("../src/components/HomeCalculatorExperience.tsx");
  assert.match(shareConfig, /displayDomain: BLUES_HOST/);
  assert.match(shareConfig, /shareCardRoute: "\/api\/og\/blues"/);
  assert.match(shareConfig, /export function isBluesShareMode/);
  assert.match(shareConfig, /export function shareCardPathForMode/);
  assert.doesNotMatch(shareConfig, /window\.location/);
  assert.match(shareConfig, /GREEN_SHARE_DOMAIN = "youarepayingtoomuch\.com"/);
  assert.match(experience, /shareCardPathForMode\(shareQuery, isBluesShareMode\(accent\)\)/);
  assert.match(bluesPage, /data-blues-share-domain=\{bluesShareSite\.displayDomain\}/);
});
