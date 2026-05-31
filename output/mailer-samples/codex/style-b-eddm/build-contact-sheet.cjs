const fs = require("fs");
const path = require("path");

const OUT = __dirname;
const CONCEPTS = [
  ["01", "hero-gap", "Hero Gap", "Postcard headline plus lifetime-fee-gap proof and two-path chart."],
  ["02", "three-taps", "Three Taps", "Simple scan promise plus poll, tiles, and quote."],
  ["03", "advisor-story", "Advisor Proof", "David's advisor block moves forward beside the fee-gap proof."],
];

const cards = CONCEPTS.map(([num, slug, title, note]) => {
  const base = `SWW_YAPTOM_StyleB_${num}_${slug}`;
  return `
    <section class="concept">
      <div class="heading">
        <h2>${num}. ${title}</h2>
        <p>${note}</p>
      </div>
      <div class="pair">
        <figure>
          <img src="${base}_Front_Proof.png" alt="${title} front proof">
          <figcaption>Front</figcaption>
        </figure>
        <figure>
          <img src="${base}_Back_Proof.png" alt="${title} back proof">
          <figcaption>Back</figcaption>
        </figure>
      </div>
    </section>
  `;
}).join("");

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Style B EDDM Contact Sheet</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 28px; font-family: Inter, Arial, sans-serif; background: #eef2f0; color: #07140d; }
    h1 { margin: 0 0 8px; font-size: 30px; line-height: 1.05; letter-spacing: 0; }
    .lede { margin: 0 0 24px; color: #34483c; font-size: 14px; max-width: 980px; line-height: 1.45; }
    .sheet { display: grid; gap: 28px; }
    .concept { background: #fff; border: 1px solid rgba(7,20,13,0.25); padding: 18px; }
    .heading { display: grid; grid-template-columns: 2.2in 1fr; gap: 16px; align-items: baseline; margin-bottom: 14px; }
    h2 { margin: 0; font-size: 20px; letter-spacing: 0; }
    p { margin: 0; color: #34483c; font-size: 13px; line-height: 1.4; }
    .pair { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    figure { margin: 0; }
    img { display: block; width: 100%; border: 1px solid rgba(7,20,13,0.18); }
    figcaption { margin-top: 7px; font-weight: 800; font-size: 12px; color: #34483c; text-transform: uppercase; letter-spacing: 0.08em; }
  </style>
</head>
<body>
  <h1>Style B EDDM</h1>
  <p class="lede">Three new proof concepts using David's screenshot material: the actually-overpaying hero, $952,405 fee-gap card, two-path chart, extra-money poll, 1%/$100/$0 tiles, Wall Street Journal quote, and David advisor block. Style A supplies the logo, David photo, QR code, and EDDM spacing discipline.</p>
  <main class="sheet">${cards}</main>
</body>
</html>`;

fs.writeFileSync(path.join(OUT, "SWW_YAPTOM_StyleB_ContactSheet.html"), html, "utf8");
console.log("wrote SWW_YAPTOM_StyleB_ContactSheet.html");
