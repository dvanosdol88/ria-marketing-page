/**
 * SWW Version A — EDITORIAL / WSJ OP-ED EDDM mailer.
 *
 * Design intent: treat the postcard as a feature page from a serious financial
 * publication (Wall Street Journal Weekend, Barron's, Bloomberg Businessweek).
 * Real serif display type (IBM Plex Serif), sans labels (IBM Plex Sans), warm
 * cream paper, single deep brand-green accent, drop cap on the lead, columnar
 * editorial layout, magazine-style pull quote as the visual anchor, contributor
 * portrait with italic-serif caption underneath. The chart uses a red dashed
 * curve for the AUM path (this version reads "loss" as red).
 *
 * No CSS or layout reused from build-eddm-restrained.mjs.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const OUT_DIR = path.join(repoRoot, "output", "mailer-samples", "v-A-editorial");
const PX_PER_INCH = 200;
const PAGE_W = 8.75 * PX_PER_INCH; // 1750
const PAGE_H = 6.5 * PX_PER_INCH;  // 1300
const TRIM_W = 8.5;
const TRIM_H = 6.25;
const BLEED = 0.125;

/* --------------- chart computation ---------------
 * Spec calls for these exact endpoints displayed:
 *   flat-fee final $5.82M, AUM final $4.36M
 *   y-ticks 0, 1.45, 2.91, 4.36, 5.82 (millions)
 *   x-ticks 0, 4, 8, 12, 16, 20
 *
 * We honor the spec's explicit numbers (so the postcard says exactly what the
 * parent specified) and shape the two curves with smooth compound-growth math.
 */
const YEARS = 20;
const X_TICKS = [0, 4, 8, 12, 16, 20];
const Y_TICKS_M = [0, 1.45, 2.91, 4.36, 5.82];
const FLAT_FINAL = 5_820_000;
const AUM_FINAL = 4_360_000;
const FLAT_LIFETIME_FEES = 24_000;
const AUM_LIFETIME_FEES = 472_938;
const FEE_GAP = 952_405;

const money = (v, digits = 0) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(v);

// Smooth curve from $1.0M to the spec endpoint with steady CAGR per year.
function curve(start, end, n) {
  const r = Math.pow(end / start, 1 / n);
  const pts = [];
  for (let y = 0; y <= n; y += 1) pts.push({ y, v: start * Math.pow(r, y) });
  return pts;
}

const FLAT_SERIES = curve(1_000_000, FLAT_FINAL, YEARS);
const AUM_SERIES = curve(1_000_000, AUM_FINAL, YEARS);

/* --------------- chart SVG ---------------
 * Editorial chart treatment: no card, just hairline axes on warm paper, two
 * curves (flat = solid brand green, AUM = red dashed — this version uses
 * red for the AUM path to evoke "loss"). End-of-line dollar labels in
 * old-style figures-feeling small caps.
 */
function chartSvg() {
  const W = 800;
  const H = 460;
  const ml = 110;
  const mr = 50;
  const mt = 30;
  const mb = 60;
  const cw = W - ml - mr;
  const ch = H - mt - mb;
  const yMax = 5.82; // millions, top tick
  const x = (y) => ml + (y / YEARS) * cw;
  const y = (vm) => mt + (1 - vm / yMax) * ch;

  const flatPath = FLAT_SERIES.map(
    (pt, i) => `${i === 0 ? "M" : "L"} ${x(pt.y).toFixed(2)} ${y(pt.v / 1_000_000).toFixed(2)}`,
  ).join(" ");
  const aumPath = AUM_SERIES.map(
    (pt, i) => `${i === 0 ? "M" : "L"} ${x(pt.y).toFixed(2)} ${y(pt.v / 1_000_000).toFixed(2)}`,
  ).join(" ");

  const yGrid = Y_TICKS_M.map((vm) => {
    const ly = y(vm);
    const lbl = vm === 0 ? "$0" : `$${vm.toFixed(2)}M`;
    return `
      <line x1="${ml}" y1="${ly}" x2="${W - mr}" y2="${ly}" class="grid" />
      <text x="${ml - 14}" y="${ly + 6}" class="tick" text-anchor="end">${lbl}</text>`;
  }).join("");

  const xGrid = X_TICKS.map((yr) => {
    const lx = x(yr);
    return `<text x="${lx}" y="${H - mb + 28}" class="tick" text-anchor="middle">${yr}y</text>`;
  }).join("");

  return `
  <svg viewBox="0 0 ${W} ${H}" class="chart-svg" role="img" aria-label="Two paths over twenty years">
    <defs>
      <style>
        .chart-svg { font-family: 'IBM Plex Sans','Helvetica Neue',Arial,sans-serif; }
        .grid { stroke: #111; stroke-width: 0.4; opacity: 0.12; }
        .axis { stroke: #111; stroke-width: 0.9; }
        .tick { fill: #2a2422; font-size: 17px; font-weight: 500; letter-spacing: 0.04em; }
        .flat { fill: none; stroke: #00682B; stroke-width: 3.4; stroke-linecap: round; }
        .aum  { fill: none; stroke: #B11226; stroke-width: 2.6; stroke-dasharray: 7 6; stroke-linecap: round; }
        .end-dot { stroke-width: 0; }
        .end-lbl-flat { fill: #00682B; font-family: 'IBM Plex Serif', Georgia, serif; font-size: 22px; font-weight: 700; font-feature-settings: 'onum'; }
        .end-lbl-aum  { fill: #B11226; font-family: 'IBM Plex Serif', Georgia, serif; font-size: 22px; font-weight: 700; font-feature-settings: 'onum'; }
        .end-sub { fill: #6b5e57; font-size: 13px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; }
      </style>
    </defs>

    ${yGrid}
    ${xGrid}

    <line x1="${ml}" y1="${mt}" x2="${ml}" y2="${H - mb}" class="axis" />
    <line x1="${ml}" y1="${H - mb}" x2="${W - mr}" y2="${H - mb}" class="axis" />

    <path d="${aumPath}" class="aum" />
    <path d="${flatPath}" class="flat" />

    <circle cx="${x(YEARS)}" cy="${y(5.82)}" r="6" fill="#00682B" class="end-dot" />
    <circle cx="${x(YEARS)}" cy="${y(4.36)}" r="6" fill="#B11226" class="end-dot" />

    <text x="${x(YEARS) - 12}" y="${y(5.82) - 16}" class="end-sub" text-anchor="end">Flat fee</text>
    <text x="${x(YEARS) - 12}" y="${y(5.82) + 6}"  class="end-lbl-flat" text-anchor="end">$5.82M</text>

    <text x="${x(YEARS) - 12}" y="${y(4.36) + 22}" class="end-sub" text-anchor="end">1% AUM</text>
    <text x="${x(YEARS) - 12}" y="${y(4.36) + 44}" class="end-lbl-aum" text-anchor="end">$4.36M</text>
  </svg>`;
}

