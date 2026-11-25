"use client";

// Firm-site copy (smarterwaywealth.com, same file name) for the hidden
// /calculator page only (fee-lab stage 1, section 1). This site's own
// file of the same name is separate and unchanged.

import { useEffect, useRef } from "react";

type Particle = {
  glyph: "$" | "+" | "−" | "×" | "÷" | "=";
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  weight: number;
  /** The side margin the symbol keeps to (fields with a clear column). */
  lane?: { min: number; max: number };
};

type FieldVariant = {
  color: string;
  /** Symbols drift toward the pointer instead of away from it. */
  attract: boolean;
  maxCount: number;
  sizeBase: number;
  sizeRange: number;
  /** The symbols answer a finger as they answer the pointer (toward it or
   *  away from it, per `attract`): a tap moves them, they follow a swipe, and
   *  the effect lingers briefly after the finger lifts so a quick tap still
   *  visibly moves them. */
  touch: boolean;
  /** Keep the symbols out of a centred column this many rem wide (the
   *  reading text), in the side margins only. Margins narrower than
   *  `minMarginPx` get no symbols, so on a phone the field stays empty. */
  clearColumnRem?: number;
  minMarginPx?: number;
};

const VARIANTS = {
  // The Save reasons field on /why. Colour, sizes and count unchanged since
  // 2026-11-04; the symbols still move away from the pointer.
  save: {
    color: "#00A540",
    attract: false,
    // The field also spans the Save reasons above the math (2026-11-04), so it
    // allows a few more symbols to keep the same density.
    maxCount: 22,
    sizeBase: 15,
    sizeRange: 12,
    // David, 2026-11-10: they respond to touch the way the calculator
    // banner's do (a tap, a swipe they follow, a short linger after the
    // finger lifts), still pushed away rather than pulled.
    touch: true,
    // DECISION CHANGED, 2026-11-11 (David): the symbols drifted over the
    // reading text and looked like smudges on a word; they stay in the side
    // margins, outside the widest text column of the Save block (the quote
    // ticker's 80rem). Margins under 40px (phones, tablets, most laptops,
    // or larger text) get none: the calmest choice.
    clearColumnRem: 80,
    minMarginPx: 40,
  },
  // The navy "Model the fees you actually pay." banner on /calculator
  // (David, 2026-11-10: "add the floating numerical characters as the home
  // page has. Make them responsive to touch."). Mirrors the
  // youarepayingtoomuch.com home page field (pull toward the pointer, same
  // size and count), in white so the symbols read on navy.
  calculatorBanner: {
    color: "#FFFFFF",
    attract: true,
    maxCount: 16,
    sizeBase: 16.5,
    sizeRange: 13.2,
    touch: true,
  },
} satisfies Record<string, FieldVariant>;

const TOUCH_LINGER_MS = 900;

