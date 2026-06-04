#!/usr/bin/env node

import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile, realpath, rename, stat, writeFile } from 'node:fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const catalogPath = path.join(repoRoot, 'docs', 'eddm-evals', 'catalog.json');
const statePath = path.join(repoRoot, 'docs', 'eddm-evals', 'state.json');
const repoRootRealPathPromise = realpath(repoRoot);
let stateMutationQueue = Promise.resolve();

const DEFAULT_PORT = 3044;
const HOST = '127.0.0.1';
const publicHost = 'localhost';

const MIME_TYPES = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.csv', 'text/csv; charset=utf-8'],
  ['.gif', 'image/gif'],
  ['.htm', 'text/html; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.jpeg', 'image/jpeg'],
  ['.jpg', 'image/jpeg'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.md', 'text/markdown; charset=utf-8'],
  ['.pdf', 'application/pdf'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml; charset=utf-8'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.webp', 'image/webp'],
  ['.zip', 'application/zip']
]);

function parsePort(argv) {
  const index = argv.indexOf('--port');
  if (index === -1) return DEFAULT_PORT;

  const raw = argv[index + 1];
  const port = Number(raw);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid --port value: ${raw}`);
  }
  return port;
}

function send(res, status, body, headers = {}) {
  res.writeHead(status, {
    'Cache-Control': 'no-store',
    ...headers
  });
  res.end(body);
}

function sendJson(res, status, payload) {
  send(res, status, JSON.stringify(payload, null, 2), {
    'Content-Type': 'application/json; charset=utf-8'
  });
}

function sendText(res, status, message) {
  send(res, status, message, {
    'Content-Type': 'text/plain; charset=utf-8'
  });
}

async function readJson(filePath, fallback) {
  try {
    const raw = await readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    if (error.code === 'ENOENT' && fallback !== undefined) return fallback;
    throw error;
  }
}

async function readCatalog() {
  return readJson(catalogPath);
}

async function readState() {
  return readJson(statePath, {
    version: 1,
    updatedAt: null,
    candidateStates: {}
  });
}

async function writeState(nextState) {
  const tmpPath = `${statePath}.tmp-${process.pid}-${Date.now()}`;
  await writeFile(tmpPath, `${JSON.stringify(nextState, null, 2)}\n`, 'utf8');
  await rename(tmpPath, statePath);
}

function enqueueStateMutation(operation) {
  const queuedOperation = stateMutationQueue.then(operation, operation);
  stateMutationQueue = queuedOperation.catch(() => {});
  return queuedOperation;
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function deepMerge(base, patch) {
  const next = isPlainObject(base) ? { ...base } : {};
  for (const [key, value] of Object.entries(patch)) {
    if (isPlainObject(value) && isPlainObject(next[key])) {
      next[key] = deepMerge(next[key], value);
    } else {
      next[key] = value;
    }
  }
  return next;
}

async function readBodyJson(req) {
  const chunks = [];
  let bytes = 0;

  for await (const chunk of req) {
    bytes += chunk.length;
    if (bytes > 1_000_000) {
      throw new Error('Request body too large.');
    }
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw.trim()) return {};
  return JSON.parse(raw);
}

function repoFileFromUrl(url) {
  const prefix = '/repo-file/';
  if (!url.pathname.startsWith(prefix)) return null;

  const encodedRelativePath = url.pathname.slice(prefix.length);
  const relativePath = decodeURIComponent(encodedRelativePath);
  const resolvedPath = path.resolve(repoRoot, relativePath);
  const relativeFromRoot = path.relative(repoRoot, resolvedPath);

  if (
    !relativeFromRoot ||
    relativeFromRoot.startsWith('..') ||
    path.isAbsolute(relativeFromRoot)
  ) {
    return null;
  }

  return resolvedPath;
}

async function serveRepoFile(req, res, url) {
  let filePath;
  try {
    filePath = repoFileFromUrl(url);
  } catch {
    sendText(res, 400, 'Invalid file path.');
    return;
  }

  if (!filePath) {
    sendText(res, 403, 'File path is outside the repo root.');
    return;
  }

  try {
    const [repoRootRealPath, fileRealPath] = await Promise.all([
      repoRootRealPathPromise,
      realpath(filePath)
    ]);
    const realRelativeFromRoot = path.relative(repoRootRealPath, fileRealPath);

    if (
      !realRelativeFromRoot ||
      realRelativeFromRoot.startsWith('..') ||
      path.isAbsolute(realRelativeFromRoot)
    ) {
      sendText(res, 403, 'File path resolves outside the repo root.');
      return;
    }

    const fileStat = await stat(fileRealPath);
    if (!fileStat.isFile()) {
      sendText(res, 404, 'Not a file.');
      return;
    }

    const extension = path.extname(fileRealPath).toLowerCase();
    const contentType = MIME_TYPES.get(extension) || 'application/octet-stream';
    const body = req.method === 'HEAD' ? '' : await readFile(fileRealPath);
    send(res, 200, body, {
      'Content-Type': contentType,
      'Content-Length': req.method === 'HEAD' ? '0' : String(Buffer.byteLength(body)),
      'X-Content-Type-Options': 'nosniff'
    });
  } catch (error) {
    if (error.code === 'ENOENT') {
      sendText(res, 404, 'File not found.');
      return;
    }
    throw error;
  }
}

async function updateCandidateState(req, res) {
  const payload = await readBodyJson(req);
  const { candidateId, patch } = payload;

  if (typeof candidateId !== 'string' || !candidateId.trim()) {
    sendJson(res, 400, { error: 'candidateId must be a non-empty string.' });
    return;
  }

  if (!isPlainObject(patch)) {
    sendJson(res, 400, { error: 'patch must be an object.' });
    return;
  }

  const catalog = await readCatalog();
  const knownCandidateIds = new Set((catalog.candidates || []).map((candidate) => candidate.id));
  if (!knownCandidateIds.has(candidateId)) {
    sendJson(res, 404, { error: `Unknown candidateId: ${candidateId}` });
    return;
  }

  const scoreError = validateScores(catalog.criteria || [], patch.scores);
  if (scoreError) {
    sendJson(res, 400, { error: scoreError });
    return;
  }

  const { nextCandidateState, nextState } = await enqueueStateMutation(async () => {
    const state = await readState();
    const now = new Date().toISOString();
    const candidateStates = isPlainObject(state.candidateStates) ? state.candidateStates : {};
    const previousCandidateState = isPlainObject(candidateStates[candidateId])
      ? candidateStates[candidateId]
      : {};
    const mergedCandidateState = deepMerge(previousCandidateState, {
      ...patch,
      updatedAt: now
    });

    const mergedState = {
      ...state,
      version: state.version || 1,
      updatedAt: now,
      candidateStates: {
        ...candidateStates,
        [candidateId]: mergedCandidateState
      }
    };

    await writeState(mergedState);
    return {
      nextCandidateState: mergedCandidateState,
      nextState: mergedState
    };
  });

  sendJson(res, 200, {
    ok: true,
    candidateId,
    candidateState: nextCandidateState,
    state: nextState
  });
}

function validateScores(criteria, scores) {
  if (!isPlainObject(scores)) {
    return 'scores must be an object.';
  }

  for (const criterion of criteria) {
    const value = scores[criterion.id];
    if (!Number.isInteger(value) || value < 0 || value > 5) {
      return `${criterion.label || criterion.id} score must be an integer from 0 to 5.`;
    }
  }

  return null;
}

function pageHtml() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>EDDM Eval Board</title>
  <style>
    :root {
      color-scheme: light;
      --bg: #f4f7f5;
      --ink: #17231f;
      --muted: #5d6b66;
      --line: #cbd8d2;
      --soft: #e8efeb;
      --panel: #ffffff;
      --accent: #0f7a55;
      --accent-strong: #075c3e;
      --warn: #a85605;
      --danger: #8f2d2d;
      --shadow: 0 14px 35px rgba(23, 35, 31, 0.1);
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      background: var(--bg);
      color: var(--ink);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      letter-spacing: 0;
    }

    a {
      color: var(--accent-strong);
      text-decoration-thickness: 1px;
      text-underline-offset: 3px;
    }

    button,
    input,
    select,
    textarea {
      font: inherit;
    }

    .shell {
      width: min(1180px, calc(100% - 28px));
      margin: 0 auto;
      padding: 20px 0 44px;
    }

    .topbar {
      display: grid;
      gap: 12px;
      margin-bottom: 18px;
      padding: 18px;
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      box-shadow: var(--shadow);
    }

    h1 {
      margin: 0;
      font-size: clamp(1.55rem, 7vw, 2.4rem);
      line-height: 1.02;
    }

    .lede {
      margin: 0;
      color: var(--muted);
      font-size: 0.98rem;
      line-height: 1.5;
    }

    .meta-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
    }

    .pill {
      display: inline-flex;
      align-items: center;
      min-height: 32px;
      padding: 6px 10px;
      border: 1px solid var(--line);
      border-radius: 999px;
      background: #f9fbfa;
      color: var(--muted);
      font-size: 0.84rem;
      font-weight: 650;
    }

    .toolbar {
      display: grid;
      gap: 10px;
      padding-top: 4px;
    }

    .search-input {
      width: 100%;
      min-height: 42px;
    }

    .group-filters {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding-bottom: 2px;
    }

    .group-button {
      flex: 0 0 auto;
      min-height: 38px;
      border: 1px solid var(--line);
      border-radius: 999px;
      padding: 7px 12px;
      background: #f9fbfa;
      color: var(--muted);
      font-size: 0.82rem;
      font-weight: 800;
      cursor: pointer;
    }

    .group-button.active {
      border-color: var(--accent);
      background: var(--accent);
      color: #fff;
    }

    .empty-results {
      padding: 18px;
      border: 1px dashed var(--line);
      border-radius: 8px;
      background: #fff;
      color: var(--muted);
      line-height: 1.5;
    }

    .candidate-list {
      display: grid;
      gap: 18px;
    }

    .candidate {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      box-shadow: var(--shadow);
      overflow: clip;
    }

    .candidate-header {
      display: grid;
      gap: 10px;
      padding: 18px;
      border-bottom: 1px solid var(--line);
      background: #fbfdfc;
    }

    .candidate-kicker {
      margin: 0;
      color: var(--accent-strong);
      font-size: 0.78rem;
      font-weight: 800;
      text-transform: uppercase;
    }

    .candidate h2 {
      margin: 0;
      font-size: clamp(1.18rem, 5vw, 1.72rem);
      line-height: 1.13;
    }

    .candidate-summary {
      margin: 0;
      color: var(--muted);
      line-height: 1.5;
    }

    .candidate-layout {
      display: grid;
      gap: 18px;
      padding: 18px;
    }

    .decision-panel {
      display: grid;
      gap: 14px;
      align-content: start;
      padding: 14px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: #f8fbf9;
    }

    .control-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
    }

    label {
      display: grid;
      gap: 5px;
      color: var(--muted);
      font-size: 0.78rem;
      font-weight: 750;
    }

    input,
    select,
    textarea {
      width: 100%;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: #fff;
      color: var(--ink);
      min-height: 42px;
      padding: 9px 10px;
      font-size: 0.95rem;
    }

    textarea {
      min-height: 112px;
      resize: vertical;
      line-height: 1.45;
    }

    .save-row {
      display: flex;
      gap: 8px;
      align-items: center;
      justify-content: space-between;
    }

    .save-button {
      min-height: 42px;
      border: 0;
      border-radius: 8px;
      padding: 10px 14px;
      color: #fff;
      background: var(--accent);
      font-weight: 800;
      cursor: pointer;
    }

    .save-button:disabled {
      cursor: default;
      opacity: 0.65;
    }

    .saved-at {
      color: var(--muted);
      font-size: 0.78rem;
      line-height: 1.25;
      text-align: right;
    }

    .content-panel {
      display: grid;
      gap: 16px;
      min-width: 0;
    }

    .notice {
      padding: 12px;
      border-radius: 8px;
      border: 1px solid #e6c99a;
      background: #fff8ea;
      color: #664006;
      line-height: 1.45;
    }

    .asset-grid {
      display: grid;
      gap: 12px;
    }

    .asset-card,
    .asset-row {
      border: 1px solid var(--line);
      border-radius: 8px;
      background: #fff;
      overflow: hidden;
    }

    .asset-card img {
      display: block;
      width: 100%;
      height: auto;
      background: var(--soft);
    }

    .asset-caption,
    .asset-row {
      padding: 10px;
    }

    .asset-caption {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 8px;
      align-items: center;
      color: var(--muted);
      font-size: 0.84rem;
      font-weight: 700;
    }

    .asset-links {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      align-items: center;
      font-size: 0.84rem;
      font-weight: 750;
    }

    .asset-row {
      display: grid;
      gap: 8px;
      line-height: 1.42;
    }

    .inline-preview {
      border-top: 1px solid var(--line);
      padding-top: 8px;
    }

    .inline-preview summary {
      cursor: pointer;
      color: var(--accent-strong);
      font-weight: 800;
    }

    .inline-preview iframe {
      width: 100%;
      height: 260px;
      margin-top: 8px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: #fff;
    }

    .text-list {
      margin: 0;
      padding-left: 18px;
      color: var(--muted);
      line-height: 1.48;
    }

    .text-list li + li {
      margin-top: 5px;
    }

    .empty-assets {
      display: grid;
      gap: 10px;
      padding: 14px;
      border: 1px dashed #d9b46e;
      border-radius: 8px;
      background: #fffaf0;
      color: var(--warn);
      line-height: 1.45;
    }

    .status-error {
      padding: 16px;
      border: 1px solid #e7b1b1;
      border-radius: 8px;
      background: #fff3f3;
      color: var(--danger);
    }

    @media (min-width: 680px) {
      .asset-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (min-width: 940px) {
      .candidate-layout {
        grid-template-columns: minmax(250px, 320px) minmax(0, 1fr);
        align-items: start;
      }

      .decision-panel {
        position: sticky;
        top: 14px;
      }
    }
  </style>
</head>
<body>
  <main class="shell">
    <section class="topbar">
      <h1>EDDM Eval Board</h1>
      <p class="lede">Local-only review board for mailer print proofs, A/B/C planning-copy references, missing proof packages, and QR landing fit. Scores and notes save to disk through the local server.</p>
        <div class="meta-row" id="summaryPills"></div>
        <div style="margin-top: 14px; padding: 12px; border: 1px solid #fecaca; border-radius: 8px; background: #fef2f2; color: #991b1b; font-size: 0.75rem; line-height: 1.25rem; max-width: 320px;">
          <strong style="font-weight: 900; color: #7f1d1d;">NOTE:</strong> this language must be on the bottom of all mailers:<br><br>
          <span style="font-weight: 500; font-style: italic;">
            Smarter Way Wealth, LLC is a Registered Investment Adviser. Fee comparisons are hypothetical and do not
            guarantee future results. Learn more at adviserinfo.sec.gov (CRD #342140).
          </span>
        </div>
      <div class="toolbar">
        <input class="search-input" id="searchInput" type="search" placeholder="Search concepts, groups, notes, assets..." autocomplete="off">
        <div class="group-filters" id="groupFilters" aria-label="Candidate groups"></div>
      </div>
    </section>
    <section class="candidate-list" id="app" aria-live="polite"></section>
  </main>

  <script>
    var criteria = [];
    var decisions = [];
    var catalog = null;
    var state = null;
    var activeGroup = 'all';
    var searchQuery = '';

    function escapeHtml(value) {
      return String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function repoUrl(filePath) {
      return '/repo-file/' + String(filePath).split(/[\\\\/]+/).map(encodeURIComponent).join('/');
    }

    function candidateState(candidateId) {
      return (state && state.candidateStates && state.candidateStates[candidateId]) || {};
    }

    function scoreValue(savedState, criterionId) {
      return savedState.scores && savedState.scores[criterionId] != null
        ? savedState.scores[criterionId]
        : '';
    }

    function renderList(items) {
      if (!items || !items.length) return '';
      return '<ul class="text-list">' + items.map(function(item) {
        return '<li>' + escapeHtml(item) + '</li>';
      }).join('') + '</ul>';
    }

    function renderExternalContents(candidate) {
      if (!candidate.externalContents || !candidate.externalContents.length) return '';
      return '<div class="notice"><strong>External bundle:</strong> ' +
        escapeHtml(candidate.externalPath || 'External path not listed') +
        '<br>' + escapeHtml(candidate.notPreviewableReason || 'Not directly previewable.') +
        renderList(candidate.externalContents) +
        '</div>';
    }

    function renderMissingAssets(candidate) {
      var needed = candidate.missingAssetsNeeded || [];
      if (!needed.length && candidate.assets && candidate.assets.length) return '';

      var label = candidate.status === 'missing-assets'
        ? 'Missing proof package'
        : 'No previewable repo assets listed';

      return '<div class="empty-assets"><strong>' + escapeHtml(label) + '</strong>' +
        (needed.length ? renderList(needed) : '<span>Add repo-root assets to the catalog when available.</span>') +
        '</div>';
    }

    function renderAsset(asset) {
      var url = repoUrl(asset.path);
      var label = escapeHtml(asset.label || asset.path);
      var role = asset.role ? '<span>' + escapeHtml(asset.role) + '</span>' : '';
      var type = String(asset.type || '').toLowerCase();

      if (type === 'image') {
        return '<figure class="asset-card">' +
          '<a href="' + url + '" target="_blank" rel="noreferrer"><img loading="lazy" src="' + url + '" alt="' + label + '"></a>' +
          '<figcaption class="asset-caption"><span>' + label + '</span><span class="asset-links">' + role + '<a href="' + url + '" target="_blank" rel="noreferrer">Open full</a></span></figcaption>' +
          '</figure>';
      }

      var canEmbed = type === 'pdf' || type === 'html' || type === 'markdown';
      var embed = canEmbed
        ? '<details class="inline-preview"><summary>Inline preview</summary><iframe src="' + url + '" title="' + label + '" loading="lazy" scrolling="no"></iframe></details>'
        : '';

      return '<article class="asset-row">' +
        '<strong>' + label + '</strong>' +
        '<span>' + escapeHtml(type || 'file') + (asset.role ? ' - ' + escapeHtml(asset.role) : '') + '</span>' +
        '<div class="asset-links"><a href="' + url + '" target="_blank" rel="noreferrer">Open full</a></div>' +
        embed +
        '</article>';
    }

    function renderAssets(candidate) {
      var assets = candidate.assets || [];
      if (!assets.length) return renderMissingAssets(candidate);
      return '<div class="asset-grid">' + assets.map(renderAsset).join('') + '</div>';
    }

    function renderDecisionPanel(candidate) {
      var savedState = candidateState(candidate.id);
      var selectedDecision = savedState.decision || candidate.suggestedDecision || 'undecided';
      var scoreInputs = criteria.map(function(criterion) {
        return '<label><span>' + escapeHtml(criterion.label) + '</span>' +
          '<input type="number" min="0" max="5" step="1" required inputmode="numeric" data-score="' + escapeHtml(criterion.id) + '" value="' + escapeHtml(scoreValue(savedState, criterion.id)) + '">' +
          '</label>';
      }).join('');

      var decisionOptions = decisions.map(function(decision) {
        var selected = decision === selectedDecision ? ' selected' : '';
        return '<option value="' + escapeHtml(decision) + '"' + selected + '>' + escapeHtml(decision) + '</option>';
      }).join('');

      return '<aside class="decision-panel">' +
        '<label><span>Decision</span><select data-field="decision">' + decisionOptions + '</select></label>' +
        '<div class="control-grid">' + scoreInputs + '</div>' +
        '<label><span>Notes</span><textarea data-field="notes" placeholder="Review notes, revision requests, compliance concerns...">' + escapeHtml(savedState.notes || '') + '</textarea></label>' +
        '<div class="save-row"><button class="save-button" type="button" data-save>Save</button><span class="saved-at" data-saved-at>' + escapeHtml(savedState.updatedAt ? 'Saved ' + savedState.updatedAt : 'Not saved yet') + '</span></div>' +
        '</aside>';
    }

    function renderCandidate(candidate) {
      var statusPill = '<span class="pill">' + escapeHtml(candidate.status || 'unknown') + '</span>';
      var variantPill = candidate.variant ? '<span class="pill">' + escapeHtml(candidate.variant) + '</span>' : '';

      return '<article class="candidate" data-candidate-id="' + escapeHtml(candidate.id) + '">' +
        '<header class="candidate-header">' +
          '<p class="candidate-kicker">' + escapeHtml(candidate.group || 'Candidate') + '</p>' +
          '<h2>' + escapeHtml(candidate.name) + '</h2>' +
          '<p class="candidate-summary">' + escapeHtml(candidate.summary || '') + '</p>' +
          '<div class="meta-row">' + statusPill + variantPill + '</div>' +
        '</header>' +
        '<div class="candidate-layout">' +
          renderDecisionPanel(candidate) +
          '<section class="content-panel">' +
            renderExternalContents(candidate) +
            renderAssets(candidate) +
            (candidate.reviewFocus && candidate.reviewFocus.length ? '<section><h3>Review focus</h3>' + renderList(candidate.reviewFocus) + '</section>' : '') +
            (candidate.knownLimitations && candidate.knownLimitations.length ? '<section><h3>Known limitations</h3>' + renderList(candidate.knownLimitations) + '</section>' : '') +
          '</section>' +
        '</div>' +
      '</article>';
    }

    function candidateSearchText(candidate) {
      return JSON.stringify(candidate).toLowerCase();
    }

    function groupCounts(candidates) {
      return candidates.reduce(function(map, candidate) {
        var group = candidate.group || 'Ungrouped';
        map[group] = (map[group] || 0) + 1;
        return map;
      }, {});
    }

    function filteredCandidates() {
      var candidates = catalog.candidates || [];
      var query = searchQuery.trim().toLowerCase();
      return candidates.filter(function(candidate) {
        var groupMatches = activeGroup === 'all' || (candidate.group || 'Ungrouped') === activeGroup;
        var queryMatches = !query || candidateSearchText(candidate).includes(query);
        return groupMatches && queryMatches;
      });
    }

    function renderGroupFilters() {
      var candidates = catalog.candidates || [];
      var counts = groupCounts(candidates);
      var groups = Object.keys(counts);
      var buttons = [
        '<button class="group-button' + (activeGroup === 'all' ? ' active' : '') + '" type="button" data-group="all">All (' + candidates.length + ')</button>'
      ];

      groups.forEach(function(group) {
        buttons.push(
          '<button class="group-button' + (activeGroup === group ? ' active' : '') + '" type="button" data-group="' + escapeHtml(group) + '">' +
          escapeHtml(group) + ' (' + counts[group] + ')' +
          '</button>'
        );
      });

      document.getElementById('groupFilters').innerHTML = buttons.join('');
    }

    function renderSummary() {
      var candidates = catalog.candidates || [];
      var missing = candidates.filter(function(candidate) {
        return candidate.status === 'missing-assets';
      }).length;
      var external = candidates.filter(function(candidate) {
        return candidate.status === 'external-reference';
      }).length;

      document.getElementById('summaryPills').innerHTML =
        '<span class="pill">' + candidates.length + ' catalog entries</span>' +
        '<span class="pill">' + Object.keys(groupCounts(candidates)).length + ' groups</span>' +
        '<span class="pill">' + missing + ' missing proof packages</span>' +
        '<span class="pill">' + external + ' external bundle reference</span>' +
        '<span class="pill">State: docs/eddm-evals/state.json</span>';
    }

    function render() {
      criteria = catalog.criteria || [];
      decisions = catalog.decisionOptions || ['undecided', 'finalist', 'revise', 'reject', 'missing-assets'];
      renderSummary();
      renderGroupFilters();
      var visibleCandidates = filteredCandidates();
      document.getElementById('app').innerHTML = visibleCandidates.length
        ? visibleCandidates.map(renderCandidate).join('')
        : '<div class="empty-results">No EDDM candidates match the current filters.</div>';
    }

    function collectPatch(card) {
      var scores = {};
      card.querySelectorAll('[data-score]').forEach(function(input) {
        var raw = input.value.trim();
        scores[input.getAttribute('data-score')] = Number(raw);
      });

      return {
        decision: card.querySelector('[data-field="decision"]').value,
        scores: scores,
        notes: card.querySelector('[data-field="notes"]').value
      };
    }

    function markDirty(card) {
      var button = card.querySelector('[data-save]');
      var savedAt = card.querySelector('[data-saved-at]');
      button.disabled = false;
      button.textContent = 'Save';
      savedAt.textContent = 'Unsaved changes';
    }

    async function saveCandidate(card) {
      var candidateId = card.getAttribute('data-candidate-id');
      var button = card.querySelector('[data-save]');
      var savedAt = card.querySelector('[data-saved-at]');
      var invalidInput = card.querySelector('[data-score]:invalid');
      if (invalidInput) {
        invalidInput.focus();
        savedAt.textContent = 'Enter all scores from 0 to 5 before saving.';
        return;
      }

      button.disabled = true;
      button.textContent = 'Saving...';

      var response = await fetch('/api/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId: candidateId,
          patch: collectPatch(card)
        })
      });

      var payload = await response.json();
      if (!response.ok) {
        button.disabled = false;
        button.textContent = 'Save';
        savedAt.textContent = payload.error || 'Save failed';
        return;
      }

      state = payload.state;
      button.textContent = 'Saved';
      savedAt.textContent = 'Saved ' + payload.candidateState.updatedAt;
    }

    async function boot() {
      try {
        var catalogResponse = await fetch('/api/catalog');
        var stateResponse = await fetch('/api/state');
        catalog = await catalogResponse.json();
        state = await stateResponse.json();
        render();

        document.getElementById('searchInput').addEventListener('input', function(event) {
          searchQuery = event.target.value || '';
          render();
        });

        document.getElementById('groupFilters').addEventListener('click', function(event) {
          var button = event.target.closest('[data-group]');
          if (!button) return;
          activeGroup = button.getAttribute('data-group') || 'all';
          render();
        });

        document.getElementById('app').addEventListener('input', function(event) {
          var card = event.target.closest('.candidate');
          if (card) markDirty(card);
        });

        document.getElementById('app').addEventListener('change', function(event) {
          var card = event.target.closest('.candidate');
          if (card) markDirty(card);
        });

        document.getElementById('app').addEventListener('click', function(event) {
          var saveButton = event.target.closest('[data-save]');
          if (!saveButton) return;
          var card = saveButton.closest('.candidate');
          if (card) saveCandidate(card).catch(function(error) {
            saveButton.disabled = false;
            saveButton.textContent = 'Save';
            card.querySelector('[data-saved-at]').textContent = error.message || 'Save failed';
          });
        });
      } catch (error) {
        document.getElementById('app').innerHTML = '<div class="status-error"><strong>Unable to load EDDM eval board.</strong><br>' + escapeHtml(error.message || error) + '</div>';
      }
    }

    boot();
  </script>
</body>
</html>`;
}

async function handleRequest(req, res) {
  const url = new URL(req.url, `http://${publicHost}`);

  if (req.method === 'GET' && url.pathname === '/') {
    send(res, 200, pageHtml(), {
      'Content-Type': 'text/html; charset=utf-8'
    });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/catalog') {
    sendJson(res, 200, await readCatalog());
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/state') {
    sendJson(res, 200, await readState());
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/state') {
    await updateCandidateState(req, res);
    return;
  }

  if ((req.method === 'GET' || req.method === 'HEAD') && url.pathname.startsWith('/repo-file/')) {
    await serveRepoFile(req, res, url);
    return;
  }

  sendJson(res, 404, { error: 'Not found.' });
}

const port = parsePort(process.argv.slice(2));

const server = http.createServer((req, res) => {
  handleRequest(req, res).catch((error) => {
    console.error(error);
    if (!res.headersSent) {
      sendJson(res, 500, { error: error.message || 'Internal server error.' });
    } else {
      res.end();
    }
  });
});

server.listen(port, HOST, () => {
  console.log('EDDM eval board ready.');
  console.log(`URL: http://${publicHost}:${port}/`);
  console.log(`Catalog: ${catalogPath}`);
  console.log(`State: ${statePath}`);
});
