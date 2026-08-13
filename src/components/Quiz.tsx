"use client";

// CANON: shared verbatim with the sister repo (youarepayingtoomuch.com,
// D:\ria-marketing-page). Edit both repos in the same session or CI fails.
// See CALCULATOR-CANON.md.

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Loader2, Share2 } from "lucide-react";
import { formatCurrencyFloored } from "@/lib/format";
import { capturePostHogEvent } from "@/lib/posthog";
import { siteCalculatorConfig } from "@/lib/siteCalculatorConfig";

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
  variant?: "card" | "bare";
};

export function Quiz({ savings = 0, onShare, shareButtonLabel, variant = "card" }: QuizProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmittingOption, setIsSubmittingOption] = useState<string | null>(null);
  const [voteCounts, setVoteCounts] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  // Result bars mount at width 0 and transition to their real percentage one
  // frame after the vote lands, so the reveal reads as a fill, not a pop.
  const [barsRevealed, setBarsRevealed] = useState(false);
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

  const totalVotes = useMemo(
    () => Object.values(voteCounts).reduce((sum, n) => sum + n, 0),
    [voteCounts],
  );

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

  useEffect(() => {
    if (!hasVoted) return;
    const frame = requestAnimationFrame(() => setBarsRevealed(true));
    return () => cancelAnimationFrame(frame);
  }, [hasVoted]);

  const handleVote = async (optionId: string) => {
    if (isSubmittingOption || hasVoted) return;

    setError(null);
    setIsSubmittingOption(optionId);

    try {
      const counts = await submitVoteToApi(optionId);
      setVoteCounts(counts);
      setSelectedOption(optionId);
      // Fixed-option click only — never the savings amount or any
      // assumption. Quiz renders on surfaces without PostHog wired up, so
      // guard the capture util's absence rather than assume it is always
      // callable.
      try {
        capturePostHogEvent?.(siteCalculatorConfig.analytics.pollVotedEvent, {
          poll: siteCalculatorConfig.analytics.pollId,
          option: optionId,
        });
      } catch {
        // Best-effort analytics; a capture failure must never block voting UX.
      }
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
      ? `My ${siteCalculatorConfig.firmDisplayName} calculator result: ${formattedSavings}\n${window.location.href}`
      : window.location.href;

    try {
      if (typeof navigator.share === "function") {
        await navigator.share({
          title: `${siteCalculatorConfig.firmDisplayName} projection`,
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

  // Results (percentages, bars, total) stay hidden until the visitor has
  // voted — a clean ballot first, then the live tallies as the payoff.
  // Percentages render only when the pool actually has votes; on API
  // degradation there are no counts and therefore no numbers, never fakes.
  const showResults = hasVoted && totalVotes > 0;

  const pollBody = (
    <>
      <div className="grid grid-cols-1 gap-2.5 min-[480px]:grid-cols-2">
        {quizOptions.map((option, optionIndex) => {
          const isSelected = selectedOption === option.id;
          const isWinner = showResults && winningOptionId === option.id;
          const isSubmitting = isSubmittingOption === option.id;
          const percentage = percentages[option.id] ?? 0;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => void handleVote(option.id)}
              disabled={Boolean(isSubmittingOption) || hasVoted}
              aria-pressed={isSelected}
              className={`group relative flex min-h-12 w-full flex-col justify-center gap-2 rounded-xl border px-4 py-3 text-left transition-all duration-200 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#064B84] ${
                isSelected
                  ? "border-[#9FDDB8] bg-[#F4FBF7]"
                  : hasVoted
                    ? "cursor-default border-[#E1E8EF] bg-white"
                    : "border-[#C9D8E4] bg-white hover:-translate-y-px hover:border-[#00A540] hover:bg-[#F4FBF7] hover:shadow-[0_8px_20px_rgba(0,122,47,0.10)] active:translate-y-0 active:bg-[#E9F6EE]"
              }`}
            >
              <span className="flex w-full items-center justify-between gap-3">
                <span className="flex min-w-0 items-center gap-2.5">
                  {hasVoted ? (
                    isSelected ? (
                      <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#007A2F] text-white">
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      </span>
                    ) : null
                  ) : isSubmitting ? (
                    <Loader2 className="h-[18px] w-[18px] shrink-0 animate-spin text-[#007A2F]" />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="h-[18px] w-[18px] shrink-0 rounded-full border-2 border-[#B9C9D6] bg-white transition-colors duration-200 group-hover:border-[#00A540]"
                    />
                  )}
                  <span className="truncate text-[15px] font-semibold text-[#10233A]">{option.label}</span>
                  {isWinner ? (
                    <span className="hidden shrink-0 rounded-full border border-[#BFE7D1] bg-[#E8F7EE] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#0A6E35] min-[560px]:inline">
                      Top answer
                    </span>
                  ) : null}
                </span>

                {showResults ? (
                  <span
                    className={`shrink-0 text-sm font-bold tabular-nums ${isSelected ? "text-[#0A6E35]" : "text-[#33465A]"}`}
                  >
                    {percentage}%
                  </span>
                ) : null}
              </span>

              {showResults ? (
                <span className="block h-1.5 w-full overflow-hidden rounded-full bg-[#EAF1F8]" aria-hidden="true">
                  <span
                    className={`block h-full rounded-full transition-[width] duration-700 ease-out motion-reduce:transition-none ${
                      isSelected ? "bg-[#00A540]" : "bg-[#B9C9D6]"
                    }`}
                    style={{
                      width: barsRevealed ? `${percentage}%` : "0%",
                      transitionDelay: `${optionIndex * 45}ms`,
                    }}
                  />
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {error && <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>}

      {hasVoted && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#BFE7D1] bg-[#F4FBF7] px-4 py-3">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-bold text-[#0A6E35]">
            <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#007A2F] text-white">
              <Check className="h-3.5 w-3.5" strokeWidth={3} />
            </span>
            Thanks for voting!
            {showResults ? (
              <span className="font-semibold text-[#3D6B52]">{totalVotes.toLocaleString("en-US")} votes so far</span>
            ) : null}
          </span>
          <button
            type="button"
            onClick={() => void handleShare()}
            className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[#007A2F] px-4 py-1.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#0A6E35] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#064B84]"
            aria-label={hasSavingsValue ? `Share your ${formattedSavings} result` : "Share your result"}
          >
            <ShareIcon className="h-4 w-4" />
            {shareCopy}
          </button>
        </div>
      )}
    </>
  );

  if (variant === "bare") {
    return pollBody;
  }

  if (!isExpanded) {
    return (
      <div className="text-center">
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className="text-sm font-semibold text-[#007A2F] underline decoration-[#9FDDB8] underline-offset-4 transition-colors hover:text-[#0A6E35]"
        >
          Show Poll
        </button>
      </div>
    );
  }

  return (
    <section className="mx-auto w-full max-w-3xl rounded-2xl border border-[#C9D8E4] bg-white p-5 shadow-[0_12px_32px_rgba(17,33,52,0.06)] sm:p-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#007A2F]">Quick poll</p>
          <p className="mt-1.5 text-lg font-bold tracking-tight text-[#10233A]">
            What would you do with {hasSavingsValue ? `your ${formattedSavings}` : "your savings"}?
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(false)}
          className="text-xs font-bold text-[#52657A] transition-colors hover:text-[#10233A]"
        >
          Hide
        </button>
      </div>

      {pollBody}
    </section>
  );
}
