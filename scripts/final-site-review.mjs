import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), "..");

const REVIEW_ROOT = path.join(ROOT, "artifacts", "final-site-review");
const SCREENSHOT_DIR = path.join(REVIEW_ROOT, "screenshots");
const DOC_ROOT = path.join(ROOT, "docs", "final-site-review");
const GENERATED_AT = new Date().toISOString();

const VIEWPORTS = {
  desktop: { width: 1440, height: 1100 },
  mobile: { width: 390, height: 844 },
};

const STATUS = {
  DONE: "DONE",
  NOT_DONE: "NOT DONE",
  CUT: "CUT",
  INTERNAL_ONLY: "INTERNAL ONLY",
};

const variantFamilies = [
  {
    family: "Upgrade Your Advice",
    finalists: [
      "upgrade10: most polished task-vs-purpose framing",
      "upgrade8: strongest fiduciary education and FAQ structure",
      "upgrade5: best data visualizations",
      "upgrade-your-advice-v0-cgpt: strongest keep-your-custodian message",
      "upgrade3: strongest source/citation base",
    ],
    duplicatesSummarized:
      "upgrade4 duplicates upgrade3. upgrade1/upgrade2 are useful personal-story foundations but not standalone finalists.",
    recommendation:
      "Keep the current route, then curate it into one sharper final page using the custodian message, source rigor, and the most useful visuals.",
  },
  {
    family: "Save",
    finalists: [
      "save3: most complete interactive fee education",
      "save2: strongest arithmetic diagram and quote-card style",
      "save1: cleanest control-matrix concept",
      "docs/save-snippets: preserved simulator, fee wedge, and control matrix references",
    ],
    duplicatesSummarized:
      "save1/save2/save3 overlap heavily on fee arithmetic, quotes, and charts.",
    recommendation:
      "Build one final /save proof page and either cut or redirect /save-a-ton unless that phrase becomes a campaign-specific page.",
  },
  {
    family: "Improve Your Tools",
    finalists: [
      "AnimatedHeader.tsx: canonical animated header with brand green",
      "improveToolsPageConfig versions 1-3: recoverable content order and hero copy variants",
      "improve-your-tools-v0: prior full-page structure referenced in the catalog",
    ],
    duplicatesSummarized:
      "The improve variants mostly share structure and differ in copy/order. The current route already carries the canonical header.",
    recommendation:
      "Keep the current route, tighten the first viewport, and make the RightCapital/tool proof feel like a serious planning workflow rather than a software tour.",
  },
  {
    family: "Meaning / Purpose",
    finalists: [
      "meaning1: best Engine vs Pilot visual",
      "upgrade10: most polished strikethrough task-vs-purpose version",
      "upgrade9: useful but less polished task-vs-purpose copy",
      "current /meaning: consolidated live route",
    ],
    duplicatesSummarized:
      "Jensen/task-vs-purpose material appears in four places and now needs curation, not more accumulation.",
    recommendation:
      "Keep one purpose page only. Use the Engine/Pilot idea if it supports trust, and remove anything that sounds like generic motivational copy.",
  },
  {
    family: "Home",
    finalists: [
      "current local /: final-C calculator-first landing page",
      "top banner finalists: founder-proof, qr-bridge, advisor-standard",
      "branch homeMarketingVariants: direct-mail, fee-receipt, fiduciary-upgrade",
      "final-home: fiduciary-upgrade hero combined with fee-calculator-final-c calculator shape",
      "historical /v2: Equation of Value, Three Pillars, Philosophy",
    ],
    duplicatesSummarized:
      "The current production URL query variants return the same live page today; the differentiated variant copy exists on the local branch.",
    recommendation:
      "Make / the decision engine: calculator first, then a concise route into Upgrade, Improve, Save, and the Smarter Way Wealth trust hub.",
  },
];

