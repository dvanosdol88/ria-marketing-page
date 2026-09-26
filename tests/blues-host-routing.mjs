/**
 * One Percent Blues — host-routing contract against a real dev server.
 *
 * The blue front door is host-based: onepercentblues.com serves /blues at
 * "/", the three other hostnames redirect there, and every other path on the
 * blue host bounces to the green site. None of that is visible to the
 * source-lock tests, so this one starts Next, sends requests with spoofed Host
 * headers and reads what comes back — including that the green home is
 * untouched.
 *
 * node:http rather than fetch: undici's fetch silently replaces a caller-set
 * Host header with the connection's own, so a spoofed host never reaches the
 * server that way (verified on Node 24). Redirects are read, never followed —
 * following one would make CI call the live production domains.
 */
import assert from "node:assert/strict";
import { request as httpRequest } from "node:http";
import { createServer } from "node:net";
import { execFileSync, spawn } from "node:child_process";

async function getUnusedPort() {
  const server = createServer();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const { port } = server.address();
  await new Promise((resolve) => server.close(resolve));
  return port;
}

function get(port, path, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = httpRequest(
      { host: "127.0.0.1", port, path, method: "GET", headers },
      (res) => {
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () =>
          resolve({
            status: res.statusCode ?? 0,
            headers: res.headers,
            body: Buffer.concat(chunks).toString("utf8"),
          }),
        );
      },
    );
    req.on("error", reject);
    req.end();
  });
}

