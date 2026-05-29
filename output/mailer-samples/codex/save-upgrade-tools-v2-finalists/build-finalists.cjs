const fs = require("fs");
const path = require("path");

const OUT = __dirname;
const BASE_HTML = path.resolve(OUT, "..", "save-upgrade-tools-v2", "SWW_YAPTOM_v2_01_editorial-rule_Proof.html");

const CONCEPTS = [
  {
    num: "01",
    slug: "corrected-editorial-rule",
    title: "Corrected Editorial Rule",
    boxed: false,
    rationale:
      "V2 01 Editorial Rule with only the requested production corrections: exact checked-box icon, compact horizontal key/disclaimer, and 15% larger QR.",
  },
];

const KEY = [
  ["Portfolio", "$1,000,000"],
  ["Growth", "8% / yr"],
  ["Years", "20"],
  ["AUM fee", "1.00%"],
];

const DISCLAIMER = "Educational only. Hypothetical results are not investment advice. Actual results vary.";

function replaceFirstRequired(source, needle, replacement) {
  if (!source.includes(needle)) throw new Error(`Missing expected HTML segment: ${needle.slice(0, 80)}`);
  return source.replace(needle, replacement);
}

function buildKey() {
  return KEY.map(([label, value]) => `<span><b>${label}</b><strong>${value}</strong></span>`).join("");
}

function buildChartRow(chartFrame, qrBlock, boxed) {
  return `
      <div class="chart-row finalist-chart-row${boxed ? " boxed-version" : ""}">
        <div class="chart-proof-box">
          ${chartFrame}
          <div class="chart-meta">
            <div class="assumption-key">${buildKey()}</div>
            <div class="thin-disclaimer">${DISCLAIMER}</div>
          </div>
        </div>
        ${qrBlock}
      </div>`;
}

const source = fs.readFileSync(BASE_HTML, "utf8");
const chartRowMatch = source.match(/      <div class="chart-row">[\s\S]*?      <div class="disclosure">Educational only\.[\s\S]*?<\/div>/);
if (!chartRowMatch) throw new Error("Could not find original front chart row + disclosure block.");

const originalChartRowAndDisclosure = chartRowMatch[0];
const chartFrame = originalChartRowAndDisclosure.match(/        <div class="chart-frame">[\s\S]*?  <\/div>\r?\n        <div class="qr-block">/);
if (!chartFrame) throw new Error("Could not isolate chart frame.");
const chartFrameHtml = chartFrame[0].replace(/\r?\n        <div class="qr-block">$/, "");
const qrBlock = originalChartRowAndDisclosure.match(/        <div class="qr-block">[\s\S]*?        <\/div>\r?\n      <\/div>/);
if (!qrBlock) throw new Error("Could not isolate QR block.");
const qrBlockHtml = qrBlock[0].replace(/\r?\n      <\/div>$/, "");

const iconSvgMatch = source.match(/          <svg viewBox="0 0 24 24"[\s\S]*?<\/svg>/);
if (!iconSvgMatch) throw new Error("Could not find original no-move SVG icon.");

const finalistCss = `

    /* FINALISTS: targeted V2 01 corrections */
    .ed-front .finalist-chart-row {
      grid-template-columns: minmax(0, 1fr) 1.25in;
      gap: 22px;
      align-items: center;
    }
    .ed-front .finalist-chart-row .chart-proof-box {
      min-width: 0;
      width: fit-content;
      transform: translateX(20px);
    }
    .ed-front .finalist-chart-row .chart-frame {
      margin: 0;
      border-bottom: none;
    }
    .ed-front .finalist-chart-row .chart-frame .chart-svg {
      height: 1.34in;
    }
    .ed-front .finalist-chart-row .qr-block img {
      width: 1.2075in;
      height: 1.2075in;
    }
    .ed-front .chart-meta {
      margin: 3px 0 0;
      width: 100%;
    }
    .ed-front .assumption-key {
      display: grid;
      grid-auto-flow: column;
      grid-auto-columns: max-content;
      align-items: center;
      justify-content: start;
      column-gap: 42px;
      border-top: 1px solid rgba(7,20,13,0.20);
      border-bottom: 1px solid rgba(7,20,13,0.20);
      padding: 2px 0;
      font: 650 8.5px/1.1 'Inter';
      color: var(--ink);
      white-space: nowrap;
    }
    .ed-front .assumption-key span {
      display: inline-flex;
      align-items: baseline;
      gap: 4px;
      min-width: 0;
    }
    .ed-front .assumption-key b {
      font-weight: 600;
      color: var(--slate);
    }
    .ed-front .assumption-key strong {
      font-weight: 900;
      color: var(--ink);
    }
    .ed-front .thin-disclaimer {
      margin-top: 2px;
      width: 100%;
      text-align: center;
      font: 400 8.7px/1.15 'Inter';
      color: var(--slate);
      white-space: nowrap;
    }
    .ed-front .boxed-version .chart-proof-box {
      border: 4px solid #07140D;
      padding: 6px 8px 5px;
      background: #fff;
    }
    .ed-front .boxed-version .chart-frame {
      margin: 0;
      padding: 2px 5px;
      border-top: none;
      border-bottom: 1px solid rgba(7,20,13,0.45);
    }
    .ed-front .boxed-version .chart-frame .chart-svg {
      height: 1.22in;
    }
    .ed-front .boxed-version .chart-meta {
      margin: 3px 0 0;
    }
    .ed-back .no-move-callout img.exact-check-box {
      width: 34px;
      height: 34px;
      display: block;
      object-fit: contain;
      flex-shrink: 0;
    }
    .ed-back .founder-block .logo {
      width: 1.4in;
      margin-left: calc((1.665in - 10px - 1.4in) / 2);
    }
    .ed-back .founder-block .photo-crop {
      width: calc(1.665in - 10px);
      height: 1.89in;
      margin-top: 0.21in;
      border: 5px solid var(--green);
      box-sizing: border-box;
      overflow: hidden;
      display: block;
      background: #102318;
    }
    .ed-back .founder-block .photo-crop .photo {
      width: calc(100% + 10px);
      height: 100%;
      max-width: none;
      transform: translateX(-5px);
      border: none;
      margin: 0;
    }
    .ed-back .founder-block .name {
      font-size: 12px;
    }
`;