const pages = [
  {
    id: "sww-home",
    site: "Smarter Way Wealth",
    baseUrl: "http://localhost:3001",
    route: "/",
    repo: "D:\\smarter-way-wealth",
    pageRole: "Corporate trust hub home",
    reviewGroup: "1. Smarter Way Wealth trust hub",
    currentStatus:
      "Local branch proposed trust hub using the advisor-led final-home direction from the fee-calculator review.",
    decision: STATUS.NOT_DONE,
    recommendation:
      "Use as the firm landing page after the calculator: advisor identity, fiduciary standard, flat monthly fee, and clear path back to the fee calculator.",
    nextActions: [
      "Review desktop and mobile before marking DONE.",
      "Keep noindex until David approves the public launch.",
      "Link clearly to youarepayingtoomuch.com as the calculator/proof experience.",
    ],
    variantSources: [
      "http://localhost:3000/?variant=final-home",
      "D:\\smarter-way-wealth\\src\\app\\page.js",
      "Prior origin-story spine: qualified to give better advice, but not free to give it",
    ],
  },
  {
    id: "sww-privacy",
    site: "Smarter Way Wealth",
    baseUrl: "https://smarterwaywealth.com",
    route: "/privacy",
    repo: "D:\\smarter-way-wealth",
    pageRole: "Corporate privacy policy",
    reviewGroup: "1. Smarter Way Wealth trust hub",
    currentStatus: "Live legal/privacy support page.",
    decision: STATUS.DONE,
    recommendation:
      "Keep as the privacy baseline, then re-check only if launch forms, analytics, scheduling, or lead capture are added.",
    nextActions: [
      "Confirm compliance owner signs off before public launch.",
      "Update the last-updated date only when practices change.",
    ],
    variantSources: ["Current Smarter Way Wealth source page"],
  },
  {
    id: "sww-footer-disclosures",
    site: "Smarter Way Wealth",
    baseUrl: "https://smarterwaywealth.com",
    route: "/",
    repo: "D:\\smarter-way-wealth",
    pageRole: "Corporate footer and disclosure component",
    reviewGroup: "1. Smarter Way Wealth trust hub",
    currentStatus: "Live disclosure footer with CRD, IAPD, educational-use, and risk language.",
    decision: STATUS.DONE,
    screenshotTarget: "footer",
    recommendation:
      "Keep the short disclosure model and mirror any approved text changes into the fee-calculator repo footer.",
    nextActions: [
      "Verify the IAPD link and CRD number during launch review.",
      "Use this as the disclosure style baseline for both websites.",
    ],
    variantSources: ["D:\\smarter-way-wealth\\src\\components\\ComplianceFooter.js"],
  },
  {
    id: "yattm-home",
    site: "You Are Paying Too Much",
    baseUrl: "http://localhost:3000",
    route: "/",
    repo: "D:\\ria-marketing-page",
    pageRole: "Proposed QR root: calculator-first with founder banner",
    reviewGroup: "2. Entry and campaign variants",
    currentStatus: "Local branch proposed root: final-C calculator first, founder-proof banner above it.",
    decision: STATUS.NOT_DONE,
    recommendation:
      "Use this as the default QR-code destination unless another banner variant wins the final review.",
    nextActions: [
      "Pick the top banner treatment.",
      "Confirm the calculator CTA should continue to Smarter Way Wealth.",
      "Verify mobile first viewport keeps the banner and calculator relationship clear.",
    ],
    variantSources: [
      "local /",
      "src/config/homeTopBanners.ts: founder-proof",
      "src/config/homeMarketingVariants.ts: final-home calculatorLayout",
    ],
  },
  {
    id: "yattm-home-banner-founder-proof",
    site: "You Are Paying Too Much",
    baseUrl: "http://localhost:3000",
    route: "/?banner=founder-proof",
    repo: "D:\\ria-marketing-page",
    pageRole: "Banner finalist: founder proof",
    reviewGroup: "2. Entry and campaign variants",
    currentStatus:
      "Local branch-only banner finalist using David portrait, credentials, flat-fee model, and Smarter Way Wealth handoff.",
    decision: STATUS.NOT_DONE,
    recommendation:
      "Recommended default because it gives the calculator immediate human/trust context without burying the tool.",
    nextActions: [
      "Review against QR bridge and advisor standard variants.",
      "If chosen, promote as the default banner and mark the other banners INTERNAL ONLY.",
    ],
    variantSources: ["src/config/homeTopBanners.ts: founder-proof"],
  },
  {
    id: "yattm-home-banner-qr-bridge",
    site: "You Are Paying Too Much",
    baseUrl: "http://localhost:3000",
    route: "/?banner=qr-bridge",
    repo: "D:\\ria-marketing-page",
    pageRole: "Banner finalist: QR bridge",
    reviewGroup: "2. Entry and campaign variants",
    currentStatus:
      "Local branch-only banner finalist that directly acknowledges the QR-code/mailer handoff before the calculator.",
    decision: STATUS.NOT_DONE,
    recommendation:
      "Use if the mailer context needs to be explicit at the top of the page.",
    nextActions: [
      "Compare with the founder-proof banner for trust and visual polish.",
      "Confirm whether QR language should remain visible after non-mailer traffic arrives.",
    ],
    variantSources: ["src/config/homeTopBanners.ts: qr-bridge"],
  },
  {
    id: "yattm-home-banner-advisor-standard",
    site: "You Are Paying Too Much",
    baseUrl: "http://localhost:3000",
    route: "/?banner=advisor-standard",
    repo: "D:\\ria-marketing-page",
    pageRole: "Banner finalist: advisor standard",
    reviewGroup: "2. Entry and campaign variants",
    currentStatus:
      "Local branch-only banner finalist focused on credentialed fiduciary standards rather than campaign language.",
    decision: STATUS.NOT_DONE,
    recommendation:
      "Use if the final homepage needs the quietest, most professional trust signal.",
    nextActions: [
      "Review against founder-proof for warmth and clarity.",
      "Confirm whether this tone belongs on You Are Paying Too Much or should live mainly on Smarter Way Wealth.",
    ],
    variantSources: ["src/config/homeTopBanners.ts: advisor-standard"],
  },
  {
    id: "yattm-home-direct-mail",
    site: "You Are Paying Too Much",
    baseUrl: "https://youarepayingtoomuch.com",
    route: "/?variant=direct-mail",
    repo: "D:\\ria-marketing-page",
    pageRole: "Direct-mail campaign variant check",
    reviewGroup: "2. Entry and campaign variants",
    currentStatus:
      "Live URL returns 200, but production currently renders the same home page rather than local branch variant copy.",
    decision: STATUS.INTERNAL_ONLY,
    recommendation:
      "Treat as a campaign/test input until the variant system is intentionally shipped.",
    nextActions: [
      "If retained, verify the variant copy appears on production after deployment.",
      "Use only for QR/direct mail review, not as a main-page decision.",
    ],
    variantSources: ["src/config/homeMarketingVariants.ts: direct-mail"],
  },
  {
    id: "yattm-home-fee-receipt",
    site: "You Are Paying Too Much",
    baseUrl: "https://youarepayingtoomuch.com",
    route: "/?variant=fee-receipt",
    repo: "D:\\ria-marketing-page",
    pageRole: "Fee-receipt campaign variant check",
    reviewGroup: "2. Entry and campaign variants",
    currentStatus:
      "Live URL returns 200, but production currently renders the same home page rather than local branch variant copy.",
    decision: STATUS.INTERNAL_ONLY,
    recommendation:
      "Keep as a possible ad or follow-up funnel angle, not a primary homepage direction.",
    nextActions: [
      "Decide whether fee-receipt language is too transactional for the brand.",
      "If retained, ship behind a deliberate campaign URL.",
    ],
    variantSources: ["src/config/homeMarketingVariants.ts: fee-receipt"],
  },
  {
    id: "yattm-home-fiduciary-upgrade",
    site: "You Are Paying Too Much",
    baseUrl: "https://youarepayingtoomuch.com",
    route: "/?variant=fiduciary-upgrade",
    repo: "D:\\ria-marketing-page",
    pageRole: "Fiduciary-upgrade campaign variant check",
    reviewGroup: "2. Entry and campaign variants",
    currentStatus:
      "Live URL returns 200, but production currently renders the same home page rather than local branch variant copy.",
    decision: STATUS.INTERNAL_ONLY,
    recommendation:
      "Use this as a bridge between calculator proof and /upgrade-your-advice if the tone stays direct and not combative.",
    nextActions: [
      "Compare against the final /upgrade-your-advice positioning.",
      "Avoid duplicating the same fiduciary proof in too many places.",
    ],
    variantSources: ["src/config/homeMarketingVariants.ts: fiduciary-upgrade"],
  },
  {
    id: "yattm-home-final-home",
    site: "You Are Paying Too Much",
    baseUrl: "http://localhost:3000",
    route: "/?variant=final-home",
    repo: "D:\\ria-marketing-page",
    pageRole: "Proposed final home: advisor hero plus final calculator",
    reviewGroup: "2. Entry and campaign variants",
    currentStatus:
      "Local branch-only finalist combining the fiduciary-upgrade first viewport with the final-C fee calculator shape.",
    decision: STATUS.NOT_DONE,
    recommendation:
      "Use this as the current home-page finalist for review: advisor-led trust above the fold, then a clean calculator comparison immediately below.",
    nextActions: [
      "Inspect desktop and mobile locally before marking DONE.",
      "Decide whether to promote final-home into the root route or keep it as a named review variant.",
      "Keep older query variants archived unless a campaign needs one.",
    ],
    referenceImages: [
      {
        label: "Final-C calculator reference",
        path: "screenshots/fee-calculator-final-c-reference.png",
      },
    ],
    variantSources: [
      "http://localhost:3000/?variant=fiduciary-upgrade above-the-fold reference",
      "C:\\Users\\user2\\Documents\\Codex\\2026-05-01\\build-web-apps-plugin-build-web\\output\\playwright\\fee-calculator-final-c-desktop-full.png",
      "codex://threads/019de458-de2a-77c3-af43-a63881f1d26c",
      "C:\\Users\\user2\\Documents\\Codex\\2026-05-01\\build-web-apps-plugin-build-web\\docs\\superpowers\\specs",
    ],
  },
  {
    id: "yattm-upgrade",
    site: "You Are Paying Too Much",
    baseUrl: "https://youarepayingtoomuch.com",
    route: "/upgrade-your-advice",
    repo: "D:\\ria-marketing-page",
    pageRole: "Core funnel page: why upgrade the advice",
    reviewGroup: "3. Core funnel pages",
    currentStatus: "Live consolidated page.",
    decision: STATUS.NOT_DONE,
    recommendation:
      "Curate into one final argument: keep your custodian, upgrade the advice, verify the credentials, and understand the fiduciary standard.",
    nextActions: [
      "Choose the strongest hero from current route vs upgrade1/2 story vs v0-cgpt custodian framing.",
      "Keep only the best credential proof and source citations.",
      "Use data visuals sparingly so the page does not become a catalog.",
    ],
    variantSources: [
      "upgrade10",
      "upgrade8",
      "upgrade5",
      "upgrade-your-advice-v0-cgpt",
      "upgrade3",
    ],
  },
  {
    id: "yattm-improve",
    site: "You Are Paying Too Much",
    baseUrl: "https://youarepayingtoomuch.com",
    route: "/improve-your-tools",
    repo: "D:\\ria-marketing-page",
    pageRole: "Core funnel page: planning tools and better information",
    reviewGroup: "3. Core funnel pages",
    currentStatus: "Live route with canonical animated header and tool sections.",
    decision: STATUS.NOT_DONE,
    recommendation:
      "Keep the animated header, then sharpen the page around planning clarity and decision quality rather than a generic software showcase.",
    nextActions: [
      "Review improveToolsPageConfig versions 1-3 for strongest order and copy.",
      "Decide whether RightCapital screenshots need updated crops or explanatory context.",
      "Make the CTA connect naturally to calculator state or scheduling.",
    ],
    variantSources: [
      "AnimatedHeader.tsx",
      "improveToolsPageConfig versions 1-3",
      "improve-your-tools-v0 catalog notes",
    ],
  },
  {
    id: "yattm-save",
    site: "You Are Paying Too Much",
    baseUrl: "https://youarepayingtoomuch.com",
    route: "/save",
    repo: "D:\\ria-marketing-page",
    pageRole: "Core funnel page: fee proof and savings math",
    reviewGroup: "3. Core funnel pages",
    currentStatus: "Live fee projection chart and savings visualization.",
    decision: STATUS.NOT_DONE,
    recommendation:
      "Make /save the final proof page. Pull only the best fee simulator, fee wedge, and control-matrix ideas from old variants.",
    nextActions: [
      "Decide whether the current chart is enough or needs the preserved simulator.",
      "Merge the control-matrix idea if it makes the page more decision-oriented.",
      "Avoid repeating every academic quote from old variants.",
    ],
    variantSources: [
      "save3",
      "save2",
      "save1",
      "docs/save-snippets",
    ],
  },
  {
    id: "yattm-save-a-ton",
    site: "You Are Paying Too Much",
    baseUrl: "https://youarepayingtoomuch.com",
    route: "/save-a-ton",
    repo: "D:\\ria-marketing-page",
    pageRole: "Potential campaign/support page",
    reviewGroup: "3. Core funnel pages",
    currentStatus: "Live placeholder-style page.",
    decision: STATUS.NOT_DONE,
    recommendation:
      "Either give this a distinct campaign job or cut/redirect it into /save. The phrase is memorable but may be too casual for the final trust system.",
    nextActions: [
      "Decide whether the route name belongs in the public nav.",
      "If cut, redirect to /save and remove it from final navigation.",
      "If kept, make it a focused campaign page rather than a duplicate proof page.",
    ],
    variantSources: ["save1/save2/save3 catalog family"],
  },
  {
    id: "yattm-meaning",
    site: "You Are Paying Too Much",
    baseUrl: "https://youarepayingtoomuch.com",
    route: "/meaning",
    repo: "D:\\ria-marketing-page",
    pageRole: "Purpose and advisor-standard page",
    reviewGroup: "3. Core funnel pages",
    currentStatus: "Live consolidated Task vs Purpose route.",
    decision: STATUS.NOT_DONE,
    recommendation:
      "Cut this down to one memorable idea. Keep the point that the job is helping people, then remove repetition and anything that feels motivational instead of trustworthy.",
    nextActions: [
      "Choose Engine/Pilot vs strikethrough task-vs-purpose as the primary visual idea.",
      "Keep it connected to firm story and advisor standard.",
      "Make sure it does not compete with Smarter Way Wealth's trust-hub story.",
    ],
    variantSources: ["meaning1", "upgrade10", "upgrade9", "current /meaning"],
  },
  {
    id: "yattm-how-it-works",
    site: "You Are Paying Too Much",
    baseUrl: "https://youarepayingtoomuch.com",
    route: "/how-it-works",
    repo: "D:\\ria-marketing-page",
    pageRole: "Proof/support: calculator mechanics",
    reviewGroup: "4. Proof and support pages",
    currentStatus: "Live technical math and URL parameter page.",
    decision: STATUS.INTERNAL_ONLY,
    recommendation:
      "Keep for internal QA or convert into a client-safe method page. In its current form it reads like implementation documentation.",
    nextActions: [
      "Decide whether clients need this route in nav.",
      "If public, rewrite as plain-English methodology and link to /our-math.",
    ],
    variantSources: ["current /how-it-works", "new-route-cgpt process copy catalog notes"],
  },
  {
    id: "yattm-substitution",
    site: "You Are Paying Too Much",
    baseUrl: "https://youarepayingtoomuch.com",
    route: "/how-it-works/substitution",
    repo: "D:\\ria-marketing-page",
    pageRole: "Proof/support: portfolio substitution demo",
    reviewGroup: "4. Proof and support pages",
    currentStatus: "Live interactive portfolio architecture demo.",
    decision: STATUS.NOT_DONE,
    recommendation:
      "Promote only if it supports the final story. Otherwise keep as proof/demo material outside the main funnel.",
    nextActions: [
      "Decide whether this belongs in final navigation.",
      "If public, add plain-English framing and compliance-safe caveats.",
      "If internal, label it clearly in the cockpit and remove public links.",
    ],
    variantSources: ["how-it-works/substitution catalog star candidate"],
  },
  {
    id: "yattm-faq",
    site: "You Are Paying Too Much",
    baseUrl: "https://youarepayingtoomuch.com",
    route: "/faq",
    repo: "D:\\ria-marketing-page",
    pageRole: "Proof/support: objection handling",
    reviewGroup: "4. Proof and support pages",
    currentStatus: "Live FAQ route.",
    decision: STATUS.NOT_DONE,
    recommendation:
      "Build the FAQ from real final-page objections after the core pages are chosen.",
    nextActions: [
      "Draft questions from final funnel pages, not from generic RIA templates.",
      "Include custodian, fees, fiduciary, credentials, planning tools, and disclosure boundaries.",
    ],
    variantSources: ["upgrade8 FAQ structured data", "new-route-cgpt FAQ copy"],
  },
  {
    id: "yattm-our-math",
    site: "You Are Paying Too Much",
    baseUrl: "https://youarepayingtoomuch.com",
    route: "/our-math",
    repo: "D:\\ria-marketing-page",
    pageRole: "Proof/support: assumptions and math disclosure",
    reviewGroup: "4. Proof and support pages",
    currentStatus: "Live methodology support page.",
    decision: STATUS.NOT_DONE,
    recommendation:
      "Use as the durable assumptions/disclosures companion for the calculator, then link to it wherever the calculator appears.",
    nextActions: [
      "Verify assumptions match the current calculator implementation.",
      "Make the page scannable enough for skeptical prospects.",
    ],
    variantSources: ["current /our-math", "Save/Upgrade fee-chart variants"],
  },
  {
    id: "yattm-privacy",
    site: "You Are Paying Too Much",
    baseUrl: "https://youarepayingtoomuch.com",
    route: "/privacy",
    repo: "D:\\ria-marketing-page",
    pageRole: "Privacy and disclosure support",
    reviewGroup: "4. Proof and support pages",
    currentStatus: "Live privacy route.",
    decision: STATUS.DONE,
    recommendation:
      "Keep as support page, then re-check once final contact forms, analytics, or scheduling flows are chosen.",
    nextActions: [
      "Confirm footer links point here consistently.",
      "Align with Smarter Way Wealth privacy language if the sites share data flows.",
    ],
    variantSources: ["current /privacy"],
  },
  {
    id: "yattm-gallery",
    site: "You Are Paying Too Much",
    baseUrl: "https://youarepayingtoomuch.com",
    route: "/gallery",
    repo: "D:\\ria-marketing-page",
    pageRole: "Internal visual triage tool",
    reviewGroup: "5. Internal and dev pages",
    currentStatus: "Live/dev gallery route.",
    decision: STATUS.INTERNAL_ONLY,
    recommendation:
      "Keep out of final public navigation. Replace its role with this final decision cockpit for page-level decisions.",
    nextActions: [
      "Confirm no public nav link sends prospects here.",
      "Use only as a dev aid if still useful.",
    ],
    variantSources: ["current /gallery"],
  },
  {
    id: "yattm-mobile-calculator",
    site: "You Are Paying Too Much",
    baseUrl: "https://youarepayingtoomuch.com",
    route: "/mobile-calculator",
    repo: "D:\\ria-marketing-page",
    pageRole: "Internal/mobile calculator test surface",
    reviewGroup: "5. Internal and dev pages",
    currentStatus: "Live route.",
    decision: STATUS.INTERNAL_ONLY,
    recommendation:
      "Keep only if it is a QA surface. The final mobile calculator should be the production home experience.",
    nextActions: [
      "Audit public links.",
      "Fold any useful behavior into / before launch decisions are finalized.",
    ],
    variantSources: ["current /mobile-calculator"],
  },
  {
    id: "yattm-experiment",
    site: "You Are Paying Too Much",
    baseUrl: "https://youarepayingtoomuch.com",
    route: "/experiment",
    repo: "D:\\ria-marketing-page",
    pageRole: "Internal experiment surface",
    reviewGroup: "5. Internal and dev pages",
    currentStatus: "Live experiment route.",
    decision: STATUS.INTERNAL_ONLY,
    recommendation:
      "Keep out of final public navigation. Promote only after it has a clear prospect-facing job.",
    nextActions: [
      "Decide whether any visual ideas belong in the final home page.",
      "Remove or hide public links if present.",
    ],
    variantSources: ["current /experiment"],
  },
  {
    id: "yattm-calendar",
    site: "You Are Paying Too Much",
    baseUrl: "https://youarepayingtoomuch.com",
    route: "/components/calendar",
    repo: "D:\\ria-marketing-page",
    pageRole: "Internal component preview",
    reviewGroup: "5. Internal and dev pages",
    currentStatus: "Live component preview route.",
    decision: STATUS.INTERNAL_ONLY,
    recommendation:
      "Keep as internal preview only unless scheduling becomes part of the final public funnel.",
    nextActions: [
      "Decide whether the final CTA uses embedded scheduling, a contact path, or external scheduling.",
      "Remove from public nav if exposed.",
    ],
    variantSources: ["current /components/calendar"],
  },
];