async function waitForPage(port, child) {
  let lastError;
  for (let attempt = 0; attempt < 120; attempt += 1) {
    if (child.exitCode !== null) {
      throw new Error(`next dev exited early with code ${child.exitCode}`);
    }
    try {
      const response = await get(port, "/");
      if (response.status === 200) return;
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Timed out waiting for the dev server: ${lastError?.message ?? "no response"}`);
}

let nextProcess;

try {
  const port = await getUnusedPort();
  nextProcess = spawn(
    process.execPath,
    ["node_modules/next/dist/bin/next", "dev", "--hostname", "127.0.0.1", "--port", String(port)],
    { cwd: process.cwd(), stdio: "ignore", windowsHide: true },
  );
  await waitForPage(port, nextProcess);

  const blues = { Host: "onepercentblues.com" };
  const text = async (path, headers) => (await get(port, path, headers)).body;

  // 1. /blues on the default host serves the page with what the brief requires,
  //    and none of the green chrome.
  let html = await text("/blues");
  for (const needle of [
    "Got the",
    "1% Blues?",
    "$788,306",
    'id="calculator"',
    'id="calculator-notes"',
    "Registration does not imply",
    'data-theme="blues"',
    "Do you pay a percentage of your portfolio for advice?",
    "Your numbers, not ours.",
  ]) {
    assert.ok(html.includes(needle), `/blues must contain ${needle}`);
  }
  assert.ok(!html.includes('aria-label="Mobile navigation"'), "the green nav must not render on the blue page");
  // The green hero is the "opening-promise" section; "What would you do with"
  // alone would also match the poll question inside the shared calculator.
  assert.ok(!html.includes('data-url-eval-section="opening-promise"'), "the green hero must not render on the blue page");
  assert.ok(html.includes("<noscript>"), "the number and the cure must be readable without JavaScript");
  // Every disclaimer marker on the blue page must resolve (same guard as
  // tests/home-disclosures-ssr.mjs keeps on the green home).
  for (const target of new Set([...html.matchAll(/href="#(calculator-notes[^"]*)"/g)].map((m) => m[1]))) {
    assert.ok(html.includes(`id="${target}"`), `/blues: a marker points at #${target}, which is not on the page`);
  }
  // A link can carry a completed check; its diagnosis then renders server-side.
  html = await text("/blues?check=yny");
  assert.ok(html.includes("Yep. That&#x27;s the 1% Blues.") || html.includes("Yep. That's the 1% Blues."),
    "?check=yny must render the full diagnosis in the server HTML");
  assert.ok(html.includes("Estimated advisory-fee difference"), "the diagnosis carries the receipt label");

  // 2. The blue host serves the page at "/" and its own agent files; the
  //    scenario query flows into the share card.
  html = await text("/", blues);
  assert.ok(
    html.includes('data-theme="blues"') && html.includes("1% Blues?"),
    "Host: onepercentblues.com must serve the blue page at /",
  );
  html = await text("/?portfolio=2000000&years=20&growth=8&fee=1", blues);
  assert.ok(html.includes("/api/og/blues?"), "the blue share card must carry the scenario query");
  assert.ok(!html.includes("$788,306"), "a custom scenario must not show the default number");
  // Next appends the unconsumed `has` host match to the rewritten query; the
  // page must drop it so it never reaches the address bar or the share links.
  // (The router's own serialized request URL inside the page payload still
  // carries it; that string never reaches the address bar, which the client
  // router takes from window.location.)
  assert.ok(
    !/(href|content|src)="[^"]*host=onepercentblues.com/.test(html),
    "the rewrite's host value must not leak into the page's links, images or share URLs",
  );
  const bluesRobots = await text("/robots.txt", blues);
  assert.match(bluesRobots, /Sitemap: https:\/\/onepercentblues\.com\/sitemap\.xml/);
  for (const line of [
    "Disallow: /api/quiz/",
    "Disallow: /api/eddm-evals/",
    "Disallow: /gallery",
    "Disallow: /eddm-evals",
    "Disallow: /evals",
    "Disallow: /calculator-evals",
    "Disallow: /url-evals",
  ]) {
    assert.ok(bluesRobots.includes(line), `blue-host robots.txt must include ${line}`);
  }
  assert.match(await text("/sitemap.xml", blues), /<loc>https:\/\/onepercentblues\.com\/<\/loc>/);
  assert.match(await text("/llms.txt", blues), /# One Percent Blues/);
  assert.match(
    await text("/robots.txt"),
    /Sitemap: https:\/\/youarepayingtoomuch\.com\/sitemap\.xml/,
    "the green host keeps its own robots.txt",
  );

  // 3. Redirects (read, never followed).
  const expectRedirect = async (path, headers, location, statuses) => {
    const response = await get(port, path, headers);
    assert.ok(
      statuses.includes(response.status),
      `${path} (${headers.Host ?? "default host"}) answered ${response.status}, expected ${statuses.join("/")}`,
    );
    // Compared as parsed URLs: Next writes `https://host?q` for an empty :path*,
    // which every browser reads as `https://host/?q`.
    assert.equal(
      new URL(response.headers.location ?? "", "http://invalid.test").href,
      new URL(location).href,
      `${path} (${headers.Host ?? "default host"})`,
    );
  };
  await expectRedirect("/our-math", blues, "https://youarepayingtoomuch.com/our-math", [307]);
  await expectRedirect("/become-a-client", blues, "https://youarepayingtoomuch.com/become-a-client", [307]);
  await expectRedirect(
    "/site.webmanifest",
    blues,
    "https://youarepayingtoomuch.com/site.webmanifest",
    [307],
  );
  await expectRedirect("/?fee=1.5", { Host: "1percentblues.com" }, "https://onepercentblues.com/?fee=1.5", [308]);
  await expectRedirect("/", { Host: "www.1percentblues.com" }, "https://onepercentblues.com/", [308]);
  await expectRedirect("/", { Host: "www.onepercentblues.com" }, "https://onepercentblues.com/", [308]);
  const bluesSelf = await get(port, "/blues", blues);
  assert.equal(bluesSelf.status, 308, "/blues on the blue host must redirect to /");
  assert.match(bluesSelf.headers.location ?? "", /^(https?:\/\/[^/]+)?\/$/);

  // 4. The green home is untouched and the share card renders.
  html = await text("/");
  assert.ok(
    html.includes('data-url-eval-section="opening-promise"') && html.includes('aria-label="Mobile navigation"'),
    "the green home must still render its hero and nav",
  );
  assert.ok(!html.includes('data-theme="blues"'), "the green home must not carry the blue wrapper");
  const og = await get(port, "/api/og/blues?portfolio=1000000&years=20&growth=8&fee=1");
  assert.equal(og.status, 200);
  assert.match(og.headers["content-type"] ?? "", /image\/png/);

  console.log(
    "Blue front door: page, agent files, redirects and share card all behave; the green home is unchanged.",
  );
} finally {
  if (nextProcess?.pid && nextProcess.exitCode === null) {
    if (process.platform === "win32") {
      execFileSync("taskkill", ["/pid", String(nextProcess.pid), "/T", "/F"], { stdio: "ignore" });
    } else {
      nextProcess.kill("SIGTERM");
    }
  }
}
