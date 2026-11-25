"use client";

import { forwardRef, useCallback, useEffect, useId, useImperativeHandle, useMemo, useRef, useState } from "react";
import {
  MAX_TIER_RATE_PERCENT,
  effectiveAnnualAdvisoryRate,
  type MarginalFeeTier,
} from "@/lib/feeProjection";
import { formatCurrency } from "@/lib/format";
import {
  INLINE_FEE_SCHEDULE_ROW_COUNT,
  createInlineFeeSchedule,
  getInlineFeeScheduleRows,
  updateInlineFeeScheduleBoundary,
  updateInlineFeeScheduleRate,
  resolveInlineFeeScheduleEditorIntent,
  validateInlineFeeSchedule,
} from "@/lib/inlineFeeSchedule";

type InlineFeeScheduleEditorProps = {
  /** A saved schedule opts into tiered mode; null preserves the scalar calculator. */
  savedSchedule: readonly MarginalFeeTier[] | null;
  scalarRatePercent: number;
  portfolioValue: number;
  onApplySchedule: (schedule: MarginalFeeTier[]) => void;
  onReturnToScalar: () => void;
  /** The surrounding assumption cell can own the collapsed rate readout. */
  showRateSummary?: boolean;
  /** The assumption cell can own the trigger while this component owns the full-width panel. */
  hideTrigger?: boolean;
  editorId?: string;
  onOpenChange?: (open: boolean) => void;
};

export type InlineFeeScheduleEditorHandle = {
  open: () => void;
};

function InlineFeeScheduleTriggerButton({
  savedSchedule,
  isOpen,
  editorId,
  onOpen,
}: {
  savedSchedule: readonly MarginalFeeTier[] | null;
  isOpen: boolean;
  editorId: string;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="min-h-9 text-sm font-bold text-[#064B84] underline underline-offset-4 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#064B84]"
      aria-expanded={isOpen}
      aria-controls={editorId}
    >
      {savedSchedule ? "Edit fee schedule" : "Add fee schedule"}
    </button>
  );
}

export function TieredAdvisoryFeeDisplay() {
  return (
    <div className="flex flex-col gap-2 min-[430px]:flex-row min-[430px]:items-center min-[430px]:justify-between min-[430px]:gap-3">
      <p className="block min-w-0 text-[13px] font-bold leading-tight text-[var(--calc-text)]">
        Asset-based fee{" "}
        <span className="ml-1.5 whitespace-nowrap text-[12px] font-semibold text-[var(--calc-body-faint)]">
          (tiered)
        </span>
      </p>
      <p
        aria-label="Asset-based fee value"
        className="flex min-h-11 w-full items-center justify-end rounded border border-[var(--calc-border)] bg-[var(--calc-panel-solid)] px-3 text-base font-bold leading-none tabular-nums text-[var(--calc-text)] min-[430px]:w-auto"
      >
        Tiered
      </p>
    </div>
  );
}

export function FeeScheduleSummaryRow({
  savedSchedule,
  annualRatePercent,
  isOpen,
  editorId,
  onOpen,
}: {
  savedSchedule: readonly MarginalFeeTier[] | null;
  annualRatePercent: number;
  isOpen: boolean;
  editorId: string;
  onOpen: () => void;
}) {
  return (
    <div
      data-fee-schedule-summary
      className="flex min-h-9 flex-wrap items-center gap-x-3 gap-y-0.5 rounded-md border border-[var(--calc-border)] bg-[var(--calc-panel-solid)] px-3 py-0.5"
    >
      {savedSchedule ? (
        <p className="text-[13px] font-semibold text-[var(--calc-body-soft)]" aria-live="polite">
          Blended advisory rate at this portfolio:{" "}
          <span aria-label="Blended advisory rate" className="font-bold tabular-nums text-[var(--calc-text)]">
            {annualRatePercent.toFixed(3)}%
          </span>
        </p>
      ) : null}
      <span className={savedSchedule ? "ml-auto" : undefined}>
        <InlineFeeScheduleTriggerButton
          savedSchedule={savedSchedule}
          isOpen={isOpen}
          editorId={editorId}
          onOpen={onOpen}
        />
      </span>
    </div>
  );
}

function cloneSchedule(tiers: readonly MarginalFeeTier[]): MarginalFeeTier[] {
  return tiers.map((tier) => ({ ...tier }));
}

function parseDraftNumber(value: string): number {
  if (value.trim() === "") return Number.NaN;
  return Number(value.replace(/[$,\s]/g, ""));
}

function inputValue(value: number | null): number | "" {
  return typeof value === "number" && Number.isFinite(value) ? value : "";
}

