import { createServer } from "node:net";
import { execFileSync, spawn } from "node:child_process";

/**
 * Sequential CI suites share one `.next` directory. If the previous `next
 * dev` is only sent SIGTERM and the test exits immediately, Turbopack
 * workers can keep the lock and the next suite's server never binds.
 */
export async function getUnusedPort() {
  const server = createServer();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const { port } = server.address();
  await new Promise((resolve) => server.close(resolve));
  return port;
}

export function startNextDev(port, extraArgs = []) {
  const logs = [];
  const child = spawn(
    process.execPath,
    [
      "node_modules/next/dist/bin/next",
      "dev",
      "--hostname",
      "127.0.0.1",
      "--port",
      String(port),
      ...extraArgs,
    ],
    {
      cwd: process.cwd(),
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
      detached: process.platform !== "win32",
    },
  );
  const collect = (chunk) => {
    logs.push(String(chunk));
  };
  child.stdout?.on("data", collect);
  child.stderr?.on("data", collect);
  return { child, logs };
}

export async function waitForPage(url, child, logs = [], attempts = 180) {
  let lastError;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (child.exitCode !== null) {
      throw new Error(
        `next dev exited early with code ${child.exitCode}${formatLogs(logs)}`,
      );
    }
    try {
      const response = await fetch(url);
      if (response.ok) return;
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(
    `Timed out waiting for ${url}: ${lastError?.message ?? "no response"}${formatLogs(logs)}`,
  );
}

export async function stopNextDev(child) {
  if (!child?.pid || child.exitCode !== null) return;

  const waitForExit = () =>
    new Promise((resolve) => {
      if (child.exitCode !== null) {
        resolve();
        return;
      }
      child.once("exit", resolve);
    });

  try {
    if (process.platform === "win32") {
      execFileSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], {
        stdio: "ignore",
      });
    } else {
      try {
        process.kill(-child.pid, "SIGTERM");
      } catch {
        child.kill("SIGTERM");
      }
    }
  } catch {
    // The process may already have exited.
  }

  await Promise.race([
    waitForExit(),
    new Promise((resolve) => setTimeout(resolve, 5000)),
  ]);

  if (child.exitCode !== null) return;

  try {
    if (process.platform === "win32") {
      child.kill("SIGKILL");
    } else {
      process.kill(-child.pid, "SIGKILL");
    }
  } catch {
    // The process may already have exited.
  }

  await Promise.race([
    waitForExit(),
    new Promise((resolve) => setTimeout(resolve, 2000)),
  ]);
}

function formatLogs(logs) {
  const text = logs.join("").trim();
  return text ? `\n--- next dev output ---\n${text}` : "";
}
