const fs = require("fs");
const path = require("path");

const OUT = __dirname;
const ASSETS = path.join(OUT, "brand-assets");
const SOURCE_ASSETS = path.resolve(OUT, "..", "save-upgrade-tools-v2-finalists", "brand-assets");

const CONCEPTS = [
  {
    num: "01",
    slug: "hero-gap",
    title: "Hero Gap",
    rationale:
      "Style B with the postcard/landing-page headline as the main hook, followed by the lifetime-fee-gap proof and the two-path chart.",
  },
  {
    num: "02",
    slug: "three-taps",
    title: "Three Taps",
    rationale:
      "Style B with the simple three-tap promise and the extra-money poll on the front, leaving the numerical proof and advisor story for the back.",
  },
  {
    num: "03",
    slug: "advisor-story",
    title: "Advisor Proof",
    rationale:
      "Style B with the advisor/fiduciary block pulled forward so the fee-gap number is paired immediately with David's human proof.",
  },
];

const COPY = {
  domain: "youarepayingtoomuch.com",
  hero: "How much are you actually overpaying?",
  subhead: "Three taps and you'll know the dollar amount - not the percentage. The number you've never been shown.",
  feeGap: "$952,405",
  feeGapLabel: "YOUR LIFETIME FEE GAP",
  feeGapText:
    "That's how much more you'd keep with our flat $100/month fee instead of a 1% AUM advisor over 20 years.",
  feeTheir: "Their lifetime fees: $472,936",
  feeOur: "Our lifetime fees: $24,000",
  chartTitle: "Your money, two paths",
  chartSubhead: "$100/MO FLAT VS. 1.00% AUM - BOTH AT 9.0% ANNUAL GROWTH",
  poll: "What would you do with that extra money?",
  pollSubhead: "PICK YOUR FAVORITE. (NO SPOILERS, NO EMAIL REQUIRED.)",
  quote:
    '"Fees are one of the few things in investing that are entirely within your control."',
  quoteSource: "THE WALL STREET JOURNAL - ON THE MATH OF LONG-TERM INVESTING",
  advisorLabel: "MEET YOUR ADVISOR",
  advisorName: "David J. Van Osdol",
  advisorCreds: "CFA CHARTERHOLDER - CFP PRACTITIONER - CONNECTICUT",
  advisorP1:
    "I built Smarter Way Wealth because the percentage-fee model no longer matches the work. You shouldn't pay 5x more just because you saved 5x more.",
  advisorP2:
    "A flat $100/month retainer covers fiduciary planning, portfolio management, tax-aware rebalancing, and real-estate analysis - without the silent escalator.",
  advisorP3:
    "If your number above is bigger than you expected, let's have a 15-minute chat.",
  qrCaption: "Scan to run your actual numbers.",
};

function ensureAssets() {
  fs.mkdirSync(ASSETS, { recursive: true });
  const copies = [
    ["logo-800.png", "logo-800.png"],
    ["logo-strong-primary-lightbg.png", "logo-strong-primary-lightbg.png"],
    ["logo.svg", "logo.svg"],
    ["logo-icon.svg", "logo-icon.svg"],
    ["dvo-headshot.jpg", "dvo-headshot.jpg"],
    ["yaptom_default_inputs_qr.png", "yaptom_default_inputs_qr.png"],
  ];

  for (const [from, to] of copies) {
    const source = path.join(SOURCE_ASSETS, from);
    const target = path.join(ASSETS, to);
    if (!fs.existsSync(source)) throw new Error(`Missing source asset: ${source}`);
    fs.copyFileSync(source, target);
  }
}

function domainMarkup(size = "large") {
  return `<span class="domain ${size}">you<span>are</span>paying<span>too</span>much.com</span>`;
}

function qrBlock(extraClass = "") {
  return `
    <div class="qr-block ${extraClass}">
      <img src="brand-assets/yaptom_default_inputs_qr.png" alt="QR code for youarepayingtoomuch.com">
      <div class="qr-cap">${COPY.qrCaption}</div>
    </div>
  `;
}

function feeGapCard(compact = false) {
  return `
    <section class="fee-gap ${compact ? "compact" : ""}">
      <div class="fee-glow"></div>
      <p class="fee-label">${COPY.feeGapLabel}</p>
      <div class="fee-amount"><span>$</span>952,405</div>
      <p class="fee-copy">${COPY.feeGapText.replace("$100/month", "<strong>$100/month</strong>").replace("more", "<em>more</em>")}</p>
      <div class="fee-pills">
        <span>${COPY.feeTheir}</span>
        <span>${COPY.feeOur}</span>
      </div>
    </section>
  `;
}

