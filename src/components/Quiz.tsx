"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Loader2, Share2 } from "lucide-react";
import { formatCurrencyFloored } from "@/lib/format";

interface QuizOption {
  id: string;
  label: string;
}

const quizOptions: QuizOption[] = [
  { id: "retire-early", label: "Retire Earlier" },
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

type QuizProps = {
  savings?: number;
  onShare?: () => void;
  shareButtonLabel?: string;
};

export function Quiz({ savings = 0, onShare, shareButtonLabel }: QuizProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmittingOption, setIsSubmittingOption] = useState<string | null>(null);
  const [voteCounts, setVoteCounts] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [fallbackShareFeedback, setFallbackShareFeedback] = useState<"idle" | "success" | "error">("idle");

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
  const formattedSavings = formatCurrencyFloored(savings);
  const hasSavingsValue = savings > 0;
  const effectiveShareLabel =
    shareButtonLabel ??
    (fallbackShareFeedback === "success"
      ? "Copied"
      : fallbackShareFeedback === "error"
        ? "Sharing unavailable"
        : "Share your result");
  const shareCopy = effectiveShareLabel === "Share your result" ? "Share result" : effectiveShareLabel;
  const ShareIcon = effectiveShareLabel === "Copied" ? Check : Share2;

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

  const handleShare = async () => {
    if (onShare) {
      onShare();
      return;
    }

    if (typeof window === "undefined" || typeof navigator === "undefined") return;

    const shareText = hasSavingsValue
      ? `My Smarter Way Wealth calculator result: ${formattedSavings}\n${window.location.href}`
      : window.location.href;

    try {
      if (typeof navigator.share === "function") {
        await navigator.share({
          title: "Smarter Way Wealth projection",
          text: shareText,
        });
      } else {
        await navigator.clipboard.writeText(shareText);
      }
      setFallbackShareFeedback("success");
    } catch (shareError) {
      if (shareError instanceof Error && shareError.name === "AbortError") return;
      setFallbackShareFeedback("error");
    }
  };

  useEffect(() => {
    if (fallbackShareFeedback === "idle") return;
    const timeout = window.setTimeout(() => setFallbackShareFeedback("idle"), 2200);
    return () => window.clearTimeout(timeout);
  }, [fallbackShareFeedback]);

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
          <p className="mt-1 text-sm text-neutral-600">
            What would you do with {hasSavingsValue ? `your ${formattedSavings}` : "your savings"}?
          </p>
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
          const hasAnyCounts = Object.values(voteCounts).some((n) => n > 0);

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
              {hasAnyCounts && (
                <div
                  className={`absolute inset-y-0 left-0 transition-all duration-700 ${
                    isWinner ? "bg-brand-300/45" : hasVoted ? "bg-brand-200/35" : "bg-brand-100/40"
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
                ) : hasAnyCounts ? (
                  <span className={`text-sm font-semibold ${hasVoted ? "text-neutral-700" : "text-neutral-400"}`}>{percentage}%</span>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {hasVoted && (
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm font-semibold text-brand-700">
          <span>Thanks for voting!</span>
          <button
            type="button"
            onClick={() => void handleShare()}
            className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-brand-200 bg-white/75 px-3 py-1 text-sm font-bold text-brand-700 transition hover:border-brand-300 hover:bg-white hover:text-brand-800"
            aria-label={hasSavingsValue ? `Share your ${formattedSavings} result` : "Share your result"}
          >
            <ShareIcon className="h-4 w-4" />
            {shareCopy}
          </button>
        </div>
      )}
    </section>
  );
}
