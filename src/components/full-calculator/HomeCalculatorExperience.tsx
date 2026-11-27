"use client";

// Firm-site copy (smarterwaywealth.com, same file name) for the hidden
// /calculator page only (fee-lab stage 1, section 1). Not this site's
// canon-mirrored file of the same name, which is unchanged. The CANON banner
// below belongs to the firm site's copy.

// CANON: shared verbatim with the sister repo (youarepayingtoomuch.com,
// D:\ria-marketing-page). Edit both repos in the same session or CI fails.
// See CALCULATOR-CANON.md.

import { useEffect, useRef, useState, type ReactNode } from "react";
import { formatCurrency, formatCurrencyFloored } from "@/lib/format";
import type { ProjectionYear } from "@/lib/feeProjection";
import { RollingCurrencyOdometer } from "@/components/Odometer";
import { ScrollReveal } from "@/components/ScrollReveal";
export type CalculatorSimpleControlNodes = {
  advisoryFee: ReactNode;
  feeSchedule?: ReactNode;
  growth: ReactNode;
  portfolio: ReactNode;
  years: ReactNode;
};

type CalculatorAssumptionPatch = {
  annualFlatFee?: number;
  annualFeePercent?: number;
  annualGrowthPercent?: number;
  portfolioValue?: number;
  years?: number;
};

const FEE_GAP_HINT_INITIAL_DELAY_MS = 1200;
const FEE_GAP_HINT_VISIBLE_MS = 3000;
const FEE_GAP_HINT_REDUCED_VISIBLE_MS = 1400;
const FEE_GAP_HINT_REPEAT_MS = 10000;
const FEE_GAP_HINT_MAX_PLAYS = 5;

type HomeCalculatorExperienceProps = {
  series: ProjectionYear[];
  savings: number;
  finalValueWithoutFees: number;
  finalValueWithFees: number;
  portfolioValue: number;
  years: number;
  annualGrowthPercent: number;
  annualFeePercent: number;
  mutualFundExpensePercent: number;
  totalAnnualFeePercent: number;
  totalAssetBasedFees: number;
  totalFlatFees: number;
  usesTieredFeeSchedule?: boolean;
  annualFlatFee: number;
  shareAction: ReactNode;
  disclosure: ReactNode;
  simpleControls: CalculatorSimpleControlNodes;
  /** True when a surrounding control row already draws the card and the
   *  page padding, so this component must not draw its own. */
  embedded?: boolean;
  showChartHeading?: boolean;
  /** Smarter Way Wealth's step-by-step /calculator (2026-11-10): show only
   *  the ending values, chart and the fee note under it, leaving out the
   *  assumption controls and the calculation-details tile. Optional; omitted
   *  everywhere else, so every other caller renders exactly as before. */
  resultsOnly?: boolean;
  /** Rendered directly under the fee note when present (the step-by-step
   *  calculator's two wide buttons). */
  afterResults?: ReactNode;
  /** Shown in place of the ending values and chart (the step calculator's answer). */
  resultsReplacement?: ReactNode;
  onAssumptionChange: (patch: CalculatorAssumptionPatch) => void;
};

function formatCompactCurrency(value: number) {
  const amount = value || 0;
  const absAmount = Math.abs(amount);

  if (absAmount >= 1000000) {
    const millions = amount / 1000000;
    const formatted = Number.isInteger(millions)
      ? millions.toFixed(0)
      : millions.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
    return `$${formatted}M`;
  }

  if (absAmount >= 1000) {
    const thousands = amount / 1000;
    const formatted = Number.isInteger(thousands)
      ? thousands.toFixed(0)
      : thousands.toFixed(1).replace(/0+$/, "").replace(/\.$/, "");
    return `$${formatted}k`;
  }

  return formatCurrency(amount);
}

// Animates a numeric value from 0 → `target` over `durationMs` whenever `active`
// flips from false → true. Live `target` changes while active keep the displayed
// value in sync: mid-animation the tick reads the latest target, and once the
// animation has finished the value snaps to any new target so input changes are
// always reflected — even while the element stays activated.
function useCountUp(target: number, durationMs: number, active: boolean): number {
  const [value, setValue] = useState(active ? target : 0);
  const targetRef = useRef(target);
  const animationDoneRef = useRef(false);

  useEffect(() => {
    targetRef.current = target;
    // After the entrance animation completes the rAF loop has stopped, so a
    // later target change would otherwise leave a stale value on screen. Snap
    // to the live target so the displayed number tracks the current inputs.
    if (active && animationDoneRef.current) {
      setValue(target);
    }
  }, [active, target]);

  useEffect(() => {
    if (!active) {
      animationDoneRef.current = false;
      setValue(0);
      return;
    }
    animationDoneRef.current = false;
    let raf = 0;
    let startTime: number | null = null;
    const startValue = 0;
    const tick = (now: number) => {
      if (startTime === null) startTime = now;
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / durationMs);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setValue(Math.round(startValue + (targetRef.current - startValue) * eased));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        animationDoneRef.current = true;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, durationMs]);

  return active ? value : 0;
}

