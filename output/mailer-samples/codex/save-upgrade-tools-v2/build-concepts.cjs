/*
  Build 6 distinct EDDM mailer concepts (front + back) for SWW / youarepayingtoomuch.com.
  Output:
    - SWW_YAPTOM_v2_<NN>_<slug>_Proof.html       (single HTML, front + back stacked, with trim guides)
    - SWW_YAPTOM_v2_<NN>_<slug>_Rationale.md     (short concept rationale)
  Rendering of PNGs is done separately by render.cjs (Playwright).
*/
const fs = require('fs');
const path = require('path');

const OUT = __dirname;
const ASSETS_REL = 'brand-assets'; // relative to OUT for HTML

// ---------- Shared copy (verbatim, from handoff) ----------
const COPY = {
  domain: 'youarepayingtoomuch.com',
  headline: 'What would you do with',
  dollar: '$788,000',
  star: '*',
  qMark: '?',
  footnote: '* potential savings over 20 years.',
  founderProof:
    'Smarter Way Wealth delivers personal, real human fiduciary advice and planning for a simple $100/month. Period.',
  byline: 'David Van Osdol, CFA, CFP',
  disclosure:
    'Educational only. Hypothetical results are not investment advice. Actual results vary. Example assumes a $1,000,000 portfolio, 8% annual growth, a 1% asset-based fee, 20 years, and a $100/month flat advisory fee.',
  qrCaption: 'See how much you can save using your actual numbers.',
  // back
  saveTitle: 'Save',
  saveTail: ' a Ton!',
  saveBody: '$100/mo. flat fee vs. % asset-based fee.',
  upgradeTitle: 'Upgrade',
  upgradeTail: ' your Advice',
  upgradeBody: 'Highly credentialed, highly experienced.',
  improveTitle: 'Improve',
  improveTail: ' your Tools',
  // "Better financial planning tools that you own." — "you" bold black
  improveBodyPre: 'Better financial planning tools that ',
  improveBodyEmph: 'you',
  improveBodyPost: ' own.',
  // Indicia copy block
  returnLine1: 'Smarter Way Wealth, LLC',
  returnLine2: 'youarepayingtoomuch.com',
  returnLine3: 'smarterwaywealth.com',
  postalCustomer: 'LOCAL POSTAL CUSTOMER',
  routeDelivery: 'EDDM route delivery',
  indicia: ['PRSRT STD', 'ECRWSS', 'U.S. POSTAGE', 'PAID', 'EDDM RETAIL'],
  founderTitle: 'David J. Van Osdol, CFA, CFP',
  founderSub: 'Founder, Smarter Way Wealth',
};

