"use client";

// CANON: shared verbatim with the sister repo (youarepayingtoomuch.com,
// D:\ria-marketing-page). Edit both repos in the same session or CI fails.
// See CALCULATOR-CANON.md.

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, Download, Image as ImageIcon, Link2, Mail, Share2 } from "lucide-react";
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
 * original glass-on-navy treatment every existing caller gets by default.
 * "light" is a white-card family matching CalculationDetailsPanel, for
 * callers that mount this panel outside a dark section
 * (docs/plans/2026-08-12-calculator-canon.md, Task A2.2). The share-card
 * PREVIEW inside the panel is tone-independent — it depicts the actual
 * card artifact, which is always light.
 */
type ShareMyResultsTone = "dark" | "light";

const nativeTileBase =
  "flex min-h-11 w-[76px] flex-col items-center gap-1.5 rounded-2xl border px-1.5 pb-2 pt-2.5 text-center transition-all duration-200 hover:-translate-y-0.5";

const TONE_CLASSES: Record<
  ShareMyResultsTone,
  {
    panel: string;
    microLabel: string;
    pollLabel: string;
    checkbox: string;
    utilityButton: string;
    nativeTile: string;
    nativeTileLabel: string;
    disclaimer: string;
    socialVariant: "dark" | "light";
  }