export function MathMotionField({ variant = "save" }: { variant?: keyof typeof VARIANTS }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const settings: FieldVariant = VARIANTS[variant];
    const canvas = canvasRef.current;
    const section = canvas?.parentElement;
    if (!canvas || !section || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    let bounds = section.getBoundingClientRect();
    let frame = 0;
    let visible = !document.hidden;
    let pointer: { x: number; y: number } | null = null;
    let releaseAt: number | null = null;
    let particles: Particle[] = [];

    const resize = () => {
      bounds = section.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(bounds.width * dpr));
      canvas.height = Math.max(1, Math.round(bounds.height * dpr));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      const glyphs: Particle["glyph"][] = ["$", "$", "$", "+", "−", "×", "÷", "="];
      const makeParticle = (lane?: { min: number; max: number }): Particle => {
        const size = settings.sizeBase + Math.random() * settings.sizeRange;
        // A symbol in a margin stays wholly inside it.
        const inner = lane && { min: lane.min + size / 2, max: lane.max - size / 2 };
        return {
          glyph: glyphs[Math.floor(Math.random() * glyphs.length)],
          x: inner ? inner.min + Math.random() * (inner.max - inner.min) : Math.random() * bounds.width,
          y: Math.random() * bounds.height,
          vx: (Math.random() - 0.5) * 0.28,
          vy: (Math.random() - 0.5) * 0.28,
          size,
          opacity: 0.1 + Math.random() * 0.13,
          weight: [500, 700, 800][Math.floor(Math.random() * 3)],
          lane: inner,
        };
      };

      if (!settings.clearColumnRem) {
        const count = Math.max(
          9,
          Math.min(settings.maxCount, Math.round((bounds.width * bounds.height) / 46_000)),
        );
        particles = Array.from({ length: count }, () => makeParticle());
        return;
      }

      // Side margins only, at the same density as a full field.
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const column = Math.min(bounds.width, settings.clearColumnRem * rem);
      const margin = (bounds.width - column) / 2;
      if (margin < (settings.minMarginPx ?? 0)) {
        particles = [];
        return;
      }
      const lanes = [
        { min: 0, max: margin },
        { min: bounds.width - margin, max: bounds.width },
      ];
      const perLane = Math.max(
        2,
        Math.min(
          Math.ceil(settings.maxCount / 2),
          Math.round((margin * bounds.height) / 46_000),
        ),
      );
      particles = lanes.flatMap((lane) =>
        Array.from({ length: perLane }, () => makeParticle(lane)),
      );
    };

    const setPointer = (clientX: number, clientY: number) => {
      const rect = section.getBoundingClientRect();
      pointer = { x: clientX - rect.left, y: clientY - rect.top };
      releaseAt = null;
    };

    const onPointerMove = (event: PointerEvent) => {
      setPointer(event.clientX, event.clientY);
    };

    const onPointerDown = (event: PointerEvent) => {
      setPointer(event.clientX, event.clientY);
    };

    // Once a swipe turns into a page scroll the browser stops sending pointer
    // moves, but touch moves keep coming, so the symbols follow the finger.
    const onTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (touch) setPointer(touch.clientX, touch.clientY);
    };

    const onPointerLeave = (event: PointerEvent) => {
      if (settings.touch && event.pointerType !== "mouse") {
        releaseAt = performance.now() + TOUCH_LINGER_MS;
        return;
      }
      pointer = null;
    };

    const onTouchEnd = () => {
      releaseAt = performance.now() + TOUCH_LINGER_MS;
    };

    const draw = () => {
      // An empty field (no margins wide enough) has nothing to draw; resizing
      // the canvas has already cleared it.
      if (visible && particles.length) {
        if (releaseAt !== null && performance.now() >= releaseAt) {
          pointer = null;
          releaseAt = null;
        }

        context.clearRect(0, 0, bounds.width, bounds.height);
        context.textAlign = "center";
        context.textBaseline = "middle";

        for (const particle of particles) {
          if (pointer) {
            const dx = settings.attract ? pointer.x - particle.x : particle.x - pointer.x;
            const dy = settings.attract ? pointer.y - particle.y : particle.y - pointer.y;
            const distance = Math.hypot(dx, dy);
            if (distance > 0 && distance < 190) {
              const force = (190 - distance) / 190;
              particle.vx += (dx / distance) * force * 0.08;
              particle.vy += (dy / distance) * force * 0.08;
            }
          }

          particle.x += particle.vx;
          particle.y += particle.vy;
          particle.vx *= 0.992;
          particle.vy *= 0.992;

          if (particle.lane) {
            // Bounce off the margin's edges, so a push never carries a
            // symbol over the text column.
            if (particle.x < particle.lane.min) {
              particle.x = particle.lane.min;
              particle.vx = Math.abs(particle.vx);
            } else if (particle.x > particle.lane.max) {
              particle.x = particle.lane.max;
              particle.vx = -Math.abs(particle.vx);
            }
          } else if (particle.x < -20 || particle.x > bounds.width + 20) particle.vx *= -1;
          if (particle.y < -20 || particle.y > bounds.height + 20) particle.vy *= -1;

          context.globalAlpha = particle.opacity;
          context.fillStyle = settings.color;
          context.font = `${particle.weight} ${particle.size}px ui-monospace, SFMono-Regular, Menlo, monospace`;
          context.fillText(particle.glyph, particle.x, particle.y);
        }
        context.globalAlpha = 1;
      }
      frame = window.requestAnimationFrame(draw);
    };

    const observer = new ResizeObserver(resize);
    const onVisibilityChange = () => {
      visible = !document.hidden;
    };

    observer.observe(section);
    section.addEventListener("pointermove", onPointerMove, { passive: true });
    section.addEventListener("pointerleave", onPointerLeave, { passive: true });
    if (settings.touch) {
      section.addEventListener("pointerdown", onPointerDown, { passive: true });
      section.addEventListener("touchmove", onTouchMove, { passive: true });
      section.addEventListener("touchend", onTouchEnd, { passive: true });
      section.addEventListener("touchcancel", onTouchEnd, { passive: true });
    }
    document.addEventListener("visibilitychange", onVisibilityChange);
    resize();
    draw();

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      section.removeEventListener("pointermove", onPointerMove);
      section.removeEventListener("pointerleave", onPointerLeave);
      section.removeEventListener("pointerdown", onPointerDown);
      section.removeEventListener("touchmove", onTouchMove);
      section.removeEventListener("touchend", onTouchEnd);
      section.removeEventListener("touchcancel", onTouchEnd);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [variant]);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 size-full" />;
}
