/**
 * 2026-10-11 Blues nightly audit: shared chrome, skip green page-counts on
 * the blue host, leave-site icon on the blue sign-up button, and a blue crash
 * screen. File-only — the host-routing suite still proves the 404 in a browser.
 */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (relativePath) => readFile(new URL(relativePath, import.meta.url), "utf8");

const [
  rootLayout,
  siteAnalytics,
  bluesHost,
  chrome,
  icons,
  notFound,
  bluesLayout,
  bluesGroupError,
  bluesPageError,
  bluesCrashPanel,
  globalError,
  signup,
] = await Promise.all([
  read("../src/app/layout.tsx"),
  read("../src/components/SiteAnalytics.tsx"),
  read("../src/lib/bluesHost.ts"),
  read("../src/components/blues/BluesChrome.tsx"),
  read("../src/components/blues/bluesIcons.ts"),
  read("../src/app/not-found.tsx"),
  read("../src/app/(blues)/blues/layout.tsx"),
  read("../src/app/(blues)/error.tsx"),
  read("../src/app/(blues)/blues/error.tsx"),
  read("../src/components/blues/BluesCrashPanel.tsx"),
  read("../src/app/global-error.tsx"),
  read("../src/components/SignupCta.tsx"),
]);

test("the green page-count tag is skipped on the Blues host", () => {
  assert.doesNotMatch(rootLayout, /<Analytics\s*\/>/);
  assert.match(rootLayout, /<SiteAnalytics\s*\/>/);
  assert.match(siteAnalytics, /isBluesHostname/);
  assert.match(bluesHost, /www\.\$\{BLUES_HOST\}/);
  assert.match(bluesHost, /name === BLUES_HOST/);
  assert.match(bluesHost, /export function isBluesHostname/);
  assert.match(bluesHost, /split\(":"\)\[0\]\.replace\(/);
  assert.doesNotMatch(
    bluesHost,
    /BLUES_APEX_HOST|BLUES_WWW_HOST|BLUES_CONTENT_HOSTS|BLUES_ALIAS_HOSTS|isBluesContentHost/,
  );
});

test("the blue layout and the root 404 share one chrome and icon helper", () => {
  assert.match(bluesLayout, /from ["']@\/app\/bluesFonts["']/);
  assert.match(bluesLayout, /bluesShellClassName/);
  assert.match(bluesLayout, /data-theme="blues"/);
  assert.match(bluesLayout, /<BluesHeader \/>/);
  assert.match(bluesLayout, /<BluesFooter \/>/);
  assert.match(bluesLayout, /icons:\s*bluesIconMetadata/);
  assert.doesNotMatch(bluesLayout, /BluesChrome/);
  assert.match(notFound, /<BluesChrome>/);
  assert.match(notFound, /bluesNotFoundMetadata/);
  assert.match(chrome, /["']use client["']/);
  assert.match(chrome, /data-theme="blues"/);
  assert.match(chrome, /<BluesHeader \/>/);
  assert.match(chrome, /<BluesFooter \/>/);
  assert.match(icons, /\/brand\/blues-icon\.svg/);
  assert.match(notFound, /headers\(\)/);
  assert.match(notFound, /requestHostname\(await headers\(\)\)/);
  assert.doesNotMatch(notFound, /export const dynamic = "force-dynamic"/);
});

test("a Blues crash uses the same chrome instead of the generic Next screen", () => {
  assert.match(bluesGroupError, /BluesChrome/);
  assert.match(bluesGroupError, /BluesCrashPanel/);
  assert.match(bluesPageError, /BluesCrashPanel/);
  assert.match(globalError, /import\s+["']\.\/globals\.css["']/);
  assert.match(bluesCrashPanel, /Sentry\.captureException/);
  assert.doesNotMatch(bluesGroupError, /Sentry\.captureException/);
  assert.doesNotMatch(bluesPageError, /Sentry\.captureException/);
  // Unknown host must not assume "not Blues" — that first-painted the green Next screen.
  assert.doesNotMatch(globalError, /\(\)\s*=>\s*false/);
  // Empty first paint must not flash the green-site grey; a known Blues crash is navy.
  assert.match(globalError, /backgroundColor:\s*["']transparent["']/);
  assert.match(globalError, /className="bg-\[#1E3A8A\]"/);
});

test("the blue body is navy, not the green-site grey", async () => {
  const css = await read("../src/app/globals.css");
  assert.match(css, /body:has\(\[data-theme="blues"\]\)/);
  assert.match(rootLayout, /has-\[\[data-theme=blues\]\]:bg-\[#1E3A8A\]/);
});

test("an off-site Blues sign-up button uses the leave-site icon", () => {
  assert.match(signup, /primaryLeavesSite/);
  assert.match(
    signup,
    /primaryLeavesSite \? \(\s*<ExternalLink aria-hidden="true" className="h-\[1\.25em\] w-\[1\.25em\] shrink-0"/,
  );
  assert.match(signup, /import \{ ArrowRight, BadgeCheck, ExternalLink \} from "lucide-react"/);
});