// ---------- Shared CSS (loaded into every proof) ----------
const COMMON_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=DM+Sans:wght@400;500;700&display=swap');

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
    margin: 0; padding: 0;
    background: #e9eae6;
    font-family: 'Inter', system-ui, Arial, Helvetica, sans-serif;
    color: var(--ink);
    -webkit-font-smoothing: antialiased;
    text-rendering: geometricPrecision;
  }
  .stage {
    display: flex; flex-direction: column; align-items: center; gap: 32px; padding: 32px 0;
  }
  .card {
    width: 8.75in;
    height: 6.5in;
    position: relative;
    background: #fff;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0,0,0,0.12);
  }
  /* trim guides — shown on screen, hidden on print */
  .trim::before, .trim::after {
    content: ''; position: absolute; pointer-events: none;
  }
  .trim::before {
    inset: 0.125in; border: 1px dashed rgba(7,20,13,0.30);
  }
  .label-front, .label-back {
    position: fixed; top: 6px; left: 50%; transform: translateX(-50%);
    font: 600 11px 'Inter', sans-serif; color: #6b6b6b;
    background: #fff; padding: 2px 10px; border-radius: 999px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.08);
    z-index: 9999;
  }
  .corner {
    position: absolute; font: 500 9px 'Inter', sans-serif; color: rgba(7,20,13,0.45);
    letter-spacing: 0.04em;
  }
  .corner.tl { top: 6px; left: 10px; }
  .corner.tr { top: 6px; right: 10px; }
  @media print {
    .trim::before { display: none; }
    .corner { display: none; }
    body { background: #fff; }
    .card { box-shadow: none; }
    .stage { gap: 0; padding: 0; }
  }
  /* Safety: arrest greens going too lime */
  .green { color: var(--green); }
  .ink { color: var(--ink); }
  .slate { color: var(--slate); }

  /* Default chart styling — concepts override locally */
  .chart-svg { display: block; width: 100%; height: 100%; }
`;

// ---------- Shared chart (SVG) — line chart, two series ----------
// Returns an SVG fragment. Style choices passed in.
function lineChartSVG(opts = {}) {
  const {
    width = 600,
    height = 320,
    feeColor = '#34483C',
    flatColor = '#00A540',
    axisColor = 'rgba(7,20,13,0.35)',
    labelColor = 'rgba(7,20,13,0.7)',
    showAnnotations = true,
    showAxisLabels = true,
    strokeW = 3.5,
    gridColor = 'rgba(7,20,13,0.08)',
    showGrid = true,
    annotateGap = true,
  } = opts;
  // Data: 21 points (years 0..20). 8% growth (no fee) vs 7% growth (1% fee).
  const startVal = 1_000_000;
  const noFeeRate = 0.08;
  const feeRate = 0.07;
  const years = 20;
  const noFee = [], withFee = [];
  for (let y = 0; y <= years; y++) {
    noFee.push(startVal * Math.pow(1 + noFeeRate, y));
    withFee.push(startVal * Math.pow(1 + feeRate, y));
  }
  // viewBox padding for axis labels
  const padL = showAxisLabels ? 56 : 16;
  const padR = 16;
  const padT = 18;
  const padB = showAxisLabels ? 30 : 16;
  const W = width, H = height;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const yMax = 5_000_000;
  const xOf = (y) => padL + (y / years) * innerW;
  const yOf = (v) => padT + (1 - v / yMax) * innerH;
  const toPath = (arr) => arr.map((v, i) => `${i === 0 ? 'M' : 'L'}${xOf(i).toFixed(1)},${yOf(v).toFixed(1)}`).join(' ');

  let gridEls = '';
  if (showGrid) {
    for (let i = 0; i <= 5; i++) {
      const v = (i / 5) * yMax;
      const y = yOf(v);
      gridEls += `<line x1="${padL}" y1="${y.toFixed(1)}" x2="${W - padR}" y2="${y.toFixed(1)}" stroke="${gridColor}" stroke-width="1"/>`;
    }
  }

  let axisLabels = '';
  if (showAxisLabels) {
    // Y axis labels: $0, $1M, $2M, ... $5M
    for (let i = 0; i <= 5; i++) {
      const v = (i / 5) * yMax;
      const y = yOf(v);
      axisLabels += `<text x="${padL - 8}" y="${(y + 3.5).toFixed(1)}" text-anchor="end" font-family="Inter" font-size="11" fill="${labelColor}">$${i === 0 ? '0' : i + 'M'}</text>`;
    }
    // X axis labels: 0y, 5y, 10y, 15y, 20y
    [0, 5, 10, 15, 20].forEach((y) => {
      const x = xOf(y);
      axisLabels += `<text x="${x.toFixed(1)}" y="${H - padB + 16}" text-anchor="middle" font-family="Inter" font-size="11" fill="${labelColor}">${y}y</text>`;
    });
  }

  // Gap shading between curves
  const gapArea = `M${noFee.map((v, i) => `${xOf(i).toFixed(1)},${yOf(v).toFixed(1)}`).join(' L')} L${withFee.slice().reverse().map((v, i) => `${xOf(years - i).toFixed(1)},${yOf(v).toFixed(1)}`).join(' L')} Z`;

  const endX = xOf(years).toFixed(1);
  const endY_noFee = yOf(noFee[years]).toFixed(1);
  const endY_fee = yOf(withFee[years]).toFixed(1);

  let annotations = '';
  if (showAnnotations) {
    annotations += `
      <text x="${endX - 6}" y="${(parseFloat(endY_noFee) - 8).toFixed(1)}" text-anchor="end" font-family="Inter" font-size="12" font-weight="700" fill="${flatColor}">$4,604,057</text>
      <text x="${endX - 6}" y="${(parseFloat(endY_fee) + 16).toFixed(1)}" text-anchor="end" font-family="Inter" font-size="12" font-weight="700" fill="${feeColor}">$3,815,751</text>
    `;
    if (annotateGap) {
      // Place the $788,306 gap label INSIDE the chart, anchored to year ~14 between the two curves.
      const annYear = 14;
      const annX = xOf(annYear);
      const annValNoFee = startVal * Math.pow(1 + noFeeRate, annYear);
      const annValFee = startVal * Math.pow(1 + feeRate, annYear);
      const annYNoFee = yOf(annValNoFee);
      const annYFee = yOf(annValFee);
      const midY = ((annYNoFee + annYFee) / 2).toFixed(1);
      annotations += `
        <line x1="${endX}" y1="${endY_noFee}" x2="${endX}" y2="${endY_fee}" stroke="${flatColor}" stroke-width="1.5" stroke-dasharray="3 3"/>
        <text x="${annX.toFixed(1)}" y="${midY}" text-anchor="middle" font-family="Inter" font-size="12" font-weight="800" fill="${flatColor}">$788,306 gap</text>
      `;
    }
  }

  return `
    <svg class="chart-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
      ${gridEls}
      <path d="${gapArea}" fill="${flatColor}" fill-opacity="0.10" />
      <path d="${toPath(withFee)}" fill="none" stroke="${feeColor}" stroke-width="${strokeW}" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="${toPath(noFee)}" fill="none" stroke="${flatColor}" stroke-width="${strokeW}" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="${padL}" y1="${H - padB}" x2="${W - padR}" y2="${H - padB}" stroke="${axisColor}" stroke-width="1"/>
      ${axisLabels}
      ${annotations}
    </svg>
  `;
}

// Bar-style chart variant (paper-and-ink concept)
function barChartSVG(opts = {}) {
  const {
    width = 600,
    height = 320,
    feeColor = '#34483C',
    flatColor = '#00A540',
    labelColor = 'rgba(7,20,13,0.7)',
  } = opts;
  const W = width, H = height;
  const padL = 100, padR = 24, padT = 28, padB = 40;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const bars = [
    { label: 'With 1% asset fee', value: 3_815_751, color: feeColor, fmt: '$3,815,751' },
    { label: 'With $100/mo flat fee', value: 4_604_057, color: flatColor, fmt: '$4,604,057' },
  ];
  const maxV = 5_000_000;
  const barH = 56;
  const gap = 30;
  const totalBarsH = bars.length * barH + (bars.length - 1) * gap;
  const startY = padT + (innerH - totalBarsH) / 2;

  let els = '';
  bars.forEach((b, i) => {
    const y = startY + i * (barH + gap);
    const w = (b.value / maxV) * innerW;
    els += `
      <text x="${padL - 10}" y="${y + barH / 2 + 4}" text-anchor="end" font-family="Inter" font-size="12" font-weight="600" fill="${labelColor}">${b.label}</text>
      <rect x="${padL}" y="${y}" width="${w.toFixed(1)}" height="${barH}" fill="${b.color}"/>
      <text x="${padL + w - 12}" y="${y + barH / 2 + 5}" text-anchor="end" font-family="Inter" font-size="14" font-weight="800" fill="#fff">${b.fmt}</text>
    `;
  });

  // Gap callout
  const gapW = ((bars[1].value - bars[0].value) / maxV) * innerW;
  const gapY = startY + barH + gap / 2;
  els += `
    <line x1="${padL + ((bars[0].value / maxV) * innerW).toFixed(1)}" y1="${startY + barH}" x2="${padL + ((bars[0].value / maxV) * innerW).toFixed(1)}" y2="${startY + barH + gap}" stroke="${flatColor}" stroke-width="1.25" stroke-dasharray="3 3"/>
    <line x1="${padL + ((bars[1].value / maxV) * innerW).toFixed(1)}" y1="${startY + barH + gap}" x2="${padL + ((bars[1].value / maxV) * innerW).toFixed(1)}" y2="${startY + barH + gap + barH}" stroke="${flatColor}" stroke-width="1.25" stroke-dasharray="3 3"/>
    <text x="${padL + ((bars[0].value / maxV) * innerW) + gapW / 2}" y="${gapY + 5}" text-anchor="middle" font-family="Inter" font-size="13" font-weight="800" fill="${flatColor}">$788,306 gap</text>
  `;

  return `
    <svg class="chart-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
      ${els}
    </svg>
  `;
}

// ---------- The 6 concepts ----------
// Each defines: slug, title, oneLine, frontHTML(), backHTML(), css (concept-specific), rationale (full md body)

const CONCEPTS = [];

// ---------- Concept 01 — editorial-rule ----------
CONCEPTS.push({
  num: '01',
  slug: 'editorial-rule',
  title: 'Editorial Rule',
  oneLine:
    'Newspaper-style hairline grid: huge dollar figure, generous white, restrained green only on the headline number.',
  rationaleBody: `A restrained editorial layout that lets the savings number do the talking. Thin black hairlines define an editorial grid; brand green is reserved for the $788,000 figure and a single keyline under the domain. The chart sits inside its own hairline-framed module with axis labels that read like a print pull-out. The back mirrors the same hairline grammar — Save / Upgrade / Improve are set as oversized typographic anchors with body copy beneath, and the mailing indicia block is preserved cleanly above the rule.\n\n**Print-safety verdict: Medium.** No fills or gradients, but the 1px hairlines and small axis labels demand a press that holds fine line work; verify hairline weights with the printer if they run on uncalibrated digital.`,
  css: `
    .ed-front, .ed-back { padding: 0.36in 0.5in 0.32in; background: #fff; color: var(--ink); height: 100%; box-sizing: border-box; display: flex; flex-direction: column; }
    .ed-front .kicker { text-align: center; font: 700 14px 'Inter'; letter-spacing: 0.02em; }
    .ed-front .kicker .domain { border-bottom: 1.5px solid var(--green); padding-bottom: 2px; }
    .ed-front .rule { height: 1px; background: rgba(7,20,13,0.55); margin: 12px 0 14px; }
    .ed-front .headline {
      font: 900 56px/0.96 'Inter'; letter-spacing: -0.02em; text-align: center;
    }
    .ed-front .headline .dollar { color: var(--green); font-size: 74px; }
    .ed-front .footnote { text-align: center; font: 500 13px 'Inter'; color: var(--slate); margin-top: 8px; }
    .ed-front .founder { text-align: center; font: 500 14px/1.4 'Inter'; color: var(--ink); margin-top: 14px; max-width: 6.8in; margin-left:auto; margin-right:auto; }
    .ed-front .byline { text-align: center; font: 800 12px 'Inter'; letter-spacing: 0.06em; text-transform: uppercase; margin-top: 8px; }
    .ed-front .chart-row { display: grid; grid-template-columns: 1fr 1.25in; gap: 22px; margin-top: 12px; align-items: center; }
    .ed-front .chart-frame { border-top: 1px solid var(--rule-strong); border-bottom: 1px solid var(--rule-strong); padding: 10px 0; }
    .ed-front .chart-frame .chart-svg { width: 100%; height: 1.3in; }
    .ed-front .qr-block { text-align: center; }
    .ed-front .qr-block img { width: 1.05in; height: 1.05in; display: block; margin: 0 auto; }
    .ed-front .qr-block .qr-cap { font: 600 9.5px 'Inter'; margin-top: 6px; letter-spacing: 0.04em; }
    .ed-front .disclosure { font: 400 9.5px/1.35 'Inter'; color: var(--slate); margin-top: 10px; text-align: center; max-width: 7.4in; margin-left:auto; margin-right:auto; }

    .ed-back .indicia { display: grid; grid-template-columns: 1fr 1fr 1fr; align-items: start; padding-bottom: 18px; border-bottom: 1px solid rgba(7,20,13,0.55); }
    .ed-back .indicia .ret { font: 500 11px/1.45 'Inter'; }
    .ed-back .indicia .ret .name { font-weight: 800; margin-bottom: 4px; }
    .ed-back .indicia .addr { text-align: center; font: 800 14px 'Inter'; letter-spacing: 0.05em; padding-top: 6px; }
    .ed-back .indicia .addr .sub { font: 400 10px 'Inter'; letter-spacing: 0.04em; margin-top: 4px; color: var(--slate); text-transform: none; font-weight: 500; }
    .ed-back .indicia .ind { justify-self: end; border: 1px solid var(--ink); padding: 8px 14px; font: 700 10px/1.4 'Inter'; text-align: center; letter-spacing: 0.05em; width: 1.55in; }
    .ed-back .body-grid { display: grid; grid-template-columns: 2.4in 1fr 1.4in; gap: 28px; padding-top: 28px; align-items: start; }
    .ed-back .founder-block .logo { width: 1.7in; display: block; margin-bottom: 14px; }
    .ed-back .founder-block .photo { width: 1.85in; height: 2.1in; object-fit: cover; display: block; border: 1px solid var(--rule); }
    .ed-back .founder-block .name { font: 800 13px 'Inter'; margin-top: 10px; letter-spacing: 0.02em; }
    .ed-back .founder-block .sub { font: 500 10px 'Inter'; color: var(--slate); margin-top: 2px; letter-spacing: 0.05em; }
    .ed-back .benefits .item { padding: 10px 0 14px; border-bottom: 1px solid var(--rule); }
    .ed-back .benefits .item:last-child { border-bottom: none; }
    .ed-back .benefits .key { font: 900 36px/1 'Inter'; letter-spacing: -0.02em; }
    .ed-back .benefits .tail { font: 600 18px 'Inter'; margin-left: 8px; color: var(--slate); }
    .ed-back .benefits .desc { font: 500 13px/1.4 'Inter'; margin-top: 6px; color: var(--ink); }
    .ed-back .benefits .desc .b-you { font-weight: 800; color: var(--ink); }
    .ed-back .qr-col { text-align: center; }
    .ed-back .qr-col img { width: 1.4in; height: 1.4in; display: block; margin: 0 auto; }
    .ed-back .qr-col .cap { font: 500 10px/1.35 'Inter'; margin-top: 8px; color: var(--ink); }
    .ed-back .domain-row { margin-top: 18px; text-align: center; padding-top: 16px; border-top: 1px solid var(--rule-strong); }
    .ed-back .domain-row .domain { font: 900 38px 'Inter'; letter-spacing: -0.01em; color: var(--ink); }
    .ed-back .domain-row .rule-under { width: 1.4in; height: 2px; background: var(--green); margin: 8px auto 0; }
  `,
  frontHTML: () => `
    <div class="ed-front">
      <div class="kicker"><span class="domain">${COPY.domain}</span></div>
      <div class="rule"></div>
      <div class="headline">${COPY.headline}<br/><span class="dollar">${COPY.dollar}${COPY.star}${COPY.qMark}</span></div>
      <div class="footnote">${COPY.footnote}</div>
      <div class="founder">${COPY.founderProof}</div>
      <div class="byline">${COPY.byline}</div>
      <div class="chart-row">
        <div class="chart-frame">${lineChartSVG({ width: 720, height: 220, feeColor: '#34483C', flatColor: '#00A540', strokeW: 3 })}</div>
        <div class="qr-block">
          <img src="${ASSETS_REL}/yaptom_default_inputs_qr.png" alt="Scan to run your numbers"/>
          <div class="qr-cap">SCAN TO RUN YOUR NUMBERS</div>
        </div>
      </div>
      <div class="disclosure">${COPY.disclosure}</div>
    </div>
  `,
  backHTML: () => `
    <div class="ed-back" style="padding:0.5in 0.5in 0.45in; background:#fff; color:var(--ink);">
      <div class="indicia">
        <div class="ret"><div class="name">${COPY.returnLine1}</div>${COPY.returnLine2}<br/>${COPY.returnLine3}</div>
        <div class="addr">${COPY.postalCustomer}<div class="sub">${COPY.routeDelivery}</div></div>
        <div class="ind">${COPY.indicia.join('<br/>')}</div>
      </div>
      <div class="body-grid">
        <div class="founder-block">
          <img class="logo" src="${ASSETS_REL}/logo-800.png" alt="Smarter Way Wealth"/>
          <img class="photo" src="${ASSETS_REL}/dvo-headshot.jpg" alt="David Van Osdol"/>
          <div class="name">${COPY.founderTitle}</div>
          <div class="sub">${COPY.founderSub}</div>
        </div>
        <div class="benefits">
          <div class="item">
            <div><span class="key ink">${COPY.saveTitle}</span><span class="tail">${COPY.saveTail}</span></div>
            <div class="desc">${COPY.saveBody}</div>
          </div>
          <div class="item">
            <div><span class="key ink">${COPY.upgradeTitle}</span><span class="tail">${COPY.upgradeTail}</span></div>
            <div class="desc">${COPY.upgradeBody}</div>
          </div>
          <div class="item">
            <div><span class="key ink">${COPY.improveTitle}</span><span class="tail">${COPY.improveTail}</span></div>
            <div class="desc">${COPY.improveBodyPre}<span class="b-you">${COPY.improveBodyEmph}</span>${COPY.improveBodyPost}</div>
          </div>
        </div>
        <div class="qr-col">
          <img src="${ASSETS_REL}/yaptom_default_inputs_qr.png" alt="QR"/>
          <div class="cap">${COPY.qrCaption}</div>
        </div>
      </div>
      <div class="domain-row">
        <div class="domain">${COPY.domain}</div>
        <div class="rule-under"></div>
      </div>
    </div>
  `,
});

// ---------- Concept 02 — structured-columns ----------
CONCEPTS.push({
  num: '02',
  slug: 'structured-columns',
  title: 'Structured Columns',
  oneLine:
    'Three-column Swiss-style grid: founder voice on left, headline + chart center, QR + receipt-style numbers right.',
  rationaleBody: `A disciplined three-column grid drives clear reading order across both sides. A 2pt brand-green keyline marks each column header without flooding any panel with mint. The center column carries the headline and chart; the right column compresses the savings numbers like a small receipt, anchored by the QR. The back uses the same column structure to give the indicia block a clean home above a horizontal divider, with logo + photo + title in the left column, benefit copy center, and QR + domain right.\n\n**Print-safety verdict: Medium-high.** Ink coverage is modest, no gradients, no halftones. The keylines are 2pt — friendly to consumer EDDM presses — but verify the green hits #00A540 cleanly on whatever stock the printer specs.`,
  css: `
    .sc-front, .sc-back { padding: 0.45in 0.5in 0.4in; background: #fff; color: var(--ink); display: grid; grid-template-rows: auto 1fr auto; gap: 16px; }
    .sc-front .topbar { display: flex; justify-content: space-between; align-items: baseline; border-bottom: 2px solid var(--green); padding-bottom: 8px; }
    .sc-front .topbar .domain { font: 900 22px 'Inter'; letter-spacing: -0.01em; }
    .sc-front .topbar .meta { font: 600 11px 'Inter'; letter-spacing: 0.08em; color: var(--slate); text-transform: uppercase; }
    .sc-front .body { display: grid; grid-template-columns: 1.7in 1fr 1.7in; gap: 18px; align-items: start; }
    .sc-front .col-head { font: 800 10px 'Inter'; letter-spacing: 0.12em; text-transform: uppercase; color: var(--green); border-top: 2px solid var(--green); padding-top: 6px; margin-bottom: 10px; }
    .sc-front .founder p { font: 500 12px/1.4 'Inter'; color: var(--ink); margin: 0 0 8px; }
    .sc-front .founder .byline { font: 800 11.5px 'Inter'; letter-spacing: 0.04em; text-transform: uppercase; }
    .sc-front .headline-col .headline { font: 900 44px/0.96 'Inter'; letter-spacing: -0.025em; }
    .sc-front .headline-col .headline .dollar { color: var(--green); display: block; font-size: 58px; }
    .sc-front .headline-col .footnote { font: 500 11.5px 'Inter'; color: var(--slate); margin-top: 6px; }
    .sc-front .headline-col .chart { margin-top: 10px; height: 1.6in; }
    .sc-front .receipt .row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px dashed var(--rule); font: 500 11px 'Inter'; }
    .sc-front .receipt .row.big { font-weight: 800; border-bottom: 2px solid var(--ink); padding-top: 7px; }
    .sc-front .receipt .row .v { font-weight: 700; }
    .sc-front .qr { margin-top: 10px; text-align: center; }
    .sc-front .qr img { width: 1.2in; height: 1.2in; display: block; margin: 0 auto; }
    .sc-front .qr .cap { font: 600 9.5px 'Inter'; margin-top: 5px; letter-spacing: 0.04em; }
    .sc-front .disclosure { font: 400 9.5px/1.4 'Inter'; color: var(--slate); border-top: 1px solid var(--rule); padding-top: 8px; }

    .sc-back .indicia { display: grid; grid-template-columns: 2.6in 1fr 2in; align-items: start; gap: 16px; border-bottom: 2px solid var(--green); padding-bottom: 14px; }
    .sc-back .indicia .ret .name { font: 800 12px 'Inter'; margin-bottom: 4px; }
    .sc-back .indicia .ret { font: 500 10.5px/1.45 'Inter'; }
    .sc-back .indicia .addr { text-align: center; font: 800 14px 'Inter'; letter-spacing: 0.05em; padding-top: 6px; }
    .sc-back .indicia .addr .sub { font: 500 10px 'Inter'; letter-spacing: 0.04em; margin-top: 4px; color: var(--slate); text-transform: none; font-weight: 500; }
    .sc-back .indicia .ind { justify-self: end; border: 1px solid var(--ink); padding: 7px 12px; font: 700 9.5px/1.4 'Inter'; text-align: center; letter-spacing: 0.05em; width: 1.55in; }
    .sc-back .grid { display: grid; grid-template-columns: 2.1in 1fr 1.7in; gap: 22px; padding-top: 22px; align-items: start; }
    .sc-back .col-head { font: 800 10px 'Inter'; letter-spacing: 0.12em; text-transform: uppercase; color: var(--green); border-top: 2px solid var(--green); padding-top: 6px; margin-bottom: 10px; }
    .sc-back .founder .logo { width: 1.55in; display: block; margin-bottom: 8px; }
    .sc-back .founder .photo { width: 1.7in; height: 2in; object-fit: cover; display: block; }
    .sc-back .founder .name { font: 800 12px 'Inter'; margin-top: 8px; letter-spacing: 0.02em; }
    .sc-back .founder .sub { font: 500 10px 'Inter'; color: var(--slate); margin-top: 2px; letter-spacing: 0.04em; }
    .sc-back .benefits .item { padding: 0 0 14px; }
    .sc-back .benefits .item + .item { padding-top: 14px; border-top: 1px solid var(--rule); }
    .sc-back .benefits .key { font: 900 40px/1 'Inter'; letter-spacing: -0.02em; }
    .sc-back .benefits .tail { font: 600 16px 'Inter'; margin-left: 6px; color: var(--slate); }
    .sc-back .benefits .desc { font: 500 13px/1.4 'Inter'; margin-top: 6px; }
    .sc-back .benefits .desc .b-you { font-weight: 800; color: var(--ink); }
    .sc-back .qrcol { text-align: center; }
    .sc-back .qrcol img { width: 1.35in; height: 1.35in; display: block; margin: 0 auto; }
    .sc-back .qrcol .cap { font: 500 10px/1.35 'Inter'; margin-top: 8px; }
    .sc-back .domain { text-align: center; padding-top: 16px; border-top: 2px solid var(--green); margin-top: 4px; }
    .sc-back .domain .d { font: 900 36px 'Inter'; letter-spacing: -0.01em; }
  `,
  frontHTML: () => `
    <div class="sc-front">
      <div class="topbar"><div class="domain">${COPY.domain}</div><div class="meta">SMARTER WAY WEALTH · FEE-SAVINGS PROOF</div></div>
      <div class="body">
        <div class="founder">
          <div class="col-head">FOUNDER</div>
          <p>${COPY.founderProof}</p>
          <div class="byline">${COPY.byline}</div>
        </div>
        <div class="headline-col">
          <div class="col-head">THE GAP</div>
          <div class="headline">${COPY.headline} <span class="dollar">${COPY.dollar}${COPY.star}${COPY.qMark}</span></div>
          <div class="footnote">${COPY.footnote}</div>
          <div class="chart">${lineChartSVG({ width: 600, height: 260, strokeW: 3.5 })}</div>
        </div>
        <div class="receipt">
          <div class="col-head">YOUR NUMBERS</div>
          <div class="row"><span>Portfolio</span><span class="v">$1,000,000</span></div>
          <div class="row"><span>Growth</span><span class="v">8% / yr</span></div>
          <div class="row"><span>Years</span><span class="v">20</span></div>
          <div class="row"><span>AUM fee</span><span class="v">1.00%</span></div>
          <div class="row big"><span>Potential gap</span><span class="v green">${COPY.dollar}</span></div>
          <div class="qr">
            <img src="${ASSETS_REL}/yaptom_default_inputs_qr.png" alt="QR"/>
            <div class="cap">SCAN · RUN YOUR NUMBERS</div>
          </div>
        </div>
      </div>
      <div class="disclosure">${COPY.disclosure}</div>
    </div>
  `,
  backHTML: () => `
    <div class="sc-back">
      <div class="indicia">
        <div class="ret"><div class="name">${COPY.returnLine1}</div>${COPY.returnLine2}<br/>${COPY.returnLine3}</div>
        <div class="addr">${COPY.postalCustomer}<div class="sub">${COPY.routeDelivery}</div></div>
        <div class="ind">${COPY.indicia.join('<br/>')}</div>
      </div>
      <div class="grid">
        <div class="founder">
          <div class="col-head">FOUNDER</div>
          <img class="logo" src="${ASSETS_REL}/logo-800.png" alt="Smarter Way Wealth"/>
          <img class="photo" src="${ASSETS_REL}/dvo-headshot.jpg" alt="David Van Osdol"/>
          <div class="name">${COPY.founderTitle}</div>
          <div class="sub">${COPY.founderSub}</div>
        </div>
        <div class="benefits">
          <div class="col-head">WHAT YOU GET</div>
          <div class="item">
            <div><span class="key ink">${COPY.saveTitle}</span><span class="tail">${COPY.saveTail}</span></div>
            <div class="desc">${COPY.saveBody}</div>
          </div>
          <div class="item">
            <div><span class="key ink">${COPY.upgradeTitle}</span><span class="tail">${COPY.upgradeTail}</span></div>
            <div class="desc">${COPY.upgradeBody}</div>
          </div>
          <div class="item">
            <div><span class="key ink">${COPY.improveTitle}</span><span class="tail">${COPY.improveTail}</span></div>
            <div class="desc">${COPY.improveBodyPre}<span class="b-you">${COPY.improveBodyEmph}</span>${COPY.improveBodyPost}</div>
          </div>
        </div>
        <div class="qrcol">
          <div class="col-head">SCAN</div>
          <img src="${ASSETS_REL}/yaptom_default_inputs_qr.png" alt="QR"/>
          <div class="cap">${COPY.qrCaption}</div>
        </div>
      </div>
      <div class="domain"><div class="d">${COPY.domain}</div></div>
    </div>
  `,
});

