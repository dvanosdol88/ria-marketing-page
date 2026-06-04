"use client";

import { useEffect, useMemo, useState } from "react";

type EddmCriterion = {
  id: string;
  label: string;
};

type EddmAsset = {
  label: string;
  type: string;
  path: string;
  role?: string;
};

type EddmCandidate = {
  id: string;
  group: string;
  variant?: string;
  name: string;
  status: string;
  suggestedDecision?: string;
  summary?: string;
  reviewFocus?: string[];
  knownLimitations?: string[];
  externalPath?: string;
  notPreviewableReason?: string;
  externalContents?: string[];
  assets?: EddmAsset[];
};

type EddmCatalog = {
  title: string;
  description: string;
  criteria: EddmCriterion[];
  decisionOptions: string[];
  candidates: EddmCandidate[];
};

type CandidateState = {
  decision?: string;
  scores?: Record<string, number>;
  notes?: string;
  updatedAt?: string;
};

type EddmState = {
  updatedAt: string | null;
  candidateStates: Record<string, CandidateState>;
  persistence?: "firestore" | "local-fallback";
};

function fileUrl(filePath: string) {
  return `/api/eddm-evals/file/${filePath.split(/[\\/]+/).map(encodeURIComponent).join("/")}`;
}

function groupCounts(candidates: EddmCandidate[]) {
  return candidates.reduce<Record<string, number>>((counts, candidate) => {
    counts[candidate.group] = (counts[candidate.group] || 0) + 1;
    return counts;
  }, {});
}

function isLegacyCandidate(candidate: EddmCandidate) {
  return candidate.status === "legacy";
}

function candidateSearchText(candidate: EddmCandidate) {
  return JSON.stringify(candidate).toLowerCase();
}

function candidateState(state: EddmState | null, candidateId: string) {
  return state?.candidateStates?.[candidateId] || {};
}

