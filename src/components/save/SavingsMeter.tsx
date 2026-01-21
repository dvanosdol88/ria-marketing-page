"use client";

import { useMemo } from "react";
import { SavingsMeterConfig } from "@/config/savingsMetersConfig";
import { formatCurrency } from "@/lib/format";

type Props = {
  meter: SavingsMeterConfig;
  savings: number;
};

export function SavingsMeter({ meter, savings }: Props) {
  const { percentage, label } = useMemo(() => {
    const pct = Math.min(100, (savings / meter.targetAmount) * 100);
    const lbl = meter.formatLabel(savings, meter.targetAmount);
    return { percentage: pct, label: lbl };
  }, [savings, meter]);

  const Icon = meter.icon;

  return (
    <div className="card p-4 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className={`${meter.color} p-2 rounded-lg text-white`}>
          <Icon size={20} />
        </div>
        <div>
          <h4 className="font-semibold text-neutral-900">{meter.title}</h4>
          <p className="text-xs text-neutral-500">{meter.description}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${meter.color} transition-all duration-700 ease-out rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Stats row */}
      <div className="flex justify-between text-sm">
        <span className="text-neutral-500">
          Your savings: {formatCurrency(savings)}
        </span>
        <span className="font-semibold text-neutral-900">{label}</span>
      </div>
    </div>
  );
}
