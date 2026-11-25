import {
  validateMarginalFeeTiers,
  type MarginalFeeTier,
} from "./feeProjection.ts";

export const INLINE_FEE_SCHEDULE_BOUNDARIES = [1_000_000, 5_000_000, 10_000_000] as const;
export const INLINE_FEE_SCHEDULE_ROW_COUNT = INLINE_FEE_SCHEDULE_BOUNDARIES.length + 1;

type InlineFeeScheduleRow = {
  from: number;
  to: number | null;
  annualRatePercent: number;
};

export function createInlineFeeSchedule(annualRatePercent: number): MarginalFeeTier[] {
  return [
    ...INLINE_FEE_SCHEDULE_BOUNDARIES.map((upTo) => ({ upTo, annualRatePercent })),
    { upTo: null, annualRatePercent },
  ];
}

/**
 * Rows derive their lower bound from the preceding tier's upper boundary.
 * Keeping only upper bounds in the draft makes the visual copies one value.
 */
export function getInlineFeeScheduleRows(
  tiers: readonly MarginalFeeTier[],
): InlineFeeScheduleRow[] {
  return tiers.map((tier, index) => ({
    from: index === 0 ? 0 : tiers[index - 1].upTo ?? 0,
    to: tier.upTo,
    annualRatePercent: tier.annualRatePercent,
  }));
}

export function updateInlineFeeScheduleBoundary(
  tiers: readonly MarginalFeeTier[],
  boundaryIndex: number,
  upTo: number,
): MarginalFeeTier[] {
  return tiers.map((tier, index) => (
    index === boundaryIndex ? { ...tier, upTo } : { ...tier }
  ));
}

export function updateInlineFeeScheduleRate(
  tiers: readonly MarginalFeeTier[],
  tierIndex: number,
  annualRatePercent: number,
): MarginalFeeTier[] {
  return tiers.map((tier, index) => (
    index === tierIndex ? { ...tier, annualRatePercent } : { ...tier }
  ));
}

export function validateInlineFeeSchedule(
  tiers: readonly MarginalFeeTier[],
): { valid: true; tiers: MarginalFeeTier[] } | { valid: false; error: string } {
  if (tiers.length !== INLINE_FEE_SCHEDULE_ROW_COUNT) {
    return { valid: false, error: "Use all four fee-schedule rows." };
  }

  return validateMarginalFeeTiers(tiers);
}

type InlineFeeScheduleEditorIntent = "save" | "enter" | "click-away" | "escape" | "return-to-scalar";

type InlineFeeScheduleEditorCommand =
  | { kind: "apply"; schedule: MarginalFeeTier[] }
  | { kind: "error"; error: string }
  | { kind: "cancel" }
  | { kind: "return-to-scalar" };

/**
 * Keep every editor exit path explicit and testable. Save, Enter, and
 * click-away all use the same validation result before the parent can apply it.
 */
export function resolveInlineFeeScheduleEditorIntent(
  intent: InlineFeeScheduleEditorIntent,
  tiers: readonly MarginalFeeTier[],
): InlineFeeScheduleEditorCommand {
  if (intent === "escape") return { kind: "cancel" };
  if (intent === "return-to-scalar") return { kind: "return-to-scalar" };

  const validation = validateInlineFeeSchedule(tiers);
  return validation.valid
    ? { kind: "apply", schedule: validation.tiers }
    : { kind: "error", error: "error" in validation ? validation.error : "Review the fee schedule before saving." };
}