function AssetCard({ asset }: { asset: EddmAsset }) {
  const url = fileUrl(asset.path);
  const type = asset.type.toLowerCase();

  if (type === "image") {
    return (
      <figure className="overflow-hidden rounded-lg border border-[#CBD8D2] bg-white">
        <a href={url} target="_blank" rel="noreferrer">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt={asset.label} loading="lazy" className="block h-auto w-full bg-[#E8EFEB]" />
        </a>
        <figcaption className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-xs font-bold text-[#5D6B66]">
          <span>{asset.label}</span>
          <span className="flex items-center gap-3">
            {asset.role ? <span>{asset.role}</span> : null}
            <a href={url} target="_blank" rel="noreferrer" className="!text-[#075C3E]">
              Open
            </a>
          </span>
        </figcaption>
      </figure>
    );
  }

  const canPreview = ["html", "markdown", "pdf"].includes(type);

  return (
    <article className="rounded-lg border border-[#CBD8D2] bg-white p-3 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-black text-[#17231F]">{asset.label}</p>
          <p className="mt-1 text-xs font-bold text-[#5D6B66]">
            {asset.type}
            {asset.role ? ` - ${asset.role}` : ""}
          </p>
        </div>
        <a href={url} target="_blank" rel="noreferrer" className="text-sm font-black !text-[#075C3E]">
          Open
        </a>
      </div>
      {canPreview ? (
        <details className="mt-3 border-t border-[#CBD8D2] pt-2">
          <summary className="cursor-pointer text-xs font-black text-[#075C3E]">Inline preview</summary>
          <iframe
            src={url}
            title={asset.label}
            loading="lazy"
            className="mt-2 h-[280px] w-full rounded-md border border-[#CBD8D2] bg-white"
          />
        </details>
      ) : null}
    </article>
  );
}

function TextList({ items }: { items?: string[] }) {
  if (!items?.length) return null;
  return (
    <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-[#5D6B66]">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function CandidateCard({
  candidate,
  catalog,
  state,
  onState,
}: {
  candidate: EddmCandidate;
  catalog: EddmCatalog;
  state: EddmState | null;
  onState: (state: EddmState) => void;
}) {
  const savedState = candidateState(state, candidate.id);
  const [decision, setDecision] = useState(savedState.decision || candidate.suggestedDecision || "undecided");
  const [scores, setScores] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      catalog.criteria.map((criterion) => [
        criterion.id,
        savedState.scores?.[criterion.id] == null ? "" : String(savedState.scores[criterion.id]),
      ])
    )
  );
  const [notes, setNotes] = useState(savedState.notes || "");
  const [saveStatus, setSaveStatus] = useState(savedState.updatedAt ? `Saved ${savedState.updatedAt}` : "Not saved yet");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const nextState = candidateState(state, candidate.id);
    setDecision(nextState.decision || candidate.suggestedDecision || "undecided");
    setScores(
      Object.fromEntries(
        catalog.criteria.map((criterion) => [
          criterion.id,
          nextState.scores?.[criterion.id] == null ? "" : String(nextState.scores[criterion.id]),
        ])
      )
    );
    setNotes(nextState.notes || "");
    setSaveStatus(nextState.updatedAt ? `Saved ${nextState.updatedAt}` : "Not saved yet");
  }, [candidate.id, candidate.suggestedDecision, catalog.criteria, state]);

  const markDirty = () => setSaveStatus("Unsaved changes");

  const save = async () => {
    const numericScores: Record<string, number> = {};
    for (const criterion of catalog.criteria) {
      const value = Number(scores[criterion.id]);
      if (!Number.isInteger(value) || value < 0 || value > 5) {
        setSaveStatus("Enter all scores from 0 to 5 before saving.");
        return;
      }
      numericScores[criterion.id] = value;
    }

    setSaving(true);
    setSaveStatus("Saving...");
    const response = await fetch("/api/eddm-evals/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        candidateId: candidate.id,
        patch: {
          decision,
          scores: numericScores,
          notes,
        },
      }),
    });

    const payload = await response.json();
    setSaving(false);

    if (!response.ok) {
      setSaveStatus(payload.error || "Save failed");
      return;
    }

    onState(payload.state);
    setSaveStatus(`Saved ${payload.candidateState.updatedAt}`);
  };

  return (
    <article className="overflow-hidden rounded-lg border border-[#CBD8D2] bg-white shadow-[0_14px_35px_rgba(23,35,31,0.1)]">
      <header className="border-b border-[#CBD8D2] bg-[#FBFDFC] p-4 sm:p-5">
        <p className="text-xs font-black uppercase text-[#075C3E]">{candidate.group}</p>
        <h2 className="mt-2 text-xl font-black leading-tight text-[#17231F] sm:text-2xl">{candidate.name}</h2>
        {candidate.summary ? <p className="mt-2 text-sm leading-6 text-[#5D6B66]">{candidate.summary}</p> : null}
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full border border-[#CBD8D2] bg-[#F9FBFA] px-3 py-1 text-xs font-black text-[#5D6B66]">
            {candidate.status}
          </span>
          {candidate.variant ? (
            <span className="rounded-full border border-[#CBD8D2] bg-[#F9FBFA] px-3 py-1 text-xs font-black text-[#5D6B66]">
              {candidate.variant}
            </span>
          ) : null}
        </div>
      </header>

      <div className="grid gap-4 p-4 lg:grid-cols-[minmax(250px,320px)_minmax(0,1fr)] lg:p-5">
        <aside className="grid content-start gap-4 rounded-lg border border-[#CBD8D2] bg-[#F8FBF9] p-3 lg:sticky lg:top-4">
          <label className="grid gap-1 text-xs font-black text-[#5D6B66]">
            Decision
            <select
              value={decision}
              onChange={(event) => {
                setDecision(event.target.value);
                markDirty();
              }}
              className="min-h-10 rounded-md border border-[#CBD8D2] bg-white px-2 text-sm text-[#17231F]"
            >
              {catalog.decisionOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-2">
            {catalog.criteria.map((criterion) => (
              <label key={criterion.id} className="grid gap-1 text-xs font-black text-[#5D6B66]">
                {criterion.label}
                <input
                  type="number"
                  min={0}
                  max={5}
                  step={1}
                  inputMode="numeric"
                  value={scores[criterion.id] || ""}
                  onChange={(event) => {
                    setScores((current) => ({ ...current, [criterion.id]: event.target.value }));
                    markDirty();
                  }}
                  className="min-h-10 rounded-md border border-[#CBD8D2] bg-white px-2 text-sm text-[#17231F]"
                />
              </label>
            ))}
          </div>

          <label className="grid gap-1 text-xs font-black text-[#5D6B66]">
            Notes
            <textarea
              value={notes}
              onChange={(event) => {
                setNotes(event.target.value);
                markDirty();
              }}
              className="min-h-28 resize-y rounded-md border border-[#CBD8D2] bg-white p-2 text-sm leading-6 text-[#17231F]"
              placeholder="Review notes, revision requests, compliance concerns..."
            />
          </label>

          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="min-h-10 rounded-md bg-[#0F7A55] px-4 text-sm font-black text-white disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <span className="text-right text-xs font-bold leading-5 text-[#5D6B66]">{saveStatus}</span>
          </div>
        </aside>

        <section className="grid min-w-0 gap-4">
          {candidate.externalPath ? (
            <div className="rounded-lg border border-[#E6C99A] bg-[#FFF8EA] p-3 text-sm leading-6 text-[#664006]">
              <p className="font-black">External bundle: {candidate.externalPath}</p>
              {candidate.notPreviewableReason ? <p>{candidate.notPreviewableReason}</p> : null}
              <TextList items={candidate.externalContents} />
            </div>
          ) : null}

          {candidate.assets?.length ? (
            <div className="grid gap-3 md:grid-cols-2">
              {candidate.assets.map((asset) => (
                <AssetCard key={`${candidate.id}-${asset.path}-${asset.role || asset.label}`} asset={asset} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-[#D9B46E] bg-[#FFFAF0] p-3 text-sm font-bold text-[#A85605]">
              No previewable repo assets listed.
            </div>
          )}

          {candidate.reviewFocus?.length ? (
            <section>
              <h3 className="mb-2 text-sm font-black text-[#17231F]">Review focus</h3>
              <TextList items={candidate.reviewFocus} />
            </section>
          ) : null}

          {candidate.knownLimitations?.length ? (
            <section>
              <h3 className="mb-2 text-sm font-black text-[#17231F]">Known limitations</h3>
              <TextList items={candidate.knownLimitations} />
            </section>
          ) : null}
        </section>
      </div>
    </article>
  );
}

export function EddmEvalClient() {
  const [catalog, setCatalog] = useState<EddmCatalog | null>(null);
  const [state, setState] = useState<EddmState | null>(null);
  const [activeGroup, setActiveGroup] = useState("all");
  const [query, setQuery] = useState("");
  const [showLegacy, setShowLegacy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [catalogResponse, stateResponse] = await Promise.all([
          fetch("/api/eddm-evals/catalog", { cache: "no-store" }),
          fetch("/api/eddm-evals/state", { cache: "no-store" }),
        ]);

        if (!catalogResponse.ok) throw new Error("Catalog failed to load");
        if (!stateResponse.ok) throw new Error("State failed to load");

        setCatalog(await catalogResponse.json());
        setState(await stateResponse.json());
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : String(loadError));
      }
    }

    load();
  }, []);

  const displayCandidates = useMemo(() => {
    if (!catalog) return [];
    return showLegacy ? catalog.candidates : catalog.candidates.filter((candidate) => !isLegacyCandidate(candidate));
  }, [catalog, showLegacy]);

  const visibleCandidates = useMemo(() => {
    if (!catalog) return [];
    const normalizedQuery = query.trim().toLowerCase();
    return displayCandidates.filter((candidate) => {
      const groupMatches = activeGroup === "all" || candidate.group === activeGroup;
      const queryMatches = !normalizedQuery || candidateSearchText(candidate).includes(normalizedQuery);
      return groupMatches && queryMatches;
    });
  }, [activeGroup, catalog, displayCandidates, query]);

  if (error) {
    return (
      <main className="min-h-screen bg-[#F4F7F5] p-4 text-[#17231F]">
        <div className="mx-auto max-w-3xl rounded-lg border border-red-200 bg-white p-5 text-red-800">
          <h1 className="text-xl font-black">Unable to load EDDM evals</h1>
          <p className="mt-2">{error}</p>
        </div>
      </main>
    );
  }

  if (!catalog || !state) {
    return <main className="min-h-screen bg-[#F4F7F5] p-4 text-[#17231F]">Loading EDDM evals...</main>;
  }

  const counts = groupCounts(displayCandidates);
  const groups = Object.keys(counts);
  const activeCount = catalog.candidates.filter((candidate) => !isLegacyCandidate(candidate)).length;
  const legacyCount = catalog.candidates.length - activeCount;
  const frontBackCount = displayCandidates.filter((candidate) =>
    candidate.assets?.some((asset) => asset.role === "front" || asset.role === "reference-front")
  ).length;

  return (
    <main className="min-h-screen bg-[#F4F7F5] text-[#17231F]">
      <section className="mx-auto grid w-[min(1180px,calc(100%-28px))] gap-5 py-5">
        <header className="grid gap-4 rounded-lg border border-[#CBD8D2] bg-white p-4 shadow-[0_14px_35px_rgba(23,35,31,0.1)] sm:p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-black uppercase text-[#075C3E]">EDDM eval board</p>
              <h1 className="mt-1 text-3xl font-black leading-tight sm:text-4xl">{catalog.title}</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[#5D6B66]">{catalog.description}</p>
            </div>
            <div className="max-w-xs shrink-0 rounded-lg border border-red-200 bg-red-50 p-3 text-xs leading-5 text-red-800">
              <strong className="font-black text-red-900">NOTE:</strong> this language must be on the bottom of all mailers:
              <br />
              <br />
              <span className="font-medium italic">
                Smarter Way Wealth, LLC is a Registered Investment Adviser. Fee comparisons are hypothetical and do not
                guarantee future results. Learn more at adviserinfo.sec.gov (CRD #342140).
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-[#CBD8D2] bg-[#F9FBFA] px-3 py-1 text-xs font-black text-[#5D6B66]">
              {activeCount} active catalog entries
            </span>
            <button
              type="button"
              onClick={() => setShowLegacy((current) => !current)}
              className={`rounded-full border px-3 py-1 text-xs font-black ${
                showLegacy
                  ? "border-[#0F7A55] bg-[#0F7A55] text-white"
                  : "border-[#CBD8D2] bg-[#F9FBFA] text-[#5D6B66]"
              }`}
            >
              {showLegacy ? "Showing legacy" : `Legacy hidden (${legacyCount})`}
            </button>
            <span className="rounded-full border border-[#CBD8D2] bg-[#F9FBFA] px-3 py-1 text-xs font-black text-[#5D6B66]">
              {frontBackCount} scoreable proof rows
            </span>
            <span className="rounded-full border border-[#CBD8D2] bg-[#F9FBFA] px-3 py-1 text-xs font-black text-[#5D6B66]">
              Persistence: {state.persistence || "firestore"}
            </span>
          </div>

          <div className="grid gap-3">
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search concepts, groups, notes, assets..."
              className="min-h-11 rounded-md border border-[#CBD8D2] bg-white px-3 text-sm"
            />
            <div className="flex gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setActiveGroup("all")}
                className={`min-h-10 shrink-0 rounded-full border px-3 text-xs font-black ${
                  activeGroup === "all"
                    ? "border-[#0F7A55] bg-[#0F7A55] text-white"
                    : "border-[#CBD8D2] bg-[#F9FBFA] text-[#5D6B66]"
                }`}
              >
                All ({displayCandidates.length})
              </button>
              {groups.map((group) => (
                <button
                  key={group}
                  type="button"
                  onClick={() => setActiveGroup(group)}
                  className={`min-h-10 shrink-0 rounded-full border px-3 text-xs font-black ${
                    activeGroup === group
                      ? "border-[#0F7A55] bg-[#0F7A55] text-white"
                      : "border-[#CBD8D2] bg-[#F9FBFA] text-[#5D6B66]"
                  }`}
                >
                  {group} ({counts[group]})
                </button>
              ))}
            </div>
          </div>
        </header>

        {visibleCandidates.length ? (
          <section className="grid gap-5">
            {visibleCandidates.map((candidate) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                catalog={catalog}
                state={state}
                onState={setState}
              />
            ))}
          </section>
        ) : (
          <div className="rounded-lg border border-dashed border-[#CBD8D2] bg-white p-5 text-sm text-[#5D6B66]">
            No EDDM candidates match the current filters.
          </div>
        )}
      </section>
    </main>
  );
}
