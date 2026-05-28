import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const repoRoot = process.cwd();

const MIME_TYPES: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
  ".gif": "image/gif",
  ".htm": "text/html; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".zip": "application/zip",
};

const allowedRoots = [
  path.join(repoRoot, "output", "mailer-samples"),
  path.join(repoRoot, "output", "redesigns"),
  path.join(repoRoot, "docs", "eddm-evals"),
  path.join(repoRoot, "crapFromGemini.html"),
];

function contentTypeFor(filePath: string) {
  return MIME_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream";
}

async function isAllowedFile(filePath: string) {
  const [fileRealPath, ...allowedRealPaths] = await Promise.all([
    fs.realpath(filePath),
    ...allowedRoots.map(async (root) => {
      try {
        return await fs.realpath(root);
      } catch {
        return null;
      }
    }),
  ]);

  return allowedRealPaths.some((allowedRealPath) => {
    if (!allowedRealPath) return false;
    if (fileRealPath === allowedRealPath) return true;
    const relative = path.relative(allowedRealPath, fileRealPath);
    return Boolean(relative) && !relative.startsWith("..") && !path.isAbsolute(relative);
  });
}

async function resolveEvalFile(parts: string[]) {
  const requestedPath = path.resolve(repoRoot, ...parts);
  const relativeFromRoot = path.relative(repoRoot, requestedPath);
  if (!relativeFromRoot || relativeFromRoot.startsWith("..") || path.isAbsolute(relativeFromRoot)) {
    return null;
  }

  if (!(await isAllowedFile(requestedPath))) return null;

  const fileStat = await fs.stat(requestedPath);
  if (!fileStat.isFile()) return null;

  return requestedPath;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path: pathParts } = await context.params;

  try {
    const filePath = await resolveEvalFile(pathParts);
    if (!filePath) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const body = await fs.readFile(filePath);
    return new NextResponse(body, {
      headers: {
        "Cache-Control": "public, max-age=300",
        "Content-Type": contentTypeFor(filePath),
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
    console.error("EDDM eval file serve error:", error);
    return NextResponse.json({ error: "Failed to serve EDDM eval file" }, { status: 500 });
  }
}

export async function HEAD(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path: pathParts } = await context.params;

  try {
    const filePath = await resolveEvalFile(pathParts);
    if (!filePath) {
      return new NextResponse(null, { status: 404 });
    }

    return new NextResponse(null, {
      headers: {
        "Cache-Control": "public, max-age=300",
        "Content-Type": contentTypeFor(filePath),
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
