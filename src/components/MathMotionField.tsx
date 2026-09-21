"use client";

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
};

/**
 * The same pointer-reactive math field used on Smarter Way Wealth's Save page.
 * This version is intentionally 10% larger and 10% darker for the calculator
 * site's broader, lighter conversion-and-quotes band.
 */
export function MathMotionField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = canvas?.parentElement;
    if (!canvas || !section || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    let bounds = section.getBoundingClientRect();
    let frame = 0;
    let visible = !document.hidden;
    let pointer: { x: number; y: number } | null = null;
    let particles: Particle[] = [];

    const resize = () => {
      bounds = section.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(bounds.width * dpr));
      canvas.height = Math.max(1, Math.round(bounds.height * dpr));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.max(9, Math.min(16, Math.round((bounds.width * bounds.height) / 46_000)));
      const glyphs: Particle["glyph"][] = ["$", "$", "$", "+", "−", "×", "÷", "="];
      particles = Array.from({ length: count }, () => ({
        glyph: glyphs[Math.floor(Math.random() * glyphs.length)],
        x: Math.random() * bounds.width,
        y: Math.random() * bounds.height,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        size: 16.5 + Math.random() * 13.2,
        opacity: 0.1 + Math.random() * 0.13,
        weight: [500, 700, 800][Math.floor(Math.random() * 3)],
      }));
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = section.getBoundingClientRect();
      pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };

    const draw = () => {
      if (visible) {
        context.clearRect(0, 0, bounds.width, bounds.height);
        context.textAlign = "center";
        context.textBaseline = "middle";

        for (const particle of particles) {
          if (pointer) {
            const dx = particle.x - pointer.x;
            const dy = particle.y - pointer.y;
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

          if (particle.x < -20 || particle.x > bounds.width + 20) particle.vx *= -1;
          if (particle.y < -20 || particle.y > bounds.height + 20) particle.vy *= -1;

          context.globalAlpha = particle.opacity;
          context.fillStyle = "#00953A";
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
    const onPointerLeave = () => {
      pointer = null;
    };

    observer.observe(section);
    section.addEventListener("pointermove", onPointerMove, { passive: true });
    section.addEventListener("pointerleave", onPointerLeave, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);
    resize();
    draw();

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      section.removeEventListener("pointermove", onPointerMove);
      section.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 size-full" />;
}