// ---------- Concept 03 — callout-band ----------
CONCEPTS.push({
  num: '03',
  slug: 'callout-band',
  title: 'Callout Band',
  oneLine:
    'High-contrast typographic poster: a single dark-ink callout band carries the headline; white everywhere else.',
  rationaleBody: `One bold horizontal dark-ink band carries the headline across both sides — a single point of strong contrast in an otherwise white field. The dollar figure pops in brand green inside the white band of the headline. The band recurs on the back as a slim strap that reverses the domain in white-on-ink, unifying the campaign without using any mint wash. The mailing indicia stays in a clean white zone above the strap. Save / Upgrade / Improve are oversized in dark ink against white.\n\n**Print-safety verdict: Medium.** The headline band is solid dark ink with reversed white type — easy to print, but small reversed type would be risky, so the band copy is sized large. Verify ink density on the band with the printer to keep edges crisp.`,
  css: `
    .cb-front, .cb-back { background: #fff; color: var(--ink); display: flex; flex-direction: column; height: 100%; }
    .cb-front .top { padding: 0.3in 0.5in 0.14in; text-align: center; }
    .cb-front .domain { font: 800 16px 'Inter'; letter-spacing: 0.02em; }
    .cb-front .domain .u { border-bottom: 2px solid var(--green); padding-bottom: 2px; }
    .cb-front .band { background: var(--ink); color: #fff; padding: 0.22in 0.5in; text-align: center; }
    .cb-front .band .h1 { font: 900 52px/1 'Inter'; letter-spacing: -0.02em; }
    .cb-front .band .dollar { color: var(--green); font-size: 68px; display: inline-block; margin-left: 4px; }
    .cb-front .band .foot { color: rgba(255,255,255,0.78); font: 500 12px 'Inter'; margin-top: 8px; }
    .cb-front .mid { padding: 0.16in 0.5in 0.12in; text-align: center; }
    .cb-front .mid .founder { font: 500 13px/1.4 'Inter'; max-width: 7.2in; margin: 0 auto; }
    .cb-front .mid .byline { font: 800 11.5px 'Inter'; letter-spacing: 0.08em; text-transform: uppercase; margin-top: 6px; }
    .cb-front .bottom { padding: 0 0.5in 0.06in; display: grid; grid-template-columns: 1fr 1.2in; gap: 20px; align-items: center; }
    .cb-front .bottom .chart { height: 1.45in; border-top: 1px solid var(--rule); padding-top: 6px; }
    .cb-front .bottom .qr { text-align: center; }
    .cb-front .bottom .qr img { width: 1.1in; height: 1.1in; display: block; margin: 0 auto; }
    .cb-front .bottom .qr .cap { font: 600 9.5px 'Inter'; margin-top: 5px; letter-spacing: 0.05em; }
    .cb-front .disclosure { font: 400 9px/1.35 'Inter'; color: var(--slate); text-align: center; padding: 0.08in 0.5in 0.22in; }

    .cb-back .indicia { padding: 0.32in 0.5in 0.2in; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; align-items: start; }
    .cb-back .indicia .ret { font: 500 11px/1.45 'Inter'; }
    .cb-back .indicia .ret .name { font-weight: 800; margin-bottom: 4px; }
    .cb-back .indicia .addr { text-align: center; font: 800 14px 'Inter'; letter-spacing: 0.05em; padding-top: 6px; }
    .cb-back .indicia .addr .sub { font: 500 10px 'Inter'; letter-spacing: 0.04em; margin-top: 4px; color: var(--slate); text-transform: none; font-weight: 500; }
    .cb-back .indicia .ind { justify-self: end; border: 1px solid var(--ink); padding: 7px 12px; font: 700 10px/1.4 'Inter'; text-align: center; letter-spacing: 0.05em; width: 1.55in; }
    .cb-back .strap { background: var(--ink); color: #fff; padding: 0.16in 0.5in; text-align: center; font: 900 22px 'Inter'; letter-spacing: 0.02em; }
    .cb-back .strap .green { color: var(--green); margin-left: 6px; }
    .cb-back .body { padding: 0.28in 0.5in 0.22in; display: grid; grid-template-columns: 2.2in 1fr 1.4in; gap: 26px; align-items: start; }
    .cb-back .body .founder .logo { width: 1.5in; display: block; margin-bottom: 8px; }
    .cb-back .body .founder .photo { width: 1.85in; height: 2.05in; object-fit: cover; display: block; }
    .cb-back .body .founder .name { font: 800 12px 'Inter'; margin-top: 8px; letter-spacing: 0.02em; }
    .cb-back .body .founder .sub { font: 500 10px 'Inter'; color: var(--slate); margin-top: 2px; letter-spacing: 0.04em; }
    .cb-back .body .benefits .item { padding: 6px 0 14px; }
    .cb-back .body .benefits .key { font: 900 42px/1 'Inter'; letter-spacing: -0.02em; }
    .cb-back .body .benefits .tail { font: 600 17px 'Inter'; margin-left: 6px; color: var(--slate); }
    .cb-back .body .benefits .desc { font: 500 13px/1.4 'Inter'; margin-top: 6px; }
    .cb-back .body .benefits .desc .b-you { font-weight: 800; color: var(--ink); }
    .cb-back .body .qr { text-align: center; }
    .cb-back .body .qr img { width: 1.25in; height: 1.25in; display: block; margin: 0 auto; }
    .cb-back .body .qr .cap { font: 500 10.5px/1.35 'Inter'; margin-top: 8px; }
    .cb-back .domain-row { text-align: center; padding: 0.04in 0 0.18in; }
    .cb-back .domain-row .d { font: 900 36px 'Inter'; letter-spacing: -0.01em; color: var(--ink); }
    .cb-back .domain-row .u { display: inline-block; width: 1.4in; height: 2px; background: var(--green); margin-top: 6px; }
  `,
  frontHTML: () => `
    <div class="cb-front">
      <div class="top"><div class="domain"><span class="u">${COPY.domain}</span></div></div>
      <div class="band">
        <div class="h1">${COPY.headline} <span class="dollar">${COPY.dollar}${COPY.star}${COPY.qMark}</span></div>
        <div class="foot">${COPY.footnote}</div>
      </div>
      <div class="mid">
        <div class="founder">${COPY.founderProof}</div>
        <div class="byline">${COPY.byline}</div>
      </div>
      <div class="bottom">
        <div class="chart">${lineChartSVG({ width: 620, height: 240, strokeW: 3.5 })}</div>
        <div class="qr">
          <img src="${ASSETS_REL}/yaptom_default_inputs_qr.png" alt="QR"/>
          <div class="cap">SCAN TO RUN YOUR NUMBERS</div>
        </div>
      </div>
      <div class="disclosure">${COPY.disclosure}</div>
    </div>
  `,
  backHTML: () => `
    <div class="cb-back">
      <div class="indicia">
        <div class="ret"><div class="name">${COPY.returnLine1}</div>${COPY.returnLine2}<br/>${COPY.returnLine3}</div>
        <div class="addr">${COPY.postalCustomer}<div class="sub">${COPY.routeDelivery}</div></div>
        <div class="ind">${COPY.indicia.join('<br/>')}</div>
      </div>
      <div class="strap">${COPY.domain}</div>
      <div class="body">
        <div class="founder">
          <img class="logo" src="${ASSETS_REL}/logo-800.png" alt="Smarter Way Wealth"/>
          <img class="photo" src="${ASSETS_REL}/dvo-headshot.jpg" alt="David Van Osdol"/>
          <div class="name">${COPY.founderTitle}</div>
          <div class="sub">${COPY.founderSub}</div>
        </div>
        <div class="benefits">
          <div class="item">
            <div><span class="key ink">${COPY.saveTitle}</span><span class="tail">${COPY.saveTail}</span></div>
            <div class="desc">${COPY.saveBody}</div>
          </div>
          <div class="item">
            <div><span class="key ink">${COPY.upgradeTitle}</span><span class="tail">${COPY.upgradeTail}</span></div>
            <div class="desc">${COPY.upgradeBody}</div>
          </div>
          <div class="item">
            <div><span class="key ink">${COPY.improveTitle}</span><span class="tail">${COPY.improveTail}</span></div>
            <div class="desc">${COPY.improveBodyPre}<span class="b-you">${COPY.improveBodyEmph}</span>${COPY.improveBodyPost}</div>
          </div>
        </div>
        <div class="qr">
          <img src="${ASSETS_REL}/yaptom_default_inputs_qr.png" alt="QR"/>
          <div class="cap">${COPY.qrCaption}</div>
        </div>
      </div>
      <div class="domain-row">
        <div class="d">${COPY.domain}</div>
        <span class="u"></span>
      </div>
    </div>
  `,
});

