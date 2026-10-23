/**
 * Blues traffic must not pollute YAPT analytics: pageviews use the address-bar
 * URL, and onepercentblues.com never increments the mailer visit counter.
 */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { registerHooks } from "node:module";
import test from "node:test";
import { buildPageviewCurrentUrl } from "../src/lib/bluesAnalyticsHost.ts";
import { exitQrVerification } from "../src/lib/qrVerification.ts";

const read = (relativePath) => readFile(new URL(relativePath, import.meta.url), "utf8");

/** Same rules as src/lib/bluesHost.ts — that file imports a path alias Node cannot load here. */
function isBluesHostname(host) {
  const name = (host ?? "").trim().toLowerCase().split(":")[0].replace(/\.$/, "");
  return name === "onepercentblues.com" || name === "www.onepercentblues.com";
}

test("onepercentblues.com and www are blues hosts, including a port or trailing dot", async () => {
  const bluesHost = await read("../src/lib/bluesHost.ts");
  assert.match(
    bluesHost,
    /\(host \?\? ""\)\.trim\(\)\.toLowerCase\(\)\.split\(":"\)\[0\]\.replace\(\/\\\.\$\/, ""\)/,
  );
  assert.match(bluesHost, /name === BLUES_HOST \|\| name === `www\.\$\{BLUES_HOST\}`/);
  assert.equal(isBluesHostname("onepercentblues.com"), true);
  assert.equal(isBluesHostname("www.onepercentblues.com"), true);
  assert.equal(isBluesHostname("WWW.OnePercentBlues.com"), true);
  assert.equal(isBluesHostname("onepercentblues.com."), true);
  assert.equal(isBluesHostname("onepercentblues.com:443"), true);
  assert.equal(isBluesHostname("www.onepercentblues.com:443"), true);
  assert.equal(isBluesHostname("onepercentblues.com.:443"), true);
  assert.equal(isBluesHostname(" youarepayingtoomuch.com "), false);
  assert.equal(isBluesHostname("youarepayingtoomuch.com"), false);
  assert.equal(isBluesHostname("youarepayingtoomuch.com:443"), false);
  assert.equal(isBluesHostname("www.youarepayingtoomuch.com"), false);
});

test("pageview URL uses the address-bar path, not a rewritten /blues path", () => {
  assert.equal(
    buildPageviewCurrentUrl({
      origin: "https://onepercentblues.com",
      pathname: "/",
      search: "",
    }),
    "https://onepercentblues.com/",
  );
  assert.equal(
    buildPageviewCurrentUrl({
      origin: "https://onepercentblues.com",
      pathname: "/",
      search: "?check=yyy",
    }),
    "https://onepercentblues.com/?check=yyy",
  );
  assert.equal(
    buildPageviewCurrentUrl({
      origin: "https://youarepayingtoomuch.com",
      pathname: "/our-math",
      search: "",
    }),
    "https://youarepayingtoomuch.com/our-math",
  );
  assert.notEqual(
    buildPageviewCurrentUrl({
      origin: "https://onepercentblues.com",
      pathname: "/",
      search: "",
    }),
    "https://onepercentblues.com/blues",
  );
});

