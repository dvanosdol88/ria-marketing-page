import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

const ROOT = process.cwd();
const SOURCE_DIR = path.join(
  ROOT,
  "output",
  "mailer-samples",
  "codex",
  "save-upgrade-tools-v2-finalists",
);
const OUT_DIR = path.join(SOURCE_DIR, "print-ready-style-a-winner");

const SOURCE = {
  html: "SWW_YAPTOM_Finalists_01E_advisor-green-band_Proof.html",
  frontPng: "SWW_YAPTOM_Finalists_01E_advisor-green-band_Front_Proof.png",
  backPng: "SWW_YAPTOM_Finalists_01E_advisor-green-band_Back_Proof.png",
};

const OUTPUT = {
  html: "SWW_YAPTOM_StyleA_AdvisorGreenBand_SourceProof.html",
  frontPng: "SWW_YAPTOM_StyleA_AdvisorGreenBand_Front_Proof.png",
  backPng: "SWW_YAPTOM_StyleA_AdvisorGreenBand_Back_Proof.png",
  pdf: "SWW_YAPTOM_StyleA_AdvisorGreenBand_PrintReady_8p75x6p5.pdf",
  readme: "README.md",
  manifest: "printer-package-manifest.json",
  zip: "SWW_YAPTOM_StyleA_AdvisorGreenBand_PrintPackage.zip",
};

const DIMENSIONS = {
  trimInches: { width: 8.5, height: 6.25 },
  bleedInches: 0.125,
  pdfPageInches: { width: 8.75, height: 6.5 },
};

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function hashFile(filePath) {
  const buffer = await fs.readFile(filePath);
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

async function fileRecord(label, fileName, role, type) {
  const filePath = path.join(OUT_DIR, fileName);
  const stat = await fs.stat(filePath);
  return {
    label,
    role,
    type,
    path: path
      .relative(ROOT, filePath)
      .replaceAll(path.sep, "/"),
    bytes: stat.size,
    sha256: await hashFile(filePath),
  };
}

async function copyRequiredFile(sourceName, outputName) {
  const sourcePath = path.join(SOURCE_DIR, sourceName);
  if (!(await exists(sourcePath))) {
    throw new Error(`Missing required source file: ${sourcePath}`);
  }
  await fs.copyFile(sourcePath, path.join(OUT_DIR, outputName));
}

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "pipe",
      windowsHide: true,
      ...options,
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(
          new Error(
            `${command} ${args.join(" ")} failed with code ${code}\n${stdout}\n${stderr}`,
          ),
        );
      }
    });
  });
}

async function createZip() {
  const zipPath = path.join(OUT_DIR, OUTPUT.zip);
  await fs.rm(zipPath, { force: true });

  if (process.platform === "win32") {
    const quotedOut = zipPath.replaceAll("'", "''");
    const script = [
      "$ErrorActionPreference='Stop'",
      `$zip='${quotedOut}'`,
      "if (Test-Path -LiteralPath $zip) { Remove-Item -LiteralPath $zip -Force }",
      "Compress-Archive -LiteralPath @(",
      ...[
        OUTPUT.pdf,
        OUTPUT.frontPng,
        OUTPUT.backPng,
        OUTPUT.html,
        OUTPUT.readme,
        OUTPUT.manifest,
        "brand-assets",
      ].map((entry) => `  '${path.join(OUT_DIR, entry).replaceAll("'", "''")}'`),
      ") -DestinationPath $zip -CompressionLevel Optimal",
    ].join("\n");
    await run("powershell", ["-NoProfile", "-Command", script]);
    return;
  }

  await run(
    "zip",
    [
      "-r",
      OUTPUT.zip,
      OUTPUT.pdf,
      OUTPUT.frontPng,
      OUTPUT.backPng,
      OUTPUT.html,
      OUTPUT.readme,
      OUTPUT.manifest,
      "brand-assets",
    ],
    { cwd: OUT_DIR },
  );
}

