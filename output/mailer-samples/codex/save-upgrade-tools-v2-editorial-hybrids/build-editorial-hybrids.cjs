const fs = require("fs");
const path = require("path");

const OUT = __dirname;
const ASSETS_REL = "brand-assets";

const COPY = {
  domain: "youarepayingtoomuch.com",
  headline: "What would you do with",
  dollar: "$788,000",
  star: "*",
  qMark: "?",
  footnote: "* potential savings over 20 years.",
  founderProof:
    "Smarter Way Wealth delivers personal, real human fiduciary advice and planning for a simple $100/month. Period.",
  byline: "David Van Osdol, CFA, CFP",
  disclosure:
    "Educational only. Hypothetical results are not investment advice. Actual results vary. Example assumes a $1,000,000 portfolio, 8% annual growth, a 1% asset-based fee, 20 years, and a $100/month flat advisory fee.",
  qrCaption: "See how much you can save using your actual numbers.",
  saveTitle: "Save",
  saveTail: " a Ton!",
  saveBody: "$100/mo. flat fee vs. % asset-based fee.",
  upgradeTitle: "Upgrade",
  upgradeTail: " your Advice",
  upgradeBody: "Highly credentialed, highly experienced.",
  improveTitle: "Improve",
  improveTail: " your Tools",
  improveBodyPre: "Better financial planning tools that ",
  improveBodyEmph: "you",
  improveBodyPost: " own.",
  returnLine1: "Smarter Way Wealth, LLC",
  returnLine2: "youarepayingtoomuch.com",
  returnLine3: "smarterwaywealth.com",
  postalCustomer: "LOCAL POSTAL CUSTOMER",
  routeDelivery: "EDDM route delivery",
  indicia: ["PRSRT STD", "ECRWSS", "U.S. POSTAGE", "PAID", "EDDM RETAIL"],
  founderTitle: "David J. Van Osdol, CFA, CFP",
  founderSub: "Founder, Smarter Way Wealth",
};

