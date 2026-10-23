/**
 * One Percent Blues — host-routing contract against a real dev server.
 *
 * The blue front door is host-based: onepercentblues.com serves /blues at
 * "/", the three other hostnames redirect there, known green doors bounce to
 * the green site, and unknown paths stay on the blue host as a Blues 404.
 * The blue host also serves its own PWA file and icon, and 404s internal
 * green-only APIs. None of that is visible to the source-lock tests, so this
 * one starts Next, sends requests with spoofed Host headers and reads what
 * comes back — including that the green home is untouched.
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

function request(port, path, { method = "GET", headers = {}, body } = {}) {
  return new Promise((resolve, reject) => {
    const req = httpRequest(
      { host: "127.0.0.1", port, path, method, headers },
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
    if (body !== undefined) req.end(body);
    else req.end();
  });
}

function get(port, path, headers = {}) {
  return request(port, path, { headers });
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

  // 1. The blue host serves the page with what the brief requires, and none
  //    of the green chrome. (/blues on any other host 308s away; see 3.)
  let html = await text("/", blues);
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
    assert.ok(html.includes(needle), `the blue page must contain ${needle}`);
  }
  assert.ok(!html.includes('aria-label="Mobile navigation"'), "the green nav must not render on the blue page");
  // The green hero is the "opening-promise" section; "What would you do with"
  // alone would also match the poll question inside the shared calculator.
  assert.ok(!html.includes('data-url-eval-section="opening-promise"'), "the green hero must not render on the blue page");
  assert.ok(html.includes("<noscript>"), "the number and the cure must be readable without JavaScript");
  // Every disclaimer marker on the blue page must resolve (same guard as
  // tests/home-disclosures-ssr.mjs keeps on the green home).
  for (const target of new Set([...html.matchAll(/href="#(calculator-notes[^"]*)"/g)].map((m) => m[1]))) {
    assert.ok(html.includes(`id="${target}"`), `blue page: a marker points at #${target}, which is not on the page`);
  }
  // A link can carry a completed check; its diagnosis then renders server-side.
  html = await text("/?check=yny", blues);
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
  assert.ok(!html.includes("/api/og?"), "the blue first paint must not name the green share-card path");
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
  assert.match(await text("/robots.txt", blues), /Sitemap: https:\/\/onepercentblues\.com\/sitemap\.xml/);
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
  await expectRedirect("/privacy", blues, "https://youarepayingtoomuch.com/privacy", [307]);
  await expectRedirect("/?fee=1.5", { Host: "1percentblues.com" }, "https://onepercentblues.com/?fee=1.5", [308]);
  await expectRedirect("/", { Host: "www.1percentblues.com" }, "https://onepercentblues.com/", [308]);
  await expectRedirect("/", { Host: "www.onepercentblues.com" }, "https://onepercentblues.com/", [308]);
  await expectRedirect(
    "/this-does-not-exist-xyz",
    { Host: "1percentblues.com" },
    "https://onepercentblues.com/this-does-not-exist-xyz",
    [308],
  );
  const bluesSelf = await get(port, "/blues", blues);
  assert.equal(bluesSelf.status, 308, "/blues on the blue host must redirect to /");
  assert.match(bluesSelf.headers.location ?? "", /^(https?:\/\/[^/]+)?\/$/);
  // Rack 05-75: /blues on the green host (or any non-blue host) is not a
  // second copy of the blue page; it 308s to the blue home.
  await expectRedirect("/blues", {}, "https://onepercentblues.com/", [308]);
  await expectRedirect("/blues", { Host: "youarepayingtoomuch.com" }, "https://onepercentblues.com/", [308]);
  await expectRedirect("/blues?check=yny", {}, "https://onepercentblues.com/?check=yny", [308]);
  await expectRedirect("/blues/robots.txt", {}, "https://onepercentblues.com/robots.txt", [308]);
  await expectRedirect("/blues", { Host: "1percentblues.com" }, "https://onepercentblues.com/", [308]);

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

  // 5. Conventional icon paths on the blue host serve the blue mark.
  const bluesIcon = await text("/brand/blues-icon.svg", blues);
  assert.match(bluesIcon, /#1E3A8A/);
  for (const path of ["/favicon.ico", "/favicon-32x32.png", "/apple-touch-icon.png"]) {
    const icon = await get(port, path, blues);
    assert.equal(icon.status, 200, `${path} on the blue host must stay on this host`);
    assert.equal(icon.body, bluesIcon, `${path} on the blue host must serve the blues icon`);
  }
  const greenFavicon = await get(port, "/favicon.ico");
  assert.equal(greenFavicon.status, 200);
  assert.notEqual(greenFavicon.body, bluesIcon, "the green host keeps its own favicon");
  html = await text("/", blues);
  assert.match(html, /\/brand\/blues-icon\.svg/);
  assert.ok(
    !/apple-touch-icon\.png|favicon-16x16\.png|favicon-32x32\.png|\/brand\/logo-icon\.svg/.test(html),
    "the blue page must not link the green apple/png fallbacks",
  );

  // 6. Unknown paths and missing assets on the blue host stay there, return
  //    HTTP 404, and wear blue chrome — they must not 307 to the green site.
  for (const path of ["/this-does-not-exist-xyz", "/blues/nope", "/brand/missing.svg"]) {
    const missing = await get(port, path, blues);
    assert.equal(missing.status, 404, `${path} on the blue host must 404`);
    assert.equal(
      missing.headers.location,
      undefined,
      `${path} on the blue host must not redirect to the green site`,
    );
    assert.ok(missing.body.includes('data-theme="blues"'), `${path} must use blue chrome`);
    assert.ok(missing.body.includes("One Percent"), `${path} must show the blues wordmark`);
    assert.match(
      missing.body,
      /<title>Page not found \| One Percent Blues<\/title>/,
      `${path} must use the Blues 404 title, not the green site title`,
    );
    assert.match(
      missing.body,
      /og:site_name" content="One Percent Blues"/,
      `${path} must not advertise the green site name`,
    );
    assert.ok(
      !missing.body.includes("You Are Paying Too Much"),
      `${path} must not leak the green site name`,
    );
    assert.ok(
      !missing.body.includes('aria-label="Mobile navigation"'),
      `${path} must not wear the green nav`,
    );
  }
  const greenMissing = await get(port, "/definitely-missing-page-for-blues-chrome");
  assert.equal(greenMissing.status, 404);
  assert.ok(
    greenMissing.body.includes('aria-label="Mobile navigation"'),
    "the green host 404 keeps the green nav",
  );
  assert.ok(!greenMissing.body.includes('data-theme="blues"'), "the green host 404 must not use blue chrome");

  // 7. PWA files on the blue host stay there with Blues branding — they must
  //    not 307 to the green site (open #317) and must not serve the green name,
  //    theme color, or icons.
  const bluesManifest = await get(port, "/site.webmanifest", blues);
  assert.equal(bluesManifest.status, 200, "blue-host /site.webmanifest must stay on this host");
  assert.equal(
    bluesManifest.headers.location,
    undefined,
    "blue-host /site.webmanifest must not redirect to the green site",
  );
  assert.match(bluesManifest.body, /"name"\s*:\s*"One Percent Blues"/);
  assert.match(bluesManifest.body, /#1E3A8A/);
  assert.match(bluesManifest.body, /\/brand\/blues-icon\.svg/);
  assert.ok(!bluesManifest.body.includes("Smarter Way Wealth"), "blue manifest must not use the green PWA name");
  assert.ok(!bluesManifest.body.includes("#00A540"), "blue manifest must not use the green theme color");
  assert.ok(
    !bluesManifest.body.includes("android-chrome-192x192.png"),
    "blue manifest must not point at the green Android icons",
  );
  const greenManifest = await get(port, "/site.webmanifest");
  assert.equal(greenManifest.status, 200);
  assert.match(greenManifest.body, /Smarter Way Wealth/);
  assert.match(greenManifest.body, /#00A540/);
  for (const path of ["/android-chrome-192x192.png", "/android-chrome-512x512.png"]) {
    const icon = await get(port, path, blues);
    assert.equal(icon.status, 200, `${path} on the blue host must stay on this host`);
    assert.equal(icon.headers.location, undefined, `${path} on the blue host must not redirect to the green site`);
    assert.equal(icon.body, bluesIcon, `${path} on the blue host must serve the blues icon`);
    const greenIcon = await get(port, path);
    assert.equal(greenIcon.status, 200, `${path} on the green host stays the green PNG`);
    assert.notEqual(greenIcon.body, bluesIcon, `${path} on the green host must not become the blues icon`);
  }
  await expectRedirect(
    "/site.webmanifest",
    { Host: "1percentblues.com" },
    "https://onepercentblues.com/site.webmanifest",
    [308],
  );

  // 8. Internal / green-only APIs 404 on the blue host (and www). They stay
  //    live on the green host. The short 1percent name still 308s to the apex.
  const gatedApis = [
    { path: "/api/eddm-evals/catalog", method: "GET" },
    { path: "/api/eddm-evals/state", method: "GET" },
    { path: "/api/eddm-evals/file/docs/eddm-evals/README.md", method: "GET" },
    { path: "/api/gallery/statuses", method: "GET" },
    {
      path: "/api/become-a-client",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    },
    { path: "/api/savings-rates", method: "GET" },
    { path: "/api/analytics/mailer-scans", method: "GET" },
    { path: "/api/calculator", method: "GET" },
    { path: "/api/version", method: "GET" },
    { path: "/api/og", method: "GET" },
    { path: "/agent-info.json", method: "GET" },
  ];
  for (const { path, method, headers = {}, body } of gatedApis) {
    const blocked = await request(port, path, { method, headers: { ...headers, ...blues }, body });
    assert.equal(blocked.status, 404, `${method} ${path} on the blue host must 404`);
    assert.equal(
      blocked.headers.location,
      undefined,
      `${method} ${path} on the blue host must not redirect to the green site`,
    );
    const wwwBlocked = await request(port, path, {
      method,
      headers: { ...headers, Host: "www.onepercentblues.com" },
      body,
    });
    assert.ok(
      wwwBlocked.status === 404 ||
        (wwwBlocked.status === 308 &&
          new URL(wwwBlocked.headers.location ?? "", "http://invalid.test").href ===
            new URL(`https://onepercentblues.com${path}`).href),
      `${method} ${path} on www.onepercentblues.com must 404 or keep the existing 308 to the apex`,
    );
    await expectRedirect(path, { Host: "1percentblues.com" }, `https://onepercentblues.com${path}`, [308]);
  }
  const greenCatalog = await get(port, "/api/eddm-evals/catalog");
  assert.notEqual(greenCatalog.status, 404, "green host /api/eddm-evals/catalog must stay available");
  const greenStatuses = await get(port, "/api/gallery/statuses");
  assert.notEqual(greenStatuses.status, 404, "green host /api/gallery/statuses must stay available");
  const greenSignup = await request(port, "/api/become-a-client", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
  assert.notEqual(greenSignup.status, 404, "green host /api/become-a-client must stay available");
  for (const path of [
    "/api/og",
    "/api/savings-rates",
    "/api/analytics/mailer-scans",
    "/api/calculator",
    "/api/version",
    "/agent-info.json",
  ]) {
    const green = await get(port, path);
    assert.notEqual(green.status, 404, `green host ${path} must stay available`);
  }
  const bluesShare = await get(port, "/api/og/blues?portfolio=1000000&years=20&growth=8&fee=1", blues);
  assert.equal(bluesShare.status, 200, "the blue share-card API must stay available on the blue host");
  assert.match(bluesShare.headers["content-type"] ?? "", /image\/png/);
  const bluesGreenShare = await get(port, "/api/og?portfolio=1000000&years=20&growth=8&fee=1", blues);
  assert.equal(bluesGreenShare.status, 404, "the green share-card path must 404 on the blue host");
  assert.equal(
    bluesGreenShare.headers.location,
    undefined,
    "the green share-card path must not redirect to the green site",
  );
  const bluesQuiz = await get(port, "/api/quiz/vote", blues);
  assert.notEqual(bluesQuiz.status, 404, "the quiz API must stay available on the blue host");

  console.log(
    "Blue front door: page, agent files, redirects, Blues PWA files, gated APIs and share card all behave; the green home is unchanged.",
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
