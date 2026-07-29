"use client";

import { Calculator, ExternalLink } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

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
        <span className="relative flex h-full flex-col rounded-md border border-[#CADBD3] bg-white p-4 shadow-[0_16px_38px_rgba(6,43,67,0.14)]">
          <span className="flex items-center justify-between gap-3">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#617568]">
              Return path
            </span>
            <span className="rounded-full bg-[#E8F5ED] px-2.5 py-1 text-[10px] font-extrabold text-[#0A6E35]">
              40 years
            </span>
          </span>
          <span className="mt-3 grid grid-cols-2 gap-2 text-center text-[11px] font-extrabold sm:text-xs">
            <span className="rounded-md bg-[#108843] px-2 py-2 text-white shadow-sm">
              Market return
            </span>
            <span className="rounded-md border border-[#D8E2DE] bg-[#F5F8F6] px-2 py-2 text-[#52657A]">
              Steady return
            </span>
          </span>
          <span className="relative mt-4 min-h-0 flex-1 overflow-hidden rounded-md bg-[#F5F8F6]">
            <svg
              viewBox="0 0 320 112"
              className="absolute inset-0 h-full w-full"
              preserveAspectRatio="none"
            >
              <path
                d="M0 91 C38 87 48 68 78 72 C112 77 122 43 153 50 C186 57 192 25 226 36 C257 46 276 13 320 18"
                fill="none"
                stroke="#B6C8BF"
                strokeWidth="3"
                strokeDasharray="5 6"
              />
              <motion.path
                d="M0 94 C28 91 45 78 66 82 C89 86 103 52 126 62 C151 72 167 38 191 46 C218 54 235 16 259 29 C283 40 294 7 320 12"
                fill="none"
                stroke="#108843"
                strokeWidth="5"
                strokeLinecap="round"
                initial={reduceMotion ? false : { pathLength: 0.18, opacity: 0.55 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: reduceMotion ? 0 : 1.35, ease: [0.16, 1, 0.3, 1] }}
              />
            </svg>
            <motion.span
              className="absolute right-[8%] top-[8%] h-3 w-3 rounded-full border-2 border-white bg-[#108843] shadow-[0_4px_14px_rgba(16,136,67,0.38)]"
              animate={reduceMotion ? undefined : { scale: [1, 1.28, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            />
          </span>
        </span>
      </span>
    </motion.a>
  );
}