// ---------- Concept 04 — paper-and-ink ----------
CONCEPTS.push({
  num: '04',
  slug: 'paper-and-ink',
  title: 'Paper & Ink',
  oneLine:
    'Warm off-white field with dark ink; brand green reserved for the dollar figure and a single keyline under the domain.',
  rationaleBody: `A quietly premium concept set on a warm paper field (#FAF8F2) — distinctly NOT mint, more like newsprint or stationery. Dark ink does the typographic work. Brand green appears only twice on the front: on the dollar figure and as a single 2pt keyline under the domain wordmark. The chart is a bar comparison rather than a line — easier to read at a glance and more in keeping with a financial editorial. The back continues the paper field with the same restrained green accent only under the domain, and the indicia clear zone is on a pure-white panel so USPS scanning is unaffected.\n\n**Print-safety verdict: Medium.** Paper-color field requires consistent flood coverage across the whole back to look intentional — a press that drifts on solids will betray banding. Suggest the printer confirm even flood coverage on the off-white.`,
  css: `
    .pi-card { background: var(--paper-warm); color: var(--ink); padding: 0.45in 0.5in 0.4in; }
    .pi-front .head { display: flex; justify-content: space-between; align-items: baseline; padding-bottom: 14px; }
    .pi-front .head .domain { font: 800 22px 'Inter'; letter-spacing: -0.005em; }
    .pi-front .head .domain .u { border-bottom: 2px solid var(--green); padding-bottom: 3px; }
    .pi-front .head .meta { font: 600 11px 'Inter'; letter-spacing: 0.10em; text-transform: uppercase; color: var(--slate); }
    .pi-front .hl { font: 900 64px/0.98 'Inter'; letter-spacing: -0.02em; margin-top: 18px; }
    .pi-front .hl .dollar { color: var(--green); }
    .pi-front .foot { font: 500 14px 'Inter'; color: var(--slate); margin-top: 8px; }
    .pi-front .founder { font: 500 14px/1.45 'Inter'; margin-top: 18px; max-width: 6.2in; }
    .pi-front .byline { font: 800 12px 'Inter'; letter-spacing: 0.08em; text-transform: uppercase; margin-top: 8px; }
    .pi-front .grid { display: grid; grid-template-columns: 1fr 1.4in; gap: 26px; align-items: center; margin-top: 22px; }
    .pi-front .grid .chart-bg { background: #fff; padding: 12px 12px 8px; border: 1px solid var(--rule); }
    .pi-front .grid .chart-bg .chart { height: 1.5in; }
    .pi-front .grid .qr { text-align: center; }
    .pi-front .grid .qr img { width: 1.3in; height: 1.3in; display: block; margin: 0 auto; background: #fff; padding: 6px; border: 1px solid var(--rule); }
    .pi-front .grid .qr .cap { font: 600 10px 'Inter'; margin-top: 6px; letter-spacing: 0.05em; }
    .pi-front .disclosure { font: 400 9.5px/1.4 'Inter'; color: var(--slate); margin-top: 16px; max-width: 7.4in; }

    .pi-back .indicia { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; align-items: start; background: #fff; padding: 14px 18px; border: 1px solid var(--rule); }
    .pi-back .indicia .ret { font: 500 11px/1.45 'Inter'; }
    .pi-back .indicia .ret .name { font-weight: 800; margin-bottom: 4px; }
    .pi-back .indicia .addr { text-align: center; font: 800 14px 'Inter'; letter-spacing: 0.05em; padding-top: 4px; }
    .pi-back .indicia .addr .sub { font: 500 10px 'Inter'; letter-spacing: 0.04em; margin-top: 4px; color: var(--slate); text-transform: none; font-weight: 500; }
    .pi-back .indicia .ind { justify-self: end; border: 1px solid var(--ink); padding: 6px 12px; font: 700 9.5px/1.35 'Inter'; text-align: center; letter-spacing: 0.05em; width: 1.55in; background: #fff; }
    .pi-back .body { display: grid; grid-template-columns: 2.1in 1fr 1.4in; gap: 26px; padding-top: 22px; align-items: start; }
    .pi-back .body .founder .logo { width: 1.55in; display: block; margin-bottom: 8px; }
    .pi-back .body .founder .photo { width: 1.85in; height: 2.05in; object-fit: cover; display: block; border: 1px solid var(--rule); }
    .pi-back .body .founder .name { font: 800 12px 'Inter'; margin-top: 8px; letter-spacing: 0.02em; }
    .pi-back .body .founder .sub { font: 500 10px 'Inter'; color: var(--slate); margin-top: 2px; letter-spacing: 0.04em; }
    .pi-back .body .benefits .item { padding: 4px 0 14px; }
    .pi-back .body .benefits .key { font: 900 40px/1 'Inter'; letter-spacing: -0.02em; }
    .pi-back .body .benefits .tail { font: 600 16px 'Inter'; margin-left: 6px; color: var(--slate); }
    .pi-back .body .benefits .desc { font: 500 13px/1.4 'Inter'; margin-top: 6px; }
    .pi-back .body .benefits .desc .b-you { font-weight: 800; color: var(--ink); }
    .pi-back .body .qr { text-align: center; }
    .pi-back .body .qr img { width: 1.3in; height: 1.3in; display: block; margin: 0 auto; }
    .pi-back .body .qr .cap { font: 500 10.5px/1.35 'Inter'; margin-top: 8px; }
    .pi-back .domain-row { margin-top: 16px; text-align: center; }
    .pi-back .domain-row .d { font: 900 36px 'Inter'; letter-spacing: -0.01em; }
    .pi-back .domain-row .u { display: inline-block; width: 1.4in; height: 2px; background: var(--green); margin-top: 6px; }
  `,
  frontHTML: () => `
    <div class="pi-card pi-front">
      <div class="head">
        <div class="domain"><span class="u">${COPY.domain}</span></div>
        <div class="meta">A fee-savings proof from Smarter Way Wealth</div>
      </div>
      <div class="hl">${COPY.headline} <span class="dollar">${COPY.dollar}${COPY.star}${COPY.qMark}</span></div>
      <div class="foot">${COPY.footnote}</div>
      <div class="founder">${COPY.founderProof}</div>
      <div class="byline">${COPY.byline}</div>
      <div class="grid">
        <div class="chart-bg"><div class="chart">${barChartSVG({ width: 660, height: 220 })}</div></div>
        <div class="qr">
          <img src="${ASSETS_REL}/yaptom_default_inputs_qr.png" alt="QR"/>
          <div class="cap">SCAN TO RUN YOUR NUMBERS</div>
        </div>
      </div>
      <div class="disclosure">${COPY.disclosure}</div>
    </div>
  `,
  backHTML: () => `
    <div class="pi-card pi-back">
      <div class="indicia">
        <div class="ret"><div class="name">${COPY.returnLine1}</div>${COPY.returnLine2}<br/>${COPY.returnLine3}</div>
        <div class="addr">${COPY.postalCustomer}<div class="sub">${COPY.routeDelivery}</div></div>
        <div class="ind">${COPY.indicia.join('<br/>')}</div>
      </div>
      <div class="body">
        <div class="founder">
          <img class="logo" src="${ASSETS_REL}/logo-800.png" alt="Smarter Way Wealth"/>
          <img class="photo" src="${ASSETS_REL}/dvo-headshot.jpg" alt="David Van Osdol"/>
          <div class="name">${COPY.founderTitle}</div>
          <div class="sub">${COPY.founderSub}</div>
        </div>
        <div class="benefits">
          <div class="item">
            <div><span class="key ink">${COPY.saveTitle}</span><span class="tail">${COPY.saveTail}</span></div>
            <div class="desc">${COPY.saveBody}</div>
          </div>
          <div class="item">
            <div><span class="key ink">${COPY.upgradeTitle}</span><span class="tail">${COPY.upgradeTail}</span></div>
            <div class="desc">${COPY.upgradeBody}</div>
          </div>
          <div class="item">
            <div><span class="key ink">${COPY.improveTitle}</span><span class="tail">${COPY.improveTail}</span></div>
            <div class="desc">${COPY.improveBodyPre}<span class="b-you">${COPY.improveBodyEmph}</span>${COPY.improveBodyPost}</div>
          </div>
        </div>
        <div class="qr">
          <img src="${ASSETS_REL}/yaptom_default_inputs_qr.png" alt="QR"/>
          <div class="cap">${COPY.qrCaption}</div>
        </div>
      </div>
      <div class="domain-row">
        <div class="d">${COPY.domain}</div>
        <span class="u"></span>
      </div>
    </div>
  `,
});