test("PostHogPageView builds $current_url from window.location and skips blues mailer counts", async () => {
  const pageView = await read("../src/components/PostHogPageView.tsx");
  assert.match(pageView, /buildPageviewCurrentUrl\(window\.location\)/);
  assert.doesNotMatch(pageView, /window\.location\.origin \+ pathname|origin\}\$\{pathname\}/);
  assert.match(pageView, /isBluesHostname\(window\.location\.hostname\)/);
  assert.doesNotMatch(pageView, /isBluesAnalyticsHost/);
  assert.match(pageView, /onBlues \? false : syncQrVerification\(\)/);
  assert.match(
    pageView,
    /if \(!onBlues\) \{\s*void reportDocumentMeasurement\(\)/,
  );
  const skipAt = pageView.search(/if \(!onBlues\) \{\s*void reportDocumentMeasurement\(\)/);
  const stripAt = pageView.search(/searchParams\.delete\("qrtest"\)/);
  assert.ok(skipAt >= 0 && stripAt > skipAt, "Blues still strips qrtest/selftest after skipping mailer counts");
});

test("the duplicate blues analytics host helper is gone", async () => {
  const analyticsHost = await read("../src/lib/bluesAnalyticsHost.ts");
  assert.doesNotMatch(analyticsHost, /isBluesAnalyticsHost|BLUES_ANALYTICS_HOSTS/);
  assert.match(analyticsHost, /export function buildPageviewCurrentUrl/);
});

test("the blues FAQ door uses its own PostHog location; the green home keeps the original", async () => {
  const faq = await read("../src/components/HomeFaqSection.tsx");
  assert.match(
    faq,
    /tone === "blues" \? "blues_faq_all_questions" : "home_faq_all_questions"/,
  );
  assert.match(faq, /home_faq_all_questions/);
});

test("PostHogProvider and capturePostHogEvent skip QR sync on Blues the same way PostHogPageView does", async () => {
  const provider = await read("../src/components/PostHogProvider.tsx");
  const posthog = await read("../src/lib/posthog.ts");
  assert.match(provider, /isBluesHostname\(window\.location\.hostname\)/);
  assert.match(posthog, /isBluesHostname\(window\.location\.hostname\)/);
  assert.equal(
    [...provider.matchAll(/onBlues \? false : syncQrVerification\(\)/g)].length,
    2,
    "before_send and loaded must both gate QR sync",
  );
  assert.equal(
    [...posthog.matchAll(/onBlues \? false : syncQrVerification\(\)/g)].length,
    1,
    "capturePostHogEvent must gate QR sync",
  );
  assert.equal(provider.match(/syncQrVerification\(\)/g)?.length, 2);
  assert.equal(posthog.match(/syncQrVerification\(\)/g)?.length, 1);
});

const qrVerificationUrl = new URL("../src/lib/qrVerification.ts", import.meta.url).href;
const qrVerificationWrapper = `
export {
  QR_VERIFICATION_QUERY, QR_VERIFICATION_COOKIE, QR_VERIFICATION_SESSION,
  hasQrVerificationCookie, exitQrVerification,
} from ${JSON.stringify(qrVerificationUrl)};
import { syncQrVerification as actualSync } from ${JSON.stringify(qrVerificationUrl)};
export function syncQrVerification(search) {
  globalThis.__syncQrVerificationCalls.push(globalThis.window?.location?.hostname ?? null);
  return actualSync(search);
}
`;

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "@/lib/qrVerification") {
      return { shortCircuit: true, url: `data:text/javascript,${encodeURIComponent(qrVerificationWrapper)}` };
    }
    if (specifier === "posthog-js") {
      return {
        shortCircuit: true,
        url: `data:text/javascript,${encodeURIComponent("export default {capture:(event,properties)=>globalThis.__events.push({event,properties}),unregister:()=>{}};")}`,
      };
    }
    if (specifier === "@/lib/redditPixel") {
      return {
        shortCircuit: true,
        url: `data:text/javascript,${encodeURIComponent("export const mirrorPostHogEventToReddit=()=>{};")}`,
      };
    }
    if (specifier.startsWith("@/")) {
      return nextResolve(new URL(`../src/${specifier.slice(2)}.ts`, import.meta.url).href, context);
    }
    return nextResolve(specifier, context);
  },
});

function analyticsWindow(url) {
  const cookies = new Map();
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
  globalThis.document = {
    get cookie() {
      return Array.from(cookies).map(([key, value]) => `${key}=${value}`).join("; ");
    },
    set cookie(value) {
      const [pair, ...attributes] = value.split(";");
      const [key, content] = pair.split("=");
      if (!content || attributes.some((part) => part.trim() === "Max-Age=0")) cookies.delete(key);
      else cookies.set(key, content);
    },
  };
  globalThis.window = {
    location: new URL(url),
    localStorage: storage,
    sessionStorage: storage,
  };
  exitQrVerification();
  globalThis.__events = [];
  globalThis.__syncQrVerificationCalls = [];
  return { cookies };
}

test("Blues hosts never call syncQrVerification from capturePostHogEvent; the green host still does", async () => {
  let importId = 0;
  const blues = analyticsWindow("https://onepercentblues.com/?qrtest=1");
  const bluesPh = await import(`../src/lib/posthog.ts?host=blues-${++importId}`);
  bluesPh.capturePostHogEvent("blues_check_q1");
  assert.deepEqual(globalThis.__syncQrVerificationCalls, []);
  assert.equal(blues.cookies.has("yapt_qr_verification"), false);
  assert.notEqual(globalThis.__events[0].properties.qr_verification, true);
  assert.notEqual(globalThis.__events[0].properties.self_test, true);

  const wwwBlues = analyticsWindow("https://www.onepercentblues.com/?qrtest=1");
  const wwwPh = await import(`../src/lib/posthog.ts?host=www-blues-${++importId}`);
  wwwPh.capturePostHogEvent("calculator_submitted");
  assert.deepEqual(globalThis.__syncQrVerificationCalls, []);
  assert.equal(wwwBlues.cookies.has("yapt_qr_verification"), false);
  assert.notEqual(globalThis.__events[0].properties.qr_verification, true);

  const green = analyticsWindow("https://youarepayingtoomuch.com/?qrtest=1");
  const greenPh = await import(`../src/lib/posthog.ts?host=green-${++importId}`);
  greenPh.capturePostHogEvent("calculator_submitted");
  assert.deepEqual(globalThis.__syncQrVerificationCalls, ["youarepayingtoomuch.com"]);
  assert.equal(green.cookies.has("yapt_qr_verification"), true);
  assert.equal(globalThis.__events[0].properties.qr_verification, true);
  assert.equal(globalThis.__events[0].properties.self_test, true);
});
