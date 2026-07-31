"use client";

import { useEffect, useMemo, useState } from "react";
import { fmtMoney } from "@/lib/format";

/**
 * "What is your cash earning?" calculator on /savings-rates.
 *
 * The reader enters a cash balance and the rate they earn today; the
 * component shows the first-year difference at the top verified rate
 * from the dataset. Deliberately simple interest over one year — the
 * honest, checkable version of the claim.
 *
 * The math result speaks for itself; this component draws no
 * conclusions about what the difference would pay for.
 *
 * State is mirrored into the URL (?balance=…&current=…) so a reader —
 * or an AI agent — can link to a specific scenario, matching the home
 * calculator's URL-state pattern. The server renders the default
 * scenario; the query string is applied after hydration.
 */

interface RatePreset {
  label: string;
  apyPercent: number;
}

export function CashRateCalculator({
  topApyPercent,
  topApyLabel,
  defaultCurrentApyPercent,
  defaultBalance,
  presets,
}: {
  /** Highest verified APY in the dataset (the comparison benchmark). */
  topApyPercent: number;
  /** e.g. "Vio Bank High Yield Online Savings" — where that rate lives. */
  topApyLabel: string;
  /** Sourced default for "your current rate" (FDIC national average). */
  defaultCurrentApyPercent: number;
  defaultBalance: number;
  presets: RatePreset[];
}) {
  const [balance, setBalance] = useState(defaultBalance);
  const [currentApy, setCurrentApy] = useState(defaultCurrentApyPercent);

  // Apply ?balance= and ?current= from the URL once, after hydration.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const balanceRaw = params.get("balance");
    const currentRaw = params.get("current");
    if (balanceRaw !== null) {
      const balanceParam = Number(balanceRaw);
      if (Number.isFinite(balanceParam) && balanceParam > 0) {
        setBalance(Math.min(balanceParam, 100_000_000));
      }
    }
    if (currentRaw !== null) {
      const currentParam = Number(currentRaw);
      if (Number.isFinite(currentParam) && currentParam >= 0 && currentParam <= 25) {
        setCurrentApy(currentParam);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the address bar in step so the scenario is shareable.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isDefault =
      balance === defaultBalance && currentApy === defaultCurrentApyPercent;
    if (isDefault) {
      params.delete("balance");
      params.delete("current");
    } else {
      params.set("balance", String(balance));
      params.set("current", String(currentApy));
    }
    const query = params.toString();
    window.history.replaceState(
      null,
      "",
      query ? `${window.location.pathname}?${query}` : window.location.pathname,
    );
  }, [balance, currentApy, defaultBalance, defaultCurrentApyPercent]);

  const extraPerYear = useMemo(() => {
    const delta = (topApyPercent - currentApy) / 100;
    return balance * delta;
  }, [balance, currentApy, topApyPercent]);

  const alreadyAhead = extraPerYear <= 0;

  return (
    <div className="card p-5 sm:p-8">
      <div className="flex flex-col gap-4">
        <label className="block">
          <span className="text-sm font-medium text-neutral-700">
            Cash you keep in savings
          </span>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-neutral-500">$</span>
            <input
              inputMode="numeric"
              className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-base"
              value={balance.toLocaleString("en-US")}
              onChange={(e) => {
                const next = Number(e.target.value.replace(/[^0-9]/g, ""));
                setBalance(
                  Number.isFinite(next) ? Math.min(next, 100_000_000) : 0,
                );
              }}
              aria-label="Cash balance in dollars"
            />
          </div>
        </label>

        <div>
          <label className="block">
            <span className="text-sm font-medium text-neutral-700">
              The rate it earns today (% APY)
            </span>
            <input
              inputMode="decimal"
              className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-base"
              value={currentApy}
              onChange={(e) => {
                const next = Number(e.target.value);
                if (Number.isFinite(next) && next >= 0 && next <= 25) {
                  setCurrentApy(next);
                }
              }}
              aria-label="Current annual percentage yield"
            />
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            {presets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => setCurrentApy(preset.apyPercent)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  currentApy === preset.apyPercent
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-neutral-50 p-4 sm:p-5">
          {alreadyAhead ? (
            <p className="text-base text-neutral-700">
              At {currentApy}% you are already at or above the top verified
              rate on this page. Nice.
            </p>
          ) : (
            <>
              <p className="text-sm text-neutral-600">
                At the top verified rate ({topApyPercent.toFixed(2)}% APY,{" "}
                {topApyLabel}), the same cash would earn roughly
              </p>
              <p className="mt-1 text-3xl font-semibold text-brand-700 sm:text-4xl">
                {fmtMoney(extraPerYear)}{" "}
                <span className="text-lg font-medium text-neutral-500">
                  more per year
                </span>
              </p>
              <p className="mt-2 text-xs text-neutral-500">
                Simple first-year difference: {fmtMoney(balance)} &times; (
                {topApyPercent.toFixed(2)}% &minus; {currentApy}%). Before
                compounding and taxes; rates are variable and change.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
