"use client";

import { ChevronDown, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { faqItems, type FaqItem } from "@/data/faq";

/**
 * FaqAccordion — searchable, collapsible FAQ list.
 *
 * - Each question is a native <details>/<summary> disclosure: keyboard
 *   accessible, screen-reader friendly, no JS needed for the toggle.
 * - The search input filters items by question text (case-insensitive,
 *   substring match). Live filter as you type.
 * - "Expand all" toggles every visible item open or closed in one tap.
 *
 * The component is intentionally self-contained — it reads from
 * src/data/faq.ts and is portable to any Next.js / React 19 project
 * with Tailwind + lucide-react. The whole file can be dropped into
 * smarterwaywealth.com unchanged once you decide which questions
 * live there.
 */
export function FaqAccordion() {
  const [query, setQuery] = useState("");
  // Tracks the open/closed state per item, keyed by item id. Default
  // (id missing from map) is closed.
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});

  const visibleItems = useMemo<FaqItem[]>(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return faqItems;
    return faqItems.filter((item) =>
      item.question.toLowerCase().includes(trimmed),
    );
  }, [query]);

  const visibleIds = useMemo(
    () => new Set(visibleItems.map((item) => item.id)),
    [visibleItems],
  );

  const anyOpen = useMemo(
    () => visibleItems.some((item) => openMap[item.id]),
    [openMap, visibleItems],
  );

  function toggle(id: string, open: boolean) {
    setOpenMap((prev) => ({ ...prev, [id]: open }));
  }

  function toggleAll() {
    if (anyOpen) {
      // Collapse only the currently visible items; leave hidden state alone.
      setOpenMap((prev) => {
        const next = { ...prev };
        for (const id of Array.from(visibleIds)) next[id] = false;
        return next;
      });
    } else {
      setOpenMap((prev) => {
        const next = { ...prev };
        for (const id of Array.from(visibleIds)) next[id] = true;
        return next;
      });
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* Search row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search questions…"
            aria-label="Search FAQ"
            className="w-full rounded-md border border-slate-300 bg-white py-3 pl-10 pr-10 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#108843] focus:outline-none focus:ring-2 focus:ring-[#108843]/30"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={toggleAll}
          className="shrink-0 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          aria-label={anyOpen ? "Collapse all visible questions" : "Expand all visible questions"}
        >
          {anyOpen ? "Collapse all" : "Expand all"}
        </button>
      </div>

      {/* Result count */}
      <p className="mt-3 text-sm text-slate-500" aria-live="polite">
        {query
          ? `${visibleItems.length} of ${faqItems.length} question${
              faqItems.length === 1 ? "" : "s"
            } match "${query}"`
          : `${faqItems.length} questions`}
      </p>

      {/* List */}
      <ul className="mt-4 divide-y divide-slate-200 rounded-md border border-slate-200 bg-white">
        {visibleItems.map((item) => (
          <li key={item.id}>
            <details
              id={`faq-${item.id}`}
              open={!!openMap[item.id]}
              onToggle={(e) => toggle(item.id, (e.target as HTMLDetailsElement).open)}
              className="group"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-4 text-left text-base font-semibold text-slate-900 transition hover:bg-slate-50 sm:px-5 sm:py-5 sm:text-lg [&::-webkit-details-marker]:hidden">
                <span>{item.question}</span>
                <ChevronDown
                  aria-hidden="true"
                  className="h-5 w-5 shrink-0 text-[#108843] transition-transform duration-200 group-open:rotate-180"
                />
              </summary>
              <div className="px-4 pb-5 pt-1 text-base leading-7 text-slate-700 sm:px-5">
                {item.answer
                  .split(/\n\n+/)
                  .map((paragraph, idx) => (
                    <p key={idx} className={idx === 0 ? "" : "mt-3"}>
                      {paragraph}
                    </p>
                  ))}
              </div>
            </details>
          </li>
        ))}
        {visibleItems.length === 0 && (
          <li className="px-4 py-8 text-center text-sm text-slate-500 sm:px-5">
            No questions match &ldquo;{query}&rdquo;. Try a shorter search term.
          </li>
        )}
      </ul>
    </div>
  );
}
