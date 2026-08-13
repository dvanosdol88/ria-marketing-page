"use client";

// CANON: shared verbatim with the sister repo (youarepayingtoomuch.com,
// D:\ria-marketing-page). Edit both repos in the same session or CI fails.
// See CALCULATOR-CANON.md.

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { formatCurrency } from "@/lib/format";
import { siteCalculatorConfig } from "@/lib/siteCalculatorConfig";
import type { ShareSummary, ShareSummaryInput } from "@/lib/shareSummary";
import { SocialShareRow } from "./SocialShareRow";

const CARD_WIDTH = 1200;
const CARD_HEIGHT = 630;
const FONT_STACK = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

const focusRing =
  "focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#66F0AC]";

const lightFocusRing =
  "focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#064B84]";

/**
 * Presentation of the expanded panel only (the "Share my results" toggle
 * button reads fine on either background unchanged). "dark" is the
 * original, byte-identical glass-on-navy treatment every existing caller
 * gets by default. "light" is additive — a white-card family matching
 * CalculationDetailsPanel, for callers that mount this panel outside a dark
 * section (docs/plans/2026-08-12-calculator-canon.md, Task A2.2).
 */
type ShareMyResultsTone = "dark" | "light";

const TONE_CLASSES: Record<
  ShareMyResultsTone,
  {
    panel: string;
    pollLabel: string;
    checkbox: string;
    panelButton: string;
    disclaimer: string;
    socialVariant: "dark" | "light";
  }
> = {
  dark: {
    panel: "mt-3 rounded-lg bg-white/8 p-4",
    pollLabel: "mt-4 flex min-h-11 items-center gap-2 text-sm font-semibold text-white/85",
    checkbox:
      "h-4 w-4 shrink-0 rounded border-white/40 bg-white/10 text-[#66F0AC] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#66F0AC]",
    panelButton:
      `flex min-h-11 items-center justify-center rounded-md border border-white/25 bg-white/5 px-3 text-center text-sm font-bold text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-45 ${focusRing}`,
    disclaimer: "mt-4 text-xs leading-5 text-white/70",
    socialVariant: "dark",
  },
  light: {
    panel: "mt-3 rounded-lg border border-[#DDE7EF] bg-[#F7F9FB] p-4",
    pollLabel: "mt-4 flex min-h-11 items-center gap-2 text-sm font-semibold text-[#10233A]",
    checkbox: `h-4 w-4 shrink-0 rounded border-[#AFC2D0] bg-white text-[#007A2F] ${lightFocusRing}`,
    panelButton:
      `flex min-h-11 items-center justify-center rounded-md border border-[#C9D8E4] bg-white px-3 text-center text-sm font-bold text-[#10233A] hover:bg-[#F4F7FA] disabled:cursor-not-allowed disabled:opacity-45 ${lightFocusRing}`,
    disclaimer: "mt-4 text-xs leading-5 text-[#52657A]",
    socialVariant: "light",
  },
};

type ShareCardData = {
  savings: number;
  flatEndingValue: number;
  traditionalEndingValue: number;
  portfolioValue: number;
  years: number;
  returnLabel: string;
  feeLabel: string;
  disclosure: string;
};

/**
 * Not every rendering engine implements CanvasRenderingContext2D.letterSpacing
 * (Safari added it in 17.4). Feature-detect and no-op on engines that lack it
 * — the card is still fully legible without manual tracking.
 */
function setLetterSpacing(ctx: CanvasRenderingContext2D, value: string) {
  const styled = ctx as CanvasRenderingContext2D & { letterSpacing?: string };
  if (!("letterSpacing" in styled)) return;
  try {
    styled.letterSpacing = value;
  } catch {
    // Some engines expose the property but reject assignment; safe to ignore.
  }
}

/** Greedy word wrap using real glyph measurement so long strings (in
 * particular the compliance disclosure) never run off the card. */
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (current && ctx.measureText(candidate).width > maxWidth) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function roundedRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawChip(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  chip: { bg: string; border: string; label: string; labelColor: string; value: string; valueColor: string },
) {
  roundedRectPath(ctx, x, y, w, h, 12);
  ctx.fillStyle = chip.bg;
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = chip.border;
  ctx.stroke();

  ctx.fillStyle = chip.labelColor;
  ctx.font = `700 13px ${FONT_STACK}`;
  setLetterSpacing(ctx, "1px");
  ctx.fillText(chip.label, x + 20, y + 30);
  setLetterSpacing(ctx, "0px");

  ctx.fillStyle = chip.valueColor;
  ctx.font = `800 27px ${FONT_STACK}`;
  ctx.fillText(chip.value, x + 20, y + 62);
}

