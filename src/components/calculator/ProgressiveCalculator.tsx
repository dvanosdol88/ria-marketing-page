"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { MIN_HORIZON_YEARS } from "@/data/sp500Returns";
import type { CalculatorMode } from "@/lib/calculatorMode";
import { CALCULATOR_MAX_PORTFOLIO, CALCULATOR_MAX_SINGLE_RATE, DEFAULT_STATE, parseDetailedCalculatorState } from "@/lib/full-calculator/calculatorState";
import { formatCurrency } from "@/lib/format";
import { capturePostHogEvent } from "@/lib/posthog";
import { CanonCalculatorExperience } from "./CanonCalculatorExperience";
import { FeeAnswer } from "./FeeAnswer";

/**
 * The step-by-step Fee Calculator under the /calculator banner (David,
 * 2026-11-10):
 *
 *   Two text choices sit above the fields (David, 2026-11-10, later):
 *   "Use my numbers" (the default) and "See example". The chosen one is bold
 *   green; the other is light blue.
 *
 *   Use my numbers: Portfolio Value -> (green check) What you pay now ->
 *   Years -> Annual Growth -> Go. Each check slides the next field out.
 *   See example: the same steps play by themselves with the house example;
 *   the visitor still presses Go to see the results.
 *
 *   Go shows ending values and chart, then one wide blue band, "Use market
 *   returns with our Advanced Calculator", which opens the full calculator on
 *   those numbers. Results stay on screen in either mode.
 *
 * Steady links the step form could have written land on the folded line plus
 * the answer. Every other link that carries a scenario (shared results, the
 * sister site's hand-off) opens the full calculator with the fields filled
 * in from the link.
 */

type FieldKey = "portfolio" | "fee" | "years" | "growth";
type FieldValues = Record<FieldKey, string>;
type View = "link" | "results" | "advanced" | "market";
type Run = { portfolio: number; fee: number; years: number; growth: number };

const FIELD_ORDER: FieldKey[] = ["portfolio", "fee", "years", "growth"];

const LIMITS: Record<FieldKey, { min: number; max: number }> = {
  portfolio: { min: 250_000, max: CALCULATOR_MAX_PORTFOLIO },
  fee: { min: 0.25, max: CALCULATOR_MAX_SINGLE_RATE },
  years: { min: MIN_HORIZON_YEARS, max: 40 },
  growth: { min: 4, max: 15 },
};

const FIELD_COPY: Record<FieldKey, { label: string; placeholder: string; percent: boolean }> = {
  portfolio: { label: "Portfolio Value", placeholder: "$250k-$10M", percent: false },
  fee: { label: "What you pay now", placeholder: "0.25% - 3.0%", percent: true },
  years: { label: "Years", placeholder: "min 5", percent: false },
  growth: { label: "Annual Growth", placeholder: "4.0% - 15.0%", percent: true },
};

/** The allowed range, shown in light text under a box whose number is
 *  outside it, and in red once it cannot be right (David, 2026-11-11: typing
 *  16% or 0.25% used to do nothing at all). */
const RANGE_TEXT: Record<FieldKey, string> = {
  portfolio: "$250,000 to $10,000,000",
  fee: "0.25% to 3.0%",
  years: `${MIN_HORIZON_YEARS} to 40 years`,
  growth: "4.0% to 15.0%",
};

/** Calculator keys a run rewrites; everything else on the link (campaign
 *  tags and the like) is carried through untouched. */
const SCENARIO_KEYS = new Set([
  "calc", "end", "fee", "feeMode", "flat", "growth", "mfe", "mode", "portfolio", "return", "tiers", "years",
]);

const EASE = [0.16, 1, 0.3, 1] as const;

/** Wide screens (a monitor) have room for every field on one line, so each
 *  next field slides in to the right instead of underneath (David,
 *  2026-11-10). Below this width they stack.
 *
 *  The row itself is laid out by the stylesheet (the `min-[1280px]:` classes
 *  below, same width as this query), so the server's markup is already one
 *  row on a wide screen and nothing jumps once the page's scripts start.
 *  This query only picks which way a newly unlocked field slides in. */
