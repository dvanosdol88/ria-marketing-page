const fs = require("fs");
const path = require("path");

const OUT = __dirname;
const ASSETS_REL = "brand-assets";
const BASE_HTML = path.resolve(OUT, "..", "save-upgrade-tools-v2", "SWW_YAPTOM_v2_01_editorial-rule_Proof.html");

const COPY = {
  domain: "youarepayingtoomuch.com",
  headline: "What would you do with",
  dollar: "$788,000",
  footnote: "* potential savings over 20 years.",
  founderProof:
    "Smarter Way Wealth delivers personal, real human fiduciary advice and planning for a simple $100/month. Period.",
  byline: "David Van Osdol, CFA, CFP",
  disclosure:
    "Educational only. Hypothetical results are not investment advice. Actual results vary. Example assumes a $1,000,000 portfolio, 8% annual growth, a 1% asset-based fee, 20 years, and a $100/month flat advisory fee.",
  noMove: "No need to move your assets or open new accounts!",
  qrCaption: "See how much you can save using your actual numbers.",
};

const CONCEPTS = [
  {
    num: "01",
    slug: "proof-card",
    title: "Proof Card",
    idea:
      "Turns the Smarter Way Wealth sentence into a bordered proof card directly under the headline, so the copy reads as a central promise instead of a footer note.",
  },
  {
    num: "02",
    slug: "callout-band",
    title: "Callout Band",
    idea:
      "Uses a crisp high-contrast band to interrupt the front and give the founder proof sentence more mailbox-level stopping power.",
  },
  {
    num: "03",
    slug: "advisor-frame",
    title: "Advisor Frame",
    idea:
      "Frames the copy and David's name as a signature-style advisor panel beside the chart, giving the human fiduciary message its own visual territory.",
  },
];

function domainMarkup() {
  return "you<span>are</span>paying<span>too</span>much.com";
}

function readBaseChart() {
  const html = fs.readFileSync(BASE_HTML, "utf8");
  const match = html.match(/<svg class="chart-svg"[\s\S]*?<\/svg>/);
  if (!match) throw new Error(`Could not find base chart SVG in ${BASE_HTML}`);
  return match[0];
}

const CHART = readBaseChart();

const COMMON_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

  :root {
    --green: #00A540;
    --ink: #07140D;
    --slate: #34483C;
    --rule: rgba(7,20,13,0.18);
    --rule-strong: rgba(7,20,13,0.55);
    --paper: #FFFFFF;
    --paper-warm: #FAF8F2;
  }
  * { box-sizing: border-box; }
  html, body {
    margin: 0;
    padding: 0;
    background: #e9eae6;
    font-family: 'Inter', system-ui, Arial, Helvetica, sans-serif;
    color: var(--ink);
    -webkit-font-smoothing: antialiased;
    text-rendering: geometricPrecision;
  }
  .stage { display: flex; flex-direction: column; align-items: center; gap: 32px; padding: 32px 0; }
  .card {
    width: 8.75in;
    height: 6.5in;
    position: relative;
    background: #fff;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0,0,0,0.12);
  }
  .trim::before {
    content: '';
    position: absolute;
    inset: 0.125in;
    border: 1px dashed rgba(7,20,13,0.30);
    pointer-events: none;
  }
  .corner {
    position: absolute;
    font: 500 9px 'Inter', sans-serif;
    color: rgba(7,20,13,0.45);
    letter-spacing: 0.04em;
  }
  .corner.tl { top: 6px; left: 10px; }
  .corner.tr { top: 6px; right: 10px; }
  .label-front {
    position: fixed;
    top: 6px;
    left: 50%;
    transform: translateX(-50%);
    font: 600 11px 'Inter';
    color: #6b6b6b;
    background: #fff;
    padding: 2px 10px;
    border-radius: 999px;
    z-index: 9999;
  }
  .green { color: var(--green); }
  .chart-svg { display: block; width: 100%; height: 100%; }
