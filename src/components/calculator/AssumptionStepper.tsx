"use client";

import { useCallback, useMemo, useState } from "react";

/**
 * The one assumption control, shared by both calculators.
 *
 * The basic and advanced calculators used to own separate copies of this —
 * SimpleRangeControl and DarkStepper — which is how they drifted into
 * different stepper sizes, different label sizes, and different alignment
 * despite being the same control doing the same job. Switching between the two
 * therefore felt like switching tools rather than switching views.
 *
 * One component means the geometry cannot drift again. Colours resolve from the
 * calculator theme variables, so this must render inside an element carrying
 * `data-calc-theme` — both calculator roots set it.
 *
 * Geometry is the long-standing basic-calculator shape: label beside the
 * control once there is room for it, 44px steppers, value right-aligned and
 * sized to its own content. Label and value step up a size above phone width.
 */
export function AssumptionStepper({
  boundsFormatter,
  formatter,
  idPrefix = "calc",
  label,
  max,
  min,
  onChange,
  step,
  value,
}: {
  boundsFormatter: (value: number) => string;
  formatter: (value: number) => string;
  /** Keeps input ids unique when both calculators mount the same label. */
  idPrefix?: string;
  label: string;
  max: number;
  min: number;
  onChange: (value: number) => void;
  step: number;
  value: number;
}) {
  const precision = useMemo(() => {
    const decimals = (n: number) => n.toString().split(".")[1]?.length ?? 0;
    return Math.max(decimals(min), decimals(max), decimals(step));
  }, [max, min, step]);

  const clampAndSnap = useCallback(
    (raw: number) => {
      const snapped = Number((min + Math.round((raw - min) / step) * step).toFixed(precision));
      return Math.min(max, Math.max(min, snapped));
    },
    [max, min, precision, step],
  );

  const inputId = `${idPrefix}-${label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}-input`;

  const [draft, setDraft] = useState<string | null>(null);
  const displayValue = draft ?? formatter(value);

  const parseTextValue = useCallback((text: string) => {
    const numeric = Number.parseFloat(text.replace(/[^0-9.\-]/g, ""));
    return Number.isFinite(numeric) ? numeric : null;
  }, []);

  const commitDraft = useCallback(
    (currentText?: string) => {
      const text = currentText ?? draft;
      if (text === null) return;
      const numeric = parseTextValue(text);
      if (numeric !== null) onChange(clampAndSnap(numeric));
      setDraft(null);
    },
    [clampAndSnap, draft, onChange, parseTextValue],
  );

  const stepValue = useCallback(
    (delta: number) => {
      const numeric = draft === null ? null : parseTextValue(draft);
      const base = numeric === null ? value : clampAndSnap(numeric);
      setDraft(null);
      onChange(clampAndSnap(base + delta));
    },
    [clampAndSnap, draft, onChange, parseTextValue, value],
  );

  const stepperClass =
    "grid h-11 w-11 shrink-0 place-items-center text-lg font-bold text-[var(--calc-body-soft)] transition hover:bg-[var(--calc-wash-07)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--calc-accent)] disabled:cursor-not-allowed disabled:text-[var(--calc-inert)] disabled:hover:bg-transparent";

  return (
    // Label beside the control once there is room, which is where this control
    // has always put it. The label shrinks and wraps its own text rather than
    // dropping below — flex-wrap would move it, and moving it is the change
    // that got rejected.
    <div className="flex flex-col gap-2 min-[430px]:flex-row min-[430px]:items-center min-[430px]:justify-between min-[430px]:gap-3">
      {/* Type is deliberately NOT stepped up at sm: once the grid splits into
          two columns the cell is ~316px, and a bigger label there is squeezed
          into a three-line sliver rather than reading as bigger. Sizing this
          properly is its own pass. */}
      <label
        htmlFor={inputId}
        className="block min-w-0 text-[13px] font-bold leading-tight text-[var(--calc-text)]"
      >
        {label}{" "}
        <span className="ml-1.5 whitespace-nowrap text-[12px] font-semibold text-[var(--calc-body-faint)]">
          ({boundsFormatter(min)}&ndash;{boundsFormatter(max)})
        </span>
      </label>

      <div className="flex w-full shrink-0 items-stretch overflow-hidden rounded border border-[var(--calc-border)] bg-[var(--calc-panel-solid)] focus-within:border-[var(--calc-accent)] focus-within:ring-2 focus-within:ring-[var(--calc-ring-accent)] min-[430px]:w-auto">
        <button
          type="button"
          // Without this the input blurs first, committing the draft and
          // stealing the click that was meant to step the value.
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => stepValue(-step)}
          disabled={value <= min}
          className={`${stepperClass} border-r border-[var(--calc-border)]`}
          aria-label={`Decrease ${label}`}
        >
          -
        </button>
        <input
          id={inputId}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          spellCheck={false}
          value={displayValue}
          onChange={(event) => {
            const nextDraft = event.target.value;
            setDraft(nextDraft);
            const numeric = parseTextValue(nextDraft);
            if (numeric !== null) onChange(clampAndSnap(numeric));
          }}
          onFocus={(event) => {
            setDraft(formatter(value));
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
          className="h-11 min-w-[7ch] flex-1 border-0 bg-transparent px-2.5 text-right text-base font-bold leading-none text-[var(--calc-text)] tabular-nums outline-none min-[430px]:flex-none"
          style={{ width: `${Math.max(7, displayValue.length + 3)}ch` }}
          aria-label={`${label} value`}
        />
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => stepValue(step)}
          disabled={value >= max}
          className={`${stepperClass} border-l border-[var(--calc-border)]`}
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
}
