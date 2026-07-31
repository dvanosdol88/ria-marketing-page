#!/usr/bin/env node
/**
 * Weekly verification/refresh for src/data/savingsRates.json.
 *
 * Fail-closed by design — this script NEVER invents a rate:
 *
 *  1. FDIC national averages (the one machine-readable, authoritative
 *     source) are re-parsed from the FDIC's own page. A new value is
 *     accepted only if it passes sanity bounds (0–10%) AND moved less
 *     than 1.00 percentage point since the stored value. Otherwise the
 *     stored value is kept and the row is flagged.
 *
 *  2. Each curated institution row is RE-VERIFIED, not re-discovered:
 *     we fetch the institution's own rate page and require the stored
 *     APY string (e.g. "4.00") to appear near an "APY" mention. On
 *     success the row's lastVerified date advances. On failure (page
 *     unreachable, blocked, or APY string absent — i.e. the bank likely
 *     changed its rate) the row is marked "stale" and keeps its last
 *     verified figure and date. Publishing an unverified number is not
 *     possible through this path; changing a rate requires a human (or
 *     agent) edit with fresh two-source verification.
 *
 *  3. meta.lastFullVerification advances only when EVERY row verifies.
 *
 * Exit codes: 0 = all verified; 1 = script error; 2 = one or more rows
 * failed verification (data file still valid — dates/flags updated).
 *
 * Usage: node scripts/refresh-savings-rates.mjs [--dry-run]
 */

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DATA_PATH = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "src",
  "data",
  "savingsRates.json",
);

const USER_AGENT =
  "Mozilla/5.0 (compatible; SmarterWayWealth-RateVerifier/1.0; +https://youarepayingtoomuch.com/savings-rates)";

const DRY_RUN = process.argv.includes("--dry-run");
const today = new Date().toISOString().slice(0, 10);

async function fetchText(url, attempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { "user-agent": USER_AGENT, accept: "text/html,*/*" },
        redirect: "follow",
        signal: AbortSignal.timeout(45000),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.text();
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, 5000 * attempt));
      }
    }
  }
  throw lastError;
}

/** Parse "<td>Savings</td><td>0.38</td>" style rows from the FDIC table. */
function parseFdicRate(html, label) {
  const pattern = new RegExp(
    `<td>\\s*${label}\\s*</td>\\s*<td>\\s*([0-9]+\\.[0-9]+)\\s*</td>`,
    "i",
  );
  const match = html.match(pattern);
  return match ? Number(match[1]) : null;
}

/** Parse "as of July 20, 2026" from the FDIC page into YYYY-MM-DD. */
function parseFdicAsOf(html) {
  const match = html.match(/as of\s+([A-Z][a-z]+ \d{1,2}, \d{4})/);
  if (!match) return null;
  const parsed = new Date(`${match[1]} 12:00:00 UTC`);
  return Number.isNaN(parsed.getTime())
    ? null
    : parsed.toISOString().slice(0, 10);
}

function acceptFdicValue(name, stored, parsed, failures) {
  if (parsed === null) {
    failures.push(`FDIC ${name}: could not parse value — kept ${stored}`);
    return stored;
  }
  if (parsed <= 0 || parsed >= 10) {
    failures.push(`FDIC ${name}: parsed ${parsed} out of bounds — kept ${stored}`);
    return stored;
  }
  if (Math.abs(parsed - stored) >= 1.0) {
    failures.push(
      `FDIC ${name}: parsed ${parsed} moved >=1.00pt from ${stored} — kept ${stored}, needs human review`,
    );
    return stored;
  }
  return parsed;
}

/**
 * A row verifies when its stored APY string appears in the page within
 * 300 characters of an "APY" mention (guards against matching an
 * unrelated number elsewhere on the page).
 */
function pageConfirmsApy(html, verifyString) {
  const flat = html.replace(/\s+/g, " ");
  const needle = verifyString.replace(".", "\\.");
  const near = new RegExp(
    `(${needle}\\s*%?[\\s\\S]{0,300}?APY)|(APY[\\s\\S]{0,300}?${needle}\\s*%?)`,
    "i",
  );
  return near.test(flat);
}

async function verifyRow(row, failures) {
  const primary = row.sources.find((s) => s.role === "primary") ?? row.sources[0];
  const label = `${row.institution} ${row.product}`;
  try {
    const html = await fetchText(primary.url);
    if (pageConfirmsApy(html, row.verifyString)) {
      row.lastVerified = today;
      row.verification = "verified";
      console.log(`  OK    ${label}: ${row.verifyString}% confirmed at ${primary.url}`);
      return true;
    }
    row.verification = "stale";
    failures.push(
      `${label}: page loaded but ${row.verifyString}% APY not found — rate likely changed; kept last verified figure (${row.lastVerified})`,
    );
    return false;
  } catch (error) {
    row.verification = "stale";
    failures.push(
      `${label}: fetch failed (${error.message}) — kept last verified figure (${row.lastVerified})`,
    );
    return false;
  }
}

async function main() {
  const data = JSON.parse(readFileSync(DATA_PATH, "utf8"));
  const failures = [];

  console.log("Verifying FDIC national averages...");
  try {
    const fdicHtml = await fetchText(data.fdic.sourceUrl);
    data.fdic.savingsApyPercent = acceptFdicValue(
      "savings",
      data.fdic.savingsApyPercent,
      parseFdicRate(fdicHtml, "Savings"),
      failures,
    );
    data.fdic.moneyMarketApyPercent = acceptFdicValue(
      "money market",
      data.fdic.moneyMarketApyPercent,
      parseFdicRate(fdicHtml, "Money Market"),
      failures,
    );
    const asOf = parseFdicAsOf(fdicHtml);
    if (asOf) data.fdic.ratesAsOf = asOf;
    if (!failures.some((f) => f.startsWith("FDIC"))) {
      data.fdic.lastVerified = today;
      console.log(
        `  OK    FDIC savings ${data.fdic.savingsApyPercent}% / MMA ${data.fdic.moneyMarketApyPercent}% (as of ${data.fdic.ratesAsOf})`,
      );
    }
  } catch (error) {
    failures.push(`FDIC page fetch failed (${error.message}) — kept stored values`);
  }

  console.log("Verifying institution rows...");
  let allRowsVerified = true;
  for (const row of [...data.topRates.savings, ...data.topRates.moneyMarket]) {
    const ok = await verifyRow(row, failures);
    if (!ok) allRowsVerified = false;
  }

  const fdicVerified = !failures.some((f) => f.startsWith("FDIC"));
  if (allRowsVerified && fdicVerified) {
    data.meta.lastFullVerification = today;
  }

  if (failures.length > 0) {
    console.log("\nVERIFICATION FAILURES (fail closed — last verified data kept):");
    for (const failure of failures) console.log(`  FAIL  ${failure}`);
  }

  if (DRY_RUN) {
    console.log("\nDry run: no file written.");
  } else {
    writeFileSync(DATA_PATH, `${JSON.stringify(data, null, 2)}\n`);
    console.log(`\nWrote ${DATA_PATH}`);
  }

  console.log(
    failures.length === 0
      ? "All figures verified."
      : `${failures.length} figure(s) could not be verified — flagged, not changed.`,
  );
  process.exitCode = failures.length === 0 ? 0 : 2;
}

main().catch((error) => {
  console.error(`Refresh script error: ${error.message}`);
  process.exitCode = 1;
});