const COMMON_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=DM+Sans:wght@400;500;700&display=swap');

  :root {
    --green: #00A540;
    --ink: #07140D;
    --slate: #34483C;
    --rule: rgba(7,20,13,0.18);
    --rule-strong: rgba(7,20,13,0.55);
    --paper-warm: #FAF8F2;
    --cream-line: #DED8C8;
  }
  * { box-sizing: border-box; }
  html, body {
    margin: 0; padding: 0; background: #e9eae6;
    font-family: 'Inter', system-ui, Arial, Helvetica, sans-serif;
    color: var(--ink);
    -webkit-font-smoothing: antialiased;
    text-rendering: geometricPrecision;
  }
  .stage { display: flex; flex-direction: column; align-items: center; gap: 32px; padding: 32px 0; }
  .card {
    width: 8.75in; height: 6.5in; position: relative; background: #fff; overflow: hidden;
    box-shadow: 0 8px 32px rgba(0,0,0,0.12);
  }
  .trim::before { content: ''; position: absolute; inset: 0.125in; border: 1px dashed rgba(7,20,13,0.30); pointer-events: none; }
  .corner { position: absolute; font: 500 9px 'Inter', sans-serif; color: rgba(7,20,13,0.45); letter-spacing: 0.04em; }
  .corner.tl { top: 6px; left: 10px; }
  .corner.tr { top: 6px; right: 10px; }
  .label-front { position: fixed; top: 6px; left: 50%; transform: translateX(-50%); font: 600 11px 'Inter'; color: #6b6b6b; background: #fff; padding: 2px 10px; border-radius: 999px; z-index: 9999; }
  .chart-svg { display: block; width: 100%; height: 100%; }
`;

function lineChartSVG(opts = {}) {
  const {
    width = 720,
    height = 220,
    feeColor = "#34483C",
    flatColor = "#00A540",
    gridColor = "rgba(7,20,13,0.08)",
    strokeW = 3,
    showGrid = true,
  } = opts;
  const startVal = 1_000_000;
  const noFeeRate = 0.08;
  const feeRate = 0.07;
  const years = 20;
  const noFee = [];
  const withFee = [];
  for (let y = 0; y <= years; y += 1) {
    noFee.push(startVal * Math.pow(1 + noFeeRate, y));
    withFee.push(startVal * Math.pow(1 + feeRate, y));
  }
  const padL = 54;
  const padR = 18;
  const padT = 18;
  const padB = 30;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;
  const yMax = 5_000_000;
  const xOf = (y) => padL + (y / years) * innerW;
  const yOf = (v) => padT + (1 - v / yMax) * innerH;
  const toPath = (arr) => arr.map((v, i) => `${i === 0 ? "M" : "L"}${xOf(i).toFixed(1)},${yOf(v).toFixed(1)}`).join(" ");
  const gapArea = `M${noFee.map((v, i) => `${xOf(i).toFixed(1)},${yOf(v).toFixed(1)}`).join(" L")} L${withFee
    .slice()
    .reverse()
    .map((v, i) => `${xOf(years - i).toFixed(1)},${yOf(v).toFixed(1)}`)
    .join(" L")} Z`;

  let grid = "";
  if (showGrid) {
    for (let i = 0; i <= 5; i += 1) {
      const y = yOf((i / 5) * yMax);
      grid += `<line x1="${padL}" y1="${y.toFixed(1)}" x2="${width - padR}" y2="${y.toFixed(1)}" stroke="${gridColor}" stroke-width="1"/>`;
      grid += `<text x="${padL - 8}" y="${(y + 3.5).toFixed(1)}" text-anchor="end" font-family="Inter" font-size="11" fill="rgba(7,20,13,0.68)">$${i === 0 ? "0" : `${i}M`}</text>`;
    }
    [0, 5, 10, 15, 20].forEach((year) => {
      const x = xOf(year);
      grid += `<text x="${x.toFixed(1)}" y="${height - padB + 16}" text-anchor="middle" font-family="Inter" font-size="11" fill="rgba(7,20,13,0.68)">${year}y</text>`;
    });
  }

  return `
    <svg class="chart-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
      ${grid}
      <path d="${gapArea}" fill="${flatColor}" fill-opacity="0.10" />
      <path d="${toPath(withFee)}" fill="none" stroke="${feeColor}" stroke-width="${strokeW}" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="${toPath(noFee)}" fill="none" stroke="${flatColor}" stroke-width="${strokeW}" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="${padL}" y1="${height - padB}" x2="${width - padR}" y2="${height - padB}" stroke="rgba(7,20,13,0.35)" stroke-width="1"/>
      <text x="${xOf(15).toFixed(1)}" y="${((yOf(noFee[15]) + yOf(withFee[15])) / 2).toFixed(1)}" text-anchor="middle" font-family="Inter" font-size="12" font-weight="800" fill="${flatColor}">$788,306 gap</text>
    </svg>
  `;
}

function barChartSVG(opts = {}) {
  const { width = 680, height = 230, feeColor = "#34483C", flatColor = "#00A540" } = opts;
  const padL = 112;
  const padR = 22;
  const padT = 26;
  const padB = 34;
  const innerW = width - padL - padR;
  const rows = [
    { label: "With 1% asset fee", value: 3_815_751, color: feeColor, fmt: "$3,815,751" },
    { label: "With $100/mo flat fee", value: 4_604_057, color: flatColor, fmt: "$4,604,057" },
  ];
  const maxV = 5_000_000;
  const barH = 52;
  const gap = 28;
  const startY = padT + ((height - padT - padB) - (rows.length * barH + gap)) / 2;
  let els = "";
  rows.forEach((row, i) => {
    const y = startY + i * (barH + gap);
    const w = (row.value / maxV) * innerW;
    els += `
      <text x="${padL - 10}" y="${y + barH / 2 + 4}" text-anchor="end" font-family="Inter" font-size="12" font-weight="700" fill="rgba(7,20,13,0.72)">${row.label}</text>
      <rect x="${padL}" y="${y}" width="${w.toFixed(1)}" height="${barH}" fill="${row.color}"/>
      <text x="${padL + w - 12}" y="${y + barH / 2 + 5}" text-anchor="end" font-family="Inter" font-size="14" font-weight="900" fill="#fff">${row.fmt}</text>
    `;
  });
  const feeX = padL + (rows[0].value / maxV) * innerW;
  const flatX = padL + (rows[1].value / maxV) * innerW;
  els += `
    <line x1="${feeX.toFixed(1)}" y1="${startY + barH}" x2="${feeX.toFixed(1)}" y2="${startY + barH + gap}" stroke="${flatColor}" stroke-width="1.5" stroke-dasharray="3 3"/>
    <line x1="${flatX.toFixed(1)}" y1="${startY + barH + gap}" x2="${flatX.toFixed(1)}" y2="${startY + barH + gap + barH}" stroke="${flatColor}" stroke-width="1.5" stroke-dasharray="3 3"/>
    <text x="${((feeX + flatX) / 2).toFixed(1)}" y="${startY + barH + gap / 2 + 5}" text-anchor="middle" font-family="Inter" font-size="13" font-weight="900" fill="${flatColor}">$788,306 gap</text>
  `;
  return `<svg class="chart-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">${els}</svg>`;
}

function front({ mode }) {
  const usePaper = mode === "paper-bar" || mode === "full-hybrid";
  const useBand = mode === "callout-band" || mode === "full-hybrid";
  const useBar = mode === "paper-bar" || mode === "full-hybrid";
  return `
    <div class="hy-front ${usePaper ? "paper" : ""} ${useBand ? "banded" : ""}">
      <div class="domain"><span>${COPY.domain}</span></div>
      ${useBand ? '<div class="callout-band">A fee-savings proof from Smarter Way Wealth</div>' : '<div class="rule"></div>'}
      <div class="hero-grid">
        <section class="copy-box">
          <div class="headline">${COPY.headline}<br/><span>${COPY.dollar}${COPY.star}${COPY.qMark}</span></div>
          <div class="footnote">${COPY.footnote}</div>
          <div class="founder">${COPY.founderProof}</div>
          <div class="byline">${COPY.byline}</div>
        </section>
        <aside class="qr-box">
          <img src="${ASSETS_REL}/yaptom_default_inputs_qr.png" alt="Scan to run your numbers"/>
          <div>SCAN TO RUN YOUR NUMBERS</div>
        </aside>
      </div>
      <section class="chart-box">
        <div class="box-label">${useBar ? "Two fee paths, same starting point" : "20-year fee gap"}</div>
        ${useBar ? barChartSVG() : lineChartSVG()}
      </section>
      <div class="disclosure">${COPY.disclosure}</div>
    </div>
  `;
}

function back({ mode }) {
  const usePaper = mode === "paper-bar" || mode === "full-hybrid";
  const useBand = mode === "callout-band" || mode === "full-hybrid";
  return `
    <div class="hy-back ${usePaper ? "paper" : ""} ${useBand ? "banded" : ""}">
      <div class="indicia">
        <div class="ret"><div class="name">${COPY.returnLine1}</div>${COPY.returnLine2}<br/>${COPY.returnLine3}</div>
        <div class="addr">${COPY.postalCustomer}<div>${COPY.routeDelivery}</div></div>
        <div class="ind">${COPY.indicia.join("<br/>")}</div>
      </div>
      ${useBand ? '<div class="back-band">Save more. Upgrade advice. Improve your tools.</div>' : ""}
      <div class="body-grid">
        <div class="founder-card">
          <img class="logo" src="${ASSETS_REL}/logo-800.png" alt="Smarter Way Wealth"/>
          <img class="photo" src="${ASSETS_REL}/dvo-headshot.jpg" alt="David Van Osdol"/>
          <div class="name">${COPY.founderTitle}</div>
          <div class="sub">${COPY.founderSub}</div>
        </div>
        <div class="benefits">
          <div class="item"><div><span class="key">${COPY.saveTitle}</span><span class="tail">${COPY.saveTail}</span></div><p>${COPY.saveBody}</p></div>
          <div class="item"><div><span class="key">${COPY.upgradeTitle}</span><span class="tail">${COPY.upgradeTail}</span></div><p>${COPY.upgradeBody}</p></div>
          <div class="item"><div><span class="key">${COPY.improveTitle}</span><span class="tail">${COPY.improveTail}</span></div><p>${COPY.improveBodyPre}<strong>${COPY.improveBodyEmph}</strong>${COPY.improveBodyPost}</p></div>
        </div>
        <div class="qr-panel">
          <img src="${ASSETS_REL}/yaptom_default_inputs_qr.png" alt="QR"/>
          <p>${COPY.qrCaption}</p>
        </div>
      </div>
      <div class="domain-row"><span>${COPY.domain}</span></div>
    </div>
  `;
}

const CSS = `
  .hy-front, .hy-back { height: 100%; color: var(--ink); background: #fff; padding: 0.38in 0.5in 0.34in; display: flex; flex-direction: column; }
  .hy-front.paper, .hy-back.paper { background: var(--paper-warm); }
  .hy-front .domain { text-align: center; font: 800 14px 'Inter'; letter-spacing: 0.02em; }
  .hy-front .domain span { border-bottom: 2px solid var(--green); padding-bottom: 2px; }
  .hy-front .rule { height: 1px; background: rgba(7,20,13,0.58); margin: 13px 0 14px; }
  .hy-front .callout-band { margin: 13px 0 14px; background: var(--ink); color: #fff; text-align: center; padding: 8px 12px; font: 900 12px 'Inter'; letter-spacing: 0.08em; text-transform: uppercase; }
  .hy-front .hero-grid { display: grid; grid-template-columns: 1fr 1.28in; gap: 18px; align-items: stretch; }
  .hy-front .copy-box { border: 1.75px solid rgba(7,20,13,0.74); background: rgba(255,255,255,0.74); padding: 14px 20px 13px; text-align: center; }
  .hy-front.paper .copy-box { background: #fffdf8; border-color: rgba(7,20,13,0.78); }
  .hy-front.banded .copy-box { border-top: 8px solid var(--ink); }
  .hy-front .headline { font: 900 46px/0.98 'Inter'; letter-spacing: -0.02em; }
  .hy-front .headline span { color: var(--green); font-size: 66px; }
  .hy-front .footnote { margin-top: 7px; font: 600 12px 'Inter'; color: var(--slate); }
  .hy-front .founder { max-width: 5.8in; margin: 11px auto 0; font: 500 13px/1.38 'Inter'; }
  .hy-front .byline { margin-top: 7px; font: 900 11px 'Inter'; letter-spacing: 0.08em; text-transform: uppercase; }
  .hy-front .qr-box { border: 1.75px solid rgba(7,20,13,0.74); background: #fff; padding: 11px 10px; text-align: center; display: flex; flex-direction: column; justify-content: center; }
  .hy-front.banded .qr-box { border-top: 8px solid var(--green); }
  .hy-front .qr-box img { width: 1.02in; height: 1.02in; display: block; margin: 0 auto; }
  .hy-front .qr-box div { margin-top: 7px; font: 800 9.5px/1.25 'Inter'; letter-spacing: 0.04em; }
  .hy-front .chart-box { position: relative; margin-top: 13px; border: 1.75px solid rgba(7,20,13,0.76); background: #fff; padding: 20px 16px 8px; height: 1.75in; }
  .hy-front.paper .chart-box { background: #fffdf8; }
  .hy-front .box-label { position: absolute; top: -10px; left: 16px; background: inherit; padding: 0 7px; font: 900 11px 'Inter'; letter-spacing: 0.08em; text-transform: uppercase; color: var(--slate); }
  .hy-front .disclosure { margin-top: 9px; text-align: center; font: 500 9.2px/1.35 'Inter'; color: var(--slate); }

  .hy-back { padding-top: 0.46in; }
  .hy-back .indicia { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; align-items: start; padding-bottom: 13px; border-bottom: 1.5px solid rgba(7,20,13,0.58); }
  .hy-back.banded .indicia { border-bottom-width: 0; }
  .hy-back .ret { font: 500 11px/1.45 'Inter'; }
  .hy-back .ret .name { font-weight: 900; margin-bottom: 4px; }
  .hy-back .addr { text-align: center; font: 900 14px 'Inter'; letter-spacing: 0.05em; padding-top: 6px; }
  .hy-back .addr div { font: 500 10px 'Inter'; letter-spacing: 0.04em; margin-top: 4px; color: var(--slate); }
  .hy-back .ind { justify-self: end; border: 1.5px solid var(--ink); padding: 7px 12px; font: 800 10px/1.35 'Inter'; text-align: center; letter-spacing: 0.05em; width: 1.55in; background: #fff; }
  .hy-back .back-band { background: var(--ink); color: #fff; margin: 13px 0 18px; padding: 9px 12px; text-align: center; font: 900 13px 'Inter'; letter-spacing: 0.08em; text-transform: uppercase; }
  .hy-back .body-grid { display: grid; grid-template-columns: 2.25in 1fr 1.38in; gap: 24px; align-items: start; padding-top: 18px; }
  .hy-back.banded .body-grid { padding-top: 0; }
  .hy-back .founder-card { border: 1.5px solid rgba(7,20,13,0.30); background: #fff; padding: 10px; }
  .hy-back .founder-card .logo { width: 1.68in; display: block; margin-bottom: 10px; }
  .hy-back .founder-card .photo { width: 1.72in; height: 1.88in; object-fit: cover; display: block; border: 1px solid rgba(7,20,13,0.18); }
  .hy-back .founder-card .name { font: 900 12.5px 'Inter'; margin-top: 8px; }
  .hy-back .founder-card .sub { font: 500 10px 'Inter'; color: var(--slate); margin-top: 2px; letter-spacing: 0.04em; }
  .hy-back .benefits { border-left: 1.5px solid rgba(7,20,13,0.34); padding-left: 20px; }
  .hy-back .benefits .item { padding: 6px 0 12px; border-bottom: 1px solid rgba(7,20,13,0.16); }
  .hy-back .benefits .item:last-child { border-bottom: 0; }
  .hy-back .benefits .key { font: 900 38px/1 'Inter'; letter-spacing: -0.02em; }
  .hy-back .benefits .tail { font: 700 17px 'Inter'; margin-left: 7px; color: var(--slate); }
  .hy-back .benefits p { margin: 6px 0 0; font: 600 13px/1.38 'Inter'; }
  .hy-back .qr-panel { border: 1.5px solid rgba(7,20,13,0.35); background: #fff; padding: 12px 8px; text-align: center; }
  .hy-back .qr-panel img { width: 1.18in; height: 1.18in; display: block; margin: 0 auto; }
  .hy-back .qr-panel p { margin: 8px 0 0; font: 600 10px/1.35 'Inter'; }
  .hy-back .domain-row { margin-top: auto; padding-top: 12px; text-align: center; }
  .hy-back .domain-row span { font: 900 36px 'Inter'; letter-spacing: -0.01em; border-bottom: 3px solid var(--green); padding-bottom: 4px; }
`;

const CONCEPTS = [
  {
    num: "01",
    slug: "editorial-callout-bands",
    title: "Editorial Callout Bands",
    mode: "callout-band",
    rationale:
      "Keeps the V2 01 editorial grid and line-chart logic, but borrows V2 03's dark callout-band discipline for stronger mailbox contrast. The copy/name block and QR are framed as distinct modules without moving away from the base editorial feel.",
  },
  {
    num: "02",
    slug: "editorial-paper-bar",
    title: "Editorial Paper Bar",
    mode: "paper-bar",
    rationale:
      "Keeps the V2 01 centered editorial hierarchy, then adds V2 04's warm paper tone and bar-chart proof. The front uses explicit frames around the headline/advisor copy and chart so the copy itself feels more highlighted.",
  },
  {
    num: "03",
    slug: "editorial-framed-amalgam",
    title: "Editorial Framed Amalgam",
    mode: "full-hybrid",
    rationale:
      "A fuller amalgamation of the base and tweaks: editorial hierarchy, V2 03 callout bands, V2 04 cream-paper/bar-chart language, and stronger front-side frames around both the core copy/name and the chart.",
  },
];

function proofHtml(concept) {
  const fileBase = `SWW_YAPTOM_EditorialHybrids_${concept.num}_${concept.slug}`;
  return {
    fileBase,
    html: `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>SWW EDDM Editorial Hybrid · ${concept.num} ${concept.title}</title>
  <style>${COMMON_CSS}${CSS}</style>
</head>
<body>
  <div class="label-front">${concept.num} · ${concept.title}</div>
  <div class="stage">
    <div class="card trim" id="front">
      <span class="corner tl">FRONT · trim 8.5 × 6.25 in · bleed 0.125 in</span>
      <span class="corner tr">${concept.title}</span>
      ${front(concept)}
    </div>
    <div class="card trim" id="back">
      <span class="corner tl">BACK · trim 8.5 × 6.25 in · bleed 0.125 in</span>
      <span class="corner tr">${concept.title}</span>
      ${back(concept)}
    </div>
  </div>
</body>
</html>`,
  };
}

for (const concept of CONCEPTS) {
  const { html, fileBase } = proofHtml(concept);
  fs.writeFileSync(path.join(OUT, `${fileBase}_Proof.html`), html);
  fs.writeFileSync(
    path.join(OUT, `${fileBase}_Rationale.md`),
    `# ${concept.num} · ${concept.title}\n\n**Base:** V2 01 Editorial Rule\n\n**Intent:** ${concept.rationale}\n\n**Requested ingredients:** V2 03 callout bands, V2 04 paper-and-ink bar chart, stronger front-side frames around the chart and the advisor/copy block.\n`
  );
  console.log("wrote", `${fileBase}_Proof.html`);
  console.log("wrote", `${fileBase}_Rationale.md`);
}

fs.writeFileSync(
  path.join(OUT, "README.md"),
  `# Save Upgrade Tools v2 Editorial Hybrids\n\nGenerated from V2 01 Editorial Rule as the base.\n\n- 01 Editorial Callout Bands: base editorial grid plus V2 03 callout-band discipline.\n- 02 Editorial Paper Bar: base editorial hierarchy plus V2 04 cream paper and bar-chart proof.\n- 03 Editorial Framed Amalgam: combined callout bands, cream paper, bar chart, and stronger front-side framing.\n`
);

fs.writeFileSync(
  path.join(OUT, "mailer-assets-manifest.json"),
  JSON.stringify(
    {
      name: "SWW YAPTOM Save Upgrade Tools v2 Editorial Hybrids",
      generatedAt: new Date().toISOString(),
      base: "V2 01 Editorial Rule",
      dimensions: {
        trimInches: { width: 8.5, height: 6.25 },
        bleedInches: 0.125,
        pdfPageInches: { width: 8.75, height: 6.5 },
        proofPixels: { width: 1750, height: 1300 },
      },
      concepts: CONCEPTS.map(({ num, slug, title, rationale }) => ({
        num,
        slug,
        title,
        intent: rationale,
        files: {
          proofHtml: `SWW_YAPTOM_EditorialHybrids_${num}_${slug}_Proof.html`,
          frontPng: `SWW_YAPTOM_EditorialHybrids_${num}_${slug}_Front_Proof.png`,
          backPng: `SWW_YAPTOM_EditorialHybrids_${num}_${slug}_Back_Proof.png`,
          rationale: `SWW_YAPTOM_EditorialHybrids_${num}_${slug}_Rationale.md`,
        },
      })),
    },
    null,
    2
  )
);
