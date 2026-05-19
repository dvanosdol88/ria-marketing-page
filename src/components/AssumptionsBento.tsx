"use client";

import { useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Lock, Minus, Plus } from "lucide-react";
import type { CalculatorState } from "@/lib/calculatorState";
import { RIA_MONTHLY_FEE } from "@/lib/feeProjection";
import { formatCurrency } from "@/lib/format";

interface AssumptionsBentoProps {
  state: CalculatorState;
  setState: React.Dispatch<React.SetStateAction<CalculatorState>>;
}

interface EditableStatProps {
  value: number;
  onChange: (next: number) => void;
  format: (value: number) => string;
  ariaLabel: string;
  min: number;
  max: number;
  step: number;
  integer?: boolean;
}

function EditableStat({
  value,
  onChange,
  format,
  ariaLabel,
  min,
  max,
  step,
  integer = false,
}: EditableStatProps) {
  const precision = useMemo(() => {
    if (integer) return 0;
    const decimalPlaces = (n: number) => n.toString().split(".")[1]?.length ?? 0;
    return Math.max(decimalPlaces(min), decimalPlaces(max), decimalPlaces(step));
  }, [integer, min, max, step]);

  const clampAndSnap = useCallback(
    (raw: number) => {
      const snapped = Number((min + Math.round((raw - min) / step) * step).toFixed(precision));
      return Math.min(max, Math.max(min, snapped));
    },
    [max, min, precision, step]
  );

  const [draft, setDraft] = useState<string | null>(null);
  const displayValue = draft ?? format(value);

  const parseTextValue = useCallback((text: string) => {
    const cleaned = text.replace(/[^0-9.\-]/g, "");
    const numeric = Number.parseFloat(cleaned);
    return Number.isFinite(numeric) ? numeric : null;
  }, []);

  const parseDraft = useCallback(
    () => (draft === null ? null : parseTextValue(draft)),
    [draft, parseTextValue]
  );

  const commitDraft = useCallback(
    (text?: string) => {
      const source = text ?? draft;
      if (source === null) return;
      const numeric = parseTextValue(source);
      if (numeric !== null) onChange(clampAndSnap(numeric));
      setDraft(null);
    },
    [clampAndSnap, draft, onChange, parseTextValue]
  );

  const stepValue = useCallback(
    (delta: number) => {
      const numeric = parseDraft();
      const base = numeric === null ? value : clampAndSnap(numeric);
      setDraft(null);
      onChange(clampAndSnap(base + delta));
    },
    [clampAndSnap, onChange, parseDraft, value]
  );

  const canDecrease = value > min;
  const canIncrease = value < max;

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => stepValue(-step)}
        disabled={!canDecrease}
        aria-label={`Decrease ${ariaLabel}`}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-[#DFE6EE] bg-white text-[#31506D] transition hover:border-[#108843] hover:text-[#108843] disabled:cursor-not-allowed disabled:text-[#A8B5C2] disabled:hover:border-[#DFE6EE] disabled:hover:text-[#A8B5C2]"
      >
        <Minus className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" />
      </button>
      <input
        type="text"
        inputMode="decimal"
        autoComplete="off"
        spellCheck={false}
        value={displayValue}
        onChange={(event) => setDraft(event.target.value)}
        onFocus={(event) => {
          setDraft(format(value));
          requestAnimationFrame(() => event.target.select());
        }}
        onBlur={(event) => commitDraft(event.currentTarget.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            commitDraft(event.currentTarget.value);
            event.currentTarget.blur();
          } else if (event.key === "Escape") {
            event.preventDefault();
            setDraft(null);
            event.currentTarget.blur();
          }
        }}
        aria-label={ariaLabel}
        className="min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-2 py-1 text-3xl font-black tracking-tight text-[#108843] tabular-nums outline-none transition focus:border-[#108843] focus:bg-white focus:ring-2 focus:ring-[#108843]/30"
      />
      <button
        type="button"
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => stepValue(step)}
        disabled={!canIncrease}
        aria-label={`Increase ${ariaLabel}`}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-[#DFE6EE] bg-white text-[#31506D] transition hover:border-[#108843] hover:text-[#108843] disabled:cursor-not-allowed disabled:text-[#A8B5C2] disabled:hover:border-[#DFE6EE] disabled:hover:text-[#A8B5C2]"
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" />
      </button>
    </div>
  );
}

interface BentoTileProps extends Omit<EditableStatProps, "ariaLabel"> {
  eyebrow: string;
  title: string;
  summary: string;
  spanTwo?: boolean;
}