function readPdfPageInfo(pdfBuffer) {
  const latin = pdfBuffer.toString("latin1");
  const pageCount = (latin.match(/\/Type\s*\/Page(?!s)\b/g) || []).length;
  const mediaBoxes = [
    ...latin.matchAll(
      /\/MediaBox\s*\[\s*([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)\s*\]/g,
    ),
  ].map((match) => ({
    x0: Number(match[1]),
    y0: Number(match[2]),
    x1: Number(match[3]),
    y1: Number(match[4]),
  }));

  return {
    pageCount,
    mediaBoxes,
  };
}

function assertPdfGeometry(pdfBuffer) {
  const { pageCount, mediaBoxes } = readPdfPageInfo(pdfBuffer);
  if (pageCount !== 2) {
    throw new Error(`Expected 2 PDF pages, found ${pageCount}`);
  }

  const expectedWidth = 8.75 * 72;
  const expectedHeight = 6.5 * 72;
  const mismatches = mediaBoxes.filter((box) => {
    const width = Math.abs(box.x1 - box.x0);
    const height = Math.abs(box.y1 - box.y0);
    return Math.abs(width - expectedWidth) > 0.1 || Math.abs(height - expectedHeight) > 0.1;
  });

  if (mismatches.length) {
    throw new Error(
      `Unexpected PDF MediaBox values: ${JSON.stringify(mediaBoxes)}`,
    );
  }

  return { pageCount, mediaBoxes };
}

function printerReadme() {
  return `# WINNER Style A: Advisor Green Band - Printer Package

Final handoff package for the selected EDDM mailer.

## Included Files

- \`${OUTPUT.pdf}\` - primary two-page print PDF, front then back.
- \`${OUTPUT.frontPng}\` - front visual proof PNG.
- \`${OUTPUT.backPng}\` - back visual proof PNG.
- \`${OUTPUT.html}\` - source proof HTML used to generate the PDF.
- \`brand-assets/\` - image assets referenced by the source proof HTML.
- \`${OUTPUT.manifest}\` - package metadata and SHA-256 hashes.
- \`${OUTPUT.zip}\` - zipped handoff bundle.

## Print Geometry

- Trim: ${DIMENSIONS.trimInches.width} x ${DIMENSIONS.trimInches.height} in landscape.
- Bleed: ${DIMENSIONS.bleedInches} in on all sides.
- PDF page/artboard: ${DIMENSIONS.pdfPageInches.width} x ${DIMENSIONS.pdfPageInches.height} in.
- Primary PDF is bleed-only, with no crop/trim marks.

## Offset / Press Notes

This package is the final visual and geometry handoff from the approved HTML proof.
The PDF is generated from RGB HTML artwork with print backgrounds enabled. The printer
should run their normal preflight for the specific press, paper, ink limits, and imposition.

If the printer requires CMYK, PDF/X-1a, PDF/X-4, or a specific ICC profile, perform that
conversion from this primary PDF using the printer's required profile/tooling, then preflight
the converted file before mailing.

## Source

- Source concept: FINALISTS 01E - Advisor Green Band.
- Eval candidate: eddm-finalists-01e-advisor-green-band.
- Approved proof source: \`${path
    .relative(ROOT, path.join(SOURCE_DIR, SOURCE.html))
    .replaceAll(path.sep, "/")}\`.
`;
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.cp(path.join(SOURCE_DIR, "brand-assets"), path.join(OUT_DIR, "brand-assets"), {
    recursive: true,
  });

  await copyRequiredFile(SOURCE.html, OUTPUT.html);
  await copyRequiredFile(SOURCE.frontPng, OUTPUT.frontPng);
  await copyRequiredFile(SOURCE.backPng, OUTPUT.backPng);
  await fs.writeFile(path.join(OUT_DIR, OUTPUT.readme), printerReadme(), "utf8");

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({
      viewport: { width: 1750, height: 1300 },
      deviceScaleFactor: 1,
    });
    await page.goto(pathToFileURL(path.join(OUT_DIR, OUTPUT.html)).href, {
      waitUntil: "networkidle",
    });
    await page.evaluate(() => document.fonts.ready);
    await page.addStyleTag({
      content: "@page { size: 8.75in 6.5in; margin: 0; }",
    });
    await page.pdf({
      path: path.join(OUT_DIR, OUTPUT.pdf),
      width: "8.75in",
      height: "6.5in",
      printBackground: true,
      preferCSSPageSize: true,
    });
    await page.close();
  } finally {
    await browser.close();
  }

  const pdfBuffer = await fs.readFile(path.join(OUT_DIR, OUTPUT.pdf));
  const pdfInfo = assertPdfGeometry(pdfBuffer);

  const manifestFiles = [
    await fileRecord("Print-ready PDF", OUTPUT.pdf, "print-ready", "pdf"),
    await fileRecord("Front proof", OUTPUT.frontPng, "front", "image"),
    await fileRecord("Back proof", OUTPUT.backPng, "back", "image"),
    await fileRecord("Source proof HTML", OUTPUT.html, "source-proof", "html"),
    await fileRecord("Printer notes", OUTPUT.readme, "notes", "markdown"),
  ];

  const manifest = {
    name: "WINNER Style A - Advisor Green Band Printer Package",
    generatedAt: new Date().toISOString(),
    generator: "scripts/build-eddm-style-a-winner-print-package.mjs",
    sourceCandidateId: "eddm-finalists-01e-advisor-green-band",
    sourceConcept: "FINALISTS 01E - Advisor Green Band",
    dimensions: DIMENSIONS,
    colorModeNote:
      "Primary PDF is generated from RGB HTML artwork. Printer should convert/preflight for required offset CMYK or PDF/X profile if needed.",
    markPolicy: "Bleed-only primary PDF; no crop or trim marks.",
    pdfVerification: {
      pageCount: pdfInfo.pageCount,
      mediaBoxes: pdfInfo.mediaBoxes,
    },
    packageArchive: OUTPUT.zip,
    files: manifestFiles,
  };

  await fs.writeFile(
    path.join(OUT_DIR, OUTPUT.manifest),
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8",
  );

  await createZip();

  console.log(`Generated Style A winner printer package in ${OUT_DIR}`);
  console.log(`PDF: ${path.join(OUT_DIR, OUTPUT.pdf)}`);
  console.log(`ZIP: ${path.join(OUT_DIR, OUTPUT.zip)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