function twoPathChart(compact = false) {
  const width = compact ? 520 : 610;
  const height = compact ? 258 : 284;
  const plot = {
    left: 58,
    top: 54,
    right: width - 34,
    bottom: height - 48,
  };
  const innerW = plot.right - plot.left;
  const innerH = plot.bottom - plot.top;
  const points = [
    [0, 1.0, 1.0],
    [4, 1.42, 1.38],
    [8, 2.02, 1.90],
    [12, 2.86, 2.60],
    [16, 4.06, 3.53],
    [20, 5.82, 4.36],
  ];
  const x = (year) => plot.left + (year / 20) * innerW;
  const y = (value) => plot.bottom - (value / 6) * innerH;
  const greenD = points.map((p, i) => `${i ? "L" : "M"}${x(p[0]).toFixed(1)} ${y(p[1]).toFixed(1)}`).join(" ");
  const redD = points.map((p, i) => `${i ? "L" : "M"}${x(p[0]).toFixed(1)} ${y(p[2]).toFixed(1)}`).join(" ");
  const areaD = `${greenD} L ${x(20).toFixed(1)} ${plot.bottom} L ${plot.left} ${plot.bottom} Z`;
  const yTicks = [
    [0, "$0"],
    [1.45, "$1.45M"],
    [2.91, "$2.91M"],
    [4.36, "$4.36M"],
    [5.82, "$5.82M"],
  ];
  const xTicks = [0, 4, 8, 12, 16, 20];

  return `
    <section class="chart-card ${compact ? "compact" : ""}">
      <div class="chart-title">${COPY.chartTitle}</div>
      <div class="chart-subhead">${COPY.chartSubhead}</div>
      <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Two-path fee comparison chart">
        <defs>
          <linearGradient id="style-b-area-${compact ? "compact" : "full"}" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stop-color="#00A540" stop-opacity="0.28"/>
            <stop offset="100%" stop-color="#00A540" stop-opacity="0.03"/>
          </linearGradient>
        </defs>
        ${yTicks
          .map(
            ([value, label]) => `
        <line x1="${plot.left}" y1="${y(value).toFixed(1)}" x2="${plot.right}" y2="${y(value).toFixed(1)}" stroke="#d7e0e8" stroke-width="1"/>
        <text x="${plot.left - 8}" y="${(y(value) + 4).toFixed(1)}" text-anchor="end" class="axis">${label}</text>`
          )
          .join("")}
        <path d="${areaD}" fill="url(#style-b-area-${compact ? "compact" : "full"})"/>
        <path d="${redD}" fill="none" stroke="#D64B3F" stroke-width="2.5" stroke-dasharray="6 5"/>
        <path d="${greenD}" fill="none" stroke="#00A540" stroke-width="4" stroke-linecap="round"/>
        <circle cx="${x(20).toFixed(1)}" cy="${y(5.82).toFixed(1)}" r="5.4" fill="#00A540" stroke="#0b1628" stroke-width="2"/>
        <circle cx="${x(20).toFixed(1)}" cy="${y(4.36).toFixed(1)}" r="5.4" fill="#eef3f7" stroke="#0b1628" stroke-width="2"/>
        ${xTicks
          .map((tick) => `<text x="${x(tick).toFixed(1)}" y="${height - 20}" text-anchor="middle" class="axis">${tick}y</text>`)
          .join("")}
      </svg>
      <div class="chart-key">
        <span><i class="green-line"></i>$100/mo flat</span>
        <span><i class="red-line"></i>Their %</span>
      </div>
    </section>
  `;
}

function pollGraphic(compact = false) {
  const options = ["Retire earlier", "A second home", "Keep investing", "Pay off mortgage", "Something else"];
  return `
    <section class="poll-card ${compact ? "compact" : ""}">
      <h3>${COPY.poll.replace("extra money", "<em>extra money</em>")}</h3>
      <p>${COPY.pollSubhead}</p>
      <div class="poll-options">
        ${options.map((option) => `<span>${option}</span>`).join("")}
      </div>
    </section>
  `;
}

function explainerTiles(compact = false) {
  return `
    <section class="tiles ${compact ? "compact" : ""}">
      <article>
        <b>1%</b>
        <strong>doesn't sound like much.</strong>
        <p>Until you compound it for 30 years - then it quietly subtracts roughly a fifth of your wealth. That's not opinion; it's arithmetic.</p>
      </article>
      <article class="green-tile">
        <b>$100</b>
        <strong>flat per month.</strong>
        <p>Same fiduciary advice. Same portfolio management. Same tax-aware planning. None of the AUM creep.</p>
      </article>
      <article class="dark-tile">
        <b>$0</b>
        <strong>extra to find out.</strong>
        <p>The calculator above is free. The 15-minute audit is free. You see your actual fee gap before you ever sign anything.</p>
      </article>
    </section>
  `;
}

function quoteBlock() {
  return `
    <section class="quote-block">
      <blockquote>${COPY.quote.replace("entirely within your control", "<em>entirely within your control</em>")}</blockquote>
      <cite>${COPY.quoteSource}</cite>
    </section>
  `;
}