const DISCLOSURE =
  "Educational only. Hypothetical results are not investment advice. Actual results vary. Example assumes a $1,000,000 portfolio, 9% annual growth, a 1% asset-based fee, 20 years, and a $100/month flat advisory fee. Smarter Way Wealth is a registered investment adviser. See ADV at adviserinfo.sec.gov.";

function proofHtml() {
  const logo = "../../../public/brand/logo-400.png";
  const dvo = "../../../public/DVO%20Head%20Shot%20picture.jpg";
  const qr = "../1-percent-blues/source-eddm/yaptom_default_inputs_qr.png";

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>SWW Version A — Editorial EDDM</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Serif:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500;1,600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  @page { size: 8.75in 6.5in; margin: 0; }
  * { box-sizing: border-box; }

  :root {
    --ink:      #111111;
    --ink-2:    #2a2422;
    --ink-mute: #6b5e57;
    --paper:    #F6F1E6;        /* warm cream */
    --paper-2:  #EFE7D5;        /* one shade deeper for postal zone backdrop */
    --rule:     #1d1916;        /* nearly-black with a hint of warmth */
    --rule-soft:#bdb4a3;
    --green:    #00682B;        /* single brand accent */
    --red:      #B11226;        /* used ONLY on AUM curve (signal of loss) */
  }

  html, body {
    margin: 0;
    background: #c8c5bc;       /* a quiet table behind the page */
    color: var(--ink);
    font-family: 'IBM Plex Serif', Georgia, 'Times New Roman', serif;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    font-feature-settings: 'onum','liga','kern';
  }

  .page {
    position: relative;
    width: ${PAGE_W}px;
    height: ${PAGE_H}px;
    background: var(--paper);
    overflow: hidden;
    page-break-after: always;
  }
  .page:last-child { page-break-after: auto; }

  /* ============ TYPE SYSTEM ============ */
  .sans { font-family: 'IBM Plex Sans','Helvetica Neue',Arial,sans-serif; }

  .smallcap {
    font-family: 'IBM Plex Sans','Helvetica Neue',Arial,sans-serif;
    text-transform: uppercase;
    letter-spacing: 0.22em;
    font-weight: 600;
  }

  /* ============ MASTHEAD (shared front + back top) ============ */
  .mast {
    position: absolute;
    top: 56px;
    left: 110px;
    right: 110px;
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    color: var(--ink);
  }
  .mast-left {
    font-family: 'IBM Plex Serif', Georgia, serif;
    font-weight: 700;
    font-style: italic;
    font-size: 36px;
    letter-spacing: -0.01em;
  }
  .mast-center {
    font-family: 'IBM Plex Sans', Arial, sans-serif;
    text-transform: uppercase;
    letter-spacing: 0.32em;
    font-weight: 600;
    font-size: 13px;
    color: var(--ink-mute);
  }
  .mast-right {
    font-family: 'IBM Plex Sans', Arial, sans-serif;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    font-weight: 600;
    font-size: 13px;
    color: var(--ink-mute);
  }
  .mast-rule {
    position: absolute;
    left: 110px;
    right: 110px;
    top: 108px;
    height: 1.5px;
    background: var(--rule);
  }
  .mast-rule.hair {
    top: 113px;
    height: 0.6px;
    background: var(--rule);
    opacity: 0.55;
  }

  /* ============ FRONT ============ */
  .front-headline {
    position: absolute;
    top: 140px;
    left: 110px;
    width: 1010px;
    font-family: 'IBM Plex Serif', Georgia, serif;
    font-weight: 800;
    font-size: 76px;
    line-height: 0.96;
    letter-spacing: -0.022em;
    color: var(--ink);
  }
  .front-headline em {
    font-style: italic;
    font-weight: 700;
    color: var(--ink);
  }
  .front-deck {
    position: absolute;
    top: 296px;
    left: 110px;
    width: 1010px;
    font-family: 'IBM Plex Serif', Georgia, serif;
    font-style: italic;
    font-weight: 500;
    font-size: 28px;
    line-height: 1.22;
    color: var(--ink-2);
    letter-spacing: -0.005em;
  }

  /* --- LEAD PARA WITH DROP CAP --- */
  .lead {
    position: absolute;
    top: 396px;
    left: 110px;
    width: 740px;
    font-family: 'IBM Plex Serif', Georgia, serif;
    font-weight: 400;
    font-size: 21px;
    line-height: 1.36;
    color: var(--ink-2);
    column-count: 2;
    column-gap: 30px;
    column-rule: 0.5px solid var(--rule-soft);
    text-align: justify;
    hyphens: auto;
  }
  .lead .dropcap {
    float: left;
    font-family: 'IBM Plex Serif', Georgia, serif;
    font-weight: 800;
    font-size: 88px;
    line-height: 0.86;
    margin: 6px 10px 0 0;
    color: var(--green);
  }

  /* --- HERO NUMBER (right column, sits next to headline) --- */
  .hero {
    position: absolute;
    top: 140px;
    right: 110px;
    width: 470px;
    text-align: right;
    border-left: 1px solid var(--rule);
    padding: 6px 0 6px 30px;
  }
  .hero-eyebrow {
    font-family: 'IBM Plex Sans', Arial, sans-serif;
    text-transform: uppercase;
    letter-spacing: 0.24em;
    font-weight: 600;
    font-size: 13px;
    color: var(--ink-mute);
    margin-bottom: 10px;
  }
  .hero-number {
    font-family: 'IBM Plex Serif', Georgia, serif;
    font-weight: 800;
    font-style: italic;
    font-size: 122px;
    line-height: 0.92;
    letter-spacing: -0.03em;
    color: var(--green);
    font-feature-settings: 'onum';
  }
  .hero-label {
    margin-top: 14px;
    font-family: 'IBM Plex Sans', Arial, sans-serif;
    text-transform: uppercase;
    letter-spacing: 0.22em;
    font-weight: 700;
    font-size: 14px;
    color: var(--ink);
  }
  .hero-sub {
    margin-top: 12px;
    font-family: 'IBM Plex Serif', Georgia, serif;
    font-style: italic;
    font-size: 18px;
    line-height: 1.32;
    color: var(--ink-2);
    text-align: right;
  }
  .hero-stats {
    margin-top: 22px;
    display: flex;
    justify-content: flex-end;
    gap: 24px;
    border-top: 0.6px solid var(--rule-soft);
    padding-top: 14px;
  }
  .hero-stat {
    text-align: right;
  }
  .hero-stat .k {
    font-family: 'IBM Plex Sans', Arial, sans-serif;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    font-weight: 600;
    font-size: 11px;
    color: var(--ink-mute);
  }
  .hero-stat .v {
    font-family: 'IBM Plex Serif', Georgia, serif;
    font-weight: 700;
    font-size: 22px;
    line-height: 1;
    margin-top: 5px;
    color: var(--ink);
    font-feature-settings: 'onum';
  }
  .hero-stat .v.red { color: var(--red); }
  .hero-stat .v.green { color: var(--green); }

  /* --- CHART (front, bottom-right) --- */
  .chart-block {
    position: absolute;
    top: 640px;
    right: 110px;
    width: 820px;
    border-top: 0.6px solid var(--rule);
    padding-top: 14px;
  }
  .chart-head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 6px;
  }
  .chart-title {
    font-family: 'IBM Plex Serif', Georgia, serif;
    font-weight: 700;
    font-style: italic;
    font-size: 26px;
    line-height: 1.1;
    color: var(--ink);
    letter-spacing: -0.012em;
  }
  .chart-sub {
    font-family: 'IBM Plex Sans', Arial, sans-serif;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    font-weight: 600;
    font-size: 12px;
    color: var(--ink-mute);
    margin-top: 2px;
  }
  .chart-wrap { width: 100%; height: 460px; }

  /* --- PULL QUOTE (front, left, the editorial anchor) --- */
  .pullquote {
    position: absolute;
    bottom: 158px;
    left: 110px;
    width: 760px;
    border-top: 2px solid var(--ink);
    border-bottom: 0.6px solid var(--ink);
    padding: 22px 0 18px 0;
  }
  .pullquote .open {
    font-family: 'IBM Plex Serif', Georgia, serif;
    font-weight: 800;
    font-size: 100px;
    line-height: 0.4;
    color: var(--green);
    display: block;
    margin: 0 0 -10px -6px;
    height: 30px;
  }
  .pullquote .quote {
    font-family: 'IBM Plex Serif', Georgia, serif;
    font-style: italic;
    font-weight: 500;
    font-size: 34px;
    line-height: 1.18;
    color: var(--ink);
    letter-spacing: -0.01em;
  }
  .pullquote .attrib {
    margin-top: 14px;
    font-family: 'IBM Plex Sans', Arial, sans-serif;
    text-transform: uppercase;
    letter-spacing: 0.22em;
    font-weight: 700;
    font-size: 13px;
    color: var(--ink-mute);
  }

  /* --- FRONT FOOT --- */
  .front-foot {
    position: absolute;
    left: 110px;
    right: 110px;
    bottom: 50px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    border-top: 0.6px solid var(--rule-soft);
    padding-top: 14px;
  }
  .front-disc {
    font-family: 'IBM Plex Sans', Arial, sans-serif;
    font-size: 10.5px;
    line-height: 1.4;
    color: var(--ink-mute);
    max-width: 1180px;
    font-weight: 400;
  }
  .front-domain {
    font-family: 'IBM Plex Serif', Georgia, serif;
    font-style: italic;
    font-weight: 700;
    font-size: 24px;
    line-height: 1;
    color: var(--ink);
    letter-spacing: -0.01em;
    white-space: nowrap;
    margin-left: 30px;
  }

  /* ============ BACK ============
     Top 433 px reserved for USPS: indicia + LOCAL POSTAL CUSTOMER.
     A clear horizontal demarcation rule at y = 432.
     Editorial contributor essay treatment lives below. */

  .postal-zone {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 432px;
    background: var(--paper);
    border-bottom: 1.5px solid var(--rule);
  }
  .postal-tag {
    position: absolute;
    top: 38px;
    left: 110px;
    font-family: 'IBM Plex Sans', Arial, sans-serif;
    font-size: 10.5px;
    text-transform: uppercase;
    letter-spacing: 0.28em;
    font-weight: 600;
    color: var(--ink-mute);
  }

  .indicia {
    position: absolute;
    top: 80px;
    right: 110px;
    width: 360px;
    border: 1.2px solid var(--rule);
    padding: 18px 12px;
    text-align: center;
    font-family: 'IBM Plex Sans', Arial, sans-serif;
    font-weight: 700;
    font-size: 15px;
    line-height: 1.4;
    letter-spacing: 0.06em;
    color: var(--ink);
  }
  .indicia .label {
    font-size: 9.5px;
    font-weight: 600;
    letter-spacing: 0.28em;
    color: var(--ink-mute);
    margin-bottom: 8px;
    text-transform: uppercase;
  }

  .lpc {
    position: absolute;
    top: 252px;
    right: 110px;
    width: 360px;
    border: 0.6px dashed var(--rule);
    padding: 26px 12px;
    text-align: center;
    font-family: 'IBM Plex Sans', Arial, sans-serif;
    font-weight: 700;
    font-size: 22px;
    line-height: 1.2;
    letter-spacing: 0.22em;
    color: var(--ink);
    text-transform: uppercase;
  }
  .lpc .sub {
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.28em;
    color: var(--ink-mute);
    margin-top: 8px;
  }

  /* Address-block helper text on the LEFT half of the postal zone — quiet,
     editorial, not marketing. */
  .postal-hint {
    position: absolute;
    top: 130px;
    left: 110px;
    width: 700px;
    color: var(--ink-mute);
    font-family: 'IBM Plex Sans', Arial, sans-serif;
    font-size: 12px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    font-weight: 600;
  }
  .postal-hint .big {
    display: block;
    font-family: 'IBM Plex Serif', Georgia, serif;
    font-style: italic;
    font-weight: 600;
    font-size: 30px;
    line-height: 1;
    letter-spacing: -0.01em;
    color: var(--ink);
    text-transform: none;
    margin-top: 12px;
  }

  /* --- BACK EDITORIAL ZONE (y >= 432) --- */
  .back-mast {
    position: absolute;
    top: 462px;
    left: 110px;
    right: 110px;
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }
  .back-mast .section {
    font-family: 'IBM Plex Sans', Arial, sans-serif;
    text-transform: uppercase;
    letter-spacing: 0.32em;
    font-weight: 700;
    font-size: 12px;
    color: var(--ink-mute);
  }
  .back-mast .domain {
    font-family: 'IBM Plex Serif', Georgia, serif;
    font-style: italic;
    font-weight: 700;
    font-size: 22px;
    color: var(--ink);
    letter-spacing: -0.01em;
  }
  .back-mast-rule {
    position: absolute;
    left: 110px;
    right: 110px;
    top: 500px;
    height: 0.6px;
    background: var(--rule);
  }

  /* PORTRAIT — contributor photo treatment on the left */
  .portrait-wrap {
    position: absolute;
    top: 528px;
    left: 110px;
    width: 280px;
  }
  .portrait {
    width: 280px;
    height: 296px;
    object-fit: cover;
    object-position: center 28%;
    display: block;
    filter: saturate(0.95) contrast(1.02);
  }
  .portrait-cap {
    margin-top: 10px;
    font-family: 'IBM Plex Serif', Georgia, serif;
    font-style: italic;
    font-size: 14px;
    line-height: 1.32;
    color: var(--ink-mute);
    border-top: 0.6px solid var(--rule-soft);
    padding-top: 8px;
  }
  .portrait-cap .name {
    font-style: normal;
    font-weight: 700;
    color: var(--ink);
  }

  /* ARTICLE BODY — David's essay/bio */
  .essay {
    position: absolute;
    top: 528px;
    left: 430px;
    width: 720px;
  }
  .essay .eyebrow {
    font-family: 'IBM Plex Sans', Arial, sans-serif;
    text-transform: uppercase;
    letter-spacing: 0.28em;
    font-weight: 700;
    font-size: 12px;
    color: var(--green);
    margin-bottom: 8px;
  }
  .essay h2 {
    margin: 0 0 4px;
    font-family: 'IBM Plex Serif', Georgia, serif;
    font-weight: 800;
    font-size: 48px;
    line-height: 1.0;
    letter-spacing: -0.022em;
    color: var(--ink);
  }
  .essay .creds {
    font-family: 'IBM Plex Sans', Arial, sans-serif;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    font-weight: 600;
    font-size: 12px;
    color: var(--ink-mute);
    margin-top: 6px;
  }
  .essay .body {
    margin-top: 18px;
    column-count: 2;
    column-gap: 26px;
    column-rule: 0.5px solid var(--rule-soft);
    font-family: 'IBM Plex Serif', Georgia, serif;
    font-size: 17px;
    line-height: 1.42;
    color: var(--ink-2);
    text-align: justify;
    hyphens: auto;
  }
  .essay .body p {
    margin: 0 0 12px;
  }
  .essay .body p:last-child { margin-bottom: 0; }
  .essay .body .cta-line {
    font-style: italic;
    font-weight: 600;
    color: var(--ink);
  }

  /* QR + DOMAIN BAND — bottom right of back */
  .qr-band {
    position: absolute;
    bottom: 70px;
    right: 110px;
    display: flex;
    align-items: center;
    gap: 20px;
  }
  .qr-band img {
    width: 160px;
    height: 160px;
    display: block;
    background: #fff;
  }
  .qr-band .qr-meta {
    text-align: left;
    max-width: 260px;
  }
  .qr-band .qr-meta .smallcap {
    font-size: 11px;
    letter-spacing: 0.24em;
    color: var(--ink-mute);
  }
  .qr-band .qr-meta .dom {
    font-family: 'IBM Plex Serif', Georgia, serif;
    font-weight: 700;
    font-style: italic;
    font-size: 26px;
    line-height: 1.1;
    letter-spacing: -0.01em;
    color: var(--ink);
    margin-top: 6px;
  }
  .qr-band .qr-meta .helper {
    font-family: 'IBM Plex Serif', Georgia, serif;
    font-style: italic;
    font-size: 14px;
    line-height: 1.3;
    color: var(--ink-mute);
    margin-top: 8px;
  }

  /* THREE-STAT BLOCK — boxed row borrowed from the stronger v.02 back treatment */
  .stats {
    position: absolute;
    bottom: 210px;
    left: 110px;
    width: 1060px;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 20px;
  }
  .stats .col {
    min-height: 148px;
    border-radius: 14px;
    padding: 16px 18px 15px;
  }
  .stats .col:nth-child(1) {
    background: var(--paper);
    border: 3px solid #7E858A;
  }
  .stats .col:nth-child(2) {
    background: var(--green);
    border: 3px solid var(--green);
    color: #fff;
  }
  .stats .col:nth-child(3) {
    background: #101926;
    border: 3px solid #101926;
    color: #fff;
  }
  .stats .col .n {
    font-family: 'IBM Plex Serif', Georgia, serif;
    font-style: italic;
    font-weight: 800;
    font-size: 52px;
    line-height: 0.92;
    color: var(--green);
    letter-spacing: -0.025em;
    margin-bottom: 8px;
  }
  .stats .col:nth-child(2) .n { color: #fff; }
  .stats .col:nth-child(3) .n { color: #32D06A; }
  .stats .col .t {
    font-family: 'IBM Plex Sans', Arial, sans-serif;
    font-size: 12.6px;
    line-height: 1.28;
    font-weight: 700;
    color: var(--ink-2);
  }
  .stats .col:nth-child(2) .t,
  .stats .col:nth-child(3) .t {
    color: #fff;
  }
  .stats .col .t strong {
    display: block;
    font-size: 14px;
    line-height: 1.1;
    margin-bottom: 5px;
    color: inherit;
  }

  /* BACK FOOT — small disclaimer */
  .back-disc {
    position: absolute;
    left: 110px;
    right: 110px;
    bottom: 22px;
    font-family: 'IBM Plex Sans', Arial, sans-serif;
    font-size: 9px;
    line-height: 1.45;
    color: var(--ink-mute);
    font-weight: 400;
  }

  /* WALL STREET JOURNAL stamp on back — small editorial seal */
  .wsj-seal {
    position: absolute;
    top: 462px;
    right: 110px;
    text-align: right;
  }
  .wsj-seal .smallcap {
    font-size: 10px;
    letter-spacing: 0.24em;
    color: var(--ink-mute);
  }
  .wsj-seal .name {
    font-family: 'IBM Plex Serif', Georgia, serif;
    font-style: italic;
    font-weight: 700;
    font-size: 16px;
    color: var(--ink);
    margin-top: 3px;
  }
</style>
</head>
<body>

  <!-- ============== FRONT ============== -->
  <section class="page front">
    <!-- Masthead -->
    <div class="mast">
      <div class="mast-left">Smarter Way Wealth</div>
      <div class="mast-center">A Reader Brief on the Math of Fees</div>
      <div class="mast-right">Vol. I &nbsp;·&nbsp; No. 1</div>
    </div>
    <div class="mast-rule"></div>
    <div class="mast-rule hair"></div>

    <!-- Lead headline -->
    <div class="front-headline">
      How much are you<br />
      <em>actually</em> overpaying?
    </div>

    <!-- Deck -->
    <div class="front-deck">
      The number you&rsquo;ve never been shown.
    </div>

    <!-- Hero number column (right) -->
    <div class="hero">
      <div class="hero-eyebrow">Your Lifetime Fee Gap</div>
      <div class="hero-number">$952,405</div>
      <div class="hero-sub">
        That&rsquo;s how much more you&rsquo;d keep with our flat $100/month fee instead of a 1% AUM advisor over 20 years.
      </div>
      <div class="hero-stats">
        <div class="hero-stat">
          <div class="k">Their lifetime fees</div>
          <div class="v red">$472,938</div>
        </div>
        <div class="hero-stat">
          <div class="k">Our lifetime fees</div>
          <div class="v green">$24,000</div>
        </div>
      </div>
    </div>

    <!-- Lead paragraph w/ drop cap -->
    <div class="lead">
      <span class="dropcap">O</span>ne&nbsp;percent doesn&rsquo;t sound like much. Until you compound it for thirty years &mdash; then it quietly subtracts roughly a fifth of your wealth. That&rsquo;s not opinion; it&rsquo;s arithmetic. A flat $100 per month buys the same fiduciary advice, the same portfolio management, the same tax&#8209;aware planning &mdash; without the silent escalator. Scan the code on the reverse, or run the numbers at youarepayingtoomuch.com. There&rsquo;s no email required, no spoilers, and no obligation. Just the math.
    </div>

    <!-- Chart -->
    <div class="chart-block">
      <div class="chart-head">
        <div>
          <div class="chart-title">Your money, two paths.</div>
          <div class="chart-sub">$100/mo flat vs. 1.00% AUM &nbsp;·&nbsp; Both at 9.0% annual growth</div>
        </div>
      </div>
      <div class="chart-wrap">${chartSvg()}</div>
    </div>

    <!-- Pull quote -->
    <div class="pullquote">
      <span class="open">&ldquo;</span>
      <div class="quote">Fees are one of the few things in investing that are entirely within your control.</div>
      <div class="attrib">&mdash; The Wall Street Journal &nbsp;·&nbsp; On the math of long-term investing</div>
    </div>

    <!-- Front foot -->
    <div class="front-foot">
      <div class="front-disc">${DISCLOSURE}</div>
      <div class="front-domain">youarepayingtoomuch.com</div>
    </div>
  </section>

  <!-- ============== BACK / MAILING SIDE ============== -->
  <section class="page back">
    <!-- ===== POSTAL ZONE (0-432) ===== -->
    <div class="postal-zone">
      <div class="postal-tag">Reserved for USPS &nbsp;·&nbsp; Addressing</div>

      <div class="postal-hint">
        For Every Door Direct Mail<sup>&reg;</sup> Retail.
        <span class="big">Local Postal Customer.</span>
      </div>

      <div class="indicia">
        <div class="label">Indicia</div>
        PRSRT STD<br />
        ECRWSS<br />
        U.S. POSTAGE PAID<br />
        EDDM RETAIL
      </div>

      <div class="lpc">
        Local<br />Postal<br />Customer
        <div class="sub">Resident &nbsp;·&nbsp; Carrier Route</div>
      </div>
    </div>

    <!-- ===== EDITORIAL ZONE (433-1300) ===== -->
    <div class="back-mast">
      <div class="section">Meet Your Advisor</div>
      <div class="domain">youarepayingtoomuch.com</div>
    </div>
    <div class="back-mast-rule"></div>

    <!-- Portrait + caption (contributor photo treatment) -->
    <div class="portrait-wrap">
      <img class="portrait" src="${dvo}" alt="David J. Van Osdol" />
      <div class="portrait-cap">
        <span class="name">David J. Van Osdol,</span> photographed in Connecticut. He is the founder of Smarter Way Wealth, a flat-fee registered investment adviser.
      </div>
    </div>

    <!-- Article body / bio -->
    <div class="essay">
      <div class="eyebrow">&mdash; A note from the founder</div>
      <h2>The percentage<br />no longer matches<br />the work.</h2>
      <div class="creds">CFA Charterholder &nbsp;·&nbsp; CFP&reg; Practitioner &nbsp;·&nbsp; Connecticut</div>
      <div class="body">
        <p>I built Smarter Way Wealth because the percentage-fee model no longer matches the work. You shouldn&rsquo;t pay 5x more just because you saved 5x more.</p>
        <p>A flat $100/month retainer covers the same fiduciary planning, portfolio management, tax-aware rebalancing, and real-estate analysis &mdash; without the silent escalator.</p>
        <p class="cta-line">If your number on the reverse is bigger than you expected, let&rsquo;s have a fifteen-minute chat.</p>
      </div>
    </div>

    <!-- Three-stat editorial block, bottom-left -->
    <div class="stats">
      <div class="col">
        <div class="n">1%</div>
        <div class="t"><strong>doesn&rsquo;t sound like much.</strong> Until you compound it for 30 years &mdash; then it quietly subtracts roughly a fifth of your wealth. That&rsquo;s arithmetic.</div>
      </div>
      <div class="col">
        <div class="n">$100</div>
        <div class="t"><strong>flat per month.</strong> Same fiduciary advice. Same portfolio management. Same tax-aware planning. None of the AUM creep.</div>
      </div>
      <div class="col">
        <div class="n">$0</div>
        <div class="t"><strong>extra to find out.</strong> The calculator is free. The 15-minute audit is free. You see your actual fee gap before you ever sign anything.</div>
      </div>
    </div>

    <!-- QR + domain band -->
    <div class="qr-band">
      <img src="${qr}" alt="" />
      <div class="qr-meta">
        <div class="smallcap">Run the math</div>
        <div class="dom">youarepayingtoomuch.com</div>
        <div class="helper">Scan to see your own fee gap. No email required.</div>
      </div>
    </div>

    <!-- Disclaimer -->
    <div class="back-disc">${DISCLOSURE}</div>
  </section>

</body>
</html>`;
}

function contactSheetHtml() {
  const front = "SWW_VA_Editorial_Front_Proof.png";
  const back = "SWW_VA_Editorial_Back_Proof.png";
  return `<!doctype html>
<html><head><meta charset="utf-8" />
<title>SWW Version A Editorial Contact Sheet</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Serif:ital,wght@0,500;0,700&family=IBM+Plex+Sans:wght@500;700&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; }
  body { margin: 0; width: 2200px; height: 1300px; background: #F6F1E6; color: #111;
    font-family: 'IBM Plex Serif', Georgia, serif; }
  .sheet { padding: 60px 80px; display: grid; grid-template-rows: auto 1fr auto; gap: 28px;
    width: 2200px; height: 1300px; }
  h1 { margin: 0; font-family: 'IBM Plex Serif', Georgia, serif; font-weight: 800;
    font-size: 42px; letter-spacing: -0.02em; }
  h1 em { font-style: italic; color: #00682B; }
  .meta { margin-top: 8px; font-family: 'IBM Plex Sans', Arial, sans-serif;
    font-size: 14px; font-weight: 500; color: #6b5e57; letter-spacing: 0.04em; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: center; }
  .pane img { display: block; width: 100%; border: 1px solid #c9bda5; background: #fff; }
  .cap { margin-top: 12px; font-family: 'IBM Plex Sans', Arial, sans-serif;
    font-size: 12px; font-weight: 700; letter-spacing: 0.24em;
    text-transform: uppercase; color: #6b5e57; }
  footer { font-family: 'IBM Plex Sans', Arial, sans-serif; font-size: 12px;
    color: #6b5e57; letter-spacing: 0.04em; }
  .rule { height: 2px; background: #111; margin: 8px 0 0; }
</style></head>
<body>
  <div class="sheet">
    <header>
      <h1>Version A &mdash; <em>Editorial / WSJ Op&#8209;Ed</em></h1>
      <div class="meta">8.5 &times; 6.25 in trim, 0.125 in bleed &nbsp;&middot;&nbsp; IBM Plex Serif/Sans &nbsp;&middot;&nbsp; cream paper, brand green accent, red AUM curve &nbsp;&middot;&nbsp; pull&#8209;quote as anchor</div>
      <div class="rule"></div>
    </header>
    <div class="grid">
      <div class="pane"><img src="${front}" alt="" /><div class="cap">Front &middot; Editorial feature</div></div>
      <div class="pane"><img src="${back}" alt="" /><div class="cap">Back &middot; Postal zone + contributor essay</div></div>
    </div>
    <footer>Proof only. Confirm EDDM clear zones, indicia, stock, and final compliance language before production.</footer>
  </div>
</body></html>`;
}

function notesMd() {
  return `# SWW Version A — Editorial / WSJ Op-Ed EDDM Mailer

Generated by \`scripts/build-eddm-vA-editorial.mjs\`.

## Design direction

This piece reads as a feature page from a serious financial publication — Wall
Street Journal Weekend, Barron's, or Bloomberg Businessweek — rather than a
direct-mail flyer.

Key commitments:

- **Type**: IBM Plex Serif for display, headline, body, and the pull quote.
  IBM Plex Sans for labels, eyebrows, indicia, and meta data. Old-style figures
  (\`font-feature-settings: 'onum'\`) where supported. Drop cap on the lead.
  Italic display weights echo serious magazine setting.
- **Color**: Warm cream paper (\`#F6F1E6\`) — NOT white — with deep ink black
  (\`#111111\`) and one editorial accent (deep brand green \`#00682B\`). A
  single red (\`#B11226\`) is used ONLY on the AUM dashed curve and the
  corresponding "Their lifetime fees" figure, to read as "loss." No gradients,
  no shadows, no rounded chips, no card backgrounds.
- **Layout**: Columnar, with editorial gutter rules separating the lead from
  the hero-number column, a magazine-style pull quote with rule above/below as
  the visual anchor, and a contributor portrait treatment (small photo + italic
  serif caption) on the back. Hairline rules everywhere — no card UI.
- **Photo**: David's portrait is sized like a contributor photo on a magazine
  essay (280px wide), captioned in small italic serif underneath.
- **Chart**: Bare. Hairline grid at low opacity, axis dollar/year ticks set
  in old-style figures, flat-fee curve solid brand green, 1% AUM curve in
  dashed red, end-of-line labels.

## Layout / content map

### Front
- Masthead: italic-serif wordmark left, sans small-caps section center, vol/no right.
- Lead headline: "How much are you actually overpaying?" with italic "actually."
- Deck (italic): "The number you've never been shown."
- Hero number column (right): \`$952,405\` set in italic brand-green serif at
  122px. Sub: lifetime-fee-gap explainer. Stats: their fees ($472,938 red) and
  ours ($24,000 green).
- Lead paragraph with green drop cap "O." Two-column justified text.
- Chart: "Your money, two paths." Subtitle in small caps. Brand-green solid
  flat curve, red dashed AUM curve, end-point labels at $5.82M and $4.36M.
- Pull quote: WSJ quote treated as a magazine pull quote with thick rule above
  and hairline rule below; oversize green opening quote mark.
- Front foot: disclosure (left, small) + italic domain (right).

### Back
- Postal zone (top 432px): "Reserved for USPS / Addressing" tag, indicia block
  on the right (PRSRT STD / ECRWSS / U.S. POSTAGE PAID / EDDM RETAIL),
  LOCAL POSTAL CUSTOMER stamp underneath, italic-serif "Local Postal Customer."
  helper text on the left. 1.5px hairline at y=432 demarcates the boundary.
- Editorial zone (below 432): "Meet Your Advisor" section eyebrow, hairline
  rule, contributor portrait + italic caption on the left, founder essay on
  the right (eyebrow, headline, credentials, two-column justified body with
  the italic CTA line).
- Three-stat block at bottom-left: italic-serif numerals (1%, $100, $0) in
  brand green over a thick-then-hair rule.
- QR + domain band bottom-right.
- Disclaimer hairline at the very foot.

## Font fallbacks

The HTML loads IBM Plex Serif and IBM Plex Sans from Google Fonts and the
Playwright script awaits \`document.fonts.ready\` before screenshot. If
Google Fonts is unreachable at render time, Plex falls back to Georgia (serif)
and Helvetica/Arial (sans). The pull quote and drop cap will still read
clearly, but italic display weights will look more like default Georgia.

## Why this differs from the "restrained" reference

- Reference used Inter throughout — this piece uses Plex Serif as the
  display face.
- Reference rendered on pure white — this piece uses warm cream paper.
- Reference used black for the AUM curve — this piece uses red.
- Reference treated the WSJ quote as a small footer — this piece treats it as
  a full pull quote with rules above and below, sized like a real magazine
  pull quote.
- Reference's bio block was tagline+name. This piece treats it as a real
  essay with eyebrow / headline / credentials / two-column body.

## Print format

- Trim: ${TRIM_W} × ${TRIM_H} in landscape, ${BLEED} in bleed all sides.
- PDF page: 8.75 × 6.5 in. Proof PNGs: ${PAGE_W} × ${PAGE_H} px.
- Two pages: 1 = front (editorial), 2 = back (mailing + contributor essay).

## Disclosure used on both sides

${DISCLOSURE}
`;
}

async function render() {
  await fs.mkdir(OUT_DIR, { recursive: true });

  const proofPath = path.join(OUT_DIR, "SWW_VA_Editorial_Proof.html");
  const contactPath = path.join(OUT_DIR, "SWW_VA_Editorial_ContactSheet.html");
  const frontPath = path.join(OUT_DIR, "SWW_VA_Editorial_Front_Proof.png");
  const backPath = path.join(OUT_DIR, "SWW_VA_Editorial_Back_Proof.png");
  const contactImgPath = path.join(OUT_DIR, "SWW_VA_Editorial_ContactSheet.png");
  const pdfPath = path.join(OUT_DIR, "SWW_VA_Editorial_PrintReady_8p75x6p5.pdf");
  const notesPath = path.join(OUT_DIR, "SWW_VA_Editorial_Notes.md");

  await fs.writeFile(proofPath, proofHtml(), "utf8");
  await fs.writeFile(contactPath, contactSheetHtml(), "utf8");
  await fs.writeFile(notesPath, notesMd(), "utf8");

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({
      viewport: { width: PAGE_W, height: PAGE_H },
      deviceScaleFactor: 1,
    });
    await page.goto(pathToFileURL(proofPath).href, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    // Belt and suspenders: a tiny pause to make sure font shaping is settled.
    await page.waitForTimeout(250);

    await page.locator(".page.front").screenshot({ path: frontPath });
    await page.locator(".page.back").screenshot({ path: backPath });

    await page.pdf({
      path: pdfPath,
      width: "8.75in",
      height: "6.5in",
      printBackground: true,
      preferCSSPageSize: true,
    });
    await page.close();

    const c = await browser.newPage({
      viewport: { width: 2200, height: 1300 },
      deviceScaleFactor: 1,
    });
    await c.goto(pathToFileURL(contactPath).href, { waitUntil: "networkidle" });
    await c.evaluate(() => document.fonts.ready);
    await c.waitForTimeout(150);
    await c.locator(".sheet").screenshot({ path: contactImgPath });
    await c.close();
  } finally {
    await browser.close();
  }

  console.log(`Wrote Version A editorial mailer to ${OUT_DIR}`);
  console.log(`Front: ${frontPath}`);
  console.log(`Back:  ${backPath}`);
  console.log(`PDF:   ${pdfPath}`);
}

render().catch((err) => {
  console.error(err);
  process.exit(1);
});