// ---------- Concept 05 — chart-led-front ----------
CONCEPTS.push({
  num: '05',
  slug: 'chart-led-front',
  title: 'Chart-Led Front',
  oneLine:
    'Front dominated by the savings curve with the headline floating over a small white card; back is the calm sibling.',
  rationaleBody: `The front leans into the data as design. The savings curve fills the lower two-thirds at scale with subtle grid lines and clear axis labels; the headline floats in a small white card pinned to the upper left and the QR sits in a white card pinned to the upper right. The relationship between dark fee curve and bright flat-fee curve is the visual hook. The back is the calm sibling: minimal, type-driven, with the same green accent only under the domain. This pairing earns the campaign asymmetry without breaking visual unity.\n\n**Print-safety verdict: Lower-medium.** The chart fills most of the front and uses fine stroke work plus tinted gap shading at ~10% opacity — those tints can drift on cheap presses. Recommend confirming the printer can hold the 10% green tint without blotching; otherwise switch the gap fill to a flat 6% gray.`,
  css: `
    .cl-front, .cl-back { background: #fff; color: var(--ink); position: relative; }
    .cl-front { padding: 0.4in 0.4in 0.35in; display: grid; grid-template-rows: auto 1fr auto; gap: 14px; }
    .cl-front .top-row { display: grid; grid-template-columns: 1fr 1.4in; gap: 16px; align-items: start; }
    .cl-front .hcard { padding: 14px 18px; border: 1.5px solid var(--ink); }
    .cl-front .hcard .domain { font: 800 13px 'Inter'; letter-spacing: 0.04em; text-transform: uppercase; }
    .cl-front .hcard .h1 { font: 900 42px/1 'Inter'; letter-spacing: -0.02em; margin-top: 6px; }
    .cl-front .hcard .h1 .dollar { color: var(--green); display: block; font-size: 54px; }
    .cl-front .hcard .foot { font: 500 11.5px 'Inter'; color: var(--slate); margin-top: 6px; }
    .cl-front .qr-card { padding: 10px; border: 1.5px solid var(--ink); text-align: center; }
    .cl-front .qr-card img { width: 1.1in; height: 1.1in; display: block; margin: 0 auto; }
    .cl-front .qr-card .cap { font: 600 9.5px/1.25 'Inter'; margin-top: 6px; letter-spacing: 0.04em; }
    .cl-front .chart-wrap { background: #fff; height: 2.6in; padding: 6px 0 0; }
    .cl-front .strap { display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 16px; }
    .cl-front .strap .left { font: 500 12.5px/1.45 'Inter'; }
    .cl-front .strap .left .byline { font: 800 12px 'Inter'; letter-spacing: 0.06em; text-transform: uppercase; margin-top: 6px; }
    .cl-front .strap .right .disclosure { font: 400 9px/1.35 'Inter'; color: var(--slate); max-width: 4.2in; }

    .cl-back { padding: 0.45in 0.5in 0.4in; display: flex; flex-direction: column; gap: 18px; }
    .cl-back .indicia { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; align-items: start; border-bottom: 2px solid var(--ink); padding-bottom: 14px; }
    .cl-back .indicia .ret { font: 500 11px/1.45 'Inter'; }
    .cl-back .indicia .ret .name { font-weight: 800; margin-bottom: 4px; }
    .cl-back .indicia .addr { text-align: center; font: 800 14px 'Inter'; letter-spacing: 0.05em; padding-top: 6px; }
    .cl-back .indicia .addr .sub { font: 500 10px 'Inter'; letter-spacing: 0.04em; margin-top: 4px; color: var(--slate); text-transform: none; font-weight: 500; }
    .cl-back .indicia .ind { justify-self: end; border: 1px solid var(--ink); padding: 7px 12px; font: 700 10px/1.35 'Inter'; text-align: center; letter-spacing: 0.05em; width: 1.55in; }
    .cl-back .row { display: grid; grid-template-columns: 2.2in 1fr 1.4in; gap: 26px; align-items: start; }
    .cl-back .row .founder .logo { width: 1.6in; display: block; margin-bottom: 8px; }
    .cl-back .row .founder .photo { width: 1.85in; height: 2.05in; object-fit: cover; display: block; }
    .cl-back .row .founder .name { font: 800 12.5px 'Inter'; margin-top: 8px; letter-spacing: 0.02em; }
    .cl-back .row .founder .sub { font: 500 10px 'Inter'; color: var(--slate); margin-top: 2px; letter-spacing: 0.04em; }
    .cl-back .row .benefits .item { padding: 4px 0 12px; }
    .cl-back .row .benefits .key { font: 900 42px/1 'Inter'; letter-spacing: -0.02em; }
    .cl-back .row .benefits .tail { font: 600 17px 'Inter'; margin-left: 6px; color: var(--slate); }
    .cl-back .row .benefits .desc { font: 500 13px/1.4 'Inter'; margin-top: 6px; }
    .cl-back .row .benefits .desc .b-you { font-weight: 800; color: var(--ink); }
    .cl-back .row .qr { text-align: center; }
    .cl-back .row .qr img { width: 1.3in; height: 1.3in; display: block; margin: 0 auto; }
    .cl-back .row .qr .cap { font: 500 10.5px/1.35 'Inter'; margin-top: 8px; }
    .cl-back .domain { text-align: center; margin-top: auto; }
    .cl-back .domain .d { font: 900 36px 'Inter'; letter-spacing: -0.01em; }
    .cl-back .domain .u { display: inline-block; width: 1.4in; height: 2px; background: var(--green); margin-top: 6px; }
  `,
  frontHTML: () => `
    <div class="cl-front">
      <div class="top-row">
        <div class="hcard">
          <div class="domain">${COPY.domain}</div>
          <div class="h1">${COPY.headline}<span class="dollar">${COPY.dollar}${COPY.star}${COPY.qMark}</span></div>
          <div class="foot">${COPY.footnote}</div>
        </div>
        <div class="qr-card">
          <img src="${ASSETS_REL}/yaptom_default_inputs_qr.png" alt="QR"/>
          <div class="cap">SCAN · RUN<br/>YOUR NUMBERS</div>
        </div>
      </div>
      <div class="chart-wrap">${lineChartSVG({ width: 920, height: 360, strokeW: 4 })}</div>
      <div class="strap">
        <div class="left">${COPY.founderProof}<div class="byline">${COPY.byline}</div></div>
        <div class="right"><div class="disclosure">${COPY.disclosure}</div></div>
      </div>
    </div>
  `,
  backHTML: () => `
    <div class="cl-back">
      <div class="indicia">
        <div class="ret"><div class="name">${COPY.returnLine1}</div>${COPY.returnLine2}<br/>${COPY.returnLine3}</div>
        <div class="addr">${COPY.postalCustomer}<div class="sub">${COPY.routeDelivery}</div></div>
        <div class="ind">${COPY.indicia.join('<br/>')}</div>
      </div>
      <div class="row">
        <div class="founder">
          <img class="logo" src="${ASSETS_REL}/logo-800.png" alt="Smarter Way Wealth"/>
          <img class="photo" src="${ASSETS_REL}/dvo-headshot.jpg" alt="David Van Osdol"/>
          <div class="name">${COPY.founderTitle}</div>
          <div class="sub">${COPY.founderSub}</div>
        </div>
        <div class="benefits">
          <div class="item">
            <div><span class="key ink">${COPY.saveTitle}</span><span class="tail">${COPY.saveTail}</span></div>
            <div class="desc">${COPY.saveBody}</div>
          </div>
          <div class="item">
            <div><span class="key ink">${COPY.upgradeTitle}</span><span class="tail">${COPY.upgradeTail}</span></div>
            <div class="desc">${COPY.upgradeBody}</div>
          </div>
          <div class="item">
            <div><span class="key ink">${COPY.improveTitle}</span><span class="tail">${COPY.improveTail}</span></div>
            <div class="desc">${COPY.improveBodyPre}<span class="b-you">${COPY.improveBodyEmph}</span>${COPY.improveBodyPost}</div>
          </div>
        </div>
        <div class="qr">
          <img src="${ASSETS_REL}/yaptom_default_inputs_qr.png" alt="QR"/>
          <div class="cap">${COPY.qrCaption}</div>
        </div>
      </div>
      <div class="domain"><div class="d">${COPY.domain}</div><span class="u"></span></div>
    </div>
  `,
});

