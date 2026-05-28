const fs = require("fs");
const path = require("path");

const OUT = __dirname;
const CONCEPTS = [
  ["01", "editorial-callout-bands", "Editorial Callout Bands"],
  ["02", "editorial-paper-bar", "Editorial Paper Bar"],
  ["03", "editorial-framed-amalgam", "Editorial Framed Amalgam"],
];

const cards = CONCEPTS.map(([num, slug, title]) => {
  const base = `SWW_YAPTOM_EditorialHybrids_${num}_${slug}`;
  return `
    <section class="concept">
      <h2>${num}. ${title}</h2>
      <div class="pair">
        <figure>
          <img src="${base}_Front_Proof.png" alt="${title} front">
          <figcaption>Front</figcaption>
        </figure>
        <figure>
          <img src="${base}_Back_Proof.png" alt="${title} back">
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
  <title>Editorial Hybrids Contact Sheet</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 28px; font-family: Inter, Arial, sans-serif; background: #f4f1e8; color: #07140d; }
    h1 { margin: 0 0 8px; font-size: 30px; line-height: 1.05; }
    .lede { margin: 0 0 24px; color: #34483c; font-size: 14px; }
    .sheet { display: grid; gap: 28px; }
    .concept { background: #fff; border: 1px solid rgba(7,20,13,0.25); padding: 18px; }
    h2 { margin: 0 0 14px; font-size: 20px; }
    .pair { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    figure { margin: 0; }
    img { display: block; width: 100%; border: 1px solid rgba(7,20,13,0.18); }
    figcaption { margin-top: 7px; font-weight: 800; font-size: 12px; color: #34483c; text-transform: uppercase; letter-spacing: 0.08em; }
  </style>
</head>
<body>
  <h1>Save Upgrade Tools v2 Editorial Hybrids</h1>
  <p class="lede">Three V2 01-based revision candidates combining callout bands, cream paper/bar chart style, and stronger front-side framing.</p>
  <main class="sheet">${cards}</main>
</body>
</html>`;

fs.writeFileSync(path.join(OUT, "SWW_YAPTOM_EditorialHybrids_ContactSheet.html"), html);
console.log("wrote SWW_YAPTOM_EditorialHybrids_ContactSheet.html");