`;

const CSS = `
  .front, .back {
    height: 100%;
    padding: 0.36in 0.5in 0.32in;
    display: flex;
    flex-direction: column;
    color: var(--ink);
    background: #fff;
  }
  .kicker {
    text-align: center;
    font: 800 14px 'Inter';
    letter-spacing: 0.02em;
  }
  .kicker span, .domain span { color: var(--green); }
  .top-rule { height: 1px; background: rgba(7,20,13,0.55); margin: 12px 0 14px; }
  .headline { text-align: center; font: 900 52px/0.96 'Inter'; letter-spacing: 0; }
  .headline .dollar { color: var(--green); font-size: 68px; }
  .footnote { text-align: center; font: 500 13px 'Inter'; color: var(--slate); margin-top: 8px; }
  .byline { font: 800 13px 'Inter'; letter-spacing: 0.07em; text-transform: uppercase; }
  .chart-row { display: grid; grid-template-columns: 1fr 1.22in; gap: 22px; align-items: center; margin-top: 12px; }
  .chart-frame { border-top: 1px solid var(--rule-strong); border-bottom: 1px solid var(--rule-strong); padding: 4px 8px; margin: 0 -8px; }
  .chart-frame .chart-svg { width: auto; height: 1.45in; }
  .qr-block { text-align: center; }
  .qr-block img { width: 1.05in; height: 1.05in; display: block; margin: 0 auto; }
  .qr-block .qr-cap { font: 700 9.5px 'Inter'; margin-top: 6px; letter-spacing: 0.04em; }
  .disclosure {
    font: 400 9.5px/1.35 'Inter';
    color: var(--slate);
    margin-top: 10px;
    text-align: center;
    max-width: 7.4in;
    margin-left: auto;
    margin-right: auto;
  }

  .proof-card .founder-spot {
    margin: 24px auto 0;
    max-width: 6.9in;
    border: 1.75px solid rgba(7,20,13,0.72);
    border-top: 8px solid var(--green);
    padding: 13px 28px 14px;
    text-align: center;
    background: #fff;
  }
  .proof-card .founder-spot .label {
    font: 900 10px 'Inter';
    letter-spacing: 0.11em;
    text-transform: uppercase;
    color: var(--slate);
    margin-bottom: 7px;
  }
  .proof-card .founder-copy { font: 850 18px/1.36 'Inter'; }
  .proof-card .byline { margin-top: 9px; }

  .callout-band .headline { margin-top: 2px; }
  .callout-band .founder-spot {
    margin: 22px -0.18in 0;
    background: var(--ink);
    color: #fff;
    display: grid;
    grid-template-columns: 1.2in 1fr 1.8in;
    align-items: center;
    gap: 16px;
    padding: 15px 0.28in;
    border-bottom: 5px solid var(--green);
  }
  .callout-band .spot-label {
    font: 900 11px 'Inter';
    letter-spacing: 0.11em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.72);
  }
  .callout-band .founder-copy { font: 850 18px/1.32 'Inter'; }
  .callout-band .byline { justify-self: end; color: #fff; font-size: 12px; text-align: right; }

  .advisor-frame .hero-layout {
    display: grid;
    grid-template-columns: 1fr 2.15in;
    gap: 20px;
    align-items: stretch;
  }
  .advisor-frame .hero-main { min-width: 0; }
  .advisor-frame .headline { text-align: left; font-size: 47px; }
  .advisor-frame .headline .dollar { font-size: 62px; }
  .advisor-frame .footnote { text-align: left; }
  .advisor-frame .founder-spot {
    border: 1.75px solid rgba(7,20,13,0.72);
    border-left: 8px solid var(--green);
    padding: 15px 16px;
    background: #fff;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .advisor-frame .spot-label {
    font: 900 10px 'Inter';
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--slate);
    margin-bottom: 10px;
  }
  .advisor-frame .founder-copy { font: 850 17px/1.34 'Inter'; }
  .advisor-frame .byline { margin-top: 12px; font-size: 12px; }
  .advisor-frame .chart-row { grid-template-columns: 1fr 1.18in; margin-top: 18px; }

  .back {
    padding: 0.5in 0.5in 0.45in;
  }
  .indicia {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    align-items: start;
    padding-bottom: 18px;
    border-bottom: 1px solid rgba(7,20,13,0.55);
  }
  .ret { font: 500 11px/1.45 'Inter'; }
  .ret .name { font-weight: 800; margin-bottom: 4px; }
  .addr { text-align: center; font: 800 14px 'Inter'; letter-spacing: 0.05em; padding-top: 6px; }
  .addr .sub { font: 500 10px 'Inter'; letter-spacing: 0.04em; margin-top: 4px; color: var(--slate); text-transform: none; }
  .ind { justify-self: end; border: 1px solid var(--ink); padding: 8px 14px; font: 700 10px/1.4 'Inter'; text-align: center; letter-spacing: 0.05em; width: 1.55in; }
  .body-grid { display: grid; grid-template-columns: 2.4in 1fr 1.4in; gap: 12px 28px; padding-top: 18px; align-items: start; }
  .founder-block { grid-row: 1 / 3; }
  .founder-block .logo { width: 2.75in; display: block; margin-bottom: 9px; margin-left: -19px; }
  .founder-block .photo { width: 1.85in; height: 2.1in; object-fit: cover; display: block; border: 1px solid var(--rule); }
  .founder-block .name { font: 800 13px 'Inter'; margin-top: 10px; letter-spacing: 0.02em; }
  .founder-block .sub { font: 500 10px 'Inter'; color: var(--slate); margin-top: 2px; letter-spacing: 0.05em; }
  .benefits { align-self: start; margin-top: 4px; }
  .benefits .item { padding: 8px 0 12px; border-bottom: 1px solid var(--rule); }
  .benefits .item:last-child { border-bottom: none; }
  .benefits .key { font: 900 36px/1 'Inter'; letter-spacing: 0; }
  .benefits .tail { font: 600 18px 'Inter'; margin-left: 8px; color: var(--slate); }
  .benefits .desc { font: 500 13px/1.4 'Inter'; margin-top: 6px; color: var(--ink); }
  .benefits .desc .b-you { font-weight: 800; color: var(--ink); }
  .qr-col { text-align: center; align-self: start; margin-top: 19px; }
  .qr-col img { width: 1.4in; height: 1.4in; display: block; margin: 0 auto; }
  .qr-col .cap { font: 500 10px/1.35 'Inter'; margin-top: 8px; color: var(--ink); }
  .no-move-callout {
    grid-column: 2 / 4;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .no-move-callout img {
    width: 34px;
    height: 34px;
    object-fit: contain;
    flex-shrink: 0;
    display: block;
  }
  .no-move-callout span { font: italic 800 17px/1.3 'Inter'; color: var(--ink); letter-spacing: 0; }
  .domain-row { margin-top: 13px; text-align: center; padding-top: 16px; border-top: 1px solid var(--rule-strong); }
  .domain { font: 900 38px 'Inter'; letter-spacing: 0; color: var(--ink); }
`;

function proofCardFront() {
  return `
    <div class="front proof-card">
      <div class="kicker">${domainMarkup()}</div>
      <div class="top-rule"></div>
      <div class="headline">${COPY.headline}<br/><span class="dollar">${COPY.dollar}*?</span></div>
      <div class="footnote">${COPY.footnote}</div>
      <section class="founder-spot">
        <div class="label">Smarter Way Wealth delivers</div>
        <div class="founder-copy">Personal, <span class="green">real human</span> fiduciary advice and planning for a simple $100/month. Period.</div>
        <div class="byline">${COPY.byline}</div>
      </section>
      ${frontChartRow()}
      <div class="disclosure">${COPY.disclosure}</div>
    </div>
  `;
}

function calloutBandFront() {
  return `
    <div class="front callout-band">
      <div class="kicker">${domainMarkup()}</div>
      <div class="top-rule"></div>
      <div class="headline">${COPY.headline}<br/><span class="dollar">${COPY.dollar}*?</span></div>
      <div class="footnote">${COPY.footnote}</div>
      <section class="founder-spot">
        <div class="spot-label">Delivers</div>
        <div class="founder-copy">${COPY.founderProof}</div>
        <div class="byline">${COPY.byline}</div>
      </section>
      ${frontChartRow()}
      <div class="disclosure">${COPY.disclosure}</div>
    </div>
  `;
}

function advisorFrameFront() {
  return `
    <div class="front advisor-frame">
      <div class="kicker">${domainMarkup()}</div>
      <div class="top-rule"></div>
      <div class="hero-layout">
        <section class="hero-main">
          <div class="headline">${COPY.headline}<br/><span class="dollar">${COPY.dollar}*?</span></div>
          <div class="footnote">${COPY.footnote}</div>
        </section>
        <section class="founder-spot">
          <div class="spot-label">Smarter Way Wealth delivers</div>
          <div class="founder-copy">Personal, <span class="green">real human fiduciary advice</span> and planning for a simple $100/month. Period.</div>
          <div class="byline">${COPY.byline}</div>
        </section>
      </div>
      ${frontChartRow()}
      <div class="disclosure">${COPY.disclosure}</div>
    </div>
  `;
}

function frontChartRow() {
  return `
    <div class="chart-row">
      <div class="chart-frame">${CHART}</div>
      <div class="qr-block">
        <img src="${ASSETS_REL}/yaptom_default_inputs_qr.png" alt="Scan to run your numbers"/>
        <div class="qr-cap">SCAN TO RUN YOUR NUMBERS</div>
      </div>
    </div>
  `;
}

function backMarkup() {
  return `
    <div class="back">
      <div class="indicia">
        <div class="ret"><div class="name">Smarter Way Wealth, LLC</div>youarepayingtoomuch.com<br/>smarterwaywealth.com</div>
        <div class="addr">LOCAL POSTAL CUSTOMER<div class="sub">EDDM route delivery</div></div>
        <div class="ind">PRSRT STD<br/>ECRWSS<br/>U.S. POSTAGE<br/>PAID<br/>EDDM RETAIL</div>
      </div>
      <div class="body-grid">
        <div class="founder-block">
          <img class="logo" src="${ASSETS_REL}/logo-800.png" alt="Smarter Way Wealth"/>
          <img class="photo" src="${ASSETS_REL}/dvo-headshot.jpg" alt="David Van Osdol"/>
          <div class="name">David J. Van Osdol, CFA, CFP</div>
          <div class="sub">Founder, Smarter Way Wealth</div>
        </div>
        <div class="benefits">
          <div class="item">
            <div><span class="key">Save</span><span class="tail"> a Ton!</span></div>
            <div class="desc"><strong class="green">$100/mo. flat fee</strong> vs. % asset-based fee.</div>
          </div>
          <div class="item">
            <div><span class="key">Upgrade</span><span class="tail"> your Advice</span></div>
            <div class="desc">Highly credentialed, highly experienced.</div>
          </div>
          <div class="item">
            <div><span class="key">Improve</span><span class="tail"> your Tools</span></div>
            <div class="desc">Better financial planning tools that <span class="b-you">you</span> own.</div>
          </div>
        </div>
        <div class="qr-col">
          <img src="${ASSETS_REL}/yaptom_default_inputs_qr.png" alt="QR"/>
          <div class="cap">${COPY.qrCaption}</div>
        </div>
        <div class="no-move-callout">
          <img src="${ASSETS_REL}/green-checked-box-exact.png" alt=""/>
          <span>${COPY.noMove}</span>
        </div>
      </div>
      <div class="domain-row">
        <div class="domain">${domainMarkup()}</div>
      </div>
    </div>
  `;
}

function frontFor(concept) {
  if (concept.slug === "proof-card") return proofCardFront();
  if (concept.slug === "callout-band") return calloutBandFront();
  return advisorFrameFront();
}

function proofHtml(concept) {
  const base = `SWW_YAPTOM_CopySpotlight_${concept.num}_${concept.slug}`;
  return {
    base,
    html: `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>SWW EDDM Copy Spotlight · ${concept.num} ${concept.title}</title>
  <style>${COMMON_CSS}${CSS}</style>
</head>
<body>
  <div class="label-front">${concept.num} · ${concept.title}</div>
  <div class="stage">
    <div class="card trim" id="front">
      <span class="corner tl">FRONT · trim 8.5 × 6.25 in · bleed 0.125 in</span>
      <span class="corner tr">${concept.title}</span>
      ${frontFor(concept)}
    </div>
    <div class="card trim" id="back">
      <span class="corner tl">BACK · trim 8.5 × 6.25 in · bleed 0.125 in</span>
      <span class="corner tr">${concept.title}</span>
      ${backMarkup()}
    </div>
  </div>
</body>
</html>`,
  };
}

for (const concept of CONCEPTS) {
  const { base, html } = proofHtml(concept);
  fs.writeFileSync(path.join(OUT, `${base}_Proof.html`), html, "utf8");
  fs.writeFileSync(
    path.join(OUT, `${base}_Rationale.md`),
    `# ${concept.num} · ${concept.title}\n\n**Base:** Save Upgrade Tools v2: V2 01 Editorial Rule\n\n**Idea:** ${concept.idea}\n\n**Back-side icon change:** Replaces the old inline SVG checkmark with the exact upper-right green checked-box crop from the attached source sheet: \`brand-assets/green-checked-box-exact.png\`.\n`,
    "utf8"
  );
  console.log("wrote", `${base}_Proof.html`);
  console.log("wrote", `${base}_Rationale.md`);
}

