"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Share2 } from "lucide-react";

interface QuizOption {
  id: string;
  label: string;
}

const quizOptions: QuizOption[] = [
  { id: "retire-early", label: "Retire Early" },
  { id: "vacation-home", label: "Vacation Home" },
  { id: "give-to-advisor", label: "Give to my advisor!" },
  { id: "invest-it", label: "Invest it" },
  { id: "pay-off-mortgage", label: "Pay off mortgage" },
  { id: "other", label: "Other" },
];

function getPercentage(id: string, counts: Record<string, number>): number {
  const total = Object.values(counts).reduce((sum, n) => sum + n, 0);
  if (total === 0) return 0;
  return Math.round(((counts[id] ?? 0) / total) * 100);
}

async function submitVoteToApi(optionId: string): Promise<Record<string, number>> {
  const response = await fetch("/api/quiz/vote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ vote: optionId }),
  });

  if (!response.ok) {
    throw new Error("Vote failed");
  }

  const data = await response.json();
  return data.counts || {};
}

async function fetchVoteCounts(): Promise<Record<string, number>> {
  const response = await fetch("/api/quiz/vote", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Failed to fetch votes");
  }

  const data = await response.json();
  return data.counts || {};
}

export function Quiz() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmittingOption, setIsSubmittingOption] = useState<string | null>(null);
  const [voteCounts, setVoteCounts] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);

  const loadCounts = useCallback(async () => {
    try {
      const counts = await fetchVoteCounts();
      setVoteCounts(counts);
    } catch {
      // Silently degrade to no-percentage UI
    }
  }, []);

  useEffect(() => {
    void loadCounts();
  }, [loadCounts]);

  const hasVoted = selectedOption !== null;

  const percentages = useMemo(() => {
    const map: Record<string, number> = {};
    for (const option of quizOptions) {
      map[option.id] = getPercentage(option.id, voteCounts);
    }
    return map;
  }, [voteCounts]);

  const winningOptionId = useMemo(() => {
    if (!hasVoted) return null;

    let winnerId: string | null = null;
    let maxVotes = -1;

    for (const option of quizOptions) {
      const count = voteCounts[option.id] ?? 0;
      if (count > maxVotes) {
        maxVotes = count;
        winnerId = option.id;
      }
    }

    return winnerId;
  }, [hasVoted, voteCounts]);

  const handleVote = async (optionId: string) => {
    if (isSubmittingOption || hasVoted) return;

    setError(null);
    setIsSubmittingOption(optionId);

    try {
      const counts = await submitVoteToApi(optionId);
      setVoteCounts(counts);
      setSelectedOption(optionId);
    } catch (voteError) {
      console.error("Vote submission error:", voteError);
      setError("Could not submit vote. Please try again.");
    } finally {
      setIsSubmittingOption(null);
    }
  };

  if (!isExpanded) {
    return (
      <div className="text-center">
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className="text-sm font-semibold text-brand-700 underline decoration-brand-300 underline-offset-4 transition-colors hover:text-brand-800"
        >
          Show Poll
        </button>
      </div>
    );
  }

  return (
    <section className="mx-auto w-full max-w-3xl rounded-2xl border border-brand-100 bg-[#E8F5E9] p-4 shadow-sm sm:p-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900">Quick poll</h3>
          <p className="mt-1 text-sm text-neutral-600">What would you do with your savings?</p>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(false)}
          className="text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-700"
        >
          Hide ✕
        </button>
      </div>

      <div className="grid grid-cols-1 gap-2 min-[480px]:grid-cols-2">
        {quizOptions.map((option) => {
          const isSelected = selectedOption === option.id;
          const isWinner = hasVoted && winningOptionId === option.id;
          const isSubmitting = isSubmittingOption === option.id;
          const percentage = percentages[option.id] ?? 0;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => void handleVote(option.id)}
              disabled={Boolean(isSubmittingOption) || hasVoted}
              className={`group relative overflow-hidden rounded-xl border px-3 py-3 text-left transition-all ${
                hasVoted
                  ? "cursor-default border-neutral-200 bg-white"
                  : "border-neutral-200 bg-white hover:border-brand-300 hover:shadow-sm"
              } ${isSelected ? "ring-2 ring-brand-400" : ""}`}
            >
              {hasVoted && (
                <div
                  className={`absolute inset-y-0 left-0 transition-all duration-700 ${
                    isWinner ? "bg-brand-300/45" : "bg-brand-200/35"
                  }`}
                  style={{ width: `${percentage}%` }}
                  aria-hidden="true"
                />
              )}

              <div className="relative z-10 flex items-center justify-between gap-2">
                <span className="font-medium text-neutral-900">{option.label}</span>

                {isSubmitting ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Submitting...
                  </span>
                ) : hasVoted ? (
                  <span className="text-sm font-semibold text-neutral-700">{percentage}%</span>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {hasVoted && (
        <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
          Thanks for voting!
          <Share2 className="h-4 w-4" />
        </div>
      )}
    </section>
  );
}