const WIDE_QUERY = "(min-width: 1280px)";

/** A field row (the visitor's fields and the sample's): stacked, then one line from 1280px. */
const ROW_CLASS = "min-[1280px]:flex min-[1280px]:flex-row min-[1280px]:items-start";

function useWideLayout() {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(WIDE_QUERY);
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    },
    () => window.matchMedia(WIDE_QUERY).matches,
    () => false,
  );
}

function parseValue(key: FieldKey, text: string): number | null {
  if (!text) return null;
  const parsed = key === "portfolio" || key === "years" ? Number.parseInt(text, 10) : Number.parseFloat(text);
  return Number.isFinite(parsed) ? parsed : null;
}

function isValid(key: FieldKey, text: string) {
  const value = parseValue(key, text);
  return value !== null && value >= LIMITS[key].min && value <= LIMITS[key].max;
}

/** What the visitor may type into each box. Percentages take two decimal places. */
function sanitize(key: FieldKey, raw: string, previous: string) {
  if (key === "portfolio") return raw.replace(/\D/g, "").replace(/^0+/, "").slice(0, 9);
  if (key === "years") return raw.replace(/\D/g, "").replace(/^0+/, "").slice(0, 2);
  const text = raw.replace(/[^\d.]/g, "");
  return /^\d{0,2}(\.\d{0,2})?$/.test(text) ? text : previous;
}

function displayValue(key: FieldKey, text: string) {
  if (key === "portfolio") return text ? `$${Number(text).toLocaleString("en-US")}` : "";
  return text;
}

/** At least one decimal place once the visitor leaves a percentage box
 *  ("1" -> "1.0", "0.25" stays "0.25"). */
function tidyPercent(text: string) {
  const value = Number.parseFloat(text);
  return text && Number.isFinite(value) ? percentText(value) : text;
}

function percentText(value: number) {
  const twoPlaces = value.toFixed(2);
  return twoPlaces.endsWith("0") ? value.toFixed(1) : twoPlaces;
}

function toQuery(record?: Record<string, string | string[] | undefined>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(record ?? {})) {
    const first = Array.isArray(value) ? value[0] : value;
    if (typeof first === "string") query.set(key, first);
  }
  return query;
}

/** A steady-return link the step form itself writes after Go (or a shared
 *  copy of it) lands on the folded line plus the answer, not the old full
 *  calculator. Anything the step form cannot express (a mode request,
 *  market returns, tiers, a fund expense, a custom flat fee, or numbers
 *  outside its limits) returns null and opens the full calculator. */
function answerRunFromLink(record?: Record<string, string | string[] | undefined>): Run | null {
  const query = toQuery(record);
  if (query.get("return") !== "steady") return null;
  if (query.has("calc") || query.has("mode") || query.has("tiers")) return null;
  const feeMode = query.get("feeMode");
  if (feeMode !== null && feeMode !== "single") return null;
  const mfe = query.get("mfe");
  if (mfe !== null && Number.parseFloat(mfe) !== 0) return null;
  const flat = query.get("flat");
  if (flat !== null && Number.parseFloat(flat) !== DEFAULT_STATE.annualFlatFee) return null;
  for (const key of FIELD_ORDER) {
    const raw = Number.parseFloat(query.get(key) ?? "");
    if (!Number.isFinite(raw) || raw < LIMITS[key].min || raw > LIMITS[key].max) return null;
  }
  const linked = parseDetailedCalculatorState(query);
  const run: Run = {
    portfolio: Math.round(linked.portfolioValue),
    fee: Math.round(linked.annualFeePercent * 100) / 100,
    years: Math.round(linked.years),
    growth: Math.round(linked.annualGrowthPercent * 100) / 100,
  };
  return FIELD_ORDER.every((key) => run[key] >= LIMITS[key].min && run[key] <= LIMITS[key].max) ? run : null;
}

