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

function usdShort(n) {
  if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (Math.abs(n) >= 1e3) return `$${Math.round(n / 1e3)}K`;
  return `$${Math.round(n)}`;
}

function buildProjectionSeries() {
  const initialInvestment = 1000000;
  const years = 20;
  const annualFeePercent = 1;
  const annualGrowthPercent = 8;
  const monthlyGrowth = Math.pow(1 + annualGrowthPercent / 100, 1 / 12) - 1;
  const aumMonthly = annualFeePercent / 100 / 12;
  let withFlat = initialInvestment;
  let withAum = initialInvestment;
  const series = [{ year: 0, withoutFees: withFlat, withFees: withAum }];

  for (let month = 1; month <= years * 12; month += 1) {
    withFlat = withFlat * (1 + monthlyGrowth) - 100;
    withAum = withAum * (1 + monthlyGrowth);
    withAum = Math.max(0, withAum - withAum * aumMonthly);
    if (month % 12 === 0) {
      series.push({ year: month / 12, withoutFees: withFlat, withFees: withAum });
    }
  }

  return series;
}

function buildV3LineChartGroup() {
  const series = buildProjectionSeries();
  const plotLeft = 70;
  const plotRight = 536;
  const plotTop = 18;
  const plotBottom = 190;
  const innerW = plotRight - plotLeft;
  const innerH = plotBottom - plotTop;
  const maxY = Math.max(...series.map((d) => Math.max(d.withoutFees, d.withFees))) * 1.05 || 1;
  const maxX = Math.max(1, series[series.length - 1].year);
  const x = (v) => plotLeft + (v / maxX) * innerW;
  const y = (v) => plotTop + innerH - (v / maxY) * innerH;
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * maxY);
  const xTicks = [0, 4, 8, 12, 16, 20];
  const flatArea =
    `M ${x(0)} ${y(0).toFixed(1)} ` +
    series.map((d) => `L ${x(d.year).toFixed(1)} ${y(d.withoutFees).toFixed(1)}`).join(" ") +
    ` L ${x(maxX).toFixed(1)} ${y(0).toFixed(1)} Z`;
  const aumD = series
    .map((d, i) => `${i === 0 ? "M" : "L"}${x(d.year).toFixed(1)} ${y(d.withFees).toFixed(1)}`)
    .join(" ");
  const flatD = series
    .map((d, i) => `${i === 0 ? "M" : "L"}${x(d.year).toFixed(1)} ${y(d.withoutFees).toFixed(1)}`)
    .join(" ");
  const finalFlat = series[series.length - 1].withoutFees;
  const finalAum = series[series.length - 1].withFees;

  return `
      <g transform="translate(-10, 2)">
        <defs>
          <linearGradient id="finalist-v3-flat-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stop-color="#00A540" stop-opacity="0.30"/>
            <stop offset="100%" stop-color="#00A540" stop-opacity="0"/>
          </linearGradient>
        </defs>
        ${yTicks
          .map(
            (tick) => `
        <line x1="${plotLeft}" y1="${y(tick).toFixed(1)}" x2="${plotRight}" y2="${y(tick).toFixed(1)}" stroke="#cbd5e1" stroke-opacity="0.5" stroke-width="1"/>
        <text x="${plotLeft - 8}" y="${(y(tick) + 4).toFixed(1)}" text-anchor="end" font-family="Inter" font-size="10" fill="#64748b" font-weight="500">${usdShort(tick)}</text>`
          )
          .join("")}
        
        <path d="${flatArea}" fill="url(#finalist-v3-flat-fill)" stroke="none"/>
        <path d="${aumD}" fill="none" stroke="#B91C1C" stroke-width="2" stroke-dasharray="5,4" stroke-linecap="round"/>
        <path d="${flatD}" fill="none" stroke="#00A540" stroke-width="3" stroke-linecap="round"/>
        <circle cx="${x(maxX).toFixed(1)}" cy="${y(finalFlat).toFixed(1)}" r="4.5" fill="#00A540" stroke="#0f172a" stroke-width="1.8"/>
        <circle cx="${x(maxX).toFixed(1)}" cy="${y(finalAum).toFixed(1)}" r="4.5" fill="white" stroke="#0f172a" stroke-width="1.8"/>
        <line x1="${plotLeft}" y1="${plotBottom}" x2="${plotRight}" y2="${plotBottom}" stroke="#cbd5e1" stroke-opacity="0.8" stroke-width="1"/>
        ${xTicks
          .map(
            (tick) => `
        <text x="${x(tick).toFixed(1)}" y="206" text-anchor="middle" font-family="Inter" font-size="10" fill="#64748b" font-weight="500">${tick}y</text>`
          )
          .join("")}
      </g>`;
}