for (const concept of CONCEPTS) {
  const base = `SWW_YAPTOM_Finalists_${concept.num}_${concept.slug}`;
  let html = source;
  html = html.replace(/<title>.*?<\/title>/, `<title>SWW EDDM FINALISTS · ${concept.num} · ${concept.title}</title>`);
  html = html.replace(/01 · Editorial Rule/g, `FINALISTS ${concept.num} · ${concept.title}`);
  html = replaceFirstRequired(html, originalChartRowAndDisclosure, buildChartRow(chartFrameHtml, qrBlockHtml, concept.boxed));
  html = replaceFirstRequired(
    html,
    iconSvgMatch[0],
    `<img class="exact-check-box" src="brand-assets/green-checked-box-exact.png" alt=""/>`
  );
  html = replaceFirstRequired(
    html,
    `<img class="logo" src="brand-assets/logo-800.png" alt="Smarter Way Wealth"/>`,
    `<img class="logo" src="brand-assets/logo-800-cropped.png" alt="Smarter Way Wealth"/>`
  );
  html = replaceFirstRequired(
    html,
    `<img class="photo" src="brand-assets/dvo-headshot.jpg" alt="David Van Osdol"/>`,
    `<span class="photo-crop"><img class="photo" src="brand-assets/dvo-headshot.jpg" alt="David Van Osdol"/></span>`
  );
  html = html.replace("</style>", `${finalistCss}\n  </style>`);

  fs.writeFileSync(path.join(OUT, `${base}_Proof.html`), html, "utf8");
  fs.writeFileSync(
    path.join(OUT, `${base}_Rationale.md`),
    `# ${concept.num} · ${concept.title}\n\n**Group:** FINALISTS\n\n**Base:** Save Upgrade Tools v2: V2 01 Editorial Rule\n\n**Intent:** ${concept.rationale}\n\n**Requested changes:** exact upper-right checked-box crop on the back; horizontal portfolio/growth/years/AUM-fee key below the chart; shorter disclaimer in the same footprint; 15% larger QR code;${concept.boxed ? " thick black chart/key/disclaimer box." : " original chart framing retained."}\n`,
    "utf8"
  );
  console.log("wrote", `${base}_Proof.html`);
}

fs.writeFileSync(
  path.join(OUT, "README.md"),
  `# FINALISTS\n\nTargeted finalist generated from Save Upgrade Tools v2: V2 01 Editorial Rule.\n\n- 01 Corrected Editorial Rule: requested icon, compact key/disclaimer, and 15% larger QR.\n\nThe back-side checked-box icon is \`brand-assets/green-checked-box-exact.png\`, copied from the exact upper-right green checked-box crop from the supplied source sheet.\n`,
  "utf8"
);

fs.writeFileSync(
  path.join(OUT, "mailer-assets-manifest.json"),
  JSON.stringify(
    {
      name: "FINALISTS - Save Upgrade Tools v2",
      generatedAt: new Date().toISOString(),
      base: "Save Upgrade Tools v2: V2 01 Editorial Rule",
      group: "FINALISTS",
      sourceIcon: {
        crop: "brand-assets/green-checked-box-exact.png",
        note: "Exact pixel crop from the upper-right green checked-box in the supplied sheet; not redrawn.",
      },
      sourceLogo: {
        crop: "brand-assets/logo-800-cropped.png",
        note: "Visible-artwork crop of the Smarter Way Wealth logo, used so the logo centers visually above the founder photo instead of centering the whitespace-heavy PNG canvas.",
      },
      dimensions: {
        trimInches: { width: 8.5, height: 6.25 },
        bleedInches: 0.125,
        proofPageInches: { width: 8.75, height: 6.5 },
      },
      concepts: CONCEPTS.map(({ num, slug, title, rationale }) => ({
        num,
        slug,
        title,
        rationale,
        files: {
          proofHtml: `SWW_YAPTOM_Finalists_${num}_${slug}_Proof.html`,
          frontPng: `SWW_YAPTOM_Finalists_${num}_${slug}_Front_Proof.png`,
          backPng: `SWW_YAPTOM_Finalists_${num}_${slug}_Back_Proof.png`,
          rationale: `SWW_YAPTOM_Finalists_${num}_${slug}_Rationale.md`,
        },
      })),
    },
    null,
    2
  ) + "\n",
  "utf8"
);