function advisorBlock(compact = false) {
  return `
    <section class="advisor-block ${compact ? "compact" : ""}">
      <div class="portrait">
        <img src="brand-assets/dvo-headshot.jpg" alt="David J. Van Osdol portrait">
        <span>PORTRAIT - DVO</span>
      </div>
      <div class="advisor-copy">
        <p class="advisor-label">${COPY.advisorLabel}</p>
        <h2>${COPY.advisorName}</h2>
        <p class="creds">${COPY.advisorCreds}</p>
        <p>${COPY.advisorP1}</p>
        <p>${COPY.advisorP2}</p>
        <p>${COPY.advisorP3.replace("let's have a 15-minute chat", "<a>let's have a 15-minute chat</a>")}</p>
      </div>
    </section>
  `;
}

function postalHeader() {
  return `
    <section class="postal">
      <div class="return">
        <strong>Smarter Way Wealth, LLC</strong><br>
        youarepayingtoomuch.com<br>
        smarterwaywealth.com
      </div>
      <div class="route">
        <strong>LOCAL POSTAL CUSTOMER</strong>
        <span>EDDM route delivery</span>
      </div>
      <div class="indicia">
        PRSRT STD<br>ECRWSS<br>U.S. POSTAGE<br>PAID<br>EDDM RETAIL
      </div>
    </section>
  `;
}

function footerDomain() {
  return `<div class="footer-domain">${domainMarkup("footer")}</div>`;
}

function disclosureLine() {
  return `<p class="disclosure">Educational only. Hypothetical results are not investment advice. Actual results vary. Example assumes a $1,000,000 portfolio, 9% annual growth, a 1% asset-based advisory fee, 20 years, and a $100/month flat advisory fee.</p>`;
}

function frontFor(concept) {
  if (concept.slug === "hero-gap") {
    return `
      <div class="front style-b hero-gap-front trim" id="front">
        <span class="corner tl">BLEED</span><span class="corner tr">TRIM GUIDE</span>
        <header class="front-logo">${domainMarkup("mast")}</header>
        <section class="hero-lockup">
          <span class="scan-pill">Scanned the postcard? Welcome.</span>
          <h1>How much are you <em>actually</em> overpaying?</h1>
          <p>${COPY.subhead.replace("never", "<em>never</em>")}</p>
        </section>
        <div class="front-grid">
          <div>${feeGapCard()}${twoPathChart(true)}</div>
          ${qrBlock("front-qr")}
        </div>
        ${disclosureLine()}
      </div>
    `;
  }

  if (concept.slug === "three-taps") {
    return `
      <div class="front style-b three-taps-front trim" id="front">
        <span class="corner tl">BLEED</span><span class="corner tr">TRIM GUIDE</span>
        <header class="front-logo">${domainMarkup("mast")}</header>
        <section class="hero-row">
          <div>
            <h1>Three taps. One number.</h1>
            <p>${COPY.subhead.replace("not the percentage", "<strong>not the percentage</strong>")}</p>
          </div>
          ${qrBlock("hero-qr")}
        </section>
        ${pollGraphic()}
        ${explainerTiles()}
        ${quoteBlock()}
        ${disclosureLine()}
      </div>
    `;
  }

  return `
    <div class="front style-b advisor-proof-front trim" id="front">
      <span class="corner tl">BLEED</span><span class="corner tr">TRIM GUIDE</span>
      <header class="front-logo">${domainMarkup("mast")}</header>
      <section class="split-hero">
        <div>
          <h1>How much are you <em>actually</em> overpaying?</h1>
          ${feeGapCard(true)}
        </div>
        ${advisorBlock(true)}
      </section>
      <div class="bottom-proof">
        ${twoPathChart(true)}
        ${qrBlock("front-qr")}
      </div>
      ${disclosureLine()}
    </div>
  `;
}

