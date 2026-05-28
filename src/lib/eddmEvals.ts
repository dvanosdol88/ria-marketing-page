import fs from "fs/promises";
import path from "path";

import { getAdminDb } from "@/lib/firebaseAdmin";

export type EddmCriterion = {
  id: string;
  label: string;
};

export type EddmAsset = {
  label: string;
  type: "image" | "html" | "markdown" | "pdf" | "json" | string;
  path: string;
  role?: string;
};

export type EddmCandidate = {
  id: string;
  group: string;
  variant?: string;
  name: string;
  status: string;
  suggestedDecision?: string;
  summary?: string;
  reviewFocus?: string[];
  knownLimitations?: string[];
  missingAssetsNeeded?: string[];
  externalPath?: string;
  notPreviewableReason?: string;
  externalContents?: string[];
  assets?: EddmAsset[];
};

export type EddmCatalog = {
  version: number;
  updatedAt: string;
  title: string;
  description: string;
  criteria: EddmCriterion[];
  decisionOptions: string[];
  candidates: EddmCandidate[];
};

export type EddmCandidateState = {
  decision?: string;
  scores?: Record<string, number>;
  notes?: string;
  updatedAt?: string;
};

export type EddmState = {
  version: number;
  updatedAt: string | null;
  candidateStates: Record<string, EddmCandidateState>;
  persistence?: "firestore" | "local-fallback";
};

const catalogPath = path.join(process.cwd(), "docs", "eddm-evals", "catalog.json");
const statePath = path.join(process.cwd(), "docs", "eddm-evals", "state.json");
const firestoreDocPath = "evals/eddm-public-state";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export async function readEddmCatalog(): Promise<EddmCatalog> {
  const raw = await fs.readFile(catalogPath, "utf8");
  return JSON.parse(raw) as EddmCatalog;
}

async function readLocalState(): Promise<EddmState> {
  try {
    const raw = await fs.readFile(statePath, "utf8");
    const parsed = JSON.parse(raw) as EddmState;
    return {
      version: parsed.version || 1,
      updatedAt: parsed.updatedAt || null,
      candidateStates: isPlainObject(parsed.candidateStates)
        ? (parsed.candidateStates as Record<string, EddmCandidateState>)
        : {},
      persistence: "local-fallback",
    };
  } catch {
    return {
      version: 1,
      updatedAt: null,
      candidateStates: {},
      persistence: "local-fallback",
    };
  }
}

export async function readEddmState(): Promise<EddmState> {
  try {
    const localState = await readLocalState();
    const snap = await getAdminDb().doc(firestoreDocPath).get();
    if (!snap.exists) {
      return {
        ...localState,
        persistence: "firestore",
      };
    }

    const data = snap.data() as Partial<EddmState> | undefined;
    const persistedCandidateStates = isPlainObject(data?.candidateStates)
      ? (data?.candidateStates as Record<string, EddmCandidateState>)
      : {};

    return {
      version: data?.version || 1,
      updatedAt: data?.updatedAt || null,
      candidateStates: {
        ...localState.candidateStates,
        ...persistedCandidateStates,
      },
      persistence: "firestore",
    };
  } catch (error) {
    console.warn("EDDM eval state falling back to local state:", error);
    return readLocalState();
  }
}

export function validateEddmStatePatch(
  catalog: EddmCatalog,
  candidateId: string,
  patch: unknown
): { ok: true; patch: EddmCandidateState } | { ok: false; error: string; status: number } {
  if (!catalog.candidates.some((candidate) => candidate.id === candidateId)) {
    return { ok: false, error: `Unknown candidateId: ${candidateId}`, status: 404 };
  }

  if (!isPlainObject(patch)) {
    return { ok: false, error: "patch must be an object", status: 400 };
  }

  const nextPatch: EddmCandidateState = {};

  if ("decision" in patch) {
    if (typeof patch.decision !== "string" || !catalog.decisionOptions.includes(patch.decision)) {
      return { ok: false, error: "decision is invalid", status: 400 };
    }
    nextPatch.decision = patch.decision;
  }

  if ("notes" in patch) {
    if (typeof patch.notes !== "string") {
      return { ok: false, error: "notes must be a string", status: 400 };
    }
    if (patch.notes.length > 12000) {
      return { ok: false, error: "notes are too long", status: 400 };
    }
    nextPatch.notes = patch.notes;
  }

  if ("scores" in patch) {
    if (!isPlainObject(patch.scores)) {
      return { ok: false, error: "scores must be an object", status: 400 };
    }

    const scores: Record<string, number> = {};
    for (const criterion of catalog.criteria) {
      const value = patch.scores[criterion.id];
      if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > 5) {
        return {
          ok: false,
          error: `${criterion.label || criterion.id} score must be an integer from 0 to 5`,
          status: 400,
        };
      }
      scores[criterion.id] = value;
    }
    nextPatch.scores = scores;
  }

  return { ok: true, patch: nextPatch };
}

export async function updateEddmCandidateState(
  candidateId: string,
  patch: EddmCandidateState
): Promise<EddmState> {
  const now = new Date().toISOString();
  const localState = await readLocalState();
  const db = getAdminDb();
  const docRef = db.doc(firestoreDocPath);

  return db.runTransaction(async (transaction) => {
    const snap = await transaction.get(docRef);
    const current = snap.exists ? ((snap.data() || {}) as Partial<EddmState>) : {};
    const currentCandidateStates = isPlainObject(current.candidateStates)
      ? (current.candidateStates as Record<string, EddmCandidateState>)
      : {};
    const mergedCandidateStates = {
      ...localState.candidateStates,
      ...currentCandidateStates,
    };
    const previousCandidateState = isPlainObject(mergedCandidateStates[candidateId])
      ? mergedCandidateStates[candidateId]
      : {};

    const nextState: EddmState = {
      version: current.version || 1,
      updatedAt: now,
      candidateStates: {
        ...mergedCandidateStates,
        [candidateId]: {
          ...previousCandidateState,
          ...patch,
          updatedAt: now,
        },
      },
      persistence: "firestore",
    };

    transaction.set(docRef, nextState, { merge: true });
    return nextState;
  });
}

export async function seedEddmStateIfEmpty() {
  const docRef = getAdminDb().doc(firestoreDocPath);
  const snap = await docRef.get();
  if (snap.exists) return;

  const localState = await readLocalState();
  await docRef.set({
    version: localState.version || 1,
    updatedAt: new Date().toISOString(),
    candidateStates: localState.candidateStates || {},
  });
}