function ModeChoice({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex min-h-11 items-center px-1 text-lg tracking-[0.06em] [font-variant-caps:all-small-caps] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#064B84] ${
        active ? "font-extrabold text-[#007A2F]" : "font-light text-[#064B84] hover:text-[#053B6A]"
      }`}
    >
      {children}
    </button>
  );
}

function SlideIn({
  children,
  delay = 0,
  first = false,
  horizontal = false,
  reducedMotion,
  row = false,
}: {
  children: ReactNode;
  delay?: number;
  /** The leftmost item of a row carries no leading gap. */
  first?: boolean;
  /** Slide in to the right (wide screens) instead of down from underneath.
   *  Motion only: where the item sits comes from `row` and the stylesheet. */
  horizontal?: boolean;
  reducedMotion: boolean;
  /** An item of a field row: stacked below 1280px, side by side from 1280px. */
  row?: boolean;
}) {
  const timing = { duration: reducedMotion ? 0 : 0.5, ease: EASE, delay: reducedMotion ? 0 : delay };
  // The way in is fixed when the item first appears, so its settled target
  // (natural width or height) never changes afterwards and nothing
  // re-animates when the page's scripts start or the screen crosses 1280px.
  // (Items on screen at first paint never slide in; they keep the default.)
  // The way out follows the screen as it is when the item leaves.
  const [enteredSideways] = useState(row && horizontal);
  const leavesSideways = row && horizontal;
  return (
    <motion.div
      initial={reducedMotion ? false : enteredSideways ? { width: 0, opacity: 0 } : { height: 0, opacity: 0 }}
      animate={
        enteredSideways
          ? { width: "auto", opacity: 1, transitionEnd: { overflow: "visible" } }
          : { height: "auto", opacity: 1, transitionEnd: { overflow: "visible" } }
      }
      exit={
        reducedMotion
          ? { opacity: 0 }
          : leavesSideways
            ? { width: 0, opacity: 0, overflow: "hidden" }
            : { height: 0, opacity: 0, overflow: "hidden" }
      }
      transition={timing}
      style={{ overflow: "hidden" }}
      className={row ? "min-[1280px]:shrink-0" : undefined}
    >
      <motion.div
        initial={reducedMotion ? false : enteredSideways ? { x: -28 } : { y: -18 }}
        animate={enteredSideways ? { x: 0 } : { y: 0 }}
        transition={timing}
        className={row ? (first ? "pt-5 min-[1280px]:w-max" : "pt-5 min-[1280px]:w-max min-[1280px]:pl-6") : "pt-5"}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/** The fee box's plain-dollars line (David, 2026-11-10: "the percent turns
 *  into dollars as it is typed"). Arithmetic on what was typed; no forecast. */
function FeeInDollars({ portfolio, fee }: { portfolio: string; fee: string }) {
  if (!isValid("portfolio", portfolio) || !isValid("fee", fee)) return null;
  const balance = parseValue("portfolio", portfolio) ?? 0;
  const rate = parseValue("fee", fee) ?? 0;
  const yearly = (balance * rate) / 100;
  return (
    <div data-step-fee-dollars className="max-w-[26rem] min-[1280px]:max-w-[15rem]">
      <p className="text-base leading-snug text-[#10233A]">
        {percentText(rate)}% of {formatCurrency(balance)} is {formatCurrency(yearly)} a year,{" "}
        <b>about {formatCurrency(yearly / 12)} a month</b>, at today&rsquo;s balance.
      </p>
      <span className="mt-2 inline-block rounded-full border border-[#BFE7D1] bg-[#E8F7EE] px-3 py-0.5 text-sm font-bold text-[#0A5E2B]">
        Flat fee: {formatCurrency(DEFAULT_STATE.annualFlatFee / 12)} a month
      </span>
    </div>
  );
}

/** Keeps a newly opened box above the phone's keyboard (David, 2026-11-11:
 *  the next field hid behind it). The visible part of the page is the
 *  "visual viewport", which shrinks while the keyboard is up. */
function keepInView(node: HTMLElement, smooth: boolean) {
  const box = (node.closest("[data-step-field]") ?? node).getBoundingClientRect();
  const view = window.visualViewport;
  const top = view ? view.offsetTop : 0;
  const bottom = top + (view ? view.height : window.innerHeight);
  const margin = 20;
  let shift = 0;
  if (box.bottom + margin > bottom) shift = Math.min(box.bottom + margin - bottom, box.top - top - margin);
  else if (box.top - margin < top) shift = box.top - margin - top;
  if (Math.abs(shift) > 1) window.scrollBy({ top: shift, behavior: smooth ? "smooth" : "auto" });
}

function FieldRow({
  field,
  idPrefix,
  inputRef,
  isLast = false,
  note = null,
  onChange,
  onConfirm,
  onGo,
  pulse = false,
  readOnly = false,
  reducedMotion,
  value,
}: {
  field: FieldKey;
  idPrefix: string;
  inputRef?: (node: HTMLInputElement | null) => void;
  /** The last step: its circle says Go and runs the numbers in one tap. */
  isLast?: boolean;
  note?: ReactNode;
  onChange?: (text: string) => void;
  onConfirm?: () => void;
  onGo?: () => void;
  /** The example has filled every box: Go pulses gently (David, 2026-11-11). */
  pulse?: boolean;
  readOnly?: boolean;
  reducedMotion: boolean;
  value: string;
}) {
  const copy = FIELD_COPY[field];
  const valid = isValid(field, value);
  /* Enter or leaving the box with a number outside the range turns the
     range text red; a number already past the top is red at once. */
  const [attempted, setAttempted] = useState(false);
  const typed = parseValue(field, value);
  const outOfRange = Boolean(value) && !valid;
  const clearlyWrong = outOfRange && (attempted || (typed !== null && typed > LIMITS[field].max));
  const rangeId = `${idPrefix}-${field}-range`;
  const go = (target?: HTMLElement | null) => {
    if (copy.percent && onChange) onChange(tidyPercent(value));
    // Closing the phone's number pad: the iPhone pad has no Go key.
    target?.blur();
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    onGo?.();
  };
  const inputId = `${idPrefix}-${field}`;
  // From 1280px the boxes take fixed widths so the row of fields sits side by side.
  const widthClass =
    field === "portfolio"
      ? "w-full max-w-[18rem] min-[1280px]:w-[15rem]"
      : copy.percent
        ? "w-full max-w-[11rem] min-[1280px]:w-[11rem]"
        : "w-full max-w-[9rem] min-[1280px]:w-[9rem]";

  return (
    <div className="flex flex-col gap-2" data-step-field={field}>
      <label htmlFor={inputId} className="text-lg font-bold text-[#10233A]">
        {copy.label}
      </label>
      <div className="flex items-center gap-3">
        <div className={`relative ${widthClass}`}>
          <input
            ref={inputRef}
            id={inputId}
            type="text"
            inputMode={copy.percent ? "decimal" : "numeric"}
            autoComplete="off"
            readOnly={readOnly}
            value={displayValue(field, value)}
            placeholder={copy.placeholder}
            enterKeyHint={field === "growth" ? "go" : "next"}
            aria-invalid={clearlyWrong || undefined}
            aria-describedby={outOfRange ? rangeId : undefined}
            onChange={(event) => {
              setAttempted(false);
              onChange?.(sanitize(field, event.target.value, value));
            }}
            onBlur={() => {
              if (copy.percent && onChange) onChange(tidyPercent(value));
              if (value && !valid) setAttempted(true);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !valid) {
                event.preventDefault();
                setAttempted(true);
                return;
              }
              if (event.key === "Enter" && valid) {
                event.preventDefault();
                if (isLast) {
                  go(event.currentTarget);
                  return;
                }
                if (copy.percent && onChange) onChange(tidyPercent(value));
                onConfirm?.();
              }
            }}
            className={`h-12 w-full rounded-md border border-[#B8C7D6] bg-white px-4 text-lg font-bold text-[#10233A] tabular-nums placeholder:font-light placeholder:text-[#8796A8] focus:border-[#064B84] focus:outline-none focus:ring-2 focus:ring-[#064B84]/25 ${
              copy.percent && value ? "pr-9" : ""
            } ${readOnly ? "cursor-default" : ""}`}
          />
          {copy.percent && value ? (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-lg font-bold text-[#10233A]"
            >
              %
            </span>
          ) : null}
        </div>
        <AnimatePresence initial={false}>
          {valid && isLast ? (
            <motion.button
              key="go"
              type="button"
              onClick={(event) => go(event.currentTarget)}
              aria-label="Go: show my results"
              data-step-go
              initial={reducedMotion ? false : { scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={reducedMotion ? { opacity: 0 } : { scale: 0.4, opacity: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.25, ease: EASE }}
              data-step-go-pulse={pulse && !reducedMotion ? "true" : undefined}
              className="-my-[5px] inline-flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-full bg-[#007A2F] text-xl font-extrabold text-white shadow-[0_6px_16px_rgba(0,122,47,0.3)] transition-colors hover:bg-[#00682B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#007A2F]"
            >
              Go
            </motion.button>
          ) : valid ? (
            <motion.button
              key="check"
              type="button"
              onClick={() => {
                if (copy.percent && onChange) onChange(tidyPercent(value));
                onConfirm?.();
              }}
              disabled={readOnly}
              aria-label={`Confirm ${copy.label}`}
              data-step-check={field}
              initial={reducedMotion ? false : { scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={reducedMotion ? { opacity: 0 } : { scale: 0.4, opacity: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.25, ease: EASE }}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#007A2F] text-white shadow-[0_4px_12px_rgba(0,122,47,0.25)] transition-colors hover:bg-[#00682B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#007A2F] disabled:cursor-default disabled:hover:bg-[#007A2F]"
            >
              <Check className="h-6 w-6" strokeWidth={3} aria-hidden="true" />
            </motion.button>
          ) : null}
        </AnimatePresence>
      </div>
      {outOfRange ? (
        <p
          id={rangeId}
          data-step-range={field}
          data-wrong={clearlyWrong ? "true" : undefined}
          aria-live="polite"
          className={`-mt-1 text-base ${clearlyWrong ? "font-semibold text-[#B42318]" : "font-light text-[#8796A8]"}`}
        >
          {RANGE_TEXT[field]}
        </p>
      ) : null}
      {note}
    </div>
  );
}

/** The example is the calculator's house defaults. */
const SAMPLE_VALUES: FieldValues = {
  portfolio: String(DEFAULT_STATE.portfolioValue),
  fee: DEFAULT_STATE.annualFeePercent.toFixed(1),
  years: String(DEFAULT_STATE.years),
  growth: DEFAULT_STATE.annualGrowthPercent.toFixed(1),
};

export function ProgressiveCalculator({
  hasScenario,
  initialMode,
  productionCommit,
  searchParams,
}: {
  /** The link already carries calculator numbers: open the full calculator,
   *  unless it is a plain steady-return link the step form can show, which
   *  lands on the folded line plus the answer. */
  hasScenario: boolean;
  initialMode?: CalculatorMode;
  productionCommit: string;
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const reducedMotion = Boolean(useReducedMotion());
  const wide = useWideLayout();

  const [values, setValues] = useState<FieldValues>(() => {
    if (!hasScenario) return { portfolio: "", fee: "", years: "", growth: "" };
    const linked = parseDetailedCalculatorState(toQuery(searchParams));
    return {
      portfolio: String(Math.round(linked.portfolioValue)),
      fee: percentText(linked.annualFeePercent),
      years: String(linked.years),
      growth: percentText(linked.annualGrowthPercent),
    };
  });
  const [linkedRun] = useState<Run | null>(() => (hasScenario ? answerRunFromLink(searchParams) : null));
  const [revealed, setRevealed] = useState(hasScenario ? FIELD_ORDER.length : 1);
  const [view, setView] = useState<View | null>(linkedRun ? "results" : hasScenario ? "link" : null);
  const [run, setRun] = useState<Run | null>(linkedRun);
  const [runCount, setRunCount] = useState(linkedRun ? 1 : 0);
  const [mode, setMode] = useState<"mine" | "example">("mine");
  /* After Go the form folds to one line and the answer takes its place
     (David, 2026-11-10). Edit opens it again. */
  const [folded, setFolded] = useState(Boolean(linkedRun));
  /* The example plays itself: each value types in, its check appears, and
     the next field slides out, ending on Go. */
  const [exampleValues, setExampleValues] = useState<FieldValues>({ portfolio: "", fee: "", years: "", growth: "" });
  const [exampleRevealed, setExampleRevealed] = useState(1);
  const [examplePlayId, setExamplePlayId] = useState(0);
  const isExample = mode === "example";

  const inputRefs = useRef<Partial<Record<FieldKey, HTMLInputElement | null>>>({});
  const goRef = useRef<HTMLButtonElement | null>(null);
  const formTopRef = useRef<HTMLDivElement | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);
  const focusNext = useRef<FieldKey | "go" | null>(null);
  const scrollToResults = useRef(false);

  const shownValues = isExample ? exampleValues : values;
  const shownRevealed = isExample ? exampleRevealed : revealed;
  const allValid = FIELD_ORDER.every((field) => isValid(field, shownValues[field]));
  /* Folded whenever there is an answer on screen, including the Advanced
     Calculator, so the boxes above never disagree with the numbers below. */
  const showFolded = folded && run !== null && (view === "results" || view === "market" || view === "advanced");
  /* Boxes reopened and changed: the answer below is for the old numbers
     until Go is pressed again, so it fades back. */
  const stale =
    !showFolded &&
    run !== null &&
    (view === "results" || view === "market" || view === "advanced") &&
    (parseValue("portfolio", shownValues.portfolio) !== run.portfolio ||
      parseValue("fee", shownValues.fee) !== run.fee ||
      parseValue("years", shownValues.years) !== run.years ||
      parseValue("growth", shownValues.growth) !== run.growth);

  useEffect(() => {
    if (!isExample) return;
    const timers: number[] = [];
    const at = (ms: number, step: () => void) => timers.push(window.setTimeout(step, ms));
    if (reducedMotion) {
      at(0, () => {
        setExampleValues(SAMPLE_VALUES);
        setExampleRevealed(FIELD_ORDER.length);
      });
    } else {
      let time = 350;
      FIELD_ORDER.forEach((field, index) => {
        if (index > 0) {
          at(time, () => setExampleRevealed(index + 1));
          time += 450;
        }
        const target = displayValue(field, SAMPLE_VALUES[field]);
        for (let typed = 1; typed <= target.length; typed += 1) {
          const shown = target.slice(0, typed);
          at(time, () =>
            setExampleValues((current) => ({ ...current, [field]: shown.replace(/[$,]/g, "") })),
          );
          time += 70;
        }
        time += 550;
      });
    }
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [isExample, examplePlayId, reducedMotion]);

  const chooseMode = (next: "mine" | "example") => {
    if (next === "example") {
      setExampleValues({ portfolio: "", fee: "", years: "", growth: "" });
      setExampleRevealed(1);
      setExamplePlayId((id) => id + 1);
    }
    setFolded(false);
    setMode(next);
  };

  useEffect(() => {
    const target = focusNext.current;
    if (!target) return;
    focusNext.current = null;
    const node = target === "go" ? goRef.current : inputRefs.current[target];
    if (!node) return;
    node.focus({ preventScroll: true });
    // Once the new box has slid out, make sure it is not under the keyboard.
    window.setTimeout(() => keepInView(node, !reducedMotion), reducedMotion ? 0 : 560);
  });

  /* The answer takes the form's seat. If the visitor had scrolled so the
     folded line sits off screen, bring it back once the fold has settled:
     a scroll started while the panels are still sizing gets cancelled. */
  useEffect(() => {
    if (!scrollToResults.current) return;
    scrollToResults.current = false;
    const timer = window.setTimeout(() => {
      const node = formTopRef.current;
      if (!node) return;
      const top = node.getBoundingClientRect().top;
      if (top < 0 || top > window.innerHeight * 0.35) {
        node.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
      }
    }, reducedMotion ? 0 : 560);
    return () => window.clearTimeout(timer);
  }, [runCount, reducedMotion]);

  /* How many runs actually reach the visitor's eyes: one event per run when
     the first answer row is at least half on screen. */
  useEffect(() => {
    if (runCount === 0 || view !== "results") return;
    const root = resultsRef.current;
    if (!root || typeof IntersectionObserver === "undefined") return;
    let observer: IntersectionObserver | null = null;
    const start = window.setTimeout(() => {
      const target = root.querySelector("[data-step-answer]") ?? root.firstElementChild;
      if (!target) return;
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            capturePostHogEvent("calculator_result_seen", { run: runCount, mode });
            observer?.disconnect();
          }
        },
        { threshold: 0.5 },
      );
      observer.observe(target);
    }, 300);
    return () => {
      window.clearTimeout(start);
      observer?.disconnect();
    };
  }, [runCount, view, mode]);

  const confirm = (field: FieldKey) => {
    const index = FIELD_ORDER.indexOf(field);
    const next = FIELD_ORDER[index + 1];
    if (next) {
      setRevealed((count) => Math.max(count, index + 2));
      focusNext.current = next;
    } else {
      focusNext.current = "go";
    }
  };

  const runNumbers = () => {
    if (!allValid) return;
    setRun({
      portfolio: parseValue("portfolio", shownValues.portfolio) ?? DEFAULT_STATE.portfolioValue,
      fee: parseValue("fee", shownValues.fee) ?? DEFAULT_STATE.annualFeePercent,
      years: parseValue("years", shownValues.years) ?? DEFAULT_STATE.years,
      growth: parseValue("growth", shownValues.growth) ?? DEFAULT_STATE.annualGrowthPercent,
    });
    // Go always shows the answer, even after the Advanced Calculator was
    // opened (David's video, 2026-11-11: Go used to reopen Market return).
    setView("results");
    setRunCount((count) => count + 1);
    setFolded(true);
    scrollToResults.current = true;
    capturePostHogEvent("calculator_go", { mode });
  };

  const editNumbers = () => {
    setFolded(false);
  };

  const openFullCalculator = (next: "advanced" | "market") => {
    setView(next);
    setRunCount((count) => count + 1);
  };

  // The full calculator, seeded from the visitor's run (or the original link).
  let calculator: ReactNode = null;
  if (view === "link") {
    calculator = (
      <CanonCalculatorExperience
        experienceMode="sww_calculator"
        initialMode={initialMode}
        productionCommit={productionCommit}
        searchParams={searchParams}
        showStickyHeader
        variantId="calculator-canon"
      />
    );
  } else if (view && run) {
    const query = toQuery(searchParams);
    for (const key of Array.from(query.keys())) if (SCENARIO_KEYS.has(key)) query.delete(key);
    query.set("portfolio", String(run.portfolio));
    query.set("fee", String(run.fee));
    query.set("years", String(run.years));
    query.set("growth", String(run.growth));
    query.set("flat", String(DEFAULT_STATE.annualFlatFee));
    query.set("return", view === "market" ? "market" : "steady");
    const runParams = Object.fromEntries(query.entries());

    calculator = (
      <CanonCalculatorExperience
        key={`${runCount}-${view}`}
        experienceMode="sww_calculator"
        initialMode={view === "market" ? "advanced" : "basic"}
        productionCommit={productionCommit}
        searchParams={runParams}
        // The answer sits right under the folded line (idea B4), so the
        // savings bar stays out of the way there.
        showStickyHeader={view !== "results"}
        simpleView={view === "results"}
        resultsReplacement={view === "results" ? (share: ReactNode) => <FeeAnswer run={run} share={share} /> : null}
        afterResults={
          view === "results" ? (
            <div data-step-next-actions>
              <button
                type="button"
                onClick={() => openFullCalculator("market")}
                className="w-full rounded-lg bg-[#064B84] px-6 py-6 text-center text-xl font-bold leading-snug text-white shadow-[0_8px_20px_rgba(6,75,132,0.25)] transition-colors hover:bg-[#053B6A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#064B84] sm:text-2xl"
              >
                Use market returns with our Advanced Calculator
              </button>
            </div>
          ) : null
        }
        variantId="calculator-canon"
      />
    );
  }

  return (
    <div data-step-calculator>
      <div ref={formTopRef} className="scroll-mt-24 px-5 pt-6 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-center gap-4" role="group" aria-label="Which numbers to use" data-calculator-mode>
            <ModeChoice active={!isExample} onClick={() => chooseMode("mine")}>
              Use my numbers
            </ModeChoice>
            <span aria-hidden="true" className="h-5 w-px bg-[#B8C7D6]" />
            <ModeChoice active={isExample} onClick={() => chooseMode("example")}>
              See example
            </ModeChoice>
          </div>
          <AnimatePresence initial={false} mode="popLayout">
            {showFolded && run ? (
              <motion.div
                key="folded"
                data-step-folded
                initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                transition={{ duration: reducedMotion ? 0 : 0.3, ease: EASE }}
                className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 rounded-md border border-[#C9D8E4] bg-white px-3 py-2 text-base font-bold sm:gap-x-4 sm:px-4 sm:text-lg text-[#10233A] tabular-nums"
              >
                <span>
                  {isExample ? <span className="mr-2 font-semibold text-[#52657A]">Example:</span> : null}
                  {formatCurrency(run.portfolio)} &middot; {percentText(run.fee)}% &middot; {run.years} yrs &middot;{" "}
                  {percentText(run.growth)}%
                </span>
                <button
                  type="button"
                  onClick={editNumbers}
                  data-step-edit
                  className="inline-flex min-h-11 items-center rounded-md border border-[#064B84] px-3 text-base font-bold text-[#064B84] sm:px-4 hover:bg-[#EAF1F8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#064B84]"
                >
                  Edit
                </button>
              </motion.div>
            ) : null}
          </AnimatePresence>
          {showFolded ? null : (

          <div data-step-form data-step-mode={mode} className={ROW_CLASS}>
            {/* initial={false}: whatever is on screen at first paint (the
                Portfolio Value field, or every field on a shared link) is
                server-rendered in place; only fields the visitor unlocks
                slide in. */}
            <AnimatePresence initial={false}>
              {FIELD_ORDER.slice(0, shownRevealed).map((field, index) => (
                <SlideIn
                  key={`${mode}-${examplePlayId}-${field}`}
                  first={index === 0}
                  horizontal={wide}
                  reducedMotion={reducedMotion}
                  row
                >
                  {isExample ? (
                    <FieldRow
                      field={field}
                      idPrefix="example"
                      isLast={field === "growth" && allValid}
                      note={field === "fee" ? <FeeInDollars portfolio={exampleValues.portfolio} fee={exampleValues.fee} /> : null}
                      onGo={runNumbers}
                      pulse
                      readOnly
                      reducedMotion={reducedMotion}
                      value={exampleValues[field]}
                    />
                  ) : (
                    <FieldRow
                      field={field}
                      idPrefix="step"
                      inputRef={(node) => {
                        inputRefs.current[field] = node;
                      }}
                      isLast={field === "growth" && allValid}
                      note={field === "fee" ? <FeeInDollars portfolio={values.portfolio} fee={values.fee} /> : null}
                      onChange={(text) => setValues((current) => ({ ...current, [field]: text }))}
                      onConfirm={() => confirm(field)}
                      onGo={runNumbers}
                      reducedMotion={reducedMotion}
                      value={values[field]}
                    />
                  )}
                </SlideIn>
              ))}
            </AnimatePresence>
          </div>
          )}
        </div>
      </div>

      <div
        ref={resultsRef}
        data-step-results
        data-stale={stale ? "true" : undefined}
        className={`scroll-mt-24 pt-6 transition-opacity duration-300 ${stale ? "opacity-35" : ""}`}
      >
        {calculator}
      </div>
      {calculator ? null : <div className="pb-16" />}
    </div>
  );
}
