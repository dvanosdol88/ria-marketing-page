"use client";

import type { ReactNode } from "react";
import { ChevronDown, ChevronUp, Gauge, SlidersHorizontal } from "lucide-react";
import type { CalculatorMode } from "@/lib/calculatorMode";

/**
 * The one control row above both calculators.
 *
 * Replaces the old "Inputs | Header" tab pair:
 *   Collapse calculator · Steady return · Market return
 *
 * No description band and no appearance setting. The advanced calculator states
 * its own window in the assumptions grid ("Market Returns 2006-2025"), which
 * says the same thing in the place the reader is already looking.
 */

function ModeButton({
  active,
  icon,
  label,
  onSelect,
}: {
  active: boolean;
  icon: ReactNode;
  label: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      tabIndex={active ? 0 : -1}
      onClick={onSelect}
      className={`inline-flex min-h-10 items-center gap-1.5 rounded-md border px-3 text-sm font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--calc-aum)] ${
        active
          ? "border-[var(--calc-banner)] bg-[var(--calc-banner)] text-[var(--calc-on-banner)] shadow-[0_2px_10px_rgba(6,75,132,0.22)]"
          : "border-[var(--calc-border-strong)] bg-[var(--calc-panel)] text-[var(--calc-body-soft)] hover:bg-[var(--calc-panel-solid)]"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

export function CalculatorChrome({
  expanded,
  mode,
  onSelectMode,
  onToggleExpanded,
}: {
  expanded: boolean;
  mode: CalculatorMode;
  onSelectMode: (mode: CalculatorMode) => void;
  onToggleExpanded: () => void;
}) {
  const otherMode: CalculatorMode = mode === "advanced" ? "basic" : "advanced";

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-t-md border border-b-0 border-[var(--calc-border-strong)] bg-[var(--calc-panel-solid)] px-3 py-2.5 sm:px-4">
      <button
        type="button"
        onClick={onToggleExpanded}
        aria-expanded={expanded}
        aria-controls="calculator-panel"
        className="inline-flex min-h-10 items-center gap-2 rounded-md border border-[var(--calc-border-strong)] bg-[var(--calc-panel)] px-3 text-sm font-bold text-[var(--calc-aum)] transition hover:bg-[var(--calc-stage-deep)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--calc-aum)]"
      >
        {expanded ? "Collapse calculator" : "Expand calculator"}
        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      <div
        role="radiogroup"
        aria-label="Calculator type"
        className="flex items-center gap-2"
        onKeyDown={(event) => {
          if (["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"].includes(event.key)) {
            event.preventDefault();
            onSelectMode(otherMode);
          }
        }}
      >
        {/* Steady return reads first — it is the simpler model, and the one
            a reader steps past rather than back to. Market return maps to the
            historical replay and is still the view that loads by default for
            visitors arriving at /save. */}
        <ModeButton
          active={mode === "basic"}
          icon={<SlidersHorizontal className="h-4 w-4" aria-hidden="true" />}
          label="Steady return"
          onSelect={() => onSelectMode("basic")}
        />
        <ModeButton
          active={mode === "advanced"}
          icon={<Gauge className="h-4 w-4" aria-hidden="true" />}
          label="Market return"
          onSelect={() => onSelectMode("advanced")}
        />
      </div>
    </div>
  );
}