// ---------- Concept 06 — print-safe-classic ----------
CONCEPTS.push({
  num: '06',
  slug: 'print-safe-classic',
  title: 'Print-Safe Classic',
  oneLine:
    'Maximum print-friendliness: big type, generous white, solid colors only, thick lines, no hairlines or gradients.',
  rationaleBody: `Designed deliberately for the broadest range of EDDM presses. Every element is sized large; every rule is at least 2pt; brand green is used as a solid block only (no tints, no halftones, no gradients). The chart uses thick 5pt strokes and large axis labels so even a cheap digital press lands the data cleanly. The back is the same recipe: big type, no hairlines, solid blocks, clear hierarchy. Save / Upgrade / Improve are huge — anchored left — with benefit copy in generous size beside them. Ink coverage stays modest because most of the canvas is white.\n\n**Print-safety verdict: High — this is the safety pick.** No fine line work, no tints, no gradients, no reversed small type, generous trapping margins. Any reputable EDDM printer can reproduce it cleanly on uncalibrated equipment.`,
  css: `
    .ps-front, .ps-back { background: #fff; color: var(--ink); padding: 0.5in 0.5in 0.45in; display: flex; flex-direction: column; gap: 16px; }
    .ps-front .domain-top { text-align: center; font: 900 22px 'Inter'; letter-spacing: -0.005em; }
    .ps-front .hr-thick { height: 4px; background: var(--ink); }
    .ps-front .headline { text-align: center; font: 900 64px/0.98 'Inter'; letter-spacing: -0.025em; }
    .ps-front .headline .dollar { color: var(--green); display: block; font-size: 80px; }
    .ps-front .foot { text-align: center; font: 600 14px 'Inter'; color: var(--slate); }
    .ps-front .founder { text-align: center; font: 500 15px/1.45 'Inter'; max-width: 7.2in; margin: 0 auto; }
    .ps-front .byline { text-align: center; font: 900 13px 'Inter'; letter-spacing: 0.08em; text-transform: uppercase; }
    .ps-front .chart-grid { display: grid; grid-template-columns: 1fr 1.4in; gap: 24px; align-items: center; padding-top: 6px; }
    .ps-front .chart-grid .chart { height: 1.5in; }
    .ps-front .chart-grid .qr { text-align: center; }
    .ps-front .chart-grid .qr img { width: 1.3in; height: 1.3in; display: block; margin: 0 auto; }
    .ps-front .chart-grid .qr .cap { font: 700 11px 'Inter'; margin-top: 6px; letter-spacing: 0.05em; }
    .ps-front .disclosure { font: 500 10px/1.4 'Inter'; color: var(--slate); text-align: center; }

    .ps-back .indicia { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; align-items: start; padding-bottom: 14px; border-bottom: 4px solid var(--ink); }
    .ps-back .indicia .ret { font: 600 11.5px/1.45 'Inter'; }
    .ps-back .indicia .ret .name { font-weight: 900; margin-bottom: 4px; }
    .ps-back .indicia .addr { text-align: center; font: 900 15px 'Inter'; letter-spacing: 0.05em; padding-top: 4px; }
    .ps-back .indicia .addr .sub { font: 600 10.5px 'Inter'; letter-spacing: 0.04em; margin-top: 4px; color: var(--slate); text-transform: none; font-weight: 600; }
    .ps-back .indicia .ind { justify-self: end; border: 2px solid var(--ink); padding: 8px 14px; font: 800 10px/1.4 'Inter'; text-align: center; letter-spacing: 0.05em; width: 1.6in; }
    .ps-back .row { display: grid; grid-template-columns: 2.2in 1fr 1.4in; gap: 24px; align-items: start; padding-top: 6px; }
    .ps-back .row .founder .logo { width: 1.7in; display: block; margin-bottom: 10px; }
    .ps-back .row .founder .photo { width: 1.9in; height: 2.1in; object-fit: cover; display: block; }
    .ps-back .row .founder .name { font: 900 13px 'Inter'; margin-top: 8px; letter-spacing: 0.02em; }
    .ps-back .row .founder .sub { font: 600 10.5px 'Inter'; color: var(--slate); margin-top: 2px; letter-spacing: 0.04em; }
    .ps-back .row .benefits .item { padding: 0 0 10px; }
    .ps-back .row .benefits .key { font: 900 48px/1 'Inter'; letter-spacing: -0.02em; }
    .ps-back .row .benefits .tail { font: 700 18px 'Inter'; margin-left: 8px; color: var(--slate); }
    .ps-back .row .benefits .desc { font: 600 13.5px/1.4 'Inter'; margin-top: 6px; }
    .ps-back .row .benefits .desc .b-you { font-weight: 900; color: var(--ink); }
    .ps-back .row .qr { text-align: center; }
    .ps-back .row .qr img { width: 1.4in; height: 1.4in; display: block; margin: 0 auto; }
    .ps-back .row .qr .cap { font: 600 11px/1.35 'Inter'; margin-top: 8px; }
    .ps-back .domain { text-align: center; padding-top: 14px; }
    .ps-back .domain .d { font: 900 40px 'Inter'; letter-spacing: -0.01em; }
    .ps-back .domain .u { display: inline-block; width: 1.6in; height: 4px; background: var(--green); margin-top: 8px; }
  `,
  frontHTML: () => `
    <div class="ps-front">
      <div class="domain-top">${COPY.domain}</div>
      <div class="hr-thick"></div>
      <div class="headline">${COPY.headline}<span class="dollar">${COPY.dollar}${COPY.star}${COPY.qMark}</span></div>
      <div class="foot">${COPY.footnote}</div>
      <div class="founder">${COPY.founderProof}</div>
      <div class="byline">${COPY.byline}</div>
      <div class="chart-grid">
        <div class="chart">${lineChartSVG({ width: 640, height: 220, strokeW: 5, showGrid: false, gridColor: 'transparent' })}</div>
        <div class="qr">
          <img src="${ASSETS_REL}/yaptom_default_inputs_qr.png" alt="QR"/>
          <div class="cap">SCAN TO RUN YOUR NUMBERS</div>
        </div>
      </div>
      <div class="disclosure">${COPY.disclosure}</div>
    </div>
  `,
  backHTML: () => `
    <div class="ps-back">
      <div class="indicia">
        <div class="ret"><div class="name">${COPY.returnLine1}</div>${COPY.returnLine2}<br/>${COPY.returnLine3}</div>
        <div class="addr">${COPY.postalCustomer}<div class="sub">${COPY.routeDelivery}</div></div>
        <div class="ind">${COPY.indicia.join('<br/>')}</div>
      </div>
      <div class="row">
        <div class="founder">
          <img class="logo" src="${ASSETS_REL}/logo-800.png" alt="Smarter Way Wealth"/>
          <img class="photo" src="${ASSETS_REL}/dvo-headshot.jpg" alt="David Van Osdol"/>
          <div class="name">${COPY.founderTitle}</div>
          <div class="sub">${COPY.founderSub}</div>
        </div>
        <div class="benefits">
          <div class="item">
            <div><span class="key ink">${COPY.saveTitle}</span><span class="tail">${COPY.saveTail}</span></div>
            <div class="desc">${COPY.saveBody}</div>
          </div>
          <div class="item">
            <div><span class="key ink">${COPY.upgradeTitle}</span><span class="tail">${COPY.upgradeTail}</span></div>
            <div class="desc">${COPY.upgradeBody}</div>
          </div>
          <div class="item">
            <div><span class="key ink">${COPY.improveTitle}</span><span class="tail">${COPY.improveTail}</span></div>
            <div class="desc">${COPY.improveBodyPre}<span class="b-you">${COPY.improveBodyEmph}</span>${COPY.improveBodyPost}</div>
          </div>
        </div>
        <div class="qr">
          <img src="${ASSETS_REL}/yaptom_default_inputs_qr.png" alt="QR"/>
          <div class="cap">${COPY.qrCaption}</div>
        </div>
      </div>
      <div class="domain"><div class="d">${COPY.domain}</div><span class="u"></span></div>
    </div>
  `,
});

