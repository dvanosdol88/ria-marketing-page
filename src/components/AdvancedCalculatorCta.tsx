"use client";

import Image from "next/image";
import { Calculator, ExternalLink } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

// Real captures of the smarterwaywealth.com/save market replay
// (scripts/capture-advanced-calculator.mjs): frame 1 is the steady-view
// poster; frames 2-6 crossfade above it as an animation loop.
const PREVIEW_DIR = "/advanced-calculator-preview";
const REPLAY_FRAMES = [2, 3, 4, 5, 6];
const PREVIEW_SIZES = "(min-width: 768px) 40vw, 90vw";

export function AdvancedCalculatorCta({ href }: { href: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noreferrer"
      data-posthog-cta-label="Open Advanced Calculator"
      data-posthog-cta-location="below_calculation_details"
      data-advanced-calculator-cta
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={reduceMotion ? undefined : { y: -3 }}
      viewport={{ once: true, margin: "-36px" }}
      transition={{ duration: 0.48, ease: [0.16, 1, 0.3, 1] }}
      className="group mt-4 grid w-full overflow-hidden rounded-lg border border-[#0A5633] bg-[#062B43] !text-white !no-underline shadow-[0_18px_44px_rgba(6,43,67,0.18)] transition-[border-color,box-shadow] duration-300 hover:border-[#108843] hover:!text-white hover:shadow-[0_24px_54px_rgba(6,43,67,0.24)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#108843] md:grid-cols-[minmax(0,1fr)_minmax(300px,0.82fr)]"
    >
      <span className="flex min-w-0 flex-col justify-center p-5 sm:p-7 lg:p-8">
        <span className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.18em] text-[#8ED3A8]">
          <Calculator className="h-4 w-4" aria-hidden="true" />
          Smarter Way Wealth
        </span>
        <span className="mt-3 block max-w-xl text-2xl font-black leading-tight tracking-normal sm:text-3xl">
          Explore more paths with the Advanced Calculator.
        </span>
        <span className="mt-3 block max-w-xl text-sm leading-6 text-white/76 sm:text-base">
          The richer calculator stays on Smarter Way Wealth, where you can compare
          a steady baseline with actual historical market paths.
        </span>
        <span className="mt-5 inline-flex items-center gap-2 text-base font-extrabold text-white">
          Open Advanced Calculator
          <ExternalLink
            className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            aria-hidden="true"
          />
        </span>
      </span>

      <span
        className="relative min-h-[230px] overflow-hidden border-t border-white/10 bg-[#F3F8F6] p-4 text-[#10233A] sm:min-h-[250px] sm:p-5 md:border-l md:border-t-0"
        aria-hidden="true"
      >
        <span className="absolute -right-10 -top-12 h-36 w-36 rounded-full bg-[#9DE3B5]/45 blur-3xl" />
        <span className="relative flex h-full flex-col rounded-md border border-[#CADBD3] bg-white p-3 shadow-[0_16px_38px_rgba(6,43,67,0.14)]">
          <span className="relative block aspect-[624/507] w-full overflow-hidden rounded-sm">
            <Image
              src={`${PREVIEW_DIR}/frame-1.jpg`}
              alt=""
              fill
              sizes={PREVIEW_SIZES}
              className="object-cover object-top"
            />
            {!reduceMotion &&
              REPLAY_FRAMES.map((frame, idx) => (
                <Image
                  key={frame}
                  src={`${PREVIEW_DIR}/frame-${frame}.jpg`}
                  alt=""
                  fill
                  sizes={PREVIEW_SIZES}
                  className="adv-preview-frame object-cover object-top"
                  style={{ animationDelay: `${idx * 2}s` }}
                />
              ))}
          </span>
        </span>
      </span>
    </motion.a>
  );
}
