"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronDown, Share2 } from "lucide-react";

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

function getPercentage(
  id: string,
  counts: Record<string, number>
): string {
  const total = Object.values(counts).reduce((sum, n) => sum + n, 0);
  if (total === 0) return "0%";
  const pct = Math.round(((counts[id] ?? 0) / total) * 100);
  return `${pct}%`;
}

export function Quiz() {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [hasVoted, setHasVoted] = useState(false);
  const [voteCounts, setVoteCounts] = useState<Record<string, number>>({});

  const fetchCounts = useCallback(async () => {
    try {
      const res = await fetch("/api/quiz/vote");
      if (res.ok) {
        const data = await res.json();
        setVoteCounts(data.counts || {});
      }
    } catch {
      // Silently fail — percentages just won't show
    }
  }, []);

  // Fetch vote counts when quiz is opened
  useEffect(() => {
    if (isOpen) {
      fetchCounts();
    }
  }, [isOpen, fetchCounts]);

  const toggleOption = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    if (selected.size === 0) return;

    try {
      const response = await fetch("/api/quiz/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ votes: Array.from(selected) }),
      });

      if (response.ok) {
        const data = await response.json();
        setVoteCounts(data.counts || {});
      }

      setHasVoted(true);
      setIsOpen(false);
    } catch (error) {
      console.error("Vote submission error:", error);
      setHasVoted(true);
      setIsOpen(false);
    }
  };

  const hasAnyCounts = Object.values(voteCounts).some((n) => n > 0);

  return (
    <>
      {/* Take the Quiz trigger - renders inline */}
      {hasVoted ? (
        <span className="inline-flex items-center gap-1 text-[#007A2F] font-semibold">
          Thanks for voting!
          <Share2 className="h-5 w-5" />
        </span>
      ) : (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-1 text-[#007A2F] font-semibold hover:text-brand-700 transition-colors"
        >
          Take the quiz
          <ChevronDown
            className={`h-5 w-5 transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      )}

      {/* Expandable quiz content - full width below */}
      <div
        className={`w-full overflow-hidden transition-all duration-500 ease-in-out ${
          isOpen && !hasVoted ? "max-h-[500px] opacity-100 mt-4" : "max-h-0 opacity-0 mt-0"
        }`}
      >
        <div className="bg-[#C1DFC8] dark:bg-[#1a3d24] rounded-2xl shadow-lg p-3 sm:p-4 mx-auto">
          {/* 3 columns x 2 rows grid */}
          <div className="grid grid-cols-3 gap-2">
            {quizOptions.map((option) => (
              <label
                key={option.id}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border-2 cursor-pointer transition-all text-center ${
                  selected.has(option.id)
                    ? "border-brand-600 bg-brand-50 dark:bg-brand-600/20"
                    : "border-neutral-200 dark:border-slate-600 hover:border-neutral-300 bg-white dark:bg-slate-800"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected.has(option.id)}
                  onChange={() => toggleOption(option.id)}
                  className="w-4 h-4 rounded border-neutral-300 text-brand-600 focus:ring-brand-500"
                />
                <span className="text-neutral-900 dark:text-slate-100 font-bold text-sm">
                  {option.label}
                  {hasAnyCounts && (
                    <span className="ml-1 text-neutral-400 text-xs font-normal">
                      ({getPercentage(option.id, voteCounts)})
                    </span>
                  )}
                </span>
              </label>
            ))}
          </div>

          {/* Submit area */}
          <div className="mt-4 text-center">
            <button
              onClick={handleSubmit}
              disabled={selected.size === 0}
              className="px-6 py-2 bg-brand-600 text-white font-semibold rounded-full hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Vote
            </button>
            {selected.size > 0 && (
              <p className="mt-2 text-sm text-neutral-500">
                {selected.size} selected
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