fs.writeFileSync(
  path.join(OUT, "README.md"),
  `# Save Upgrade Tools v2 Copy Spotlight\n\nGenerated from Save Upgrade Tools v2: V2 01 Editorial Rule.\n\n- 01 Proof Card: frames the Smarter Way Wealth delivery copy as a central proof card.\n- 02 Callout Band: uses a high-contrast band to make the delivery copy interrupt the page.\n- 03 Advisor Frame: gives the delivery copy and David byline their own signature-style panel.\n\nAll backs replace the prior inline icon beside "${COPY.noMove}" with the exact cropped upper-right checked-box asset from the attached sheet.\n`,
  "utf8"
);

fs.writeFileSync(
  path.join(OUT, "mailer-assets-manifest.json"),
  JSON.stringify(
    {
      name: "SWW YAPTOM Save Upgrade Tools v2 Copy Spotlight",
      generatedAt: new Date().toISOString(),
      base: "Save Upgrade Tools v2: V2 01 Editorial Rule",
      sourceIcon: {
        original: "brand-assets/source-check-icon-sheet.jpg",
        crop: "brand-assets/green-checked-box-exact.png",
        note: "Crop is from the upper-right green checked-box in the supplied sheet; the icon is not redrawn.",
      },
      dimensions: {
        trimInches: { width: 8.5, height: 6.25 },
        bleedInches: 0.125,
        proofPageInches: { width: 8.75, height: 6.5 },
      },
      concepts: CONCEPTS.map(({ num, slug, title, idea }) => ({
        num,
        slug,
        title,
        idea,
        files: {
          proofHtml: `SWW_YAPTOM_CopySpotlight_${num}_${slug}_Proof.html`,
          frontPng: `SWW_YAPTOM_CopySpotlight_${num}_${slug}_Front_Proof.png`,
          backPng: `SWW_YAPTOM_CopySpotlight_${num}_${slug}_Back_Proof.png`,
          rationale: `SWW_YAPTOM_CopySpotlight_${num}_${slug}_Rationale.md`,
        },
      })),
    },
    null,
    2
  ) + "\n",
  "utf8"
);
