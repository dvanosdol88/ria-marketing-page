/*
  Build SWW_YAPTOM_v2_ContactSheet.html (3-row × 2-col grid of front+back per concept).
  Each tile shows front PNG + back PNG side by side with slug and 1-line rationale beneath.
*/
const fs = require('fs');
const path = require('path');

const OUT = __dirname;
const CONCEPTS = [
  { num: '01', slug: 'editorial-rule', title: '01 · Editorial Rule', one: 'Hairline editorial grid; restrained green only on the $788K figure.' },
  { num: '02', slug: 'structured-columns', title: '02 · Structured Columns', one: 'Three-column Swiss grid with a receipt-style numbers panel and chart center.' },
  { num: '03', slug: 'callout-band', title: '03 · Callout Band', one: 'Single dark-ink band carries the headline; white everywhere else.' },
  { num: '04', slug: 'paper-and-ink', title: '04 · Paper & Ink', one: 'Warm paper field with bar chart; quietly premium, deliberately not mint.' },
  { num: '05', slug: 'chart-led-front', title: '05 · Chart-Led Front', one: 'Front leads with the savings curve at scale; back is the calm sibling.' },
  { num: '06', slug: 'print-safe-classic', title: '06 · Print-Safe Classic', one: 'Big type, solid colors, thick lines — the friendliest concept for any EDDM press.' },
];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #f3f3f0; font-family: 'Inter', system-ui, sans-serif; color: #07140D; -webkit-font-smoothing: antialiased; }
  .sheet { width: 14in; padding: 0.5in; margin: 0 auto; background: #ffffff; }
  .head { padding-bottom: 0.3in; border-bottom: 2px solid #07140D; margin-bottom: 0.3in; display: flex; justify-content: space-between; align-items: baseline; }
  .head h1 { margin: 0; font: 900 28px 'Inter'; letter-spacing: -0.01em; }
  .head .sub { font: 600 12px 'Inter'; color: #34483C; letter-spacing: 0.06em; text-transform: uppercase; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: repeat(3, auto); gap: 28px 28px; }
  .tile { background: #fff; padding: 16px; border: 1px solid rgba(7,20,13,0.18); }
  .tile .label { font: 800 14px 'Inter'; letter-spacing: -0.005em; display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px; }
  .tile .label .slug { font: 600 10px 'Inter'; color: #34483C; letter-spacing: 0.06em; text-transform: uppercase; }
  .tile .pair { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .tile .pair img { width: 100%; display: block; border: 1px solid rgba(7,20,13,0.10); }
  .tile .pair .lbl { font: 600 10px 'Inter'; letter-spacing: 0.06em; text-transform: uppercase; color: #34483C; margin-bottom: 4px; text-align: center; }
  .tile .one { font: 500 12px/1.45 'Inter'; color: #07140D; margin-top: 10px; }
`;

let tiles = '';
for (const c of CONCEPTS) {
  const fbase = `SWW_YAPTOM_v2_${c.num}_${c.slug}`;
  tiles += `
    <div class="tile">
      <div class="label"><span>${c.title}</span><span class="slug">${c.slug}</span></div>
      <div class="pair">
        <div><div class="lbl">FRONT</div><img src="${fbase}_Front_Proof.png" alt="${c.title} Front"/></div>
        <div><div class="lbl">BACK</div><img src="${fbase}_Back_Proof.png" alt="${c.title} Back"/></div>
      </div>
      <div class="one">${c.one}</div>
    </div>
  `;
}

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"/><title>SWW EDDM v2 — Contact Sheet</title><style>${css}</style></head>
<body>
  <div class="sheet" id="sheet">
    <div class="head">
      <h1>SWW · YAPTOM · EDDM v2 — Six Concepts</h1>
      <div class="sub">Front + back proofs · 200 px/in · 8.5 × 6.25 in trim + 0.125 in bleed</div>
    </div>
    <div class="grid">${tiles}</div>
  </div>
</body></html>`;

fs.writeFileSync(path.join(OUT, 'SWW_YAPTOM_v2_ContactSheet.html'), html);
console.log('wrote SWW_YAPTOM_v2_ContactSheet.html');