function BentoTile({
  eyebrow,
  title,
  summary,
  spanTwo,
  ...stat
}: BentoTileProps) {
  return (
    <motion.article
      whileHover={{ y: -4, scale: 1.006 }}
      transition={{ duration: 0.8, ease: [0.165, 0.84, 0.44, 1] }}
      className={[
        "self-start rounded-md border border-[#D5DEE8] bg-white p-5 shadow-sm transition-colors duration-300",
        spanTwo ? "md:col-span-2 lg:col-span-2" : "",
      ].join(" ")}
    >
      <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#108843]">
        {eyebrow}
      </p>
      <h3 className="mt-2 text-xl font-black tracking-tight text-[#062417] sm:text-2xl">
        {title}
      </h3>
      <p className="mt-4 text-sm leading-6 text-slate-600">{summary}</p>
      <div className="mt-5">
        <EditableStat ariaLabel={eyebrow} {...stat} />
      </div>
    </motion.article>
  );
}

interface LockedTileProps {
  eyebrow: string;
  title: string;
  summary: string;
  value: string;
}

function LockedTile({ eyebrow, title, summary, value }: LockedTileProps) {
  return (
    <motion.article
      whileHover={{ y: -2 }}
      transition={{ duration: 0.8, ease: [0.165, 0.84, 0.44, 1] }}
      className="self-start rounded-md border border-[#D5DEE8] bg-[#F6FAFC] p-5 shadow-sm transition-colors duration-300"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#108843]">
          {eyebrow}
        </p>
        <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 ring-1 ring-[#D5DEE8]">
          <Lock className="h-2.5 w-2.5" aria-hidden="true" strokeWidth={2.5} />
          Fixed
        </span>
      </div>
      <h3 className="mt-2 text-xl font-black tracking-tight text-[#062417] sm:text-2xl">
        {title}
      </h3>
      <p className="mt-4 text-sm leading-6 text-slate-600">{summary}</p>
      <p className="mt-5 px-2 text-3xl font-black tracking-tight text-[#108843] tabular-nums">
        {value}
      </p>
    </motion.article>
  );
}

export function AssumptionsBento({ state, setState }: AssumptionsBentoProps) {
  return (
    <section
      aria-labelledby="assumptions-bento-heading"
      className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-12 pt-10 sm:px-6 sm:pb-16 sm:pt-12"
    >
      <div className="mb-7 max-w-3xl">
        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#108843]">
          Your assumptions, plainly stated
        </p>
        <h2
          id="assumptions-bento-heading"
          className="mt-2 text-2xl font-black tracking-tight text-[#062417] sm:text-3xl"
        >
          Six numbers drive the chart. Edit any of them.
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Nothing in the projection is hidden. Adjust the inputs you control; we&apos;ve
          held the one you pay <em>us</em> steady, in plain sight.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 md:items-start lg:grid-cols-3">
        <BentoTile
          eyebrow="Portfolio value"
          title="What you&apos;d bring today."
          summary="Your starting investable balance — the number we project forward."
          value={state.portfolioValue}
          format={(v) => formatCurrency(v)}
          onChange={(v) => setState((prev) => ({ ...prev, portfolioValue: v }))}
          min={250000}
          max={5000000}
          step={50000}
          integer
          spanTwo
        />
        <BentoTile
          eyebrow="Time horizon"
          title="How long fees compound."
          summary="The longer the horizon, the more an AUM fee compounds against you, year over year."
          value={state.years}
          format={(v) => `${v} yrs`}
          onChange={(v) => setState((prev) => ({ ...prev, years: v }))}
          min={1}
          max={40}
          step={1}
          integer
        />
        <BentoTile
          eyebrow="Annual growth"
          title="What you assume the market returns."
          summary="An assumption you set, not a forecast. U.S. equities have averaged roughly 10% gross of fees, long-run."
          value={state.annualGrowthPercent}
          format={(v) => `${v.toFixed(1)}%`}
          onChange={(v) => setState((prev) => ({ ...prev, annualGrowthPercent: v }))}
          min={3}
          max={12}
          step={0.5}
        />
        <BentoTile
          eyebrow="Your advisor's fee"
          title="The AUM percentage you pay today."
          summary="Industry average runs around 1%. Higher fees compound against you, in dollars, every year."
          value={state.annualFeePercent}
          format={(v) => `${v.toFixed(2)}%`}
          onChange={(v) => setState((prev) => ({ ...prev, annualFeePercent: v }))}
          min={0}
          max={3}
          step={0.05}
        />
        <BentoTile
          eyebrow="Mutual fund expenses"
          title="The ER stacked on top."
          summary="Active funds carry an expense ratio. If yours do, it adds to the drag on top of the advisor's fee."
          value={state.mutualFundExpensePercent}
          format={(v) => `${v.toFixed(2)}%`}
          onChange={(v) => setState((prev) => ({ ...prev, mutualFundExpensePercent: v }))}
          min={0}
          max={3}
          step={0.05}
        />
        <LockedTile
          eyebrow="Smarter Way Wealth fee"
          title="What we charge."
          summary="A fixed monthly fee. Doesn't scale with your account. The same amount whether you bring us $500k or $5M."
          value={`$${RIA_MONTHLY_FEE}/mo`}
        />
      </div>
    </section>
  );
}
