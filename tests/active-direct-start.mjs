import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function readSource(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}

const pageSource = readSource("src/app/(site)/become-a-client/page.tsx");
const apiSource = readSource("src/app/api/become-a-client/route.ts");
const formSource = readSource("src/components/BecomeAClientForm.tsx");
const navSource = readSource("src/components/SiteNav.tsx");
const signupConfigSource = readSource("src/config/signupCta.ts");
const privacySource = readSource("src/app/(site)/privacy/page.tsx");
const llmsSource = readSource("public/llms.txt");
const sitemapSource = readSource("public/sitemap.xml");
const nextConfigSource = readSource("next.config.mjs");

test("direct onboarding is active and the paused experience is absent", () => {
  const combined = [
    pageSource,
    apiSource,
    formSource,
    navSource,
    signupConfigSource,
    llmsSource,
    sitemapSource,
  ].join("\n");

  assert.doesNotMatch(combined, /direct onboarding (?:is )?(?:temporarily )?paused/i);
  assert.doesNotMatch(combined, /start paused/i);
  assert.match(pageSource, /<BecomeAClientForm \/>/);
  assert.match(pageSource, /One flat fee\. \$100 a month\./);
  assert.match(formSource, /Send me the agreement/);
  assert.match(apiSource, /collection\(LEADS_COLLECTION\)/);
  assert.match(apiSource, /agreementDelivered: false/);
  assert.match(signupConfigSource, /label: "Become a client — \$100\/month"/);
  assert.match(
    signupConfigSource,
    /export const SIGNUP_PATH = "https:\/\/smarterwaywealth\.com\/onboarding\/verify"/,
  );
  assert.match(navSource, />\s*Become a client\s*<ExternalLink/);
  // David, 2026-11-13: the old form is retired. Its address forwards to the
  // secure sign-up, so it is no longer listed for search engines or assistants.
  assert.doesNotMatch(sitemapSource, /become-a-client/);
  assert.doesNotMatch(llmsSource, /youarepayingtoomuch\.com\/become-a-client/);
  assert.match(nextConfigSource, /source: "\/become-a-client",[\s\S]{0,120}destination: "https:\/\/smarterwaywealth\.com\/onboarding\/verify"/);
  assert.match(nextConfigSource, /source: "\/become-a-client\/:path\*",[\s\S]{0,140}destination: "https:\/\/smarterwaywealth\.com\/onboarding\/verify"/);
  assert.match(nextConfigSource, /source: "\/meaning", missing: \[bluesHost\], destination: `\$\{GREEN_ORIGIN\}\/`, permanent: true/);
  assert.match(apiSource, /LEGACY_FORM_RETIRED = true/);
  assert.match(apiSource, /status: 410/);
});

test("the active form and privacy notice describe the same collected fields", () => {
  for (const field of ["fullName", "email", "state", "notes"]) {
    assert.match(formSource, new RegExp(`name="${field}"`));
    assert.match(apiSource, new RegExp(`body\\.${field}`));
  }

  assert.doesNotMatch(formSource, /assetBand|investment accounts/);
  assert.doesNotMatch(apiSource, /assetBand|Please select a range/);
  assert.match(privacySource, /name, email[\s\S]*state[\s\S]*optional note/);
  // David, 2026-11-12: the privacy page names provider types, not brands.
  assert.match(privacySource, /website hosting, secure storage/);
  assert.match(formSource, /Please don&apos;t include account numbers, passwords/);
});
