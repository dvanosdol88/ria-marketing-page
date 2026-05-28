#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const catalogPath = path.join(repoRoot, "docs", "eddm-evals", "catalog.json");
const statePath = path.join(repoRoot, "docs", "eddm-evals", "state.json");

function usage() {
  console.log(`
Usage:
  npm run eddm:catalog:add-round -- --source <folder> --group <group> --id-prefix <prefix> [--write]

Example:
  npm run eddm:catalog:add-round -- \\
    --source output/mailer-samples/round-02 \\
    --group "G. Round 2 revisions" \\
    --id-prefix eddm-r2 \\
    --status proof-only \\
    --write

What it does:
  - Scans the source folder for front/back image pairs.
  - Creates one scoreable catalog row per pair.
  - Optionally creates an overview row when contact-sheet assets exist.
  - Validates duplicate IDs and missing asset paths.
  - Writes only when --write is present. Dry-run is the default.

Expected file patterns:
  *_Front.png
  *_Back.png
  *_Front_Proof.png
  *_Back_Proof.png

Optional sibling files are attached automatically:
  *_Proof.html
  *_Rationale.md
  README.md
  *manifest*.json
  *ContactSheet*.png/html/pdf
`);
}

function parseArgs(argv) {
  const args = {
    status: "proof-only",
    decision: "undecided",
    write: false,
    overview: true,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") {
      args.help = true;
    } else if (arg === "--write") {
      args.write = true;
    } else if (arg === "--no-overview") {
      args.overview = false;
    } else if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error(`Missing value for ${arg}`);
      }
      args[key] = value;
      index += 1;
    } else {
      throw new Error(`Unexpected argument: ${arg}`);
    }
  }

  return args;
}

function toPosixPath(filePath) {
  return filePath.split(path.sep).join("/");
}

function repoRelative(filePath) {
  return toPosixPath(path.relative(repoRoot, filePath));
}

function slugify(value) {
  return String(value)
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function titleize(value) {
  return slugify(value)
    .split("-")
    .filter(Boolean)
    .map((part) => {
      if (/^\d+$/.test(part)) return part;
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(" ");
}

function stripCommonPrefix(base) {
  return base
    .replace(/^SWW[_ -]YAPTOM[_ -]/i, "")
    .replace(/^SWW[_ -]/i, "")
    .replace(/[_ -]EDDM$/i, "")
    .replace(/[_ -]Proof$/i, "");
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function walkFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const filePath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(filePath));
    } else if (entry.isFile()) {
      files.push(filePath);
    }
  }

  return files;
}

function sideInfo(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  if (![".png", ".jpg", ".jpeg", ".webp"].includes(extension)) return null;

  const nameWithoutExtension = path.basename(filePath, extension);
  const frontMatch = nameWithoutExtension.match(/^(.*?)[_ -]+Front(?:[_ -]+Proof)?$/i);
  if (frontMatch) return { side: "front", base: frontMatch[1] };

  const backMatch = nameWithoutExtension.match(/^(.*?)[_ -]+Back(?:[_ -]+Proof)?$/i);
  if (backMatch) return { side: "back", base: backMatch[1] };

  return null;
}

function assetType(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  if ([".png", ".jpg", ".jpeg", ".webp"].includes(extension)) return "image";
  if (extension === ".html") return "html";
  if (extension === ".md") return "markdown";
  if (extension === ".pdf") return "pdf";
  if (extension === ".json") return "json";
  return "file";
}