function backFor(concept) {
  if (concept.slug === "hero-gap") {
    return `
      <div class="back style-b hero-gap-back trim" id="back">
        <span class="corner tl">BLEED</span><span class="corner tr">TRIM GUIDE</span>
        ${postalHeader()}
        <div class="back-main two-column">
          <div>
            ${pollGraphic(true)}
            ${explainerTiles(true)}
            ${quoteBlock()}
          </div>
          <div>
            <img class="sww-logo" src="brand-assets/logo-800.png" alt="Smarter Way Wealth logo">
            ${advisorBlock()}
          </div>
        </div>
        ${footerDomain()}
      </div>
    `;
  }

  if (concept.slug === "three-taps") {
    return `
      <div class="back style-b three-taps-back trim" id="back">
        <span class="corner tl">BLEED</span><span class="corner tr">TRIM GUIDE</span>
        ${postalHeader()}
        <div class="back-main proof-plus-advisor">
          <div>
            ${feeGapCard()}
            ${twoPathChart(true)}
          </div>
          <aside>
            ${qrBlock("back-qr")}
            ${advisorBlock(true)}
          </aside>
        </div>
        ${footerDomain()}
      </div>
    `;
  }

  return `
    <div class="back style-b advisor-proof-back trim" id="back">
      <span class="corner tl">BLEED</span><span class="corner tr">TRIM GUIDE</span>
      ${postalHeader()}
      <div class="back-main advisor-proof-grid">
        <div>
          <h2 class="back-headline">The number you've never been shown.</h2>
          ${pollGraphic(true)}
          ${quoteBlock()}
        </div>
        <div>
          ${explainerTiles(true)}
          ${qrBlock("wide-qr")}
        </div>
      </div>
      ${footerDomain()}
    </div>
  `;
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
  :root {
    --green: #00A540;
    --green-soft: #BDF5D1;
    --mint: #EAF8EF;
    --ink: #07140D;
    --navy: #101827;
    --slate: #34483C;
    --muted: #64748B;
    --paper: #F3F6FA;
    --rule: rgba(7, 20, 13, 0.16);
  }
  * { box-sizing: border-box; }
  html, body {
    margin: 0;
    padding: 0;
    background: #e4e7e4;
    color: var(--ink);
    font-family: Inter, system-ui, Arial, Helvetica, sans-serif;
    -webkit-font-smoothing: antialiased;
    text-rendering: geometricPrecision;
  }
  .stage { display: flex; flex-direction: column; align-items: center; gap: 32px; padding: 32px 0; }
  .card {
    width: 8.75in;
    height: 6.5in;
    background: #fff;
    position: relative;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  }
  .front, .back {
    width: 100%;
    height: 100%;
    padding: 0.30in 0.46in 0.24in;
    background: #F3F6FA;
  }
  .back { background: #fff; }
  .trim::before {
    content: "";
    position: absolute;
    inset: 0.125in;
    border: 1px dashed rgba(7, 20, 13, 0.28);
    pointer-events: none;
    z-index: 20;
  }
  .corner {
    position: absolute;
    font: 500 9px Inter, sans-serif;
    color: rgba(7, 20, 13, 0.42);
    letter-spacing: 0.04em;
    z-index: 30;
  }
  .corner.tl { top: 6px; left: 10px; }
  .corner.tr { top: 6px; right: 10px; }
  .label-front {
    position: fixed;
    top: 6px;
    left: 50%;
    transform: translateX(-50%);
    font: 600 11px Inter, sans-serif;
    color: #6b6b6b;
    background: #fff;
    padding: 2px 10px;
    border-radius: 999px;
    z-index: 9999;
  }
  .domain { font-weight: 900; letter-spacing: -0.02em; color: #000; white-space: nowrap; }
  .domain span { color: var(--green); }
  .domain.mast { font-size: 22px; }
  .domain.footer { font-size: 44px; line-height: 0.95; }
  .front-logo { text-align: center; margin-bottom: 10px; }
  h1, h2, h3, p { margin: 0; }
  h1 { font-size: 52px; line-height: 0.93; letter-spacing: 0; font-weight: 900; }
  h1 em { color: var(--green); font-style: italic; font-weight: 500; }
  .hero-lockup {
    width: 4.75in;
    margin: 0 auto 13px;
    text-align: left;
  }
  .scan-pill {
    display: inline-block;
    background: #10253A;
    color: #64E28A;
    font-size: 9px;
    font-weight: 800;
    padding: 4px 10px;
    border-radius: 999px;
    margin-bottom: 8px;
  }
  .hero-lockup p,
  .hero-row p {
    margin-top: 8px;
    font-size: 13.5px;
    line-height: 1.38;
    color: #1D2A3A;
  }
  .hero-lockup p em { color: var(--green); font-style: italic; font-weight: 700; }
  .front-grid {
    display: grid;
    grid-template-columns: 1fr 1.20in;
    gap: 0.16in;
    align-items: center;
  }
  .fee-gap {
    position: relative;
    overflow: hidden;
    border-radius: 18px;
    background: #0F172A;
    color: #fff;
    padding: 22px 24px 20px;
    min-height: 1.72in;
  }
  .fee-gap.compact {
    min-height: 1.28in;
    border-radius: 14px;
    padding: 17px 19px;
  }
  .fee-glow {
    position: absolute;
    width: 2.1in;
    height: 2.1in;
    right: -0.45in;
    top: -0.65in;
    background: radial-gradient(circle, rgba(0,165,64,0.55), rgba(0,165,64,0));
  }
  .fee-label {
    position: relative;
    color: #55F08A;
    font-size: 11px;
    font-weight: 900;
    letter-spacing: 0.14em;
  }
  .fee-amount {
    position: relative;
    font-size: 74px;
    line-height: 0.9;
    font-weight: 900;
    letter-spacing: -0.04em;
    margin-top: 8px;
  }
  .fee-gap.compact .fee-amount { font-size: 52px; }
  .fee-amount span {
    color: #55F08A;
    font-weight: 500;
    font-size: 44px;
    vertical-align: 8px;
    margin-right: 4px;
  }
  .fee-copy {
    position: relative;
    color: #DDE7F1;
    margin-top: 12px;
    font-size: 13px;
    line-height: 1.35;
    font-weight: 600;
  }
  .fee-copy em { color: #55F08A; font-style: italic; }
  .fee-copy strong { color: #fff; font-weight: 900; }
  .fee-pills { position: relative; display: flex; gap: 8px; margin-top: 14px; }
  .fee-pills span {
    padding: 7px 12px;
    border-radius: 999px;
    background: rgba(255,255,255,0.10);
    border: 1px solid rgba(255,255,255,0.16);
    color: #EAF2FA;
    font-size: 10px;
    font-weight: 800;
  }
  .chart-card {
    margin-top: 14px;
    border-radius: 16px;
    background: #E9EEF6;
    border: 1px solid #DDE4EE;
    padding: 14px 15px 10px;
  }
  .chart-card.compact { padding: 12px 13px 9px; }
  .chart-title { font-size: 18px; font-weight: 900; letter-spacing: -0.02em; color: #101827; }
  .chart-subhead {
    margin-top: 4px;
    color: #738196;
    font-size: 9.5px;
    font-weight: 900;
    letter-spacing: 0.12em;
  }
  .chart-card svg { width: 100%; display: block; margin-top: 5px; }
  .chart-card .axis { font: 700 10px Inter, sans-serif; fill: #64748B; }
  .chart-key { display: flex; gap: 20px; align-items: center; font-size: 10px; font-weight: 900; text-transform: uppercase; color: #607089; }
  .chart-key i { display: inline-block; width: 18px; height: 3px; margin-right: 6px; vertical-align: 2px; }
  .green-line { background: var(--green); }
  .red-line { background: #D64B3F; border-top: 1px dashed #D64B3F; }
  .qr-block { text-align: center; }
  .qr-block img { display: block; width: 1.22in; height: 1.22in; margin: 0 auto; }
  .front-qr img, .hero-qr img { width: 1.35in; height: 1.35in; }
  .qr-cap {
    margin-top: 10px;
    font-size: 13px;
    line-height: 1.18;
    font-weight: 900;
    letter-spacing: 0.02em;
  }
  .disclosure {
    margin: 12px auto 0;
    text-align: center;
    color: var(--muted);
    font-size: 9px;
    line-height: 1.25;
    max-width: 7.3in;
  }
  .hero-row {
    display: grid;
    grid-template-columns: 1fr 1.65in;
    gap: 0.32in;
    align-items: center;
    margin-bottom: 0.16in;
  }
  .hero-row h1 { font-size: 56px; }
  .hero-row strong { color: var(--green); }
  .poll-card {
    border: 1.8px solid var(--green);
    border-radius: 16px;
    background: #ECFAF1;
    padding: 17px 20px 15px;
    text-align: center;
  }
  .poll-card.compact { padding: 14px 16px; }
  .poll-card h3 { font-size: 24px; line-height: 0.98; font-weight: 900; letter-spacing: -0.03em; }
  .poll-card h3 em { color: var(--green); font-style: italic; font-weight: 500; }
  .poll-card p {
    margin-top: 6px;
    font-size: 8px;
    font-weight: 900;
    letter-spacing: 0.09em;
    color: #385144;
  }
  .poll-options { display: flex; justify-content: center; gap: 8px; margin-top: 13px; }
  .poll-options span {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 0.28in;
    padding: 0 12px;
    border: 2px solid #0F172A;
    border-radius: 5px;
    background: #fff;
    font-size: 8.5px;
    font-weight: 900;
  }
  .tiles { display: grid; grid-template-columns: repeat(3, 1fr); gap: 11px; margin-top: 0.22in; }
  .tiles.compact { grid-template-columns: 1fr; gap: 8px; margin-top: 0.16in; }
  .tiles article {
    min-height: 1.03in;
    border: 1.5px solid #0F172A;
    border-radius: 10px;
    background: #fff;
    padding: 13px 14px;
    color: #0F172A;
  }
  .tiles.compact article { min-height: auto; padding: 10px 12px; }
  .tiles b {
    display: block;
    color: var(--green);
    font-size: 37px;
    line-height: 0.9;
    font-style: italic;
    font-weight: 500;
    letter-spacing: -0.04em;
  }
  .tiles strong { display: block; margin-top: 5px; font-size: 12px; line-height: 1.12; font-weight: 900; }
  .tiles p { margin-top: 8px; font-size: 10px; line-height: 1.35; font-weight: 600; }
  .tiles .green-tile { background: var(--green); border-color: var(--green); color: #fff; }
  .tiles .green-tile b, .tiles .green-tile strong { color: #fff; }
  .tiles .dark-tile { background: #101827; color: #fff; }
  .tiles .dark-tile b { color: #73ECA0; }
  .quote-block {
    margin-top: 0.20in;
    text-align: center;
    color: #243246;
  }
  .quote-block blockquote { margin: 0; font-size: 24px; line-height: 1.18; font-style: italic; }
  .quote-block em { color: var(--green); }
  .quote-block cite {
    display: block;
    margin-top: 9px;
    font-size: 8px;
    color: var(--green);
    font-weight: 900;
    letter-spacing: 0.18em;
    font-style: normal;
  }
  .split-hero {
    display: grid;
    grid-template-columns: 3.18in 1fr;
    gap: 0.20in;
    align-items: start;
  }
  .split-hero h1 { font-size: 39px; margin-bottom: 0.12in; }
  .bottom-proof {
    display: grid;
    grid-template-columns: 1fr 1.55in;
    gap: 0.28in;
    align-items: center;
    margin-top: 0.08in;
  }
  .advisor-block {
    display: grid;
    grid-template-columns: 1.55in 1fr;
    gap: 0.18in;
    align-items: start;
    border-top: 1px solid var(--rule);
    padding-top: 0.12in;
  }
  .advisor-block.compact {
    display: block;
    border: 1.5px solid rgba(0,165,64,0.45);
    border-radius: 12px;
    background: #F8FCFA;
    padding: 0.15in;
  }
  .portrait {
    border: 2px solid #10253A;
    border-radius: 12px;
    padding: 8px;
    background: #fff;
  }
  .portrait img {
    display: block;
    width: 100%;
    aspect-ratio: 1 / 1;
    object-fit: cover;
    object-position: 50% 35%;
    border-radius: 7px;
  }
  .portrait span {
    display: block;
    margin-top: 8px;
    color: #fff;
    background: linear-gradient(135deg, #98E6B3, #4EBE79);
    font-size: 7px;
    font-weight: 900;
    letter-spacing: 0.18em;
    padding: 4px;
    text-align: center;
  }
  .advisor-block.compact .portrait {
    width: 1.18in;
    float: left;
    margin: 0 0.12in 0.06in 0;
  }
  .advisor-label {
    color: var(--green);
    font-size: 8px;
    font-weight: 900;
    letter-spacing: 0.16em;
  }
  .advisor-copy h2 {
    margin-top: 3px;
    font-size: 31px;
    line-height: 1;
    font-weight: 900;
    letter-spacing: -0.03em;
  }
  .advisor-block.compact h2 { font-size: 24px; }
  .creds {
    margin: 6px 0 12px;
    color: #5C7182;
    font-size: 8.5px;
    font-weight: 900;
    letter-spacing: 0.08em;
  }
  .advisor-copy p:not(.advisor-label):not(.creds) {
    margin-top: 8px;
    color: #243246;
    font-size: 11.2px;
    line-height: 1.45;
    font-weight: 500;
  }
  .advisor-copy a { color: var(--green); text-decoration: underline; font-weight: 800; }
  .postal {
    display: grid;
    grid-template-columns: 1fr 2.15in 1.75in;
    gap: 0.26in;
    align-items: start;
    border-bottom: 1.5px solid rgba(7,20,13,0.55);
    padding-bottom: 0.13in;
    margin-bottom: 0.14in;
  }
  .return { font-size: 12px; line-height: 1.3; }
  .return strong { font-weight: 900; }
  .route { text-align: center; padding-top: 6px; }
  .route strong { display: block; font-size: 16px; letter-spacing: 0.08em; }
  .route span { display: block; margin-top: 5px; font-size: 12px; letter-spacing: 0.06em; color: var(--slate); }
  .indicia {
    justify-self: end;
    width: 1.55in;
    border: 1.5px solid var(--ink);
    padding: 8px 12px;
    text-align: center;
    font-size: 10px;
    line-height: 1.28;
    font-weight: 900;
    letter-spacing: 0.06em;
  }
  .back-main { min-height: 4.20in; }
  .two-column {
    display: grid;
    grid-template-columns: 3.4in 1fr;
    gap: 0.26in;
  }
  .two-column .sww-logo { display: block; width: 2.3in; margin: 0 auto 0.16in; }
  .two-column .advisor-block { grid-template-columns: 1.18in 1fr; }
  .two-column .advisor-copy h2 { font-size: 27px; }
  .proof-plus-advisor {
    display: grid;
    grid-template-columns: 4.45in 1fr;
    gap: 0.26in;
    align-items: start;
  }
  .proof-plus-advisor aside {
    display: grid;
    gap: 0.16in;
    align-items: start;
  }
  .back-qr img { width: 1.48in; height: 1.48in; }
  .advisor-proof-grid {
    display: grid;
    grid-template-columns: 3.75in 1fr;
    gap: 0.28in;
  }
  .back-headline {
    font-size: 45px;
    line-height: 0.95;
    letter-spacing: -0.04em;
    margin-bottom: 0.22in;
  }
  .wide-qr {
    display: grid;
    grid-template-columns: 1.18in 1fr;
    gap: 0.16in;
    align-items: center;
    margin-top: 0.16in;
    border-top: 1.5px solid var(--rule);
    padding-top: 0.16in;
    text-align: left;
  }
  .wide-qr img { width: 1.18in; height: 1.18in; }
  .wide-qr .qr-cap { font-size: 18px; line-height: 1.12; }
  .footer-domain {
    border-top: 1.5px solid rgba(7,20,13,0.55);
    margin-top: 0.15in;
    padding-top: 0.13in;
    text-align: center;
  }
  .hero-gap-front h1 { font-size: 43px; }
  .hero-gap-front .fee-gap {
    min-height: 1.22in;
    border-radius: 14px;
    padding: 14px 17px 13px;
  }
  .hero-gap-front .fee-label { font-size: 9px; }
  .hero-gap-front .fee-amount { font-size: 50px; margin-top: 6px; }
  .hero-gap-front .fee-amount span { font-size: 31px; vertical-align: 5px; }
  .hero-gap-front .fee-copy { font-size: 10px; line-height: 1.28; margin-top: 7px; }
  .hero-gap-front .fee-pills { margin-top: 8px; }
  .hero-gap-front .fee-pills span { font-size: 8px; padding: 5px 9px; }
  .hero-gap-front .chart-card { margin-top: 8px; padding: 8px 11px 6px; }
  .hero-gap-front .chart-title { font-size: 14px; }
  .hero-gap-front .chart-subhead { font-size: 7px; }
  .hero-gap-front .chart-card svg { height: 1.05in; }
  .hero-gap-front .chart-key { font-size: 8px; }
  .hero-gap-front .front-qr img { width: 1.05in; height: 1.05in; }
  .hero-gap-front .qr-cap { font-size: 10px; }
  .hero-gap-back .two-column { grid-template-columns: 3.65in 1fr; gap: 0.20in; }
  .hero-gap-back .postal { padding-bottom: 0.08in; margin-bottom: 0.10in; }
  .hero-gap-back .poll-card.compact { padding: 11px 12px; }
  .hero-gap-back .poll-card h3 { font-size: 18px; }
  .hero-gap-back .poll-options { gap: 5px; margin-top: 9px; }
  .hero-gap-back .poll-options span { min-height: 0.22in; padding: 0 7px; font-size: 6.8px; }
  .hero-gap-back .tiles.compact { gap: 5px; margin-top: 0.08in; }
  .hero-gap-back .tiles.compact article { padding: 6px 9px; }
  .hero-gap-back .tiles.compact b { font-size: 22px; }
  .hero-gap-back .tiles.compact strong { font-size: 8.5px; }
  .hero-gap-back .tiles.compact p { font-size: 6.8px; line-height: 1.18; margin-top: 3px; }
  .hero-gap-back .quote-block { margin-top: 0.08in; }
  .hero-gap-back .quote-block blockquote { font-size: 14px; }
  .hero-gap-back .quote-block cite { font-size: 6.7px; margin-top: 6px; }
  .hero-gap-back .footer-domain { margin-top: 0.09in; padding-top: 0.09in; }
  .hero-gap-back .domain.footer { font-size: 38px; }
  .hero-gap-back .advisor-copy h2 { font-size: 22px; }
  .hero-gap-back .advisor-copy p:not(.advisor-label):not(.creds) { font-size: 8.5px; line-height: 1.35; }
  .three-taps-front .poll-card { padding: 14px 18px 13px; }
  .three-taps-front .tiles { margin-top: 0.14in; }
  .three-taps-front .tiles article { min-height: 0.90in; padding: 10px 12px; }
  .three-taps-front .tiles b { font-size: 30px; }
  .three-taps-front .tiles p { font-size: 8.5px; line-height: 1.25; margin-top: 5px; }
  .three-taps-front .quote-block { margin-top: 0.12in; }
  .three-taps-front .quote-block blockquote { font-size: 20px; }
  .proof-plus-advisor { grid-template-columns: 4.20in 1fr; gap: 0.20in; }
  .proof-plus-advisor .fee-gap { min-height: 1.32in; padding: 16px 18px; }
  .proof-plus-advisor .fee-amount { font-size: 58px; }
  .proof-plus-advisor .fee-copy { font-size: 11px; line-height: 1.28; }
  .proof-plus-advisor .fee-pills span { font-size: 8.5px; padding: 5px 9px; }
  .proof-plus-advisor .chart-card { margin-top: 9px; padding: 9px 10px 6px; }
  .proof-plus-advisor .chart-title { font-size: 15px; }
  .proof-plus-advisor .chart-subhead { font-size: 7px; }
  .proof-plus-advisor .chart-card svg { height: 1.58in; }
  .proof-plus-advisor .back-qr img { width: 1.18in; height: 1.18in; }
  .proof-plus-advisor .qr-cap { font-size: 10px; }
  .proof-plus-advisor .advisor-block.compact { padding: 0.11in; }
  .proof-plus-advisor .advisor-block.compact .portrait { width: 0.92in; }
  .proof-plus-advisor .advisor-block.compact h2 { font-size: 19px; }
  .proof-plus-advisor .advisor-copy p:not(.advisor-label):not(.creds) { font-size: 8px; line-height: 1.25; }
  .proof-plus-advisor .creds { font-size: 7px; margin-bottom: 7px; }
  .advisor-proof-front .advisor-block.compact { padding: 0.12in; }
  .advisor-proof-front .advisor-block.compact .portrait { width: 1.00in; }
  .advisor-proof-front .advisor-block.compact h2 { font-size: 21px; }
  .advisor-proof-front .advisor-copy p:not(.advisor-label):not(.creds) { font-size: 8.9px; line-height: 1.3; }
  .advisor-proof-front .fee-gap.compact { min-height: 1.18in; padding: 14px 15px; }
  .advisor-proof-front .fee-gap.compact .fee-amount { font-size: 43px; }
  .advisor-proof-front .fee-gap.compact .fee-copy { font-size: 9.5px; line-height: 1.25; }
  .advisor-proof-front .fee-pills span { font-size: 7.6px; padding: 5px 8px; }
  .advisor-proof-front .chart-card { margin-top: 0; padding: 8px 11px 6px; }
  .advisor-proof-front .chart-title { font-size: 16px; }
  .advisor-proof-front .chart-subhead { font-size: 7px; }
  .advisor-proof-front .chart-card svg { height: 1.28in; }
  .advisor-proof-front .front-qr img { width: 1.02in; height: 1.02in; }
  .advisor-proof-front .qr-cap { font-size: 10px; }
  .advisor-proof-back .back-headline { font-size: 36px; margin-bottom: 0.14in; }
  .advisor-proof-back .poll-card.compact { padding: 12px; }
  .advisor-proof-back .poll-card h3 { font-size: 20px; }
  .advisor-proof-back .poll-options { gap: 5px; margin-top: 9px; }
  .advisor-proof-back .poll-options span { min-height: 0.23in; padding: 0 7px; font-size: 7px; }
  .advisor-proof-back .quote-block blockquote { font-size: 20px; }
  .advisor-proof-back .tiles.compact article { padding: 9px 12px; }
  .advisor-proof-back .tiles.compact b { font-size: 29px; }
  .advisor-proof-back .tiles.compact strong { font-size: 10px; }
  .advisor-proof-back .tiles.compact p { font-size: 8px; line-height: 1.25; margin-top: 5px; }
  .advisor-proof-back .wide-qr { margin-top: 0.10in; padding-top: 0.11in; }
  .advisor-proof-back .wide-qr img { width: 0.96in; height: 0.96in; }
  .advisor-proof-back .wide-qr .qr-cap { font-size: 14px; }
  @media print {
    body { background: #fff; }
    .stage { padding: 0; gap: 0; }
    .card { box-shadow: none; }
    .trim::before, .corner, .label-front { display: none !important; }
  }
`;

function proofHtml(concept) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>SWW YAPTOM Style B EDDM - ${concept.num} - ${concept.title}</title>
  <style>${CSS}</style>
</head>
<body>
  <div class="stage">
    <div class="label-front">Style B ${concept.num} front</div>
    <section class="card">${frontFor(concept)}</section>
    <section class="card">${backFor(concept)}</section>
  </div>
</body>
</html>
`;
}

function writeConceptFiles() {
  for (const concept of CONCEPTS) {
    const base = `SWW_YAPTOM_StyleB_${concept.num}_${concept.slug}`;
    fs.writeFileSync(path.join(OUT, `${base}_Proof.html`), proofHtml(concept), "utf8");
    fs.writeFileSync(
      path.join(OUT, `${base}_Rationale.md`),
      `# ${concept.num} - ${concept.title}\n\n**Group:** Style B EDDM\n\n**Intent:** ${concept.rationale}\n\n**Screenshot material used:** hero question and three-tap copy, lifetime-fee-gap card, two-path chart, extra-money poll, three explainer tiles, Wall Street Journal quote, and David advisor block. Style A winner supplies logo/photo/QR/proof spacing consistency.\n`,
      "utf8"
    );
  }
}

function writeReadmeAndManifest() {
  const manifest = {
    name: "Style B EDDM",
    generatedAt: new Date().toISOString(),
    baseReference: "Screenshot supplied by David plus Style A winner 01E advisor-green-band",
    dimensions: {
      trimInches: { width: 8.5, height: 6.25 },
      bleedInches: 0.125,
      proofPageInches: { width: 8.75, height: 6.5 },
      proofPixels: { width: 1750, height: 1300 },
    },
    concepts: CONCEPTS.map((concept) => {
      const base = `SWW_YAPTOM_StyleB_${concept.num}_${concept.slug}`;
      return {
        num: concept.num,
        slug: concept.slug,
        title: concept.title,
        rationale: concept.rationale,
        files: {
          proofHtml: `${base}_Proof.html`,
          frontPng: `${base}_Front_Proof.png`,
          backPng: `${base}_Back_Proof.png`,
          rationale: `${base}_Rationale.md`,
        },
      };
    }),
  };

  fs.writeFileSync(path.join(OUT, "mailer-assets-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  fs.writeFileSync(
    path.join(OUT, "README.md"),
    `# Style B EDDM\n\nThree new EDDM proof concepts built from David's Style B screenshot.\n\n- 01 Hero Gap: postcard headline plus lifetime fee gap and two-path chart.\n- 02 Three Taps: simple scan promise plus extra-money poll and explainer tiles.\n- 03 Advisor Proof: fee-gap proof paired immediately with David's advisor/fiduciary block.\n\nAll proofs use the same 8.75in x 6.5in proof canvas as Style A, with a 0.125in bleed guide. Logo, David photo, and QR code are copied into this round from the Style A finalist asset folder.\n`,
    "utf8"
  );
}

ensureAssets();
writeConceptFiles();
writeReadmeAndManifest();
console.log("wrote Style B EDDM proofs");