/**
 * Hand-rolled 1200x630 share card. Mirrors the brand mark in
 * src/app/opengraph-image.tsx. Task 4 ports this same layout to a
 * server-rendered ImageResponse for the /calculator/share-card route, so
 * keep this the single source of truth for the design.
 */
function drawShareCard(ctx: CanvasRenderingContext2D, data: ShareCardData) {
  const PAD_X = 80;

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  ctx.fillStyle = "#EEF0F5";
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  // Brand mark: three bars + wordmark, bottom-aligned.
  const barBaseline = 150;
  const bars: Array<{ h: number; color: string }> = [
    { h: 44, color: "#7ADCA6" },
    { h: 68, color: "#00A540" },
    { h: 92, color: "#007A2F" },
  ];
  let barX = PAD_X;
  for (const bar of bars) {
    roundedRectPath(ctx, barX, barBaseline - bar.h, 26, bar.h, 3);
    ctx.fillStyle = bar.color;
    ctx.fill();
    barX += 26 + 14;
  }
  const wordmarkX = barX + 18;
  ctx.fillStyle = "#10233A";
  ctx.font = `700 30px ${FONT_STACK}`;
  setLetterSpacing(ctx, "3px");
  ctx.fillText("SMARTER", wordmarkX, barBaseline - 30);
  ctx.fillStyle = "#007A2F";
  ctx.font = `700 15px ${FONT_STACK}`;
  setLetterSpacing(ctx, "5px");
  ctx.fillText("WAY WEALTH", wordmarkX, barBaseline - 4);
  setLetterSpacing(ctx, "0px");

  // Eyebrow.
  ctx.fillStyle = "#53606A";
  ctx.font = `700 14px ${FONT_STACK}`;
  ctx.textAlign = "right";
  setLetterSpacing(ctx, "1.5px");
  ctx.fillText("FEE COMPARISON · EDUCATIONAL ILLUSTRATION", CARD_WIDTH - PAD_X, 100);
  setLetterSpacing(ctx, "0px");
  ctx.textAlign = "left";

  const isPositive = data.savings >= 0;
  const accent = isPositive ? "#007A2F" : "#B42318";
  const contentWidth = CARD_WIDTH - PAD_X * 2;

  let cursorY = 210;
  ctx.fillStyle = accent;
  ctx.font = `800 22px ${FONT_STACK}`;
  setLetterSpacing(ctx, "1px");
  ctx.fillText(isPositive ? "POTENTIAL DIFFERENCE" : "DIFFERENCE IN THIS SCENARIO", PAD_X, cursorY);
  setLetterSpacing(ctx, "0px");
  cursorY += 88;

  ctx.fillStyle = accent;
  ctx.font = `800 100px ${FONT_STACK}`;
  ctx.fillText(formatCurrency(data.savings), PAD_X, cursorY);
  cursorY += 40;

  ctx.fillStyle = "#33465A";
  ctx.font = `600 22px ${FONT_STACK}`;
  const subLine =
    `over ${data.years} years · ${formatCurrency(data.portfolioValue)} starting portfolio · ${data.returnLabel}`;
  for (const line of wrapText(ctx, subLine, contentWidth)) {
    ctx.fillText(line, PAD_X, cursorY);
    cursorY += 28;
  }
  cursorY += 16;

  const chipGap = 24;
  const chipWidth = (contentWidth - chipGap) / 2;
  const chipHeight = 84;
  const chipY = cursorY;
  drawChip(ctx, PAD_X, chipY, chipWidth, chipHeight, {
    bg: "#E8F7EE",
    border: "#BFE7D1",
    label: "FLAT-FEE ENDING VALUE",
    labelColor: "#0A6E35",
    value: formatCurrency(data.flatEndingValue),
    valueColor: "#0A6E35",
  });
  drawChip(ctx, PAD_X + chipWidth + chipGap, chipY, chipWidth, chipHeight, {
    bg: "#EAF1F8",
    border: "#C9D8E4",
    label: "TRADITIONAL ENDING VALUE",
    labelColor: "#064B84",
    value: formatCurrency(data.traditionalEndingValue),
    valueColor: "#062B43",
  });
  cursorY = chipY + chipHeight + 28;

  ctx.fillStyle = "#53606A";
  ctx.font = `600 16px ${FONT_STACK}`;
  for (const line of wrapText(ctx, data.feeLabel, contentWidth)) {
    ctx.fillText(line, PAD_X, cursorY);
    cursorY += 20;
  }

  // Footer: rule, domain, wrapped disclosure, attribution.
  const footerRuleY = CARD_HEIGHT - 100;
  ctx.strokeStyle = "#C9D8E4";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(PAD_X, footerRuleY);
  ctx.lineTo(CARD_WIDTH - PAD_X, footerRuleY);
  ctx.stroke();

  let footerY = footerRuleY + 26;
  ctx.fillStyle = "#53606A";
  ctx.font = `700 15px ${FONT_STACK}`;
  ctx.fillText(siteCalculatorConfig.displayDomain, PAD_X, footerY);

  footerY += 22;
  ctx.font = `400 14px ${FONT_STACK}`;
  for (const line of wrapText(ctx, data.disclosure, contentWidth)) {
    ctx.fillText(line, PAD_X, footerY);
    footerY += 18;
  }

  ctx.font = `700 14px ${FONT_STACK}`;
  ctx.fillText(siteCalculatorConfig.brandAttributionLine, PAD_X, footerY);
}

