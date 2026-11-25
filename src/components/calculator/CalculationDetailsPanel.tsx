"use client";

// CANON: shared verbatim with the sister repo (youarepayingtoomuch.com,
// D:\ria-marketing-page). Edit both repos in the same session or CI fails.
// See CALCULATOR-CANON.md.

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { siteCalculatorConfig } from "@/lib/siteCalculatorConfig";
import { fullCalculatorSite } from "@/config/full-calculator/fullCalculatorSite";
import type { GapDecomposition } from "@/lib/gapDecomposition";

export function CalculationDetailsPanel({
  decomposition,
  savings,
  years,
  totalAssetBasedFees,
  totalFlatFees,
  returnModeNote,
}: {
  decomposition: GapDecomposition;
  savings: number;
  years: number;
  totalAssetBasedFees: number;
  totalFlatFees: number;
  returnModeNote: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const { rows, directFeeGap, compoundingGap, directFeeShare, compoundingShare } = decomposition;
  const feeBarWidth = `${Math.min(Math.max(directFeeShare, 0), 100)}%`;
  const compoundingBarWidth = `${Math.min(Math.max(compoundingShare, 0), 100)}%`;

  return (
    <section
      aria-labelledby="calculation-details-heading"
      className="rounded-2xl border border-[#C9D8E4] bg-white p-5 sm:p-7"
    >
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-controls="calculation-details-content"
        aria-label={open ? "Collapse calculation details" : "Expand calculation details"}
        className="flex min-h-11 w-full items-center justify-between gap-4 text-left focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#064B84]"
      >
        <div className="min-w-0">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#007A2F]">View calculation details</p>
          <h2 id="calculation-details-heading" className="mt-2 text-2xl font-bold tracking-tight text-[#062B43]">
            {formatCurrency(savings)} projected gap
          </h2>
        </div>
        <ChevronDown
          aria-hidden="true"
          className={`h-6 w-6 shrink-0 text-[#007A2F] transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          strokeWidth={2.5}
        />
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id="calculation-details-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.42, ease: [0.165, 0.84, 0.44, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-6 border-t border-[#E4ECF2] pt-6 lg:grid lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:items-start lg:gap-6">
              <div className="min-w-0 rounded-md border border-[#DDE7EF] bg-white p-3">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#667587]">
                  Gap breakdown
                </p>
                <div className="mt-3 space-y-3">
                  <div>
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-sm font-bold text-[#10233A]">Actual fees</span>
                      <span className="flex flex-col items-end min-[480px]:flex-row min-[480px]:items-baseline min-[480px]:gap-2">
                        {directFeeGap === totalAssetBasedFees - totalFlatFees ? (
                          <span
                            aria-hidden="false"
                            className="text-xs font-semibold tabular-nums text-[#667587]"
                          >
                            ({formatCurrency(totalAssetBasedFees)} − {formatCurrency(totalFlatFees)})
                          </span>
                        ) : null}
                        <span className="text-sm font-extrabold tabular-nums text-[#D92D20]">
                          {formatCurrency(directFeeGap)} · {directFeeShare.toFixed(0)}%
                        </span>
                      </span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-[#EDF2F7]">
                      <div className="h-full rounded-full bg-[#D92D20]" style={{ width: feeBarWidth }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-sm font-bold text-[#10233A]">Lost compounding</span>
                      <span className="text-sm font-extrabold tabular-nums text-[#064B84]">
                        {formatCurrency(compoundingGap)} · {compoundingShare.toFixed(0)}%
                      </span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-[#EDF2F7]">
                      <div className="h-full rounded-full bg-[#064B84]" style={{ width: compoundingBarWidth }} />
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-xs leading-5 text-[#52657A]">
                  <strong className="font-bold text-[#10233A]">Actual fees</strong> is the cumulative amount of
                  asset-based fees paid above the cumulative flat-fee amount for the life of the analysis.{" "}
                  <strong className="font-bold text-[#10233A]">Lost compounding</strong>{" "}is the &apos;opportunity
                  cost&apos; of not having the extra asset-based fees invested over the life of the analysis.
                </p>
              </div>

              <div className="mt-4 min-w-0 lg:mt-0">
                <div className="max-h-[320px] w-full overflow-auto rounded-md border border-[#D5E1EB] bg-white">
                  <table className="w-full min-w-[920px] border-collapse text-left text-xs">
                    <caption className="sr-only">Year-by-year fee comparison table</caption>
                    <thead className="sticky top-0 z-10 bg-[#EEF5FA] text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#4B6075]">
                      <tr>
                        <th scope="col" className="px-3 py-2">Year</th>
                        <th scope="col" className="px-3 py-2">Flat-fee value</th>
                        <th scope="col" className="px-3 py-2">Asset-fee value</th>
                        <th scope="col" className="px-3 py-2">Gap</th>
                        <th scope="col" className="px-3 py-2">Fee part</th>
                        <th scope="col" className="px-3 py-2">Compounding part</th>
                        <th scope="col" className="px-3 py-2">AUM fees paid</th>
                        <th scope="col" className="px-3 py-2">Cumulative AUM fees</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2EAF1] text-[#10233A]">
                      {rows.map((row) => (
                        <tr key={row.year} className="odd:bg-white even:bg-[#FAFCFD]">
                          <th scope="row" className="px-3 py-2 font-bold tabular-nums text-[#4B6075]">
                            {row.calendarYear ?? row.year}
                          </th>
                          <td className="px-3 py-2 font-semibold tabular-nums text-[#108843]">
                            {formatCurrency(row.flatValue)}
                          </td>
                          <td className="px-3 py-2 font-semibold tabular-nums text-[#064B84]">
                            {formatCurrency(row.traditionalValue)}
                          </td>
                          <td className="px-3 py-2 font-semibold tabular-nums text-[#D92D20]">
                            {formatCurrency(row.gap)}
                          </td>
                          <td className="px-3 py-2 tabular-nums">{formatCurrency(row.feePart)}</td>
                          <td className="px-3 py-2 tabular-nums">{formatCurrency(row.compoundingPart)}</td>
                          <td className="px-3 py-2 tabular-nums">{formatCurrency(row.annualAssetFees)}</td>
                          <td className="px-3 py-2 tabular-nums">{formatCurrency(row.cumulativeAssetFees)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-3 grid gap-2 text-xs leading-5 text-[#52657A] sm:grid-cols-3">
                  <p className="rounded-md bg-white px-3 py-2 ring-1 ring-[#DDE7EF]">
                    Total asset-based fees modeled:{" "}
                    <strong className="text-[#10233A]">{formatCurrency(totalAssetBasedFees)}</strong>.
                  </p>
                  <p className="rounded-md bg-white px-3 py-2 ring-1 ring-[#DDE7EF]">
                    Total flat fees modeled: <strong className="text-[#10233A]">{formatCurrency(totalFlatFees)}</strong>.
                  </p>
                  <p className="rounded-md bg-white px-3 py-2 ring-1 ring-[#DDE7EF]">
                    Horizon: <strong className="text-[#10233A]">{years} years</strong>, compounded monthly.
                  </p>
                </div>

                <div className="mt-3 space-y-2 text-xs leading-5 text-[#667587]">
                  <p>
                    Disclosures: This calculator is for illustrative and educational purposes only. It is not
                    investment advice, an advisory relationship, a forecast, or a guarantee of performance or
                    savings. Actual results will vary.
                  </p>
                  <p>{returnModeNote}</p>
                  <Link
                    href={fullCalculatorSite.verifyMathHref}
                    className="inline-flex min-h-11 items-center font-extrabold text-[#007A2F] underline underline-offset-4 hover:text-[#0A6E35] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#064B84]"
                  >
                    {siteCalculatorConfig.verifyMathLabel}
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