function boundaryInputValue(value: number | null): string {
  return typeof value === "number" && Number.isFinite(value) ? formatCurrency(value) : "";
}

export const InlineFeeScheduleEditor = forwardRef<InlineFeeScheduleEditorHandle, InlineFeeScheduleEditorProps>(function InlineFeeScheduleEditor({
  savedSchedule,
  scalarRatePercent,
  portfolioValue,
  onApplySchedule,
  onReturnToScalar,
  showRateSummary = true,
  hideTrigger = false,
  editorId: suppliedEditorId,
  onOpenChange,
}, ref) {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState<MarginalFeeTier[]>([]);
  const [error, setError] = useState<string | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const generatedEditorId = useId();
  const editorId = suppliedEditorId ?? generatedEditorId;
  const errorId = useId();
  const savedValidation = useMemo(
    () => savedSchedule ? validateInlineFeeSchedule(savedSchedule) : null,
    [savedSchedule],
  );
  const effectiveRate = savedValidation?.valid
    ? effectiveAnnualAdvisoryRate(portfolioValue, savedValidation.tiers)
    : null;
  const rows = useMemo(() => getInlineFeeScheduleRows(draft), [draft]);

  // A schedule can reach here already applied but NOT 4 rows — e.g. seeded
  // from a legacy share-link's `tiers=` param (any 1-6 tier count was valid
  // there; this editor's own validateInlineFeeSchedule requires exactly
  // INLINE_FEE_SCHEDULE_ROW_COUNT). Cloning a mismatched schedule into the
  // draft would open an editor whose own Save button is DOOMED to fail
  // validation on an unedited draft — confusing, not a crash, but still
  // wrong. Opening must never silently alter the applied schedule either
  // way, so a mismatched count drafts FRESH (the same 4-row starting point
  // as "no saved schedule") instead: the applied schedule keeps driving the
  // live calculation and any share link until the reader explicitly saves
  // this fresh draft, which then replaces it with a 4-tier one.
  const canDraftSavedSchedule = Boolean(savedSchedule) && savedSchedule!.length === INLINE_FEE_SCHEDULE_ROW_COUNT;

  const openEditor = useCallback(() => {
    setDraft(canDraftSavedSchedule ? cloneSchedule(savedSchedule!) : createInlineFeeSchedule(scalarRatePercent));
    setError(null);
    setIsOpen(true);
    onOpenChange?.(true);
  }, [canDraftSavedSchedule, onOpenChange, savedSchedule, scalarRatePercent]);

  const cancelEditor = useCallback(() => {
    setError(null);
    setIsOpen(false);
    onOpenChange?.(false);
  }, [onOpenChange]);

  useImperativeHandle(ref, () => ({ open: openEditor }), [openEditor]);

  const executeIntent = useCallback((intent: "save" | "enter" | "click-away" | "escape" | "return-to-scalar"): boolean => {
    const command = resolveInlineFeeScheduleEditorIntent(intent, draft);
    if (command.kind === "error") {
      setError(command.error);
      return false;
    }
    if (command.kind === "apply") {
      onApplySchedule(command.schedule);
      cancelEditor();
      return true;
    }
    if (command.kind === "return-to-scalar") {
      cancelEditor();
      onReturnToScalar();
      return true;
    }

    cancelEditor();
    return true;
  }, [cancelEditor, draft, onApplySchedule, onReturnToScalar]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const saveOnClickAway = (event: PointerEvent) => {
      if (editorRef.current?.contains(event.target as Node)) return;
      executeIntent("click-away");
    };

    document.addEventListener("pointerdown", saveOnClickAway);
    return () => document.removeEventListener("pointerdown", saveOnClickAway);
  }, [executeIntent, isOpen]);

  const updateBoundary = (boundaryIndex: number, value: string) => {
    setDraft((current) => updateInlineFeeScheduleBoundary(
      current,
      boundaryIndex,
      parseDraftNumber(value),
    ));
    setError(null);
  };

  const updateRate = (tierIndex: number, value: string) => {
    setDraft((current) => updateInlineFeeScheduleRate(
      current,
      tierIndex,
      parseDraftNumber(value),
    ));
    setError(null);
  };

  return (
    <div ref={editorRef} className="w-full">
      {savedSchedule && showRateSummary ? (
        <p className="text-sm font-semibold text-[#27435A]" aria-live="polite">
          Blended advisory rate at this portfolio: <span className="font-bold text-[#062B43]">{effectiveRate === null ? "Unavailable" : `${effectiveRate.toFixed(3)}%`}</span>
        </p>
      ) : null}

      {!hideTrigger ? (
        <InlineFeeScheduleTriggerButton
          savedSchedule={savedSchedule}
          isOpen={isOpen}
          editorId={editorId}
          onOpen={openEditor}
        />
      ) : null}

      {isOpen ? (
        <form
          id={editorId}
          data-fee-schedule-panel
          className="mt-2 rounded-lg border border-[#C9D8E4] bg-[#F7F9FB] p-4"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            executeIntent("save");
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              executeIntent("escape");
            } else if (event.key === "Enter") {
              event.preventDefault();
              executeIntent("enter");
            }
          }}
          aria-label="Fee schedule editor"
        >
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.8fr)]">
            <span className="hidden text-xs font-bold uppercase tracking-wide text-[#52697B] sm:block">From</span>
            <span className="hidden text-xs font-bold uppercase tracking-wide text-[#52697B] sm:block">To</span>
            <span className="hidden text-xs font-bold uppercase tracking-wide text-[#52697B] sm:block">Annual fee</span>
            {rows.map((row, index) => {
              const isFirst = index === 0;
              const isFinal = index === rows.length - 1;
              const errorProps = error ? { "aria-invalid": true, "aria-describedby": errorId } : {};
              return (
                <div key={index} className="contents">
                  <label className="text-sm font-bold text-[#10233A]">
                    <span className="sm:hidden">From</span>
                    {isFirst ? (
                      <span className="mt-2 flex min-h-11 items-center rounded-md border border-[#D8E2EA] bg-white px-3 font-semibold">{formatCurrency(0)}</span>
                    ) : (
                      <input
                        aria-label={`Tier ${index + 1} lower boundary`}
                        className="mt-2 min-h-11 w-full rounded-md border border-[#AFC2D0] bg-white px-3 font-semibold text-[#10233A] outline-none focus:border-[#064B84] focus:ring-3 focus:ring-[#064B84]/20"
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        value={boundaryInputValue(row.from)}
                        onChange={(event) => updateBoundary(index - 1, event.target.value)}
                        {...errorProps}
                      />
                    )}
                  </label>
                  <label className="text-sm font-bold text-[#10233A]">
                    <span className="sm:hidden">To</span>
                    {isFinal ? (
                      <span className="mt-2 flex min-h-11 items-center rounded-md border border-[#D8E2EA] bg-white px-3 font-semibold">No limit</span>
                    ) : (
                      <input
                        aria-label={`Tier ${index + 1} upper boundary`}
                        className="mt-2 min-h-11 w-full rounded-md border border-[#AFC2D0] bg-white px-3 font-semibold text-[#10233A] outline-none focus:border-[#064B84] focus:ring-3 focus:ring-[#064B84]/20"
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        value={boundaryInputValue(row.to)}
                        onChange={(event) => updateBoundary(index, event.target.value)}
                        {...errorProps}
                      />
                    )}
                  </label>
                  <label className="text-sm font-bold text-[#10233A]">
                    <span className="sm:hidden">Annual fee</span>
                    <input
                      aria-label={`Tier ${index + 1} annual fee`}
                      className="mt-2 min-h-11 w-full rounded-md border border-[#AFC2D0] bg-white px-3 font-semibold text-[#10233A] outline-none focus:border-[#064B84] focus:ring-3 focus:ring-[#064B84]/20"
                      type="number"
                      min="0"
                      max={MAX_TIER_RATE_PERCENT}
                      step="0.05"
                      value={inputValue(row.annualRatePercent)}
                      onChange={(event) => updateRate(index, event.target.value)}
                      {...errorProps}
                    />
                  </label>
                </div>
              );
            })}
          </div>

          {error ? <p id={errorId} role="alert" className="mt-4 rounded-md border border-[#E7A7A5] bg-[#FFF2F1] p-3 text-sm font-semibold text-[#8B2422]">{error}</p> : null}

          <div className="mt-4 flex flex-wrap gap-3">
            <button type="submit" className="min-h-11 rounded-md bg-[#064B84] px-4 text-sm font-bold text-white focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#064B84]">Save schedule</button>
            <button type="button" onClick={cancelEditor} className="min-h-11 rounded-md border border-[#AFC2D0] px-4 text-sm font-bold text-[#064B84] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#064B84]">Cancel</button>
            <button
              type="button"
              onClick={() => executeIntent("return-to-scalar")}

              className="min-h-11 text-sm font-bold text-[#064B84] underline underline-offset-4 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#064B84]"
            >
              Use a single fee rate
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
});