// ---------- Render templates to disk ----------
function makeProofHTML(concept) {
  const fileBase = `SWW_YAPTOM_v2_${concept.num}_${concept.slug}`;
  const title = `${concept.num} · ${concept.title}`;
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>SWW EDDM v2 · ${title}</title>
  <style>${COMMON_CSS}${concept.css}</style>
</head>
<body>
  <div class="label-front">${title} — Front (8.75 × 6.5 in incl. 0.125 in bleed)</div>
  <div class="stage">
    <div class="card trim" data-side="front" id="front">
      <span class="corner tl">FRONT · trim 8.5 × 6.25 in · bleed 0.125 in</span>
      <span class="corner tr">${title}</span>
      ${concept.frontHTML()}
    </div>
    <div class="card trim" data-side="back" id="back">
      <span class="corner tl">BACK · trim 8.5 × 6.25 in · bleed 0.125 in</span>
      <span class="corner tr">${title}</span>
      ${concept.backHTML()}
    </div>
  </div>
</body>
</html>`;
  return { html, fileBase };
}

function writeFile(name, content) {
  fs.writeFileSync(path.join(OUT, name), content);
  console.log('wrote', name);
}

CONCEPTS.forEach((c) => {
  const { html, fileBase } = makeProofHTML(c);
  writeFile(`${fileBase}_Proof.html`, html);
  const md = `# ${c.num} · ${c.title}\n\n**Slug:** \`${c.slug}\`\n\n**One-liner:** ${c.oneLine}\n\n${c.rationaleBody}\n`;
  writeFile(`${fileBase}_Rationale.md`, md);
});

// Manifest written separately after PNGs render — see write-manifest.cjs
console.log('Concepts built:', CONCEPTS.length);
