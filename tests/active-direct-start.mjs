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
  assert.match(navSource, />\s*Become a Client\s*<ExternalLink/);
  assert.match(sitemapSource, /<loc>https:\/\/youarepayingtoomuch\.com\/become-a-client<\/loc>/);
});

test("the active form and privacy notice describe the same collected fields", () => {
  for (const field of ["fullName", "email", "state", "notes"]) {
    assert.match(formSource, new RegExp(`name="${field}"`));
    assert.match(apiSource, new RegExp(`body\\.${field}`));
  }

  assert.doesNotMatch(formSource, /assetBand|investment accounts/);
  assert.doesNotMatch(apiSource, /assetBand|Please select a range/);
  assert.match(privacySource, /name, email[\s\S]*state[\s\S]*optional note/);
  assert.match(privacySource, /Google Firebase to store direct[\s\S]*onboarding requests/);
  assert.match(formSource, /Please don&apos;t include account numbers, passwords/);
});