function replaceLineChartOnly(chartFrame) {
  const lineChartPattern =
    /(      <!-- LINE CHART WRAPPER \(Shifted -10px X, \+2px Y\) -->\r?\n)      <g transform="translate\(-10, 2\)">[\s\S]*?      <\/g>(\r?\n      \r?\n      <!-- VERTICAL BAR CHART -->)/;
  if (!lineChartPattern.test(chartFrame)) {
    throw new Error("Could not isolate original line chart group.");
  }
  return chartFrame.replace(lineChartPattern, (_match, prefix, suffix) => `${prefix}${buildV3LineChartGroup()}${suffix}`);
}

function buildChartRow(chartFrame, qrBlock, boxed) {
  return `
      <div class="chart-row finalist-chart-row${boxed ? " boxed-version" : ""}">
        <div class="chart-proof-box">
          ${replaceLineChartOnly(chartFrame)}
          <div class="chart-meta">
            <div class="assumption-key">${buildKey()}</div>
            <div class="thin-disclaimer">${DISCLAIMER}</div>
          </div>
        </div>
        ${qrBlock}
      </div>
      <div class="hero-bottom-rule"></div>`;
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
    .ed-front .rule,
    .ed-front .hero-bottom-rule {
      height: 1px;
      background: rgba(7,20,13,0.55);
    }
    .ed-front .hero-bottom-rule {
      margin: 12px 0 0;
    }
    .ed-front .founder-banner {
      margin-top: 40px;
    }
    .ed-front .finalist-chart-row .chart-proof-box {
      min-width: 0;
      width: fit-content;
      transform: translateX(30px);
    }
    .ed-front .finalist-chart-row .chart-frame {
      margin: 0;
      border-top: none;
      border-bottom: none;
    }
    .ed-front .finalist-chart-row .chart-frame .chart-svg {
      height: 1.34in;
    }
    .ed-front .finalist-chart-row .qr-block img {
      width: 1.2075in;
      height: 1.2075in;
    }
    .ed-front .finalist-chart-row .qr-block {
      transform: translateX(-5px);
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
      width: 24.5px;
      height: 24.5px;
      display: block;
      object-fit: contain;
      flex-shrink: 0;
    }
    .ed-back .founder-block .logo {
      width: 1.33in;
      margin-left: calc((1.4828in - 1.33in) / 2);
      transform: translateY(8px);
    }
    .ed-back .founder-block .photo-crop {
      width: 1.4828in;
      height: 1.7955in;
      margin-top: 0.21in;
      border: 2.5px solid var(--green);
      box-sizing: border-box;
      overflow: hidden;
      display: block;
      background: #102318;
      transform: translateY(13px);
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
      margin-top: 26px;
    }
    .ed-back .founder-block .sub {
      margin-top: 2px;
    }
    .ed-back .benefits {
      transform: translate(-10px, 5px);
    }
    .ed-back .benefits .item {
      position: relative;
      border-bottom: none;
    }
    .ed-back .benefits .item:not(:last-child)::after {
      content: "";
      position: absolute;
      left: 0;
      right: 10px;
      bottom: 0;
      height: 1px;
      background: var(--rule);
    }
    .ed-back .benefits .key {
      font-weight: 800;
    }
    .ed-back .benefits .tail {
      margin-left: 4px;
    }
    .ed-back .no-move-callout {
      margin-top: 32px;
      transform: translate(-5px, 0);
    }
    .ed-back .no-move-callout span {
      font: italic 700 14.5px/1.3 'Inter';
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
  html = replaceFirstRequired(
    html,
    `<span>No need to move your assets or open new accounts!</span>`,
    `<span>We work where you already are- no need to transfer assets!</span>`
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