const toUrl = (page) => new URL(page.route, page.baseUrl).toString();

const screenshotName = (page, viewport) => `${page.id}-${viewport}.jpg`;

const screenshotRel = (page, viewport) =>
  `screenshots/${screenshotName(page, viewport)}`;

const screenshotAbs = (page, viewport) =>
  path.join(SCREENSHOT_DIR, screenshotName(page, viewport));

const markdownRelScreenshot = (page, viewport) =>
  `../../artifacts/final-site-review/${screenshotRel(page, viewport)}`;

const badgeClass = (decision) =>
  decision.toLowerCase().replace(/\s+/g, "-");

async function fetchStatus(url) {
  try {
    const response = await fetch(url, { redirect: "follow" });
    return {
      ok: response.ok,
      httpStatus: response.status,
      finalUrl: response.url,
    };
  } catch (error) {
    return {
      ok: false,
      httpStatus: null,
      finalUrl: url,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function capturePage(browser, pageDef, viewportName) {
  const viewport = VIEWPORTS[viewportName];
  const tab = await browser.newPage({ viewport });
  const url = toUrl(pageDef);
  const filePath = screenshotAbs(pageDef, viewportName);

  try {
    await tab.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
    await tab.waitForTimeout(pageDef.waitMs ?? 1800);

    if (pageDef.screenshotTarget) {
      const locator = tab.locator(pageDef.screenshotTarget).first();
      await locator.scrollIntoViewIfNeeded({ timeout: 10000 });
      await tab.waitForTimeout(250);
      await locator.screenshot({
        path: filePath,
        type: "jpeg",
        quality: 84,
      });
    } else {
      await tab.evaluate(() => window.scrollTo(0, 0));
      await tab.waitForTimeout(150);
      await tab.screenshot({
        path: filePath,
        type: "jpeg",
        quality: 84,
        fullPage: false,
      });
    }

    return { ok: true, path: screenshotRel(pageDef, viewportName) };
  } catch (error) {
    return {
      ok: false,
      path: screenshotRel(pageDef, viewportName),
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    await tab.close();
  }
}

async function enrichPages() {
  await mkdir(SCREENSHOT_DIR, { recursive: true });
  const browser = await chromium.launch();

  try {
    const enriched = [];
    for (const pageDef of pages) {
      const url = toUrl(pageDef);
      const liveCheck = await fetchStatus(url);
      const screenshots = {};

      for (const viewportName of Object.keys(VIEWPORTS)) {
        screenshots[viewportName] = await capturePage(
          browser,
          pageDef,
          viewportName,
        );
      }

      enriched.push({
        ...pageDef,
        url,
        liveCheck,
        screenshots,
      });
    }
    return enriched;
  } finally {
    await browser.close();
  }
}

function makeDecisionLog(data) {
  const summary = [
    "# Final Site Review Decision Log",
    "",
    `Generated: ${GENERATED_AT}`,
    "",
    "This is the working source of truth for deciding final public pages across You Are Paying Too Much and Smarter Way Wealth.",
    "",
    `Visual cockpit: [artifacts/final-site-review/index.html](../../artifacts/final-site-review/index.html)`,
    `Structured page data: [pages.json](./pages.json)`,
    "",
    "## Decision States",
    "",
    "- DONE: Accept as final or final with only minor launch verification.",
    "- NOT DONE: Needs curation, redesign, copy work, implementation, or a route decision.",
    "- CUT: Remove or redirect from final public surface.",
    "- INTERNAL ONLY: Keep as dev/proof/QA/internal review surface, not public funnel.",
    "",
    "## Page Decisions",
    "",
    "| Site | Route | Role | Decision | Live | Recommendation |",
    "|---|---:|---|---|---:|---|",
    ...data.pages.map((page) => {
      const live = page.liveCheck.httpStatus ?? "ERR";
      return `| ${page.site} | \`${page.route}\` | ${page.pageRole} | ${page.decision} | ${live} | ${page.recommendation} |`;
    }),
    "",
    "## Historical Variant Families",
    "",
    ...data.variantFamilies.flatMap((family) => [
      `### ${family.family}`,
      "",
      `Recommendation: ${family.recommendation}`,
      "",
      "Finalists:",
      ...family.finalists.map((item) => `- ${item}`),
      "",
      `Duplicates summarized: ${family.duplicatesSummarized}`,
      "",
    ]),
    "## Screenshot Evidence",
    "",
    ...data.pages.flatMap((page) => [
      `### ${page.site} - ${page.route}`,
      "",
      `- Desktop: [${page.screenshots.desktop.path}](${markdownRelScreenshot(page, "desktop")})`,
      `- Mobile: [${page.screenshots.mobile.path}](${markdownRelScreenshot(page, "mobile")})`,
      ...(page.referenceImages ?? []).map(
        (reference) =>
          `- Reference: [${reference.label}](../../artifacts/final-site-review/${reference.path})`,
      ),
      "",
    ]),
  ];

  return `${summary.join("\n")}\n`;
}

function htmlEscape(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

const stripTrailingWhitespace = (value) => value.replace(/[ \t]+$/gm, "");

function renderList(items) {
  return `<ul>${items.map((item) => `<li>${htmlEscape(item)}</li>`).join("")}</ul>`;
}

function renderReferenceImages(page) {
  if (!page.referenceImages?.length) {
    return "";
  }

  const images = page.referenceImages
    .map(
      (reference) => `
        <a href="${htmlEscape(reference.path)}">
          <span>${htmlEscape(reference.label)}</span>
          <img src="${htmlEscape(reference.path)}" alt="${htmlEscape(reference.label)}">
        </a>`,
    )
    .join("");

  return `
      <section>
        <h4>Reference screenshots</h4>
        <div class="refs">
${images}
        </div>
      </section>`;
}

function renderPageCard(page) {
  const liveText = page.liveCheck.httpStatus
    ? `${page.liveCheck.httpStatus} ${page.liveCheck.ok ? "OK" : "CHECK"}`
    : "ERROR";

  return `
    <article class="page-card" id="${htmlEscape(page.id)}">
      <div class="card-head">
        <div>
          <p class="site">${htmlEscape(page.site)}</p>
          <h3>${htmlEscape(page.route)}</h3>
          <p class="role">${htmlEscape(page.pageRole)}</p>
        </div>
        <span class="decision ${badgeClass(page.decision)}">${htmlEscape(page.decision)}</span>
      </div>
      <div class="meta-row">
        <span>${htmlEscape(page.reviewGroup)}</span>
        <span>Live: ${htmlEscape(liveText)}</span>
      </div>
      <div class="shots">
        <a href="${htmlEscape(page.screenshots.desktop.path)}">
          <span>Desktop</span>
          <img src="${htmlEscape(page.screenshots.desktop.path)}" alt="${htmlEscape(page.site)} ${htmlEscape(page.route)} desktop screenshot">
        </a>
        <a href="${htmlEscape(page.screenshots.mobile.path)}">
          <span>Mobile</span>
          <img src="${htmlEscape(page.screenshots.mobile.path)}" alt="${htmlEscape(page.site)} ${htmlEscape(page.route)} mobile screenshot">
        </a>
      </div>
${renderReferenceImages(page)}
      <section>
        <h4>Current status</h4>
        <p>${htmlEscape(page.currentStatus)}</p>
      </section>
      <section>
        <h4>Recommendation</h4>
        <p>${htmlEscape(page.recommendation)}</p>
      </section>
      <section class="split-copy">
        <div>
          <h4>Next actions</h4>
          ${renderList(page.nextActions)}
        </div>
        <div>
          <h4>Variant sources</h4>
          ${renderList(page.variantSources)}
        </div>
      </section>
    </article>
  `;
}

function renderVariantFamily(family) {
  return `
    <article class="variant-card">
      <h3>${htmlEscape(family.family)}</h3>
      <p>${htmlEscape(family.recommendation)}</p>
      <h4>Finalists</h4>
      ${renderList(family.finalists)}
      <h4>Duplicates summarized</h4>
      <p>${htmlEscape(family.duplicatesSummarized)}</p>
    </article>
  `;
}

function makeCockpit(data) {
  const counts = data.pages.reduce(
    (acc, page) => {
      acc.total += 1;
      acc[page.decision] = (acc[page.decision] ?? 0) + 1;
      return acc;
    },
    { total: 0 },
  );

  const groups = [...new Set(data.pages.map((page) => page.reviewGroup))];

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Final Site Review Cockpit</title>
  <style>
    :root {
      --ink: #151816;
      --muted: #68716b;
      --line: #dbe3dc;
      --paper: #f8faf7;
      --panel: #ffffff;
      --green: #00a540;
      --dark: #0f2418;
      --amber: #a15c00;
      --blue: #245a86;
      --red: #a7342d;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: var(--paper);
      color: var(--ink);
      line-height: 1.5;
    }
    header {
      padding: 48px clamp(20px, 5vw, 72px) 28px;
      background: linear-gradient(135deg, #ffffff 0%, #edf5ef 100%);
      border-bottom: 1px solid var(--line);
    }
    header h1 {
      margin: 0;
      max-width: 960px;
      font-size: clamp(2.1rem, 5vw, 4.8rem);
      line-height: 0.95;
      letter-spacing: 0;
    }
    header p {
      max-width: 820px;
      margin: 18px 0 0;
      color: var(--muted);
      font-size: 1.05rem;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 12px;
      margin-top: 30px;
      max-width: 900px;
    }
    .stat {
      border: 1px solid var(--line);
      background: rgba(255,255,255,0.74);
      padding: 14px 16px;
    }
    .stat strong {
      display: block;
      font-size: 1.7rem;
      line-height: 1;
    }
    .stat span {
      display: block;
      margin-top: 6px;
      color: var(--muted);
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    main {
      padding: 28px clamp(20px, 5vw, 72px) 72px;
    }
    nav {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-bottom: 32px;
    }
    nav a {
      color: var(--dark);
      text-decoration: none;
      border: 1px solid var(--line);
      background: #fff;
      padding: 8px 11px;
      font-size: 0.88rem;
    }
    .section-title {
      margin: 44px 0 16px;
      font-size: 1.55rem;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
      gap: 22px;
    }
    .page-card, .variant-card {
      border: 1px solid var(--line);
      background: var(--panel);
      padding: 18px;
      box-shadow: 0 18px 40px rgba(15, 36, 24, 0.07);
    }
    .card-head {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      align-items: flex-start;
    }
    .site, .role, .meta-row, h4 {
      margin: 0;
      color: var(--muted);
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    .card-head h3, .variant-card h3 {
      margin: 4px 0 4px;
      font-size: 1.35rem;
      letter-spacing: 0;
    }
    .decision {
      white-space: nowrap;
      font-weight: 800;
      font-size: 0.72rem;
      padding: 6px 8px;
      border: 1px solid currentColor;
    }
    .done { color: var(--green); }
    .not-done { color: var(--amber); }
    .cut { color: var(--red); }
    .internal-only { color: var(--blue); }
    .meta-row {
      display: flex;
      justify-content: space-between;
      gap: 14px;
      border-top: 1px solid var(--line);
      border-bottom: 1px solid var(--line);
      padding: 9px 0;
      margin: 14px 0;
    }
    .shots {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 120px;
      gap: 12px;
      align-items: stretch;
      margin: 16px 0;
    }
    .shots a {
      display: block;
      color: inherit;
      text-decoration: none;
    }
    .shots span {
      display: block;
      margin-bottom: 6px;
      color: var(--muted);
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    .shots img {
      display: block;
      width: 100%;
      height: 220px;
      object-fit: cover;
      object-position: top center;
      border: 1px solid var(--line);
      background: #f2f4f2;
    }
    .shots a:nth-child(2) img {
      height: 220px;
    }
    .refs {
      display: grid;
      grid-template-columns: 1fr;
      gap: 10px;
      margin-top: 8px;
    }
    .refs a {
      color: inherit;
      text-decoration: none;
    }
    .refs span {
      display: block;
      margin-bottom: 6px;
      color: var(--muted);
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    .refs img {
      display: block;
      width: 100%;
      max-height: 260px;
      object-fit: contain;
      object-position: top center;
      border: 1px solid var(--line);
      background: #f2f4f2;
    }
    section {
      margin-top: 14px;
    }
    section p, .variant-card p {
      margin: 6px 0 0;
      color: #263029;
    }
    ul {
      margin: 7px 0 0;
      padding-left: 18px;
      color: #263029;
    }
    li + li { margin-top: 4px; }
    .split-copy {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 18px;
    }
    .variant-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 18px;
    }
    footer {
      margin-top: 44px;
      color: var(--muted);
      font-size: 0.9rem;
    }
    @media (max-width: 720px) {
      .grid, .split-copy { grid-template-columns: 1fr; }
      .shots { grid-template-columns: 1fr; }
      .shots a:nth-child(2) img { height: 360px; }
      .meta-row { display: block; }
      .meta-row span { display: block; }
      .meta-row span + span { margin-top: 4px; }
    }
  </style>
</head>
<body>
  <header>
    <h1>Final Website Decision Cockpit</h1>
    <p>Review board for deciding what is done, not done, internal only, or cut across Smarter Way Wealth and You Are Paying Too Much. Generated from live production screenshots and the historical variant catalog.</p>
    <div class="stats">
      <div class="stat"><strong>${counts.total}</strong><span>review cards</span></div>
      <div class="stat"><strong>${counts[STATUS.NOT_DONE] ?? 0}</strong><span>not done</span></div>
      <div class="stat"><strong>${counts[STATUS.DONE] ?? 0}</strong><span>done</span></div>
      <div class="stat"><strong>${counts[STATUS.INTERNAL_ONLY] ?? 0}</strong><span>internal only</span></div>
    </div>
  </header>
  <main>
    <nav>
      ${groups.map((group) => `<a href="#${htmlEscape(group.replaceAll(" ", "-").replaceAll(".", ""))}">${htmlEscape(group)}</a>`).join("")}
      <a href="#historical-variants">Historical variants</a>
    </nav>
    ${groups
      .map((group) => {
        const sectionPages = data.pages.filter((page) => page.reviewGroup === group);
        return `
          <h2 class="section-title" id="${htmlEscape(group.replaceAll(" ", "-").replaceAll(".", ""))}">${htmlEscape(group)}</h2>
          <div class="grid">
            ${sectionPages.map(renderPageCard).join("")}
          </div>
        `;
      })
      .join("")}
    <h2 class="section-title" id="historical-variants">Historical Variant Finalists</h2>
    <div class="variant-grid">
      ${data.variantFamilies.map(renderVariantFamily).join("")}
    </div>
    <footer>
      Generated ${htmlEscape(GENERATED_AT)}. Source data: docs/final-site-review/pages.json.
    </footer>
  </main>
</body>
</html>
`;
}

async function main() {
  await mkdir(DOC_ROOT, { recursive: true });
  await mkdir(REVIEW_ROOT, { recursive: true });
  await mkdir(SCREENSHOT_DIR, { recursive: true });

  const enrichedPages = await enrichPages();
  const data = {
    generatedAt: GENERATED_AT,
    viewports: VIEWPORTS,
    pages: enrichedPages,
    variantFamilies,
  };

  await writeFile(
    path.join(DOC_ROOT, "pages.json"),
    `${JSON.stringify(data, null, 2)}\n`,
  );
  await writeFile(path.join(DOC_ROOT, "decision-log.md"), stripTrailingWhitespace(makeDecisionLog(data)));
  await writeFile(path.join(REVIEW_ROOT, "index.html"), stripTrailingWhitespace(makeCockpit(data)));

  const failures = enrichedPages.filter((page) => !page.liveCheck.ok);
  const screenshotFailures = enrichedPages.flatMap((page) =>
    Object.entries(page.screenshots)
      .filter(([, shot]) => !shot.ok)
      .map(([viewport, shot]) => `${page.id}:${viewport}:${shot.error}`),
  );

  console.log(
    JSON.stringify(
      {
        generatedAt: GENERATED_AT,
        pages: enrichedPages.length,
        liveFailures: failures.map((page) => ({
          id: page.id,
          route: page.route,
          status: page.liveCheck.httpStatus,
          error: page.liveCheck.error,
        })),
        screenshotFailures,
        outputs: {
          decisionLog: path.join(DOC_ROOT, "decision-log.md"),
          pagesJson: path.join(DOC_ROOT, "pages.json"),
          cockpit: path.join(REVIEW_ROOT, "index.html"),
          screenshots: SCREENSHOT_DIR,
        },
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