> = {
  dark: {
    panel: "mt-3 rounded-xl bg-white/8 p-4 sm:p-5",
    microLabel: "text-[11px] font-extrabold uppercase tracking-[0.18em] text-white/60",
    pollLabel: "mt-4 flex min-h-11 items-center gap-2 text-sm font-semibold text-white/85",
    checkbox:
      "h-4 w-4 shrink-0 rounded border-white/40 bg-white/10 text-[#66F0AC] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#66F0AC]",
    utilityButton:
      `inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-white/25 bg-white/5 px-3 text-[13px] font-bold text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-45 ${focusRing}`,
    nativeTile: `${nativeTileBase} border-white/15 bg-white/5 hover:bg-white/10 ${focusRing}`,
    nativeTileLabel: "text-[11px] font-bold leading-none text-white/80",
    disclaimer: "mt-4 text-xs leading-5 text-white/70",
    socialVariant: "dark",
  },
  light: {
    panel: "mt-3 rounded-xl border border-[#DDE7EF] bg-[#F7F9FB] p-4 sm:p-5",
    microLabel: "text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#52657A]",
    pollLabel: "mt-4 flex min-h-11 items-center gap-2 text-sm font-semibold text-[#10233A]",
    checkbox: `h-4 w-4 shrink-0 rounded border-[#AFC2D0] bg-white text-[#007A2F] ${lightFocusRing}`,
    utilityButton:
      `inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-[#C9D8E4] bg-white px-3 text-[13px] font-bold text-[#10233A] hover:bg-[#F4F7FA] disabled:cursor-not-allowed disabled:opacity-45 ${lightFocusRing}`,
    nativeTile: `${nativeTileBase} border-[#E3EAF1] bg-white shadow-[0_2px_10px_rgba(17,33,52,0.05)] hover:border-[#C9D8E4] hover:shadow-[0_10px_24px_rgba(17,33,52,0.12)] ${lightFocusRing}`,
    nativeTileLabel: "text-[11px] font-bold leading-none text-[#33465A]",
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

/**
 * Copies text without depending on the async Clipboard API alone.
 *
 * David reported (2026-08-14) that neither copy button worked on his iPhone.
 * navigator.clipboard.writeText is the right modern call and it succeeds in a
 * desktop browser, but it is gated in exactly the places a mailed-QR visitor
 * arrives from: WebKit rejects it outside a tight user-gesture window, and the
 * in-app browsers (Gmail, LinkedIn, Instagram) reject it outright. The old
 * hidden-textarea + execCommand path is still honoured by every one of those
 * engines, so it runs as the fallback rather than the code giving up.
 *
 * The selection dance is the long-standing iOS recipe: a readonly textarea
 * cannot be selected there, and a 16px font size stops Safari zooming the page
 * when the element takes focus.
 */
async function writeToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Blocked or unavailable — fall through to the legacy path below, which
    // still runs inside this same user gesture.
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.top = "0";
    textarea.style.left = "-9999px";
    textarea.style.fontSize = "16px";
    document.body.appendChild(textarea);

    const selection = document.getSelection();
    const previousRange = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

    textarea.contentEditable = "true";
    textarea.readOnly = false;
    const range = document.createRange();
    range.selectNodeContents(textarea);
    selection?.removeAllRanges();
    selection?.addRange(range);
    textarea.setSelectionRange(0, text.length);

    const copied = document.execCommand("copy");
    document.body.removeChild(textarea);

    if (previousRange && selection) {
      selection.removeAllRanges();
      selection.addRange(previousRange);
    }
    return copied;
  } catch {
    return false;
  }
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
 * keep this the single source of truth for the design. The in-panel
 * preview below (ShareCardPreview) is a responsive DOM replica of this
 * exact layout — change them together.
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
  /* First person, because a share card is something a visitor posts about
     their own situation — "I could potentially save" is what they would
     actually say, where "Potential difference" reads like a spreadsheet
     header (David, 2026-08-14). The negative case keeps the neutral label:
     you cannot say you saved anything when the flat fee costs more. */
  ctx.fillText(isPositive ? "I COULD POTENTIALLY SAVE" : "DIFFERENCE IN THIS SCENARIO", PAD_X, cursorY);
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

/**
 * Responsive DOM replica of drawShareCard's 1200x630 layout. The old
 * approach — an <img> of the rendered canvas — shrank the whole 1200px
 * design to the panel's width, which on a phone left every line but the
 * savings figure illegible. Real text reflows instead of scaling, so the
 * preview stays readable at any width while depicting the same artifact
 * the download and the link's unfurl card carry. Change alongside
 * drawShareCard.
 */
function ShareCardPreview({
  data,
}: {
  data: ShareCardData;
}) {
  const isPositive = data.savings >= 0;
  const accentText = isPositive ? "text-[#007A2F]" : "text-[#B42318]";

  /* TYPE SIZES RAISED, 2026-08-16 (David: "what is being shared — text is too
     small"). Everything but the savings figure sat between 8px and 13px, which
     is caption type doing body-copy work: this block is the visitor's only
     look at what they are about to put their name on, and the numbers in it
     are the whole point. Each step below is one size class, not a redesign —
     the hierarchy is unchanged, it is just legible now. Nothing here scales the
     1200x630 canvas card (drawShareCard), which keeps its own proportions. */
  return (
    <div className="mt-2 overflow-hidden rounded-xl border border-[#D8DEE8] bg-[#EEF0F5] p-4 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
        <div className="flex items-end gap-2">
          <span className="flex items-end gap-[3px]" aria-hidden="true">
            <span className="h-[15px] w-[8px] rounded-[2px] bg-[#7ADCA6]" />
            <span className="h-[22px] w-[8px] rounded-[2px] bg-[#00A540]" />
            <span className="h-[29px] w-[8px] rounded-[2px] bg-[#007A2F]" />
          </span>
          <span className="leading-none">
            <span className="block text-[15px] font-bold tracking-[0.18em] text-[#10233A]">SMARTER</span>
            <span className="mt-[3px] block text-[9px] font-bold tracking-[0.3em] text-[#007A2F]">WAY WEALTH</span>
          </span>
        </div>
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#53606A]">
          Fee comparison · Educational illustration
        </p>
      </div>

      <p className={`mt-5 text-[13px] font-extrabold uppercase tracking-[0.1em] ${accentText}`}>
        {isPositive ? "I could potentially save" : "Difference in this scenario"}
      </p>
      <p className={`mt-1.5 text-4xl font-extrabold leading-none tabular-nums sm:text-5xl ${accentText}`}>
        {formatCurrency(data.savings)}
      </p>
      <p className="mt-2.5 text-[15px] font-semibold leading-6 text-[#33465A] sm:text-base">
        over {data.years} years · {formatCurrency(data.portfolioValue)} starting portfolio · {data.returnLabel}
      </p>

      <div className="mt-4 grid gap-2.5 min-[480px]:grid-cols-2">
        <div className="rounded-lg border border-[#BFE7D1] bg-[#E8F7EE] px-3.5 py-3">
          <p className="text-[12px] font-bold uppercase tracking-wider text-[#0A6E35]">Flat-fee ending value</p>
          <p className="mt-1 text-xl font-extrabold tabular-nums text-[#0A6E35] sm:text-2xl">
            {formatCurrency(data.flatEndingValue)}
          </p>
        </div>
        <div className="rounded-lg border border-[#C9D8E4] bg-[#EAF1F8] px-3.5 py-3">
          <p className="text-[12px] font-bold uppercase tracking-wider text-[#064B84]">Traditional ending value</p>
          <p className="mt-1 text-xl font-extrabold tabular-nums text-[#062B43] sm:text-2xl">
            {formatCurrency(data.traditionalEndingValue)}
          </p>
        </div>
      </div>

      <p className="mt-3 text-[13px] font-semibold text-[#53606A]">{data.feeLabel}</p>

      <div className="mt-4 border-t border-[#C9D8E4] pt-3">
        <p className="text-[13px] font-bold text-[#53606A]">{siteCalculatorConfig.displayDomain}</p>
        <p className="mt-1 text-[12px] leading-5 text-[#53606A]">{data.disclosure}</p>
        <p className="mt-1.5 text-[12px] font-bold text-[#53606A]">{siteCalculatorConfig.brandAttributionLine}</p>
      </div>
    </div>
  );
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
   * card and the DOM preview, which draw from the individual figures rather
   * than the assembled text. */
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
  const [copyImageStatus, setCopyImageStatus] = useState("Copy image");
  /** Confirmation shown below the copy row — see copyText. */
  const [copyNotice, setCopyNotice] = useState<string | null>(null);
  const [includePoll, setIncludePoll] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // Determined post-mount so server and first client render agree (no
  // hydration mismatch) — navigator.share is undefined during SSR.
  useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  // The canvas exists solely to produce the downloadable PNG now — the
  // visible preview is the DOM replica (ShareCardPreview) above it.
  useEffect(() => {
    if (!open || !summary) return;
    const canvas = document.createElement("canvas");
    canvas.width = CARD_WIDTH;
    canvas.height = CARD_HEIGHT;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      // No canvas support (or a test/SSR environment without one) — the
      // download button falls back to the server-rendered share-card route.
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

  // On a phone, the tapped toggle button often sits near the bottom of the
  // viewport, so the panel expands entirely below the fold — the exact
  // "I pressed Share and can barely see anything" failure. Once the expand
  // animation is underway, nudge the panel into view; block:"nearest" makes
  // this a no-op whenever it is already visible (desktop).
  useEffect(() => {
    if (!open) return;
    const timeout = window.setTimeout(() => {
      panelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 160);
    return () => window.clearTimeout(timeout);
  }, [open]);

  // The poll toggle only has an effect when this scenario actually produced
  // a poll line (positive savings + a resolved pollUrl) — pollIncluded is
  // false whenever summary.pollLine is null, regardless of checkbox state,
  // so the plain variants are always the fallback.
  const pollIncluded = includePoll && Boolean(summary?.pollLine);
  const shareBodyText = summary ? (pollIncluded && summary.textWithPoll ? summary.textWithPoll : summary.text) : "";
  const nativeShareText = summary
    ? (pollIncluded && summary.textWithPoll ? summary.textWithPoll : summary.shortLine)
    : "";

  /* Used only by the file share, which cannot pass url: alongside files (see
     shareNative). shortLine carries no URL of its own, so append one; the
     poll variant already ends with the "Run it with your own numbers" line,
     hence the guard against printing the same link twice. */
  const nativeShareTextWithLink =
    canonicalUrl && !nativeShareText.includes(canonicalUrl)
      ? `${nativeShareText}\n\n${canonicalUrl}`
      : nativeShareText;

  /* The button's own label was the only confirmation a copy had happened —
     and on a phone that label sits directly under the thumb that just pressed
     it, then reverts after 1.8 seconds. So the visitor's honest experience was
     "nothing happened" even when the copy succeeded. The label still changes
     (it reads well on a desktop), but the real answer now appears as a line
     beneath the row, where a finger is not covering it, and is announced to
     screen readers. */
  const copyText = async (text: string, setStatus: (label: string) => void, defaultLabel: string, noun: string) => {
    const copied = await writeToClipboard(text);
    setStatus(copied ? "Copied" : "Copy unavailable");
    setCopyNotice(
      copied
        ? `${noun} copied to your clipboard.`
        : `Couldn't reach the clipboard in this browser. Press and hold the ${noun.toLowerCase()} to copy it manually.`,
    );
    window.setTimeout(() => setStatus(defaultLabel), 1800);
  };

  /** The card as a real PNG File. Null whenever this engine gave us no canvas
   *  (the same condition the download button falls back for). */
  const cardImageBlob = async (): Promise<Blob | null> => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  };

  /* SHARES THE PICTURE, NOT THE LINK, 2026-08-16 (David: "can the image be
     just that, an image, so it's not a link? ... just viewing the image, I
     think, will be more powerful").

     Web Share Level 2 carries files, so on a phone the card itself now lands
     in the thread — iMessage, WhatsApp, Mail, Instagram — instead of a URL the
     recipient has to tap and wait for. The link is not lost: the card renders
     the domain on its own face, and the URL is appended to the shared text, so
     it travels underneath the picture exactly as David described.

     navigator.canShare({files}) is the only honest test. Both Safari and
     Chrome reject a files: payload they cannot carry by throwing from share(),
     which is indistinguishable from the visitor tapping Cancel — so asking
     first is what keeps the link-only fallback from being dead code. */
  const shareNative = async () => {
    if (!summary || typeof navigator.share !== "function") return;

    const blob = await cardImageBlob();
    if (blob) {
      const file = new File([blob], summary.imageFileName, { type: "image/png" });
      if (typeof navigator.canShare === "function" && navigator.canShare({ files: [file] })) {
        try {
          /* No url: alongside files — several implementations drop the whole
             payload rather than one field when they cannot carry both. The
             link rides in the text instead, where every implementation keeps
             it. */
          await navigator.share({ title: summary.title, text: nativeShareTextWithLink, files: [file] });
          return;
        } catch (error) {
          // A cancelled sheet is done; anything else falls through to the
          // link-only share below rather than leaving the visitor with nothing.
          if (error instanceof Error && error.name === "AbortError") return;
        }
      }
    }

    try {
      await navigator.share({ title: summary.title, text: nativeShareText, url: canonicalUrl });
    } catch {
      // The visitor cancelled the native share sheet or the platform
      // declined the request — nothing to surface back to them.
    }
  };

  /* The desktop counterpart to the file share: put the PNG on the clipboard so
     it can be pasted straight into an email, a document or a chat window.
     ClipboardItem is handed the PROMISE of the blob rather than an awaited
     one — Safari discards the write if the item is not constructed inside the
     gesture's own task, and Chrome accepts the promise form too. */
  const copyImage = async () => {
    if (!summary) return;
    const supported =
      typeof ClipboardItem === "function" && typeof navigator.clipboard?.write === "function";

    if (supported && canvasRef.current) {
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": cardImageBlob() as Promise<Blob> }),
        ]);
        setCopyImageStatus("Copied");
        setCopyNotice("Image copied to your clipboard.");
        window.setTimeout(() => setCopyImageStatus("Copy image"), 1800);
        return;
      } catch {
        // Fall through to the same advice the text copies give.
      }
    }

    setCopyImageStatus("Copy unavailable");
    setCopyNotice("Couldn't reach the clipboard in this browser. Use Download image instead.");
    window.setTimeout(() => setCopyImageStatus("Copy image"), 1800);
  };

  const downloadImage = () => {
    if (!summary) return;
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = summary.imageFileName;
        anchor.click();
        URL.revokeObjectURL(url);
      }, "image/png");
      return;
    }
    // No canvas on this engine — hand the browser the server-rendered
    // share-card route instead so the download still works.
    if (!shareCardPath) return;
    const anchor = document.createElement("a");
    anchor.href = shareCardPath;
    anchor.download = summary.imageFileName;
    anchor.click();
  };

  const mailtoHref = summary
    ? `mailto:?subject=${encodeURIComponent(summary.emailSubject)}&body=${encodeURIComponent(shareBodyText)}`
    : "mailto:";

  const CopyLinkIcon = copyLinkStatus === "Copied" ? Check : Link2;
  const CopySummaryIcon = copySummaryStatus === "Copied" ? Check : Copy;
  const CopyImageIcon = copyImageStatus === "Copied" ? Check : ImageIcon;

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
        /* Brand blue, not the mint green it opened in (David, 2026-08-14: "I do
           not like the minty green"). #064B84 is the navy the conversion card
           and the chart's accumulation line already use, so the button reads as
           the site's own rather than as a fourth accent. Its focus ring drops to
           the deeper #062B43 because the shared mint ring would have been
           near-invisible against a blue face. */
        className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[#064B84] px-4 text-sm font-bold text-white shadow-[0_6px_18px_rgba(6,75,132,0.26)] transition hover:bg-[#053B6A] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#062B43]"
      >
        <Share2 className="h-4 w-4" aria-hidden="true" />
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
            <div ref={panelRef} className={toneClasses.panel}>
              <p className={toneClasses.microLabel}>Your share card</p>
              <ShareCardPreview
                data={{
                  savings: summaryInput.savings,
                  flatEndingValue: summaryInput.flatEndingValue,
                  traditionalEndingValue: summaryInput.traditionalEndingValue,
                  portfolioValue: summaryInput.portfolioValue,
                  years: summaryInput.years,
                  returnLabel: summaryInput.returnLabel,
                  feeLabel: summaryInput.feeLabel,
                  disclosure: summary?.disclosure ?? "",
                }}
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

              <div className="mt-5">
                <p className={toneClasses.microLabel}>Share it</p>
                {/* Column below 480px so the three brand tiles keep one tidy
                    row and the native tile drops underneath, instead of the
                    flex split squeezing them into a 2/1/1 stagger. */}
                <div className="mt-2.5 flex flex-col items-start gap-3 min-[480px]:flex-row min-[480px]:flex-wrap">
                  <SocialShareRow
                    url={canonicalUrl || null}
                    socialText={summary?.socialText ?? ""}
                    redditTitle={summary?.redditTitle ?? ""}
                    location={siteCalculatorConfig.analytics.shareMyResultsPanelLocation}
                    variant={toneClasses.socialVariant}
                  />
                  {canNativeShare ? (
                    <button
                      type="button"
                      onClick={shareNative}
                      data-posthog-cta="true"
                      data-posthog-cta-label="Share native"
                      data-posthog-cta-location={siteCalculatorConfig.analytics.shareMyResultsPanelLocation}
                      className={toneClasses.nativeTile}
                    >
                      <span
                        aria-hidden="true"
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-[#007A2F]"
                      >
                        <Share2 className="h-4 w-4 text-white" />
                      </span>
                      <span className={toneClasses.nativeTileLabel}>More</span>
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="mt-5">
                <p className={toneClasses.microLabel}>Copy or save</p>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => copyText(canonicalUrl, setCopyLinkStatus, "Copy link", "Link")}
                    disabled={!canonicalUrl}
                    data-posthog-cta="true"
                    data-posthog-cta-label="Copy share link"
                    data-posthog-cta-location={siteCalculatorConfig.analytics.shareMyResultsPanelLocation}
                    className={toneClasses.utilityButton}
                  >
                    <CopyLinkIcon className="h-4 w-4" aria-hidden="true" />
                    {copyLinkStatus}
                  </button>
                  <button
                    type="button"
                    onClick={() => summary && copyText(shareBodyText, setCopySummaryStatus, "Copy summary", "Summary")}
                    disabled={!summary}
                    data-posthog-cta="true"
                    data-posthog-cta-label="Copy summary"
                    data-posthog-cta-location={siteCalculatorConfig.analytics.shareMyResultsPanelLocation}
                    className={toneClasses.utilityButton}
                  >
                    <CopySummaryIcon className="h-4 w-4" aria-hidden="true" />
                    {copySummaryStatus}
                  </button>
                  <a
                    href={mailtoHref}
                    data-posthog-cta="true"
                    data-posthog-cta-label="Email results"
                    data-posthog-cta-location={siteCalculatorConfig.analytics.shareMyResultsPanelLocation}
                    className={toneClasses.utilityButton}
                    // One host site styles bare `a` elements outside any
                    // cascade layer (underline + green), which outranks every
                    // layered utility class — inline is the only
                    // cross-site-safe override for a canon file.
                    style={{ textDecoration: "none", color: tone === "light" ? "#10233A" : "#FFFFFF" }}
                  >
                    <Mail className="h-4 w-4" aria-hidden="true" />
                    Email results
                  </a>
                  {/* Sits immediately before Download, 2026-08-16. Same idea as
                      the file share, for the desktop half of the audience: put
                      the picture itself on the clipboard so it can be pasted
                      into a mail or a document, rather than making a download
                      and a file-picker the only route to sending an image. */}
                  <button
                    type="button"
                    onClick={copyImage}
                    disabled={!summary || !previewUrl}
                    data-posthog-cta="true"
                    data-posthog-cta-label="Copy share image"
                    data-posthog-cta-location={siteCalculatorConfig.analytics.shareMyResultsPanelLocation}
                    className={toneClasses.utilityButton}
                  >
                    <CopyImageIcon className="h-4 w-4" aria-hidden="true" />
                    {copyImageStatus}
                  </button>
                  <button
                    type="button"
                    onClick={downloadImage}
                    disabled={!summary || (!previewUrl && !shareCardPath)}
                    data-posthog-cta="true"
                    data-posthog-cta-label="Download share image"
                    data-posthog-cta-location={siteCalculatorConfig.analytics.shareMyResultsPanelLocation}
                    className={toneClasses.utilityButton}
                  >
                    <Download className="h-4 w-4" aria-hidden="true" />
                    Download image
                  </button>
                </div>
                <p
                  role="status"
                  aria-live="polite"
                  className={`mt-2.5 text-[13px] font-semibold ${
                    tone === "light" ? "text-[#0A6E35]" : "text-[#66F0AC]"
                  } ${copyNotice ? "" : "sr-only"}`}
                >
                  {copyNotice ?? ""}
                </p>
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