export function ShareMyResults({
  summary,
  summaryInput,
  shareCardPath,
  canonicalUrl,
  open: openProp,
  onOpenChange,
  tone = "dark",
}: {
  /** buildShareSummary(...) from the parent, built once alongside
   * summaryInput so the page-level SocialShareRow (which needs
   * socialText/redditTitle before this panel is ever opened) and this
   * panel's copy/email/native-share text can never disagree. Null until
   * canonicalUrl resolves. */
  summary: ShareSummary | null;
  /** Raw inputs behind `summary`, still needed here for the canvas share
   * card, which draws from the individual figures rather than the
   * assembled text. */
  summaryInput: Omit<ShareSummaryInput, "url">;
  shareCardPath: string;
  /** origin + /calculator?<buildDetailedCalculatorQuery(state)> from the
   * parent, computed synchronously from the same state that produces
   * summary/summaryInput. Passed in (rather than read back off
   * window.location) so the share URL below can never lag the on-screen
   * scenario by a render: reading window.location.href here would race the
   * parent's own history.replaceState effect, since child effects run
   * before parent effects within the same commit. Empty string until the
   * parent has resolved window.location.origin post-mount. */
  canonicalUrl: string;
  /** Optional controlled open state so the poll's "Share my results" button
   * (rendered by a sibling section) can open this same panel. Falls back to
   * internal state when the parent doesn't manage it. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Additive, optional — see TONE_CLASSES above. Defaults to "dark", the
   *  original styling, so every existing caller is unaffected. */
  tone?: ShareMyResultsTone;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = openProp ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const toneClasses = TONE_CLASSES[tone];
  const [canNativeShare, setCanNativeShare] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [copyLinkStatus, setCopyLinkStatus] = useState("Copy link");
  const [copySummaryStatus, setCopySummaryStatus] = useState("Copy summary");
  const [includePoll, setIncludePoll] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Determined post-mount so server and first client render agree (no
  // hydration mismatch) — navigator.share is undefined during SSR.
  useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  useEffect(() => {
    if (!open || !summary) return;
    const canvas = document.createElement("canvas");
    canvas.width = CARD_WIDTH;
    canvas.height = CARD_HEIGHT;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      // No canvas support (or a test/SSR environment without one) — fall
      // back to the server-rendered share-card route below instead of
      // crashing or showing a blank preview.
      canvasRef.current = null;
      setPreviewUrl(null);
      return;
    }
    drawShareCard(ctx, {
      savings: summaryInput.savings,
      flatEndingValue: summaryInput.flatEndingValue,
      traditionalEndingValue: summaryInput.traditionalEndingValue,
      portfolioValue: summaryInput.portfolioValue,
      years: summaryInput.years,
      returnLabel: summaryInput.returnLabel,
      feeLabel: summaryInput.feeLabel,
      disclosure: summary.disclosure,
    });
    canvasRef.current = canvas;
    setPreviewUrl(canvas.toDataURL("image/png"));
  }, [open, summary, summaryInput]);

  // The poll toggle only has an effect when this scenario actually produced
  // a poll line (positive savings + a resolved pollUrl) — pollIncluded is
  // false whenever summary.pollLine is null, regardless of checkbox state,
  // so the plain variants are always the fallback.
  const pollIncluded = includePoll && Boolean(summary?.pollLine);
  const shareBodyText = summary ? (pollIncluded && summary.textWithPoll ? summary.textWithPoll : summary.text) : "";
  const nativeShareText = summary
    ? (pollIncluded && summary.textWithPoll ? summary.textWithPoll : summary.shortLine)
    : "";

  const copyText = async (text: string, setStatus: (label: string) => void, defaultLabel: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setStatus("Copied");
    } catch {
      setStatus("Copy unavailable");
    }
    window.setTimeout(() => setStatus(defaultLabel), 1800);
  };

  const shareNative = async () => {
    if (!summary || typeof navigator.share !== "function") return;
    try {
      await navigator.share({ title: summary.title, text: nativeShareText, url: canonicalUrl });
    } catch {
      // The visitor cancelled the native share sheet or the platform
      // declined the request — nothing to surface back to them.
    }
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas || !summary) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = summary.imageFileName;
      anchor.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  };

  const mailtoHref = summary
    ? `mailto:?subject=${encodeURIComponent(summary.emailSubject)}&body=${encodeURIComponent(shareBodyText)}`
    : "mailto:";

  // Client-rendered canvas preview is the primary source; fall back to the
  // (Task 4) server-rendered share-card route when canvas isn't available.
  const previewSrc = previewUrl ?? shareCardPath;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="share-my-results-panel"
        data-posthog-cta="true"
        data-posthog-cta-label="Share my results"
        data-posthog-cta-location={siteCalculatorConfig.analytics.detailedCalculatorResultsLocation}
        className={`min-h-11 rounded-md bg-[#66F0AC] px-4 text-sm font-bold text-[#062B43] ${focusRing}`}
      >
        Share my results
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id="share-my-results-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.42, ease: [0.165, 0.84, 0.44, 1] }}
            className="w-full overflow-hidden"
          >
            <div className={toneClasses.panel}>
              {/* eslint-disable-next-line @next/next/no-img-element -- runtime canvas/data-URL preview is not eligible for next/image optimization */}
              <img
                src={previewSrc}
                alt="Preview of your shareable results card"
                className="w-full rounded-md"
                width={CARD_WIDTH}
                height={CARD_HEIGHT}
              />

              {summary?.pollLine ? (
                <label className={toneClasses.pollLabel}>
                  <input
                    type="checkbox"
                    checked={includePoll}
                    onChange={(event) => setIncludePoll(event.target.checked)}
                    className={toneClasses.checkbox}
                  />
                  Include the quick-poll question
                </label>
              ) : null}

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {canNativeShare ? (
                  <button
                    type="button"
                    onClick={shareNative}
                    data-posthog-cta="true"
                    data-posthog-cta-label="Share native"
                    data-posthog-cta-location={siteCalculatorConfig.analytics.shareMyResultsPanelLocation}
                    className={toneClasses.panelButton}
                  >
                    Share…
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => copyText(canonicalUrl, setCopyLinkStatus, "Copy link")}
                  disabled={!canonicalUrl}
                  data-posthog-cta="true"
                  data-posthog-cta-label="Copy share link"
                  data-posthog-cta-location={siteCalculatorConfig.analytics.shareMyResultsPanelLocation}
                  className={toneClasses.panelButton}
                >
                  {copyLinkStatus}
                </button>
                <button
                  type="button"
                  onClick={() => summary && copyText(shareBodyText, setCopySummaryStatus, "Copy summary")}
                  disabled={!summary}
                  data-posthog-cta="true"
                  data-posthog-cta-label="Copy summary"
                  data-posthog-cta-location={siteCalculatorConfig.analytics.shareMyResultsPanelLocation}
                  className={toneClasses.panelButton}
                >
                  {copySummaryStatus}
                </button>
                <a
                  href={mailtoHref}
                  data-posthog-cta="true"
                  data-posthog-cta-label="Email results"
                  data-posthog-cta-location={siteCalculatorConfig.analytics.shareMyResultsPanelLocation}
                  className={toneClasses.panelButton}
                >
                  Email results
                </a>
                <button
                  type="button"
                  onClick={downloadImage}
                  disabled={!previewUrl}
                  data-posthog-cta="true"
                  data-posthog-cta-label="Download share image"
                  data-posthog-cta-location={siteCalculatorConfig.analytics.shareMyResultsPanelLocation}
                  className={toneClasses.panelButton}
                >
                  Download image
                </button>
              </div>

              <div className="mt-4">
                <SocialShareRow
                  url={canonicalUrl || null}
                  socialText={summary?.socialText ?? ""}
                  redditTitle={summary?.redditTitle ?? ""}
                  location={siteCalculatorConfig.analytics.shareMyResultsPanelLocation}
                  variant={toneClasses.socialVariant}
                />
              </div>

              <p className={toneClasses.disclaimer}>
                The link reproduces this exact comparison. The image and summary include the required disclosures.
              </p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