function formatHeaderInputValue(value: number, decimals: number, useGrouping: boolean) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
    useGrouping,
  }).format(value);
}

function parseHeaderInputValue(value: string) {
  const parsed = Number.parseFloat(value.replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function clampHeaderInputValue(value: number, min: number, max: number, decimals: number) {
  const clamped = Math.min(max, Math.max(min, value));
  const multiplier = 10 ** decimals;
  return Math.round(clamped * multiplier) / multiplier;
}

function FinalHomeLineChart({
  annualFeePercent,
  chartActive,
  chartHintActive,
  chartPinned,
  finalValueWithFees,
  finalValueWithoutFees,
  mutualFundExpensePercent = 0,
  savings,
  series,
  usesTieredFeeSchedule = false,
  years,
  onGapEnter,
  onGapLeave,
  onGapToggle,
}: {
  annualFeePercent: number;
  chartActive: boolean;
  chartHintActive: boolean;
  chartPinned: boolean;
  finalValueWithFees: number;
  finalValueWithoutFees: number;
  mutualFundExpensePercent?: number;
  savings: number;
  series: ProjectionYear[];
  usesTieredFeeSchedule?: boolean;
  years: number;
  onGapEnter: () => void;
  onGapLeave: () => void;
  onGapToggle: () => void;
}) {
  const hasSeparateFundExpense = usesTieredFeeSchedule && mutualFundExpensePercent > 0;
  const feeLoadedVisibleLabel = usesTieredFeeSchedule
    ? hasSeparateFundExpense
      ? `Tiered advisory schedule + ${mutualFundExpensePercent.toFixed(2)}% Fund/ETF expenses`
      : "Tiered advisory schedule"
    : "Asset-based fee";
  const feeLoadedAccessibleLabel = usesTieredFeeSchedule
    ? hasSeparateFundExpense
      ? `a tiered advisory schedule plus a separate Fund/ETF expense ratio of ${mutualFundExpensePercent.toFixed(2)} percent`
      : "a tiered advisory schedule"
    : "an asset-based fee";
  // Measured-pixel rendering: a ResizeObserver tracks the container's actual
  // width/height and we redraw the SVG against those live dimensions every
  // time the layout changes (viewport resize, slider edit reflow, etc.).
  // This is what lets the chart fill the card edge-to-edge on every device
  // instead of being letterboxed inside a fixed viewBox.
  const containerRef = useRef<HTMLDivElement | null>(null);
  // Sensible defaults keep SSR-rendered SVG and first client paint matching
  // — the ResizeObserver overwrites these on mount within one frame.
  const [size, setSize] = useState<{ w: number; h: number }>({ w: 1040, h: 305 });
  // Tap/focus-to-highlight: touch (and keyboard) users can activate an
  // endpoint marker to read that scenario's ending value inline on the chart.
  const [activePoint, setActivePoint] = useState<"flat" | "aum" | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width > 40 && rect.height > 40) {
      setSize({ w: rect.width, h: rect.height });
    }
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      if (width > 40 && height > 40) {
        setSize({ w: width, h: height });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { w: width, h: height } = size;
  // Tight padding: Y-tick labels live inside the plot, x-axis labels live in
  // the bottom strip, and there is no right-side endpoint annotation anymore.
  const isNarrow = width < 640;
  const pad = { top: 12, right: 10, bottom: isNarrow ? 24 : 30, left: 10 };
  const plotWidth = Math.max(1, width - pad.left - pad.right);
  const plotHeight = Math.max(1, height - pad.top - pad.bottom);
  const maxYear = Math.max(1, years, ...series.map((row) => row.year));
  const actualMaxValue = Math.max(finalValueWithoutFees, finalValueWithFees, ...series.map((row) => row.withoutFees));
  const actualMinValue = Math.min(...series.flatMap((row) => [row.withoutFees, row.withFees]));
  // Mobile declutter: fewer Y gridlines/labels on narrow viewports so the
  // chart reads cleanly at ~390px. Desktop keeps the denser axis.
  const yTickTarget = isNarrow ? 3 : 5;
  const rawTickStep = actualMaxValue / yTickTarget;
  const tickExponent = Math.floor(Math.log10(Math.max(1, rawTickStep)));
  const tickMagnitude = 10 ** tickExponent;
  const tickBase = rawTickStep / tickMagnitude;
  const yTickStep =
    (tickBase <= 1 ? 1 : tickBase <= 2 ? 2 : tickBase <= 5 ? 5 : 10) * tickMagnitude;
  const maxValue = yTickStep * Math.ceil(actualMaxValue / yTickStep);
  // Don't anchor the Y axis at $0 when the portfolio already starts well above
  // zero — that leaves a large dead band above the x-axis labels on mobile.
  const valueSpan = Math.max(1, actualMaxValue - actualMinValue);
  const minValue = Math.max(0, actualMinValue - valueSpan * 0.04);
  const valueRange = Math.max(1, maxValue - minValue);

  const point = (row: ProjectionYear, key: "withoutFees" | "withFees") => {
    const x = pad.left + (row.year / maxYear) * plotWidth;
    const y = pad.top + (1 - (row[key] - minValue) / valueRange) * plotHeight;
    return [x, y] as const;
  };

  const pathFor = (key: "withoutFees" | "withFees") =>
    series
      .map((row, index) => {
        const [x, y] = point(row, key);
        return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(" ");

  const gapAreaPath =
    series
      .map((row, index) => {
        const [x, y] = point(row, "withoutFees");
        return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(" ") +
    " " +
    [...series]
      .reverse()
      .map((row) => {
        const [x, y] = point(row, "withFees");
        return `L ${x.toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(" ") +
    " Z";

  const yTicks = Array.from({ length: Math.round(maxValue / yTickStep) }, (_, index) => {
    const value = yTickStep * (index + 1);
    const ratio = value / maxValue;
    const y = pad.top + (1 - ratio) * plotHeight;
    return { value, y, ratio };
  });

  const ending = series[series.length - 1];
  const [flatEndX, flatEndY] = point(ending, "withoutFees");
  const [aumEndX, aumEndY] = point(ending, "withFees");
  const yForValue = (value: number) => pad.top + (1 - (value - minValue) / valueRange) * plotHeight;
  const valueAtYear = (targetYear: number, key: "withoutFees" | "withFees") => {
    const nextIndex = series.findIndex((row) => row.year >= targetYear);
    if (nextIndex <= 0) return series[0]?.[key] ?? 0;
    const previous = series[nextIndex - 1];
    const next = series[nextIndex];
    if (!next) return previous[key];
    const span = Math.max(1, next.year - previous.year);
    const progress = (targetYear - previous.year) / span;
    return previous[key] + (next[key] - previous[key]) * progress;
  };
  // Savings pill — clamped to keep it inside the plot at narrow widths.
  // Pill is taller (58px) now to accommodate a primary amount + "over N years" subtitle.
  const desiredPillWidth = 217;
  const pillHeight = 58;
  const feeGapLabelWidth = Math.min(desiredPillWidth, Math.max(120, plotWidth - 16));
  const feeGapLabelRightOffset = Math.min(56, plotWidth * 0.1);
  const feeGapLabelX = Math.min(
    pad.left + plotWidth - feeGapLabelWidth - 8,
    pad.left + (plotWidth - feeGapLabelWidth) / 2 + feeGapLabelRightOffset,
  );
  const feeGapLabelY = Math.max(
    pad.top + 4,
    Math.min(pad.top + 24, height - pad.bottom - pillHeight - 4),
  );
  const feeGapConnectorLineY = feeGapLabelY + pillHeight / 2;
  const feeGapConnectorStartX = feeGapLabelX + feeGapLabelWidth;
  const feeGapConnectorMaxLength = Math.min(72, Math.max(42, plotWidth * 0.12));
  const feeGapConnectorMinLength = Math.min(24, feeGapConnectorMaxLength);
  const feeGapConnectorFallbackX = Math.min(pad.left + plotWidth - 8, feeGapConnectorStartX + feeGapConnectorMaxLength);
  const feeGapConnectorTargetX =
    Array.from({ length: 25 }, (_, index) => {
      const targetX = feeGapConnectorStartX + (feeGapConnectorMaxLength * index) / 24;
      return ((targetX - pad.left) / plotWidth) * maxYear;
    })
      .map((targetYear) => {
        const targetX = pad.left + (targetYear / maxYear) * plotWidth;
        const flatY = yForValue(valueAtYear(targetYear, "withoutFees"));
        const aumY = yForValue(valueAtYear(targetYear, "withFees"));
        const upperY = Math.min(flatY, aumY);
        const lowerY = Math.max(flatY, aumY);
        return { targetX, upperY, lowerY };
      })
      .filter(
        ({ targetX, upperY, lowerY }) =>
          targetX >= feeGapConnectorStartX + feeGapConnectorMinLength &&
          feeGapConnectorLineY >= upperY + 3 &&
          feeGapConnectorLineY <= lowerY - 3,
      )
      .at(-1)?.targetX ?? feeGapConnectorFallbackX;
  const chartHintOnly = chartHintActive && !chartActive;
  const animatedSavings = useCountUp(savings, 800, chartActive);
  const yearsLabel = `over ${years} ${years === 1 ? "year" : "years"}`;

  return (
    <div ref={containerRef} className="block h-full w-full">
      <svg
        className="block overflow-visible"
        width={width}
        height={height}
        role="img"
        aria-label={`Line chart comparing portfolio value under a flat fee and ${feeLoadedAccessibleLabel}`}
      >
        <defs>
          <clipPath id="final-home-line-gap-hint-clip">
            <path d={gapAreaPath} />
          </clipPath>
          <linearGradient id="final-home-line-gap-hint-wave" x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" stopColor="#D92D20" stopOpacity="0" />
            <stop offset="48%" stopColor="#D92D20" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#D92D20" stopOpacity="0" />
          </linearGradient>
          {/* The same red, and the same top-to-bottom fade, that the advanced
              calculator paints its fee wedge with. Both charts are showing the
              same quantity, so they should look like the same quantity. */}
          <linearGradient id="final-home-line-gap" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#D92D20" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#D92D20" stopOpacity="0.18" />
          </linearGradient>
        </defs>
        {yTicks.map((tick) => (
          <g key={tick.y}>
            <line
              x1={pad.left}
              x2={width - pad.right}
              y1={tick.y}
              y2={tick.y}
              stroke="#DCE4EB"
              strokeWidth="1"
            />
            <text
              x={pad.left + 4}
              y={tick.ratio === 1 || tick.ratio === 0 ? tick.y + 14 : tick.y - 6}
              textAnchor="start"
              fill="#52657A"
              fontSize="13"
              fontWeight="600"
            >
              {formatCompactCurrency(tick.value)}
            </text>
          </g>
        ))}

        {chartHintOnly ? (
          <g
            clipPath="url(#final-home-line-gap-hint-clip)"
            className="fee-gap-hint-layer pointer-events-none"
            aria-hidden="true"
          >
            <path d={gapAreaPath} fill="#D92D20" opacity="0.07" />
            <rect
              className="fee-gap-wave"
              x={pad.left - plotWidth}
              y={pad.top}
              width={plotWidth * 0.8}
              height={plotHeight}
              fill="url(#final-home-line-gap-hint-wave)"
            />
          </g>
        ) : null}
        <g opacity={chartActive ? "1" : "0"} className="transition-opacity duration-300">
          <path d={gapAreaPath} fill="url(#final-home-line-gap)" />
        </g>
        <path d={pathFor("withFees")} fill="none" stroke="#064B84" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <path d={pathFor("withoutFees")} fill="none" stroke="#108843" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <g
          opacity={chartActive ? "1" : "0"}
          className="transition-opacity duration-300"
          data-gap-toggle="line"
          role="button"
          tabIndex={chartActive ? 0 : -1}
          aria-label={chartPinned ? "Hide line chart fee gap" : "Show line chart fee gap"}
          aria-pressed={chartPinned}
          style={{ cursor: chartActive ? "pointer" : "default", pointerEvents: chartActive ? "all" : "none" }}
          onPointerDown={(event) => {
            event.preventDefault();
            onGapToggle();
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onGapToggle();
            }
          }}
        >
          <line
            x1={feeGapLabelX + feeGapLabelWidth}
            x2={feeGapConnectorTargetX}
            y1={feeGapConnectorLineY}
            y2={feeGapConnectorLineY}
            stroke="#10233A"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.85"
          />
          <rect
            x={feeGapLabelX}
            y={feeGapLabelY}
            width={feeGapLabelWidth}
            height={pillHeight}
            rx="10"
            fill="#10233A"
          />
          <text
            x={feeGapLabelX + feeGapLabelWidth / 2}
            y={feeGapLabelY + 24}
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="18"
            fontWeight="500"
          >
            {/* No asterisk here. SVG text concatenates with no separator, so a
                trailing glyph fuses onto the digits for a screen reader and for
                any text extractor — "$666,000" reads as "$666,000*" with no
                gap. The chart already has its own accessible description via
                the wedge's aria-label/aria-pressed toggle below, so nothing is
                lost by dropping the decorative mark here. */}
            {formatCurrencyFloored(animatedSavings)} lost to fees
          </text>
          <text
            x={feeGapLabelX + feeGapLabelWidth / 2}
            y={feeGapLabelY + 44}
            textAnchor="middle"
            fill="rgba(255,255,255,0.85)"
            fontSize="12"
            fontWeight="400"
          >
            {yearsLabel}
          </text>
        </g>

        {/* Invisible hit path traced over the differential wedge.
           Hover previews the gap; click/tap pins it independently of VS. */}
        <path
          d={gapAreaPath}
          fill="transparent"
          style={{ pointerEvents: "all", cursor: "pointer" }}
          role="button"
          tabIndex={0}
          aria-label={chartPinned ? "Hide line chart fee gap" : "Show line chart fee gap"}
          aria-pressed={chartPinned}
          onMouseEnter={onGapEnter}
          onMouseLeave={onGapLeave}
          onPointerDown={(event) => {
            event.preventDefault();
            onGapToggle();
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onGapToggle();
            }
          }}
        />

        {([
          {
            key: "aum" as const,
            cx: aumEndX,
            cy: aumEndY,
            color: "#064B84",
            label: feeLoadedVisibleLabel,
            value: finalValueWithFees,
          },
          {
            key: "flat" as const,
            cx: flatEndX,
            cy: flatEndY,
            color: "#108843",
            label: "Flat $100/mo fee",
            value: finalValueWithoutFees,
          },
        ]).map((pointMarker) => {
          const isPointActive = activePoint === pointMarker.key;
          const togglePoint = () =>
            setActivePoint((prev) => (prev === pointMarker.key ? null : pointMarker.key));
          const tipWidth = 150;
          const tipHeight = 40;
          const tipX = Math.min(
            Math.max(pad.left, pointMarker.cx - tipWidth - 12),
            pad.left + plotWidth - tipWidth,
          );
          const tipY = Math.max(pad.top, pointMarker.cy - tipHeight - 10);
          return (
            <g key={pointMarker.key}>
              <circle
                cx={pointMarker.cx}
                cy={pointMarker.cy}
                r="6"
                fill={pointMarker.color}
                stroke="#FFFFFF"
                strokeWidth="3"
              />
              {isPointActive ? (
                <circle
                  cx={pointMarker.cx}
                  cy={pointMarker.cy}
                  r="9"
                  fill="none"
                  stroke={pointMarker.color}
                  strokeWidth="2"
                  opacity="0.45"
                />
              ) : null}
              {/* 40px transparent hit target for comfortable touch activation. */}
              <circle
                cx={pointMarker.cx}
                cy={pointMarker.cy}
                r="20"
                fill="transparent"
                style={{ cursor: "pointer", pointerEvents: "all" }}
                role="button"
                tabIndex={0}
                aria-label={`${pointMarker.label} ending value ${formatCurrency(pointMarker.value)}`}
                aria-pressed={isPointActive}
                onPointerDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  togglePoint();
                }}
                onFocus={() => setActivePoint(pointMarker.key)}
                onBlur={() =>
                  setActivePoint((prev) => (prev === pointMarker.key ? null : prev))
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    togglePoint();
                  }
                }}
              />
              {isPointActive ? (
                <g className="pointer-events-none" aria-hidden="true">
                  <rect
                    x={tipX}
                    y={tipY}
                    width={tipWidth}
                    height={tipHeight}
                    rx="8"
                    fill="#10233A"
                  />
                  <text
                    x={tipX + 10}
                    y={tipY + 16}
                    fill="rgba(255,255,255,0.78)"
                    fontSize="10"
                    fontWeight="700"
                    style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}
                  >
                    {pointMarker.label}
                  </text>
                  <text
                    x={tipX + 10}
                    y={tipY + 32}
                    fill="#FFFFFF"
                    fontSize="14"
                    fontWeight="700"
                  >
                    {formatCurrencyFloored(pointMarker.value)}
                  </text>
                </g>
              ) : null}
            </g>
          );
        })}

        <text x={pad.left} y={height - 8} textAnchor="middle" fill="#52657A" fontSize="14" fontWeight="600">
          0
        </text>
        <text x={width - pad.right} y={height - 8} textAnchor="middle" fill="#52657A" fontSize="14" fontWeight="600">
          {maxYear}
        </text>
        <text x={width / 2} y={height - 8} textAnchor="middle" fill="#52657A" fontSize="15" fontWeight="700">
          Years
        </text>
        <title>{usesTieredFeeSchedule
          ? `${feeLoadedVisibleLabel} ${formatCurrency(finalValueWithFees)} versus flat fee ${formatCurrency(finalValueWithoutFees)}.`
          : `Asset-based fee ${formatCurrency(finalValueWithFees)} versus flat fee ${formatCurrency(finalValueWithoutFees)} at ${annualFeePercent.toFixed(2)}%.`}</title>
      </svg>
    </div>
  );
}

/**
 * The results, as arithmetic.
 *
 * Canon layout ported from youarepayingtoomuch.com (2026-08-11/12): this
 * replaced a blue card, a green card, a red "Difference" figure, a red
 * "Show" button and a pair of stacked bars — about 440px of coloured
 * rectangles on a 375px phone, to state two numbers and their difference.
 * Three lines in two columns do the same work in roughly a third of the
 * height.
 *
 * Two rules, both spanning the full grid: one above the column labels and
 * one under the second amount, so the block reads as a bounded subtraction
 * rather than a list. Colour appears exactly once, on the number the
 * visitor should leave with.
 *
 * Unlike the marketing-site original, the fee-load row label stays dynamic
 * for a tiered advisory schedule (and an optional separate fund/ETF expense
 * ratio) — this repo's calculator supports those, the marketing site's does
 * not.
 */
function SimpleMathResults({
  annualFeePercent,
  annualFlatFee,
  finalValueWithFees,
  finalValueWithoutFees,
  mutualFundExpensePercent = 0,
  savings,
  usesTieredFeeSchedule = false,
}: {
  annualFeePercent: number;
  annualFlatFee: number;
  finalValueWithFees: number;
  finalValueWithoutFees: number;
  mutualFundExpensePercent?: number;
  savings: number;
  usesTieredFeeSchedule?: boolean;
}) {
  /* The odometer rolls the figure as assumptions change, but only where
     there is room for the animation to read as motion rather than jitter. */
  const amount = (value: number) => (
    <>
      <span className="sm:hidden">{formatCurrencyFloored(value)}</span>
      <RollingCurrencyOdometer
        value={value}
        formatter={formatCurrencyFloored}
        duration={650}
        debounceMs={180}
        className="hidden sm:inline"
      />
    </>
  );
  const hasSeparateFundExpense = usesTieredFeeSchedule && mutualFundExpensePercent > 0;
  const feeLoadLabel = usesTieredFeeSchedule
    ? hasSeparateFundExpense
      ? `Paying tiered advisory fees (${annualFeePercent.toFixed(3)}% blended) + ${mutualFundExpensePercent.toFixed(2)}% Fund/ETF expenses`
      : `Paying tiered advisory fees (${annualFeePercent.toFixed(3)}% blended)`
    : `Paying ${annualFeePercent.toFixed(2)}% of assets`;
  const percentLost =
    finalValueWithoutFees > 0
      ? Math.min(100, Math.max(0, (savings / finalValueWithoutFees) * 100))
      : 0;
  /* Tiered-schedule callout: this repo's Save secondary surfaces must never
     let a tiered fee schedule read as a single scalar advisory rate, so the
     gap this row states stays attributed to "the tiered advisory schedule"
     (plus any separate fund/ETF expense) rather than to a generic percentage.
     The marketing site has no tiered-schedule mode, so this line is inert
     there — it renders only when usesTieredFeeSchedule is true. */
  const tieredWealthLostCaption = usesTieredFeeSchedule
    ? hasSeparateFundExpense
      ? `${percentLost.toFixed(1)}% of wealth lost to the tiered advisory schedule plus separate ${mutualFundExpensePercent.toFixed(2)}% Fund/ETF expenses.`
      : `${percentLost.toFixed(1)}% of wealth lost to the tiered advisory schedule.`
    : null;

  return (
    <section
      className="mx-4 mt-2 sm:mx-7 sm:mt-3"
      aria-label="Ending value comparison"
      data-difference-summary
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4">
        {/* #52657A rather than #7A8899: at this size and weight the lighter
            grey scored 3.61:1 on white, under the 4.5:1 bar for normal text. */}
        <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#52657A]">
          Portfolio value
        </p>
        <p className="text-right text-[12px] font-bold uppercase tracking-[0.14em] text-[#52657A]">
          Amount
        </p>

        {/* The rule sits under the labels, not over them, so it separates the
            headings from the figures rather than fencing the block off from
            the chart above it. */}
        <div className="col-span-2 mt-1.5 h-px w-full bg-[#10233A]" />

        <p className="mt-4 text-[15px] leading-snug text-[#10233A] sm:text-base">
          Paying {formatCurrency(annualFlatFee / 12)} a month
        </p>
        <p className="mt-4 text-right text-[19px] font-bold leading-none tabular-nums text-[#10233A] sm:text-2xl">
          {amount(finalValueWithoutFees)}
        </p>

        <p className="mt-3 text-[15px] leading-snug text-[#10233A] sm:text-base">
          {feeLoadLabel}
        </p>
        <p className="mt-3 text-right text-[19px] font-bold leading-none tabular-nums text-[#10233A] sm:text-2xl">
          {amount(finalValueWithFees)}
        </p>

        {/* The arithmetic rule, spanning both columns. It sits under the
            second operand, so the figure beneath reads as the result of a
            subtraction rather than a third free-standing number. */}
        <div className="col-span-2 mt-2 h-px w-full bg-[#10233A]" />

        {/* Set larger than the two operand labels above it: this is the line
            the visitor is meant to leave with. */}
        <p className="mt-3 text-[18px] font-bold leading-snug text-[#10233A] sm:text-xl">
          Difference
        </p>
        <p
          className="mt-3 text-right text-[22px] font-bold leading-none tabular-nums text-[#007A2F] sm:text-3xl"
          data-difference-amount
        >
          {amount(savings)}
        </p>

        {tieredWealthLostCaption ? (
          <p className="col-span-2 mt-2 text-[12px] leading-snug text-[#52657A]">
            {tieredWealthLostCaption}
          </p>
        ) : null}
      </div>
    </section>
  );
}

export function HomeCalculatorExperience(props: HomeCalculatorExperienceProps) {
  const {
    annualFeePercent,
    annualFlatFee,
    annualGrowthPercent,
    disclosure,
    finalValueWithFees,
    finalValueWithoutFees,
    mutualFundExpensePercent,
    onAssumptionChange,
    portfolioValue,
    series,
    shareAction,
    simpleControls,
    savings,
    totalAnnualFeePercent,
    totalAssetBasedFees,
    totalFlatFees,
    usesTieredFeeSchedule = false,
    years,
    showChartHeading = false,
    embedded = false,
    resultsOnly = false,
    afterResults = null,
    resultsReplacement = null,
  } = props;
  const [chartPinned, setChartPinned] = useState(false);
  const [hoverChart, setHoverChart] = useState(false);
  const [chartGapHintActive, setChartGapHintActive] = useState(false);
  const visualizationRef = useRef<HTMLDivElement | null>(null);
  const gapHintCancelledRef = useRef(false);
  const gapHintPlayCountRef = useRef(0);
  const gapHintTimeoutsRef = useRef<number[]>([]);
  const assumptionGrid = (
    // Same classes as the advanced calculator's assumptions band, in calculator
    // theme tokens rather than loose hexes, so the two cannot drift apart
    // again. Switching Advanced <-> Basic should not move a pixel here.
    <section
      className="grid gap-2 overflow-hidden border-b border-[var(--calc-border)] bg-[var(--calc-panel)] px-3 py-2 sm:px-7"
      aria-label="Calculator assumptions"
    >
      <div className="grid overflow-hidden rounded-md border border-[var(--calc-border)] bg-[var(--calc-panel)] md:grid-cols-2">
        <div className="border-b border-[var(--calc-border)] px-3 py-2 md:border-r">{simpleControls.portfolio}</div>
        <div className="border-b border-[var(--calc-border)] px-3 py-2">{simpleControls.advisoryFee}</div>
        <div className="border-b border-[var(--calc-border)] px-3 py-2 md:border-b-0 md:border-r">{simpleControls.years}</div>
        <div className="px-3 py-2">{simpleControls.growth}</div>
      </div>
      {simpleControls.feeSchedule}
    </section>
  );
  const clearGapHintTimers = () => {
    gapHintTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    gapHintTimeoutsRef.current = [];
  };
  const cancelGapHint = () => {
    gapHintCancelledRef.current = true;
    clearGapHintTimers();
    setChartGapHintActive(false);
  };
  /* The bars are gone, so the fee gap lives on the chart alone: tap or hover
     it to pin the overlay. The red "Show" button that used to drive both a
     chart pin and a bar pin together is retired with them. */
  const toggleChartGap = () => {
    cancelGapHint();
    setChartPinned((prev) => !prev);
    setHoverChart(false);
  };
  const chartActive = chartPinned || hoverChart;
  const chartGapHintVisible = chartGapHintActive && !chartPinned;
  useEffect(() => {
    if (gapHintCancelledRef.current || chartPinned) return;

    const element = visualizationRef.current;
    if (!element) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const visibleMs = prefersReducedMotion ? FEE_GAP_HINT_REDUCED_VISIBLE_MS : FEE_GAP_HINT_VISIBLE_MS;

    const queueTimeout = (callback: () => void, delay: number) => {
      const timeoutId = window.setTimeout(callback, delay);
      gapHintTimeoutsRef.current.push(timeoutId);
    };

    const playHint = () => {
      if (
        gapHintCancelledRef.current ||
        chartPinned ||
        gapHintPlayCountRef.current >= FEE_GAP_HINT_MAX_PLAYS
      ) {
        return;
      }

      gapHintPlayCountRef.current += 1;
      setChartGapHintActive(true);

      queueTimeout(() => {
        setChartGapHintActive(false);
      }, visibleMs);

      queueTimeout(() => {
        setChartGapHintActive(false);

        if (
          gapHintCancelledRef.current ||
          chartPinned ||
          gapHintPlayCountRef.current >= FEE_GAP_HINT_MAX_PLAYS
        ) {
          return;
        }

        playHint();
      }, FEE_GAP_HINT_REPEAT_MS);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || gapHintCancelledRef.current || chartPinned) return;

        queueTimeout(playHint, FEE_GAP_HINT_INITIAL_DELAY_MS);
        observer.disconnect();
      },
      { threshold: 0.35 }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      clearGapHintTimers();
    };
  }, [chartPinned]);

  useEffect(() => {
    if (chartPinned && chartGapHintActive) {
      setChartGapHintActive(false);
    }
  }, [chartGapHintActive, chartPinned]);

  return (
    <div
      className={
        embedded
          ? "relative z-10"
          : `section-shell relative z-10 pb-16 ${showChartHeading ? "pt-1 sm:pt-2" : "pt-5 sm:pt-6"}`
      }
    >
      {disclosure ? (
        <div className="mx-auto mb-4 max-w-3xl text-center [&_p]:mt-0">
          {disclosure}
        </div>
      ) : null}
      <div id="savings-section" className={embedded ? "" : "mx-auto max-w-[1380px]"}>
      <ScrollReveal
        className={
          embedded
            ? "overflow-hidden bg-[var(--calc-panel)]"
            : "overflow-hidden rounded-md border border-[#CFD9E3] bg-white shadow-[0_18px_45px_rgba(17,33,52,0.08)]"
        }
      >
        {resultsReplacement ? (
          resultsReplacement
        ) : (
          <>
        <SimpleMathResults
          annualFeePercent={annualFeePercent}
          annualFlatFee={annualFlatFee}
          finalValueWithFees={finalValueWithFees}
          finalValueWithoutFees={finalValueWithoutFees}
          mutualFundExpensePercent={mutualFundExpensePercent}
          savings={savings}
          usesTieredFeeSchedule={usesTieredFeeSchedule}
        />

        {showChartHeading ? (
          <ScrollReveal delay={0.08} className="mx-4 mt-5 sm:mx-7">
            <div className="border-t border-[#D7E0E8] pt-4">
              <h3 className="text-xl font-bold leading-tight tracking-normal text-[#10233A] sm:text-2xl">
                Your Portfolio Over Time
              </h3>
              <p className="mt-1 text-sm leading-6 text-[#52657A]">
                Same portfolio. Same market assumption. Different fee structure.
              </p>
            </div>
          </ScrollReveal>
        ) : null}

        <div ref={visualizationRef}>
          <section
            className="mx-4 mt-3 rounded-md border border-[#DFE6EE] bg-white px-1.5 py-2 sm:mx-7 sm:px-2"
            aria-label="Portfolio value over time"
          >
            <div className="h-[320px] w-full sm:h-[305px]">
              <FinalHomeLineChart
                annualFeePercent={annualFeePercent}
                chartActive={chartActive}
                chartHintActive={chartGapHintVisible}
                chartPinned={chartPinned}
                finalValueWithFees={finalValueWithFees}
                finalValueWithoutFees={finalValueWithoutFees}
                mutualFundExpensePercent={mutualFundExpensePercent}
                savings={savings}
                series={series}
                usesTieredFeeSchedule={usesTieredFeeSchedule}
                years={years}
                onGapEnter={() => setHoverChart(true)}
                onGapLeave={() => setHoverChart(false)}
                onGapToggle={toggleChartGap}
              />
            </div>
          </section>
        </div>
          </>
        )}

        <div className="mx-4 mt-3 space-y-1.5 rounded-md border border-[#D7E0E8] bg-[#F8FAFC] px-3 py-2 sm:mx-7">
          <p className="text-[12px] font-semibold leading-relaxed text-[#42556C] sm:text-[13px]">
            This calculator is an illustration, not a forecast or a guarantee, and should not be relied on for a precise
            cost analysis. Values are nominal and before taxes.
          </p>
        </div>

        {afterResults ? <div className="mx-4 mt-4 sm:mx-7">{afterResults}</div> : null}

        {resultsOnly ? (
          <div className="pb-5" />
        ) : (
          <>
            {/* Canon reorder (2026-08-11/12): the chart and results are the money
                shot, so nothing precedes them but the ending values. The
                assumption inputs used to open the card and pushed the chart most
                of a phone screen down; they now follow the visual, for visitors
                who want to swap in their own figures. */}
            <div className="mt-3 border-t border-[var(--calc-border)] pt-1">{assumptionGrid}</div>

            <div className="mx-4 mt-4 pb-5 sm:mx-7">
              <div className="mt-3">{shareAction}</div>
            </div>
          </>
        )}
      </ScrollReveal>
      </div>
    </div>
  );
}
