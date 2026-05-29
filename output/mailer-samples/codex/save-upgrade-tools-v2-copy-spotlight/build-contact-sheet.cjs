const fs = require("fs");
const path = require("path");

const OUT = __dirname;
const CONCEPTS = [
  ["01", "proof-card", "Proof Card", "Founder proof copy becomes a bordered centerpiece under the headline."],
  ["02", "callout-band", "Callout Band", "Founder proof copy gets a high-contrast interrupting band."],
  ["03", "advisor-frame", "Advisor Frame", "Founder proof copy and byline live in a signature-style advisor panel."],
];

const cards = CONCEPTS.map(([num, slug, title, note]) => {
  const base = `SWW_YAPTOM_CopySpotlight_${num}_${slug}`;
  return `
    <section class="concept">
      <div class="heading">
        <h2>${num}. ${title}</h2>
        <p>${note}</p>
      </div>
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
  <title>Copy Spotlight Contact Sheet</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 28px; font-family: Inter, Arial, sans-serif; background: #f4f1e8; color: #07140d; }
    h1 { margin: 0 0 8px; font-size: 30px; line-height: 1.05; letter-spacing: 0; }
    .lede { margin: 0 0 24px; color: #34483c; font-size: 14px; }
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
  <h1>Save Upgrade Tools v2 Copy Spotlight</h1>
  <p class="lede">Three V2 01-based mockups for making the Smarter Way Wealth delivery copy more prominent. All backs use the exact cropped green checked-box asset from the supplied sheet.</p>
  <main class="sheet">${cards}</main>
</body>
</html>`;

fs.writeFileSync(path.join(OUT, "SWW_YAPTOM_CopySpotlight_ContactSheet.html"), html, "utf8");
console.log("wrote SWW_YAPTOM_CopySpotlight_ContactSheet.html");