function findSibling(files, directory, base, suffixPattern) {
  const matcher = new RegExp(`^${escapeRegex(base)}${suffixPattern}$`, "i");
  return files.find((filePath) => path.dirname(filePath) === directory && matcher.test(path.basename(filePath)));
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function candidateSortKey(candidate) {
  return candidate.id;
}

function buildCandidateEntries(sourceDir, args) {
  const files = walkFiles(sourceDir);
  const pairs = new Map();

  for (const filePath of files) {
    const info = sideInfo(filePath);
    if (!info) continue;

    const key = `${path.dirname(filePath)}\u0000${info.base}`;
    const current = pairs.get(key) || {
      directory: path.dirname(filePath),
      base: info.base,
    };
    current[info.side] = filePath;
    pairs.set(key, current);
  }

  const completePairs = [...pairs.values()]
    .filter((pair) => pair.front && pair.back)
    .sort((a, b) => candidateSortKey({ id: a.base }).localeCompare(candidateSortKey({ id: b.base })));

  const entries = completePairs.map((pair) => {
    const cleanBase = stripCommonPrefix(pair.base);
    const slug = slugify(cleanBase);
    const variant = titleize(cleanBase);
    const assets = [
      {
        label: "Front proof",
        type: assetType(pair.front),
        path: repoRelative(pair.front),
        role: "front",
      },
      {
        label: "Back proof",
        type: assetType(pair.back),
        path: repoRelative(pair.back),
        role: "back",
      },
    ];

    const proofHtml = findSibling(files, pair.directory, pair.base, "[_ -]+Proof\\.html");
    if (proofHtml) {
      assets.push({
        label: "HTML proof",
        type: "html",
        path: repoRelative(proofHtml),
        role: "proof",
      });
    }

    const rationale = findSibling(files, pair.directory, pair.base, "[_ -]+Rationale\\.md");
    if (rationale) {
      assets.push({
        label: "Rationale",
        type: "markdown",
        path: repoRelative(rationale),
        role: "rationale",
      });
    }

    return {
      id: `${args["id-prefix"]}-${slug}`,
      group: args.group,
      variant,
      name: `${args["title-prefix"] ? `${args["title-prefix"]}: ` : ""}${variant}`,
      status: args.status,
      suggestedDecision: args.decision,
      summary: "Imported revision candidate. Review front/back fit, mailbox clarity, QR handoff, print readiness, and compliance risk before selecting a finalist.",
      reviewFocus: [
        "Score this as a new revision candidate; do not compare it using an older candidate ID.",
        "Check front/back message fit, QR clarity, print safety, and compliance/disclosure risk.",
        "If selected, confirm final print-ready PDF dimensions, bleed, and USPS/EDDM placement with the printer.",
      ],
      knownLimitations:
        args.status === "proof-only"
          ? ["Imported proof assets may not include a final print-ready PDF yet."]
          : undefined,
      assets,
    };
  });

  const overview = buildOverviewEntry(files, args);
  return overview ? [overview, ...entries] : entries;
}

function buildOverviewEntry(files, args) {
  if (!args.overview) return null;

  const overviewAssets = files
    .filter((filePath) => /contact.?sheet/i.test(path.basename(filePath)))
    .filter((filePath) => [".png", ".jpg", ".jpeg", ".webp", ".html", ".pdf"].includes(path.extname(filePath).toLowerCase()))
    .sort((a, b) => a.localeCompare(b))
    .map((filePath) => ({
      label: titleize(path.basename(filePath, path.extname(filePath))),
      type: assetType(filePath),
      path: repoRelative(filePath),
      role: "overview",
    }));

  const readme = files.find((filePath) => /^README\.md$/i.test(path.basename(filePath)));
  if (readme) {
    overviewAssets.push({
      label: "README",
      type: "markdown",
      path: repoRelative(readme),
      role: "notes",
    });
  }

  const manifest = files.find((filePath) => /manifest.*\.json$/i.test(path.basename(filePath)));
  if (manifest) {
    overviewAssets.push({
      label: "Manifest",
      type: "json",
      path: repoRelative(manifest),
      role: "manifest",
    });
  }

  if (!overviewAssets.length) return null;

  const name = args["title-prefix"] || titleize(path.basename(path.resolve(repoRoot, args.source)));
  return {
    id: `${args["id-prefix"]}-overview`,
    group: args.group,
    variant: "Overview / contact sheet",
    name: `${name} overview`,
    status: "overview",
    suggestedDecision: args.decision,
    summary: "Imported overview row for this revision round. Start here before scoring individual front/back candidates.",
    reviewFocus: [
      "Use this overview to narrow the field before scoring individual concepts.",
      "Confirm every concept worth reviewing has its own front/back scoreable row.",
    ],
    assets: overviewAssets,
  };
}

function validate(catalog, entries) {
  const errors = [];
  const existingIds = new Set(catalog.candidates.map((candidate) => candidate.id));
  const newIds = new Set();

  for (const entry of entries) {
    if (existingIds.has(entry.id)) errors.push(`Catalog already contains candidate id: ${entry.id}`);
    if (newIds.has(entry.id)) errors.push(`Generated duplicate candidate id: ${entry.id}`);
    newIds.add(entry.id);

    for (const asset of entry.assets || []) {
      const absoluteAssetPath = path.resolve(repoRoot, asset.path);
      if (!fs.existsSync(absoluteAssetPath)) {
        errors.push(`Missing asset for ${entry.id}: ${asset.path}`);
      }
    }
  }

  if (!entries.some((entry) => entry.status !== "overview")) {
    errors.push("No complete front/back pairs were found.");
  }

  return errors;
}

function updateState(state, entries) {
  state.candidateStates = state.candidateStates && typeof state.candidateStates === "object" ? state.candidateStates : {};
  for (const entry of entries) {
    if (!state.candidateStates[entry.id]) state.candidateStates[entry.id] = {};
  }
  return state;
}

function printSummary(entries, args) {
  console.log(`${args.write ? "Writing" : "Dry-run"} EDDM catalog import`);
  console.log(`Source: ${args.source}`);
  console.log(`Group: ${args.group}`);
  console.log(`Generated entries: ${entries.length}`);
  for (const entry of entries) {
    const assetSummary = (entry.assets || []).map((asset) => `${asset.role || asset.type}:${asset.path}`).join(", ");
    console.log(`- ${entry.id} | ${entry.status} | ${entry.name}`);
    console.log(`  ${assetSummary}`);
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    return;
  }

  for (const required of ["source", "group", "id-prefix"]) {
    if (!args[required]) {
      usage();
      throw new Error(`Missing required --${required}`);
    }
  }

  const sourceDir = path.resolve(repoRoot, args.source);
  if (!fs.existsSync(sourceDir) || !fs.statSync(sourceDir).isDirectory()) {
    throw new Error(`Source folder does not exist: ${args.source}`);
  }

  const catalog = readJson(catalogPath);
  const entries = buildCandidateEntries(sourceDir, args);
  const errors = validate(catalog, entries);
  printSummary(entries, args);

  if (errors.length) {
    console.error("\nValidation failed:");
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }

  if (!args.write) {
    console.log("\nDry-run only. Re-run with --write to update catalog.json and state.json.");
    return;
  }

  catalog.updatedAt = new Date().toISOString().slice(0, 10);
  catalog.candidates.push(...entries);
  writeJson(catalogPath, catalog);

  const state = updateState(readJson(statePath), entries);
  writeJson(statePath, state);

  console.log(`\nUpdated ${repoRelative(catalogPath)} and ${repoRelative(statePath)}.`);
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
